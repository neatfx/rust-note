# 编写测试

Rust 中的测试是一个带有 `test` 属性注解的函数

将一个函数变成测试函数，需要在 `fn` 行之前添加元数据属性注解 `#[test]`

运行 `cargo test` 命令后，Rust 会构建测试执行程序来调用测试函数，并报告测试结果。

```rust
# fn main() {}
#[cfg(test)] // 元数据属性注解
mod tests {
    #[test] // 元数据属性注解
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }

    // tests 模块中同时包含非测试的函数来提供辅助功能
    fn helper() {
    }
}
```

运行测试：

```shell
$ cargo test
   Compiling adder v0.1.0 (file:///projects/adder)
    Finished dev [unoptimized + debuginfo] target(s) in 0.22 secs
     Running target/debug/deps/adder-ce99bcc2479f4607

running 1 test
test tests::it_works ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out

   Doc-tests adder

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

## 使用 assert! 宏检查结果

`assert!` 宏由标准库提供，在希望确保测试中一些条件为 `true` 时非常有用。

需要向 `assert!` 宏提供一个求值为布尔值的参数。

如果参数为 `true`，`assert!` 什么也不做，测试通过。如果参数为 `false`，`assert!` 将调用 `panic!` 宏，测试失败。`assert!` 宏用于检查代码是否以期望的方式运行。

```rust
#[derive(Debug)]
pub struct Rectangle {
    length: u32,
    width: u32,
}

