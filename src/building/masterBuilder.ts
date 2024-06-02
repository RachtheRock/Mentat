// This function creates all the construction sites in the room whenever an RCL is upgraded
export function buildRCLupgrades(room: string, newRCL: number) {
    console.log(`[INFO] Room ${room} RCL upgraded to RCL ${newRCL}`);
    switch (newRCL) {
        case 1:
        /*
        let spawn = Game.rooms[room].find(FIND_MY_SPAWNS);
        let spawnPos = spawn[0].pos;

        // We construct the containers
        let extentionPos: RoomPosition[] = [];
        extentionPos.push(new RoomPosition(spawnPos.x-2, spawnPos.y, room));
        extentionPos.push(new RoomPosition(spawnPos.x+2, spawnPos.y, room));

        for (var i = 0; i < extentionPos.length; ++i){
            extentionPos[i].createConstructionSite(STRUCTURE_CONTAINER);
        }
        */
            break;
        case 2:
            break;
        case 3:
            break;
        case 4:
            break;
        case 5:
            break;
        case 6:
            break;
        case 7:
            break;
        case 8:
            break;
    }
}
