import { Constraint } from "../planegcs/bin/constraints";
import { constraint_param_index } from "../planegcs/bin/constraint_param_index";
// import { type GcsSystem } from "../planegcs/bin/planegcs";
import { SketchIndex } from "./sketch_index";
import { is_sketch_geometry, oid, SketchArc, SketchCircle, SketchLine, SketchObject, SketchPoint } from "./sketch_object";
import type { GcsGeometry, GcsSystem } from "../planegcs/bin/gcs_system";

export class GcsWrapper {
    gcs: GcsSystem;
    param_index: Map<oid, number>; 
    sketch_index: SketchIndex;
    solved_sketch_index: SketchIndex;

    constructor(gcs: GcsSystem, sketch_index: SketchIndex, param_index = new Map()) {
        this.gcs = gcs;
        this.sketch_index = sketch_index;
        this.param_index = param_index;
    }

    destructor() {
        console.log('gcs_wrapper destructor called, deleting the gcs object');
        this.gcs.delete();
    }

    // ------ Sketch -> GCS ------- (when building up a sketch)

    push_object(o: SketchObject) {
        if (o.type === 'point') {
            this.push_point(o);
        } else if (o.type === 'line') {
            this.push_line(o);
        } else if (o.type === 'circle') {
            this.push_circle(o);
        } else if (o.type === 'arc') {
            this.push_arc(o);
        } else {
            // todo: better check
            this.push_constraint(o);
        }

        if (this.sketch_index.has(o.id)) {
            throw new Error(`object with id ${o.id} already exists`);
        }

        this.sketch_index.set_object(o);

        // todo: handle the id better
        // if (o.type === 'arc') {
        //     this.push_constraint({
        //         type: 'arc_rules',
        //         a_id: o.id,
        //         id: 100000
        //     });
        // }
    }

