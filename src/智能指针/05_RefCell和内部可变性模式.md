# `RefCell<T>` 和内部可变性模式

内部可变性（ *Interior mutability* ）是 Rust 中的一个设计模式，它允许在数据具有不可变引用的情况下改变数据，而这通常是借用规则所不允许的。为了改变数据，该模式在数据结构中使用了 unsafe 代码以顺应 Rust 中用于管理变化和借用的通行规则。当前还未涉及到非安全代码部分的内容。你将在“高级特性”章节中见到相关介绍。

当能够确信在运行时代码会遵守借用规则，就可以使用那些应用了内部可变性模式的类型，尽管编译器对此无法保证。所涉及的 unsafe 代码将会被包装进安全的 API 中，同时，外在的类型仍然是不可变的。

本节将通过遵循内部可变性模式的 `RefCell<T>` 类型来对此概念进行探索。

## 使用 `RefCell<T>` 在运行时强制检查借用规则

不同于 `Rc<T>`，`RefCell<T>` 类型拥有其持有数据的单独所有权。那么又是什么使得 `RefCell<T>` 不同于像 `Box<T>` 这样的类型呢？先来回忆一下借用规则：

- 在任意给定时间，只能有一个可变引用或者任意数量的不可变引用
- 引用必须总是有效

对于引用和 `Box<T>`，借用规则的不可变性在编译时强制进行检查。对于 `RefCell<T>`，不可变性在运行时强制进行检查。对于引用，如果违反借用规则，将会得到编译器错误。而对于 `RefCell<T>`，如果违反借用规则，程序会 Panic 并退出。

### 编译时检查借用规则的好处

错误将在开发过程中被尽早地捕获且不会影响运行时性能，因为所有的分析都提前完成了。因此，编译时检查借用规则是大多数情况下的最佳选择，这也是 Rust 默认采取该策略的原因。

### 运行时检查借用规则的好处

允许出现某些在编译时检查中不被允许的内存安全场景。静态分析，像 Rust 编译器是天生保守的。代码的某些属性不可能通过分析被发现：这其中最有名的就是停机问题（ Halting Problem ），停机问题超出了本书的范畴，不过它是一个很有意思的课题，值得探究。

正因为某些分析是不可能的，如果 Rust 编译器不确定代码能够在所有权规则下进行编译，可能会拒绝编译一个实际上没有问题的程序。从这种角度看 Rust 编译器是保守的。如果 Rust 接受编译一个不正确的程序，用户将不会相信 Rust 所做的保证。然而，如果 Rust 拒绝一个正确的程序，虽然会给程序员带来不便，但不会引发灾难性结果。当你确信代码遵守了借用规则，但是编译器不能理解和给予保证的时候，`RefCell<T>` 类型会非常有用。

与 `Rc<T>` 类似，`RefCell<T>` 只能用于单线程场景并在你尝试将其用于多线程环境时给出编译时错误。“无惧并发” 章节将会介绍如何在多线程程序中使用 `RefCell<T>`。

### 选择 `Box<T>`，`Rc<T>` 或 `RefCell<T>` 的理由

- `Rc<T>` 使同一数据能够有多个所有者；`Box<T>` 和 `RefCell<T>` 都仅有一个所有者。
- `Box<T>` 允许在编译时不可变或可变借用检查；`Rc<T>`仅允许编译时不可变借用检查；`RefCell<T>` 允许运行时不可变或可变借用检查。
- 因为 `RefCell<T>` 允许运行时可变借用检查，所以可以在 `RefCell<T>` 自身是不可变的情况下改变其内部值。

改变一个不可变值的内部值即为 *内部可变性* 模式。接下来的部分将介绍一种非常适用内部可变性的情况，并弄清楚这一切是如何成为可能的。

## 内部可变性：对不可变值的可变借用

借用规则的一个推论是当有一个不可变值，不能将其借用为可变的值。如下代码不能编译：

```rust
fn main() {
    let x = 5;
    let y = &mut x;
}
```

尝试编译将得到如下错误：

```shell
error[E0596]: cannot borrow immutable local variable `x` as mutable
 --> src/main.rs:3:18
  |
2 |     let x = 5;
  |         - consider changing this to `mut x`
3 |     let y = &mut x;
  |                  ^ cannot borrow mutably
```

然而，在某些情况下，一个值通过其方法改变自身，同时对其它代码表现为不可变是很有用的。值的方法以外的代码不能改变值。使用 `RefCell<T>` 是一种获得拥有内部可变性能力的方式。`RefCell<T>` 并没有完全绕开借用规则：编译器中的借用检查器允许内部可变性并将借用规则检查放到了运行时。如果违反了这些规则，程序将会 `panic!` 而不是得到编译时错误。

