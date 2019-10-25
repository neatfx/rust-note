# 创建线程

## 使用 `spawn` 创建新线程

```rust
use std::thread;
use std::time::Duration;

fn main() {
    // 传递闭包
    thread::spawn(|| {
        for i in 1..10 {
            println!("hi number {} from the spawned thread!", i);
            thread::sleep(Duration::from_millis(1));
        }
    });

    for i in 1..5 {
        println!("hi number {} from the main thread!", i);
        thread::sleep(Duration::from_millis(1));
    }
}
```

由于标准库使用 1:1 模型（ 依赖于操作系统如何调度线程 ），因此该示例：

- 不能保证新建线程会被执行（ 因为无法保证线程运行顺序 ）
- 主线程结束时，新建线程也会提前结束（ 部分执行 ）
- 无法保证新建线程先于主线程输出

### 使用 `join` 等待所有线程结束

修复新建线程部分执行或者完全不执行的问题：

```rust
use std::thread;
use std::time::Duration;

fn main() {
    // thread::spawn 的返回值类型是 JoinHandle（ 一个拥有所有权的值 ）
    let handle = thread::spawn(|| {
        for i in 1..10 {
            println!("hi number {} from the spawned thread!", i);
            thread::sleep(Duration::from_millis(1));
        }
    });

    for i in 1..5 {
        println!("hi number {} from the main thread!", i);
        thread::sleep(Duration::from_millis(1));
    }

    // 阻塞当前线程（ 主线程 ）直到 handle 代表的线程（ 新建线程 ）结束
    // 确保新建线程在 main 退出前全部执行
    handle.join().unwrap();
}
```

考虑移动 `handle.join()` 的位置：

```rust
use std::thread;
use std::time::Duration;

fn main() {
    let handle = thread::spawn(|| {
        for i in 1..10 {
            println!("hi number {} from the spawned thread!", i);
            thread::sleep(Duration::from_millis(1));
        }
    });

    handle.join().unwrap();

    for i in 1..5 {
        println!("hi number {} from the main thread!", i);
        thread::sleep(Duration::from_millis(1));
    }
}
```

主线程会等待直到新建线程执行完毕之后才开始执行 `for` 循环，所以输出不会交替出现：

```shell
hi number 1 from the spawned thread!
hi number 2 from the spawned thread!
hi number 3 from the spawned thread!
hi number 4 from the spawned thread!
hi number 5 from the spawned thread!
hi number 6 from the spawned thread!
hi number 7 from the spawned thread!
hi number 8 from the spawned thread!
hi number 9 from the spawned thread!
hi number 1 from the main thread!
hi number 2 from the main thread!
hi number 3 from the main thread!
hi number 4 from the main thread!
```

## 使用 `move` 闭包跨线程访问数据

尝试在新建线程中使用主线程中创建的数据：

```rust
use std::thread;

fn main() {
    let v = vec![1, 2, 3];

    let handle = thread::spawn(|| {
        println!("Here's a vector: {:?}", v);
    });

    handle.join().unwrap();
}
```

得到错误：

```shell
error[E0373]: closure may outlive the current function, but it borrows `v`,
which is owned by the current function
 --> src/main.rs:6:32
  |
6 |     let handle = thread::spawn(|| {
  |                                ^^ may outlive borrowed value `v`
7 |         println!("Here's a vector: {:?}", v);
  |                                           - `v` is borrowed here
  |
help: to force the closure to take ownership of `v` (and any other referenced
variables), use the `move` keyword
  |
6 |     let handle = thread::spawn(move || {
  |                                ^^^^^^^
```

Rust 会推断引用 `v` 的生命周期，因为 `println!` 需要 `v`，闭包会尝试借用 `v`。然而 Rust 不知道新建线程会执行多久，所以无法确认 `v` 的引用是否一直有效。

例如，下面代码中 `v` 的引用就不再有效：

```rust
use std::thread;

fn main() {
    let v = vec![1, 2, 3];

    let handle = thread::spawn(|| {
        // 使用闭包的线程，尝试使用一个在主线程中被回收的引用 v
        println!("Here's a vector: {:?}", v);
    });

    drop(v); // v 不再有效，此时还有线程在使用该引用的数据，产生了悬垂引用！

    handle.join().unwrap();
}
```

在闭包之前增加 `move` 关键字，强制闭包获取其使用的值的所有权，而不是由 Rust 推断使用借用值。

修正后的代码可以通过编译：

```rust
use std::thread;

fn main() {
    let v = vec![1, 2, 3];

    let handle = thread::spawn(move || {
        println!("Here's a vector: {:?}", v);
    });

    handle.join().unwrap();
}
```

使用 `move` 后，主线程中将不能对 `v` 调用 `drop` 方法：

```shell
error[E0382]: use of moved value: `v`
  --> src/main.rs:10:10
   |
6  |     let handle = thread::spawn(move || {
   |                                ------- value moved (into closure) here
...
10 |     drop(v); // oh no!
   |          ^ value used here after move
   |
   = note: move occurs because `v` has type `std::vec::Vec<i32>`, which does
   not implement the `Copy` trait
```

关键字 `move` 覆盖了 Rust 默认保守的借用规定，使线程可以获取其他线程中数据的所有权，从而得以安全执行。引用仍然需要遵守所有权规则，不允许在被移动的数据所在线程中继续操作该数据。
