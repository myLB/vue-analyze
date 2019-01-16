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
    }
}