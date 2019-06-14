export interface TokenBase {
    readonly lexeme: string;
    readonly start: number;
    readonly end: number;
}
export interface TokenPlus extends TokenBase {
    readonly kind: '+';
}
export interface TokenMinus extends TokenBase {
    readonly kind: '-';
}
export interface TokenStar extends TokenBase {
    readonly kind: '*';
}
export interface TokenSlash extends TokenBase {
    readonly kind: '/';
}
export interface TokenCaret extends TokenBase {
    readonly kind: '^';
}
export interface TokenFunction extends TokenBase {
    readonly kind: 'function';
    readonly name: string;
}
export interface TokenConstant extends TokenBase {
    readonly kind: 'constant';
    readonly name: string;
}
export interface TokenVariable extends TokenBase {
    readonly kind: 'variable';
    readonly name: string;
}
export interface TokenNumber extends TokenBase {
    readonly kind: 'number';
    readonly value: number;
}
export interface TokenEOI extends TokenBase {
    readonly kind: 'eoi';
}
export interface TokenLParen extends TokenBase {
    readonly kind: '(';
}
export interface TokenRParen extends TokenBase {
    readonly kind: ')';
}
export declare type Token = TokenCaret | TokenConstant | TokenFunction | TokenMinus | TokenNumber | TokenPlus | TokenSlash | TokenStar | TokenVariable | TokenEOI | TokenLParen | TokenRParen;
