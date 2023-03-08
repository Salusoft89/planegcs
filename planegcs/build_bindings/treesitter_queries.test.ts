import TreeSitterQueries from "./treesitter_queries";

let q: TreeSitterQueries;

describe('TreeSitterQueries', () => {
    beforeAll(() => {
        q = new TreeSitterQueries();
    })

    describe('queryConstraintFunctions', () => {
        it('returns a valid list of constraint functions', () => {
            // see GCS.h
            const src_string = `
            class Test {
                int addConstraintEqual(double *param1, double *param2,
                    int tagId=0, bool driving = true);
                int addConstraintDifference(double *param1, double *param2,
                        double *difference, int tagId=0, bool driving = true);
            };
            `;

            const result = q.queryConstraintFunctions(src_string);

            expect(result).toEqual([{
                fname: 'addConstraintEqual',
                params: 'double *param1, double *param2, int tagId=0, bool driving = true'
            }, {
                fname: 'addConstraintDifference',
                params: 'double *param1, double *param2, double *difference, int tagId=0, bool driving = true'
            }]);
        });
    }); 

    describe('queryEnum', () => {
        it('works with (old) enum outside a class', () => {
            const src_string = `
            enum DebugMode {
                NoDebug = 0,
                Minimal = 1,
                IterationLevel = 2
            };`;
 
            const result = q.queryEnum('DebugMode', src_string);
            expect(result).toEqual([{
                name: 'NoDebug',
                value: 0
            }, {
                name: 'Minimal',
                value: 1
            }, {
                name: 'IterationLevel',
                value: 2
            }]);
        });

        it('works with (old) enum inside a class', () => {
            const src_string = `
            class Test {
                enum DebugMode {
                    NoDebug = 0,
                    Minimal = 1,
                    IterationLevel = 2
                };
            };`;
 
            const result = q.queryEnum('Test::DebugMode', src_string);
            expect(result).toEqual([{
                name: 'NoDebug',
                value: 0
            }, {
                name: 'Minimal',
                value: 1
            }, {
                name: 'IterationLevel',
                value: 2
            }]);
        });

        it('works with enum class inside a class', () => {
            const src_string = `
            class Test { 
                public: 
                    enum class Alignment {
                        NoInternalAlignment,
                        InternalAlignment,
                        WhateverAlignment = 20,
                        OtherAlignment
                    }; 
            };`; 
  
            const result = q.queryEnum('Test::Alignment', src_string);
            expect(result).toEqual([{
                name: 'NoInternalAlignment',
                value: 0
            }, {
                name: 'InternalAlignment',
                value: 1
            }, {
                name: 'WhateverAlignment',
                value: 20
            }, {
                name: 'OtherAlignment',
                value: 21
            }]);
        });

        it('works with enum class outside a class', () => {
            const src_string = `
            enum class Alignment {
                NoInternalAlignment,
                InternalAlignment
            };`; 
  
            const result = q.queryEnum('Alignment', src_string);
            expect(result).toEqual([{
                name: 'NoInternalAlignment',
                value: 0
            }, {
                name: 'InternalAlignment',
                value: 1
            }]);
        });
    });

    describe('queryFunctionTypes', () => {
        it('returns valid bool function', () => {
            const src_string = `
                class Test {
                    bool get_is_fixed(int i) {}
                };
            `;

            const result = q.queryFunctionTypes(src_string);
            expect(result).toEqual([{
                fname: 'get_is_fixed',
                params: [
                    {
                        identifier: 'i',
                        type: 'int'
                    }
                ],
                return_type: 'bool'
            }]);
        });

        it('returns valid function with class return type', () => {
            const src_string = `
                class Test {
                    Ellipse make_ellipse(
                        int cx_i, int cy_i
                    ) {}
                };
            `;

            const result = q.queryFunctionTypes(src_string);
            expect(result).toEqual([{
                fname: 'make_ellipse',
                params: [
                    {
                        identifier: 'cx_i',
                        type: 'int'
                    },
                    {
                        identifier: 'cy_i',
                        type: 'int'
                    }
                ],
                return_type: 'Ellipse'
            }]);
        });
    });
});