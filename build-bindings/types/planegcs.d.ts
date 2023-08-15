import { GcsSystemConstructor } from "../planegcs_distgcs_system";

export interface ModuleStatic {
    GcsSystem: GcsSystemConstructor;
}

export default function Module(config?: {locateFile: () => string}): Promise<ModuleStatic>;