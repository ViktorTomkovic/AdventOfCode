use std::fs::File;
use std::io::{self, BufRead};

#[derive(Debug)]
enum Part {
    P1,
    P2,
}
pub fn main() -> io::Result<()> {
    let _ = part(&Part::P1);
    let _ = part(&Part::P2);

    println!("Hello, World!");
    Ok(())
}

fn part(p: &Part) -> io::Result<()> {
    let path_t = "./data/02a.in";
    let file = File::open(path_t)?;
    let mut reader = io::BufReader::new(file);

    let mut line = String::new();
    reader.read_line(&mut line)?;
    let line = line.trim_end();

    let mut result = 0;
    for sequence in line.split(',') {
        let numbers: Vec<&str> = sequence.split('-').collect();
        // println!("{:?}", numbers);
        let n1 = numbers[0].parse::<u64>().unwrap();
        let n2 = numbers[1].parse::<u64>().unwrap();
        // println!("{n1} {n2}");
        result += sum_nice_numbers(n1, n2, p);
    }
    println!("{result}");
    Ok(())
}

fn sum_nice_numbers(from: u64, to: u64, p: &Part) -> u64 {
    let mut sum = 0;
    for num in from..=to {
        if is_nice(num, p) {
            println!("{num}");
            sum += num;
        }
    }
    sum
}

fn is_nice(num: u64, p: &Part) -> bool {
    let binding = num.to_string();
    let number_bytes = binding.as_bytes();
    let n = number_bytes.len();
    for pattern_length in 1..=(n / 2) {
        // println!("{pattern_length}");
        let pattern_repetitions = n / pattern_length;
        // println!("{pattern_length} {pattern_repetitions} {n}");
        if pattern_length * pattern_repetitions != n {
            continue;
        }
        if matches!(p, Part::P1) && pattern_repetitions != 2 {
            continue
        }
        if is_containing_pattern(number_bytes, pattern_length, pattern_repetitions) {
            return true;
        }
    }
    false
}

fn is_containing_pattern(bytes: &[u8], pattern_length: usize, pattern_repetitions: usize) -> bool {
    for j in 1..pattern_repetitions {
        for i in 0..pattern_length {
            let i1 = (j - 1) * pattern_length + i;
            let i2 = j * pattern_length + i;
            // println!("{i1} {i2}");
            if bytes[i1] != bytes[i2] {
                return false;
            }
        }
    }
    return true;
}
