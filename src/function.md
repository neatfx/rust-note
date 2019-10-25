# 函数

- 使用 fn 关键字声明新函数
- 函数命名采用 snake case 风格（ 小写字母 + 下划线分割单词 ）
- 函数无需先定义再调用

```rust
fn main() {
    println!("Hello, world!");

    another_function();
}

// 函数定义在调用之后
fn another_function() {
    println!("Another function.");
}
```

## 参数

函数签名中必须声明每个参数的类型，多个参数使用逗号分割

```rust
fn main() {
    another_function(5, 6);
}

fn another_function(x: i32, y: i32) {
    println!("The value of x is: {}", x);
    println!("The value of y is: {}", y);
}
```

## 函数体

函数体由一系列的语句和一个可选的结尾表达式构成，语句（ Statements ）是执行一些操作但不返回值的指令，表达式（ Expressions ）计算并产生一个值。

Rust 是基于表达式的语言，这是 Rust 与其他语言的一个重要区别

```rust
fn main() {
    let y = 6; // 语句（ 使用 let 关键字创建变量并绑定一个值 ）
}
```

```rust
fn main() {
    // 编译错误: expected expression, found statement (`let`)
    let x = (let y = 6); // 语句不返回值，因此不能把 `let` 语句赋值给另一个变量
}
```

```rust
fn main() {
    let x = 5; // 5 是一个表达式

    // {} 也是一个表达式，let y = 4
    let y = {
        let x = 3;
        x + 1 // 表达式的结尾没有分号
    };

    println!("The value of y is: {}", y);
}
```

## 返回值

在 Rust 中，返回值无需命名，但要在箭头（ -> ）后声明其类型，函数的返回值等同于函数体最后一个表达式的值，使用 `return` 关键字可从函数中提前返回指定值。

```rust
fn five() -> i32 {
    5
}

fn main() {
    let x = five();

    println!("The value of x is: {}", x);
}
```

```rust
fn main() {
    let x = plus_one(5);

    println!("The value of x is: {}", x);
}

// 编译错误：“expected i32, found ()“，使用空元组 () 表示不返回值
fn plus_one(x: i32) -> i32 {
    x + 1; // 行尾分号表示这是一个语句，没有返回值，这与函数返回值的定义相矛盾
}
```
