import { class_letter_mapping, exported_enums, exported_vectors } from "./config";

const primitive_types: Record<string, string> = {
    "double": "number",
    "unsigned double": "number",
    "int": "number",
    "unsigned int": "number",
    "bool": "boolean",
    "void" : "void"   
}

function fix_identifier_chars(name: string) {
    return name.replace('::', '_');
}

export function cpp_type_to_js_type(cpp_type: string) {
    if (cpp_type in primitive_types) {
        return primitive_types[cpp_type];
    }
    const geom_classes = Object.keys(class_letter_mapping);
    const enums = exported_enums.map(e => e.enum_name);
    if ([...geom_classes, ...enums].includes(cpp_type)) {
        return fix_identifier_chars(cpp_type);
    } else if (cpp_type in exported_vectors) {
        return exported_vectors[cpp_type]
    }

    throw new Error(`Unknown type ${cpp_type}!`);
}