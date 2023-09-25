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

import type { Constraint, ConstraintParamType } from "../planegcs_dist/constraints";
import { constraint_param_index } from "../planegcs_dist/constraint_param_index.js";
import { SketchIndex } from "./sketch_index.js";
import type { oid, SketchArc, SketchArcOfEllipse, SketchCircle, SketchEllipse, SketchLine, SketchPrimitive, SketchPoint, SketchParam } from "./sketch_primitive";
import { is_sketch_geometry } from "./sketch_primitive.js";
import { Algorithm, Constraint_Alignment, SolveStatus, type GcsGeometry, type GcsSystem, DebugMode, } from "../planegcs_dist/gcs_system.js";
import get_property_offset, { property_offsets } from "./geom_params.js";

export class GcsWrapper { 
    gcs: GcsSystem;
    param_index: Map<oid, number> = new Map();
    sketch_index = new SketchIndex();
    private sketch_param_index: Map<string, number> = new Map(); // param key -> index in gcs params

    get debug_mode(): DebugMode {
        return this.gcs.get_debug_mode();
    }

    set debug_mode(mode: DebugMode) {
        this.gcs.set_debug_mode(mode);
    }

    constructor(gcs: GcsSystem) {
        this.gcs = gcs;
    }

    destroy_gcs_module() {
        // only call before the deleting of this object
        this.gcs.clear_data();
        this.gcs.delete();
    }

    clear_data() {
        this.gcs.clear_data();
        this.param_index.clear();
        this.sketch_param_index.clear();
        this.sketch_index.clear();
    }
 
    // ------ Sketch -> GCS ------- (when building up a sketch)

    push_primitive(o: SketchPrimitive) {
        switch (o.type) {
            case 'point':
                this.push_point(o);
                break;
            case 'line':
                this.push_line(o);
                break;
            case 'circle':
                this.push_circle(o);
                break;
            case 'arc':
                this.push_arc(o);
                break;
            case 'ellipse':
                this.push_ellipse(o);
                break;
            case 'arc_of_ellipse':
                this.push_arc_of_ellipse(o);
                break;
            default:
                this.push_constraint(o);
        }

        if (this.sketch_index.has(o.id)) {
            throw new Error(`object with id ${o.id} already exists`);
        }

        this.sketch_index.set_primitive(o);
    }

    push_primitives_and_params(objects: (SketchPrimitive | SketchParam)[]) {
        for (const o of objects) {
            if (o.type === 'param') {
                this.push_sketch_param(o.name, o.value);
            } else {
                this.push_primitive(o);
            }
        }
    }

    solve(algorithm: Algorithm = Algorithm.DogLeg): SolveStatus {
        return this.gcs.solve_system(algorithm);
    }

    apply_solution() {
        this.gcs.apply_solution();
        for (const obj of this.sketch_index.get_primitives()) {
            this.pull_primitive(obj);
        }
    }

    get_gcs_params(): number[] {
        const params = this.gcs.get_params();
        const result: number[] = [];
        for (let i = 0; i < params.size(); ++i) {
            result.push(params.get(i));
        }
        params.delete();
        return result;
    }

    get_gcs_conflicts(): number[] {
        const conflicts = this.gcs.get_conflicting();
        const result: number[] = [];
        for (let i = 0; i < conflicts.size(); ++i) {
            result.push(conflicts.get(i));
        }
        conflicts.delete();
        return result;
    }

    push_sketch_param(name: string, value: number): number {
        const pos = this.gcs.params_size();
        this.gcs.push_param(value, true);
        this.sketch_param_index.set(name, pos);
        return pos;
    }

    set_sketch_param(name: string, value: number) {
        const pos = this.sketch_param_index.get(name);
        if (pos === undefined) {
            throw new Error(`sketch param ${name} not found`);
        }
        this.gcs.set_param(pos, value, true);
    }

    get_sketch_param_value(name: string): number | undefined {
        const pos = this.sketch_param_index.get(name);
        return pos === undefined ? undefined : this.gcs.get_param(pos);
    }

