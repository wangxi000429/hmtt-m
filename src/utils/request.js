// 提供一个配置好的axios请求的函数（调用接口）
import axios from 'axios'
// 处理最大安全数值
import JSONBINGINT from 'json-bigint'
import store from '@/store'
// 引出一个router实例
import router from '@/router'

// 创建一个新的axios实例  instance  发请求用
const instance = axios.create({
  // 配置
  // 基准值
  baseURL: 'http://ttapi.research.itcast.cn/',
  // 转换响应数据格式
  transformResponse: [(data) => {
    // data 是原始数据格式
    try {
      return JSONBINGINT.parse(data)
    } catch (e) {
      return data
    }
  }]
})
// 请求拦截器  追加token到请求头
instance.interceptors.request.use(config => {
  // 拦截成功
  // 获取token (vuex中的state中user中token)
  if (store.state.user.token) {
    // 追加token
    config.headers.Authorization = `Bearer ${store.state.user.token}`
  }
  return config
}, err => Promise.reject(err))

// 响应拦截器  1. 获取有效数据  2. 延长token的有效期
instance.interceptors.response.use(res => {
  // 原始的res是什么格式就返回什么格式
  // 剥离无效数据  有效数据 res.data.data
  // 注意：有时候并不叫data  有些时候连响应主体（res.data）都没有
  try {
    return res.data.data
  } catch (e) {
    return res
  }
}, async err => {
  // 如果请求失败了 走这个函数
  // 1.判断是否是401状态码
  // 2.如果是401 判断是否登录
  // 2.1如果没登录 拦截到登录页面（登录完需要回跳）
  // 2.2 如果已经登录 就是token失效了 ---> 发刷新token的请求
  // 3.发刷新token的请求
  // 3.1 刷新成功 --->更新vuex和本地的token
  // 3.2 把之前失败的请求继续发出去
  // 3.3 刷新失败 拦截到登录页面（登录完需要回跳)
  if (err.response && err.response.status === 401) {
    // 跳转登录的地址 使用router获取当前访问的路由地址
    // （vue组件里用 this.$route.path）
    const loginConfig = {
      path: '/login',
      query: {
        redirectUrl: router.currentRoute.path
      }
    }
    // 用户信息
    const user = store.state.user
    // 判断 如果没登录 （严谨代码）
    if (!user || !user.token || !user.refresh_token) {
      return router.push(loginConfig)
    }
    // 已经登录了  token失效
    try {
      // 发刷新token的请求
      // 注意不是使用instance instance已经拥有了一些配置 刷新请求不用这些配置
      const { data: { data } } = await axios({
        url: 'http://ttapi.research.itcast.cn/app/v1_0/authorizations',
        method: 'put',
        headers: {
          // 合并refresh_token
          Authorization: `Bearer ${user.refresh_token}`
        }
      })
      // res是响应对象  res.data.data.token 返回的token
      // 更新vuex和本地token  使用mutations中的setUser
      store.commit('setUser', {
        token: data.token,
        refresh_token: user.refresh_token
      })
      // err函数中 返回一个promise（axios请求）执行当前的promise
      // 继续发送之前失败的请求 instance（{之前失败的请求配置}）
      // 请求失败的请求配置参数 err.config
      return instance(err.config)
    } catch (e) {
      // 刷新token失败
      store.commit('delUser')
      return router.push(loginConfig)
    }
  }
  return Promise.reject(err)
})
/**
 * 调用接口函数 需要返回值 返回值是一个Promise对象
 * url 接口地址
 * method 请求方式
 * data 对象(参数)
 */
// 调用接口（接口地址， 请求方式，传参）
export default (url, method, data) => {
  // params 选项是 get传参
  // data 选项是 其他请求方式的传参
  return instance({
    url,
    method,
    // js表达式运行的结果必须是字符串（params|data）
    // 严谨处理  get Get GET 都认为是get
    [method.toLowerCase() === 'get' ? 'params' : 'data']: data
  })
}
