use std::collections::{HashMap, VecDeque};
use std::io::{self, BufRead, Write};
use std::path::Path;

pub fn main() -> io::Result<()> {
    let input = "11a";
    let _ = parts(input);

    println!("Hello, World!");
    Ok(())
}

fn parts(input: &str) -> io::Result<()> {
    // One-pass streaming: only allocate Strings for new names
    let path = Path::new("./data/").join(input).with_added_extension("in");
    let file = std::fs::File::open(&path)?;
    let reader = std::io::BufReader::new(file);

    let mut name_to_index: HashMap<String, usize> = HashMap::new();
    let mut neighbors: Vec<Vec<usize>> = Vec::new();

    let get_or_create_index =
        |name: &str, map: &mut HashMap<String, usize>, graph: &mut Vec<Vec<usize>>| -> usize {
            if let Some(&idx) = map.get(name) {
                idx
            } else {
                let idx = map.len();
                map.insert(name.to_string(), idx); // Only allocate String if new
                graph.push(Vec::new()); // Add new adjacency list
                idx
            }
        };

    for line in reader.lines() {
        let line = line?;
        if line.is_empty() {
            continue;
        }

        let node_name = &line[0..3];
        let node_idx = get_or_create_index(node_name, &mut name_to_index, &mut neighbors);

        for neighbor in line[5..].split_whitespace() {
            let neighbor_idx = get_or_create_index(neighbor, &mut name_to_index, &mut neighbors);
            neighbors[node_idx].push(neighbor_idx);
        }
    }

    // Ensure special nodes exist
    for special in ["you", "out"] {
        get_or_create_index(special, &mut name_to_index, &mut neighbors);
    }

    println!("{}", name_to_index.len());

    let you = name_to_index["you"];
    let out = name_to_index["out"];
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
fn write_dot(
    input: &str,
    name_to_index: &HashMap<String, usize>,
    neighbors: &[Vec<usize>],
) -> io::Result<()> {
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

    // Create reverse index for lookups
    let mut index_to_name: Vec<&str> = vec![""; name_to_index.len()];
    for (name, &idx) in name_to_index {
        index_to_name[idx] = name;
    }

    for (idx, adj) in neighbors.iter().enumerate() {
        let node_name = index_to_name[idx];
        let neighbor_names: Vec<&str> = adj.iter().map(|&i| index_to_name[i]).collect();
        writer.write_all(
            format!("{:?} -> {{ {} }}\n", node_name, neighbor_names.join(" ")).as_bytes(),
        )?;
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
