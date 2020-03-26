# 引用计数智能指针 `Rc<T>`

引用计数智能指针允许值有多个所有者，对值的所有者进行计数，并在计数为 0 时负责清理数据。

大部分情况下所有权是非常明确的，可以准确的知道哪个变量拥有某个值。然而，有些情况下单个值可能会有多个所有者。Rust 通过 `Rc<T>` 类型启用多所有权，`Rc` 为引用计数（ reference counting ）的缩写，引用计数意味着通过记录值的引用数量来判断值是否仍被使用。如果某个值有 0 个引用，则表示其没有任何有效引用并可以被清理。

## 适用场景

适用于当希望在堆上分配内存供程序的多个部分读取，且无法在编译时确定程序的哪一部分会最后结束使用它的时候。如果明确知道哪部分会结束使用的话，就可以令其成为数据的所有者同时正常的所有权规则就可以在编译时生效。

仅适用于单线程场景

## 共享数据

```rust
enum List {
    Cons(i32, Box<List>),
    Nil,
}

use List::{Cons, Nil};

fn main() {
    let a = Cons(5,
        Box::new(Cons(10,
            Box::new(Nil))));
    let b = Cons(3, Box::new(a));
    let c = Cons(4, Box::new(a));
}
```

编译错误：

```shell
error[E0382]: use of moved value: `a`
  --> src/main.rs:13:30
   |
12 |     let b = Cons(3, Box::new(a));
   |                              - value moved here
13 |     let c = Cons(4, Box::new(a));
   |                              ^ value used here after move
   |
   = note: move occurs because `a` has type `List`, which does not implement
   the `Copy` trait
```

Cons 成员拥有其储存的数据，所以当创建 b 列表时，a 被移动进了 b 这样 b 就拥有了 a。接着当再次尝使用 a 创建 c 时，这不被允许因为 a 的所有权已经被移动。

可以改变 Cons 的定义来存放一个引用，不过接着必须指定生命周期参数。通过指定生命周期参数，表明列表中的每一个元素都至少与列表本身存在的一样久。例如，借用检查器不会允许 let a = Cons(10, &Nil); 编译，因为临时值 Nil 会在 a 获取其引用之前就被丢弃了。

相反，我们修改 List 的定义为使用 `Rc<T>` 代替 `Box<T>`，如列表 15-18 所示。现在每一个 Cons 变量都包含一个值和一个指向 List 的 Rc。当创建 b 时，不同于获取 a 的所有权，这里会克隆 a 所包含的 Rc，这会将引用计数从 1 增加到 2 并允许 a 和 b 共享 Rc 中数据的所有权。创建 c 时也会克隆 a，这会将引用计数从 2 增加为 3。每次调用 Rc::clone，Rc 中数据的引用计数都会增加，直到有零个引用之前其数据都不会被清理。

```rust
enum List {
    Cons(i32, Rc<List>),
    Nil,
}

use List::{Cons, Nil};
use std::rc::Rc;

fn main() {
    let a = Rc::new(Cons(5, Rc::new(Cons(10, Rc::new(Nil)))));
    let b = Cons(3, Rc::clone(&a));
    let c = Cons(4, Rc::clone(&a));
}
```

需要使用 use 语句将 `Rc<T>` 引入作用域因为它不在 prelude 中。在 main 中创建了存放 5 和 10 的列表并将其存放在 a 的新的 `Rc<List>` 中。接着当创建 b 和 c 时，调用 Rc::clone 函数并传递 a 中 `Rc<List>` 的引用作为参数。

也可以调用 a.clone() 而不是 Rc::clone(&a)，不过在这里 Rust 的习惯是使用 Rc::clone。Rc::clone 的实现并不像大部分类型的 clone 实现那样对所有数据进行深拷贝。Rc::clone 只会增加引用计数，这并不会花费多少时间。深拷贝可能会花费很长时间。通过使用 Rc::clone 进行引用计数，可以明显的区别深拷贝类的克隆和增加引用计数类的克隆。当查找代码中的性能问题时，只需考虑深拷贝类的克隆而无需考虑 Rc::clone 调用。

## 引用计数

```rust
enum List {
    Cons(i32, Rc<List>),
    Nil,
}

use List::{Cons, Nil};
use std::rc::Rc;

fn main() {
    let a = Rc::new(Cons(5, Rc::new(Cons(10, Rc::new(Nil)))));
    println!("count after creating a = {}", Rc::strong_count(&a));
    let b = Cons(3, Rc::clone(&a));
    println!("count after creating b = {}", Rc::strong_count(&a));
    {
        let c = Cons(4, Rc::clone(&a));
        println!("count after creating c = {}", Rc::strong_count(&a));
    }
    println!("count after c goes out of scope = {}", Rc::strong_count(&a));
}
```

通过调用 `Rc::strong_count` 函数可以获得引用计数。这个函数叫做 `strong_count` 而不是 `count` 是因为 `Rc<T>` 也有 `weak_count`（ 在 “避免引用循环” 部分会讲解 `weak_count` 的用途 ）

代码输出结果：

```shell
count after creating a = 1
count after creating b = 2
count after creating c = 3
count after c goes out of scope = 2
```

a 中 `Rc<List>` 的初始引用计数为 1，每次调用 `clone` 计数加 1，当 c 离开作用域时，计数减 1（ 由 `Drop` 特质实现当 `Rc<T>` 值离开作用域时自动减少引用计数 ），在 `main` 的结尾，当 `b` 、 `a` 离开作用域时，计数变为 0，同时 `Rc` 被完全清理。使用 `Rc` 允许一个值有多个所有者，引用计数则确保只要还存在所有者其值也将保持有效。

`Rc<T>` 允许通过不可变引用来只读的在程序的多个部分共享数据。如果 `Rc<T>` 也允许多个可变引用，则会违反下面的借用规则之一：

> 相同位置的多个可变借用可能造成数据竞争和不一致
