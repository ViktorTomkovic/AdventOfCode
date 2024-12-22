//import * as _pq  from 'npm:@datastructures-js/priority-queue@5.4.0';
//import { Deque } from 'npm:@datastructures-js/deque@1.0.4';
const inputName = Deno.args[0] ?? "10.in";
const text = Deno.readTextFileSync(inputName);
const lines = text.split(/\r?\n/);

interface Machine {
  registerA: bigint;
  registerB: bigint;
  registerC: bigint;
  instructions: Array<number>;
  ip: number;
  isHalted: boolean;
  out: Array<bigint>;
}

const operandToValue = (machine: Machine, operand: number): bigint => {
  switch (operand) {
    case 0:
      return 0n;
    case 1:
      return 1n;
    case 2:
      return 2n;
    case 3:
      return 3n;
    case 4:
      return machine.registerA;
    case 5:
      return machine.registerB;
    case 6:
      return machine.registerC;
    case 7:
      //console.log("PANIC! OPERAND 7 USED");
      //console.log(machine);
      return 0n;
    default:
      //console.log("PANIC! OPERAND UNKNOWN");
      //console.log(machine);
      return 0n;
  }
};

const performStep = (machine: Machine): void => {
  if (machine.isHalted) return;
  const rOpcode = machine.instructions[machine.ip];
  const rOperand = machine.instructions[machine.ip + 1];
  if (rOpcode == undefined || rOperand == undefined) {
    machine.isHalted = true;
    return;
  }
  const opcode = rOpcode!;
  const operand = rOperand!;
  const literal = BigInt(operand);
  const combo = operandToValue(machine, operand);

  switch (opcode) {
    case 0: // adv instruction
    {
      machine.registerA = machine.registerA >> combo;
      machine.ip += 2;
      return;
    }
    case 1: // bxl instruction
      machine.registerB = literal ^ machine.registerB;
      machine.ip += 2;
      return;
    case 2: // bst instruction
      machine.registerB = combo & 7n;
      machine.ip += 2;
      return;
    case 3: // jnz instruction
      if (machine.registerA == 0n) {
        machine.ip += 2;
        return;
      }
      machine.ip = Number(literal);
      return;
    case 4: // bxc instruction
      machine.registerB = machine.registerB ^ machine.registerC;
      machine.ip += 2;
      return;
    case 5: // out instruction
      machine.out.push(combo & 7n);
      machine.ip += 2;
      return;
    case 6: // bdv instruction
    {
      machine.registerB = machine.registerA >> combo;
      machine.ip += 2;
      return;
    }
    case 7: // adv instruction
    {
      machine.registerC = machine.registerA >> combo;
      machine.ip += 2;
      return;
    }
    default:
      return;
  }
};

const machineOrig: Machine = {
  registerA: 0n,
  registerB: 0n,
  registerC: 0n,
  instructions: [],
  ip: 0,
  isHalted: false,
  out: new Array<bigint>(0),
};
machineOrig.registerA = BigInt(lines[0].match(/[0-9]+/)![0]);
machineOrig.registerB = BigInt(lines[1].match(/[0-9]+/)![0]);
machineOrig.registerC = BigInt(lines[2].match(/[0-9]+/)![0]);

machineOrig.instructions = (lines[4].substring(lines[4].indexOf(" "))).split(
  ",",
)
  .map((v) => Number(v));

const simulate = (machine: Machine): Array<bigint> => {
  while (!machine.isHalted) {
    //console.log(machine);
    performStep(machine);
  }
  return machine.out;
};
const makeCopy = (machine: Machine): Machine => {
  const result: Machine = {
    registerA: machine.registerA,
    registerB: machine.registerB,
    registerC: machine.registerC,
    instructions: Array.from(machine.instructions),
    ip: 0,
    isHalted: false,
    out: [],
  };
  return result;
};

const machine1 = makeCopy(machineOrig);
const inputSimulation = simulate(machine1);
console.log(inputSimulation.join(","));
// 2,3,4,7,5,7,3,0,7

