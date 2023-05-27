import { RecordTokenMissingKey } from '../errors';
import { ArrayToken, MapToken, Token } from '../tokenizer';

const whitespace = '    ';

function convertArray(token: ArrayToken, imports: Set<string>, subStructs: Map<string, string>) {
    imports.add('List');

    // NOTE: we use "List" instead of "list" since "List" is backwards compatible
    // Users of python >= 3.9 can use list instead
    if (!token?.children?.length) {
        imports.add('Any');
        return 'List[Any]';
    }

    const children = new Set<string>();

    for (let i = 0; i < token.children.length; i += 1) {
        children.add(convertTokenToPython(token.children[i], imports, subStructs));
    }

    const optional = children.has('None');

    if (optional) {
        children.delete('None');

        if (children.size) imports.add('Optional');
    }

    const childTypesArr = Array.from(children);

    if (childTypesArr.length === 0) {
        imports.add('Any');
        return 'List[Any]';
    }

    if (childTypesArr.length === 1) return `List[${childTypesArr[0]}]`;

    childTypesArr.sort();

    imports.add('Union');

    if (optional) return `List[Optional[Union[${childTypesArr.join(', ')}]]]`;

    return `List[Union[${childTypesArr.join(', ')}]]`;
}

function convertMap(token: MapToken, imports: Set<string>, subStructs: Map<string, string>) {
    // NOTE: we use "Dict" instead of "dict" since "Dict" is backwards compatible
    // Users of python >= 3.9 can use dict instead
    if (!token?.children?.length) {
        imports.add('Dict');
        imports.add('Any');

        return 'Dict[Any, Any]';
    }

    const children = new Set<string>();

    token.children?.forEach((child) => {
        if (!child.key?.length) throw new RecordTokenMissingKey();

        children.add(`${child.key}: ${convertTokenToPython(child, imports, subStructs)}`);
    });

    const childTypesArr = Array.from(children);

    childTypesArr.sort();

    const structValue = whitespace + childTypesArr.join(`\n${whitespace}`);

    const existingKey = subStructs.get(structValue);

    if (existingKey) return existingKey;

    const structName = `SubStruct${subStructs.size + 1}`;

    subStructs.set(structValue, structName);

    imports.add('TypedDict');

    return structName;
}

export function convertTokenToPython(token: Token, imports: Set<string>, subStructs: Map<string, string>) {
    switch (token.type) {
        case 'string':
            return 'str';

        case 'number':
            return 'int';

        case 'float':
            return 'float';

        case 'boolean':
            return 'bool';

        case 'null':
            return 'None';

        case 'array':
            return convertArray(token, imports, subStructs);

        case 'map':
            return convertMap(token, imports, subStructs);

        case 'unknown':
        default:
            return 'Any';
    }
}

function generateTypingImports(imports: Set<string>) {
    if (imports.size) {
        return `from typing import ${Array.from(imports).sort().join(', ')}\n\n\n`;
    }

    return '';
}

export function generatePythonStruct(token: Token) {
    const imports = new Set<string>();
    const subStructs = new Map<string, string>();

    const result = convertTokenToPython(token, imports, subStructs);

    let typeFile = '';

    let isClass = false;

    subStructs.forEach((structName, structValue) => {
        if (structName === result) {
            typeFile += `class GeneratedStruct(TypedDict):\n${structValue}\n`;
            isClass = true;
        } else {
            typeFile += `class ${structName}(TypedDict):\n${structValue}\n\n\n`;
        }
    });

    if (!isClass) {
        imports.add('TypeAlias');

        typeFile += `GeneratedStruct: TypeAlias = ${result}\n`;
    }

    return generateTypingImports(imports) + typeFile;
}
