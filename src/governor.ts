import { Role } from "enums";
import { Report } from "report";
import { roleHarvester } from "roles/role.harvester";
import { generateCreepName, getNumCreepsByRole } from "utils/utils";


export class Governor {
    room: Room;
    id: string;
    creeps: Creep[] = [];
    exploitRatio = 0;
    MIN_HARVESTERS = 5;
    MIN_THOPTERS = 5;
    MIN_PYONS = 5;

    constructor(room: Room) {
        this.room = room;
        this.id = room.name;
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
     * Spawns a creep at Spawn1. It's skeleton and body parts are defined
     * by the role's SkeletonFactory definition.
     * @param role The role assigned to the newly spawned creep
     */
    spawnCreep(role: Role): void {
        // Use the factory to generate a creep with the desirable
        // characteristics of its role.

        // TODO: Resolve Spawns dynamically
        Game.spawns['Spawn1'].spawnCreep(
            Memory.bodyTemplates[role],
            generateCreepName(role),
            { memory: {role: role, governor: this.id, data: this.initData(role)} }
        );
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
        let numHarvesters = getNumCreepsByRole(Role.Harvester);
        let numThopters = getNumCreepsByRole(Role.Thopter);
        let numPyons = getNumCreepsByRole(Role.Thopter);

        // We make a special starter harvester
        if (numHarvesters === 0) {
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
            let creep = this.creeps[i];
            switch (creep.memory.role) {
                case (Role.StarterHarvester): {
                    roleHarvester.run(creep);
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
