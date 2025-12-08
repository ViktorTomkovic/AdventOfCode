use std::cmp::Reverse;
use std::collections::{BinaryHeap, HashMap, HashSet};
use std::fs::File;
use std::io::{self, BufRead};

pub fn main() -> io::Result<()> {
    let _ = parts();

    println!("Hello, World!");
    Ok(())
}

fn parts() -> io::Result<()> {
    let path_t = "./data/08a.in";
    let edges_no = 1000;
    let file = File::open(path_t)?;
    let reader = io::BufReader::new(file);

    let mut points: Vec<(u64, u64, u64)> = Vec::new();
    for line in reader.lines() {
        let line = line?;
        if line.is_empty() {
            continue;
        }
        let coords: Vec<u64> = line
            .split(",")
            .map(|coord| coord.parse::<u64>().unwrap())
            .collect();
        points.push((coords[0], coords[1], coords[2]));
    }

    let n = points.len();

    let mut distances = BinaryHeap::new();
    for i in 0..n {
        for j in i + 1..n {
            let d = distance(&points[i], &points[j]);
            distances.push((Reverse(d), i, j));
        }
    }

    let mut iteration = 0;
    let mut parents = vec![0usize; n];
    for i in 0..n {
        parents[i] = i;
    }
    let mut ranks = vec![0u64; n];
    let mut last_i = 0;
    let mut last_j = 0;
    while !parents.windows(2).all(|e| e[0] == e[1]) {
        iteration += 1;
        (_, last_i, last_j) = distances.pop().unwrap();
        // println!("{last_i} {last_j}");
        union(last_i, last_j, &mut parents, &mut ranks);
        // println!("{:?}", parents);
        for i in 0..n {
            // flatten for component counting
            find(i, &mut parents);
        }
        if iteration == edges_no {
            // part 1
            let components = parents
                .iter()
                .fold(HashMap::<usize, u64>::new(), |mut c, &parent| {
                    c.entry(parent)
                        .and_modify(|count| *count += 1u64)
                        .or_insert(1u64);
                    c
                });
            let mut cc = components.values().map(|&x| x).collect::<Vec<u64>>();
            // println!("{:?}", cc);
            cc.sort_unstable();
            let mut mult = 1u64;
            for _i in 0..3 {
                mult *= cc.pop().unwrap();
            }

            println!("{mult}");
        }
    }

    // part 2
    println!("{}", points[last_i].0 * points[last_j].0);

    Ok(())
}

fn distance((x1, y1, z1): &(u64, u64, u64), (x2, y2, z2): &(u64, u64, u64)) -> u64 {
    let dx = if x1 < x2 { x2 - x1 } else { x1 - x2 };
    let dy = if y1 < y2 { y2 - y1 } else { y1 - y2 };
    let dz = if z1 < z2 { z2 - z1 } else { z1 - z2 };
    return dx * dx + dy * dy + dz * dz;
}

fn find(v: usize, parents: &mut Vec<usize>) -> usize {
    let mut stack = Vec::new();
    let mut vv = v;
    let mut p = parents[vv];
    while vv != p {
        // println!("{vv} {p}");
        stack.push(vv);
        vv = p;
        p = parents[p];
    }
    for s in stack {
        parents[s] = p;
    }
    p
}

fn union(a: usize, b: usize, parents: &mut Vec<usize>, ranks: &mut Vec<u64>) {
    let pa = find(a, parents);
    let pb = find(b, parents);
    if pa == pb {
        return;
    }
    match ranks[pa].cmp(&ranks[pb]) {
        std::cmp::Ordering::Less => {
            parents[pa] = pb;
        }
        std::cmp::Ordering::Equal => {
            parents[pa] = pb;
            let par = ranks[pa];
            ranks[pb] = par + 1;
        }
        std::cmp::Ordering::Greater => {
            parents[pb] = pa;
        }
    }
}

fn find_old(v: usize, parents: &mut HashMap<usize, usize>) -> usize {
    let mut stack = Vec::new();
    let mut vv = v;
    let mut p = *parents.get(&vv).unwrap();
    while vv != p {
        stack.push(vv);
        vv = p;
        p = *parents.get(&vv).unwrap();
    }
    for s in stack {
        parents.insert(s, p);
    }
    p
}

fn union_old(
    a: usize,
    b: usize,
    parents: &mut HashMap<usize, usize>,
    ranks: &mut HashMap<usize, u64>,
) {
    let pa = find_old(a, parents);
    let pb = find_old(b, parents);
    if pa == pb {
        return;
    }
    match ranks.get(&pa).unwrap().cmp(ranks.get(&pb).unwrap()) {
        std::cmp::Ordering::Less => {
            parents.insert(pa, pb);
        }
        std::cmp::Ordering::Equal => {
            parents.insert(pa, pb);
            let par = *ranks.get(&pa).unwrap();
            ranks.entry(pb).and_modify(|rank| *rank = par + 1);
        }
        std::cmp::Ordering::Greater => {
            parents.insert(pb, pa);
        }
    }
}

#[allow(dead_code)]
fn print_v(points: &Vec<(u64, u64, u64)>, parents: &HashMap<usize, usize>) {
    for k in parents.keys() {
        println!("{k:3}: {:?}", points[*k]);
    }
}

#[allow(dead_code)]
fn parts_old() -> io::Result<()> {
    let path_t = "./data/08a.in";
    let edges_no = 1000;
    let file = File::open(path_t)?;
    let reader = io::BufReader::new(file);

    let mut points: Vec<(u64, u64, u64)> = Vec::new();
    for line in reader.lines() {
        let line = line?;
        if line.is_empty() {
            continue;
        }
        let coords: Vec<u64> = line
            .split(",")
            .map(|coord| coord.parse::<u64>().unwrap())
            .collect();
        points.push((coords[0], coords[1], coords[2]));
    }

    let n = points.len();

    let mut distances = BinaryHeap::new();
    for i in 0..n {
        for j in i + 1..n {
            let d = distance(&points[i], &points[j]);
            distances.push((Reverse(d), i, j));
        }
    }

    let mut edges = Vec::new();
    for _en in 0..edges_no {
        let (_, i, j) = distances.pop().unwrap();
        edges.push((i, j));
    }

    let mut vertices = HashSet::new();
    let mut parents = HashMap::new();
    let mut ranks = HashMap::new();
    for (i, j) in edges.iter() {
        vertices.insert(*i);
        vertices.insert(*j);
    }
    for &v in vertices.iter() {
        // make_set(v);
        parents.insert(v, v);
        ranks.insert(v, 0u64);
    }
    for (i, j) in edges.iter() {
        // union(i,j);
        union_old(*i, *j, &mut parents, &mut ranks);
    }
    let mut components = HashMap::new();
    for v in vertices {
        let pv = find_old(v, &mut parents);
        components
            .entry(pv)
            .and_modify(|count| *count += 1u64)
            .or_insert(1u64);
    }
    // println!("{:?}", parents);
    // println!("{:?}", ranks);
    // println!("{:?}", components);
    // print_v(&points, &parents);

    let mut cc = components.values().map(|&x| x).collect::<Vec<u64>>();
    // println!("{:?}", cc);
    cc.sort_unstable();
    let mut mult = 1u64;
    for _i in 0..3 {
        mult *= cc.pop().unwrap();
    }

    println!("{mult}");

    Ok(())
}
