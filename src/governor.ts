import { MentatCommands, Role } from "enums";
import { Report } from "report";
import { roleStarterHarvester } from "roles/role.starter-harvester";
import { roleHarvester } from "roles/role.harvester";
import { generateCreepName, getNumCreepsByRole } from "utils/utils";
import { buildRCLupgrades } from "building/masterBuilder";


export class Governor {
    name: string;
    creeps: Id<Creep>[] = [];
    spawningCreeps: string[] = [];
    rcl: Number = 0;
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
        this.name = room.name;
        if (room.controller?.level){
            this.rcl = room.controller?.level
        }

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

        // If the governor is new then we begin the construction process
        if(isNew){
            buildRCLupgrades(this.name, 1);
        }
    }

    getReport(): Report{
        let energy: number = Game.rooms[this.name]!.energyAvailable;

        let storages: AnyStructure[]  = Game.rooms[this.name].find(FIND_STRUCTURES);

        for (let i = 0; i < storages.length; ++i) {
            let storage = storages[i];
            if (storage.structureType === STRUCTURE_CONTAINER || storage.structureType === STRUCTURE_STORAGE) {
                energy += storage.store[RESOURCE_ENERGY];
            }
        }

        let report: Report = {
            govId: this.name,
            energy: energy,
            exploitRatio: this.exploitRatio,
            threatLevel: Game.rooms[this.name].find(FIND_HOSTILE_CREEPS).length,
            rcl: Game.rooms[this.name].controller!.level,
        };
        return report;
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
            { memory: {role: role, governor: this.name, data: this.initData(role)} }
        ) === OK){
            // If we spawn a creep we add the newly created creep to the governor's list of creeps
            // Unfortunatly a creep is not given an id until it is spawned so we must wait
            // and add its id to the governor's list
            this.spawningCreeps.push(creepName)
            console.log("we spawned a creep of type: ", role);
        }
    }

    initData(role: Role): any[] {
        switch (role) {
            case (Role.StarterHarvester): {
                return [false];
            }
            case (Role.Harvester): {
                return [false];
            }
            case (Role.Thopter): {
                return [false];
            }
            case (Role.Pyon): {
                return [false];
            }
        }
    }

    /**
     * Executes orders given by Mentat.
     */
    executeOrders(mentatCommands: MentatCommands[]): void {
        console.log(mentatCommands);
        this.maintainCreepLevels();
        this.runCreeps();
        // Builds the necessary buildings based upon RCL
        this.build()
    }

    /**
     * Spawns creeps when necessary so that creep levels are properly maintained.
     */
    maintainCreepLevels(): void {
        // Check to see if any of our spawning creeps have been spawned
        this.checkSpawningCreeps();

        let numStarterHarvesters = getNumCreepsByRole(Role.StarterHarvester);
        let numHarvesters = getNumCreepsByRole(Role.Harvester);
        let numThopters = getNumCreepsByRole(Role.Thopter);
        let numPyons = getNumCreepsByRole(Role.Thopter);

        // We make a special starter harvester
        if (numHarvesters === 0 && numStarterHarvesters < 6) {
            this.spawnCreep(Role.StarterHarvester)
        }
        /*
        else if (numHarvesters < this.MIN_HARVESTERS) {
            this.spawnCreep(Role.Harvester);
        }

        else if (numThopters < this.MIN_THOPTERS) {
            this.spawnCreep(Role.Thopter);
        }
        else if (numPyons < this.MIN_PYONS) {
            this.spawnCreep(Role.Pyon);
        }
        */
    }

    // This exists becuase later groups will be run by the governors
    runCreeps(): void {
        for (let i = 0; i < this.creeps.length; ++i) {
            let creep = Game.getObjectById(this.creeps[i]);
            if (creep){
                switch (creep.memory.role) {
                    case (Role.StarterHarvester): {
                        roleStarterHarvester.run(creep);
                    }
                    case (Role.Harvester): {
                        roleHarvester.run(creep);
                    }
                    case (Role.Thopter): {
                        roleHarvester.run(creep);
                    }
                    case (Role.Pyon): {
                        roleHarvester.run(creep);
                    }
                }
            }
        }
    }

    // Checks to see if any creeps have been spawned that belong to the governor
    // This way the ids of all newly spawned creeps are added to the governor
    checkSpawningCreeps(): void{
        // For all the creeps that are spanwing
        for (var i = 0; i < this.spawningCreeps.length; ++i){
            // If the creep has an id it has been spawned
            if(Game.creeps[this.spawningCreeps[i]].id != undefined){
                // We add the newly spawned creep to the governor's list
                this.creeps.push(Game.creeps[this.spawningCreeps[i]].id);
                // We take the creep of the currently spawning list
                this.spawningCreeps.splice(i, 1);
            }
        }
    }

    build(): void{
        // First we check to see if the rcl has changed
        let currentRCL = Game.rooms[this.name].controller?.level
        if (currentRCL != undefined){
            if (currentRCL > this.rcl){
                console.log(`Room ${this.name} was upgraded to RCL ${currentRCL}.`);
                // If the rcl has changed we build all the new avaible buildings

            }
        }
    }
}
