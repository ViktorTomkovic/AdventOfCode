import {
  MinPriorityQueue,
  PriorityQueue,
} from "npm:@datastructures-js/priority-queue@5.4.0";
import { GeneralMap, PositionMap } from "./generalMap.ts";
import { Deque } from "@datastructures-js/deque";
//import { Deque } from 'npm:@datastructures-js/deque@1.0.4';
const inputName = Deno.args[0] ?? "10.in";
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
  Reindeer,
  End,
}
interface Reindeer {
  position: [number, number];
  direction: [number, number];
}
const hash = 1000;
const toHash = ([row, column]: [number, number]): number => row * hash + column;
const reindeerHash = (element: Reindeer): number => {
  return (1000 ** 3) * element.position[0] +
    (1000 ** 2) * element.position[1] +
    (1000 ** 1) * (element.direction[0] + 1) +
    (1000 ** 0) * (element.direction[1] + 1);
};
const isSameTuple = (a: [number, number], b: [number, number]) =>
  toHash(a) == toHash(b);
const areOppositeDirections = (a: [number, number], b: [number, number]) =>
  toHash([-a[0], -a[1]]) == toHash(b);
const maze = new PositionMap<Space>(hash);
let reindeerPosition: [number, number] = [0, 0];
let reindeerDirection: [number, number] = [0, 1];
let endLocation: [number, number] = [0, 0];
//Array.from ({length: charInput.length}, () => new Array(charInput[0].length).fill(Space.Empty));
for (const [rowIndex, row] of charInput.entries()) {
  for (const [columnIndex, column] of row.entries()) {
    if (column == ".") {
      maze.set([rowIndex, columnIndex], Space.Empty);
    } else if (column == "#") {
      maze.set([rowIndex, columnIndex], Space.Wall);
    } else if (column == "S") {
      maze.set([rowIndex, columnIndex], Space.Reindeer);
      reindeerPosition = [rowIndex, columnIndex];
    } else if (column == "E") {
      maze.set([rowIndex, columnIndex], Space.End);
      endLocation = [rowIndex, columnIndex];
    }
  }
}
let reindeer: Reindeer = {
  position: reindeerPosition,
  direction: reindeerDirection,
};
let reindeerStart: Reindeer = {
  position: reindeerPosition,
  direction: reindeerDirection,
};
let reindeerSuperStart: Reindeer = {
  position: [998, 998],
  direction: [0, 0],
};
let reindeerSuperEnd: Reindeer = {
  position: [999, 999],
  direction: [0, 0],
};

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
const getOppositeDirection = (
  direction: [number, number],
): [number, number] => {
  if (isSameTuple(direction, [0, 1])) {
    return [0, -1];
  } else if (isSameTuple(direction, [0, -1])) {
    return [0, 1];
  } else if (isSameTuple(direction, [1, 0])) {
    return [-1, 0];
  } else if (isSameTuple(direction, [-1, 0])) {
    return [1, 0];
  }
	return [0,0];
};
const applyDelta = (
  [r1, c1]: [number, number],
  [r2, c2]: [number, number],
): [number, number] => [r1 + r2, c1 + c2];

const subtractDelta = (
  [r1, c1]: [number, number],
  [r2, c2]: [number, number],
): [number, number] => [r1 - r2, c1 - c2];

class ReindeerSpaceMap<TValue> extends GeneralMap<Reindeer, TValue, number> {
  override keyToHash = reindeerHash;
}

