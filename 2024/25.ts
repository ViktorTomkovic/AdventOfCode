//import * as _pq  from 'npm:@datastructures-js/priority-queue@5.4.0';
//import { Deque } from 'npm:@datastructures-js/deque@1.0.4';
const inputName = Deno.args[0] ?? "25.in";
const text = Deno.readTextFileSync(inputName);
const lines = text.split(/\r?\n/);
let index = 0;
let line = lines[index];
//console.log(lines);

const keys: number[][] = [];
const locks: number[][] = [];
while (!(line == "" || line == undefined)) {
  const charInput = new Array<Array<string>>();
  for (let row = 0; row < 7; row++) {
    charInput.push(line.split(""));
    //console.log(charInput);
    index++;
    line = lines[index];
  }
  //console.log("i");
  //console.log(charInput);
  if (charInput[0][0] == ".") {
    // key
    const key: number[] = new Array<number>(5);
    for (let column = 0; column < 5; column++) {
      for (let row = 6; row >= 0; row--) {
        if (charInput[row][column] == ".") {
          key[column] = 5 - row;
          break;
        }
      }
    }
    keys.push(key);
  } else if (charInput[0][0] == "#") {
    // lock
    const lock: number[] = new Array<number>(5);
    for (let column = 0; column < 5; column++) {
      for (let row = 0; row < 7; row++) {
        if (charInput[row][column] == ".") {
          lock[column] = row - 1;
          break;
        }
      }
    }
    locks.push(lock);
  } else {
    console.log("PANIC", charInput);
  }
  index++;
  line = lines[index];
}

const isFit = (key: number[], lock: number[]): boolean =>{
	for (let i = 0; i < 5; i++) {
		if (key[i] + lock[i] > 5) return false;
	}
	return true;
}
const part1 = (keys: number[][], locks: number[][]) => {
  //console.log(keys);
  //console.log(locks);
	let counter = 0;
	for (const key of keys) {
		for (const lock of locks) {
			if (isFit(key, lock)) counter++;
		}
	}
	console.log(counter);
};

part1(keys, locks);
