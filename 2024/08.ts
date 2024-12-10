const text = Deno.readTextFileSync("input.txt");
const lines = text.split("\r\n");
let index = 0;
let line = lines[index];
const city = new Array<Array<string>>();
while (line != "") {
	city.push(line.split(""));
	index++;
	line = lines[index];
}

const antennasMap = new Map<string, Array<[number, number]>>();

for (const [rowIndex, row] of city.entries()) {
	for (const [columnIndex, column] of row.entries()) {
		if (column != ".") {
			if (!antennasMap.has(column)) {
				antennasMap.set(column, new Array(0));
			}
			const antennas = antennasMap.get(column);
			antennas!.push([rowIndex, columnIndex]);
		}
	}
}

const rows = city.length;
const columns = city[0].length;
const isInbounds = ([row, column]: [number, number]): boolean => {
	return !(row < 0 || row >= rows || column < 0 || column >= columns);
};

let uniqueSum = 0;
let uniqueSum2 = 0;
const antinodeMap = Array.from(
	{ length: city.length },
	() => new Array(city[0].length).fill(false),
);
const antinodeMap2 = Array.from(
	{ length: city.length },
	() => new Array(city[0].length).fill(false),
);
for (const entry of antennasMap.entries()) {
	console.log(entry[0]);
	//const _type = entry[0];
	const antennas = entry[1];
	for (let i = 0; i < antennas.length; i++) {
		for (let j = i + 1; j < antennas.length; j++) {
			const [r1, c1] = antennas[i];
			const [r2, c2] = antennas[j];
			const [rd, cd] = [r1 - r2, c1 - c2];
			const interferences = new Array<[number, number]>();
			const np1: [number, number] = [r1 - rd, c1 - cd];
			const np2: [number, number] = [r1 + rd, c1 + cd];
			const np3: [number, number] = [r2 - rd, c2 - cd];
			const np4: [number, number] = [r2 + rd, c2 + cd];
			interferences.push(np1);
			interferences.push(np2);
			interferences.push(np3);
			interferences.push(np4);
			//console.log(interferences);
			for (const position of interferences) {
				//if (isInbounds(position) && city[position[0]][position[1]] == ".") {
				if (
					isInbounds(position) && city[position[0]][position[1]] != entry[0]
				) {
					//city[position[0]][position[1]] = "#";
					//console.log(position);
					uniqueSum++;
					antinodeMap[position[0]][position[1]] = true;
				}
			}
			let np: [number, number] = [r1, c1];
			while (isInbounds(np)) {
				//console.log(np)
				//if (city[np[0]][np[1]] != entry[0]) {
					antinodeMap2[np[0]][np[1]] = true;
				//}
				np = [np[0] + rd, np[1] + cd];
			}
			np = [r1, c1];
			while (isInbounds(np)) {
				//console.log(np)
				//if (city[np[0]][np[1]] != entry[0]) {
					antinodeMap2[np[0]][np[1]] = true;
				//}
				np = [np[0] - rd, np[1] - cd];
			}
		}
	}
	//console.log(uniqueSum);
	//uniqueSum2 += antinodeMap.flat().reduce((a, c) => a += c ? 1 : 0);
	//console.log(uniqueSum2);
}

let hashSum = 0;
for (const [rowIndex, row] of city.entries()) {
	console.log(row.join(""));
	for (const [columnIndex, column] of row.entries()) {
		if (column == "#") {
			hashSum++;
		}
	}
}
console.log(hashSum);
console.log(uniqueSum);
//console.log(uniqueSum2);
console.log(antinodeMap.flat().reduce((a, c) => a += c ? 1 : 0));
console.log(antinodeMap2.flat().reduce((a, c) => a += c ? 1 : 0));
//console.log(antinodeMap2.map(r => r.reduce((a,c) => a += c, 0)));
// low: 277, 294
// high: 2336
