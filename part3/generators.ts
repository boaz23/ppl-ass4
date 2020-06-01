function* braid<T1, TReturn1, T2, TReturn2>(g1: Iterator<T1, TReturn1>, g2: Iterator<T2, TReturn2>): Generator<T1 | T2, void> {
    let tailGen: Iterator<T1, TReturn1> | Iterator<T2, TReturn2>;
    while (true) {
        let r1: IteratorResult<T1, TReturn1> = g1.next();
        if (r1.done) {
            tailGen = g2;
            break;
        }

        yield r1.value;

        let r2: IteratorResult<T2, TReturn2> = g2.next();
        if (r2.done) {
            tailGen = g1;
            break;
        }

        yield r2.value
    }

    let tailRes: IteratorResult<T1, TReturn1> | IteratorResult<T2, TReturn2>;
    while (true) {
        tailRes = tailGen.next();
        if (tailRes.done) {
            break;
        }

        yield tailRes.value;
    }
}

function* biased<T1, TReturn1, T2, TReturn2>(g1: Iterator<T1, TReturn1>, g2: Iterator<T2, TReturn2>): Generator<T1 | T2, void> {
    let tailGen: Iterator<T1, TReturn1> | Iterator<T2, TReturn2>;
    while (true) {
        let r1: IteratorResult<T1, TReturn1>;

        r1 = g1.next();
        if (r1.done) {
            tailGen = g2;
            break;
        }

        yield r1.value;
        r1 = g1.next();
        if (r1.done) {
            tailGen = g2;
            break;
        }

        yield r1.value;

        let r2: IteratorResult<T2, TReturn2> = g2.next();
        if (r2.done) {
            tailGen = g1;
            break;
        }

        yield r2.value;
    }

    let tailRes: IteratorResult<T1, TReturn1> | IteratorResult<T2, TReturn2>;
    while (true) {
        tailRes = tailGen.next();
        if (tailRes.done) {
            break;
        }

        yield tailRes.value;
    }
}