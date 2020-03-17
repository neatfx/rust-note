# 泛型

## 泛型函数

```rust
fn largest_i32(list: &[i32]) -> i32 {
    let mut largest = list[0];

    for &item in list.iter() {
        if item > largest {
            largest = item;
        }
    }

    largest
}

fn largest_char(list: &[char]) -> char {
    let mut largest = list[0];

    for &item in list.iter() {
        if item > largest {
            largest = item;
        }
    }

    largest
}

fn main() {
    let number_list = vec![34, 50, 25, 100, 65];

    let result = largest_i32(&number_list);
    println!("The largest number is {}", result);

    let char_list = vec!['y', 'm', 'a', 'q'];

    let result = largest_char(&char_list);
    println!("The largest char is {}", result);
}
```

使用泛型改写上述代码：

```rust
fn largest<T>(list: &[T]) -> T {
    let mut largest = list[0];

    for &item in list.iter() {
        if item > largest {
            largest = item;
        }
    }

    largest
}

fn main() {
    let number_list = vec![34, 50, 25, 100, 65];

    let result = largest(&number_list);
    println!("The largest number is {}", result);

    let char_list = vec!['y', 'm', 'a', 'q'];

    let result = largest(&char_list);
    println!("The largest char is {}", result);
}
```

不过，尝试编译上述代码会出现错误：

```shell
error[E0369]: binary operation `>` cannot be applied to type `T`
 --> src/main.rs:5:12
  |
5 |         if item > largest {
  |            ^^^^^^^^^^^^^^
  |
  = note: an implementation of `std::cmp::PartialOrd` might be missing for `T`
```

错误信息表明 `T`（ 所有类型 ）并不适用于 `largest` 函数，函数内部需要比较 `T` 类型的值，只能接受可以排序的类型作为参数。根据提示信息，T 类型需要具备标准库中定义的 `std::cmp::PartialOrd` 特质才能支持比较操作。

改进代码如下：

```rust
fn largest<T: PartialOrd + Copy>(list: &[T]) -> T {
    let mut largest = list[0];

    for &item in list.iter() {
        if item > largest {
            largest = item;
        }
    }

    largest
}

fn main() {
    let number_list = vec![34, 50, 25, 100, 65];

    let result = largest(&number_list);
    println!("The largest number is {}", result);

    let char_list = vec!['y', 'm', 'a', 'q'];

    let result = largest(&char_list);
    println!("The largest char is {}", result);
}
```

## 泛型结构体

单个泛型类型：

```rust
struct Point<T> {
    x: T,
    y: T,
}

fn main() {
    let integer = Point { x: 5, y: 10 };
    let float = Point { x: 1.0, y: 4.0 };
}
```

单个泛型类型定义的结构体只能支持相同类型的字段，以下代码不能通过编译：

```rust
struct Point<T> {
    x: T,
    y: T,
}

fn main() {
    let wont_work = Point { x: 5, y: 4.0 };
}
```

错误信息：

```shell
error[E0308]: mismatched types
 --> src/main.rs:7:38
  |
7 |     let wont_work = Point { x: 5, y: 4.0 };
  |                                      ^^^ expected integer, found
floating-point number
  |
  = note: expected type `{integer}`
             found type `{float}`
```

使用多个泛型类型参数定义结构体以支持不同类型的字段：

```rust
struct Point<T, U> {
    x: T,
    y: U,
}

fn main() {
    let both_integer = Point { x: 5, y: 10 };
    let both_float = Point { x: 1.0, y: 4.0 };
    let integer_and_float = Point { x: 5, y: 4.0 };
}
```

可在定义中使用任意多的泛型类型参数，不过太多的泛型参数会导致代码难以阅读和理解。当代码中需要大量泛型类型时，可能表明代码需要重构为更小的单元。

## 泛型枚举

标准库中的枚举使用了泛型定义：

```rust
enum Option<T> {
    Some(T), // Some 的值可以是任意类型
    None,
}

// 包含多个泛型类型的枚举定义（标准库）
enum Result<T, E> {
    Ok(T),
    Err(E),
}
```

当代码中存在多个仅仅是值类型不同的结构体或枚举定义时，应该使用泛型定义来代替以减少重复代码。

## 泛型方法

```rust
struct Point<T> {
    x: T,
    y: T,
}

// 注意须在 `impl` 后声明 `T`，用它来表明是在 `Point<T>` 类型上实现方法
// 由此，Rust 也能够识别 `Point` 后尖括号中的类型是泛型类型而不是具体类型
impl<T> Point<T> {
    fn x(&self) -> &T {
        &self.x
    }
}

fn main() {
    let p = Point { x: 5, y: 10 };

    println!("p.x = {}", p.x());
}
```

### 语法要点

例如，可以选择为 `Point<f32>` 实例实现方法，而不是为泛型 `Point` 实例。

```rust
// 并未在 `impl` 之后声明泛型，而是使用了一个具体类型 `f32`
// 这表示 `Point<f32>` 类型会有一个名为 `distance_from_origin` 的方法，
// 而 `T` 不是 `f32` 类型的 `Point<T>` 实例不具有此方法
impl Point<f32> {
    fn distance_from_origin(&self) -> f32 {
        (self.x.powi(2) + self.y.powi(2)).sqrt()
    }
}
```

### 在结构体方法签名中使用与结构体定义中类型不同的泛型参数

```rust
struct Point<T, U> {
    x: T,
    y: U,
}

// 泛型参数 `T` 和 `U` 声明于 `impl` 之后，与结构体定义相关
impl<T, U> Point<T, U> {
    // 泛型参数 `V` 和 `W` 声明于 `fn mixup` 之后，仅与方法本身相关
    fn mixup<V, W>(self, other: Point<V, W>) -> Point<T, W> {
        Point {
            x: self.x,
            y: other.y,
        }
    }
}

fn main() {
    let p1 = Point { x: 5, y: 10.4 };
    let p2 = Point { x: "Hello", y: 'c'};

    let p3 = p1.mixup(p2);

    println!("p3.x = {}, p3.y = {}", p3.x, p3.y);
}
```

运行代码：

```shell
p3.x = 5, p3.y = c
```

## 泛型代码的性能

Rust 中使用泛型的代码相比使用具体类型的代码并没有任何速度上的损失！这要归功于其实现泛型的方式。Rust 是通过在编译时对使用泛型的代码实施单态化处理达成这一目标的，在此过程中，编译器采取了与创建泛型函数相反的步骤：

- 查找所有泛型代码被调用的位置
- 根据泛型调用时使用的具体类型，从泛型代码生成包含具体类型的代码

以下通过示例代码来演示单态化是如何工作的：

```rust
let integer = Some(5);
let float = Some(5.0);
```

编译器对代码进行单态化处理：

```rust
enum Option_i32 {
    Some(i32),
    None,
}

enum Option_f64 {
    Some(f64),
    None,
}

fn main() {
    let integer = Option_i32::Some(5);
    let float = Option_f64::Some(5.0);
}
```

Rust 将泛型代码编译为在每个实例中指定类型的代码，因而使用泛型无需支付运行时开销。使用泛型与不使用泛型（ 包含重复定义 ）的代码执行效率没有差别，此单态化处理使 Rust 的泛型具有极其高效的运行时表现。
