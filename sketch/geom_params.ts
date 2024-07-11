// This library provides WebAssembly bindings for the FreeCAD's geometric solver library planegcs.
// Copyright (C) 2023  Miroslav Šerý, Salusoft89 <miroslav.sery@salusoft89.cz>  
// Copyright (C) 2024  Angelo Bartolome <angelo.m.bartolome@gmail.com>

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

import { SketchGeometry } from "./sketch_primitive.js";
import { Constraint } from "../planegcs_dist/constraints.js";

// Object properties that can be referenced in the constraint primitives, such as:
// {
//    "type": "equal",
//    "param1": "my_sketch_param_width",
//    "param2": {
//        "o_id": 2,
//        "property": "radius"
//    }
// }

export type SketchGeometryProperty = 'x' | 'y' | 'radius' | 'start_angle' | 'end_angle' | 'radmin';
export const property_offsets = {
    point: {
        x: 0,
        y: 1
    },
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
    parabola: {
    },
    arc_of_parabola: {
        start_angle: 0,
        end_angle: 1,
    },
    hyperbola: {
        radmin: 0,
    },
    arc_of_hyperbola: {
        start_angle: 0,
        end_angle: 1,
        radmin: 2
    },
    line: {},
} as const;

// All those types are helper types to extract the properties of the constraints
export const constraint_properties_and_offsets: Partial<ConstraintPropertiesAndOffsetsType> = {
    l2l_angle_ll: {
        angle: 0,
    },
    l2l_angle_pppp: {
        angle: 0,
    },
    coordinate_x: {
        x: 0,
    },
    coordinate_y: {
        y: 0,
    },
    p2p_angle: {
        angle: 0,
    },
    p2p_distance: {
        distance: 0,
    },
    circle_radius: {
        radius: 0,
    },
    arc_radius: {
        radius: 0,
    },
    arc_diameter: {
      diameter: 0,
    },
    c2cdistance: {
      dist: 0,
    },
    c2ldistance: {
      dist: 0,
    },
    p2cdistance: {
      distance: 0,
    }
} as const;

export default function get_property_offset(primitive_type: SketchGeometry['type'], property_key: SketchGeometryProperty): number {
    const primitive_offsets: Partial<Record<SketchGeometryProperty, number>> = property_offsets[primitive_type];
    if (primitive_offsets) {
        const offset = primitive_offsets[property_key];
        if (offset !== undefined) {
            return offset;
        }
    }
    throw new Error(`Unknown property ${property_key} for primitive <${primitive_type}>`);
}

// Utility Typescript helper types
type ExtractProperties<T> = T extends { type: infer U } ? U extends string ? {
    [K in keyof T as K extends 'type' ? never : K]: T[K]
} : never : never;

// Mapped type to create the ConstraintPropertiesAndOffsetsType with optional properties
type ConstraintPropertiesAndOffsets<K extends Constraint['type']> = Partial<ExtractProperties<Extract<Constraint, { type: K }>>>
type ConstraintPropertiesAndOffsetsType = Partial<{
    [K in Constraint['type']]: ConstraintPropertiesAndOffsets<K>
}>;