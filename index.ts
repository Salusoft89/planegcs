export { GcsWrapper } from "./sketch/gcs_wrapper";
export { SketchIndexBase, SketchIndex } from "./sketch/sketch_index";

import ModuleFactory from "./dist/planegcs";
import { GcsWrapper } from "./sketch/gcs_wrapper"; 
import type { SketchIndexBase } from "./sketch/sketch_index";

export async function make_gcs_wrapper<SI extends SketchIndexBase>(sketch_index: SI, wasm_path?: string) { 
    const module = await ModuleFactory(
        wasm_path ? { locateFile: () => wasm_path } : undefined
    );
    const gcs = new module.GcsSystem();

    return new GcsWrapper(gcs, sketch_index);
}