import { MinPriorityQueue } from "npm:@datastructures-js/priority-queue@5.4.0";
//import { Deque } from 'npm:@datastructures-js/deque@1.0.4';
import { PositionMap } from "./generalMap.ts";
const inputName = Deno.args[0] ?? "10.in";
const text = Deno.readTextFileSync(inputName);
const lines = text.split(/\r?\n/);
const error = 10000000000000n;
const maxNumber = 10000010000000n;
// 10000 for tokenA, 3*10000 for tokenB
const memoBase = error - 40000n;

class Machine {
  constructor(
    public buttonA: [bigint, bigint],
    public buttonB: [bigint, bigint],
    public prize: [bigint, bigint],
  ) {}
  static from(existing: Machine): Machine {
    return new Machine([existing.buttonA[0], existing.buttonA[1]], [
      existing.buttonB[0],
      existing.buttonB[1],
    ], [existing.prize[0], existing.prize[1]]);
  }
}
const machines = new Array<Machine>(0);
let index = 0;
let line = lines[index];
while (line != "") {
  // A
  line = lines[index];
  //console.log("A", line);
  if (line == "" || line == undefined) break;
  const iteratorA = line.matchAll(/\d+/g);
  const buttonA: [bigint, bigint] = [
    BigInt(iteratorA.next().value![0]),
    BigInt(iteratorA.next().value![0]),
  ];
  index++;
  // B
  line = lines[index];
  //console.log("B", line);
  const iteratorB = line.matchAll(/\d+/g);
  const buttonB: [bigint, bigint] = [
    BigInt(iteratorB.next().value![0]),
    BigInt(iteratorB.next().value![0]),
  ];
  index++;
  // Total
  line = lines[index];
  //console.log("P", line);
  const iteratorP = line.matchAll(/\d+/g);
  const prize: [bigint, bigint] = [
    BigInt(iteratorP.next().value![0]),
    BigInt(iteratorP.next().value![0]),
  ];
  index++;
  line = lines[index];
  index++;
  line = lines[index];
  machines.push(new Machine(buttonA, buttonB, prize));
}

const fewestTokens = (machine: Machine): bigint => {
  let result = maxNumber;
  for (let tokensA = 0n; tokensA < 150n; tokensA++) {
    for (let tokensB = 0n; tokensB < 150n; tokensB++) {
      const tokens = 3n * tokensA + tokensB;
      const position = [
        machine.buttonA[0] * tokensA + machine.buttonB[0] * tokensB,
        machine.buttonA[1] * tokensA + machine.buttonB[1] * tokensB,
      ];
      if (machine.prize[0] == position[0] && machine.prize[1] == position[1]) {
        if (tokens < result) {
          result = tokens;
        }
      }
    }
  }
  return result == maxNumber ? 0n : result;
};

const fewestTokens2 = (machine: Machine): bigint => {
	const tokensB = (machine.buttonA[0]*machine.prize[1] - machine.buttonA[1]*machine.prize[0]) / (machine.buttonA[0]*machine.buttonB[1] - machine.buttonA[1]*machine.buttonB[0]);
	const tokensA = (machine.prize[0] - machine.buttonB[0]*tokensB) / machine.buttonA[0];
	//console.log(tokensA, tokensB);
	const eq0 = machine.prize[0] == machine.buttonA[0] * tokensA + machine.buttonB[0] * tokensB;
	const eq1 = machine.prize[1] == machine.buttonA[1] * tokensA + machine.buttonB[1] * tokensB;
	return (eq0 && eq1) ? 3n * tokensA + tokensB: 0n;
};

const startTime = Date.now();
let tokenCount = 0n;
let tokenCount2 = 0n;
for (const [_i, machine] of machines.entries()) {
	// also works with fewestTokens2
  const tokens = fewestTokens(machine);
  //console.log(tokens);
  const fixedMachine = Machine.from(machine);
  fixedMachine.prize = [fixedMachine.prize[0] + error, fixedMachine.prize[1] + error];
  const tokens2 = fewestTokens2(fixedMachine);
  tokenCount += tokens;
  tokenCount2 += tokens2;
  //console.log(_i, machines.length, tokens, tokens2);
}
console.log(Date.now() - startTime);
console.log(tokenCount);
console.log(tokenCount2);
