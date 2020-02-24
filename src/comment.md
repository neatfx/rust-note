# 注释

单行注释

```rust
fn main() {
    // comment
    let foo = 123;
}
```

多行注释

```rust
// line 1
// line 2
// line 3
```

行尾注释

```rust
fn main() {
    let foo = 123; // comment
}
```

文档注释

```rust
/// Adds one to the number given.
///
/// # Examples
///
/// ```
/// let arg = 5;
/// let answer = my_crate::add_one(arg);
///
/// assert_eq!(6, answer);
/// ```
pub fn add_one(x: i32) -> i32 {
    x + 1
}
```