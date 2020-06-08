import {expect} from "chai";
import {evalParse, evalProgram as evalProgramNode} from "../L5-eval";
import {makeOk, bind, makeFailure} from "../../shared/result";
import {makeCompoundSExp, makeTuple} from "../L5-value";
import {parseL5, Program} from "../L5-ast";

const evalProgram = (programString: string) =>
    bind(
        parseL5(programString),
        (programNode: Program) => evalProgramNode(programNode)
    );

describe('L5 eval tuples', () => {
    it('evaluates values primitive op', () => {
        expect(evalParse('(values 1 "string")')).to.deep.eq(makeOk(
            makeTuple([
                1,
                "string"
            ])
        ));
    });

    it('evaluates let-values special form', () => {
       expect(evalProgram(`
(L5
(define f
    (lambda (x)
        (values 1 2 3)))
(let-values (((a b c) (f 0)))
    (+ a b c))
)
       `));

        expect(evalParse('(let-values (((n s) (values 1 "string"))) n)')).to.deep.eq(makeOk(1));
    });

    it('evaluates values prim op with no rands', () => {
        expect(evalProgram(`
(L5
(define f (lambda () (values)))
(f)
)`)).to.deep.eq(makeOk(makeTuple([])));
    });

    it('evaluates let-values with empty tuples', () => {
        expect(evalProgram(`
(L5
(define f (lambda () (values)))
(let-values
    ((() (values))
     (() (f))
     ((a) (values 5))) a)
)`)).to.deep.eq(makeOk(5));
    });

    it('tests evaluation of let-values fails when there\'s a mismatch between tuples length and binding variables count', () => {
        expect(evalProgram(`
(L5
(define f (lambda () (values)))
(let-values
    (((a) (f))
     (() (values))
     ((a) (values 5))) a)
)`)).to.deep.eq(makeFailure("number of declared variables in let-value binding is different than the number of values in the evaluated tuple"));

        expect(evalProgram(`
(L5
(define f (lambda () (values)))
(let-values
    ((() (f))
     ((b c) (values #t "my string" 5 2))
     ((a) (values 5))) a)
)`)).to.deep.eq(makeFailure("number of declared variables in let-value binding is different than the number of values in the evaluated tuple"));
    });

    it('evaluates nested tuples', () => {
        expect(evalParse('(values 1 "hi there" (values #f 6 (cons 1 2)))')).to.deep.eq(makeOk(
           makeTuple([
               1, "hi there", makeTuple([
                   false, 6, makeCompoundSExp(1, 2)
               ])
           ])
        ));

        expect(evalParse(`
(let-values (
        ((x y t) (values 1 #f (values)))
        ((a b c) (values 1 "hi there" (values #f 6 (cons 1 2))))
    )
    (let-values (((q p w) c)
                 (() t))
         (cdr w)
    )
)`)).to.deep.eq(makeOk(2));
    });
});