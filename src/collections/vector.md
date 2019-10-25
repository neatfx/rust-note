# Vector

`Vector` 允许在单个数据结构中储存多个相同类型的值，值在内存中相邻地排列。

Rust 编译时需要计算储存每个元素到底需要多少内存，因此必须知道确切的 `Vector` 类型。而如果允许 `Vector` 存放任意类型，那么当对 `Vector` 元素执行操作时就有可能会造成错误。

## 创建

```rust
// 带有类型注解的初始化
let v: Vec<i32> = Vec::new();

// 使用宏和初始值来进行类型自动推断的初始化
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

    // 处理变量 v

} // <- 这里 v 离开作用域并被销毁，其元素亦被销毁
```

## 读取

有两种方法读取 `Vector` 中的值，取决于程序如何处理读取超限，如果访问不存在的元素属于正常需要处理的情况，那么应该使用 `get` 方法（ 程序不会 `panic` 而是返回 `None` ），反之则需要使用索引语法`[]`（ 程序会 `panic` ）

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

错误原因在于 `Vector` 的工作方式：在 `Vector` 的结尾增加新元素时，当没有足够空间将所有所有元素依次相邻存放的情况下，可能会要求分配新内存并将老的元素拷贝到新的空间中。此时第一个元素的引用会指向被释放的内存。借用规则检查并规避此类状况。

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
    *i += 50; // 此处使用了解引用，以修改可变引用所指向的值
}
```

## 储存不同类型的值

当需要在 `Vector` 中存储不同类型的值时，可以使用枚举（ 枚举成员被定义为相同的枚举类型 ）。另外，配合枚举使用 `match` 还可以保证在编译时处理所有可能的情况。

如果无法确知运行时 `Vector` 中的类型，可使用特质对象代替枚举来实现存储不同类型值的目的。

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