让我们通过一个实际例子来探索哪些地方可以使用 `RefCell<T>` 来改变不可变值，并明白这为何有用。

### 内部可变性用例：Mock 对象

测试替身（ test double ）是一个通用编程概念，表示在测试中用于替代其它类型的类型。*Mock object* 是特有的测试替身类型，用来记录测试过程中发生了什么，从而可以断言是否进行了正确的操作。

Rust 没有与其他语言中的对象同等意义上的对象，也不具备其他语言那样的内建于标准库中的 *mock object* 功能，不过我们可以创建一个结构体作为 *mock object* 用来服务于同样的目的。

我们将会测试这样一个场景：创建一个库用于跟踪某个值与最大值的比值，并基于比值发送消息。

```rust
// src/lib.rs

//! 该库只提供跟踪某个值与最大值有多接近以及何时发出何种消息的功能。
//! 使用该库的程序需要提供消息发送的相关机制：记录消息、发送 email、发送短信等。
//! 库本身无需知道这些细节，它所需要做的只是对我们提供的 `Messenger` 特质进行实现。

pub trait Messenger {
    // 此方法是实现 `Mock Object` 时必须具备的接口，其接受一个 `self` 的不可变引用和一个消息文本作为参数
    fn send(&self, msg: &str);
}

pub struct LimitTracker<'a, T: Messenger> {
    messenger: &'a T,
    value: usize,
    max: usize,
}

impl<'a, T> LimitTracker<'a, T>
    where T: Messenger {
    pub fn new(messenger: &T, max: usize) -> LimitTracker<T> {
        LimitTracker {
            messenger,
            value: 0,
            max,
        }
    }

    pub fn set_value(&mut self, value: usize) {
        self.value = value;

        let percentage_of_max = self.value as f64 / self.max as f64;

        if percentage_of_max >= 0.75 && percentage_of_max < 0.9 {
            self.messenger.send("Warning: You've used up over 75% of your quota!");
        } else if percentage_of_max >= 0.9 && percentage_of_max < 1.0 {
            self.messenger.send("Urgent warning: You've used up over 90% of your quota!");
        } else if percentage_of_max >= 1.0 {
            self.messenger.send("Error: You are over your quota!");
        }
    }
}

//! 编写代码实现库之后，我们需要对其中 `set_value` 方法的行为进行测试，
//! 但是此方法并不会返回任何可供断言的值，所以通过改变参数 `value` 值的方式进行测试不可行
//! 不过，我们可以换一种思路实现测试：
//! 使用某个实现了 `Messenger` 特质的类型值（ 即 “Mock Object” ）及一个特定的 `max` 值创建 `LimitTracker` 实例
//! 然后调用 `LimitTracker` 实例的 `set_value` 方法为 `value` 字段提供不同的值
//! LimitTracker 实例内部逻辑将通知 “Mock Object” 调用 `send` 方法发送（ 实际上是保存 ）相应的消息
//! 最后，对 “Mock Object” 所持有的已发送消息的数量进行断言，达到我们的测试目的

#[cfg(test)]
mod tests {
    use super::*;

    // Mock Object
    struct MockMessenger {
        sent_messages: Vec<String>, // 该字段用于记录已发送消息
    }

    impl MockMessenger {
        // 关联函数，用于创建包含空消息列表的 `MockMessenger` 实例
        fn new() -> MockMessenger {
            MockMessenger { sent_messages: vec![] }
        }
    }

    // 为 `MockMessenger` 实现 `Messenger` 特质，从而为需要测试的 `LimitTracker` 提供一个 `MockMessenger`
    impl Messenger for MockMessenger {
        // `Mock Object` 只需跟踪其发送的消息即可，不需要在对其调用 `send` 方法时实际发送邮件或者文本消息
        // 因而此处代码实现为获取传入的消息并储存到 `sent_messages` 列表中
        fn send(&self, message: &str) {
            self.sent_messages.push(String::from(message));
        }
    }

    #[test]
    fn it_sends_an_over_75_percent_warning_message() {
        let mock_messenger = MockMessenger::new();
        let mut limit_tracker = LimitTracker::new(&mock_messenger, 100);

        limit_tracker.set_value(80);

        // 断言 `MockMessenger` 的已发送消息列表中应当包含一条消息
        assert_eq!(mock_messenger.sent_messages.len(), 1);
    }
}
```

运行代码将得到错误，借用检查器不允许这么做：

