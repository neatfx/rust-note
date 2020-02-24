# 有效的模式语法

通过本书我们已领略过许多不同类型模式的例子。本节会统一列出所有在模式中有效的语法并且会阐述你为什么可能会希望使用其中的每一个。

## 匹配字面值

此语法用于代码得到某个具体值时进行操作

```rust
let x = 1; // 字面值

match x {
    1 => println!("one"),
    2 => println!("two"),
    3 => println!("three"),
    _ => println!("anything"),
}
```

## 匹配命名变量

命名变量是匹配任何值的不可反驳模式。当用于 `match` 表达式时情况会有些复杂，因为 `match` 会创建一个新的作用域，`match` 表达式中作为模式的一部分声明的变量会覆盖 `match` 结构外的同名变量。

```rust
fn main() {
    let x = Some(5);
    let y = 10;

    match x {
        Some(50) => println!("Got 50"),
        Some(y) => println!("Matched, y = {:?}", y),
        _ => println!("Default case, x = {:?}", x),
    }

    println!("at the end: x = {:?}, y = {:?}", x, y);
}
```

第一个匹配分支的模式不匹配 `x` 中定义的值。

第二个匹配分支中的模式引入了新变量 `y`，新变量 `y` 绑定会匹配任何 `Some` 中的值，该分支的表达式将会打印 `Matched, y = 5`。

如果 `x` 的值是 `None` 而不是 `Some(5)`，前两个分支的模式不会匹配，而是会匹配下划线。该分支的模式中没有引入变量 `x`，因此表达式中的 `x` 是位于 `match` 外部没有被覆盖的变量 `x`，`match` 将会打印 `Default case, x = None`。

一旦 `match` 表达式执行完毕，其作用域随之结束，其内部变量 `y` 的作用域也随之结束。程序会打印 `at the end: x = Some(5), y = 10`。

为了创建能够比较外部 `x` 和 `y` 的值，而不引入覆盖变量的 `match` 表达式，需要使用带有条件的匹配守卫（ match guard ）。

## 多个模式

在 `match` 表达式中，可以使用 `|` 语法匹配多个模式，它代表 **或**（ *or* ）的意思：

```rust
let x = 1;

match x {
    1 | 2 => println!("one or two"),
    3 => println!("three"),
    _ => println!("anything"),
}
```

上面的代码会打印 `one or two`

## 通过 `...` 匹配值的范围

`...` 语法允许你匹配一个闭区间范围内的值。

`...` 相比使用 `|` 运算符在表达相同的意思时更为简洁。

`...` 只允许用于数字或 `char` 值，因为编译器会在编译时检查范围不为空，而 `char` 和数字值是 Rust 唯一知道范围是否为空的类型。

```rust
let x = 5;

match x {
    1 ... 5 => println!("one through five"),
    _ => println!("something else"),
}
```

如果 `x` 是 1、2、3、4 或 5，第一个分支就会匹配。

使用 `char` 类型值范围的示例：

```rust
let x = 'c';

match x {
    'a' ... 'j' => println!("early ASCII letter"),
    'k' ... 'z' => println!("late ASCII letter"),
    _ => println!("something else"),
}
```

Rust 知道 `c` 位于第一个模式的范围内，因此会打印出 `early ASCII letter`。

## 解构并分解值

可以使用模式来解构结构体、枚举、元组和引用，以便使用这些值的不同部分。

### 解构结构体

```rust
struct Point {
    x: i32,
    y: i32,
}

fn main() {
    let p = Point { x: 0, y: 7 };

    let Point { x: a, y: b } = p;
    assert_eq!(0, a);
    assert_eq!(7, b);
}
```

代码创建了变量 `a` 和 `b` 来匹配变量 `p` 中的 `x` 和 `y` 字段。

模式中的变量名不必与结构体中的字段名一致。不过通常希望变量名与字段名一致以便于理解变量来自于哪些字段。因为变量名匹配字段名很常见，所以还可以进行简写：只需列出结构体字段的名称，则模式创建的变量会有相同的名称。

```rust
fn main() {
    let p = Point { x: 0, y: 7 };

    let Point { x, y } = p;
    assert_eq!(0, x);
    assert_eq!(7, y);
}
```

#### 在部分结构体模式中使用字面值进行解构

这种方式不需要为所有的字段创建变量，允许在测试一些字段为特定值的同时创建其他字段的变量。

```rust
fn main() {
    let p = Point { x: 0, y: 7 };

    match p {
        // 指定字段 `y` 匹配字面值 `0` 来匹配，并为字段 `x` 创建了变量 `x`
        Point { x, y: 0 } => println!("On the x axis at {}", x),
        // 指定字段 `x` 匹配字面值 `0` 来匹配，并为字段 `y` 创建了变量 `y`
        Point { x: 0, y } => println!("On the y axis at {}", y),
        // 未指定任何字面值，将匹配任何其他的 `Point`，并为 `x` 和 `y` 两个字段创建变量
        Point { x, y } => println!("On neither axis: ({}, {})", x, y),
    }
}
```

