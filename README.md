# *Rust Note*

鉴于实时处理、机器人、IoT 等领域的进展，是时候掌握一门新的系统语言了！从内存管理设计到性能可靠性表现，面向未来的 Rust 语言气质独特，值得花时间深入了解。考虑阅读原版文档往往收益更多，因而选择对 [*The Rust Programming Language 2018 Edition*](https://doc.rust-lang.org/stable/book/) 进行通读并在此记录。

## TODO

- 面向对象编程特性
- 高级特性

## 使用说明

Markdown 文档位于 `src/` 目录，可使用 [mdbook](https://crates.io/crates/mdbook) 工具生成 HTML 格式

```bash
# 第 1 步：安装文档构建工具
cargo install mdbook

# 第 2 步：渲染 Markdown 文件，输出 HTML 页面至 “book/” 目录
mdbook build

# 第 3 步：使用浏览器打开 "book/index.html" 查看文档
```

示例代码位于 `examples/` 目录，使用工作区进行组织

```bash
# 第 1 步：切换至代码目录
cd examples

# 第 2 步：运行示例
cargo run --bin shared-state-concurrency
```

## 支持本项目

![alipay](https://raw.githubusercontent.com/neatfx/donation/master/alipay.jpeg)
![wechat-pay](https://raw.githubusercontent.com/neatfx/donation/master/wechat-pay.jpeg)
