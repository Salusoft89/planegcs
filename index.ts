export type { GcsWrapper } from "./sketch/gcs_wrapper";
export type { SketchIndex } from "./sketch/sketch_index";

import ModuleFactory from "./planegcs/bin/planegcs.js";
import { GcsWrapper } from "./sketch/gcs_wrapper";
import { SketchIndex } from "./sketch/sketch_index";

export async function make_gcs_wrapper() {
    var module = await ModuleFactory();
    var gcs = new module.GcsSystem();

    return new GcsWrapper(gcs, new SketchIndex());
}