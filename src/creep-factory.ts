import { CreepRoleMemory } from "creep-role-memory";
import { Role } from "enums";


interface ICreepSkeleton {
    memory: CreepMemory;
    body: BodyPartConstant[];
}

class CreepSkeleton implements ICreepSkeleton {
    memory: CreepMemory = {
        role: Role.Harvester,
        working: false,
        governor: '',
        rmem: {} as CreepRoleMemory,
    };
    body: BodyPartConstant[] = [];
}

// TODO: move these to different files (in same folder)
class HarvesterCreepSkeleton extends CreepSkeleton {
    constructor() {
        super();
        this.memory.role = Role.Harvester;
        if ('harvesting' in this.memory.rmem) {
            this.memory.rmem.harvesting = false;
        }
        this.body = [WORK, WORK, CARRY, MOVE];
    }
}

class ThopterCreepSkeleton extends CreepSkeleton {
    constructor() {
        super();
        this.memory.role = Role.Thopter;
        if ('thoptering' in this.memory.rmem) {
            this.memory.rmem.thoptering = false;
        }
        this.body = [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
    }
}

class PyonCreepSkeleton extends CreepSkeleton {
    constructor() {
        super();
        this.memory.role = Role.Pyon;
        if ('pyoning' in this.memory.rmem) {
            this.memory.rmem.pyoning = false;
        }
        this.body = [WORK, CARRY, CARRY, MOVE, MOVE];
    }
}


export class CreepSkeletonFactory {
    static getCreepSkeleton(role: Role) {
        switch (role) {
            case (Role.Harvester): {
                return new HarvesterCreepSkeleton();
            }
            case (Role.Thopter): {
                return new ThopterCreepSkeleton();
            }
            case (Role.Pyon): {
                return new PyonCreepSkeleton();
            }
            case (Role.StarterHarvester): {
                return new HarvesterCreepSkeleton();
            }
        }
    }
}
