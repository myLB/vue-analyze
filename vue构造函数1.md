# vue构造函数

 首先`vue`是一个构造函数,通过`new`操作符来生成实例的,那么首先得知道`vue`构造函数都干了什么
 
## vue构造函数原型

 打开`entry-runtime-with-compiler.js`可以看到它引入了运行时版的vue
 ```js
 import Vue from './runtime/index'
 ```
 打开`./runtime/index`可以看到它引入的是`core/index`中导出的`vue`
 ```js
import Vue from 'core/index'
```
打开`core/index`又可以看到它引入的是`./instance/index`中导出的`vue`
```js
import Vue from './instance/index'
```
打开`./instance/index`发现终于看到`vue`构造函数了,现在来看看这个文件都干了些什么？
```js
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}

//为Vue原型添加_init方法
initMixin(Vue)
/*为$data，$props添加拦截器来提示一些警告(这些时只读属性)
初始化一些有关state的方法比如：$set、$delete、$watch*/
stateMixin(Vue)
/*为Vue原型添加$on、$once、$off、$emit四个方法*/
eventsMixin(Vue)
/*为Vue原型添加_update、$forceUpdate、$destroy三个方法*/
lifecycleMixin(Vue)
/*为vue原型添加$nextTick、_render*/
renderMixin(Vue)

export default Vue
```
可以看到这个文件主要做的事情就是初始化了`Vue`构造函数和执行了5个函数。在`vue`构造函数中可以看到,它主要是对非`vue`实例提示
'`vue`是一个构造函数,应该用`new`关键字调用它',然后执行了`_init`函数,并将用户传入的`options`传进去。那么接下来看看这个五个函数都
干了些什么？

1、首先来看`initMixin(Vue)`这个函数,这个函数是从`/core/instance/init.js`文件导出的,所以我们去看这个文件。发现这个函数主要是为了
初始化`_init`函数,也就是`Vue`构造函数中执行的函数,那么就预计到了这个函数中必定做了很多的东西,这个等后面再讲。
```js
//为原型添加了_init函数
export function initMixin (Vue: Class<Component>) {
  Vue.prototype._init = function (options?: Object) {...}
}
```
2、`stateMixin(Vue)`这个函数是从`core/instance/state.js`中导出的,现在前往这个文件。
```js
export function stateMixin (Vue: Class<Component>) {
  // flow somehow has problems with directly declared definition object
  // when using Object.defineProperty, so we have to procedurally build up
  // the object here.
  const dataDef = {}
  /*设置一个输出值是data对象并且名为get的方法*/
  dataDef.get = function () { return this._data }
  const propsDef = {}
  /*设置一个输出值是props对象并且名为get的方法*/
  propsDef.get = function () { return this._props }
  /*当出现改变实例data属性时或props属性时提示错误警告*/
  if (process.env.NODE_ENV !== 'production') {
    dataDef.set = function (newData: Object) {
      warn(
        'Avoid replacing instance root $data. ' +
        'Use nested data properties instead.',
        this
      )
    }
    propsDef.set = function () {
      warn(`$props is readonly.`, this)
    }
  }
  /*为$data和$props添加读取和赋值的拦截器*/
  Object.defineProperty(Vue.prototype, '$data', dataDef)
  Object.defineProperty(Vue.prototype, '$props', propsDef)

  /*为vue实例添加$set和$delete和$watch方法*/
  Vue.prototype.$set = set
  Vue.prototype.$delete = del

  Vue.prototype.$watch = function (
    expOrFn: string | Function,//watch的key可以是函数
    cb: any,
    options?: Object
  ): Function {...}
}
```
可以看到主要是`Vue`原型添加了`$data`属性和`$props`属性,这两个属性分别代理的是_data和_props(其实就是用户传入的options中的data和props)。
并对当出现改变实例`data`属性时或`props`属性时提示错误警告'避免修改根实例的$data和$props是只读的',总之就是一
句话:'你他妈休想修改老子,你修改了老子就给你报个红,让你不爽'。

然后就是为原型添加`$set`、`$delete`、`$watch`函数属性,字面意思很好理解,就是设置、删除、观察,具体等用到了在讲

