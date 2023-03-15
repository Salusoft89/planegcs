
import { it, describe, expect } from 'vitest'; 
import { params_to_call_string, params_to_definition_string } from "./parse_cpp";

describe('file', () => {
    it('params_to_definition_string works with different parameter types', () => {
        expect(params_to_definition_string([ 
            { type: 'Point', identifier: '&x' },
            { type: 'double', identifier: '*y' },
            { type: 'int', identifier: 'f' },
        ])).toEqual('Point &x, int y_param_i, int f');
    });

    it('params_to_call_string works with different parameter types', () => {
        expect(params_to_call_string([ 
            { type: 'Point', identifier: '&x' },
            { type: 'double', identifier: '*y' },
            { type: 'int', identifier: 'f' },
        ])).toEqual('x, params[y_param_i], f');
    });
});