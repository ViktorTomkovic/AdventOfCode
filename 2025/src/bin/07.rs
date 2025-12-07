use std::collections::{HashMap, HashSet};
use std::fs::File;
use std::io::{self, BufRead};

pub fn main() -> io::Result<()> {
    let _ = parts();

    println!("Hello, World!");
    Ok(())
}

fn parts() -> io::Result<()> {
    let path_t = "./data/07a.in";
    let file = File::open(path_t)?;
    let reader = io::BufReader::new(file);

    let mut iterator = reader.lines();
    let first = iterator.next().unwrap()?;
    let mut beams = HashSet::new();
    let mut timelines = HashMap::<usize, u64>::new();
    let start_index = first.find('S').unwrap();
    beams.insert(start_index);
    timelines.insert(start_index, 1);
    iterator.next();

    let mut splits = 0;
    for line in iterator.step_by(2) {
        let line = line?;
        if line.is_empty() {
            continue;
        }
        let mut new_beams = HashSet::new();
        let splitters: Vec<usize> = line
            .bytes()
            .enumerate()
            .filter_map(|(index, value)| {
                if value == b'^' && beams.contains(&index) {
                    Some(index)
                } else {
                    None
                }
            })
            .collect();
        for splitter in splitters {
            new_beams.insert(splitter - 1);
            new_beams.insert(splitter + 1);
            splits += 1;
            beams.remove(&splitter);
            let amount = *timelines.get(&splitter).unwrap_or(&0);
            timelines.insert(splitter, 0);
            timelines
                .entry(splitter - 1)
                .and_modify(|e| {
                    *e += amount;
                })
                .or_insert(amount);
            timelines
                .entry(splitter + 1)
                .and_modify(|e| {
                    *e += amount;
                })
                .or_insert(amount);
        }
        for new_beam in new_beams {
            beams.insert(new_beam);
        }
    }
    println!("{splits}");
    // println!("{:?}", timelines);
    let dt = timelines.values().sum::<u64>();
    println!("{dt}");

    Ok(())
}

