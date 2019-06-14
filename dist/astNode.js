"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const complex_js_1 = tslib_1.__importDefault(require("complex.js"));
function evaluate(node, memory) {
    switch (node.kind) {
        case '+':
            return node.arguments.reduce((sum, arg) => {
                const [sumRe, sumIm] = sum.toVector();
                return evaluate(arg, memory).add(sumRe, sumIm);
            }, complex_js_1.default.ZERO);
        case '*':
            return node.arguments.reduce((prod, arg) => {
                const [prodRe, prodIm] = prod.toVector();
                return evaluate(arg, memory).mul(prodRe, prodIm);
            }, complex_js_1.default.ONE);
        case '^':
            const [expRe, expIm] = evaluate(node.exp, memory).toVector();
            return evaluate(node.base, memory).pow(expRe, expIm);
        case '-':
            const [right1Re, right1Im] = evaluate(node.right, memory).toVector();
            return evaluate(node.left, memory).sub(right1Re, right1Im);
        case '/':
            const [right2Re, right2Im] = evaluate(node.right, memory).toVector();
            return evaluate(node.left, memory).div(right2Re, right2Im);
        case 'function':
            const argEvaled = evaluate(node.argument, memory);
            switch (node.name) {
                case 'abs': return new complex_js_1.default(argEvaled.abs(), 0);
                case 'asec': return argEvaled.asec();
                case 'asin': return argEvaled.asin();
                case 'atan': return argEvaled.atan();
                case 'cos': return argEvaled.cos();
                case 'exp': return argEvaled.exp();
                case 'log': return argEvaled.log();
                case 'sin': return argEvaled.sin();
                case 'sqrt': return argEvaled.sqrt();
                case 'tan': return argEvaled.tan();
            }
        case 'constant':
            switch (node.name) {
                case 'i': return complex_js_1.default.I;
                case 'pi': return complex_js_1.default.PI;
                case 'e': return complex_js_1.default.E;
            }
        case 'variable':
            const retrieval = memory.get(node.name);
            return retrieval !== undefined ? retrieval : complex_js_1.default.NAN;
        case 'number':
            return new complex_js_1.default(node.value, 0);
    }
    return complex_js_1.default.NAN;
}
exports.evaluate = evaluate;
function shouldNegate(node) {
    if (node.kind === '*' && node.arguments.length === 2) {
        const first = node.arguments[0];
        if (first.kind === 'number' && first.value === -1) {
            return [true, node.arguments[1]];
        }
    }
    return [false, node];
}
function shouldReciprocate(node) {
    if (node.kind === '^') {
        const exp = node.exp;
        if (exp.kind === 'number' && exp.value === -1) {
            return [true, node.base];
        }
    }
    return [false, node];
}
function shouldParenthesize(parent, node) {
    switch (parent.kind) {
        case '+':
        case '-':
        case '/': // will be wrapped in `\frac{*}{*}`
            return false;
        case '*':
            switch (node.kind) {
                case '+':
                case '-':
                    return true;
                default:
                    return false;
            }
        case '^':
            switch (node.kind) {
                case '+':
                case '-':
                case '*':
                case '/':
                    return true;
                default:
                    return parent.exp === node;
            }
        case 'function':
            switch (parent.name) {
                case 'abs':
                case 'sqrt':
                    return false;
                default:
                    return true;
            }
        default:
            return false;
    }
}
function latexDisplay(node) {
    switch (node.kind) {
        case '+':
            switch (node.arguments.length) {
                case 0: return '0';
                default:
                    const terms = node.arguments;
                    const firstTerm = terms.shift();
                    const [firstNegate, actualFirstTerm] = shouldNegate(firstTerm);
                    let output = latexDisplay(actualFirstTerm);
                    output = shouldParenthesize(node, actualFirstTerm) ?
                        `\\left(${output}\\right)` : output;
                    output = (firstNegate ? '-' : '') + output;
                    for (const term of terms) {
                        // no need to parenthesize here; parent is `+`
                        const [negate0, actualTerm] = shouldNegate(term);
                        output += (negate0 ? '-' : '+') + latexDisplay(actualTerm);
                    }
                    return output;
            }
        case '*':
            const [negate1, actualFactor1] = shouldNegate(node);
            if (negate1) {
                return `-${latexDisplay(actualFactor1)}`;
            }
            switch (node.arguments.length) {
                case 0: return '1';
                default:
                    const factors = node.arguments;
                    const firstFactor = factors.shift();
                    const [negate2, actualFactor2] = shouldNegate(firstFactor);
                    let output = latexDisplay(actualFactor2);
                    let parenthesize = shouldParenthesize(node, actualFactor2);
                    for (const factor of factors) {
                        const [recip, actualFactor0] = shouldReciprocate(factor);
                        const factorOutput = latexDisplay(actualFactor0);
                        if (recip) {
                            output = output.startsWith('-') ?
                                `-\\frac{${output.substring(1)}}{${factorOutput}}` :
                                `\\frac{${output}}{${factorOutput}}`;
                        }
                        else {
                            if (parenthesize) {
                                output = `\\left(${output}\\right)`;
                            }
                            output = shouldParenthesize(node, factor) ?
                                `${output} \\left(${factorOutput}\\right)` :
                                `${output} ${factorOutput}`;
                        }
                        parenthesize = false;
                    }
                    return negate2 ? `-${output}` : output;
            }
        case '^':
            const baseOutput = latexDisplay(node.base);
            const expOutput = `}^{${latexDisplay(node.exp)}}`;
            if (shouldParenthesize(node, node.base)) {
                return `{\\left(${baseOutput}\\right)${expOutput}`;
            }
            else {
                return `{${baseOutput}${expOutput}`;
            }
        case '-':
            return `${latexDisplay(node.left)}-${latexDisplay(node.right)}`;
        case '/':
            return `\\frac{${latexDisplay(node.left)}}{${latexDisplay(node.right)}}`;
        case 'function':
            const argOutput = latexDisplay(node.argument);
            switch (node.name) {
                case 'abs': return `\\left|${argOutput}\\right|`;
                case 'asec':
                    if (shouldParenthesize(node, node.argument)) {
                        return `\\sec^{-1}\\left(${argOutput}\\right)`;
                    }
                    else {
                        return `\\sec^{-1}${argOutput}`;
                    }
                case 'asin':
                    if (shouldParenthesize(node, node.argument)) {
                        return `\\sin^{-1}\\left(${argOutput}\\right)`;
                    }
                    else {
                        return `\\sin^{-1}${argOutput}`;
                    }
                case 'atan':
                    if (shouldParenthesize(node, node.argument)) {
                        return `\\tan^{-1}\\left(${argOutput}\\right)`;
                    }
                    else {
                        return `\\tan^{-1}${argOutput}`;
                    }
                case 'sqrt': return `\\sqrt{${argOutput}}`;
                default:
                    const funcOutput = `\\${node.name}`;
                    if (shouldParenthesize(node, node.argument)) {
                        return `${funcOutput}\\left(${argOutput}\\right)`;
                    }
                    else {
                        return `${funcOutput} ${argOutput}`;
                    }
            }
        case 'constant':
            switch (node.name) {
                case 'pi': return '\\pi';
                default: return node.name;
            }
        case 'variable':
            return node.name;
        case 'number':
            return node.value.toPrecision();
    }
    return 'not yet implemented';
}
exports.latexDisplay = latexDisplay;
//# sourceMappingURL=astNode.js.map