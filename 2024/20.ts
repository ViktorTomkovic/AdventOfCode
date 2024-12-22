//import * as _pq  from 'npm:@datastructures-js/priority-queue@5.4.0';
import { Deque } from "npm:@datastructures-js/deque@1.0.4";
import { GeneralMap, PositionMap } from "./generalMap.ts";
const inputName = Deno.args[0] ?? "20.in";
const text = Deno.readTextFileSync(inputName);
const lines = text.split(/\r?\n/);
let index = 0;
let line = lines[index];
const charInput = new Array<Array<string>>();
while (line != "") {
  charInput.push(line.split(""));
  index++;
  line = lines[index];
}

const enum Space {
  Empty,
  Wall,
  Start,
  End,
}
type Vertex = [number, number];
type QueueItem = { vertex: Vertex; distance: number };
const hash = 1000;
const toHash = ([row, column]: Vertex): number => row * hash + column;
const maze = new PositionMap<Space>(hash);
const distance = new PositionMap<Space>(hash);
let startPosition: Vertex = [0, 0];
let endPosition: Vertex = [0, 0];
for (const [rowIndex, row] of charInput.entries()) {
  for (const [columnIndex, column] of row.entries()) {
    if (column == ".") {
      maze.set([rowIndex, columnIndex], Space.Empty);
    } else if (column == "#") {
      maze.set([rowIndex, columnIndex], Space.Wall);
    } else if (column == "S") {
      maze.set([rowIndex, columnIndex], Space.Start);
      startPosition = [rowIndex, columnIndex];
    } else if (column == "E") {
      maze.set([rowIndex, columnIndex], Space.End);
      endPosition = [rowIndex, columnIndex];
    }
  }
}

const copyArray = Array.from(
  { length: charInput.length },
  () => new Array(charInput[0].length).fill(false),
);
const rows = charInput.length;
const columns = charInput.length;
const isInbounds = ([row, column]: [number, number]): boolean => {
  return !(row < 0 || row >= rows || column < 0 || column >= columns);
};
const directions: Array<[number, number]> = [[0, 1], [1, 0], [0, -1], [-1, 0]];
const applyDelta = (
  [r1, c1]: [number, number],
  [r2, c2]: [number, number],
): [number, number] => [r1 + r2, c1 + c2];

const queue = new Deque<QueueItem>();
queue.pushFront({ vertex: startPosition, distance: 0 });
while (!queue.isEmpty()) {
  const current = queue.popFront();
  if (distance.has(current.vertex)) {
    continue;
  }
  distance.set(current.vertex, current.distance);
  for (const direction of directions) {
    const newVertex = applyDelta(current.vertex, direction);
    if (
      isInbounds(newVertex) && maze.get(newVertex) != Space.Wall &&
      !distance.has(newVertex)
    ) {
      queue.pushBack({ vertex: newVertex, distance: current.distance + 1 });
    }
  }
}

function isTheSameVertex(vertex1: Vertex, vertex2: Vertex) {
  return toHash(vertex1) == toHash(vertex2);
}

const enum CheatFound {
  YES,
  NO,
}
type CheatResult = {
  found: CheatFound.YES;
  distance: number;
} | {
  found: CheatFound.NO;
};
const cheatDistance = (
  start: Vertex,
  end: Vertex,
  maxDistance: number,
): CheatResult => {
  const distance = new PositionMap<number>(hash);
  const queue = new Deque<QueueItem>();
  queue.pushFront({ vertex: start, distance: 0 });
  while (!queue.isEmpty()) {
    const current = queue.popFront();
    if (distance.has(current.vertex)) continue;
    distance.set(current.vertex, current.distance);
    for (const direction of directions) {
      const newVertex = applyDelta(current.vertex, direction);
      if (
        isInbounds(newVertex) &&
        !distance.has(newVertex) && ((current.distance + 1) <= maxDistance)
      ) {
        if (maze.get(newVertex) == Space.Wall) {
          queue.pushBack({ vertex: newVertex, distance: current.distance + 1 });
        } else if (isTheSameVertex(newVertex, end)) {
          return { found: CheatFound.YES, distance: current.distance + 1 };
        }
      }
    }
  }
  return { found: CheatFound.NO };
};

