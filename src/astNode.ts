import Complex from 'complex.js';

// tslint:disable interface-name
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

export type ASTNode = ASTPlus | ASTTimes | ASTPower | ASTFunction |
  ASTConstant | ASTVariable | ASTNumber | ASTMinus | ASTDivides;

export function evaluate(node: ASTNode, memory: Map<string, Complex>): Complex {
  switch (node.kind) {
    case '+':
      return node.arguments.reduce((sum, arg) => {
          const [sumRe, sumIm] = sum.toVector();
          return evaluate(arg, memory).add(sumRe, sumIm);
        }, Complex.ZERO);
    case '*':
      return node.arguments.reduce((prod, arg) => {
          const [prodRe, prodIm] = prod.toVector();
          return evaluate(arg, memory).mul(prodRe, prodIm);
        }, Complex.ONE);
    case '^':
      const [expRe, expIm] = evaluate(node.exp, memory).toVector();
      return evaluate(node.base, memory).pow(expRe, expIm);
    case '-':
      const [right1Re, right1Im] = evaluate(node.right, memory).toVector();
      return evaluate(node.left, memory).sub(right1Re, right1Im);
    case '/':
      const [right2Re, right2Im] = evaluate(node.right, memory).toVector();
      return evaluate(node.left, memory).div(right2Re, right2Im);
    case 'function':
      const argEvaled = evaluate(node.argument, memory);
      switch (node.name) {
        case 'abs': return new Complex(argEvaled.abs(), 0);
        case 'acos': return argEvaled.acos();
        case 'asin': return argEvaled.asin();
        case 'atan': return argEvaled.atan();
        case 'cos': return argEvaled.cos();
        case 'exp': return argEvaled.exp();
        case 'log': return argEvaled.log();
        case 'sin': return argEvaled.sin();
        case 'sqrt': return argEvaled.sqrt();
        case 'tan': return argEvaled.tan();
      }
    case 'constant':
      switch (node.name) {
        case 'pi': return Complex.PI;
        case 'e': return Complex.E;
      }
    case 'variable':
      const retrieval = memory.get(node.name);
      return retrieval !== undefined ? retrieval : Complex.NAN;
  }
  return Complex.NAN;
}

function shouldNegate(node: ASTNode): [boolean, ASTNode] {
  if (node.kind === '*' && node.arguments.length === 2) {
    const first = node.arguments[0];
    if (first.kind === 'number' && first.value === -1) {
      return [true, node.arguments[1]];
    }
  }
  return [false, node];
}

function shouldReciprocate(node: ASTNode): [boolean, ASTNode] {
  if (node.kind === '^') {
    const exp = node.exp;
    if (exp.kind === 'number' && exp.value === -1) {
      return [true, node.base];
    }
  }
  return [false, node];
}

function shouldParenthesize(parent: ASTNode, node: ASTNode): boolean {
  switch (parent.kind) {
    case '+':
    case '-':
    case '/': // will be wrapped in `\frac{*}{*}`
      return false;
    case '*':
      switch (node.kind) {
        case '+':
        case '-':
        case '*':
        case '/':
          return true;
        default:
          return false;
      }
    case '^':
      switch (node.kind) {
        case '+':
        case '-':
        case '*':
        case '/':
          return true;
        default:
          return false;
      }
    case 'function':
      switch (parent.name) {
        case 'abs':
        case 'sqrt':
          return false;
        default:
          return true;
      }
    default:
      return true;
  }
}

export function latexDisplay(node: ASTNode): string {
  switch (node.kind) {
    case '+':
      switch (node.arguments.length) {
        case 0: return '0';
        default:
          const terms = node.arguments;
          const firstTerm = terms.shift()!;
          const [firstNegate, actualFirstTerm] = shouldNegate(firstTerm);
          let output = latexDisplay(actualFirstTerm);
          output = shouldParenthesize(firstTerm, actualFirstTerm) ?
            '\\left(' + output + '\\right)' : output;
          output = (firstNegate ? '-' : '') + output;
          for (const term of terms) {
            // no need to parenthesize here; parent is `+`
            const [negate, actualTerm] = shouldNegate(term);
            output += (negate ? '-' : '+') + latexDisplay(actualTerm);
          }
          return output;
      }
    case '*':
      switch (node.arguments.length) {
        case 0: return '1';
        default:
          const factors = node.arguments;
          const firstFactor = factors.shift()!;
          let output = latexDisplay(firstFactor);
          output = shouldParenthesize(node, firstFactor) ?
            '\\left(' + output + '\\right)' : output;
          for (const factor of factors) {
            const [recip, actualFactor] = shouldReciprocate(factor);
            const factorOutput = latexDisplay(actualFactor);
            if (recip) {
              output =
                '\\frac{' + output + '}{' + factorOutput + '}';
            } else if (shouldParenthesize(node, factor)) {
              output = output + ' \\left(' + factorOutput + '\\right)';
            } else {
              output = output + ' ' + factorOutput;
            }
          }
          return output;
      }
    case '^':
      const baseOutput = latexDisplay(node.base);
      const expOutput = '}^{' + latexDisplay(node.exp) + '}';
      if (shouldParenthesize(node, node.base)) {
        return '{\\left(' + baseOutput + '\\right)' + expOutput;
      } else {
        return '{' + baseOutput + expOutput;
      }
    case '-':
      return latexDisplay(node.left) + '-' + latexDisplay(node.right);
    case '/':
      return '\\frac{' + latexDisplay(node.left) + '}{' + latexDisplay(node.right) + '}';
    case 'function':
      const argOutput = latexDisplay(node.argument);
      switch (node.name) {
        case 'abs': return '\\left|' + argOutput + '\\right|';
        case 'sqrt': return '\\sqrt{' + argOutput + '}';
        default:
          const funcOutput = '\\' + node.name + ' ';
          if (shouldParenthesize(node, node.argument)) {
            return funcOutput + '\\left(' + argOutput + '\\right)';
          } else {
            return funcOutput + argOutput;
          }
      }
    case 'constant':
      switch (node.name) {
        case 'pi': return '\\pi';
        default: return node.name;
      }
    case 'variable':
      return node.name;
    case 'number':
      return node.value.toPrecision();
  }
  return 'not yet implemented';
}