    get_sketch_param_values(): Map<string, number> {
        const result = new Map<string, number>();
        for (const [name, pos] of this.sketch_param_index) {
            result.set(name, this.gcs.get_param(pos));
        }
        return result;
    }

    private push_params(id: oid, values: number[], fixed = false): number {
        const pos = this.gcs.params_size();
        for (const value of values) {
            this.gcs.push_param(value, fixed);
        }

        this.param_index.set(id, pos);
        return pos;
    }

    private push_point(p: SketchPoint) {
        if (this.param_index.has(p.id)) {
            return;
        }

        this.push_params(p.id, [p.x, p.y], p.fixed);
    }

    private push_line(l: SketchLine) {
        const p1 = this.sketch_index.get_sketch_point(l.p1_id);
        const p2 = this.sketch_index.get_sketch_point(l.p2_id);
        this.push_point(p1);
        this.push_point(p2);
    }

    private push_circle(c: SketchCircle) {
        const p = this.sketch_index.get_sketch_point(c.c_id);
        this.push_point(p);

        this.push_params(c.id, [c.radius], false);
    }

    private push_arc(a: SketchArc) {
        const center = this.sketch_index.get_sketch_point(a.c_id);
        this.push_point(center);
        
        const start = this.sketch_index.get_sketch_point(a.start_id);
        this.push_point(start);
        
        const end = this.sketch_index.get_sketch_point(a.end_id);
        this.push_point(end);

        this.push_params(a.id, [a.start_angle, a.end_angle, a.radius], false);
    }

    private push_ellipse(e: SketchEllipse) {
        const center = this.sketch_index.get_sketch_point(e.c_id);
        this.push_point(center);

        const focus1 = this.sketch_index.get_sketch_point(e.focus1_id);
        this.push_point(focus1);

        this.push_params(e.id, [e.radmin], false);
    }

    private push_arc_of_ellipse(ae: SketchArcOfEllipse) {
        const center = this.sketch_index.get_sketch_point(ae.c_id);
        this.push_point(center);

        const focus1 = this.sketch_index.get_sketch_point(ae.focus1_id);
        this.push_point(focus1);

        const start = this.sketch_index.get_sketch_point(ae.start_id);
        this.push_point(start);

        const end = this.sketch_index.get_sketch_point(ae.end_id);
        this.push_point(end);

        this.push_params(ae.id, [ae.start_angle, ae.end_angle, ae.radmin], false);
    }

    private sketch_primitive_to_gcs(o: SketchPrimitive) : GcsGeometry {
        switch (o.type) {
            case 'point': {
                const p_i = this.get_primitive_addr(o.id);
                return this.gcs.make_point(
                    p_i + property_offsets.point.x, p_i + property_offsets.point.y
                );
            }
            case 'line': {
                const p1_i = this.get_primitive_addr(o.p1_id);
                const p2_i = this.get_primitive_addr(o.p2_id);
                return this.gcs.make_line(
                    p1_i + property_offsets.point.x, p1_i + property_offsets.point.y,
                    p2_i + property_offsets.point.x, p2_i + property_offsets.point.y
                );
            }
            case 'circle': {
                const cp_i = this.get_primitive_addr(o.c_id);
                const circle_i = this.get_primitive_addr(o.id);
                return this.gcs.make_circle(
                    cp_i + property_offsets.point.x, cp_i + property_offsets.point.y,
                    circle_i + property_offsets.circle.radius);
            }
            case 'arc': {
                const c_i = this.get_primitive_addr(o.c_id);
                const start_i = this.get_primitive_addr(o.start_id);
                const end_i = this.get_primitive_addr(o.end_id);
                const a_i = this.get_primitive_addr(o.id);
                return this.gcs.make_arc(
                    c_i + property_offsets.point.x, c_i + property_offsets.point.y, 
                    start_i + property_offsets.point.x, start_i + property_offsets.point.y, 
                    end_i + property_offsets.point.x, end_i + property_offsets.point.y, 
                    a_i + property_offsets.arc.start_angle, a_i + property_offsets.arc.end_angle, a_i + property_offsets.arc.radius);
            }
            case 'ellipse': {
                const c_i = this.get_primitive_addr(o.c_id);
                const focus1_i = this.get_primitive_addr(o.focus1_id);
                const radmin_i = this.get_primitive_addr(o.id);
                return this.gcs.make_ellipse(
                    c_i + property_offsets.point.x, c_i + property_offsets.point.y,
                    focus1_i + property_offsets.point.x, focus1_i + property_offsets.point.y,
                    radmin_i + property_offsets.ellipse.radmin
                );
            }
            case 'arc_of_ellipse': {
                const c_i = this.get_primitive_addr(o.c_id);
                const focus1_i = this.get_primitive_addr(o.focus1_id);
                const start_i = this.get_primitive_addr(o.start_id);
                const end_i = this.get_primitive_addr(o.end_id);
                const a_i = this.get_primitive_addr(o.id);
                return this.gcs.make_arc_of_ellipse(
                    c_i + property_offsets.point.x, c_i + property_offsets.point.y,
                    focus1_i + property_offsets.point.x, focus1_i + property_offsets.point.y,
                    start_i + property_offsets.point.x, start_i + property_offsets.point.y,
                    end_i + property_offsets.point.x, end_i + property_offsets.point.y,
                    a_i + property_offsets.arc_of_ellipse.start_angle, a_i + property_offsets.arc_of_ellipse.end_angle, a_i + property_offsets.arc_of_ellipse.radmin
                );
            }
            default:
                throw new Error(`not-implemented object type: ${o.type}`);
            }
    }

