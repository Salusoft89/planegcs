import { camelToSnakeCase, utilReadFile } from './utils';
import TreeSitterQueries, { ParamType } from './treesitter_queries';
import { class_letter_mapping, exported_enums } from './config';
import { cpp_type_to_js_type } from './cpp2js';
const tsq = new TreeSitterQueries();

export function getConstraintFunctions() {
    const src_string = utilReadFile('../GCS.h');
    const functions = tsq.queryConstraintFunctions(src_string).map(item => ({
        ...item,
        params_list: item.params_list.map(param => ({
            ...param,
            is_enum: exported_enums.map(e => e.enum_name).includes(param.type)
        })),
        definition_params: params_to_definition_string(item.params_list),
        call_params: params_to_call_string(item.params_list),
        fname_lower: camelToSnakeCase(item.fname),
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
            if (fn.params_list.map(p => p.identifier).includes("incrAngle")) {
                specificator_str = "_incr_angle";
            }
        // 2: different objects (pl vs ppl, pl vs ppp, ll vs pppp), e.g. point_on_line
        } else if (duplicates.has(fn.fname_lower)) {
            specificator_str = "_" + fn_specificator(fn.params_list);
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

export function getEnums() {
    return exported_enums.map(({enum_name, file}) => ({
        name: enum_name,
        values: tsq.queryEnum(enum_name, utilReadFile(file))
    }));
}

export function getFunctionTypesTypescript() {
    const src_string = utilReadFile('../bindings.cpp');
    const cpp_funcs = tsq.queryFunctionTypes(src_string);
    const ts_funcs = cpp_funcs.map(item => ({
        return_type: cpp_type_to_js_type(item.return_type),
        fname: item.fname,
        args: item.params.map(({ type, identifier }) => ({
            type: cpp_type_to_js_type(type),
            identifier: identifier.replace('&', '')
        })).map(({ type, identifier }) => `${identifier}: ${type}`).join(', ')
    }));

    return ts_funcs;
}

// necessary for specifying overloaded functions
// e.g. function that takes Point, Line as arguments would be suffixed with `_pl`
function fn_specificator(params: ParamType[]) {
    let output = "";
    for (const p of params) {
        if (p.type in class_letter_mapping) {
            output += class_letter_mapping[p.type];
        }
    }
    return output;
}

// for addConstraint functions
export function params_to_definition_string(params: ParamType[]) {
    const arr = [];
    for (const param of params) {
        if (param.type === 'double' && param.identifier.startsWith('*')) {
            const id = double_pointer_param_to_param_i(param.identifier);
            arr.push(`int ${id}`);
        } else {
            arr.push(`${param.type} ${param.identifier}`);
        }
    }
    return arr.join(', ');
}

export function params_to_call_string(params: ParamType[]) {
    const arr = [];
    for (const param of params) {
        if (param.type === 'double' && param.identifier.startsWith('*')) {
            const id = double_pointer_param_to_param_i(param.identifier);
            arr.push(`params[${id}]`);
        } else {
            arr.push(`${param.identifier.replace('&', '')}`);
        }
    }
    return arr.join(', ');
}

function double_pointer_param_to_param_i(identifier: string): string {
    const id = identifier.replace('*', '');
    return id + (id.startsWith('param') ? 
                    '_i' : '_param_i');
}