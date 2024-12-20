//import * as _pq  from 'npm:@datastructures-js/priority-queue@5.4.0';
import { Deque } from "npm:@datastructures-js/deque@1.0.4";
const inputName = Deno.args[0] ?? "11.in";
const text = Deno.readTextFileSync(inputName);
const lines = text.split(/\r?\n/);
let index = 0;
let line = lines[index];
let stones = line.split(" ").map((v) => BigInt(v));

const start = Date.now();
const numberOfBlinksArg = Number(Deno.args[1]) ?? 25;
const simulate = (
  input: Array<bigint>,
  numberOfBlinks: number,
): Array<bigint> => {
  for (let blink = 1; blink <= numberOfBlinks; blink++) {
    //console.log(stones);
    //console.log(blink, input.length, visited.size);
    const newStones = new Array<bigint>();
    for (const stone of input) {
      const stoneString = stone.toString();
      if (stone == 0n) {
        newStones.push(1n);
      } else if ((stoneString.length & 1) == 0) {
        newStones.push(BigInt(stoneString.slice(0, stoneString.length >> 1)));
        newStones.push(BigInt(stoneString.slice(stoneString.length >> 1)));
      } else {
        newStones.push(stone * 2024n);
      }
    }
    input = newStones;
		console.log(blink, input.length);
		if (blink < numberOfBlinksArg) console.log(input);
  }
  return input;
};
const stones40 = simulate(stones, 40);
console.log("Time elapsed (s):", Math.floor((Date.now() - start)/1000))
const visited = new Map<bigint, bigint>();
for (const stone of stones40) visited.set(stone, 0n);
let ii = 0;
for (const stone of visited.keys()) {
	console.log(ii++, visited.size);
	const singleStone = new Array<bigint>();
	singleStone.push(stone);
	const simulated = simulate(singleStone, 35);
	visited.set(stone, BigInt(simulated.length));
}

console.log(stones.length);
let size = 0n;
for (const stone of stones40) {
	size += visited.get(stone)!;
}
console.log("Time elapsed (s):", Math.floor((Date.now() - start)/1000))
console.log(size);
// 234430066982597n
