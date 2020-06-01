import { h, slower } from './promises'

h(0)
.then((x: number) => console.log(x))
.catch((e) => console.error("Error: " + e));

const promise1 = new Promise(function(resolve, reject) {
    setTimeout(resolve, 100, 'one');
});
const promise2 = new Promise(function(resolve, reject) {
    setTimeout(resolve, 50, 'two');
});

slower([promise1, promise2]).then(function(value) {
    console.log(value);
});