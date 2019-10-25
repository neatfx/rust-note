# 生命周期

Rust 中的每一个引用都有其生命周期（ *Lifetime* ），即引用保持有效的作用域。

生命周期也是一种泛型，不同于其他泛型帮助我们确保类型拥有期望的行为，生命周期有助于确保引用在使用期间始终保持有效。

生命周期通常是隐含并可以推断的，类似于类型推断。正如有多种可能类型的时候必须使用类型注解，当引用的生命周期以不同的方式关联时，需要使用生命周期参数注明这些关系，从而确保运行时实际使用的引用是有效的。

生命周期的概念某种程度上说不同于其他语言中类似的工具，是 Rust 最与众不同的功能。

本章节介绍生命周期概念及语法，更多的细节请参考 “高级生命周期” 章节。

## 生命周期避免了悬垂引用

悬垂引用会导致程序引用非预期引用的数据，而生命周期的主要目标是避免悬垂引用！

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

> 注意：示例中声明了没有初始值的变量，好像与 Rust 不允许存在空值相冲突。然而如果尝试在赋值之前使用这个变量，会出现编译时错误，这说明了 Rust 确实不允许空值。

这段代码不能编译因为 `r` 引用的值在使用之前已经离开了作用域。如下是错误信息：

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

那么 Rust 是如何决定这段代码是不被允许的呢？这得益于借用检查器。

### 借用检查器

Rust 编译器有一个 **借用检查器**（ *borrow checker* ），用来比较作用域来确保所有的借用都是有效的。

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

这里，`r` 的生命周期标记为 `'a`， `x` 的生命周期标记为 `'b`。在编译时，Rust 比较这两个生命周期的大小，并发现 `r` 拥有生命周期 `'a` 并且引用了一个拥有生命周期 `'b` 的对象。程序编译失败，因为生命周期 `'b` 比生命周期 `'a` 要小，即被引用的对象比其引用者存在的时间短。

可正确编译，没有悬垂引用产生的例子：

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

此写法中的生命周期 `'b`，比 `'a` 大，Rust 知道 `r` 中的引用在 `x` 有效的时候也总是有效的。

## 函数中的泛型生命周期

尝试编写函数用于获取两个字符串 `slice` 中较长的一个：

```rust
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

提示指明返回值需要一个泛型生命周期参数，因为 Rust 并不知道将要返回的引用是指向 `x` 还是 `y`

定义函数时，实参未知，所以无法得知哪个分支会被执行，也不清楚作为实参的引用的具体生命周期，无法通过观察作用域来确定返回的引用是否总是有效。借用检查器对此同样也无法确定，因为它不清楚 `x` 和 `y` 的生命周期是如何与返回值的生命周期相关联的。

修复此错误，需要增加泛型生命周期参数，通过定义引用间的关系以便借用检查器可以进行分析。

## 生命周期注解语法

生命周期注解描述了多个引用生命周期相互的关系，但并不改变任何引用的生命周期的长短。

泛型生命周期参数的用法类似泛型类型参数，指定泛型生命周期后函数也能接受任何生命周期的引用。

- 生命周期参数名称必须以 `'` 开头
- 名称通常全是小写
- 类似于泛型，生命周期参数名称非常短，`'a` 是常见默认使用的名称
- 生命周期参数注解位于引用符号 `&` 之后，并使用一个空格分隔引用类型与生命周期注解

```rust
&i32        // 引用
&'a i32     // 带有显式生命周期的引用
&'a mut i32 // 带有显式生命周期的可变引用
```

生命周期注解用于表示多个引用的泛型生命周期如何关联，所以，单个生命周期注解没有太大意义。如果函数有两个生命周期为 `'a` 的引用类型参数 `first` 以及 `second`，这意味着这两个参数的存续时间必须与泛型生命周期一致。

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

在函数签名中指定生命周期参数时，并不改变任何传入后返回的值的生命周期，而是声明任何不遵守生命周期规则的传入值将被借用检查器拒绝。

注意 `longest` 函数并不需要知道 `x` 和 `y` 具体会存在多久，而只需要知道有某个可以被 `'a` 替代的作用域将会满足这个签名。

### 为什么需要手动标记生命周期

在函数中使用生命周期注解时，注解出现在函数签名而不是函数体中，因为 Rust 能够分析函数中代码而不需要任何协助。

当函数引用或被函数之外的代码引用时，让 Rust 分析出参数或返回值的生命周期几乎是不可能的。这些生命周期在每次函数被调用时都可能不同，这也是为什么需要手动标记生命周期。

### 传参后的生命周期处理过程

引用类型的实参被传递给 `longest` 时，被 `'a` 所替代的具体生命周期是 `x` 的作用域与 `y` 的作用域相重叠的那一部分。

