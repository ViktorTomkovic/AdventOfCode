//import * as _pq  from 'npm:@datastructures-js/priority-queue@5.4.0';
//import { Deque } from 'npm:@datastructures-js/deque@1.0.4';
import { Deque } from "@datastructures-js/deque";
import { GeneralMap } from "./generalMap.ts";
const inputName = Deno.args[0] ?? "21.in";
const text = Deno.readTextFileSync(inputName);
let lines = text.split(/\r?\n/);
let index = 0;
let line = lines[index];
const charInput = new Array<Array<string>>();
while (line != "") {
  charInput.push(line.split(""));
  index++;
  line = lines[index];
}
lines = lines.filter((line) => line != "");
console.log(lines);

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

const enum Keypad1Key {
  K7, // 0
  K8, // 1
  K9, // 2
  K4, // 3
  K5, // 4
  K6, // 5
  K1, // 6
  K2, // 7
  K3, // 8
  K0, // 9
  KA, // 0
}

const enum Keypad2Key {
  KUp,
  KA,
  KLeft,
  KDown,
  KRight,
}

type Keypad1Vertex = Keypad1Key;
interface IFromToEdgeWithLabel<TVertex, TLabel> extends IFromToEdge<TVertex> {
  label: TLabel;
}
interface Keypad1Edge extends IFromToEdgeWithLabel<Keypad1Key, Keypad2Key> {
}

type Keypad2Vertex = Keypad2Key;
interface Keypad2Edge extends IFromToEdgeWithLabel<Keypad2Key, Keypad2Key> {
}

const keypad2KeyToChar = (key: Keypad2Key): string => {
  switch (key) {
    case Keypad2Key.KUp:
      return "^";
    case Keypad2Key.KDown:
      return "v";
    case Keypad2Key.KLeft:
      return "<";
    case Keypad2Key.KRight:
      return ">";
    case Keypad2Key.KA:
      return "A";
    default:
      return "?";
  }
};
const keypad1VertexToHash = (key: Keypad1Vertex): number => key;
const keypad2VertexToHash = (key: Keypad2Vertex): number => key;
class GeneralMapHashFn<TKey, TValue, THash>
  extends GeneralMap<TKey, TValue, THash> {
  constructor(private hashFunction: (key: TKey) => THash) {
    super();
  }
  override keyToHash(element: TKey): THash {
    return this.hashFunction(element);
  }
}
interface IFromToEdge<TVertex> {
  from: TVertex;
  to: TVertex;
}
class Graph<TVertex, TEdge extends IFromToEdge<TVertex>, THash> {
  edgesFromVertex: GeneralMap<TVertex, Array<TEdge>, THash>;
  constructor(
    public vertices: Array<TVertex>,
    public edges: Array<TEdge>,
    public toHash: (vertex: TVertex) => THash,
  ) {
    this.edgesFromVertex = new GeneralMapHashFn<
      TVertex,
      Array<TEdge>,
      THash
    >(toHash);
    for (const vertex of vertices) {
      this.edgesFromVertex.set(vertex, new Array<TEdge>());
    }
    for (const edge of edges) this.edgesFromVertex.get(edge.from)!.push(edge);
  }
}
//{{{
interface BFSQueueItem<TVertex, TEdge extends IFromToEdge<TVertex>> {
  edge: TEdge;
  cost: number;
}
interface BFSQueueItemWithPath<TVertex, TEdge extends IFromToEdge<TVertex>> {
  edge: TEdge;
  cost: number;
  path: Array<TEdge>;
}
type ShortestPath<TEdge> = Array<TEdge>;
const getShortestPath = <TVertex, TEdge extends IFromToEdge<TVertex>, THash>(
  graph: Graph<TVertex, TEdge, THash>,
  start: TVertex,
  end: TVertex,
): ShortestPath<TEdge> => {
  let result = new Array(0);
  const queue = new Deque<BFSQueueItemWithPath<TVertex, TEdge>>();
  for (const startingEdge of graph.edgesFromVertex.get(start)!) {
    queue.pushBack({
      edge: startingEdge,
      cost: 0,
      path: new Array(1).fill(startingEdge),
    });
  }
  const visitedVertices = new GeneralMapHashFn(graph.toHash);
  visitedVertices.set(start, true);
  while (!queue.isEmpty()) {
    const currentEdge = queue.popFront();
    if (visitedVertices.has(currentEdge.edge.to)) {
      continue;
    }
    visitedVertices.set(currentEdge.edge.to, true);
    if (graph.toHash(currentEdge.edge.to) == graph.toHash(end)) {
      result = currentEdge.path;
      break;
    }
    for (const neighbor of graph.edgesFromVertex.get(currentEdge.edge.to)!) {
      if (!visitedVertices.has(neighbor.to)) {
        const path = Array.from(currentEdge.path);
        path.push(neighbor);
        queue.pushBack({
          edge: neighbor,
          cost: currentEdge.cost + 1,
          path: path,
        });
      }
    }
  }
  return result;
};
//}}}
const vertexPairHash16 = <TVertex>([from, to]: [TVertex, TVertex]): number =>
  (Number(from) * 16) + Number(to);
