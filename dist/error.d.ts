export interface Error {
    readonly message: string;
    readonly lexemes: string;
    readonly start: number;
    readonly end: number;
}
