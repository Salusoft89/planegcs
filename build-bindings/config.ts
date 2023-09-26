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

import { camelToSnakeCase } from './utils';

export const exported_enums = [
    { 
        enum_name: 'InternalAlignmentType',
        file: 'Constraints.h'
    },
    { enum_name: 'DebugMode', file: 'GCS.h' },
    { enum_name: 'Constraint::Alignment', file: 'Constraints.h'},
    { enum_name: 'SolveStatus', file: 'GCS.h'},
    { enum_name: 'Algorithm', file: 'GCS.h'},
];

const exported_geometry_classes = [
    {
        name: "Point",
    },
    {
        name: "Curve",
        skip_make: true,
    },
    {
        name: "Line",
        base: "Curve"
    },
    {
        name: "Circle",
        base: "Curve"
    },
    {
        name: "Ellipse",
        base: "Curve"
    },
    {
        name: "Hyperbola",
        base: "Curve"
    },
    {
        name: "Parabola",
        base: "Curve"
    },
    {
        name: "Arc",
        base: "Circle"
    },
    {
        name: "ArcOfHyperbola",
        base: "Hyperbola"
    },
    {
        name: "ArcOfEllipse",
        base: "Ellipse"
    },
    {
        name: "ArcOfParabola",
        base: "Parabola"
    },
    {
        name: "BSpline",
        base: "Curve"
    }
]

export const class_letter_mapping: Record<string, string> = {
    "Point": "p",
    "Line": "l",
    "Circle": "c",
    "Ellipse": "e",
    "Hyperbola": "h",
    "Parabola": "pb",
    "Arc": "a",
    "ArcOfHyperbola": "ah",
    "ArcOfEllipse": "ae",
    "ArcOfParabola": "ap",
    "Curve": "cv",
    "BSpline": "bs"
}

export const exported_vectors: Record<string, string> = {
    'vector<double>': 'DoubleVector',
    'vector<int>': 'IntVector'
};

export function geometry_classes(): ({name: string, base?: string, skip_make?: boolean, make_fname: string})[] {
    return exported_geometry_classes.map(cls => ({
        ...cls,
        make_fname: `make_${camelToSnakeCase(cls.name)}`
    }));
}