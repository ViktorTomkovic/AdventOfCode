use std::fs::File;
use std::io::{self, BufRead};

#[derive(Debug)]
enum Part {
    P1,
    P2,
}

impl Part {
    pub fn depth(self: &Self) -> u32 {
        match *self {
            Part::P1 => 1,
            Part::P2 => 135 * 135,
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
    let path_t = "./data/04a.in";
    let file = File::open(path_t)?;
    let reader = io::BufReader::new(file);

    let mut paper = [[0u8; 137]; 137];
    let mut count = [[0u8; 137]; 137];
    let mut diff = [[0u8; 137]; 137];
    let mut line_no = 1;
    for line in reader.lines() {
        let line = line?;
        if line.is_empty() {
            break;
        }
        let bytes = line.as_bytes();

        let mut col_no = 1;
        for &byte in bytes {
            if byte == b'@' {
                paper[line_no][col_no] = 1;
            }
            col_no += 1;
        }
        line_no += 1;
    }

    let mut sum = 0;
    let mut dirty = true;
    let mut iteration = 0;
    while dirty && iteration < p.depth() {
        for l in 1..=135 {
            for r in 1..=135 {
                count[l][r] = paper[l - 1][r - 1]
                    + paper[l - 1][r]
                    + paper[l - 1][r + 1]
                    + paper[l][r - 1]
                    + paper[l][r + 1]
                    + paper[l + 1][r - 1]
                    + paper[l + 1][r]
                    + paper[l + 1][r + 1];
                if paper[l][r] == 1 && count[l][r] < 4 {
                    sum += 1;
                    diff[l][r] = 1;
                }
            }
        }
        dirty = false;
        for l in 1..=135 {
            for r in 1..=135 {
                if diff[l][r] == 1 {
                    dirty = true;
                    paper[l][r] = 0;
                    diff[l][r] = 0;
                }
            }
        }
        iteration += 1;
    }
    println!("{sum}");
    Ok(())
}
