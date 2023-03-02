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
    }
}

export default function getParamOffset(obj_type: string, param_name: string) {
    const obj_params = obj_params_offsets[obj_type];
    if (obj_params) {
        const offset = obj_params[param_name];
        if (offset !== undefined) {
            return offset;
        }
    }
    throw new Error(`Unknown parameter ${param_name} for object type ${obj_type}`);
}