# 利用 `Deref` 特质将智能指针当作常规引用

解引用操作符 `*`（ dereference operator ），实现 `Deref` 特质允许对解引用操作符的行为进行定制。通过此种方式实现 `Deref` 特质，智能指针可被当作常规引用进行操作，你可以编写同时适用于引用和智能指针的代码。

下面将要包含的内容：

- 解引用操作符如何与常规引用一起工作
- 定义一个与 `Box<T>` 表现相似的类型，观察为什么解引用操作符在新定义类型上未能像引用一样正常工作
- 如何实现 `Deref` 特质并使智能指针以与引用相似的方式工作
- 引用或者智能指针使用过程中的强制解引用

注意：将要创建的 `MyBox<T>` 类型与真实的 `Box<T>` 类型存在一个很大的区别：我们自创的版本不会将数据保存到堆内存。我们重点关注示例的 `Deref` 部分，因此数据存放的位置不如类指针的行为重要。

通过解引用操作符可以获取以下指针类型指向的值：

- 常规引用
- 内置智能指针
- 自定义智能指针

## 使用解引用操作符获取指针指向的值

### 常规引用（ 常规指针类型 ）解引用

```rust
fn main() {
    let x = 5;
    let y = &x; // 指向 x 的引用

    assert_eq!(5, x);
    assert_eq!(5, *y); // 解引用操作获得 y 指向的值，这里是 5
}
```

如果在代码中使用 `assert_eq!(5, y);` 将会得到编译错误：

```shell
error[E0277]: can't compare `{integer}` with `&{integer}`
 --> src/main.rs:6:5
  |
6 |     assert_eq!(5, y);
  |     ^^^^^^^^^^^^^^^^^ no implementation for `{integer} == &{integer}`
  |
  = help: the trait `std::cmp::PartialEq<&{integer}>` is not implemented for
  `{integer}`
```

将数字和引用两种不同的类型进行比较是不允许的。必须使用解引用操作符来获取引用指向的值。

### 内置智能指针类型解引用

像常规引用一样使用内置智能指针 `Box<T>`

```rust
fn main() {
    let x = 5;
    let y = Box::new(x);

    assert_eq!(5, x);
    assert_eq!(5, *y);
}
```

### 自定义智能指针类型解引用

```rust
struct MyBox<T>(T);

impl<T> MyBox<T> {
    fn new(x: T) -> MyBox<T> {
        MyBox(x)
    }
}

fn main() {
    let x = 5;
    let y = MyBox::new(x);

    assert_eq!(5, x);
    assert_eq!(5, *y);
}
```

运行代码：

```shell
error[E0614]: type `MyBox<{integer}>` cannot be dereferenced
  --> src/main.rs:14:19
   |
14 |     assert_eq!(5, *y);
   |                   ^^
```

`MyBox<T>` 类型无法被解引用是因为未在类型定义中实现相关功能。要想使用 `*` 操作符对自定义智能指针类型进行解引用，需要为其实现 `Deref` 特质。

#### 为自定义智能指针实现 `Deref` 特质

实现某个特质，需要为其要求的方法提供实现。标准库提供的 `Deref` 特质，要求实现一个名为 `deref` 的方法，该方法借用 `self` 并且返回一个内部数据的引用。

```rust
use std::ops::Deref;

struct MyBox<T>(T);

impl<T> MyBox<T> {
    fn new(x: T) -> MyBox<T> {
        MyBox(x)
    }
}

impl<T> Deref for MyBox<T> {
    type Target = T; // 定义关联类型供 Deref 特质使用

    fn deref(&self) -> &T {
        &self.0 // 返回希望通过 * 运算符访问的值的引用
    }
}

fn main() {
    let x = 5;
    let y = MyBox::new(x);

    assert_eq!(5, x);
    assert_eq!(5, *y);
}
```

`type Target = T;` 定义了关联类型供 `Deref` 特质使用。关联类型是一种稍微有些不同的泛型参数声明方式，我们将在 “高级特性” 章节对其进行详细介绍。

缺少 `Deref` 特质的情况下，编译器只会解引用 `&` 引用，而无法对 `MyBox<T>` （ 非引用类型 ）进行解引用，从而导致编译错误。`deref` 方法赋予编译器获取任意实现了 `Deref` 特质的类型的值以及调用 `deref` 方法得到一个 `&` 引用（ 方法知道如何解引用 ）的能力。

在 Rust 内部，解引用操作 `*y` 实际上运行的是：

