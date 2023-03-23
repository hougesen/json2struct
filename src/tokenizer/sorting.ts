import { Token } from '../tokenizer';

export function sortChildren(a: Token, b: Token): 1 | -1 {
    if (a?.key && b?.key && a?.key !== b?.key) {
        return a.key < b.key ? -1 : 1;
    }

    return a.type < b.type ? -1 : 1;
}
