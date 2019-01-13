# vue构造函数
    首先`vue`是一个构造函数,通过`new`操作符来生成实例的,那么首先得知道`vue`构造函数都干了什么
    
  ##vue构造函数的原型
    打开`entry-runtime-with-compiler.js`可以看到它引入了运行时版的vue
    
    ```js
    import Vue from './runtime/index'
    ```
      