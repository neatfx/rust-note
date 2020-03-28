use std::rc::Rc;
use std::cell::RefCell;
use crate::List::{Cons, Nil};

#[derive(Debug)]
enum List {
    // 我们希望能够修改 Cons 变体指向的 List 值，因而此处使用了 `RefCell<Rc<List>>` 类型
    Cons(i32, RefCell<Rc<List>>),
    Nil,
}

impl List {
    // 增加此方法来提供对 Cons 变体第二项的便捷访问
    fn tail(&self) -> Option<&RefCell<Rc<List>>> {
        match self {
            Cons(_, item) => Some(item), // 模式匹配
            Nil => None,
        }
    }
}

fn main() {
    // 在 a 中创建一个包含 `Rc<List>` 实例的列表
    let a = Rc::new(Cons(5, RefCell::new(Rc::new(Nil))));

    println!("a initial rc count = {}", Rc::strong_count(&a));
    println!("a next item = {:?}", a.tail());

    // 在 b 中创建一个指向 a 中列表的列表
    let b = Rc::new(Cons(10, RefCell::new(Rc::clone(&a))));

    println!("a rc count after b creation = {}", Rc::strong_count(&a));
    println!("b initial rc count = {}", Rc::strong_count(&b));
    println!("b next item = {:?}", b.tail());

    // 修改 a 中的列表，使其指向 b，从而创建一个循环引用：
    // 使用 tail 方法获取一个到 a 中 `RefCell<Rc<List>>` 的引用，并放入变量 link 中
    // 然后调用 `RefCell<Rc<List>>` 上的 `borrow_mut` 方法
    // 将其内部值从之前的持有 `Nil` 值的 `Rc<List>` 修改为 b 中的 `Rc<List>`
    if let Some(link) = a.tail() {
        *link.borrow_mut() = Rc::clone(&b);
    }

    println!("b rc count after changing a = {}", Rc::strong_count(&b));
    println!("a rc count after changing a = {}", Rc::strong_count(&a));

    // println!("a next item = {:?}", a.tail()); // 取消该行注释将导致栈溢出！
}