import { RecordTokenMissingKey } from '../errors';
import { ArrayToken, MapToken, Token } from '../tokenizer';

function convertArray(token: ArrayToken): string {
    if (!token?.children?.length) return 'Array<unknown>';

    const children = new Set<string>();

    for (let i = 0; i < token.children.length; i += 1) {
        children.add(convertTokenToTypeScript(token.children[i]));
    }

    const childTypes = Array.from(children);

    childTypes.sort();

    return `Array<${childTypes?.length ? childTypes.join(' | ') : 'unknown'}>`;
}

function convertMap(token: MapToken): string {
    if (!token?.children?.length) return 'Record<string, unknown>';

    const children = new Set<string>();

    token?.children?.forEach((child) => {
        // empty keys are allowed in TypeScript
        if (child.key === undefined) throw new RecordTokenMissingKey();

        children.add(`"${child.key}": ${convertTokenToTypeScript(child)}`);
    });

    const childTypesArr = Array.from(children);

    childTypesArr.sort();

    return `{ ${childTypesArr?.join('; ')} }`;
}

export function convertTokenToTypeScript(token: Token): string {
    switch (token.type) {
        case 'array':
            return convertArray(token);

        case 'map':
            return convertMap(token);

        case 'float':
            return 'number';

        default:
            return token.type;
    }
}

export function generateTypeScriptType(token: Token): string {
    return `type GeneratedStruct = ${convertTokenToTypeScript(token)}`;
}