示例代码中的 `p` 将匹配第二个分支，因此会打印出 `On the y axis at 7`。

### 解构枚举

解构枚举的模式需要对应枚举所定义的数据储存方式。

```rust
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(i32, i32, i32),
}

fn main() {
    let msg = Message::ChangeColor(0, 160, 255);

    match msg {
        Message::Quit => {
            println!("The Quit variant has no data to destructure.")
        },
        Message::Move { x, y } => {
            println!(
                "Move in the x direction {} and in the y direction {}",
                x,
                y
            );
        }
        Message::Write(text) => println!("Text message: {}", text),
        Message::ChangeColor(r, g, b) => {
            println!(
                "Change the color to red {}, green {}, and blue {}",
                r,
                g,
                b
            )
        }
    }
}
```

代码将会打印 `Change the color to red 0, green 160, and blue 255`。

对于像 `Message::Quit` 这样没有任何数据的枚举成员，不能进一步解构其值。只能匹配其字面值 `Message::Quit`，因此模式中没有任何变量。

对于像 `Message::Move` 这样的类结构体枚举成员，可以采用类似于匹配结构体的模式。在成员名称后，使用大括号并列出字段变量以便将其分解以供此分支的代码使用。

对于像 `Message::Write` 和 `Message::ChangeColor` 这样的类元组枚举成员，其模式则类似于用于解构元组的模式。模式中变量的数量必须与成员中元素的数量一致。

### 解构嵌套的结构体 & 枚举

```rust
enum Color {
   Rgb(i32, i32, i32),
   Hsv(i32, i32, i32)
}

enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(Color),
}

fn main() {
    let msg = Message::ChangeColor(Color::Hsv(0, 160, 255));

    match msg {
        Message::ChangeColor(Color::Rgb(r, g, b)) => {
            println!(
                "Change the color to red {}, green {}, and blue {}",
                r,
                g,
                b
            )
        },
        Message::ChangeColor(Color::Hsv(h, s, v)) => {
            println!(
                "Change the color to hue {}, saturation {}, and value {}",
                h,
                s,
                v
            )
        }
        _ => ()
    }
}
```

### 解构引用

当模式所匹配的值中包含引用时，可以通过在模式中指定 `&` 来解构引用指向的值。解构引用将得到一个包含引用所指向数据的变量，而不是包含引用的变量。这在通过迭代器遍历引用时，需要使用闭包中的值而不是其引用时非常有用。

示例遍历 `Vector` 中的 `Point` 实例引用，解构引用以及其中的结构体以便对 `x` 和 `y` 值进行计算：

```rust
struct Point {
    x: i32,
    y: i32,
}

let points = vec![
    Point { x: 0, y: 0 },
    Point { x: 1, y: 5 },
    Point { x: 10, y: -3 },
];

let sum_of_squares: i32 = points
    .iter()
    .map(|&Point { x, y }| x * x + y * y)
    .sum();
```

变量 `sum_of_squares` 的值为 135。

如果尝试不使用 `&`，直接匹配 `Point` 值，而不是 `Point` 的引用，将会得到错误，因为 `iter` 会遍历 `Vector` 中项的引用而不是值本身：

```shell
error[E0308]: mismatched types
  -->
   |
14 |         .map(|Point { x, y }| x * x + y * y)
   |               ^^^^^^^^^^^^ expected &Point, found struct `Point`
   |
   = note: expected type `&Point`
              found type `Point`
```

### 解构结构体和元组

可以用复杂的方式合成、匹配和嵌套解构模式，进而将复杂的类型分解以便于单独使用其中的部分值。

```rust
let ((feet, inches), Point {x, y}) = ((3, 10), Point { x: 3, y: -10 });
```

## 忽略模式中的值

有时忽略模式中的一些值是有用的，比如 `match` 中的最后一个分支负责捕获全部剩余情况，尽管没有做任何处理，但是它确实是有意义的。

### 使用 `_`忽略整个值

在函数签名中忽略参数

```rust
fn foo(_: i32, y: i32) {
    println!("This code only uses the y parameter: {}", y);
}

fn main() {
    foo(3, 4);
}
```

**一般来说，当不再需要某个特定函数参数时，最好是修改函数签名将其移除。但在一些特殊情况下忽略函数参数更有用，比如实现特质时，需要特定类型签名但是函数实现并不依赖某个参数时，此时编译器就不会警告说存在未使用的函数参数。**

### 使用嵌套的 `_` 忽略部分值

当只需要测试部分值但在期望运行的代码部分中没有使用它们时，也可以在另一个模式内部使用 `_` 来只忽略部分值。

