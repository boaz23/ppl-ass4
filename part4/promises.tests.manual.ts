import { h } from './promises'

h(0)
.then((x: number) => console.log(x))
.catch((e) => console.error("Error: " + e));