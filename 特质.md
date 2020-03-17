# 特质

特质（ Trait ）用于定义抽象的共享行为，向 Rust 编译器表明某个类型拥有与其他类型共享的功能。

特质也可用于定义泛型行为，与泛型结合，通过使用特质绑定（ *trait bounds* ）将泛型限制为拥有特定行为的任意类型。

> Trait 类似其他语言中的 **接口**（ *interfaces* ）功能，尽管并不完全相同

## 定义特质

类型的行为由其可供调用的方法构成。如果不同类型可以调用相同的方法，即表示这些类型共享相同的行为。特质定义正是通过组合方法签名的方式定义必要的行为集合来达到同样的目的。

例如，有两个存放了不同类型、数量文本的结构体：

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

现在想要创建一个多媒体聚合库用来显示上述两种类型实例中的数据概要。每个类型都需要的行为是 - “通过一个 `summarize` 方法提取内容概要”，由此可定义 `Summary` 特质：

```rust
// 使用 `trait` 关键字来声明一个 Trait
pub trait Summary {
    // 实现 trait 的类型所需的方法签名
    fn summarize(&self) -> String; // 注意此处的分号！并不提供方法的具体实现
}
```

每个实现该 `Trait` 的类型都必须提供 `summarize` 方法的自定义实现，编译器会确保任何具有 `Summary` 特质的类型都拥有与这个签名相符的 `summarize` 方法定义。

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

在类型上实现特质与实现常规方法类似。不同之处在于 `impl` 关键字之后放置需要实现的特质名称，接着使用 `for` 关键字指定需要实现特质的类型的名称。在 `impl` 块中放置特质中定义的方法签名，然后在方法体中填充我们期望特质方法应具备的特定行为代码实现。

像调用常规方法一样调用特质方法：

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

`Summary` 特质、 `NewsArticle` 类型、`Tweet` 类型均定义于 *lib.rs*，它们处于同一作用域。*lib.rs* 被之前的 `aggregator` Crate 使用，其他库如果想要使用该 Crate 中的功能为其自身库作用域中的结构体实现 `Summary` 特质，首先需要将 trait 引入作用域（ 通过声明 `use aggregator::Summary;` 实现 ），其次，`Summary` 还必须是公有的 （ 在 `trait` 关键字前使用 `pub` 关键字 ），其他 Crate 才可以使用它。

### 特质实现时的限制

#### 仅当特质或要实现特质的类型位于当前 Crate 的本地作用域时，才能为类型实现特质

例如，可以为自定义类型 `Tweet` 实现标准库中的 `Display` 特质作为 `aggregator` Crate 功能的一部分，这是因为 `Tweet` 类型相对于 `aggregator` Crate 来说是本地的。也可以在 `aggregator` Crate 中标准库中的 `Vec<T>` 实现 `Summary` 特质，因为 `Summary` 特质相对于 `aggregator` Crate 来说是本地的。

#### 不能为外部类型实现外部特质

例如，不能在 `aggregator` Crate 中为 `Vec<T>` 实现 `Display` trait。这是因为 `Display` 和 `Vec<T>` 两者都定义于标准库，并不位于 `aggregator` Crate 的本地作用域中。此限制是被称为 **相干性** 的程序属性的一部分，或者更具体的说是 **孤儿规则**（ *orphan rule*，因其不存在父类型而得名 ）。此规则确保其他人编写的代码不会破坏你代码，反之亦然。如果没有此规则的话，两个 Crate 可以分别对相同类型实现相同的特质，Rust 会不清楚该使用哪一个实现。

## 默认实现

有时候，为特质中的某些或全部方法提供默认行为而不是要求每个类型去实现所有的方法是很有用的。当为某个特定类型实现特质时，可以选择保留或覆盖方法的默认实现。

```rust
pub trait Summary {
    fn summarize(&self) -> String {
        String::from("(Read more...)")
    }
}
```

