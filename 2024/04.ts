const text = Deno.readTextFileSync("input.txt");
const lines = text.split("\r\n");
lines.pop();
lines.pop();
const rows = lines.length;
const columns = lines[0].length;
const countXmas = (line: string): number => {
	return line.matchAll(/XMAS/g).reduce((acc) => acc += 1, 0);
};
const sumFromLine = (
	startingPoint: [number, number],
	direction: [number, number],
): number => {
	let line = "";
	let iterator = new LineIterator(startingPoint, direction);
	let state = iterator.next();
	while (!state.done) {
		const [row, column] = state.value;
		line += lines[row][column];
		state = iterator.next();
	}
	return countXmas(line);
};
const isInbounds = ([row, column]: [number, number]): boolean => {
	if (row < 0 || row >= rows || column < 0 || column >= columns) {
		return false;
	}
	return true;
};
const applyDelta = (
	position: [number, number],
	delta: [number, number],
): [number, number] => {
	return [position[0] + delta[0], position[1] + delta[1]];
};
class LineIterator implements
	Iterator<
		[number, number]
	> {
	private done = false;
	position: [number, number];
	direction: [number, number];
	constructor(startingPoint: [number, number], direction: [number, number]) {
		this.position = startingPoint;
		this.direction = direction;
	}
	next(...[_value]: [] | [unknown]): IteratorResult<[number, number], unknown> {
		this.position = applyDelta(this.position, this.direction);
		if (!isInbounds(this.position)) {
			this.done = true;
		}
		return { done: this.done, value: this.position };
	}
	return?(_value?: unknown): IteratorResult<[number, number], unknown> {
		this.done = true;
		return { done: true, value: undefined };
	}
	throw?(_e?: unknown): IteratorResult<[number, number], unknown> {
		this.done = true;
		return { done: true, value: undefined };
	}
}

const createEdges = (
	arr: Array<Array<unknown>> | Array<string>,
): Set<[number, number]> => {
	const edges = new Set<[number, number]>();
	const rows = arr.length;
	const columns = arr[0].length;
	for (let i = -1; i <= rows; i++) {
		edges.add([i, -1]);
		edges.add([i, columns]);
	}
	for (let j = 0; j <= columns - 1; j++) {
		edges.add([-1, j]);
		edges.add([rows, j]);
	}
	return edges;
};

const edges = createEdges(lines);

const directions: Array<[number, number]> = [
	[1, 1],
	[0, 1],
	[-1, 1],
	[1, 0],
	[-1, 0],
	[1, -1],
	[0, -1],
	[-1, -1],
];
let sum = 0;
for (const edge of edges) {
	for (const direction of directions) {
		sum += sumFromLine(edge, direction);
	}
}
console.log(sum);

let xmasCount = 0;
for (let row = 1; row < rows - 1; row++) {
	for (let column = 1; column < columns - 1; column++) {
		if (lines[row][column] == "A") {
			const nw = lines[row - 1][column - 1];
			const ne = lines[row - 1][column + 1];
			const sw = lines[row + 1][column - 1];
			const se = lines[row + 1][column + 1];
			if (
				(nw == "S" && ne == "S" && sw == "M" && se == "M") ||
				(nw == "S" && ne == "M" && sw == "S" && se == "M") ||
				(nw == "M" && ne == "M" && sw == "S" && se == "S") ||
				(nw == "M" && ne == "S" && sw == "M" && se == "S")
			) {
				xmasCount++;
			}
		}
	}
}
console.log(xmasCount);
