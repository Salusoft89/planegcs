import ModuleFactory from '../planegcs/bin/planegcs.js';
import { GcsSystem } from '../planegcs/bin/gcs_system';

var gcs: GcsSystem;

describe("planegcs", () => {
    beforeAll(async () => {
        var module = await ModuleFactory();
        gcs = new module.GcsSystem();
    });
    
    test("by default it has 0 params", async () => {
        expect(gcs.params_size()).toBe(0);
    });

    test("constraint with a line can be called with a line object", () => {
        const line = gcs.make_line(0, 0, 1, 1);
        gcs.add_constraint_vertical_l(line, 1);
    });

    test("constraint with a curve can be called with a line object", () => {
        const angle_i = gcs.params_size();
        gcs.push_param(Math.PI / 2, false);

        const line = gcs.make_line(0, 0, 1, 1);
        const line2 = gcs.make_line(0, 0, 2, 2);
        const point = gcs.make_point(0, 0);

        gcs.add_constraint_angle_via_point(line, line2, point, angle_i, 2);
    });
});