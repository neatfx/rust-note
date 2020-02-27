# 字符串

在 String 部分，Rust 新手通常由于以下三个原因被难倒：

- Rust 语言设计倾向于暴露所有可能的错误情况（ 提前预防错误的产生 ）
- 字符串这种数据结构实际上比许多程序员所认为的要复杂得多
- UTF-8 编码问题

了解集合之后讨论字符串很合适，因为字符串（ String ）被实现为字节的集合，外加一些在字节被解析为文本时会用到的处理方法。

## 字符串的概念

### `str`

Rust 核心语言中只有一种字符串类型 - string slice `str`，通常以借用的形式（ `&str` ）出现，用来指代一些储存在某处的 `UTF-8` 编码字符串数据的引用。比如 字符串字面量，就是存储在二进制程序文件中的 string slices。

### `String` 类型

由 Rust 标准库提供。是一种可增长的、可变的、有所有权的、UTF-8 编码的字符串类型。

在 Rust 中，谈及字符串通常是指 `String` 以及 `string slice`（`&str`）两种类型，它们在标准库中被广泛使用，并且都是 `UTF-8` 编码的。

Rust 标准库中还包含了一些其它的字符串类型，比如 `OsString`、`OsStr`、`CString`、`CStr`。库 Crates 能够为存储字符串数据提供更多选择。以 `String` 或是 `Str` 结尾的命名方式对应着有所有权和可借用的字符串类型变体。这些字符串类型能够以不同的编码或内存表现形式存储文本内容。

## 创建

```rust
// 新建空 String
let mut s = String::new();

// 3 种方式从字符串字面值创建带有初始内容数据的 String
// 编程实践中选择哪种只是代码风格问题
let data = "initial contents"; // 字符串字面值（ 实现了 Display 特质 ）

let s = data.to_string();
let s = "initial contents".to_string();
let s = String::from("initial contents");
```

字符串都是 UTF-8 编码的，以下都是有效的 `String` 值：

```rust
let hello = String::from("السلام عليكم");
let hello = String::from("Dobrý den");
let hello = String::from("Hello");
let hello = String::from("שָׁלוֹם");
let hello = String::from("नमस्ते");
let hello = String::from("こんにちは");
let hello = String::from("안녕하세요");
let hello = String::from("你好");
let hello = String::from("Olá");
let hello = String::from("Здравствуйте");
let hello = String::from("Hola");
```

## 更新

### 附加字符串

```rust
let mut s = String::from("foo");
s.push_str("bar"); // foobar
```

```rust
let mut s1 = String::from("foo");
let s2 = "bar";
s1.push_str(s2); // 方法参数使用 `string slice` 类型（&str），不需要获取其所有权

println!("s2 is {}", s2); // `push_str` 方法不获取 s2 的所有权，因此 s2 有效，代码可以正常打印
```

### 附加单独字符

```rust
let mut s = String::from("lo");
s.push('l'); // lol
```

### 拼接字符串

#### 使用 `+` 运算符

```rust
let s1 = String::from("Hello, ");
let s2 = String::from("world!"); // &s2 的类型是 &String 而不是 &str
let s3 = s1 + &s2; // 注意 s1 被移动了，不能继续使用
```

该运算符调用的方法签名类似 `fn add(self, s: &str) -> String {...}`，表示使用字符串 `s2` 的引用与字符串 `s1` 相加。

`&s2` 的类型（ `&String` ）与形参类型（ `&str` ）不符，编译仍可通过是因为 Rust 将 `&s2` 强制转换成了 `&s2[..]`，此操作（强制解引用）并未获取 `s2` 的所有权，所以操作之后 `s2` 仍然有效。

另外，`add` 获取了 `self` 的所有权，因为 `self` 没有使用 `&`，这意味着 `s1` 的所有权将被移动到 `add` 调用中，之后不再有效。所以 `let s3 = s1 + &s2;` 语句实际上会获取 `s1` 的所有权，附加上从 `s2` 中拷贝的内容，并返回结果的所有权。这个实现比多次复制数据更加高效。

#### 使用 `format!` 宏

```rust
let s1 = String::from("tic");
let s2 = String::from("tac");
let s3 = String::from("toe");

// 拼接数量较多的情况下，混合了大量 `+` 和 `"` 的表达式不够简洁直观
let s = s1 + "-" + &s2 + "-" + &s3;

// 使用宏改写之后更易读，并且不会获取任何参数的所有权（`+` 操作会获取 s1 的所有权）！
let s = format!("{}-{}-{}", s1, s2, s3);
```

## 字符串索引

在很多其他语言中，通过索引引用访问字符串中的单个字符是一个有效的常规操作。但是这在 Rust 中行不通。

```rust
let s1 = String::from("hello");
let h = s1[0]; // 报错： Rust 字符串不支持索引
```

错误信息：

```shell
error[E0277]: the trait bound `std::string::String: std::ops::Index<{integer}>` is not satisfied
 -->
  |
