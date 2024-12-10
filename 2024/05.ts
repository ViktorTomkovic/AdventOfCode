const text = Deno.readTextFileSync("input.txt");
const lines = text.split("\r\n");
let index = 0;
let line = lines[index];
const precedences = Array.from(
	{ length: 100 },
	() => new Array(100).fill(false),
);
while (line != "") {
	const splitt = line.split("|");
	const [before, after] = [Number(splitt[0]), Number(splitt[1])];
	console.log(before, after);
	precedences[before][after] = true;
	index++;
	line = lines[index];
}
index++;
line = lines[index];
const incorrectUpdates = new Array<Array<number>>();
const isInRightOrder = (updates: Array<number>): boolean => {
	const n = updates.length;
	for (let i = 0; i < n; i++) {
		for (let j = i; j < n; j++) {
			if (precedences[updates[j]][updates[i]]) {
				console.log("x", updates[i], updates[j]);
				incorrectUpdates.push(updates);
				return false;
			}
		}
	}
	return true;
};
let middlePageSum = 0;
while (line != "") {
	const updates = line.split(",").map((v) => Number(v));
	console.log(updates.join(","));
	if (isInRightOrder(updates)) {
		middlePageSum += updates[updates.length >> 1];
		console.log("^", updates.length, updates[updates.length >> 1]);
	}
	index++;
	line = lines[index];
}
console.log(middlePageSum);
// 5279
// 9122, 6500
//console.log(precedences)
const middleOfCorrectedUpdates = (updates: Array<number>): number => {
	const n = updates.length;
	for (let k = 0; k < n * n; k++) {
		for (let i = 0; i < n; i++) {
			for (let j = i; j < n; j++) {
				if (precedences[updates[j]][updates[i]]) {
					const temp = updates[j];
					updates[j] = updates[i];
					updates[i] = temp;
				}
			}
		}
	}
	return updates[updates.length >> 1];
};
let correctedUpdatesSum = 0;
for (const updates of incorrectUpdates) {
	correctedUpdatesSum += middleOfCorrectedUpdates(updates);
}
console.log(correctedUpdatesSum);
