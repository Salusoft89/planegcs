import { Constraint } from "../planegcs/bin/constraints";
import { GcsSystem } from "../planegcs/bin/planegcs";
import { SketchIndex } from "./sketch_index";
import { oid, SketchArc, SketchCircle, SketchLine, SketchObject, SketchPoint } from "./sketch_object";
import { Line, Point } from '@mathigon/euclid';

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
    }

    solve() {
        const status = this.gcs.solve_system();
        console.log(`gcs status: ${status}`);
        console.log(`gcs dof: ${this.gcs.dof()}`);
        console.log(`gcs has_conflicting: ${this.gcs.has_conflicting()}`);

        if (this.gcs.has_conflicting()) {
            const conflicting = this.gcs.get_conflicting();
            const ids: number[] = [];
            for (let i = 0; i < conflicting.size(); ++i) {
                ids.push(conflicting.get(i));
            }
            conflicting.delete();
            console.log(`gcs conflicts: ${ids.join(', ')}`);
        }
        console.log(`gcs has_redundant: ${this.gcs.has_redundant()}`);

        // todo: add error status handling
        if (status != 0) {
            throw new Error(`gcs status: ${status}`);
        }

        this.gcs.apply_solution();
        this.solved_sketch_index = new SketchIndex();
        for (const obj of Object.values(this.sketch_index.index)) {
            this.pull_object(obj);
        }
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
        this.sketch_index.set_object(p);
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
        
        const center_p = new Point(center.x, center.y);
        const start_p = new Point(start.x, start.y);
        const end_p = new Point(end.x, end.y);
        const start_angle = new Line(center_p, start_p).angle - 2 * Math.PI;
        const end_angle = new Line(center_p, end_p).angle;
        const radius = Point.distance(start_p, center_p);

        this.push_params(a.id, [start_angle, end_angle, radius], false);
    }

    private push_constraint(c: Constraint) {
        function arc_params(a: SketchArc) {
            const c_i = this.get_obj_param(a.c_id);
            const start_i = this.get_obj_param(a.start_id);
            const end_i = this.get_obj_param(a.end_id);
            const a_i = this.get_obj_param(a.id);
            return [c_i, c_i + 1, start_i, start_i + 1, end_i, end_i + 1, a_i, a_i + 1, a_i + 2];
        }
        function circle_params(c: SketchCircle) {
            const cp_i = this.get_obj_param(c.c_id);
            const radius_i = this.get_obj_param(c.id);
            return [cp_i, cp_i + 1, radius_i];
        }
        function line_params(l: SketchLine) {
            const p1_i = this.get_obj_param(l.p1_id);
            const p2_i = this.get_obj_param(l.p2_id);
            return [p1_i, p1_i + 1, p2_i, p2_i + 1];
        }
        function point_params(p: SketchPoint) {
            const p_i = this.get_obj_param(p.id);
            return [p_i, p_i + 1];
        }
        const params: number[] = [];

        for (const parameter of Object.keys(c)) {
            const id_param = parameter.match(/^([aclop])([0-9]*)_id$/);
            if (id_param !== null) {
                const o_type = id_param[1];
                const o_id: number = c[parameter];

                if (o_type === 'a') {
                    const arc = this.sketch_index.get_sketch_arc(o_id);
                    params.push(...arc_params(arc));
                } else if (o_type === 'c') {
                    const circle = this.sketch_index.get_sketch_circle(o_id);
                    params.push(...circle_params(circle));
                } else if (o_type === 'l') {
                    const line = this.sketch_index.get_sketch_line(o_id);
                    params.push(...line_params(line));
                } else if (o_type === 'o') {
                    const o_number = id_param[2];
                    const param_offset: number = c[`o${o_number}_i`];
                    const param_addr = this.get_obj_addr(o_id) + param_offset;
                    params.push(param_addr);
                } else if (o_type === 'p') {
                    const point = this.sketch_index.get_sketch_point(o_id);
                    params.push(...point_params(point));
                }
            } else if (!parameter.match(/(id|type|_i$)/)) {
                const value = c[parameter];
                const i = this.push_params(c.id, [value], true);
                params.push(i);
            }
        }
        params.push(c.id);
        const c_name: string = c.type;
        this.gcs[`add_constraint_${c_name}`](...params);
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
            console.log(`object ${o.type} #${o.id} not found in params when retrieving solution`);
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