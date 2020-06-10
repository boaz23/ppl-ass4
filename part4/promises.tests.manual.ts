import { h, slower } from './part4'

function print_h(x: number): void {
h(x)
.then((x: number) => console.log(x));
// .catch((e) => console.error("Error: " + e));
}

// h(0)
// .then((x: number) => console.log(x))
// .catch((e) => console.error("Error: " + e));

print_h(0);
print_h(2);
print_h(5);

    const promise1 = new Promise(function (resolve, reject) {
        setTimeout(resolve, 500, 'one');
    });
    const promise2 = new Promise(function (resolve, reject) {
        setTimeout(resolve, 450, 'two');
    });

    slower([promise1, promise2]).then(function (value) {
        console.log(value);
    });