# 生命周期

Rust 中的每一个引用都有其生命周期（ *Lifetime* ），即引用保持有效的作用域。

生命周期也是一种泛型，不同于其他泛型帮助我们确保类型拥有期望的行为，生命周期有助于确保引用在使用期间始终保持有效。

生命周期通常是隐式可以推断的，就像类型推断一样。正如存在多个可能类型的时候必须使用类型注解，当引用的生命周期可能以一些不同的方式相关联，必须使用泛型生命周期参数注明这些关系，从而确保运行时实际使用的引用绝对有效。

Rust 中的生命周期概念与其他语言中的工具有所不同，可以说是这门语言最独特的功能。

本章节介绍参见的生命周期语法以帮助熟悉其概念，更多的细节请参考 “高级生命周期” 章节。

## 使用生命周期避免悬垂引用

悬垂引用会导致程序引用非预期的数据，而生命周期的主要目的就是避免出现悬垂引用：

```rust
{
    let r;

    {
        let x = 5;
        r = &x;
    } // x 离开作用域

    println!("r: {}", r); // r 引用了无效的值
}
```

> 注意：示例中声明了无初始值变量，好像与 Rust 不允许存在空值相冲突。然而如果尝试在赋值之前使用这个变量，会出现编译时错误，这说明了 Rust 确实不允许空值。

这段代码不能编译因为 `r` 引用的值在使用之前已经离开了作用域。

错误信息如下：

```shell
error[E0597]: `x` does not live long enough
  --> src/main.rs:7:5
   |
6  |         r = &x;
   |              - borrow occurs here
7  |     }
   |     ^ `x` dropped here while still borrowed
...
10 | }
   | - borrowed value needs to live until here
```

那么 Rust 是如何断定此段代码是无效的呢？- Rust 使用了借用检查器！

### 借用检查器

Rust 编译器有一个 **借用检查器**（ *borrow checker* ），用来比较作用域来检查所有借用是否有效。

带有变量生命周期注释的示例：

```rust
{
    let r;                // ---------+-- 'a
                          //          |
    {                     //          |
        let x = 5;        // -+-- 'b  |
        r = &x;           //  |       |
    }                     // -+       |
                          //          |
    println!("r: {}", r); //          |
}                         // ---------+
```

这里，`r` 的生命周期标注为 `'a`， `x` 的生命周期标记为 `'b`。正如所见，内部的 `'b` 块要小于外部的 `'a` 块。Rust 在编译时比较这两个生命周期的大小，并发现 `r` 拥有生命周期 `'a` 但是引用了具有生命周期 `'b` 的内存。程序编译失败，因为生命周期 `'b` 比生命周期 `'a` 短：即被引用指向的对象比引用本身存在的时间短。

以下代码可正确编译，不会产生悬垂引用：

```rust
// 数据比引用有着更长的生命周期
{
    let x = 5;            // ----------+-- 'b
                          //           |
    let r = &x;           // --+-- 'a  |
                          //   |       |
    println!("r: {}", r); //   |       |
                          // --+       |
}                         // ----------+
```

此示例中的生命周期 `'b` 比 `'a` 长，这意味 `r` 可以引用 `x` ，因为 Rust 清楚知道当 `x` 有效时， `r` 中的引用总是有效。

## 函数中的泛型生命周期

尝试编写函数用于获取两个字符串 `slice` 中较长的一个：

```rust
// 函数被设计为接收 string slices 引用类型，因为不需要获取参数的所有权
fn longest(x: &str, y: &str) -> &str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}

fn main() {
    let string1 = String::from("abcd");
    let string2 = "xyz";

    let result = longest(string1.as_str(), string2);
    println!("The longest string is {}", result);
}
```

编译后出现有关生命周期的错误：

```shell
error[E0106]: missing lifetime specifier
 --> src/main.rs:1:33
  |
1 | fn longest(x: &str, y: &str) -> &str {
  |                                 ^ expected lifetime parameter
  |
  = help: this function's return type contains a borrowed value, but the
signature does not say whether it is borrowed from `x` or `y`
```

