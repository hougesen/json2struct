import { expect, it, describe } from 'vitest';
import { tokenize } from '../../tokenizer/';
import { generatePythonStruct, convertTokenToPython } from '../../languages/python';

describe('primitives', () => {
    it('strings', () => {
        expect(convertTokenToPython(tokenize('mads'))).toEqual('str');

        expect(convertTokenToPython(tokenize('was'))).toEqual('str');

        expect(convertTokenToPython(tokenize('here'))).toEqual('str');
    });

    it('numbers', () => {
        expect(convertTokenToPython(tokenize(1))).toEqual('int');

        expect(convertTokenToPython(tokenize(2))).toEqual('int');

        expect(convertTokenToPython(tokenize(3))).toEqual('int');
    });

    it('floats', () => {
        expect(convertTokenToPython(tokenize(1.2))).toEqual('float');

        expect(convertTokenToPython(tokenize(3.21))).toEqual('float');
    });

    it('booleans', () => {
        expect(convertTokenToPython(tokenize(true))).toEqual('bool');

        expect(convertTokenToPython(tokenize(false))).toEqual('bool');
    });

    it('nulls', () => {
        expect(convertTokenToPython(tokenize(null))).toEqual('None');
    });
});

describe('arrays', () => {
    it('empty arrays should be List[Any]', () => {
        expect(convertTokenToPython(tokenize([]))).toEqual('List[Any]');
    });

    it('it should be possible to nest arrays', () => {
        expect(convertTokenToPython(tokenize([[]]))).toEqual('List[List[Any]]');

        expect(convertTokenToPython(tokenize([[[]]]))).toEqual('List[List[List[Any]]]');

        expect(convertTokenToPython(tokenize([[['mhouge.dk']]]))).toEqual('List[List[List[str]]]');

        expect(convertTokenToPython(tokenize([[[1.2]]]))).toEqual('List[List[List[float]]]');

        expect(convertTokenToPython(tokenize([[[1]]]))).toEqual('List[List[List[int]]]');

        expect(convertTokenToPython(tokenize([[[{}]]]))).toEqual('List[List[List[Dict[Any, Any]]]]');
    });

    it('duplicate primitives should be removed from arrays', () => {
        expect(convertTokenToPython(tokenize(['mads', 'was', 'here']))).toEqual('List[str]');

        expect(convertTokenToPython(tokenize([1, 2, 3]))).toEqual('List[int]');
    });

    it('arrays should support multiple types', () => {
        expect(convertTokenToPython(tokenize(['mads', 1, 'mhouge.dk', 2, 3]))).toEqual('List[Union[int, str]]');
    });

    it.todo('duplicate maps should be removed from arrays', () => {
        expect(convertTokenToPython(tokenize([{ key: 'mads' }, { key: 'was' }, { key: 'here' }]))).toEqual(
            'Array<{ "key": string }>'
        );
    });

    it.todo('maps should be able to be mixed in arrays', () => {
        expect(convertTokenToPython(tokenize([{ key: 1.23 }, { key: 'mads' }, { key: 1 }]))).toEqual(
            'Array<{ "key": number } | { "key": string }>'
        );
    });
});

describe('maps', () => {
    it('empty maps should be Dict[Any, Any]', () => {
        expect(convertTokenToPython(tokenize({}))).toEqual('Dict[Any, Any]');
    });

    it('maps should support primitive value children', () => {
        expect(convertTokenToPython(tokenize({ key: 'value' }))).toEqual('key: str');

        expect(
            convertTokenToPython(
                tokenize({
                    stringKey: 'value',
                    numberKey: 1,
                    nullKey: null,
                    trueKey: true,
                    falseKey: false,
                })
            )
        ).toEqual('falseKey: bool\nnullKey: None\nnumberKey: int\nstringKey: str\ntrueKey: bool');
    });

    it.todo('maps should be able to be nested', () => {
        expect(
            convertTokenToPython(
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
        ).toEqual('{ "a": { "b": { "c": { "d": { "key": string } } } } }');
    });

    it('it should be possible to mix map with arrays', () => {
        expect(convertTokenToPython(tokenize({ arr: [1.23] }))).toEqual('arr: List[float]');
    });

    it('maps should be sorted automatically', () => {
        expect(convertTokenToPython(tokenize({ a: 'a', b: 'b', c: 'c' }))).toEqual(
            convertTokenToPython(tokenize({ c: 'c', b: 'b', a: 'a' }))
        );
    });
});

describe.todo('generatePythonStruct', () => {
    describe('base types', () => {
        it('only string', () => expect(generatePythonStruct(tokenize('mhouge.dk'))).toEqual('GeneratedStruct = str'));

        it('only number', () => expect(generatePythonStruct(tokenize(42))).toEqual('GeneratedStruct = int'));

        it('only float', () => expect(generatePythonStruct(tokenize(42.42))).toEqual('GeneratedStruct = float'));

        it('only null', () => expect(generatePythonStruct(tokenize(null))).toEqual('GeneratedStruct = null'));

        it('empty array', () => expect(generatePythonStruct(tokenize([]))).toEqual('GeneratedStruct = List[Any]'));

        it('string array', () =>
            expect(generatePythonStruct(tokenize(['mhouge.dk']))).toEqual('GeneratedStruct = List[str]'));

        it('number array', () => expect(generatePythonStruct(tokenize([42]))).toEqual('GeneratedStruct = List[int]'));

        // NOTE: should this be switched to Array<unknown>?
        it('null array', () => expect(generatePythonStruct(tokenize([null]))).toEqual('GeneratedStruct = List[None]'));

        it('empty matrix', () =>
            expect(generatePythonStruct(tokenize([[], [], []]))).toEqual('GeneratedStruct = List[List[Any]]'));

        it('mixed array', () => {
            expect(generatePythonStruct(tokenize([1, 'mhouge.dk']))).toEqual('GeneratedStruct = List[Union[int, str]]');

            expect(generatePythonStruct(tokenize([1, 'mhouge.dk', null]))).toEqual(
                'GeneratedStruct = List[Union[None, int, str>'
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
                'class GeneratedStruct(TypedDict):\n  printWidth:int\n  semi: bool\n  singleQuote: bool\n  tabWidth: int\n  useTabs: bool';

            expect(generatePythonStruct(tokenize(JSON.parse(jsonStr)))).toEqual(expectedResult);
        });

        it.todo('mixed record', () => {
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
                'type GeneratedStruct = { "data": Array<{ "length": number; "message": string; "retry_after": number }> }';

            expect(generatePythonStruct(tokenize(JSON.parse(jsonStr)))).toEqual(expectedResult);
        });
    });
});
