"use strict";
const Either_1 = require("@cousinomath/utilities/Either");
class ParserCombinator {
    constructor(parser) {
        this.parser = parser;
    }
    orElse(pc) {
        let newParser = function (state) {
            let firstTry = this.parser(state);
            let result = firstTry.state;
            if (result[result.length - 1].isLeft()) {
                return pc.parser(state);
            }
            else {
                return firstTry;
            }
        };
        return new ParserCombinator(newParser);
    }
    alternatives(pcs) {
        let newParser = function (pstate) {
            let attempt = this.parser(pstate);
            let result = attempt.state;
            while (result[result.length - 1].isLeft()) {
                attempt = pcs.shift().parser(pstate);
                result = attempt.state;
            }
            return result;
        };
        return new ParserCombinator(newParser);
    }
    andThen(pc) {
        let newParser = function (state) {
            return pc.parser(this.parser(state));
        };
        return new ParserCombinator(newParser);
    }
    zeroOrMore() {
        let newParser = function (state) {
            let lastResult = state;
            let nextTry = this.parser(lastResult);
            let result = nextTry.state;
            while (result[result.length - 1].isRight() && nextTry.input.length > 0) {
                lastResult = nextTry;
                nextTry = this.parser(lastResult);
                result = nextTry.state;
            }
            return lastResult;
        };
        return new ParserCombinator(newParser);
    }
}
function RegExpCombinator(re, transform, error) {
    let parser = function (pstate) {
        let input = pstate.input.join('');
        let result = re.exec(input);
        let match;
        let inState = pstate.state;
        let outState;
        if (result.index == 0) {
            match = result[0];
            outState.input = input.slice(re.lastIndex).split('');
            outState.processed = pstate.processed.concat(match.split(''));
            outState.state = pstate.state.concat(Either_1.default.Right(transform(match, pstate.state)));
            return outState;
        }
        else {
            pstate.state.push(Either_1.default.Left(error(pstate)));
            return pstate;
        }
    };
    return new ParserCombinator(parser);
}
function failedToMatchMessage(str) {
    return function (st) {
        return "Failed to match " + str + " starting at position " + st.processed.length;
    };
}
function matchToken(str) {
    return function (s, st) { return str; };
}
function createREcomb(re, tok, name) {
    return RegExpCombinator(re, matchToken(tok), failedToMatchMessage(name));
}
let lessThan = createREcomb(/</, "<", "less than");
let lessEq = createREcomb(/<=/, "<=", "less than or equal to");
let equals = createREcomb(/=/, "=", "equals");
let greaterThan = createREcomb(/>/, ">", "greater than");
let greaterEq = createREcomb(/>=/, ">=", "greater than or equal to");
let relationSymbol = lessThan.alternatives([lessEq, equals, greaterThan, greaterEq]);
let plus = createREcomb(/\+/, "+", "plus");
let minus = createREcomb(/-/, "-", "minus");
let times = createREcomb(/\*/, "*", "times");
let divides = createREcomb(/\//, "/", "divides");
let power = createREcomb(/\^/, "^", "power");
//# sourceMappingURL=Parser.js.map