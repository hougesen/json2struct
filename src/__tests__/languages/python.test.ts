import { describe, expect, it } from 'vitest';

import { convertTokenToPython, generatePythonStruct } from '../../languages/python';
import { tokenize } from '../../tokenizer/';

describe('primitives', () => {
    it('strings', () => {
        expect(convertTokenToPython(tokenize('mads'), new Set(), new Map())).toEqual('str');
        expect(generatePythonStruct(tokenize('mads'))).toEqual('GeneratedStruct: str\n');

        expect(convertTokenToPython(tokenize('was'), new Set(), new Map())).toEqual('str');
        expect(generatePythonStruct(tokenize('was'))).toEqual('GeneratedStruct: str\n');

        expect(convertTokenToPython(tokenize('here'), new Set(), new Map())).toEqual('str');

        expect(generatePythonStruct(tokenize('here'))).toEqual('GeneratedStruct: str\n');
    });

    it('numbers', () => {
        expect(convertTokenToPython(tokenize(1), new Set(), new Map())).toEqual('int');
        expect(generatePythonStruct(tokenize(1))).toEqual('GeneratedStruct: int\n');

        expect(convertTokenToPython(tokenize(2), new Set(), new Map())).toEqual('int');
        expect(generatePythonStruct(tokenize(2))).toEqual('GeneratedStruct: int\n');

        expect(convertTokenToPython(tokenize(3), new Set(), new Map())).toEqual('int');
        expect(generatePythonStruct(tokenize(3))).toEqual('GeneratedStruct: int\n');
    });

    it('floats', () => {
        expect(convertTokenToPython(tokenize(1.2), new Set(), new Map())).toEqual('float');
        expect(generatePythonStruct(tokenize(1.2))).toEqual('GeneratedStruct: float\n');

        expect(convertTokenToPython(tokenize(3.21), new Set(), new Map())).toEqual('float');
        expect(generatePythonStruct(tokenize(3.21))).toEqual('GeneratedStruct: float\n');
    });

    it('booleans', () => {
        expect(convertTokenToPython(tokenize(true), new Set(), new Map())).toEqual('bool');
        expect(generatePythonStruct(tokenize(true))).toEqual('GeneratedStruct: bool\n');

        expect(convertTokenToPython(tokenize(false), new Set(), new Map())).toEqual('bool');
        expect(generatePythonStruct(tokenize(false))).toEqual('GeneratedStruct: bool\n');
    });

    it('nulls', () => {
        expect(convertTokenToPython(tokenize(null), new Set(), new Map())).toEqual('None');
        expect(generatePythonStruct(tokenize(null))).toEqual('GeneratedStruct: None\n');
    });
});

describe('arrays', () => {
    it('empty arrays should be List[Any]', () => {
        expect(convertTokenToPython(tokenize([]), new Set(), new Map())).toEqual('List[Any]');
        expect(generatePythonStruct(tokenize([]))).toEqual(
            'from typing import Any, List\n\n\nGeneratedStruct: List[Any]\n'
        );
    });

    it('it should be possible to nest arrays', () => {
        expect(convertTokenToPython(tokenize([[]]), new Set(), new Map())).toEqual('List[List[Any]]');

        expect(convertTokenToPython(tokenize([[[]]]), new Set(), new Map())).toEqual('List[List[List[Any]]]');

        expect(convertTokenToPython(tokenize([[['mhouge.dk']]]), new Set(), new Map())).toEqual(
            'List[List[List[str]]]'
        );

        expect(convertTokenToPython(tokenize([[[1.2]]]), new Set(), new Map())).toEqual('List[List[List[float]]]');

        expect(convertTokenToPython(tokenize([[[1]]]), new Set(), new Map())).toEqual('List[List[List[int]]]');

        expect(convertTokenToPython(tokenize([[[{}]]]), new Set(), new Map())).toEqual(
            'List[List[List[Dict[Any, Any]]]]'
        );
    });

    it('duplicate primitives should be removed from arrays', () => {
        expect(convertTokenToPython(tokenize(['mads', 'was', 'here']), new Set(), new Map())).toEqual('List[str]');

        expect(generatePythonStruct(tokenize(['mads', 'was', 'here']))).toEqual(
            'from typing import List\n\n\nGeneratedStruct: List[str]\n'
        );

        expect(convertTokenToPython(tokenize([1, 2, 3]), new Set(), new Map())).toEqual('List[int]');

        expect(generatePythonStruct(tokenize([1, 2, 3]))).toEqual(
            'from typing import List\n\n\nGeneratedStruct: List[int]\n'
        );
    });

    it('arrays should support multiple types', () => {
        expect(convertTokenToPython(tokenize(['mads', 1, 'mhouge.dk', 2, 3]), new Set(), new Map())).toEqual(
            'List[Union[int, str]]'
        );

        expect(generatePythonStruct(tokenize(['mads', 1, 'mhouge.dk', 2, 3]))).toEqual(
            'from typing import List, Union\n\n\nGeneratedStruct: List[Union[int, str]]\n'
        );
    });

    it('duplicate maps should be removed from arrays', () => {
        expect(
            convertTokenToPython(tokenize([{ key: 'mads' }, { key: 'was' }, { key: 'here' }]), new Set(), new Map())
        ).toEqual('List[SubStruct1]');

        expect(generatePythonStruct(tokenize([{ key: 'mads' }, { key: 'was' }, { key: 'here' }]))).toEqual(
            `from typing import List, TypedDict


class SubStruct1(TypedDict):
    key: str


GeneratedStruct: List[SubStruct1]
`
        );
    });

    it('maps should be able to be mixed in arrays', () => {
        expect(
            convertTokenToPython(tokenize([{ key: 1.23 }, { key: 'mads' }, { key: 1 }]), new Set(), new Map())
        ).toEqual('List[Union[SubStruct1, SubStruct2, SubStruct3]]');
    });
});

