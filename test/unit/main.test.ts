import { loop } from "../../src/main";
import { Game, Memory } from "./mock"


describe("main", () => {
    beforeAll(() => {
        // runs before all test in this block
    });

    beforeEach(() => {
        // runs before each test in this block
        // @ts-ignore : allow adding Game to global
        global.Game = _.clone(Game);
        // @ts-ignore : allow adding Memory to global
        global.Memory = _.clone(Memory);
    });

    it("should export a loop function", () => {
        expect(typeof loop === "function").toBe(true);
    });

    it("should return void when called with no context", () => {
        expect(loop()).not.toBeDefined();
    });

    it("Automatically delete memory of missing creeps", () => {
        Memory.creeps.persistValue = "any value";
        Memory.creeps.notPersistValue = "any value";

        Game.creeps.persistValue = "any value";

        loop();

        expect(Memory.creeps.persistValue).toBeDefined();
        expect(Memory.creeps.notPersistValue).not.toBeDefined();
    });
});