const findAllCheatsFromPositionWithDistance = (
  start: Vertex,
  maxDistance: number,
): Array<QueueItem> => {
  const result = new Array<QueueItem>(0);
  const distance = new PositionMap<number>(hash);
  const queue = new Deque<QueueItem>();
  queue.pushFront({ vertex: start, distance: 0 });
  while (!queue.isEmpty()) {
    const current = queue.popFront();
    if (distance.has(current.vertex)) continue;
    distance.set(current.vertex, current.distance);
    if (maze.get(current.vertex) != Space.Wall && current.distance > 1) {
      result.push(current);
      //continue;
    }
    for (const direction of directions) {
      const newVertex = applyDelta(current.vertex, direction);
      if (
        isInbounds(newVertex) &&
        !distance.has(newVertex) && ((current.distance + 1) <= maxDistance)
      ) {
        queue.pushBack({ vertex: newVertex, distance: current.distance + 1 });
      }
    }
  }
  return result;
};

type CheatInfo = {
  startPosition: Vertex;
  endPosition: Vertex;
  cheatDistance: number;
  distanceSaved: number;
};
const numberOfCheats = (
  maxCheatDistance: number,
): Array<CheatInfo> => {
  const start = Date.now();
  const result = new Array<CheatInfo>(0);
  for (let row = 0; row < rows; row++) {
    //console.log("r", row, rows);
    for (let column = 0; column < columns; column++) {
      //console.log("c", column, columns);
      //for (let i = -maxCheatDistance; i <= maxCheatDistance; i++) {
      //  for (let j = -maxCheatDistance; j <= maxCheatDistance; j++) {
      //    const startPosition: Vertex = [row, column];
      //    const endPosition: Vertex = [row + i, column + j];
      //    const manhattanDistance = Math.abs(i) + Math.abs(j);
      //    if (
      //      isInbounds(endPosition) && 1 < manhattanDistance &&
      //      manhattanDistance <= maxCheatDistance &&
      //      maze.get(startPosition) != Space.Wall &&
      //      maze.get(endPosition) != Space.Wall &&
      //      distance.get(endPosition)! > distance.get(startPosition)!
      //    ) {
      //      //console.log(startPosition, endPosition);
      //      const cheatSearchResult = cheatDistance(
      //        startPosition,
      //        endPosition,
      //        maxCheatDistance,
      //      );
      //      if (cheatSearchResult.found == CheatFound.YES) {
      //        const distanceSaved = distance.get(endPosition)! -
      //          distance.get(startPosition)! - cheatSearchResult.distance;
      //        result.push({
      //          startPosition: startPosition,
      //          endPosition: endPosition,
      //          cheatDistance: cheatSearchResult.distance,
      //          distanceSaved: distanceSaved,
      //        });
      //      }
      //    }
      //  }
      //}
      const startPosition: Vertex = [row, column];
      if (maze.get(startPosition) != Space.Wall) {
        const allCheatsFromPosition = findAllCheatsFromPositionWithDistance([
          row,
          column,
        ], maxCheatDistance);
        for (const cheat of allCheatsFromPosition) {
          const distanceSaved = distance.get(cheat.vertex)! -
            distance.get(startPosition)! - cheat.distance;
          result.push({
            startPosition: startPosition,
            endPosition: cheat.vertex,
            cheatDistance: cheat.distance,
            distanceSaved: distanceSaved,
          });
        }
      }
      //console.log((Date.now() - start) / 1000);
    }
  }
  console.log((Date.now() - start) / 1000);
  return result;
};

console.log("part1");
const part1Result = numberOfCheats(2);
console.log(part1Result.filter((v) => v.distanceSaved >= 0).length);
console.log(part1Result.filter((v) => v.distanceSaved >= 2).length);
console.log(part1Result.filter((v) => v.distanceSaved >= 100).length);
// 1323 is correct
console.log("part2");
const part2Result = numberOfCheats(20);
console.log(part2Result.filter((v) => v.distanceSaved >= 0).length);
console.log(part2Result.filter((v) => v.distanceSaved >= 2).length);
console.log(part2Result.filter((v) => v.distanceSaved >= 50).length);
console.log(part2Result.filter((v) => v.distanceSaved >= 100).length);
// 297076 is too low
// 341734 is too low
