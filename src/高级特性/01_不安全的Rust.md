# Unsafe Rust

到目前为止，我们所讨论的所有代码，在编译时都会得到 Rust 所施加的内存安全保证。不过，Rust 中还隐藏了另外一种被称为 *unsafe* Rust 的语言：不强制施加内存安全保证，使用起来与常规 Rust 没有什么不同，但额外提供了强大能力。

存在 Unsafe Rust 的原因是静态分析天然是保守的。当编译器尝试查证代码是否能够维持安全承诺时，拒绝某些有效的程序要比接受某些无效的程序更好。尽管在 Rust 能够指出代码存在问题之前，代码可能是没有问题的！这些情况下，可以使用 `unsafe` 代码来告诉编译器，“相信我，我知道自己在做什么”。使用 `unsafe` 代码的缺点是需要自己承担风险：如果没有正确使用 `unsafe` 代码，比如对空指针进行解引用操作，可能会引发内存安全问题。

Rust 具有 `unsafe` 一面的另一个原因是构成计算机硬件的基础本质上是不安全的。如果 Rust 不允许执行 `unsafe` 的操作，你将无法执行确定的任务。Rust 需要允许你做一些底层系统编程工作，比如直接与操作系统进行交互，甚至是编写你自己的操作系统。因为适用于底层系统编程是 Rust 语言的目标之一。

## `Unsafe` 的强大能力

使用 `unsafe` 关键字开始新的代码块，并在其中编写 `unsafe` 代码以切换到 `unsafe` Rust 模式。`unsafe` Rust 中可以接受四种在安全 Rust 中无法实现的处理，被称为 *unsafe superpower*，包含了实现以下操作的能力：

- 对原始指针进行解引用
- 调用 `unsafe` 函数或方法
- 访问或者修改可变静态变量
- 实现 `unsafe` 特质
- 访问 `union` 中的字段

`unsafe` 并不会关闭借用检查或者禁用任何其它 Rust 安全检查，理解这一点很重要：如果在 `unsafe` 代码中使用了引用，它仍旧会被检查。`unsafe` 关键字仅允许使用以上 4 种特性，编译器不会对它们进行内存安全性检查。也就是说，`unsafe` 代码块仍具有一定程度的安全性。

此外，`unsafe` 并不意味着 `unsafe` 块中的代码一定就是有风险的或者肯定会有内存安全问题：其目的在于，作为程序员，你需要确保位于 `unsafe` 块中的代码以有效的方式访问内存。

人们很容易犯错，错误也是难免的。但是通过要求以上四种 `unsafe` 操作位于标注了 `unsafe` 的代码块中，你会知道任何与内存安全相关的错误必定位于 `unsafe` 块中。注意保持较小的 `unsafe` 块；之后，当排查内存 bug 的时候，你将体会到这样做的好处。

尽可能的将程序中的 `unsafe` 代码剥离出来，最好是将 `unsafe` 代码置于一个安全抽象的内部并提供安全的 API，这个待后面检查 `unsafe` 函数以及方法的时候会讨论。标准库的一部分被实现为在经审查的 `unsafe` 代码之上的安全抽象。在安全抽象中包裹 `unsafe` 代码的做法，能够避免在所有你或者你的用户可能想要使用由 `unsafe` 代码实现的功能的地方使用 `unsafe`，因为使用安全抽象是安全的。

下面将对四种 `superpowers` 依次进行介绍。同时也会介绍一些为 `unsafe` 代码提供安全接口的抽象。

## 解引用原始指针

我们知道，编译器会确保引用总是有效。`unsafe` Rust 具有两个被称为原始指针的类似于引用的新类型。和引用一样，原始指针既可以是可变的也可以是不可变的，分别写作 `*mut T` 和 `*const T`。这里的星号并非解引用运算符而是类型名称的一部分。在原始指针的上下文中，不可变意味着指针解引用之后不能再被直接赋值。

原始指针与引用（ 常规指针类型 ）及智能指针的区别：

- 可同时拥有不可变和可变的指针，或多个指向相同内存位置的可变指针，因此被允许忽略借用规则
- 不保证一定指向有效内存
- 允许为空
- 不实现任何自动清理功能

通过移除 Rust 强加的安全保证，在一些不适用 Rust 安全保证的地方，可以放弃安全保证以换取更好的性能或者与其它语言、硬件适配的能力。

从引用同时创建不可变和可变原始指针：

```rust
let mut num = 5;

// 使用 as 将不可变和可变引用转化为对应的原始指针类型
// 因为编译器保证引用总是有效，因此这些特定的原始指针是有效的，但是不能就此认为任何原始指针都是有效的
let r1 = &num as *const i32;
let r2 = &mut num as *mut i32;
```

