struct Counter {
    // 该字段用于跟踪迭代处理过程中的位置。字段是私有的，因为我们希望由 Counter 的实现来管理它的值
    count: u32,
}

impl Counter {
    // new 函数强制新创建实例 count 字段的默认值为 0
    fn new() -> Counter {
        Counter { count: 0 }
    }
}

impl Iterator for Counter {
    type Item = u32; // 将迭代器的关联类型 Item 设置为 u32，表明迭代器将返回 u32 类型值

    fn next(&mut self) -> Option<Self::Item> {
        self.count += 1; // 希望迭代器将当前状态加 1，count 初始值为 0，因此 count 第一次将返回 1

        // 如果 count 值小于 6，`next` 方法将返回使用 Some 包装后的当前值，否则，返回 `None`
        if self.count < 6 {
            Some(self.count)
        } else {
            None
        }
    }
}

#[test]
fn calling_next_directly() {
    let mut counter = Counter::new();

    assert_eq!(counter.next(), Some(1));
    assert_eq!(counter.next(), Some(2));
    assert_eq!(counter.next(), Some(3));
    assert_eq!(counter.next(), Some(4));
    assert_eq!(counter.next(), Some(5));
    assert_eq!(counter.next(), None);
}