const getAllShortestPaths = <
  TVertex,
  TEdge extends IFromToEdge<TVertex>,
  THash,
>(
  graph: Graph<TVertex, TEdge, THash>,
  start: TVertex,
  end: TVertex,
): Array<ShortestPath<TEdge>> => {
  const pathsFound = new Array<ShortestPath<TEdge>>(0);
  let currentShortestPath = Number.MAX_SAFE_INTEGER;
  const visitedVertices = new GeneralMapHashFn(graph.toHash);
  //visitedVertices.set(start, true);
  const dfs = (
    currentVertex: TVertex,
    currentPath: ShortestPath<TEdge>,
  ) => {
    //console.log(currentVertex, currentPath);
    if (
      currentPath.length > currentShortestPath ||
      (visitedVertices.has(currentVertex) && visitedVertices.get(currentVertex))
    ) {
      return;
    }
    if (graph.toHash(currentVertex) == graph.toHash(end)) {
      if (currentPath.length < currentShortestPath) {
        currentShortestPath = currentPath.length;
      }
      pathsFound.push(currentPath);
      return;
    }
    visitedVertices.set(currentVertex, true);
    for (const neighbor of graph.edgesFromVertex.get(currentVertex)!) {
      const newPath = Array.from(currentPath);
      newPath.push(neighbor);
      dfs(neighbor.to, newPath);
    }
    visitedVertices.set(currentVertex, false);
  };
  dfs(start, []);
  return pathsFound.filter((path) => path.length == currentShortestPath);
};

const getAllShortestPathsInGraph = <
  TVertex,
  TEdge extends IFromToEdge<TVertex>,
  THash,
>(
  graph: Graph<TVertex, TEdge, THash>,
): GeneralMapHashFn<[TVertex, TVertex], Array<ShortestPath<TEdge>>, number> => {
  const result = new GeneralMapHashFn<
    [TVertex, TVertex],
    Array<ShortestPath<TEdge>>,
    number
  >(
    vertexPairHash16,
  );
  for (const from of graph.vertices) {
    for (const to of graph.vertices) {
      result.set([from, to], getAllShortestPaths(graph, from, to));
    }
  }
  return result;
};

