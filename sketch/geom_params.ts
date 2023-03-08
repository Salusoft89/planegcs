// todo: change indexes, so radius/radmin is always at 0, start_angle at 1, end_angle at 2
// (keep 0 index unused for parabola)
const obj_params_offsets = {
    point: {
        x: 0,
        y: 1
    },
    circle: {
        radius: 0
    },
    arc: {
        start_angle: 0,
        end_angle: 1,
        radius: 2
    },
    ellipse: {
        radmin: 0,
    },
    arc_of_ellipse: {
        start_angle: 0,
        end_angle: 1,
        radmin: 2
    }
}

export default function getParamOffset(obj_type: string, param_name: string): number {
    const obj_params = obj_params_offsets[obj_type];
    if (obj_params) {
        const offset = obj_params[param_name];
        if (offset !== undefined) {
            return offset;
        }
    }
    throw new Error(`Unknown parameter ${param_name} for object type ${obj_type}`);
}