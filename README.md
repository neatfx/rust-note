# *Rust Note*

鉴于实时处理、机器人、IoT 等领域的进展，是时候掌握一门新的系统语言了！

> 无 Runtime、无 GC、多范式、零成本抽象 ---> 语法友好、资源占用低、高性能、与其他语言轻松集成
>
> 类型系统、所有权模型 ---> 编译时内存安全、编译时线程安全

从内存管理设计到性能可靠性表现，面向未来的 Rust 语言气质独特，值得花时间深入了解。

考虑阅读原版文档往往收益更多，因而选择对 [*The Rust Programming Language 2018 Edition*](https://doc.rust-lang.org/stable/book/) 进行通读并在此记录。

## 项目进度

- [x] 其它章节
- [ ] 高级特性
  - [x] Unsafe Rust
  - [ ] 高级特质
  - [ ] 高级类型
  - [x] 高级函数及闭包
  - [ ] 宏
- [ ] 示例代码

## 使用说明

Markdown 文档位于 `src/` 目录，可使用 [mdbook](https://crates.io/crates/mdbook) 工具生成 HTML 格式

```bash
# 第 1 步：安装文档构建工具
cargo install mdbook

# 第 2 步：渲染 Markdown 文件，输出 HTML 页面至 “book/” 目录
mdbook build

# 第 3 步：使用浏览器打开 "book/index.html" 查看文档
```

示例代码位于 `examples/` 目录，其内容、数量、组织结构可能与原版存在较大差异

```bash
# 第 1 步：切换至代码目录
cd examples/anyone

# 第 2 步：运行测试
cargo test
```