错误信息指明函数返回类型需要一个泛型生命周期参数，因为 Rust 不清楚返回的引用指向的是 `x` 还是 `y`。实际上我们也不清楚（此处指代 if 语句的实际执行情况）。

定义函数时，实参未知，所以无法得知哪个条件分支将会执行，也不清楚传入函数中的引用的具体生命周期，因此，无法通过观察作用域来确定返回的引用是否总是有效。借用检查器对此同样无法确定，因为它不清楚 `x` 和 `y` 的生命周期与返回值的生命周期的关系。

修复此错误，需要增加泛型生命周期参数来定义引用之间的关系，以便借用检查器进行分析。

## 生命周期注解语法

生命周期注解并不改变引用的存续时间长短。

类似在签名中使用泛型类型参数的函数能够接受任意类型参数，通过指定泛型生命周期参数，函数能够接受任何生命周期的引用作为参数。生命周期注解描述多个引用生命周期之间的相互关系，但并不改变生命周期。

生命周期注解使用了一种不常见的语法：

- 生命周期参数名称必须以 `'` 开头，通常为小写
- 类似于泛型类型，生命周期参数名称非常短，大多数人使用 `'a`
- 生命周期参数注解被放置于引用符号 `&` 之后，并用空格与引用类型隔开

```rust
&i32        // 引用
&'a i32     // 带有显式生命周期的引用
&'a mut i32 // 带有显式生命周期的可变引用
```

生命周期注解用于告诉 Rust 多个引用的泛型生命周期参数是如何关联的，因此，单个生命周期注解没有太多意义。例如，如果函数有两个生命周期为 `'a` 的引用类型参数 `first` 以及 `second`，生命周期注解表明这两个参数（引用类型）的存续时间必须与泛型生命周期一样长。

## 函数签名中的生命周期注解

使用泛型生命周期参数声明参数中的引用和返回值必须拥有相同的生命周期：

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}
```

在实践中，`longest` 函数所返回的引用的生命周期与传入函数的引用中生命周期较小的一个相同。这是我们希望 Rust 强制采取的约束。在函数签名中指定生命周期参数时，并不改变任何传入值或者返回值的生命周期，而是表明 - 任何不遵守生命周期规则的值将会被借用检查器拒绝。`longest` 函数只需知道某个可以替代 `'a` 的作用域会满足此函数签名，而不需要知道 `x` 和 `y` 具体会存在多久。

在函数中使用生命周期注解时，注解出现在函数签名而不是函数体中。Rust 能够自主分析函数内部的代码。然而，当函数中的引用来自或者返回到外部代码时，让 Rust 分析出参数或返回值的生命周期几乎是不可能的。每次函数被调用时这些生命周期都可能不一样，这也是为什么需要手动标记生命周期。

传递具体引用（实参）给 `longest` 函数时，`x` 的作用域与 `y` 的作用域的重叠部分将会替换 `'a`。换言之，泛型生命周期 `'a` 的具体生命周期等同于 `x` 和 `y` 两个生命周期中较小的那一个。因为我们已经用相同的生命周期参数 `'a` 标注了函数返回的引用，所以函数返回的引用将会在 `x` 和 `y` 中较短的那个生命周期长度内保持有效。

通过传递拥有不同具体生命周期的引用来限制 `longest` 函数的使用：

```rust
fn main() {
    let string1 = String::from("long string is long");

    {
        let string2 = String::from("xyz");
        // 带有生命周期注解的 longest 函数运行时，借用检查器将确保：result 的生命周期 = min(string1 的生命周期,  string2 的生命周期)
        let result = longest(string1.as_str(), string2.as_str());
        // 一旦 longest 函数通过生命周期检查，在 string2 的有效生命周期之内，访问 result 即是有效的
        println!("The longest string is {}", result);
    } // string2 的生命周期到此结束
} // string1 的生命周期到此结束
```

运行结果：

```shell
The longest string is long string is long
```

以下代码则不能通过编译，表明 `result` 的生命周期必须是两个参数中生命周期较小的那个。

