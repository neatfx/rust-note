(window.webpackJsonp=window.webpackJsonp||[]).push([[38],{232:function(t,s,a){"use strict";a.r(s);var e=a(0),n=Object(e.a)({},(function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[a("h1",{attrs:{id:"模式的形式"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#模式的形式"}},[t._v("#")]),t._v(" 模式的形式")]),t._v(" "),a("p",[t._v("模式有两种形式：")]),t._v(" "),a("ul",[a("li",[t._v("可反驳的（ refutable ），对某些可能的值进行匹配会失败")]),t._v(" "),a("li",[t._v("不可反驳的（ irrefutable ），能匹配任何传递的可能值")])]),t._v(" "),a("p",[t._v("模式并不总以相同的方式工作。某些情况下模式必须是 "),a("code",[t._v("irrefutable")]),t._v(" 的，而在其他情况下则可以是 "),a("code",[t._v("refutable")]),t._v(" 的。")]),t._v(" "),a("h2",{attrs:{id:"模式形式的表现"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#模式形式的表现"}},[t._v("#")]),t._v(" 模式形式的表现")]),t._v(" "),a("h3",{attrs:{id:"只接受不可反驳模式"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#只接受不可反驳模式"}},[t._v("#")]),t._v(" 只接受不可反驳模式")]),t._v(" "),a("ul",[a("li",[a("code",[t._v("let")]),t._v(" 语句")]),t._v(" "),a("li",[t._v("函数参数")]),t._v(" "),a("li",[a("code",[t._v("for")]),t._v(" 循环")])]),t._v(" "),a("p",[t._v("因为通过不匹配的值，程序无法正常工作。")]),t._v(" "),a("h3",{attrs:{id:"只接受可反驳模式"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#只接受可反驳模式"}},[t._v("#")]),t._v(" 只接受可反驳模式")]),t._v(" "),a("ul",[a("li",[a("code",[t._v("if let")])]),t._v(" "),a("li",[a("code",[t._v("while let")])])]),t._v(" "),a("p",[t._v("因为它们本身就是根据成功或失败的条件执行不同操作。")]),t._v(" "),a("p",[t._v("通常无需担心可反驳和不可反驳模式的区别，不过需要熟悉概念，以便在遇到相关错误时清楚如何应对，对模式或者使用模式的结构进行修改。")]),t._v(" "),a("h2",{attrs:{id:"应用示例"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#应用示例"}},[t._v("#")]),t._v(" 应用示例")]),t._v(" "),a("p",[t._v("在要求不可反驳模式的地方使用可反驳模式：")]),t._v(" "),a("div",{staticClass:"language-rust line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-rust"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("let")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("Some")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("x"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" some_option_value"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br")])]),a("p",[t._v("如果 "),a("code",[t._v("some_option_value")]),t._v(" 的值是 "),a("code",[t._v("None")]),t._v("，其不会成功匹配模式 "),a("code",[t._v("Some(x)")]),t._v("，表明模式是可反驳的。然而 "),a("code",[t._v("let")]),t._v(" 语句只接受不可反驳模式，因为代码不能通过 "),a("code",[t._v("None")]),t._v(" 值进行有效操作。")]),t._v(" "),a("p",[t._v("编译错误：")]),t._v(" "),a("div",{staticClass:"language-rust line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-rust"}},[a("code",[t._v("error"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("E0005"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" refutable pattern "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("in")]),t._v(" local binding"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" `None` not covered\n "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("->")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("|")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("3")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("|")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("let")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("Some")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("x"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" some_option_value"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("|")]),t._v("     "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("^")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("^")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("^")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("^")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("^")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("^")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("^")]),t._v(" pattern `None` not covered\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br"),a("span",{staticClass:"line-number"},[t._v("2")]),a("br"),a("span",{staticClass:"line-number"},[t._v("3")]),a("br"),a("span",{staticClass:"line-number"},[t._v("4")]),a("br"),a("span",{staticClass:"line-number"},[t._v("5")]),a("br")])]),a("p",[t._v("尽管 Rust 提示了错误原因，但实际上不可能覆盖到模式 "),a("code",[t._v("Some(x)")]),t._v(" 的每一个可能的值！")]),t._v(" "),a("p",[t._v("改用 "),a("code",[t._v("if let")]),t._v(" 修正代码，这也意味着不能再使用不可反驳模式：")]),t._v(" "),a("div",{staticClass:"language-rust line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-rust"}},[a("code",[t._v("# "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("let")]),t._v(" some_option_value"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" Option"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("<")]),t._v("i32"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(">")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" None"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("let")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("Some")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("x"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" some_option_value "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("println!")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"{}"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" x"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br"),a("span",{staticClass:"line-number"},[t._v("2")]),a("br"),a("span",{staticClass:"line-number"},[t._v("3")]),a("br"),a("span",{staticClass:"line-number"},[t._v("4")]),a("br")])]),a("p",[t._v("同样的，将不可反驳模式用于 "),a("code",[t._v("if let")]),t._v("（ 可反驳模式 ）是没有意义的：")]),t._v(" "),a("div",{staticClass:"language-rust line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-rust"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("let")]),t._v(" x "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("5")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("println!")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"{}"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" x"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br"),a("span",{staticClass:"line-number"},[t._v("2")]),a("br"),a("span",{staticClass:"line-number"},[t._v("3")]),a("br")])]),a("p",[t._v("编译错误：")]),t._v(" "),a("div",{staticClass:"language-rust line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-rust"}},[a("code",[t._v("error"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("E0162"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" irrefutable "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("let")]),t._v(" pattern\n "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("->")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("<")]),t._v("anon"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(">")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("2")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("8")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("|")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("2")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("|")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("let")]),t._v(" x "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("5")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("|")]),t._v("        "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("^")]),t._v(" irrefutable pattern\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br"),a("span",{staticClass:"line-number"},[t._v("2")]),a("br"),a("span",{staticClass:"line-number"},[t._v("3")]),a("br"),a("span",{staticClass:"line-number"},[t._v("4")]),a("br"),a("span",{staticClass:"line-number"},[t._v("5")]),a("br")])]),a("h3",{attrs:{id:"小结"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#小结"}},[t._v("#")]),t._v(" 小结")]),t._v(" "),a("p",[t._v("匹配分支必须使用可反驳模式，除了最后一个分支需要使用能匹配任何剩余值的不可反驳模式。")]),t._v(" "),a("p",[t._v("允许将不可反驳模式用于只有一个分支的 "),a("code",[t._v("match")]),t._v("，也可以使用更简单的 "),a("code",[t._v("let")]),t._v(" 语句进行替代。")])])}),[],!1,null,null,null);s.default=n.exports}}]);