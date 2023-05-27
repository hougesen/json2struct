import { sortChildren } from './sorting';

export type PrimitiveToken = { key?: string; type: 'number' | 'string' | 'float' | 'boolean' | 'null' | 'unknown' };

export type MapToken = { key?: string; type: 'map'; children?: Token[] };

export type ArrayToken = { key?: string; type: 'array'; children?: Token[] };

export type Token = PrimitiveToken | MapToken | ArrayToken;

function typeofToType(value?: unknown): PrimitiveToken['type'] | MapToken['type'] | ArrayToken['type'] {
    // TODO: decide if this should be changed?
    if (value === null) return 'null';

    switch (typeof value) {
        case 'number':
            return Number.isInteger(value) ? 'number' : 'float';

        case 'string':
            return 'string';

        case 'boolean':
            return 'boolean';

        case 'object':
            if (Array.isArray(value)) return 'array';

            return 'map';

        default:
            return 'unknown';
    }
}

export function tokenize(content: unknown | unknown[], key?: string): Token {
    const t = typeofToType(content);

    const base: { key?: string } = {};

    if (key?.length) base.key = key;

    switch (t) {
        case 'array': {
            const children = <Token[]>[];

            const seenTokens = new Set<string>();

            // TODO: figure out how to avoid typecasting

            for (let i = 0; i < (<unknown[]>content).length; i += 1) {
                const token = tokenize((<unknown[]>content)[i]);

                // used to make sure we don't get duplicate children
                const tokenJSON = JSON.stringify(token);

                if (!seenTokens.has(tokenJSON)) {
                    seenTokens.add(tokenJSON);
                    children.push(token);
                }
            }

            if (children.length) children.sort(sortChildren);

            return <ArrayToken>{
                ...base,
                type: 'array',
                children,
            };
        }

        case 'map': {
            const children = Object.entries(content as Record<string, unknown>).map(([k, v]) => tokenize(v, k));

            if (children.length) children.sort(sortChildren);

            return <MapToken>{
                ...base,
                type: 'map',
                children,
            };
        }

        default: {
            return <PrimitiveToken>{
                ...base,
                type: t,
            };
        }
    }
}