// vertex -> [neighbour -> cost]
const generateEligibleNeighbours = (
  space: Reindeer,
  maze: PositionMap<Space>,
  forward: boolean,
): ReindeerSpaceMap<number> => {
  const neighbours = new ReindeerSpaceMap<number>();
  for (const direction of directions) {
    let newReindeer: Reindeer | undefined = undefined;
    let cost: number | undefined = undefined;
    if (isSameTuple(direction, space.direction)) {
      const newLocation = applyDelta(space.position, direction);
      newReindeer = { position: newLocation, direction: direction };
      cost = 1;
      //cost = forward ? 1 : 2000;
    } else if (areOppositeDirections(direction, space.direction)) {
      newReindeer = {
        position: space.position,
        direction: direction,
      };
      cost = 1;
      //cost = forward ? 2000 : 1;
    } else {
      newReindeer = {
        position: space.position,
        direction: direction,
      };
      cost = 1000;
      //cost = forward ? 1000 : 1000;
    }
    if (
      isInbounds(newReindeer.position) &&
      maze.get(newReindeer.position) != Space.Wall
    ) {
      neighbours.set(newReindeer, cost);
    }
  }
  if (forward) {
    if (isSameTuple(space.position, endLocation)) {
      //console.log("E", space);
      neighbours.set(reindeerSuperEnd, 0);
    }
  } else {
    if (reindeerHash(reindeerSuperEnd) == reindeerHash(space)) {
      for (const direction of directions) {
        neighbours.set({ position: endLocation, direction: direction }, 0);
      }
    }
  }
  return neighbours;
};

const getAllDistancesFrom = (
  startingSpace: Reindeer,
  forward: boolean,
): [ReindeerSpaceMap<number>, ReindeerSpaceMap<Array<Reindeer>>] => {
  // distance from start
  const minDistances = new ReindeerSpaceMap<number>();
  const parents = new ReindeerSpaceMap<Array<Reindeer>>();
  const potentialParents = new ReindeerSpaceMap<MinPriorityQueue<Reindeer>>();
  const q = new MinPriorityQueue<Reindeer>();
  q.enqueue(startingSpace, 0);
  while (!q.isEmpty()) {
    const qEntry = q.dequeue();
    const space = qEntry.element;
    const cost = qEntry.priority;
    //if (isSameTuple(space.position, [13, 13])) {
    //  console.log("$", space, cost);
    //}
    if (minDistances.has(space)) {
      continue;
    }
    minDistances.set(space, cost);
    const minCostPq = potentialParents.get(space)!;
    //if (isSameTuple(space.position, [13, 13])) {
    //  console.log("]", potentialParents.get(space));
    //}
    if (minCostPq != undefined) {
      const minCost = minCostPq.front().priority;
      const spaceParents = new Array<Reindeer>();
      while (!minCostPq.isEmpty() && minCostPq.front().priority == minCost) {
        spaceParents.push(minCostPq.dequeue().element);
      }
      parents.set(space, spaceParents);
    }
    //if (isSameTuple(space.position, [13, 13])) {
    //  console.log("#", parents.get(space));
    //}

    const neighbours = generateEligibleNeighbours(space, maze, forward);
    for (const neighbour of neighbours.keys()) {
      const newCost = neighbours.get(neighbour)!;
      //console.log(neighbour, newCost);
      //if (isSameTuple(neighbour.position, [13, 13])) {
      //  console.log("v", space);
      //  console.log("*", neighbour, minDistances.get(neighbour), cost, newCost);
      //}
      if (!minDistances.has(neighbour)) {
        //if (isSameTuple(neighbour.position, [13, 13])) {
        //  console.log("@", space);
        //  console.log(
        //    "@",
        //    neighbour,
        //    minDistances.get(neighbour),
        //    cost,
        //    newCost,
        //  );
        //}
        q.enqueue(neighbour, cost + newCost);
        potentialParents.putOrUpdate(
          neighbour,
          () => {
            const pq = new MinPriorityQueue<Reindeer>();
            pq.enqueue(space, cost + newCost);
            return pq;
          },
          (existingValue) => {
            existingValue.enqueue(space, cost + newCost);
            return existingValue;
          },
        );
        //if (isSameTuple(neighbour.position, [13, 13])) {
        //  console.log("[", potentialParents.get(neighbour));
        //}
      } else if (minDistances.get(neighbour)! == (cost + newCost)) {
        //if (isSameTuple(neighbour.position, [13, 13])) {
        //  console.log("!", space);
        //  console.log(
        //    "!",
        //    neighbour,
        //    minDistances.get(neighbour),
        //    cost,
        //    newCost,
        //  );
        //}
        parents.putOrUpdate(
          neighbour,
          () => new Array<Reindeer>(1).fill(space),
          (existingValue) => {
            existingValue.push(space);
            return existingValue;
          },
        );
      }
      //if (
      //  reindeerHash({ position: [13, 13], direction: [-1, 0] }) ==
      //    reindeerHash(neighbour)
      //) {
      //  console.log(">", neighbour, parents.get(neighbour));
      //}
    }
  }
  return [minDistances, parents];
};

