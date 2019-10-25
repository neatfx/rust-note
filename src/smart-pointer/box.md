# 使用 `Box<T>` 在堆上存储数据

`Box<T>` 是最简单的智能指针类型，它允许将值放在堆上（ 留在栈上的则是指向堆数据的指针 ），除了提供间接存储和堆分配，并无其他额外的特殊功能，也没有这些功能带来的性能损失。

`Box<T>` 实现了 `Deref`、`Drop` 特质，其值可被当作引用对待，当值离开作用域时，`Box<T>` 实例指向的堆数据将被清除。

`Box<T>` 多用于以下场景：

- 在需要知道类型确切大小的上下文中使用一个编译时无法确定大小的类型（ 比如可以基于 `Box<T>` 提供的间接存储功能，实现编译时大小确定的递归类型 ）
- 在不使用复制的情况下转移大量数据的所有权（ 只有少量指针数据在栈上被复制，避免栈上复制大量数据产生不必要的性能损耗 ）
- 希望拥有一个实现了特定特质的任意类型的值（ 参阅 “面向对象特性” 部分中的 “为使用不同类型的值而设计的特质对象” 章节 ）

## 在堆上储存数据

```rust
fn main() {
    let b = Box::new(5); // 在堆上储存一个 i32 值
    println!("b = {}", b); // 像访问栈数据一样访问堆数据，正如拥有数据所有权的值那样
} // b 离开作用域并被释放（ 位于栈上 ），b 所指向的数据（ 位于堆上 ）也同时被释放
```

将一个单独的值存储在堆上的意义不大，通常是将其储存在栈上，但有些类型在不使用 `Box<T>` 的情况下无法定义，比如递归类型。

## 创建递归类型

Rust 需要在编译时知道类型占用多少空间，而递归类型（ recursive type ）无法在编译时知道确切大小。通过在递归类型定义中插入 `Box<T>`，可以在 Rust 中创建递归类型。

### 非递归类型的大小

枚举类型 `Message` 值的大小等于存储其最大成员的所需的空间大小

```rust
enum Message {
    Quit, // 不需要任何空间
    Move { x: i32, y: i32 }, // 需要足够储存两个 i32 值的空间
    Write(String),
    ChangeColor(i32, i32, i32),
}
```

### 编译时无确切大小的递归类型

`cons list` 是一个源于 Lisp 编程语言的数据结构，其每一项都包含两个元素：当前项的值、下一项。其最后一项的值仅包含一个叫做 `Nil` 的值，没有下一项。

在 `Lisp` 语言中，`cons` 函数以一个值和一个列表作为参数生成一个新的列表。

`cons list` 通过递归调用 `cons` 函数产生，遇到 `Nil` 值时递归结束，表示列表终止。

`cons list` 并非 Rust 中常见的类型，在 Rust 中创建列表的时候，`Vec<T>` 通常是一个更好的选择。

```rust
// 利用泛型，以下数据结构可以存放任何类型值
enum List {
    Cons(i32, List),
    Nil,
}
```

```rust
use List::{Cons, Nil};

fn main() {
    let list = Cons(1, Cons(2, Cons(3, Nil)));
}
```

编译以上代码会得到错误：

```rust
error[E0072]: recursive type `List` has infinite size
 --> src/main.rs:1:1
  |
1 | enum List {
  | ^^^^^^^^^ recursive type has infinite size
2 |     Cons(i32, List),
  |               ----- recursive without indirection
  |
  = help: insert indirection (e.g., a `Box`, `Rc`, or `&`) at some point to
  make `List` representable
```

错误信息表明 `List` 类型 “有无限的大小”，原因在于 `List` 的成员被定义为是递归的，当 Rust 编译器尝试计算出储存一个 `List` 枚举需要多少内存，会检查 `Cons` 成员，`Cons` 需要的空间等于 `i32` 的大小加上 `List` 的大小。为了计算 `List` 需要多少内存，编译器检查其成员，从 `Cons` 成员开始。`Cons` 成员储存了一个 `i32` 值和一个 `List` 值，计算将无限进行下去。这意味着 Rust 无法计算为了存放 `List` 的值到底需要多少空间。

编译信息也包含了建议， “indirection” 表明相比直接储存一个值应当间接的储存一个指向值的指针。

### 创建编译时具有确切大小的递归类型

`Box<T>` 是一个指针，其存储空间大小固定，不会随着其指向的堆数据量改变。因此可将 `Box` 作为 `Cons` 的下一项，`Box` 指向另一个位于堆上的 `List` 值（ 而不是存放在 `Cons` 成员中，`Cons` 成员所需空间也更少 ）。这种实现列表的方式更像是一个项挨着另一项，而不是一项包含另一项。

现在，编译器能够计算出 `List` 类型的大小 - **最多需一个 `i32` 的大小加上 `Box` 指针数据的大小**

```rust
enum List {
    Cons(i32, Box<List>),
    Nil,
}

use List::{Cons, Nil};

fn main() {
    let list = Cons(1,
        Box::new(Cons(2,
            Box::new(Cons(3,
                Box::new(Nil))))));
}
```
