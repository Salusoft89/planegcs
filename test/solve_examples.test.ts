// This library provides WebAssembly bindings for the FreeCAD's geometric solver library planegcs.
// Copyright (C) 2023  Miroslav Šerý, Salusoft89 <miroslav.sery@salusoft89.cz>  
// Copyright (C) 2024  Angelo Bartolome <angelo.m.bartolome@gmail.com>

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
import PlanegcsWasm from '../planegcs_dist/planegcs.js';
import { Algorithm, DebugMode, SolveStatus } from '../planegcs_dist/enums.js';
import type { ModuleStatic } from '../planegcs_dist/planegcs.js';
import { GcsWrapper } from '../sketch/gcs_wrapper.js';
import type { SketchPrimitive } from '../sketch/sketch_primitive.js';
import type { ArcRadius, CircleRadius, CoordinateX, CoordinateY, L2LAngle_LL, L2LAngle_PPPP, P2PAngle, P2PDistance } from '../planegcs_dist/constraints.js';

let gcs_factory: ModuleStatic;
let gcs_wrapper: GcsWrapper;

const sketch_fillet_overconstrained: SketchPrimitive[] = [
    { id: '1', type: 'point', x: 10, y: 10, fixed: false },
    // this is an extra constraint
    { id: '2', type: 'equal', param1: { o_id: '1', prop: 'x' }, param2: 'fillet_radius' },
    { id: '3', type: 'equal', param1: { o_id: '1', prop: 'y' }, param2: 0 },

    { id: '4', type: 'point', x: 10, y: 10, fixed: false },
    { id: '5', type: 'equal', param1: { o_id: '4', prop: 'x' }, param2: 0 },
    // this is also an extra constraint
    { id: '6', type: 'equal', param1: { o_id: '4', prop: 'y' }, param2: 'fillet_radius' },

    // add center point
    { id: '7', type: 'point', x: 10, y: 10, fixed: false },
    { id: '8', type: 'equal', param1: { o_id: '7', prop: 'x' }, param2: 'fillet_radius' },
    { id: '9', type: 'equal', param1: { o_id: '7', prop: 'y' }, param2: 'fillet_radius' },

    // add arc
    { id: '10', type: 'arc', start_id: '4', end_id: '1', radius: 1, start_angle: 1, end_angle: 1, c_id: '7' },
    { id: '11', type: 'arc_rules', a_id: '10' },
    { id: '12', type: 'equal', param1: { o_id: '10', prop: 'radius' }, param2: 'fillet_radius' }
];