const fromStart = getAllDistancesFrom(reindeerStart, true);
const minDistances = fromStart[0];
const parents = fromStart[1];
//const endDistance = Math.min(
//  ...directions.map((d) =>
//    minDistances.get({ position: endLocation, direction: d })!
//  ),
//);
const endDistance = minDistances.get(reindeerSuperEnd);
console.log(endDistance);
const fromEnd = getAllDistancesFrom(reindeerSuperEnd, false);
const minDistancesEnd = fromEnd[0];
const benches = new PositionMap<boolean>(hash);
for (const [rowIndex, row] of charInput.entries()) {
  for (const [columnIndex, column] of row.entries()) {
    for (const direction of directions) {
      const space: Reindeer = {
        position: [rowIndex, columnIndex],
        direction: direction,
      };
      const spaceEnd: Reindeer = {
        position: [rowIndex, columnIndex],
        direction: getOppositeDirection(direction),
      };
      if (
        minDistances.has(space) && minDistancesEnd.has(spaceEnd)
      ) {
        //console.log(space, minDistances.get(space), minDistancesEnd.get(spaceEnd));
      }
      if (
        (minDistances.get(space)! + minDistancesEnd.get(spaceEnd)!) == endDistance
      ) {
        benches.set(space.position, true);
      }
    }
  }
}
console.log(benches.size());