```rust
fn main() {
    let string1 = String::from("long string is long");
    let result;
    {
        let string2 = String::from("xyz");
        result = longest(string1.as_str(), string2.as_str());
    }

    println!("The longest string is {}", result);
}
```

如果尝试编译会出现如下错误：

```shell
error[E0597]: `string2` does not live long enough
  --> src/main.rs:15:5
   |
14 |         result = longest(string1.as_str(), string2.as_str());
   |                                            ------- borrow occurs here
15 |     }
   |     ^ `string2` dropped here while still borrowed
16 |     println!("The longest string is {}", result);
17 | }
   | - borrowed value needs to live until here
```

错误信息表明：

为保证 `println!` 中的 `result` 是有效的，直到外部作用域结束 `string2` 都必须是有效的。Rust 之所以知道是因为 `longest` 函数的参数和返回值都使用了相同的生命周期参数 `'a`！

直观上代码好像是没有问题的：

`string1` 更长，因此 `result` 会包含指向 `string1` 的引用。因为 `string1` 尚未离开作用域，对于 `println!` 来说 `string1` 的引用仍然是有效的。

而实际上，生命周期参数告诉 Rust 的是：

`longest` 函数返回的引用的生命周期应该与传入参数的生命周期中较短那个保持一致。因此，借用检查器不允许代码通过编译，因为可能出现无效的引用。例如以下代码：

```rust
fn main() {
    let string1 = String::from("k");
    let result;
    {
        let string2 = String::from("xyz");
        result = longest(string1.as_str(), string2.as_str());
    }

    println!("The longest string is {}", result);
}
```

## 理解生命周期

在需要时如何指定生命周期参数取决于函数所实现的功能。

如果将 `longest` 函数改为总是返回第一个参数，则不需要为参数 `y` 指定生命周期参数：

```rust
// `y` 的生命周期与参数 `x` 或者返回值的生命周期没有任何关系
fn longest<'a>(x: &'a str, y: &str) -> &'a str {
    x
}
```

当函数返回一个引用，返回类型的生命周期参数需要与参数之一的生命周期参数相匹配。如果返回的引用未指向任何参数，那么它只可能是指向了函数内部创建的值，它将是一个悬垂引用，因为它指向的值会在函数运行结束时离开作用域！以下代码无法通过编译，即便为返回值指定了生命周期参数：

```rust
// 返回值的生命周期与参数的生命周期完全没有关系
// 无法通过指定生命周期参数来改变悬垂引用，Rust 不会允许创建悬垂引用
fn longest<'a>(x: &str, y: &str) -> &'a str {
    let result = String::from("really long string");
    result.as_str()
} // `result` 离开作用域并被清理，从函数返回的对于 `result` 的引用将形成悬垂引用
```

错误信息：

```shell
error[E0597]: `result` does not live long enough
 --> src/main.rs:3:5
  |
3 |     result.as_str()
  |     ^^^^^^ does not live long enough
4 | }
  | - borrowed value only lives until here
  |
note: borrowed value must be valid for the lifetime 'a as defined on the
function body at 1:1...
 --> src/main.rs:1:1
  |
1 | / fn longest<'a>(x: &str, y: &str) -> &'a str {
2 | |     let result = String::from("really long string");
3 | |     result.as_str()
4 | | }
  | |_^
```

这种情况下，最好的解决办法是返回一个有所有权的数据类型而不是引用，并由调用函数的代码负责清理该返回值。

归根结底，生命周期语法用于将函数的多个参数与其返回值的生命周期进行关联。一旦形成了关联，Rust 就有足够信息来放行内存安全的操作并阻止会产生悬垂指针或其它威胁内存安全的操作。

## 结构体定义中的生命周期注解

定义包含引用的结构体，需要为结构体定义中的每一个引用添加生命周期注解：

```rust
struct ImportantExcerpt<'a> {
    part: &'a str,
}

fn main() {
    let novel = String::from("Call me Ishmael. Some years ago...");
    let first_sentence = novel.split('.')
        .next()
        .expect("Could not find a '.'");
    let i = ImportantExcerpt { part: first_sentence };
}
```