3 |     let h = s1[0];
  |             ^^^^^ the type `std::string::String` cannot be indexed by `{integer}`
  |
  = help: the trait `std::ops::Index<{integer}>` is not implemented for `std::string::String`
```

### 不支持字符串索引的原因一：内部存储模式

`String` 是一个基于 `Vec<u8>` 的封装类型

```rust
// 储存字符串的 Vec 的长度是 4 个字节（ 使用 UTF-8 编码时，每个字母占用一个字节 ）
let len = String::from("Hola").len();

// 储存字符串的 Vec 的长度是 24 个字节（ 使用 UTF-8 编码时所需的字节数 ）
// 原因在于每个 Unicode 标量值需要占用 2 个字节的存储空间
let len = String::from("Здравствуйте").len();
```

因此，字符串字节值的索引并不总是对应一个有效的 `Unicode` 标量值！

以下代码无效：

```rust
// 当使用 UTF-8 编码时，З 的第一个字节 208，第二个字节是 151
// 所以 answer 的值实际上是 208（ 字节索引位置 0 对应的唯一数据 ）
// 而 208 并不是期望返回的（ 它并不能表示一个有效的字符 ）
let hello = "Здравствуйте";
let answer = &hello[0]; // 208
```

用户通常并不希望返回字节值，即使字符串只由拉丁字符组成（假使 `&"hello"[0]` 是有效的代码，它将返回 104 而不是 h）。为了避免返回非预期的值导致难易察觉的 BUG，Rust 不会编译这些代码，从而在开发过程中防患于未然。

### 不支持字符串索引的原因二： 返回类型不明确

从 Rust 的角度有三种看待字符串的方式：字节、标量值和字型簇。下面以梵文书写的印度语单词“नमस्ते”为例，它使用一个 `Vector<u8>` 存储：

字节：

```shell
# 共有 18 个字节，即计算机最终会储存的文本数据
[224, 164, 168, 224, 164, 174, 224, 164, 184, 224, 165, 141, 224, 164,
 164, 224, 165, 135]
```

`Unicode` 标量值（Rust 的 char 类型）：

```shell
# 共 6 个 `char` 值，第四个和第六个不是字母，是发音符号，本身不具有意义
['न', 'म', 'स', '्', 'त', 'े']
```

字型簇：

```shell
# 得到构成单词的四个字母
["न", "म", "स्", "ते"]
```

Rust 并不关心其中存储的内容是何种人类语言，而是提供不同的方式用于解析原始字符串数据，程序按需选择即可。

### 不支持字符串索引的原因三：性能

常数时间 `O(1)` 的索引操作是最好的。但是 `String` 不能保证这样的性能，因为 Rust 需要检查从字符串开始位置到索引位置的内容来确定有多少有效字符。

## 字符串 `slice`

字符串索引操作的可能返回类型有：字节值、字符、字型簇、string slice，因此，如果确实需要使用索引创建 `string slices`，Rust 有更明确的要求。为了使索引更加明确并表明需要一个 `string slice`。相较于使用单个数字的`[]`进行索引，可以使用指定范围的`[]`来创建包含指定字节数据的 `string slice`。

```rust
let hello = "Здравствуйте";

// s 的类型为 &str, 这些字符长度是两个字节，取前四个字节的结果为 “Зд”
let s = &hello[0..4];
```

尝试获取  `&hello[0..1]` 将会运行时 panic，与访问 `Vector` 无效索引的表现一致：

```shell
thread 'main' panicked at 'byte index 1 is not a char boundary; it is inside 'З' (bytes 0..2) of `Здравствуйте`', src/libcore/str/mod.rs:2188:4
```

## 遍历

尽管无法对字符串进行索引，但是可以通过其它方式访问字符串元素。

### 获取字符串的 Unicode 标量值

```rust
// 顺序打印 6 个 char 类型的值
for c in "नमस्ते".chars() {
    println!("{}", c);
}
```

打印结果：

```shell
न
म
स
्
त
े
```

### 获取字符串的原始字节

```rust
// 打印组成 String 的 18 个字节
for b in "नमस्ते".bytes() {
    println!("{}", b);
}
```

打印结果：

```shell
224
164
// --snip--
165
135
```

备忘：有效的 Unicode 标量值可能由 1 个以上的字节构成

### 获取字符串的字形簇

此操作比较复杂，Rust 标准库并未提供该功能，如需要此功能可在 [crates.io](https://crates.io/) 找到相关可用的 Crates