//console.log(parents);
//console.log(parents.get(reindeerSuperEnd));
//console.log(parents.get(reindeerStart));
//const visitedParents = new ReindeerSpaceMap<boolean>();
//const q = new Deque<Reindeer>();
//q.pushFront(reindeerSuperEnd);
//let steps = 0;
//while (!q.isEmpty() && steps < 10) {
//  const e = q.popFront();
//  //if (isSameTuple(e.position, [13, 13])) {
//  //  console.log("*", e);
//  //  console.log(parents.get(e));
//  //}
//  if (
//    !parents.has(e) || visitedParents.has(e) ||
//    reindeerHash(e) == reindeerHash(reindeerStart)
//  ) continue;
//  visitedParents.set(e, true);
//  for (const parent of parents.get(e)!) {
//    q.pushBack(parent);
//  }
//}
////console.log(
////  visitedParents.keyList().map((reindeer) => toHash(reindeer.position)),
////);
//console.log(visitedParents.keyList().length);
//const hashes = new Set<number>();
//visitedParents.keyList().forEach((v) => hashes.add(toHash(v.position)));
//console.log(hashes.size - 1);
//const unprocessed = new MinPriorityQueue<Reindeer>();
//unprocessed.enqueue(reindeer, 0);
//// path length
//const visited = new ReindeerSpaceMap<number>();
//const parents = new ReindeerSpaceMap<Array<Reindeer>>();
//let endDistance = -1;
//let pathFound = false;
//while (!unprocessed.isEmpty()) {
//  //console.log(unprocessed.size());
//  const processing = unprocessed.dequeue();
//  const currentReindeer = processing.element;
//  const location = currentReindeer.position;
//  const distance = processing.priority;
//  //if (distance < 5000) {
//  //  console.log(
//  //    currentReindeer,
//  //    distance,
//  //    visited.get(currentReindeer),
//  //    parents.get(currentReindeer),
//  //  );
//  //}
//  if (visited.has(currentReindeer)) {
//    continue;
//  }
//  //console.log(distance);
//  if (isSameTuple(location, reindeerSuperEnd.position)) {
//    if (!pathFound) {
//      endDistance = distance;
//    }
//    pathFound = true;
//    // break;
//  }
//  visited.set(currentReindeer, distance);
//
//  if (isSameTuple(currentReindeer.position, endLocation)) {
//    const newReindeer = reindeerSuperEnd;
//    const cost = distance;
//    if (!visited.has(newReindeer)) {
//      unprocessed.enqueue(newReindeer, cost);
//      parents.putOrUpdate(
//        newReindeer,
//        () => new Array<Reindeer>(1).fill(currentReindeer),
//        (existingValue) => {
//          existingValue.push(currentReindeer);
//          return existingValue;
//        },
//      );
//    } else if (visited.get(newReindeer) == distance) {
//      if (3000 < distance && distance < 4000) {
//        console.log(distance, currentReindeer, newReindeer);
//        console.log(parents.get(newReindeer));
//      }
//      parents.putOrUpdate(
//        newReindeer,
//        () => new Array<Reindeer>(1).fill(currentReindeer),
//        (existingValue) => {
//          existingValue.push(currentReindeer);
//          return existingValue;
//        },
//      );
//    }
//  }
//  for (const direction of directions) {
//    let newReindeer = undefined;
//    let cost = undefined;
//    if (isSameTuple(direction, currentReindeer.direction)) {
//      const newLocation = applyDelta(location, direction);
//      newReindeer = { position: newLocation, direction: direction };
//      cost = distance + 1;
//    } else if (areOppositeDirections(direction, currentReindeer.direction)) {
//      newReindeer = {
//        position: currentReindeer.position,
//        direction: direction,
//      };
//      cost = distance + 10000000;
//    } else {
//      newReindeer = {
//        position: currentReindeer.position,
//        direction: direction,
//      };
//      cost = distance + 1000;
//    }
//    //console.log(newReindeer, cost, isInbounds(newReindeer.position));
//    if (
//      isInbounds(newReindeer.position) &&
//      maze.get(newReindeer.position) != Space.Wall
//    ) {
//      if (!visited.has(newReindeer)) {
//        unprocessed.enqueue(newReindeer, cost);
//        parents.putOrUpdate(
//          newReindeer,
//          () => new Array<Reindeer>(1).fill(currentReindeer),
//          (existingValue) => {
//            existingValue.push(currentReindeer);
//            return existingValue;
//          },
//        );
//      } else if (visited.get(newReindeer) == cost) {
//        if (3000 < distance && distance < 4000) {
//          console.log(distance, currentReindeer, newReindeer);
//          console.log(parents.get(newReindeer));
//        }
//        parents.putOrUpdate(
//          newReindeer,
//          () => new Array<Reindeer>(1).fill(currentReindeer),
//          (existingValue) => {
//            existingValue.push(currentReindeer);
//            return existingValue;
//          },
//        );
//      }
//    }
//  }
//}
//console.log(endDistance);
//
//let iteration = 0;
//const v = new ReindeerSpaceMap<boolean>();
//const rQueue = new Deque<Reindeer>();
//rQueue.pushFront(reindeerSuperEnd);
//const benchBlocks = new PositionMap<boolean>(hash);
//while (!rQueue.isEmpty()) {
//  const p = rQueue.popFront();
//  //if (v.has(p)) continue;
//  benchBlocks.set(p.position, true);
//  v.set(p, true);
//  // console.log("*", p, visited.get(p));
//  //console.log(parents.get(p));
//  const pp = parents.get(p);
//  if (pp != undefined) {
//    for (const e of pp!) {
//      rQueue.pushBack(e);
//    }
//  }
//  //if (iteration % 1000000 == 0) {
//  //	console.log(iteration, p.position);
//  //}
//  iteration++;
//}
//console.log(benchBlocks.keyList());
//console.log(benchBlocks.keyList().length - 1);
