# 使用 `Box<T>` 指向堆数据

*box*（ 类型写作 `Box<T>` ）是最简单的智能指针，Boxes 允许将数据存储到堆上而不是栈上。留在栈上的是指向堆数据的指针。

除了将其数据保存到堆内存以外，Boxes 没有性能开销，不过也没有其他额外功能。一般常用于以下情况：

- 希望在某个要求值具有确切大小的上下文中使用编译时无法确知大小的类型（ “使用 Boxes 创建递归类型” 部分将对此进行演示 ）
- 在不使用复制的情况下转移大量数据的所有权（ 转移大量数据的所有权会花费很长时间，因为数据在栈内存中来回复制。要想提高性能，可以将数据保存到堆上的 box 中。然后，只需要对少量指针数据进行栈内复制，指针所指向的堆数据位置不变。）
- 希望拥有一个值，只关心它是实现了某个指定特质的类型而不在乎它的具体类型是什么（ 这种情况被称为特质对象 *trait object*，可参阅 “面向对象编程特性” 章节中的 “使用特质对象允许值具有不同类型”，本章介绍的内容还会用到 ）

## 使用 `Box<T>` 在堆上储存数据

```rust
fn main() {
    // 变量 b 拥有 Box 的值，该值（ 栈内存中存储的指针 ）指向保存在堆内存中的 i32 值
    let b = Box::new(5); // 在堆上储存一个 i32 值
    println!("b = {}", b); // 像访问栈数据一样访问堆数据，就像拥有该值一样
} // b （ Box ）离开作用域并被释放（ 位于栈上 ），b 所指向的数据（ 位于堆上 ）也将被释放
```

将单独一个值存储在堆上的用处不大，因此像这样使用 Boxes 并不常见。通常是将其储存在栈上，但有些类型在不使用 `Box` 的情况下无法定义，比如递归类型。

## 使用 `Boxes` 创建递归类型

Rust 需要在编译时知道类型占用的空间大小，而递归类型（ recursive type，一个值拥有另一个同类型的值作为它的一部分 ）的大小在编译时是无法确知的。Rust 不知道存储一个递归类型的值需要多少空间。而 Boxes 具有确定的大小，因此通过在递归类型定义中插入 `box`，可以在 Rust 中创建递归类型。

### `Cons List`

用作递归类型示例的 *cons list* 是函数式编程语言中常见的数据结构。除了递归部分，下面将要定义的 `cons list` 类型非常简单；因而，不论何时，当遭遇递归类型有关的复杂状况时，这里的概念都能派上用场。

`cons list` 是一个源于 Lisp 编程语言及其方言的数据结构。在 Lisp 语言中，`cons` 函数（ “construct function” 的简写 ）以一个值和一个列表作为参数生成一个新的值对。值对包含值对最终形成了列表。

`cons list` 中的每一项都包含两个元素：当前项的值、下一项。列表的最后一项仅包含一个叫做 `Nil` 的值，没有下一项。`cons list` 通过递归调用 `cons` 函数产生。递归中规定用来表示结束的成员名称是 `Nil`。注意 `Nil` 与 `null` 或者 `nil` 不一样，`null` 或者 `nil` 是无效或者缺失的值。

尽管在函数式语言中经常使用，但 `cons list` 并非 Rust 中常用的数据结构，在 Rust 中创建项目列表的时候，`Vec<T>` 通常是一个更好的选择。

```rust
// 使用枚举定义一个 cons list 数据结构
// 当前实现的 cons list 只能持有 i32 值，也可以使用泛型来实现此 List 以支持任意类型
// 代码还不能通过编译，因为 List 类型的大小不确定
enum List {
    Cons(i32, List),
    Nil,
}
```

使用 List 类型存储列表 `1, 2, 3` 的示例：

```rust
use List::{Cons, Nil};

fn main() {
    // 第一个 Cons 值包含 1 以及另一个 List 值
    // 第一个 List 值同样是一个 Cons 值，包含 2 以及另一个 List 值
    // 第二个 List 值包含 3 以及一个用于表示列表结束的非递归变体 Nil
    let list = Cons(1, Cons(2, Cons(3, Nil)));
}
```

编译以上代码得到错误：

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

错误信息表明 `List` 类型 “有无限的大小”，原因在于 `List` 的定义中包含递归：它直接持有自身另外一个值。Rust 因而无从得知储存一个 `List` 值需要多少空间。在修复代码错误之前，先看一下 Rust 是如何决定存储非递归类型值所需空间大小的。

### 计算非递归类型的大小

因为只有一个变体会被使用，所以存储其最大变体所需的空间即枚举类型 `Message` 值所需的最大空间

```rust
enum Message {
    Quit, // 不需要任何空间
    Move { x: i32, y: i32 }, // 需要能储存两个 i32 值的空间
    Write(String),
    ChangeColor(i32, i32, i32),
}
```

再来看 Rust 计算递归类型大小时的情况。编译器从包含 i32 值以及 List 类型值的 Cons 变体开始。存储 Cons 所需空间等于一个 i32 的大小加上 List 的大小。要计算 List 所需内存的数量，编译器再次从一个 Cons 变体开始查找。Cons 变体包含一个 i32 类型以及一个 List 类型值 - 此过程将无限持续下去：

![](images/../../images/smart-pointer/trpl15-01.svg)

### 使用 `Box<T>` 创建编译时具有确切大小的递归类型

在之前的错误信息中也包含了有用的建议：

```shell
  = help: insert indirection (e.g., a `Box`, `Rc`, or `&`) at some point to
  make `List` representable
```

`indirection` 表示我们将改变数据结构，通过保存值的指针间接存储值来代替直接储存值。

`Box<T>` 是一个指针，其大小固定，不会随其指向的堆数据量改变。因此可将 `Box<T>` 放进 `Cons` 变体以直接代替 `List` 值，`Box<T>` 指向位于堆上而不是 `Cons` 变体内部的下一个 `List` 值。概念上，我们仍然会创建一个 `list`（ 列表包含另一个列表 ），但是这种实现方式更像是项挨着项，而不是项包含项。

改进代码：

```rust
enum List {
    Cons(i32, Box<List>),
    Nil,
}

use crate::List::{Cons, Nil};

fn main() {
    let list = Cons(1,
        Box::new(Cons(2,
            Box::new(Cons(3,
                Box::new(Nil))))));
}
```

通过使用 `box`，打破了无限递归调用链，编译器因而能够计算出存储 `List` 类型值所需的内存大小。任何 List 值最大等于一个 `i32` 的大小加上一个 `box` 指针数据的大小。

![](images/../../images/smart-pointer/trpl15-02.svg)

Boxes 仅仅提供了间接堆数据存储，没有任何像其它智能指针类型那样的特殊功能。也没有这些特殊功能带来的性能开销，所以 Boxes 可用于像 `cons list` 这样的，间接数据存储是唯一功能需求的场景。

`Box<T>` 类型是一个智能指针类型，因为它实现了 `Deref` 特质，允许我们将其值当作常规引用一样进行操作。并且由于 `Box<T>` 实现了 `Drop` 特质，当值离开作用域时，`box` 指向的堆数据将被一同清理。
