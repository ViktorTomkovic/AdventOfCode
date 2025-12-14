use std::collections::HashMap;
use std::fs::File;
use std::io::{self, BufRead};
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
    let file = File::open(path)?;
    let reader = io::BufReader::new(file);

    let mut _max_joltage = 0;
    let mut max_wirings = 0;
    let mut total_steps = 0;
    let mut total_steps_2 = 0u64;
    let mut iter = 1;
    for line in reader.lines() {
        let line = line?;
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
        let diagram = diagram
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
        let mut memo = HashMap::<Vec<u32>, u64>::new();
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
    target_lighting: &Vec<u32>,
    wirings: &Vec<u32>,
    memo: &mut HashMap<Vec<u32>, u64>,
    part: &Part,
) -> u64 {
    let zero_vector = vec![0u32; target_lighting.len()];
    memo.insert(zero_vector.clone(), 0);
    let to_evens = one_press_sum(target_lighting, wirings, part);
    let mut min_count = INF;
    for to_even in to_evens {
        let mut new_lightining = (*target_lighting).clone();
        for i in 0..new_lightining.len() {
            new_lightining[i] -= to_even.1[i];
        }
        // println!("{:?} {:#08b}", new_lightining, to_even.0);
        let count_for_this = if memo.contains_key(&new_lightining) {
            *memo.get(&new_lightining).unwrap()
        } else {
            let halved_lightining: Vec<u32> = new_lightining.iter().map(|&g| g / 2).collect();
            2 * multiple_press_sum(&halved_lightining, &wirings, memo, &part)
        };
        let count_for_this = count_for_this + to_even.0.count_ones() as u64;
        if min_count > (count_for_this) {
            min_count = count_for_this;
        }
    }
    memo.insert((*target_lighting).clone(), min_count);
    min_count
}

fn one_press_sum(
    target_lighting: &Vec<u32>,
    wirings: &Vec<u32>,
    part: &Part,
) -> Vec<(u32, Vec<u32>)> {
    let mut lightings = Vec::<(u32, Vec<u32>)>::new();
    for i in 0..(1 << wirings.len()) {
        let mut sum = vec![0u32; target_lighting.len()];
        // println!("i {i}");
        let mut configuration = i;
        while configuration != 0 {
            let mut activate_wiring = configuration ^ configuration - 1;
            let mut activate_index = 0;
            while activate_wiring != 0 {
                activate_wiring /= 2;
                activate_index += 1;
            }
            activate_index -= 1;
            // println!("{:#08b} {} {:?}", i, activate_index, binary_print(wirings));
            let mut activate_vector = wirings[activate_index];
            while activate_vector != 0 {
                let button_index = activate_vector ^ activate_vector - 1;
                let button_index = button_index.count_ones() - 1;
                // println!("{:#08b} {:#08b}", activate_vector, button_index);
                sum[button_index as usize] += 1;
                activate_vector &= activate_vector - 1;
            }
            configuration &= configuration - 1;
        }
        // println!("{:#08b} {:#08b}", initial_lighting, lights);
        if is_condition_met(&target_lighting, &sum, &part) {
            // println!("################");
            lightings.push((i as u32, sum));
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
    let mut success = true;
    for i in 0..target.len() {
        let target = target[i];
        let current = current[i];
        if current > target {
            success = false;
            break;
        }
        if ((target - current) & 1) == 1 {
            success = false;
            break;
        }
    }
    success
}

fn boolean_equivalency(target: &[u32], current: &[u32]) -> bool {
    // println!("{:?} {:?}", &target, &current);
    let mut success = true;
    for i in 0..target.len() {
        let target = target[i] & 1;
        let current = current[i] & 1;
        if current != target {
            success = false;
            break;
        }
    }
    success
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
