// Rust 不允许创建自定义运算符或重载任意运算符
// 但是，可通过实现与运算符关联的特质来对运算符默认定义的操作进行自定义

// Add 特质是与 + 运算符关联的特质，其默认实现如下：
// trait Add<RHS=Self> {
//     type Output;

//     fn add(self, rhs: RHS) -> Self::Output;
// }

use std::ops::Add;

#[derive(Debug, PartialEq)]
pub struct Point {
    pub x: i32,
    pub y: i32,
}

#[derive(Debug, PartialEq)]
pub struct Millimeters(pub u32);
pub struct Meters(pub u32);

// 使用默认的 `RHS` 类型参数
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

// 指定 `RHS` 类型参数的值为 Meters 以覆盖默认的 `Self`
impl Add<Meters> for Millimeters {
    type Output = Millimeters;

    fn add(self, other: Meters) -> Millimeters {
        Millimeters(self.0 + (other.0 * 1000))
    }
}

fn main() {
    assert_eq!(
        Point { x: 1, y: 0 } + Point { x: 2, y: 3 },
        Point { x: 3, y: 3 }
    );
    assert_eq!(Millimeters(1000) + Meters(2), Millimeters(3000));
}
