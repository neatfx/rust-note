pub trait Animal {
    fn baby_name() -> String;
}

pub struct Dog;

impl Dog {
    pub fn baby_name() -> String {
        String::from("Spot")
    }
}

impl Animal for Dog {
    fn baby_name() -> String {
        String::from("puppy")
    }
}

fn main() {
    assert_eq!(Dog::baby_name(), "Spot");

    // 无法得到 puppy 输出，因为 Animal::baby_name 是关联方法，缺少 self，Rust 无法确定是哪一个实现，编译错误
    // println!("A baby dog is called a {}", Animal::baby_name());

    assert_eq!(<Dog as Animal>::baby_name(), "puppy");
}
