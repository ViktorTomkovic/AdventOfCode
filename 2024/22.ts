//import * as _pq  from 'npm:@datastructures-js/priority-queue@5.4.0';

import { GeneralMapHashFn } from "./generalMap.ts";

//import { Deque } from 'npm:@datastructures-js/deque@1.0.4';
const inputName = Deno.args[0] ?? "22.in";
const text = Deno.readTextFileSync(inputName);
const lines = text.split(/\r?\n/);
let index = 0;
let line = lines[index];
const inputSecrets: number[] = [];
while (line != "") {
  inputSecrets.push(Number(line));
  index++;
  line = lines[index];
}

const pruneConst = 16777216;
const getNewSecret = (num: number): number => {
  num = (num ^ (num << 6)) % pruneConst;
  num = (num ^ (num >> 5)) % pruneConst;
  num = Number((BigInt(num) ^ (BigInt(num) << 11n)) % BigInt(pruneConst));
  return num;
};

const computeTotalSum = (
  a: number,
  b: number,
  c: number,
  d: number,
  diffs: number[][],
  secrets: number[][],
): number => {
  let sequenceSum = 0;
  for (let diffIndex = 0; diffIndex < diffs.length; diffIndex++) {
    for (let index = 3; index < diffs[diffIndex].length; index++) {
      const da = diffs[diffIndex][index - 3];
      const db = diffs[diffIndex][index - 2];
      const dc = diffs[diffIndex][index - 1];
      const dd = diffs[diffIndex][index - 0];
      //console.log(da, db,dc,dd);
      if ((a == da) && (b == db) && (c == dc) && (d == dd)) {
        sequenceSum += secrets[diffIndex][index] % 10;
        break;
      }
    }
  }
  return sequenceSum;
};
//{{{
//const maxFromAllSequences = (
//  diffs: number[][],
//  secrets: number[][],
//): number => {
//  let currentMax = 0;
//  for (let a = -18; a <= 18; a++) {
//    console.log("a", a);
//    for (let b = -18; b <= 18; b++) {
//      console.log("b", b);
//      for (let c = -18; c <= 18; c++) {
//        for (let d = -18; d <= 18; d++) {
//          currentMax = Math.max(
//            currentMax,
//            computeTotalSum(a, b, c, d, diffs, secrets),
//          );
//        }
//      }
//    }
//  }
//  return currentMax;
//};
//}}}
type PrefixMap = GeneralMapHashFn<number[], number, number>;
const computeTotalSum2 = (
  a: number,
  b: number,
  c: number,
  d: number,
  prefixes: PrefixMap[],
): number => {
  let sequenceSum = 0;
  for (let prefixIndex = 0; prefixIndex < prefixes.length; prefixIndex++) {
    if (prefixes[prefixIndex].has([a, b, c, d])) {
      sequenceSum += prefixes[prefixIndex].get([a, b, c, d])!;
    }
  }
  return sequenceSum;
};
const maxFromAllSequences2 = (
  prefixes: PrefixMap[],
): number => {
  let currentMax = 0;
  for (let a = -18; a <= 18; a++) {
    console.log("a", a);
    for (let b = -18; b <= 18; b++) {
      console.log("b", b);
      for (let c = -18; c <= 18; c++) {
        for (let d = -18; d <= 18; d++) {
          currentMax = Math.max(
            currentMax,
            computeTotalSum2(a, b, c, d, prefixes),
          );
        }
      }
    }
  }
  return currentMax;
};

const maxFromAllSequences3 = (
  prefixes: PrefixMap[],
  allPossiblePrefixes: GeneralMapHashFn<number[], boolean, number>,
): number => {
  //console.log(prefixes);
  //console.log(allPossiblePrefixes.keyList());
  let currentMax = 0;
  let currentSeq = [666, 666, 666, 666];
  for (const [a, b, c, d] of allPossiblePrefixes.keyList()) {
    const sum = computeTotalSum2(a, b, c, d, prefixes);
    if (sum > currentMax) {
      console.log(
        "*******************",
        sum,
        [a, b, c, d],
        currentMax,
        currentSeq,
      );
      currentMax = sum;
      currentSeq = [a, b, c, d];
    }
  }
  //console.log(currentSeq);
  //for (const prefix of prefixes)		console.log("!", prefix.get([-2,1,-1,3]));

  return currentMax;
};

