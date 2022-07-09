import { Role } from "enums";


interface ICreepSkeleton {
    memory: CreepMemory;
    body: BodyPartConstant[];
    getBodyPartCost(): number;
}

class CreepSkeleton implements ICreepSkeleton {
    memory: CreepMemory = {
        role: Role.Harvester,
        working: false,
    };
    body: BodyPartConstant[] = [];

    /**
     * Get the total energy cost of the CreepSkeleton's body.
     * The body parts cost varying amounts of energy.
     * @returns The energy cost of the body
     */
    getBodyPartCost(): number {
        let cost = 0;
        for (var i = 0; i < this.body.length; ++i) {
            cost += BODYPART_COST[this.body[i]];
        }
        return cost;
    }
}

// TODO: move these to different files (in same folder)
class HarvesterCreepSkeleton extends CreepSkeleton {
    constructor() {
        super();
        this.memory.role = Role.Harvester;
        this.body = [WORK, WORK, CARRY, MOVE];
    }
}

class UpgraderCreepSkeleton extends CreepSkeleton {
    constructor() {
        super();
        this.memory.role = Role.Upgrader;
        this.body = [WORK, CARRY, CARRY, MOVE, MOVE];
    }
}

class BuilderCreepSkeleton extends CreepSkeleton {
    constructor() {
        super();
        this.memory.role = Role.Builder;
        this.body = [WORK, WORK, CARRY, MOVE];
    }
}


export class CreepSkeletonFactory {
    static getCreepSkeleton(role: Role) {
        switch (role) {
            case (Role.Harvester): {
                return new HarvesterCreepSkeleton();
            }
            case (Role.Upgrader): {
                return new UpgraderCreepSkeleton();
            }
            case (Role.Builder): {
                return new BuilderCreepSkeleton();
            }
        }
    }
}
