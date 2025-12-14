use std::collections::HashMap;
use std::io;
use std::path::Path;

const INF: u64 = 151515;
// const B0: u32 = 0b1;
// const B1: u32 = 0b10;
// const B2: u32 = 0b100;
// const B3: u32 = 0b1000;
// const B4: u32 = 0b10000;
// const B5: u32 = 0b100000;
// const B6: u32 = 0b1000000;
// const B7: u32 = 0b10000000;
// const B8: u32 = 0b100000000;
// const B9: u32 = 0b1000000000;

#[derive(Debug)]
enum Part {
    P1,
    P2,
}

pub fn main() -> io::Result<()> {
    let input = "10a";
    let _ = parts(input);

    println!("Hello, World!");
    Ok(())
}

fn parts(input: &str) -> io::Result<()> {
    let path = Path::new("./data/").join(input).with_added_extension("in");
    let content = std::fs::read_to_string(path)?;

    let mut total_steps = 0u32;
    let mut total_steps_2 = 0u64;
    let mut iter = 1;
    let mut memo = HashMap::<Vec<u16>, u64>::new();
    for line in content.lines() {
        if line.is_empty() {
            continue;
        }
        // println!("{}: {}", iter, line);
        // println!("{}", line);
        // println!("{}", iter);
        let mut parts = line.split(' ');
        let diagram = parts.next().unwrap();
        let diagram = &diagram[1..diagram.len() - 1];
        let diagram: Vec<u16> = diagram
            .chars()
            .map(|ch| match ch {
                '#' => 1,
                '.' => 0,
                _ => panic!("Invalid character in diagram"),
            })
            .collect();

        let mut wirings = Vec::<u16>::new();
        let mut joltages = Vec::<u16>::new();
        while let Some(part) = parts.next() {
            if part.starts_with('{') {
                joltages = parse_brackets(part);
            } else {
                let wirings_raw = parse_brackets(part);
                let mut wiring = 0u16;
                for w in wirings_raw {
                    wiring |= 1 << w;
                }
                wirings.push(wiring);
            }
        }

        let part1_results = one_press_sum(&diagram, &wirings, &Part::P1);
        if !part1_results.is_empty() {
            let min_count = part1_results
                .iter()
                .map(|w| w.0.count_ones())
                .min()
                .unwrap();
            total_steps += min_count;
        }
        memo.clear();
        let part2_results = multiple_press_sum(&joltages, &wirings, &mut memo, &Part::P2);
        total_steps_2 += part2_results;
        iter += 1;
    }
    
    println!("part1: {}", total_steps);
    println!("part2: {}", total_steps_2);
    // part1: 425
    // part2: 15883

    Ok(())
}

fn multiple_press_sum(
    target_lighting: &[u16],
    wirings: &[u16],
    memo: &mut HashMap<Vec<u16>, u64>,
    part: &Part,
) -> u64 {
    // Check memo first
    if let Some(&cached) = memo.get(target_lighting) {
        return cached;
    }

    // Base case
    if target_lighting.iter().all(|&x| x == 0) {
        return 0;
    }

    let to_evens = one_press_sum(target_lighting, wirings, part);
    let mut min_count = INF;
    let mut new_lightining = Vec::with_capacity(target_lighting.len());
    let mut halved_lightining = Vec::with_capacity(target_lighting.len());

    for to_even in to_evens {
        new_lightining.clear();
        for i in 0..target_lighting.len() {
            new_lightining.push(target_lighting[i] - to_even.1[i]);
        }

        // println!("{:?} {:#08b}", new_lightining, to_even.0);
        let count_for_this = if let Some(&cached) = memo.get(&new_lightining) {
            cached
        } else {
            halved_lightining.clear();
            halved_lightining.extend(new_lightining.iter().map(|&g| g / 2));
            let result = 2 * multiple_press_sum(&halved_lightining, wirings, memo, part);
            memo.insert(new_lightining.clone(), result);
            result
        };

        let count_for_this = count_for_this + to_even.0.count_ones() as u64;
        if min_count > count_for_this {
            min_count = count_for_this;
        }
    }

    memo.insert(target_lighting.to_vec(), min_count);
    min_count
}

fn one_press_sum(target_lighting: &[u16], wirings: &[u16], part: &Part) -> Vec<(u16, Vec<u16>)> {
    let mut lightings = Vec::with_capacity(1 << wirings.len().min(10));
    let mut sum = vec![0u16; target_lighting.len()];
    let is_part2 = matches!(part, Part::P2);

    for i in 0..(1 << wirings.len()) {
        // Reset sum vector instead of allocating new one
        sum.fill(0);

        let mut configuration: u16 = i as u16;
        let mut early_exit = false;

        while configuration != 0 {
            let activate_index = configuration.trailing_zeros() as usize;
            let mut activate_vector = wirings[activate_index];
            while activate_vector != 0 {
                let button_index = activate_vector.trailing_zeros() as usize;
                sum[button_index] += 1;

                // Early exit for Part 2: if sum exceeds target, skip
                if is_part2 && sum[button_index] > target_lighting[button_index] {
                    early_exit = true;
                    break;
                }

                activate_vector &= activate_vector - 1;
            }
            if early_exit {
                break;
            }
            configuration &= configuration - 1;
        }

        // Inline condition check and only clone if we match
        if !early_exit {
            let matches = if is_part2 {
                // Inline sum_equivalency
                sum.iter().zip(target_lighting.iter()).all(|(&c, &t)| c <= t && ((t - c) & 1) == 0)
            } else {
                // Inline boolean_equivalency
                sum.iter().zip(target_lighting.iter()).all(|(&c, &t)| (t & 1) == (c & 1))
            };
            
            if matches {
                lightings.push((i as u16, sum.clone()));
            }
        }
    }
    lightings
}

fn parse_brackets(string_slice: &str) -> Vec<u16> {
    let string_slice = &string_slice[1..string_slice.len() - 1];
    string_slice
        .split(',')
        .map(|part| part.parse::<u16>().unwrap())
        .collect()
}
