import fs from 'fs';
import { arrToNTuples, filePath } from './utils.mjs';
import { getConstraintFunctions } from './parse_cpp_constraints.mjs';
import nunjucks from 'nunjucks';
nunjucks.configure({ autoescape: false })

// get the data from the cpp analysis
let fn_constraints = getConstraintFunctions();

// get script cli args
const args = process.argv.slice(2);
const input_outputs = arrToNTuples(args, 2).map(([input_file, output_file]) => 
({
    input_file,
    output_file
}));


for (const { input_file, output_file } of input_outputs) {
    let output_str = nunjucks.render(filePath(input_file), { fn_constraints } );

    fs.writeFileSync(filePath(output_file), output_str, (err) => {
        if (err) throw err;
    });
}
