import { ArrayToken, MapToken, Token } from '../tokenizer';

const whitespace = '    ';

const reservedKeywords = new Set([
    'abstract',
    'as',
    'async',
    'await',
    'become',
    'box',
    'break',
    'const',
    'continue',
    'crate',
    'do',
    'dyn',
    'else',
    'enum',
    'extern',
    'false',
    'final',
    'fn',
    'for',
    'if',
    'impl',
    'in',
    'let',
    'loop',
    'macro',
    'match',
    'mod',
    'move',
    'mut',
    'override',
    'priv',
    'pub',
    'ref',
    'return',
    'Self',
    'self',
    'static',
    'struct',
    'super',
    'trait',
    'true',
    'try',
    'type',
    'typeof',
    'unsafe',
    'unsized',
    'use',
    'virtual',
    'where',
    'while',
    'yield',
]);

function generateEnum(children: Array<string>, subEnums: Map<string, string>): string {
    let enumValue = '';

    for (let i = 0; i < children.length; i += 1) {
        enumValue += `${whitespace}Key${i + 1}(${children[i]}),${i === children.length - 1 ? '' : '\n'}`;
    }

    const existingEnum = subEnums.get(enumValue);

    if (existingEnum) return existingEnum;

    const enumName = `SubEnum${subEnums.size + 1}`;

    subEnums.set(enumValue, enumName);

    return enumName;
}

function convertArray(token: ArrayToken, subStructs: Map<string, string>, subEnums: Map<string, string>) {
    if (!token?.children?.length) return 'Vec';

    const children = new Set<string>();

    for (let i = 0; i < token.children.length; i += 1) {
        children.add(convertTokenToRust(token.children[i], subStructs, subEnums));
    }

    const optional = children.has('None');

    const childTypesArr = Array.from(children);

    if (childTypesArr.length === 0) return 'Vec';

    if (childTypesArr.length === 1) {
        if (optional) return `Vec<${childTypesArr[0]}>`;

        return `Vec<${childTypesArr[0]}>`;
    }

    childTypesArr.sort();

    const enumName = generateEnum(childTypesArr, subStructs);

    if (optional) return `Vec<Option<${enumName}>>`;

    return `Vec<${enumName}>`;
}

function convertMap(token: MapToken, subStructs: Map<string, string>, subEnums: Map<string, string>) {
    const children = new Set<string>();

    if (token?.children?.length) {
        for (let i = 0; i < token.children.length; i += 1) {
            const restrictedWordPrefix = reservedKeywords.has(token.children[i].key as string) ? 'r#' : '';

            children.add(
                `${restrictedWordPrefix}${token.children[i].key}: ${convertTokenToRust(
                    token.children[i],
                    subStructs,
                    subEnums
                )},`
            );
        }
    }

    const childTypesArr = Array.from(children);

    childTypesArr.sort();

    const structValue = whitespace + childTypesArr.join('\n' + whitespace);

    const existingKey = subStructs.get(structValue);

    if (existingKey) return existingKey;

    const structName = `SubStruct${subStructs.size + 1}`;

    subStructs.set(structValue, structName);

    return structName;
}

export function convertTokenToRust(token: Token, subStructs: Map<string, string>, subEnums: Map<string, string>) {
    switch (token.type) {
        case 'string':
            return 'String';

        case 'number':
            return 'i64';

        case 'float':
            return 'f64';

        case 'boolean':
            return 'bool';

        case 'null':
            return 'None';

        case 'array':
            return convertArray(token, subStructs, subEnums);

        case 'map':
            return convertMap(token, subStructs, subEnums);

        case 'unknown':
        default:
            return 'dyn std::any::Any';
    }
}

export function generateRustStruct(token: Token) {
    const subStructs = new Map<string, string>();

    const subEnums = new Map<string, string>();

    const result = convertTokenToRust(token, subStructs, subEnums);

    let typeFile = '';

    let isClass = false;

    subStructs.forEach((structName, structValue) => {
        const isEnum = structName.includes('Enum');

        if (structName === result) {
            typeFile += `${isEnum ? 'enum' : 'struct'} GeneratedStruct {\n${structValue}\n}\n`;
            isClass = true;
        } else {
            typeFile += `${isEnum ? 'enum' : 'struct'} ${structName} {\n${structValue}\n}\n\n`;
        }
    });

    if (!isClass) {
        typeFile += `type GeneratedStruct = ${result};\n`;
    }

    return typeFile;
}
