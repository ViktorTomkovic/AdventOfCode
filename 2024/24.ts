//import * as _pq  from 'npm:@datastructures-js/priority-queue@5.4.0';

import { Deque } from "@datastructures-js/deque";
import { GeneralMap, GeneralMapHashFn } from "./generalMap.ts";

//import { Deque } from 'npm:@datastructures-js/deque@1.0.4';
const inputName = Deno.args[0] ?? "24.in";
const text = Deno.readTextFileSync(inputName);
const lines = text.split(/\r?\n/);

//{{{
const to3digits = (n: number): string => ("000" + n).slice(-3);

interface IFromToEdge<TVertex> {
  from: TVertex;
  to: TVertex;
}
interface IFromToEdgeWithLabel<TVertex, TLabel> extends IFromToEdge<TVertex> {
  label: TLabel;
}
class DirectedGraph<TVertex, TEdge extends IFromToEdge<TVertex>, THash> {
  edgesFromVertex: GeneralMap<TVertex, Array<TEdge>, THash>;
  edgesToVertex: GeneralMap<TVertex, Array<TEdge>, THash>;
  neighbors: GeneralMap<TVertex, Array<TVertex>, THash>;
  constructor(
    public vertices: Array<TVertex>,
    public edges: Array<TEdge>,
    public toHash: (vertex: TVertex) => THash,
  ) {
    this.neighbors = new GeneralMapHashFn<
      TVertex,
      Array<TVertex>,
      THash
    >(toHash);
    this.edgesFromVertex = new GeneralMapHashFn<
      TVertex,
      Array<TEdge>,
      THash
    >(toHash);
    this.edgesToVertex = new GeneralMapHashFn<
      TVertex,
      Array<TEdge>,
      THash
    >(toHash);
    for (const vertex of vertices) {
      this.edgesFromVertex.set(vertex, new Array<TEdge>());
      this.edgesToVertex.set(vertex, new Array<TEdge>());
      this.neighbors.set(vertex, new Array<TVertex>());
    }
    for (const edge of edges) {
      this.edgesFromVertex.get(edge.from)!.push(edge);
      this.edgesToVertex.get(edge.to)!.push(edge);
      this.neighbors.get(edge.from)!.push(edge.to);
    }
  }
  addVertex(v: TVertex): boolean {
    for (const vertex of this.vertices) {
      if (this.toHash(v) == this.toHash(vertex)) {
        return false;
      }
    }
    this.vertices.push(v);
    this.edgesFromVertex.set(v, new Array<TEdge>());
    this.edgesToVertex.set(v, new Array<TEdge>());
    this.neighbors.set(v, new Array<TVertex>());
    return true;
  }
  addEdge(e: TEdge) {
    const fromAdded = this.addVertex(e.from);
    // console.log(fromAdded, e);
    const toAdded = this.addVertex(e.to);
    if (
      this.edges.some(
        (edge) =>
          this.toHash(e.from) == this.toHash(edge.from) &&
          this.toHash(e.to) == this.toHash(edge.to),
      )
    ) {
    }
    this.edges.push(e);
    if (fromAdded) {
      this.edgesFromVertex.set(e.from, new Array<TEdge>());
      this.edgesToVertex.set(e.from, new Array<TEdge>());
      this.neighbors.set(e.from, new Array<TVertex>());
    }
    this.edgesFromVertex.get(e.from)!.push(e);
    this.neighbors.get(e.from)!.push(e.to);
    if (toAdded) {
      this.edgesFromVertex.set(e.to, new Array<TEdge>());
      this.edgesToVertex.set(e.to, new Array<TEdge>());
      this.neighbors.set(e.to, new Array<TVertex>());
    }
    this.edgesToVertex.get(e.to)!.push(e);
  }
}

//}}}

const START = "@start";
const END = "@end";
const graph = new DirectedGraph<
  string,
  IFromToEdgeWithLabel<string, boolean | undefined>,
  string
>([], [], (s) => s);
graph.addVertex(START);
const startingVertices: string[] = [];
let index = 0;
let line = lines[index];
while (line != "") {
  const [label, value] = line.split(": ");
  graph.addEdge({ from: START, to: label, label: Boolean(Number(value)) });
  startingVertices.push(label);
  index++;
  line = lines[index];
}
index++;
line = lines[index];
let bitOperatorIndex = 0;
const AND = "&";
const XOR = "^";
const OR = "|";
const operandToPrefix = (s: string) => {
  switch (s) {
    case "AND":
      return AND;
    case "XOR":
      return XOR;
    case "OR":
      return OR;
    default:
      console.log("!!!!", s);
      return "?";
  }
};
let asdf = true;
while (line != "") {
  const [from1, operatorString, from2, _arrow, to] = line.split(" ");
  const operator = operandToPrefix(operatorString) +
    ("_" + from1 + "_" + from2);
  //(from1+":"+from2+":"+to);
  //to3digits(bitOperatorIndex++);
  //if (asdf) {
  //  console.log(graph);
  //}
  graph.addEdge({ from: from1, to: operator, label: undefined });
  //if (asdf) {
  //  console.log(graph);
  //}
  graph.addEdge({ from: from2, to: operator, label: undefined });
  //if (asdf) {
  //  console.log(graph);
  //}
  graph.addEdge({ from: operator, to: to, label: undefined });
  //if (asdf) {
  //  console.log(graph);
  //}
  if (to[0] == "z") {
    graph.addEdge({ from: to, to: END, label: undefined });
  }
  index++;
  line = lines[index];
  asdf = false;
}

