import {expect} from "chai";
import {
    Exp,
    makeAppExp, makeDefineExp,
    makeLetValuesExp,
    makeNumExp,
    makePrimOp, makeProcExp,
    makeStrExp,
    makeValuesBinding,
    makeVarDecl,
    makeVarRef,
    parseL5Exp,
    unparse
} from "../L5-ast";
import {bind, isOk, makeOk, Result} from "../../shared/result";
import {parse as parseSexp} from "../../shared/parser";
import {makeTVar, parseTExp, TVar} from "../TExp";

const p = (x: string): Result<Exp> => bind(parseSexp(x), parseL5Exp);

const makeTVarGen = (): () => TVar => {
    let count: number = 0;
    return () => {
        count++;
        return makeTVar(`T_${count}`);
    }
}

describe('L5 Parse', () => {
    let tVarGen = makeTVarGen();

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
                makeVarDecl("a", tVarGen()),
                makeVarDecl("b", tVarGen()),
                makeVarDecl("c", tVarGen()),
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

    it('test simple - 3', () => {
        expect(p("(define f (lambda (x) (values 1 2 3)))")).to.deep.eq(makeOk(
           makeDefineExp(
               makeVarDecl("f", tVarGen()),
               makeProcExp(
                   [makeVarDecl("x", tVarGen())],
                   [makeAppExp(
                       makePrimOp("values"), [
                           makeNumExp(1),
                           makeNumExp(2),
                           makeNumExp(3),
                       ]
                   )],
                   tVarGen()
               )
           )
        ));
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
        console.log(roundTrip(define));
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

