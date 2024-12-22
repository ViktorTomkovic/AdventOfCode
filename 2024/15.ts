//import * as _pq  from 'npm:@datastructures-js/priority-queue@5.4.0';
import { Deque } from "npm:@datastructures-js/deque@1.0.4";
import { PositionMap } from "./generalMap.ts";
import * as dpng from "@ilawy/dpng";
import * as pngs from "https://deno.land/x/pngs@0.1.1/mod.ts";
const inputName = Deno.args[0] ?? "15.in";
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
index++;
const moves = lines.splice(index).join("");
//console.log(charInput);
//console.log(moves);

let wideRobotPosition: [number, number] = [0, 0];
const wideInput = Array.from(
  { length: charInput.length },
  () => new Array(charInput[0].length * 2).fill(""),
);
for (const [rowIndex, row] of charInput.entries()) {
  for (const [columnIndex, column] of row.entries()) {
    if (column == "@") {
      wideRobotPosition = [rowIndex, columnIndex * 2];
      wideInput[rowIndex][columnIndex * 2] = "@";
      wideInput[rowIndex][columnIndex * 2 + 1] = ".";
    } else if (column == ".") {
      wideInput[rowIndex][columnIndex * 2] = ".";
      wideInput[rowIndex][columnIndex * 2 + 1] = ".";
    } else if (column == "#") {
      wideInput[rowIndex][columnIndex * 2] = "#";
      wideInput[rowIndex][columnIndex * 2 + 1] = "#";
    } else if (column == "O") {
      wideInput[rowIndex][columnIndex * 2] = "[";
      wideInput[rowIndex][columnIndex * 2 + 1] = "]";
    }
  }
}
const wideRows = wideInput.length;
const wideColumns = wideInput[0].length;
const rows = charInput.length;
const columns = charInput[0].length;
const directions: Array<[number, number]> = [[0, 1], [1, 0], [0, -1], [-1, 0]];
const applyDelta = (
  [r1, c1]: [number, number],
  [r2, c2]: [number, number],
): [number, number] => [r1 + r2, c1 + c2];
const isInbounds = ([row, column]: [number, number]): boolean => {
  return !(row < 0 || row >= rows || column < 0 || column >= columns);
};
const moveToDirection: Record<string, [number, number]> = {
  "v": [1, 0],
  ">": [0, 1],
  "<": [0, -1],
  "^": [-1, 0],
};
let robotPosition: [number, number] = [-1, -1];
for (const [rowIndex, row] of charInput.entries()) {
  for (const [columnIndex, column] of row.entries()) {
    if (column == "@") {
      robotPosition = [rowIndex, columnIndex];
    }
  }
}
for (const move of moves.split("")) {
  //console.log(move);
  const direction = moveToDirection[move];
  //console.log(direction);
  const [fRow, fColumn] = applyDelta(robotPosition, direction);
  let [nRow, nColumn] = applyDelta(robotPosition, direction);
  while (charInput[nRow][nColumn] == "O") {
    //console.log(nRow, nColumn);
    [nRow, nColumn] = applyDelta([nRow, nColumn], direction);
  }
  if (charInput[nRow][nColumn] == ".") {
    charInput[nRow][nColumn] = charInput[fRow][fColumn];
    charInput[fRow][fColumn] = "@";
    charInput[robotPosition[0]][robotPosition[1]] = ".";
    robotPosition = [fRow, fColumn];
  }
  //if (charInput[nRow][nColumn] == "#") {
  //}
}
let gpsSum = 0;
for (const [rowIndex, row] of charInput.entries()) {
  //console.log(row.join(""));
  for (const [columnIndex, column] of row.entries()) {
    if (column == "O") {
      gpsSum += 100 * rowIndex + columnIndex;
    }
  }
}
console.log(gpsSum);

