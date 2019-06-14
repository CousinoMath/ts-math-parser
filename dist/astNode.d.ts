import Complex from 'complex.js';
export interface ASTPlus {
    readonly kind: '+';
    readonly arguments: ASTNode[];
}
export interface ASTTimes {
    readonly kind: '*';
    readonly arguments: ASTNode[];
}
export interface ASTPower {
    readonly kind: '^';
    readonly base: ASTNode;
    readonly exp: ASTNode;
}
export interface ASTFunction {
    readonly kind: 'function';
    readonly name: string;
    readonly argument: ASTNode;
}
export interface ASTConstant {
    readonly kind: 'constant';
    readonly name: string;
}
export interface ASTVariable {
    readonly kind: 'variable';
    readonly name: string;
}
export interface ASTNumber {
    readonly kind: 'number';
    readonly value: number;
}
export interface ASTMinus {
    readonly kind: '-';
    readonly left: ASTNode;
    readonly right: ASTNode;
}
export interface ASTDivides {
    readonly kind: '/';
    readonly left: ASTNode;
    readonly right: ASTNode;
}
export declare type ASTNode = ASTPlus | ASTTimes | ASTPower | ASTFunction | ASTConstant | ASTVariable | ASTNumber | ASTMinus | ASTDivides;
export declare function evaluate(node: ASTNode, memory: Map<string, Complex>): Complex;
export declare function latexDisplay(node: ASTNode): string;
