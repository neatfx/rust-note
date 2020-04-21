# *Rust Note*

```bash
# ----------------------------------------------------------------------------------
# | 无 Runtime、无 GC、多范式、零成本抽象 ---> 语法友好、资源占用低、高性能、与其他语言轻松集成 |
# | 类型系统、所有权模型 ---> 编译时内存安全、编译时线程安全                                |
# ----------------------------------------------------------------------------------
#               \
#                \
#                   _~^~^~_
#               \) /  o o  \ (/
#                 '_   -   _'
#                 / '-----' \
```

鉴于实时处理、机器人、IoT 等领域的进展，是时候掌握一门新的系统语言了！
从内存管理设计到性能可靠性表现，面向未来的 Rust 语言气质独特，值得花时间深入了解。
考虑阅读原版文档往往收益更多，因而选择对 [*The Rust Programming Language 2018 Edition*](https://doc.rust-lang.org/stable/book/) 进行通读并在此记录。

## 项目进度

- [x] 其它章节
- [ ] 高级特性 - 宏

## 使用说明

文档位于 `src/` 目录，可使用 [mdbook](https://crates.io/crates/mdbook) 工具生成 HTML 格式，示例代码位于 `examples/` 目录。

```bash
# 第 1 步：安装文档构建工具
cargo install mdbook

# 第 2 步：渲染 Markdown 文件，输出 HTML 页面至 “book/” 目录
mdbook build

# 第 3 步：使用浏览器打开 "book/index.html" 查看文档
```

## 社区资源列表

### 语法特性 / 编译器 / 库 / 工作流 / 异步处理

|  分类  |  参考文档  |  中文版 | 官方仓库 |
|  :---:  | :---:  |  :---:   | :---: |
| 语言  | [The Rust Programming Language](https://doc.rust-lang.org/stable/book/)  | [《 Rust 编程语言 》](https://rustlang-cn.org/office/rust/book/)  | [GitHub](https://github.com/rust-lang/book)
| 语言  | [The Rust Reference](https://doc.rust-lang.org/reference/introduction.html) | [《 Rust 语言参考 》](https://rustlang-cn.org/office/rust/reference/)| [Github](https://github.com/rust-lang/reference)
| 语言  | [The Rustonomicon](https://doc.rust-lang.org/nomicon/index.html) | [《 Rust 死灵书 》](https://rustlang-cn.org/office/rust/advrust/)| [GitHub](https://github.com/rust-lang/nomicon)
| 语言  | [A book about Rust](https://www.notion.so/A-book-about-Rust-a51507cd17bb4c379d705a4f282425d6) （ 编写中 ） || x
| 语言  | [《 写给初学者的 Rust 中文教程 》](https://rustcc.gitbooks.io/rustprimer/content/)| x | [GitHub]((https://github.com/rustcc/RustPrimer))
| 语言  | [The Rust Unstable Book](https://doc.rust-lang.org/nightly/unstable-book/) || [GitHub](https://github.com/rust-lang/rust/tree/master/src/doc/unstable-book)
| 编译器 | [Guide to Rustc Development](https://rustc-dev-guide.rust-lang.org/) ||[GitHub](https://github.com/rust-lang/rustc-dev-guide)
| 核心库 | [The Rust Core Library](https://doc.rust-lang.org/core/index.html) || x
| 标准库 | [The Rust Standard Library](https://doc.rust-lang.org/std/index.html) || x
| Cargo | [The Cargo Book](https://doc.rust-lang.org/cargo/index.html) | [《 Cargo 指南 》](https://rustlang-cn.org/office/rust/cargo/)  | [GitHub](https://github.com/rust-lang/cargo/tree/master/src/doc)
| 异步处理 | [Asynchronous Programming in Rust](https://rust-lang.github.io/async-book/) | [《 Rust 异步编程 》](https://rustlang-cn.org/office/rust/async-rust/)| [GitHub](https://github.com/rust-lang/async-book)
| 异步处理 | [Futures Explained in 200 Lines of Rust](https://cfsamson.github.io/books-futures-explained/introduction.html) | | [GitHub](https://github.com/cfsamson/books-futures-explained)
| 工作流  | [Rustup](https://github.com/rust-lang/rustup) || [Github](https://github.com/rust-lang/rustup)
| 工作流  | [mdBook Documentation](https://rust-lang.github.io/mdBook/)| | [GitHub](https://github.com/rust-lang/mdBook)

### 面向领域开发

|  分类        |  参考文档  |  中文版 | 官方仓库 |
|  :---:        |      :---:  |  :---:   | :---: |
| 命令行    | [Command Line Apps in Rust](https://rust-lang-nursery.github.io/cli-wg/index.html)||[GitHub](https://github.com/rust-lang-nursery/cli-wg)
| WebAssembly | [Rust and Webassembly](https://rustwasm.github.io/docs/book/)|| [GitHub](https://github.com/rustwasm/book)
| 嵌入式       | [The Embedded Rust Book](https://rust-embedded.github.io/book/) || [GitHub](https://github.com/rust-embedded/book)
| 嵌入式       | [The Discovery Book](https://rust-embedded.github.io/discovery/)| [《 嵌入式探索之旅 》](https://rustlang-cn.org/office/iot/discovery/)
| 嵌入式       | [The Embedonomicon Book](https://docs.rust-embedded.org/embedonomicon/)

### 代码示例

|  分类  |  参考文档  |  中文版 | 官方仓库 |
|  :---:  | :---:  |  :---:   | :---: |
| 语言  | [Rust by Example](https://doc.rust-lang.org/rust-by-example/index.html) | [《 通过例子学 Rust 》](https://github.com/rust-lang-cn/rust-by-example-cn)| [Github](https://github.com/rust-lang/rust-by-example)
| 语言  | [Rust Quiz](https://dtolnay.github.io/rust-quiz/1)| [GitHub](https://github.com/RustStudy/rust_daily_news/tree/master/RustQuiz)
| 语言  | [Rust Cookbook](https://rust-lang-nursery.github.io/rust-cookbook/intro.html)| | [GitHub](https://github.com/rust-lang-nursery/rust-cookbook)
| 语言  | [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/about.html) | | [GitHub](https://github.com/rust-lang/api-guidelines)

### 框架 / 工具 / 库

|  分类 |  框架 / 工具 / 库 |
|  :---:  | :---:  |
| Web 开发框架 | [Rocket](https://rocket.rs/)
| Web 开发框架 | [Actix](https://actix.rs/)
| 应用开发框架  | [Riker](https://riker.rs/)
| 客户端 Web 应用开发框架 | [Yew](https://yew.rs/)
| HTTP 库 | [Hyper](https://github.com/hyperium/hyper)
| 异步运行时   | [Tokio](https://tokio.rs/)
| 数据序列化 & 反序列化 | [Serde](https://github.com/serde-rs/serde)
| ORM | [Diesel](https://diesel.rs/)
| WebAssembly | [wasm-bindgen](https://github.com/rustwasm/wasm-bindgen)
| WebAssembly | [wasm-pack](https://github.com/rustwasm/wasm-pack)
