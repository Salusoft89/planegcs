export { GcsWrapper } from "./sketch/gcs_wrapper";
export { Algorithm, SolveStatus, DebugMode, Constraint_Alignment } from "./dist/gcs_system";

import ModuleFactory from "./dist/planegcs";
import { GcsWrapper } from "./sketch/gcs_wrapper"; 

export async function make_gcs_wrapper(wasm_path?: string) { 
    const module = await ModuleFactory(
        wasm_path ? { locateFile: () => wasm_path } : undefined
    );
    const gcs = new module.GcsSystem();

    return new GcsWrapper(gcs);
}