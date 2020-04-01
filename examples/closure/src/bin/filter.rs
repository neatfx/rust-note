pub mod shoes_filter {
    #[derive(PartialEq, Debug)]
    pub struct Shoe {
        pub size: u32,
        pub style: String,
    }

    // 获取 shoes 的所有权和鞋号作为参数，返回一个只包含指定鞋号鞋子的 vector
    pub fn shoes_in_my_size(shoes: Vec<Shoe>, shoe_size: u32) -> Vec<Shoe> {
        // 此处用了 into_iter 方法创建了一个获取 vector 所有权的迭代器
        // 接着调用 filter 将此迭代器适配为一个只包含那些闭包运行返回结果为 true 的元素的新迭代器
        shoes.into_iter()
            // 此处使用闭包对环境中的变量 shoe_size 进行捕获
            // 并使用其值与 shoes 中每一项的 size 进行比较，只保留比较结果为 true 的项
            .filter(|s| s.size == shoe_size)
            .collect() // 调用 collect 将迭代器适配器返回的值收集进一个 vector 并返回
    }
}

fn main() {}

#[cfg(test)]
mod tests {
  use crate::shoes_filter::{Shoe, shoes_in_my_size};

  #[test]
  fn filters_by_size() {
      let shoes = vec![
          Shoe { size: 10, style: String::from("sneaker") },
          Shoe { size: 13, style: String::from("sandal") },
          Shoe { size: 10, style: String::from("boot") },
      ];

      let in_my_size = shoes_in_my_size(shoes, 10);

      assert_eq!(
          in_my_size,
          vec![
              Shoe { size: 10, style: String::from("sneaker") },
              Shoe { size: 10, style: String::from("boot") },
          ]
      );
  }
}