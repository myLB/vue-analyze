# 创建一个vue实例
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

### 选项的来源

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

### 检查组件名称是否符合要求

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

### 选项可以是构造函数

现在在回到`mergeOptions`函数中来,接下来看其后面的代码:
```js
if (typeof child === 'function') {
    child = child.options
}
```
这段代码是为了其他地方做的兼容,在Vue源码中这个函数会在多个地方用到,现在可以提一笔就是`mergeOptions`函数第二个参数可以是构造函数,
不管是`vue.extend`生成的还是`Vue`函数都是带有`options`属性的,在现在这个例子中可以忽略。

### 规范化props

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
初始化了一个`res`对象,然后看到上面的代码对`props`属性的两种形式分别作了处理: 数组形式和对象形式。那么分别来讲下:

<font color=red size=3 face="黑体">看到的工具函数我就不说了,自己去`shared/util.js`文件中去找,我只说这个工具函数时干什么用的</font>

    1、数组形式: 首先循环该数组,判断数组各项值是否为字符串
           是: 将数组各项值的驼峰写法改成 kebab-case (短横线分隔命名)写法,并作为res对象的属性,值为{ type: null }:
               表示没有类型限制,父组件可以传任何类型的值,没有要求。
           否: 提示错误信息'使用数组语法时，数组各项必须是字符串'

    2、对象形式: 循环该对象属性名,获取该属性值,将属性名的驼峰写法改成 kebab-case (短横线分隔命名)写法并作为res对象的属性,
                然后判断属性值是否为纯对象类型[object Object]:
                     是: 直接作为res[属性名]的值
                     否: res[属性名] = {type: 属性值}
                                         
为对象形式的举个例子:
```js
props: {
    count: Number
}
//规范化后...
props: {
    count: {
        type: Number
    }
}
```
上面就是对两种形式的处理,如果两者都不符合,那么就会进入最后了情况(前提在非生产环境下),该情况只做一件事,就是打印警告信息'选项`props`的值无效:
期望得到一个数组或对象，但得到其他类型'。最后就是将处理完后的`res`对象赋值给传入参数的`props`属性。到这里就将`props`规范化了。

### 规范化Inject

上面已经规范化了`props`,那么继续往下看:
```js
normalizeInject(child, vm) //规范化Inject
```                   
执行了`normalizeInject`这个函数并传入了2个参数,这两个参数和`normalizeProps`传入的参数一样,这里就不讲了。直接去看代码:
```js
function normalizeInject (options: Object, vm: ?Component) {
  const inject = options.inject //缓存参数中的inject属性
  if (!inject) return
  const normalized = options.inject = {} //清空参数中的inject属性
  //inject属性为数组类型
  if (Array.isArray(inject)) {
    for (let i = 0; i < inject.length; i++) {
      normalized[inject[i]] = { from: inject[i] }
    }
    /*将inject转换成标准的格式 val: {
      from: 'val'  //匹配父组件中的provide的key名
    }*/
  } else if (isPlainObject(inject)) {
    //inject为对象格式，遍历对象
    for (const key in inject) {
      const val = inject[key] //获取key值
      //判断key值是否为对象,是对象则将标准格式与值合并，否则转换成标准格式
      normalized[key] = isPlainObject(val)
        ? extend({ from: key }, val)
        : { from: val }
    }
  } else if (process.env.NODE_ENV !== 'production') {
    warn(
      `Invalid value for option "inject": expected an Array or an Object, ` +
      `but got ${toRawType(inject)}.`,
      vm
    )
  }
}
```
同样在这个例子中也没有`inject`属性,当然这个属性也比较不常见,好像很少用到,在这里就说一下它的用途:
     
     它是和当前组件的祖先组件实例的provide属性配合着用的,provide属性里面的值用于传递给子孙组件的,而inject属性就是接收器,
     里面定义子孙组件需要的数据,当然这个接手值只能读取不能修改,修改了就会打印警告信息。

那么作用也知道了,现在就来具体看下这个函数做了什么？首先第一段代码就是缓存`inject`属性,然后将该属性值重置为一个空对象,接着又
是处理2种形式的情况:
  
     1、数组形式: 循环数组,把数组各项的值作为normalized对象的属性,设置属性值为{from: 数组项的值},其实就是处理成对象格式
     2、对象形式: 循环对象的key,把key名作为normalized对象的key名,然后判断对象的属性值是否为对象:
                            是: 将属性值和{ from: 属性名 }合并
                            否: 将normalized[key]设置为{ from: 属性值 }

其实和规范`props`差不多,只不过这个在属性值为对象的情况下是合并而不是直接替换,最后`from`的意思是表示来源的意思,这个后面也会讲到。

### 规范化Directives

上面已经规范化了`inject`属性和`props`属性,那么继续往下看还要规范化什么:
```js
normalizeDirectives(child) //规范化Directives
```
可以看到函数名已经说了就是规范化`Directives`,直接看代码:
```js
function normalizeDirectives (options: Object) {
  const dirs = options.directives //缓存options.directives的值
  if (dirs) {
    //遍历对象
    for (const key in dirs) {
      const def = dirs[key] //获取options.directives对象的key值
      //值的类型为function类型
      if (typeof def === 'function') {
        //重新赋值key值为其添加属性值都为def方法的bind、update属性
        dirs[key] = { bind: def, update: def }
      }
    }
  }
}
```
可以看到第一段代码获取的是参数的`directives`属性,看到这里就知道`vue`是可以设置全局指令和局部指令,一个是所有组件都可以用的,
一个是只能当前组件用的。不废话继续往下看,同样是对存在`directives`属性值时做的处理,循环`directives`中的属性名并缓存属性值,
当属性值为函数时,将属性值替换为`{bind: 属性值, update: 属性值}`,也就是将属性值规范成对象形式的。