//{{{
const edgesKeypad1 = new Array<Keypad1Edge>();
// K0
edgesKeypad1.push({
  label: Keypad2Key.KRight,
  from: Keypad1Key.K0,
  to: Keypad1Key.KA,
});
edgesKeypad1.push({
  label: Keypad2Key.KUp,
  from: Keypad1Key.K0,
  to: Keypad1Key.K2,
});
// KA
edgesKeypad1.push({
  label: Keypad2Key.KLeft,
  from: Keypad1Key.KA,
  to: Keypad1Key.K0,
});
edgesKeypad1.push({
  label: Keypad2Key.KUp,
  from: Keypad1Key.KA,
  to: Keypad1Key.K3,
});
// K3
edgesKeypad1.push({
  label: Keypad2Key.KLeft,
  from: Keypad1Key.K3,
  to: Keypad1Key.K2,
});
edgesKeypad1.push({
  label: Keypad2Key.KUp,
  from: Keypad1Key.K3,
  to: Keypad1Key.K6,
});
edgesKeypad1.push({
  label: Keypad2Key.KDown,
  from: Keypad1Key.K3,
  to: Keypad1Key.KA,
});
// K2
edgesKeypad1.push({
  label: Keypad2Key.KLeft,
  from: Keypad1Key.K2,
  to: Keypad1Key.K1,
});
edgesKeypad1.push({
  label: Keypad2Key.KUp,
  from: Keypad1Key.K2,
  to: Keypad1Key.K5,
});
edgesKeypad1.push({
  label: Keypad2Key.KRight,
  from: Keypad1Key.K2,
  to: Keypad1Key.K3,
});
edgesKeypad1.push({
  label: Keypad2Key.KDown,
  from: Keypad1Key.K2,
  to: Keypad1Key.K0,
});
// K1
edgesKeypad1.push({
  label: Keypad2Key.KUp,
  from: Keypad1Key.K1,
  to: Keypad1Key.K4,
});
edgesKeypad1.push({
  label: Keypad2Key.KRight,
  from: Keypad1Key.K1,
  to: Keypad1Key.K2,
});
// K4
edgesKeypad1.push({
  label: Keypad2Key.KUp,
  from: Keypad1Key.K4,
  to: Keypad1Key.K7,
});
edgesKeypad1.push({
  label: Keypad2Key.KRight,
  from: Keypad1Key.K4,
  to: Keypad1Key.K5,
});
edgesKeypad1.push({
  label: Keypad2Key.KDown,
  from: Keypad1Key.K4,
  to: Keypad1Key.K1,
});
// K5
edgesKeypad1.push({
  label: Keypad2Key.KLeft,
  from: Keypad1Key.K5,
  to: Keypad1Key.K4,
});
edgesKeypad1.push({
  label: Keypad2Key.KUp,
  from: Keypad1Key.K5,
  to: Keypad1Key.K8,
});
edgesKeypad1.push({
  label: Keypad2Key.KRight,
  from: Keypad1Key.K5,
  to: Keypad1Key.K6,
});
edgesKeypad1.push({
  label: Keypad2Key.KDown,
  from: Keypad1Key.K5,
  to: Keypad1Key.K2,
});
// K6
edgesKeypad1.push({
  label: Keypad2Key.KLeft,
  from: Keypad1Key.K6,
  to: Keypad1Key.K5,
});
edgesKeypad1.push({
  label: Keypad2Key.KUp,
  from: Keypad1Key.K6,
  to: Keypad1Key.K9,
});
edgesKeypad1.push({
  label: Keypad2Key.KDown,
  from: Keypad1Key.K6,
  to: Keypad1Key.K3,
});
// K9
edgesKeypad1.push({
  label: Keypad2Key.KLeft,
  from: Keypad1Key.K9,
  to: Keypad1Key.K8,
});
edgesKeypad1.push({
  label: Keypad2Key.KDown,
  from: Keypad1Key.K9,
  to: Keypad1Key.K6,
});
// K8
edgesKeypad1.push({
  label: Keypad2Key.KLeft,
  from: Keypad1Key.K8,
  to: Keypad1Key.K7,
});
edgesKeypad1.push({
  label: Keypad2Key.KRight,
  from: Keypad1Key.K8,
  to: Keypad1Key.K9,
});
edgesKeypad1.push({
  label: Keypad2Key.KDown,
  from: Keypad1Key.K8,
  to: Keypad1Key.K5,
});
// K7
edgesKeypad1.push({
  label: Keypad2Key.KRight,
  from: Keypad1Key.K7,
  to: Keypad1Key.K8,
});
edgesKeypad1.push({
  label: Keypad2Key.KDown,
  from: Keypad1Key.K7,
  to: Keypad1Key.K4,
});

const edgesKeypad2 = new Array<Keypad2Edge>();
// KA
edgesKeypad2.push({
  label: Keypad2Key.KDown,
  from: Keypad2Key.KA,
  to: Keypad2Key.KRight,
});
edgesKeypad2.push({
  label: Keypad2Key.KLeft,
  from: Keypad2Key.KA,
  to: Keypad2Key.KUp,
});
// KUp
edgesKeypad2.push({
  label: Keypad2Key.KDown,
  from: Keypad2Key.KUp,
  to: Keypad2Key.KDown,
});
edgesKeypad2.push({
  label: Keypad2Key.KRight,
  from: Keypad2Key.KUp,
  to: Keypad2Key.KA,
});
// KLeft
edgesKeypad2.push({
  label: Keypad2Key.KRight,
  from: Keypad2Key.KLeft,
  to: Keypad2Key.KDown,
});
// KRight
edgesKeypad2.push({
  label: Keypad2Key.KUp,
  from: Keypad2Key.KRight,
  to: Keypad2Key.KA,
});
edgesKeypad2.push({
  label: Keypad2Key.KLeft,
  from: Keypad2Key.KRight,
  to: Keypad2Key.KDown,
});
// KDown
edgesKeypad2.push({
  label: Keypad2Key.KUp,
  from: Keypad2Key.KDown,
  to: Keypad2Key.KUp,
});
edgesKeypad2.push({
  label: Keypad2Key.KRight,
  from: Keypad2Key.KDown,
  to: Keypad2Key.KRight,
});
edgesKeypad2.push({
  label: Keypad2Key.KLeft,
  from: Keypad2Key.KDown,
  to: Keypad2Key.KLeft,
});
//}}}
const keypad1fromLetter: Map<string, Keypad1Key> = new Map<
  string,
  Keypad1Key