生命周期注解表明 `ImportantExcerpt` 实例不能比其 `part` 字段中的引用存活的更久。变量 `novel` 的数据先于 `ImportantExcerpt` 实例创建，而 `ImportantExcerpt` 离开作用域时， `novel` 还未离开作用域，所以 `ImportantExcerpt` 实例中的引用是有效的。

## 生命周期省略

每个引用都有生命周期，需要为那些使用了引用的函数或结构体指定生命周期参数。

### 功能演进

在早期版本（ Pre-1.0 ）的 Rust 中，以下没有生命周期注解的代码是不能编译的：

```rust
fn first_word(s: &str) -> &str {
    let bytes = s.as_bytes();

    for (i, &item) in bytes.iter().enumerate() {
        if item == b' ' {
            return &s[0..i];
        }
    }

    &s[..]
}
```

引用都必须有明确的生命周期，函数签名需要改写成：

```rust
fn first_word<'a>(s: &'a str) -> &'a str {
```

经过长期编码实践，Rust 团队发现在一些特定情况下总是会重复编写相同的生命周期注解代码，并且这些场景是可预测的，有明确的模式。于是 Rust 团队将这些模式编码进了 Rust 编译器中，借用检查器遇到这些情况时就能够自动推断出生命周期而不再需要显式增加生命周期注解。

鉴于更多明确的模式被添加到编译器中是完全可能的，未来需要编写的生命周期注解只会变得更少。

### 生命周期省略规则

设定于 Rust 引用分析中的模式被称为生命周期省略规则（ *lifetime elision rules* ）。它们并非需要程序员遵守的规则，而是一系列特定用例，如果编译器认为代码符合这些用例，就无需显式指定生命周期。

生命周期忽略规则并不提供完整的推断。如果 Rust 在存在歧义的情况下应用规则到引用的生命周期，编译器不会猜测其余引用的生命周期。这种情况下，编译器会停止猜测并给出一个错误，错误信息包含通过添加生命周期注解指明引用是如何与其它引用相关联的说明，供解决问题使用。

函数或方法的参数的生命周期被称为输入生命周期，而返回值的生命周期被称为输出生命周期。

编译器根据以下规则在缺少显式声明的情况下查明引用的生命周期。第一条规则适用于输入生命周期，后两条规则适用于输出生命周期，如果编译器使用这 3 条规则之后，仍然存在不能确定生命周期的引用，编译器将停止编译并报错。这些规则均适用于 `fn` 定义，以及 `impl` 块：

- 每个引用类型的参数都有其自身的生命周期参数。换言之，具有单个引用类型参数的函数有一个生命周期参数：`fn foo<'a>(x: &'a i32)`，具有两个引用类型参数的函数有两个单独的生命周期参数：`fn foo<'a, 'b>(x: &'a i32, y: &'b i32)`，依此类推。
- 如果确定只有一个输入生命周期参数，那么该生命周期被赋予所有输出生命周期参数。例如：`fn foo<'a>(x: &'a i32) -> &'a i32`
- 如果有多个输入生命周期参数，但因为这是是方法，其中之一为 `&self` 或 `&mut self`，那么 `self` 的生命周期将被赋予所有输出生命周期参数。此规则需要的符号更少，使方法更容易编写和阅读。

### 生命周期省略规则应用示例 1

初始函数签名中的引用无任何生命周期注解：

```rust
fn first_word(s: &str) -> &str {
```

编译器应用第一条规则，函数签名变为：

```rust
fn first_word<'a>(s: &'a str) -> &str {
```

编译器应用第二条规则（ 因为函数签名只有一个输入生命周期参数所以适用规则 ），函数签名变为：

```rust
fn first_word<'a>(s: &'a str) -> &'a str {
```

现在，函数签名中的所有引用都有生命周期注解，编译器可以继续分析而无须程序员标记生命周期。

### 生命周期省略规则应用示例 2

