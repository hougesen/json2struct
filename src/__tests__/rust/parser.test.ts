import { expect, it, describe, test } from 'vitest';
import {
    calculateBitSize,
    getNumberType,
    isValidNumberType,
    JSONTORustOptions,
    RustIntegerBitSizes,
    RustNumber,
} from '../../rust/index';

describe('json2rust', () => {
    it('isValidNumberType', () => {
        const numberTypes: RustNumber[] = [
            'i8',
            'i16',
            'i32',
            'i64',
            'i128',
            'u8',
            'u16',
            'u32',
            'u64',
            'u128',
            'f32',
            'f64',
        ];

        numberTypes.forEach((n) => expect(isValidNumberType(n)).toEqual(true));

        expect(isValidNumberType('not a number')).toEqual(false);

        expect(isValidNumberType('{}')).toEqual(false);
    });

    describe('calculateBitSize', () => {
        it('should always use default if fits', () => {
            const tests = [
                { value: 0, default: 8, unsigned: false, expected: 8 },
                { value: 0, default: 16, unsigned: false, expected: 16 },
                { value: 0, default: 32, unsigned: false, expected: 32 },
                { value: 0, default: 64, unsigned: false, expected: 64 },
                { value: 0, default: 128, unsigned: false, expected: 128 },

                { value: 0, default: 8, unsigned: true, expected: 8 },
                { value: 0, default: 16, unsigned: true, expected: 16 },
                { value: 0, default: 32, unsigned: true, expected: 32 },
                { value: 0, default: 64, unsigned: true, expected: 64 },
                { value: 0, default: 128, unsigned: true, expected: 128 },
            ];

            tests.forEach((test) => {
                expect(calculateBitSize(test.value, <RustIntegerBitSizes>test.default, test.unsigned)).toEqual(
                    test.expected
                );
            });
        });

        it("should not use default if it doesn't fit", () => {
            const tests = [
                { value: 128, default: 8, unsigned: false, expected: 16 },
                { value: 65536, default: 16, unsigned: false, expected: 32 },
                { value: Number.MAX_SAFE_INTEGER + 1, default: 32, unsigned: false, expected: 64 },

                { value: -129, default: 8, unsigned: true, expected: 16 },
                { value: -65537, default: 16, unsigned: true, expected: 32 },
                { value: -(Number.MAX_SAFE_INTEGER + 1), default: 32, unsigned: true, expected: 64 },
            ];

            tests.forEach((test) => {
                expect(calculateBitSize(test.value, <RustIntegerBitSizes>test.default, test.unsigned)).toEqual(
                    test.expected
                );
            });
        });
    });

    describe('getNumberType', () => {
        it('should return an unsigned if valid unsigned', () => {});

        it('shoudl return a float if decimal', () => {
            for (let i = 0; i < 100; i += 1) {
                const generatedNumber = Math.random() * Number.MAX_SAFE_INTEGER;

                expect(getNumberType(Math.round(generatedNumber))).toEqual('i32');

                expect(getNumberType(generatedNumber)).toEqual(Number.isInteger(generatedNumber) ? 'i32' : 'f64');
            }
        });

        it('should return an integer if number is negative', () => {
            for (let i = 0; i < 100; i += 1) {
                const generatedNumber = -Math.round(Math.random() * Number.MAX_SAFE_INTEGER);

                expect(getNumberType(generatedNumber)).toEqual('i32');
            }
        });

        it('ignore default if invalid', () => {
            for (let i = 0; i < 100; i += 1) {
                const generatedNumber = Math.random() * Number.MAX_SAFE_INTEGER;

                const options = {
                    overwrites: {
                        integers: { default_bit_size: 'invaid number type' as unknown as RustIntegerBitSizes },
                    },
                };

                expect(getNumberType(Math.round(generatedNumber), options)).toEqual('i32');

                expect(getNumberType(generatedNumber, options)).toEqual(
                    Number.isInteger(generatedNumber) ? 'i32' : 'f64'
                );
            }
        });
    });
});