3、`eventsMixin(Vue)`这个函数是从`core/instance/events.js`中导出的,现在前往这个文件
```js
export function eventsMixin (Vue: Class<Component>) {
  const hookRE = /^hook:/
  /*
    作用:
          1、传入的事件名可以是数组
          2、为实例添加监听事件
          3、监听函数名存在hook:时,将_hasHookEvent设置为true,作用: 监听子组件的生命周期执行情况
  */
  Vue.prototype.$on = function (event: string | Array<string>, fn: Function): Component {...}
  /*
    作用:
          1、只执行一次该fn，在执行一次后$off掉在实例中的该函数
  */
  Vue.prototype.$once = function (event: string, fn: Function): Component {...}
  /*
    作用:
          1、当没传参数时清空该实例的所有监听事件
          2、对传空fn的事件名值设置为null
          3、删除与fn对应的在_events[event]集合中的函数
  */
  Vue.prototype.$off = function (event?: string | Array<string>, fn?: Function): Component {...}
  /*
      作用:
            1、对不规范的写法进行提示
            2、执行该监听函数对应的函数
  */
  Vue.prototype.$emit = function (event: string): Component {...}
}
```
可以看到主要就是为`Vue`原型添加$on、$once、$off、$emit这四个函数,用过`Vue`的应该知道这个几个函数时干什么用？

`$on`:为实例添加监听事件

`$once`:为实例添加一次性的监听事件

`$off`:清空摸个或所有的监听事件

`$emit`:触发某个监听事件

4、`lifecycleMixin(Vue)`这个函数是从`/core/instance/lifecycle.js`中导出的,现在前往这个文件
```js
export function lifecycleMixin (Vue: Class<Component>) {
  Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {...}
  /*
    作用: 重新渲染一次该实例
  */
  Vue.prototype.$forceUpdate = function () {...}
  /*
     作用:
          1、该实例正在销毁时,return
          2、执行销毁前的生命周期函数beforeDestroy
          3、设置_isBeingDestroyed属性为true,表示正在销毁中
          4、存在父组件&&父组件还未销毁时&&父组件不为抽象组件时，将该组件从父组件的子集合中移除
          5、解除该实例观察者对属性的观察
          6、清空该实例中的所有属性观察者
          7、实例序号-1
          8、设置_isDestroyed为true,表示已销毁
          9、调用当前渲染树上的销毁钩子、执行destroyed钩子函数、清空所有实例侦听器、
            设置节点的__vue__为null、清空组件节点的父级(释放循环引用)
  */
  Vue.prototype.$destroy = function () {...}
}
```
可以看到其实就是未原型添加了`_update`、`$forceUpdate`、`$destroy`这三个函数,同样这三个函数时用来干什么的呢?

`_update`: 将虚拟DOM渲染为真实DOM

`$forceUpdate`: 强制重新渲染(其实就是重新执行渲染函数)

`$destroy`: 销毁当前实例

5、`renderMixin(Vue)`这个函数是从`core/instance/render.js`中导出的,现在前往这个文件
```js
export function renderMixin (Vue: Class<Component>) {
  // install runtime convenience helpers
  installRenderHelpers(Vue.prototype)

  Vue.prototype.$nextTick = function (fn: Function) {
    return nextTick(fn, this)
  }

  Vue.prototype._render = function (): VNode {...}
}
```
可以看到为原型添加了$nextTick和_render函数,这2个函数干了什么呢？

`$nextTick`: 可以看到其调用的是nextTick函数,而这个函数的作用主要就是等所有的同步任务执行完以后再执行其传入的回调函数,
同时这个函数又可以使视图强制重新渲染一遍(具体等用到了在讲)

`_render`: 执行render函数生成虚拟节点

还有一个就是`installRenderHelpers`函数,这个函数传入了`vue`原型为参数,具体做了什么呢？
```js
export function installRenderHelpers (target: any) {
  target._o = markOnce
  target._n = toNumber
  target._s = toString
  target._l = renderList
  target._t = renderSlot
  target._q = looseEqual
  target._i = looseIndexOf
  target._m = renderStatic
  target._f = resolveFilter
  target._k = checkKeyCodes
  target._b = bindObjectProps
  target._v = createTextVNode
  target._e = createEmptyVNode
  target._u = resolveScopedSlots
  target._g = bindObjectListeners
}
```
可以看到为原型添加了很多方法,这些方法其实执行渲染函数的时候会去执行的,这里不做具体解释,等到编译阶段的时候在解释。

## 添加全局API

到这里就是`/core/instance/index.js`这个文件对`Vue做的所有事情`,那么前面几个文件还有事情没做完呢.所以我们继续追溯到`core/index`
这个文件,这个文件其实最主要的是为`Vue`构造函数添加全局API。
```js
//为Vue添加全局API
initGlobalAPI(Vue)
//为vue原型添加只读属性$isServer,判断是vue运行在客户端还是服务端
Object.defineProperty(Vue.prototype, '$isServer', {
  get: isServerRendering
})
//为vue原型添加只读属性$ssrContext,为服务端渲染专用
Object.defineProperty(Vue.prototype, '$ssrContext', {
  get () {
    /* istanbul ignore next */
    return this.$vnode && this.$vnode.ssrContext
  }
})
// expose FunctionalRenderContext for ssr runtime helper installation
//为vue构造函数添加属性FunctionalRenderContext,为服务端渲染准备的(ssr)
Object.defineProperty(Vue, 'FunctionalRenderContext', {
  value: FunctionalRenderContext
})
//vue版本号,rollup 的 replace 插件会把'__VERSION__'替换成版本号
Vue.version = '__VERSION__'
export default Vue
```
可以看到给`Vue`原型添加`$isServer`和`$ssrContext`属性值,为构造函数的`FunctionalRenderContext`
属性添加值,这个值是个函数主要是为了生成功能性组件函数用的,后面会讲到这个函数的。

