#创建一个vue实例
上一章节已经讲vue的所有初始都讲了一遍,下面就来讲下当创建一个vue实例的时候,vue都干了些什么.下面来看一个例子

```js
new Vue({
    data: {
        el: '#app',
        num: 2
    }
})
```
当创建这个实例时,就会去执行其`_init`函数,那么现在就来看下其都做了什么？现在看下面这句代码:

```js
const vm: Component = this
    // a uid
vm._uid = uid++ //为每个实例添加个标记
let startTag, endTag
/* istanbul ignore if  主要在不是生产环境下为相应的视点做标记*/
if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
  startTag = `vue-perf-start:${vm._uid}`
  endTag = `vue-perf-end:${vm._uid}`
  mark(startTag)//mark方法用于为相应的视点做标记
}
// 中间代码省略...
if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
  ...
  mark(endTag)//初始化结束
  measure(`vue ${vm._name} init`, startTag, endTag)//对这两个标记点进行性能计算
}
```
可以看到首先为实例添加一个`_uid`属性,以我的理解这个就是为这个实例添加一个标识符,因为会有很多个实例,通过这个标识符更容易区分.
下面可以看到在非生产环境 && 当开启性能追踪的开关(`performance`)时,就可以追踪一下4个场景的性能:

    1、组件初始化(component init)
    2、编译(compile)，将模板(template)编译成渲染函数
    3、渲染(render)，其实就是渲染函数的性能，或者说渲染函数执行且生成虚拟DOM(vnode)的性能
    4、打补丁(patch)，将虚拟DOM渲染为真实DOM的性能
通过`mark`函数对代码的起始和结束分别打上2个标记,然后通过`measure`函数对2个标记进行性能计算。这个可以自己去试一下,在全局配置中将
`Vue.config.performance`设置为`true`就行了.我觉得其实就是`chrome`的`performance`工具.

```js
// a flag to avoid this being observed
vm._isVue = true;
```
后面就是这句代码,可以看到这段代码有段注释,这段注释的意思就是**`一个避免被观察到的标志`**.什么意思呢,其实就是避免实例被观测,具体等讲到
`obsever`的时候就知道了

## 合并选项

接下来继续看下面的代码,下面这段代码主要讲的就是合并`options`参数的.
```js
if (options && options._isComponent) {
  // optimize internal component instantiation //优化内部组件实例化
  // since dynamic options merging is pretty slow, and none of the //因为动态选项合并非常慢，而且没有一个
  // internal component options needs special treatment. //内部组件选项需要特殊处理。
  initInternalComponent(vm, options)//为当前组件实例的$option赋值
} else {
  //合并默认的一些option,并且格式化option中的一些属性，使其符合要求，并对不合理的警告提示，
  // 比如规范化props、规范化Inject、规范化Directives等等
  vm.$options = mergeOptions(
    resolveConstructorOptions(vm.constructor),
    options || {},
    vm
  )
}
```
可以看到这里产生了不同的情况,一种是`options`参数传入了&&`_isComponent`属性为`true`时做的处理,另一种就是没有或为false做的处理。
首先来讲下第一种,看到这个你会发现不对啊,我在官方文档中没看到这个属性啊,难道是内部的属性？确实是一个内部的属性,这个是创建组件的时候
会生成的,这里不在多讲,等用到的时候在讲。

###选项的来源

那么现在主要讲第二种情况,可以看到它是执行了`mergeOptions`函数,其参数分别是:`resolveConstructorOptions(vm.constructor)`和创建
实例时传入的参数`options`,最后将该函数返回的值赋值给实例的`$options`属性。首先来看下第一个参数:
```js
export function resolveConstructorOptions (Ctor: Class<Component>) {
  // 获取构造函数的options参数
  let options = Ctor.options
  // 当前构造函数有继承函数时
  if (Ctor.super) {...}
  // 将options输出
  return options
}
```
第一个参数是个函数并且传入的参数是实例的构造函数,按这个例子来讲的话这个构造函数就是`Vue`函数。那么可以看到上面这个函数首先获取的是
`Vue`函数的`options`属性,这个在上一章节中已经把所有的初始值都列出来了,所以在这里就不多讲了,可以往全翻翻就知道了。现在往下看,然后
是判断Vue函数的`super`属性是否存在,存在则执行判断里面的代码,没有则直接将获取到的`options`属性输出,作为`mergeOptions`函数的第一
个参数。诶,这个`super`属性我记得初始化的时候没有啊,哪里来的？这里可以提前说一下,这个是在调用`Vue.extend`函数的时候会生成的,具体
用到的时候在讲,在这个例子中是没有`super`属性的,所以最后的结果就是输出`Vue`函数的`options`属性.接下来就可以看`mergeOptions`这个
函数都干了些什么,这个函数来源于`/core/util/options.js`这个文件.

