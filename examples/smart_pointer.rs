struct CustomSmartPointer {
    data: u8,
}

// 通过实现 `Drop` 特质来指定当值离开作用域时运行的代码（ 实例离开作用域时打印信息 ）
impl Drop for CustomSmartPointer {
    // `Drop` 特质要求实现一个名为 `drop` 的方法，该方法接受一个 `self` 的可变引用作为参数
    fn drop(&mut self) {
        // 此打印语句用于表明 Rust 自动调用了 drop 方法，实际应用中此处应放置与清理相关的代码，而不仅仅只是打印语句
        println!("Dropping CustomSmartPointer with data {:?}", self.data);
    }
}

fn main() {
    {
        let c = CustomSmartPointer { data: 10 };
        let d = CustomSmartPointer { data: 30 };
        
        println!("CustomSmartPointers created.");
    } // 实例 CustomSmartPointer 离开作用域，此时 Rust 将自动调用 drop 方法
}
