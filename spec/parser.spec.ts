import { Result, unwrapOk } from 'ts-utilities';
import { ASTNode } from '../src/astNode';
import { Lexer } from '../src/lexer';
import { Parser } from '../src/parser';

describe('Parser tests', () => {
  const parse: (str: string) => Result<ASTNode, string> = (str) =>
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
    expect(unwrapOk(parse('acos 1'))).toEqual({ kind: 'function', name: 'acos', argument: one });
    expect(unwrapOk(parse('x1'))).toEqual(varX1);
    expect(unwrapOk(parse('2(1 + x1)'))).toEqual({
      arguments: [two, { kind: '+', arguments: [one, varX1] } ],
      kind: '*',
    });
  });
});