```shell
error[E0596]: cannot borrow immutable field `self.sent_messages` as mutable
  --> src/lib.rs:52:13
   |
51 |         fn send(&self, message: &str) {
   |                 ----- use `&mut self` here to make mutable
52 |             self.sent_messages.push(String::from(message));
   |             ^^^^^^^^^^^^^^^^^^ cannot mutably borrow immutable field
```

错误原因在于无法修改 `MockMessenger` 对消息进行记录，因为 `send` 方法使用了 `self` 的不可变引用。我们也不能参考错误信息中的建议使用 `&mut self` 替代，那样的话，`send` 方法的签名将与 `Messenger` 特质定义中的签名不符（ 可尝试如此修改并观察错误信息 ）。

这种情况正是内部可变性发挥作用的时候！改进测试部分的代码如下：

```rust
// src/lib.rs

#[cfg(test)]
mod tests {
    use super::*;
    use std::cell::RefCell;

    struct MockMessenger {
        // 将 `sent_messages` 放入一个 `RefCell<T>`，之后 `send` 方法就可以对其进行修改了！
        sent_messages: RefCell<Vec<String>>, // 字段类型使用 `RefCell<Vec<String>>` 代替原先的 `Vec<String>`
    }

    impl MockMessenger {
        fn new() -> MockMessenger {
            // 新建 `RefCell<Vec<String>>` 实例对空 `vector` 进行包装
            MockMessenger { sent_messages: RefCell::new(vec![]) }
        }
    }

    impl Messenger for MockMessenger {
        // 方法 send 的首参数仍为 `self` 的不可变借用，符合特质定义要求
        fn send(&self, message: &str) {
            // `RefCell<Vec<String>>` 具有 `borrow_mut` 方法
            // 调用 `borrow_mut` 方法可获取 `RefCell<Vec<String>` 类型值 （ 此处为 `vector` ）的可变引用
            // 对 `vector` 的可变引用调用 `push` 方法以记录测试过程中发送的消息
            self.sent_messages.borrow_mut().push(String::from(message));
        }
    }

    #[test]
    fn it_sends_an_over_75_percent_warning_message() {
        let mock_messenger = MockMessenger::new();
        let mut limit_tracker = LimitTracker::new(&mock_messenger, 100);
        limit_tracker.set_value(75);

        // 对 mock_messager 发送消息的数量进行断言时
        // 需要调用 `RefCell<Vec<String>>` 的 `borrow` 方法以获取其内部 `vector` 的不可变引用
        assert_eq!(mock_messenger.sent_messages.borrow().len(), 1);
    }
}
```

现在我们已经知道如何使用 `RefCell<T>` 了，下面我们进一步探究它是如何工作的！

### 使用 `RefCell<T>` 在运行时跟踪借用

当创建不可变和可变引用时，我们分别使用 `&` 和 `&mut` 语法。对于 `RefCell<T>`，则是使用 `borrow` 和 `borrow_mut` 方法，这是属于 `RefCell<T>` 的安全 API 的一部分。`borrow` 方法返回 `Ref<T>` 类型的智能指针，`borrow_mut` 方法返回 `RefMut<T>` 类型的智能指针。这两个类型都实现了 `Deref` 特质，因而可以将其当作常规引用看待。

`RefCell<T>` 跟踪当前有多少个活动的 `Ref<T>` 和 `RefMut<T>` 智能指针。每次调用 `borrow`，`RefCell<T>` 将活动的不可变借用计数加 1。当 `Ref<T>` 值离开作用域时，不可变借用计数减 1。像编译时借用规则一样，在任何时间点，`RefCell<T>` 允许存在多个不可变借用或一个可变借用。

如果尝试违反这些规则，相比使用引用时得到的编译器错误，`RefCell<T>` 的实现会在运行时 `panic!`。下面代码对先前实现的 `send` 方法进行了修改，故意尝试在同一作用域中创建两个可变借用以演示 `RefCell<T>` 阻止此类运行时行为：

```rust
// src/lib.rs

impl Messenger for MockMessenger {
    fn send(&self, message: &str) {
        let mut one_borrow = self.sent_messages.borrow_mut();
        let mut two_borrow = self.sent_messages.borrow_mut();

        one_borrow.push(String::from(message));
        two_borrow.push(String::from(message));
    }
}
```

当运行库的测试时，以上代码编译时不会有任何错误，但是测试会失败：

```shell
---- tests::it_sends_an_over_75_percent_warning_message stdout ----
thread 'tests::it_sends_an_over_75_percent_warning_message' panicked at
'already borrowed: BorrowMutError', src/libcore/result.rs:906:4
note: Run with `RUST_BACKTRACE=1` for a backtrace.
```

