# 集合（ Collection ）

Rust 标准库中包含了一些被称为集合的数据结构。大部分其它数据类型表示一个特定的值，而集合可以持有多个值。与内置的 `Array` 以及 `Tuple` 不同，集合指向的数据储存在堆内存上，这意味着程序在编译时不需要知道数据的空间占用量，并且数据的内存使用量可在运行时伸缩。

每种集合都有不同的能力和开销，如何选择合适的集合是一种能力，需要时间和经验的积累。

Rust 程序中常用的集合有:

* [Vector](./vector.md)
* [String](./string.md)
* [HashMap](./hashmap.md)

了解标准库中的其它集合类型可参考[文档](https://doc.rust-lang.org/std/collections/index.html)
