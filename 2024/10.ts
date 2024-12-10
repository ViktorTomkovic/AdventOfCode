//import * as _pq  from 'npm:@datastructures-js/priority-queue@5.4.0';
import { Deque } from "npm:@datastructures-js/deque@1.0.4";
const inputName = Deno.args[0] ?? "10.in";
const text = Deno.readTextFileSync(inputName);
const lines = text.split(/\r?\n/);
let index = 0;
let line = lines[index];
const topo = new Array<Array<number>>();
while (line != "") {
  topo.push(line.split("").map((v) => Number(v)));
  index++;
  line = lines[index];
}

const hash = 100;
const toHash = ([row, column]: [number, number]): number => row * hash + column;

const directions: Array<[number, number]> = [[0, 1], [1, 0], [0, -1], [-1, 0]];
const applyDelta = (
  [r1, c1]: [number, number],
  [r2, c2]: [number, number],
): [number, number] => [r1 + r2, c1 + c2];
const rows = topo.length;
const columns = topo[0].length;
const isInbounds = ([row, column]: [number, number]): boolean => {
  return !(row < 0 || row >= rows || column < 0 || column >= columns);
};
const findTops = (startingRow: number, startingColumn: number): [number, number] => {
	let ranking = 0;
  const visitedSteps = new Set<number>();
  const visitedEnds = new Set<number>();
  const unprocessed = new Deque<[number, number, number]>();
  unprocessed.pushFront([
    startingRow,
    startingColumn,
    topo[startingRow][startingColumn],
  ]);
  while (unprocessed.size() > 0) {
    const [row, column, height] = unprocessed.popFront();
    //if (visitedSteps.has(toHash([row, column]))) continue;
    //visitedSteps.add(toHash([row, column]));
      //console.log(row, column, topo[row][column]);
    if (topo[row][column] == 9) {
      const hashed = toHash([row, column]);
      visitedEnds.add(hashed);
			ranking++;
      //console.log(row, column, "*");
    }
    for (const [dRow, dColumn] of directions) {
      const [nRow, nColumn] = applyDelta([row, column], [dRow, dColumn]);
      //console.log(nRow, nColumn);
      if (
        isInbounds([nRow, nColumn]) &&
        !visitedSteps.has(toHash([nRow, nColumn])) &&
        topo[nRow][nColumn] == topo[row][column] + 1
      ) {
        unprocessed.pushBack([nRow, nColumn, topo[nRow][nColumn]]);
      }
    }
  }
  return [visitedEnds.size, ranking];
};
let counter = 0;
let rankingCounter = 0;
for (const [rowIndex, row] of topo.entries()) {
  for (const [columnIndex, column] of row.entries()) {
    if (column == 0) {
      const [score, ranking] = findTops(rowIndex, columnIndex);
      [counter, rankingCounter] = [counter + score, rankingCounter + ranking];
      console.log(rowIndex, columnIndex, score);
    }
  }
}

console.log(counter, rankingCounter);

//const copyArray = Array.from(
//  { length: topo.length },
//  () => new Array(topo[0].length).fill(false),
//);

//console.log(topo.flat().join(""));
