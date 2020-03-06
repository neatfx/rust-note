# 常见集合（ Common Collections ）

Rust 标准库中包含了一些被称为集合的数据结构。大部分其它数据类型表示一个特定的值，而集合可以持有多个值。与内置的 `Array` 以及 `Tuple` 不同，集合指向的数据储存在堆内存上，这意味着程序在编译时不需要知道数据的空间占用量，并且数据的内存使用量可在运行时伸缩。

每种集合都有不同的能力和开销，如何选择合适的集合是一种能力，需要时间和经验的积累。

Rust 程序中常用的集合有:

* [Vector](./vector.md)
* [String](./string.md)
* [HashMap](./hashmap.md)

了解标准库中的其它集合类型可参考[文档](https://doc.rust-lang.org/std/collections/index.html)

## Vectors

使用 `Vector` 可在单个数据结构中储存多个相同类型的值，值在内存中相邻排列。

Rust 编译时需要计算储存每个元素到底需要多少内存，因此必须知道确切的 `Vector` 类型。而如果允许 `Vector` 存放任意类型，那么当对 `Vector` 元素执行操作时就有可能会造成错误。

### 创建

```rust
// 此处使用带类型注解的初始化，因为未赋值的情况下，Rust无从知晓存储的是何种元素
// 注意 Vector 的实现使用了泛型
let v: Vec<i32> = Vec::new();

// 编程实践中，Rust 会在插入值时推断值的类型，，一般不需要添加类型注解。
// 常见的做法是声明带初始值的 Vector，Rust 为此提供了宏 `vec!`
let v = vec![1, 2, 3];
```

### 更新

```rust
let mut v = Vec::new();

v.push(5);
v.push(6);
v.push(7);
v.push(8);
```

使用 `pop` 方法可移除并返回 `Vector` 的最后一个元素

### 销毁

```rust
{
    let v = vec![1, 2, 3, 4];

    // 对 v 进行处理

} // v 离开作用域并被销毁，其元素亦被清理
```

此代码示例较为直观，当在 vector 元素中引入引用之后，情况就会变得有些复杂了。

### 读取

有两种方法读取 `Vector` 中的值，具体使用哪种则取决于程序如何处理读取超限。如果访问不存在的元素属于正常需要处理的情况，那么应该使用 `get` 方法（ 读取不存在元素时，程序不会 `panic` 而是返回 `None` ），反之可以使用索引语法`[]`（ 读取不存在元素时，程序会 `panic` ）

```rust
let v = vec![1, 2, 3, 4, 5];

let third: &i32 = &v[2];
println!("The third element is {}", third);

match v.get(2) {
    Some(third) => println!("The third element is {}", third),
    None => println!("There is no third element."),
}
```

```rust
let v = vec![1, 2, 3, 4, 5];

let does_not_exist = &v[100]; // 程序 panic
let does_not_exist = v.get(100); // 返回 None
```

#### 所有权和借用规则

```rust
let mut v = vec![1, 2, 3, 4, 5];

let first = &v[0];

v.push(6);

println!("The first element is: {}", first);
```

编译报错：

```rust
error[E0502]: cannot borrow `v` as mutable because it is also borrowed
as immutable
  --> src/main.rs:10:5
   |
8  |     let first = &v[0];
   |                  - immutable borrow occurs here
9  |
10 |     v.push(6);
   |     ^^^^^^^^^ mutable borrow occurs here
11 |
12 |     println!("The first element is: {}", first);
   |                                          ----- borrow later used here
```

错误原因在于 `Vector` 的工作方式：在 `Vector` 的结尾增加新元素时，如果没有足够空间将所有所有元素依次相邻存放，可能会要求分配新内存并将当前 vector 元素复制到新的空间中。此时第一个元素的引用会指向被释放的内存空间。借用规则帮助程序规避此类状况。

### 遍历

通过 `for` 循环遍历 `Vector` 中元素的不可变引用:

```rust
let v = vec![100, 32, 57];
for i in &v {
    println!("{}", i);
}
```

通过 `for` 循环遍历 `Vector` 中元素的可变引用:

```rust
let mut v = vec![100, 32, 57];
for i in &mut v {
    *i += 50; // 注意此处使用了解引用操作，以修改可变引用所指向的值
}
```

### 储存不同类型的值

当需要在 `Vector` 中存储不同类型的值时，可以使用枚举（ 枚举变体被看作相同的枚举类型，对应 vector 的泛型 T ）。

```rust
enum SpreadsheetCell {
    Int(i32),
    Float(f64),
    Text(String),
}

let row = vec![
    SpreadsheetCell::Int(3),
    SpreadsheetCell::Text(String::from("blue")),
    SpreadsheetCell::Float(10.12),
];
```

Rust 在编译时需要知道 vector 中的类型，从而计算需要多少堆内存来存储 vector 中的全部元素。一个附加好处是明确 vector 中允许存放的类型，假如 Rust 允许 vector 持有任意类型，那么一个或多个类型就有可能在对 vector 中的元素进行操作时引发错误，使用枚举 + `match` 表达式使 vector 支持多类型，意味着 Rust 可以确保在编译时处理所有可能的情况。

如果 `Vector` 中的多类型集合在运行时不确定，那么利用枚举存储不同类型的方案就行不通了。不过，仍然可使用特质对象代替枚举来实现在 vector 中存储不同类型的目的。

## Strings

在 String 部分，Rust 新手通常由于以下三个原因被难倒：

- Rust 语言设计倾向于暴露所有可能的错误情况（ 提前预防错误的产生 ）
- 字符串这种数据结构实际上比许多程序员所认为的要复杂得多
- UTF-8 编码问题

了解集合之后讨论字符串很合适，因为字符串（ String ）被实现为字节的集合，外加一些在字节被解析为文本时会用到的处理方法。

### 字符串的概念

#### `str`

Rust 核心语言中只有一种字符串类型 - string slice `str`，通常以借用的形式（ `&str` ）出现，用来指代一些储存在某处的 `UTF-8` 编码字符串数据的引用。比如 字符串字面量，就是存储在二进制程序文件中的 string slices。

#### `String` 类型

由 Rust 标准库提供。是一种可增长的、可变的、有所有权的、UTF-8 编码的字符串类型。

在 Rust 中，谈及字符串通常是指 `String` 以及 `string slice`（`&str`）两种类型，它们在标准库中被广泛使用，并且都是 `UTF-8` 编码的。

Rust 标准库中还包含了一些其它的字符串类型，比如 `OsString`、`OsStr`、`CString`、`CStr`。库 Crates 能够为存储字符串数据提供更多选择。以 `String` 或是 `Str` 结尾的命名方式对应着有所有权和可借用的字符串类型变体。这些字符串类型能够以不同的编码或内存表现形式存储文本内容。

### 创建字符串

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

### 更新字符串

#### 附加字符串

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

#### 附加单独字符

```rust
let mut s = String::from("lo");
s.push('l'); // lol
```

#### 拼接字符串

##### 使用 `+` 运算符

```rust
let s1 = String::from("Hello, ");
let s2 = String::from("world!"); // &s2 的类型是 &String 而不是 &str
let s3 = s1 + &s2; // 注意 s1 被移动了，不能继续使用
```

该运算符调用的方法签名类似 `fn add(self, s: &str) -> String {...}`，表示使用字符串 `s2` 的引用与字符串 `s1` 相加。

`&s2` 的类型（ `&String` ）与形参类型（ `&str` ）不符，编译仍可通过是因为 Rust 将 `&s2` 强制转换成了 `&s2[..]`，此操作（强制解引用）并未获取 `s2` 的所有权，所以操作之后 `s2` 仍然有效。

另外，`add` 获取了 `self` 的所有权，因为 `self` 没有使用 `&`，这意味着 `s1` 的所有权将被移动到 `add` 调用中，之后不再有效。所以 `let s3 = s1 + &s2;` 语句实际上会获取 `s1` 的所有权，附加上从 `s2` 中拷贝的内容，并返回结果的所有权。这个实现比多次复制数据更加高效。

##### 使用 `format!` 宏

```rust
let s1 = String::from("tic");
let s2 = String::from("tac");
let s3 = String::from("toe");

// 拼接数量较多的情况下，混合了大量 `+` 和 `"` 的表达式不够简洁直观
let s = s1 + "-" + &s2 + "-" + &s3;

// 使用宏改写之后更易读，并且不会获取任何参数的所有权（`+` 操作会获取 s1 的所有权）！
let s = format!("{}-{}-{}", s1, s2, s3);
```

### 字符串索引

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

#### 不支持字符串索引的原因一：内部存储模式

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

#### 不支持字符串索引的原因二： 返回类型不明确

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

#### 不支持字符串索引的原因三：性能

常数时间 `O(1)` 的索引操作是最好的。但是 `String` 不能保证这样的性能，因为 Rust 需要检查从字符串开始位置到索引位置的内容来确定有多少有效字符。

### 字符串 `slice`

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

### 遍历字符串

尽管无法对字符串进行索引，但是可以通过其它方式访问字符串元素。

#### 获取字符串的 Unicode 标量值

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

#### 获取字符串的原始字节

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

#### 获取字符串的字形簇

此操作比较复杂，Rust 标准库并未提供该功能，如需要此功能可在 [crates.io](https://crates.io/) 找到相关可用的 Crates

## Hash Maps

`HashMap<K, V>` 类型用于保存键类型 K（ 可以是任意类型 ）到值类型 V 的映射。决定如何将键和值放入内存（ 堆 ）中是通过哈希函数（ hashing function ）来实现的。

### 新建 HashMap

#### `insert`

```rust
use std::collections::HashMap;

let mut scores = HashMap::new();

scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Yellow"), 50);
```

相比 `Vector`、`String`，`HashMap` 是三者中最不常用的，因此没有包含在 `prelude` 中。标准库对 `HashMap` 的支持也相对较少（ 比如说它没有内置构建宏 ）。

与 Vector 一样，HashMap 的数据存储在堆上。

HashMap 是同质的：所有的键必须是同一类型，值也必须是相同的类型。

#### 利用 `Vector`/`Tuple` 的 `collect` 方法

```rust
use std::collections::HashMap;

let teams  = vec![String::from("Blue"), String::from("Yellow")];
let initial_scores = vec![10, 50];

// 此处 HashMap<_, _> 的类型注解是必须的：
// 因为 collect 以多种不同的数据结构为目标，除非显式指定否则 Rust 无从得知其类型
// 而对于键和值的类型参数来说，又可以使用下划线占位
// 最终，Rust 能够根据 Vector 中的数据类型推断出 HashMap 中的对应类型
let scores: HashMap<_, _> = teams.iter().zip(initial_scores.iter()).collect();
```

### 所有权

对于像 `i32` 这种已实现了 `Copy` 特质的类型，其值被复制到 `HashMap`，而对于 `String` 这种拥有值所有权的类型，值将被移动入 `HashMap` , `HashMap` 将成为这些值的所有者。

```rust
use std::collections::HashMap;

let field_name = String::from("Favorite color");
let field_value = String::from("Blue");

let mut map = HashMap::new();
map.insert(field_name, field_value);
// 此处 field_name 和 field_value 不再有效，尝试使用它们将导致编译错误！
```

注意：如果将值的引用插入 `HashMap`，值本身不会被移动，但是必须确保这些值至少在 `HashMap` 可用期间是有效的，这需要使用生命周期特性来保证。

### 访问值

#### 使用 `get` 获取值

```rust
use std::collections::HashMap;

let mut scores = HashMap::new();

scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Yellow"), 50);

let team_name = String::from("Blue");
let score = scores.get(&team_name); // Some(&10)
```

#### 使用 `for` 循环遍历键值对

```rust
use std::collections::HashMap;

let mut scores = HashMap::new();

scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Yellow"), 50);

for (key, value) in &scores {
    println!("{}: {}", key, value); // 以任意顺序打印（ 需要附加代码验证是否总是为任意顺序 ）
}
```

打印结果：

```shell
Yellow: 50
Blue: 10
```

### 更新 HashMap

#### 强制覆盖旧值

```rust
use std::collections::HashMap;

let mut scores = HashMap::new();

scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Blue"), 25);

println!("{:?}", scores);
```

#### 插入新的键值对

`HashMap` 具有 `entry` 方法，以键作为参数，返回值为枚举 `Entry`（ 代表可能存在也可能不存在的值 ）。如果参数键存在，`Entry` 拥有的 `or_insert` 方法可以返回与键相对应的值的可变引用。如果参数键不存在，则将传给 `or_insert` 方法的参数作为键的新值插入并返回新值的可变引用。这比自己编写实现相关逻辑更简洁，并且与借用检查器配合得很好。

```rust
use std::collections::HashMap;

let mut scores = HashMap::new();
scores.insert(String::from("Blue"), 10);

scores.entry(String::from("Yellow")).or_insert(50);
scores.entry(String::from("Blue")).or_insert(50);

println!("{:?}", scores);
```

#### 根据旧值更新

```rust
use std::collections::HashMap;

let text = "hello world wonderful world";

let mut map = HashMap::new();

for word in text.split_whitespace() {
    let count = map.entry(word).or_insert(0);
    *count += 1;
}

println!("{:?}", map); // {"world": 2, "hello": 1, "wonderful": 1}
```

`or_insert` 方法实际返回的是值的一个可变引用 `&mut V`，所以赋值前必须使用 `*` 进行解引用，这个可变引用在 `for` 循环的结尾离开作用域，因此所有操作都是安全的并符合借用规则。

### 散列函数

`HashMap` 默认使用 “密码学安全的” 的 `SipHash` 哈希函数，可以抵抗 DoS 攻击，尽管不是最快的算法实现，不过为了获得更好的安全性舍弃一点性能是值得的。

如果默认的 `SipHash` 的性能不能满足性能需求，可以通过指定不同的 `hasher` 切换到其它的散列函数。

`hasher` 是实现了 `BuildHasher` 特质的类型，在 [crates.io](https://crates.io/) 可以找到许多其它 Rust 用户分享的实现常用散列算法的 `hasher` 库，没有必要从零开始自己实现一个 `hasher`。
