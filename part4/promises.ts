function f(x: number): Promise<number> {
    return new Promise<number>((resolve, reject) => {
        try {
            resolve(1 / x);
        }
        catch (e) {
            reject(e);
        }
    });
}

function g(x: number): Promise<number> {
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
    return new Promise<number>((resolve, reject) => {
        return g(x)
            .then((x: number) => f(x))
            .then((x: number) => resolve(x))
            .catch((e) => reject(e));
    });
}