(window.webpackJsonp=window.webpackJsonp||[]).push([[51],{243:function(v,t,_){"use strict";_.r(t);var e=_(0),r=Object(e.a)({},(function(){var v=this,t=v.$createElement,_=v._self._c||t;return _("ContentSlotsDistributor",{attrs:{"slot-key":v.$parent.slotKey}},[_("h1",{attrs:{id:"智能指针"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#智能指针"}},[v._v("#")]),v._v(" 智能指针")]),v._v(" "),_("h2",{attrs:{id:"指针-vs-智能指针"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#指针-vs-智能指针"}},[v._v("#")]),v._v(" 指针 vs 智能指针")]),v._v(" "),_("h3",{attrs:{id:"指针（-pointer-）"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#指针（-pointer-）"}},[v._v("#")]),v._v(" 指针（ Pointer ）")]),v._v(" "),_("p",[v._v("指针是一个包含内存地址的变量的通用概念，这个地址引用或指向一些其他数据。")]),v._v(" "),_("p",[v._v("Rust 中最常见的指针是引用，引用以 "),_("code",[v._v("&")]),v._v(" 符号为标志并借用了其所指向的值。除引用数据外无任何其他特殊功能，也没有任何额外开销，因此应用最多。")]),v._v(" "),_("h3",{attrs:{id:"智能指针（-smart-pointer-）"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#智能指针（-smart-pointer-）"}},[v._v("#")]),v._v(" 智能指针（ Smart Pointer ）")]),v._v(" "),_("p",[v._v("智能指针是一类与指针有着相似表现的数据结构，但拥有额外的元数据和功能。")]),v._v(" "),_("p",[v._v("智能指针并非 Rust 独有，其概念起源于 C++ 语言，并存在于其他语言中。")]),v._v(" "),_("p",[v._v("在 Rust 中，智能指针通常使用结构体实现，区别于常规结构体之处在于其实现了 "),_("code",[v._v("Deref")]),v._v(" 和 "),_("code",[v._v("Drop")]),v._v(" 特质。"),_("code",[v._v("Deref")]),v._v(" 特质使智能指针实例（ 值 ）可被当作引用看待，从而可以编写兼容引用和智能指针的代码。"),_("code",[v._v("Drop")]),v._v(" 特质则允许自定义当智能指针离开作用域时运行的代码。")]),v._v(" "),_("p",[_("code",[v._v("String")]),v._v(" 和 "),_("code",[v._v("Vec<T>")]),v._v(" 都属于智能指针类型，因为它们拥有可修改的数据，并且拥有元数据（ 比如数据存储空间大小 ）及额外的功能或保证（ 比如 "),_("code",[v._v("String")]),v._v(" 的数据总是有效的 "),_("code",[v._v("UTF-8")]),v._v(" 编码 ）")]),v._v(" "),_("p",[v._v("智能指针是 Rust 中常用的通用设计模式，除了标准库中提供的各种智能指针，很多库都有自己的智能指针，也可以编写自定义智能指针。")]),v._v(" "),_("h4",{attrs:{id:"普通引用与智能指针在-rust-中的额外区别"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#普通引用与智能指针在-rust-中的额外区别"}},[v._v("#")]),v._v(" 普通引用与智能指针在 Rust 中的额外区别")]),v._v(" "),_("p",[v._v("普通引用是只借用数据的指针类型，与之相对，在大部分情况下，智能指针拥有其指向的数据。")]),v._v(" "),_("h2",{attrs:{id:"内容介绍"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#内容介绍"}},[v._v("#")]),v._v(" 内容介绍")]),v._v(" "),_("ul",[_("li",[v._v("功能实现\n"),_("ul",[_("li",[_("code",[v._v("Deref")]),v._v(" 特质 - 允许像普通引用一样操作智能指针，编写同时适用于引用和智能指针的代码")]),v._v(" "),_("li",[_("code",[v._v("Drop")]),v._v(" 特质 - 允许自定义当智能指针离开作用域时运行的代码")])])]),v._v(" "),_("li",[v._v("常用的标准库智能指针\n"),_("ul",[_("li",[_("code",[v._v("Box<T>")]),v._v("（ 用于在堆上存储数据 ）")]),v._v(" "),_("li",[_("code",[v._v("Rc<T>")]),v._v(" （ 引用计数类型，其指向的数据可以拥有多个所有者 ）")]),v._v(" "),_("li",[_("code",[v._v("Ref<T>")]),v._v(" 和 "),_("code",[v._v("RefMut<T>")]),v._v("（ 通过 "),_("code",[v._v("RefCell<T>")]),v._v(" 访问，在运行时而非编译时检查借用规则 ）")])])]),v._v(" "),_("li",[v._v("内部可变性（ interior mutability ）模式")]),v._v(" "),_("li",[v._v("引用循环（ reference cycles ）与内存泄露")])])])}),[],!1,null,null,null);t.default=r.exports}}]);