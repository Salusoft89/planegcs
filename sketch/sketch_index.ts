// This library provides WebAssembly bindings for the FreeCAD's geometric solver library planegcs.
// Copyright (C) 2023  Miroslav Šerý, Salusoft89 <miroslav.sery@salusoft89.cz>  

// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 2.1 of the License, or (at your option) any later version.

// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.

// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA

import type { SketchPoint, oid, SketchLine, SketchCircle, SketchArc, SketchPrimitive } from "./sketch_primitive";
import { is_sketch_geometry } from "./sketch_primitive.js";
import type { Constraint } from "../planegcs_dist/constraints";

export abstract class SketchIndexBase {
    abstract get_primitives(): SketchPrimitive[];
    abstract get_primitive(id: oid): SketchPrimitive|undefined;
    abstract set_primitive(obj: SketchPrimitive): void;
    abstract delete_primitive(id: oid): boolean;
    abstract clear(): void;
    abstract has(id: oid): boolean;

    get_primitive_or_fail(id: oid): SketchPrimitive {
        const obj = this.get_primitive(id);
        if (obj === undefined) {
            throw new Error(`sketch object ${id} not found`);
        }
        return obj;
    }
    get_sketch_point(id: oid): SketchPoint {
        const obj = this.get_primitive_or_fail(id);
        if (obj.type !== 'point') {
            throw new Error(`sketch object ${id} is not a sketch point`);
        }
        return obj as SketchPoint;
    }
    get_sketch_line(id: oid): SketchLine {
        const obj = this.get_primitive_or_fail(id);
        if (obj.type !== 'line') {
            throw new Error(`sketch object ${id} is not a sketch line`);
        }
        return obj as SketchLine;
    }
    get_sketch_circle(id: oid): SketchCircle {
        const obj = this.get_primitive_or_fail(id);
        if (obj.type !== 'circle') {
            throw new Error(`sketch object ${id} is not a sketch circle`);
        }
        return obj as SketchCircle;
    }
    get_sketch_arc(id: oid): SketchArc {
        const obj = this.get_primitive_or_fail(id);
        if (obj.type !== 'arc') {
            throw new Error(`sketch object ${id} is not a sketch arc`);
        }
        return obj as SketchArc;
    }
    get_constraints(): Constraint[] {
        return this.get_primitives().filter(o => !is_sketch_geometry(o)) as Constraint[];
    }
    toString(): string {
        return this.get_primitives().map(o => JSON.stringify(o)).join('\n');
    }
}

export class SketchIndex extends SketchIndexBase {
    index: Map<oid, SketchPrimitive> = new Map();
    counter = 0;

    has(id: oid): boolean {
        return this.index.has(id);
    }

    delete_primitive(id: oid): boolean {
        return this.index.delete(id);
    }

    set_primitive(obj: SketchPrimitive): void {
        if (!this.has(obj.id)) {
            if (this.counter === Number.MAX_SAFE_INTEGER) {
                throw new Error('sketch index counter overflow');
            }
            this.counter++;
        }

        this.index.set(obj.id, obj);
    }

    get_primitive(id: oid): SketchPrimitive|undefined {
        return this.index.get(id);
    }

    get_primitives(): (SketchPrimitive)[] {
        return Array.from(this.index.values());
    }

    clear(): void {
        this.index.clear();
        this.counter = 0;
    }
}