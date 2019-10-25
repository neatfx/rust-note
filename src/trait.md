# 特质

特质（ Trait ）用于定义抽象的共享行为，向 Rust 编译器表明某个类型拥有与其他类型共享的功能。

`Trait` 也是一个定义泛型行为的方法。`Trait` 可以与泛型结合，并通过使用 *trait bounds* 将泛型限制为拥有特定行为的类型，而不是任意类型。

> Trait 类似其他语言中的**接口**（ *interfaces* ）功能，尽管并不完全相同

## 定义特质

类型的行为由其可供调用的方法构成。如果不同类型可以调用相同的方法，这些类型就可以共享行为。

特质定义的方式是将方法签名组合起来形成一个共享的行为集合。

例如，有两个存放了不同类型和属性文本的结构体：

- 结构体 `NewsArticle` 用于存放新闻
- 结构体 `Tweet` 用于存放推文内容及其他相关的元数据

```rust
pub struct NewsArticle {
    pub headline: String,
    pub location: String,
    pub author: String,
    pub content: String,
}

pub struct Tweet {
    pub username: String,
    pub content: String,
    pub reply: bool,
    pub retweet: bool,
}
```

现在想要创建一个多媒体聚合库用来显示上述两种类型实例中的数据的概要。

每个类型都需要的行为是“通过一个 `summarize` 方法提取内容概要”，由此可定义 `Summary` 特质：

```rust
// 使用 `trait` 关键字来声明一个 Trait
pub trait Summary {
    // 实现 trait 的类型所需的方法签名
    fn summarize(&self) -> String; // 注意此处的分号！并不提供方法的具体实现
}
```

每个实现该 `Trait` 的类型都需要提供方法的具体实现，编译器会确保任何实现 `Summary` 特质的类型都拥有与这个签名的定义完全一致的 `summarize` 方法。

`Trait` 定义中可以包含多个方法（ 每行一个方法签名，均以分号结尾 ）

## 为类型实现特质

```rust
// 使用标题、作者、位置作为 `summarize` 的返回值
impl Summary for NewsArticle {
    fn summarize(&self) -> String {
        format!("{}, by {} ({})", self.headline, self.author, self.location)
    }
}

// 使用用户名后跟推文的全部内容作为 `summarize` 的返回值
impl Summary for Tweet {
    fn summarize(&self) -> String {
        format!("{}: {}", self.username, self.content)
    }
}
```

在 `impl` 关键字之后提供 `Trait` 名称，接着是 `for` 和需要实现 `Trait` 的类型的名称。在 `impl` 块中，根据 `Trait` 定义中的方法签名，编写代码为特定类型实现 `Trait` 方法。

调用 `Trait` 方法：

```rust
let tweet = Tweet {
    username: String::from("horse_ebooks"),
    content: String::from("of course, as you probably already know, people"),
    reply: false,
    retweet: false,
};

// 打印结果：
// `New tweet: horse_ebooks: of course, as you probably already know, people`
println!("New tweet: {}", tweet.summarize());
```

因为 `Summary` 特质、 `NewsArticle`、`Tweet` 定义于相同的 *lib.rs*，位于同一作用域。假设 *lib.rs* 对应 `aggregator` Crate，而其他库想要利此 Crate 的功能为其自身作用域中的结构体实现 `Summary` 特质，首先需要将 trait 引入作用域（ 通过指定 `use aggregator::Summary;` 实现 ），其次，`Summary` 还必须是公有 `Trait`，其他 Crate 才可以实现它（ 需要 `pub` 关键字 ）

### 实现 `Trait` 时的注意事项

#### 只有当 `Trait` 或者要实现 `Trait` 的类型位于 Crate 的本地作用域时，才能为该类型实现 `Trait`

