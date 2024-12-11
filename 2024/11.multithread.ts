//import * as _pq  from 'npm:@datastructures-js/priority-queue@5.4.0';
import { Deque } from "npm:@datastructures-js/deque@1.0.4";
const inputName = Deno.args[0] ?? "11.in";
const text = Deno.readTextFileSync(inputName);
const lines = text.split(/\r?\n/);
let index = 0;
let line = lines[index];
let stones = line.split(" ").map((v) => BigInt(v));

const start = Date.now();
const totalSteps = 75;
const firstHalfSteps = 40;
const secondHalfSteps = totalSteps - firstHalfSteps;
const simulate = (
  input: Array<bigint>,
  numberOfBlinks: number,
): Array<bigint> => {
  for (let blink = 1; blink <= numberOfBlinks; blink++) {
    //console.log(stones);
    console.log(blink);
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
  }
  return input;
};
const stonesFirstHalf = simulate(stones, firstHalfSteps);
console.log("Time elapsed (s):", Math.floor((Date.now() - start)/1000))
const visited = new Map<bigint, bigint>();
for (const stone of stonesFirstHalf) visited.set(stone, 0n);
console.log(stonesFirstHalf.length, visited.size);
const workers = new Array<Worker>();
const poolSize = 16;
for (let i = 0; i < poolSize; i++) {
  const worker = new Worker(new URL("./11.worker.ts", import.meta.url).href, {
    type: "module",
  });
  workers.push(worker);
}
let ii = 0;
let received = 0;
for (const stone of visited.keys()) {
  ii++;
  if ((ii % 100) == 0) {
    console.log("Sent", ii, visited.size);
  }
  const worker = workers[ii % poolSize];
  worker.postMessage({
    stone: stone,
    numberOfBlinks: secondHalfSteps,
    messageNumber: ii,
  });
  worker.onmessage = (e) => {
    const { stoneLength, messageNumber } = e.data;
    visited.set(stone, stoneLength);
    received++;
    console.log("Received", messageNumber, received, visited.size);
  };
}

console.log(stones.length);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
while (received < visited.size) {
  console.log("So far:", received, visited.size);
  await sleep(2000);
}
let size = 0n;
for (const stone of stonesFirstHalf) {
  size += visited.get(stone)!;
}
console.log("Time elapsed (s):", Math.floor((Date.now() - start)/1000))
console.log(size);
// 234430066982597n
