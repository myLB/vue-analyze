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
    }
}