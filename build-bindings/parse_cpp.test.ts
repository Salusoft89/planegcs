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

import { it, describe, expect } from 'vitest'; 
import { params_to_call_string, params_to_definition_string } from "./parse_cpp";

describe('file', () => {
    it('params_to_definition_string works with different parameter types', () => {
        expect(params_to_definition_string([ 
            { type: 'Point', identifier: '&x' },
            { type: 'double', identifier: '*y' },
            { type: 'int', identifier: 'f' },
        ])).toEqual('Point &x, int y_param_i, int f');
    });

    it('params_to_call_string works with different parameter types', () => {
        expect(params_to_call_string([ 
            { type: 'Point', identifier: '&x' },
            { type: 'double', identifier: '*y' },
            { type: 'int', identifier: 'f' },
        ])).toEqual('x, p_params[y_param_i], f');
    });
});