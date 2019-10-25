# 利用 `Deref` 特质进行常规引用操作

## 解引用

解引用运算符 `*`（ dereference operator ）

通过解引用运算符可以追踪以下指针类型的值：

- 常规引用
- 内置智能指针
- 自定义智能指针（ 通过实现 `Deref` 特质重载解引用运算符，从而可当作常规引用进行操作 ）

### 常规引用

```rust
fn main() {
    let x = 5;
    let y = &x; // 引用

    assert_eq!(5, x);

    // 编译错误: can't compare `{integer}` with `&{integer}`
    // assert_eq!(5, y);

    assert_eq!(5, *y); // 解引用
}
```

### 智能指针

```rust
fn main() {
    let x = 5;
    let y = Box::new(x);

    assert_eq!(5, x);
    assert_eq!(5, *y);
}
```

### 自定义智能指针

```rust
use std::ops::Deref;

struct MyBox<T>(T);

impl<T> MyBox<T> {
    fn new(x: T) -> MyBox<T> {
        MyBox(x)
    }
}

// impl<T> Deref for MyBox<T> {
//     type Target = T; // 定义关联类型

//     fn deref(&self) -> &T {
//         &self.0 // 返回希望通过 * 运算符访问的值的引用
//     }
// }

fn main() {
    let x = 5;
    let y = MyBox::new(x);

    assert_eq!(5, x);

    // 编译错误: type `MyBox<{integer}>` cannot be dereferenced
    assert_eq!(5, *y);
}
```

没有 `Deref` 特质的情况下，编译器只会解引用 `&` 引用类型。因此 Rust 无法对 `MyBox<T>` （ 非引用类型 ）进行解引用，导致编译时错误。

任何实现了 `Deref` 特质的类型，编译器通过 `deref` 方法可以获取：

- 类型的值
- 一个内部数据的 `&` 引用（ 类型知道如何将其解引用 ）

在 Rust 内部， 解引用操作 `*y` 将被转换为 `*(y.deref())` ( 调用 `deref` 方法后直接引用 ）

#### 代码修正

将实现 `Deref` 特质部分的代码取消注释即可通过编译

#### 所有权规范

- `deref` 方法的返回结果为值的引用（ 如果直接返回值，值的所有权将被移出 `self` ）
- 底层转换 `*(y.deref())` 采用普通解引用的形式

这是因为，多数情况下，使用解引用运算符的时候不需要获取 `MyBox<T>` 内部值的所有权

## 解引用强制多态

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

### 解引用强制多态如何与可变性交互

- 重载不可变引用的 `*` 运算符 ---> 实现 `Deref` 特质
- 重载可变引用的 `*` 运算符 ---> 实现 `DerefMut` 特质

Rust 在发现以下三种情况时会进行解引用强制多态：

- 当 `T: Deref<Target=U>` 时，从 `&T` 到 `&U`
- 当 `T: DerefMut<Target=U>` 时，从 `&mut T` 到 `&mut U`
- 当 `T: Deref<Target=U>` 时，从 `&mut T` 到 `&U`

前两种情况除了可变性之外是相同的：

#### 第一种情况

如果有一个 `&T`，而 `T` 实现了返回 `U` 类型的 `Deref`，则可以直接得到 `&U`

#### 第二种情况

对于可变引用有着与不可变引用相同的行为

#### 第三种情况

> 如果有一个可变引用，其必须是这些数据的唯一引用，否则程序将无法编译

根据上述借用规则，可变引用能够转换为不可变引用（ 永远不会违背借用规则 ），反之是不可能的。
将不可变引用转换为可变引用需要数据只能有一个不可变引用，而借用规则无法保证这一点。
因此，Rust 无法假设将不可变引用转换为可变引用是可能的。
