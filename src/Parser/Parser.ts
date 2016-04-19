import Either from "@cousinomath/utilities/Either";

interface ParserState<S,T> {
  input: Array<S>;
  processed: Array<S>;
  state: Array<Either<string,T>>;
}

class ParserCombinator<S,T> {
  parser: (state: ParserState<S,T>) => ParserState<S,T>;

  constructor(parser: (state: ParserState<S,T>) => ParserState<S,T>) {
    this.parser = parser;
  }

  orElse(pc: ParserCombinator<S,T>): ParserCombinator<S,T> {
    let newParser = function(state: ParserState<S,T>): ParserState<S,T> {
      let firstTry = this.parser(state);
      let result = firstTry.state;
      if(result[result.length - 1].isLeft()) {
        return pc.parser(state);
      } else {
        return firstTry;
      }
    }
    return new ParserCombinator<S,T>(newParser);
  }

  alternatives(pcs: Array<ParserCombinator<S,T>>): ParserCombinator<S,T> {
    let newParser = function(pstate: ParserState<S,T>): ParserState<S,T> {
      let attempt = this.parser(pstate);
      let result = attempt.state;
      while(result[result.length - 1].isLeft()) {
        attempt = pcs.shift().parser(pstate);
        result = attempt.state;
      }
      return result;
    }
    return new ParserCombinator<S,T>(newParser);
  }

  andThen(pc: ParserCombinator<S,T>): ParserCombinator<S,T> {
    let newParser = function(state: ParserState<S,T>): ParserState<S,T> {
      return pc.parser(this.parser(state));
    }
    return new ParserCombinator<S,T>(newParser);
  }

  zeroOrMore(): ParserCombinator<S,T> {
    let newParser = function(state: ParserState<S,T>): ParserState<S,T> {
      let lastResult = state;
      let nextTry = this.parser(lastResult);
      let result = nextTry.state;
      while(result[result.length - 1].isRight() && nextTry.input.length > 0) {
        lastResult = nextTry;
        nextTry = this.parser(lastResult);
        result = nextTry.state;
      }
      return lastResult;
    }
    return new ParserCombinator<S,T>(newParser);
  }
  //TODO: oneOrMore
  //TODO: zeroOrMoreSepBy(sep: ParserCombinator<S,T>): ParserCombinator<S,T>
  //TODO: oneOrMoreSepBy
}

function RegExpCombinator<T>(re: RegExp,
          transform: (str: string, state: Array<Either<string,T>>) => T,
          error: (state: ParserState<string,T>) => string): ParserCombinator<string, T> {
  let parser = function(pstate: ParserState<string,T>): ParserState<string,T> {
    let input = pstate.input.join('');
    let result = re.exec(input);
    let match: string;
    let inState = pstate.state;
    let outState: ParserState<string, T>
    if(result.index == 0) {
      match = result[0];
      outState.input = input.slice(re.lastIndex).split('');
      outState.processed = pstate.processed.concat(match.split(''));
      outState.state = pstate.state.concat(Either.Right<string,T>(transform(match, pstate.state)));
      return outState;
    } else {
      pstate.state.push(Either.Left<string,T>(error(pstate)));
      return pstate;
    }
  };
  return new ParserCombinator<string,T>(parser);
}

function failedToMatchMessage<S,T>(str: string): (st: ParserState<S,T>) => string {
  return function(st) {
    return "Failed to match " + str + " starting at position " + st.processed.length;
  }
}

function matchToken(str: string): (s: string, st: Array<Either<string,string>>) => string {
  return function(s, st) { return str; };
}

function createREcomb(re: RegExp, tok: string, name: string) {
  return RegExpCombinator<string>(re, matchToken(tok), failedToMatchMessage(name));
}

let lessThan = createREcomb(/</, "<", "less than");
let lessEq = createREcomb(/<=/, "<=", "less than or equal to");
let equals = createREcomb(/=/, "=", "equals");
let greaterThan = createREcomb(/>/, ">", "greater than");
let greaterEq = createREcomb(/>=/, ">=", "greater than or equal to");
let plus = createREcomb(/\+/, "+", "plus");
let minus = createREcomb(/-/, "-", "minus");
let times = createREcomb(/\*/, "*", "times");
let divides = createREcomb(/\//, "/", "divides");
let power = createREcomb(/\^/, "^", "power");
let numberLit = RegExpCombinator<string>(/(?:+|-)*(?:[0-9]*\.[0-9]+|[0-9])+/,
  function(str, st) { return str; },
  function(st) { return "Failed to parse a number starting at position " + st.processed.length; });
let functionLit = RegExpCombinator<string>(/log|ln|sqrt|exp|(?:a(?:rc)?)?(?:sin|cos|tan|sec|csc|cot)/i,
  function(str, st) {
    let token = str.toLowerCase();
    switch(token) {
      case "asin": return "arcsin";
      case "acos": return "arccos";
      case "atan": return "arctan";
      case "asec": return "arcsec";
      case "acsc": return "arccsc";
      case "acot": return "arccot";
      default: return token;
    }},
  function(st) { return "Failed to parse a function name starting at position " + st.processed.length; });
let variableLit = RegExpCombinator<string>(/[a-zA-Z]\w*/,
  function(str, st) { return str; },
  function(st) { return "Failed to parse a variable name starting at position " + st.processed.length; });
let relationSymbol = lessThan.alternatives([lessEq, equals, greaterThan, greaterEq]);
