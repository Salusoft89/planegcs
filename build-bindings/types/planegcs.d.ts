import { GcsSystemConstructor, DoubleVectorConstructor, IntVectorConstructor } from "../planegcs_dist/gcs_system";

export interface ModuleStatic {
    GcsSystem: GcsSystemConstructor;
    IntVector: IntVectorConstructor;
    DoubleVector: DoubleVectorConstructor;
}

export default function Module(config?: {locateFile: () => string}): Promise<ModuleStatic>;