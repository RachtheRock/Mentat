import { CreepSkeletonFactory } from "creep-factory";
import { Role } from "enums";
import { roleBuilder } from "roles/role.builder";
import { roleHarvester } from "roles/role.harvester";
import { roleUpgrader } from "roles/role.upgrader";
import { generateCreepName } from "utils/utils";


export class CreepManager {
    constructor() { }

    /**
     * Spawns a creep at Spawn1. It's skeleton and body parts are defined
     * by the role's SkeletonFactory definition.
     * @param role The role assigned to the newly spawned creep
     */
    spawnCreep(role: Role): void {
        // Use the factory to generate a creep with the desirable
        // characteristics of its role.
        let creepSkeleton = CreepSkeletonFactory.getCreepSkeleton(role);

        // TODO: Resolve Spawns dynamically
        Game.spawns['Spawn1'].spawnCreep(
            creepSkeleton.body,
            generateCreepName(creepSkeleton.memory.role),
            { memory: creepSkeleton.memory }
        );
    }

    /**
     * Runs each creep according to their role.
     */
    runCreeps(): void {
        for (const name in Game.creeps) {
            let creep = Game.creeps[name];

            switch (creep.memory.role) {
                case Role.Harvester: {
                    roleHarvester.run(creep);
                    break;
                }
                case (Role.Upgrader): {
                    roleUpgrader.run(creep);
                    break;
                }
                case (Role.Builder): {
                    roleBuilder.run(creep);
                    break;
                }
            }
        }
    }
}
