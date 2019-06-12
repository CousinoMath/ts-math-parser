import { Result, unwrapErr, unwrapOk } from '@cousinomath/ts-utilities';
import { ASTNode } from '../src/astNode';
import { Error } from '../src/error';
import { Lexer } from '../src/lexer';
import { Parser } from '../src/parser';

describe('Parser tests', () => {
  const parse: (str: string) => Result<ASTNode, Error> = (str) =>
    (new Parser(unwrapOk((new Lexer(str)).lex()))).expression();
  it('Parsing successes', () => {
    const one = { kind: 'number', value: 1 };
    const mOne = { kind: 'number', value: -1 };
    const two = { kind: 'number', value: 2 };
    const varX1 = { kind: 'variable', name: 'x1' };
    expect(unwrapOk(parse('2'))).toEqual(two);
    expect(unwrapOk(parse('1 + 2'))).toEqual({ kind: '+', arguments: [one, two] });
    expect(unwrapOk(parse('2 - 1'))).toEqual({ kind: '+', arguments: [two, { kind: '*', arguments: [mOne, one] } ] });
    expect(unwrapOk(parse('1 * 2'))).toEqual({ kind: '*', arguments: [one, two] });
    expect(unwrapOk(parse('1 2'))).toEqual({ kind: '*', arguments: [one, two ] });
    expect(unwrapOk(parse('2x1'))).toEqual({ kind: '*', arguments: [two, varX1] });
    expect(unwrapOk(parse('2 / 1'))).toEqual({ kind: '*', arguments: [two, { kind: '^', base: one, exp: mOne } ] });
    expect(unwrapOk(parse('2 ^ 1'))).toEqual({ kind: '^', base: two, exp: one });
    expect(unwrapOk(parse('pi'))).toEqual({ kind: 'constant', name: 'pi' });
    expect(unwrapOk(parse('asec 1'))).toEqual({ kind: 'function', name: 'asec', argument: one });
    expect(unwrapOk(parse('x1'))).toEqual(varX1);
    expect(unwrapOk(parse('2(1 + x1)'))).toEqual({
      arguments: [two, { kind: '+', arguments: [one, varX1] } ],
      kind: '*',
    });
    expect(unwrapOk(parse('-2 ^ 2 ^ 2'))).toEqual({
      arguments: [mOne, { kind: '^', base: two, exp: { kind: '^', base: two, exp: two }}],
      kind: '*',
    });
  });
  it('Parsing failures', () => {
    expect(unwrapErr(parse('(2'))).toEqual({
      end: 2,
      lexemes: '',
      message: 'Unmatched parentheses',
      start: 2,
    });
    expect(unwrapErr(parse('()'))).toEqual({
      end: 2,
      lexemes: ')',
      message: 'Expected a number, variable, or function',
      start: 1,
    });
    expect(unwrapErr(parse('+'))).toEqual({
      end: 1,
      lexemes: '+',
      message: 'Expected a number, variable, or function',
      start: 0,
    });
    expect(unwrapErr(parse('2 + *'))).toEqual({
      end: 5,
      lexemes: '*',
      message: 'Expected a number, variable, or function',
      start: 4,
    });
    expect(unwrapErr(parse(')'))).toEqual({
      end: 1,
      lexemes: ')',
      message: 'Expected a number, variable, or function',
      start: 0,
    });
  });
});
