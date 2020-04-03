use std::thread;
use std::time::Duration;

// 后端耗时算法的模拟
fn simulated_expensive_calculation(intensity: u32) -> u32 {
    println!("calculating slowly...");
    thread::sleep(Duration::from_secs(2));
    intensity
}

struct Cacher<T> where T: Fn(u32) -> u32 {
    calculation: T,
    value: Option<u32>,
}

impl<T> Cacher<T> where T: Fn(u32) -> u32 {
    fn new(calculation: T) -> Cacher<T> {
        Cacher {
            calculation,
            value: None,
        }
    }

    fn value(&mut self, arg: u32) -> u32 {
        match self.value {
            Some(v) => v,
            None => {
                let v = (self.calculation)(arg);
                self.value = Some(v);
                v
            }
        }
    }
}

fn main() {
    // 因为前端交互与闭包的使用并不相关，所以这里我们将使用硬编码来模拟用户输入并打印输出
    // 现实中的应用会从前端获取强度系数并使用 rand crate 来生成随机数

    let simulated_user_specified_value = 10; // 强度级别，代表用户喜好低强度还是高强度健身，需要用户在请求健身计划时提供
    let simulated_random_number = 7; // 一个随机数，其会在健身计划中生成变化
    
    let mut expensive_result = Cacher::new(|num| simulated_expensive_calculation(num));

    let mut generate_workout = |intensity: u32, random_number: u32| {
        if intensity < 25 {
            println!(
                "Today, do {} pushups!",
                expensive_result.value(intensity)
            );
            println!(
                "Next, do {} situps!",
                expensive_result.value(intensity)
            );
        } else {
            if random_number == 3 {
                println!("Take a break today! Remember to stay hydrated!");
            } else {
                println!(
                    "Today, run for {} minutes!",
                    expensive_result.value(intensity)
                );
            }
        }
    };

    // 生成锻炼计划
    generate_workout(
        simulated_user_specified_value,
        simulated_random_number
    );

    generate_workout(
        30,
        5
    );

    generate_workout(
        30,
        3
    );
}
