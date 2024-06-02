import { MentatCommands, Role } from "enums";
import { Governor } from "governor";
import { generateCreepName, getNumCreepsByRole } from "utils/utils";


export class Mentat {
    governors: Governor[];

    constructor(isNew: boolean) {
    /*
    INPUTS: isNew - is the Mentat a newly created one or are we just reconstructing it?
    */
        this.governors = []
        // Create a governor for each room under mentat's control
        // These governors are assumed to not be newly created
        for (const roomName in Game.rooms) {
            let controller = Game.rooms[roomName].controller
            if (controller !== undefined && controller.my) {
                this.governors.push(new Governor(controller.room, isNew))
            }
        }
    }

    /**
     * Runs the mainloop of the mentat.
     * Gathers reports, analyzes them, devises an overall strategy,
     * and then commands the governors to implement specific strategies.
     */

    run(): void {
        // Analyze reports
        let commands = this.getAllCommands()
        // Command governors
        for (const governor of commands.keys()){
            // The strategy of that the mentat commands the governor
            let command = commands.get(governor)
            if (command != undefined){
                governor.executeOrders(command);
            }
            else {
                console.log("A governor did not get a command")
            }
        }
    }

    /*
    Processes the reports and generate commands for the governors
    */
    getAllCommands(): Map<Governor, MentatCommands[]> {
        let allCommands = new Map();

        // For each governor we analyze the report and return mentat comamands
        for (const gov of this.governors) {
            const starterHarvesterCount = getNumCreepsByRole(Role.StarterHarvester, gov.name);

            // If we have made four starter harvesters or if we are already in dyanmic harvesting mode then we dynamic harvest
            if (starterHarvesterCount === 3 || gov.previousMentatCommands[MentatCommands.dynamicHarvesting]){
                allCommands.set(gov, [false, true]);
            }

            else {
                allCommands.set(gov, [true, false]);
            }

            /*
            if (report!.rcl === 1){
                strategies.set(gov.name, [true]);
            }
            */
        }
        return allCommands;
    }

    commandGovernors(): void {
        // TODO
    }
}
