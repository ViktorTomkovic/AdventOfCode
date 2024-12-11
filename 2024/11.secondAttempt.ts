//import * as _pq  from 'npm:@datastructures-js/priority-queue@5.4.0';
//import { Deque } from "npm:@datastructures-js/deque@1.0.4";
import { JsonStringifyMap } from "./generalMap.ts";

const inputName = Deno.args[0] ?? "11.in";
const text = Deno.readTextFileSync(inputName);
const lines = text.split(/\r?\n/);
let index = 0;
let line = lines[index];
let stones = line.split(" ").map((v) => BigInt(v));

const start = Date.now();
const memo = new JsonStringifyMap<[bigint, number], bigint>();

const compute = (stone: bigint, numberOfBlinks: number): bigint => {
  if (memo.has([stone, numberOfBlinks])) {
    return memo.get([stone, numberOfBlinks])!;
  }
	if (numberOfBlinks == 0) {
		return 1n;
	}
  const stoneString = stone.toString();
  if (stone == 0n) {
    const result = compute(1n, numberOfBlinks - 1);
		memo.set([stone, numberOfBlinks], result);
		return result;
  } else if ((stoneString.length & 1) == 0) {
    const result = compute(
      BigInt(stoneString.slice(0, stoneString.length >> 1)),
      numberOfBlinks - 1,
    ) +
      compute(
        BigInt(stoneString.slice(stoneString.length >> 1)),
        numberOfBlinks - 1,
      );
		memo.set([stone, numberOfBlinks], result);
		return result;
  } else {
    const result = compute(stone * 2024n, numberOfBlinks - 1);
		memo.set([stone, numberOfBlinks], result);
		return result;
  }
};
const numberOfBlinks = Number(Deno.args[1]) ?? 25;
for (let i = 1; i <= numberOfBlinks; i++) {
	const result = stones.reduce((a,c) => a += compute(c, i), 0n);
	console.log(i, result);
}
//const result25 = stones.reduce((a,c) => a += compute(c, numberOfBlinks), 0n);
console.log("Time elapsed (s):", Math.floor((Date.now() - start) / 1000));
//console.log(result25);
// 55312
// 234430066982597n
