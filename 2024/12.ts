//import * as _pq  from 'npm:@datastructures-js/priority-queue@5.4.0';
//import { Deque } from 'npm:@datastructures-js/deque@1.0.4';
import { PositionMap } from "./generalMap.ts";
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

const hashValue = 1000;
const fences = new PositionMap<Array<[number, number, number, number]>>(hashValue);
const visitedRegion = new PositionMap<number>(1000);

const fillArea = (
  [toRow, toColumn]: [number, number],
  [fromRow, fromColumn]: [number, number],
  areaCode: number,
): void => {
  if (
    !isInbounds([toRow, toColumn]) ||
    charInput[fromRow][fromColumn] != charInput[toRow][toColumn]
  ) {
    fences.putOrUpdate(
      [fromRow, fromColumn],
      () =>
        new Array<[number, number, number, number]>(1).fill([
          toRow,
          toColumn,
          fromRow,
          fromColumn,
        ]),
      (f) => {
        f.push([toRow, toColumn, fromRow, fromColumn]);
        return f;
      },
    );
    return;
  }
  if (visitedRegion.has([toRow, toColumn])) {
    return;
  }
  visitedRegion.set([toRow, toColumn], areaCode);
  for (const direction of directions) {
    const newPosition = applyDelta([toRow, toColumn], direction);
    fillArea(newPosition, [toRow, toColumn], areaCode);
  }
};

let areaCode = 0;
for (const [rowIndex, row] of charInput.entries()) {
  for (const [columnIndex, column] of row.entries()) {
    if (!visitedRegion.has([rowIndex, columnIndex])) {
      fillArea([rowIndex, columnIndex], [rowIndex, columnIndex], areaCode);
      areaCode++;
    }
  }
}

//for (const position of fences.keys()) {
//  console.log(position, fences.get(position));
//}
//for (const position of visitedRegion.keys()) {
//  console.log(position, visitedRegion.get(position));
//}

const areaToFences = new Map<number, Array<[number, number, number, number]>>();
const areaToSpaces = new Map<number, Array<[number, number]>>();
for (const position of visitedRegion.keys()) {
  const areaCode = visitedRegion.get(position);
  if (areaCode == undefined) {
    console.log(position, areaCode, "panic");
    break;
  }
  if (fences.has(position)) {
    const fenceArray = fences.get(position);
    if (areaToFences.has(areaCode)) {
      areaToFences.get(areaCode)?.push(...fenceArray!);
    } else {
      areaToFences.set(areaCode, fenceArray!);
    }
  }
  if (areaToSpaces.has(areaCode)) {
    areaToSpaces.get(areaCode)?.push(position);
  } else {
    areaToSpaces.set(areaCode, new Array(1).fill(position));
  }
}

const isFenceHorizontal = (
  fence: [number, number, number, number],
): boolean => {
  return (fence[1] == fence[3]);
};
const isFenceVertical = (fence: [number, number, number, number]): boolean => {
  return (fence[0] == fence[2]);
};
let price = 0;
for (const area of areaToFences.keys()) {
  const fences = areaToFences.get(area);
  const fencesLength = fences!.length;
  const spaces = areaToSpaces.get(area);
  const spacesLength = spaces!.length;
  const p = fencesLength * spacesLength;
  console.log(
    area,
    spacesLength,
    fencesLength,
    p,
    "spaces",
    spaces,
    "fences",
    fences,
  );
  price += p;
}

console.log(price);
// 1433460

let discountPrice = 0;
for (const area of areaToFences.keys()) {
  const fences = areaToFences.get(area)!;
  const horizontalFences = fences.filter(isFenceHorizontal).toSorted((a, b) => {
    if ((a[0] + a[2] / hashValue) == (b[0] + b[2] / hashValue)) {
      //if (a[2] == b[2]) {
      //  return a[1] - b[1];
      //}
      //return a[2] - b[2];
			return a[1] - b[1];
    }
    return (a[0]+a[2] / hashValue) - (b[0]+b[2] / hashValue);
  });
  //console.log("hf", horizontalFences);
  let horizontalSidesCount = 1;
  for (let i = 1; i < horizontalFences.length; i++) {
    const [cr, cc, crf, ccf] = horizontalFences[i];
    const [pr, pc, prf, pcf] = horizontalFences[i - 1];
    if (((cr + crf / hashValue) == (pr+prf / hashValue)) && (pc + 1 < cc)) horizontalSidesCount++;
    if ((cr + crf / hashValue) != (pr + prf / hashValue)) horizontalSidesCount++;
  }
  //console.log(horizontalFencesCount);
  const verticalFences = fences.filter(isFenceVertical).toSorted((a, b) => {
    if ((a[1] + a[3] / hashValue) == (b[1] + b[3] / hashValue)) return a[0] - b[0];
    return (a[1] + a[3] / hashValue) - (b[1] + b[3] / hashValue);
  });
  //console.log("vf", verticalFences);
  let verticalSidesCount = 1;
  for (let i = 1; i < verticalFences.length; i++) {
    const [cr, cc, crf, ccf] = verticalFences[i];
    const [pr, pc, prf, pcf] = verticalFences[i - 1];
    if (((cc + ccf / hashValue) == (pc + pcf / hashValue)) && (pr + 1 < cr)) verticalSidesCount++;
    if ((cc + ccf / hashValue) != (pc + pcf / hashValue)) verticalSidesCount++;
  }
  //console.log(verticalFencesCount);
  //console.log(area, "hf", horizontalFencesCount, horizontalFences, "vf", verticalFencesCount, verticalFences);
  const areaSize = areaToSpaces.get(area)!.length;
  const sidesCount = horizontalSidesCount + verticalSidesCount;
  const areaDiscountPrice = areaSize * sidesCount;
  console.log(
    area,
    areaSize,
    sidesCount,
    areaDiscountPrice,
    "hf",
    horizontalSidesCount,
    "vf",
    verticalSidesCount,
  );
  if (area == 3) {
    console.log("hfa", horizontalFences, "vfa", verticalFences);
  }
  discountPrice += areaDiscountPrice;
}
console.log(discountPrice);

const copyArray = Array.from(
  { length: charInput.length },
  () => new Array(charInput[0].length).fill(false),
);
// 855082
