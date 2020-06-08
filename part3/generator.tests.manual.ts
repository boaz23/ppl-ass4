import { biased } from "./part3";

function* gen1() {
    yield 3;
    yield 6;
    yield 9;
    yield 12;
}
function* gen2() {
    yield 8;
    yield 10;
}

function* take<T, TReturn>(n: number, generator: Generator<T, TReturn>) {
    for (let x of generator) {
        if (n <= 0) return;
        n--;
        yield x;
    }
}

function* naturalNumbers() {
    for (let n=0;; n++) {
        yield n;
    }
}

function* range(start: number, end: number) {
    for (let n=start; n < end; n++) {
        yield n;
    }
}

function* r() {
    yield "";
    yield "5";
    yield "-";
    yield [62];
    yield {hi: "hello"};
}

for (let n of take(25, biased(naturalNumbers(),range(50, 56)))) {
    console.log(n);
}