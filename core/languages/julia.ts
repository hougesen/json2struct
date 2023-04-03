import { ArrayToken, MapToken, Token } from '../tokenizer';

const whitespace = '    ';

function convertArray(token: ArrayToken, subStructs: Map<string, string>) {
    if (!token?.children?.length) return 'Array{Any}';

    const children = new Set<string>();

    for (let i = 0; i < token.children.length; i += 1) {
        children.add(convertTokenToJulia(token.children[i], subStructs));
    }

    const childTypesArr = Array.from(children);

    if (childTypesArr.length === 1) {
        // NOTE: using Any instead of Nothing to indicate that the element most likely has a value, but we simply don't know what
        if (children.has('Nothing')) return 'Array{Any}';

        return `Array{${childTypesArr[0]}}`;
    }

    childTypesArr.sort();

    return `Array{Union{${childTypesArr.join(',')}}}`;
}

function convertMap(token: MapToken, subStructs: Map<string, string>) {
    if (!token?.children?.length) return 'Dict{Any,Any}';

    const children = new Set<string>();

    for (let i = 0; i < token.children.length; i += 1) {
        children.add(`${token.children[i].key}::${convertTokenToJulia(token.children[i], subStructs)}`);
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

export function convertTokenToJulia(token: Token, subStructs: Map<string, string>) {
    switch (token.type) {
        case 'string':
            return 'String';

        case 'number':
            return 'Int64';

        case 'float':
            return 'Float64';

        case 'boolean':
            return 'Bool';

        case 'null':
            return 'Nothing';

        case 'array':
            return convertArray(token, subStructs);

        case 'map':
            return convertMap(token, subStructs);

        case 'unknown':
        default:
            return 'Any';
    }
}

export function generateJuliaStruct(token: Token) {
    const subStructs = new Map<string, string>();

    const result = convertTokenToJulia(token, subStructs);

    let typeFile = '';

    let isClass = false;

    subStructs.forEach((structName, structValue) => {
        if (structName === result) {
            typeFile += `struct GeneratedStruct\n${structValue}\nend\n`;
            isClass = true;
        } else {
            typeFile += `struct ${structName}\n${structValue}\nend\n\n`;
        }
    });

    if (!isClass) {
        typeFile += `const GeneratedStruct = ${result}\n`;
    }

    return typeFile;
}
