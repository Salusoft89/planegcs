import { SketchPoint, oid, is_sketch_geometry, SketchLine, SketchCircle, SketchArc, SketchGeometry } from "./sketch_object";
import { Constraint } from "../dist/constraints";

export abstract class SketchIndexBase {
    abstract get_objects(): (Constraint|SketchGeometry)[];
    abstract get_object(id: oid): Constraint|SketchGeometry|undefined;
    abstract set_object(obj: Constraint|SketchGeometry): void;
    abstract delete_object(id: oid): boolean;
    abstract has(id: oid): boolean;

    get_object_or_fail(id: oid): Constraint|SketchGeometry {
        const obj = this.get_object(id);
        if (obj === undefined) {
            throw new Error(`sketch object ${id} not found`);
        }
        return obj;
    }

    get_sketch_point(id: oid): SketchPoint {
        const obj = this.get_object(id);
        if (obj.type !== 'point') {
            throw new Error(`sketch object ${id} is not a sketch point`);
        }
        return obj as SketchPoint;
    }
    get_sketch_line(id: oid): SketchLine {
        const obj = this.get_object(id);
        if (obj.type !== 'line') {
            throw new Error(`sketch object ${id} is not a sketch line`);
        }
        return obj as SketchLine;
    }
    get_sketch_circle(id: oid): SketchCircle {
        const obj = this.get_object(id);
        if (obj.type !== 'circle') {
            throw new Error(`sketch object ${id} is not a sketch circle`);
        }
        return obj as SketchCircle;
    }
    get_sketch_arc(id: oid): SketchArc {
        const obj = this.get_object(id);
        if (obj.type !== 'arc') {
            throw new Error(`sketch object ${id} is not a sketch arc`);
        }
        return obj as SketchArc;
    }
    get_constraints(): Constraint[] {
        return this.get_objects().filter(o => !is_sketch_geometry(o)) as Constraint[];
    }

    toString(): string {
        return this.get_objects().map(o => JSON.stringify(o)).join('\n');
    }
}

export class SketchIndex extends SketchIndexBase {
    index: Map<oid, Constraint|SketchGeometry> = new Map();

    has(id: oid): boolean {
        return this.index.has(id);
    }

    delete_object(id: oid): boolean {
        return this.index.delete(id);
    }

    set_object(obj: Constraint|SketchGeometry): void {
        this.index.set(obj.id, obj);
    }

    get_object(id: oid): Constraint|SketchGeometry|undefined {
        return this.index.get(id);
    }

    get_objects(): (Constraint|SketchGeometry)[] {
        return Array.from(this.index.values());
    }
}