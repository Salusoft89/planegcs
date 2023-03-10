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
let fn_ts_bindings = null; // depends on generating bindings.cpp first

// get script cli args: input_file1 output_file1 input_file2 output_file2 ...
const args = process.argv.slice(2);
const input_outputs = arrToNTuples(args, 2);

for (const [ template, output_file ] of input_outputs) {
    if (template === 'gcs_system.ts.njk') {
        fn_ts_bindings = getFunctionTypesTypescript();
    }

    const output_str = nunjucks.render(filePath(`templates/${template}`), { fn_constraints, enums, fn_ts_bindings, geom_classes } );
    fs.writeFileSync(filePath(output_file), output_str);
}