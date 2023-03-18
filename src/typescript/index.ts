import { containerSort, keySort } from '../shared/sorting';

export type TypeScriptTypes = 'string' | 'number' | 'object' | 'null' | 'boolean' | 'unknown' | 'any';

export interface JSONToTypeScriptOptions {
    useSetInsteadOfArray?: boolean;

    overwrites?: {
        /**
         * @summary overwrite the type of null values
         * @default null
         */
        null?: TypeScriptTypes;

        /**
         * @summary used to overwrite the 'unknown' type of empty arrays from Array<unknown> into Array<T>
         * @default Array<unknown>
         */
        array?: TypeScriptTypes;

        /**
         * @summary used to overwrite the 'unknown' type of empty objects from Record<string, unknown> into Record<string, T>
         * @default Record<string, unknown>
         */
        object?: TypeScriptTypes;
    };
}

function typeofToType(value: unknown): TypeScriptTypes | 'Array' {
    // TODO: decide if this should be changed?
    if (value === null) return 'null';

    const t = typeof value;

    if (t === 'boolean' || t === 'number' || t === 'string') return t;

    if (t === 'object') {
        if (Array.isArray(value)) return 'Array';

        return 'object';
    }

    return 'unknown';
}

function parseToTypeScript(text: unknown, options?: JSONToTypeScriptOptions) {
    if (text === null) return options?.overwrites?.null ?? 'null';

    if (text === undefined) return 'unknown';

    if (Array.isArray(text)) {
        const values = new Set<string>();

        for (let i = 0; i < text.length; i += 1) {
            const t = typeofToType(text?.[i]);

            switch (t) {
                case 'Array':
                case 'object':
                    values.add(parseToTypeScript(text[i], options));
                    break;
                case 'null':
                    values.add(options?.overwrites?.null ?? 'null');
                    break;
                default:
                    values.add(t);
                    break;
            }
        }

        const inner = values?.size
            ? Array.from(values).sort(containerSort).join('|')
            : options?.overwrites?.array ?? 'unknown';

        return (options?.useSetInsteadOfArray ? 'Set' : 'Array') + '<' + inner + '>';
    }

    if (typeof text === 'object') {
        const entries = Object.entries(text);

        if (!entries?.length) {
            return 'Record<string,' + options?.overwrites?.object ?? 'unknown' + '>';
        }

        entries.sort((a, b) => keySort(a[0], b[0]));

        let inner = '{';

        for (const [key, value] of entries) {
            inner += '"' + key + '":';

            const t = typeofToType(value);

            if (t === 'Array' || t === 'object') {
                inner += parseToTypeScript(value, options);
            } else {
                inner += t;
            }

            inner += ';';
        }

        return inner + '}';
    }

    return typeofToType(text);
}

export function handleParseToTS(content: unknown, options?: JSONToTypeScriptOptions) {
    return 'type JSON2TSGeneratedStruct=' + parseToTypeScript(content, options) + ';';
}