注意，上述代码并未使用 `unsafe` 关键字。在安全代码中创建原始指针是没有问题的，只是不能在 `unsafe` 块之外对原始指针进行解引用。

下面创建一个指向任意内存地址的原始指针，对于此原始指针，我们无法确定其有效性：

```rust
// 使用任意内存是不确定的：那里可能有数据也可能没有，编译器可能会将此内存访问优化掉，或者程序可能会出现 segmentation fault
// 尽管可以这样编写代码，但通常没有合适的理由这样做
let address = 0x012345usize;
let r = address as *const i32;
```

可以在安全代码中创建原始指针，但是不能在 `unsafe` 块之外对原始指针进行解引用。下面便使用 `unsafe` 块对原始指针进行解引用：

```rust
let mut num = 5;

let r1 = &num as *const i32;
let r2 = &mut num as *mut i32;

unsafe {
    println!("r1 is: {}", *r1);
    println!("r2 is: {}", *r2);
}
```

创建一个指针没有什么危害，只有在尝试访问其指向的值时才有可能在处理无效值时导致程序终止。

还需注意，上面示例中创建了同时指向相同内存位置的可变及不可变原始指针。但如果尝试创建 `num` 的不可变和可变引用，将无法编译，因为 Rust 的所有权规则不允许在拥有可变引用的同时拥有不可变引用。通过原始指针，就能够同时创建指向同一内存地址的可变指针和不可变指针，并通过可变指针对数据进行修改，这有可能造成数据竞争。所以一定要小心！

有这么多危险，那为什么还要使用原始指针呢？主要是由于存在以下适用场景：

- 配合 C 代码一起工作（ 这个在后面 “调用不安全函数或方法” 部分将会讲到 ）
- 构建借用检查器无法理解的安全抽象

## 调用 `Unsafe` 的函数或方法

此上下文中的 `unsafe` 关键字表明当调用函数时需要满足其要求，因为 Rust 不能保证我们已经遇到这些要求。通过在 `unsafe` 块中调用 `unsafe` 函数，我们表明已经阅读过此函数的文档并对维持函数约定负责。

```rust
// unsafe 函数和方法与常规函数方法类似，但是多一个 unsafe 关键字
unsafe fn dangerous() {
    // unsafe 函数体也是有效的 unsafe 块，因此在 unsafe 函数体中执行不安全操作时无需新增额外的 unsafe 块
}

// 通过插入一个 unsafe 块并在其中对 dangerous 函数进行调用，
// 以此向 Rust 保证我们已经阅读过此函数的文档，清楚如何正确使用，并对当前履行的函数约定进行了验证
unsafe {
    dangerous();
}
```

必须在一个单独的 `unsafe` 块中调用 `dangerous` 函数，否则会得到错误：

```bash
error[E0133]: call to unsafe function requires unsafe function or block
 -->
  |
4 |     dangerous();
  |     ^^^^^^^^^^^ call to unsafe function
```

### 在 `Unsafe` 的代码之上创建安全抽象

仅仅因为函数包含 `unsafe` 代码并不意味着需要将整个函数标记为 `unsafe`。事实上，将 `unsafe` 代码封装进 `safe` 函数是一个常见抽象。以标准库中的函数 `split_at_mut` 为例，该 safe 函数定义于可变 `slice` 之上：获取一个 `slice` 并从给定的索引参数开始将其分割为两个 `slice`。该函数用法如下：

```rust
let mut v = vec![1, 2, 3, 4, 5, 6];

let r = &mut v[..];

let (a, b) = r.split_at_mut(3);

assert_eq!(a, &mut [1, 2, 3]);
assert_eq!(b, &mut [4, 5, 6]);
```

首先尝试在不使用 `unsafe` Rust 的情况下对此函数进行实现：

```rust
// 方便起见，将 split_at_mut 实现为函数而不是方法，并且只处理 i32 类型而非泛型 slice
// 函数首先获取 slice 的长度，然后通过断言检查参数 mid，如果 mid 大于 len，函数将会 panic
// 之后，在一个元组中返回两个可变的 slice：一个从原始 slice 开头到 mid 索引，另一个从 mid 到原 slice 结尾
fn split_at_mut(slice: &mut [i32], mid: usize) -> (&mut [i32], &mut [i32]) {
    let len = slice.len();

    assert!(mid <= len);

    (&mut slice[..mid],
     &mut slice[mid..])
}
```

如果尝试编译示例代码将得到错误：

```bash
error[E0499]: cannot borrow `*slice` as mutable more than once at a time
 -->
  |
6 |     (&mut slice[..mid],
  |           ----- first mutable borrow occurs here
7 |      &mut slice[mid..])
  |           ^^^^^ second mutable borrow occurs here
8 | }
  | - first borrow ends here
```

