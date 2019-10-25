# Module

Modules 用于组织 `Crate` 内的代码，使其具有更好的可读性及重用性，并提供访问控制。

## 模块

### 模块嵌套

```rust
mod sound {
    mod instrument {
        mod woodwind {
            fn clarinet() {
                // 函数体
            }
        }
    }

    mod voice {

    }
}

fn main() {

}
```

对应的模块树：

```shell
crate
└── sound
    ├── instrument
    │   └── woodwind
    └── voice
```

模块 `woodwind` 嵌套在 `instrument` 中，模块 `instrument` 和模块 `voice` 是模块 `sound` 的子模块，整个模块树位于隐式模块 `crate` 的 `root` 下。

## 路径

路径用于引用模块树中的项，有两种形式:

- 绝对路径。从 `crate` 根开始，以 `crate` 名或者字面值 `crate` 开头
- 相对路径。从当前模块开始，以 `self`、`super` 或当前模块内的标识符开头

```rust
// 模块 sound 是定义于与 main 函数相同模块树级别的模块
mod sound {
    mod instrument {
        fn clarinet() {
            // 函数体
        }
    }
}

fn main() {
    // 绝对路径
    crate::sound::instrument::clarinet();

    // 相对路径
    sound::instrument::clarinet();
}
```

不过以上代码不能编译：

```shell
$ cargo build
   Compiling sampleproject v0.1.0 (file:///projects/sampleproject)
error[E0603]: function `clarinet` is private
  --> src/main.rs:11:31
   |
11 |     crate::sound::instrument::clarinet();
   |                               ^^^^^^^^

error[E0603]: function `clarinet` is private
  --> src/main.rs:14:24
   |
14 |     sound::instrument::clarinet();
   |                        ^^^^^^^^
```

此问题留到后面 “访问控制” 部分解决。

### 使用 `super` 开始相对路径

```rust
mod instrument {
    fn clarinet() {
        super::breathe_in();
    }
}

fn breathe_in() {
    // 函数体
}
```

模块增加嵌套后，使用 `super` 开始的相对路径函数调用不受影响：

```rust
mod sound {
    mod instrument {
        fn clarinet() {
            super::breathe_in();
        }
    }

    fn breathe_in() {
        // 函数体
    }
}
```

## 访问控制

模块是 Rust 中的私有性边界（ privacy boundary ）。如果希望函数或结构体私有，将其放入模块即可。

### 私有性规则

- 所有项（函数、方法、结构体、枚举、模块和常量）默认是私有的
- 可以使用 `pub` 关键字使项变为公有
- 不允许使用定义于当前模块的子模块中的私有代码
- 允许使用任何定义于父模块或当前模块中的代码

类似于文件系统的权限：如果没有某个目录的权限，则无法从父目录中查看其内容。如果有该目录的权限，则可以查看其中的目录和任何父目录

### 使用 `pub` 关键字使项变为公有

修正 “路径” 部分的示例代码，先使私有模块 `instrument` 变为公有模块：

```rust
// 模块 sound 是定义于与 main 函数相同模块树级别的模块
mod sound {
    pub mod instrument {
        fn clarinet() {
            // 函数体
        }
    }
}

fn main() {
    // 绝对路径
    crate::sound::instrument::clarinet();

    // 相对路径
    sound::instrument::clarinet();
}
```

编译仍然无法通过：

```shell
$ cargo build
   Compiling sampleproject v0.1.0 (file:///projects/sampleproject)
error[E0603]: function `clarinet` is private
  --> src/main.rs:11:31
   |
11 |     crate::sound::instrument::clarinet();
   |                               ^^^^^^^^

error[E0603]: function `clarinet` is private
  --> src/main.rs:14:24
   |
14 |     sound::instrument::clarinet();
   |                        ^^^^^^^^
```

模块的 `pub` 关键字只是允许其父模块引用它，模块公有并不代表其内容也是公有的。因此还需要在私有的 `clarinet` 函数前增加 `pub` 关键字使其变为公有函数：

