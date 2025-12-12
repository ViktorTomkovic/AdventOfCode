use std::collections::{HashMap, VecDeque};
use std::fs::File;
use std::io::{self, BufRead, Write};
use std::path::Path;
use std::str::from_utf8;

pub fn main() -> io::Result<()> {
    let input = "11a";
    let _ = parts(input);

    println!("Hello, World!");
    Ok(())
}

fn parts(input: &str) -> io::Result<()> {
    let file = File::open(Path::new("./data/").join(input).with_added_extension("in"))?;
    let reader = io::BufReader::new(file);

    let mut name_to_index: HashMap<String, usize> = HashMap::new();
    let mut adjencency: HashMap<String, Vec<String>> = HashMap::new();

    let mut index = 0;

    let lines = reader.lines();
    for line in lines {
        let line = line?;
        if line.is_empty() {
            continue;
        }
        let bytes = line.as_bytes();
        let node_name = &bytes[0..3];
        let neigh_names = &bytes[5..bytes.len()];
        let neighs: Vec<&[u8]> = neigh_names
            .split(|&b| b == b' ')
            .map(|g| g.trim_ascii())
            .collect();
        // println!("{:?} -> {{ {:?} }}", node_name, neighs);

        let node_string = String::from(from_utf8(node_name).expect("fefe"));
        name_to_index.insert(node_string.clone(), index);
        index += 1;

        let neighs_string = neighs
            .iter()
            .map(|b| String::from(from_utf8(b).expect("eeee")))
            .collect();
        adjencency.insert(node_string.clone(), neighs_string);
    }
    let out_name = String::from("you");
    if !name_to_index.contains_key(&out_name) {
        name_to_index.insert(out_name, index);
        index += 1;
    }
    let out_name = String::from("out");
    if !name_to_index.contains_key(&out_name) {
        name_to_index.insert(out_name, index);
        index += 1;
    }
    println!("{index}");

    let n = name_to_index.len();
    let mut neighbors = vec![Vec::new(); n];

    for (e, adj) in &adjencency {
        let ei = name_to_index.get(e).unwrap();
        for v in adj {
            let vi = name_to_index.get(v).unwrap();
            neighbors[*ei].push(*vi);
        }
    }

    let you = *name_to_index.get(&String::from("you")).unwrap();
    let out = *name_to_index.get(&String::from("out")).unwrap();
    let paths_part1 = kahn_algorithm(you, out, &neighbors);
    println!("{paths_part1}");
    let svr = *name_to_index.get(&String::from("svr")).unwrap();
    let fft = *name_to_index.get(&String::from("fft")).unwrap();
    let dac = *name_to_index.get(&String::from("dac")).unwrap();
    let paths_svr_fft = kahn_algorithm(svr, fft, &neighbors);
    let paths_fft_dac = kahn_algorithm(fft, dac, &neighbors);
    let paths_dac_out = kahn_algorithm(dac, out, &neighbors);
    println!("{}", paths_svr_fft * paths_fft_dac * paths_dac_out);

    // write_dot(input, &adjencency)?;
    Ok(())
}

fn kahn_algorithm(source: usize, sink: usize, neighbors: &Vec<Vec<usize>>) -> u64 {
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

fn write_dot(input: &str, adjencency: &HashMap<String, Vec<String>>) -> io::Result<()> {
    let dot_file = File::create(
        Path::new("./output/")
            .join(input)
            .with_added_extension("dot"),
    )?;
    let mut writer = io::LineWriter::new(dot_file);
    writer.write_all(b"digraph AOC25d11 {\n")?;
    writer.write_all(b"graph [fontname = \"DejaVu Sans Mono\"];\n")?;
    writer.write_all(b"node [fontname = \"DejaVu Sans Mono\"];\n")?;
    writer.write_all(b"edge [fontname = \"DejaVu Sans Mono\"];\n")?;
    for (key, value) in adjencency.iter() {
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