const operatorToOutput = (
  s: string,
  a: boolean | undefined,
  b: boolean | undefined,
) => {
  if (a == undefined || b == undefined) {
    return undefined;
  }
  switch (s[0]) {
    case AND:
      return a && b;
    case XOR:
      return a !== b;
    case OR:
      return a || b;
    default:
      console.log("####", s, a, b);
      return true;
  }
};

const isOperator = (s: string) => s[0] == AND || s[0] == XOR || s[0] == OR;

const part1 = (
  graph: DirectedGraph<
    string,
    IFromToEdgeWithLabel<string, boolean | undefined>,
    string
  >,
) => {
  //console.log(graph.edgesFromVertex);
  const visited = new Set<string>();
  const q = new Deque<string>();
  for (const sv of startingVertices) q.pushBack(sv);
  while (!q.isEmpty()) {
    //console.log(q);
    const current = q.popFront();
    if (visited.has(current)) {
      continue;
    }
    const incomingEdges = graph.edgesToVertex.get(current)!;
    const edges = graph.edgesFromVertex.get(current)!;
    if (isOperator(current)) {
      const [a, b] = incomingEdges.map((e) => e.label);
      const result = operatorToOutput(current, a, b);
      if (result == undefined) {
        continue;
      }
      const [edge] = edges;
      edge.label = result;
      graph.edgesToVertex.get(edge.to)!.find((e) => e.to == edge.to)!.label =
        result;
    } else {
      const incomingValue = graph.edgesToVertex.get(current)![0].label;
      for (const outEdge of edges) {
        outEdge.label = incomingValue;
      }
    }
    visited.add(current);
    for (const edge of edges) {
      if (!visited.has(edge.to)) {
        q.pushBack(edge.to);
      }
    }
  }
  //console.log(graph.edgesFromVertex);
  //console.log(graph.vertices.map((v) => { return {
  //  v: v,
  //  to: graph.edgesToVertex.get(v),
  //  from: graph.edgesFromVertex.get(v),
  //}}));
  //console.log(graph.vertices.map((v) => {
  //console.log(v);
  //console.log(
  //  graph.vertices.filter(v => v[0] == "x" || v[0] == "y").map((v) => {
  //    const fromEdges = graph.edgesFromVertex.get(v)!;
  //    if (fromEdges.length > 0) {
  //      return {
  //        v: v,
  //        //val: fromEdges.map(e => { e.to, e.label })
  //			val: fromEdges
  //      };
  //    } else {
  //      return {
  //        v: v,
  //        val: "[]",
  //      };
  //    }
  //  }).toSorted((a, b) => a.v < b.v ? -1 : 1),
  //);
  //console.log(
  //  graph.vertices.filter(v => v[0] == "z").map((v) => {
  //    const fromEdges = graph.edgesToVertex.get(v)!;
  //    if (fromEdges.length > 0) {
  //      return {
  //        v: v,
  //        //val: fromEdges.map(e => { e.to, e.label })
  //			val: fromEdges
  //      };
  //    } else {
  //      return {
  //        v: v,
  //        val: "[]",
  //      };
  //    }
  //  }).toSorted((a, b) => a.v < b.v ? -1 : 1),
  //);
  //console.log(
  //  graph.edges.toSorted((a, b) => a.from < b.from ? -1 : 1),
  //);

  const ends = graph.edgesToVertex.get(END)!.toSorted((a, b) =>
    Number(a.from.slice(1)) - Number(b.from.slice(1))
  ).map((e) => e.label!);
  let result = 0n;
  for (let i = 0; i < ends.length; i++) {
    result += BigInt(ends[i]) << BigInt(i);
  }
  console.log(result);
  console.log(result.toString(2));
  return graph;
};
const outputGraph = part1(graph);

