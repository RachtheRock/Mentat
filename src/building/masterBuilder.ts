// This function creates all the construction sites in the room whenever an RCL is upgraded
export function buildRCLupgrades(room:string, newRCL:number): void{
    if (newRCL === 1){
        console.log("RCL 1");
        let spawn = Game.rooms[room].find(FIND_MY_SPAWNS);
        let spawnPos = spawn[0].pos;

        // We construct the containers
        let extentionPos: RoomPosition[] = [];
        extentionPos.push(new RoomPosition(spawnPos.x-2, spawnPos.y, room));
        extentionPos.push(new RoomPosition(spawnPos.x+2, spawnPos.y, room));

        for (var i = 0; i < extentionPos.length; ++i){
            extentionPos[i].createConstructionSite(STRUCTURE_CONTAINER);
        }

    }
    else if (newRCL === 2){

    }
    else if (newRCL === 3){

    }
    else if (newRCL === 4){

    }
    else if (newRCL === 5){

    }
    else if (newRCL === 6){

    }
    else if (newRCL === 7){

    }
    else if (newRCL === 8){

    }

}
