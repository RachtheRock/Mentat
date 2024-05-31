export enum Role {
    StarterHarvester = 0,
    Harvester = 1,
    Thopter = 2,
    Pyon = 3,
}

/*
The type indices are a cleaver way to store creep data via memory.
Each type of creep has different attribute variables which are stored
in a big string array in its memory. To access this just use the enums here.
For example, HarvesterIndex enums allow you to access the boolean variable
ArrivedAtSource, the string id of the source, and the boolean variable
ThopterIncomming all in memory.
*/
export enum StarterHarvesterIndex {
    Harvesting = 0
}

export enum HarvesterIndex {
    ArrivedAtSource = 0,
    SourceId = 1,
    // Is a thopter on the way to collect resources
    ThopterIncomming = 2
}

export enum ThopterIndex {
    // Is the thopter going out towards a harvester/absorbing energy?
    Outbound = 0,
    // What is the harvester the thopter is going to?
    HarvesterTarget = 1,
    // A boolean that indicates a request for a new harvester target
    // Harvesters are keep in the dark about the state of the colony, they must
    // ask the governor for their target
    RequestNewHarvester = 2
}

export enum PyonIndex {
    Pyoning = 0
}

// Mentat gives these enums to the governors
// Right now Mentat Commands are just enums for simplicity
// Later on they could be interfaces
export enum MentatCommands {
    // Boolean, if we are dynamically harvesting
    dynamicHarvesting = 0,
}
