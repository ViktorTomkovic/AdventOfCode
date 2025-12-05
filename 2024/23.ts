//import * as _pq  from 'npm:@datastructures-js/priority-queue@5.4.0';

import { GeneralMap, GeneralMapHashFn } from "./generalMap.ts";

//import { Deque } from 'npm:@datastructures-js/deque@1.0.4';
const inputName = Deno.args[0] ?? "10.in";
const text = Deno.readTextFileSync(inputName);
let lines = text.split(/\r?\n/);
lines = lines.filter((line) => line != "");
let index = 0;
let line = lines[index];
const edges: Array<IFromToEdge<string>> = [];
const vertices: Set<string> = new Set();
while (line != "" && line != undefined) {
  const [from, to] = line.split("-");
  vertices.add(from);
  vertices.add(to);
  edges.push({ from: from, to: to });
  index++;
  line = lines[index];
}

interface IFromToEdge<TVertex> {
  from: TVertex;
  to: TVertex;
}
class UndirectedGraph<TVertex, TEdge extends IFromToEdge<TVertex>, THash> {
  edgesFromVertex: GeneralMap<TVertex, Array<TEdge>, THash>;
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
    for (const vertex of vertices) {
      this.edgesFromVertex.set(vertex, new Array<TEdge>());
      this.neighbors.set(vertex, new Array<TVertex>());
    }
    for (const edge of edges) {
      this.edgesFromVertex.get(edge.from)!.push(edge);
      this.edgesFromVertex.get(edge.to)!.push(edge);
      this.neighbors.get(edge.from)!.push(edge.to);
      this.neighbors.get(edge.to)!.push(edge.from);
    }
  }
}

const toHash = (a: string): string => a;
const lanParty = new UndirectedGraph<string, IFromToEdge<string>, string>(
  vertices.values().toArray(),
  edges,
  toHash,
);
const toHashTriplet = (triplet: string[]): string => {
  return triplet.toSorted().join();
};
//const triplets = new GeneralMapHashFn<string[], boolean, string>(toHashTriplet);

const findAllTriangles = (
  graph: UndirectedGraph<string, IFromToEdge<string>, string>,
  vertex: string,
): GeneralMapHashFn<string[], boolean, string> => {
  const triplets = new GeneralMapHashFn<string[], boolean, string>(
    toHashTriplet,
  );
  const neighborsEdges = graph.edgesFromVertex.get(vertex)!;
  const neighborsSet = new Set<string>();
  for (const neighborEdge of neighborsEdges) {
    if (neighborEdge.from == vertex) {
      neighborsSet.add(neighborEdge.to);
    } else {
      neighborsSet.add(neighborEdge.from);
    }
  }
  const nnMap = new GeneralMapHashFn<string, string[], string>(toHash);
  for (const neighbor of neighborsSet) {
    const neighborsOfNeighborEdges = graph.edgesFromVertex.get(neighbor)!;
    const neighborsOfNeighborSet = new Set<string>();
    for (const neighborOfNeighborEdge of neighborsOfNeighborEdges) {
      if (neighborOfNeighborEdge.from == neighbor) {
        neighborsOfNeighborSet.add(neighborOfNeighborEdge.to);
      } else {
        neighborsOfNeighborSet.add(neighborOfNeighborEdge.from);
      }
    }
    nnMap.set(neighbor, neighborsOfNeighborSet.values().toArray());
  }

  const vertexA = vertex;
  for (const vertexB of neighborsSet) {
    for (const vertexC of nnMap.get(vertexB)!) {
      if (vertexA != vertexB && vertexB != vertexC && vertexC != vertexA) {
        const nOfC = graph.edgesFromVertex.get(vertexC)!;
        for (const e of nOfC) {
          if (e.from == vertexC && e.to == vertexA) {
            triplets.set([vertexA, vertexB, vertexC], true);
          } else if (e.to == vertexC && e.from == vertexA) {
            triplets.set([vertexA, vertexB, vertexC], true);
          }
        }
      }
    }
  }

  return triplets;
};