impl Rectangle {
    pub fn can_hold(&self, other: &Rectangle) -> bool {
        self.length > other.length && self.width > other.width
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn larger_can_hold_smaller() {
        let larger = Rectangle { length: 8, width: 7 };
        let smaller = Rectangle { length: 5, width: 1 };

        assert!(larger.can_hold(&smaller));
        assert!(!smaller.can_hold(&larger)); // 注意此处的取反操作
    }
}
```

测试结果：

```shell
running 2 tests
test tests::smaller_cannot_hold_larger ... ok
test tests::larger_can_hold_smaller ... ok

test result: ok. 2 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

引入 BUG：

```rust
impl Rectangle {
    pub fn can_hold(&self, other: &Rectangle) -> bool {
        self.length < other.length && self.width > other.width
    }
}
```

测试结果：

```shell
running 2 tests
test tests::smaller_cannot_hold_larger ... ok
test tests::larger_can_hold_smaller ... FAILED

failures:

---- tests::larger_can_hold_smaller stdout ----
    thread 'tests::larger_can_hold_smaller' panicked at 'assertion failed:
    larger.can_hold(&smaller)', src/lib.rs:22:8
note: Run with `RUST_BACKTRACE=1` for a backtrace.

failures:
    tests::larger_can_hold_smaller

test result: FAILED. 1 passed; 1 failed; 0 ignored; 0 measured; 0 filtered out
```

## 测试相等

- 传递给 `assert_eq!` 宏的两个值相等时测试通过，反之失败
- 传递给 `assert_ne!` 宏的两个值不相等时测试通过，反之失败

```rust
# fn main() {}
pub fn add_two(a: i32) -> i32 {
    a + 2
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_adds_two() {
        assert_eq!(4, add_two(2));
    }
}
```

`assert_eq!` 和 `assert_ne!` 宏在底层分别使用了 `==` 和 `!=`。当断言失败时，这些宏会使用调试格式打印出其参数，这意味着被比较的值必需实现了 `PartialEq` 和 `Debug` 特质。

所有的基本类型和大部分标准库类型都实现了这些特质。

对于自定义的结构体和枚举，需要实现 `PartialEq` 才能断言他们的值是否相等。需要实现 `Debug` 才能在断言失败时打印他们的值。因为这两个特质都是派生特质，通常可以直接在结构体或枚举上添加 `#[derive(PartialEq, Debug)]` 注解。

## 自定义失败信息

可以向 `assert!`、`assert_eq!` 和 `assert_ne!` 宏传递包含自定义失败信息的可选参数，可选参数被传递给 `format!` 宏处理，所以可以传递一个包含 {} 占位符的格式字符串和需要放入占位符的值，自定义失败信息将在测试失败时被打印。

自定义失败信息有助于标记断言的意义，当测试失败时也更容易分析问题原因。

```rust
# fn main() {}
pub fn greeting(name: &str) -> String {
    format!("Hello {}!", name)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn greeting_contains_name() {
        let result = greeting("Carol");

        // 在被测试函数的实现还不确定的情况下，
        // 相比断言整个返回值，仅断言返回值中包含输入参数的部分即可
        assert!(result.contains("Carol"));
    }
}
```

引入BUG：

```rust
pub fn greeting(name: &str) -> String {
    String::from("Hello!")
}
```

运行测试：

```shell
running 1 test
test tests::greeting_contains_name ... FAILED

failures:

---- tests::greeting_contains_name stdout ----
        thread 'tests::greeting_contains_name' panicked at 'assertion failed:
result.contains("Carol")', src/lib.rs:12:8
note: Run with `RUST_BACKTRACE=1` for a backtrace.

failures:
    tests::greeting_contains_name
```

测试结果仅输出了断言失败的提示以及失败行号，没有更多可用的信息提供参考，此时正是自定义错误信息发挥作用的场景。

改进代码以包含更多详细提示信息：

```rust
#[test]
fn greeting_contains_name() {
    let result = greeting("Carol");
    assert!(
        // 使用可选参数以提供自定义失败信息
        result.contains("Carol"),
        "Greeting did not contain name, value was `{}`", result
    );
}
```

再次运行测试：

```shell
---- tests::greeting_contains_name stdout ----
        thread 'tests::greeting_contains_name' panicked at 'Greeting did not
contain name, value was `Hello!`', src/lib.rs:12:8
note: Run with `RUST_BACKTRACE=1` for a backtrace.
```

此时在测试输出中可以看到自定义失败信息结果，这将帮助我们理解失败的原因。

## 使用 `should_panic` 检查 panic

除了测试代码是否返回期望值之外，测试代码是否按照期望处理错误也很重要。

可通过为函数增加属性 `should_panic` 来实现此类测试，`should_panic` 属性在函数中的代码 `panic` 时会通过，反之失败。

```rust
# fn main() {}
pub struct Guess {
    value: i32,
}

impl Guess {
    pub fn new(value: i32) -> Guess {
        if value < 1 || value > 100 {
            panic!("Guess value must be between 1 and 100, got {}.", value);
        }

        Guess {
            value
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    #[should_panic]
    fn greater_than_100() {
        Guess::new(200);
    }
}
```

测试通过：

```shell
running 1 test
test tests::greater_than_100 ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

引入BUG：

```rust

impl Guess {
    pub fn new(value: i32) -> Guess {
        if value < 1  {
            panic!("Guess value must be between 1 and 100, got {}.", value);
        }

        Guess {
            value
        }
    }
}
```

测试结果失败：

```shell
running 1 test
test tests::greater_than_100 ... FAILED

failures:

failures:
    tests::greater_than_100

test result: FAILED. 0 passed; 1 failed; 0 ignored; 0 measured; 0 filtered out
```

尽管测试结果失败，意味着被测试函数并没有产生 `panic`

`should_panic` 测试结果的含义可能很模糊，它只是表明代码没有产生 `panic`，甚至在由一些非期望的原因导致 `panic` 时也会通过，为了使 `should_panic` 测试结果更精确，可以给 `should_panic` 属性增加一个可选的 `expected` 参数，测试工具会确保错误信息中包含其提供的信息。

```rust
pub struct Guess {
    value: i32,
}

impl Guess {
    pub fn new(value: i32) -> Guess {
        if value < 1 {
            panic!("Value must be greater than or equal to 1, got {}.",
                   value);
        } else if value > 100 {
            panic!("Value must be less than or equal to 100, got {}.",
                   value);
        }

        Guess {
            value
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    // 测试会通过，因为 expected 参数提供的值是 Guess::new 函数 panic 信息的子串
    #[should_panic(expected = "Value must be less than or equal to 100")]
    fn greater_than_100() {
        Guess::new(200);
    }
}
```

修改代码：

```rust
if value < 1 {
    panic!("Guess value must be less than or equal to 100, got {}.", value);
} else if value > 100 {
    panic!("Guess value must be greater than or equal to 1, got {}.", value);
}
```

测试结果：

```shell
running 1 test
test tests::greater_than_100 ... FAILED

failures:

---- tests::greater_than_100 stdout ----
        thread 'tests::greater_than_100' panicked at 'Guess value must be
greater than or equal to 1, got 200.', src/lib.rs:11:12
note: Run with `RUST_BACKTRACE=1` for a backtrace.
note: Panic did not include expected string 'Guess value must be less than or
equal to 100'

failures:
    tests::greater_than_100

test result: FAILED. 0 passed; 1 failed; 0 ignored; 0 measured; 0 filtered out
```

测试失败，输出结果表明代码确实发生了 `panic`，但是 `panic` 信息中并没有包含 `expected` 提供的信息，有了这些信息，我们就可以检查测试失败的原因出在哪里了。

## 将 `Result<T, E>` 用于测试

测试函数可以采用返回 `Result` 的形式来编写。

在函数体中，测试成功返回 Ok(()) 而不是 `assert_eq!`，测试失败时返回 `Err` 而不是调用 `panic!`

使用 `Result<T, E>` 编写测试时不再需要为测试函数增加 `#[should_panic]` 属性

```rust
#[cfg(test)]
mod tests {
    #[test]
    fn it_works() -> Result<(), String> {
        if 2 + 2 == 4 {
            Ok(())
        } else {
            Err(String::from("two plus two does not equal four"))
        }
    }
}
```