const to2digits = (n: number): string => ("00" + n).slice(-2);
const part2 = (
  graph: DirectedGraph<
    string,
    IFromToEdgeWithLabel<string, boolean | undefined>,
    string
  >,
): string => {
  const result: string[] = [];
  result.push('digraph "AOC24d24" {');
  result.push('graph [fontname = "DejaVu Sans Mono"];');
  result.push('node [fontname = "DejaVu Sans Mono"];');
  result.push('edge [fontname = "DejaVu Sans Mono"];');

  const formattedEdges = graph.edges.filter((e) =>
    e.from[0] != "@" && e.to[0] != "@"
  ).toSorted((e1, e2) => {
    if (e1.from == e2.from) {
      return e1.to < e2.to ? -1 : 1;
    }
    return e1.from < e2.from ? -1 : 1;
  }).map((edge) =>
    '"' + edge.from + '" -> "' + edge.to + '" [label = "' +
    String(Number(edge.label)) + '"]'
  );
  for (let i = 0; i < 45; i++) {
    //result.push('"z' + to2digits(i) + '" -> "e00"');
    result.push('"s' + to2digits(i) + '" -> "x' + to2digits(i) + '"');
    result.push('"s' + to2digits(i) + '" -> "y' + to2digits(i) + '"');
  }
  result.push(...formattedEdges);
  result.push("}");

  return result.join("\n");
  // z10, kmb, tvp, z15, dpg, z25, mmf, vdk
  // dpg,kmb,mmf,tvp,vdk,z10,z15,z25
};
const edgeToDotEdge = <TVertex, TLabel>(
  edge: IFromToEdgeWithLabel<TVertex, TLabel>,
): string => {
  return '"' + edge.from + '" -> "' + edge.to + '" [label = "' +
    String(Number(edge.label)) + '"]';
};
const edgeToDotEdge2 = <TVertex, TLabel>(
  prefix: string,
  edge: IFromToEdgeWithLabel<TVertex, TLabel>,
): string => {
  return '"' + prefix + edge.from + '" -> "' + prefix + edge.to +
    '" [label = "' + String(Number(edge.label)) + '"]';
};
const part22 = (
  graph: DirectedGraph<
    string,
    IFromToEdgeWithLabel<string, boolean | undefined>,
    string
  >,
): string => {
  const result: string[] = [];
  result.push('digraph "AOC24d242" {');
  const endVertices = graph.vertices.filter((v) => v[0] == "z");
  for (const endVertex of endVertices) {
    result.push('subgraph "' + endVertex + '" {');
    const l1 = graph.edgesToVertex.get(endVertex)!;
    const l2: Array<IFromToEdgeWithLabel<string, boolean | undefined>> = [];
    const l3: Array<IFromToEdgeWithLabel<string, boolean | undefined>> = [];
    const l4: Array<IFromToEdgeWithLabel<string, boolean | undefined>> = [];
    const l5: Array<IFromToEdgeWithLabel<string, boolean | undefined>> = [];
    const l6: Array<IFromToEdgeWithLabel<string, boolean | undefined>> = [];
    const l7: Array<IFromToEdgeWithLabel<string, boolean | undefined>> = [];
    const l8: Array<IFromToEdgeWithLabel<string, boolean | undefined>> = [];
    for (const e of l1) {
      l2.push(...graph.edgesToVertex.get(e.from)!);
    }
    for (const e of l2) {
      l3.push(...graph.edgesToVertex.get(e.from)!);
    }
    for (const e of l3) {
      l4.push(...graph.edgesToVertex.get(e.from)!);
    }
    for (const e of l4) {
      l5.push(...graph.edgesToVertex.get(e.from)!);
    }
    for (const e of l5) {
      l6.push(...graph.edgesToVertex.get(e.from)!);
    }
    for (const e of l6) {
      l7.push(...graph.edgesToVertex.get(e.from)!);
    }
    for (const e of l7) {
      l8.push(...graph.edgesToVertex.get(e.from)!);
    }

    result.push(
      ...l1.filter((e) => e.from != "@start").map((e) =>
        edgeToDotEdge2(endVertex + "_", e)
      ),
    );
    result.push(
      ...l2.filter((e) => e.from != "@start").map((e) =>
        edgeToDotEdge2(endVertex + "_", e)
      ),
    );
    result.push(
      ...l3.filter((e) => e.from != "@start").map((e) =>
        edgeToDotEdge2(endVertex + "_", e)
      ),
    );
    result.push(
      ...l4.filter((e) => e.from != "@start").map((e) =>
        edgeToDotEdge2(endVertex + "_", e)
      ),
    );
    result.push(
      ...l5.filter((e) => e.from != "@start").map((e) =>
        edgeToDotEdge2(endVertex + "_", e)
      ),
    );
    result.push(
      ...l6.filter((e) => e.from != "@start").map((e) =>
        edgeToDotEdge2(endVertex + "_", e)
      ),
    );
    result.push(
      ...l7.filter((e) => e.from != "@start").map((e) =>
        edgeToDotEdge2(endVertex + "_", e)
      ),
    );
    result.push(
      ...l8.filter((e) => e.from != "@start").map((e) =>
        edgeToDotEdge2(endVertex + "_", e)
      ),
    );
    result.push("}");
  }
  for (let i = 0; i < 45; i++) {
    result.push('"z' + to2digits(i) + '" -> "e00"');
    //result.push('"s'+to2digits(i)+'" -> "x' + to2digits(i) + '"');
    //result.push('"s'+to2digits(i)+'" -> "y' + to2digits(i) + '"');
  }
  result.push("}");

  return result.join("\n");
  // z10, kmb, tvp, z15, dpg, z25, mmf, vdk
  // dpg,kmb,mmf,tvp,vdk,z10,z15,z25
};
const outFile = part2(outputGraph);
const outFile2 = part22(outputGraph);
Deno.writeFileSync("./24.dot", new TextEncoder().encode(outFile));
Deno.writeFileSync("./24-2.dot", new TextEncoder().encode(outFile2));
