const lines = Deno.readTextFileSync("input1.txt").split(/\r\n/);
console.log(lines.length);
console.log(lines[999]);
const n = 1000;
const safetyCheck = (levels: Array<number>): number => {
	let isIncreasing = true;
	const [first, second] = [levels[0], levels[1]];
	if (second == undefined) return 1;
	if (first == second) {
		return 0;
	} else if (first < second) {
		isIncreasing = true;
	} else {
		isIncreasing = false;
	}
	for (let i = 1; i < levels.length; i++) {
		const diff = levels[i] - levels[i - 1];
		if (
			diff == 0 || (diff < 0 && isIncreasing) || (diff > 0 && !isIncreasing) ||
			Math.abs(diff) > 3
		) {
			return 0;
		}
	}
	console.log(levels);
	return 1;
};
let safeLevels = 0;
let safeLevelsWithProblemDampener = 0;
for (let i = 0; i < n; i++) {
	const levels = lines[i].split(/\s+/).map((text) => Number(text));
	safeLevels += safetyCheck(levels);
	for (let j = 0; j <= levels.length; j++) {
		const levelsWithTolerance = levels.toSpliced(j, 1);
		if (safetyCheck(levelsWithTolerance)) {
			safeLevelsWithProblemDampener++;
			break;
		}
	}
}
console.log(safeLevels);
console.log(safeLevelsWithProblemDampener);
