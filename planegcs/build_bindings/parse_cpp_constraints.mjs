import Parser from 'tree-sitter';
import Cpp from 'tree-sitter-cpp';
import fs from 'fs';
import { camelToSnakeCase, filePath } from './utils.mjs';

export function getConstraintFunctions() {
    const tree = loadCppTree(filePath('../GCS.h'));

    let functions = queryConstraintFunctions(tree).map(item => ({
        ...item,
        fname_lower: camelToSnakeCase(item.fname),
        non_opt_params: paramsToList(item.params)
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
    return functions.map(fn => {
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
}

function loadCppTree(path) {
    const parser = new Parser(Cpp);
    parser.setLanguage(Cpp);

    const sourceCode = fs.readFileSync(path, 'utf8');
    return parser.parse(sourceCode);
}

// () -> [ { fname: string, params: string } ]
function queryConstraintFunctions(tree) {
    // see https://tree-sitter.github.io/tree-sitter/playground
    const query = new Parser.Query(Cpp, `
        (field_declaration  
            declarator: (function_declarator
                declarator: (field_identifier) @fn
                parameters: (parameter_list) @params)
            (#match? @fn "addConstraint.+")        
        )
    `);
    const matches = query.matches(tree.rootNode);
    return matches.map(match => ({
        fname: match.captures[0].node.text,
        params: match.captures[1].node.text.replace('(', '').replace(')', '').replace(/\s+/g, ' ')
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

// necessary for specifying overloaded functions
// e.g. function that takes Point, Line as arguments would be suffixed with `_pl`
function fnSpecificator(params) {
    let output = "";
    for (const token of params.split(' ')) {
        if (token in classLetterMapping) {
            output += classLetterMapping[token];
        }
    }
    return output;
}

function paramsToList(params) {
    let arr = params.split(', ');
    return arr.filter(param => !param.includes('tag') && !param.includes('driving')).map(
        param => param
            .replace('double *', 'double* ')
            .replace('internal=false', 'internal') // only in addConstraintTangentCircumf
            .trim()
            .split(' ')
    ).map(param_splitted => ({
        type: param_splitted[0],
        identifier: param_splitted[1]
    }))
}