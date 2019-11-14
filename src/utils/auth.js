// 权限认证    token是令牌  设置一个Key 'hmtt-m-user'
// 提供  获取token  设置token  删除token
const USER_KEY = 'hmtt-m-user'
// 获取token
export const getUser = () => {
  return JSON.parse(window.localStorage.getItem(USER_KEY) || '{}')
}
// 修改token
export const setUser = (user) => {
  window.localStorage.setItem(USER_KEY, JSON.stringify(user))
}
export const delUser = () => {
  window.localStorage.removeItem(USER_KEY)
}
// 删除token
