import { Result, unwrapOk } from '@cousinomath/ts-utilities';
import Complex from 'complex.js';
import { ASTNode, evaluate, latexDisplay } from '../src/astNode';
import { Error } from '../src/error';
import { Lexer } from '../src/lexer';
import { Parser } from '../src/parser';

describe('ASTNode', () => {
  const parse: (str: string) => Result<ASTNode, Error> = (str) =>
    (new Parser(unwrapOk((new Lexer(str)).lex()))).expression();
  const astEval: (str: string, memory: Map<string, Complex>) => Complex =
    (str, memory) => evaluate(unwrapOk(parse(str)), memory);
  const toLatex: (str: string) => string = (str) =>
    latexDisplay(unwrapOk(parse(str)));
  it('Evaluating', () => {
    const memory = new Map([['x', new Complex(3, 0)]]);
    expect(astEval('2', memory)).toEqual(new Complex(2, 0));
    expect(astEval('1 + 1', memory)).toEqual(new Complex(2, 0));
    expect(astEval('3 - 1', memory)).toEqual(new Complex(2, 0));
    expect(astEval('1 * 2', memory)).toEqual(new Complex(2, 0));
    expect(astEval('2 / 1', memory)).toEqual(new Complex(2, 0));
    expect(astEval('2 ^ 2', memory)).toEqual(new Complex(4, 0));
    expect(astEval('-2 ^ 2 ^ 2', memory)).toEqual(new Complex(-16, 0));
    expect(astEval('x', memory)).toEqual(new Complex(3, 0));
    expect(astEval('abs 0', memory)).toEqual(new Complex(0, 0));
    expect(astEval('asec 1', memory)).toEqual(new Complex(0, 0));
    expect(astEval('asin 0', memory)).toEqual(new Complex(0, -0)); // quirk
    expect(astEval('atan 0', memory)).toEqual(new Complex(0, 0));
    expect(astEval('cos 0', memory)).toEqual(new Complex(1, -0));  // quirk too
    expect(astEval('exp 0', memory)).toEqual(new Complex(1, 0));
    expect(astEval('log 1', memory)).toEqual(new Complex(0, 0));
    expect(astEval('sin 0', memory)).toEqual(new Complex(0, 0));
    expect(astEval('sqrt 0', memory)).toEqual(new Complex(0, 0));
    expect(astEval('tan 0', memory)).toEqual(new Complex(0, 0));
    expect(astEval('e^(pi i)', memory)).toEqual(new Complex(-1, 1.2246467991473532e-16));
    expect(evaluate({
      kind: '/',
      left: { kind: 'number', value: 2 },
      right: { kind: 'number', value: 1 },
    }, memory)).toEqual(new Complex(2, 0));
    expect(evaluate({
      kind: '-',
      left: { kind: 'number', value: 3 },
      right: { kind: 'number', value: 1 },
    }, memory)).toEqual(new Complex(2, 0));
  });
  it('LaTeX conversion', () => {
    expect(toLatex('2')).toEqual('2');
    expect(toLatex('(1 + 1)/(1 + 2)')).toEqual('\\frac{1+1}{1+2}');
    expect(toLatex('a pi^2 + b e + c')).toEqual('a {\\pi}^{2}+b e+c');
    expect(toLatex('(1 - 1)(-1 + 2)')).toEqual(
      '\\left(1-1\\right) \\left(-1+2\\right)');
    expect(toLatex('-2 ^ -2 ^ -2')).toEqual('-{2}^{-{2}^{-2}}');
    expect(toLatex('(-2 ^ -2) ^ -2')).toEqual('{\\left(-{2}^{-2}\\right)}^{-2}');
    expect(toLatex('(1 2) 3')).toEqual('1 2 3');
    expect(toLatex('-2/3')).toEqual('-\\frac{2}{3}');
    expect(toLatex('(1 + 2) + 3')).toEqual('1+2+3');
    expect(toLatex('1 / (2 / 3)')).toEqual('\\frac{1}{\\frac{2}{3}}');
    expect(toLatex('-1/2/3')).toEqual('-\\frac{\\frac{1}{2}}{3}');
    expect(toLatex('sqrt (1 2)')).toEqual('\\sqrt{1 2}');
    expect(toLatex('abs (1 2)')).toEqual('\\left|1 2\\right|');
    expect(toLatex('asec (1 2)')).toEqual('\\sec^{-1}\\left(1 2\\right)');
    expect(toLatex('asin (1 2)')).toEqual('\\sin^{-1}\\left(1 2\\right)');
    expect(toLatex('atan (1 2)')).toEqual('\\tan^{-1}\\left(1 2\\right)');
    expect(toLatex('exp (1 2)')).toEqual('\\exp\\left(1 2\\right)');
    expect(toLatex('(2 + 1)^(3 - 1)')).toEqual(
      '{\\left(2+1\\right)}^{3-1}');
    expect(latexDisplay({ kind: '+', arguments: [] })).toEqual('0');
    expect(latexDisplay({ kind: '*', arguments: [] })).toEqual('1');
    expect(latexDisplay({
      kind: '-',
      left: { kind: 'number', value: 3 },
      right: { kind: 'number', value: 1 },
    })).toEqual('3-1');
    expect(latexDisplay({
      kind: '/',
      left: { kind: 'number', value: 2 },
      right: { kind: 'number', value: 1 },
    })).toEqual('\\frac{2}{1}');
  });
});