describe("gcs_wrapper", () => {
    beforeAll(async () => {
        gcs_factory = await PlanegcsWasm();
    });
    
    beforeEach(() => {
        const gcs = new gcs_factory.GcsSystem();
        gcs_wrapper = new GcsWrapper(gcs);
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

        const conflicts = gcs_wrapper.get_gcs_conflicting_constraints();
        expect(conflicts).not.toHaveLength(0);

        logSpy.mockRestore();
    });

    it("should get and set debug mode", () => {
        gcs_wrapper.debug_mode = DebugMode.IterationLevel;
        expect(gcs_wrapper.debug_mode).toBe(DebugMode.IterationLevel);
    });

    it("should solve basic circle", () => {
        const circle_radius_sketch: SketchPrimitive[] = [
            { id: '1', type: 'point', x: 10, y: 10, fixed: true },
            { id: '2', type: 'circle', c_id: '1', radius: 1},
            { id: '3', type: 'equal', param1: { o_id: '2', prop: 'radius' }, param2: 100 }
        ];

        for (const obj of circle_radius_sketch) {
            gcs_wrapper.push_primitive(obj);
        }

        gcs_wrapper.solve();
        gcs_wrapper.apply_solution();

        const circle = gcs_wrapper.sketch_index.get_sketch_circle('2');
        expect(circle?.radius).toBe(100);
    });

    it("should solve and update l2l_angle_ll non-driving constraint", () => {
        const two_lines_45deg_sketch: SketchPrimitive[] = [
            // Line 1 (0,0 to 1,1) (45 degrees)
            { id: '1', type: 'point', x: 0, y: 0, fixed: true },
            { id: '2', type: 'point', x: 1, y: 1, fixed: true },
            { id: '3', type: 'line', p1_id: '1', p2_id: '2' },
            
            // Line 2 (0,0 to 1,0) (horizontal)
            { id: '4', type: 'point', x: 0, y: 0, fixed: true },
            { id: '5', type: 'point', x: 1, y: 0, fixed: true },
            { id: '6', type: 'line', p1_id: '4', p2_id: '5' },

            // Angle between the two lines
            {
                id: '7',
                type: "l2l_angle_ll",
                l1_id: '3',
                l2_id: '6',
                angle: 1,
                driving: false,
            }
        ];

        for (const obj of two_lines_45deg_sketch) {
            gcs_wrapper.push_primitive(obj);
        }

        gcs_wrapper.solve();
        gcs_wrapper.apply_solution();

        // get the angle between the two lines
        const updated_constraints = gcs_wrapper.sketch_index.get_constraints()
        const angle_constraint = updated_constraints.find(c => c.id === '7') as L2LAngle_LL;

        expect(angle_constraint.angle).toEqual(-Math.PI / 4);
    });

    it("should solve and update l2l_angle_pppp non-driving constraint", () => {
        const two_lines_45deg_sketch: SketchPrimitive[] = [
            // Line 1 (0,0 to 1,1) (45 degrees)
            { id: '1', type: 'point', x: 0, y: 0, fixed: true },
            { id: '2', type: 'point', x: 1, y: 1, fixed: true },
            { id: '3', type: 'line', p1_id: '1', p2_id: '2' },
            
            // Line 2 (0,0 to 1,0) (horizontal)
            { id: '4', type: 'point', x: 0, y: 0, fixed: true },
            { id: '5', type: 'point', x: 1, y: 0, fixed: true },
            { id: '6', type: 'line', p1_id: '4', p2_id: '5' },

            // Angle between the two lines
            {
                id: '7',
                type: "l2l_angle_pppp",
                l1p1_id: '1',
                l1p2_id: '2',
                l2p1_id: '4',
                l2p2_id: '5',
                angle: 1,
                driving: false,
            }
        ];

        for (const obj of two_lines_45deg_sketch) {
            gcs_wrapper.push_primitive(obj);
        }

        gcs_wrapper.solve();
        gcs_wrapper.apply_solution();

        // get the angle between the two lines
        const updated_constraints = gcs_wrapper.sketch_index.get_constraints()
        const angle_constraint = updated_constraints.find(c => c.id === '7') as L2LAngle_PPPP;

        expect(angle_constraint.angle).toEqual(-Math.PI / 4);
    });

    it("should solve and update coordinate_x non-driving constraint", () => {
        const line_with_constraint: SketchPrimitive[] = [
            { id: '1', type: 'point', x: 5, y: 5, fixed: true },
            { id: '2', type: 'point', x: 7, y: 7, fixed: true },
            { id: '3', type: 'line', p1_id: '1', p2_id: '2' },

            // Apply coordinate_x
            {
                id: '4',
                type: "coordinate_x",
                p_id: '1',
                x: 1, // Temporary value
                driving: false,
            }
        ];

        for (const obj of line_with_constraint) {
            gcs_wrapper.push_primitive(obj);
        }

        gcs_wrapper.solve();
        gcs_wrapper.apply_solution();

        // get the angle between the two lines
        const updated_constraints = gcs_wrapper.sketch_index.get_constraints()
        const coordinate_x_constraint = updated_constraints.find(c => c.id === '4') as CoordinateX;

        expect(coordinate_x_constraint.x).toEqual(5);
    });

    it("should solve and update coordinate_y non-driving constraint", () => {
        const line_with_constraint: SketchPrimitive[] = [
            { id: '1', type: 'point', x: 5, y: 7, fixed: true },
            { id: '2', type: 'point', x: 7, y: 7, fixed: true },
            { id: '3', type: 'line', p1_id: '1', p2_id: '2' },

            // Apply coordinate_y
            {
                id: '4',
                type: "coordinate_y",
                p_id: '1',
                y: 1, // Temporary value
                driving: false,
            }
        ];

        for (const obj of line_with_constraint) {
            gcs_wrapper.push_primitive(obj);
        }

        gcs_wrapper.solve();
        gcs_wrapper.apply_solution();

        // get the angle between the two lines
        const updated_constraints = gcs_wrapper.sketch_index.get_constraints()
        const coordinate_y_constraint = updated_constraints.find(c => c.id === '4') as CoordinateY;

        expect(coordinate_y_constraint.y).toEqual(7);
    });

    it("should solve and update p2p_angle non-driving constraint", () => {
        const sketch: SketchPrimitive[] = [
            { id: '1', type: 'point', x: 5, y: 5, fixed: true },
            { id: '2', type: 'point', x: 7, y: 7, fixed: true },

            // Apply p2p_angle
            {
                id: '3',
                type: "p2p_angle",
                p1_id: '1',
                p2_id: '2',
                angle: 1, // Temporary value
                driving: false,
            }
        ];

        for (const obj of sketch) {
            gcs_wrapper.push_primitive(obj);
        }

        gcs_wrapper.solve();
        gcs_wrapper.apply_solution();

        // get the angle between the two lines
        const updated_constraints = gcs_wrapper.sketch_index.get_constraints()
        const constraint = updated_constraints.find(c => c.id === '3') as P2PAngle;

        expect(constraint.angle).toEqual(Math.PI / 4);
    });

    it("should solve and update p2p_distance non-driving constraint", () => {
        const sketch: SketchPrimitive[] = [
            { id: '1', type: 'point', x: 0, y: 1, fixed: true },
            { id: '2', type: 'point', x: 0, y: 3, fixed: true },

            // Apply p2p_distance
            {
                id: '3',
                type: "p2p_distance",
                p1_id: '1',
                p2_id: '2',
                distance: 1, // Temporary value
                driving: false,
            }
        ];

        for (const obj of sketch) {
            gcs_wrapper.push_primitive(obj);
        }

        gcs_wrapper.solve();
        gcs_wrapper.apply_solution();

        // get the angle between the two lines
        const updated_constraints = gcs_wrapper.sketch_index.get_constraints()
        const constraint = updated_constraints.find(c => c.id === '3') as P2PDistance;

        expect(constraint.distance).toEqual(2);
    });

    it("should solve and update circle_radius non-driving constraint", () => {
        const sketch: SketchPrimitive[] = [
            { id: '1', type: 'point', x: 0, y: 0, fixed: true },
            { id: '2', type: 'circle', c_id: '1', radius: 4 },

            // Apply circle_radius
            {
                id: '3',
                type: "circle_radius",
                c_id: '2',
                radius: 1, // Temporary value
                driving: false,
            }
        ];

        for (const obj of sketch) {
            gcs_wrapper.push_primitive(obj);
        }

        gcs_wrapper.solve();
        gcs_wrapper.apply_solution();

        // get the angle between the two lines
        const updated_constraints = gcs_wrapper.sketch_index.get_constraints()
        const constraint = updated_constraints.find(c => c.id === '3') as CircleRadius;

        expect(constraint.radius).toEqual(4);
    });

    it("should solve and update arc_radius non-driving constraint", () => {
        const sketch: SketchPrimitive[] = [
            { id: '1', type: 'point', x: 0, y: 0, fixed: true },
            { id: '2', type: 'point', x: 4, y: 0, fixed: true },
            { id: '3', type: 'point', x: 2, y: 2, fixed: true },
            { id: '4', type: 'arc', c_id: '3', radius: 100, start_angle: 0, end_angle: Math.PI / 2, start_id: '1', end_id: '2' },
            { id: '5', type: 'arc_rules', a_id: '4'  },
            // Apply arc_radius
            {
                id: '6',
                type: "arc_radius",
                a_id: '4',
                radius: 1, // Temporary value
                driving: false,
            }
        ];

        for (const obj of sketch) {
            gcs_wrapper.push_primitive(obj);
        }

        gcs_wrapper.solve();
        gcs_wrapper.apply_solution();

        // get the angle between the two lines
        const updated_constraints = gcs_wrapper.sketch_index.get_constraints()
        const constraint = updated_constraints.find(c => c.id === '6') as ArcRadius;

        expect(constraint.radius).toBeCloseTo(2.83);
    });
});