import { Mentat } from "mentat";

export function genesis(): Mentat {
    if (Memory.awake === undefined) {
        console.log('Genesis: begin');
        Memory.awake = true;

        // We initialize the memory
        Memory.bodyTemplates = [];
        // Starter Harvester
        Memory.bodyTemplates.push([WORK, WORK, CARRY, MOVE]);
        // Harvester
        Memory.bodyTemplates.push([WORK, WORK, CARRY, MOVE]);
        // Thopter
        Memory.bodyTemplates.push([CARRY, CARRY, MOVE, MOVE, MOVE, MOVE]);
        // Pyon
        Memory.bodyTemplates.push([WORK, CARRY, CARRY, MOVE, MOVE]);

        Memory.governorSourcesMap = [];

        return new Mentat(true);
    }
    else {
        console.log('Genesis: already begun')
        return new Mentat(false);
    }
}