    push_constraint(c: Constraint) {
        const add_constraint_args: (string|number|boolean|GcsGeometry)[] = [];
        const deletable: GcsGeometry[] = [];

        const constraint_params = constraint_param_index[c.type];
        if (constraint_params === undefined) {
            throw new Error(`unknown constraint type: ${c.type}`);
        }

        for (const parameter of Object.keys(constraint_params)) {
            const type = constraint_params[parameter];
            if (type === undefined) {
                throw new Error(`unknown parameter type: ${type} in constraint ${c.type}`);
            }

            // parameters with default values
            if (parameter === 'tagId') {
                add_constraint_args.push(c.temporary === true ? -1 : c.id);
                continue;
            }
            if (parameter === 'driving') {
                // add the driving? value (true by default)
                add_constraint_args.push(c.driving ?? true);
                continue;
            }
            if (parameter === 'internalalignment' && c.type === 'equal') {
                add_constraint_args.push(c.internalalignment ?? Constraint_Alignment.NoInternalAlignment);
                continue;
            }

            const val = (c as any)[parameter] as ConstraintParamType;
            const is_fixed = (c.driving ?? true);
            
            if (type === 'object_param_or_number') { // or string
                if (typeof val === 'number') {
                    // todo: add to some index (probably after adding named indexes)
                    const pos = this.push_params(c.id, [val], is_fixed);
                    add_constraint_args.push(pos);
                } else if (typeof val === 'string') {
                    // this is a sketch param
                    const param_addr = this.sketch_param_index.get(val);
                    if (param_addr === undefined) {
                        throw new Error(`couldn't parse object param: ${parameter} in constraint ${c.type}: unknown param ${val}`);
                    }
                    add_constraint_args.push(param_addr);
                } else if (typeof val === 'boolean') {
                    add_constraint_args.push(val);
                } else if (val !== undefined) {
                    const ref_primitive = this.sketch_index.get_primitive_or_fail(val.o_id);
                    if (!is_sketch_geometry(ref_primitive)) {
                        throw new Error(`Primitive #${val.o_id} (${ref_primitive.type}) is not supported to be referenced from a constraint.`);
                    }
                    const param_addr = this.get_primitive_addr(val.o_id) + get_property_offset(ref_primitive.type, val.prop);
                    add_constraint_args.push(param_addr);
                }
            } else if (type === 'object_id' && typeof val === 'number') {
                const obj = this.sketch_index.get_primitive_or_fail(val);
                const gcs_obj = this.sketch_primitive_to_gcs(obj);
                add_constraint_args.push(gcs_obj);
                deletable.push(gcs_obj);
            } else if (type === 'primitive_type' && typeof val === 'number') {
                // todo: add to some index (same as above)
                const pos = this.push_params(c.id, [val], is_fixed); // ? is this correct (driving <=> fixed)? 
                add_constraint_args.push(pos);
            } else if (type === 'primitive_type' && typeof val === 'boolean') {
                add_constraint_args.push(val);
            } else {
                throw new Error(`unhandled parameter ${parameter} type: ${type}`);
            }
        }

        const c_name: string = c.type;
        (this.gcs as any)[`add_constraint_${c_name}`](...add_constraint_args, c.scale ?? 1);

        // wasm-allocated objects must be manually deleted 
        for (const geom_shape of deletable) {
            geom_shape.delete();
        }
    }

