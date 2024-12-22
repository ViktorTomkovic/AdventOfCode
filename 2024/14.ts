//import * as _pq  from 'npm:@datastructures-js/priority-queue@5.4.0';
import { Deque } from "npm:@datastructures-js/deque@1.0.4";
import { PositionMap } from "./generalMap.ts";
import * as dpng from "@ilawy/dpng";
import * as pngs from "https://deno.land/x/pngs@0.1.1/mod.ts";
const inputName = Deno.args[0] ?? "10.in";
const text = Deno.readTextFileSync(inputName);
const lines = text.split(/\r?\n/);
let index = 0;
let line = lines[index];
const [rows, columns] = line.split(" ").map((p) => Number(p));
index++;
line = lines[index];
class Robot {
  currentPosition: [number, number];
  steps: number = 0;
  constructor(
    public position: [number, number],
    public direction: [number, number],
  ) {
    this.currentPosition = position;
  }
  makeStep(rows: number, columns: number): void {
    this.currentPosition = [
      (((this.currentPosition[0] + this.direction[0]) % rows) + rows) % rows,
      (((this.currentPosition[1] + this.direction[1]) % columns) + columns) %
      columns,
    ];
    this.steps++;
  }
}
const robots = new Array<Robot>(0);
const charInput = new Array<Array<string>>();
while (line != "") {
  const iteratorA = line.matchAll(/-?\d+/g);
  const robot = new Robot(
    [
      Number(iteratorA.next().value![0]),
      Number(iteratorA.next().value![0]),
    ],
    [
      Number(iteratorA.next().value![0]),
      Number(iteratorA.next().value![0]),
    ],
  );
  robots.push(robot);
  index++;
  line = lines[index];
}

//robots.forEach((r) => console.log(r));

const applySteps = (
  [row, column]: [number, number],
  [dRow, dColumn]: [number, number],
  rows: number,
  columns: number,
  steps: number,
): [number, number] => {
  const nRow = (((row + steps * dRow) % rows) + rows) % rows;
  const nColumn = (((column + steps * dColumn) % columns) + columns) % columns;
  return [nRow, nColumn];
};
const newRobots1 = robots.map((r) =>
  applySteps(r.position, r.direction, rows, columns, 100)
);
//newRobots1.forEach((r) => console.log(r));
const halfRow = rows >> 1;
const halfColumn = columns >> 1;
let q1sum = 0;
let q2sum = 0;
let q3sum = 0;
let q4sum = 0;
for (const newPosition of newRobots1) {
  if (newPosition[0] < halfRow) {
    if (newPosition[1] < halfColumn) {
      q1sum++;
    } else if (newPosition[1] > halfColumn) {
      q3sum++;
    }
  } else if (newPosition[0] > halfRow) {
    if (newPosition[1] < halfColumn) {
      q2sum++;
    } else if (newPosition[1] > halfColumn) {
      q4sum++;
    }
  }
}

const safetyFactor = q1sum * q2sum * q3sum * q4sum;
console.log(safetyFactor);

