import Cpp from 'tree-sitter-cpp';
import Parser from 'tree-sitter';
import { filePath } from './utils.mjs';
import fs from 'fs';

export default class TreeSitterQueries {
    constructor() {
        this.parser = new Parser();
        this.parser.setLanguage(Cpp);
    }

    loadCppTree(fname) {
        const parser = new Parser(Cpp);
        parser.setLanguage(Cpp);
    
        const sourceCode = fs.readFileSync(filePath(fname), 'utf8');
        return parser.parse(sourceCode);
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

    queryEnum(enumName) {
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
        let tree = this.loadCppTree('../Constraints.h');
        const enum_node = query_enum.matches(tree.rootNode)
            .filter(match => match.captures[1].node.text === enumName)[0]
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
}

// const tsq = new TreeSitterQueries();
// tsq.queryEnum('InternalAlignmentType');