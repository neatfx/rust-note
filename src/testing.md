# 编写自动化测试

Rust 设计时即高度重视程序正确性。但是正确性非常复杂，证明起来并不容易。Rust 的类型系统肩负了与正确性相关的大部分重担。但是类型系统不可能捕捉到所有非正确状况。因而，Rust 语言中内置了对编写自动化软件测试的支持。

例如，编写一个名为 `add_two` 的函数（用于将接收到的数字加 2 后返回），该函数接受一个整数作为参数并返回一个整数作为结果。当实现并编译这个函数时，Rust 会进行类型检查以及借用检查来确保这一点（ 例如我们没有传递 `String` 值或者一个无效的引用给此函数 ）。但是，Rust 无法检查函数会像我们预期的那样工作 - 返回参数与 2 的相加的结果而不是参数与 10 相加或者参数减去 50 后的结果！这正是测试起作用的地方。

我们可以编写用于断言的测试。当传递 3 给函数时，返回值是 5 。任何时候对代码作出修改后都可以通过运行这些测试以确保所有已知的正确行为没有发生变化。

测试是一项综合技能：单个章节无法涵盖编写良好测试的所有技术细节，此处着重介绍 Rust 提供的基础测试工具链。包括编写测试时可用的注解以及宏、运行测试时的默认行为以及选项，以及如何将测试组织划分为单元测试和集成测试。

## 如何编写测试

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

### 测试结果

包含代码测试结果、 文档测试（ `Doc-tests` ）结果两部分

#### 代码测试结果

- `passed` 通过
- `failed` 失败
- `ignored` 忽略
- `measured` 针对性能测试的，目前仍只能用于 Nightly Rust
- `filtered` 过滤

#### 文档测试结果

Rust 会编译任何在 API 文档中的代码示例，使文档和代码保持同步

### 使用 assert! 宏检查结果

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

### 测试相等

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

### 自定义失败信息

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

### 使用 `should_panic` 检查 panic

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

### 将 `Result<T, E>` 用于测试

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

## 运行测试

`cargo test` 在测试模式下编译代码并运行生成的测试二进制文件。

`cargo test` 生成的二进制文件的默认行为：

- 并行运行所有测试
- 截获并隐藏测试运行过程中的输出，使测试结果更易阅读

通过指定命令行参数可以改变 `cargo test` 的默认行为，可以将一部分参数传递给 `cargo test`，另外一部分参数传递给生成的测试二进制文件。

```shell
# 提示 `cargo test` 的有关参数
cargo test --help
# 提示在分隔符 `--` 之后使用的有关参数 ( 传递给生成的测试二进制文件 )
cargo test -- --help
```

### 运行多个测试

Rust 默认使用线程来并行运行多个测试，这意味着测试会更快地运行完毕，更快得到结果反馈。

测试是同时运行的，应该确保测试不能相互依赖，或依赖任何共享状态、环境（ 目录或环境变量 ）

如果不希望并行运行测试，或者想要精确的设置线程数量，可以传递参数给测试二进制文件，例如：

```bash
cargo test -- --test-threads=1
```

设置测试线程数为 1，即不使用并行。这将花费更多时间，不过在有共享状态时，测试也不会互扰。

### 显示函数输出

```rust
fn prints_and_returns_10(a: i32) -> i32 {
    println!("I got the value {}", a);
    10
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn this_test_will_pass() {
        let value = prints_and_returns_10(4);
        assert_eq!(10, value);
    }

    #[test]
    fn this_test_will_fail() {
        let value = prints_and_returns_10(8);
        assert_eq!(5, value);
    }
}
```

运行测试：

```shell
running 2 tests
test tests::this_test_will_pass ... ok
test tests::this_test_will_fail ... FAILED

failures:

---- tests::this_test_will_fail stdout ----
        I got the value 8
thread 'tests::this_test_will_fail' panicked
at 'assertion failed: `(left == right)`
  left: `5`,
 right: `10`', src/lib.rs:19:8
note: Run with `RUST_BACKTRACE=1` for a backtrace.

failures:
    tests::this_test_will_fail

test result: FAILED. 1 passed; 1 failed; 0 ignored; 0 measured; 0 filtered out
```

测试运行过程中的输出会被截获，只有当测试失败，输出内容才会出现在测试结果摘要部分，同时显示测试失败的原因。

如果希望看到测试运行过程中的输出，可以通过参数来禁用截获输出的默认行为：

```rust
cargo test -- --nocapture
```

### 运行部分测试

```rust
pub fn add_two(a: i32) -> i32 {
    a + 2
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn add_two_and_two() {
        assert_eq!(4, add_two(2));
    }

    #[test]
    fn add_three_and_two() {
        assert_eq!(5, add_two(3));
    }

    #[test]
    fn one_hundred() {
        assert_eq!(102, add_two(100));
    }
}
```

#### 运行单个测试

```shell
cargo test one_hundred
```

#### 过滤运行多个测试

测试所在的模块也是测试名称的一部分，所以可以通过模块名来运行一个模块中的所有测试

```shell
cargo test add
```

### 忽略某些测试

有些特定的测试非常耗时，很多时候希望能在测试中排除。通过列举所有期望运行的测试的方式往往比较麻烦，更简单的方式是使用 `ignore` 属性来标记这些测试进行排除

```rust
#[test]
fn it_works() {
    assert_eq!(2 + 2, 4);
}

#[test]
#[ignore]
fn expensive_test() {
    // code that takes an hour to run
}
```

