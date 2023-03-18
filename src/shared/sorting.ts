export function keySort(a: string, b: string) {
    return a < b ? -1 : 1;
}

export function containerSort(a: string, b: string): number {
    if (a?.length === b.length) return keySort(a, b);

    return a.length < b.length ? -1 : 1;
}