Rust 的借用检查器无法理解我们是在借用 `slice` 的不同部分：它只知道我们从同一个 `slice` 借用了两次。借用 `slice` 的不同部分本质上是没有问题的，两部分 `slice` 不存在重叠。不过 Rust 还没有智能到能够理解这些。当我们知道代码没有问题而 Rust 不知道，就是使用 `unsafe` 代码的时候了。

下面使用 `unsafe` 块，原始指针以及一些 `unsafe` 函数的调用来实现 `split_at_mut` 函数：

```rust
use std::slice;

fn split_at_mut(slice: &mut [i32], mid: usize) -> (&mut [i32], &mut [i32]) {
    // `slices` 是指向某些数据的指针及 `slice` 的长度
    // 可以使用 `len` 方法获取 `slice` 的长度
    let len = slice.len();
    // 使用 `as_mut_ptr` 方法可访问 `slice` 的原始指针，此处返回一个 `*mut i32` 类型的原始指针并保存到 `ptr` 变量
    let ptr = slice.as_mut_ptr();

    assert!(mid <= len); // 保留此断言语句

    // 以下代码块封装了 unsafe 代码：
    // `slice::from_raw_parts_mut` 函数接受一个原始指针和一个长度作为参数来创建一个 `slice`
    // 此处使用该函数创建了一个从 `ptr` 开始，长度为 `mid` 的 `slice`
    // 之后以 `mid` 作为参数在 `ptr` 上调用 `offset` 方法，获取一个从 `mid` 开始的原始指针
    // 使用此原始指针以及 `mid` 之后剩余项的数量作为长度参数创建一个 `slice`
    unsafe {
        (slice::from_raw_parts_mut(ptr, mid),
         slice::from_raw_parts_mut(ptr.offset(mid as isize), len - mid))
    }
}
```

`slice::from_raw_parts_mut` 函数是 `unsafe` 的是因为它接受原始指针作为参数，且必须确信该指针是有效的。原始指针上的 `offset` 方法也是 `unsafe` 的，因为其必须确信偏移位置也是一个有效的指针。因而，必须将 `slice::from_raw_parts_mut` 和 `offset` 放入 `unsafe` 块中以便能够调用它们。通过观察代码以及增加 `mid` 必须小于等于 `len` 的断言，我们可以说 `unsafe` 块中使用的所有原始指针都是指向 `slice` 中数据的有效指针。这是一个可以接受的、恰当的 `unsafe` 用法。

注意，无需将 `split_at_mut` 函数标记为 `unsafe`，并且我们可以从 `safe` Rust 中调用此函数。因为仅从该函数访问的数据中创建有效指针，我们用一种安全使用 `unsafe` 代码的函数实现，创建了到 `unsafe` 代码的安全抽象。

与此相对，下面示例代码中，使用 `slice` 时，`slice::from_raw_parts_mut` 将有可能崩溃：

```rust
// 使用任意内存地址并创建了一个长度为 10000 的 `slice`
// 我们并不拥有此地址的内存，也不能保证代码创建的 `slice` 中包含有效的 `i32` 值。
// 尝试像使用有效的 `slice` 一样使用 `slice` 使用会导致不确定的行为
use std::slice;

let address = 0x01234usize;
let r = address as *mut i32;

let slice: &[i32] = unsafe {
    slice::from_raw_parts_mut(r, 10000)
};
```

### 使用 `extern` 函数来调用外部代码

有时候 Rust 代码可能需要与其他语言编写的代码进行交互。Rust 为此提供了关键字 `extern`，以便于创建和使用外部函数接口（ `Foreign Function Interface`， FFI ）。EFI 是编程语言用来定义函数以使不同（ 外部 ）的编程语言能够进行调用的一种方式。

从 Rust 代码中调用 `extern` 块中声明的函数始终是不安全的。原因是其它语言不会强制施加 Rust 的规则及保证，并且 Rust 无法对它们进行检查，所以需要程序员负责确保代码安全。

以下示例演示了如何在 Rust 代码中集成 C 标准库中的 `abs` 函数：

```rust
extern "C" {
    fn abs(input: i32) -> i32;
}

fn main() {
    unsafe {
        println!("Absolute value of -3 according to C: {}", abs(-3));
    }
}
```

在 `extern` "C" 块中，列出了我们希望调用的另一种语言中的外部函数的签名和名称。"C" 部分定义了外部函数所使用的应用程序二进制接口（ `application binary interface`，ABI ）：ABI 定义了如何在汇编语言层面调用此函数。"C" ABI 是最常见的，并遵循 C 编程语言的 ABI。

