import { Governor } from "governor";
import { Report } from "report";


export class Mentat {
    //governors: Map<string, Governor>;
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
        for (const govId in this.governors) {
            this.governors[govId]!.executeOrders();
        }
    }

    /**
     * Get a list containing reports from all governors.
     * @returns The governors' reports
     */
    getAllReports(): Report[] {
        let reports: Report[] = [];
        for (const gov of this.governors.values()) {
            reports.push(gov.getReport());
        }
        return reports;
    }

    getStrategies(reports: Report[]): void {
        // TODO
    }

    commandGovernors(): void {
        // TODO
    }
}
