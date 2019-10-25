# 利用 `Drop` 特质进行清理

其他语言需在每次使用完智能指针实例后调用清理内存或资源的代码，忘记的话可能导致系统崩溃。

在 Rust 中，通过指定在值离开作用域时需要被执行的代码（ 以实现 `Drop` 特质的方式 ），编译器将自动插入并且执行这些代码，无需在程序中编写用于实例结束时清理的代码，并且不会泄露资源。

可以为任何类型提供 `Drop` 特质的实现，用于释放资源。不过 `Drop` 特质更常用于实现智能指针。例如 `Box<T>` 自定义了 `Drop` 用来释放 box 所指向的堆空间。

## 自动清理

- `Drop` 特质包含在 `prelude` 中，无需导入
- `Drop` 特质要求实现 `drop` 方法，用于执行当类型实例离开作用域时需要运行的逻辑
- 当实例离开作用域时，其 `drop` 方法自动调用，以与创建顺序相反的顺序被丢弃（ d 在 c 之前 ）

```rust
struct CustomSmartPointer {
    data: String,
}

impl Drop for CustomSmartPointer {
    fn drop(&mut self) {
        println!("Dropping CustomSmartPointer with data `{}`!", self.data);
    }
}

fn main() {
    let c = CustomSmartPointer { data: String::from("my stuff") };
    let d = CustomSmartPointer { data: String::from("other stuff") };
    println!("CustomSmartPointers created.");
}
```

运行程序输出：

```shell
CustomSmartPointers created.
Dropping CustomSmartPointer with data `other stuff`!
Dropping CustomSmartPointer with data `my stuff`!
```

## 提前主动清理

`Drop` 特质的意义在于自动处理。然而有时可能需要提前清理某个值（ 而不是等到值离开作用域时由 Rust 调用 `drop` 方法进行自动清理 ），比如使用智能指针管理锁时，可能希望强制运行 `drop` 方法来释放锁以便作用域中的其他代码可以获取锁。

但是，Rust 并不允许主动调用 `Drop` 特质的 `drop` 方法：

```rust
fn main() {
    let c = CustomSmartPointer { data: String::from("some data") };
    println!("CustomSmartPointer created.");
    c.drop();
    println!("CustomSmartPointer dropped before the end of main.");
}
```

会得到编译错误：

```shell
error[E0040]: explicit use of destructor method
  --> src/main.rs:14:7
   |
14 |     c.drop();
   |       ^^^^ explicit destructor calls not allowed
```

错误信息表明 Rust 不允许显式调用 `drop` 方法（ 同时也指出了 `drop` 是一个析构函数 ），这是因为 Rust 会在 `main` 方法结尾对值自动调用 `drop` 方法，这将导致双重释放错误（ 清理相同的值两次 ）, 并且，自动插入的 `drop` 功能是无法禁用的（ 通常也不需要禁用 ）。

### 使用 `std::mem::drop` 在作用域结束之前强制释放变量

该函数包含于 `prelude`，无需导入

```rust
struct CustomSmartPointer {
    data: String,
}

impl Drop for CustomSmartPointer {
    fn drop(&mut self) {
        println!("Dropping CustomSmartPointer with data `{}`!", self.data);
    }
}

fn main() {
    let c = CustomSmartPointer { data: String::from("some data") };
    println!("CustomSmartPointer created.");
    drop(c);
    println!("CustomSmartPointer dropped before the end of main.");
}
```

运行后输出：

```shell
CustomSmartPointer created.
Dropping CustomSmartPointer with data `some data`!
CustomSmartPointer dropped before the end of main.
Dropping CustomSmartPointer with data `some data`!
```

第2行输出表明 drop 方法被调用并在此丢弃了 c

通过实现 `Drop` 特质使清理操作变得方便和安全，这非常有用，比如可以用来创建我们自己的内存分配器，通过 `Drop` 特质和 Rust 所有权系统，无需担心之后清理代码，Rust 会自动考虑这些问题。

我们也无需担心意外清理掉仍在使用的值（ 引发编译时错误 ），所有权系统会确保引用总是有效以及 `drop` 方法只会在值不再被使用时被调用一次。
