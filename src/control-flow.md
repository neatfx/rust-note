# 流程控制

## 条件表达式

### `if`

根据条件执行不同的代码分支

Rust 不会尝试自动地将非布尔值转换为布尔值，因此必须总是显式地使用布尔值作为 `if` 的条件，否则将得到错误。

```rust
fn main() {
    let number = 3;

    if number < 5 {
        println!("condition was true");
    } else {
        println!("condition was false");
    }
}
```

### `else if`

将 `else if` 表达式与 `if` 和 `else` 组合可以实现多重条件

```rust
fn main() {
    let number = 6;

    if number % 4 == 0 {
        println!("number is divisible by 4");
    } else if number % 3 == 0 {
        println!("number is divisible by 3");
    } else if number % 2 == 0 {
        println!("number is divisible by 2");
    } else {
        println!("number is not divisible by 4, 3, or 2");
    }
}
```

过多的 `else if` 表达式会使代码显得杂乱无章，意味着需要重构代码（ 参考 `match` )

### 在 `let` 语句中使用 `if`

因为 `if` 是一个表达式，可以在 `let` 语句的右侧使用它。

需要注意的是每个分支的可能的返回值都必须是相同类型，否则会产生错误（ 变量只能有一个类型 ）

```rust
fn main() {
    let condition = true;
    let number = if condition {
        5
    } else {
        6
    };

    println!("The value of number is: {}", number);
}
```

## 循环

### `loop`

重复执行代码

```rust
fn main() {
    loop {
        println!("again!");
    }
}
```

#### 从循环中返回

```rust
fn main() {
    let mut counter = 0;

    let result = loop {
        counter += 1;

        if counter == 10 {
            break counter * 2; // 将值放在 break 表达式后，以便在循环外使用
        }
    };

    assert_eq!(result, 20);
}
```

### `while`

当条件为真就执行，否则退出循环。

```rust
fn main() {
    let mut number = 3;

    while number != 0 {
        println!("{}!", number);

        number = number - 1;
    }

    println!("LIFTOFF!!!");
}
```

### `for`

遍历集合中的元素

#### 不使用 `for` 实现

```rust
fn main() {
    let a = [10, 20, 30, 40, 50];
    let mut index = 0;

    while index < 5 {
        println!("the value is: {}", a[index]);

        index = index + 1;
    }
}
```

这种实现方式很容易出错，如果索引长度不正确会导致程序 panic，也使程序更慢，因为编译器增加了运行时代码来对每次循环的每个元素进行条件检查

#### 使用 `for` 的实现

消除了可能由于超出数组的结尾或遍历长度不够而缺少一些元素而导致的错误问题，当数组元素数量发生变化时，无需做变动，代码更加简洁、安全。

```rust
fn main() {
    let a = [10, 20, 30, 40, 50];

    for element in a.iter() {
        println!("the value is: {}", element);
    }
}
```
