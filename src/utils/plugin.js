
// 作为vue的插件
// 作用：注册全局组件  注册原函数  注册自定义指令  注册过滤器
// 封装一个相对时间函数
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
dayjs.extend(relativeTime)
// 获取相对时间 Vue.filter('过滤器名称'，处理函数（value）{})
// value 是使用过滤器 管道符 前的js表达式执行结果
const relTime = (time) => {
  // moment 插件  dayjs 插件  都是处理时间格式
  // dayjs 轻量一些
  // 需要依赖一个dadjs的插件RelativeTime
  // dayjs() 获取当前时间
  // .form(time) 获取相对时间
  // 语言本地化 local
  return dayjs().locale('zh-cn').from(time)
}
// 延时
const sleep = () => {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      resolve()
    }, 1000)
  })
}
export default {
  install (Vue) {
    // 原型挂载
    Vue.prototype.$sleep = sleep
    // 过滤器挂载
    Vue.filter('relTime', relTime)
  }
}
