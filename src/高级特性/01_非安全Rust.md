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

```rust
let mut num = 5;

let r1 = &num as *const i32;
let r2 = &mut num as *mut i32;

unsafe {
    println!("r1 is: {}", *r1);
    println!("r2 is: {}", *r2);
}
```

## 调用 `Unsafe` 的函数或者方法

```rust
unsafe fn dangerous() {}

unsafe {
    dangerous();
}
```

```bash
error[E0133]: call to unsafe function requires unsafe function or block
 -->
  |
4 |     dangerous();
  |     ^^^^^^^^^^^ call to unsafe function
```

### 在 `Unsafe` 的代码之上创建安全抽象

```rust
let mut v = vec![1, 2, 3, 4, 5, 6];

let r = &mut v[..];

let (a, b) = r.split_at_mut(3);

assert_eq!(a, &mut [1, 2, 3]);
assert_eq!(b, &mut [4, 5, 6]);
```

```rust
fn split_at_mut(slice: &mut [i32], mid: usize) -> (&mut [i32], &mut [i32]) {
    let len = slice.len();

    assert!(mid <= len);

    (&mut slice[..mid],
     &mut slice[mid..])
}
```

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

```rust
use std::slice;

fn split_at_mut(slice: &mut [i32], mid: usize) -> (&mut [i32], &mut [i32]) {
    let len = slice.len();
    let ptr = slice.as_mut_ptr();

    assert!(mid <= len);

    unsafe {
        (slice::from_raw_parts_mut(ptr, mid),
         slice::from_raw_parts_mut(ptr.offset(mid as isize), len - mid))
    }
}
```

```rust

use std::slice;

let address = 0x01234usize;
let r = address as *mut i32;

let slice: &[i32] = unsafe {
    slice::from_raw_parts_mut(r, 10000)
};
```

### 使用 `extern` 函数来调用外部代码

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

## 访问或者修改一个可变静态变量

```rust
static HELLO_WORLD: &str = "Hello, world!";

fn main() {
    println!("name is: {}", HELLO_WORLD);
}
```

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

## 实现一个 `Unsafe` 特质

```rust

unsafe trait Foo {
    // methods go here
}

unsafe impl Foo for i32 {
    // method implementations go here
}
```

## 何时使用 `Unsafe` 代码
