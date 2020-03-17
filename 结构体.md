# 结构体

自定义数据类型，使用结构体（ Struct ）可以将多个相关的数据命名打包到一起作为一个有意义的组，类似 OOP 中对象的数据属性。

通过定义结构体方法、关联函数可以为结构体数据指定关联的行为。

结构体和枚举作为组成块用于在程序中创建新类型并获得完整的 Rust 编译时类型检查支持。

关联函数则将特定功能置于结构体的命名空间中而无需结构体实例。

## 结构体定义及实例化

与 `Tuple` 比较：

- 两者都可以包含多种数据类型
- 结构体所包含的数据需要命名以明确其含义，因而比 `Tuple` 更为灵活：不依赖顺序即可指定或访问实例成员的值。

### 定义结构体

```rust
struct User {
    // 以下 name：type 通常被称之为 “fields”
    username: String,
    email: String,
    sign_in_count: u64,
    active: bool,
}
```

### 结构体实例的创建、更新

#### 创建结构体实例

```rust
let user1 = User {
    email: String::from("someone@example.com"),
    username: String::from("someusername123"),
    active: true,
    sign_in_count: 1,
};
```

注：实例化时各字段无需保持结构体定义的字段顺序

#### 创建可变的结构体实例

实例必须是整体可变的，Rust 不允许只将结构体的某个字段标记为可变

```rust
let mut user2 = User {
    email: String::from("someone@example.com"),
    username: String::from("someusername123"),
    active: true,
    sign_in_count: 1,
};

// 更新实例
user2.email = String::from("anotheremail@example.com");
```

#### 使用表达式从函数体中创建结构体实例

```rust
fn build_user(email: String, username: String) -> User {
    User {
        email: email,
        username: username,
        active: true,
        sign_in_count: 1,
    }
}
```

简化写法:

```rust
fn build_user(email: String, username: String) -> User {
    User {
        email,
        username,
        active: true,
        sign_in_count: 1,
    }
}
```

#### 使用结构体更新语法从其他结构体实例创建实例

```rust
let user3 = User {
    email: String::from("another@example.com"),
    username: String::from("anotherusername567"),
    active: user1.active,
    sign_in_count: user1.sign_in_count,
};
```

#### 使用 `..` 语法从其他实例隐式获取剩余字段的值创建实例

```rust
let user4 = User {
    email: String::from("another@example.com"),
    username: String::from("anotherusername567"),
    ..user1 // 从 user1 获取 active & sign_in_count 字段的值
};
```

### 元组结构体（ Tuple Structs ）

元组结构体的字段不具名，只包含字段类型。

当需要将一个元组命名并使具有与其它元组不同的类型，同时在常规结构体中为每个字段命名又很繁琐多余的情况下，元组结构体非常有用。

```rust
struct Color(i32, i32, i32);
struct Point(i32, i32, i32);

// black 和 origin 值的类型不同，因为它们是不同元组结构体的实例。每一个定义的结构体都是它自身的类型，即使它们拥有相同类型的字段。
let black = Color(0, 0, 0);
let origin = Point(0, 0, 0);
```

元组结构体实例表现的很像元组，可将其解构，也可使用 `.` 语法通过索引访问其中个别值。

### 类单元结构体（ Unit-Like Structs ）

没有任何字段的结构体被称为类单元结构体，因为其表现与 `()` 类似。当需要在某些类型上实现特质但不需要在其中存储数据时，类单元结构体非常有用。

### 结构体数据的所有权

1、使用了自身拥有所有权的 `String` 类型，结构体拥有所有数据，只要整个结构体是有效的，其拥有的数据亦同样有效：

```rust
struct User {
    username: String,
    email: String,
    sign_in_count: u64,
    active: bool,
}
```

2、当结构体中存储了引用（ 下例中为 `&str` ）类型时，需要指定生命周期（ lifetimes ），生命周期能够确保结构体引用的数据的有效性跟结构体本身保持一致。尝试在结构体中存储一个引用而不指定生命周期，代码会得到编译时错误：