接下来主要将`initGlobalAPI(Vue)`这个函数,这个函数是在`/core/global-api/index.js`这个文件中的。
首先来看这一段
```js
const configDef = {}
  configDef.get = () => config
  if (process.env.NODE_ENV !== 'production') {
    configDef.set = () => {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      )
    }
  }
  //为vue添加只读属性config
  Object.defineProperty(Vue, 'config', configDef)
```
可以看到这一段是为`Vue`构造函数添加config属性,并为这个属性添加了拦截器,只要更换config属性就会提示错误信息'不要替换老子,
可以改变老子中的某个属性'.

接下来是这一段:
```js
Vue.util = {
    warn,
    extend,
    mergeOptions,
    defineReactive
  }
```
这段代码是为构造函数添加工具函数:错误打印函数、对象属性合并或替换函数、合并options对象的函数、添加拦截器函数,具体都干了什么等用到了
在说。

在来看下一段:
```js
/*不被认为是公共API的一部分，要避免依赖他们，但是你依然可以使用，只不过风险你要自己控制*/
  Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick
  //设置options为原型为空的对象
  Vue.options = Object.create(null)
  //为options添加以上三个值为{}(原型为空的对象)的[属性+'s']
  ASSET_TYPES.forEach(type => {
    Vue.options[type + 's'] = Object.create(null)
  })
  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  Vue.options._base = Vue
  //混合builtInComponents对象中的属性到Vue.options.components中
  extend(Vue.options.components, builtInComponents)
```
可以看到为构造函数添加了`set`、`delete`、`nextTick`三个函数,这三个函数其实就是`$set`、`$delete`、`$nextTick`,但是这个构造函数上
的三个函数没有公开,因为存在风险，所以要避免使用它们。接着又为构造函数添加了`options`对象属性,并为这个对象设置了多个属性,并为
`Vue.options.components`对象添加了`keep-alive`组件
```js
export const ASSET_TYPES = [
  'component',
  'directive',
  'filter'
]
// 循环添加以及添加keep-alive组件过后
Vue.options = {
  components: {
      KeepAlive
  },//通用组件集合
  directives: {},//通过指令集合
  filters: {},//通用过滤器集合
  _base: Vue //储存vue构造函数
}
```
接下来是`initGlobalAPI`函数的最后一段代码:
```js
initUse(Vue)
initMixin(Vue)
initExtend(Vue)
initAssetRegisters(Vue)
```
具体来看看这四个函数都干了些什么？

1、`initUse(Vue)`: 这个函数在文件`/core/global-api/use.js`中,主要是用来为`Vue`添加`use`函数,添加插件用的
```js
Vue.use = function (plugin: Function | Object) {...}
```
2、`initMixin(Vue)`: 这个函数在文件`core/global-api/mixin.js`中,主要是为`vue`添加`mixin`函数用的。
```js
export function initMixin (Vue: GlobalAPI) {
  Vue.mixin = function (mixin: Object) {
    this.options = mergeOptions(this.options, mixin)
    return this
  }
}
```
3、`initExtend(Vue)`: 这个函数在文件`/core/global-api/extend.js`中,主要为`vue`构造函数添加`cid`属性和`extend`函数属性,
具体有什么用等用到了再讲。
```js
export function initExtend (Vue: GlobalAPI) {
  /**
   * Each instance constructor, including Vue, has a unique
   * 每个实例构造函数，包括Vue，都有唯一的
   * cid. This enables us to create wrapped "child
   * cid。这使我们能够创建包装的“子元素”
   * constructors" for prototypal inheritance and cache them.
   * 用于原型继承并缓存它们的构造函数。
   */
  //为vue添加cid静态属性
  Vue.cid = 0
  let cid = 1
  Vue.extend = function (extendOptions: Object): Function {...}
}
```
4、`initAssetRegisters`: 这个函数在文件`/core/global-api/extend.js`中,可以看到是循环`ASSET_TYPES`变量为`vue`添加静态方法,
主要为其添加`component`、`directive`、`filter`函数,作用其实就是注册自定义组件、自定义指令、自定义过滤器
```js
export function initAssetRegisters (Vue: GlobalAPI) {
  /**
   * Create asset registration methods.
   */
  //为vue添加静态方法component、directive、filter(分别用来全局注册组件，指令和过滤器)
  ASSET_TYPES.forEach(type => {
    Vue[type] = function (
      id: string,
      definition: Function | Object
    ): Function | Object | void {...}
  })
}
```

