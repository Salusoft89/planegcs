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
import { cpp_type_to_js_type } from "./cpp2js";
 
describe('cppTypeToJsType', () => {
    it('works with primitive types', () => {
        expect(cpp_type_to_js_type('double')).toBe('number');
        expect(cpp_type_to_js_type('int')).toBe('number');
        expect(cpp_type_to_js_type('bool')).toBe('boolean');
        expect(cpp_type_to_js_type('void')).toBe('void');
        expect(cpp_type_to_js_type('unsigned int')).toBe('number');
        expect(cpp_type_to_js_type('unsigned double')).toBe('number');
    });

    it('works with geometry classes', () => {
        expect(cpp_type_to_js_type('Ellipse')).toBe('Ellipse');
        expect(cpp_type_to_js_type('Point')).toBe('Point');
    });

    it('works with enums', () => {
        expect(cpp_type_to_js_type('InternalAlignmentType')).toBe('InternalAlignmentType');
        expect(cpp_type_to_js_type('Constraint::Alignment')).toBe('Constraint_Alignment');
    });
});