import { HarvesterIndex, MentatCommands, Role, ThopterIndex } from "enums";
import { roleStarterHarvester } from "roles/role.starter-harvester";
import { roleHarvester } from "roles/role.harvester";
import { generateCreepName, getNumCreepsByRole } from "utils/utils";
import { buildRCLupgrades } from "building/masterBuilder";
import { EnergySource } from "energy-source";
import { identity } from "lodash";
import { roleThopter } from "roles/role.thopter";

export class Governor {
    name: string;
    creeps: Id<Creep>[] = [];
    spawningCreeps: string[] = [];
    rcl: number = 0;
    previousMentatCommands: any[] = [];

    // The sources that the governor is static minning
    sourcesUnderControl: EnergySource[] = [];
    exploitRatio = 0;
    MIN_HARVESTERS = 5;
    MIN_THOPTERS = 5;
    MIN_PYONS = 5;

    constructor(room: Room, isNew: boolean) {
        /*
        INPUTS:
        Room - the room that the governor presides over
        isNew - is the governor a newly created one or are we just reconstructing it?
        */

        // We initialize the governor's name and RCL
        this.name = room.name;
        if (room.controller?.level){
            this.rcl = room.controller?.level
        }

        // Now we create/recreate a source object for each source that the governor controls
        this.sourcesUnderControl = [];

        // If the governor is new then we begin the construction process and assign it the sources in its room
        if(isNew){
            buildRCLupgrades(this.name, 1);
            // For all the sources in the room we create new sources objects and assign them to the governor
            // We also add in memory another element to the governor source map

            // Source Objects in the room
            let sources = Game.rooms[this.name].find(FIND_SOURCES);
            // IDs of source objects in the room
            let idsOfSources = [];

            for (let i = 0; i < sources.length; ++i){
                let id = sources[i].id;
                this.sourcesUnderControl.push(new EnergySource(id));
                idsOfSources.push(id);
            }
            Memory.governorSourcesMap.push([this.name, idsOfSources]);
        }

        // If the governor is not new
        else{
            // We search all creeps in the game to see if they belong to this governor
            // This is becuase of the reset storms/pushing a new version of main
            for (const creepName in Game.creeps) {
                if (Game.creeps[creepName].memory.governor === this.name) {
                    // If the creep has been spawned
                    if (Game.creeps[creepName].id != undefined){
                        this.creeps.push(Game.creeps[creepName].id);
                    }
                    // If the creep has not been spawned
                    else{
                        this.spawningCreeps.push(creepName);
                    }

                }
            }

            // We recreate all the Energy Source objects that belong to the governor
            // Memory.governorSourceMap = list of [governor name, [source IDs]]...
            // For all of the sources stored in memory
            for (let i = 0; i < Memory.governorSourcesMap.length; ++i){
                // If the sources belongs to the governor
                if (Memory.governorSourcesMap[i][0] === this.name) {
                    for (let j = 0; j < Memory.governorSourcesMap[i][1].length; ++j){
                        // Create the source
                        let source = new EnergySource(Memory.governorSourcesMap[i][1][j]);
                        // For each creep that the governor controls we check if it belongs to the source,
                        // if so we add it to the source Object
                        for (let k = 0; k < this.creeps.length; ++k){
                            let creep = Game.getObjectById(this.creeps[k]);
                            if (creep?.memory.role === Role.Harvester){
                                if (creep.memory.data[HarvesterIndex.SourceId]){
                                    source.assignHarvester(creep.id);
                                }
                            }
                        }
                        this.sourcesUnderControl.push(source);
                    }
                }
            }
        }
    }

    /**
     * Executes orders given by Mentat.
     */
     executeOrders(mentatCommands: MentatCommands[]): void {
        /*
        for (let i = 0; i < this.creeps.length; ++i){
            let creep = Game.getObjectById(this.creeps[i]);
            if (creep!.memory.role === Role.Harvester){
                console.log(creep!.memory.data[HarvesterIndex.SourceId]);
                console.log(creep!.id);
                console.log("hi");
            }
        }
        */
        //console.log(this.creeps.length);
        this.maintainCreepLevels(mentatCommands);
        this.runCreeps();
        // Builds the necessary buildings based upon RCL
        this.build()
    }

