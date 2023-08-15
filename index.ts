export { Algorithm, SolveStatus, DebugMode, Constraint_Alignment } from "./planegcs_dist/gcs_system";
export { type ModuleStatic } from "./planegcs_dist/planegcs";
export { type SketchPrimitive, type SketchGeometry, type SketchParam,
         type SketchPoint, type SketchLine, type SketchCircle,
         type SketchArc, type SketchEllipse, type SketchArcOfEllipse,
        is_sketch_constraint, is_sketch_geometry, get_referenced_sketch_params } from "./sketch/sketch_primitive";
export { type Constraint } from "./planegcs_dist/constraints";
export { SketchIndex } from "./sketch/sketch_index";

import init_planegcs_module from "./planegcs_dist/planegcs";
export { init_planegcs_module };

import { GcsWrapper } from "./sketch/gcs_wrapper"; 
export { GcsWrapper };

export async function make_gcs_wrapper(wasm_path?: string) { 
    const module = await init_planegcs_module(
        wasm_path ? { locateFile: () => wasm_path } : undefined
    );
    const gcs = new module.GcsSystem();

    return new GcsWrapper(gcs);
}