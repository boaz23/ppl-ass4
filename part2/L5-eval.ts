// L5-eval-box

import {map, reduce, repeat, zipWith} from "ramda";
import {
    Binding,
    CExp,
    Exp,
    IfExp,
    isAppExp,
    isBoolExp,
    isCExp,
    isDefineExp,
    isIfExp,
    isLetExp,
    isLetrecExp,
    isLetValuesExp,
    isLitExp,
    isNumExp,
    isPrimOp,
    isProcExp,
    isSetExp,
    isStrExp,
    isValuesExp,
    isVarRef,
    LetExp,
    LetrecExp,
    LetValuesExp,
    parseL5Exp,
    ProcExp,
    Program,
    SetExp,
    ValuesBinding,
    ValuesExp,
    VarDecl
} from './L5-ast';
import {
    applyEnv,
    applyEnvBdg,
    Env,
    FBinding,
    globalEnvAddBinding,
    makeExtEnv,
    setFBinding,
    theGlobalEnv
} from "./L5-env";
import {Closure, isClosure, isTuple, makeClosure, makeTuple, Value} from "./L5-value";
import {first, isEmpty, rest} from '../shared/list';
import {bind, makeFailure, makeOk, mapResult, Result, safe2} from "../shared/result";
import {parse as p} from "../shared/parser";
import {applyPrimitive} from "./evalPrimitive";

// ========================================================
// Eval functions

export const applicativeEval = (exp: CExp, env: Env): Result<Value> =>
    isNumExp(exp) ? makeOk(exp.val) :
    isBoolExp(exp) ? makeOk(exp.val) :
    isStrExp(exp) ? makeOk(exp.val) :
    isPrimOp(exp) ? makeOk(exp) :
    isVarRef(exp) ? applyEnv(env, exp.var) :
    isLitExp(exp) ? makeOk(exp.val) :
    isIfExp(exp) ? evalIf(exp, env) :
    isProcExp(exp) ? evalProc(exp, env) :
    isLetExp(exp) ? evalLet(exp, env) :
    isLetrecExp(exp) ? evalLetrec(exp, env) :
    isLetValuesExp(exp) ? evalLetValuesExp(exp, env) :
    isValuesExp(exp) ? evalValuesExp(exp, env) :
    isSetExp(exp) ? evalSet(exp, env) :
    isAppExp(exp) ? safe2((proc: Value, args: Value[]) => applyProcedure(proc, args))
                        (applicativeEval(exp.rator, env), mapResult(rand => applicativeEval(rand, env), exp.rands)) :
    makeFailure(`Bad L5 AST ${exp}`);

export const isTrueValue = (x: Value): boolean =>
    ! (x === false);

const evalIf = (exp: IfExp, env: Env): Result<Value> =>
    bind(applicativeEval(exp.test, env),
         (test: Value) => isTrueValue(test) ? applicativeEval(exp.then, env) : applicativeEval(exp.alt, env));

const evalProc = (exp: ProcExp, env: Env): Result<Closure> =>
    makeOk(makeClosure(exp.args, exp.body, env));

// KEY: This procedure does NOT have an env parameter.
//      Instead we use the env of the closure.
const applyProcedure = (proc: Value, args: Value[]): Result<Value> =>
    isPrimOp(proc) ? applyPrimitive(proc, args) :
    isClosure(proc) ? applyClosure(proc, args) :
    makeFailure(`Bad procedure ${JSON.stringify(proc)}`);

const applyClosure = (proc: Closure, args: Value[]): Result<Value> => {
    const vars = map((v: VarDecl) => v.var, proc.params);
    return evalSequence(proc.body, makeExtEnv(vars, args, proc.env));
}

// Evaluate a sequence of expressions (in a program)
export const evalSequence = (seq: Exp[], env: Env): Result<Value> =>
    isEmpty(seq) ? makeFailure("Empty sequence") :
    isDefineExp(first(seq)) ? evalDefineExps(first(seq), rest(seq)) :
    evalCExps(first(seq), rest(seq), env);

const evalCExps = (first: Exp, rest: Exp[], env: Env): Result<Value> =>
    isCExp(first) && isEmpty(rest) ? applicativeEval(first, env) :
    isCExp(first) ? bind(applicativeEval(first, env), _ => evalSequence(rest, env)) :
    makeFailure("Never");