如果只希望运行被忽略的测试：

```shell
cargo test -- --ignored
```

## 单元测试 & 集成测试

### 单元测试

单元测试在隔离的环境中测试每个单元的代码，以便快速准确地判断某个单元的功能是否符合预期。

单元测试与被测试的代码共同存放于 `src` 目录下相同的文件中。规范是在每个文件中创建包含测试函数的 `tests` 模块，并使用 `cfg(test)` 标注模块。

#### 测试模块注解 `cfg(test)`

`#[cfg(test)]` 注解告诉 Rust 只在执行 `cargo test` 时编译和运行测试代码，而不是运行 `cargo build` 时。由于不包含测试，在构建库的时候，可以节省编译时间，并减少编译产生的文件大小。

集成测试单独存放于其他文件夹，所以不需要 `#[cfg(test)]` 注解，而单元测试位于与源码相同的文件中，所以需要使用 `#[cfg(test)]` 注解来指明它们不应该被包含进编译结果。

```rust
#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }
}
```

上述代码就是自动生成的测试模块。cfg 属性代表 configuration ，它告诉 Rust 其之后的项只应该被包含进特定配置选项中。在这个例子中，配置选项是 test，即 Rust 所提供的用于编译和运行测试的配置选项。通过使用 cfg 属性，Cargo 只会在我们主动使用 cargo test 运行测试时才编译测试代码。需要编译的除了被标注为 #[test] 的函数之外，还包括测试模块中可能存在的帮助函数。

#### 测试私有函数

先不讨论是否应该对私有函数进行测试，总之，测试私有函数在其他语言中很困难，甚至是不可能的，而 Rust 的私有性规则确实允许测试私有函数。

```rust
pub fn add_two(a: i32) -> i32 {
    internal_adder(a, 2)
}

fn internal_adder(a: i32, b: i32) -> i32 {
    a + b
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn internal() {
        assert_eq!(4, internal_adder(2, 2));
    }
}
```

### 集成测试

在 Rust 中，集成测试对于需要测试的库来说完全是外部的，集成测试以其他外部代码相同的方式使用库文件，对库的公有接口进行测试，每个测试都有可能测试多个模块。

集成测试的目的是测试库的多个部分能否一起正常工作。单独运行时没有问题的代码单元集成在一起也可能会出现问题，所以集成测试的覆盖率也很重要。

#### `tests`目录

编写集成测试，需要在项目根目录创建 `tests` 目录，与 `src` 同级，Cargo 知道如何查找 `tests` 目录中的集成测试文件。在 `tests` 目录中可以创建任意数量的测试文件，Cargo 会将每个文件当作单独的 Crate 编译。

```rust
// tests/integration_test.rs
use adder;

#[test]
fn it_adds_two() {
    assert_eq!(4, adder::add_two(2));
}
```

集成测试文件需要在文件顶部添加 `use adder`，这与单元测试文件不同，因为每个集成测试文件都是独立的 Crate，所以需要在每一个文件中导入库。

集成测试文件中也不需要标注 `#[cfg(test)]`, `tests` 文件夹在 Cargo 中比较特殊特殊， Cargo 只会在运行 `cargo test` 时编译此目录中的文件。

运行结果包含单元测试、集成测试、文档测试三部分输出：

```shell
$ cargo test
   Compiling adder v0.1.0 (file:///projects/adder)
    Finished dev [unoptimized + debuginfo] target(s) in 0.31 secs
     Running target/debug/deps/adder-abcabcabc

running 1 test
test tests::internal ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out

     Running target/debug/deps/integration_test-ce99bcc2479f4607

running 1 test
test it_adds_two ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out

   Doc-tests adder

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

通过指定测试函数名来运行特定集成测试：

```shell
cargo test internal
```

运行特定集成测试文件中的所有测试：

```shell
# 只运行 integration_test.rs 中的测试
$ cargo test --test integration_test
    Finished dev [unoptimized + debuginfo] target(s) in 0.0 secs
     Running target/debug/integration_test-952a27e0126bb565

running 1 test
test it_adds_two ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

#### 集成测试中的子模块

作为一种命名规范，Rust 项目 `tests` 目录的子目录中的文件不会被作为单独的 Crate 编译或作为一个测试结果部分出现在测试输出中。因此，如果需要创建一些在多个集成测试文件都会用到的帮助函数，并希望将它们提取为通用模块，正确的做法应当是将代码创建到 `tests/common/` 目录。

```rust
// tests/common/mod.rs
pub fn setup() {
    // 编写特定库测试所需的代码
}
```

```rust
// tests/integration_test.rs
use adder;

mod common;

#[test]
fn it_adds_two() {
    // 在集成测试中调用 common 模块中的 setup 函数
    common::setup();
    assert_eq!(4, adder::add_two(2));
}
```

#### 二进制 Crate 的集成测试

只有库 Crate 才会向其他 Crate 暴露了可供调用和使用的函数，二进制 Crate 只关心单独运行。

如果项目是二进制 Crate 并且只包含 `src/main.rs` 而没有 `src/lib.rs`，就无法创建集成测试并使用 `extern crate` 导入 `src/main.rs` 中定义的函数进行测试。

Rust 二进制项目的结构之所以明确采用 `src/main.rs` 调用 `src/lib.rs` 中的逻辑的方式，就是因为集成测试可以通过 `extern crate` 测试库 Crate 中的主要功能，如果这些重要功能没有问题的话，`src/main.rs` 中的少量代码就会正常工作而无需测试。
