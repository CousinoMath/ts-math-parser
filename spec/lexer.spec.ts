import { isErr, Result, unwrapOk } from 'ts-utilities';
import { Lexer } from '../src/lexer';
import { Token } from '../src/token';

describe('Lexer tests', () => {
  const lex: (str: string) => Result<Token[], string> = (str) => (new Lexer(str)).lex();
  it('Symbols', () => {
    expect(unwrapOk(lex('('))).toEqual([{ kind: '(' }]);
    expect(unwrapOk(lex(')'))).toEqual([{ kind: ')' }]);
    expect(unwrapOk(lex(' + '))).toEqual([{ kind: '+' }]);
    expect(unwrapOk(lex(' -  '))).toEqual([{ kind: '-'}]);
    expect(unwrapOk(lex('  − '))).toEqual([{ kind: '-'}]);
    expect(unwrapOk(lex('*'))).toEqual([{ kind: '*' }]);
    expect(unwrapOk(lex(' /'))).toEqual([{ kind: '/' }]);
    expect(unwrapOk(lex('^ '))).toEqual([{ kind: '^' }]);
  });
  it('Constants', () => {
    expect(unwrapOk(lex('pi'))).toEqual([{ kind: 'constant', name: 'pi' }]);
    expect(unwrapOk(lex('π'))).toEqual([{ kind: 'constant', name: 'pi' }]);
    expect(unwrapOk(lex('e'))).toEqual([{ kind: 'constant', name: 'e' }]);
  });
  it('Functions', () => {
    expect(unwrapOk(lex('Abs'))).toEqual([{ kind: 'function', name: 'abs' }]);
    expect(unwrapOk(lex('acos'))).toEqual([{ kind: 'function', name: 'acos' }]);
    expect(unwrapOk(lex('ASin'))).toEqual([{ kind: 'function', name: 'asin' }]);
    expect(unwrapOk(lex('atAN'))).toEqual([{ kind: 'function', name: 'atan' }]);
    expect(unwrapOk(lex('cos'))).toEqual([{ kind: 'function', name: 'cos' }]);
    expect(unwrapOk(lex('Exp'))).toEqual([{ kind: 'function', name: 'exp' }]);
    expect(unwrapOk(lex('loG'))).toEqual([{ kind: 'function', name: 'log' }]);
    expect(unwrapOk(lex('sIn'))).toEqual([{ kind: 'function', name: 'sin' }]);
    expect(unwrapOk(lex('sqrt'))).toEqual([{ kind: 'function', name: 'sqrt' }]);
    expect(unwrapOk(lex('tan'))).toEqual([{ kind: 'function', name: 'tan' }]);
  });
  it('Errors', () => {
    expect(isErr(lex('&'))).toBe(true);
    expect(isErr(lex('[]'))).toBe(true);
    expect(isErr(lex('{}'))).toBe(true);
  });
});