// define always updates theGlobalEnv
// We also only expect defineExps at the top level.
// Eval a sequence of expressions when the first exp is a Define.
// Compute the rhs of the define, extend the env with the new binding
// then compute the rest of the exps in the new env.
const evalDefineExps = (def: Exp, exps: Exp[]): Result<Value> =>
    isDefineExp(def) ? bind(applicativeEval(def.val, theGlobalEnv),
                            (rhs: Value) => { globalEnvAddBinding(def.var.var, rhs);
                                              return evalSequence(exps, theGlobalEnv); }) :
    makeFailure("Unexpected " + def);

// Main program
export const evalProgram = (program: Program): Result<Value> =>
    evalSequence(program.exps, theGlobalEnv);

export const evalParse = (s: string): Result<Value> =>
    bind(bind(p(s), parseL5Exp), (exp: Exp) => evalSequence([exp], theGlobalEnv));

// LET: Direct evaluation rule without syntax expansion
// compute the values, extend the env, eval the body.
const evalLet = (exp: LetExp, env: Env): Result<Value> => {
    const vals = mapResult((v : CExp) => applicativeEval(v, env), map((b : Binding) => b.val, exp.bindings));
    const vars = map((b: Binding) => b.var.var, exp.bindings);
    return bind(vals, (vals: Value[]) => evalSequence(exp.body, makeExtEnv(vars, vals, env)));
}

// LETREC: Direct evaluation rule without syntax expansion
// 1. extend the env with vars initialized to void (temporary value)
// 2. compute the vals in the new extended env
// 3. update the bindings of the vars to the computed vals
// 4. compute body in extended env
const evalLetrec = (exp: LetrecExp, env: Env): Result<Value> => {
    const vars = map((b) => b.var.var, exp.bindings);
    const vals = map((b) => b.val, exp.bindings);
    const extEnv = makeExtEnv(vars, repeat(undefined, vars.length), env);
    // @@ Compute the vals in the extended env
    const cvalsResult = mapResult((v: CExp) => applicativeEval(v, extEnv), vals);
    const result = bind(cvalsResult,
                        (cvals: Value[]) => makeOk(zipWith((bdg, cval) => setFBinding(bdg, cval), extEnv.frame.fbindings, cvals)));
    return bind(result, _ => evalSequence(exp.body, extEnv));
};

type RuntimeBindingPair = [string, Value];

const evalValuesBinding = (binding: ValuesBinding, env: Env): Result<RuntimeBindingPair[]> =>
    bind(
        applicativeEval(binding.tuple, env),
        (value: Value) =>
            !isTuple(value) ? makeFailure("value of let-value binding must be a tuple") :
            binding.vars.length !== value.values.length ? makeFailure("number of declared variables in let-value binding is different than the number of values in the evaluated tuple") :
            makeOk(zipWith(
                (varDecl: VarDecl, value: Value) => [varDecl.var, value],
                binding.vars,
                value.values
            ))
    );

const evalLetValuesExp = (exp: LetValuesExp, env: Env): Result<Value> => {
    const envBindingsRes: Result<RuntimeBindingPair[]> = reduce(
        (accRes: Result<RuntimeBindingPair[]>, binding: ValuesBinding) =>
            bind(
                accRes,
                (acc: RuntimeBindingPair[]) => bind(evalValuesBinding(binding, env),
                (tupleBindings: RuntimeBindingPair[]) => makeOk(acc.concat(tupleBindings)))
            ),
            makeOk([]),
            exp.bindings
    );

    return bind(
        envBindingsRes,
        (envBindings: RuntimeBindingPair[]) => {
            const vars: string[] = map(
                (binding: RuntimeBindingPair) => binding[0],
                envBindings
            );
            const vals: Value[] = map(
                (binding: RuntimeBindingPair) => binding[1],
                envBindings
            );

            return evalSequence(exp.body, makeExtEnv(vars, vals, env));
        }
    );
}

const evalValuesExp = (exp: ValuesExp, env: Env): Result<Value> =>
    bind(
        mapResult((valueExp: CExp) => applicativeEval(valueExp, env), exp.valueExps),
        (values: Value[]) => makeOk(makeTuple(values))
    );

// L4-eval-box: Handling of mutation with set!
const evalSet = (exp: SetExp, env: Env): Result<void> =>
    safe2((val: Value, bdg: FBinding) => makeOk(setFBinding(bdg, val)))
        (applicativeEval(exp.val, env), applyEnvBdg(env, exp.var.var));
