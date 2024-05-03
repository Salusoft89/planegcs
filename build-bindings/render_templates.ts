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

import fs from 'fs';
import { arrToNTuples, filePath } from './utils';
import { getConstraintFunctions, getEnums, getFunctionTypesTypescript } from './parse_cpp';
import { geometry_classes } from './config';
import nunjucks from 'nunjucks';
nunjucks.configure({ autoescape: false })

// get the data from the cpp analysis
const fn_constraints = getConstraintFunctions();
const enums = getEnums();
const geom_classes = geometry_classes();
// todo: refactor the deps to Makefile
let fn_ts_bindings; // depends on generating bindings.cpp first

// get script cli args: input_file1 output_file1 input_file2 output_file2 ...
const args = process.argv.slice(2);
const input_outputs = arrToNTuples(args, 2);

const import_enums = ['InternalAlignmentType', 'Constraint_Alignment'];

for (const [ template, output_file ] of input_outputs) {
    if (template === 'gcs_system.ts.njk') {
        fn_ts_bindings = getFunctionTypesTypescript();
    }

    const output_str = nunjucks.render(filePath(`templates/${template}`), { fn_constraints, enums, fn_ts_bindings, geom_classes, import_enums } );
    fs.writeFileSync(filePath(output_file), output_str);
}