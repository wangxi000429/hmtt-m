// 导出  文章相关的API函数
import request from '@/utils/request'

/**
 * 获取文章列表
 * @param {Integer} channelId - 频道ID
 * @param {Integer} timestamp - 时间戳
 */
export const getArticles = (channelId, timestamp) => {
  return request('/app/v1_1/articles', 'get', {
    channel_id: channelId,
    timestamp,
    with_top: 1
  })
}

/**
 * 对文章不感兴趣
 * @param {String} articleId
 */
export const disLikes = (articleId) => {
  return request('app/v1_0/article/dislikes', 'post', {
    target: articleId
  })
}

/**
 * 举报文章
 * @param {String} articleId -文章ID
 * @param {Integer} type - 举报类型
 */
export const report = (articleId, type) => {
  return request('app/v1_0/article/reports', 'post', {
    target: articleId,
    type
  })
}
