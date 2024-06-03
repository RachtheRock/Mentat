// This class is used by the governors. For every energy source they control they create an energy source object
export class EnergySource{
    id: Id<Source>;
    spotsAvailable: number;
    assignedHarvesters: Id<Creep>[] = [];

    constructor(sourceId: Id<Source>){
        this.id = sourceId;
        this.spotsAvailable = this.getSpotsAvailable();
    }

    // Finds the number of spots available for harvesting around a source
    // This ensures that no extra static harvesters will be assigned to a source
    getSpotsAvailable(): number{
        let sourceObject = Game.getObjectById(this.id)
        let centerPos = sourceObject!.pos;
        // We get the terrain of the source's surrounding spaces as an array
        let area = sourceObject!.room.lookForAtArea(LOOK_TERRAIN, centerPos.y-1, centerPos.x-1, centerPos.y+1, centerPos.x+1, true);
        // The number of open spots around the source
        let openSpotsNum = 0;
        for (let i = 0; i < area.length; ++i){
            if (area[i].terrain === "plain" || area[i].terrain === "swamp"){
                openSpotsNum = openSpotsNum + 1;
            }
        }
        // The minus one here is temporary becuase we still rely on the starter harvesters for upgrading
        return openSpotsNum;
    }

    // Assigns a harvester to the source
    assignHarvester(creepId: Id<Creep>): void{
        this.assignedHarvesters.push(creepId);
    }

    // TODO: As the creeps get larger we need less and less harvester creeps per source
    //       We need a way to update this
    // Checks to see if the source needs more harvesters or not
    needsMoreHarvesters():boolean{
        if (this.assignedHarvesters.length < this.spotsAvailable){
            return true;
        }
        else{
            return false;
        }
    }
}
