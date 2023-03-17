import { it, describe, expect } from 'vitest';
import { handleParseToTS } from '../../typescript';

describe('json2ts', async () => {
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

    it('array with single record in it', async () => {
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
