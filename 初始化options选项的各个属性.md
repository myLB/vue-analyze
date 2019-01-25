# 初始化options选项的各个属性

这个初始化主要在`initState`函数中完成的,所以现在去看看这个函数,在`core\instance\state.js`文件中。
```ecmascript 6
export function initState (vm: Component) {
  vm._watchers = [] //设置_watchers为[],作用:用来存放watcher实例的
  const opts = vm.$options //缓存$options(这个时候的$option中的某些属性已经格式化过了)
  if (opts.props/*当前组件的props*/) initProps(vm, opts.props) //父组件传的和子组件想要接收的数据对比,并初始化props
  if (opts.methods) initMethods(vm, opts.methods)//初始化组件的methods
  /*初始化data*/
  if (opts.data) { //存在data初始化组件的data
    initData(vm)
  } else {//没有就添加空对象
    observe(vm._data = {}, true /* asRootData */)
  }
  if (opts.computed) initComputed(vm, opts.computed) //初始化组件的Computed
  //初始化watch(判断vm.$options.watch存在并且不等于(Firefox浏览器中对象原型自带的watch))
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}
```
   - `_watchers`: 用于收集当前组件实例中的所有数据的订阅者
   
## initProps
```ecmascript 6
function initProps (vm: Component, propsOptions: Object) {
  const propsData = vm.$options.propsData || {} /*父组件传递的props*/
  const props = vm._props = {}
  // cache prop keys so that future props updates can iterate using Array
  // instead of dynamic object key enumeration.
  const keys = vm.$options._propKeys = []
  const isRoot = !vm.$parent //判断是否是根组件
  // root instance props should be converted
  if (!isRoot) {
    toggleObserving(false) //设置shouldObserve为false
  }
  /*propsOptions在这个时候已经全部转成固定的对象格式了*/
  for (const key in propsOptions) {}//循环子组件接收的想要的通信数据的key(子组件随意订的)
  /*将shouldObserve设置为true,这个值是个开关，表示是否要为值改为数据的订阅者属性*/
  toggleObserving(true)
}
```
   - `propsData`: 保存的就是父组件传递下来的数据,合并选项的时候处理过。
    
   - `_props`: 保存的`props`选项最后处理的结果,初始值为空对象
    
   - `_propKeys`: 保存的`props`选项的所有属性名,初始值为空数组

当前组件实例为根组件时,关闭创建数据的观察者的开关。然后是循环当前组件实例`$options`选项中的`props`对象,这个对象是已经合并以及规范化过了的。
```ecmascript 6
for (const key in propsOptions) { //循环子组件接收的想要的通信数据的key(子组件随意订的)
    keys.push(key)
    //处理父子组件需要通信的值进行验证处理和默认值处理并输出
    const value = validateProp(key, propsOptions, propsData, vm)
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      //将key解析成kebab-case写法
      const hyphenatedKey = hyphenate(key)
      //与vue保留变量名冲突的键名给予提示
      //是否有与style,class的键名
      if (isReservedAttribute(hyphenatedKey) ||
          config.isReservedAttr(hyphenatedKey)) {
        warn(
          `"${hyphenatedKey}" is a reserved attribute and cannot be used as component prop.`,
          vm
        )
      }
      //为props的key属性添加拦截器，改变key值时在非生产环境提示警告
      /*
       提示: 这个报错只出现在修改props中key的值时才会出现,但是如果值是对象或者数组时，当
            你改变的是数组中的某项或这个对象的key值时则不会报这个警告，同时值在父子组件中会同时改变,
            因为对象和数组的引用特性
      */
      defineReactive(props, key, value, () => {
        if (vm.$parent && !isUpdatingChildComponent) {
          warn(
            `Avoid mutating a prop directly since the value will be ` +
            `overwritten whenever the parent component re-renders. ` +
            `Instead, use a data or computed property based on the prop's ` +
            `value. Prop being mutated: "${key}"`,
            vm
          )
        }
      })
    } else {
      defineReactive(props, key, value)
    }
    // static props are already proxied on the component's prototype
    // during Vue.extend(). We only need to proxy props defined at
    // instantiation here.
    /*如果key值不在实例上则在实例上为_props添加拦截器并把key添加到_props*/
    if (!(key in vm)) {
      proxy(vm, `_props`, key)
    }
  }
