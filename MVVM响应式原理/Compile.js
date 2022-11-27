// 模板编译类
class Compile {
    compileUtil = {
        getValue(expr, vm) {
            console.log(expr);
            return expr.split('.').reduce((prev, curre) => {
                return prev[curre]
            }, vm.$data)
        },
        text(node, expr, vm) {
            const value = this.getValue(expr, vm)
            this.updater.textUpdater(node, value)
        },
        html(node, expr, vm) {
            const value = this.getValue(expr, vm)
            this.updater.htmlUpdater(node, value)
        },
        model(node, expr, vm) {

        },
        on(node, expr, vm, eventName) {
            let fn = vm.$options.methods && vm.$options.methods[expr]
            node.addEventListener(eventName, fn)
        },
        updater: {
            textUpdater(node, value) {
                node.textContent = value
            },
            htmlUpdater(node, value) {
                node.innerHTML = value
            },
        }
    }
    constructor(el, vm) {
        this.el = this.isElementNode(el) ? el : document.querySelector(el)
        this.vm = vm
        // 1. 获取文档碎片，插入页面，减少回流重绘
        const fragment = this.node2Fragment(this.el)
        // 2. 编译模板，也就是解析fragment文档碎片
        this.compile(fragment)
        // 3. 将文档碎片加入到根元素中
        this.el.appendChild(fragment)
    }
    isElementNode(node) {
        return node.nodeType === 1
    }
    node2Fragment(el) {
        // 创建文档碎片
        const f = document.createDocumentFragment()
        let firstChild = null
        while (firstChild = el.firstChild) {
            f.append(firstChild)
        }
        return f
    }
    // 判断当前属性是否是Vue指令
    isDirective(name) {
        // 以v-开头的字符串认为是Vue指令
        return name.startsWith('v-')
    }
    // 编译文档碎片
    compile(fragment) {
        const childNodes = [...fragment.childNodes]
        childNodes.forEach(child => {
            // 分析文档碎片的孩子节点
            if (this.isElementNode(child)) {
                // 若是HTML标签
                // 编译元素节点
                this.compileElement(child)
            } else {
                // 若是文本节点
                // 编译文本节点
                this.compileText(child)
            }
            // 若孩子节点依然有子节点，则递归编译孙子节点
            if (child.childNodes && child.childNodes.length) {
                this.compile(child)
            }
        })
    }
    // 编译HTML标签元素
    compileElement(node) {
        // 获取节点上的属性
        const attributes = [...node.attributes]
        attributes.forEach(attr => {
            const { name, value } = attr
            if (this.isDirective(name)) {
                // name是一个指令
                const [, directive] = name.split('-')
                const [dirName, eventName] = directive.split(':')
                this.compileUtil[dirName](node, value, this.vm, eventName)
                // 编译指令后删除该属性
                node.removeAttribute("v-" + directive)
            }
        })
    }
    // 编译文本节点
    compileText(node) {
        const content = node.textContent
        if (/\{\{(.+?)\}\}/.test(content)) {
            content.replace(/\{\{(.+?)\}\}/, (val) => {
                this.compileUtil['text'](node.parentNode, val.slice(2, val.length - 2), this.vm)
            })

        }
    }
}

export default Compile