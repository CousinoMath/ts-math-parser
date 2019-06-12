import { Result, unwrapErr, unwrapOk } from '@cousinomath/ts-utilities';
import { Error } from '../src/error';
import { Lexer } from '../src/lexer';
import { Token } from '../src/token';

describe('Lexer tests', () => {
  const lex: (str: string) => Result<Token[], Error> = (str) => (new Lexer(str)).lex();
  it('Symbols', () => {
    expect(unwrapOk(lex('('))[0]).toEqual(
      { kind: '(', lexeme: '(', start: 0, end: 1 });
    expect(unwrapOk(lex(' )'))[0]).toEqual(
      { kind: ')', lexeme: ')', start: 1, end: 2 });
    expect(unwrapOk(lex('+ '))[0]).toEqual(
      { kind: '+', lexeme: '+', start: 0, end: 1 });
    expect(unwrapOk(lex('  -  '))[0]).toEqual(
      { kind: '-', lexeme: '-', start: 2, end: 3 });
    expect(unwrapOk(lex('  − '))[0]).toEqual(
      { kind: '-', lexeme: '−', start: 2, end: 3 });
    expect(unwrapOk(lex('*'))[0]).toEqual(
      { kind: '*', lexeme: '*', start: 0, end: 1 });
    expect(unwrapOk(lex(' /'))[0]).toEqual(
      { kind: '/', lexeme: '/', start: 1, end: 2 });
    expect(unwrapOk(lex('^ '))[0]).toEqual(
      { kind: '^', lexeme: '^', start: 0, end: 1 });
  });
  it('Constants', () => {
    expect(unwrapOk(lex('pi'))[0]).toEqual(
      { kind: 'constant', name: 'pi', lexeme: 'pi', start: 0, end: 2 });
    expect(unwrapOk(lex('π'))[0]).toEqual(
      { kind: 'constant', name: 'pi', lexeme: 'π', start: 0, end: 1 });
    expect(unwrapOk(lex('e'))[0]).toEqual(
      { kind: 'constant', name: 'e', lexeme: 'e', start: 0, end: 1 });
  });
  it('Functions', () => {
    expect(unwrapOk(lex('Abs'))[0]).toEqual(
      { kind: 'function', name: 'abs', lexeme: 'Abs', start: 0, end: 3 });
    expect(unwrapOk(lex('asec'))[0]).toEqual(
      { kind: 'function', name: 'asec', lexeme: 'asec', start: 0, end: 4 });
    expect(unwrapOk(lex('ASin'))[0]).toEqual(
      { kind: 'function', name: 'asin', lexeme: 'ASin', start: 0, end: 4 });
    expect(unwrapOk(lex('atAN'))[0]).toEqual(
      { kind: 'function', name: 'atan', lexeme: 'atAN', start: 0, end: 4 });
    expect(unwrapOk(lex('cos'))[0]).toEqual(
      { kind: 'function', name: 'cos', lexeme: 'cos', start: 0, end: 3 });
    expect(unwrapOk(lex('Exp'))[0]).toEqual(
      { kind: 'function', name: 'exp', lexeme: 'Exp', start: 0, end: 3 });
    expect(unwrapOk(lex('loG'))[0]).toEqual(
      { kind: 'function', name: 'log', lexeme: 'loG', start: 0, end: 3 });
    expect(unwrapOk(lex('sIn'))[0]).toEqual(
      { kind: 'function', name: 'sin', lexeme: 'sIn', start: 0, end: 3 });
    expect(unwrapOk(lex('sqrt'))[0]).toEqual(
      { kind: 'function', name: 'sqrt', lexeme: 'sqrt', start: 0, end: 4 });
    expect(unwrapOk(lex('tan'))[0]).toEqual(
      { kind: 'function', name: 'tan', lexeme: 'tan', start: 0, end: 3 });
  });
  it('Errors', () => {
    expect(unwrapErr(lex('&'))).toEqual(
      { message: 'Unrecognized symbol', lexemes: '&', start: 0, end: 1 });
    expect(unwrapErr(lex('1.2.1'))).toEqual({
      end: 5,
      lexemes: '1.2.1',
      message: 'Could not understand this number',
      start: 0,
    });
    expect(unwrapErr(lex('Π'))).toEqual(
      { message: 'Unrecognized symbol', lexemes: 'Π', start: 0, end: 1 });
    expect(unwrapErr(lex('asecρ'))).toEqual(
      { message: 'Unrecognized symbol', lexemes: 'ρ', start: 4, end: 5 });
  });
});
