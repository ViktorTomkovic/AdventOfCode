use std::fs::File;
use std::io::{self, BufRead};

#[derive(Debug)]
enum Part {
    P1,
    P2,
}

impl Part {
    pub fn depth(&self) -> usize {
        match self {
            Part::P1 => 2,
            Part::P2 => 12
        }
    }
}

pub fn main() -> io::Result<()> {
    let _ = part(&Part::P1);
    let _ = part(&Part::P2);

    println!("Hello, World!");
    Ok(())
}

fn part(p: &Part) -> io::Result<()> {
    let path_t = "./data/03a.in";
    let file = File::open(path_t)?;
    let reader = io::BufReader::new(file);

    let mut sum = 0;
    for line in reader.lines() {
        let line = line?;
        if line.is_empty() {
            break;
        }
        let bytes = line.as_bytes();

        // let mut first = b'0';
        // let mut second = b'0';
        // for i in 1..bytes.len() {
        //     if bytes[i - 1] > first {
        //         first = bytes[i - 1];
        //         second = bytes[i];
        //     }
        //     if bytes[i] > second {
        //         second = bytes[i];
        //     }
        // }
        // println!("{first} {second}");
        // let jolts = (first - b'0') as i32 * 10 + (second - b'0') as i32;
        // println!("{jolts}");

        let joltage = find_largest(bytes, 1, p.depth()).0;
        let mut jolts = 0u64;
        let mut exponent = 1;
        for i in (0..p.depth()).rev() {
            jolts += ((joltage[i] - b'0') as u64) * exponent;
            exponent *= 10;
        }
        println!("{jolts}");
        sum += jolts;
    }
    println!("{sum}");
    Ok(())
}

fn find_largest(bytes: &[u8], depth: usize, max_depth: usize) -> (Vec<u8>, usize) {
    if depth > max_depth {
        return (Vec::new(), 0);
    }
    let index = bytes.len() - depth;
    let (mut result, last) = find_largest(bytes, depth + 1, max_depth);
    let mut max = b'0';
    let mut max_index = index;
    for i in (last..=index).rev() {
        if bytes[i] >= max {
            max = bytes[i];
            max_index = i + 1;
        }
    }
    result.push(max);
    (result, max_index)
}