    /*
     * Generates a report that mentat can process. I removed this feature since it was redundant but I kept this for funzies
    getReport(mentatCommands: MentatCommands[]): Report{
        let energy: number = Game.rooms[this.name]!.energyAvailable;

        let storages: AnyStructure[]  = Game.rooms[this.name].find(FIND_STRUCTURES);

        for (let i = 0; i < storages.length; ++i) {
            let storage = storages[i];
            if (storage.structureType === STRUCTURE_CONTAINER || storage.structureType === STRUCTURE_STORAGE) {
                energy += storage.store[RESOURCE_ENERGY];
            }
        }

    }
    */

    /**
     * Spawns creeps when necessary so that creep levels are properly maintained.
     */
     maintainCreepLevels(mentatCommands: MentatCommands[]): void {
        // Check to see if any of our spawning creeps have been spawned
        this.checkSpawningCreeps();

        let numStarterHarvesters = getNumCreepsByRole(Role.StarterHarvester, this.name);
        let numHarvesters = getNumCreepsByRole(Role.Harvester, this.name);
        let numThopters = getNumCreepsByRole(Role.Thopter, this.name);
        let numPyons = getNumCreepsByRole(Role.Thopter, this.name);

        if (mentatCommands[MentatCommands.dumbHarvesting]){
            // We make a special starter harvester
            if (numStarterHarvesters < 3) {
                this.spawnCreep(Role.StarterHarvester)
            }
        }

        else if (mentatCommands[MentatCommands.dynamicHarvesting]) {
            // we maintain only 1 starter harvester
            if (numStarterHarvesters < 1){
                this.spawnCreep(Role.StarterHarvester);
            }

            // If there are too many harvesters make a thopter
            // This first conditional is to avoid divide by zero
            else if (numHarvesters > 0 && numThopters == 0){
                this.spawnCreep(Role.Thopter);
            }
            else if (numHarvesters/numThopters > 1) {
                this.spawnCreep(Role.Thopter);
            }
            // If there are sources that are not being fully exploited then spawn a harvester
            else if (this.getUnexpliotedSourceID() != undefined){
                this.spawnCreep(Role.Harvester);
            }

            else {
            }
        }
    }

    /**
     * Spawns a creep at Spawn1.
     * @param role The role assigned to the newly spawned creep
     */
    spawnCreep(role: Role): void {
        let creepName: string = generateCreepName(role, this.name);
        // TODO: Resolve Spawns dynamically
        if (Game.spawns['Spawn1'].spawnCreep(
            Memory.bodyTemplates[role],
            creepName,
            { memory: {role: role, governor: this.name, name: creepName, data: this.initData(role)} }
        ) === OK){
            // If we spawn a creep we add the newly created creep to the governor's list of creeps
            // Unfortunatly a creep is not given an id until it is spawned so we must wait
            // and add its id to the governor's list
            this.spawningCreeps.push(creepName)
            console.log("we spawned a creep of type: ", role);
        }
    }

    // Initializes a creep's memory depending upon its role
    initData(role: Role): any[] {
        switch (role) {
            case (Role.StarterHarvester): {
                return [false];
            }
            case (Role.Harvester): {
                // We know that getHarvesterSourceID will not return undefined becuase
                // We only spawn a harvester if there is a source that needs to be explioted
                return [false, this.getUnexpliotedSourceID(), false];
            }
            case (Role.Thopter): {
                return [false, null, true];
            }
            case (Role.Pyon): {
                return [false];
            }
        }
    }

    // Checks to see if any creeps have been spawned that belong to the governor
    // This way the ids of all newly spawned creeps are added to the governor
    // and other various things that require IDs
    checkSpawningCreeps(): void{
        // For all the creeps that are spanwing
        for (let i = 0; i < this.spawningCreeps.length; ++i){
            let creep = Game.creeps[this.spawningCreeps[i]];
            // If the creep has an id it has been spawned
            if(creep.id != undefined){
                // We add the newly spawned creep to the governor's list
                this.creeps.push(creep.id);
                // We take the creep of the currently spawning list
                this.spawningCreeps.splice(i, 1);

                // If the creep is a harvester we assign its ID to its source's object list of creeps
                if (creep.memory.role === Role.Harvester){
                    let creepSource = creep.memory.data[HarvesterIndex.SourceId]
                    // We look through the sources and assign the creep to the correct one
                    for (let j = 0; j < this.sourcesUnderControl.length; ++j){
                        if (creepSource === this.sourcesUnderControl[j]){
                            this.sourcesUnderControl[j].assignHarvester(creep.id);
                        }
                    }
                }

                // If the creep is a thopter we give it a harvester to go tend to
                if (creep.memory.role === Role.Thopter){
                    this.giveThopterHarvester(creep);
                }
            }
        }
    }