### 处理extends

```js
const extendsFrom = child.extends //缓存extends属性为extendsFrom
if (extendsFrom) {
//重新赋值parent为一个原parent和extendsFrom合并的全新对象
parent = mergeOptions(parent, extendsFrom, vm)
}
```
可以看到首先获取的是`mergeOptions`函数第二个参数的`extends`属性缓存为`extendsFrom`,这个参数主要是用于扩展组件用的(可以是一个
选项对象或者构造函数,这里主要是选项对象)。当`extendsFrom`存在值时,同样执行`mergeOptions`函数这样就形成了递归,所以我们就先叫它
`extendsMergeOptions`函数,这个函数的两个参数是:`mergeOptions`函数的第一个参数`parent`和`extendsFrom`变量.那么也就是说
`extendsFrom`变量会将上面的步骤重新走一遍,后面的等讲完`mergeOptions`函数在举个例子就明了了。现在继续往下看:

### 处理mixins

```js
if (child.mixins) {
    for (let i = 0, l = child.mixins.length; i < l; i++) {
      parent = mergeOptions(parent, child.mixins[i], vm)
    }
  }
```
其实这个和extends其实相差不多,都是用于扩展的,可以看到`mixins`属性是个数组,它是循环执行`mergeOptions`函数,我们就叫它`mixinsMergeOptions`
函数,其第一个参数还是`mergeOptions`函数的第一个参数`parent`,第二个是`mixins`数组各项值。同样`mixins`数组各项值又走了遍上面的步骤,
也是等讲完`mergeOptions`函数来举个完整的例子。现在继续往下看:

### 对合并选项进行最后的处理
```js
const options = {}
let key
for (key in parent) {
    // 不管前面mixins || extends是否存在最后都会被option中的属性覆盖
    mergeField(key)
}
for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key)
    }
}
function mergeField (key) {
    const strat = strats[key] || defaultStrat
    options[key] = strat(parent[key], child[key], vm, key)
}
return options
```
这是`mergeOptions`函数最后一段代码,可以看到首先是初始化了`options`变量为空对象,然后循环`parent`参数的属性名缓存为`key`变量,在这里再次提一笔,
在这个例子中,`parent`参数就是`Vue`函数的`options`属性.循环执行了`mergeField`函数,参数`key`为`key`变量,那么`mergeField`函数做了什么呢？

其首先是初始化了`strat`变量,其值为判断参数`key`是否在`strats`对象中?存在则缓存`strats[key]`,不存在则默认是`defaultStrat`变量。在这个
`mergeOptions`函数中好像没这两个变量啊,那么就往函数外找吧,发现这两个变量也在`/core/util/options.js`这个文件中,但是先把这个两个变量放一放,
先把`mergeField`函数执行下去,可以看到最后是把参数`key`当做`options`变量的属性名,值先不管,不过可以知道其是执行的`strat`函数,参数是
`parent[参数key]`、`child[参数key]`、`Vue`实例、参数`key`.

那么前面提到的循环`parent`参数的属性名,也就是说是把所有属性名(包括原型链中的)都拿到了`options`变量中来。在来看后面的是循环`child`参数的属性名,同样是缓存为
`key`变量,然后是判断的该`key`变量是否存在于`parent`参数对象本身？
        
        存在: 不做任何事情
        不存在(也就是存在于原型链中或没有这个属性): 执行mergeField函数,那也就是说替换了options中已存在参数`key`的属性名。
        
总结这段代码的意思就是: 将`parent`参数拿到了`options`变量中,然后将`child`参数中不存在于`parent`参数对象本身的属性名拿出来放入`options`对象中,
所以有可能是将`options`对象中的属性名替换了,也可能是增加了属性,但替换了的属性值不会变,总的来说就是合并`parent`参数和`child`参数,最后输出一个合并过的
对象。举个例子:
```js
 function cs () {
    this.data = {
        count: 2
    }
 };
 cs.prototype = {
    watch: {}
 };
 parent = new cs();
 child = {
    methods: {},
    watch: {}
}
// 处理过后...
options = {
    data: {count: 2},
    watch: {},
    methods: {}
}
```
        
### 对extends和mixins举例子
```ecmascript 6
// 属性值我就不写了
let mixins = {
    data: {},
    mounted () {},
    created () {}
}
let exten = {
    data: {},
    watch:{},
    created () {}
};
new Vue({
    mixins: [mixins],
    extends: exten,
    data: {},
    methods:{}
})
Vue.options ={
  directives: {},
  components: {},
  filters: {},
  _base: Vue
}
// extends处理过后
parent = {
    directives,
    components,
    filters,
    _base,
    data,
    watch,
    created
}
// mixins处理过后
parent = {
    directives,
    components,
    filters,
    _base,
    data,
    watch,
    created,
    mounted
}
// 最后处理成
options = {
    directives,
    components,
    filters,
    _base,
    data,
    watch,
    created,
    mounted,
    methods
}
```
对于属性值的处理会在下一章节讲,这一节就讲这么多,不过可以提前讲下属性值问题,不管前面`parent`、`mixins`还是`extends`是否存在最后都会
被`options`中的属性覆盖,优先级一定是`child > mixins > extends > parent`.



















































