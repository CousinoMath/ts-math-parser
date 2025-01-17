import { err, isErr, ok, Result, unwrapErr, unwrapOk } from '@cousinomath/ts-utilities';
import { ASTNode, ASTNumber, Error, Token } from './internal';

export class Parser {
  public readonly source: Token[];
  private index = 0;
  private readonly length: number;

  constructor(source: Token[]) {
    this.source = source;
    this.length = source.length;
  }

  public expression(): Result<ASTNode, Error> {
    let factorResult = this.factor();
    if (isErr(factorResult)) {
      return err(unwrapErr(factorResult));
    }
    const args = [unwrapOk(factorResult)];
    let endLoop = false;
    while (!endLoop && this.index < this.length) {
      switch (this.source[this.index].kind) {
        case 'eoi':
        case ')':
          endLoop = true;
          break;
        case '+':
          this.index += 1;
          factorResult = this.factor();
          if (isErr(factorResult)) {
            return err(unwrapErr(factorResult));
          }
          args.push(unwrapOk(factorResult));
          break;
        case '-':
          this.index += 1;
          factorResult = this.factor();
          if (isErr(factorResult)) {
            return err(unwrapErr(factorResult));
          }
          const mOne: ASTNumber = { kind: 'number', value: -1 };
          args.push({ kind: '*', arguments: [mOne, unwrapOk(factorResult)] });
          break;
        default:
          return err({
            end: this.source[this.index].end,
            lexemes: this.source[this.index].lexeme,
            message: 'Expected to see a + or - here',
            start: this.source[this.index].start,
          });
      }
    }
    switch (args.length) {
      case 0: return ok({ kind: 'number', value: 0 });
      case 1: return ok(args[0]);
      default: return ok({ kind: '+', arguments: args });
    }
  }

  public factor(): Result<ASTNode, Error> {
    let expResult = this.exponential();
    if (isErr(expResult)) {
      return err(unwrapErr(expResult));
    }
    const args = [unwrapOk(expResult)];
    let endLoop = false;
    while (!endLoop && this.index < this.length) {
      switch (this.source[this.index].kind) {
        case 'eoi':
        case ')':
        case '+':
        case '-':
          endLoop = true;
          break;
        case '/':
          this.index += 1;
          expResult = this.exponential();
          if (isErr(expResult)) {
            return err(unwrapErr(expResult));
          }
          const mOne: ASTNumber = { kind: 'number', value: -1 };
          args.push({ kind: '^', base: unwrapOk(expResult), exp: mOne });
          break;
        case '*':
          this.index += 1;
        default:
          expResult = this.exponential();
          if (isErr(expResult)) {
            return err(unwrapErr(expResult));
          }
          args.push(unwrapOk(expResult));
          break;
      }
    }
    switch (args.length) {
      case 0: return ok({ kind: 'number', value: 1 });
      case 1: return ok(args[0]);
      default: return ok({ kind: '*', arguments: args });
    }
  }

  public exponential(): Result<ASTNode, Error> {
    let negate = false;
    if (this.index < this.length && this.source[this.index].kind === '-') {
      negate = true;
      this.index += 1;
    }
    let expResult = this.atom();
    if (isErr(expResult)) {
      return err(unwrapErr(expResult));
    }
    let exp = unwrapOk(expResult);
    if (this.index < this.length && this.source[this.index].kind === '^') {
      this.index += 1;
      expResult = this.exponential();
      if (isErr(expResult)) {
        return err(unwrapErr(expResult));
      }
      exp = { kind: '^', base: exp, exp: unwrapOk(expResult) };
    }
    if (negate) {
      const mOne: ASTNode = { kind: 'number', value: -1 };
      exp = { kind: '*', arguments: [mOne, exp] };
    }
    return ok(exp);
  }

  public atom(): Result<ASTNode, Error> {
    if (this.index < this.length) {
      const current = this.source[this.index];
      this.index += 1;

      if (current.kind === 'number') {
        return ok({ kind: 'number', value: current.value });
      }
      if (current.kind === 'variable') {
        return ok({ kind: 'variable', name: current.name });
      }
      if (current.kind === 'constant') {
        return ok({ kind: 'constant', name: current.name });
      }
      if (current.kind === 'function') {
        const argResult = this.atom();
        if (isErr(argResult)) {
          return err(unwrapErr(argResult));
        }
        return ok({ kind: 'function', name: current.name, argument: unwrapOk(argResult) });
      }
      if (current.kind === '(') {
        const exprResult = this.expression();
        if (isErr(exprResult)) {
          return err(unwrapErr(exprResult));
        }
        if (this.index < this.length && this.source[this.index].kind === ')') {
          this.index += 1;
          return ok(unwrapOk(exprResult));
        } else {
          const position = this.source[this.length - 1].start;
          return err({
            end: position,
            lexemes: '',
            message: 'Unmatched parentheses',
            start: position,
          });
        }
      }
      return err({
        end: current.end,
        lexemes: current.lexeme,
        message: 'Expected a number, variable, or function',
        start: current.start,
      });
    }
    return err({
      end: this.length,
      lexemes: '',
      message: 'End of input reached prematurely.',
      start: this.length,
    });
  }
}