```rust
struct User {
    username: &str,
    email: &str,
    sign_in_count: u64,
    active: bool,
}

fn main() {
    let user1 = User {
        email: "someone@example.com",
        username: "someusername123",
        active: true,
        sign_in_count: 1,
    };
}
```

编译时错误：

```shell
error[E0106]: missing lifetime specifier
 -->
  |
2 |     username: &str,
  |               ^ expected lifetime parameter

error[E0106]: missing lifetime specifier
 -->
  |
3 |     email: &str,
  |            ^ expected lifetime parameter
```

注：如何修复错误请参考 “生命周期” 有关章节

## 结构体方法

方法和函数都使用 `fn` 关键字和名称声明，有参数和返回值，两者的不同之处：

- 方法定义于结构体（或者枚举、特质对象）的上下文中
- 方法的第一个参数总是 `self`，代表调用该方法的结构体实例

### 定义结构体方法

```rust
#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

// &self 相当于 rectangle: &Rectangle
impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }
}

fn main() {
    let rect1 = Rectangle { width: 30, height: 50 };

    println!(
        "The area of the rectangle is {} square pixels.",
        rect1.area()
    );
}
```

示例代码选择使用 `&self` 而不是 `self` 是因为不需要获取所有权（ 只需要能够读取结构体中的数据，而不需要写入 ），使用 `self` 作为第一个参数来使方法获取实例的所有权的情况是很少见的。

如果想要在方法中改变调用方法的实例，需要将第一个参数改为 `&mut self` 的形式。

#### `->` 操作符

在 C、C++ 语言中，有两种用于方法调用的操作符：

- `.` 用于在对象上直接调用方法
- `->` 用于在指向对象（需要先解引用）的指针上调用方法，`object -> fn()` 相当于 `(*object).fn()`

Rust 中没有类似 `->` 的操作符，是因为 Rust 具有 “automatic referencing and dereferencing” 特性。方法调用正是 Rust 中具备该特性的几处地方之一。

当使用 `object.something()` 进行方法调用时，Rust 会自动添加 `&`, `&mut`, 或者 `*` ，以便于 `object` 能够匹配方法签名。因此，以下代码是等效的：

```rust
p1.distance(&p2);
(&p1).distance(&p2);
```

#### 具有多个参数的结构体方法

```rust
#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }

    // `can_hold` 方法获取另一个 `Rectangle` 的不可变借用作为参数
    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width > other.width && self.height > other.height
    }
}

fn main() {
    let rect1 = Rectangle { width: 30, height: 50 };
    let rect2 = Rectangle { width: 10, height: 40 };
    let rect3 = Rectangle { width: 60, height: 45 };

    // `&rect2` 是 `rect2` （ `Rectangle` 实例 ）的不可变借用，因为只需要读取 `rect2`
    // 调用 rect1.can_hold 方法后可以继续使用 `rect2`
    println!("Can rect1 hold rect2? {}", rect1.can_hold(&rect2));
    println!("Can rect1 hold rect3? {}", rect1.can_hold(&rect3));
}
```

## 结构体关联函数

在 `impl` 块中定义的不以 `self` 作为参数的函数被称为关联函数（ Associated Functions ）。关联函数与结构体相关联，并不作用于结构体实例，因此是函数而不是方法。

关联函数的调用语法 - [结构体名]::[关联函数名]

```rust
#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn square(size: u32) -> Rectangle {
        Rectangle { width: size, height: size }
    }
}

fn main {
   let sq = Rectangle::square(3);
}
```

### 多个 `impl` 块

```rust
#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }
}

impl Rectangle {
    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width > other.width && self.height > other.height
    }
}
```

注： 如示例代码演示，通常没有必要将方法分离到多个 `impl` 中，不过这种语法是有效的。在后续介绍泛型、特质的章节将会遇到多个`impl`块发挥作用的场景。
