export type TypeScriptTypes = 'string' | 'number' | 'object' | 'null' | 'boolean' | 'unknown';

function typeofToType(value: unknown): TypeScriptTypes | 'Array' {
    // TODO: decide if this should be changed?
    if (value === null) return 'null';

    let t = typeof value;

    if (t === 'boolean' || t === 'number' || t === 'string') return t;

    if (t === 'object') {
        if (Array.isArray(value)) return 'Array';

        return 'object';
    }

    return 'unknown';
}

function parseToTypeScript(text: any) {
    let textType = typeofToType(text);

    if ('Array' === textType) {
        let values = new Set<string>();

        for (let i = 0; i < text.length; i += 1) {
            let t = typeofToType(text?.[i]);

            if (t === 'Array' || t === 'object') {
                values.add(parseToTypeScript(text[i] as unknown[] | {}));
            } else {
                values.add(t);
            }
        }

        let inner = values?.size ? Array.from(values).join('|') : 'unknown';

        return 'Array<' + inner + '>';
    }

    if ('object' === textType) {
        const entries = Object.entries(text);

        if (!entries?.length) {
            return 'Record<string,unknown>';
        }

        entries.sort((a, b) => (a[0] < b[0] ? -1 : 1));
        let inner = '{';
        for (const [key, value] of entries) {
            inner += '"' + key + '"';
            inner += ':';

            const t = typeofToType(value);

            if (t === 'Array' || t === 'object') {
                inner += parseToTypeScript(value as {} | unknown[]);
            } else {
                inner += t;
            }
            inner += ';';
        }

        return inner + '}';
    }

    return textType;
}

export function handleParseToTS(content: any) {
    return 'type JSON2TSGeneratedStruct=' + parseToTypeScript(content) + ';';
}
