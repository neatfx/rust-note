// Rust 不允许创建自定义运算符或重载任意运算符
// 但是，可通过实现与运算符关联的特质来对运算符默认定义的操作进行自定义
// 示例中，Add 特质是与 + 运算符关联的特质

pub mod point {
  use std::ops::Add;

  #[derive(Debug, PartialEq)]
  pub struct Point {
      pub x: i32,
      pub y: i32,
  }

  impl Add for Point {
      // `Add` 特质有一个名为 `Output` 的关联类型，用来决定 `add` 方法的返回类型
      type Output = Point;

      // `add` 方法将两个 `Point` 实例的 `x` 值和 `y` 值分别相加来创建一个新的 `Point`
      fn add(self, other: Point) -> Point {
          Point {
              x: self.x + other.x,
              y: self.y + other.y,
          }
      }
  }
}

#[cfg(test)]
mod tests {
  use super::point::Point;

  #[test]
  fn operator_overloading_test() {  
      assert_eq!(Point { x: 1, y: 0 } + Point { x: 2, y: 3 },
                Point { x: 3, y: 3 });
  }
}