```rust
// 模块 sound 是定义于与 main 函数相同模块树级别的模块
mod sound {
    pub mod instrument {
        pub fn clarinet() {
            // 函数体
        }
    }
}

fn main() {
    // 绝对路径
    crate::sound::instrument::clarinet();

    // 相对路径
    sound::instrument::clarinet();
}
```

注意：模块 `sound` 是定义于与 `main` 函数相同模块树级别的模块（ 两者共同定义于 `crate` 模块的 `root` ），可以从 `main` 中访问 `sound` 模块，尽管 `sound` 模块不是公有的。

### 使用 `pub` 定义结构体

在结构体定义中使用 `pub`，可以使结构体公有，不过结构体的字段仍是私有的。

```rust
mod plant {
    // 公有结构体
    pub struct Vegetable {
        pub name: String, // 公有字段
        id: i32, // 私有字段
    }

    impl Vegetable {
        // 公有关联函数
        // 因为私有字段的原因，只有通过该公有关联函数才可以创建 Vegetable 示例
        pub fn new(name: &str) -> Vegetable {
            Vegetable {
                name: String::from(name),
                id: 1,
            }
        }
    }
}

fn main() {
    let mut v = plant::Vegetable::new("squash");

    v.name = String::from("butternut squash");
    println!("{} are delicious", v.name);

    // 如果将如下行取消注释代码将无法编译:
    // println!("The ID is {}", v.id);
}
```

### 使用 `pub` 定义枚举

在枚举定义中使用 `pub`，其所有枚举成员都将成为公有。

```rust
mod menu {
    pub enum Appetizer {
        Soup,
        Salad,
    }
}

fn main() {
    let order1 = menu::Appetizer::Soup;
    let order2 = menu::Appetizer::Salad;
}
```

## 将名称引入作用域

### 使用 `use` 关键字将模块引入作用域

注意：通过 `use` 引入作用域的路径也会检查私有性。

#### 绝对路径

```rust
mod sound {
    pub mod instrument {
        pub fn clarinet() {
            // 函数体
        }
    }
}

use crate::sound::instrument; // 绝对路径

fn main() {
    instrument::clarinet();
    instrument::clarinet();
    instrument::clarinet();
}
```

移动调用项的代码时绝对路径无需移动:

```rust
mod sound {
    pub mod instrument {
        pub fn clarinet() {
            // 函数体
        }
    }
}

mod performance_group {
    use crate::sound::instrument;

    pub fn clarinet_trio() {
        instrument::clarinet();
        instrument::clarinet();
        instrument::clarinet();
    }
}

fn main() {
    performance_group::clarinet_trio();
}
```

#### 相对路径

**指定 `use` 后以 `self` 开头的相对路径在未来可能不是必须的。**

```rust
mod sound {
    pub mod instrument {
        pub fn clarinet() {
            // 函数体
        }
    }
}

use self::sound::instrument; // 相对路径

fn main() {
    instrument::clarinet();
    instrument::clarinet();
    instrument::clarinet();
}
```

选择采用相对或绝对路径能否减少代码修改取决于模块树如何变化，因为定义和调用项的代码更有可能相互独立的在模块树中移动，所以选择绝对路径可能更加适用。

### 推荐使用习惯

#### 通过 `use` 指定函数的父模块接着指定父模块来调用方法

不好的写法：

```rust
mod sound {
    pub mod instrument {
        pub fn clarinet() {
            // 函数体
        }
    }
}

use crate::sound::instrument::clarinet;

fn main() {
    clarinet();
    clarinet();
    clarinet();
}
```

推荐写法：

```rust
mod sound {
    pub mod instrument {
        pub fn clarinet() {
            // 函数体
        }
    }
}

mod performance_group {
    use crate::sound::instrument;

    pub fn clarinet_trio() {
        instrument::clarinet();
        instrument::clarinet();
        instrument::clarinet();
    }
}
```

#### 通过 `use` 指定结构体、枚举和其它项的全路径

不好的写法：

```rust
use std::collections;

fn main() {
    let mut map = collections::HashMap::new();
    map.insert(1, 2);
}
```

推荐写法：

