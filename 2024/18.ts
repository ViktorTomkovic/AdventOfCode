//import * as _pq  from 'npm:@datastructures-js/priority-queue@5.4.0';

import { Deque } from "@datastructures-js/deque";
import { PositionMap } from "./generalMap.ts";

//import { Deque } from 'npm:@datastructures-js/deque@1.0.4';
const inputName = Deno.args[0] ?? "18.in";
const text = Deno.readTextFileSync(inputName);
const lines = text.split(/\r?\n/);
let index = 0;
let line = lines[index];
const [endRow, endColumn] = line.split(",").map((n) => Number(n));
index++;
line = lines[index];
const corrupted = new Array<[number, number]>();
while (line != "") {
  const [row, column] = line.split(",").map((n) => Number(n));
  corrupted.push([row, column]);
  index++;
  line = lines[index];
}

console.log([endRow, endColumn]);
console.log(corrupted);

const hash = 200;
const toHash = ([row, column]: [number, number]): number => row * hash + column;
const rows = endRow + 1;
const columns = endColumn + 1;
const isInbounds = ([row, column]: [number, number]): boolean => {
  return !(row < 0 || row >= rows || column < 0 || column >= columns);
};
const directions: Array<[number, number]> = [[0, 1], [1, 0], [0, -1], [-1, 0]];
const applyDelta = (
  [r1, c1]: [number, number],
  [r2, c2]: [number, number],
): [number, number] => [r1 + r2, c1 + c2];

const corruptedInTime = new Array<Set<number>>(corrupted.length);
for (let t = 0; t < corrupted.length; t++) {
	corruptedInTime[t] = new Set<number>();
	for (let i = 0; i < t; i++) {
		corruptedInTime[t].add(toHash(corrupted[i]));
	}
}

const isInCorrupted = ([row, column]: [number, number], t: number): boolean => {
  const hashed = toHash([row, column]);
	return corruptedInTime[t].has(hashed);
  //for (let i = 0; i < Math.min(t, corrupted.length); i++) {
  //  if (toHash(corrupted[i]) == hashed) {
  //    return true;
  //  }
  //}
  //return false;
};

const generatePossibleVertices = (
  [row, column]: [number, number],
  t: number,
): Array<[number, number]> => {
  const result = new Array<[number, number]>();
  for (const direction of directions) {
    const [nRow, nColumn] = applyDelta([row, column], direction);
    if (isInbounds([nRow, nColumn]) && !isInCorrupted([nRow, nColumn], t)) {
      result.push([nRow, nColumn]);
    }
  }
  return result;
};

const shortestPath = (
  [startRow, startColumn]: [number, number],
  [endRow, endColumn]: [number, number],
  t: number,
): number => {
  const queue = new Deque<{ position: [number, number]; distance: number }>();
  queue.pushFront({ position: [startRow, startColumn], distance: 0 });
  const visited = new PositionMap<number>(hash);
  while (!queue.isEmpty()) {
    const current = queue.popFront();
    if (visited.has(current.position)) {
      continue;
    }
    // console.log(current);
    visited.set(current.position, current.distance);
    if (toHash(current.position) == toHash([endRow, endColumn])) break;
    const neighbours = generatePossibleVertices(current.position, t);
    for (const neighbour of neighbours) {
      if (!visited.has(neighbour)) {
        queue.pushBack({ position: neighbour, distance: current.distance + 1 });
      }
    }
  }
  return visited.has([endRow, endColumn])
    ? visited.get([endRow, endColumn])!
    : -1;
};

const sp = shortestPath([0, 0], [endRow, endColumn], 1024);
//const sp = shortestPath([0, 0], [endRow, endColumn], 12);
console.log(sp);

let cTime = -1;
for (let t = 1500; t < corrupted.length; t++) {
  const sp = shortestPath([0, 0], [endRow, endColumn], t);
  if (sp < 0) {
    cTime = t;
    break;
  }
	console.log(t, sp);
}
console.log(cTime);
if (cTime >= 0) {
  console.log(corrupted[cTime-1].flat().join(","));
}
