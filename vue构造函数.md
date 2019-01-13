# vue构造函数
 首先`vue`是一个构造函数,通过`new`操作符来生成实例的,那么首先得知道`vue`构造函数都干了什么
    
##vue构造函数的原型
 打开`entry-runtime-with-compiler.js`可以看到它引入了运行时版的vue
   
```js
import Vue from './runtime/index'
```
还有就是重新定义了`vue`原型的`$mounted`方法以及赋予了`vue`构造函数静态的编译函数`compile`,这基本就是这个完整版的所有事情，
所以大多数事情都在运行时版本做了。

```js
//用变量缓存运行时的Vue原型的$mount方法
const mount = Vue.prototype.$mount
//重新改写运行时的Vue原型的$mount方法
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
) {...}
...
//为vue添加静态方法compile
Vue.compile = compileToFunctions
```
那么现在来打开`/platforms/web/runtime/index.js`,可以看到这个文件的`vue`构造函数又是引用的`core/index`文件中的,同时也对
`vue`进行平台化的包装,现在来一一看下。

```js
//引入了'core/index'中的vue构造函数
import Vue from 'core/index'
```
对配置的做了一些函数初始化
```js
// 判断标签的某个属性是否需要prop修饰符进行绑定(表示原生属性)
Vue.config.mustUseProp = mustUseProp
// 判断标签是否是保留的标签或者svg标签
Vue.config.isReservedTag = isReservedTag
// 判断标签属性是否存在style || class
Vue.config.isReservedAttr = isReservedAttr
// 判断标签是否为sug标签或math标签
Vue.config.getTagNamespace = getTagNamespace
// 判断标签是否为未知的标签
Vue.config.isUnknownElement = isUnknownElement
```
对`vue`构造函数的options对象添加`KeepAlive, Transition, TransitionGroup`这三个组件;为`Vue.options.directives`中添加了两个
`model: inserted、componentUpdated;show:bind、update、unbind`指令,等用到了在讲;并且为其原型链添加了`$mount、__patch__`方法,
其中`$mount`调用的是`/core/instance/lifecycle.js`中的`mountComponent`函数,这个用到了再讲。

```js
// 往Vue.options.directives中添加model和show这两个指令
extend(Vue.options.directives, platformDirectives)
// 往Vue.options.components中添加了2个组件,分别为Transition和TransitionGroup,主要是为了过渡动画用的。
extend(Vue.options.components, platformComponents)
// 这个函数应该是当组件更新时对比用的
Vue.prototype.__patch__ = inBrowser ? patch : noop
// 在这里定义了$mount函数
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && inBrowser ? query(el) : undefined
  return mountComponent(this, el, hydrating)
}
```



















































      