//import * as _pq  from 'npm:@datastructures-js/priority-queue@5.4.0';
//import { Deque } from 'npm:@datastructures-js/deque@1.0.4';
const inputName = Deno.args[0] ?? "10.in";
const text = Deno.readTextFileSync(inputName);
const lines = text.split(/\r?\n/);
let index = 0;
let line = lines[index];
const towelPatterns = line.split(", ");
index += 2;
line = lines[index];
const wantedPatterns = new Array<string>();
while (line != "") {
  wantedPatterns.push(line);
  index++;
  line = lines[index];
}
console.log(towelPatterns.length, towelPatterns);
console.log(wantedPatterns.length, wantedPatterns);

const howManyMatches = (
  wantedPattern: string,
  possiblePatterns: Array<string>,
): number => {
  const countMatching = new Map<number, number>();
  const dfs = (
    currentIndex: number,
    wantedPattern: string,
    possiblePatterns: Array<string>,
  ): number => {
		//console.log(currentIndex);
    if (countMatching.has(currentIndex)) {
      return countMatching.get(currentIndex)!;
    }
    let count = 0;
    if (currentIndex == wantedPattern.length) {
      count = 1;
    }
    for (const possiblePattern of possiblePatterns) {
      if (wantedPattern.startsWith(possiblePattern, currentIndex)) {
        count += dfs(
          currentIndex + possiblePattern.length,
          wantedPattern,
          possiblePatterns,
        );
      }
    }
    countMatching.set(currentIndex, count);
    return count;
  };
  return dfs(0, wantedPattern, possiblePatterns);
};

let possibleMatch = 0;
let possibleCount = 0;
let round = 1;
//const pattern = "^(" + towelPatterns.join("|") + ")*$";
//const patternRegex = new RegExp(pattern);
//console.log(patternRegex);
for (const wantedPattern of wantedPatterns) {
  console.log(round, wantedPatterns.length);
  const count = howManyMatches(wantedPattern, towelPatterns);
  if (count > 0) {
    possibleMatch += 1;
  }
  possibleCount += count;
  //possibleCount += patternRegex.test(wantedPattern) ? 1 : 0;
  round++;
  //if (round > 1) {
  //  break;
  //}
}
console.log("matches: ", possibleMatch);
console.log("counts: ", possibleCount);
