export interface HarvesterCreepMemory {
    harvesting: boolean;
}

export interface ThopterCreepMemory {
    thoptering: boolean;
}

export interface PyonCreepMemory {
    pyoning: boolean;
}

export type CreepRoleMemory =
    | HarvesterCreepMemory
    | ThopterCreepMemory
    | PyonCreepMemory
