# 线程通信

## 通道

Rust 中主要由标准库提供的通道工具实现消息传递并发。

`std::sync::mpsc::channel` 函数用于创建新通道，`mpsc` 是 `multiple producer, single consumer`（ 多个生产者，单个消费者 ）的缩写。这意味着一个通道可以有多个产生值的发送（ `sending` ）端，但只能有一个消费这些值的接收（ `receiving` ）端。

`std::sync::mpsc::channel` 函数返回一个元组：第一个元素是发送端，而第二个元素是接收端。`tx` 和 `rx` 通常作为 发送者（ `transmitter` ）和 接收者（ `receiver` ）的缩写。两者共同组成通道，当发送者或接收者任一被丢弃时可以认为通道被关闭。

```rust
use std::thread;
use std::sync::mpsc;

fn main() {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        let val = String::from("hi");
        // 如果接收端已经被丢弃了，将没有发送值的目标，发送操作会返回错误
        tx.send(val).unwrap();
    });

    // 当通道发送端关闭，recv 会返回一个错误表明不会再有新的值到来
    let received = rx.recv().unwrap();
    println!("Got: {}", received);
}
```

### `recv` vs `try_recv`

通道的接收端有两个有用的方法：`recv` 和 `try_recv`

`recv` 是 `receive` 的缩写，该方法会阻塞主线程执行直到从通道中接收一个值。一旦接收到值，`recv`会在一个 `Result<T, E>` 中返回它。当发送端关闭，`recv` 会返回错误表明不再有新值到来。

`try_recv` 不会阻塞，相反它立刻返回一个 `Result<T, E>:Ok` 值包含可用的信息，而 `Err` 值代表此时没有任何消息。如果线程在等待过程中还有其他工作需要处理，可以通过循环调用 `try_recv` 获取可用消息进行处理，然后转向处理其他工作直到再次检查。

## 通道与所有权转移

Rust 程序必须考虑所有权，这有助于编写安全的并发代码。

```rust
use std::thread;
use std::sync::mpsc;

fn main() {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        let val = String::from("hi");
        tx.send(val).unwrap();

        // val 发送到另一个线程后，可能会在再次使用它之前被修改或者丢弃
        println!("val is {}", val); // 报错： value used here after move
    });

    let received = rx.recv().unwrap();
    println!("Got: {}", received);
}
```

编译错误：

```rust
error[E0382]: use of moved value: `val`
  --> src/main.rs:10:31
   |
9  |         tx.send(val).unwrap();
   |                 --- value moved here
10 |         println!("val is {}", val);
   |                               ^^^ value used here after move
   |
   = note: move occurs because `val` has type `std::string::String`,
    which does not implement the `Copy` trait
```

函数 `send` 获取其参数的所有权并移动这个值归接收者所有，因此在发送后再次使用该值将无法通过编译时的所有权检查。

## 发送多个值并观察接收者的等待

```rust
use std::thread;
use std::sync::mpsc;
use std::time::Duration;

fn main() {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        let vals = vec![
            String::from("hi"),
            String::from("from"),
            String::from("the"),
            String::from("thread"),
        ];

        for val in vals {
            tx.send(val).unwrap();
            thread::sleep(Duration::from_secs(1));
        }
    });

    // 主线程中没有任何暂停或位于 for 循环中用于等待的代码
    // 所以主线程在等待从新建线程中接收值
    // 不再显式调用 recv 函数，而是将 rx 当作一个迭代器
    // 对于每一个接收到的值，将其打印出来。当通道被关闭时，迭代器也随之结束
    for received in rx {
        println!("Got: {}", received);
    }
}
```

运行结果：

```shell
Got: hi
Got: from
Got: the
Got: thread
```

## 通过克隆发送者来创建多个生产者

在创建新线程之前，我们对通道的发送端调用了 clone 方法。这会给我们一个可以传递给第一个新建线程的发送端句柄。我们会将原始的通道发送端传递给第二个新建线程。这样就会有两个线程，每个线程将向通道的接收端发送不同的消息

```rust
use std::thread;
use std::sync::mpsc;
use std::time::Duration;

fn main() {
  let (tx, rx) = mpsc::channel();
  let tx1 = mpsc::Sender::clone(&tx); // 克隆通道的发送端

  thread::spawn(move || {
      let vals = vec![
          String::from("hi"),
          String::from("from"),
          String::from("the"),
          String::from("thread"),
      ];

      for val in vals {
          tx1.send(val).unwrap();
          thread::sleep(Duration::from_secs(1));
      }
  });

  thread::spawn(move || {
      let vals = vec![
          String::from("more"),
          String::from("messages"),
          String::from("for"),
          String::from("you"),
      ];

      for val in vals {
          tx.send(val).unwrap();
          thread::sleep(Duration::from_secs(1));
      }
  });

  for received in rx {
      println!("Got: {}", received);
  }
}
```

可能的输出结果：

```shell
Got: hi
Got: more
Got: from
Got: messages
Got: for
Got: the
Got: thread
Got: you
```
