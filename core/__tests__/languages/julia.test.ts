import { describe, expect, it } from 'vitest';
import { convertTokenToJulia, generateJuliaStruct } from '../../languages/julia';
import { tokenize } from '../../tokenizer';

describe('primitives', () => {
    it('strings', () => {
        expect(convertTokenToJulia(tokenize('mads'), new Map())).toEqual('String');
        expect(generateJuliaStruct(tokenize('mads'))).toEqual('const GeneratedStruct = String\n');

        expect(convertTokenToJulia(tokenize('was'), new Map())).toEqual('String');
        expect(generateJuliaStruct(tokenize('was'))).toEqual('const GeneratedStruct = String\n');

        expect(convertTokenToJulia(tokenize('here'), new Map())).toEqual('String');

        expect(generateJuliaStruct(tokenize('here'))).toEqual('const GeneratedStruct = String\n');
    });

    it('numbers', () => {
        expect(convertTokenToJulia(tokenize(1), new Map())).toEqual('Int64');
        expect(generateJuliaStruct(tokenize(1))).toEqual('const GeneratedStruct = Int64\n');

        expect(convertTokenToJulia(tokenize(2), new Map())).toEqual('Int64');
        expect(generateJuliaStruct(tokenize(2))).toEqual('const GeneratedStruct = Int64\n');

        expect(convertTokenToJulia(tokenize(3), new Map())).toEqual('Int64');
        expect(generateJuliaStruct(tokenize(3))).toEqual('const GeneratedStruct = Int64\n');
    });

    it('floats', () => {
        expect(convertTokenToJulia(tokenize(1.2), new Map())).toEqual('Float64');
        expect(generateJuliaStruct(tokenize(1.2))).toEqual('const GeneratedStruct = Float64\n');

        expect(convertTokenToJulia(tokenize(3.21), new Map())).toEqual('Float64');
        expect(generateJuliaStruct(tokenize(3.21))).toEqual('const GeneratedStruct = Float64\n');
    });

    it('booleans', () => {
        expect(convertTokenToJulia(tokenize(true), new Map())).toEqual('Bool');
        expect(generateJuliaStruct(tokenize(true))).toEqual('const GeneratedStruct = Bool\n');

        expect(convertTokenToJulia(tokenize(false), new Map())).toEqual('Bool');
        expect(generateJuliaStruct(tokenize(false))).toEqual('const GeneratedStruct = Bool\n');
    });

    it('nulls', () => {
        expect(convertTokenToJulia(tokenize(null), new Map())).toEqual('Nothing');
        expect(generateJuliaStruct(tokenize(null))).toEqual('const GeneratedStruct = Nothing\n');
    });
});

describe('arrays', () => {
    it('empty arrays should be Array[Any}', () => {
        expect(convertTokenToJulia(tokenize([]), new Map())).toEqual('Array{Any}');
        expect(generateJuliaStruct(tokenize([]))).toEqual('const GeneratedStruct = Array{Any}\n');
    });

    it('it should be possible to nest arrays', () => {
        expect(convertTokenToJulia(tokenize([[]]), new Map())).toEqual('Array{Array{Any}}');

        expect(convertTokenToJulia(tokenize([[[]]]), new Map())).toEqual('Array{Array{Array{Any}}}');

        expect(convertTokenToJulia(tokenize([[['mhouge.dk']]]), new Map())).toEqual('Array{Array{Array{String}}}');

        expect(convertTokenToJulia(tokenize([[[1.2]]]), new Map())).toEqual('Array{Array{Array{Float64}}}');

        expect(convertTokenToJulia(tokenize([[[1]]]), new Map())).toEqual('Array{Array{Array{Int64}}}');

        expect(convertTokenToJulia(tokenize([[[{}]]]), new Map())).toEqual('Array{Array{Array{Dict{Any,Any}}}}');
    });

    it('duplicate primitives should be removed from arrays', () => {
        expect(convertTokenToJulia(tokenize(['mads', 'was', 'here']), new Map())).toEqual('Array{String}');

        expect(generateJuliaStruct(tokenize(['mads', 'was', 'here']))).toEqual(
            'const GeneratedStruct = Array{String}\n'
        );

        expect(convertTokenToJulia(tokenize([1, 2, 3]), new Map())).toEqual('Array{Int64}');

        expect(generateJuliaStruct(tokenize([1, 2, 3]))).toEqual('const GeneratedStruct = Array{Int64}\n');
    });

    it('arrays should support multiple types', () => {
        expect(convertTokenToJulia(tokenize(['mads', 1, 'mhouge.dk', 2, 3]), new Map())).toEqual(
            'Array{Union{Int64,String}}'
        );

        expect(generateJuliaStruct(tokenize(['mads', 1, 'mhouge.dk', 2, 3]))).toEqual(
            'const GeneratedStruct = Array{Union{Int64,String}}\n'
        );
    });

    it('duplicate maps should be removed from arrays', () => {
        expect(convertTokenToJulia(tokenize([{ key: 'mads' }, { key: 'was' }, { key: 'here' }]), new Map())).toEqual(
            'Array{SubStruct1}'
        );

        expect(generateJuliaStruct(tokenize([{ key: 'mads' }, { key: 'was' }, { key: 'here' }]))).toEqual(
            `struct SubStruct1
    key::String
end

const GeneratedStruct = Array{SubStruct1}
`
        );
    });

    it('maps should be able to be mixed in arrays', () => {
        expect(convertTokenToJulia(tokenize([{ key: 1.23 }, { key: 'mads' }, { key: 1 }]), new Map())).toEqual(
            'Array{Union{SubStruct1,SubStruct2,SubStruct3}}'
        );
        expect(generateJuliaStruct(tokenize([{ key: 1.23 }, { key: 'mads' }, { key: 1 }]))).toEqual(
            `struct SubStruct1
    key::Float64
end

struct SubStruct2
    key::String
end

struct SubStruct3
    key::Int64
end

const GeneratedStruct = Array{Union{SubStruct1,SubStruct2,SubStruct3}}
`
        );
    });
});

