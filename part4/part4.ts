export function f(x: number): Promise<number> {
    return new Promise<number>((resolve, reject) => {
        try {
            resolve(1 / x);
        }
        catch (e) {
            reject(e);
        }
    });
}

export function g(x: number): Promise<number> {
    return new Promise<number>((resolve, reject) => {
        try {
            resolve(x * x);
        }
        catch (e) {
            reject(e);
        }
    });
}

export function h(x: number): Promise<number> {
    return g(x)
        .then((x: number) => f(x))
        .catch((e) => {
            console.log(e);
            return e;
        });
}

export function slower(ps: [Promise<any>, Promise<any>]): Promise<[any, any]> {
    let p1 = ps[0], p2 = ps[1];
    return new Promise<[any, any]>((resolve, reject) => {
        // NOTE: This implementation does not prevent race conditions.
        // This doesn't seem to be the point of this question nor did we
        // learn the tools typescript has to offer for protection against asynchronous code.

        let whosDone: number = 0;
        p1.then(x => {
            if (!whosDone) {
                whosDone = 1;
            }

            // 1 -> 1, -1 -> 0
            p2.then(y => resolve(whosDone == 1 ? [1, y] : [0, x]))
              .catch(e => reject(e));
        })
        .catch(e => reject(e));

        p2.then(y => {
            if (!whosDone) {
                whosDone = -1;
            }
        });
    });
}