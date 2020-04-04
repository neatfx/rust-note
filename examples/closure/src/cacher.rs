// 利用闭包进行延迟计算

pub mod cacher {
  use std::thread;
  use std::time::Duration;
  use std::collections::HashMap;

  // 模拟后端耗时算法
  pub fn simulated_expensive_calculation(intensity: u32) -> u32 {
      println!("calculating slowly...");
      thread::sleep(Duration::from_secs(2));
      let slowed_cal_intensity = intensity + 1;
      slowed_cal_intensity
  }

  pub struct Cacher<T> where T: Fn(u32) -> u32 {
      calculation: T,
      value: HashMap<u32, u32>,
  }

  impl<T> Cacher<T> where T: Fn(u32) -> u32 {
      pub fn new(calculation: T) -> Cacher<T> {
          Cacher {
              calculation: calculation,
              value: HashMap::new(),
          }
      }

      pub fn value(&mut self, arg: u32) -> u32 {
        match self.value.get(&arg) {
            Some(v) => *v,
            None => *self.value.entry(arg).or_insert((self.calculation)(arg)) 
        }
      }
  }
}

#[cfg(test)]
mod test {
    use super::cacher::{Cacher, simulated_expensive_calculation};

    #[test]
    fn closure_test() {
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

                assert_eq!(intensity + 1, expensive_result.value(intensity));

                println!(
                    "Next, do {} situps!",
                    expensive_result.value(intensity)
                );

                assert_eq!(intensity + 1, expensive_result.value(intensity));
            } else {
                if random_number == 3 {
                    println!("Take a break today! Remember to stay hydrated!");
                } else {
                    println!(
                        "Today, run for {} minutes!",
                        expensive_result.value(intensity)
                    );

                    assert_eq!(intensity + 1, expensive_result.value(intensity));
                }
            }
        };


        // 生成锻炼计划
        // 10 > 11 (首次计算结果值) > 11（缓存值） > 11（缓存值） > 11（缓存值）
        generate_workout(
            simulated_user_specified_value,
            simulated_random_number
        );

        // 30 > 31 (首次计算结果值) > 11（缓存值）
        generate_workout(
            30,
            5
        );

        // 30，执行计算 0 次
        generate_workout(
            30,
            3
        );
    }
}