例如，可以为多媒体聚合库 Crate 的自定义类型 `Tweet` 实现如标准库中的 `Display` `Trait`，这是因为 `Tweet` 类型位于多媒体聚合库 Crate 本地的作用域中。也可以在多媒体聚合库 Crate 中为 `Vec<T>` 实现 `Summary`，因为 `Summary` Trait 位于多媒体聚合库 Crate 本地作用域中。

#### 不能为外部类型实现外部 `Trait`

例如，不能在多媒体聚合库 Crate 中为 `Vec<T>` 实现 `Display` trait。这是因为 `Display` 和 `Vec<T>` 都定义于标准库中，并不位于多媒体聚合库的 Crate 本地作用域中。这个限制是被称为**相干性**的程序属性的一部分，或者更具体的说是**孤儿规则**（*orphan rule*），其得名于不存在父类型。这条规则确保了其他人编写的代码不会破坏你代码，反之亦然。没有这条规则的话，两个 Crate 可以分别对相同类型实现相同的 `Trait`，而 Rust 将不知道应该使用哪一个实现。

## 默认实现

相比只定义方法签名，可以为 `Trait` 中的某些或全部方法提供默认实现，当为某个特定类型实现 `Trait` 时，可以选择保留或重载每个方法的默认实现。

```rust
pub trait Summary {
    fn summarize(&self) -> String {
        String::from("(Read more...)")
    }
}
```

类型实现特质（ 指定空 `impl` 块表示选择使用特质方法的默认实现 ）：

```rust
impl Summary for NewsArticle {}
```

调用特质方法 `summarize`（ 默认实现 ）：

```rust
let article = NewsArticle {
    headline: String::from("Penguins win the Stanley Cup Championship!"),
    location: String::from("Pittsburgh, PA, USA"),
    author: String::from("Iceburgh"),
    content: String::from("The Pittsburgh Penguins once again are the best
    hockey team in the NHL."),
};

// 打印结果：New article available! (Read more...)
println!("New article available! {}", article.summarize());
```

默认实现允许调用相同 `Trait` 中的其他方法，哪怕这些方法没有默认实现：

```rust
pub trait Summary {
    fn summarize_author(&self) -> String;

    fn summarize(&self) -> String {
        format!("(Read more from {}...)", self.summarize_author())
    }
}
```

使用此版本的 `Summary`，只需在实现 `Trait` 时定义 `summarize_author` 即可：

```rust
impl Summary for Tweet {
    fn summarize_author(&self) -> String {
        format!("@{}", self.username)
    }
}
```

一旦定义了 `summarize_author`，就可以调用 `summarize` 了：

```rust
let tweet = Tweet {
    username: String::from("horse_ebooks"),
    content: String::from("of course, as you probably already know, people"),
    reply: false,
    retweet: false,
};

// 打印结果： `1 new tweet: (Read more from @horse_ebooks...)`。
println!("1 new tweet: {}", tweet.summarize());
```

注意：无法从相同方法的重载实现中调用默认方法。

## 特质作为参数

使用 `impl Trait` 语法定义函数 `notify`，参数为实现了 `Summary` 特质的类型：

```rust
pub fn notify(item: impl Summary) {
    println!("Breaking news! {}", item.summarize());
}
```

在 `notify` 函数体中可以调用任何来自 `Summary` 特质的方法，比如 `summarize` 方法。

### Trait Bounds

```rust
pub fn notify<T: Summary>(item: T) {
    println!("Breaking news! {}", item.summarize());
}
```

函数 `notify` 的 `trait bound` 为 `T`，它接受任何 `NewsArticle` 或 `Tweet` 的实例作为参数。任何其他没有实现 `Summary` 的类型，如 `String` 或 `i32`，作为参数调用 `notify` 的代码将不能编译。

#### `impl Trait` vs `trait bound`

`impl Trait` 语法实际上是 *trait bound* 的语法糖，`trait bound` 适用于更复杂的场景。

`impl Trait` 适用于参数具有不同类型的情况（ 只要它们都实现了 `Summary` ）

