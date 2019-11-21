// 导出 频道相关的API函数
import request from '@/utils/request'
import store from '@/store'
// 存储都用这个key(令牌) 对应值是json字符串 是数组类型 []
const CHANNEL_KEY = 'hmtt-m-channel-key'

/**
 * 获取我的频道信息（如果没登录，获取的是后台设置的默认频道列表）
 * 注意 本地存储，返回数据格式，和后端保存一致。
 */
export const getMyChannels = () => {
  // 该函数的返回值必须是promise 使用的时候用了await
  // 三种情况
  // 1.登录状态 直接调用接口 返回数据即可
  // 2.未登录状态
  // 2.1本地未存储频道数据(获取默认频道数据 存储到本地 返回数据)
  // 2.2本地已存储频道数据 (获取本地频道数据即可)
  return new Promise(async (resolve, reject) => {
    const { user } = store.state
    if (user.token) {
      // 已登录
      // 必须遵循相同的默认结构  data = {channels: [我的频道]}
      const data = await request('/app/v1_0/user/channels', 'get') // 拿到的是我的频道 传了token
      // resolve 返回数据
      resolve(data)
    } else {
      // 未登录
      const str = window.localStorage.getItem(CHANNEL_KEY) || '[]'
      const localChannels = JSON.parse(str)
      // 本地未存储
      if (!localChannels.length) {
        // 获取数据
        const data = await request('/app/v1_0/user/channels', 'get') // 拿到的是默认频道  没传token
        // 存储数据
        window.localStorage.setItem(CHANNEL_KEY, JSON.stringify(data.channels))
        // 返回数据
        resolve(data)
      } else {
        // 本地已存储  必须返回和data 一样的格式
        resolve({ channels: localChannels })
      }
    }
  })
}

/**
 * 获取全部频道
 */
export const getAllChannels = () => {
  return request('app/v1_0/channels', 'get')
}

/**
 * 删除频道
 * @param {Integer} channelId --频道id
 */
export const delChannel = (channelId) => {
  // 判断是否登录
  // 登录  调用接口进行删除
  // 未登录  删除本地存储的频道中id对应的那一项
  return new Promise(async (resolve, reject) => {
    try {
      const { user } = store.state
      if (user.token) {
      // 登录
        await request(`app/v1_0/user/channels/${channelId}`, 'delete')
        resolve()
      } else {
      // 未登录
        const str = window.localStorage.getItem(CHANNEL_KEY)
        const localChannels = JSON.parse(str) // 数组类型的频道数据
        const index = localChannels.findIndex(item => item.id === channelId)
        localChannels.splice(index, 1)
        window.localStorage.setItem(CHANNEL_KEY, JSON.stringify(localChannels))
        resolve()
      }
    } catch (e) {
      reject(e)
    }
  })
}

/**
 * 添加频道
 * @param {Array} orderChannels - 排序好的频道数组
 */
export const addChannel = (orderChannels) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { user } = store.state
      if (user.token) {
      // 后台添加
        await request(`app/v1_0/user/channels`, 'put', {
          channels: orderChannels
        })
        resolve()
      } else {
      // 本地添加
        const str = window.localStorage.getItem(CHANNEL_KEY)
        const localChannels = JSON.parse(str) // 数组类型的频道数据
        const { id, name } = orderChannels(localChannels - 1)
        localChannels.push({ id, name })
        window.localStorage.setItem(CHANNEL_KEY, JSON.stringify(localChannels))
        resolve()
      }
    } catch (e) {
      reject(e)
    }
  })
}
