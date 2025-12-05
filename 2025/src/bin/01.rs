use std::env;
use std::io::BufRead;
use std::{fs::File, io};

pub fn main() -> io::Result<()> {
    println!("Hello, World!");
    let path = env::current_dir()?;
    println!("The current directory is {}", path.display());

    let _ = part1();
    let _ = part2();
    Ok(())
}

fn part1() -> io::Result<()> {
    let path_t = "./data/01a.in";
    let file = File::open(path_t)?;
    let reader = io::BufReader::new(file);

    let mut password = 0;
    let mut pointer = 50;
    for line in reader.lines() {
        let line = line?;
        if line.is_empty() {
            break;
        }
        // println!("{}", line);
        let mut bytes = line.bytes();
        let directive = bytes.next().unwrap();
        let mut prev = None;
        let mut last = None;
        for byte in bytes {
            prev = last;
            last = Some(byte);
        }
        let number = (prev.unwrap_or(b'0') - b'0') * 10 + (last.unwrap() - b'0');
        match directive {
            b'L' => {
                pointer = (100 + pointer - number) % 100;
            }
            b'R' => {
                pointer = (pointer + number) % 100;
            }
            _ => panic!("Wrong directive: {}", directive),
        }
        if pointer == 0 {
            password += 1;
        }
        // println!("{} {}", pointer, password);
    }
    println!("{}", password);
    Ok(())
}

fn part2() -> io::Result<()> {
    let path_t = "./data/01a.in";
    let file = File::open(path_t)?;
    let reader = io::BufReader::new(file);

    let mut password = 0;
    let mut pointer: i32 = 50;
    for line in reader.lines() {
        let line = line?;
        if line.is_empty() {
            break;
        }
        // println!("{}", line);
        let mut chars = line.chars();
        let directive = chars.next().unwrap();
        let movement: i32 = chars.as_str().parse().expect("");
        match directive {
            'L' => {
                let pb = pointer;
                if pointer == 0 {
                    password -= 1;
                }
                pointer -= movement;
                if pointer == 0 {
                    password += 1;
         println!("{} {} {} {}", line, pb, pointer, password);
                } else if pointer < 0 {
                    password += 1;
                    password += -pointer / 100;
                    pointer = (100 + pointer % 100) % 100;
         println!("{} {} {} {}", line, pb, pointer, password);
                }
            }
            'R' => {
                let pb = pointer;
                pointer = pointer + movement;
                if pointer >= 100 {
                    password += pointer / 100;
                    pointer %= 100;
         println!("{} {} {} {}", line, pb, pointer, password);
                }
            }
            _ => panic!("Wrong directive: {}", directive),
        }
        // println!("{} {}", pointer, password);
    }
    println!("{}", password);
    // 5940 high
    Ok(())
}
