# 错误处理

Rust 的可靠性保证一直延续到错误处理领域。软件中的错误是不可避免的，因此 Rust 具备许多特性用于处理发生错误的情况。很多情况下，Rust 要求在代码编译前告知可能产生的错误并且进行处理。如此规定确保代码在被部署到生产环境之前就能够发现并处理错误，从而使程序更加健壮。

Rust 将错误分为两大类：可恢复错误、不可恢复错误。

对于可恢复错误，如“文件未找到”这种错误，将问题报告给用户并重试是合理的。而不可恢复错误从来都是故障表现，像超限访问数组。

大多数语言对这两类错误不加区分，并使用异常之类的机制统一处理。Rust 没有异常的概念。

对于可恢复错误，返回 `Result<T, E>` 枚举类型供后续从错误中恢复的操作使用。
当程序遭遇不可恢复错误，Rust 提供了 `panic!` 宏，用来停止程序执行。

## 使用 `panic!` 宏处理不可恢复错误

执行 `panic!` 宏时，程序会打印一个故障消息，展开并清理栈内存，然后退出。这通常发生在遭遇某些故障被且不清楚该如何处理的时候。

### 栈展开、终止

默认情况下，当程序发生 `panic` 时，开始展开操作，有两种处理模式：

- 展开（ unwinding，默认行为 ），Rust 将回溯执行栈并清理所有函数调用的数据，这个过程包含了很多工作。
- 终止（ abort ），即不清理数据直接退出程序，程序所使用的内存由操作系统清理。

如果希望优化编译后的二进制程序体积，可通过修改 Cargo.toml 配置文件将程序发生 Panic 时的行为模式由展开切换为终止：

```shell
[profile.release]
panic = 'abort'
```

### `panic!` 宏

```rust
fn main() {
    panic!("crash and burn");
}
```

代码运行结果：

```shell
$ cargo run
   Compiling panic v0.1.0 (file:///projects/panic)
    Finished dev [unoptimized + debuginfo] target(s) in 0.25s
     Running `target/debug/panic`
thread 'main' panicked at 'crash and burn', src/main.rs:2:5
note: Run with `RUST_BACKTRACE=1` for a backtrace.
```

错误信息包含了 `Panic` 信息及其在代码中的位置。

有些情况下，`panic!` 的调用位于被调用的代码中，错误信息中的文件名和行号对应的是 `panic!` 调用语句所在的代码，并非最终指向 `panic!` 调用的代码。这时可利用 `panic!` 调用所在函数的调用栈来查明到底是哪部分代码引发了问题。

#### 使用 `backtrace` 输出详细的调用栈

```rust
fn main() {
    let v = vec![1, 2, 3];

    v[99];
}
```

对于以上代码，其他语言，比如 C 语言，会尝试如实返回请求内容，不论其是否是我们想要的：你将得到与 vector 中元素对应的内存地址中的内容，即使内存实际不属于此 vector。如果攻击者能够用这样的方式操纵索引来读取原本不被允许访问的数据，会导致安全风险，这便是所谓的“缓冲区溢出”。

为保护程序远离此类攻击，当尝试读取一个索引无效的元素时，Rust 会停止执行并拒绝继续。

```shell
   Compiling playground v0.0.1 (/playground)
    Finished dev [unoptimized + debuginfo] target(s) in 0.41s
     Running `target/debug/playground`
thread 'main' panicked at 'index out of bounds: the len is 3 but the index is 99', /rustc/f3e1a954d2ead4e2fc197c7da7d71e6c61bad196/src/libcore/slice/mod.rs:2806:10
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace..
```

错误信息指向非用户编写的 `libcore/slice/mod.rs.` 文件，即 `panic!` 真正发生的地方。同时，最后一行提示了可以通过设置 `RUST_BACKTRACE` 环境变量来获取引发错误的详情调用栈。

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

与其他语言一样，使用 Rust 调用栈的要点是从顶部开始阅读直到看到你自己编写的代码文件。在该行之前的行是你调用的代码，该行之后的行是对你编写的代码进行调用的代码。

须启用 `debug` 标识才能获取带有详细调用栈信息的 backtrace。当运行 `cargo build` 或者不带 `--release` 参数的 `cargo run` 命令时会默认启用 `debug` 标识。

