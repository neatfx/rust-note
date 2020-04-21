pub trait Pilot {
    fn fly(&self) -> String;
}

pub trait Wizard {
    fn fly(&self) -> String;
}

pub struct Human;

impl Pilot for Human {
    fn fly(&self) -> String {
        String::from("This is your captain speaking.")
    }
}

impl Wizard for Human {
    fn fly(&self) -> String {
        String::from("Up!")
    }
}

impl Human {
    fn fly(&self) -> String {
        String::from("*waving arms furiously*")
    }
}

fn main() {
    let person = Human;

    assert_eq!(Pilot::fly(&person), "This is your captain speaking.");
    assert_eq!(Wizard::fly(&person), "Up!");

    // person.fly(&person); // 存在歧义，无法通过编译
    // Human::fly(&person); // 存在歧义，无法通过编译
}