```
首先将属性名放入了`keys`数组变量(也就是`_propKeys`),接下来就是处理属性值了,看到是执行了`validateProp`函数,其参数分别为属性名、
`props`对象、父组件传递下来的数据(`propsData`)、该组件实例本身。那么去看下`validateProp`函数在文件`core\util\props.js`中:

```ecmascript 6
export function validateProp (
  key: string,//子组件props中的key
  propOptions: Object,//子组件的props
  propsData: Object,//父组件传下来的props
  vm?: Component
){
  const prop = propOptions[key] //子组件的prop
  const absent = !hasOwn(propsData, key) //子组件想要的prop父组件是否有传递
  let value = propsData[key] //父组件传递的prop的值
  // boolean casting
  //判断子组件的prop.type是否存在Boolean类型
  const booleanIndex = getTypeIndex(Boolean, prop.type)
  /*当prop.type存在Boolean类型时(这个时候type为数组[Boolean,String])*/
  if (booleanIndex > -1) {
    /*子组件想要的prop父组件没有传递并且子组件的prop没有设置默认值*/
    if (absent && !hasOwn(prop, 'default')) {
      value = false //设置默认值为false
    } else if (value === '' || value === hyphenate(key)) {
      /*父组件传递的prop的值为空或这个值与(将key为驼峰写法时解析成-写法)相同时*/
      //prop设置的默认值和key相同时
      // only cast empty string / same name to boolean if
      // boolean has higher priority
      //判断子组件的prop是否是String类型
      const stringIndex = getTypeIndex(String, prop.type)
      /*不符合String类型或者prop.type中的Boolean类型下标小于String类型时*/
      if (stringIndex < 0 || booleanIndex < stringIndex) {
        value = true
      }
      //总结：(父组件传递的prop的值为空||这个值与key相同时) && type数组为[Boolean,String,...]时
      //默认值设置为true
    }
  }
  // check default value
  //父组件传递的prop的值为undefined并且prop.type不存在Boolean类型
  if (value === undefined) {
    //输出各种情况时的默认值
    value = getPropDefaultValue(vm, prop, key)
    // since the default value is a fresh copy,
    // make sure to observe it.
    const prevShouldObserve = shouldObserve //false
    toggleObserving(true) //设置shouldObserve为true
    observe(value) //为工厂模式函数返回的值生成一个Observer实例，实现响应式
    toggleObserving(prevShouldObserve) //设置shouldObserve为false
  }
  //不为生产环境 && (只要不是weex或者不为对象或者@binding不在父组件传递的prop的值)
  if (
    process.env.NODE_ENV !== 'production' &&
    // skip validation for weex recycle-list child component props
    !(__WEEX__ && isObject(value) && ('@binding' in value))
  ) {
    assertProp(prop, key, value, vm, absent)
  }
  return value
}
```
缓存规范化过的`props`属性值为`prop`变量,忘了的往前翻翻就知道了。判断子组件想要的数据父组件是否有传递,也就是`props`的属性名是否存在于
`propsData`对象中。接着是获取`propsData`对象中的该属性值为`value`变量，然后是执行`getTypeIndex`函数,参数为`Boolean`类型和子组件想要的
这个属性指定的类型,最后将值赋值给`booleanIndex`变量,在这里就不多讲这个函数了,直接将作用吧。

   - `booleanIndex`: 这个函数字面意思很好理解,就是确定是否指定了`Boolean`类型以及获取`Boolean`类型在该属性指定类型中的下标,其作用
                     也确实是这个.存在返回下标,不存在范回`-1`

不存在指定`Boolean`类型,跳过;存在,进入语句块后又出现了2种情况:
    
   1、父组件没有传递这个属性值&&`prop`变量(也就是子组件想要的属性值)没有设置默认值: 设置`value`变量为`false`,也就是设置最后的传递的值
      为`false`                    

   2、`value`变量为空字符串(传递了值但是个空字符串) || `value`变量全等于转化为`kebab-case`写法的属性名: 不存在指定`String`类型或者
      存在指定`String`类型但是指定`Boolean`类型在前,设置`value`变量为`true`。例子: 
      
```ecmascript 6
propsData = {
    str: ''
}
props: {
    str: {
        type: [Boolean,String]
    }
}
// 处理后
str = true
```        
然后是对`value`变量为`undefined`的处理,那怎么才会出现这个情况呢?根据上面的处理可以分析出以下情况会出现`value`变量为`undefined`:

   1、指定类型中没有`Boolean`类型&&父组件没有传递子组件需要的属性值
   
   2、指定类型中有`Boolean`类型&&父组件传递了(不为空字符串 && 不为转化为`kebab-case`写法的属性名)的值         

   3、指定类型中有`Boolean`类型 && 父组件没有传递值 && 子组件设置了默认值 

   4、指定类型为`[String,Boolean]`类型 && 父组件传递了(空字符串 || 转化为`kebab-case`写法的属性名)

当`value`变量为`undefined`时,会做一下几步:

   1、执行`getPropDefaultValue`函数,作用: 获取子组件设置的默认值,不存在返回`undefined`;存在则返回默认值.如果默认值为对象或数组时,
                                          需要提示用户对象或数组必须使用函数的形式输出。  

   2、缓存原先的创建数据的观察者开关情况,开启创建数据的观察者的开关 

   3、当值为对象或数组时以深遍历的方式对对象和数组分别处理(这个后面也会具体讲):
        
       数组: 添加值为数据的观察者的不可枚举属性`__ob__`,循环数组对值为数组或对象的项进行分别处理
        
       对象: 添加值为数据的观察者的不可枚举属性`__ob__`,循环对象,为属性重写描述符(也就是添加拦截器),当值为对象或数组时进行分别处理

   4、将创建数据的观察者开关还原成原先的情况 

`validateProp`函数最后一段代码是在生产环境对`prop`值的验证: 

   - 子组件的单个`prop`中设置了`required`属性,表示父组件必须传值,但父组件又没传值时,提示警告信息'缺少必需的`prop`',并结束函数
   
   - 最后处理完的`value`值为`undefined` && `prop`没有设置`required`属性,结束函数
   
   - 处理完的`value`值与指定的值类型不符时,提示错误信息'`prop`类型检测失败,与所需不符'

   - 子组件的单个`prop`中设置了`validator`属性,表示自定义验证函数,当自定义函数对传递的值验证不符时(也就是函数没有返回值或返回了`false`)
     时提示警告信息'自定义验证器检查`prop`失败'


`validateProp`函数总结: 对父组件未传值或传了值以及子组件设置了默认值和未设置默认值进行处理,然后对处理的值进行指定类型验证或自定义函数验证,对不符合类型的值
提示不同的警告信息,最后把处理完的`value`值输出.

继续回到`initProps`函数中来,这个时候已经获取处理完的`prop`值了并缓存为变量`value`.然后在生产环境和非生产环境下都为实例的`_props`对象中的
属性重写了描述符(相当于添加了拦截器),但在非生产环境下会对`props`属性名进行检测,如果与`key`,`ref`,`slot`,`slot-scope`,`is`,
`style`,`class`的键名冲突时提示警告信息'属性名是保留属性,不能用作子组件接收`prop`'.当修改`_props`的属性值时提示'避免修改`_props`
属性数据,当父组件重新渲染时,修改的值又将被覆盖'。最后是将`_props`的属性添加到实例上,并为实例的该属性添加重写描述符,当读取实例的该属性
值时,相当于读取`_props`的该属性值。在这里有一个细节没讲,就是为重写描述符,其执行了一个`defineReactive`函数,这个函数会在下一章节细讲。

## initMethods

```ecmascript 6
function initMethods (vm: Component, methods: Object) {
  const props = vm.$options.props //获取参数的props
  for (const key in methods) {
    if (process.env.NODE_ENV !== 'production') {
      if (methods[key] == null) {
        warn(
          `Method "${key}" has an undefined value in the component definition. ` +
          `Did you reference the function correctly?`,
          vm
        )
      }
      //方法名与props的key名字冲突
      if (props && hasOwn(props, key)) {
        warn(
          `Method "${key}" has already been defined as a prop.`,
          vm
        )
      }
      //方法名存在实例中&&方法名的第一个字符是$或者_时报警告
      if ((key in vm) && isReserved(key)) {
        warn(
          `Method "${key}" conflicts with an existing Vue instance method. ` +
          `Avoid defining component methods that start with _ or $.`
        )
      }
    }
    /*参数中的方法是否为空？
        空: 新的方法  不为空: 返回this指向实例的methods[key]
      并且将属性添加到实例上
    */
    vm[key] = methods[key] == null ? noop : bind(methods[key], vm)
  }
}
```
该函数的作用主要就是将`methods`中的函数添加到实例上以及检验属性名是否冲突.可以看到首先是获取了`$options`中的`props`属性,然后是循环
`options`选项中的`methods`对象的属性名。在非生产环境下,属性值未定义时,会提示警告信息'未定义该方法的值';属性名与`props`中的属性名冲突,
提示警告信息'该属性已被定义为一个`prop`了';属性名已存在于实例中 && 属性名第一个字符是`$`或者`_`时,提示警告信息'属性名与现有的`Vue`
实例方法冲突'.最后将属性名也就是方法添加到实例上,设置没有值的为空函数,这个主要起兼容作用。

## initData

在这一步会进行两种操作,一种是`data`属性不存在,设置实例中的`_data`属性为空对象,然后为其添加数据的观察者属性`__ob__`和数据的订阅者收集器`dep`;
第二种是`data`属性存在,对`data`数据进行处理,但最后都会为其添加数据的观察者属性`__ob__`和数据的订阅者收集器`dep`。只不过第一种是保证一定有这个属性.

```ecmascript 6
function initData (vm: Component) {
  //取出参数中的data
  let data = vm.$options.data
  /*
    为什么还要判断data是否为函数,这个在格式化option的时候data不是一个函数吗？
      原因是: beforeCreate在initData调用之前,所以是可以在beforeCreate方法中修改了vm.$options.data,
        而$options又是对参数option的引用
  */
  data = vm._data = typeof data === 'function'
    ? getData(data, vm) //缓存函数的返回值
    : data || {}
  //data不为对象时报错警告
  if (!isPlainObject(data)) {
    data = {}
    process.env.NODE_ENV !== 'production' && warn(
      'data functions should return an object:\n' +
      'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
      vm
    )
  }
  // proxy data on instance
  const keys = Object.keys(data) //获取参数data的key
  const props = vm.$options.props //获取参数data的props
  const methods = vm.$options.methods //获取参数data的的methods
  let i = keys.length
  while (i--) {
    const key = keys[i]
    if (process.env.NODE_ENV !== 'production') {
      /*data中的属性名与方法名冲突报错警告*/
      if (methods && hasOwn(methods, key)) {
        warn(
          `Method "${key}" has already been defined as a data property.`,
          vm
        )
      }
    }
    /*data中的属性名与props中的属性冲突报错警告*/
    if (props && hasOwn(props, key)) {
      process.env.NODE_ENV !== 'production' && warn(
        `The data property "${key}" is already declared as a prop. ` +
        `Use prop default value instead.`,
        vm
      )
    } else if (!isReserved(key)) {
      //属性名的第一个字符不是$或者_时为实例添加key属性并添加拦截器
      //(读取实例上的key属性值其实是读取_data对象中的key属性值),这就是proxy()的作用
      proxy(vm, `_data`, key)
    }
  }
  // observe data
  /*为data添加observe实例以便响应式*/
  observe(data, true /* asRootData */)
}
```
首先是获取了选项中的`data`属性,这个属性里面基本就包括了被观察的数据,简单一点就是这里面的数据变了,视图就跟着变化了。然后是设置了实例的
`_data`属性为`data`的值或函数值,这个属性我们知道在`Vue`可以是两种形式,一种是函数一种是其他。

   1、函数: 执行`getData`函数,并把函数和实例当做参数传入.这个`getData`函数主要作用就是为了调用数据`getter`时禁用`dep`收集数据的订阅者实
            例也就是执行了`pushTarget`函数(比如: `data`函数中用到了`props`或`inject`中的属性),以及当处理过的`data`函数执行过程
            中报错时返回空对象进行兼容并将错误提示出来,最后是将禁用还原也就是执行了`popTarget`,并将函数值输出。这两个莫名其妙的函数
            等下一章节会统一讲,这里只讲其作用。

   2、对象或其他: 直接赋值,如果值为null或0则赋值为空对象 

当获取的值不为对象时,设置值为空对象进行兼容,并在非生产环境下提示错误信息'`data`数据不是对象'。接下来就是循环`data`对象中的属性名,对
属性名进行验证是否与`methods`对象中的属性名冲突,冲突提示'方法名已经被定义为一个`data`属性';与`props`对象中的属性名冲突时提示警告信
息'该属性已被定义为`prop`';与`props`对象中的属性名不冲突&&属性名的第一个字符不是`$`或`_`时,将属性名添加到实例上,但值获取的是`_data`
中的属性值。最后是为`data`添加数据的观察者属性`__ob__`和数据的订阅者收集器`dep`,也就是执行了`observe`函数,这个下一章节会讲。

## initComputed

```ecmascript 6
function initComputed (vm: Component, computed: Object) {
  // $flow-disable-line
  //创建一个原型为空的空对象
  const watchers = vm._computedWatchers = Object.create(null)
  // computed properties are just getters during SSR
  const isSSR = isServerRendering() //判断是不是服务端渲染

  for (const key in computed) {
    const userDef = computed[key]
    //获取get方法
    const getter = typeof userDef === 'function' ? userDef : userDef.get
    //getter为空提示警告
    if (process.env.NODE_ENV !== 'production' && getter == null) {
      warn(
        `Getter is missing for computed property "${key}".`,
        vm
      )
    }

    if (!isSSR) {
      // create internal watcher for the computed property.
      //生成Watcher实例
      watchers[key] = new Watcher(
        vm,
        getter || noop,//参数computed中key的get方法或空方法
        noop, //空方法
        computedWatcherOptions //参数确认是计算属性
      )
    }

    // component-defined computed properties are already defined on the
    // component prototype. We only need to define computed properties defined
    // at instantiation here.
    /*没有定义在实例上,添加描述符(拦截器)并提示警告错误情况*/
    if (!(key in vm)) {
      defineComputed(vm, key, userDef)
    } else if (process.env.NODE_ENV !== 'production') {
      /*提示与props和data中的key值冲突的警告*/
      if (key in vm.$data) {
        warn(`The computed property "${key}" is already defined in data.`, vm)
      } else if (vm.$options.props && key in vm.$options.props) {
        warn(`The computed property "${key}" is already defined as a prop.`, vm)
      }
    }
  }
}
```
首先是为实例设置了`_computedWatchers`属性为原型为空的空对象,这个属性是用来收集计算属性的<font color=red size=3 face="黑体">观察
者实例</font>的,具体等将下一章节在讲。接下来是确定运行环境是否为服务端,然后是循环处理过的`computed`对象中的属性: 缓存单个属性值为
`userDef`变量,当属性值为函数时将自身赋值给`getter`变量,否则获取属性值对象中的`get`函数赋值给`getter`,所以`API`中计算属性可以有
`2`种写法.当`getter`变量值为空时,提示警告信息'计算属性缺少`Getter`',要不是未定义属性值要不就是格式写法不对。接着就是在非服务端环境
下为这个计算属性生成一个<font color=red size=3 face="黑体">数据的订阅者</font>,并将这个属性放入上面提到过的`_computedWatchers`对
象中,属性值就是这个<font color=red size=3 face="黑体">数据的订阅者</font>,这个<font color=red size=3 face="黑体">数据的订阅者</font>
等下一章节在讲。最后是判断该计算属性是否已经被定义到实例上了,我们先来说如果已经定义在实例上时,那就说明与`data`或`props`中的属性名冲突了,
那就要提示相应的警告信息'计算属性已经在`data`中定义了'和'计算属性已经定义为一个`prop`',如果没有则执行`defineComputed`函数,参数为
实例、计算属性、计算属性值。

```ecmascript 6
export function defineComputed (
  target: any,
  key: string,
  userDef: Object | Function
) {
  const shouldCache = !isServerRendering()//判断是否是服务端渲染
  /*key的值是function*/
  if (typeof userDef === 'function') {
    /*
      服务端: 创建一个新的get方法，只不过输出的默认值还是参数get方法的默认值
      不是服务端: 参数get方法
    */
    sharedPropertyDefinition.get = shouldCache
      ? createComputedGetter(key)
      : userDef
    sharedPropertyDefinition.set = noop //空方法
  } else {
    /*和key的值是function的时候的处理一样*/
    sharedPropertyDefinition.get = userDef.get
      ? shouldCache && userDef.cache !== false //(cache将被弃用 作用:计算属性的缓存验证)
        ? createComputedGetter(key)
        : userDef.get
      : noop
    /*设置了就取key的get，没有就是赋值一个空方法*/
    sharedPropertyDefinition.set = userDef.set
      ? userDef.set
      : noop
  }
  /*如果不为生产环境没有设置key的set方法,那么在改变key的值时将报警告*/
  if (process.env.NODE_ENV !== 'production' &&
      sharedPropertyDefinition.set === noop) {
    sharedPropertyDefinition.set = function () {
      warn(
        `Computed property "${key}" was assigned to but it has no setter.`,
        this
      )
    }
  }
  /*为key添加拦截器*/
  Object.defineProperty(target, key, sharedPropertyDefinition)
}
```
其首先确定了环境是否为服务端,前面提到的计算属性值有两种格式,所以这里对应的也有两种处理方式:

   1、函数: 为计算属性时重写了描述符(`get`函数和`set`函数),在非服务端环境下,当读取该属性值时执行的是`createComputedGetter`函数,
            这个函数等下讲;在服务端环境下直接执行计算属性函数.设置`set`函数为空函数,为了兼容。

   2、对象: 可以看到其实和值为函数一样,只不过在设置`get`函数是多了一个`cache`属性判断,这里暂不考虑这个属性将被弃用了。
   
最后当没有设置计算属性的`set`函数时,提示警告信息'没有定义`set`函数',接着就是将计算属性添加到实例上。那么现在来讲讲这个
`createComputedGetter`函数:
```ecmascript 6
function createComputedGetter (key) {
  return function computedGetter () {
    //判断是否在_computedWatchers中定义过并获取该计算属性watcher实例
    const watcher = this._computedWatchers && this._computedWatchers[key]
    //存在该计算属性watcher实例
    if (watcher) {
      watcher.depend() //将这个watcher实例添加进subs中
      return watcher.evaluate() //执行computed[key]方法,并将watcher实例放入队列中
    }
  }
}
```
其返回了一个`computedGetter`函数,那么也就是等读取计算属性的时候才会执行,所以等下一章节在讲。


## initWatch

```ecmascript 6
function initWatch (vm: Component, watch: Object) {
  for (const key in watch) {
    const handler = watch[key]
    //数组形式的key值
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i])
      }
    } else {
      createWatcher(vm, key, handler)
    }
  }
}
```
循环选项中`watch`对象的属性,缓存属性值为`handler`变量,然后判断属性值是否为数组,不为数组时执行`createWatcher`函数,参数是实例、属性、
属性值;为数组时,循环属性值执行`createWatcher`函数。从这里就可以看出,当我们监听某一个属性值时,当值改变时可以执行多个回调函数。现在去
看下`createWatcher`函数。

```ecmascript 6
function createWatcher (
  vm: Component,
  expOrFn: string | Function,//watch的key可以是函数
  handler: any,
  options?: Object
) {
  //判断key值是否是对象形式的
  if (isPlainObject(handler)) {
    options = handler //key对应的值
    handler = handler.handler //值改变后要执行的方法
  }
  //判断key值是否是字符串形式的
  if (typeof handler === 'string') {
    handler = vm[handler] //将实例中的方法赋值给key
  }
  return vm.$watch(expOrFn, handler, options)
}
```
看函数名就知道是创建数据的订阅者用的.首先是当属性值或数组的项值为对象时,缓存属性值为`option`变量,值改变时的监听函数为`handler`变量;如果属性
值或数组的选项为字符串时,表示其引用的是实例上的方法,将其赋值给`handler`变量。最后输出的是实例的`$watch`函数,参数是属性名、监听函数、
属性值,说明`$watch`也是用来创建数据的订阅者并且将这个`api`暴露了出来.在`createWatcher`函数中可以看到,其属性名可以是一个函数,具体在这
里没怎么体现出来,那么去`$watch`函数中看看,这个函数已经在初始化构造函数的时候添加的。

```ecmascript 6
Vue.prototype.$watch = function (
    expOrFn: string | Function,//watch的key可以是函数
    cb: any,
    options?: Object
  ){
    const vm: Component = this
    //这个是给用this.$watch直接设置准备的并且cb为对象(包含handler方法的对象)
    if (isPlainObject(cb)) {
      return createWatcher(vm, expOrFn, cb, options)
    }
    options = options || {}
    options.user = true
    //生成一个Watcher实例
    /*
      如果expOrFn是一个函数比如
        this.$watch(function () {
          return this.k
        }, () => {console.log(333)}, {
          immediate: true
        })
      这个时候创建实例的时候回执行这个watcher实例的get(),读取了this.k,这个时候Dep.target是这个watcher
      实例,那么就把这个watcher实例添加到了私有的Dep中,当this.k改变时会执行所有(Dep中subs数组中)watcher
      实例的update(),将这些watcher实例放入数据的订阅者队列中
    */
    const watcher = new Watcher(vm, expOrFn, cb, options)
    /*立即执行这个函数*/
    if (options.immediate) {
      cb.call(vm, watcher.value)
    }
    /*返回一个在_watchers中删除自身watcher实例的方法*/
    return function unwatchFn () {
      watcher.teardown()
    }
  }
