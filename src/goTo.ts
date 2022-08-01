// Creep must have exit_pos and exit_room in its memory
// A function that moves creeps to another room
// Returns True if the creep has reached the room

export function goTo(creep:Creep, target_room:string):boolean{
    // If the creep is already in the room we return true
    if(creep.pos.roomName == target_room){
        return true;
    }

    // If the creep has an exit_pos
    if(creep.memory.exit_pos && creep.memory.exit_room){
        // If we have reached the exit position we delete it from the creeps memory, ensuring that in the next tick
        // the creep is assigned a new exit posistion inside its new room and that it moves foward

        // I know this comparision is long but I tried to comapre the two arrays and it didn't work
        if(creep.pos.x == creep.memory.exit_pos[0] && creep.pos.y == creep.memory.exit_pos[1] && creep.pos.roomName == creep.memory.exit_room){
            creep.memory.exit_pos = undefined;
            creep.memory.exit_room = undefined;
        }
        // If we have not reached the exit position, we move towards it
        else{
            creep.moveTo(new RoomPosition(creep.memory.exit_pos[0], creep.memory.exit_pos[1], creep.memory.exit_room));
        }
    }

    // If there is not an exit postion defined we create one
    else{
        // The exit direction of the room
        let exitDir = creep.room.findExitTo(target_room);

        // If the exit direction exists (typescript requires us to put this in)
        if(exitDir != -2 && exitDir != -10){
            // The exit position
            let exit_pos = creep.pos.findClosestByPath(exitDir);
            // If the exit position exists (again typescript requires us to put this in)
            if(exit_pos){
                creep.moveTo(exit_pos);
                creep.memory.exit_pos = [exit_pos.x, exit_pos.y];
                creep.memory.exit_room = exit_pos.roomName;
            }
        }
    }

    // We return false since the creep is not yet at its destination.
    // It may be possible that the creep moved to the destination in this tick,
    // but this does not count as the creep being at the destination.
    return false;
}

