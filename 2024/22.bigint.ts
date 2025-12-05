//import * as _pq  from 'npm:@datastructures-js/priority-queue@5.4.0';
//import { Deque } from 'npm:@datastructures-js/deque@1.0.4';
const inputName = Deno.args[0] ?? "10.in";
const text = Deno.readTextFileSync(inputName);
const lines = text.split(/\r?\n/);
let index = 0;
let line = lines[index];
const secrets: bigint[] = [];
while (line != "") {
  secrets.push(BigInt(line));
  index++;
  line = lines[index];
}

const pruneConst = 16777216n;
const prune = (n1: bigint, n2: bigint): bigint => n2 ^ n1;
const mix = (n: bigint): bigint => n % pruneConst;
const getNewSecret = (num: bigint): bigint => {
  num = (num ^ (num * 64n)) % pruneConst;
  num = (num ^ (num >> 5n)) % pruneConst;
  num = (num ^ (num << 11n)) % pruneConst;
  return num;
};

const computeTotalSum = (
  a: bigint,
  b: bigint,
  c: bigint,
  d: bigint,
  diffs: bigint[][],
	secrets: bigint[][],
): bigint => {
  const maxSum = 0n;
  for (let index = 3; index < diffs[0].length; index++) {
		let sequenceSum = 0n;
    for (let diffIndex = 0; diffIndex < diffs.length; diffIndex++) {
      const da = diffs[diffIndex][index - 3];
      const db = diffs[diffIndex][index - 2];
      const dc = diffs[diffIndex][index - 1];
      const dd = diffs[diffIndex][index - 0];
			if (a == da && b == db && c == dc && d == dd) {
				sequenceSum += secrets[diffIndex][index+1] % 10n;
			}
    }
  }
};
const solve = () => {
  const newNumbers: bigint[] = [];
  const diffs: bigint[] = [];
	const start = Date.now();
  for (const secret of secrets) {
    let oldNumber = secret;
    let newNumber = 0n;
    for (let i = 0; i < 2000; i++) {
      newNumber = getNewSecret(oldNumber);
      diffs.push(newNumber - oldNumber);
      oldNumber = newNumber;
    }
    newNumbers.push(newNumber);
    //console.log(secret, newNumber);
  }
  // part1
  const part1 = newNumbers.reduce((a, c) => a + c, 0n);
  console.log(part1);
	const part1time = Date.now();
	console.log(part1time - start);
};

solve();