> 从其它语言调用 Rust 函数
>
> 也可以使用 `extern` 创建允许其他语言调用 Rust 函数的接口。不同于 `extern` 块，在 `fn` 关键字之前增加 `extern` 关键字并指定要使用的 ABI。同时还需增加 `#[no_mangle]` 注解来告诉 Rust 编译器不要 `mangle` （ 命名重整 ）此函数的名称。`Mangling` 是指编译器将函数名称修改为包含更多信息供编译过程其他部分使用但是难以阅读的函数名称。每一种编程语言的编译器重整函数名的方式都有细微的差别，所以为了使 Rust 函数可被其他语言命名，必须禁用 Rust 编译器的 `name mangling`。
>
> 将下列代码编译为共享库并从 C 代码中进行连接之后，就能够在 C 代码中调用 `call_from_c` 函数了：
>
> ```rust
> #[no_mangle]
> pub extern "C" fn call_from_c() {
>   println!("Just called a Rust function from C!");
> }
>```
>
> `extern` 的这种用法无需 `unsafe`。

## 访问或者修改一个可变静态变量

Rust 确实支持全局变量（ `global variables` ），不过在所有权规则下使用可能会有问题。如果两个线程访问同一可变全局变量，能够导致数据竞争。

全局变量在 Rust 中被称为静态（ `static` ）变量。示例展示了一个使用字符串 `slice` 作为值的不可变静态变量声明：

```rust
static HELLO_WORLD: &str = "Hello, world!";

fn main() {
    println!("name is: {}", HELLO_WORLD);
}
```

静态变量类似于之前讨论的常量。静态变量名通常采用 `SCREAMING_SNAKE_CASE` 写法，且必须标注变量类型，此例中是 `&'static str`。静态变量只能储存拥有 `'static` 生命周期的引用，这意味着 Rust 编译器可以自己计算出其生命周期因而无需显式标注。访问不可变静态变量是安全的。

常量与不可变静态变量可能看起来类似，不过存在细微差别，静态变量中的值具有固定的内存地址。使用值时总是访问相同的数据。另一方面，常量在使用的时候允许对其数据进行复制。

常量与静态变量的另一个区别在于静态变量可以是可变的。访问和修改可变静态变量都是 `unsafe` 的。以下示例展示了如何声明、访问和修改一个名为 `COUNTER` 的可变静态变量：

```rust
static mut COUNTER: u32 = 0;

fn add_to_count(inc: u32) {
    unsafe {
        COUNTER += inc;
    }
}

fn main() {
    add_to_count(3);

    unsafe {
        println!("COUNTER: {}", COUNTER);
    }
}
```

像常规变量一样，我们使用 `mut` 关键字来指定可变性。任何读写 `COUNTER` 的代码都必须放入 `unsafe` 块中。示例代码可以编译并如期打印出 `COUNTER: 3`，这是因为示例是单线程的。当使用多个线程访问 `COUNTER` 使则可能导致数据竞争。

使用可全局访问的可变数据的情况下，很难保证没有数据竞争，这就是为何 Rust 认为可变静态变量是 `unsafe` 的。有可能的情况下，请优先使用并发技术和线程安全智能指针 ( “无惧并发” 章节 )，这样编译器就能够对不同线程安全访问数据进行检查。

## 实现 `Unsafe` 特质

最后一个仅在使用 `unsafe` 时有效的操作是实现 `unsafe` 特质。当特质方法中至少有一个具有某些编译器无法验证的不变量时，特质便是 `unsafe` 的。可以在特质之前增加 `unsafe` 关键字将特质声明为 `unsafe` 的，特质的实现也要标记为 `unsafe`，如示例 19-11 所示：

```rust
unsafe trait Foo {
    // methods go here
}

unsafe impl Foo for i32 {
    // method implementations go here
}
```

通过使用 `unsafe impl`，我们承诺会对编译器无法验证的不变量进行保证。

编译器会自动为完全由 `Send` 和 `Sync` 类型组成的类型自动实现特质。如果要实现一个类型，该类型包含了一个不是 `Send` 或者 `Sync` 的类型，比如原始指针，并希望将此类型标记为 `Send` 或 `Sync`，则必须使用 `unsafe` 进行处理。Rust 无法验证此类型可以保证安全的跨线程发送或在多线程间访问，因而需要我们自己进行检查并使用 `unsafe` 进行说明。

## 何时使用 `Unsafe` 代码

使用 `unsafe` 进行刚讨论过的四种操作都是没有问题的，甚至无需犹豫。不过要使 `unsafe` 代码没有问题也不简单因为编译器不能帮助保证内存安全。当有理由使用 `unsafe` 代码时，可以这么做的，通过显式标注 `unsafe` 使得出现错误时更容易追踪问题的源头。
