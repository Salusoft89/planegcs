/* jshint esversion: 8 */
import * as fs from 'node:fs/promises';
import * as process from 'node:process';

const type_map = {
    int: 'number',
    double: 'number',
    bool: 'boolean',
    void: 'void',
};

const token_types = {
    wspace: /^[\s,]+/,
    type: new RegExp(`^(${Object.keys(type_map).join('|')})\\b`),
    identifier: /^[a-zA-Z_][a-zA-Z_0-9]*/,
    annotation: /^\/\*\s*([a-z-]+)\s*\*\//,
};

function read_token(input, i, token_types) {
    for (const [token_type, regex] of Object.entries(token_types)) {
        const sliced_input = input.slice(i);
        const result = sliced_input.match(regex);
        if (result !== null) {
            let text = result[0];
            if (token_type === 'annotation') {
                text = result[1];
            }
            const token = { type: token_type, value: text };
            return [token, i + result[0].length];
        }
    }
    throw new Error("exhausted token types while lexing");
}

function tokenize(input, token_types) {
    const tokens = [];
    for (var i = 0; i < input.length;) {
        const result = read_token(input, i, token_types);
        const token = result[0];
        i = result[1];
        if (token.type !== 'wspace') {
            tokens.push(token);
        }
    }
    return tokens;
}

async function main(argv) {
    const source = await fs.readFile(argv[2], { encoding: 'utf8' });
    const out = await fs.open(argv[3], 'w');
    let out_constraints = out;
    if (argv[4]) {
        out_constraints = await fs.open(argv[4], 'w');
    }

    const vectors = source.matchAll(/emscripten::register_vector<([^>]+)>\("([^"]+)"\)/g);
    const functions = source.matchAll(/.function\("([^"]+)", &([^)]+)\)/g);
    // extract the c++ class names
    const class_names = source.matchAll(/class\s+([a-zA-Z0-9_]+)\s*:\s+([a-zA-Z0-9_]+)/g);


    // use the classname later for the interface definition
    const class_name = class_names.next().value[1]; // GcsSystem
    
    for (const v of vectors) {
        type_map[`vector<${v[1]}>`] = v[2];
        
        await out.write(`export interface ${v[2]} {
            get: (i: number) => number;
            size: () => number;
            delete: () => void;
        }
        `);
    }
    const constraint_types = ['interface Id {\n    id: number;\n}'];
    const constraint_names = [];
    
    await out.write(`export interface ${class_name} {\n`);
    
    // todo: handle constructor??
    // await out.write(`    constructor(): void;\n`);

    for (const f of functions) {
        if (!(f[1] === f[2] || `${class_name}::${f[1]}` === f[2])) {
            throw new Error(`binding name ${f[1]}/${class_name}::${f[1]} and function name ${f[2]} differs`);
            // console.log(`warning: binding name ${f[1]} and function name ${f[2]} differs`);
        }
        const f_name = f[1];
        const declaration = source.match(new RegExp(`(\\S+) ${f_name}\\(([^\\)]*)\\)`));
        const return_type = declaration[1];
        const params_text = declaration[2];
        const param_tokens = tokenize(params_text, token_types);

        const c_params = [];
        const c_params_map = new Map();
        const is_constraint = f_name.match(/^add_constraint([a-z0-9_]+)/);

        const ts_params = [];

        for (let i = 0; i < param_tokens.length - 1; ++i) {
            const token = param_tokens[i];
            const next_token = param_tokens[i + 1];
            const next_next_token = param_tokens[i + 2];

            if (token.type === 'type' && next_token.type === 'identifier') {
                ts_params.push(`${next_token.value}: ${type_map[token.value]}`);
            }
            if (is_constraint && token.type === 'annotation') {
                const name = token.value;
                c_params.push([name, next_next_token.value]);

                if (c_params_map.has(name)) {
                    const value = c_params_map.get(name);
                    c_params_map.set(name, [value[0] + 1, 1]);
                } else {
                    c_params_map.set(name, [1, 1]);
                }
            }
        }

        if (is_constraint) {
            const c_name_raw = is_constraint[1];
            const c_type_name = c_name_raw.replace(/([0-9_])([a-z])/g, (match, p1, p2) => p1 + p2.toUpperCase()).replace(/_/g, '') + 'Constraint';
            constraint_names.push(c_type_name);

            const c_type_params = [`    type: '${c_name_raw.replace(/^_/, '')}';`];

            for (const [name, variable] of c_params) {
                const suffix = param_suffix(name, c_params_map);

                if (name === 'object-param') {
                    c_type_params.push(`    o${suffix}_id: number;`);
                    c_type_params.push(`    o${suffix}_i: number;`);
                } else if (name == 'fixed-param') {
                    c_type_params.push(`    ${variable.replace(/_i$/, '')}: number;`);
                } else if (name == 'line') {
                    c_type_params.push(`    l${suffix}_id: number;`);
                } else if (name == 'arc') {
                    c_type_params.push(`    a${suffix}_id: number;`);
                } else if (name == 'point') {
                    c_type_params.push(`    p${suffix}_id: number;`);
                }
            }
            constraint_types.push(`export interface ${c_type_name} extends Id {\n${c_type_params.join('\n')}\n}`);
        }
        await out.write(`    ${f_name}: (${ts_params.join(', ')}) => ${type_map[return_type]},\n`);
    }
    await out.write(`    delete: () => void;\n`);
    await out.write('}\n');
    
    await out_constraints.write(constraint_types.join('\n') + '\n');
    await out_constraints.write(`export type Constraint = ${constraint_names.join(' | ')};\n`);
}

function param_suffix(name, c_params_map) {
    const [n, i] = c_params_map.get(name);
    c_params_map.set(name, [n, i + 1]);
    return n > 1 ? i : '';
}

main(process.argv);
