"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts_utilities_1 = require("@cousinomath/ts-utilities");
class Lexer {
    constructor(source) {
        this.start = 0;
        this.current = 0;
        // TODO: the symbols
        this.constants = ['i', 'π', 'pi', 'e'];
        this.functions = ['abs', 'asec', 'asin', 'atan', 'cos', 'exp',
            'log', 'sin', 'sqrt', 'tan'];
        this.source = source;
        this.length = source.length;
    }
    lex() {
        const tokens = [];
        this.start = this.current = 0;
        while (this.start < this.length) {
            this.skipWhitespace();
            this.start = this.current;
            if (this.start < this.length) {
                const nextToken = this.nextToken();
                if (ts_utilities_1.isOk(nextToken)) {
                    tokens.push(ts_utilities_1.unwrapOk(nextToken));
                }
                else {
                    return ts_utilities_1.err(ts_utilities_1.unwrapErr(nextToken));
                }
            }
            this.start = this.current;
        }
        tokens.push({ kind: 'eoi', lexeme: '', start: this.length, end: this.length });
        return ts_utilities_1.ok(tokens);
    }
    skipWhitespace() {
        const reResult = this.source.substring(this.start).match(/^\s+/m);
        if (reResult !== null && reResult.length > 0) {
            this.current += reResult[0].length;
        }
    }
    nextToken() {
        const current = this.source[this.start];
        switch (current) {
            case '+':
                this.current += 1;
                return ts_utilities_1.ok({
                    end: this.current,
                    kind: '+',
                    lexeme: current,
                    start: this.start,
                });
            case '-': // TODO en dash, em dash, minus
            case '−':
                this.current += 1;
                return ts_utilities_1.ok({
                    end: this.current,
                    kind: '-',
                    lexeme: current,
                    start: this.start,
                });
            case '*': // TODO star, cdot, cross
            case '×':
                this.current += 1;
                return ts_utilities_1.ok({
                    end: this.current,
                    kind: '*',
                    lexeme: current,
                    start: this.start,
                });
            case '/':
            case '÷':
            case '⁄':
                this.current += 1;
                return ts_utilities_1.ok({
                    end: this.current,
                    kind: '/',
                    lexeme: current,
                    start: this.start,
                });
            case '^':
                this.current += 1;
                return ts_utilities_1.ok({
                    end: this.current,
                    kind: '^',
                    lexeme: current,
                    start: this.start,
                });
            case '(':
                this.current += 1;
                return ts_utilities_1.ok({
                    end: this.current,
                    kind: '(',
                    lexeme: current,
                    start: this.start,
                });
            case ')':
                this.current += 1;
                return ts_utilities_1.ok({
                    end: this.current,
                    kind: ')',
                    lexeme: current,
                    start: this.start,
                });
            default:
                if (this.isNumeric() || this.source[this.start] === '.') {
                    return this.lexNumber();
                }
                else if (this.isAlpha()) {
                    return this.lexIdentifier();
                }
                else {
                    this.current += 1;
                    return ts_utilities_1.err({
                        end: this.current,
                        lexemes: current,
                        message: 'Unrecognized symbol',
                        start: this.start,
                    });
                }
        }
    }
    isAlpha() {
        return /[a-zA-Zπ]/.test(this.source[this.start]);
    }
    isNumeric() {
        return /\d/.test(this.source[this.start]);
    }
    lexNumber() {
        const reResult = this.source.substring(this.start).match(/^[\d.]+/);
        if (reResult !== null && reResult.length > 0) {
            this.current += reResult[0].length;
            const parseResult = Number.parseFloat(reResult[0]);
            const dots = reResult[0].match(/[.]/g);
            const numDots = dots === null ? 0 : dots.length;
            if (Number.isNaN(parseResult) || numDots > 1) {
                return ts_utilities_1.err({
                    end: this.current,
                    lexemes: reResult[0],
                    message: 'Could not understand this number',
                    start: this.start,
                });
            }
            return ts_utilities_1.ok({
                end: this.current,
                kind: 'number',
                lexeme: reResult[0],
                start: this.start,
                value: parseResult,
            });
        }
        else {
            // unreachable
            return ts_utilities_1.err({
                end: this.start,
                lexemes: this.source[this.start],
                message: 'Something went wrong trying to read a number in your response',
                start: this.start,
            });
        }
    }
    lexIdentifier() {
        const reResult = this.source.substring(this.start).match(/^[\wπ]+/);
        if (reResult !== null && reResult.length > 0) {
            const identifier = reResult[0].toLowerCase();
            this.current += identifier.length;
            if (this.functions.indexOf(identifier) >= 0) {
                return ts_utilities_1.ok({
                    end: this.current,
                    kind: 'function',
                    lexeme: reResult[0],
                    name: identifier,
                    start: this.start,
                });
            }
            else if (this.constants.indexOf(identifier) >= 0) {
                return ts_utilities_1.ok({
                    end: this.current,
                    kind: 'constant',
                    lexeme: reResult[0],
                    name: identifier === 'π' ? 'pi' : identifier,
                    start: this.start,
                });
            }
            else {
                return ts_utilities_1.ok({
                    end: this.current,
                    kind: 'variable',
                    lexeme: reResult[0],
                    name: identifier,
                    start: this.start,
                });
            }
        }
        else {
            // unreachable
            return ts_utilities_1.err({
                end: this.start,
                lexemes: this.source[this.start],
                message: 'Something went wrong trying to read an identifier in your response',
                start: this.start,
            });
        }
    }
}
exports.Lexer = Lexer;
//# sourceMappingURL=lexer.js.map