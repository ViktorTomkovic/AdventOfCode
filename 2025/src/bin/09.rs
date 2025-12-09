use png_encode_mini::write_rgba_from_u32;
use std::cmp::{max, min};
use std::fs::File;
use std::io::{self, BufRead};

const WHITE: u32 = 0xffffffff;
const BLACK: u32 = 0xff000000;
const RED: u32 = 0xff0000ff;
const BLUE: u32 = 0xffff0000;
const GREEN: u32 = 0xff00ff00;
const PURPLE: u32 = 0xff5500aa;
const BROWN: u32 = 0xff112233;

pub fn main() -> io::Result<()> {
    parts()?;

    println!("Hello, World!");
    Ok(())
}

fn parts() -> io::Result<()> {
    let path_t = "./data/09a.in";
    let file = File::open(path_t)?;
    let reader = io::BufReader::new(file);

    let mut points = Vec::new();
    let mut iterator = reader.lines();
    while let Some(line) = iterator.next() {
        let line = line?;
        if line.is_empty() {
            break;
        }

        let numbers: Vec<&str> = line.split(',').collect();
        // println!("{:?}", numbers);
        let n1 = numbers[0].parse::<u64>().unwrap();
        let n2 = numbers[1].parse::<u64>().unwrap();
        // println!("{n1} {n2}");
        points.push((n1, n2));
    }

    part1(&points)?;
    part2(&points)?;
    Ok(())
}

fn area(p: (u64, u64), q: (u64, u64)) -> u64 {
    let x = if p.0 > q.0 {
        p.0 - q.0 + 1
    } else {
        q.0 - p.0 + 1
    };
    let y = if p.1 > q.1 {
        p.1 - q.1 + 1
    } else {
        q.1 - p.1 + 1
    };
    x * y
}

fn part1(points: &Vec<(u64, u64)>) -> io::Result<()> {
    let n = points.len();
    let mut max = 0u64;
    for i in 0..n {
        for j in i + 1..n {
            let p = points[i];
            let q = points[j];
            let area = area(p, q);
            if area > max {
                max = area;
            }
        }
    }
    println!("{max}");
    Ok(())
}
fn part2(points: &Vec<(u64, u64)>) -> io::Result<()> {
    let n = points.len();
    let mut min_x = u64::MAX;
    let mut min_y = u64::MAX;
    let mut max_x = u64::MIN;
    let mut max_y = u64::MIN;

    for point in points {
        if point.0 < min_x {
            min_x = point.0;
        }
        if point.0 > max_x {
            max_x = point.0;
        }
        if point.1 < min_x {
            min_y = point.1;
        }
        if point.1 > max_x {
            max_y = point.1;
        }
    }
    println!("{min_x} {max_x} {min_y} {max_y}");

    let mut max_area = 0u64;
    let p1 = points[248];
    let a1 = &points[0..248];
    let p2 = points[249];
    let a2 = &points[250..points.len()];
    println!("{:?} {:?}", p1, p2);
    for &a in a1 {
        let possible_area = area(a, p1);
        if possible_area < max_area {
            continue;
        }
        let mut is = false;
        for &b in a1 {
            if is_inside(a, p1, b) {
                is = true;
                break;
            }
        }
        if !is {
            max_area = possible_area;
        }
    }
    for &a in a2 {
        let possible_area = area(a, p2);
        if possible_area < max_area {
            continue;
        }
        let mut is = false;
        for &b in a2 {
            if is_inside(a, p2, b) {
                is = true;
                break;
            }
        }
        if !is {
            max_area = possible_area;
        }
    }
    println!("{max_area}");
    // let width: usize = 100_000;
    // let height: usize = 100_000;
    // let mut arr = vec![vec![BLACK; width]; height];
    let image_width: u32 = 1000;
    let image_height: u32 = 1000;
    let mut image = Image::new_from_color(image_height, image_width, WHITE);
    // let mut same_x = 0;
    // let mut same_y = 0;
    for i in 0..n {
        for j in i + 1..n {
            let p = points[i];
            let q = points[j];
            if p.0 == q.0 {
                let x = p.0 / 100;
                let min = min(p.1, q.1) / 100;
                let max = max(p.1, q.1) / 100;
                for y in min..=max {
                    image.set_color(y as usize, x as usize, GREEN);
                }
                // same_x += 1;
            }
            if p.1 == q.1 {
                let y = p.1 / 100;
                let min = min(p.0, q.0) / 100;
                let max = max(p.0, q.0) / 100;
                for x in min..=max {
                    image.set_color(y as usize, x as usize, GREEN);
                }
                // same_y += 1;
            }
        }
    }
    // println!("{same_x} {same_y}");
    for point in a1 {
        let x = point.0 / 100;
        let y = point.1 / 100;
        image.set_color(y as usize, x as usize, PURPLE);
    }

    image.set_color((p1.1 / 100) as usize, (p1.0 / 100) as usize, RED);
    for point in a2 {
        let x = point.0 / 100;
        let y = point.1 / 100;
        image.set_color(y as usize, x as usize, BROWN);
    }
    image.set_color((p2.1 / 100) as usize, (p2.0 / 100) as usize, BLUE);
    image.write("./output/points.png");
    Ok(())
}

fn is_inside(p1: (u64, u64), p2: (u64, u64), p3: (u64, u64)) -> bool {
    let min_x = min(p1.0, p2.0);
    let min_y = min(p1.1, p2.1);
    let max_x = max(p1.0, p2.0);
    let max_y = max(p1.1, p2.1);
    ((min_x < p3.0) && (p3.0 < max_x)) && ((min_y < p3.1) && (p3.1 < max_y))
}

struct Image {
    height: u32,
    width: u32,
    buffer: Vec<u32>,
}

impl Image {
    pub fn new(height: u32, width: u32) -> Image {
        Image {
            height,
            width,
            buffer: vec![0xff; (height * width) as usize],
        }
    }
    pub fn new_from_color(height: u32, width: u32, color: u32) -> Image {
        Image {
            height,
            width,
            buffer: vec![color; (height * width) as usize],
        }
    }
    pub fn set_color(&mut self, h: usize, w: usize, color: u32) {
        self.buffer[h * self.width as usize + w] = color;
    }
    pub fn write(&self, filename: &str) {
        let mut f = File::create(filename).unwrap();
        match write_rgba_from_u32(&mut f, &self.buffer, self.width, self.height) {
            Ok(_) => println!("Image written: {:?}", filename),
            Err(e) => println!("Error {:?}", e),
        }
    }
}