```rust
*(y.deref())
```

Rust 使用 *调用 `deref` 方法之后进行一个简单的解引用* 替换了 `*` 操作符，因此不必考虑是否需要调用 `deref` 方法。这个 Rust 特性使我们编写代码具有一致性，不论面对的是一个常规引用还是一个实现了 `Deref` 特质的类型。

`deref` 方法返回一个值的引用以及 `*(y.deref())` 中括弧外部的简单解引用仍然有必要的原因在于 Rust 的所有权系统。如果 `deref` 方法直接返回值而不是值的引用，值将会被移出 `self`。而我们并不想获得内部值的所有权，不管是本例中的 `MyBox<T>`，还是在使用解引用操作符的大多数用例中。

注意，每次在代码中使用 `*` 时，`*` 操作符仅被 *调用 `deref` 方法后调用 `*` 操作符* 替换了一次。因为对 `*` 操作符的替换不是无限递归的，代码示例中最终使用了 `i32` 类型的数据，与 `assert_eq!` 中的 5 匹配。

## 隐式解引用强制多态

### 函数或方法传参时的隐式解引用强制多态

将实现了 `Deref` 的类型的引用转换为原始类型通过 `Deref` 所能够转换的类型的引用

传递与形参类型不同的特定类型实参（ 实现了 `Deref` 的类型的引用 ）时，解引用强制多态自动发生，通过一系列 `deref` 方法调用，实参类型被转换成形参类型。这种隐式转换无需过多的显式引用和解引用，也使得编写同时作用于引用或智能指针的代码更容易。

```rust
use std::ops::Deref;

struct MyBox<T>(T);

impl<T> MyBox<T> {
    fn new(x: T) -> MyBox<T> {
        MyBox(x)
    }
}

impl<T> Deref for MyBox<T> {
    type Target = T;

    fn deref(&self) -> &T {
        &self.0
    }
}

fn hello(name: &str) {
    println!("Hello, {}!", name);
}

fn main() {
    let m = MyBox::new(String::from("Rust"));
    hello("Rust"); // 字符串 slice 作为参数
    hello(&(*m)[..]); // 如果没有解引用强制多态支持，需编写晦涩的转换代码
    hello(&m); // 解引用强制多态，直接使用 MyBox<String> 类型值的引用作为参数
}
```

#### 缺少解引用强制多态支持的情况

`(*m)` 将 `MyBox<String>` 解引用为 String。接着 `&` 和 `[..]` 获取了整个 String 的字符串 slice 来匹配 hello 的签名，所有这些符号混在一起难以读写和理解。

#### 解引用强制多态的处理过程

`MyBox<T>` 实现了 `Deref` 特质，Rust 通过调用 `deref` 将 `&MyBox<String>` 转换为 `&String`，标准库中提供了 `String` 上的 `Deref` 实现（ 返回字符串 slice ），Rust 再次调用 `deref` 将 `&String` 变为 `&str`，从而符合 `hello` 函数的定义。

#### 性能提示

当类型实现了 `Deref` 特质，Rust 会分析这些类型并使用任意多次 `Deref::deref` 调用以获得匹配参数的类型。这些解析都发生在编译时，所以解引用强制多态没有运行时性能损失。

## 解引用强制多态与可变性的交互方式

- 重载不可变引用的 `*` 运算符 ---> 实现 `Deref` 特质
- 重载可变引用的 `*` 运算符 ---> 实现 `DerefMut` 特质

Rust 在发现以下三种情况时会进行解引用强制多态：

- 当 `T: Deref<Target=U>` 时，从 `&T` 到 `&U`
- 当 `T: DerefMut<Target=U>` 时，从 `&mut T` 到 `&mut U`
- 当 `T: Deref<Target=U>` 时，从 `&mut T` 到 `&U`

前两种情况除了可变性之外是相同的：

### 第一种情况

如果有一个 `&T`，而 `T` 实现了返回 `U` 类型的 `Deref`，则可以直接得到 `&U`

### 第二种情况

对于可变引用有着与不可变引用相同的行为

### 第三种情况

> 如果有一个可变引用，其必须是这些数据的唯一引用，否则程序将无法编译

根据上述借用规则，可变引用能够转换为不可变引用（ 永远不会违背借用规则 ），反之是不可能的。
将不可变引用转换为可变引用需要数据只能有一个不可变引用，而借用规则无法保证这一点。
因此，Rust 无法假设将不可变引用转换为可变引用是可能的。
