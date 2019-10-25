# 应用模式的位置

## `match` 表达式的分支

```rust
match VALUE {
    PATTERN => EXPRESSION,
    PATTERN => EXPRESSION,
    PATTERN => EXPRESSION,
}
```

### 匹配所有可能的值

`match` 表达式必须是穷尽的，即所有可能的值都必须被考虑到。

通过在最后一个分支使用捕获所有的模式，可以实现覆盖所有匹配剩余情况的需求。

### 忽略所有未指定值

模式 `_` 匹配所有情况，但不绑定任何变量。适用于希望忽略任何未指定值的情况。

## `if let` 条件表达式

相比 `match` 表达式一次只能将一个值与模式比较，`if let` 表达式提供了更多灵活性。

```rust
fn main() {
    let favorite_color: Option<&str> = None;
    let is_tuesday = false;
    let age: Result<u8, _> = "34".parse();

    if let Some(color) = favorite_color {
        println!("Using your favorite color, {}, as the background", color);
    } else if is_tuesdaz z
        println!("Tuesday is green day!");
    } else if let Ok(age) = age {
        if age > 30 {
            println!("Using purple as the background color");
        } else {
            println!("Using orange as the background color");
        }
    } else {
        println!("Using blue as the background color");
    }
}
```

`if let` 表达式的缺点在于 Rust 编译器并不检查其穷尽性，而 `match` 表达式的穷尽性会被检查。

如果去掉示例代码最后的 `else` 块（ 遗漏处理一些情况 ），编译器也不会警告这其中可能存在的逻辑错误。

## `while let` 条件循环

可以使用 `while let` 访问栈中元素。

```rust
let mut stack = Vec::new();

stack.push(1);
stack.push(2);
stack.push(3);

while let Some(top) = stack.pop() {
    println!("{}", top);
}
```

打印结果： 3、2、 1

`pop` 方法取出 `Vector` 的最后一个元素并返回 `Some(value)`，如果 `Vector` 为空，返回 `None`。只要 `pop` 返回 `Some`，`while` 循环就会一直运行，当 `pop` 返回 `None`，`while` 循环停止。

## `for` 循环

`for` 可以获取模式。在 `for` 循环中，模式是紧跟 `for` 关键字的值，即 `for x in y` 中的 `x`

在 `for` 循环中使用模式来解构元组：

```rust
let v = vec!['a', 'b', 'c'];

for (index, value) in v.iter().enumerate() {
    println!("{} is at index {}", value, index);
}
```

`enumerate` 方法通过迭代器生成一个由值和其在迭代器中的索引组成的元组。以第一次 `enumerate` 调用产生的元组 `(0, 'a')` 为例，其与模式 `(index, value)` 匹配，`index` 将会是 `0` 而 `value` 将会是 `'a'`。

## `let` 语句

```rust
let x = 5;
```

实际上是在应用模式

```rust
let PATTERN = EXPRESSION;
```

`x` 是一个模式，代表 “将匹配到的值绑定到变量 x”，同时 `x` 是整个模式，这个模式实际上等于 “将任何值绑定到变量 `x`，不管值是什么”。

使用模式解构元组并一次创建三个变量：

```rust
let (x, y, z) = (1, 2, 3);
```

Rust 会将值 `(1, 2, 3)` 与模式 `(x, y, z)` 进行比较并匹配模式。

而以下代码会得到编译时错误，因为模式中元素的数量不匹配元组中元素的数量，则整个类型不匹配：

```rust
`let (x, y) = (1, 2, 3);
```

如果希望忽略元组中一个或多个值，可以在模式中使用 `_` 或 `..` 来忽略。

如果模式中的变量数量多于元组中元素的数量，解决方法则是删减变量。

## 函数参数

```rust
// 这里的参数 x 是一个模式！
fn foo(x: i32) {
    // 代码
}
```

可以在函数参数中匹配元组：

```rust
fn print_coordinates(&(x, y): &(i32, i32)) {
    println!("Current location: ({}, {})", x, y);
}

fn main() {
    let point = (3, 5);
    print_coordinates(&point);
}
```

## 闭包

闭包类似于函数，因此也可以在闭包参数列表中使用模式
