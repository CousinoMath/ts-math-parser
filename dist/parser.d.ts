import { Result } from '@cousinomath/ts-utilities';
import { ASTNode, Error, Token } from './internal';
export declare class Parser {
    readonly source: Token[];
    private index;
    private readonly length;
    constructor(source: Token[]);
    expression(): Result<ASTNode, Error>;
    factor(): Result<ASTNode, Error>;
    exponential(): Result<ASTNode, Error>;
    atom(): Result<ASTNode, Error>;
}
