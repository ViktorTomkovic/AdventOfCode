use std::fs::File;
use std::io::{self, BufRead};
use std::ops::{Range, RangeBounds, RangeInclusive};

#[derive(Debug)]
enum Part {
    P1,
    P2,
}
pub fn main() -> io::Result<()> {
    let _ = part1();
    let _ = part2();

    println!("Hello, World!");
    Ok(())
}

fn part1() -> io::Result<()> {
    let path_t = "./data/05a.in";
    let file = File::open(path_t)?;
    let mut reader = io::BufReader::new(file);

    let mut intervals = Vec::new();
    let mut iterator = reader.lines();
    while let Some(line) = iterator.next() {
        let line = line?;
        if line.is_empty() {
            break;
        }

        let numbers: Vec<&str> = line.split('-').collect();
        // println!("{:?}", numbers);
        let n1 = numbers[0].parse::<u64>().unwrap();
        let n2 = numbers[1].parse::<u64>().unwrap();
        // println!("{n1} {n2}");
        intervals.push(n1..=n2);
    }

    let mut count = 0;
    while let Some(line) = iterator.next() {
        let line = line?;
        if line.is_empty() {
            break;
        }

        let n = line.parse::<u64>().unwrap();
        // println!("{n}");
        if intervals.iter().any(|interval| interval.contains(&n)) {
            count += 1
        }
    }
    println!("{count}");

    Ok(())
}

fn part2() -> io::Result<()> {
    let path_t = "./data/05a.in";
    let file = File::open(path_t)?;
    let mut reader = io::BufReader::new(file);

    let mut intervals = Vec::new();
    let mut iterator = reader.lines();
    while let Some(line) = iterator.next() {
        let line = line?;
        if line.is_empty() {
            break;
        }

        let numbers: Vec<&str> = line.split('-').collect();
        // println!("{:?}", numbers);
        let n1 = numbers[0].parse::<u64>().unwrap();
        let n2 = numbers[1].parse::<u64>().unwrap();
        // println!("{n1} {n2}");
        intervals.push(n1..=n2);
    }

    intervals.sort_unstable_by(|e1, e2| e1.start().cmp(&e2.start()));
    println!("{:?}", intervals);

    let mut sum = 0u64;
    let mut cur = 0;
    for interval in intervals {
        let (mut l,r) = interval.into_inner();
        if cur >= l {
            l = cur+1;
        }
        if l <= r {
            sum += r-l+1;
        }
        cur = cur.max(r);


    println!("{sum} {cur}");
    }
    println!("{sum}");

    Ok(())
}

fn part2fail1() -> io::Result<()> {
    let path_t = "./data/05a.in";
    let file = File::open(path_t)?;
    let mut reader = io::BufReader::new(file);

    let mut count = 0;
    let mut intervals: Vec<RangeInclusive<u64>> = Vec::new();
    for line in reader.lines() {
        let line = line?;
        if line.is_empty() {
            break;
        }

        let numbers: Vec<&str> = line.split('-').collect();
        // println!("{:?}", numbers);
        let n1 = numbers[0].parse::<u64>().unwrap();
        let n2 = numbers[1].parse::<u64>().unwrap();
        // println!("{n1} {n2}");
        let mut interval_to_add = Some((n1..=n2));
        for inter in &intervals {
            // let mut temp_int = None;
            match interval_to_add {
                None => break,
                Some(ref int_unwrapped) => {
                    let (n1, n2) = <std::ops::RangeInclusive<u64> as Clone>::clone(&int_unwrapped).into_inner();
                    if inter.contains(&n1) && inter.contains(&n2) {
                        interval_to_add = None;
                        continue;
                    } else if inter.contains(&n1) && !inter.contains(&n2) {
                        interval_to_add = Some(((*inter.end() + 1)..=n2));
                        // temp_int = Some(&((*inter.end() + 1)..=n2));
                    } else if !inter.contains(&n1) && inter.contains(&n2) {
                        interval_to_add = Some((n1..=(*inter.start() - 1)));
                        // temp_int = Some(&(n1..=(*inter.start() - 1)));
                    }
                }
            }
            // interval_to_add = temp_int;
        }
        if interval_to_add.is_some() {
            intervals.push(interval_to_add.unwrap());
        }
    }

    let mut sum = 0u64;
    for inter in &intervals {
        println!("{:?} {}", inter, inter.end() - inter.start() + 1);
        sum += inter.end() - inter.start() + 1;
    }
    println!("{sum}");
    // high 365641407219175

    Ok(())
}

fn is_intersecting(r1: &Range<u64>, r2: &Range<u64>) -> bool {
    r1.contains(&r2.start) || r2.contains(&(r2.end - 1))
}
