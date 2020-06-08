import {expect} from "chai";
import {evalParse, evalProgram as evalProgramNode} from "../L5-eval";
import {makeOk, bind} from "../../shared/result";
import {makeTuple} from "../L5-value";
import {parseL5, Program} from "../L5-ast";

const evalProgram = (programString: string) =>
    bind(
        parseL5(programString),
        (programNode: Program) => evalProgramNode(programNode)
    );

describe('L5 eval tiples', () => {
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
       `))
    });
});