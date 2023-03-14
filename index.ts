export { GcsWrapper } from "./sketch/gcs_wrapper";
export { SketchIndex } from "./sketch/sketch_index";

import ModuleFactory from "./planegcs/bin/planegcs.js";
import { GcsWrapper } from "./sketch/gcs_wrapper"; 
import { SketchIndex } from "./sketch/sketch_index";

export async function make_gcs_wrapper() { 
    const module = await ModuleFactory();
    const gcs = new module.GcsSystem(); 

    return new GcsWrapper(gcs, new SketchIndex());
}