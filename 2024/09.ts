const text = Deno.readTextFileSync("input3.txt");
const lines = text.split("\r\n");
const line = lines[0];
const diskCode = line.split("").map((v) => Number(v));
const disk = new Array<number | undefined>();
const enum SpaceType {
	Free,
	Used,
}
//const disk2 = new Map<index: number, [type: SpaceType, length: number]>();
//const disk2 = new Map<number, [SpaceType, number]>();
const disk2 = new Array<[SpaceType, number, number, number]>();
let diskPosition = 0;
let fileIndex = 0;
for (let codeIndex = 0; codeIndex < diskCode.length; codeIndex++) {
	const spaceSize = diskCode[codeIndex];
	const spaceType = ((codeIndex & 1) == 0) ? SpaceType.Used : SpaceType.Free;
	for (let i = 0; i < spaceSize; i++) {
		disk.push(spaceType == SpaceType.Used ? fileIndex : undefined);
	}
	disk2.push([spaceType, spaceSize, fileIndex, diskPosition]);
	diskPosition += spaceSize;
	if (spaceType == SpaceType.Used) {
		fileIndex++;
	}
}

const format = (disk: Array<number | undefined>) => {
	return disk.map((v) => v == undefined ? "." : v.toString()).join("");
};
console.log(format(disk));

let l = 0;
let r = disk.length - 1;
while (disk[l] != undefined) l++;
while (disk[r] == undefined) r--;
do {
	disk[l] = disk[r];
	disk[r] = undefined;
	//console.log(format(disk));
	while (disk[l] != undefined) l++;
	while (disk[r] == undefined) r--;
} while (l < r);
//console.log(format(disk));

const checksum = (disk: Array<number | undefined>): bigint => {
	let sum = 0n;
	for (let i = 0; i < disk.length; i++) {
		if (disk[i] == undefined) {
			continue;
		}
		sum = sum + (BigInt(disk[i]!) * BigInt(i));
	}
	return sum;
};
console.log(checksum(disk));

//console.log(disk2);
const decompose = (
	composed: Array<[SpaceType, number, number, number]>,
): Array<number | undefined> => {
	const result = new Array<number | undefined>();
	for (const [spaceType, chunkSize, fileIndex] of composed) {
		if (spaceType == SpaceType.Used) {
			for (let i = 0; i < chunkSize; i++) result.push(fileIndex);
		} else {
			for (let i = 0; i < chunkSize; i++) result.push(undefined);
		}
	}
	return result;
};
let disk2def = new Array<[SpaceType, number, number, number]>();
for (const a of disk2) disk2def.push(a);

const fineSpace = (file: [SpaceType, number, number, number], maxIndex: number): number => {
	for (let i = 0; i < Math.min(maxIndex, disk2def.length); i++) {
		if (disk2def[i][0] == SpaceType.Free && disk2def[i][1] >= file[1]) {
			return i;
		}
	}
	return -1;
};
for (let j = disk2def.length - 1; j >= 0; j--) {
	//console.log(format(decompose(disk2def)));
	const file = disk2def[j];
	if (file[0] == SpaceType.Used) {
		const index = fineSpace(file, j);
		if (index >= 0) {
			const freeSpace = disk2def[index];
			const newFile: [SpaceType, number, number, number] = [
				file[0],
				file[1],
				file[2],
				freeSpace[3],
			];
			const left = freeSpace[1] - file[1];
			disk2def[index] = newFile;
			if (left > 0) {
				const newLeft: [SpaceType, number, number, number] = [
					freeSpace[0],
					left,
					freeSpace[2],
					freeSpace[3] + file[1],
				];
				disk2def = [
					...disk2def.slice(0, index + 1),
					newLeft,
					...disk2def.slice(index + 1),
				];
				j++;
			}
			disk2def[j][0] = SpaceType.Free;
		}
	}
}
const disk2def2 = decompose(disk2def);
//console.log(format(disk2def2));
console.log(checksum(disk2def2));
