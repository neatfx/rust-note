# Vector

使用 `Vector` 可在单个数据结构中储存多个相同类型的值，值在内存中相邻排列。

Rust 编译时需要计算储存每个元素到底需要多少内存，因此必须知道确切的 `Vector` 类型。而如果允许 `Vector` 存放任意类型，那么当对 `Vector` 元素执行操作时就有可能会造成错误。

## 创建

```rust
// 此处使用带类型注解的初始化，因为未赋值的情况下，Rust无从知晓存储的是何种元素
// 注意 Vector 的实现使用了泛型
let v: Vec<i32> = Vec::new();

// 编程实践中，Rust 会在插入值时推断值的类型，，一般不需要添加类型注解。
// 常见的做法是声明带初始值的 Vector，Rust 为此提供了宏 `vec!`
let v = vec![1, 2, 3];
```

## 更新

```rust
let mut v = Vec::new();

v.push(5);
v.push(6);
v.push(7);
v.push(8);
```

使用 `pop` 方法可移除并返回 `Vector` 的最后一个元素

## 销毁

```rust
{
    let v = vec![1, 2, 3, 4];

    // 对 v 进行处理

} // v 离开作用域并被销毁，其元素亦被清理
```

此代码示例较为直观，当在 vector 元素中引入引用之后，情况就会变得有些复杂了。

## 读取

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

### 所有权和借用规则

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

## 遍历

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

## 储存不同类型的值

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
