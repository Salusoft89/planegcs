import Cpp from 'tree-sitter-cpp';
import Parser, { Input, InputReader } from 'tree-sitter';

type StringInput = string | Input | InputReader;
type ParamType = { type: string, identifier: string, optional_value?: string };

export default class TreeSitterQueries {
    private parser: Parser;

    constructor() {
        this.parser = new Parser();
        this.parser.setLanguage(Cpp);
    }

    queryConstraintFunctions(src_string: StringInput): { fname: string, params: string }[] {
        // see https://tree-sitter.github.io/tree-sitter/playground
        const query = new Parser.Query(Cpp, `
        (field_declaration  
            declarator: (function_declarator
                declarator: (field_identifier) @fn
                parameters: (parameter_list) @params)
            (#match? @fn "addConstraint.+")        
        )
        `);
        const tree = this.parser.parse(src_string);
        const matches = query.matches(tree.rootNode);
        return matches.map(match => ({
            fname: match.captures[0].node.text,
            params: match.captures[1].node.text.replace('(', '').replace(')', '').replace(/\s+/g, ' '),
            params_list: this.getParameters(match.captures[1].node)
        }));
    }

    queryEnum(enum_name: string, src_string: StringInput) {
        const enum_base_name = enum_name.split('::').pop();
        const query_enum = new Parser.Query(Cpp, `
            (enum_specifier
                name: (type_identifier) @enum_name
            ) @enum
        `);

        const tree = this.parser.parse(src_string);
        const enums = query_enum.matches(tree.rootNode)
            .filter(match => match.captures[1].node.text === enum_base_name);
        if (enums.length === 0) {
            throw new Error(`Enum ${enum_name} not found`);
        }        
        let enum_node = enums[0].captures[0].node;
        let query_values: Parser.Query;
        if (enum_node.parent?.type === 'field_declaration') {
            // enum is a member of a class, handle it differently
            query_values = new Parser.Query(Cpp, `
                (initializer_list
                    [
                     (assignment_expression
                        left: (identifier) @name
                        right: (number_literal) @value)
                     (identifier) @name
                    ]
                )
            `);
            enum_node = enum_node.parent;
        } else {
            query_values = new Parser.Query(Cpp, `
                (enumerator_list
                    (enumerator
                        name: (identifier) @name
                        value: (number_literal)? @value
                    )
                )
            `);
        }

        const enum_values = [];
        let i = 0;
        for (const match of query_values.matches(enum_node)) {
            const name = match.captures[0].node.text;
            if (match.captures[1] === undefined) {
                // enum class does not have to have values
                enum_values.push({ name, value: i++ });
            } else {
                i = parseInt(match.captures[1].node.text, 10);
                enum_values.push({ name, value: i++ });
            }
        }

        return enum_values;
    }

    // 2nd step (after creating bindings.cpp)
    queryFunctionTypes(src_string: StringInput): { return_type: string, fname: string, params: ParamType[] }[] {
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

        const tree = this.parser.parse(src_string);
        const matches = query.matches(tree.rootNode);

        return matches.map(match => ({
            return_type: match.captures[0].node.text,
            fname: match.captures[1].node.text,
            params: this.getParameters(match.captures[2].node)
        }));
    }

    private getParameters(param_list_node: Parser.SyntaxNode): ParamType[] {
        if (param_list_node.type !== 'parameter_list') {
            throw new Error('Expected parameter_list, got ' + param_list_node.type);
        }

        const query = new Parser.Query(Cpp, `
            declarator: [
                (identifier) @name
                (reference_declarator
                    (identifier)) @name
                (pointer_declarator
                    (identifier)) @name
            ]`);
        const matches = query.matches(param_list_node);

        const params: ParamType[] = [];
        for (const match of matches) {
            const match_node = match.captures[0].node;
            let optional_value: string | null = null;
            if (match_node.parent?.type === 'optional_parameter_declaration') {
                optional_value = match_node.parent.children[3].text;
            } else if (match_node.parent?.type !== 'parameter_declaration') {
                // this case has already been handled by other match, because
                // the declarations can be nested
                continue;
            }

            const identifier = match_node.text;
            const type = match_node.parent?.children[0]?.text;
            if (type === undefined) {
                throw new Error(`Could not find type for parameter ${identifier}`);
            }
            params.push(optional_value ? { identifier, type, optional_value } : { identifier, type });
        }
        return params;
    }
}