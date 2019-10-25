# 泛型

## 泛型函数

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

尝试编译会出现编译错误：

```shell
error[E0369]: binary operation `>` cannot be applied to type `T`
 --> src/main.rs:5:12
  |
5 |         if item > largest {
  |            ^^^^^^^^^^^^^^
  |
  = note: an implementation of `std::cmp::PartialOrd` might be missing for `T`
```

错误信息表明 `T`（ 所有类型 ）并不适用于 `largest` 函数，函数内部需要比较 `T` 类型的值，只能接受可以排序的类型作为参数。根据提示信息，需要使用标准库中定义的 `std::cmp::PartialOrd` 特质来支持比较操作。

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

可以在定义中使用任意多的泛型类型参数，不过太多的泛型参数会导致代码难以阅读和理解。当代码中需要许多泛型类型时，可能表明代码需要重构为更小的单元。

## 泛型枚举

```rust
enum Option<T> {
    Some(T),
    None,
}

// 包含多个泛型类型
enum Result<T, E> {
    Ok(T),
    Err(E),
}
```

当代码中存在多个仅仅是值类型不同的结构体或枚举定义时，应该使用泛型类型来减少重复代码。

## 泛型方法

```rust
struct Point<T> {
    x: T,
    y: T,
}

// 注意必须在 `impl` 后面声明 `T`，这样才可以在实现 `Point<T>` 上的方法时使用该类型
// 表示 `Point` 后的尖括号中的类型是泛型而不是具体类型
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
// 这段代码意味着 `Point<f32>` 类型会有一个方法 `distance_from_origin`，
// 而不会为 `T` 不是 `f32` 类型的 `Point<T>` 实例定义此方法
impl Point<f32> {
    fn distance_from_origin(&self) -> f32 {
        (self.x.powi(2) + self.y.powi(2)).sqrt()
    }
}
```

### 在方法中使用与结构体定义中不同类型的泛型

```rust
struct Point<T, U> {
    x: T,
    y: U,
}

// 泛型参数 `T` 和 `U` 声明于 `impl` 之后，与结构体定义相对应
impl<T, U> Point<T, U> {
    // 泛型参数 `V` 和 `W` 声明于 `fn mixup` 之后，与方法本身相对应
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

## 泛型代码的性能

Rust 中使用泛型类型参数的代码相比使用具体类型的代码并没有任何速度上的损失。

Rust 在编译时将执行以下操作：

- 查找所有泛型代码被调用的位置
- 根据调用的具体类型，从泛型代码生成代码
- 使用泛型代码对应的具体类型进行填充，将通用代码转换为特定代码

这个过程也被称作单态化（monomorphization），Rust 通过编译时对泛型代码进行单态化来保证效率。

```rust
let integer = Some(5);
let float = Some(5.0);
```

编译器将代码进行单态化处理:

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

使用泛型可以编写不重复的代码，而 Rust 会将每个泛型的实例编译成使用具体类型的代码，这就意味着使用泛型没有运行时开销。代码的执行效率跟未使用泛型时的代码（ 包含重复 ）没有差别，这个单态化过程正是 Rust 泛型有极其高效的运行时性能的原因。
