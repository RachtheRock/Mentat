import { Role, HarvesterIndex, ThopterIndex} from "enums";
import { Mentat } from "mentat";
import { genesis } from "genesis";
import { ErrorMapper } from "utils/ErrorMapper";


declare global {
    /*
        Example types, expand on these or remove them and add your own.
        Note: Values, properties defined here do no fully *exist* by this type definiton alone.
            You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

        Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
        Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
    */
    // Memory extension samples
    interface Memory {
        uuid: number;
        log: any;
        awake: boolean;
        bodyTemplates: BodyPartConstant[][];
        // An array of arrays formatted as [governor name, [sourceIDs] ], ... Must be stored in memory so that on reset
        // the governors can be reassinged the sources they are to control. I am not super happy with this as I would rather
        // just use a Map.
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

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
    // console.log(`Current game tick is ${Game.time}`);

    // TODO: Break memory management into multiple files/functions
    // Automatically delete memory of missing creeps



    for (const name in Memory.creeps) {
        if (!(name in Game.creeps)) {
            // The object of the dead creep
            let deadCreep =  Memory.creeps[name];
            // We get its role and clear its name out from various other areas if needed
            let role = deadCreep.role;

            // If the creep is a harvester we must remove its name from the energy source object that it was minning
            if (role = Role.Harvester){
                // We get the governor that the creep belonged to and access the source object

                // Look for the governor
                for (let i = 0; i < mentat.governors.length; ++i){
                    if (mentat.governors[i].name === deadCreep.governor){
                        let governor = mentat.governors[i];

                        // Look for the source that the harvester belonged to
                        for (let j = 0; j < governor.sourcesUnderControl.length; ++j){
                            if (governor.sourcesUnderControl[j].id === deadCreep.data[HarvesterIndex.SourceId]){
                                let source = governor.sourcesUnderControl[j];

                                // Look for the creep in the source object's list of creeps and remove it
                                for (let k = 0; k < source.assignedHarvesters.length; ++k){
                                    if(Game.getObjectById(source.assignedHarvesters[k])!.name === name){
                                        source.assignedHarvesters.splice(k,1);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // If a thopter dies we must alert its harvester that it is no longer incoming
            if(role = Role.Thopter){
                // We get the target harvester
                let targetHarvester = Game.getObjectById(deadCreep.data[ThopterIndex.HarvesterTarget]);
                // If it had a target harvester
                if (targetHarvester instanceof Creep){
                    // Look for the governor
                    for (let i = 0; i < mentat.governors.length; ++i){
                        if (mentat.governors[i].name === deadCreep.governor){
                            let governor = mentat.governors[i];
                            // Look for the harvester
                            for (let j = 0; j < governor.creeps.length; ++j){
                                // If found, we update its thopter incoming message
                                if (governor.creeps[j] === targetHarvester.id ){
                                    targetHarvester.memory.data[HarvesterIndex.ThopterIncomming] = false;
                                }
                            }
                        }
                    }
                }
            }

            // Now we delete the creep from the governor's memory
            // This is redundant as we've already looped through the governors
            // in the two cases above but I'm tired and want to push
            // Look for the governor
            for (let i = 0; i < mentat.governors.length; ++i){
                if (mentat.governors[i].name === deadCreep.governor){
                    let governor = mentat.governors[i];
                    // look for the creep
                    for (let j = 0; j < governor.creeps.length; ++j){
                        let creep = Game.getObjectById(governor.creeps[j]);
                        // If a creep does not have a game Id any more we remove him from the
                        // governor's list of creeps
                        if (creep == null){
                            governor.creeps.splice(j,1);
                            console.log("creep removed!");
                        }
                    }
                }
            }


            delete Memory.creeps[name];
        }
    }

    mentat.run();
});
