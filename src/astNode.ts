// tslint:disable interface-name
interface ASTPlus {
  readonly kind: '+';
  readonly arguments: ASTNode[];
}

interface ASTTimes {
  readonly kind: '*';
  readonly arguments: ASTNode[];
}

interface ASTPower {
  readonly kind: '^';
  readonly base: ASTNode;
  readonly exp: ASTNode;
}

interface ASTFunction {
  readonly kind: 'function';
  readonly name: string;
  readonly argument: ASTNode;
}

interface ASTConstant {
  readonly kind: 'constant';
  readonly name: string;
}

interface ASTVariable {
  readonly kind: 'variable';
  readonly name: string;
}

export interface ASTNumber {
  readonly kind: 'number';
  readonly value: number;
}

interface ASTMinus {
  readonly kind: '-';
  readonly left: ASTNode;
  readonly right: ASTNode;
}

interface ASTDivides {
  readonly kind: '/';
  readonly left: ASTNode;
  readonly right: ASTNode;
}

export type ASTNode = ASTPlus | ASTTimes | ASTPower | ASTFunction |
  ASTConstant | ASTVariable | ASTNumber | ASTMinus | ASTDivides;

export function evaluate(node: ASTNode, memory: Map<string, number>): number {
  switch (node.kind) {
    case '+':
      return node.arguments.reduce((sum, arg) => sum + evaluate(arg, memory),
        0);
    case '*':
      return node.arguments.reduce((prod, arg) => prod * evaluate(arg, memory),
        1);
    case '^':
      return Math.pow(evaluate(node.base, memory), evaluate(node.exp, memory));
    case '-':
      return evaluate(node.left, memory) - evaluate(node.right, memory);
    case '/':
      return evaluate(node.left, memory) / evaluate(node.right, memory);
    case 'function':
      const argEvaled = evaluate(node.argument, memory);
      switch (node.name) {
        case 'abs': return Math.abs(argEvaled);
        case 'acos': return Math.acos(argEvaled);
        case 'asin': return Math.asin(argEvaled);
        case 'atan': return Math.atan(argEvaled);
        case 'cos': return Math.cos(argEvaled);
        case 'exp': return Math.exp(argEvaled);
        case 'log': return Math.log(argEvaled);
        case 'sin': return Math.sin(argEvaled);
        case 'sqrt': return Math.sqrt(argEvaled);
        case 'tan': return Math.tan(argEvaled);
      }
    case 'constant':
      switch (node.name) {
        case 'pi': return Math.PI;
        case 'e': return Math.E;
      }
    case 'variable':
      const retrieval = memory.get(node.name);
      return retrieval !== undefined ? retrieval : Number.NaN;
  }
  return Number.NaN;
}

export function display(node: ASTNode): string {
  return 'not yet implemented';
}