# 枚举

枚举（ Enumeration ）通过列举可能的值的方式来定义一个类型

## 定义枚举

```rust
enum IpAddrKind {
    V4, // 枚举成员
    V6, // 枚举成员
}

let four = IpAddrKind::V4; // 枚举实例
let six = IpAddrKind::V6; // 枚举实例
```

### 枚举成员的类型

```rust
fn route(ip_type: IpAddrKind) { }

// IpAddrKind::V4 和 IpAddrKind::V6 都是 IpAddrKind 类型
route(IpAddrKind::V4);
route(IpAddrKind::V6);
```

### 将枚举成员与值相关联

通过结构体实现

```rust
struct IpAddr {
    kind: IpAddrKind,
    address: String,
}

let home = IpAddr {
    kind: IpAddrKind::V4,
    address: String::from("127.0.0.1"),
};

let loopback = IpAddr {
    kind: IpAddrKind::V6,
    address: String::from("::1"),
};
```

### 将数据直接放入枚举成员

直接将数据附加到枚举的成员，不再需要额外的结构体：

```rust
enum IpAddr {
    V4(String),
    V6(String),
}

let home = IpAddr::V4(String::from("127.0.0.1"));
let loopback = IpAddr::V6(String::from("::1"));
```

使用枚举替代结构体还有一个优势就是每个成员可以处理不同类型和数量的数据：

```rust
enum IpAddr {
    V4(u8, u8, u8, u8),
    V6(String),
}

let home = IpAddr::V4(127, 0, 0, 1);
let loopback = IpAddr::V6(String::from("::1"));
```

## 存储不同数量和类型的关联值

### 定义有关联值的枚举

```rust
enum Message {
    Quit, // 没有关联任何数据
    Move { x: i32, y: i32 }, // 包含一个匿名结构体
    Write(String), // 包含单独一个 String
    ChangeColor(i32, i32, i32), // 包含三个 i32
}
```

### 定义多个不同类型的结构体

```rust
struct QuitMessage; // 类单元结构体
struct MoveMessage {
    x: i32,
    y: i32,
}
struct WriteMessage(String); // 元组结构体
struct ChangeColorMessage(i32, i32, i32); // 元组结构体
```

尽管使用不同的结构体，也可以实现存储不同数量类型的关联值，但枚举是单独一个类型，而不同的结构体具有不同的类型，很难定义一个能够处理这些不同类型的结构体的函数。

## 在枚举上定义方法

```rust
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(i32, i32, i32),
}

impl Message {
    fn call(&self) {
        // 在这里定义方法体
    }
}

let m = Message::Write(String::from("hello"));
m.call();
```

## `IpAddr` 枚举

以 `IpAddr` 为例，可以看出

- 标准库中枚举类型的实现也并没有想象中的复杂
- 可将任意类型数据放入枚举成员中，例如字符串、数字类型或者结构体，甚至可以包含另一个枚举。

```rust
struct Ipv4Addr {
    // --snip--
}

struct Ipv6Addr {
    // --snip--
}

enum IpAddr {
    V4(Ipv4Addr),
    V6(Ipv6Addr),
}
```

## `Option<T>` 枚举

空值（ Null ）是一个值，它代表没有值。有空值的语言中，变量总是处于空值和非空值两种状态之一。

尽管没有其他语言中的空值功能，不过 Rust 标准库中提供了表示编码存在或不存在概念的枚举类型 `Option<T>`，它表示一个值要么是某个值要么什么都不是。`Option<T>` 枚举的作用非常重要，因此被包含在了 `prelude` 之中，不需要显式引入。其成员 `Some` 和 `None` 也可以直接使用（ 不需要 `Option::` 前缀 ）。即便如此 `Option<T>` 仍是常规枚举，`Some(T)` 和 `None` 是其成员。

```rust
enum Option<T> {
    Some(T),
    None,
}
```

当有 `Some` 值时，我们就知道存在一个值，而这个值保存在 `Some` 中。当有个 `None` 值时，在某种意义上，它跟空值具有相同的意义：并没有一个有效的值。

如果使用 `None` 而不是 `Some`，需要告诉 Rust `Option<T>` 是什么类型的，因为编译器只通过 `None` 值无法推断出 `Some` 成员保存的值的类型。

### 使用 `Option<T>` 相比空值的优势

`Option<T>` 和 `T` 是不同的类型，编译器不允许像使用一个确定有效的值那样使用 `Option<T>`

运行以下代码，将得到错误：

```rust
let x: i8 = 5;
let y: Option<i8> = Some(5);

let sum = x + y;
```

当在 Rust 中使用 `i8` 这样类型的值时，编译器确保它总是有一个有效的值，可放心使用而无需做空值检查。只有当使用 `Option<i8>`（ `Option<T>` ）的时候需要担心可能没有值，而编译器会确保我们在使用值之前处理了为空的情况。也就是说，在对 `Option<T>` 进行 `T` 的运算之前必须将其转换为 `T`，这将帮助我们捕获到空值最常见的问题之一：假设某值不为空但实际上为空的情况。

简而言之：

- 为了拥有一个可能为空的值，必须显式将其放入对应类型的 `Option<T>` 中，当使用这个值时，必须明确的处理值为空的情况。
- 只要一个值不是 `Option<T>` 类型，就可以安全的认定它的值不为空

Rust 正是通过这样的设计决策，来限制空值的泛滥以增加 Rust 代码的安全性。