describe('maps', () => {
    it('empty maps should be Dict{Any,Any}', () => {
        expect(convertTokenToJulia(tokenize({}), new Map())).toEqual('Dict{Any,Any}');

        expect(generateJuliaStruct(tokenize({}))).toEqual('const GeneratedStruct = Dict{Any,Any}\n');
    });

    it('maps should support primitive value children', () => {
        expect(generateJuliaStruct(tokenize({ key: 'value' }))).toEqual(
            `struct GeneratedStruct
    key::String
end
`
        );

        expect(
            generateJuliaStruct(
                tokenize({
                    stringKey: 'value',
                    numberKey: 1,
                    nullKey: null,
                    trueKey: true,
                    falseKey: false,
                })
            )
        ).toEqual(
            `struct GeneratedStruct
    falseKey::Bool
    nullKey::Nothing
    numberKey::Int64
    stringKey::String
    trueKey::Bool
end
`
        );
    });

    it('maps should be able to be nested', () => {
        const expectedResult = `struct SubStruct1
    key::String
end

struct SubStruct2
    d::SubStruct1
end

struct SubStruct3
    c::SubStruct2
end

struct SubStruct4
    b::SubStruct3
end

struct GeneratedStruct
    a::SubStruct4
end
`;
        expect(
            generateJuliaStruct(
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
        expect(generateJuliaStruct(tokenize({ arr: [1.23] }))).toEqual(
            'struct GeneratedStruct\n    arr::Array{Float64}\nend\n'
        );
    });

    it('maps should be sorted automatically', () => {
        expect(generateJuliaStruct(tokenize({ a: 'a', b: 'b', c: 'c' }))).toEqual(
            generateJuliaStruct(tokenize({ c: 'c', b: 'b', a: 'a' }))
        );
    });
});

describe('generateJuliaStruct', () => {
    describe('base types', () => {
        it('only string', () =>
            expect(generateJuliaStruct(tokenize('mhouge.dk'))).toEqual('const GeneratedStruct = String\n'));

        it('only number', () => expect(generateJuliaStruct(tokenize(42))).toEqual('const GeneratedStruct = Int64\n'));

        it('only Float64', () =>
            expect(generateJuliaStruct(tokenize(42.42))).toEqual('const GeneratedStruct = Float64\n'));

        it('only null', () => expect(generateJuliaStruct(tokenize(null))).toEqual('const GeneratedStruct = Nothing\n'));

        it('empty array', () =>
            expect(generateJuliaStruct(tokenize([]))).toEqual('const GeneratedStruct = Array{Any}\n'));

        it('string array', () =>
            expect(generateJuliaStruct(tokenize(['mhouge.dk']))).toEqual('const GeneratedStruct = Array{String}\n'));

        it('number array', () =>
            expect(generateJuliaStruct(tokenize([42]))).toEqual('const GeneratedStruct = Array{Int64}\n'));

        it('null arrays should return Any', () =>
            expect(generateJuliaStruct(tokenize([null]))).toEqual('const GeneratedStruct = Array{Any}\n'));

        it('empty matrix', () =>
            expect(generateJuliaStruct(tokenize([[], [], []]))).toEqual('const GeneratedStruct = Array{Array{Any}}\n'));

        it('mixed array', () => {
            expect(generateJuliaStruct(tokenize([1, 'mhouge.dk']))).toEqual(
                'const GeneratedStruct = Array{Union{Int64,String}}\n'
            );
        });

        it('arrays with multiple values and null should include nothing', () =>
            expect(generateJuliaStruct(tokenize([1, 'mhouge.dk', null]))).toEqual(
                'const GeneratedStruct = Array{Union{Int64,Nothing,String}}\n'
            ));
    });

    describe('objects', () => {
        it('empty dict', () =>
            expect(generateJuliaStruct(tokenize({}))).toEqual('const GeneratedStruct = Dict{Any,Any}\n'));

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
                'struct GeneratedStruct\n    printWidth::Int64\n    semi::Bool\n    singleQuote::Bool\n    tabWidth::Int64\n    useTabs::Bool\nend\n';

            expect(generateJuliaStruct(tokenize(JSON.parse(jsonStr)))).toEqual(expectedResult);
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

            const expectedResult = `struct SubStruct1
    length::Int64
    message::String
    retry_after::Int64
end

struct GeneratedStruct
    data::Array{SubStruct1}
end
`;

            expect(generateJuliaStruct(tokenize(JSON.parse(jsonStr)))).toEqual(expectedResult);
        });
    });
});
