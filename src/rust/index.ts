export type RustIntegerBitSizes = 8 | 16 | 32 | 64 | 128;

export type RustFLoatBitSizes = 32 | 64;

export type JSONTORustOptions = {
    overwrites: {
        /**
         * @summary overwrite default type for integers
         * If enabled the type will scale to a higher bit size if needed.
         *
         * By default all integers will be set to i32.
         * @default i32
         */
        integers?: {
            /**
             * @default i32
             */
            default_bit_size?: RustIntegerBitSizes;
            enable_unsigned?: boolean;
        };
        floats?: {
            /**
             * @summary Set default bit size for floating pointers
             * @default 32
             */
            default_bit_size?: RustFLoatBitSizes;
        };
    };
};

type RustSignedIntegers = 'i8' | 'i16' | 'i32' | 'i64' | 'i128';

type RustUnsignedIntegers = 'u8' | 'u16' | 'u32' | 'u64' | 'u128';

type RustFloatingPoints = 'f32' | 'f64';

export type RustNumber = RustSignedIntegers | RustUnsignedIntegers | RustFloatingPoints;

export function isValidNumberType(t: string): t is RustNumber {
    switch (t) {
        case 'i8':
        case 'i16':
        case 'i32':
        case 'i64':
        case 'i128':
        case 'u8':
        case 'u16':
        case 'u32':
        case 'u64':
        case 'u128':
        case 'f32':
        case 'f64':
            return true;

        default:
            return false;
    }
}

export function calculateBitSize(
    num: number,
    defaultBitSize: RustIntegerBitSizes = 32,
    unsigned?: boolean
): RustIntegerBitSizes {
    // fallback incase something goes wrong
    if (!Number.isInteger(num)) return 64;

    let minimumBitSize: RustIntegerBitSizes = 32;

    if (!Number.isSafeInteger(num)) minimumBitSize = 64;

    if (unsigned === true && num >= 0) {
        if (num <= 255) minimumBitSize = 8;
        else if (num <= 65535) minimumBitSize = 16;
        else if (num <= 4294967295) minimumBitSize = 32;
        else minimumBitSize = 64;
    } else {
        if (num <= 127 && num >= -128) minimumBitSize = 8;
        else if (num <= 32767 && num >= -32768) minimumBitSize = 16;
    }

    if (minimumBitSize >= defaultBitSize) return minimumBitSize;

    if (
        defaultBitSize === 8 ||
        defaultBitSize === 16 ||
        defaultBitSize === 32 ||
        defaultBitSize === 64 ||
        defaultBitSize === 128
    ) {
        return defaultBitSize;
    }

    return minimumBitSize;
}

export function getNumberType(num: number, options?: JSONTORustOptions): RustNumber {
    let prefix: 'i' | 'u' | 'f' = 'i';
    let bitSize: RustIntegerBitSizes = 32;

    if (Number.isNaN(num)) {
        bitSize = options?.overwrites?.integers?.default_bit_size ?? 32;
    } else {
        if (!Number.isInteger(num)) {
            prefix = 'f';
        } else if (num < 0 && options?.overwrites?.integers?.enable_unsigned) {
            prefix = 'u';
        }

        if (prefix === 'f') {
            bitSize = Number.isSafeInteger(num) ? 32 : 64;
        } else {
            bitSize = calculateBitSize(num, options?.overwrites?.integers?.default_bit_size ?? 32, prefix === 'u');
        }
    }

    const expectedType = prefix + bitSize;

    if (isValidNumberType(expectedType)) return expectedType;

    return 'i32';
}