示例演示：

- 不允许覆盖已经存在的自定义配置
- 允许清空已有配置
- 配置不存在时可以提供新的配置

```rust
let mut setting_value = Some(5);
let new_setting_value = Some(10);

match (setting_value, new_setting_value) {
    // 分支无需匹配或使用任一 `Some` 成员的值
    // 其目的在于测试 `setting_value` 和 `new_setting_value` 均为 `Some` 成员
    (Some(_), Some(_)) => {
        println!("Can't overwrite an existing customized value");
    }
    // 分支匹配情况：当 `setting_value` 或 `new_setting_value` 任一为 `None`
    _ => {
        // 此时期望 `new_setting_value` 变为 `setting_value`
        setting_value = new_setting_value;
    }
}

println!("setting is {:?}", setting_value);
```

代码打将依次印 `Can't overwrite an existing customized value`、`setting is Some(5)`。

#### 在模式中的多处使用下划线来忽略特定值

```rust
let numbers = (2, 4, 8, 16, 32);

match numbers {
    (first, _, third, _, fifth) => {
        println!("Some numbers: {}, {}, {}", first, third, fifth)
    },
}
```

打印结果为 `Some numbers: 2, 8, 32`, 值 `4` 和 `16` 将被忽略。

### 以 `_` 开头命名变量进行忽略

创建变量却不使用，Rust 通常会给出警告。但很多时候创建一个暂时不使用的变量是有实际意义的，以 `_` 开头命名变量会告知 Rust 忽略此类情况，

```rust
fn main() {
    let _x = 5; // 不会引发警告
    let y = 10; // 将引发变量未使用的警告
}
```

#### 只使用 `_` 和使用以 `_` 开头的名称的差异

`_x` 仍会将值绑定到变量，而 `_` 则完全不会绑定：

```rust
let s = Some(String::from("Hello!"));

if let Some(_s) = s {
    println!("found a string");
}

println!("{:?}", s);
```

运行得到错误，因为 `s` 的值仍然会移动进 `_s`，并阻止再次使用 `s`。

只使用 `_` 则不会绑定值：

```rust
let s = Some(String::from("Hello!"));

// `s` 不会被移动进 `_`
if let Some(_) = s {
    println!("found a string");
}

println!("{:?}", s); // 可以正常使用 s
```

### 用 `..` 忽略剩余值

使用 `..` 语法可以对有多个部分的值进行部分忽略，并避免使用 `_` 匹配每一个忽略值，`..` 模式会忽略模式中剩余的任何未显式匹配的值的部分。

在 `match` 表达式中，我们希望只操作 `x` 并忽略 `y` 和 `z` 字段的值：

```rust
struct Point {
    x: i32,
    y: i32,
    z: i32,
}

let origin = Point { x: 0, y: 0, z: 0 };

match origin {
    Point { x, y: _, z: _ } => println!("x is {}", x), // 使用 `_` 的写法
    Point { x, .. } => println!("x is {}", x), // 使用 `..` 的写法，更简单
}
```

#### `..` 会扩展为所需要的值的数量

使用 `first` 和 `last` 匹配第一个和最后一个值，`..` 将匹配并忽略中间的所有值。

```rust
fn main() {
    let numbers = (2, 4, 8, 16, 32);

    match numbers {
        (first, .., last) => {
            println!("Some numbers: {}, {}", first, last);
        },
    }
}
```

使用 `..` 必须是无歧义的，如果期望匹配和忽略的值是不明确的，Rust 会报错：

```rust
fn main() {
    let numbers = (2, 4, 8, 16, 32);

    match numbers {
        (.., second, ..) => {
            println!("Some numbers: {}", second)
        },
    }
}
```

如果编译上面的例子，会得到下面的错误：

```shell
error: `..` can only be used once per tuple or tuple struct pattern
 --> src/main.rs:5:22
  |
5 |         (.., second, ..) => {
  |                      ^^
```

## 匹配守卫提供的额外条件

**匹配守卫**（ *match guard* ）是位于 `match` 分支模式之后的额外 `if` 条件，同时满足分支模式以及匹配守卫条件才可以进入匹配分支，用于表达比单独的模式更复杂的情况。

匹配守卫可以使用模式中创建的变量。

代码将打印出 `less than five: 4`

```rust
let num = Some(4);

match num {
    // 分支有模式 `Some(x)` 还有匹配守卫 `if x < 5`
    // 无法在模式中表达 `if x < 5` 的条件，而匹配守卫提供了额外的能力
    Some(x) if x < 5 => println!("less than five: {}", x),
    Some(x) => println!("{}", x),
    None => (),
}
```

### 使用匹配守卫来解决模式中的变量覆盖问题

`match` 表达式的模式中新建了一个变量而不是使用 `match` 之外的同名变量，新变量意味着不能够测试外部变量的值。