要使类型 `NewsArticle` 的实例可以调用默认实现的特质方法（`summarize` ），来代替定义自定义实现，需要指定空 `impl` 块表示选择使用特质方法的默认实现：

```rust
impl Summary for NewsArticle {}
```

调用默认实现的特质方法 `summarize`：

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

为 `summarize` 方法创建默认实现不需要 `Tweet` 类型中的 `Summary` 特质实现做出任何改变。原因在于，覆盖默认实现的语法与实现一个无默认实现的特质方法的语法相同（ 即, 由于 `Tweet` 类型中的 `Summary` 特质实现没有使用空 `impl` 来使用默认实现，所以掉默认实现的 `summarize` 会被覆盖）。

默认实现可以调用同一特质中的其他方法，哪怕这些方法没有默认实现，这样的话，特质可以提供许多有用的功能而只需要实现者实现其中的一小部分。例如：

```rust
pub trait Summary {
    fn summarize_author(&self) -> String; // 要求使用者实现

    // 内部调用 summarize_author 抽象方法的默认实现
    fn summarize(&self) -> String {
        format!("(Read more from {}...)", self.summarize_author())
    }
}
```

实现此类特质时只需要实现 `summarize_author` 方法即可：

```rust
impl Summary for Tweet {
    fn summarize_author(&self) -> String {
        format!("@{}", self.username)
    }
}
```

定义 `summarize_author` 方法后，就可以在实例上调用 `summarize` 方法：

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

注意：无法从一个方法的覆盖实现中调用其默认实现。

## 特质作为参数

使用 `impl Trait` 语法定义函数 `notify` 参数，限制参数类型为实现了 `Summary` 特质的类型：

```rust
pub fn notify(item: impl Summary) {
    // 函数体中可以调用任何源自 `Summary` 特质的方法
    println!("Breaking news! {}", item.summarize());
}
```

此函数接受 `NewsArticle` 或 `Tweet` 的实例作为参数。任何其他没有实现 `Summary` 的类型，如 `String` 或 `i32`，作为参数调用 `notify` 将不能通过编译。

### 特质绑定语法

`impl Trait` 语法实际上是 *trait bound* 的语法糖，`trait bound` 适用于更复杂的场景。

```rust
// 特质绑定语法
pub fn notify<T: Summary>(item: T) {
    println!("Breaking news! {}", item.summarize());
}
```

```rust
// 参数可以具有不同类型，但都实现了 `Summary` 特质
pub fn notify(item1: impl Summary, item2: impl Summary) {
```

```rust
// 如果希望参数是相同类型，就只能使用特质绑定实现
// 实现了特质 Summary 的泛型类型 T 作为参数类型
pub fn notify<T: Summary>(item1: T, item2: T) {
```

### 通过 `+` 语法指定多个特质绑定

如果 `notify` 函数需要追加格式化输出 `item` 内容的功能，那么 `item` 就需要同时实现 `Display` 和 `Summary` 两个不同的特质：

```rust
pub fn notify(item: impl Summary + Display) {
```

`+` 语法也适用于泛型的特质绑定：

```rust
pub fn notify<T: Summary + Display>(item: T) {}
```

### 使用 `where` 从句提高特质绑定语法可读性

过多使用的特质绑定会带来负面影响。每个泛型有自己的特质绑定，所以有多个泛型参数的函数在其名称和参数列表之间会包含许多特质绑定信息，这使得函数签名难以阅读。

```rust
fn some_function<T: Display + Clone, U: Clone + Debug>(t: T, u: U) -> i32 {
```

Rust 提供了一个在函数签名之后使用从句指明特质绑定信息的语法，使函数签名更加清晰，可读性更好：

```rust
fn some_function<T, U>(t: T, u: U) -> i32
    where T: Display + Clone,
          U: Clone + Debug
{
```

## 返回实现某特质的类型

可以在返回值中使用 `impl Trait` 语法，返回实现了某个特质的类型：

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

