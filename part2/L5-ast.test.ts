import { expect } from "chai";
import {
    isNumExp,
    isBoolExp,
    isVarRef,
    isPrimOp,
    isProgram,
    isDefineExp,
    isVarDecl,
    isAppExp,
    isStrExp,
    isIfExp,
    isProcExp,
    isLetExp,
    isLitExp,
    isLetrecExp,
    isSetExp,
    parseL5Exp,
    unparse,
    Exp,
    parseL5,
    isLetValuesExp,
    LetValuesExp,
    makeAppExp,
    makePrimOp,
    makeNumExp,
    makeStrExp, makeLetValuesExp, makeValuesBinding, makeVarDecl, makeVarRef, VarDecl
} from "./L5-ast";
import { Result, bind, isOkT, isOk, makeOk } from "../shared/result";
import { parse as parseSexp } from "../shared/parser";
import {map} from "ramda";
import {makeFreshTVar, makeTVar, parseTExp} from "./TExp";

const p = (x: string): Result<Exp> => bind(parseSexp(x), parseL5Exp);

describe('L5 Unparse', () => {
    it('test1 -simple', () => {
        const define = "(values 1 “string”)";
        expect(p('(values 1 "string")')).to.deep.equal(makeOk((makeAppExp(makePrimOp("values") , [makeNumExp(1),makeStrExp("string")]))));
    });

    it('test2 -simple', () => {
        expect(p(`
(let-values (((a b c) (f 0)))
    (+ a b c))
`)).to.deep.equal(makeOk(makeLetValuesExp(
            [makeValuesBinding([
                makeVarDecl("a", makeTVar("T_1")),
                makeVarDecl("b", makeTVar("T_2")),
                makeVarDecl("c", makeTVar("T_3")),
            ], makeAppExp(
                makeVarRef("f"),
                [makeNumExp(0)]
            ))], [
                makeAppExp(
                    makePrimOp("+"), [
                        makeVarRef("a"),
                        makeVarRef("b"),
                        makeVarRef("c"),
                    ]
                )
            ]
        )));
    });
});









 describe('L5 Parser', () => {

    it('test1', () => {
        const def = p("(define f (lambda (x) (values 1 2 3)))");
        console.log(def);
    });

    it('test2', () => {
        const define = p("(let-values (((a b c) (f 0))) (+ a b c))");
        console.log(define);
        isOk(define)? isLetValuesExp(define.value)? console.log(define.value.bindings[0].vars) : console.log("lama"):console.log("lama") ;
        isOk(define)? isLetValuesExp(define.value)? console.log(define.value.bindings[0].tuple) : console.log("lama"):console.log("lama") ;
    });

    it('test3', () => {
        const define = p("(values 1 “string”)");
        console.log(define);
        isOk(define)? isAppExp(define.value)? console.log(define.value.rands[0]) : console.log("lama"):console.log("lama") ;
        isOk(define)? isAppExp(define.value)? console.log(define.value.rands[1]) : console.log("lama"):console.log("lama") ;
    });

 });

describe('L5 Unparse', () => {
    const roundTrip = (x: string): Result<string> => bind(p(x), unparse);

    it('test1 -unparse', () => {
        const define = "(values 1 “string”)";
        expect(roundTrip(define)).to.deep.equal(makeOk(define));
    });

    it('test2 -unparse', () => {
        const define = "(define f (lambda (x) (values 1 2 3)))";
        expect(roundTrip(define)).to.deep.equal(makeOk(define));
    });

    it('test2 -unparse', () => {
        const define = "(let-values (((a b c) (f 0))) (+ a b c))";
        expect(roundTrip(define)).to.deep.equal(makeOk(define));
    });

});
describe('L5 parseTexp', () => {
    

    it('test1 ', () => {
        const define = "(number * number * boolean)";
        console.log(parseTExp(define))
        expect(parseTExp(define)).to.deep.equal("DDD");
        console.log(parseTExp(define))
    });

 

});