const maxFromAllSequences4 = (
  prefixes: PrefixMap[],
  allPossiblePrefixes: Iterable<number[]>,
): number => {
  //console.log(prefixes);
  //console.log(allPossiblePrefixes.keyList());
  let currentMax = 0;
  let currentSeq = [666, 666, 666, 666];
  for (const [a, b, c, d] of allPossiblePrefixes) {
    const sum = computeTotalSum2(a, b, c, d, prefixes);
    if (sum > currentMax) {
      console.log(
        "*******************",
        sum,
        [a, b, c, d],
        currentMax,
        currentSeq,
      );
      currentMax = sum;
      currentSeq = [a, b, c, d];
    }
  }
  //console.log(currentSeq);
  return currentMax;
};

const hash = 64;
const to4valuesHash = (values: number[]): number =>
  (hash ** 3) * (values[3] + 18) + (hash ** 2) * (values[2] + 18) +
  (hash ** 1) * (values[1] + 18) + (hash ** 0) * (values[0] + 18);
const computePrefixTreeForOneInput = (
  diffs: number[],
  secrets: number[],
): PrefixMap => {
  const result = new GeneralMapHashFn<number[], number, number>(to4valuesHash);
  const values = new Array(0);
  values.push(diffs[0]);
  values.push(diffs[1]);
  values.push(diffs[2]);
  values.push(diffs[3]);
  result.set(Array.from(values), secrets[3] % 10);
  for (let i = 4; i < diffs.length; i++) {
    values.push(diffs[i]);
    values.shift();
    if (!result.has(Array.from(values))) {
      result.set(Array.from(values), secrets[i] % 10);
    }
  }

  return result;
};
const solve = () => {
  const newNumbers: number[] = [];
  const diffs: number[][] = [];
  const secrets: number[][] = [];
  const prefixes: PrefixMap[] = [];
  //const allPossiblePrefixes2: Map<number, number[]> = new Map();
  const allPossiblePrefixes: GeneralMapHashFn<number[], boolean, number> =
    new GeneralMapHashFn<number[], boolean, number>(to4valuesHash);
  const start = Date.now();
  for (const secret of inputSecrets) {
    let oldNumber = secret;
    let newNumber = 0;
    const OneDiffs: number[] = [];
    const OneSecrets: number[] = [];
    const prefix: number[] = [];
    for (let i = 0; i < 2000; i++) {
      newNumber = getNewSecret(oldNumber);
      const diff = (newNumber % 10) - (oldNumber % 10);
      OneSecrets.push(newNumber);
      OneDiffs.push(diff);
      prefix.push(diff);
      if (prefix.length > 4) prefix.shift();
      if (prefix.length == 4) {
        allPossiblePrefixes.set(Array.from(prefix), true);
        //allPossiblePrefixes2.set(to4valuesHash(prefix), prefix);
      }
      oldNumber = newNumber;
    }
    newNumbers.push(newNumber);
    diffs.push(OneDiffs);
    secrets.push(OneSecrets);
    //console.log(allPossiblePrefixes.size(), "<-");
    prefixes.push(computePrefixTreeForOneInput(OneDiffs, OneSecrets));
    //console.log(secret, newNumber);
    //console.log(secrets, prefixes, diffs, allPossiblePrefixes)
  }
  // part1
  const part1 = newNumbers.reduce((a, c) => a + BigInt(c), 0n);
  console.log(part1);
  const part1time = Date.now();
  console.log(part1time - start);
  //console.log(diffs);
  //console.log(secrets);

  const part2 = maxFromAllSequences3(prefixes, allPossiblePrefixes);
  //const part2 = maxFromAllSequences4(prefixes, allPossiblePrefixes2);
  console.log(part2);
  const part2time = Date.now();
  console.log(part2time - part1time);
  //console.log(computeTotalSum2(-2, 1, -1, 3, prefixes));
  //console.log(allPossiblePrefixes.has([-2, 1, -1, 3]));
  //for (const prefix of allPossiblePrefixes.keyList()) {
  //  console.log(prefix, allPossiblePrefixes.keyList().length);
  //}
};

solve();
// 1732 is too low
// 1908 is too high
