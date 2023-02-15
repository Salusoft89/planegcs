import ModuleFactory from '../planegcs/bin/planegcs.js';
import { GcsSystem } from '../planegcs/bin/gcs_system';

var gcs: GcsSystem;

describe("planegcs", () => {
    beforeAll(async () => {
        var module = await ModuleFactory();
        gcs = new module.GcsSystem();
    });

    
    test("Gcs has 0 params", async () => {
        expect(gcs.params_size()).toBe(0);
    });
});


// beforeEach(() => {
//     ModuleFactory.mockClear();
// })