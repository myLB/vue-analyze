var warnings = {
    1: {
        label: '组件名不合格',
        warn: 'Invalid component name: 组件名. Component names can only contain alphanumeric characters and the hyphen, and must start with a letter.',
        mean: '无效的组件名称:组件名。组件名称只能包含字母数字字符和连字符，并且必须以字母开头。'
    },
    2: {
        label: '组件名与slot,component字段或者与html标签和svg标签名冲突',
        warn: 'Do not use built-in or reserved HTML elements as component id: 组件名',
        mean: '不要使用内置的或保留HTML元素为组件id: 组件名'
    },
    3: {
        label: '用户传入的数组形式的props属性中有不是字符串类型的值',
        warn: 'props must be strings when using array syntax.',
        mean: 'props使用数组语法时，数组各项必须是字符串'
    },
    4: {
        label: '用户传入props属性中不是数组或对象',
        warn: 'Invalid value for option "props": expected an Array or an Object, but got ‘props类型’.',
        mean: '选项“props”的值无效:期望得到一个数组或对象，但得到其他类型'
    },
    5: {
        label: '用户传入inject属性中不是数组或对象',
        warn: 'Invalid value for option "inject": expected an Array or an Object, but got ‘inject类型’.',
        mean: '选项“inject”的值无效:期望得到一个数组或对象，但得到其他类型'
    },
    6: {
        label: '在非生产环境下没有使用new 操作符创建实例,但是传入的参数中有el 选项或者 propsData 选项',
        warn: 'option "propsData或el" can only be used during instance creation with the `new` keyword.',
        mean: 'el 选项或者 propsData 选项只能在使用 new 操作符创建实例的时候可用'
    },
    7: {
        label: 'data属性不是一个工厂函数',
        warn: 'The "data" option should be a function that returns a per-instance value in component definitions.',
        mean: '“data”选项应该是一个在组件定义中返回每个实例值的函数。'
    },
    8: {
        label: 'watch属性不是一个对象',
        warn: 'Invalid value for option "watch": expected an Object, but got \'watch选项类型\'',
        mean: '选项“watch”的值无效:期望一个对象，但得到了其他类型'
    },
    9: {
        label: '修改了config.keyCodes对象中stop,prevent,self,ctrl,shift,alt,meta,exact中的某一个属性的键码',
        warn: 'Avoid overwriting built-in modifier in config.keyCodes: .${key}',
        mean: '避免覆盖config.keyCodes中的内置修饰符的键码'
    },
    10: {
        label: '属性或方法没有在实例上定义',
        warn: 'Property or method "${key}" is not defined on the instance but referenced during render. Make sure that this property is reactive,  either in the data option, or for class-based components, by initializing the property.',
        mean: '属性或方法“${key}”不是在实例上定义的，而是在呈现过程中引用的。通过初始化该属性，确保该属性是反应性的，无论是在data选项中，还是在基于类的组件中。'
    },
    11: {
        label: '没有在父组件中定义事件对应的函数',
        warn: 'Invalid handler for event "${event.name}": got undefined',
        mean: '事件event.name的无效处理程序: 获得undefined'
    },
    12: {
        label: '修改了$attrs对象中的属性',
        warn: '$attrs is readonly',
        mean: '$attrs是只读属性'
    },
    13: {
        label: '修改了$listeners对象中的属性',
        warn: '$listeners is readonly',
        mean: '$listeners是只读属性'
    },
    14: {
        label: 'Injection对象中"${key}"没有设置默认值 || 在祖先组件中没有找到对应的属性以及值',
        warn: 'Injection "${key}" not found',
        mean: '没有找到注入“${key}”'
    },
    15: {
        label: '修改了injection对象中属性的值,因为当提供该值组件刷新时,值又还原了',
        warn: 'Avoid mutating an injected value directly since the changes will be overwritten whenever the provided component re-renders. injection being mutated: "${key}"',
        mean: '避免直接改变注入的值，因为当提供的组件重新呈现时，更改将被覆盖。"${key}"注入被突变'
    },
    16: {
        label: 'prop的默认值为对象或数组时没有以函数的形式输出',
        warn: 'Invalid default value for prop ${key} Props with type Object/Array must use a factory function to return the default value.',
        mean: '类型为Object/Array的prop ${key}道具的默认值无效，必须使用工厂函数返回默认值。'
    },
    17: {
        label: 'props最后处理的属性值与期望的不符',
        warn: 'Invalid prop: type check failed for prop "${name}". Expected 类型, got 类型 ',
        mean: 'prop 无效: prop检验失败。期望${type}类型, 实际${type}类型'
    },
    18: {
        label: 'props最后处理的属性值不符合自定义验证函数,函数无值返回或返回了false',
        warn: 'Invalid prop: custom validator check failed for prop ${name}',
        mean: 'prop 无效: 自定义验证器检查`prop`失败'
    },
    19: {
        label: 'props中的属性名与',
        warn: '${key} is a reserved attribute and cannot be used as component prop.',
        mean: '${key}是一个保留属性,不能用作组件prop。'
    },
    20: {
        label: '修改了实例中_props的属性值',
        warn: 'Avoid mutating a prop directly since the value will be overwritten whenever the parent component re-renders. Instead, use a data or computed property based on the prop\'s value. Prop being mutated: ${key}',
        mean: '避免直接修改道具，因为当父组件重新呈现时，该值将被覆盖。相反，使用基于道具价值的数据或计算属性。道具是突变: ${key}'
    },
    21: {
        label: 'methods中的方法值为null或undefined,也就是未定义',
        warn: 'Method "${key}" has an undefined value in the component definition. Did you reference the function correctly?',
        mean: '方法“${key}”在组件定义中有一个未定义的值。你正确地引用了函数吗?'
    },
    22: {
        label: 'methods中的属性名与props中的属性名冲突了',
        warn: 'Method "${key}" has already been defined as a prop.',
        mean: '方法“${key}”已经被定义为一个prop。'
    },
    23: {
        label: 'methods中的属性名与实例中的属性名冲突了',
        warn: 'Method "${key}" conflicts with an existing Vue instance method.  Avoid defining component methods that start with _ or $.',
        mean: '方法“${key}”与现有的Vue实例方法冲突。避免定义以_或$开头的组件方法。'
    },
    24: {
        label: 'data函数返回的不是对象',
        warn: 'data functions should return an object: https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
        mean: '数据函数应该返回一个对象'
    },
    25: {
        label: '计算属性的值未定义或者格式写法不正确',
        warn: 'Getter is missing for computed property "${key}".',
        mean: '计算属性“${key}”缺少Getter。'
    },
    26: {
        label: '计算属性与data中的属性冲突',
        warn: 'The computed property "${key}" is already defined in data.',
        mean: '计算属性“${key}”已经在data中定义。'
    },
    27: {
        label: '计算属性与props中的属性冲突',
        warn: 'The computed property "${key}" is already defined as a prop.',
        mean: '计算属性“${key}”已经定义为一个prop。'
    },
    28: {
        label: '计算属性的set函数没有定义',
        warn: 'Computed property "${key}" was assigned to but it has no setter.',
        mean: '已分配计算属性“${key}”，但它没有setter。'
    },
    29: {
        label: 'watch的属性值写法不对(比如arr.)',
        warn: 'Failed watching path: "${expOrFn}"  Watcher only accepts simple dot-delimited paths. For full control, use a function instead.',
        mean: '失败的监视路径:“${expOrFn}”监视程序只接受简单的点分隔路径。对于完全控制，使用函数代替。'
    },
    30: {
        label: 'watch的某个属性的回调函数报错',
        warn: 'callback for watcher "${this.expression}"',
        mean: '观察者“${this.expression}”的回调'
    },
}