const simulate2 = (
  registerA: bigint,
  target: Array<bigint>,
): { output: Array<bigint>; halt: boolean } => {
  let A = registerA;
  let B = 0n;
  let C = 0n;
  const out = new Array<bigint>(0);
  do {
    B = A % 8n;
    B = B ^ 2n;
    C = A >> B;
    B = B ^ C;
    A = A >> 3n;
    B = B ^ 7n;
    out.push(B % 8n);
    if (out[out.length - 1] != target[out.length - 1]) {
      return { output: out, halt: false };
    }
  } while (A != 0n);
  return { output: out, halt: true };
};
console.log(
  simulate2(machineOrig.registerA, [2n, 3n, 4n, 7n, 5n, 7n, 3n, 0n, 7n]).output
    .join(
      ",",
    ),
);
const simulateIn2 = (registerA: number): Array<bigint> => {
  let A = BigInt(registerA);
  let B = 0n;
  let C = 0n;
  const out = new Array<bigint>(0);
  do {
    A = A >> 3n;
    out.push(A % 8n);
  } while (A != 0n);
  return out;
};

const target = machineOrig.instructions.map((v) => BigInt(v));
const machineInstructions = machineOrig.instructions.join(",");
console.log(machineInstructions);
const simulateFn = (
  simulator: (
    regA: bigint,
    target: Array<bigint>,
  ) => { output: Array<bigint>; halt: boolean },
  matchingString: string,
) => {
  const start = Date.now();
  let lastOutput = new Array<bigint>();
  let iteration = 0n;
  //for (let i = 896547855n; i < 10n ** 100n; i = i + 8n ** 13n) {
  for (let i = 896547855n; i < 10n ** 100n; i = i + 512n) {
    if (iteration % 10n ** 7n == 0n) {
      console.log(i, (Date.now() - start) / 1000, lastOutput.join(""));
    }
    const { output: output, halt: halt } = simulator(i, target);
    lastOutput = output;
    if (halt) {
      console.log(lastOutput);
      console.log(i);
      console.log(target.length, lastOutput.length);
      if (target.length == lastOutput.length) {
        break;
      }
    }
    iteration++;
  }
};

// B = A % 8
// B = B ^ 2
// C = A >> B
// B = B ^ C
// A = A >> 3
// B = B ^ 7
// out B%8
// until A != 0

const isNproducingT = (N: bigint, T: bigint) => {
  const B2 = (N & 7n) ^ 2n;
  return ((B2 ^ (N >> B2)) ^ 7n) % 8n == T;
};
const reversedInstructions = target.toReversed();
const targetState = reversedInstructions.join("");
const findRegisterA = (
  currentIndex: number,
  currentN: bigint,
  currentState: string,
  targetState: string,
): bigint => {
  if (currentIndex == targetState.length) {
    return currentN >> 3n;
  }
  for (let i = 0n; i < 8n; i++) {
    if (isNproducingT(currentN + i, BigInt(targetState[currentIndex]))) {
      const result = findRegisterA(
        currentIndex + 1,
        (currentN + i) << 3n,
        currentState + i.toString(),
        targetState,
      );
      if (result != -1n) return result;
    }
  }
  return -1n;
};
const registerA = findRegisterA(0, 0n, "", targetState);
console.log(registerA);
const checkingMachine = makeCopy(machineOrig);
//checkingMachine.registerA = 190384609508367n;
checkingMachine.registerA = registerA;
const actual = simulate(checkingMachine);
console.log(actual.join(","));

//simulateFn(simulate2, machineInstructions);
// 760000000 is too low
// 896547855n ... not too far first time
//
//1265536547855n 1474.652 247
//[
//  2n, 4n, 1n, 2n, 7n, 5n,
//  4n, 3n, 0n, 3n, 1n, 7n,
//  5n, 5n
//]
//1268609530895n
//16 14
//[
//  2n, 4n, 1n, 2n, 7n, 5n,
//  4n, 3n, 0n, 3n, 1n, 7n,
//  5n, 5n
//]
//1268611103759n
//16 14
//[
//  2n, 4n, 1n, 2n, 7n, 5n,
//  4n, 3n, 0n, 3n, 1n, 7n,
//  5n, 5n
//]
//1268613200911n
//16 14
//[
//  2n, 4n, 1n, 2n, 7n, 5n,
//  4n, 3n, 0n, 3n, 1n, 7n,
//  5n, 5n
//]
//1268617395215n
//16 14
