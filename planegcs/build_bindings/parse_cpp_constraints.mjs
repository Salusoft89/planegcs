import { camelToSnakeCase } from './utils.mjs';
import TreeSitterQueries from './treesitter_queries.mjs';
const tsq = new TreeSitterQueries();

export function getConstraintFunctions() {
    let functions = tsq.queryConstraintFunctions().map(item => ({
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
    return functions.map(fn => {
        let specificator_str = "";
        // 1: one extra parameter (incrAngle), only in p2p_angle (one special case)
        if (fn.fname_lower === "add_constraint_p2p_angle") {
            if (fn.params.includes("incrAngle")) {
                specificator_str = "_incr_angle";
            }
        // 2: different objects (pl vs ppl, pl vs ppp, ll vs pppp), e.g. point_on_line
        } else if (duplicates.has(fn.fname_lower)) {
            specificator_str = "_" + fnSpecificator(fn.params);
        }
        const fname_lower = fn.fname_lower + specificator_str;

        return {
            ...fn,
            fname_lower,
            // data for typescript definitions
            constraint_name: fn.fname.replace('addConstraint', '') + specificator_str.toUpperCase(),
            constraint_type: fname_lower.replace('add_constraint_', '')
        }
    })
}

const exportedEnums = [
    { 
        enum_name: 'InternalAlignmentType',
        file: '../Constraints.h'
    },
    { enum_name: 'DebugMode', file: '../GCS.h' }
]

export function getEnums() {
    return exportedEnums.map(({enum_name, file}) => ({
        name: enum_name,
        values: tsq.queryEnum(enum_name, file)
    }));
}

const cppToJsTypeMapping = {
    "double": "number",
    "int": "number",
    "bool": "boolean",
    "void" : "void"   
}

export function getFunctionTypesTypescript() {
    const cpp_funcs = tsq.queryFunctionTypes();
    const ts_funcs = cpp_funcs.map(item => ({
        return_type: mapCppToJsType(item.return_type),
        fname: item.fname,
        args: item.params.map(({ type, identifier }) => ({
            type: mapCppToJsType(type),
            identifier: identifier.replace('&', '')
        })).map(({ type, identifier }) => `${identifier}: ${type}`).join(', ')
    }));

    return ts_funcs;
}

function mapCppToJsType(cppType) {
    if (cppType in cppToJsTypeMapping) {
        return cppToJsTypeMapping[cppType];
    }
    const geom_classes = Object.keys(classLetterMapping);
    const enums = exportedEnums.map(e => e.enum_name);
    if ([...geom_classes, ...enums].includes(cppType)) {
        return cppType;
    }

    throw new Error(`Unknown type ${cppType}!`);
}

const classLetterMapping = {
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

// used for arguments of addConstraint functions
function paramsToList(params) {
    let arr = params.split(', ');
    return arr.filter(param => !param.includes('tag') && !param.includes('driving'))
    .map(param => {
        const param_splitted = param
            .replace('double *', 'double* ')
            .replace('internal=false', 'internal') // only in addConstraintTangentCircumf
            .trim()
            .split(' ');

        const type = param_splitted[0];
        const identifier = camelToSnakeCase(param_splitted[1]);
        return {
            type,
            identifier,
            i_suffix: identifier.startsWith('param') ? '_i' : '_param_i',
        };
    });
}

// console.log(getConstraintFunctions().map(fn => fn.non_opt_params));