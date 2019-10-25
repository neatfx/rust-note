# 单元测试 & 集成测试

## 单元测试

单元测试在隔离的环境中测试每个单元的代码，以便快速准确地判断某个单元的功能是否符合预期。

单元测试与被测试的代码共同存放于 `src` 目录下相同的文件中。规范是在每个文件中创建包含测试函数的 `tests` 模块，并使用 `cfg(test)` 标注模块。

### 测试模块注解 `cfg(test)`

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

### 测试私有函数

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

## 集成测试

在 Rust 中，集成测试对于需要测试的库来说完全是外部的，集成测试以其他外部代码相同的方式使用库文件，对库的公有接口进行测试，每个测试都有可能测试多个模块。

集成测试的目的是测试库的多个部分能否一起正常工作。单独运行时没有问题的代码单元集成在一起也可能会出现问题，所以集成测试的覆盖率也很重要。

### `tests`目录

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

### 集成测试中的子模块

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

### 二进制 Crate 的集成测试

只有库 Crate 才会向其他 Crate 暴露了可供调用和使用的函数，二进制 Crate 只关心单独运行。

如果项目是二进制 Crate 并且只包含 `src/main.rs` 而没有 `src/lib.rs`，就无法创建集成测试并使用 `extern crate` 导入 `src/main.rs` 中定义的函数进行测试。

Rust 二进制项目的结构之所以明确采用 `src/main.rs` 调用 `src/lib.rs` 中的逻辑的方式，就是因为集成测试可以通过 `extern crate` 测试库 Crate 中的主要功能，如果这些重要功能没有问题的话，`src/main.rs` 中的少量代码就会正常工作而无需测试。