注意，代码会 panic 并给出信息 `already borrowed: BorrowMutError`。`RefCell<T>` 就是这样处理运行时违反借用规则的。

在运行时捕获借用错误而不是在编译时捕获意味着将会在开发过程的后期才会发现错误，甚至有可能直到代码被发布到生产环境后才发现错误。代码还会因在运行时而不是编译时跟踪借用而遭受少量运行时性能惩罚。然而，使用 `RefCell<T>` 使得编写一个在只允许使用不可变值的上下文中能够修改自身对已发送消息进行跟踪的 `Mock Object` 成为可能。可以权衡使用 `RefCell<T>` 来获得更多常规引用无法提供的功能。

## 组合使用 `Rc<T>` 和 `RefCell<T>` 以创建拥有多个所有者的可变数据

`RefCell<T>` 的一个常见用法是与 `Rc<T>` 组合。回想 `Rc<T>` 允许一些数据有多个所有者，但是只能提供对数据的不可变访问。如果有一个持有 `RefCell<T>` 的 `Rc<T>`，就可以得到一个拥有多个所有者且可以改变的值！

在 `cons list` 示例中，通过使用 `Rc<T>` 允许多个列表共享另一个列表的所有权。因为 `Rc<T>` 只持有不可变值，所以一旦在列表中创建了值之后就不能再对值进行修改。接下来改进代码，加入 `RefCell<T>` 来获得对列表中的值进行修改的能力：

```rust
// src/main.rs

#[derive(Debug)]
enum List {
    // 通过在 `Cons` 定义中使用 `RefCell<T>`，可以对所有列表中储存的值进行修改
    Cons(Rc<RefCell<i32>>, Rc<List>),
    Nil,
}

use List::{Cons, Nil};
use std::rc::Rc;
use std::cell::RefCell;

fn main() {
    // 创建 `Rc<RefCell<i32>` 实例并储存在变量 `value` 中，供后面的代码直接使用
    let value = Rc::new(RefCell::new(5));

    // 使用持有 `value` 的 Cons 变体在 `a` 中创建一个 List
    // 对 `value` 进行 `clone` 以便 `a` 和 `value` 都能拥有其内部值 `5` 的所有权，
    // 而不是将所有权从 `value` 移动到 `a` 或者使 `a` 借用 `value`
    // 列表 `a` 被包装进 `Rc<T>`，当创建列表 `b` 和 `c` 时，它们都可以引用 `a`，与原版示例写法一致
    let a = Rc::new(Cons(Rc::clone(&value), Rc::new(Nil)));

    let b = Cons(Rc::new(RefCell::new(6)), Rc::clone(&a));
    let c = Cons(Rc::new(RefCell::new(10)), Rc::clone(&a));

    // 创建列表 `a`、`b` 和 `c` 之后，将 `value` 的值加 `10`
    // 此处利用了 Rust 的自动解引用特性：
    // 解引用 `Rc<T>` 到其内部的 `RefCell<T>` 值
    // 对解引用得到的 `RefCell<T>` 值调用 `borrow_mut` 方法，得到一个 `RefMut<T>` 智能指针
    // 最后对 `RefMut<T>` 智能指针使用解引用操作符以改变其内部值
    *value.borrow_mut() += 10;

    println!("a after = {:?}", a);
    println!("b after = {:?}", b);
    println!("c after = {:?}", c);
}
```

运行代码：

```shell
a after = Cons(RefCell { value: 15 }, Nil)
b after = Cons(RefCell { value: 6 }, Cons(RefCell { value: 15 }, Nil))
c after = Cons(RefCell { value: 10 }, Cons(RefCell { value: 15 }, Nil))
```

这个技巧非常赞！通过使用 `RefCell<T>`，我们可以拥有一个表面上不可变的 `List` 值。但是借助于 `RefCell<T>` 上定义的方法可访问其内部可变性，在需要的时候对数据进行修改。运行时借用规则检查会保护代码免于数据竞争，并且在数据结构中，有时候牺牲一些速度换取灵活性是值得的。

标准库中还有其它提供了内部可变性的类型，比如 `Cell<T>`，与 `RefCell<T>` 类似，除了它在值的存取上采用了 `Copy` 的方式而非提供到内部值的引用。还有 `Mutex<T>`，提供了可安全用于多线程环境的内部可变性，在“无惧并发“章节会讨论它的使用。请查看标准库文档以获取更多这些类型之间差异的细节。
