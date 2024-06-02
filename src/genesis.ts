import { Mentat } from "mentat";

// A function that returns a Mentat instance
// Runs everytime screeps deletes all global objects
export function genesis(): Mentat {
    if (Memory.awake === undefined) {
        console.log('Genesis: begin');
        Memory.awake = true;
        Memory.governorSourcesMap = [];

        return new Mentat(true);
    }
    else {
        return new Mentat(false);
    }
}

