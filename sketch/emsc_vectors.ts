import { DoubleVector, IntVector } from "../planegcs_dist/gcs_system";
import { ModuleStatic } from "../planegcs_dist/planegcs";

export function arr_to_intvec(gcs_module: ModuleStatic, arr: number[]): IntVector {
    const vec = new gcs_module.IntVector();
    for (const val of arr) {
        vec.push_back(val);
    }
    return vec;
}

export function arr_to_doublevec(gcs_module: ModuleStatic, arr: number[]): DoubleVector {
    const vec = new gcs_module.DoubleVector();
    for (const val of arr) {
        vec.push_back(val);
    }
    return vec;
}

export function emsc_vec_to_arr(vec: IntVector | DoubleVector): number[] {
    const result: number[] = [];
    for (let i = 0; i < vec.size(); ++i) {
        result.push(vec.get(i));
    }
    vec.delete();
    return result;
}