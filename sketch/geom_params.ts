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

import { SketchGeometry } from "./sketch_primitive";

export type SketchGeometryProperty = 'x' | 'y' | 'radius' | 'start_angle' | 'end_angle' | 'radmin';
const property_offsets: Record<SketchGeometry['type'], Partial<Record<SketchGeometryProperty, number>>> = {
    point: {
        x: 0,
        y: 1
    },
    line: {}, // no properties on line
    circle: {
        radius: 0
    },
    arc: {
        start_angle: 0,
        end_angle: 1,
        radius: 2
    },
    ellipse: {
        radmin: 0,
    },
    arc_of_ellipse: {
        start_angle: 0,
        end_angle: 1,
        radmin: 2
    },
}

export default function get_property_offset(primitive_type: SketchGeometry['type'], property_key: SketchGeometryProperty): number {
    const primitive_offsets = property_offsets[primitive_type];
    if (primitive_offsets) {
        const offset = primitive_offsets[property_key];
        if (offset !== undefined) {
            return offset;
        }
    }
    throw new Error(`Unknown property ${property_key} for primitive <${primitive_type}>`);
}