```rust
pub fn notify(item1: impl Summary, item2: impl Summary) {
```

如果希望参数都是相同类型，就只能使用 `trait bound` 实现：

```rust
pub fn notify<T: Summary>(item1: T, item2: T) {
```

### 通过 `+` 指定多个特质

如果 `notify` 函数需要追加格式化输出 `item` 内容的功能，那么 `item` 就需要同时实现 `Display` 和 `Summary` 两个不同的特质：

```rust
pub fn notify(item: impl Summary + Display) {
```

`+` 语法也适用于泛型的 `trait bound`：

```rust
pub fn notify<T: Summary + Display>(item: T) {}
```

### 使用 `where` 简化 `trait bound` 代码

使用过多的 `trait bound` 也有缺点。

每个泛型有其自己的 `trait bound`，所以有多个泛型参数的函数在名称和参数列表之间会有很长的 `trait bound` 信息，这使得函数签名难以阅读。

```rust
fn some_function<T: Display + Clone, U: Clone + Debug>(t: T, u: U) -> i32 {
```

可以在函数签名之后使用 `where` 从句指定 `trait bound`，使函数签名更加清晰，可读性更好：

```rust
fn some_function<T, U>(t: T, u: U) -> i32
    where T: Display + Clone,
          U: Clone + Debug
{
```

## 特质作为返回值

可以在返回值中使用 `impl Trait` 语法，返回实现了某个 `Trait` 的类型：

```rust
// 返回某个实现了 `Summary` 特质的类型，但不确定其具体类型
// 函数实际返回了 `Tweet` 类型，不过调用方并不知情
fn returns_summarizable() -> impl Summary {
    Tweet {
        username: String::from("horse_ebooks"),
        content: String::from("of course, as you probably already know, people"),
        reply: false,
        retweet: false,
    }
}
```

### 用途

比如，Rust 中的闭包和迭代器功能可以创建只有编译器能够理解或是有一定数量的类型。`impl  Trait` 允许表达 “返回一个实现了 `Iterator` 的类型” 而无需写出与实际数量相符的的具体类型。

特质作为返回值只适用于返回单一类型的情况，如下代码则无法编译：

```rust
// 尝试返回 `NewsArticle` 或 `Tweet`
fn returns_summarizable(switch: bool) -> impl Summary {
    if switch {
        NewsArticle {
            headline: String::from("Penguins win the Stanley Cup Championship!"),
            location: String::from("Pittsburgh, PA, USA"),
            author: String::from("Iceburgh"),
            content: String::from("The Pittsburgh Penguins once again are the best
            hockey team in the NHL."),
        }
    } else {
        Tweet {
            username: String::from("horse_ebooks"),
            content: String::from("of course, as you probably already know, people"),
            reply: false,
            retweet: false,
        }
    }
}
```

如果确实有需要，可以参考 “为使用不同类型的值而设计的 Trait 对象” 章节。

## 使用 `trait bounds` 来修复 `largest` 函数

修复“泛型”章节中的示例：

```text
error[E0369]: binary operation `>` cannot be applied to type `T`
 --> src/main.rs:5:12
  |
5 |         if item > largest {
  |            ^^^^^^^^^^^^^^
  |
  = note: an implementation of `std::cmp::PartialOrd` might be missing for `T`
```

运算符 `>` 是由标准库中的特质 `std::cmp::PartialOrd` 定义的一个默认方法，所以需要在 `T` 的 `trait bound` 中指定 `PartialOrd`，使 `largest` 函数可用于能够比较大小的类型的 `slice`。

`PartialOrd` 位于 `prelude` 中所以不需要引入作用域，修改 `largest` 的签名如下：

```rust
fn largest<T: PartialOrd>(list: &[T]) -> T {
```

编译代码，出现新的错误：

