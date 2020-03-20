# 共享状态并发

编程语言中的`channel`均类似于单一所有权（ 一旦将值传入通道，将无法在通道外使用该值 ）

共享内存类似多重所有权（多个线程可以同时访问相同位置的内存）

Rust 中的智能指针可以实现多所有权，但因为需要管理不同的所有权持有者，额外增加了程序复杂性。而 Rust 的类型系统和所有权规则对此提供了相当大的帮助。

## 共享内存并发构成要素 - 互斥器

互斥器（ mutex ）是 “mutual exclusion” 的缩写，也就是说，任意时刻，其只允许一个线程访问某些数据。为了访问互斥器中的数据，线程首先需要通过获取互斥器的锁（ lock ）来表明其希望访问数据。锁是一个作为互斥器一部分的数据结构，用于记录谁有数据的排他访问权。因此，互斥器可被描述为通过锁系统保护其数据。

互斥器以难用著称，你需要时刻牢记以下规则：

- 在使用数据之前尝试获取锁
- 处理完被互斥器所保护的数据之后，必须解锁数据，以便于其他线程能够获取锁

用好互斥器相当不容易，这也是大多数人热衷于使用通道的原因。不过，得益于类型系统和所有权，Rust 中的互斥器可以得到正确的管理，不会在锁和解锁上出错。

## 在单线程上下文中使用互斥器

```rust
use std::sync::Mutex;

fn main() {
    // Mutex<T> 是一个 MutexGuard 智能指针
    // 该智能指针实现了 Deref 来指向其内部数据并且提供了 Drop
    // 实现当 MutexGuard 离开作用域时自动释放锁
    // 基于所有权，锁的释放将自动完成，从而避免手动处理时因忘记释放锁而引发意外
    let m = Mutex::new(5);

    {
        // 使用 lock 方法获取锁，以访问互斥器中的数据。这个调用会阻塞当前线程直到获取锁为止
        // 如果另一个线程拥有锁并且 panic 了，则此处的 lock 调用会失败，没有人能获取到锁
        // 需使用 unwrap 来处理锁无法被任何线程获取的情况（ 使当前线程 panic ）
        let mut num = m.lock().unwrap(); // lock 调用返回 MutexGuard 智能指针
        *num = 6;
    }

    println!("m = {:?}", m);
} // m 离开作用域，同时自动释放锁
```

Rust 类型系统在互斥器使用中的作用：

`Mutex<i32>` 并不是一个 `i32`，必须先获取锁才能使用这个 `i32` 值。Rust 的类型系统确保在使用 `m` 中的值之前先获取锁，一旦获取了锁，就可以将返回值（ `num` ）视为锁的内部数据的可变引用。如果忘记获取锁，类型系统将不允许访问锁内部的 `i32` 值！此外，我们也不会忘记释放锁而导致互斥器阻塞不能为其它线程所用，因为锁的释放是自动发生的！

## 在多线程间共享 `Mutex<T>`

示例程序启动 10 个线程，每个线程都通过 `Mutex<T>` 来增加计数器的值：

```rust
use std::sync::Mutex;
use std::thread;

fn main() {
    let counter = Mutex::new(0);
    let mut handles = vec![];

    for _ in 0..10 {
        let handle = thread::spawn(move || {
            let mut num = counter.lock().unwrap();

            *num += 1;
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("Result: {}", *counter.lock().unwrap());
}
```

该示例将会报错，Rust 告诉我们不能将 `counter` 的所有权移动到多个线程中：

```shell
error[E0382]: capture of moved value: `counter`
  --> src/main.rs:10:27
   |
9  |         let handle = thread::spawn(move || {
   |                                    ------- value moved (into closure) here
10 |             let mut num = counter.lock().unwrap();
   |                           ^^^^^^^ value captured here after move
   |
   = note: move occurs because `counter` has type `std::sync::Mutex<i32>`,
   which does not implement the `Copy` trait

error[E0382]: use of moved value: `counter`
  --> src/main.rs:21:29
   |
9  |         let handle = thread::spawn(move || {
   |                                    ------- value moved (into closure) here
...
21 |     println!("Result: {}", *counter.lock().unwrap());
   |                             ^^^^^^^ value used here after move
   |
   = note: move occurs because `counter` has type `std::sync::Mutex<i32>`,
   which does not implement the `Copy` trait

error: aborting due to 2 previous errors
```

