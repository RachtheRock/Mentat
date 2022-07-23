import { Role } from "enums";
import { Report } from "report";
import { roleStarterHarvester } from "roles/role.starter-harvester";
import { roleHarvester } from "roles/role.harvester";
import { generateCreepName, getNumCreepsByRole } from "utils/utils";


export class Governor {
    room: Room;
    id: string;
    creeps: Id<Creep>[] = [];
    spawningCreeps: string[] = [];
    exploitRatio = 0;
    MIN_HARVESTERS = 5;
    MIN_THOPTERS = 5;
    MIN_PYONS = 5;

    constructor(room: Room) {
        this.room = room;
        this.id = room.name;

        // We search all creeps in the game to see if they belong to this governor
        // This is becuase of the reset storms/pushing a new version of main
        for (const name in Game.creeps) {
            if (Game.creeps[name].memory.governor === this.id) {
                // If the creep has been spawned
                if (Game.creeps[name].id != undefined){
                    this.creeps.push(Game.creeps[name].id);
                }
                // If the creep has not been spawned
                else{
                    this.spawningCreeps.push(name);
                }

            }
        }
    }

    getReport(): Report{
        let energy: number = this.room.energyAvailable;

        let storages: AnyStructure[]  = this.room.find(FIND_STRUCTURES);

        for (let i = 0; i < storages.length; ++i) {
            let storage = storages[i];
            if (storage.structureType === STRUCTURE_CONTAINER || storage.structureType === STRUCTURE_STORAGE) {
                energy += storage.store[RESOURCE_ENERGY];
            }
        }

        let report: Report = {
            govId: this.id,
            energy: energy,
            exploitRatio: this.exploitRatio,
            threatLevel: this.room.find(FIND_HOSTILE_CREEPS).length,
            rcl: this.room.controller!.level,
        };
        return report;
    }

    /**
     * Spawns a creep at Spawn1.
     * @param role The role assigned to the newly spawned creep
     */
    spawnCreep(role: Role): void {
        let creepName: string = generateCreepName(role, this.id);
        // TODO: Resolve Spawns dynamically
        if (Game.spawns['Spawn1'].spawnCreep(
            Memory.bodyTemplates[role],
            creepName,
            { memory: {role: role, governor: this.id, data: this.initData(role)} }
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
    executeOrders(): void {
        this.maintainCreepLevels();
        this.runCreeps();
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
        if (numHarvesters === 0 && numStarterHarvesters >= 0) {
            this.spawnCreep(Role.StarterHarvester)
        }
        else if (numHarvesters < this.MIN_HARVESTERS) {
            this.spawnCreep(Role.Harvester);
        }

        else if (numThopters < this.MIN_THOPTERS) {
            this.spawnCreep(Role.Thopter);
        }
        else if (numPyons < this.MIN_PYONS) {
            this.spawnCreep(Role.Pyon);
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
}
