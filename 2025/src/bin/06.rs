use std::fs::File;
use std::io::{self, BufRead};
pub fn main() -> io::Result<()> {
    let _ = part1();
    let _ = part2();

    println!("Hello, World!");
    Ok(())
}

fn part1() -> io::Result<()> {
    let path_t = "./data/06a.in";
    let file = File::open(path_t)?;
    let reader = io::BufReader::new(file);

    let mut sums = Vec::<u64>::new();
    let mut multipliers = Vec::<u64>::new();
    let mut iterator = reader.lines();
    let first = iterator.next().unwrap()?;
    for token in first.split_whitespace() {
        let number: u64 = token.parse().expect("grg");
        sums.push(number);
        multipliers.push(number);
    }

    let mut big_sum: u64 = 0;
    while let Some(line) = iterator.next() {
        let line = line?;
        if line.is_empty() {
            break;
        }
        let tokens = line.split_whitespace();
        for (i, token) in tokens.enumerate() {
            match token {
                "*" => {
                    big_sum += multipliers[i];
                }
                "+" => {
                    big_sum += sums[i];
                }
                str => {
                    let number: u64 = str.parse().expect("grgrg");
                    sums[i] += number;
                    multipliers[i] *= number;
                }
            }
        }
    }
    println!("{big_sum}");
    Ok(())
}

fn part2() -> io::Result<()> {
    let path_t = "./data/06a.in";
    let file = File::open(path_t)?;
    let reader = io::BufReader::new(file);

    let lines: Vec<Vec<u8>> = reader
        .lines()
        .map(|line| line.unwrap().into_bytes())
        .collect();
    let n = if lines[lines.len() - 1].len() == 0 {
        lines.len() - 1
    } else {
        lines.len()
    };

    let last_line = &lines[n - 1];
    let mut ranges = Vec::new();
    let mut last = 0;
    for i in 1..last_line.len() {
        if last_line[i] != b' ' {
            ranges.push(last..i - 1);
            last = i;
        }
    }
    ranges.push(last..last_line.len());

    let mut megasum: u64 = 0;
    for range in ranges {
        let operator = lines[n - 1][range.start];
        println!("{operator} {:?}", range);
        let mut bignum: u64 = match operator {
            b'*' => 1,
            b'+' => 0,
            _ => panic!("fefefe"),
        };
        for i in range.rev() {
            let mut ten = 1;
            let mut number = 0u64;
            for l_no in (0..n - 1).rev() {
                if lines[l_no][i] != b' ' {
                    number += (lines[l_no][i] - b'0') as u64 * ten;
                    ten *= 10;
                }
            }
            match operator {
                b'*' => {
                    bignum *= number;
                }
                b'+' => {
                    bignum += number;
                }
                _ => panic!("efefef"),
            }
        }
        println!("{bignum}");
        megasum += bignum;
    }
    println!("{megasum}");
    Ok(())
}
