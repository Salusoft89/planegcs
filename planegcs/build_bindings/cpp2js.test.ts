import { cpp_type_to_js_type } from "./cpp2js";
 
describe('cppTypeToJsType', () => {
    it('works with primitive types', () => {
        expect(cpp_type_to_js_type('double')).toBe('number');
        expect(cpp_type_to_js_type('int')).toBe('number');
        expect(cpp_type_to_js_type('bool')).toBe('boolean');
        expect(cpp_type_to_js_type('void')).toBe('void');
        expect(cpp_type_to_js_type('unsigned int')).toBe('number');
        expect(cpp_type_to_js_type('unsigned double')).toBe('number');
    });

    it('works with geometry classes', () => {
        expect(cpp_type_to_js_type('Ellipse')).toBe('Ellipse');
        expect(cpp_type_to_js_type('Point')).toBe('Point');
    });

    it('works with enums', () => {
        expect(cpp_type_to_js_type('InternalAlignmentType')).toBe('InternalAlignmentType');
        expect(cpp_type_to_js_type('Constraint::Alignment')).toBe('Constraint_Alignment');
    });
});