换一种说法就是泛型生命周期 `'a` 的具体生命周期等同于 `x` 和 `y` 的生命周期中较小的那一个。因为我们用相同的生命周期参数 `'a` 标注了返回的引用值，所以返回的引用值就能保证在 `x` 和 `y` 中较短的那个生命周期结束之前保持有效。

通过传递拥有不同具体生命周期的引用来限制 `longest` 函数的使用：

```rust
fn main() {
    let string1 = String::from("long string is long");

    {
        let string2 = String::from("xyz");
        let result = longest(string1.as_str(), string2.as_str());
        println!("The longest string is {}", result);
    }
}
```

打印结果： `The longest string is long string is long`

以下代码不能通过编译，表明 `result` 的引用的生命周期必须是两个参数中较短的那个。

```rust
fn main() {
    let string1 = String::from("long string is long");
    let result;
    {
        let string2 = String::from("xyz");
        result = longest(string1.as_str(), string2.as_str());
    }

    // 尝试在 `string2` 离开作用域之后使用 `result`
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

错误表明：

为保证 `println!` 中的 `result` 是有效的，直到外部作用域结束 `string2` 都需要是有效的。Rust 之所以知道是因为（ `longest` ）函数的参数和返回值都使用了相同的生命周期参数 `'a`！

单凭直观，代码好像是没有问题的：

`string1` 更长，因此 `result` 会包含指向 `string1` 的引用。因为 `string1` 尚未离开作用域，对于 `println!` 来说 `string1` 的引用仍然是有效的。

而实际上，生命周期参数告诉 Rust 的是：

`longest` 函数返回的引用的生命周期应该与传入参数的生命周期中较短那个保持一致。因此，借用检查器不允许代码通过编译，因为可能出现无效的引用。

## 深入理解生命周期

指定生命周期参数的正确方式依赖函数实现的具体功能。

如果将 `longest` 函数的实现修改为总是返回第一个参数，就不需要为参数 `y` 指定生命周期：

```rust
// `y` 的生命周期与参数 `x` 和返回值的生命周期没有任何关系
fn longest<'a>(x: &'a str, y: &str) -> &'a str {
    x
}
```

当从函数返回一个引用，返回值的生命周期参数需要与一个参数的生命周期参数相匹配。如果返回的引用未指向任何参数，那么它只可能是指向函数内部创建的值，这将会是一个悬垂引用，因为它将会在函数结束时离开作用域！ 以下代码无法通过编译，即便为返回值指定了生命周期参数：

```rust
// 返回值的生命周期与参数完全没有关联
// 无法通过指定生命周期参数来改变悬垂引用，Rust 也不允许创建悬垂引用
fn longest<'a>(x: &str, y: &str) -> &'a str {
    let result = String::from("really long string");
    result.as_str()
} // 此处，`result` 离开作用域并被清理，从函数返回 `result` 的引用将形成悬垂引用
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

在这种情况下，最好的解决方案是返回一个有所有权的数据类型而不是一个引用，由函数调用者负责清理这个返回值。

生命周期语法用于将函数的多个参数与其返回值的生命周期进行关联。一旦形成了某种关联，Rust 就有足够信息来判别内存安全的操作并阻止会产生悬垂指针或违反内存安全的行为。

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

生命周期注解表明 `ImportantExcerpt` 实例不能比其 `part` 字段中的引用存在的更久。变量 `novel` 的数据先于 `ImportantExcerpt` 实例创建，而 `ImportantExcerpt` 离开作用域时， `novel` 还未离开作用域，所以 `ImportantExcerpt` 实例中的引用是有效的。

## 生命周期省略

每一个引用都有生命周期，需要为那些使用了引用的函数或结构体指定生命周期。

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

经过长期编码实践，Rust 团队发现在一些特定情况下总是会重复编写相同的生命周期注解代码，并且这些场景是可预测的，有明确的模式。于是 Rust 团队将这些模式编码进了 Rust 编译器中，借用检查器在这些情况下就能自动推断出生命周期而不再需要强制显式的增加生命周期注解。

鉴于更多明确的模式被添加到编译器中是完全可能的，未来需要编写的生命周期注解只会变得更少。

### 生命周期省略规则

被编码进 Rust 编译器的模式被称为生命周期省略规则（ *lifetime elision rules* ）。它们不是需要程序员遵守的规则，而是一系列特定场景，如果代码符合这些场景，就无需显式指定生命周期。

函数或方法的参数的生命周期被称为输入生命周期，而返回值的生命周期被称为输出生命周期。

编译器根据以下规则来判断是否需要声明周期注解，第一条规则适用于输入生命周期，后两条规则适用于输出生命周期，这些规则均适用于 `fn` 定义，以及 `impl` 块：

- 每一个是引用的参数都有它自己的生命周期参数。单个引用参数的函数对应单个生命周期参数：`fn foo<'a>(x: &'a i32)`，两个引用参数的函数对应两个不同的生命周期参数：`fn foo<'a, 'b>(x: &'a i32, y: &'b i32)`，依此类推。
- 如果只有一个输入生命周期参数，那么它被赋予所有输出生命周期参数。例如：`fn foo<'a>(x: &'a i32) -> &'a i32`
- 如果方法有多个输入生命周期参数，不过其中之一为 `&self` 或 `&mut self`，那么 `self` 的生命周期被赋给所有输出生命周期参数（ 需要的符号更少，也使方法更容易读写 ）

