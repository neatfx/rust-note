pub mod fully_qualified_syntax {
  pub trait Pilot {
    fn fly(&self);
  }

  pub trait Wizard {
    fn fly(&self);
  }

  pub struct Human;

  impl Pilot for Human {
    fn fly(&self) {
        println!("This is your captain speaking.");
    }
  }

  impl Wizard for Human {
    fn fly(&self) {
        println!("Up!");
    }
  }

  impl Human {
    fn fly(&self) {
        println!("*waving arms furiously*");
    }
  }
}

#[cfg(test)]
mod tests {
  use super::fully_qualified_syntax::{Pilot, Wizard, Human};

  #[test]
  fn test() {
    let person = Human;

    Pilot::fly(&person);
    Wizard::fly(&person);

    // person.fly(&person); // 存在歧义，无法通过编译
    // Human::fly(&person); // 存在歧义，无法通过编译
  }
}