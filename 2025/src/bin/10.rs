use good_lp::solvers::lp_solvers::CbcSolver;
use good_lp::{
    variable, variables, Expression, LpSolver, Solution, SolverModel
};
use std::cmp::min;
use std::fs::File;
use std::io::{self, BufRead, Write};
use std::str::from_utf8;

const INF: u64 = 151515;
pub fn main() -> io::Result<()> {
    let _ = parts();

    println!("Hello, World!");
    Ok(())
}

fn parts() -> io::Result<()> {
    let file = File::open("./data/10a.in")?;
    let reader = io::BufReader::new(file);

    let mut max_joltage = 0;
    let mut total_steps = 0;
    let mut total_steps_2 = 0u64;
    let mut _iter = 1;
    for line in reader.lines() {
        let line = line?;
        if line.is_empty() {
            continue;
        }
        let bytes = line.as_bytes();
        let parts: Vec<&[u8]> = bytes.split(|&b| b == b' ').collect();
        let (diagram_raw, wirings_raw, joltages_raw) =
            (parts[0], &parts[1..parts.len() - 1], parts[parts.len() - 1]);
        let diagram = &diagram_raw[1..diagram_raw.len() - 1];
        // println!("{:?}", from_utf8(diagram).unwrap());
        let joltages = parse_brackets(joltages_raw);
        let wirings: Vec<Vec<u32>> = wirings_raw
            .iter()
            .map(|wiring_raw| parse_brackets(wiring_raw))
            .collect();
        // println!("{:?}", wirings);
        // println!("{:?}", joltages);
        let partial_max_joltage = *joltages.iter().max().unwrap();
        max_joltage = max_joltage.max(partial_max_joltage);

        let min_steps = part1_rec(
            &mut vec![0u32; diagram.len()],
            &diagram,
            &wirings,
            0,
            wirings.len(),
            0,
            INF,
        );
        // println!("{min_steps}");
        total_steps += min_steps;
        // part 2: defeat - I am not able to solve Ax = B
        // part2_rec(
        //     &mut vec![0u32; diagram.len()],
        //     &joltages,
        //     &wirings,
        //     0,
        //     wirings.len(),
        //     0,
        //     INF,
        // );
        let mut a = vec![vec![0; wirings.len()]; joltages.len()];
        for i in 0..wirings.len() {
            for &w in &wirings[i] {
                a[w as usize][i] = 1;
            }
        }
        // println!("{:?}", a);
        // println!("{:?}", joltages);
        // good_lp stuff
        let mut vars = variables!();
        let mut x = Vec::new();
        for j in 0..wirings.len() {
            let new_var = vars.add(
                variable()
                    .integer()
                    .min(0)
                    // .max(partial_max_joltage)
                    .max(350)
                    .name(format!("x_{j}")),
            );
            x.push(new_var);
        }
        let mut objective: Expression = 0.0.into();
        for j in 0..wirings.len() {
            objective = objective + x[j];
        }
        // let mut model = vars.minimise(objective).using(good_lp::coin_cbc);
        let mut model = vars.minimise(objective).using(LpSolver(CbcSolver::new()));
        for i in 0..joltages.len() {
            let mut expr: Expression = 0.0.into();
            for j in 0..wirings.len() {
                expr = expr + (a[i][j] as f64) * x[j];
            }
            model = model.with(expr.eq(joltages[i] as f64));
        }
        let solution = model.solve().expect("Solution not found.");
        let mut sum_x = 0u64;
        for j in 0..wirings.len() {
            let val = solution.value(x[j]).round() as u64;
            // println!("x_{j}: {val}");
            sum_x += val;
        }
        // println!("{iter} {sum_x}");
        io::stdout().flush().ok().expect("Could not flush stdout");
        total_steps_2 += sum_x;
        _iter += 1;
    }
    println!("Max Joltage: {max_joltage}");
    println!("{}", total_steps);
    println!("{}", total_steps_2);

    Ok(())
}

fn parse_brackets(byte_slice: &[u8]) -> Vec<u32> {
    let byte_slice = &byte_slice[1..byte_slice.len() - 1];
    let result: Vec<u32> = byte_slice
        .split(|&b| b == b',')
        .map(|part| from_utf8(part).unwrap().parse::<u32>().unwrap())
        .collect();
    result
}

fn part1_rec(
    active: &mut Vec<u32>,
    diagram: &[u8],
    wirings: &Vec<Vec<u32>>,
    wirings_index: usize,
    wirings_length: usize,
    current_active: u64,
    current_min: u64,
) -> u64 {
    if wirings_index > wirings_length {
        return INF;
    }
    if current_active >= current_min {
        return INF;
    }
    if wirings_index == wirings_length {
        // println!("{:?} {}", active, current_min);
        let mut same = true;
        for i in 0..diagram.len() {
            match diagram[i] {
                b'.' => {
                    if active[i] % 2 == 1 {
                        same = false;
                        break;
                    }
                }
                b'#' => {
                    if active[i] % 2 == 0 {
                        same = false;
                        break;
                    }
                }
                _ => panic!("asdf"),
            }
        }
        if same {
            // println!("chosen {}", current_active);
            return current_active;
        } else {
            return INF;
        }
    }
    let exclude = part1_rec(
        active,
        diagram,
        wirings,
        wirings_index + 1,
        wirings_length,
        current_active,
        current_min,
    );
    for &a in &wirings[wirings_index] {
        active[a as usize] += 1;
    }
    let include = part1_rec(
        active,
        diagram,
        wirings,
        wirings_index + 1,
        wirings_length,
        current_active + 1,
        min(exclude, current_min),
    );
    for &a in &wirings[wirings_index] {
        active[a as usize] -= 1;
    }
    return min(include, exclude);
}

#[allow(dead_code)]
fn part2_rec(
    active: &mut Vec<u32>,
    joltages: &Vec<u32>,
    wirings: &Vec<Vec<u32>>,
    wirings_index: usize,
    wirings_length: usize,
    current_active: u64,
    mut current_min: u64,
) -> u64 {
    if wirings_index > wirings_length {
        return INF;
    }
    if current_active >= current_min {
        return INF;
    }
    if wirings_index == wirings_length {
        // println!(
        //     "{:?} {} {} {:?}",
        //     active, current_active, current_min, joltages
        // );
        for i in 0..joltages.len() {
            if active[i] != joltages[i] {
                return INF;
            }
        }
        return current_active;
    }
    for time in 0..=10 {
        // println!("{:?} {:?}", active, &wirings[wirings_index]);
        for &a in &wirings[wirings_index] {
            active[a as usize] += time;
        }
        // println!("{:?} {:?}", active, &wirings[wirings_index]);
        let actives = part2_rec(
            active,
            joltages,
            wirings,
            wirings_index + 1,
            wirings_length,
            current_active + time as u64,
            current_min,
        );
        current_min = min(actives, current_min);
        for &a in &wirings[wirings_index] {
            active[a as usize] -= time;
        }
    }
    return current_min;
}
