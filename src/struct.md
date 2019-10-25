# 结构体

结构体（ Struct ）用来组织相关连的数据，创建自定义类型。通过结构体可以将相关联的数据片段联系起来并命名它们，使代码更加清晰。

通过定义结构体方法允许为结构体实例指定行为。

关联函数则将特定功能置于结构体的命名空间中而无需结构体实例。

与 `Tuple` 比较：

- 两者都可以包含多种类型
- 结构体成员需要命名，因此对成员的访问也更灵活，而 `Tuple` 只能依赖顺序访问成员

## 结构体定义及实例化

### 定义结构体

```rust
struct User {
    username: String,
    email: String,
    sign_in_count: u64,
    active: bool,
}
```

### 结构体实例的创建、更新

```rust
let user1 = User {
    email: String::from("someone@example.com"),
    username: String::from("someusername123"),
    active: true,
    sign_in_count: 1,
};
```

#### 创建可变的结构体实例

实例必须是整体可变的，Rust 不允许只将结构体的某个字段标记为可变

```rust
let mut user2 = User {
    email: String::from("someone@example.com"),
    username: String::from("someusername123"),
    active: true,
    sign_in_count: 1,
};
```

#### 使用结构体更新语法从其他实例创建实例

```rust
let user3 = User {
    email: String::from("another@example.com"),
    username: String::from("anotherusername567"),
    active: user1.active,
    sign_in_count: user1.sign_in_count,
};
```

#### 使用 `..` 语法从其他实例创建实例

```rust
let user4 = User {
    email: String::from("another@example.com"),
    username: String::from("anotherusername567"),
    ..user1
};
```

#### 更新结构体实例

此操作的前提是结构体实例必须是可变的

```rust
user2.email = String::from("anotheremail@example.com");
```

### 使用函数创建结构体实例

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

### 元组结构体（ tuple structs ）

元组结构体没有具体的字段名，只有字段的类型

每一个结构体都有独立不同的类型，即使结构体中的字段类型相同

可以将元组结构体解构为单独的值，也可以使用 `.` 语法通过索引访问单独的值

```rust
struct Color(i32, i32, i32);
struct Point(i32, i32, i32);

// black 和 origin 值的类型不同，因为它们是不同元组结构体的实例。
let black = Color(0, 0, 0);
let origin = Point(0, 0, 0);
```

### 类单元结构体（ unit-like structs ）

没有任何字段的结构体被称为类单元结构体，用于在类型上实现特质但不需要在类型中存储数据的情况

#### 结构体数据的所有权

1、使用了自身拥有所有权的 `String` 类型，结构体拥有所有数据，只要整个结构体是有效的，其拥有的数据亦同样有效：

```rust
struct User {
    username: String,
    email: String,
    sign_in_count: u64,
    active: bool,
}
```

2、当结构体中存储了引用（ 下例中为 `&str` ）类型时，需要指定生命周期（ lifetimes ），生命周期能够确保结构体引用的数据的有效性跟结构体本身保持一致。尝试在结构体中存储一个引用而不指定生命周期将是无效的：

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

```rust
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

## 定义方法

方法和函数都使用 `fn` 关键字和名称声明，有参数和返回值，两者的不同之处：

- 方法在上下文中（ 结构体、枚举、特质对象 ）被定义
- 方法的第一个参数总是 `self`，代表调用该方法的结构体实例

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

### 带有更多参数的方法

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

## 定义关联函数

在 `impl` 块中定义的不以 `self` 作为参数的函数被称为关联函数（ associated functions ）

关联函数与结构体相关联，并不作用于结构体实例，因此是函数而不是方法。

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

## 多个 `impl` 块

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
