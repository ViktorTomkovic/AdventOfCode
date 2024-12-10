//import { PNGImage } from "https://deno.land/x/dpng@0.7.5";
import * as dpng from "@ilawy/dpng";
const text = Deno.readTextFileSync("input.txt");
const lines = text.split("\r\n");
class Guard {
  constructor(
    public position: [number, number],
    public direction: number,
  ) {}
  makeClone = () =>
    new Guard([this.position[0], this.position[1]], this.direction);
}
const directionDelta: Array<[number, number]> = [
  [-1, 0],
  [0, 1],
  [1, 0],
  [0, -1],
];
const numberOfDirections = directionDelta.length;
const enum Space {
  GuardUp,
  GuardRight,
  GuardDown,
  GuardLeft,
  Empty,
  Visited,
  Wall,
}
const directionToSpace: Record<number, Space> = {
  0: Space.GuardUp,
  1: Space.GuardRight,
  2: Space.GuardDown,
  3: Space.GuardLeft,
};
const toSpace: Record<string, Space> = {
  "#": Space.Wall,
  ".": Space.Empty,
  "X": Space.Visited,
  "^": Space.GuardUp,
  ">": Space.GuardRight,
  "v": Space.GuardDown,
  "<": Space.GuardLeft,
};
const toChar: Record<Space, string> = {
  [Space.Wall]: "#",
  [Space.Empty]: ".",
  [Space.Visited]: "X",
  [Space.GuardUp]: "^",
  [Space.GuardRight]: ">",
  [Space.GuardDown]: "v",
  [Space.GuardLeft]: "<",
};
const toColor: Record<Space, number> = {
  [Space.Wall]: 0x000000,
  [Space.Empty]: 0xbababa,
  [Space.Visited]: 0x964b00,
  [Space.GuardUp]: 0xa0a0a0,
  [Space.GuardRight]: 0xa0a0a0,
  [Space.GuardDown]: 0xa0a0a0,
  [Space.GuardLeft]: 0xa0a0a0,
};
const toRGB: Record<Space, dpng.RGB> = {
  [Space.Wall]: { r: 0x00, g: 0x00, b: 0x00, a: 1 },
  [Space.Empty]: { r: 0xba, g: 0xba, b: 0xba, a: 1 },
  [Space.Visited]: { r: 0x96, g: 0x4b, b: 0x00, a: 1 },
  [Space.GuardUp]: { r: 0xf0, g: 0x70, b: 0x60, a: 1 },
  [Space.GuardRight]: { r: 0xf0, g: 0x70, b: 0x60, a: 1 },
  [Space.GuardDown]: { r: 0xf0, g: 0x70, b: 0x60, a: 1 },
  [Space.GuardLeft]: { r: 0xf0, g: 0x70, b: 0x60, a: 1 },
};
const maze = new Array<Array<Space>>();
let rowIndex = 0;
let line = lines[rowIndex];
let startingGuardPosition: [number, number] = [-1, -1];
while (line != "") {
  const row = new Array<Space>();
  for (const [columnIndex, char] of line.split("").entries()) {
    if (char == "^") {
      startingGuardPosition = [rowIndex, columnIndex];
    }
    row.push(toSpace[char]);
  }
  maze.push(row);
  rowIndex++;
  line = lines[rowIndex];
}
//maze.forEach((row) => console.log(row.join("")));

const initialDirection = 0;
const guard = new Guard(startingGuardPosition, initialDirection);
maze[startingGuardPosition[0]][startingGuardPosition[1]] = Space.Visited;
const rows = maze.length;
const columns = maze[0].length;
//console.log(rows, columns);
let step = 0;
const producePng = () => {
  const filename = "./output1/" + step + ".png";
  const factor = 4;
  const png = new dpng.PNGImage(columns * factor, rows * factor);
  for (const [rowIndex, row] of maze.entries()) {
    for (const [columnIndex, space] of row.entries()) {
      const converted = toRGB[space];
      //console.log(space, converted, rowIndex, columnIndex);
      const pixelColor = png.createRGBColor(converted);
      //png.setPixel(rowIndex, columnIndex, pixelColor);
      png.drawRect(
        columnIndex * factor,
        rowIndex * factor,
        columnIndex * factor + factor,
        rowIndex * factor + factor,
        pixelColor,
      );
    }
  }
  const [gRow, gColumn] = [guard.position[0], guard.position[1]];
  const guardColor = png.createRGBColor(
    toRGB[directionToSpace[guard.direction]],
  );
  png.drawRect(
    gColumn * factor,
    gRow * factor,
    gColumn * factor + factor,
    gRow * factor + factor,
    guardColor,
  );
  Deno.writeFileSync(filename, png.getBuffer());
  //console.log(filename, "written");
};
const applyDelta = (
  [pRow, pColumn]: [number, number],
  [dRow, dColumn]: [number, number],
) => {
  return [pRow + dRow, pColumn + dColumn];
};
const isInbounds = ([row, column]: [number, number]) => {
  return !(row < 0 || row >= rows || column < 0 || column >= columns);
};

const makeMazeCopy = (
  maze: Array<Array<Space>>,
  [nRow, nColumn]: [number, number],
): Array<Array<Space>> => {
  const result = Array.from(
    { length: maze.length },
    () => new Array<Space>(maze[0].length),
  );
  for (const [rowIndex, row] of maze.entries()) {
    for (const [columnIndex, column] of row.entries()) {
      result[rowIndex][columnIndex] = column;
      if (rowIndex == nRow && columnIndex == nColumn) {
        result[rowIndex][columnIndex] = Space.Wall;
      }
    }
  }
  return result;
};
let obstructionCount = 0;
const walkThroughMaze = (
  maze: Array<Array<Space>>,
  guard: Guard,
  timeoutSteps: number,
  shadowSteps: boolean,
): number => {
  //console.log(guard);
  let step = 0;
  while (step < timeoutSteps && isInbounds(guard.position)) {
    step++;
    //producePng();

    const nextDirection = (guard.direction + 1) % numberOfDirections;
    const [nRow, nColumn] = applyDelta(
      guard.position,
      directionDelta[guard.direction],
    );

    if (!isInbounds([nRow, nColumn])) break;
    if (maze[nRow][nColumn] == Space.Wall) {
      guard.direction = nextDirection;
    } else {
      if (maze[nRow][nColumn] == Space.Empty && !shadowSteps) {
        const newSteps = walkThroughMaze(
          makeMazeCopy(maze, [nRow, nColumn]),
          guard.makeClone(),
          timeoutSteps,
          true,
        );
        if (newSteps >= timeoutSteps) {
          obstructionCount++;
          //console.log(guard, newSteps);
        }
      }
      if (!shadowSteps) {
        maze[nRow][nColumn] = Space.Visited;
      }
      guard.position = [nRow, nColumn];
    }
  }
  return step;
};
console.log(walkThroughMaze(maze, guard, 25000, false));
let visitedCount = 0;
for (const [rowIndex, row] of maze.entries()) {
  for (const [columnIndex, column] of row.entries()) {
    if (maze[rowIndex][columnIndex] == Space.Visited) {
      visitedCount++;
    }
  }
}

console.log(visitedCount);
console.log(obstructionCount);
