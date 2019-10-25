# 错误处理

Rust 没有异常的概念，对于可恢复错误，有 `Result<T, E>` 枚举值以及 `panic!`，遇到不可恢复错误时则停止程序执行。

Rust 包含两种错误分类：

- 可恢复错误
- 不可恢复错误

## 处理不可恢复错误

### 栈展开 vs 终止

当程序出现 `panic` 时有两种处理模式：

- 展开（ unwinding ），Rust 将回溯栈并清理所有函数的数据，过程比较繁杂。
- 终止（ abort ），即不清理数据直接退出程序，程序所使用的内存由操作系统清理。

如果希望优化编译后的程序大小，可通过修改 Cargo.toml 使 panic 时的行为由展开切换为终止：

```shell
[profile.release]
panic = 'abort'
```

### `panic!` 宏

执行 `panic!` 宏时，程序会打印出一个错误信息，展开并清理栈数据，然后接着退出。

```rust
fn main() {
    panic!("crash and burn");
}
```

运行代码得到错误：

```shell
thread 'main' panicked at 'crash and burn', src/main.rs:2:4
note: Run with `RUST_BACKTRACE=1` for a backtrace.
```

### 显示 `panic!` 调用栈

#### 无 `backtrace`

```rust
fn main() {
    let v = vec![1, 2, 3];

    v[99];
}
```

运行代码得到错误：

```shell
thread 'main' panicked at 'index out of bounds: the len is 3 but the index is
99', /checkout/src/liballoc/vec.rs:1555:10
note: Run with `RUST_BACKTRACE=1` for a backtrace.
```

错误信息指向标准库 `vec.rs` 文件中的代码，即真正出现 `panic!` 的位置。

#### 使用 `backtrace` 输出详细的调用栈

需要设置 `RUST_BACKTRACE` 环境变量

```shell
$ RUST_BACKTRACE=1 cargo run
    Finished dev [unoptimized + debuginfo] target(s) in 0.0 secs
     Running `target/debug/panic`
thread 'main' panicked at 'index out of bounds: the len is 3 but the index
is 99', /checkout/src/liballoc/vec.rs:1555:10
stack backtrace:
   0: std::sys::imp::backtrace::tracing::imp::unwind_backtrace
             at /checkout/src/libstd/sys/unix/backtrace/tracing/gcc_s.rs:49
   1: std::sys_common::backtrace::_print
             at /checkout/src/libstd/sys_common/backtrace.rs:71
   2: std::panicking::default_hook::{{closure}}
             at /checkout/src/libstd/sys_common/backtrace.rs:60
             at /checkout/src/libstd/panicking.rs:381
   3: std::panicking::default_hook
             at /checkout/src/libstd/panicking.rs:397
   4: std::panicking::rust_panic_with_hook
             at /checkout/src/libstd/panicking.rs:611
   5: std::panicking::begin_panic
             at /checkout/src/libstd/panicking.rs:572
   6: std::panicking::begin_panic_fmt
             at /checkout/src/libstd/panicking.rs:522
   7: rust_begin_unwind
             at /checkout/src/libstd/panicking.rs:498
   8: core::panicking::panic_fmt
             at /checkout/src/libcore/panicking.rs:71
   9: core::panicking::panic_bounds_check
             at /checkout/src/libcore/panicking.rs:58
  10: <alloc::vec::Vec<T> as core::ops::index::Index<usize>>::index
             at /checkout/src/liballoc/vec.rs:1555
  11: panic::main
             at src/main.rs:4
  12: __rust_maybe_catch_panic
             at /checkout/src/libpanic_unwind/lib.rs:99
  13: std::rt::lang_start
             at /checkout/src/libstd/panicking.rs:459
             at /checkout/src/libstd/panic.rs:361
             at /checkout/src/libstd/rt.rs:61
  14: main
  15: __libc_start_main
  16: <unknown>
```

必须启用 `debug` 标识才能获取带有详细调用栈信息的 backtrace，当不使用 `--release` 参数运行 `cargo build` 或 `cargo run` 时会默认启用 `debug` 标识。

## 使用 `Result` 处理可恢复错误

```rust
enum Result<T, E> {
    Ok(T),
    Err(E),
}

use std::fs::File;

fn main() {
    let f = File::open("hello.txt");

    let f = match f {
        Ok(file) => file,
        Err(error) => {
            panic!("There was a problem opening the file: {:?}", error)
        },
    };
}
```

### 错误分类处理

```rust
use std::fs::File;
use std::io::ErrorKind;

fn main() {
    let f = File::open("hello.txt");

    let f = match f {
        Ok(file) => file,
        Err(error) => match error.kind() {
            ErrorKind::NotFound => match File::create("hello.txt") {
                Ok(fc) => fc,
                Err(e) => panic!("创建文件失败: {:?}", e),
            },
            other_error => panic!("打开文件失败: {:?}", other_error),
        },
    };
}
```

使用闭包的进阶写法：

```rust
use std::fs::File;
use std::io::ErrorKind;

fn main() {
    let f = File::open("hello.txt").map_err(|error| {
        if error.kind() == ErrorKind::NotFound {
            File::create("hello.txt").unwrap_or_else(|error| {
                panic!("创建文件失败: {:?}", error);
            })
        } else {
            panic!("打开文件失败: {:?}", error);
        }
    });
}
```

## 简化调用 `panic!`

`Result<T, E>` 类型定义了很多辅助方法来处理各种情况

### `unwrap` 方法