```text
error[E0508]: cannot move out of type `[T]`, a non-copy slice
 --> src/main.rs:2:23
  |
2 |     let mut largest = list[0];
  |                       ^^^^^^^
  |                       |
  |                       cannot move out of here
  |                       help: consider using a reference instead: `&list[0]`

error[E0507]: cannot move out of borrowed content
 --> src/main.rs:4:9
  |
4 |     for &item in list.iter() {
  |         ^----
  |         ||
  |         |hint: to prevent move, use `ref item` or `ref mut item`
  |         cannot move out of borrowed content
```

这是因为将 `largest` 函数改成泛型形式后，无法确定参数 `list` 是否实现了 `Copy` 特质，这意味着可能无法将 `list[0]` 的值移动到 `largest` 变量中，从而导致了错误。而实例中 `i32` 和 `char` 这样的类型是已知大小的并可以储存在栈上，它们是实现了 `Copy` 特质的。要修复代码，需要在 `trait bounds` 中增加 `Copy`，进一步明确 `largest` 函数只对实现了 `Copy` 特质的类型适用。

最终可通过编译的代码：

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

如果并不希望限制 `largest` 函数只能用于实现了 `Copy` 特质的类型，可以在 `T` 的 `trait bounds` 中指定 `Clone` 而不是 `Copy`，克隆 slice 的每一个值使得 `largest` 函数拥有其所有权。

不过使用 `clone` 函数意味着对于类似 `String` 这样拥有堆上数据的类型，会潜在的分配更多堆上空间，而堆分配在涉及大量数据时可能会有性能问题。

### 其它实现 `largest` 的方式

将返回值从 `T` 改为 `&T` 并改变函数体使其能够返回一个引用，这种方式不需要任何 `Clone` 或 `Copy` 的 `trait bounds`，并且不会有任何的堆分配。

## 使用 `trait bound` 有条件地实现方法

使用带有 `trait bound` 的泛型参数的 `impl` 块，可以只为那些实现了特定特质的类型实现方法。

```rust
use std::fmt::Display;

struct Pair<T> {
    x: T,
    y: T,
}

// 类型 `Pair<T>` 总是实现了 `new` 方法
impl<T> Pair<T> {
    fn new(x: T, y: T) -> Self {
        Self {
            x,
            y,
        }
    }
}

// `PartialOrd` 特质（ 允许比较 ）
// `Display` 特质 （ 启用打印 ）
// 只有同时实现了上述两种特质的 `Pair<T>` 类型才会实现 `cmp_display` 方法
impl<T: Display + PartialOrd> Pair<T> {
    fn cmp_display(&self) {
        if self.x >= self.y {
            println!("The largest member is x = {}", self.x);
        } else {
            println!("The largest member is y = {}", self.y);
        }
    }
}
```

## 使用 `trait bound` 有条件地实现特质

对满足特定 `trait bound` 的类型实现特质被称为 *blanket implementations*，广泛用于 Rust 标准库中。

例如，标准库为任何实现了 `Display` 特质的类型实现了 `ToString` 特质：

```rust
impl<T: Display> ToString for T {
    // --snip--
}
```

正因如此，我们可以对任何实现了 `Display` 特质的类型调用由 `ToString` 定义的 `to_string` 方法。例如，可以将整型转换为对应的 `String` 值，因为整型实现了 `Display` 特质：

```rust
let s = 3.to_string();
```

`blanket implementation` 的相关内容位于 `Trait` 文档的 “Implementers” 部分。

## 小结

`Trait` 和 `trait bound` 使用泛型来减少重复，同时能够向编译器表明泛型类型所需行为。Rust 编译器使用 `trait bound` 信息检查代码中的具体类型是否提供了正确的行为。

在动态类型语言中，尝试调用一个类型没有实现的方法会引发运行时错误。Rust 将此类错误的检测移动到了编译时，并强制修复错误。因此，在 Rust 中无需编写运行时检查类型行为的代码，相比其他同样具备泛型特性的语言有更好的性能。