    // This exists becuase later groups will be run by the governors
    runCreeps(): void {
        for (let i = 0; i < this.creeps.length; ++i) {
            let creep = Game.getObjectById(this.creeps[i]);
            if (creep){
                switch (creep.memory.role) {
                    case (Role.StarterHarvester): {
                        roleStarterHarvester.run(creep);
                        break;
                    }
                    case (Role.Harvester): {
                        roleHarvester.run(creep);
                        break;

                    }
                    case (Role.Thopter): {
                        // If the thopter needs to be assinged a harvester we assign one
                        if (creep.memory.data[ThopterIndex.RequestNewHarvester]){
                            this.giveThopterHarvester(creep);
                        }
                        roleThopter.run(creep);
                        break;
                    }
                    case (Role.Pyon): {
                        roleHarvester.run(creep);
                        break;
                    }
                }
            }
        }
    }

    // Builds the necessary buildings
    build(): void{
        // First we check to see if the rcl has changed
        let currentRCL = Game.rooms[this.name].controller?.level
        // If so then we build the upgrades and update the governor's rcl level
        if (currentRCL != undefined){
            if (currentRCL > this.rcl){
                console.log(`Room ${this.name} was upgraded to RCL ${currentRCL}.`);
                // If the rcl has changed we build all the new avaible buildings
                buildRCLupgrades(this.name, currentRCL);
                this.rcl = currentRCL

            }
        }
    }

    // Gets the ID of a source that needs a harvester to be assigned to it
    // If no sources are avaible to be harvested then we just return undefined
    getUnexpliotedSourceID(): Id<Source> | undefined{
        // We look at sources that need more harvesters
        for(let i = 0; i < this.sourcesUnderControl.length; ++i){
            // If there is a source under the governor's control that needs more harvesters we return its ID
            if (this.sourcesUnderControl[i].needsMoreHarvesters()){
                return this.sourcesUnderControl[i].id;
            }
        }
        return undefined;
    }

    // Gets a harvester for a thopter to go to
    getHarvesterTarget(): Id<Creep> | undefined{
        // We look at all of the harvesters and determine which ones needs tending to
        // The harvester that is in most need of a thopter
        let bestHarvester: Id<Creep> | undefined = undefined;
        // The percentage full of energy this harvester is
        let bestHarvesterCapacity = 0;
        for (let i = 0; i < this.creeps.length; ++i){
            let harvester = Game.getObjectById(this.creeps[i]);
            if (harvester){
                // If the creep is a harvester who does not have a thopter incoming
                if (harvester.memory.role === Role.Harvester){
                    if (harvester.memory.data[HarvesterIndex.ThopterIncomming] == false){
                        // We see how full the harvester is
                        let harvesterCapacity = harvester.store.energy/harvester.store.getCapacity();
                        if (harvesterCapacity > bestHarvesterCapacity){
                            bestHarvester = harvester.id;
                            bestHarvesterCapacity = harvesterCapacity;
                        }
                    }
                }
            }
        }

        return bestHarvester;
    }

    // Gives a thopter a target harvester and updates both the thopter and the harvester
    giveThopterHarvester(thopter: Creep): void {
        let harvesterTarget = this.getHarvesterTarget();
        if (harvesterTarget){
            // Update the thopter and harvester memory
            thopter.memory.data[ThopterIndex.HarvesterTarget] = harvesterTarget;
            thopter.memory.data[ThopterIndex.Outbound] = true;
            Game.getObjectById(harvesterTarget)!.memory.data[HarvesterIndex.ThopterIncomming] = true;
            thopter.memory.data[ThopterIndex.RequestNewHarvester] = false;
        }
    }
}
