import PlanegcsWasm from '../planegcs/bin/planegcs.js';
import { GcsSystem } from '../planegcs/bin/gcs_system';

let gcs_factory;
let gcs: GcsSystem;

describe("planegcs", () => {
    beforeAll(async () => {
        gcs_factory = await PlanegcsWasm();
    });
    
    beforeEach(() => {
        gcs = new gcs_factory.GcsSystem();
    });

    afterEach(() => {
        // todo: when should we clear?
        // gcs.clear();
        gcs.delete();
    });
    
    test("by default it has 0 params", () => {
        expect(gcs.params_size()).toBe(0);
    });

    test("parameter can be updated", () => {
        const addr = gcs.push_param(1, true);
        gcs.set_param(addr, 2, true);
        expect(gcs.get_param(addr)).toBe(2);
    });

    test("constraint with a line can be called with a line object", async () => {
        const p1x_i = gcs.push_param(1, true);
        const p1y_i = gcs.push_param(2, true);
        const p2x_i = gcs.push_param(3, true);
        const p2y_i = gcs.push_param(4, true);

        const line = gcs.make_line(p1x_i, p1y_i, p2x_i, p2y_i);
        gcs.add_constraint_vertical_l(line, 1, true);
    });

    test("constraint with a curve can be called with a line object", () => {
        const p1x_i = gcs.push_param(1, true);
        const p1y_i = gcs.push_param(2, true);
        const p2x_i = gcs.push_param(3, true);
        const p2y_i = gcs.push_param(4, true);

        const angle_i = gcs.push_param(Math.PI / 2, false);

        const line1 = gcs.make_line(p1x_i, p1y_i, p2x_i, p2y_i);
        const line2 = gcs.make_line(p2x_i, p2y_i, p1x_i, p1y_i);
        const point = gcs.make_point(p1x_i, p1y_i);

        gcs.add_constraint_angle_via_point(line1, line2, point, angle_i, 2, true);
    });

    test("constraint with a line cannot be called with a point object", () => {
        const p1x_i = gcs.push_param(1, true);
        const p1y_i = gcs.push_param(2, true);

        const point = gcs.make_point(p1x_i, p1y_i);

        expect(() => {
            gcs.add_constraint_vertical_l(point, 1, true);
        }).toThrow();
    });

    test("dof decreases with added constraint", () => {
        const p1x_i = gcs.push_param(1, true);
        const p1y_i = gcs.push_param(2, true);
        const p2x_i = gcs.push_param(1, false);
        const p2y_i = gcs.push_param(3, false);

        gcs.solve_system();
        expect(gcs.dof()).toBe(2);

        const line = gcs.make_line(p1x_i, p1y_i, p2x_i, p2y_i);
        gcs.add_constraint_vertical_l(line, 1, true);
        
        gcs.solve_system();
        expect(gcs.dof()).toBe(1);
    });
});