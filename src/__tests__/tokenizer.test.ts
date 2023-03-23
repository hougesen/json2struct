import { it, describe, expect } from 'vitest';
import { ArrayToken, MapToken, PrimitiveToken, tokenize } from '../tokenizer';

describe('primitives', () => {
    it('strings', () => {
        expect(tokenize('mads')).toEqual<PrimitiveToken>({ type: 'string' });

        expect(tokenize('was')).toEqual<PrimitiveToken>({ type: 'string' });

        expect(tokenize('here')).toEqual<PrimitiveToken>({ type: 'string' });
    });

    it('numbers', () => {
        expect(tokenize(1)).toEqual<PrimitiveToken>({ type: 'number' });

        expect(tokenize(2)).toEqual<PrimitiveToken>({ type: 'number' });

        expect(tokenize(3)).toEqual<PrimitiveToken>({ type: 'number' });
    });

    it('decimals should be marked', () => {
        expect(tokenize(1.2)).toEqual<PrimitiveToken>({ type: 'float' });

        expect(tokenize(3.21)).toEqual<PrimitiveToken>({ type: 'float' });
    });

    it('booleans', () => {
        expect(tokenize(true)).toEqual<PrimitiveToken>({ type: 'boolean' });

        expect(tokenize(false)).toEqual<PrimitiveToken>({ type: 'boolean' });
    });

    it('nulls', () => {
        expect(tokenize(null)).toEqual<PrimitiveToken>({ type: 'null' });
    });
});

describe('arrays', () => {
    it('empty arrays should have no children', () => {
        expect(tokenize([])).toEqual<ArrayToken>({ type: 'array', children: [] });
    });

    it('it should be possible to nest arrays', () => {
        expect(tokenize([[]])).toEqual<ArrayToken>({ type: 'array', children: [{ type: 'array', children: [] }] });

        expect(tokenize([[[]]])).toEqual<ArrayToken>({
            type: 'array',
            children: [{ type: 'array', children: [{ type: 'array', children: [] }] }],
        });
    });

    it('duplicate primitives should be removed from arrays', () => {
        expect(tokenize(['mads', 'was', 'here'])).toEqual<ArrayToken>({
            type: 'array',
            children: [{ type: 'string' }],
        });

        expect(tokenize([1, 2, 3])).toEqual<ArrayToken>({
            type: 'array',
            children: [{ type: 'number' }],
        });
    });

    it('arrays should support multiple types', () => {
        expect(tokenize(['mads', 1, 'mhouge.dk', 2, 3])).toEqual<ArrayToken>({
            type: 'array',
            children: [{ type: 'number' }, { type: 'string' }],
        });
    });

    it('duplicate maps should be removed from arrays', () => {
        expect(tokenize([{ key: 'mads' }, { key: 'was' }, { key: 'here' }])).toEqual<ArrayToken>({
            type: 'array',
            children: [{ type: 'map', children: [{ key: 'key', type: 'string' }] }],
        });
    });

    it('maps should be able to be mixed in arrays', () => {
        expect(tokenize([{ key: 1.23 }, { key: 'mads' }, { key: 1 }])).toEqual<ArrayToken>({
            type: 'array',
            children: [
                { type: 'map', children: [{ key: 'key', type: 'float' }] },
                { type: 'map', children: [{ key: 'key', type: 'string' }] },
                { type: 'map', children: [{ key: 'key', type: 'number' }] },
            ],
        });
    });
});

describe('maps', () => {
    it('empty maps should have no children', () => {
        expect(tokenize({})).toEqual<MapToken>({ type: 'map', children: [] });
    });

    it('maps should support primitive value children', () => {
        expect(tokenize({ key: 'value' })).toEqual<MapToken>({
            type: 'map',
            children: [{ type: 'string', key: 'key' }],
        });

        expect(
            tokenize({ stringKey: 'value', numberKey: 1, nullKey: null, trueKey: true, falseKey: false })
        ).toEqual<MapToken>({
            type: 'map',
            children: [
                { key: 'falseKey', type: 'boolean' },
                { key: 'nullKey', type: 'null' },
                { key: 'numberKey', type: 'number' },
                { key: 'stringKey', type: 'string' },
                { key: 'trueKey', type: 'boolean' },
            ],
        });
    });

    it('maps should be able to be nested', () => {
        expect(
            tokenize({
                a: {
                    b: {
                        c: {
                            d: {
                                key: 'value',
                            },
                        },
                    },
                },
            })
        ).toEqual<MapToken>({
            type: 'map',
            children: [
                {
                    key: 'a',
                    type: 'map',
                    children: [
                        {
                            key: 'b',
                            type: 'map',
                            children: [
                                {
                                    key: 'c',
                                    type: 'map',
                                    children: [
                                        {
                                            key: 'd',
                                            type: 'map',
                                            children: [
                                                {
                                                    key: 'key',
                                                    type: 'string',
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        });
    });

    it('it should be possible to mix map with arrays', () => {
        expect(tokenize({ arr: [1.23] })).toEqual<MapToken>({
            type: 'map',
            children: [{ key: 'arr', type: 'array', children: [{ type: 'float' }] }],
        });
    });

    it('maps should be sorted automatically', () => {
        expect(tokenize({ a: 'a', b: 'b', c: 'c' })).toEqual(tokenize({ c: 'c', b: 'b', a: 'a' }));
    });
});
