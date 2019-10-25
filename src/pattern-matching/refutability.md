# 模式的形式

模式有两种形式：

- 可反驳的（ refutable ），对某些可能的值进行匹配会失败
- 不可反驳的（ irrefutable ），能匹配任何传递的可能值

模式并不总以相同的方式工作。某些情况下模式必须是 `irrefutable` 的，而在其他情况下则可以是 `refutable` 的。

## 模式形式的表现

### 只接受不可反驳模式

- `let` 语句
- 函数参数
- `for` 循环

因为通过不匹配的值，程序无法正常工作。

### 只接受可反驳模式

- `if let`
- `while let`

因为它们本身就是根据成功或失败的条件执行不同操作。

通常无需担心可反驳和不可反驳模式的区别，不过需要熟悉概念，以便在遇到相关错误时清楚如何应对，对模式或者使用模式的结构进行修改。

## 应用示例

在要求不可反驳模式的地方使用可反驳模式：

```rust
let Some(x) = some_option_value;
```

如果 `some_option_value` 的值是 `None`，其不会成功匹配模式 `Some(x)`，表明模式是可反驳的。然而 `let` 语句只接受不可反驳模式，因为代码不能通过 `None` 值进行有效操作。

编译错误：

```rust
error[E0005]: refutable pattern in local binding: `None` not covered
 -->
  |
3 | let Some(x) = some_option_value;
  |     ^^^^^^^ pattern `None` not covered
```

尽管 Rust 提示了错误原因，但实际上不可能覆盖到模式 `Some(x)` 的每一个可能的值！

改用 `if let` 修正代码，这也意味着不能再使用不可反驳模式：

```rust
# let some_option_value: Option<i32> = None;
if let Some(x) = some_option_value {
    println!("{}", x);
}
```

同样的，将不可反驳模式用于 `if let`（ 可反驳模式 ）是没有意义的：

```rust
if let x = 5 {
    println!("{}", x);
};
````

编译错误：

```rust
error[E0162]: irrefutable if-let pattern
 --> <anon>:2:8
  |
2 | if let x = 5 {
  |        ^ irrefutable pattern
```

### 小结

匹配分支必须使用可反驳模式，除了最后一个分支需要使用能匹配任何剩余值的不可反驳模式。

允许将不可反驳模式用于只有一个分支的 `match`，也可以使用更简单的 `let` 语句进行替代。
