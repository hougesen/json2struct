import { it, describe, expect } from 'vitest';
import { tokenize } from '../../tokenizer';
import { convertTokenToTypeScript } from '../../languages/typescript';

describe('primitives', () => {
    it('strings', () => {
        expect(convertTokenToTypeScript(tokenize('mads'))).toEqual('string');

        expect(convertTokenToTypeScript(tokenize('was'))).toEqual('string');

        expect(convertTokenToTypeScript(tokenize('here'))).toEqual('string');
    });

    it('numbers', () => {
        expect(convertTokenToTypeScript(tokenize(1))).toEqual('number');

        expect(tokenize(2)).toEqual('number');

        expect(tokenize(3)).toEqual('number');
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

        expect(convertTokenToTypeScript(tokenize([[[{}]]]))).toEqual('Array<Array<Array<Record<string,unknown>>>>');
    });

    it('duplicate primitives should be removed from arrays', () => {
        expect(convertTokenToTypeScript(tokenize(['mads', 'was', 'here']))).toEqual('Array<string>');

        expect(convertTokenToTypeScript(tokenize([1, 2, 3]))).toEqual('Array<number>');
    });

    it('arrays should support multiple types', () => {
        expect(convertTokenToTypeScript(tokenize(['mads', 1, 'mhouge.dk', 2, 3]))).toEqual('Array<number|string>');
    });

    it('duplicate maps should be removed from arrays', () => {
        expect(convertTokenToTypeScript(tokenize([{ key: 'mads' }, { key: 'was' }, { key: 'here' }]))).toEqual(
            'Array<{key:string}>'
        );
    });

    it('maps should be able to be mixed in arrays', () => {
        expect(convertTokenToTypeScript(tokenize([{ key: 1.23 }, { key: 'mads' }, { key: 1 }]))).toEqual(
            'Array<{key:float}|{key:string}|{key:number}>'
        );
    });
});

describe('maps', () => {
    it('empty maps should be Record<string,unknown>', () => {
        expect(convertTokenToTypeScript(tokenize({}))).toEqual('Record<string,unknown>');
    });

    it('maps should support primitive value children', () => {
        expect(convertTokenToTypeScript(tokenize({ key: 'value' }))).toEqual('{key:string}');

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
        ).toEqual('{falseKey:boolean;nullKey:null;numberKey:number;stringKey:string;trueKey:string}');
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
        ).toEqual('{a:{b:{c:{d:{key:string}}}}}');
    });

    it('it should be possible to mix map with arrays', () => {
        expect(convertTokenToTypeScript(tokenize({ arr: [1.23] }))).toEqual('{arr:Array<number>}');
    });

    it('maps should be sorted automatically', () => {
        expect(convertTokenToTypeScript(tokenize({ a: 'a', b: 'b', c: 'c' }))).toEqual(
            convertTokenToTypeScript(tokenize({ c: 'c', b: 'b', a: 'a' }))
        );
    });
});
