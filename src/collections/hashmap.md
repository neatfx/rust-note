# 散列表

`HashMap<K, V>` 类型用于保存键类型 K（ 任意类型 ）到值类型 V 的映射，它通过哈希函数（ hashing function ）来实现映射，决定如何将键和值放入内存（ 堆 ）中。

类似于 vector，哈希 map 是同质的：所有的键必须是相同类型，值也必须都是相同类型。

`HashMap` 相比 `Vector`、`String` 并不常用，因此没有包含在 `prelude` 中。标准库对 `HashMap` 的支持也相对较少（ 例如无内置的构建宏 ）。

## 新建

### `insert`

```rust
use std::collections::HashMap;

let mut scores = HashMap::new();

scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Yellow"), 50);
```

### 利用 `Vector` 的 `collect` 方法

```rust
use std::collections::HashMap;

let teams  = vec![String::from("Blue"), String::from("Yellow")];
let initial_scores = vec![10, 50];

// 此处 HashMap<_, _> 的类型注解是必须的：
// 因为 collect 收集的数据可能是很多不同的数据结构，除非显式指定否则 Rust 无从得知所需类型
// 而对于键和值的类型参数来说，又可以使用下划线占位
// 最终，Rust 能够根据 Vector 中的数据类型推断出 HashMap 中的对应类型
let scores: HashMap<_, _> = teams.iter().zip(initial_scores.iter()).collect();
```

## 所有权

对于 `i32` 这种已实现了 `Copy` 特质的类型，其值可复制到 `HashMap`，而对于 `String` 这种拥有所有权的值，其值将被移动，之后，`HashMap` 将成为这些值的所有者。

注意：如果将值的引用插入 `HashMap`，值本身不会被移动，但是必须确保这些值至少在 `HashMap` 有效时是有效的，这就需要使用 Rust 的生命周期特性来保证引用的有效性。

```rust
use std::collections::HashMap;

let field_name = String::from("Favorite color");
let field_value = String::from("Blue");

let mut map = HashMap::new();
map.insert(field_name, field_value);
// 这里 field_name 和 field_value 不再有效，尝试使用它们将导致编译错误！
```

## 访问值

### 使用 `get` 获取值

```rust
use std::collections::HashMap;

let mut scores = HashMap::new();

scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Yellow"), 50);

let team_name = String::from("Blue");
let score = scores.get(&team_name); // Some(10)
```

### 使用 `for` 循环遍历键值对

```rust
use std::collections::HashMap;

let mut scores = HashMap::new();

scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Yellow"), 50);

for (key, value) in &scores {
    println!("{}: {}", key, value); // 以任意顺序打印（ 需要附加代码验证是否总是为任意顺序 ）
}

```

## 更新

### 覆盖旧值

```rust
use std::collections::HashMap;

let mut scores = HashMap::new();

scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Blue"), 25);

println!("{:?}", scores);
```

### 插入新的键值对

`HashMap` 具有 `entry` 方法，以键作为参数，返回值为枚举 `Entry`（ 代表可能存在也可能不存在的值 ）。而 `Entry` 具有 `or_insert` 方法，该方法在键对应的值存在时返回该值的 `Entry`，如不存在则将参数作为新值插入并返回修改过的 `Entry`

```rust
use std::collections::HashMap;

let mut scores = HashMap::new();
scores.insert(String::from("Blue"), 10);

scores.entry(String::from("Yellow")).or_insert(50);
scores.entry(String::from("Blue")).or_insert(50);

println!("{:?}", scores);
```

### 根据旧值更新

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

## 哈希函数

`HashMap` 默认使用 “密码学安全的” 的 `SipHash` 哈希函数，可以抵抗 DoS 攻击，尽管没有使用最快的算法，不过为了更高的安全性值得付出一些性能的代价。

如果对 `SipHash` 的性能不满意，可以指定一个不同的 `hasher` 替换它。

`hasher` 是实现了 `BuildHasher` 特质的类型，在 [crates.io](https://crates.io/) 可以找到许多他人分享的实现了常用哈希算法的 `hasher` 库，没有必要从零开始实现自己的 `hasher`。
