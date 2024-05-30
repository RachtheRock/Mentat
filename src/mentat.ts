import { MentatCommands } from "enums";
import { Governor } from "governor";
import { Report } from "report";


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
        // Get reports from governors
        let reports = this.getAllReports()
        // Analyze reports
        let strategies = this.getStrategies(reports)
        // Command governors
        for (const governor of strategies.keys()){
            // The strategy of that the mentat commands the governor
            let strat = strategies.get(governor)
            if (strat != undefined){
                governor.executeOrders(strat);
            }
            else {
                console.log("A governor did not get a command")
            }
        }
    console.log("git hub is linked!");
    }

    /**
     * Get a maping containing governor names mapped to their respective reports
     * @returns The governors' reports
     */
    getAllReports(): Map<Governor, Report> {
        let reports = new Map();
        for (const govId in this.governors) {
            reports.set(this.governors[govId], this.governors[govId].getReport());
        }
        return reports;
    }

    /*
    Processes the reports and generate commands for the governors
    */
    getStrategies(reports: Map<Governor, Report>): Map<Governor, MentatCommands[]> {
        let strategies = new Map();
        // For each governor we analyze the report and return mentat comamands
        for (const govId of reports.keys()){
            let report = reports.get(govId);
            // TODO: Make it obvious which commands are being assigned
            if (report!.rcl === 1){
                strategies.set(govId, [true]);
            }
            else {
                strategies.set(govId, [false]);
            }
        }
        return strategies;
    }

    commandGovernors(): void {
        // TODO
    }
}