## 使用 `Result` 处理可恢复错误

大多数错误没有严重到需要程序完全停止运行的程度。例如：当你尝试打开一个文件但是由于文件不存在而导致操作失败，你可能想创建这个文件而不是结束进程。

验证 `File::open` 的返回类型是 `Result`：

```rust
use std::fs::File;

fn main() {
    let f: u32 = File::open("hello.txt");
}
```

编译错误：

```shell
error[E0308]: mismatched types
 --> src/main.rs:4:18
  |
4 |     let f: u32 = File::open("hello.txt");
  |                  ^^^^^^^^^^^^^^^^^^^^^^^ expected u32, found enum
`std::result::Result`
  |
  = note: expected type `u32`
             found type `std::result::Result<std::fs::File, std::io::Error>`
```

使用 `File::open` 举例说明 `Result` 的使用：

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

运行：

```shell
   Compiling playground v0.0.1 (/playground)
warning: unused variable: `f`
 --> src/main.rs:6:9
  |
6 |     let f = match f {
  |         ^ help: consider prefixing with an underscore: `_f`
  |
  = note: `#[warn(unused_variables)]` on by default

    Finished dev [unoptimized + debuginfo] target(s) in 0.64s
     Running `target/debug/playground`
thread 'main' panicked at 'Problem opening the file: Os { code: 2, kind: NotFound, message: "No such file or directory" }', src/main.rs:9:13
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace.
```

### 错误分类处理

改进之前的示例（从始终 Panic 改进为文件不存在时尝试创建，创建失败以及其它错误时 Panic）

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

使用闭包写法改进 `match` 嵌套写法：

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

## 出错时调用 `panic!` 的快捷方式

`Result<T, E>` 类型定义了很多辅助方法来处理多样化任务。

### `unwrap` 方法

使用 `match` 比较麻烦且不直观，作为替代，可以使用 `unwrap` 方法，如果 `Result` 值是成员 `Ok`，`unwrap` 返回 `Ok` 中的值，反之 `unwrap` 会调用 `panic!` 宏。

```rust
use std::fs::File;

fn main() {
    let f = File::open("hello.txt").unwrap();
}
```

运行代码：

```shell
   Compiling playground v0.0.1 (/playground)
warning: unused variable: `f`
 --> src/main.rs:4:9
  |
4 |     let f = File::open("hello.txt").unwrap();
  |         ^ help: consider prefixing with an underscore: `_f`
  |
  = note: `#[warn(unused_variables)]` on by default

    Finished dev [unoptimized + debuginfo] target(s) in 0.40s
     Running `target/debug/playground`
thread 'main' panicked at 'called `Result::unwrap()` on an `Err` value: Os { code: 2, kind: NotFound, message: "No such file or directory" }', src/libcore/result.rs:1188:5
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace.
```

### `expect` 方法

`expect` 方法允许自定义 `panic!` 的错误信息，而不像 `unwrap` 那样使用默认的 `panic!` 信息，使用 `expect` 而不是 `unwrap` 可以提供更加直观友好的错误信息，便于在代码中对多处不同的 `panic` 进行定位。

```rust
use std::fs::File;

fn main() {
    let f = File::open("hello.txt").expect("Failed to open hello.txt");
}
```

运行代码：

```shell
   Compiling playground v0.0.1 (/playground)
warning: unused variable: `f`
 --> src/main.rs:4:9
  |
4 |     let f = File::open("hello.txt").expect("Failed to open hello.txt");
  |         ^ help: consider prefixing with an underscore: `_f`
  |
  = note: `#[warn(unused_variables)]` on by default

    Finished dev [unoptimized + debuginfo] target(s) in 0.40s
     Running `target/debug/playground`