### 获取 `Some` 成员的值

使用 `Option<T>` 的值，需要编写处理每个成员的代码。一些代码只当拥有 `Some(T)` 值时运行，允许这些代码使用其中的 `T`，一些代码在值为 `None` 时运行，这些代码并没有一个可用的 `T` 值。

参考 [Option 文档](https://doc.rust-lang.org/std/option/enum.Option.html)

## 使用 `match` 表达式处理枚举

Rust 中的 `match` 运算符允许将一个值与一系列的模式相比较并根据相匹配的模式执行相应代码，模式可由字面值、变量、通配符和许多其他内容构成。借助模式的表现力以及编译器检查，确保所有可能的情况都得到处理。

`match` 可用于处理枚举，根据枚举的成员运行不同的代码，这些代码可以使用匹配到的值中的数据。每个分支相关联的代码是一个表达式，而表达式的结果值将作为整个 `match` 表达式的返回值

### 匹配枚举成员值并进行分支处理

```rust
enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter,
}

fn value_in_cents(coin: Coin) -> u32 {
    match coin {
        // 可在分支中运行多行代码
        Coin::Penny => {
            println!("Lucky penny!");
            1
        },
        Coin::Nickel => 5,
        Coin::Dime => 10,
        Coin::Quarter => 25,
    }
}
```

### 利用绑定值的模式从枚举中提取值

匹配分支的一个有用的功能是可以绑定匹配的模式的部分值，从而可以从枚举成员中提取值。

```rust
#[derive(Debug)] // 这样可以可以立刻看到州的名称
enum UsState {
    Alabama,
    Alaska,
    // --snip--
}

enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter(UsState),
}

 // coin 值为 Coin::Quarter(UsState::Alaska)
fn value_in_cents(coin: Coin) -> u32 {
    match coin {
        Coin::Penny => 1,
        Coin::Nickel => 5,
        Coin::Dime => 10,
        // state 将会绑定值： UsState::Alaska
        Coin::Quarter(state) => {
            println!("State quarter from {:?}!", state);
            25
        },
    }
}

fn main {
    value_in_cents(Coin::Quarter(UsState::Alaska));
}
```

### 匹配处理 `Option<T>`

`plus_one` 函数获取一个 `Option<i32>` ，如果其中有一个值，将其加 1 ，如果其中没有值，函数不执行任何操作，直接返回 `None` 值。

```rust
fn plus_one(x: Option<i32>) -> Option<i32> {
    match x {
        None => None,
        Some(i) => Some(i + 1),
    }
}

let five = Some(5);
let six = plus_one(five);
let none = plus_one(None);
```

### 匹配是穷尽的

Rust 中的匹配是穷尽的，即必须穷举到最后的可能性来使代码有效

```rust
fn plus_one(x: Option<i32>) -> Option<i32> {
    match x {
        Some(i) => Some(i + 1),
    }
}
```

如果没有处理 `None` 的情况，上述代码会造成 BUG，不过 Rust 知道如何处理，如果尝试编译这段代码会得到错误，Rust 不仅知道没有覆盖所有可能的情况，甚至知道哪些模式被遗漏了，防止我们忘记明确的处理 None 的情况。

```shell
error[E0004]: non-exhaustive patterns: `None` not covered
 -->
  |
6 |         match x {
  |               ^ pattern `None` not covered
```

### `_` 通配符

`_` 通配符模式用于不想列举出所有可能值的情况

`_` 模式会匹配所有的值，将其放置于其他分支之后以匹配所有之前没有匹配的可能的值。

```rust
let some_u8_value = 0u8;
match some_u8_value {
    1 => println!("one"),
    3 => println!("three"),
    5 => println!("five"),
    7 => println!("seven"),
    _ => (), // () 是 unit 值，所以 _ 分支什么也不会发生，表示对 `_` 通配符之前未列出的所有可能的值不做任何处理
}
```

## 使用 `if let` 语法匹配单个模式

对于 “只匹配一个模式的值而忽略其他模式“ 的情况，使用 `match` 进行处理可能有些冗长，更为简洁的一种处理方式是使用 `if let` 语法。

注意：使用 `if let` 同时意味着失去 `match` 强制要求的穷尽性检查。编码实践中，两者如何选择取决于特定环境以及在简洁度和失去穷尽性检查之间的取舍。

```rust
let some_u8_value = Some(0u8);
if let Some(3) = some_u8_value {
    println!("three");
}
```

以上代码等同于：

```rust
let some_u8_value = Some(0u8);
match some_u8_value {
    Some(3) => println!("three"),
    _ => (),
}
```

### 包含 `else` 的 `if let` 语法

```rust
#[derive(Debug)]
enum UsState {
   Alabama,
   Alaska,
}

enum Coin {
   Penny,
   Nickel,
   Dime,
   Quarter(UsState),
}

let coin = Coin::Penny;
let mut count = 0;

if let Coin::Quarter(state) = coin {
    println!("State quarter from {:?}!", state);
} else {
    count += 1;
}
```

以上代码等同于：

```rust
#[derive(Debug)]
enum UsState {
   Alabama,
   Alaska,
}

enum Coin {
   Penny,
   Nickel,
   Dime,
   Quarter(UsState),
}

let coin = Coin::Penny;
let mut count = 0;

match coin {
    Coin::Quarter(state) => println!("State quarter from {:?}!", state),
    _ => count += 1,
}
```