const enum Space {
  Empty,
  Robot,
  Visited,
}
interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}
interface Rgb {
  r: number;
  g: number;
  b: number;
}
const toRgb: Record<Space, Rgb> = {
  [Space.Robot]: { r: 0x00, g: 0x00, b: 0x00 },
  [Space.Empty]: { r: 0xba, g: 0xba, b: 0xba },
  [Space.Visited]: { r: 0xf0, g: 0x70, b: 0x60 },
};
const toDpngRGB: Record<Space, dpng.RGB> = {
  [Space.Robot]: { r: 0x00, g: 0x00, b: 0x00, a: 1 },
  [Space.Empty]: { r: 0xba, g: 0xba, b: 0xba, a: 1 },
  [Space.Visited]: { r: 0xf0, g: 0x70, b: 0x60, a: 1 },
};
const toPngPalette: Uint8Array = Uint8Array.from([
  [0xba, 0xba, 0xba],
  [0x00, 0x00, 0x00],
  [0xf0, 0x70, 0x60],
].flat());
type ValueOf<T> = T[keyof T];
const pngsDrawRect = (
  pngsCanvas: Uint8Array,
  rows: number,
  columns: number,
  startRow: number,
  startColumn: number,
  endRow: number,
  endColumn: number,
  mode: ValueOf<typeof pngs.ColorType>,
  color?: dpng.RGB,
  index?: number,
) => {
  if (startRow > endRow) [startRow, endRow] = [endRow, startRow];
  if (startColumn > endColumn) {
    [startColumn, endColumn] = [endColumn, startColumn];
  }
  if (startColumn < 0) startColumn = 0;
  if (endColumn >= columns) endColumn = columns - 1;
  if (startRow < 0) startRow = 0;
  if (endRow >= rows) endRow = rows - 1;
  for (let row = startRow; row <= endRow; row++) {
    //console.log(color);
    for (let column = startColumn; column <= endColumn; column++) {
      if (mode == pngs.ColorType.RGBA) {
        pngsCanvas[row * columns * 4 + column * 4 + 0] = color!.r;
        pngsCanvas[row * columns * 4 + column * 4 + 1] = color!.g;
        pngsCanvas[row * columns * 4 + column * 4 + 2] = color!.b;
        pngsCanvas[row * columns * 4 + column * 4 + 3] = Math.round(
          color!.a * 255,
        );
      } else if (mode == pngs.ColorType.Indexed) {
        pngsCanvas[row * columns + column] = index!;
      }
    }
  }
};
const producePng = (
  step: number,
  arr: Array<Array<Space>>,
  toRGB: Record<number, dpng.RGB>,
): void => {
  const filenameDpng = "./output14/" + step + ".png";
  const filenamePngs = "./output14/" + step + ".s.png";
  const filenamePngs2 = "./output14/" + step + ".i.png";
  const factor = 4;
  const png = new dpng.PNGImage(columns * factor, rows * factor);
  const pngsCanvas = new Uint8Array(
    rows * factor * columns * factor * 4,
  );
  const pngsCanvasIndexed = new Uint8Array(
    rows * factor * columns * factor,
  );
  for (const [rowIndex, row] of arr.entries()) {
    for (const [columnIndex, space] of row.entries()) {
      const converted = toRGB[space];
      //console.log(space, converted, rowIndex, columnIndex);
      const pixelColor = png.createRGBColor(converted);
      //png.setPixel(rowIndex, columnIndex, pixelColor);
      const startRow = rowIndex * factor;
      const startColumn = columnIndex * factor;
      const endRow = rowIndex * factor + factor;
      const endColumn = columnIndex * factor + factor;
      png.drawRect(
        startColumn,
        startRow,
        endColumn,
        endRow,
        pixelColor,
      );
      pngsDrawRect(
        pngsCanvas,
        rows * factor,
        columns * factor,
        startRow,
        startColumn,
        endRow,
        endColumn,
        pngs.ColorType.RGBA,
        converted,
      );
      pngsDrawRect(
        pngsCanvasIndexed,
        rows * factor,
        columns * factor,
        startRow,
        startColumn,
        endRow,
        endColumn,
        pngs.ColorType.Indexed,
        undefined,
        space,
      );
    }
  }
  //const encodedPng = encode(pngsCanvas, columns * factor, rows * factor, {
  //  compression: 9,
  //});
  //console.log(pngsCanvasIndexed);
  const encodedPng = pngs.encode(pngsCanvas, columns * factor, rows * factor, {
    depth: pngs.BitDepth.Eight,
    color: pngs.ColorType.RGBA,
    compression: pngs.Compression.Best,
  });
  const encodedPng2 = pngs.encode(pngsCanvasIndexed, columns * factor, rows * factor, {
    depth: pngs.BitDepth.Eight,
    color: pngs.ColorType.Indexed,
    compression: pngs.Compression.Best,
    palette: toPngPalette,
  });
  Deno.writeFileSync(filenameDpng, png.getBuffer());
  Deno.writeFileSync(filenamePngs, encodedPng);
  Deno.writeFileSync(filenamePngs2, encodedPng2);
  //console.log(filename, "written");
};
const hash = 1000;
const toHash = ([row, column]: [number, number]): number => row * hash + column;

const directions: Array<[number, number]> = [[0, 1], [1, 0], [0, -1], [-1, 0]];
const applyDelta = (
  [r1, c1]: [number, number],
  [r2, c2]: [number, number],
): [number, number] => [r1 + r2, c1 + c2];
const isInbounds = ([row, column]: [number, number]): boolean => {
  return !(row < 0 || row >= rows || column < 0 || column >= columns);
};
for (const [rowIndex, row] of charInput.entries()) {
  for (const [columnIndex, column] of row.entries()) {
    if (column != ".") {
    }
  }
}

let factor = 0;
for (const [rowIndex, row] of charInput.entries()) {
  for (const [columnIndex, column] of row.entries()) {
    if (column != ".") {
    }
  }
}

const copyArray = Array.from(
  { length: charInput.length },
  () => new Array(charInput[0].length).fill(false),
);

for (let step = 1; step < 1000000; step++) {
  robots.forEach((r) => r.makeStep(rows, columns));
  //console.log(robots[0]);
  //console.log(robots.length);
  const visited = new PositionMap<boolean>(hash);
  const robotMap = new PositionMap<boolean>(hash);
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      visited.set([row, column], false);
      robotMap.set([row, column], false);
    }
  }
  robots.forEach((r) => robotMap.set(r.currentPosition, true));
  let components = 0;
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const unprocessed = new Deque<[number, number]>();
      if (robotMap.get([row, column]) && !visited.get([row, column])) {
        components++;
        unprocessed.pushFront([row, column]);
        while (!unprocessed.isEmpty()) {
          const currentPosition = unprocessed.popFront();
          if (visited.get(currentPosition)) {
            continue;
          }
          visited.set(currentPosition, true);
          for (const direction of directions) {
            const newPosition = applyDelta(currentPosition, direction);
            if (isInbounds(newPosition) && robotMap.get(newPosition)) {
              unprocessed.pushBack(newPosition);
            }
          }
        }
      }
    }
  }
  if ((step % 100) == 0) {
    const arr = Array.from(
      { length: rows },
      () => new Array<Space>(columns).fill(Space.Empty),
    );
    for (const visit of visited.keyList()) {
      if (visited.get(visit)) {
        arr[visit[0]][visit[1]] = Space.Visited;
      }
    }
    robots.forEach((r) =>
      arr[r.currentPosition[0]][r.currentPosition[1]] = Space.Robot
    );
    producePng(step, arr, toDpngRGB);
    console.log(step, components);
  }
  if (components < 200) {
    const arr = Array.from(
      { length: rows },
      () => new Array<Space>(columns).fill(Space.Empty),
    );
    for (const visit of visited.keys()) {
      if (visited.get(visit)) {
        arr[visit[0]][visit[1]] = Space.Visited;
      }
    }
    robots.forEach((r) =>
      arr[r.currentPosition[0]][r.currentPosition[1]] = Space.Robot
    );
    producePng(step, arr, toDpngRGB);
    console.log(step);
    break;
  }
}
