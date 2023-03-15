import { camelToSnakeCase } from './utils';

export const exported_enums = [
    { 
        enum_name: 'InternalAlignmentType',
        file: 'Constraints.h'
    },
    { enum_name: 'DebugMode', file: 'GCS.h' },
    { enum_name: 'Constraint::Alignment', file: 'Constraints.h'},
    { enum_name: 'SolveStatus', file: 'GCS.h'}
];

const exported_geometry_classes = [
    {
        name: "Point",
    },
    {
        name: "Curve",
        skip_make: true,
    },
    {
        name: "Line",
        base: "Curve"
    },
    {
        name: "Circle",
        base: "Curve"
    },
    {
        name: "Ellipse",
        base: "Curve"
    },
    {
        name: "Hyperbola",
        base: "Curve"
    },
    {
        name: "Parabola",
        base: "Curve"
    },
    {
        name: "Arc",
        base: "Circle"
    },
    {
        name: "ArcOfHyperbola",
        base: "Hyperbola"
    },
    {
        name: "ArcOfEllipse",
        base: "Ellipse"
    },
    {
        name: "ArcOfParabola",
        base: "Parabola"
    },
    {
        name: "BSpline",
        base: "Curve",
        skip_make: true
    }
]

export const class_letter_mapping: Record<string, string> = {
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

export const exported_vectors: Record<string, string> = {
    'vector<double>': 'DoubleVector',
    'vector<int>': 'IntVector'
};

export function geometry_classes(): ({name: string, base?: string, skip_make?: boolean, make_fname: string})[] {
    return exported_geometry_classes.map(cls => ({
        ...cls,
        make_fname: `make_${camelToSnakeCase(cls.name)}`
    }));
}