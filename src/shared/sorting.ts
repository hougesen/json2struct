import { Token } from '../tokenizer';

export function keySort(a: string, b: string) {
    return a < b ? -1 : 1;
}

export function containerSort(a: string, b: string): number {
    if (a?.length === b.length) return keySort(a, b);

    return a.length < b.length ? -1 : 1;
}

export function sortChildren(a: Token, b: Token): 1 | -1 {
    if (a?.key && b?.key && a?.key !== b?.key) {
        return a.key < b.key ? -1 : 1;
    }

    return a.type < b.type ? -1 : 1;
}