```rust
fn main() {
    let x = Some(5);
    let y = 10;

    match x {
        Some(50) => println!("Got 50"),
        // 使用 Some(y) 会创建新变量 y
        // 使用匹配守卫后，y不再是新建变量，而是外部变量
        Some(n) if n == y => println!("Matched, n = {:?}", n),
        _ => println!("Default case, x = {:?}", x),
    }

    println!("at the end: x = {:?}, y = {:?}", x, y);
}
```

### 匹配守卫与使用或运算符指定的多个模式

```rust
let x = 4;
let y = false;

match x {
    // 匹配守卫 `if y` 看起来好像只作用于 `6`，实际上作用于 `4`、`5`、`6`
    4 | 5 | 6 if y => println!("yes"),
    _ => println!("no"),
}
```

换句话说，匹配守卫与模式的优先级关系看起来像这样：

```shell
(4 | 5 | 6) if y => ...
```

而不是：

```shell
4 | 5 | (6 if y) => ...
```

如果匹配守卫只作用于由 `|` 运算符指定的值列表的最后一个值，这个分支就会匹配并打印出 `yes`。

## 使用运算符 `@` 创建绑定

运算符 `@` 允许在创建一个存放值的变量的同时测试其值是否匹配模式。

示例代码将会打印 `Found an id in range: 5`：

```rust
// 测试 `Message::Hello` 的 `id` 字段是否位于 `3...7` 范围内
enum Message {
    Hello { id: i32 },
}

let msg = Message::Hello { id: 5 };

match msg {
    // 使用 `@` 可以在一个模式中同时测试和保存变量值
    // 分支 1 通过在 `3...7` 之前指定 `id_variable @` 用于：
    // 捕获任何匹配此范围的值、测试捕获的值匹配此范围模式、将值绑定到 `id_variable` 变量
    // 分支代码可以使用变量 `id_variable`，该变量也可以命名为 `id`
    Message::Hello { id: id_variable @ 3...7 } => {
        println!("Found an id in range: {}", id_variable)
    },
    // 分支 2 仅在模式中指定了一个范围，没有指定用于绑定 `id` 字段实际值的变量
    // `id` 字段的值将会是 10、11、12
    // 分支代码不能使用 `id` 字段中的值，因为没有将 `id` 的值保存进到变量
    Message::Hello { id: 10...12 } => {
        println!("Found an id in another range")
    },
    // 分支 3 指定了一个没有范围的变量
    // 不能对 `id` 字段的值进行任何测试，因为任何值都会匹配本分支
    // 拥有可以用于分支代码的变量 `id`，因为这里使用了结构体字段简写语法
    Message::Hello { id } => {
        println!("Found some other id: {}", id)
    },
}
```

## 遗留模式：`ref` 和 `ref mut`

以下代码：

```rust
let robot_name = &Some(String::from("Bors"));

match robot_name {
    &Some(name) => println!("Found a name: {}", name),
    None => (),
}

println!("robot_name is: {:?}", robot_name);
```

在 Rust 2015、2018 版本均不能通过编译：

```shell
error[E0507]: cannot move out of `robot_name.0` which is behind a shared reference
 --> src/main.rs:5:7
  |
5 | match robot_name {
  |       ^^^^^^^^^^
6 |     &Some(name) => println!("Found a name: {}", name),
  |     -----------
  |     |     |
  |     |     data moved here
  |     |     move occurs because `name` has type `std::string::String`, which does not implement the `Copy` trait
  |     help: consider removing the `&`: `Some(name)`
```

编译器提示无法将 `String` 从 `Option` 中移出，因为这是一个引用的 `Option`，所以是借用的。此时就需要使用 `ref` 进行处理：

```rust
let robot_name = &Some(String::from("Bors"));

match robot_name {
    // 通过 `ref` 声明 “请将 `ref` 绑定到一个 `&String` 上，不要尝试移动”
    // 换句话说，`&Some` 中的 `&` 匹配的是一个引用 `&Option<String>`
    // 而 `ref` 创建了一个引用
    &Some(ref name) => println!("Found a name: {}", name),
    None => (),
}

println!("robot_name is: {:?}", robot_name);
```

`ref mut` 类似 `ref` 不过对应的是可变引用。

在新版 Rust 中，如果尝试对某些借用的值使用 `match`，那么所有由模式创建的绑定都会自动尝试借用，这意味着以下代码现在可以正常工作，模式部分不再需要使用 `&` 以及 `ref`：

```rust
let robot_name = &Some(String::from("Bors")); // `&Option<String>`

match robot_name {
    Some(name) => println!("Found a name: {}", name),
    None => (),
}

println!("robot_name is: {:?}", robot_name);
```

Rust 是向后兼容的，所以不会移除 `ref` 和 `ref mut`，它们在一些个别场景下还有用，也可能在老的代码中遇到它们。