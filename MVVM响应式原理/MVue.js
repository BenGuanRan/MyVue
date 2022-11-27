import Compile from './Compile.js'

// MVue实例
class MVue {
    constructor(options) {
        this.$el = options.el
        this.$data = options.data
        this.$options = options
        if (this.$el) {
            // 1. 实现一个数据观察者

            // 2. 实现一个模板解析器
            new Compile(this.$el, this)
        }
    }
}
export default MVue