```rust
use std::collections::HashMap;

fn main() {
    let mut map = HashMap::new();
    map.insert(1, 2);
}
```

#### 将两个同名类型引入作用域时使用父模块

```rust
use std::fmt;
use std::io;

fn function1() -> fmt::Result {
#     Ok(())
}
fn function2() -> io::Result<()> {
#     Ok(())
}
```

如果指定 `use std::fmt::Result` 和 `use std::io::Result`，则作用域中会有两个 `Result` 类型，Rust 将无法确定使用哪一个。

### 重命名引入作用域的类型

将两个同名类型引入同一作用域还有一个解决办法：通过在 `use` 后加上 `as` 和一个新名称来为此类型指定一个新的本地名称。

```rust
use std::fmt::Result;
use std::io::Result as IoResult;

fn function1() -> Result {
#     Ok(())
}
fn function2() -> IoResult<()> {
#     Ok(())
}
```

### 重新导出名称

```rust
mod sound {
    pub mod instrument {
        pub fn clarinet() {
            // 函数体
        }
    }
}

mod performance_group {
    // 导入 sound::instrument 后作为 performance_group::instrument 导出
    pub use crate::sound::instrument;

    pub fn clarinet_trio() {
        instrument::clarinet();
        instrument::clarinet();
        instrument::clarinet();
    }
}

fn main() {
    // 通过模块自有方法间接调用 sound::instrument::clarinet
    performance_group::clarinet_trio();

    // 使用重新导出的路径 sound::instrument::clarinet 调用
    performance_group::instrument::clarinet();
}
```

## 使用外部包

首先在 `Cargo.toml` 中加入依赖项，Cargo 将从 [crates.io](https://crates.io) 下载 `rand` 及其依赖并使其可用：

```shell
[dependencies]
rand = "0.5.5"
```

然后引入依赖并使用：

```rust
use rand::Rng; // 将 Rng 特质引入作用域

fn main() {
    let secret_number = rand::thread_rng().gen_range(1, 101);
}
```

## 使用 Rust 标准库

相对于用户 `package` 来说 Rust 标准库也是外部包。只是其跟随 Rust 语言一同分发，因此无需通过配置 `Cargo.toml` 引入，但是仍需要通过 `use` 将标准库中的项引入项目包的作用域：

```rust
use std::collections::HashMap;
```

## 通过嵌套路径精简 `use` 语句

```rust
use std::cmp::Ordering;
use std::io;
```

可以改进为：

```rust
use std::{cmp::Ordering, io};
```

```rust
// 将 std::io 和 std::io::Write 同时引入作用域
use std::io;
use std::io::Write;
```

可以改进为：

```rust
use std::io::{self, Write};
```

## 将所有的公有定义引入作用域

通过在路径后指定 `*`（ glob 运算符 ），可以将一个路径下的所有公有项引入作用域：

```rust
// 将 std::collections 中定义的所有公有项引入当前作用域
use std::collections::*;
```

这种方式的缺点在于难以推导作用域中有什么名称以及它们是在何处定义的。

`glob` 运算符常用于测试模块 `tests` 中，将所有内容引入作用域；有时也用于 `prelude` 模式。

## 将模块分割进不同文件

随着代码增长可以将模块移动到独立的文件中，当模块变得更复杂时，可将其定义拆分移动到单独的文件中，使代码更容易阅读。

```rust
// src/main.rs

// 声明 sound 模块，其内容位于 src/sound.rs 文件
// 使用分号而不是代码块告诉 Rust 在另一个与模块同名的文件中加载模块的内容
mod sound;

fn main() {
    // 绝对路径
    crate::sound::instrument::clarinet();

    // 相对路径
    sound::instrument::clarinet();
}
```

```rust
// src/sound.rs

// 声明 instrument 模块，其内容位于 src/sound/instrument.rs 文件
// 使用分号而不是代码块告诉 Rust 在另一个与模块同名的文件中加载模块的内容
pub mod instrument;
```

```rust
// src/sound/instrument.rs

pub fn clarinet() {
    // 函数体
}
```
