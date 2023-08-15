import { GcsSystemConstructor } from "../planegcs_dist/gcs_system";

export interface ModuleStatic {
    GcsSystem: GcsSystemConstructor;
}

export default function Module(config?: {locateFile: () => string}): Promise<ModuleStatic>;