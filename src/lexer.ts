import { err, isOk, ok, Result, unwrapErr, unwrapOk } from '@cousinomath/ts-utilities';
import { Token } from './internal';

export class Lexer {
  public readonly source: string;
  private start: number = 0;
  private readonly length: number;
  // TODO: the symbols
  private readonly constants = ['π', 'pi', 'e'];
  private readonly functions = ['abs', 'acos', 'asin', 'atan', 'cos', 'exp',
    'log', 'sin', 'sqrt', 'tan'];

  constructor(source: string) {
    this.source = source;
    this.length = source.length;
  }

  public lex(): Result<Token[], string> {
    const tokens: Token[] = [];
    this.start = 0;
    while (this.start < this.length) {
      this.skipWhitespace();
      if (this.start < this.length) {
        const nextToken = this.nextToken();
        if (isOk(nextToken)) {
          tokens.push(unwrapOk(nextToken));
        } else {
          return err(unwrapErr(nextToken));
        }
      }
    }
    return ok(tokens);
  }

  private skipWhitespace() {
    const reResult = this.source.substring(this.start).match(/^\s+/m);
    if (reResult !== null && reResult.length > 0) {
      this.start += reResult[0].length;
    }
  }

  private nextToken(): Result<Token, string> {
    switch (this.source[this.start]) {
      case '+': return ok({ kind: '+' });
      case '-': // TODO en dash, em dash, minus
      case '−':
        return ok({ kind: '-' });
      case '*': // TODO star, cdot, cross
      case '×':
        return ok({ kind: '*' });
      case '/':
      case '÷':
      case '⁄':
        return ok({ kind: '/' });
      case '^': return ok({ kind: '^' });
      case '(': return ok({ kind: '(' });
      case ')': return ok({ kind: ')' });
      default:
        if (this.isNumeric() || this.source[this.start] === '.') {
          return this.lexNumber();
        } else if (this.isAlpha()) {
          return this.lexIdentifier();
        } else {
          return err(`Unrecognized symbol: ${this.source[this.start]}`);
        }
    }
  }

  private isAlpha(): boolean {
    return /[a-zA-Z]/.test(this.source[this.start]);
  }

  private isNumeric(): boolean {
    return /\d/.test(this.source[this.start]);
  }

  private lexNumber(): Result<Token, string> {
    const reResult = this.source.substring(this.start).match(/^[\d.]+/);
    if (reResult !== null && reResult.length > 0) {
      const parseResult = Number.parseFloat(reResult[0]);
      if (Number.isNaN(parseResult)) {
        return err('Could not understand this number ' + reResult[0]);
      }
      return ok({ kind: 'number', value: parseResult });
    } else {
      // unreachable
      return err('Something went wrong trying to read your response');
    }
  }

  private lexIdentifier(): Result<Token, string> {
    const reResult = this.source.substring(this.start).match(/^\w+/);
    if (reResult !== null && reResult.length > 0) {
      const identifier = reResult[0].toLowerCase();
      if (this.functions.indexOf(identifier) > 0) {
        return ok({ kind: 'function', name: identifier });
      } else if (this.constants.indexOf(identifier) > 0) {
        return ok({ kind: 'constant', name: identifier === 'π' ? 'pi' : identifier });
      } else {
        return ok({ kind: 'variable', name: identifier });
      }
    } else {
      // unreachable
      return err('Something went wrong trying to read your response');
    }
  }
}