```
可以看到这个就是`Vue`暴露出来的创建数据的订阅者`api`,其三个参数分别为: 想要监听的数据(可以是个函数)、监听的数据变化的要执行回调函数、
额外的一些选项(比如文档上的`deep`、`immediate`).当设置的回调函数是一个对象时,结束该函数去执行`createWatcher`函数,确保监听函数和额
外的选项分开成两个参数,最后又回到了`$watch`函数.接下来可以看到其为额外的选项对象添加了一个`user`属性,这个表示是手动生成的数据的订阅者。
然后就是创建了数据的订阅者,参数是: 实例、监听的数据、回调函数、额外的一些选项。将生成的数据的订阅者赋值给`watcher`变量,接着是判断额外选
项中是否存在`immediate`属性,发现当其存在并且值为`true`时,会立即执行回调函数,那么这个属性就很好理解,就是在初始化的立即执行回调函数用
的。最后`$watch`函数是返回了一个`unwatchFn`函数,其内部只是执行了数据的订阅者的`teardown`函数,也不知道是干什么的,那么也等下一章节在讲。


## 总结
这一章节主要讲了初始化`options`选项中的`props`、`data`、`methods`、`watch`,以及在初始化中提到的数据的订阅者、数据的观察者还有数据的订阅者收集器,
在这一章节中都只是粗略的提了下,具体会在下一章讲解并举例说明。