thread 'main' panicked at 'Failed to open hello.txt: Os { code: 2, kind: NotFound, message: "No such file or directory" }', src/libcore/result.rs:1188:5
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace.
```

## 错误传递

除了在错误发生位置进行处理之外，还可以选择将错误传递给上级调用者让其决定如何处理，给予其更多控制权。相比错误所在上下文，上级调用者可能拥有更多的信息或逻辑用于指引如何处理错误。

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

`?` 运算符用于 `Result` 值之后，与 `match` 的作用类似，如果 `Result` 的值为 `OK`，那么 `OK` 中的值会被表达式返回，程序继续往下执行。如果 `Result` 的值是一个 `Err`，那么 `Err` 将从整个函数中被返回，与之前使用 `return` 关键字一样。

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

`?` 所使用的错误值被传递给了 `from` 函数（ 定义于标准库的 `From` 特质，用于将错误从一种类型转换为另一种类型 ）。当 `?` 调用 `from` 函数时，接收到的错误类型被转换为当前函数返回类型所定义的错误类型。这在当一个函数将所有的失败情况用一种错误类型来表示的时候非常有用。即使失败有多种原因。只要每个错误类型都实现了 `from` 函数来定义如何将其自身转换为函数返回类型所定义的错误类型，`?` 操作符会自动处理这些转换。

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

将文件读取到字符串是极为常见的操作，Rust 为此提供了更便捷的 `fs::read_to_string` 函数，它会打开文件、新建一个 `String`、读取文件的内容，将内容放入 `String` 并返回。

```rust
use std::io;
use std::fs;

fn read_username_from_file() -> Result<String, io::Error> {
    fs::read_to_string("hello.txt")
}
```

之所以没有早些使用这个函数，只是因为这种写法无法演示错误处理而已。

#### `?` 运算符的适用条件

只能在返回 `Result`、`Option` 或者其他实现了 `std::ops::Try` 特质的类型的函数中使用 `?` 运算符。

当编写的函数代码不能返回以上类型，但希望在调用其它能够返回 `Result` 的函数时使用 `?` 操作符时，有两个选择：

- 将函数的返回类型改为 `Result<T, E>`
- 改用 `match` 表达式或者 `Result` 自身提供的方法来处理当前函数中由于调用其它函数所返回的 `Result<T, E>`，而不是使用 `?` 操作符传递潜在错误。

```rust
use std::fs::File;

fn main() {
    let f = File::open("hello.txt")?;
}
```

运行代码：

```shell
error[E0277]: the `?` operator can only be used in a function that returns
`Result` or `Option` (or another type that implements `std::ops::Try`)
 --> src/main.rs:4:13
  |
4 |     let f = File::open("hello.txt")?;
  |             ^^^^^^^^^^^^^^^^^^^^^^^^ cannot use the `?` operator in a
  function that returns `()`
  |
  = help: the trait `std::ops::Try` is not implemented for `()`
  = note: required by `std::ops::Try::from_error`
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

## `Panic` 的适用情况及错误处理取舍

当代码 panic 的时候是没有办法恢复的。不论是否有办法恢复，任何出现错误的情况下都可以调用 panic，但这种做法是在替调用你的代码的代码作出状况不可恢复的决定。

当选择返回一个 `Result` 值，则是将选择权交给了调用者，而不是代替他们做决定。调用者能够选择以适合自身状况的方式尝试从错误中恢复，或者决定此情况下的这个 `Err` 值是不可恢复的，从而可以调用 `panic!` 将你代码中传递的可恢复错误转换为成不可恢复错误。

因此，在定义一个可能失败的函数时，返回 `Result` 是一个默认的好选择。

### 适用 `Panic` 的情况

特定情况下，适用 `Panic` 比返回 `Result` 更合适。

#### 1、示例代码、原型代码、测试

当编写用于描述概念的示例代码时，加入可靠的错误处理代码会降低代码简洁性，当希望应用程序处理错误，又能与代码其它部分的行为区分开来，调用 unwrap 这种能够 Panic 的方法作为一种临时折中方案是可以理解的。

类似的，`unwrap` 以及 `expect` 方法在还没有决定如何处理错误的原型阶段很好用。这些方法为日后增强程序健壮性标明了位置。

如果在一个测试中方法调用失败，我们希望整个测试失败，即使该方法不属于被测试功能。因为 `panic!` 用于判断测试失败，所以调用 `unwrap` 或 `expect` 是符合预期的。

#### 2、程序员比编译器更了解代码的情况

当有其它一些编译器无法理解的逻辑能够确保 `Result` 会返回 `Ok` 值时，调用 `unwrap` 也适用。需要处理的 `Result` 值仍然存在：通常，不论调用何种操作都有可能失败，即便在特定条件下它是不符合逻辑的。如果通过人工审核代码能够确保绝对不会出现 `Err`，则调用 `unwrap` 完全没有问题。