初始函数签名：

```rust
fn longest(x: &str, y: &str) -> &str {
```

编译器应用第一条规则，函数签名变为：

```rust
fn longest<'a, 'b>(x: &'a str, y: &'b str) -> &str {
```

编译器应用第二条规则，因为函数存在多个输入生命周期，规则并不适用。编译器应用第三条规则，因为没有 `self` 参数，规则也不适用。在应用完三条规则之后，编译器仍然不能搞清楚函数签名中所有引用（ 此例中指函数返回的引用类型 ）的生命周期，因此将会报错。

## 方法定义中的生命周期注解

第三条生命周期忽略规则真正能够适用的场景只有方法签名。

当为带有生命周期的结构体实现方法时，使用与泛型类型参数相同的语法。声明和使用生命周期参数的位置依赖于方法是否同结构体字段、方法参数及返回值相关。

实现方法时，结构体字段的生命周期名总是在 `impl` 关键字之后声明，并在结构体名称之后使用，因为这些生命周期是结构体类型的一部分。

`impl` 块里的方法签名中，引用可能与结构体字段中的引用生命周期相关联，也可能是独立的。另外，生命周期省略规则通常能够自动推断生命周期，因此在方法签名中使用生命周期注解不是必须的。

```rust
struct ImportantExcerpt<'a> {
    part: &'a str,
}

// 为带有生命周期的结构体实现方法时，`impl` 之后及类型名称之后的生命周期参数是必须的
impl<'a> ImportantExcerpt<'a> {
    // 方法 `level` 唯一参数是 `self` 的引用，而且返回值是一个 `i32`，未引用任何值
    // 适用第一条生命周期省略规则，无需须标注 `self` 引用的生命周期
    fn level(&self) -> i32 {
        3
    }
}
```

适用第三条生命周期省略规则的示例：

```rust
struct ImportantExcerpt<'a> {
    part: &'a str,
}

impl<'a> ImportantExcerpt<'a> {
    // 这里有两个输入生命周期
    // 应用第一条生命周期省略规则，给予 `&self` 和 `announcement` 独立的生命周期
    // 应用第三条生命周期省略规则，返回值类型被赋予了 `&self` 的生命周期
    // 至此，方法签名中所有引用的生命周期都得到成功推断！
    fn announce_and_return_part(&self, announcement: &str) -> &str {
        println!("Attention please: {}", announcement);
        self.part
    }
}
```

## 静态生命周期

`'static` 是一种特殊的生命周期，用来表示引用在整个程序运行期间一直保持可用。

字符串的文本直接储存于二进制程序文件中（ 此文件总是可用的 ），因此，所有的字符串字面值都具有 `'static` 生命周期，可以进行显式标注：

```rust
let s: &'static str = "I have a static lifetime.";
```

可能遇到在错误消息中使用 `'static` 生命周期的建议。但是将引用标记为 `'static` 生命周期之前请考虑它是否真的需要在整个程序的运行期间保持有效，即使它可以。

多数时候，问题来自于 “尝试创建一个悬垂引用” 或者 “与现有的生命周期不匹配”，这时候，正确的做法是修复这些问题而不是使用 `'static` 生命周期。

## 泛型参数 + 特质绑定 + 生命周期

在同一函数中使用泛型参数、特质绑定、生命周期：

```rust
use std::fmt::Display;

// 泛型 `T` 接受任何实现了 `Display` 特质（ 通过 `where` 从句指定 ）的类型
// 生命周期也是泛型，所以 `'a` 和 `T` 都位于函数名之后的同一尖括号列表中
fn longest_with_complex<'a, T>(x: &'a str, y: &'a str, ann: T) -> &'a str
    where T: Display
{
    // 此语句决定了 where 从句中的 `Display` 特质绑定是必须的
    println!("Announcement! {}", ann);
    if x.len() > y.len() {
        x
    } else {
        y
    }
}
```

## 性能

泛型参数、特质绑定、生命周期这些特性所涉及的代码分析处理工作均发生于编译时，因此不会影响运行时性能！