Rust 中的闭包和迭代器会创建只有编译器能够理的类型，或者太长难以描述的类型。`impl  Trait` 语法可将其简单描述为 “一个返回某种实现了 `Iterator` 特质的类型的函数” 而无需写出长长的类型。

特质作为返回值只适用于返回单一类型的情况，如下代码无法编译：

```rust
// 函数返回类型为 `NewsArticle` 或 `Tweet`
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

此限制与 `impl Trait` 在编译器中的实现方式有关，如果确实有需要，可以参考 “为使用不同类型的值而设计的特质对象” 章节。

## 使用特质绑定修复 `largest` 函数（ 参见 “泛型” 章节代码示例 ）

修复“泛型”章节中的示例：

```shell
error[E0369]: binary operation `>` cannot be applied to type `T`
 --> src/main.rs:5:12
  |
5 |         if item > largest {
  |            ^^^^^^^^^^^^^^
  |
  = note: an implementation of `std::cmp::PartialOrd` might be missing for `T`
```

运算符 `>` 是由标准库中的特质 `std::cmp::PartialOrd` 定义的一个默认方法，所以需要在 `T` 的特质绑定中指定 `PartialOrd`，使 `largest` 函数可用于能够比较大小的类型的 `slice`。

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

这是因为将 `largest` 函数改成泛型形式后，无法确定参数 `list` 是否实现了 `Copy` 特质，这意味着可能无法将 `list[0]` 的值移动到 `largest` 变量中，从而导致了错误。而实例中 `i32` 和 `char` 这样的类型是已知大小的并可以储存在栈上，它们是实现了 `Copy` 特质的。要修复代码，需要在特质绑定信息中增加 `Copy`，进一步明确 `largest` 函数只对实现了 `Copy` 特质的类型适用。

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

如果并不希望限制 `largest` 函数只能用于实现了 `Copy` 特质的类型，可以在 `T` 的 特质绑定中指定 `Clone` 而不是 `Copy`，克隆 slice 的每一个值使得 `largest` 函数拥有其所有权。

不过使用 `clone` 函数意味着对于类似 `String` 这样拥有堆上数据的类型，会造成更多潜在的堆内存分配操作，而堆内存分配在涉及大量数据时可能会有性能问题。

### 其它实现 `largest` 的方式

将返回值从 `T` 改为 `&T` 并改变函数体使其能够返回一个引用，这种方式不需要任何 `Clone` 或 `Copy` 的特质绑定，并且避免堆内存分配。

## 使用特质绑定有条件地实现方法

使用带有特质绑定的泛型参数的 `impl` 块，可以只为那些实现了特定特质的类型实现方法。

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

## 使用特质绑定为已实现其它特质的类型有条件地实现特质

在任意类型上实现特质以满足特质绑定的做法被称为 *blanket implementations*，广泛用于 Rust 标准库中。

例如，标准库为任何实现了 `Display` 特质的类型实现了 `ToString` 特质：

```rust
impl<T: Display> ToString for T {
    // --snip--
}
```

正因如此，我们可以对任何实现了 `Display` 特质的类型调用由 `ToString` 特质定义的 `to_string` 方法。例如，可以将整型转换为对应的 `String` 值，因为整型实现了 `Display` 特质：

```rust
let s = 3.to_string();
```

`blanket implementation` 的相关内容位于 `Trait` 文档的 “Implementers” 部分。

## 小结

特质和特质绑定使我们可以编写使用泛型类型参数的代码以减少重复，同时向编译器表明希望泛型类型具备特定的行为。Rust 编译器利用特质绑定信息检查代码中的所有具体类型都提供了正确的行为。

在动态类型语言中，当调用一个类型还没有实现的方法时会引发运行时错误。Rust 将此类错误的检查移到了编译时，强制在代码能够运行前修复错误。此外，在 Rust 中无需为运行时行为编写检查代码，因为这个工作已经在编译时完成了，这在不放弃灵活性的前提下提高了泛型的性能。