示例：

```rust
use std::net::IpAddr;

let home: IpAddr = "127.0.0.1".parse().unwrap();
```

示例通过解析硬编码字符串创建了一个 `IpAddr` 实例，`127.0.0.1` 是一个有效的 `IP` 地址，因此这里允许使用 `unwrap`。但是硬编码以及有效的字符串并没有改变 `parse` 方法的返回类型：还是会得到一个 `Result` 值，编译器还是会要求我们处理 Result（就像会出现 `Err` 变体那样），因为编译器还没有聪明到能够判断这里的字符串是一个始终有效的 `IP` 地址。如果 `IP` 地址来自于用户输入而不是硬编码在程序中（因而确实存在解析操作失败的可能），我们当然希望用更加可靠的方式来处理 `Result`。

## 错误处理指引

代码处于错误状态可能终止的时候使代码 `panic` 是明智的。在这里，错误状态（`bad state`）指的是某些假设、保证、协议或者不可变性被打破，比如当无效的值、自相矛盾的值、不存在的值被传递给了你的代码 - 外加下列一种或多种：

- 有害状态并非预期偶尔发生
- 有害状态之后的代码运行需要依赖于脱离有害状态
- 缺少将有害状态信息编码到现有类型的方法

如果你的代码在被他人调用时传入了无意义值，调用 panic! 可能是最好的选择，提醒那些使用的人注意并在开发过程中修复他们代码中的问题。

类似的，在调用不受控的外部代码时，返回了无效状态且无法修复时，调用 `panic!` 常是合适的。

然而，当错误是可预期的，返回 `Result` 要比调用 `panic!` 更合适。包括解析器被传入不合规数据或者 HTTP 请求返回状态表明触及服务器限速这类例子，返回 `Result` 以表明失败是一个预期的可能性，调用者必须决定如何处理。

当代码对值进施加操作时，首先应该验证值是有效的，并在其无效时 `panic`。这主要出于安全考量：尝试在无效数据上进行操作会使代码容易遭受攻击。这也是试图越界访问内存时标准库会调用 `panic!` 的主要原因：尝试访问非当前数据结构拥有的内存是一个常见的安全问题。函数通常约定：其行为仅在输入符合特定要求的情况下予以保证。违反约定情况下的 `panic` 是有意义的，因为这通常表明函数调用端存在问题，并且不是一类希望调用代码必须显式处理的错误。实际上，没有理由让调用代码执行错误恢复；需要修复代码的是发起调用的程序员。函数约定，尤其是当违规造成的 `panic`，应当在函数的 API 文档中进行说明。

然而，在所有函数中引入大量错误检测代码是很繁琐的。幸运的是，可以利用 Rust 的类型系统完成许多此类检测。如果函数有一个特定类型的参数，编译器会确保它是一个有效的值，你只需要专心处理代码逻辑即可。例如：函数有一个非 Option 类型参数，程序预期获得 `something` 而不是 `nothing`。代码无需处理 `Some` 和 `None` 两种情况：在确定有值的情况下它将只有一种情况。试图传空给函数的代码不会通过编译，因此你的函数没有必要在运行时检查参数为空的情况。另一个例子是使用一个 u32 类型作为函数参数，这保证了该参数永远不可能为负值。

## 创建自定义类型用于验证

```rust
loop {
    // --snip--

    let guess: i32 = match guess.trim().parse() {
        Ok(num) => num,
        Err(_) => continue,
    };

    if guess < 1 || guess > 100 {
        println!("The secret number will be between 1 and 100.");
        continue;
    }

    match guess.cmp(&secret_number) {
    // --snip--
}
```

上述遍历输入进行验证的代码并非理想实现，我们可以创建一个新类型并将验证逻辑放入该类型的实例方法，在函数签名中使用这个新类型是安全的，可以放心使用其提供的值。改进如下：

```rust
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

    // 此处 value 方法通常被称为 getter
    // value 是私有字段，使用 Guess 结构体的代码不能直接设置其值
    // 模块外的代码必须使用 Guess::new 关联函数创建一个 Guess 实例，从而确保所有的 value 字段值都会经过 Guess::new 函数中的有效性检查。
    pub fn value(&self) -> i32 {
        self.value
    }
}
```
