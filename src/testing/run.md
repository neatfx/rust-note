# 运行测试

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

## 运行多个测试

Rust 默认使用线程来并行运行多个测试，这意味着测试会更快地运行完毕，更快得到结果反馈。

测试是同时运行的，应该确保测试不能相互依赖，或依赖任何共享状态、环境（ 目录或环境变量 ）

如果不希望并行运行测试，或者想要精确的设置线程数量，可以传递参数给测试二进制文件，例如：

```bash
cargo test -- --test-threads=1
```

设置测试线程数为 1，即不使用并行。这将花费更多时间，不过在有共享状态时，测试也不会互扰。

## 显示函数输出

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

## 运行部分测试

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

### 运行单个测试

```shell
cargo test one_hundred
```

### 过滤运行多个测试

测试所在的模块也是测试名称的一部分，所以可以通过模块名来运行一个模块中的所有测试

```shell
cargo test add
```

## 忽略某些测试

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
