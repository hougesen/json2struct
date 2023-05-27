export class UnsupportedLanguageError extends Error {
    constructor(language: string) {
        super(`${language} is not supported`);
    }
}
