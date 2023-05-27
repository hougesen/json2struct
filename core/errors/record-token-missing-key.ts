export class RecordTokenMissingKey extends Error {
    constructor() {
        super('Record token is missing a key');
    }
}