此错误可以通过多所有权来修复。

### 多线程和多所有权

#### 尝试使用智能指针 `Rc<T>` 来允许多个线程拥有 `Mutex<T>`

```rust
use std::rc::Rc;
use std::sync::Mutex;
use std::thread;

fn main() {
    let counter = Rc::new(Mutex::new(0));
    let mut handles = vec![];

    for _ in 0..10 {
        let counter = Rc::clone(&counter);
        let handle = thread::spawn(move || {
            let mut num = counter.lock().unwrap();

            *num += 1;
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("Result: {}", *counter.lock().unwrap());
}
```

编译出现新的错误：

```shell
error[E0277]: the trait bound `std::rc::Rc<std::sync::Mutex<i32>>:
std::marker::Send` is not satisfied in `[closure@src/main.rs:11:36:
15:10 counter:std::rc::Rc<std::sync::Mutex<i32>>]`
  --> src/main.rs:11:22
   |
11 |         let handle = thread::spawn(move || {
   |                      ^^^^^^^^^^^^^ `std::rc::Rc<std::sync::Mutex<i32>>`
cannot be sent between threads safely
   |
   = help: within `[closure@src/main.rs:11:36: 15:10
counter:std::rc::Rc<std::sync::Mutex<i32>>]`, the trait `std::marker::Send` is
not implemented for `std::rc::Rc<std::sync::Mutex<i32>>`
   = note: required because it appears within the type
`[closure@src/main.rs:11:36: 15:10 counter:std::rc::Rc<std::sync::Mutex<i32>>]`
   = note: required by `std::thread::spawn`
```

错误原因：

`Rc<T>` 并不能安全地在线程间共享。当 `Rc<T>` 进行引用计数时，由于其自身并不具备任何并发特性，来确保计数操作不会被其他线程打断（ 计数出错可能导致诡异的 BUG，比如内存泄漏或悬垂引用 ）。因此，我们需要的是一个类似 `Rc<T>`，但是能够以线程安全的方式进行计数操作的类型。

错误信息中提到的 `Send` 正是确保所使用类型用于并发环境的特质之一。

#### 使用 `Arc<T>` 包装 `Mutex<T>` 以实现在多线程之间共享所有权

原子性类型工作起来类似原始类型，不过可以安全的在线程间共享。标准库中 `std::sync::atomic` 的文档提供了更多关于原子性的细节。

`Arc<T>` 正是一个类似 `Rc<T>` 但是可以安全的用于并发环境的类型。字母 `a` 代表原子性，是一个原子引用计数（ `atomically reference counted` ）类型。

```rust
use std::sync::{Mutex, Arc};
use std::thread;

fn main() {
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];

    for _ in 0..10 {
        let counter = Arc::clone(&counter);
        let handle = thread::spawn(move || {
            // 尽管 counter 是不可变的，不过可以获取其内部值的可变引用
            let mut num = counter.lock().unwrap();

            *num += 1;
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("Result: {}", *counter.lock().unwrap());
}
```

运行结果：

```shell
Result: 10
```

尽管原子性类型很好用，但不是所有的原始类型都是原子性类型，标准库中的类型也没有默认使用 `Arc<T>` 实现，原因在于线程安全带有性能惩罚，除非必要否则不轻易使用。对于只是在单线程中对值进行操作的情况，无需提供原子性保证，代码可以运行得更快。

#### `RefCell<T>` / `Rc<T>` 与 `Mutex<T>` / `Arc<T>` 的相似性

`Mutex<T>` 提供了内部可变性。

正如使用 `RefCell<T>` 可以改变 `Rc<T>` 中的内容，使用 `Mutex<T>` 可以改变 `Arc<T>` 中的内容。

### 风险提示

当两个 `Rc<T>` 值相互引用，会构成引用循环，引发内存泄露。

在 Rust 中使用互斥器时，同样不能避免所有逻辑错误。当一个操作需要锁住两个资源而两个线程各持一个锁的时候，就会造成死锁（ `deadlock` ）的风险。

#### 扩展示例

尝试编写带有死锁的 Rust 程序，并尝试在 Rust 中实现其他语言中使用互斥器时的死锁规避策略。可参考标准库中 `Mutex<T>` 和 `MutexGuard` 的 API 文档。
