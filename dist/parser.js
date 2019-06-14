"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts_utilities_1 = require("@cousinomath/ts-utilities");
class Parser {
    constructor(source) {
        this.index = 0;
        this.source = source;
        this.length = source.length;
    }
    expression() {
        let factorResult = this.factor();
        if (ts_utilities_1.isErr(factorResult)) {
            return ts_utilities_1.err(ts_utilities_1.unwrapErr(factorResult));
        }
        const args = [ts_utilities_1.unwrapOk(factorResult)];
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
                    if (ts_utilities_1.isErr(factorResult)) {
                        return ts_utilities_1.err(ts_utilities_1.unwrapErr(factorResult));
                    }
                    args.push(ts_utilities_1.unwrapOk(factorResult));
                    break;
                case '-':
                    this.index += 1;
                    factorResult = this.factor();
                    if (ts_utilities_1.isErr(factorResult)) {
                        return ts_utilities_1.err(ts_utilities_1.unwrapErr(factorResult));
                    }
                    const mOne = { kind: 'number', value: -1 };
                    args.push({ kind: '*', arguments: [mOne, ts_utilities_1.unwrapOk(factorResult)] });
                    break;
                default:
                    return ts_utilities_1.err({
                        end: this.source[this.index].end,
                        lexemes: this.source[this.index].lexeme,
                        message: 'Expected to see a + or - here',
                        start: this.source[this.index].start,
                    });
            }
        }
        switch (args.length) {
            case 0: return ts_utilities_1.ok({ kind: 'number', value: 0 });
            case 1: return ts_utilities_1.ok(args[0]);
            default: return ts_utilities_1.ok({ kind: '+', arguments: args });
        }
    }
    factor() {
        let expResult = this.exponential();
        if (ts_utilities_1.isErr(expResult)) {
            return ts_utilities_1.err(ts_utilities_1.unwrapErr(expResult));
        }
        const args = [ts_utilities_1.unwrapOk(expResult)];
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
                    if (ts_utilities_1.isErr(expResult)) {
                        return ts_utilities_1.err(ts_utilities_1.unwrapErr(expResult));
                    }
                    const mOne = { kind: 'number', value: -1 };
                    args.push({ kind: '^', base: ts_utilities_1.unwrapOk(expResult), exp: mOne });
                    break;
                case '*':
                    this.index += 1;
                default:
                    expResult = this.exponential();
                    if (ts_utilities_1.isErr(expResult)) {
                        return ts_utilities_1.err(ts_utilities_1.unwrapErr(expResult));
                    }
                    args.push(ts_utilities_1.unwrapOk(expResult));
                    break;
            }
        }
        switch (args.length) {
            case 0: return ts_utilities_1.ok({ kind: 'number', value: 1 });
            case 1: return ts_utilities_1.ok(args[0]);
            default: return ts_utilities_1.ok({ kind: '*', arguments: args });
        }
    }
    exponential() {
        let negate = false;
        if (this.index < this.length && this.source[this.index].kind === '-') {
            negate = true;
            this.index += 1;
        }
        let expResult = this.atom();
        if (ts_utilities_1.isErr(expResult)) {
            return ts_utilities_1.err(ts_utilities_1.unwrapErr(expResult));
        }
        let exp = ts_utilities_1.unwrapOk(expResult);
        if (this.index < this.length && this.source[this.index].kind === '^') {
            this.index += 1;
            expResult = this.exponential();
            if (ts_utilities_1.isErr(expResult)) {
                return ts_utilities_1.err(ts_utilities_1.unwrapErr(expResult));
            }
            exp = { kind: '^', base: exp, exp: ts_utilities_1.unwrapOk(expResult) };
        }
        if (negate) {
            const mOne = { kind: 'number', value: -1 };
            exp = { kind: '*', arguments: [mOne, exp] };
        }
        return ts_utilities_1.ok(exp);
    }
    atom() {
        if (this.index < this.length) {
            const current = this.source[this.index];
            this.index += 1;
            if (current.kind === 'number') {
                return ts_utilities_1.ok({ kind: 'number', value: current.value });
            }
            if (current.kind === 'variable') {
                return ts_utilities_1.ok({ kind: 'variable', name: current.name });
            }
            if (current.kind === 'constant') {
                return ts_utilities_1.ok({ kind: 'constant', name: current.name });
            }
            if (current.kind === 'function') {
                const argResult = this.atom();
                if (ts_utilities_1.isErr(argResult)) {
                    return ts_utilities_1.err(ts_utilities_1.unwrapErr(argResult));
                }
                return ts_utilities_1.ok({ kind: 'function', name: current.name, argument: ts_utilities_1.unwrapOk(argResult) });
            }
            if (current.kind === '(') {
                const exprResult = this.expression();
                if (ts_utilities_1.isErr(exprResult)) {
                    return ts_utilities_1.err(ts_utilities_1.unwrapErr(exprResult));
                }
                if (this.index < this.length && this.source[this.index].kind === ')') {
                    this.index += 1;
                    return ts_utilities_1.ok(ts_utilities_1.unwrapOk(exprResult));
                }
                else {
                    const position = this.source[this.length - 1].start;
                    return ts_utilities_1.err({
                        end: position,
                        lexemes: '',
                        message: 'Unmatched parentheses',
                        start: position,
                    });
                }
            }
            return ts_utilities_1.err({
                end: current.end,
                lexemes: current.lexeme,
                message: 'Expected a number, variable, or function',
                start: current.start,
            });
        }
        return ts_utilities_1.err({
            end: this.length,
            lexemes: '',
            message: 'End of input reached prematurely.',
            start: this.length,
        });
    }
}
exports.Parser = Parser;
//# sourceMappingURL=parser.js.map