import { Role } from "enums";
import { Governor } from "governor";


/**
 * Gets the number of creeps that have the given role.
 * @param role The Role of the creep
 * @returns Number of creeps that match the role
 */
export function getNumCreepsByRole(role: Role): number {
    let matches = 0;
    for (const name in Game.creeps) {
        if (Game.creeps[name].memory.role === role) {
            ++matches;
        }
    }
    return matches;
}

/**
 * Generate a name of the creep in the format {ROLE}{GAME_TIME}-{Governor Name}
 * For example, if a creep with a Harvester role was spawned at tick 4,
 * its name would be 'Harvester4'.
 * @param role The Role of the creep
 * @returns The formatted name
 */
export function generateCreepName(role: Role, governorName: string): string {
    return `${Role[role]}${Game.time}-${governorName}`;
}

/**
     * Get the total energy cost of the CreepSkeleton's body.
     * The body parts cost varying amounts of energy.
     * @returns The energy cost of the body
     */
//  getBodyPartCost(): number {
//     let cost = 0;
//     for (var i = 0; i < this.body.length; ++i) {
//         cost += BODYPART_COST[this.body[i]];
//     }
//     return cost;
// }