    // id can be -1 for extra constraints
    delete_constraint_by_id(id: number): boolean {
        if (id !== -1) {
            const item = this.sketch_index.get_primitive(id);
            if (item !== undefined && !is_sketch_geometry(item)) {
                throw new Error(`object #${id} (${item.type}) is not a constraint (delete_constraint_by_id)`);
            }
        }

        this.gcs.clear_by_id(id);
        return this.sketch_index.delete_primitive(id);
    }

    private get_primitive_addr(id: oid): number {
        const addr = this.param_index.get(id);
        if (addr === undefined) {
            throw new Error(`sketch object ${id} not found in params`);
        }
        return addr;
    }

    // ------- GCS -> Sketch ------- (when retrieving a solution)

    private pull_primitive(p: SketchPrimitive) {
        if (this.param_index.has(p.id)) {
            if (p.type === 'point') {
                this.pull_point(p);
            } else if (p.type === 'line') {
                this.pull_line(p);
            } else if (p.type === 'arc') {
                this.pull_arc(p);
            } else if (p.type === 'circle') {
                this.pull_circle(p);
            } else if (p.type === 'ellipse') {
                this.pull_ellipse(p);
            } else if (p.type === 'arc_of_ellipse') {
                this.pull_arc_of_ellipse(p);
            } else {
                // console.log(`${o.type}`);
                // todo: is this else branch necessary?
                this.sketch_index.set_primitive(p);
            }
        } else {
            // console.log(`object ${o.type} #${o.id} not found in params when retrieving solution`);
            this.sketch_index.set_primitive(p);
        }
    }

    private pull_point(p: SketchPoint) {
        const point_addr = this.get_primitive_addr(p.id);
        const point = {
            ...p,
            x: this.gcs.get_param(point_addr + property_offsets.point.x),
            y: this.gcs.get_param(point_addr + property_offsets.point.y),
        }
        this.sketch_index.set_primitive(point);
    }

    private pull_line(l: SketchLine) {
        this.sketch_index.set_primitive(l);
    }

    private pull_arc(a: SketchArc) {
        const addr = this.get_primitive_addr(a.id);
        this.sketch_index.set_primitive({
            ...a,
            start_angle: this.gcs.get_param(addr + property_offsets.arc.start_angle),
            end_angle: this.gcs.get_param(addr + property_offsets.arc.end_angle),
            radius: this.gcs.get_param(addr + property_offsets.arc.radius)
        });
    }

    private pull_circle(c: SketchCircle) {
        const addr = this.get_primitive_addr(c.id);

        this.sketch_index.set_primitive({
            ...c,
            radius: this.gcs.get_param(addr + property_offsets.circle.radius)
        });
    }

    private pull_ellipse(e: SketchEllipse) {
        const addr = this.get_primitive_addr(e.id);

        this.sketch_index.set_primitive({
            ...e,
            radmin: this.gcs.get_param(addr + property_offsets.ellipse.radmin),
        });
    }

    private pull_arc_of_ellipse(ae: SketchArcOfEllipse) {
        const addr = this.get_primitive_addr(ae.id);

        this.sketch_index.set_primitive({
            ...ae,
            start_angle: this.gcs.get_param(addr + property_offsets.arc_of_ellipse.start_angle),
            end_angle: this.gcs.get_param(addr + property_offsets.arc_of_ellipse.end_angle),
            radmin: this.gcs.get_param(addr + property_offsets.arc_of_ellipse.radmin),
        });
    }
}