>();
keypad1fromLetter.set("0", Keypad1Key.K0);
keypad1fromLetter.set("1", Keypad1Key.K1);
keypad1fromLetter.set("2", Keypad1Key.K2);
keypad1fromLetter.set("3", Keypad1Key.K3);
keypad1fromLetter.set("4", Keypad1Key.K4);
keypad1fromLetter.set("5", Keypad1Key.K5);
keypad1fromLetter.set("6", Keypad1Key.K6);
keypad1fromLetter.set("7", Keypad1Key.K7);
keypad1fromLetter.set("8", Keypad1Key.K8);
keypad1fromLetter.set("9", Keypad1Key.K9);
keypad1fromLetter.set("A", Keypad1Key.KA);

const keypad1vertices = [
  Keypad1Key.K0,
  Keypad1Key.K1,
  Keypad1Key.K2,
  Keypad1Key.K3,
  Keypad1Key.K4,
  Keypad1Key.K5,
  Keypad1Key.K6,
  Keypad1Key.K7,
  Keypad1Key.K8,
  Keypad1Key.K9,
  Keypad1Key.KA,
];

const keypad2vertices = [
  Keypad2Key.KA,
  Keypad2Key.KRight,
  Keypad2Key.KDown,
  Keypad2Key.KLeft,
  Keypad2Key.KUp,
];

const keypad1graph = new Graph(
  keypad1vertices,
  edgesKeypad1,
  keypad1VertexToHash,
);
const keypad2graph = new Graph(
  keypad2vertices,
  edgesKeypad2,
  keypad2VertexToHash,
);
const shortest1 = getAllShortestPathsInGraph(keypad1graph);
const shortest2 = getAllShortestPathsInGraph(keypad2graph);

function shortestPathLength(
  currentVertex: Keypad1Key,
  nextVertex: Keypad1Key,
  interferingKeypads: number,
): bigint {
  if (interferingKeypads == 0) {
    const shortestPaths = shortest1.get([currentVertex, nextVertex])!;
    return shortestPaths.length > 0 ? BigInt(shortestPaths[0].length) + 1n : 0n;
  }
  let currentShortest = 2n ** 64n;
  for (
    const shortPathOnKeypad1 of shortest1.get([currentVertex, nextVertex])!
  ) {
    const path = shortPathOnKeypad1.map((edge) => edge.label);
    path.push(Keypad2Key.KA);
    const shortest = shortestInterference(path, interferingKeypads);
    if (shortest < currentShortest) {
      currentShortest = shortest;
    }
  }
  return currentShortest;
}

const shortestInterference = (
  path: Array<Keypad2Key>,
  interferingKeypads: number,
): bigint => {
  if (interferingKeypads == 0) {
    return BigInt(path.length);
  }
  let result = 0n;
  let currentVertex = Keypad2Key.KA;
  for (const nextVertex of path) {
    result += shortestDirPad(currentVertex, nextVertex, interferingKeypads);
    currentVertex = nextVertex;
  }
  return result;
};

const toMemoHash = (
  [from, to]: [Keypad2Key, Keypad2Key],
  interferingKeypads: number,
) => interferingKeypads * (8 ** 2) + from * (8 ** 1) + to * (8 ** 0);
const memoizationMap = new Map<number, bigint>();

const shortestDirPad = (
  currentVertex: Keypad2Key,
  nextVertex: Keypad2Key,
  interferingKeypads: number,
): bigint => {
  const hash = toMemoHash([currentVertex, nextVertex], interferingKeypads);
  if (memoizationMap.has(hash)) {
    return memoizationMap.get(hash)!;
  }
  let minKeypresses = 2n ** 64n;
  for (const shortPathOnDirPad of shortest2.get([currentVertex, nextVertex])!) {
    const path = shortPathOnDirPad.map((edge) => edge.label);
    path.push(Keypad2Key.KA);
    const pathLength = shortestInterference(
			path,
      interferingKeypads - 1,
    );
    if (pathLength < minKeypresses) {
      minKeypresses = pathLength;
    }
  }
	memoizationMap.set(hash, minKeypresses);
  return minKeypresses;
};

const solve = (interferingKeypads: number) => {
	let totalSum: bigint = 0n;
  for (const line of lines) {
    const letters = line.split("");
    const num = BigInt(line.slice(0, line.length - 1));
    let currentVertex = Keypad1Key.KA;
    let sumOfLengths = 0n;
    for (const letter of letters) {
      const nextVertex: Keypad1Key = keypad1fromLetter.get(letter)!;
      sumOfLengths += shortestPathLength(
        currentVertex,
        nextVertex,
        interferingKeypads,
      );
      //console.log(num, letter, currentVertex, nextVertex, sumOfLengths);
      currentVertex = nextVertex;
    }
    console.log(line, sumOfLengths, num, num * sumOfLengths);
		totalSum += num * sumOfLengths;
  }
	console.log(totalSum);
};
solve(2);
solve(25);
