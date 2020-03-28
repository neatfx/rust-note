# 利用 `Drop` 特质在清理时运行代码

第二个对智能指针模式很重要的特质是 `Drop`，它允许对值将要离开作用域时候的行为进行定制。可以为任何类型提供 `Drop` 特质的实现，指定的代码将被用于释放资源，比如文件或者网络连接。接下来将要介绍 `Drop` 特质是因为其功能通常被用于实现智能指针。例如，`Box<T>` 自定义了 `Drop` 用来释放 `box` 所指向的堆内存空间。

一些语言中，每次使用完智能指针实例后，程序员必须调用代码对内存或资源进行清理。如果忘记清理，系统可能会超负荷并且崩溃。在 Rust 中可以指定一些在值离开作用域时执行的特定代码（ 以实现 `Drop` 特质的方式 ），编译器将自动插入这些代码，因此无需关心在程序中到处放置用于特定类型实例结束时用到的清理代码，也不会泄露资源。

## 自动清理

- `Drop` 特质包含在 `prelude` 中，使用时无需导入
- `Drop` 特质要求实现 `drop` 方法，用于执行当类型实例离开作用域时需要运行的逻辑
- 当实例离开作用域时，其 `drop` 方法自动调用，以与创建顺序相反的顺序被丢弃（ d 在 c 之前 ）

```rust
struct CustomSmartPointer {
    data: String,
}

// 通过实现 `Drop` 特质来指定当值离开作用域时运行的代码（ 实例离开作用域时打印信息 ）
impl Drop for CustomSmartPointer {
    // `Drop` 特质要求实现一个名为 `drop` 的方法，该方法接受一个 `self` 的可变引用作为参数
    fn drop(&mut self) {
        // 此打印语句用于表明 Rust 自动调用了 drop 方法，实际应用中此处应放置与清理相关的代码，而不仅仅只是打印语句
        println!("Dropping CustomSmartPointer with data `{}`!", self.data);
    }
}

fn main() {
    let c = CustomSmartPointer { data: String::from("my stuff") };
    let d = CustomSmartPointer { data: String::from("other stuff") };
    println!("CustomSmartPointers created.");
} // 实例 CustomSmartPointer 离开作用域，此时 Rust 将自动调用 drop 方法
```

运行程序：

```shell
CustomSmartPointers created.
Dropping CustomSmartPointer with data `other stuff`!
Dropping CustomSmartPointer with data `my stuff`!
```

变量以与创建顺序相反的顺序被清理，因此 `d` 将先于 `c` 被清理。

## 提前清理

不幸的是，不能简单的禁用自动 drop 功能，禁用自动 drop 通常也是不必要的；`Drop` 特质的意义就在于自动调用。然而有时可能需要提前清理某个值（ 而不是等到值离开作用域时由 Rust 调用 `drop` 方法进行自动清理 ）。例如，使用智能指针管理锁时，可能希望强制运行 `drop` 方法释放锁以便相同作用域中的其他代码可以获取锁。但是，Rust 并不允许主动调用 `Drop` 特质的 `drop` 方法；因此，如果想要在值的作用域结束之前强制对其进行清理，只能调用由标准库提供的 `std::mem::drop` 函数。

手动调用 `Drop` 特质的 `drop` 方法进行清理：

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

错误信息表明 Rust 不允许显式调用 `drop` 方法。错误信息使用了 “析构函数” 术语（ 通用编程术语，指用于清理实例的函数 ）。在 Rust 中，drop 函数是一个特定的析构函数。

Rust 之所以不允许显式调用 drop 函数是因为在 `main` 方法结尾 Rust 仍然会对值自动调用 `drop` 方法，这将导致双重释放错误因为 Rust 将会对相同的值清理两次。

当值离开作用域的时候，无法禁用自动插入的 drop 方法，也无法显式调用 drop 方法。因此，如果需要强制提前清理一个值，可以使用 `std::mem::drop` 函数。此函数与 Drop 特质中的 drop 方法不同，我们需要将想要强制提前清理的值作为参数传给它来进行调用。该函数包含于 `prelude`，因此使用前无需导入。

### 使用 `std::mem::drop` 在作用域结束之前强制释放变量

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
```

第 2 行输出表明 drop 方法被调用并在那个位置对 c 进行了清理。

以不同方式使用在 `Drop` 特质实现中指定的代码使内存清理操作既方便又安全：例如，可以用来创建自己的内存分配器！有了 `Drop` 特质和 Rust 的所有权系统，无需担心忘记清理内存，Rust 会自动清理。

我们也无需担心意外清理掉仍在使用的值（ 引发编译时错误 ）：所有权系统会确保引用总是有效以及值不再被使用时 `drop` 方法只会被调用一次。
