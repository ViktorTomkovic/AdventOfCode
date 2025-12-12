use std::collections::{HashMap, VecDeque};
use std::io::{self, Write};
use std::path::Path;

pub fn main() -> io::Result<()> {
    let input = "11a";
    let _ = parts(input);

    println!("Hello, World!");
    Ok(())
}

fn parts(input: &str) -> io::Result<()> {
    // Single allocation: read entire file as one String
    let content =
        std::fs::read_to_string(Path::new("./data/").join(input).with_added_extension("in"))?;

    let mut node_lines: Vec<(&str, Vec<&str>)> = Vec::new();
    let mut all_names_set: std::collections::HashSet<&str> = std::collections::HashSet::new();
    let mut all_names: Vec<&str> = Vec::new();

    for line in content.lines() {
        if line.is_empty() {
            continue;
        }
        let node_name = &line[0..3];
        let neighbors: Vec<&str> = line[5..].split_whitespace().collect();
        if all_names_set.insert(node_name) {
            all_names.push(node_name);
        }
        for &n in &neighbors {
            if all_names_set.insert(n) {
                all_names.push(n);
            }
        }
        node_lines.push((node_name, neighbors));
    }
    for &special in &["you", "out"] {
        if all_names_set.insert(special) {
            all_names.push(special);
        }
    }

    let mut name_to_index: HashMap<&str, usize> = HashMap::new();
    for (i, &s) in all_names.iter().enumerate() {
        name_to_index.insert(s, i);
    }
    let mut adjacency: HashMap<&str, Vec<&str>> = HashMap::new();
    for &(node_name, ref neighbors) in &node_lines {
        adjacency.insert(node_name, neighbors.clone());
    }
    for &special in &["you", "out"] {
        adjacency.entry(special).or_insert_with(Vec::new);
    }
    println!("{}", all_names.len());

    let n = name_to_index.len();
    let mut neighbors = vec![Vec::new(); n];

    for (e, adj) in &adjacency {
        let ei = name_to_index.get(e).unwrap();
        for v in adj {
            let vi = name_to_index.get(v).unwrap();
            neighbors[*ei].push(*vi);
        }
    }

    let you = *name_to_index.get("you").unwrap();
    let out = *name_to_index.get("out").unwrap();
    let paths_part1 = kahn_algorithm(you, out, &neighbors);
    println!("{paths_part1}");
    let svr = *name_to_index.get("svr").unwrap();
    let fft = *name_to_index.get("fft").unwrap();
    let dac = *name_to_index.get("dac").unwrap();
    let paths_svr_fft = kahn_algorithm(svr, fft, &neighbors);
    let paths_fft_dac = kahn_algorithm(fft, dac, &neighbors);
    let paths_dac_out = kahn_algorithm(dac, out, &neighbors);
    println!("{}", paths_svr_fft * paths_fft_dac * paths_dac_out);

    // write_dot(input, &adjacency)?;
    Ok(())
}

fn kahn_algorithm(source: usize, sink: usize, neighbors: &[Vec<usize>]) -> u64 {
    let n = neighbors.len();

    // Kahn's algorithm - used to make topological sorting of vertices.
    // That way we assure that we sum path counts correctly.
    let mut indegrees = vec![0u64; n];
    for e in 0..n {
        for &v in &neighbors[e] {
            indegrees[v] += 1;
        }
    }
    let mut queue = VecDeque::new();
    for i in 0..n {
        if indegrees[i] == 0 {
            queue.push_back(i);
        }
    }
    let mut topo = Vec::with_capacity(n);
    while let Some(u) = queue.pop_front() {
        topo.push(u);
        for &v in &neighbors[u] {
            indegrees[v] -= 1;
            if indegrees[v] == 0 {
                queue.push_back(v);
            }
        }
    }
    assert_eq!(topo.len(), n, "Graph has a cycle! {} {}", topo.len(), n);

    let mut paths = vec![0u64; n];
    paths[source] = 1;

    for &u in &topo {
        let count = paths[u];
        if count == 0 {
            continue;
        }
        for &v in &neighbors[u] {
            // Neighbors of node u will be inspected after the node u because of topological sort.
            paths[v] += count;
        }
    }

    paths[sink]
}

#[allow(dead_code)]
fn write_dot(input: &str, adjacency: &HashMap<&str, Vec<&str>>) -> io::Result<()> {
    let dot_file = std::fs::File::create(
        Path::new("./output/")
            .join(input)
            .with_added_extension("dot"),
    )?;
    let mut writer = io::LineWriter::new(dot_file);
    writer.write_all(b"digraph AOC25d11 {\n")?;
    writer.write_all(b"graph [fontname = \"DejaVu Sans Mono\"];\n")?;
    writer.write_all(b"node [fontname = \"DejaVu Sans Mono\"];\n")?;
    writer.write_all(b"edge [fontname = \"DejaVu Sans Mono\"];\n")?;
    for (key, value) in adjacency.iter() {
        writer.write_all(format!("{:?} -> {{ {} }}\n", *key, value.join(" ")).as_bytes())?;
    }
    writer.write_all(b"\"you\"[style=filled color=green]\n")?;
    writer.write_all(b"\"out\"[style=filled color=red]\n")?;
    writer.write_all(b"\"svr\"[style=filled color=blue]\n")?;
    writer.write_all(b"\"fft\"[style=filled color=yellow]\n")?;
    writer.write_all(b"\"dac\"[style=filled color=cyan]\n")?;

    writer.write_all(b"}\n")?;

    writer.flush()?;
    Ok(())
}
