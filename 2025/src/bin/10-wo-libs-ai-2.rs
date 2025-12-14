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

    let mut _max_joltage = 0;
    let mut max_wirings = 0;
    let mut total_steps = 0;
    let mut total_steps_2 = 0u64;
    let mut iter = 1;
    let mut memo = HashMap::<Vec<u32>, u64>::new();
    for line in content.lines() {
        if line.is_empty() {
            continue;
        }
        println!("{}: {}", iter, line);
        // println!("{}", line);
        // println!("{}", iter);
        let mut parts = line.split(' ');
        let diagram = parts.next().unwrap();
        let diagram = &diagram[1..diagram.len() - 1];
        let n = diagram.len();
        let diagram: Vec<u32> = diagram
            .chars()
            .map(|ch| match ch {
                '#' => 1,
                '.' => 0,
                _ => {
                    panic!("argh");
                }
            })
            .collect();

        let mut wirings = Vec::<u32>::new();
        let mut joltages = Vec::<u32>::new();
        while let Some(part) = parts.next() {
            if part.starts_with('{') {
                joltages = parse_brackets(part);
                // println!("{:?}", joltages);
            } else {
                let wirings_raw = parse_brackets(part);
                // println!("{:?}", wirings_raw);
                let mut wiring = 0u32;
                for w in wirings_raw {
                    wiring |= 1 << w;
                }
                wirings.push(wiring);
            }
        }

        let part1_results = one_press_sum(&diagram, &wirings, &Part::P1);
        // println!("{:?}", binary_print(&part1_results));
        if part1_results.len() > 0 {
            let min_count = part1_results
                .iter()
                .map(|w| w.0.count_ones())
                .min()
                .unwrap();
            // println!("min count {min_count}");
            total_steps += min_count;
        } else {
            println!(
                "not found for: {:?} {:?} {:?}",
                diagram,
                binary_print(&wirings),
                n
            );
        }
        if wirings.len() > max_wirings {
            max_wirings = wirings.len()
        }
        memo.clear();
        let part2_results = multiple_press_sum(&joltages, &wirings, &mut memo, &Part::P2);
        total_steps_2 += part2_results;
        iter += 1;
    }
    // println!("Max Joltage: {max_joltage}");
    // println!("Max Wirings: {max_wirings}");
    println!("part1: {}", total_steps);
    println!("part2: {}", total_steps_2);
    // part1: 425
    // part2: 15883

    Ok(())
}

fn multiple_press_sum(
    target_lighting: &[u32],
    wirings: &[u32],
    memo: &mut HashMap<Vec<u32>, u64>,
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

    for to_even in to_evens {
        let mut new_lightining = Vec::with_capacity(target_lighting.len());
        for i in 0..target_lighting.len() {
            new_lightining.push(target_lighting[i] - to_even.1[i]);
        }

        // println!("{:?} {:#08b}", new_lightining, to_even.0);
        let count_for_this = if let Some(&cached) = memo.get(&new_lightining) {
            cached
        } else {
            let halved_lightining: Vec<u32> = new_lightining.iter().map(|&g| g / 2).collect();
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

fn one_press_sum(target_lighting: &[u32], wirings: &[u32], part: &Part) -> Vec<(u32, Vec<u32>)> {
    let mut lightings = Vec::with_capacity(1 << wirings.len().min(10));
    let mut sum = vec![0u32; target_lighting.len()];

    for i in 0..(1 << wirings.len()) {
        // Reset sum vector instead of allocating new one
        sum.fill(0);

        // println!("i {i}");
        let mut configuration: u32 = i as u32;
        let mut early_exit = false;

        while configuration != 0 {
            let activate_index = configuration.trailing_zeros() as usize;
            // println!("{:#08b} {} {:?}", i, activate_index, binary_print(wirings));
            let mut activate_vector = wirings[activate_index];
            while activate_vector != 0 {
                let button_index = activate_vector.trailing_zeros() as usize;
                // println!("{:#08b} {:#08b}", activate_vector, button_index);
                sum[button_index] += 1;

                // Early exit for Part 2: if sum exceeds target, skip
                if matches!(part, Part::P2) && sum[button_index] > target_lighting[button_index] {
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

        // println!("{:#08b} {:#08b}", initial_lighting, lights);
        if !early_exit && is_condition_met(target_lighting, &sum, part) {
            // println!("################");
            lightings.push((i as u32, sum.clone()));
        }
    }
    // println!("{}", lightings.len());
    lightings
}

fn is_condition_met(target: &[u32], current: &[u32], part: &Part) -> bool {
    match &part {
        Part::P1 => boolean_equivalency(target, current),
        Part::P2 => sum_equivalency(target, current),
    }
}

fn sum_equivalency(target: &[u32], current: &[u32]) -> bool {
    target
        .iter()
        .zip(current.iter())
        .all(|(&t, &c)| c <= t && ((t - c) & 1) == 0)
}

fn boolean_equivalency(target: &[u32], current: &[u32]) -> bool {
    // println!("{:?} {:?}", &target, &current);
    target
        .iter()
        .zip(current.iter())
        .all(|(&t, &c)| (t & 1) == (c & 1))
}

fn parse_brackets(string_slice: &str) -> Vec<u32> {
    let string_slice = &string_slice[1..string_slice.len() - 1];
    let result: Vec<u32> = string_slice
        .split(',')
        .map(|part| part.parse::<u32>().unwrap())
        .collect();
    result
}

#[allow(dead_code)]
fn binary_print(array: &Vec<u32>) -> Vec<String> {
    array.iter().map(|&a| format!("{:b}", a)).collect()
}

#[allow(dead_code)]
fn diagram_to_binary(diagram: &str) -> u32 {
    let mut number = 0u32;
    let mut index = 1u32;
    for ch in diagram.chars() {
        if ch == '#' {
            number += index;
        }
        index += index;
    }
    number
}

// fn one_press_bool(initial_lighting: u32, wirings: &Vec<u32>) -> Vec<u32> {
//     let mut lightings = Vec::<u32>::new();
//     for i in 0..(1 << wirings.len()) {
//         // println!("i {i}");
//         let mut configuration = i;
//         let mut lights = initial_lighting;
//         while configuration != 0 {
//             let mut activate_wiring = configuration ^ configuration - 1;
//             let mut activate_index = 0;
//             while activate_wiring != 0 {
//                 activate_wiring /= 2;
//                 activate_index += 1;
//             }
//             activate_index -= 1;
//             // println!("{:#08b} {} {:?}", i, activate_index, binary_print(wirings));
//             lights ^= wirings[activate_index];
//             configuration &= configuration - 1;
//         }
//         // println!("{:#08b} {:#08b}", initial_lighting, lights);
//         if lights == 0 {
//             // println!("################");
//             lightings.push(i as u32);
//         }
//     }
//     // println!("{}", lightings.len());
//     lightings
// }
