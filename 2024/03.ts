const text = Deno.readTextFileSync("input.txt");
console.log(text);
const matches = text.matchAll(
	/mul\((?<first>[0-9]{1,3})\,(?<second>[0-9]{1,3})\)/gm,
);
const multiplications = (
	matches: RegExpStringIterator<RegExpExecArray>,
): number => {
	let sum = 0;
	for (const match of matches) {
		//console.log(matchedGroup);
		const matchedGroup = match.groups;
		if (matchedGroup == undefined) {
			continue;
		}
		const first: number = Number(matchedGroup["first"]);
		const second: number = Number(matchedGroup["second"]);
		sum += first * second;
	}
	return sum;
};
console.log(multiplications(matches));
//const stripped = text.replaceAll(/don\'t\(\).*?do\(\)/gm, "").replaceAll(/don\'t\(\).*$/gm, "");
// don\'t\(\)(.|\n)*?do\(\)
// don\'t\(\)(.|\n)*$
const stripped = Deno.readTextFileSync("stripped.txt");
const matches2 = stripped.matchAll(
	/mul\((?<first>[0-9]{1,3})\,(?<second>[0-9]{1,3})\)/gm,
);

console.log(multiplications(matches2));
//matchedGroups.forEach((matchedGroup) => console.log(matchedGroup));
