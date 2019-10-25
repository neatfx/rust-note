# Packages & Crates

## 概念

### `Crate`

一个模块的树形结构，有二进制、库两种形式，它被编译成库或二进制项目。

#### `crate root`

编译 `Crate` 时被 Cargo 传递给 `rustc` 作为根模块的文件（ 例如 `src/lib.rs`、`src/main.rs` ）

### `Package`

由一个或多个 `Crate` 组成的功能集，包含用于描述如何编译其 `Crates` 的 `Cargo.toml` 配置文件

Cargo 通过 `Package` 来构建、测试和分享 `Crates`。

## `Package` 的构成规则

- `Package` 可以不包含任何库 `Crate` 或者仅包含一个库 `Crate`
- `Package` 可以包含任意数量的二进制 `Crate`
- `Package` 必须包含至少一个库或二进制 `Crate`

## 项目示例

运行 `cargo new` 命令即是在创建一个包：

```shell
cargo new my-project
     Created binary (application) `my-project` package
ls my-project
Cargo.toml
src
ls my-project/src
main.rs
```

注意 `Cargo.toml` 中并没有提到 `src/main.rs` 文件，这是因为 Cargo 默认约定：

- 包目录包含 `src/main.rs`，表示此包带有同名的二进制 `Crate`，`src/main.rs` 是 `Crate` 根
- 包目录包含 `src/lib.rs`，表示此包带有同名的库 `Crate`，`src/lib.rs` 是 `Crate` 根

如果包同时包含 `src/main.rs` 和 `src/lib.rs`，那么它带有两个与包同名的 `Crate` （ 一个二进制和一个库项目 ）。如果只有其中之一，则包将只有一个库或者二进制 `Crate`。包可以带有多个二进制 `Crate`，需将其文件置于 `src/bin` 目录（ 每个文件将成为一个单独的二进制 `Crate` ）。

```shell
# 包 "my-project" 包含 3 个二进制 Crates 、1 个库 Crate
my-project
 ├── Cargo.toml # 配置文件
 └── src
     ├── bin
     │   ├── a.rs # 单独的二进制 Crate
     │   └── b.rs # 单独的二进制 Crate
     ├── lib.rs # 库 Crate - “my-project” 的根
     └── main.rs # 二进制 Crate - “my-project” 的根
```
