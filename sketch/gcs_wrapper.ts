import { Constraint } from "../planegcs/bin/constraints";
import { GcsSystem } from "../planegcs/bin/planegcs";
import { SketchIndex } from "./sketch_index";
import { oid, SketchArc, SketchCircle, SketchLine, SketchPoint } from "./sketch_object";

export class GcsWrapper {
    gcs: GcsSystem;
    param_index: Map<oid, number> = new Map();
    sketch_index: SketchIndex;

    constructor(gcs: GcsSystem, sketch_index: SketchIndex) {
        this.gcs = gcs;
        this.sketch_index = sketch_index;
    }

    setup_constraint(c: Constraint) {
        const params: number[] = [];

        for (const parameter of Object.keys(c)) {
            const id_param = parameter.match(/^([aclop])([0-9]*)_id$/);
            if (id_param !== null) {
                const o_type = id_param[1];
                const o_id: number = c[parameter];

                if (o_type === 'a') {
                    const arc = this.sketch_index.get_sketch_arc(o_id);
                    params.push(...this.arc_params(arc));
                } else if (o_type === 'c') {
                    const circle = this.sketch_index.get_sketch_circle(o_id);
                    params.push(...this.circle_params(circle));
                } else if (o_type === 'l') {
                    const line = this.sketch_index.get_sketch_line(o_id);
                    params.push(...this.line_params(line));
                } else if (o_type === 'o') {
                    const o_number = id_param[2];
                    const o_i: number = c[`o${o_number}_i`];
                    const i = this.get_obj_param(o_id) + o_i;
                    params.push(i);
                } else if (o_type === 'p') {
                    const point = this.sketch_index.get_sketch_point(o_id);
                    params.push(...this.point_params(point));
                }
            } else if (!parameter.match(/(id|type|_i$)/)) {
                const value = c[parameter];
                const i = this.push_param(c.id, value, true);
                params.push(i);
            }
        }
        params.push(c.id);
        const c_name: string = c.type;
        this.gcs[`add_constraint_${c_name}`](...params);
    }


    // returns the index of the newly added parameter
    push_param(id: oid, value: number, fixed: boolean = false): number {
        const pos = this.gcs.params_size();
        this.gcs.push_param(value, fixed);

        this.param_index.set(id, pos);
        return pos;
    }

    // helper functions to get the params (for calling the methods of planegcs)
    // get the object's first parameter 
    private get_obj_param(id: oid): number {
        const param = this.param_index.get(id);
        if (param === undefined) {
            throw new Error(`sketch object ${id} not found in params`);
        }
        return param;
    }
    private arc_params(a: SketchArc) {
        const c_i = this.get_obj_param(a.c_id);
        const start_i = this.get_obj_param(a.start_id);
        const end_i = this.get_obj_param(a.end_id);
        const a_i = this.get_obj_param(a.id);
        return [c_i, c_i + 1, start_i, start_i + 1, end_i, end_i + 1, a_i, a_i + 1, a_i + 2];
    }

    private circle_params(c: SketchCircle) {
        const cp_i = this.get_obj_param(c.c_id);
        const radius_i = this.get_obj_param(c.id);
        return [cp_i, cp_i + 1, radius_i];
    }

    private line_params(l: SketchLine) {
        const p1_i = this.get_obj_param(l.p1_id);
        const p2_i = this.get_obj_param(l.p2_id);
        return [p1_i, p1_i + 1, p2_i, p2_i + 1];
    }

    private point_params(p: SketchPoint) {
        const p_i = this.get_obj_param(p.id);
        return [p_i, p_i + 1];
    }
}