生命周期省略规则并不提供完整的推断。在 Rust 遵守生命周期省略规则的前提下，如果仍然存在无法推断生命周期的引用，借用检查器将停止继续推断剩余引用的生命周期并给出错误，这种情况则需要通过增加对应引用之间相联系的生命周期注解来解决。

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

现在，函数签名中的所有引用都有了生命周期，编译器可以继续分析而无须程序员标记生命周期。

### 生命周期省略规则应用示例 2

初始函数签名：

```rust
fn longest(x: &str, y: &str) -> &str {
```

编译器应用第一条规则，函数签名变为：

```rust
fn longest<'a, 'b>(x: &'a str, y: &'b str) -> &str {
```

编译器应用第二条规则，因为函数存在多个输入生命周期，规则并不适用。

编译器应用第三条规则，因为没有 `self` 参数，规则同样不适用。

应用三个规则之后，编译报错。原因就在于编译器使用了所有已知的生命周期省略规则后，仍不能计算出函数签名中所有引用（ 此例中指函数返回值的引用类型 ）的生命周期。

## 方法定义中的生命周期注解

第三条生命周期忽略规则真正能够适用的场景只有方法签名。

当为带有生命周期的结构体实现方法时，声明和使用生命周期参数的位置依赖于生命周期参数是否同结构体字段或方法参数和返回值相关。

实现方法时，结构体字段的生命周期必须总是在 `impl` 关键字之后声明，并在结构体名称之后被使用，因为这些生命周期是结构体类型的一部分。

`impl` 块里的方法签名中，引用可能与结构体字段中的引用相关联，也可能是独立的。另外，生命周期省略规则往往能够自动推断生命周期，无需在方法签名中使用生命周期注解。

```rust
struct ImportantExcerpt<'a> {
    part: &'a str,
}

// 使用带有生命周期的结构体时，`impl` 之后及类型名称之后的生命周期参数是必要的
impl<'a> ImportantExcerpt<'a> {
    // 方法 `level` 唯一参数是 `self` 的引用，而且返回值是一个 `i32`，未引用任何值
    // 应用第一条生命周期省略规则，无需须标注 `self` 引用的生命周期
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

// 使用带有生命周期的结构体时，`impl` 之后及类型名称之后的生命周期参数是必要的
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

`'static` 是一种特殊的生命周期，其生命周期存活于整个程序运行期间。

字符串的文本被直接储存在程序的二进制文件中（ 此文件总是可用的 ），因此，所有的字符串字面值都是 `'static` 的，都拥有 `'static` 生命周期，可以进行显式标注：

```rust
let s: &'static str = "I have a static lifetime.";
```

将引用指定为 `'static` 之前，先思考这个引用是否真的需要在整个程序的生命周期里都有效。

当希望一个变量始终保持有效时，遇到的往往是“尝试创建一个悬垂引用”或者“可用的生命周期不匹配”这种问题，正确的做法是解决这些问题而不是为变量指定 `'static` 生命周期。

## 泛型参数 + `trait bounds` + 生命周期

在同一函数中指定泛型类型参数、trait bounds 和生命周期：

```rust
use std::fmt::Display;

// 泛型 `T` 接受任何实现了 `Display` 特质（ `where` 从句中指定 ）的类型
// 生命周期也是泛型，所以 `'a` 和 `T` 都位于函数名后的同一尖括号列表中
fn longest_with_complex<'a, T>(x: &'a str, y: &'a str, ann: T) -> &'a str
    where T: Display
{
    // 此语句决定了 where 从句中的 `Display` trait bound 是必须的
    println!("Announcement! {}", ann);
    if x.len() > y.len() {
        x
    } else {
        y
    }
}
```

## 性能

生命周期注解描述引用生命周期之间的关系，应用于编译时，阻止出现悬垂引用，不影响运行时效率！