const hash = 1000;
const toHash = ([row, column]: [number, number]): number => row * hash + column;
for (const move of moves.split("")) {
  if (move == "<") {
    const [cRow, cColumn] = wideRobotPosition;
    let [nRow, nColumn] = applyDelta(wideRobotPosition, [0, -1]);
    while (wideInput[nRow][nColumn] == "[" || wideInput[nRow][nColumn] == "]") {
      //console.log(nRow, nColumn);
      [nRow, nColumn] = applyDelta([nRow, nColumn], [0, -1]);
    }
    if (wideInput[nRow][nColumn] == ".") {
      for (let c = nColumn; c < cColumn; c++) {
        wideInput[nRow][c] = wideInput[nRow][c + 1];
      }
      wideInput[cRow][cColumn] = ".";
      wideRobotPosition = [cRow, cColumn - 1];
    }
  } else if (move == ">") {
    const [cRow, cColumn] = wideRobotPosition;
    let [nRow, nColumn] = applyDelta(wideRobotPosition, [0, 1]);
    while (wideInput[nRow][nColumn] == "[" || wideInput[nRow][nColumn] == "]") {
      //console.log(nRow, nColumn);
      [nRow, nColumn] = applyDelta([nRow, nColumn], [0, 1]);
    }
    if (wideInput[nRow][nColumn] == ".") {
      for (let c = nColumn; c > cColumn; c--) {
        wideInput[nRow][c] = wideInput[nRow][c - 1];
      }
      wideInput[cRow][cColumn] = ".";
      wideRobotPosition = [cRow, cColumn + 1];
    }
  } else if (move == "v") {
    const component = new Deque<[number, number]>();
    const visited = new Set<number>();
    const unprocessed = new Deque<[number, number]>();
    unprocessed.pushFront(wideRobotPosition);
    let isBlockedByWall = false;
    while (!unprocessed.isEmpty()) {
      const processing = unprocessed.popFront();
      if (visited.has(toHash(processing))) continue;
      visited.add(toHash(processing));
      component.pushBack(processing);
      const [dRow, dColumn] = applyDelta(processing, [1, 0]);
      if (wideInput[dRow][dColumn] == "#") {
        isBlockedByWall = true;
        break;
      }
      if (wideInput[dRow][dColumn] == "]") {
        unprocessed.pushBack(applyDelta(processing, [1, -1]));
        unprocessed.pushBack([dRow, dColumn]);
      }
      if (wideInput[dRow][dColumn] == "[") {
        unprocessed.pushBack(applyDelta(processing, [1, +1]));
        unprocessed.pushBack([dRow, dColumn]);
      }
    }
    if (!isBlockedByWall) {
      while (!component.isEmpty()) {
        const [pRow, pColumn] = component.popBack();
        wideInput[pRow + 1][pColumn] = wideInput[pRow][pColumn];
        wideInput[pRow][pColumn] = ".";
      }
      wideRobotPosition = applyDelta(wideRobotPosition, [1, 0]);
    }
  } else if (move == "^") {
    const component = new Deque<[number, number]>();
    const visited = new Set<number>();
    const unprocessed = new Deque<[number, number]>();
    unprocessed.pushFront(wideRobotPosition);
    let isBlockedByWall = false;
    while (!unprocessed.isEmpty()) {
      const processing = unprocessed.popFront();
      if (visited.has(toHash(processing))) continue;
      visited.add(toHash(processing));
      component.pushBack(processing);
      const [dRow, dColumn] = applyDelta(processing, [-1, 0]);
      if (wideInput[dRow][dColumn] == "#") {
        isBlockedByWall = true;
        break;
      }
      if (wideInput[dRow][dColumn] == "]") {
        unprocessed.pushBack(applyDelta(processing, [-1, -1]));
        unprocessed.pushBack([dRow, dColumn]);
      }
      if (wideInput[dRow][dColumn] == "[") {
        unprocessed.pushBack(applyDelta(processing, [-1, +1]));
        unprocessed.pushBack([dRow, dColumn]);
      }
    }
    if (!isBlockedByWall) {
      while (!component.isEmpty()) {
        const [pRow, pColumn] = component.popBack();
        wideInput[pRow - 1][pColumn] = wideInput[pRow][pColumn];
        wideInput[pRow][pColumn] = ".";
      }
      wideRobotPosition = applyDelta(wideRobotPosition, [-1, 0]);
    }
  } else {
    console.log("Unrecognized move:", move);
  }
}

let wideGpsSum = 0;
for (const [rowIndex, row] of wideInput.entries()) {
  //console.log(row.join(""));
  for (const [columnIndex, column] of row.entries()) {
    if (column == "[") {
      //const columnDistance = Math.min(
      //  columnIndex,
      //  (wideColumns - 1) - (columnIndex + 1),
      //);
      const columnDistance = columnIndex;
      //const rowDistance = Math.min(rowIndex, (wideRows - 1) - rowIndex);
      const rowDistance = rowIndex;
      const gps = 100 * rowDistance + columnDistance;
      wideGpsSum += gps;
    }
  }
}
console.log(wideGpsSum);

