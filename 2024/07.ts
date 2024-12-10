const text = Deno.readTextFileSync("input.txt");
const lines = text.split("\r\n");
const canBeComposed = (
	wantedResult: bigint,
	operands: Array<bigint>,
	currentIndex: number,
	intermediateSum: bigint,
	intermediateOperations: string,
): boolean => {
	if (intermediateSum == wantedResult) {
		if (currentIndex == operands.length) {
			console.log(wantedResult + " == " + intermediateOperations);
			return true;
		}
		//else {
		//	console.log(wantedResult + " != " + intermediateOperations);
		//	return false;
		//}
	}
	if (intermediateSum > wantedResult) {
		return false;
	}
	if (currentIndex >= operands.length) {
		return false;
	}
	return canBeComposed(
		wantedResult,
		operands,
		currentIndex + 1,
		intermediateSum * operands[currentIndex],
		intermediateOperations + " * " + operands[currentIndex].toString(10),
	) ||
		canBeComposed(
			wantedResult,
			operands,
			currentIndex + 1,
			intermediateSum + operands[currentIndex],
			intermediateOperations + " + " + operands[currentIndex].toString(10),
		) ||
		canBeComposed(
			wantedResult,
			operands,
			currentIndex + 1,
			BigInt(intermediateSum.toString(10) + operands[currentIndex].toString(10)),
			intermediateOperations + " $ " + operands[currentIndex].toString(10),
		);
};
let index = 0;
let line = lines[index];
let sum: bigint = 0n;
while (line != "") {
	const wantedResult = BigInt(line.slice(0, line.indexOf(":")));
	const operands = line.slice(line.indexOf(":") + 2).split(" ").map((v) =>
		BigInt(v)
	);
	//console.log(line.slice(line.indexOf(":") + 2).split(" "));
	//console.log(operands[0]);
	if (
		canBeComposed(
			wantedResult,
			operands,
			1,
			operands[0],
			operands[0].toString(10),
		)
	) {
		sum += wantedResult;
	}
	index++;
	line = lines[index];
}

console.log(sum);
// low:  526590940n
// nope: 3244623801887n
//       3245122495150n
// high: 3245122495222n
// ???: 526589073n
// 105517128211543n
