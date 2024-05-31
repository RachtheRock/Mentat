/*
This harvester goes to its assigned source and stays there for life, ideally minning and
giving energy to thopters.
*/

import { HarvesterIndex } from "enums"

export var roleHarvester = {
    run(creep: Creep): void {
        // The source that the harvester is assigned to
        let source = Game.getObjectById(creep.memory.data[HarvesterIndex.SourceId]);

        // If the harvester is indeed assigned to a source
        if (source instanceof Source){

            // If the creep is not already full of energy
            if (creep.store.energy != creep.store.getCapacity()){

                // If we have arrived at a source we mine it
                if (creep.memory.data[HarvesterIndex.ArrivedAtSource]){
                    creep.harvest(source);
                }

                // If not we move towards it
                else {
                    if (creep.harvest(source) == OK) {
                        creep.memory.data[HarvesterIndex.ArrivedAtSource] = true;
                    }
                    else{
                        creep.moveTo(source, {range:1});
                    }
                }
            }
        }

        else {
            console.log("I don't have a source");
        }
    }
}