使用 `match` 比较麻烦且不直观，作为替代，可以使用 `unwrap` 方法，如果 `Result` 值是成员 `Ok`，`unwrap` 返回 `Ok` 中的值，反之 `unwrap` 会调用 `panic!` 宏。

```rust
use std::fs::File;

fn main() {
    let f = File::open("hello.txt").unwrap();
}
```

### `expect` 方法

`expect` 方法允许自定义 `panic!` 的错误信息，而不像 `unwrap` 那样使用默认的 `panic!` 信息，使用 `expect` 而不是 `unwrap` 可以提供直观友好的错误信息，更易于追踪 `panic` 的源头。

```rust
use std::fs::File;

fn main() {
    let f = File::open("hello.txt").expect("Failed to open hello.txt");
}
```

## 错误传递

除了在当前位置处理错误外，还可以选择将错误传递给上级调用者让其决定该如何处理，这样能更好的控制代码调用，因为比起错误所在的上下文，调用者可能拥有更多信息或逻辑来决定如何处理错误。

```rust
use std::io;
use std::io::Read;
use std::fs::File;

fn read_username_from_file() -> Result<String, io::Error> {
    let f = File::open("hello.txt");

    let mut f = match f {
        Ok(file) => file,
        Err(e) => return Err(e),
    };

    let mut s = String::new();

    match f.read_to_string(&mut s) {
        Ok(_) => Ok(s),
        Err(e) => Err(e),
    }
}
```

### 使用 `?` 运算符代替 `match` 表达式简化代码

```rust
use std::io;
use std::io::Read;
use std::fs::File;

fn read_username_from_file() -> Result<String, io::Error> {
    let mut f = File::open("hello.txt")?;
    let mut s = String::new();
    f.read_to_string(&mut s)?;
    Ok(s)
}
```

#### `?` 运算符与`match` 表达式的不同

`?` 所使用的错误值被传递给了 `from` 函数（ 定义于标准库的 `From` 特质，用来将错误从一种类型转换为另一种类型 ）。当 `?` 调用 `from` 函数时，收到的错误类型被转换为定义为当前函数返回的错误类型。这在当一个函数返回一个错误类型来代表所有可能失败的方式时很有用，即使其可能会因很多种原因失败。只要每一个错误类型都实现了 `from` 函数来定义如何将其转换为返回的错误类型，`?` 会自动处理这些转换。

#### `?` 运算符的链式调用

```rust
use std::io;
use std::io::Read;
use std::fs::File;

fn read_username_from_file() -> Result<String, io::Error> {
    let mut s = String::new();

    File::open("hello.txt")?.read_to_string(&mut s)?;

    Ok(s)
}
```

#### 极简写法

将文件读取到一个字符串是很常见的操作，因此 Rust 提供了 `fs::read_to_string` 函数，它会打开文件、新建一个 `String`、读取文件的内容，将内容放入 `String` 并返回。

只是这种写法无法用于演示错误处理而已。

```rust
use std::io;
use std::fs;

fn read_username_from_file() -> Result<String, io::Error> {
    fs::read_to_string("hello.txt")
}
```

#### `?` 运算符的适用条件

只能在返回 `Result`、`Option` 或者其他实现了 `std::ops::Try` 特质的类型的函数中使用 `?` 运算符，在不返回 `Result` 的函数中调用返回 `Result` 的函数时，需要使用 `match` 或 `Result` 的方法之一来处理，而不能用 `?` 将潜在错误传递给调用方。

```rust
use std::fs::File;

fn main() {
    // 错误：cannot use the `?` operator in a function that returns `()`
    let f = File::open("hello.txt")?;
}
```

由于 `main` 函数的返回值类型是 `()`，会得到错误，不过 `main` 函数可以返回 `Result<T, E>`：

```rust
use std::error::Error;
use std::fs::File;

fn main() -> Result<(), Box<dyn Error>> {
    let f = File::open("hello.txt")?;

    Ok(())
}
```

## @ 返回 `Result` 还是 `panic`

### 适用返回 `Result` 的情况

#### 定义可能会失败的函数

对被调用者来说，选择对任何错误场景都调用 `panic!`，不管错误是否可恢复（ 如果 panic，就没有恢复的可能 ），是代替调用者做决定。选择返回 `Result` 值则是将选择权交给了调用者，而不是代替他们做决定。

对调用者来说，可能会选择以合适的方式尝试恢复 `Err`，也可能认为 `Err` 是不可恢复的，所以调用者也可能会调用 `panic!`，将可恢复的错误变成不可恢复的错误。

因此，在定义可能会失败的函数时，返回 `Result` 是一个比较好的默认选择。

### 适用 `panic` 的情况

#### 示例、原型代码、测试

#### 当确定比编译器知道更多的情况时

#### 有可能会导致有害状态的情况

有害状态：

- 当假设、保证、协议或不可变性被打破的状态（ 无效的值、自相矛盾的值、被传递了不存在的值 ）
- 有害状态并不包含预期会偶尔发生的错误
- 之后的代码的运行依赖于处于这种有害状态
- 当没有可行的手段来将有害状态信息编码进所使用的类型中的情况

具体情况：

- 如果代码被传递了一个没有意义的值，使用 panic 可以警告调用者注意其代码中的问题
- 在调用不能够控制的外部代码时，无法修复其返回的无效状态时
- 错误预期会出现时，返回 Result 要比 panic 更为合适，将有害状态向上传播，调用者可以决定该如何处理有害状态
- 当代码对值进行操作时，首先应该验证值是有效的，并在其无效时 panic
