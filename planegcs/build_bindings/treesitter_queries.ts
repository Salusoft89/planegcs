import Cpp from 'tree-sitter-cpp';
import Parser from 'tree-sitter';
import { filePath } from './utils';
import fs from 'fs';

export default class TreeSitterQueries {
    private parser: Parser;

    constructor() {
        this.parser = new Parser();
        this.parser.setLanguage(Cpp);
    }

    loadCppTree(fname) {    
        const sourceCode = fs.readFileSync(filePath(fname), 'utf8');
        return this.parser.parse(sourceCode);
    }

    // () -> [ { fname: string, params: string } ]
    queryConstraintFunctions() {
        // see https://tree-sitter.github.io/tree-sitter/playground
        const query = new Parser.Query(Cpp, `
        (field_declaration  
            declarator: (function_declarator
                declarator: (field_identifier) @fn
                parameters: (parameter_list) @params)
            (#match? @fn "addConstraint.+")        
        )
        `);
        const tree = this.loadCppTree('../GCS.h');
        const matches = query.matches(tree.rootNode);
        return matches.map(match => ({
            fname: match.captures[0].node.text,
            params: match.captures[1].node.text.replace('(', '').replace(')', '').replace(/\s+/g, ' ')
        }));
    }

    queryEnum(enumName, enumFile) {
        const query_enum = new Parser.Query(Cpp, `
            (enum_specifier
                name: (type_identifier) @enum_name
            ) @enum
        `);
        const query_values = new Parser.Query(Cpp, `
            (enumerator_list
                (enumerator
                    name: (identifier) @name
                    value: (number_literal) @value
                )
            )
        `);
        const tree = this.loadCppTree(enumFile);
        const enum_base_name = enumName.split('::').pop();
        const enum_node = query_enum.matches(tree.rootNode)
            .filter(match => match.captures[1].node.text === enum_base_name)[0]
            .captures[0].node;

        if (enum_node === undefined) {
            throw new Error(`Enum ${enumName} not found`);
        }

        const enum_values = query_values.matches(enum_node).map(match => ({
            name: match.captures[0].node.text,
            value: parseInt(match.captures[1].node.text)
        }));

        return enum_values;
    }

    // 2nd step (after creating bindings.cpp)
    queryFunctionTypes() {
        const query = new Parser.Query(Cpp, `
            (function_definition
                type: [
                    (type_identifier) @type
                    (primitive_type) @type
                    (template_type) @type
                ]
                declarator: (function_declarator
                    declarator: (field_identifier) @fn_name
                    parameters: (parameter_list) @params
                )
            )`);

        const tree = this.loadCppTree('../bindings.cpp');
        const matches = query.matches(tree.rootNode);

        return matches.map(match => ({
            return_type: match.captures[0].node.text,
            fname: match.captures[1].node.text,
            params: match.captures[2].node.text
                .replace('(', '').replace(')', '')
                .replace(/\s+/g, ' ')
                .split(', ')
                .filter(s => s !== '')
                .map(declaration => declaration.trim().split(' '))
                .map(([type, identifier]) => ({ type, identifier }))
        }));
    }
}

// const tsq = new TreeSitterQueries();
// console.log(tsq.queryFunctionTypes().map(fn => fn.params));