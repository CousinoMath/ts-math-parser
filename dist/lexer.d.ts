import { Result } from '@cousinomath/ts-utilities';
import { Error, Token } from './internal';
export declare class Lexer {
    readonly source: string;
    private start;
    private current;
    private readonly length;
    private readonly constants;
    private readonly functions;
    constructor(source: string);
    lex(): Result<Token[], Error>;
    private skipWhitespace;
    private nextToken;
    private isAlpha;
    private isNumeric;
    private lexNumber;
    private lexIdentifier;
}
