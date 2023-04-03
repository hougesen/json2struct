import { generateJuliaStruct, generatePythonStruct, generateTypeScriptType } from './languages';
import { Token, tokenize } from './tokenizer';

export * from './languages';
export * from './tokenizer';

export type SupportedLanguage = 'typescript' | 'python' | 'julia';

export function convertToLanguage(language: SupportedLanguage, token: Token) {
    switch (language) {
        case 'typescript':
            return generateTypeScriptType(token);

        case 'python':
            return generatePythonStruct(token);

        case 'julia':
            return generateJuliaStruct(token);

        default:
            throw new Error(`${language} is not supported`);
    }
}

/**
 *
 * @param language the language to translate to
 * @param json unparsed json string
 */
export default function json2struct(language: string, json: string) {
    const parsedJson = JSON.parse(json);

    const tokens = tokenize(parsedJson);

    return convertToLanguage(language as SupportedLanguage, tokens);
}