###检查组件名称是否符合要求

```js
if (process.env.NODE_ENV !== 'production') {
    checkComponents(child)//检验组件名和标签并给予相应冲突的警告
}
```
这个是`mergeOptions`函数的第一段代码,可以看到在非生产环境下执行了`checkComponents`函数,并把`mergeOptions`函数的第二个参数作为
参数传入其中,那么来看`checkComponents`函数:
```js
function checkComponents (options: Object) {
  for (const key in options.components) {
    validateComponentName(key) //解析组件名，防止出现不合理或与原html标签冲突
  }
}
```
可以看到其主要做的事情就是循环参数(创建实例的时候传入的参数)的components属性,也就是子组件名,然后依次执行`validateComponentName`
函数并把子组件名作为参数传入,那么现在来看`validateComponentName`函数:
```js
export function validateComponentName (name: string) {
  if (!/^[a-zA-Z][\w-]*$/.test(name)) {
    warn(
      'Invalid component name: "' + name + '". Component names ' +
      'can only contain alphanumeric characters and the hyphen, ' +
      'and must start with a letter.'
    )
  }
  /*与slot,component字段名冲突*/  /*与html标签和svg标签名冲突*/
  if (isBuiltInTag(name) || config.isReservedTag(name)) {
    warn(
      'Do not use built-in or reserved HTML elements as component ' +
      'id: ' + name
    )
  }
}
```
可以看到这个函数的作用就是检测组件名是否合格并且是否与`slot`、`component`、`html`标签和`svg`标签名冲突.那么`checkComponents`函数
就是检测所有的子组件名是否符合要求的。

###选项可以是构造函数

现在在回到`mergeOptions`函数中来,接下来看其后面的代码:
```js
if (typeof child === 'function') {
    child = child.options
}
```
这段代码是为了其他地方做的兼容,在Vue源码中这个函数会在多个地方用到,现在可以提一笔就是`mergeOptions`函数第二个参数可以是构造函数,
不管是`vue.extend`生成的还是`Vue`函数都是带有options属性的,在现在这个例子中可以忽略。

###规范化props

那么现在继续往下看: 
```js
normalizeProps(child, vm) //规范化props
```
执行了`normalizeProps`这个函数并传入了2个参数:`mergeOptions`函数的第二个参数(在这个例子中就是用户传入的options)、当前`Vue`实例.
找到这个函数,这个函数也在`/core/util/options.js`文件中。
```js
function normalizeProps (options: Object, vm: ?Component) {
  const props = options.props //获取参数中的props
  if (!props) return
  const res = {}
  let i, val, name
  //props是数组转换成object格式
  if (Array.isArray(props)) {
    i = props.length
    while (i--) {
      val = props[i]
      if (typeof val === 'string') {
        name = camelize(val)//把-改成驼峰写法
        res[name] = { type: null }
      } else if (process.env.NODE_ENV !== 'production') {
        //props使用数组语法时，数组各项必须是字符串
        warn('props must be strings when using array syntax.')
      }
    }
  } else if (isPlainObject(props)) {
    //props是对象类型
    for (const key in props) {
      val = props[key]
      name = camelize(key) //把-改成驼峰写法
      res[name] = isPlainObject(val)
        ? val
        : { type: val }
    }
    /*格式化成标准的props格式*/
  } else if (process.env.NODE_ENV !== 'production') {
    warn(
      `Invalid value for option "props": expected an Array or an Object, ` +
      `but got ${toRawType(props)}.`,
      vm
    )
  }
  options.props = res
}
```
可以看到第一段代码获取的是传入参数的`props`属性,在我们的例子中并没有,那就直接结束了该函数。不过不要紧,我们可以把平时的组件拿来当例子嘛!
初始化了一个res对象,然后看到上面的代码对`props`属性的两种形式分别作了处理: 数组形式和对象形式。那么分别来讲下:

<font color=red size=3 face="黑体">看到的工具函数我就不说了,自己去`shared/util.js`文件中去找,我只说这个工具函数时干什么用的</font>

    1、数组形式: 首先循环该数组,判断数组各项值是否为字符串
           是: 将数组各项值的驼峰写法改成 kebab-case (短横线分隔命名)写法,并作为res对象的属性,值为{ type: null }:
               表示没有类型限制,父组件可以传任何类型的值,没有要求。
           否: 提示错误信息'使用数组语法时，数组各项必须是字符串'

    2、对象形式: 













