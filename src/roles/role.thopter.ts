import { HarvesterIndex, ThopterIndex } from "enums"
import { inRange } from "lodash";
import { goTo } from "goTo";

// The job of the Thopter is to carry the energy minned by the harvesters back to storage
export var roleThopter = {
    run(creep: Creep): void {
        // Check to see if thopter has a target. NOTE: if the harvester dies, it will no longer have a valid id
        // so harvesterTarget will just become null.
        let harvesterTarget = Game.getObjectById(creep.memory.data[ThopterIndex.HarvesterTarget]);
        // If the harvesterTarget is null or undefined and the thopter is outbound then we request for the thopter to be assigned a new target
        if (!harvesterTarget && creep.memory.data[ThopterIndex.Outbound]){
            // We put in the request
            creep.memory.data[ThopterIndex.RequestNewHarvester] = true;
        }

        // If the thopter is empty
        if (creep.store.energy === 0){
            // If the thopter is not outbound and energy = 0 it just finished transfering its energy
            // This means that it must be given a new harvester
            if (creep.memory.data[ThopterIndex.Outbound] == false){
                // We put in the request
                creep.memory.data[ThopterIndex.RequestNewHarvester] = true;

                // We wipe the current harvester target from memory
                creep.memory.data[ThopterIndex.HarvesterTarget] = null;

                // We set the outbound status to true
                creep.memory.data[ThopterIndex.Outbound] = true;
            }

            // Assuming that harvester target is a creep
            if (harvesterTarget instanceof Creep){
                // The thopter moves towards the harvester. If we are close enough to the harvester it will transfer
                // the thopter energy.
                moveToHarvester(creep, harvesterTarget);
            }
        }

        // If the thopter is partially empty and outbound we continue pulling energy
        else if (creep.store.energy < creep.store.getCapacity() && creep.memory.data[ThopterIndex.Outbound]){
            if (harvesterTarget instanceof Creep){
                harvesterTarget.transfer(creep, RESOURCE_ENERGY)
            }
        }

        // If the thopter is full and outbound we need to go back
        else if (creep.store.energy === creep.store.getCapacity() && creep.memory.data[ThopterIndex.Outbound]){
            // Change the thopters memory to indicate that it is going back
            creep.memory.data[ThopterIndex.Outbound] = false;
            creep.memory.data[ThopterIndex.HarvesterTarget] = null;
            if (harvesterTarget instanceof Creep){
                // Notify the harvester that it is leaving
                harvesterTarget.memory.data[HarvesterIndex.ThopterIncomming] = false;
            }
            depositInStorage(creep);
        }

        // In all other cases we need to be going to the energy holding strucutre and depositing energy
        else {
            depositInStorage(creep);
        }

    }
}

// Moves the Thopter towards the harvester
function moveToHarvester(thopter: Creep, harvester: Creep):void{
    // We try to get the harvester to transfer energy to the thopter.
    // (Creeps can transfer and harvest in the same tick so this won't mess up the harvester)
    // If the thopter is not in range, it will just move
    if (harvester.transfer(thopter, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
        // We move the thopter, notice that this is setup for cross room travel
        let harvesterRoom = harvester.room;

        // If the harvester is in the same room as the thopter
        if (harvesterRoom === thopter.room){
            thopter.moveTo(harvester);
        }
        else {
            goTo(thopter, harvesterRoom.name);
        }

    }
}

// Moves the thopter back to its room where it can deposit its energy
// Then proceeds to deposit energy
function depositInStorage(thopter: Creep): void{
    // If the thopter is not back in its room, it needs to move back
    if (thopter.room.name != thopter.memory.governor){
        goTo(thopter, thopter.memory.governor);
    }
    // If the thopter is back in its room it needs to go to an energy holder
    else {
        // We find the closest non empty energy holder
        let structure = thopter.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: function(struct){
                // Thopters only refill containers and storages
                if (struct.structureType == STRUCTURE_CONTAINER || struct.structureType == STRUCTURE_STORAGE || struct.structureType == STRUCTURE_SPAWN){
                    // They must be low on energy
                    if (struct.store[RESOURCE_ENERGY] < struct.store.getCapacity(RESOURCE_ENERGY)){
                        return struct;
                    }
                }
                return null;
            }
        });
        // If such a structure exits we deposit energy in it/try to move towards it
        if (structure){
            if (thopter.transfer(structure, RESOURCE_ENERGY) != OK){
                thopter.moveTo(structure);
            }
        }
    }
}




