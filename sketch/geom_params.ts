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

const obj_params_offsets: Record<string, Record<string, number>> = {
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
    }
}

export default function get_param_offset(obj_type: string, param_name: string): number {
    const obj_params = obj_params_offsets[obj_type];
    if (obj_params) {
        const offset = obj_params[param_name];
        if (offset !== undefined) {
            return offset;
        }
    }
    throw new Error(`Unknown parameter ${param_name} for object type ${obj_type}`);
}