    solve() {
        const status = this.gcs.solve_system();
        // console.log(`gcs dof: ${this.gcs.dof()}`);
        if (this.gcs.has_conflicting()) {
            console.log(`gcs has conflicts: ${this.get_gcs_conflicts().join(', ')}`);
        }
        if (this.gcs.has_redundant()) {
            console.log(`gcs has redundant`);
        }
        // todo: add error enums and status handling
        if (status != 0) {
            throw new Error(`gcs status: ${status}`);
        }

        this.gcs.apply_solution();
        this.solved_sketch_index = new SketchIndex();
        for (const [_, obj] of this.sketch_index.index) {
            this.pull_object(obj);
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

    private push_params(id: oid, values: number[], fixed: boolean = false): number {
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

        const start_angle = Math.atan2(start.y - center.y, start.x - center.x) - 2 * Math.PI;
        const end_angle = Math.atan2(end.y - center.y, end.x - center.x);
        const radius = Math.sqrt((start.x - center.x) ** 2 + (start.y - center.y) ** 2);

        this.push_params(a.id, [start_angle, end_angle, radius], false);
    }

    sketch_object_to_gcs(o: SketchObject) : GcsGeometry {
        if (o.type === 'point') {
            const p_i = this.get_obj_addr(o.id);
            return this.gcs.make_point(p_i, p_i + 1);
        } else if (o.type === 'line') {
            const p1_i = this.get_obj_addr(o.p1_id);
            const p2_i = this.get_obj_addr(o.p2_id);
            return this.gcs.make_line(p1_i, p1_i + 1, p2_i, p2_i + 1);
        } else if (o.type === 'circle') {
            const cp_i = this.get_obj_addr(o.c_id);
            const radius_i = this.get_obj_addr(o.id);
            return this.gcs.make_circle(cp_i, cp_i + 1, radius_i);
        } else if (o.type === 'arc') {
            const c_i = this.get_obj_addr(o.c_id);
            const start_i = this.get_obj_addr(o.start_id);
            const end_i = this.get_obj_addr(o.end_id);
            const a_i = this.get_obj_addr(o.id);
            return this.gcs.make_arc(c_i, c_i + 1, start_i, start_i + 1, end_i, end_i + 1, a_i, a_i + 1, a_i + 2);
        } else {
            throw new Error(`not-implemented object type: ${o.type}`);
        }
    }

    // is_extra => tag = -1
    // todo: do the parameters really match (order)..?
    push_constraint(c: Constraint, is_extra = false) {
        const add_constraint_args: any[] = [];
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
            const val = c[parameter];
            
            if (type === 'object_param_or_number') {
                if (typeof val === 'number') {
                    const pos = this.push_params(c.id, [val], true);
                    add_constraint_args.push(pos);
                } else if ('o_id' in val && 'o_i' in val) {
                    const param_addr = this.get_obj_addr(val['o_id']) + val['o_i'];
                    add_constraint_args.push(param_addr);
                } else {
                    throw new Error(`couldn't parse object param: ${parameter} in constraint ${c.type}: invalid value ${JSON.stringify(val)}`);
                }
            } else if (type === 'object_id') {
                const obj = this.sketch_index.get_object(val);
                const gcs_obj = this.sketch_object_to_gcs(obj);
                add_constraint_args.push(gcs_obj);
                deletable.push(gcs_obj);
            } else if (type === 'primitive') {
                const pos = this.push_params(c.id, [val], true);
                add_constraint_args.push(pos);
            } else {
                throw new Error(`unhandled parameter type: ${type}`);
            }
        }
        // use the object_id as the tag parameter (or use -1 for extra constraints)
        add_constraint_args.push(is_extra ? -1 : c.id);
        const c_name: string = c.type;
        this.gcs[`add_constraint_${c_name}`](...add_constraint_args);

        // wasm-allocated object must be manually deleted 
        for (const geom_shape of deletable) {
            geom_shape.delete();
        }
    }

    // id can be -1 for extra constraints
    delete_constraint_by_id(id: number) {
        if (id !== -1) {
            const item = this.sketch_index.get_object(id);
            if (!is_sketch_geometry(item)) {
                throw new Error(`object #${id} (${item.type}) is not a constraint (delete_constraint_by_id)`);
            }
        }

        this.sketch_index.index.delete(id);
        this.gcs.clear_by_id(id);
    }

    private get_obj_addr(id: oid): number {
        const addr = this.param_index.get(id);
        if (addr === undefined) {
            throw new Error(`sketch object ${id} not found in params`);
        }
        return addr;
    }

    // ------- GCS -> Sketch ------- (when retrieving a solution)

    private pull_object(o: SketchObject) {
        if (this.solved_sketch_index.has(o.id)) {
            return;
        }

        if (this.param_index.has(o.id)) {
            if (o.type === 'point') {
                this.pull_point(o);
            } else if (o.type === 'line') {
                this.pull_line(o);
            } else if (o.type === 'arc') {
                this.pull_arc(o);
            } else if (o.type === 'circle') {
                this.pull_circle(o);
            } else {
                // console.log(`${o.type}`);
                this.solved_sketch_index.set_object(o);
            }
        } else {
            // console.log(`object ${o.type} #${o.id} not found in params when retrieving solution`);
            this.solved_sketch_index.set_object(o);
        }
    }

    private pull_point(p: SketchPoint) {
        const point_addr = this.get_obj_addr(p.id);
        const point = {
            ...p,
            x: this.gcs.get_param(point_addr),
            y: this.gcs.get_param(point_addr + 1),
        }
        this.solved_sketch_index.set_object(point);
    }

    private pull_line(l: SketchLine) {
        const p1 = this.sketch_index.get_sketch_point(l.p1_id);
        const p2 = this.sketch_index.get_sketch_point(l.p2_id);
        this.pull_object(p1);
        this.pull_object(p2);

        this.solved_sketch_index.set_object(l);
    }

    private pull_arc(a: SketchArc) {
        const center = this.sketch_index.get_sketch_point(a.c_id);
        const start = this.sketch_index.get_sketch_point(a.start_id);
        const end = this.sketch_index.get_sketch_point(a.end_id);
        this.pull_object(center);
        this.pull_object(start);
        this.pull_object(end);

        const addr = this.get_obj_addr(a.id);
        const start_angle = this.gcs.get_param(addr);
        const end_angle = this.gcs.get_param(addr + 1);
        const angle = end_angle - start_angle;
        
        this.solved_sketch_index.set_object({
            ...a,
            angle
        });
    }

    private pull_circle(c: SketchCircle) {
        const center = this.sketch_index.get_sketch_point(c.c_id);
        this.pull_object(center);

        const radius = this.get_obj_addr(c.id);
        this.solved_sketch_index.set_object({
            ...c,
            radius
        });
    }
}