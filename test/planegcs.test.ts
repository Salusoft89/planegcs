// This library provides WebAssembly bindings for the FreeCAD's geometric solver library planegcs.
// Copyright (C) 2023  Miroslav Šerý, Salusoft89 <miroslav.sery@salusoft89.cz>  

// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 2.1 of the License, or (at your option) any later version.

// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.

// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA

import { it, describe, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import PlanegcsWasm from '../planegcs_dist/planegcs.js';
import { Algorithm, DebugMode, SolveStatus, type GcsSystem } from '../planegcs_dist/gcs_system';
import type { ModuleStatic } from '../planegcs_dist/planegcs.js';
import { arr_to_intvec } from '../sketch/emsc_vectors.js';

let gcs_factory: ModuleStatic;
let gcs: GcsSystem; 

describe("planegcs", () => {
    beforeAll(async () => {
        gcs_factory = await PlanegcsWasm();
    });
    
    beforeEach(() => {
        gcs = new gcs_factory.GcsSystem();
    });

    afterEach(() => {
        gcs.clear_data();
        gcs.delete();
    });
    
    it("by default it has 0 params", () => {
        expect(gcs.params_size()).toBe(0);
    });

    it("parameter can be updated", () => {
        const addr = gcs.push_param(1, true);
        gcs.set_param(addr, 2, true);
        expect(gcs.get_param(addr)).toBe(2);
    });

    it("constraint with a line can be called with a line object", async () => {
        const p1x_i = gcs.push_param(1, true);
        const p1y_i = gcs.push_param(2, true);
        const p2x_i = gcs.push_param(3, true);
        const p2y_i = gcs.push_param(4, true);

        const line = gcs.make_line(p1x_i, p1y_i, p2x_i, p2y_i);
        gcs.add_constraint_vertical_l(line, 1, true, 1);
    });

    it("constraint with a curve can be called with a line object", () => {
        const p1x_i = gcs.push_param(1, true);
        const p1y_i = gcs.push_param(2, true);
        const p2x_i = gcs.push_param(3, true);
        const p2y_i = gcs.push_param(4, true);

        const angle_i = gcs.push_param(Math.PI / 2, false);

        const line1 = gcs.make_line(p1x_i, p1y_i, p2x_i, p2y_i);
        const line2 = gcs.make_line(p2x_i, p2y_i, p1x_i, p1y_i);
        const point = gcs.make_point(p1x_i, p1y_i);

        gcs.add_constraint_angle_via_point(line1, line2, point, angle_i, 2, true, 1);
    });

    it("constraint with a line cannot be called with a point object", () => {
        const p1x_i = gcs.push_param(1, true);
        const p1y_i = gcs.push_param(2, true);

        const point = gcs.make_point(p1x_i, p1y_i);

        expect(() => {
            gcs.add_constraint_vertical_l(point, 1, true, 1);
        }).toThrow();
    });

    it("dof decreases with added constraint", () => {
        const p1x_i = gcs.push_param(1, true);
        const p1y_i = gcs.push_param(2, true);
        const p2x_i = gcs.push_param(1, false);
        const p2y_i = gcs.push_param(3, false);

        gcs.solve_system(Algorithm.DogLeg);
        expect(gcs.dof()).toBe(2);

        const line = gcs.make_line(p1x_i, p1y_i, p2x_i, p2y_i);
        gcs.add_constraint_vertical_l(line, 1, true, 1);
        
        gcs.solve_system(Algorithm.DogLeg);
        expect(gcs.dof()).toBe(1);
    });

    it("can add B-spline", () => {
        // for visualisation, see https://nurbscalculator.in/
        const weight_is = [1, 1, 1, 1].map(w => gcs.push_param(w, true));

        // knot values
        const knot_is = [
            0, 0, 0, 0, 1, 1, 1, 1
        ].map(knot_val => gcs.push_param(knot_val, true));

        const control_point_is = [
            -4, -4,
            -2, 4,
            2, -4,
            4, 4
        ].map(val => gcs.push_param(val, true));

        const degree = 3;
        const periodic = false;

        const multiplicities = [4, 1, 1, 4];

        const b_spline = gcs.make_bspline(0, 1, 6, 7,
            arr_to_intvec(gcs_factory, control_point_is),
            arr_to_intvec(gcs_factory, weight_is),
            arr_to_intvec(gcs_factory, knot_is),
            arr_to_intvec(gcs_factory, multiplicities),
            degree, periodic);

        // todo: test if b-spline is properly defined
    })

    it("returns correct enum status", () => {
        gcs.push_param(1, true);
        gcs.push_param(2, true);

        const status = gcs.solve_system(Algorithm.DogLeg);
        expect(status).toEqual(SolveStatus.Success);
    }); 

    it("can change debugmode", () => {
        gcs.set_debug_mode(DebugMode.NoDebug);
        gcs.set_debug_mode(DebugMode.IterationLevel);
        gcs.set_debug_mode(DebugMode.Minimal);
    });

    it("can clear params", () => {
        gcs.push_param(1, true);
        gcs.clear_data();

        expect(gcs.params_size()).toBe(0);
    });
});