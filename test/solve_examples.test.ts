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

import { vi, it, describe, expect, beforeAll, beforeEach } from 'vitest';
import PlanegcsWasm from '../dist/planegcs.js';
import { Algorithm, DebugMode, SolveStatus } from '../dist/gcs_system.js';
import type { ModuleStatic } from '../dist/planegcs.js';
import { GcsWrapper } from '../sketch/gcs_wrapper.js';
import { SketchIndex } from '../sketch/sketch_index.js';
import type { SketchObject } from '../sketch/sketch_primitive.js';

let gcs_factory: ModuleStatic;
let gcs_wrapper: GcsWrapper<SketchIndex>;

const sketch_fillet_overconstrained: SketchObject[] = [
    { id: 1, type: 'point', x: 10, y: 10, fixed: false },
    // this is an extra constraint
    { id: 2, type: 'equal', param1: { o_id: 1, param: 'x' }, param2: 'fillet_radius' },
    { id: 3, type: 'equal', param1: { o_id: 1, param: 'y' }, param2: 0 },

    { id: 4, type: 'point', x: 10, y: 10, fixed: false },
    { id: 5, type: 'equal', param1: { o_id: 4, param: 'x' }, param2: 0 },
    // this is also an extra constraint
    { id: 6, type: 'equal', param1: { o_id: 4, param: 'y' }, param2: 'fillet_radius' },

    // add center point
    { id: 7, type: 'point', x: 10, y: 10, fixed: false },
    { id: 8, type: 'equal', param1: { o_id: 7, param: 'x' }, param2: 'fillet_radius' },
    { id: 9, type: 'equal', param1: { o_id: 7, param: 'y' }, param2: 'fillet_radius' },

    // add arc
    { id: 10, type: 'arc', start_id: 4, end_id: 1, radius: 1, start_angle: 1, end_angle: 1, c_id: 7 },
    { id: 11, type: 'arc_rules', a_id: 10 },
    { id: 12, type: 'equal', param1: { o_id: 10, param: 'radius' }, param2: 'fillet_radius' }
];


describe("gcs_wrapper", () => {
    beforeAll(async () => {
        gcs_factory = await PlanegcsWasm();
    });
    
    beforeEach(() => {
        const gcs = new gcs_factory.GcsSystem();
        gcs_wrapper = new GcsWrapper(gcs, new SketchIndex());
    });


    it("should fail an overconstrained sketch with dogleg", () => {
        gcs_wrapper.push_sketch_param('fillet_radius', 157);
        for (const obj of sketch_fillet_overconstrained) {
            gcs_wrapper.push_primitive(obj);
        }

        let console_output = "";
        const logSpy = vi.spyOn(global.console, 'log')
            .mockImplementation((msg) => { 
                console_output += msg;
            });
        const status = gcs_wrapper.solve(Algorithm.DogLeg);
        expect(status).toBe(SolveStatus.Failed);
        expect(console_output).toContain("Sketcher::RedundantSolving-DogLeg-");

        const conflicts = gcs_wrapper.get_gcs_conflicts();
        expect(conflicts).not.toHaveLength(0);

        logSpy.mockRestore();
    });

    it("should get and set debug mode", () => {
        gcs_wrapper.debug_mode = DebugMode.IterationLevel;
        expect(gcs_wrapper.debug_mode).toBe(DebugMode.IterationLevel);
    });

    it("should solve basic circle", () => {
        const circle_radius_sketch: SketchObject[] = [
            { id: 1, type: 'point', x: 10, y: 10, fixed: true },
            { id: 2, type: 'circle', c_id: 1, radius: 1},
            { id: 3, type: 'equal', param1: { o_id: 2, param: 'radius' }, param2: 100 }
        ];

        for (const obj of circle_radius_sketch) {
            gcs_wrapper.push_primitive(obj);
        }

        gcs_wrapper.solve();
        gcs_wrapper.apply_solution();

        const circle = gcs_wrapper.sketch_index.get_sketch_circle(2);
        expect(circle?.radius).toBe(100);
    });
});