import { describe, expect, it } from 'vitest';

import { convertTokenToTypeScript, generateTypeScriptType } from '../../languages/typescript';
import { tokenize } from '../../tokenizer';

describe('primitives', () => {
    it('strings', () => {
        expect(convertTokenToTypeScript(tokenize('mads'))).toEqual('string');

        expect(convertTokenToTypeScript(tokenize('was'))).toEqual('string');

        expect(convertTokenToTypeScript(tokenize('here'))).toEqual('string');
    });

    it('numbers', () => {
        expect(convertTokenToTypeScript(tokenize(1))).toEqual('number');

        expect(convertTokenToTypeScript(tokenize(2))).toEqual('number');

        expect(convertTokenToTypeScript(tokenize(3))).toEqual('number');
    });

    it('decimals should be converted to number', () => {
        expect(convertTokenToTypeScript(tokenize(1.2))).toEqual('number');

        expect(convertTokenToTypeScript(tokenize(3.21))).toEqual('number');
    });

    it('booleans', () => {
        expect(convertTokenToTypeScript(tokenize(true))).toEqual('boolean');

        expect(convertTokenToTypeScript(tokenize(false))).toEqual('boolean');
    });

    it('nulls', () => {
        expect(convertTokenToTypeScript(tokenize(null))).toEqual('null');
    });
});

describe('arrays', () => {
    it('empty arrays should be Array<unknown>', () => {
        expect(convertTokenToTypeScript(tokenize([]))).toEqual('Array<unknown>');
    });

    it('it should be possible to nest arrays', () => {
        expect(convertTokenToTypeScript(tokenize([[]]))).toEqual('Array<Array<unknown>>');

        expect(convertTokenToTypeScript(tokenize([[[]]]))).toEqual('Array<Array<Array<unknown>>>');

        expect(convertTokenToTypeScript(tokenize([[['mhouge.dk']]]))).toEqual('Array<Array<Array<string>>>');

        expect(convertTokenToTypeScript(tokenize([[[1.2]]]))).toEqual('Array<Array<Array<number>>>');

        expect(convertTokenToTypeScript(tokenize([[[1]]]))).toEqual('Array<Array<Array<number>>>');

        expect(convertTokenToTypeScript(tokenize([[[{}]]]))).toEqual('Array<Array<Array<Record<string, unknown>>>>');
    });

    it('duplicate primitives should be removed from arrays', () => {
        expect(convertTokenToTypeScript(tokenize(['mads', 'was', 'here']))).toEqual('Array<string>');

        expect(convertTokenToTypeScript(tokenize([1, 2, 3]))).toEqual('Array<number>');
    });

    it('arrays should support multiple types', () => {
        expect(convertTokenToTypeScript(tokenize(['mads', 1, 'mhouge.dk', 2, 3]))).toEqual('Array<number | string>');
    });

    it('duplicate maps should be removed from arrays', () => {
        expect(convertTokenToTypeScript(tokenize([{ key: 'mads' }, { key: 'was' }, { key: 'here' }]))).toEqual(
            'Array<{ key: string }>'
        );
    });

    it('maps should be able to be mixed in arrays', () => {
        expect(convertTokenToTypeScript(tokenize([{ key: 1.23 }, { key: 'mads' }, { key: 1 }]))).toEqual(
            'Array<{ key: number } | { key: string }>'
        );
    });
});

describe('maps', () => {
    it('empty maps should be Record<string,unknown>', () => {
        expect(convertTokenToTypeScript(tokenize({}))).toEqual('Record<string, unknown>');
    });

    it('maps should support primitive value children', () => {
        expect(convertTokenToTypeScript(tokenize({ key: 'value' }))).toEqual('{ key: string }');

        expect(
            convertTokenToTypeScript(
                tokenize({
                    stringKey: 'value',
                    numberKey: 1,
                    nullKey: null,
                    trueKey: true,
                    falseKey: false,
                })
            )
        ).toEqual('{ falseKey: boolean; nullKey: null; numberKey: number; stringKey: string; trueKey: boolean }');
    });

    it('maps should be able to be nested', () => {
        expect(
            convertTokenToTypeScript(
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
            )
        ).toEqual('{ a: { b: { c: { d: { key: string } } } } }');
    });

    it('it should be possible to mix map with arrays', () => {
        expect(convertTokenToTypeScript(tokenize({ arr: [1.23] }))).toEqual('{ arr: Array<number> }');
    });

    it('maps should be sorted automatically', () => {
        expect(convertTokenToTypeScript(tokenize({ a: 'a', b: 'b', c: 'c' }))).toEqual(
            convertTokenToTypeScript(tokenize({ c: 'c', b: 'b', a: 'a' }))
        );
    });
});

describe('json2ts', async () => {
    describe('arrays', () => {
        it('only string', () =>
            expect(generateTypeScriptType(tokenize('mhouge.dk'))).toEqual('type GeneratedStruct = string'));

        it('only number', () => expect(generateTypeScriptType(tokenize(42))).toEqual('type GeneratedStruct = number'));

        it('only null', () => expect(generateTypeScriptType(tokenize(null))).toEqual('type GeneratedStruct = null'));

        it('only string', () =>
            expect(generateTypeScriptType(tokenize('mhouge.dk'))).toEqual('type GeneratedStruct = string'));

        it('empty array', () =>
            expect(generateTypeScriptType(tokenize([]))).toEqual('type GeneratedStruct = Array<unknown>'));

        it('string array', () =>
            expect(generateTypeScriptType(tokenize(['mhouge.dk']))).toEqual('type GeneratedStruct = Array<string>'));

        it('number array', () =>
            expect(generateTypeScriptType(tokenize([42]))).toEqual('type GeneratedStruct = Array<number>'));

        // NOTE: should this be switched to Array<unknown>?
        it('null array', () =>
            expect(generateTypeScriptType(tokenize([null]))).toEqual('type GeneratedStruct = Array<null>'));

        it('empty matrix', () =>
            expect(generateTypeScriptType(tokenize([[], [], []]))).toEqual(
                'type GeneratedStruct = Array<Array<unknown>>'
            ));

        it('mixed array', () => {
            expect(generateTypeScriptType(tokenize([1, 'mhouge.dk']))).toEqual(
                'type GeneratedStruct = Array<number | string>'
            );

            expect(generateTypeScriptType(tokenize([1, 'mhouge.dk', null]))).toEqual(
                'type GeneratedStruct = Array<null | number | string>'
            );
        });
    });

    describe('objects', () => {
        it('object with only primitives', () => {
            const jsonStr = `
                {
                    "tabWidth": 4,
                    "useTabs": false,
                    "printWidth": 120,
                    "singleQuote": true,
                    "semi": true
                }`;

            const expectedResult =
                'type GeneratedStruct = { printWidth: number; semi: boolean; singleQuote: boolean; tabWidth: number; useTabs: boolean }';

            expect(generateTypeScriptType(tokenize(JSON.parse(jsonStr)))).toEqual(expectedResult);
        });

        it('mixed record', () => {
            const jsonStr = `
                {
                    "data": [
                        {
                            "length" : 60,
                            "message" : "",
                            "retry_after" : 480
                        }
                    ]
                }`;

            const expectedResult =
                'type GeneratedStruct = { data: Array<{ length: number; message: string; retry_after: number }> }';

            expect(generateTypeScriptType(tokenize(JSON.parse(jsonStr)))).toEqual(expectedResult);
        });
    });
});
