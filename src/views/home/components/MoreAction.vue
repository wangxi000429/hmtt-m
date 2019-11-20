<template>
  <!-- 弹出框 默认隐藏 -->
  <!-- 当值改变时 会触发input -->
  <!-- $event 是(原生时间是时间对象 自定义事件是触发时间传递数据) -->
  <!-- 本来是v-model绑定组件内部数据show 最终show给了父组件 -->
  <!-- 父组件传入进入show数据 v-model='showMoreAction' 名字叫value -->
  <!-- 给组件绑定了@input 事件 MoreAction  接受子组件值改变-->
  <!-- 子组件值改变 关闭对话框van-popup 的值改变 @input='把当前改变的值传递给父组件' -->
  <!-- this.$emit('input',$event) 当van-popup的值改变 把值传递给MoreAction-->
  <van-popup :value='value' @input="$emit('input',$event)" @open="isReport=false">
    <van-cell-group v-if="!isReport">
      <van-cell @click="disLikes()">不感兴趣</van-cell>
      <van-cell is-link @click="isReport=true" >反馈垃圾内容</van-cell>
      <van-cell>拉黑作者</van-cell>
    </van-cell-group>
    <van-cell-group v-else>
      <van-cell icon="arrow-left" @click="isReport=false">返回</van-cell>
      <van-cell @click="report(item.value)" v-for="item in reports" :key="item.value">{{item.label}}</van-cell>

    </van-cell-group>
  </van-popup>
</template>

<script>
import { disLikes, report } from '@/api/article'
import { reports } from '@/api/constants'
export default {
  // v-modle 默认传的值是value
  // props: ['value'],
  // 校验格式
  props: {
    // 控制对话框显示隐藏
    value: {
      type: Boolean,
      default: false
    },
    // 当前文章ID
    articleId: {
      type: String,
      default: null
    }

  },
  data () {
    return {
      // 默认状态是没有点击举报
      isReport: false,
      // 举报类型
      reports
    }
  },
  methods: {
    // 不感兴趣
    async disLikes () {
      try {
        // 需要当前文章ID  父传子(把父组件点击的文章ID传入)
        await disLikes(this.articleId)
        // 不喜欢 成功
        // 1。隐藏对话框
        this.$emit('input', false)
        // 2.删除对应的文章（从当前频道下的文章列表）
        // 2.1 通知父组件删除对应的文章
        this.$emit('on-dislikes')
        // 3.提示成功
        this.$toast.success('不感兴趣成功')
      } catch (e) {
        // 提示失败
        this.$toast.fail('不感兴趣失败')
      }
    },
    // 举报
    async report (type) {
      try {
        await report(this.articleId, type)
        // 成功提示
        this.$toast.success('举报成功')
        // 隐藏对话框
        this.$emit('input', false)
        // 删除对应的文章
        this.$emit('on-report')
      } catch (e) {
        // 提示失败
        if (e.response && e.response.status === 409) {
          return this.$toast.fail('重复举报')
        }
        this.$toast.fail('举报失败')
      }
    }
  }
}
</script>

<style  scoped lang='less'>
.van-popup {
  width: 80%;
  border-radius: 4px;
}
</style>
