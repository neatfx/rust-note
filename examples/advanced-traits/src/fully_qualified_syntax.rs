pub mod fully_qualified_syntax {
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
}

#[cfg(test)]
mod tests {
  use super::fully_qualified_syntax::{Pilot, Wizard, Human};

  #[test]
  fn test() {
    let person = Human;

    assert_eq!(Pilot::fly(&person), "This is your captain speaking.");
    assert_eq!(Wizard::fly(&person), "Up!");

    // person.fly(&person); // 存在歧义，无法通过编译
    // Human::fly(&person); // 存在歧义，无法通过编译
  }
}