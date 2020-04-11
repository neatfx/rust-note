pub mod supertrait {
  use std::fmt;

  pub trait OutlinePrint: fmt::Display {
      fn outline_print(&self) -> String {
          let output = self.to_string();
          let len = output.len();
          println!("{}", "*".repeat(len + 4));
          println!("*{}*", " ".repeat(len + 2));
          println!("* {} *", output);
          println!("*{}*", " ".repeat(len + 2));
          println!("{}", "*".repeat(len + 4));
          String::from("******")
      }
  }

  pub struct Point {
    pub x: i32,
    pub y: i32,
  }

  impl fmt::Display for Point {
      fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
          write!(f, "({}, {})", self.x, self.y)
      }
  }

  impl OutlinePrint for Point {}
}

#[cfg(test)]
mod tests {
  use super::supertrait::{Point, OutlinePrint};

  #[test]
  fn test() {  
    let pt = Point { x:1, y:3 };
    assert_eq!(pt.outline_print(), "******");
  }
}