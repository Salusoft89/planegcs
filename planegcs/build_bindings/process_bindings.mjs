import fs from 'fs';
import { arrToNTuples, filePath } from './utils.mjs';
import { getConstraintFunctions, getEnums } from './parse_cpp_constraints.mjs';
import nunjucks from 'nunjucks';
nunjucks.configure({ autoescape: false })

// get the data from the cpp analysis
let fn_constraints = getConstraintFunctions();
let enums = getEnums();

// get script cli args
const args = process.argv.slice(2);
const input_outputs = arrToNTuples(args, 2).map(([template, output_file]) => 
({
    template,
    output_file
}));


for (const { template, output_file } of input_outputs) {
    let output_str = nunjucks.render(filePath(`templates/${template}`), { fn_constraints, enums } );

    fs.writeFileSync(filePath(output_file), output_str, (err) => {
        if (err) throw err;
    });
}