describe('maps', () => {
    it('empty maps should be Dict[Any, Any]', () => {
        expect(convertTokenToPython(tokenize({}), new Set(), new Map())).toEqual('Dict[Any, Any]');

        expect(generatePythonStruct(tokenize({}))).toEqual(
            'from typing import Any, Dict\n\n\nGeneratedStruct: Dict[Any, Any]\n'
        );
    });

    it('maps should support primitive value children', () => {
        expect(generatePythonStruct(tokenize({ key: 'value' }))).toEqual(
            `from typing import TypedDict


class GeneratedStruct(TypedDict):
    key: str
`
        );

        expect(
            generatePythonStruct(
                tokenize({
                    stringKey: 'value',
                    numberKey: 1,
                    nullKey: null,
                    trueKey: true,
                    falseKey: false,
                })
            )
        ).toEqual(
            `from typing import TypedDict


class GeneratedStruct(TypedDict):
    falseKey: bool
    nullKey: None
    numberKey: int
    stringKey: str
    trueKey: bool
`
        );
    });

    it('maps should be able to be nested', () => {
        const expectedResult = `from typing import TypedDict


class SubStruct1(TypedDict):
    key: str


class SubStruct2(TypedDict):
    d: SubStruct1


class SubStruct3(TypedDict):
    c: SubStruct2


class SubStruct4(TypedDict):
    b: SubStruct3


class GeneratedStruct(TypedDict):
    a: SubStruct4
`;
        expect(
            generatePythonStruct(
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
        ).toEqual(expectedResult);
    });

    it('it should be possible to mix map with arrays', async () => {
        expect(generatePythonStruct(tokenize({ arr: [1.23] }))).toEqual(
            'from typing import List, TypedDict\n\n\nclass GeneratedStruct(TypedDict):\n    arr: List[float]\n'
        );
    });

    it('maps should be sorted automatically', () => {
        expect(generatePythonStruct(tokenize({ a: 'a', b: 'b', c: 'c' }))).toEqual(
            generatePythonStruct(tokenize({ c: 'c', b: 'b', a: 'a' }))
        );
    });
});

describe('generatePythonStruct', () => {
    describe('base types', () => {
        it('only string', () => expect(generatePythonStruct(tokenize('mhouge.dk'))).toEqual('GeneratedStruct: str\n'));

        it('only number', () => expect(generatePythonStruct(tokenize(42))).toEqual('GeneratedStruct: int\n'));

        it('only float', () => expect(generatePythonStruct(tokenize(42.42))).toEqual('GeneratedStruct: float\n'));

        it('only null', () => expect(generatePythonStruct(tokenize(null))).toEqual('GeneratedStruct: None\n'));

        it('empty array', () =>
            expect(generatePythonStruct(tokenize([]))).toEqual(
                'from typing import Any, List\n\n\nGeneratedStruct: List[Any]\n'
            ));

        it('string array', () =>
            expect(generatePythonStruct(tokenize(['mhouge.dk']))).toEqual(
                'from typing import List\n\n\nGeneratedStruct: List[str]\n'
            ));

        it('number array', () =>
            expect(generatePythonStruct(tokenize([42]))).toEqual(
                'from typing import List\n\n\nGeneratedStruct: List[int]\n'
            ));

        // NOTE: should this be switched to Array<unknown>?
        it('null array', () =>
            expect(generatePythonStruct(tokenize([null]))).toEqual(
                'from typing import List\n\n\nGeneratedStruct: List[None]\n'
            ));

        it('empty matrix', () =>
            expect(generatePythonStruct(tokenize([[], [], []]))).toEqual(
                'from typing import Any, List\n\n\nGeneratedStruct: List[List[Any]]\n'
            ));

        it('mixed array', () => {
            expect(generatePythonStruct(tokenize([1, 'mhouge.dk']))).toEqual(
                'from typing import List, Union\n\n\nGeneratedStruct: List[Union[int, str]]\n'
            );

            expect(generatePythonStruct(tokenize([1, 'mhouge.dk', null]))).toEqual(
                'from typing import List, Union\n\n\nGeneratedStruct: List[Union[None, int, str]]\n'
            );
        });
    });

    describe('objects', () => {
        it('empty dict', () =>
            expect(generatePythonStruct(tokenize({}))).toEqual(
                'from typing import Any, Dict\n\n\nGeneratedStruct: Dict[Any, Any]\n'
            ));

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
                'from typing import TypedDict\n\n\nclass GeneratedStruct(TypedDict):\n    printWidth: int\n    semi: bool\n    singleQuote: bool\n    tabWidth: int\n    useTabs: bool\n';

            expect(generatePythonStruct(tokenize(JSON.parse(jsonStr)))).toEqual(expectedResult);
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

            const expectedResult = `from typing import List, TypedDict


class SubStruct1(TypedDict):
    length: int
    message: str
    retry_after: int


class GeneratedStruct(TypedDict):
    data: List[SubStruct1]
`;

            expect(generatePythonStruct(tokenize(JSON.parse(jsonStr)))).toEqual(expectedResult);
        });
    });
});
