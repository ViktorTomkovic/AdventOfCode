const decoder = new TextDecoder("utf-8");
const data = await Deno.readFile("input1.txt");
const text = decoder.decode(data);
const text2 = text.split(/\r\n/);

const a = new Array<number>();
const b = new Array<number>();
const similarity = new Map<number, number>();
for (const line of text2) {
	if (line.length == 0) continue;
	const [first, second] = line.split(/\s+/);
	const fn = Number(first);
	const sn = Number(second);
	a.push(fn);
	b.push(sn);
	if (!similarity.has(fn)) {
		similarity.set(fn, 0);
	}
	if (!similarity.has(sn)) {
		similarity.set(sn, 1);
	} else {
		similarity.set(sn, similarity.get(sn)! + 1);
	}
}
a.sort((a,b) => a - b);
b.sort((a,b) => a - b);

let sum = 0;
let similarityScore = 0;
for (let i = 0; i < a.length; i++) {
	console.log(Math.abs(a[i] - b[i]));
	sum += Math.abs(a[i] - b[i]);
	similarityScore += a[i] * similarity.get(a[i])!;
}

console.log(sum);
console.log(similarityScore);
