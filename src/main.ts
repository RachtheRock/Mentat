import { Role, HarvesterIndex, ThopterIndex} from "enums";
import { Mentat } from "mentat";
import { genesis } from "genesis";
import { ErrorMapper } from "utils/ErrorMapper";

declare global {
    /*
        Example types, expand on these or remove them and add your own.
        Note: Values, properties defined here do not fully *exist* by this type definiton alone.
            You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

        Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
        Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
    */
    // Memory extension samples
    interface Memory {
        uuid: number;
        log: any;
        awake: boolean;
        /*
            An array of arrays formatted as [governor name, [sourceIDs] ], ... Must be stored in memory so that on reset
            the governors can be reassinged the sources they are to control. I am not super happy with this as I would rather
            just use a Map.
        */
         governorSourcesMap: Array<any>
    }

    interface CreepMemory {
        role: Role;
        governor: string;
        name: string;

        // Used for cross room travel, the exit position where the creep is travelling to
        exit_pos?: number[];
        exit_room?: string;

        data: any[];
    }

    // Syntax for adding proprties to `global` (ex "global.log")
    namespace NodeJS {
        interface Global {
            log: any;
        }
    }
}

let mentat = genesis();

function handleDeadCreep(name: string) {
    let deadCreep =  Memory.creeps[name];
    let role = deadCreep.role;
    let governor = mentat.governors.find((g) => { return g.name === deadCreep.governor; })!;

    switch (role) {

        // Detach harvester from the energy source that it was mining
        case Role.Harvester: {
            for (let j = 0; j < governor.sourcesUnderControl.length; ++j){
                if (governor.sourcesUnderControl[j].id === deadCreep.data[HarvesterIndex.SourceId]){
                    let source = governor.sourcesUnderControl[j];

                    // Look for the creep in the source object's list of creeps and remove it
                    for (let k = 0; k < source.assignedHarvesters.length; ++k){
                        // If we find a creep that is no longer in the game
                        if(Game.getObjectById(source.assignedHarvesters[k]) == null){
                            source.assignedHarvesters.splice(k,1);
                            break;
                        }
                    }
                }
            }
            break;
        }

        // Thopter alerts the attached harvester that it is no longer incoming
        case Role.Thopter: {
            // We get the target harvester
            let targetHarvester = Game.getObjectById(deadCreep.data[ThopterIndex.HarvesterTarget]);
            // If it had a target harvester
            if (targetHarvester instanceof Creep){
                let governor = mentat.governors.find((g) => { return g.name === deadCreep.governor; })!;
                // Look for the harvester
                for (let j = 0; j < governor.creeps.length; ++j){
                    // If found, we update its thopter incoming message
                    if (governor.creeps[j] === targetHarvester.id ){
                        targetHarvester.memory.data[HarvesterIndex.ThopterIncomming] = false;
                    }
                }
            }
            break;
        }

        case Role.Pyon: {
            // TODO: Pyon death
            break;
        }

    }

    // Remove creep from governor's list
    for (let j = 0; j < governor.creeps.length; ++j) {
        let creep = Game.getObjectById(governor.creeps[j]);
        // If a creep does not have a game Id any more we remove him from the
        // governor's list of creeps
        if (creep == null) {
            governor.creeps.splice(j, 1);
            console.log("creep removed!");
        }
    }

    delete Memory.creeps[name];
}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
    // TODO @john: move this to an event-based architecture
    for (const name in Memory.creeps) {
        if (!(name in Game.creeps)) {
            handleDeadCreep(name);
        }
    }
    mentat.run();
});
