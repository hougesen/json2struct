import { Token, ArrayToken, MapToken } from '../tokenizer';

type P = {
    id: number;
    class: boolean;
    value: string;
    classes: P[];
};

function convertArray(token: ArrayToken): string {
    // NOTE: we use "List" instead of "list" since "List" is backwards compatible
    // Users of python >= 3.9 can use list instead
    if (!token?.children?.length) return 'List[Any]';

    const children = new Set<string>();

    for (let i = 0; i < token.children.length; i += 1) {
        children.add(convertTokenToPython(token.children[i]));
    }

    const childTypesArr = Array.from(children);

    if (childTypesArr.length === 1) return `List[${childTypesArr[0]}]`;

    childTypesArr.sort();

    return `List[Union[${childTypesArr.join(', ')}]]`;
}

function convertMap(token: MapToken): string {
    // NOTE: we use "Dict" instead of "dict" since "Dict" is backwards compatible
    // Users of python >= 3.9 can use dict instead
    if (!token?.children?.length) return 'Dict[Any, Any]';

    const children = new Set<string>();

    for (let i = 0; i < token.children.length; i += 1) {
        children.add(`${token.children[i].key}: ${convertTokenToPython(token.children[i])}`);
    }

    const childTypesArr = Array.from(children);

    childTypesArr.sort();

    return childTypesArr.join('\n');
}

export function convertTokenToPython(token: Token): string {
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
            return convertArray(token);

        case 'map':
            return convertMap(token);

        case 'unknown':
        default:
            return 'Any';
    }
}

export function generatePythonStruct(token: Token): string {
    return '';
}
