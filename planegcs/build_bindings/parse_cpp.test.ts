import { params_to_call_string, params_to_definition_string } from "./parse_cpp";

describe('params_to_definition_string', () => {
    it('works with different parameter types', () => {
        expect(params_to_definition_string([ 
            { type: 'Point', identifier: '&x' },
            { type: 'double', identifier: '*y' },
            { type: 'int', identifier: 'f' },
        ])).toEqual('Point &x, int y_param_i, int f');
    });
});

describe('params_to_call_string', () => {
    it('works with different parameter types', () => {
        expect(params_to_call_string([ 
            { type: 'Point', identifier: '&x' },
            { type: 'double', identifier: '*y' },
            { type: 'int', identifier: 'f' },
        ])).toEqual('x, params[y_param_i], f');
    });
});