import { Governor } from "governor";
import { Report } from "report";


export class Mentat {
    governors: Governor[] = [];

    constructor() {
        // TODO: load mentat state from memory to pick up from where he left off
        // Create a governor for each room
        for (const roomName in Game.rooms) {
            let controller = Game.rooms[roomName].controller
            if (controller !== undefined && controller.my) {
                this.governors.push(new Governor(controller.room));
            }
        }
    }

    run(): void {
        // Get reports from governors
        // let reports: Report[] = [];
        // for (let i = 0; i < this.governors.length; ++i) {
        //     reports.push(this.governors[i].getReport());
        // }
        for (let i = 0; i < this.governors.length; ++i) {
            this.governors[i].executeOrders();
        }
    }
}
