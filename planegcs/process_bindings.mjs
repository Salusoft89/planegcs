import Parser from 'tree-sitter';
import Cpp from 'tree-sitter-cpp';
import fs from 'fs';
import path from 'path';
const _dir = path.dirname(process.argv[1]);

const parser = new Parser(Cpp);
parser.setLanguage(Cpp);

const sourceCode = fs.readFileSync(_dir + '/GCS.h', 'utf8');
const tree = parser.parse(sourceCode);

// () -> [ { fname: string, params: string } ]
function getAllConstraintFunctions() {
    // see https://tree-sitter.github.io/tree-sitter/playground
    const query = new Parser.Query(Cpp, `
        (field_declaration  
            declarator: (function_declarator
                declarator: (field_identifier) @fn
                parameters: (parameter_list
                    (parameter_declaration)) @params)
            (#match? @fn "addConstraint.+")        
        )
    `);
    const matches = query.matches(tree.rootNode);
    return matches.map(match => ({
        fname: match.captures[0].node.text,
        params: match.captures[1].node.text
    }))
}

const classLetterMapping = {
    "Point": "p",
    "Line": "l",
    "Circle": "c",
    "Ellipse": "e",
    "Hyperbola": "h",
    "Arc": "a",
    "ArcOfHyperbola": "ah",
    "ArcOfEllipse": "ae",
    "Curve": "cv",
    "BSpline": "bs"
}

function fnSpecificator(params) {
    let output = "";
    for (const token of params.replace('(', '').replace(')', '').split(' ')) {
        if (token in classLetterMapping) {
            output += classLetterMapping[token];
        }
    }
    return output;
}

let functions = getAllConstraintFunctions().map(item => ({
    ...item,
    fname_lower: camelToSnakeCase(item.fname)
}));

const duplicates = new Set();
let last_n = "";
for (const fn of functions) {
    if (fn.fname_lower === last_n) {
        duplicates.add(fn.fname_lower);
    }
    last_n = fn.fname_lower;
}

// differentiate between constraints (which are overloaded)
// 1: one extra parameter (incrAngle), only in p2p_angle (one special case)
// 2: different objects (pl vs ppl, pl vs ppp, ll vs pppp), e.g. point_on_line
functions = functions.map(fn => {
    let specificator_str = "";
    if (fn.fname_lower === "add_constraint_p2p_angle") {
        if (fn.params.includes("incrAngle")) {
            specificator_str = "_incr_angle";
        }
    } else if (duplicates.has(fn.fname_lower)) {
        specificator_str = "_" + fnSpecificator(fn.params);
    }
    return {
        ...fn,
        fname_lower: fn.fname_lower + specificator_str
    }
})

// functions.forEach(fn => console.log(fn.fname_lower, fn.params));

// Point, Line, ...


// double *param1
// /* object-param */
// param1_i

// else: fixed_param, id, driving = 0


// bool internal = false
// do as bool_param..?


// utility functions 
function camelToSnakeCase(str) {
    str = str.replace(/([PL]2[PL])/, "$1_");
    return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()
}
