export { GcsWrapper } from "./sketch/gcs_wrapper";
export { SketchIndexBase, SketchIndex } from "./sketch/sketch_index";

import ModuleFactory from "./dist/planegcs";
import { GcsWrapper } from "./sketch/gcs_wrapper"; 
import { SketchIndex, SketchIndexBase } from "./sketch/sketch_index";

export async function make_gcs_wrapper(sketch_index: SketchIndexBase = new SketchIndex()) { 
    const module = await ModuleFactory();
    const gcs = new module.GcsSystem();

    return new GcsWrapper(gcs, sketch_index);
}