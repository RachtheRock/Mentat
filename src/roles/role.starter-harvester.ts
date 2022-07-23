import { StarterHarvesterIndex } from "enums";

export var roleHarvester = {
    run(creep: Creep): void {

        // If the creep is out of energy then it goes to harvest more
        if (creep.memory.data[StarterHarvesterIndex.Harvesting] && creep.store.energy == 0){
            creep.memory.data[StarterHarvesterIndex.Harvesting] = false;
        }

        // If the creep is full of energy then it goes to distribute it in the spawn or an extension
        else if (!creep.memory.data[StarterHarvesterIndex.Harvesting] && creep.store.energy == creep.store.getCapacity()){
            creep.memory.data[StarterHarvesterIndex.Harvesting] = true;
        }

        // Goes to deposit energy in spawn or in extensions
        if (creep.memory.data[StarterHarvesterIndex.Harvesting]) {

            // We find the structures in the room that can be "refilled", first we look for towers

            let structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                filter: function(struct){
                    // looking for towers that are low on energy
                    if (struct.structureType == STRUCTURE_SPAWN){
                    //if (struct.structureType == STRUCTURE_TOWER){
                        // They must be low on energy
                        if (struct.store[RESOURCE_ENERGY] < struct.store.getCapacity(RESOURCE_ENERGY)){
                            return struct;
                        }
                    }
                    return null;
                }
            });


            // If this structure exists the creep goes and gives it energy
            if (structure != undefined){
                if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(structure);
                }

            }

        }

        // Goes to harvest
        else {
            var closest_source = creep.pos.findClosestByPath(FIND_SOURCES);

            if (closest_source) {
                if (creep.harvest(closest_source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(closest_source);
                }
            }
        }
    }
};
