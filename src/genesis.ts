export function genesis(): void {
    if (Memory.awake === undefined) {
        console.log('Genesis: begin');
        Memory.awake = true;

        Memory.bodyTemplates = [];
        // Starter Harvester
        Memory.bodyTemplates.push([WORK, WORK, CARRY, MOVE]);
        // Harvester
        Memory.bodyTemplates.push([WORK, WORK, CARRY, MOVE]);
        // Thopter
        Memory.bodyTemplates.push([CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]);
        // Pyon
        Memory.bodyTemplates.push([WORK, CARRY, CARRY, MOVE, MOVE]);

        console.log(Memory.bodyTemplates);
    }
    else {
        console.log('Genesis: already begun')

    }
}

