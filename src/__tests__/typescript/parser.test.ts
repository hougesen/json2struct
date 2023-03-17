import { describe, expect, it } from 'vitest';

import { handleParseToTS, JSONToTypeScriptOptions } from '../../typescript/index';

describe('json2ts', async () => {
    describe('arrays', () => {
        it('only string', () => expect(handleParseToTS('mhouge.dk')).toEqual('type JSON2TSGeneratedStruct=string;'));

        it('only number', () => expect(handleParseToTS(42)).toEqual('type JSON2TSGeneratedStruct=number;'));

        it('only null', () => expect(handleParseToTS(null)).toEqual('type JSON2TSGeneratedStruct=null;'));

        it('only string', () => expect(handleParseToTS('mhouge.dk')).toEqual('type JSON2TSGeneratedStruct=string;'));

        it('empty array', () => expect(handleParseToTS([])).toEqual('type JSON2TSGeneratedStruct=Array<unknown>;'));

        it('string array', () =>
            expect(handleParseToTS(['mhouge.dk'])).toEqual('type JSON2TSGeneratedStruct=Array<string>;'));

        it('number array', () => expect(handleParseToTS([42])).toEqual('type JSON2TSGeneratedStruct=Array<number>;'));

        // NOTE: should this be switched to Array<unknown>?
        it('null array', () => expect(handleParseToTS([null])).toEqual('type JSON2TSGeneratedStruct=Array<null>;'));

        it('empty matrix', () =>
            expect(handleParseToTS([[], [], []])).toEqual('type JSON2TSGeneratedStruct=Array<Array<unknown>>;'));

        it('mixed array', () => {
            expect(handleParseToTS([1, 'mhouge.dk'])).toEqual('type JSON2TSGeneratedStruct=Array<number|string>;');

            expect(handleParseToTS([1, 'mhouge.dk', null])).toEqual(
                'type JSON2TSGeneratedStruct=Array<null|number|string>;'
            );
        });
    });

    describe('objects', () => {
        it('mixed record', () => {
            let json = `
                {
                    "data": [
                        {
                            "length" : 60,
                            "message" : "",
                            "retry_after" : 480
                        }
                    ]
                }`;

            let expectedResult =
                'type JSON2TSGeneratedStruct={"data":Array<{"length":number;"message":string;"retry_after":number;}>;};';

            expect(handleParseToTS(JSON.parse(json))).toEqual(expectedResult);
        });
    });

    describe('options', () => {
        it('overwrite default empty array value to any', () =>
            expect(handleParseToTS([], { overwrites: { array: 'any' } })).toEqual(
                'type JSON2TSGeneratedStruct=Array<any>;'
            ));

        it('overwrite default empty array value to string', () =>
            expect(handleParseToTS([], { overwrites: { array: 'string' } })).toEqual(
                'type JSON2TSGeneratedStruct=Array<string>;'
            ));

        it('overwrite default empty array value to number', () =>
            expect(handleParseToTS([], { overwrites: { array: 'number' } })).toEqual(
                'type JSON2TSGeneratedStruct=Array<number>;'
            ));

        it('overwrite null values to any', () =>
            expect(handleParseToTS(null, { overwrites: { null: 'any' } })).toEqual('type JSON2TSGeneratedStruct=any;'));

        it('overwrite null values to unknown', () =>
            expect(handleParseToTS(null, { overwrites: { null: 'unknown' } })).toEqual(
                'type JSON2TSGeneratedStruct=unknown;'
            ));

        it('use Set instead of Array', () => {
            const options: JSONToTypeScriptOptions = { useSetInsteadOfArray: true };

            expect(handleParseToTS([], options)).toEqual('type JSON2TSGeneratedStruct=Set<unknown>;');

            expect(handleParseToTS([[]], options)).toEqual('type JSON2TSGeneratedStruct=Set<Set<unknown>>;');

            expect(handleParseToTS([1], options)).toEqual('type JSON2TSGeneratedStruct=Set<number>;');
            expect(handleParseToTS([1, 'mhouge.dk'], options)).toEqual(
                'type JSON2TSGeneratedStruct=Set<number|string>;'
            );

            expect(handleParseToTS([], options)).toEqual('type JSON2TSGeneratedStruct=Set<unknown>;');
        });
    });
});
