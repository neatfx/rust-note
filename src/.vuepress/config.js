module.exports = {
  // title: '编程语言 Rust 笔记',
  dest: './docs',
  markdown: {
    lineNumbers: true
  },
  themeConfig: {
    navbar: false,
    search: false,
    sidebar: [
      {
        title: 'Rust Note',
        path: '/'
      },
      {
        title: '项目管理',
        children: [
          '/cargo',
          '/package-and-crate',
          '/module',
        ]
      },
      {
        title: '通用编程概念',
        children: [
          '/variable',
          '/data-type',
          '/struct',
          '/enumeration',
          {
            title: '集合',
            path: '/collections/',
            children: [
              '/collections/vector',
              '/collections/string',
              '/collections/hashmap',
            ]
          },
          {
            title: '智能指针',
            path: '/smart-pointer/',
            children: [
              '/smart-pointer/box',
              '/smart-pointer/deref-trait',
              '/smart-pointer/drop-trait',
              '/smart-pointer/rc',
              '/smart-pointer/refcell',
              '/smart-pointer/reference-cycles-and-memory-leak'
            ]
          },
          '/function',
          '/control-flow',
          '/error-handling',
          '/comment',
        ]
      },
      {
        title: '所有权',
        children: [
          '/ownership' 
        ]
      },
      {
        title: '抽象',
        children: [
          '/generic-type', 
          '/trait'
        ]
      },
      {
        title: '生命周期',
        children: [
          '/lifetime'
        ]
      },
      {
        title: '并发编程',
        children: [
          '/concurrent/intro',
          '/concurrent/process-and-thread',
          '/concurrent/thread-models',
          '/concurrent/create-thread',
          '/concurrent/communication',
          '/concurrent/share-state',
          '/concurrent/extensible',
        ]
      },
      {
        title: '测试',
        children: [
          '/testing/write',
          '/testing/run',
          '/testing/result',
          '/testing/unit-and-integration'
        ]
      },
      {
        title: '模式匹配',
        children: [
          '/pattern-matching/intro', 
          '/pattern-matching/places-for-patterns',
          '/pattern-matching/refutability',
          '/pattern-matching/syntax'
        ]
      },
      {
        title: '编程范式',
        children: [
          {
            title: '函数式编程特性',
            path: '/programming-paradigm/functional-language-features/',
            children: [
              '/programming-paradigm/functional-language-features/closure',
              '/programming-paradigm/functional-language-features/iterator',
              '/programming-paradigm/functional-language-features/performance'
            ]
          },
          {
            title: '面向对象特性',
            path: '/programming-paradigm/object-oriented-programming-features/',
            children: [
              '/programming-paradigm/object-oriented-programming-features/oo-intro',
              '/programming-paradigm/object-oriented-programming-features/trait-object',
              '/programming-paradigm/object-oriented-programming-features/oo-design-patterns'
            ]
          }
        ]
      },
      {
        title: '高级特性',
        children: [
          '/advanced-features/',
          '/advanced-features/unsafe-rust',
          '/advanced-features/advanced-lifetime',
          '/advanced-features/advanced-trait',
          '/advanced-features/advanced-types',
          '/advanced-features/advanced-function-and-closure',
          '/advanced-features/macros'
        ]
      }
    ]
  }
}