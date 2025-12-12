use std::{
    fs::File,
    io::{self, BufRead},
    path::Path,
    str::from_utf8,
};

pub fn main() -> io::Result<()> {
    // let input = "12a";
    let _ = part12a1();

    println!("Hello, World!");
    Ok(())
}

fn part12a1() -> Result<(), io::Error> {
    let file = File::open(Path::new("./data/").join("12a").with_added_extension("in"))?;
    let reader = io::BufReader::new(file);

    let mut lines = reader.lines(); //.map(|l| l.unwrap()).collect();
    let mut shapes = vec![String::new(); 6];
    for i in 0..6 {
        lines.next(); // shape number
        for _shape in 0..3 {
            let sl = lines.next().unwrap().expect("ff");
            shapes[i].push_str(sl.as_str());
        }
        lines.next(); // empty line after shape
    }
    let shape_sizes: Vec<usize> = shapes
        .iter()
        .map(|s| s.chars().filter(|&b| b == '#').count())
        .collect();

    let mut part1 = 0;
    let mut part1a = 0;
    let mut maybe = 0;
    for line in lines {
        let line = line?;
        if line.is_empty() {
            break;
        }
        let bytes = line.as_bytes();
        let n1 = from_utf8(&bytes[0..=1])
            .expect("n1")
            .parse::<u64>()
            .expect("n12");
        let n2 = from_utf8(&bytes[3..=4])
            .expect("n2")
            .parse::<u64>()
            .expect("n22");
        let mult_l = n1 * n2;
        let numbers: Vec<u64> = bytes[7..bytes.len()]
            .split(|&b| b == b' ')
            .map(|s| from_utf8(s).expect("f").parse::<u64>().expect("e"))
            .collect();
        let mult_r = numbers.iter().fold(1, |acc, e| acc + e) * 9;
        let mut mult_r2 = 0;
        for i in 0..6 {
            mult_r2 += shape_sizes[i] as u64 * numbers[i];
        }
        println!("{mult_l} {mult_r} {mult_r2}");
        if mult_l > mult_r {
            part1 += 1;
        }
        if mult_l > mult_r2 {
            part1a += 1;
        }
        if (mult_l / 10 * 9) > mult_r {
            maybe += 1;
        }
    }
    println!("p1: {part1} maybe: {maybe} a: {part1a}");
    Ok(())
}