## Vue平台化

**以上是`core/index.js`文件所做的事情**,接下来在往上追溯就是`platforms/web/runtime/index.js`文件了,这里主要是对`vue`做了平台化的
包装,在不同的平台添加不同的东西。
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
可以看到上面是对`vue.config`的属性添加值,这些工具函数后面会用到。

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
上面这段代码对`vue`构造函数的options对象添加`KeepAlive, Transition, TransitionGroup`这三个组件;为`Vue.options.directives`中添加了两个
`model: inserted、componentUpdated;show:bind、update、unbind`指令,等用到了在讲;并且为其原型链添加了`$mount、__patch__`方法,
其中`$mount`调用的是`/core/instance/lifecycle.js`中的`mountComponent`函数,这个用到了再讲。当进行过上面这段代码的处理过后就变成了以下情况:
```js
Vue.options = {
    directives: {
        model: {
            inserted: function() {...}
            componentUpdated: function(){...}
        },
        show: {
            bind: function () {...},
            update: fuction () {...},
            unbind: function () {...}
        }
    },
    components: {
        Transition,
        TransitionGroup,
        KeepAlive
    },
    filters: {},
    _base: Vue
}
```
## 完整版的vue

**完整版的vue就是多了一个编译**
```js
//根据 id 获取元素的 innerHTML
const idToTemplate = cached(id => {
  const el = query(id)
  return el && el.innerHTML
})
const mount = Vue.prototype.$mount
//重新改写运行时的Vue原型的$mount方法
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  ...
  return mount.call(this, el, hydrating)
}
...
//为vue添加静态方法compile
Vue.compile = compileToFunctions
export default Vue
```
可以看到完整版主要做的事情就是添加编译板块,并且重写了`$mount`,当然这个函数最后输出的是运行时的`$mount`函数,具体这个重写的函数干了什么等
后面再讲。最后为`vue`添加了静态函数`compile`,该函数引用的是`platforms/web/compiler/index.js`中生成的`compileToFunctions`函数,这个
函数等将编译的时候在讲。

`到这里就讲完了完整版vue的所有初始化所做的事情,所有做的事情就是为vue构造函数或原型添加属性,为运行时或编译做准备,下面这段代码是上面的总结。`

```ecmascript 6
Vue = {
    options: {
        directives: {
            model: {
                inserted() {},
                componentUpdated(){}
            },
            show: {
                bind() {},
                update() {},
                unbind() {}
            }
        },
        components: {
            Transition,
            TransitionGroup,
            KeepAlive
        },
        filters: {},
        _base: Vue
    },
    compile() {},
    config: {
         mustUseProp(){},
         isReservedTag(){},
         isReservedAttr(){},
         getTagNamespace(){},
         isUnknownElement(){},
         optionMergeStrategies: {},
         silent: false,
         productionTip: process.env.NODE_ENV !== 'production',
         devtools: process.env.NODE_ENV !== 'production',
         performance: false,
         errorHandler: null,
         warnHandler: null,
         ignoredElements: [],
         keyCodes: {},
         parsePlatformTagName: _ => _,
         _lifecycleHooks: [
             'beforeCreate',
             'created',
             'beforeMount',
             'mounted',
             'beforeUpdate',
             'updated',
             'beforeDestroy',
             'destroyed',
             'activated',
             'deactivated',
             'errorCaptured'
         ]
    },
    FunctionalRenderContext,
    version,
    prototype: {
        $mount () {},
        __patch__(){},
        $isServer,
        $ssrContext, 
        _init(){},
        $data,
        $props,
        $set(){},
        $delete(){},
        $watch(){},
        $on(){},
        $once(){},
        $off(){},
        $emit(){},
        _update(){},
        $forceUpdate(){},
        $destroy(){},
        $nextTick(){},
        _render(){},
        _o(){},
        _n(){},
        _s(){},
        _l(){},
        _t(){},
        _q(){},
        _i(){},
        _m(){},
        _f(){},
        _k(){},
        _b(){},
        _v(){},
        _e(){},
        _u(){},
        _g(){},
    }, 
    util: {
        warn(){},
        extend(){},
        mergeOptions(){},
        defineReactive(){}
    },
    set(){},
    delete(){},
    nextTick(){},
    use(){},
    mixin(){},
    extend(){},
    cid,
    component(){},
    directive(){},
    filter(){}
}

```











