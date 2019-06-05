// tslint:disable interface-name
export interface TokenPlus {
  readonly kind: '+';
}

export interface TokenMinus {
  readonly kind: '-';
}

export interface TokenStar {
  readonly kind: '*';
}

export interface TokenSlash {
  readonly kind: '/';
}

export interface TokenCaret {
  readonly kind: '^';
}

export interface TokenFunction {
  readonly kind: 'function';
  readonly name: string;
}

export interface TokenConstant {
  readonly kind: 'constant';
  readonly name: string;
}

export interface TokenVariable {
  readonly kind: 'variable';
  readonly name: string;
}

export interface TokenNumber {
  readonly kind: 'number';
  readonly value: number;
}

export interface TokenEOI {
  readonly kind: 'eoi';
}

export interface TokenLParen {
  readonly kind: '(';
}

export interface TokenRParen {
  readonly kind: ')';
}

export type Token = TokenCaret | TokenConstant | TokenFunction | TokenMinus |
  TokenNumber | TokenPlus | TokenSlash | TokenStar | TokenVariable | TokenEOI |
  TokenLParen | TokenRParen;
