# 工作区

```bash
├── Cargo.lock
├── Cargo.toml
├── add-one
│   ├── Cargo.toml
│   └── src
│       └── lib.rs
├── adder
│   ├── Cargo.toml
│   └── src
│       └── main.rs
└── target
```

## 内部依赖

二进制 crate `adder` 依赖于库 crate `add-one`，Cargo 并不假设工作区中的 crates 会相互依赖，因此需要在 `adder/Cargo.toml` 中显式添加 `add-one` 的路径依赖。

## 编译

在 `workspace` 目录下运行 `cargo build` 命令可对工作区进行编译。

## 运行

想要在 `workspace` 目录运行二进制 crate，需要使用 `-p` 参数 + 包名指定使用工作区中的哪一个包：

```bash
cargo run -p adder
```

## 外部依赖

`add-one` 使用了 crate `rand`，此外部依赖会被添加到工作区的 `Cargo.lock` 文件，此时 `adder` crate 并不能使用 `rand`，除非将 `rand` 添加到 `adder` crate 的 `Cargo.toml` 中。

## 测试

在此类组织结构的工作区中运行 `cargo test` 会为工作区中所有的 crates 运行测试。通过指定参数 `-p` 及 crate 也可以为工作区中某个特定的 crate 运行测试。

```bash
cargo test -p add-one
```
