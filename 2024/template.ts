//import * as _pq  from 'npm:@datastructures-js/priority-queue@5.4.0';
//import { Deque } from 'npm:@datastructures-js/deque@1.0.4';
const inputName = Deno.args[0] ?? "10.in"
const text = Deno.readTextFileSync(inputName);
const lines = text.split(/\r?\n/);
let index = 0;
let line = lines[index];
const charInput = new Array<Array<string>>();
while (line != "") {
	charInput.push(line.split(""));
	index++;
	line = lines[index];
}

for (const [rowIndex, row] of charInput.entries()) {
	for (const [columnIndex, column] of row.entries()) {
		if (column != ".") {
		}
	}
}

const copyArray = Array.from(
	{ length: charInput.length },
	() => new Array(charInput[0].length).fill(false),
);
const rows = charInput.length;
const columns = charInput.length;
const isInbounds = ([row, column]: [number, number]): boolean => {
	return !(row < 0 || row >= rows || column < 0 || column >= columns);
};