const part1 = () => {
  const allTriangles = new GeneralMapHashFn<string[], boolean, string>(
    toHashTriplet,
  );
  for (const vertex of vertices) {
    if (vertex[0] == "t") {
      const triplets = findAllTriangles(lanParty, vertex);
      for (const triplet of triplets.keyList()) {
        allTriangles.set(triplet, true);
      }
      //console.log(triplets);
    }
  }
  //console.log(lanParty.vertices.length);
  //console.log(allTriangles);
  console.log(allTriangles.keyList().length);
};

const findMaxClique = <TVertex, THash>(
  graph: UndirectedGraph<TVertex, IFromToEdge<TVertex>, THash>,
): Array<TVertex> => {
  // max clique -> vertices in R when X is Empty
  // P and X are disjoint sets, P union X is joined to every element in R
  // When P and X are both empty -> R is maximal clique (nothing can be added) -> returns R
  const R = new Array<TVertex>(0);
  const P = new Array<TVertex>(0);
  const X = new Array<TVertex>(0);
  // At start R and X are empty and P is vertex set of a graph
  for (const vertex of graph.vertices) P.push(vertex);
	// intersection
  const intersection = (a: TVertex[], b: TVertex[]): TVertex[] => {
    const result: TVertex[] = [];
    for (const va of a) {
      for (const vb of b) {
        if (graph.toHash(va) == graph.toHash(vb)) {
          result.push(va);
          break;
        }
      }
    }
    return result;
  };
  // From Wikipedia https://en.wikipedia.org/wiki/Bron%E2%80%93Kerbosch_algorithm
  const BK1 = (
    R: TVertex[],
    P: TVertex[],
    X: TVertex[],
  ): TVertex[] => {
    //console.log(R.length, P.length, X.length);
    if (P.length == 0 && X.length == 0) {
      return R;
    }
    let maxClique: TVertex[] = [];
		while (P.length > 0) {
			const vertex = P.pop()!;
      const vertexNeighbors = graph.neighbors.get(vertex)!;
      const nR = Array.from(R);
      nR.push(vertex);
      const nP = intersection(P, vertexNeighbors);
      const nX = intersection(X, vertexNeighbors);
      const newClique = BK1(nR, nP, nX);
			if (newClique.length > maxClique.length) {
				maxClique = newClique;
			}
      X.push(vertex);
    }
    return maxClique;
  };
  return BK1(R, P, X);
};
const part2 = () => {
  // const allEdgeSets = lanParty.vertices.reduce((a, c) => {
  //   a.push(lanParty.edgesFromVertex.get(c)!);
  //   return a;
  // }, new Array<Array<IFromToEdge<string>>>(0));
  //console.log(allEdgeSets.length);
  //const lengths = allEdgeSets.map(s => s.length);
  //console.log(Math.max.apply(null, lengths));
  //const frequency = new Array<number>(14).fill(0);
  //lengths.forEach(l => frequency[l]++);
  //console.log(frequency);
  ////for (const vertex of lanParty.vertices.toSorted()) {
  ////	console.log(vertex, lanParty.neighbors.get(vertex)!.toSorted().join("-"));
  ////}
  //const wot = lanParty.vertices.filter(v => v[0] != "t")
  //const c = wot.reduce((a, v) => lanParty.neighbors.get(v)!.some(n => n[0] == "t") ? a + 0 : a + 1, 0);
  //console.log(c, wot.length);
  const maxClique = findMaxClique(lanParty);
  //console.log(maxClique);
  //console.log(maxClique.length);
	console.log(maxClique.toSorted().join(","));
};

part1(); // 1476
console.log("===");
part2(); // ca,dw,fo,if,ji,kg,ks,oe,ov,sb,ud,vr,xr
