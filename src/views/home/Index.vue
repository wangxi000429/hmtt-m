<template>
  <div class="container">
    <!-- swipeable 模拟手指 -->
    <!-- tab组件，默认是懒加载，会导致操作dom问题，需要关闭自己主动来加载 -->
    <van-tabs
    @change="changeChannel"
    swipeable v-model="activeIndex"
    :lazy-render="false">
      <van-tab :key="channel.id" v-for="channel in myChannels" :title="channel.name">
        <!-- 滚动容器 -->
        <div class="scroll-wrapper"
        ref="scrollWrapper"
         @scroll="remember($event)">
          <!-- 实现下拉刷新 -->
          <van-pull-refresh
            v-model="activeChannel.downLoading"
            @refresh="onRefresh"
            :success-text="refreshSuccessText"
          >
            <!-- 实现上拉加载 -->
            <van-list
              v-model="activeChannel.upLoading"
              :finished="activeChannel.finished"
              finished-text="没有更多了"
              @load="onLoad"
            >
              <!-- 文章列表 -->
              <van-cell v-for="item in activeChannel.articles" :key="item.art_id.toString()">
                <div class="article_item">
                  <h3 class="van-ellipsis">{{item.title}}</h3>
                  <div class="img_box" v-if="item.cover.type===3">
                    <van-image lazy-load class="w33" fit="cover" :src="item.cover.images[0]" />
                    <van-image lazy-load class="w33" fit="cover" :src="item.cover.images[1]" />
                    <van-image lazy-load class="w33" fit="cover" :src="item.cover.images[2]" />
                  </div>
                  <div class="img_box" v-if="item.cover.type===1">
                    <van-image lazy-load class="w100" fit="cover" :src="item.cover.images[0]" />
                  </div>
                  <div class="info_box">
                    <span>{{item.aut_name}}</span>
                    <span>{{item.comm_count}}评论</span>
                    <span>{{item.pubdate|relTime}}</span>
                    <span class="close" @click.stop="openMoreAction(item.art_id.toString())" v-if="user.token">
                      <van-icon name="cross"></van-icon>
                    </span>
                  </div>
                </div>
              </van-cell>
            </van-list>
          </van-pull-refresh>
        </div>
      </van-tab>
    </van-tabs>
    <!-- 频道按钮 -->
    <span class="bar_btn" @click="openChannelEdit" slot="nav-right">
      <van-icon name="wap-nav"></van-icon>
    </span>
    <!-- 使用组件 更多操作 -->
    <more-action v-model="showMoreAction" :articleId='articleId' @on-dislikes='removeArticle()'
    @on-report='removeArticle()'
    ></more-action>

    <!-- 使用组件 频道编辑 -->
    <channel-edit @on-delete='changeChannel()' v-model="showChannelEdit" :myChannels='myChannels' :activeIndex.sync='activeIndex'

    ></channel-edit>
  </div>
</template>

<script>
import { getMyChannels } from '@/api/channel'
import { getArticles } from '@/api/article'
import { mapState } from 'vuex'
import MoreAction from './components/MoreAction'
import ChannelEdit from './components/ChannelEdit'

export default {
  name: 'home-index',
  components: { MoreAction, ChannelEdit },
  data () {
    return {
      // 文章列表
      // articles: [],
      // 是不是正在加载中
      // upLoading: false,
      // 是否全部数据加载完成
      // finished: false,
      // 是否正在下拉刷新中
      // downLoading: false,
      // 刷新成功后的提示文字（暂无更新|更新完毕）
      refreshSuccessText: '',
      // 我的频道数据
      myChannels: [],
      // 当前激活的频道索引
      activeIndex: 0,
      // 显示更多操作
      showMoreAction: false,
      // 当前点击文章ID
      articleId: null,
      // 显示频道编辑
      showChannelEdit: false
    }
  },
  // 计算属性
  computed: {
    // 当前激活的频道
    activeChannel () {
      return this.myChannels[this.activeIndex]
    },
    // 映射vuex的计算属性
    ...mapState(['user'])
  },
  watch: {
    user () {
      // 更新当前频道 (默认激活推荐)
      this.activeIndex = 0
      this.getMyChannels()
      this.onLoad()
    }
  },
  // 组件初始化
  created () {
    // 获取频道数据
    this.getMyChannels()
  },
  // keep-alive 缓存组件 （用这个标签包裹组件即可）
  // - activated  激活组件的时候触发
  // - deactivated  离开组件的时候触发
  // 激活组件钩子 (组件缓存) 初始化组件也执行
  activated () {
    // 当前激活的频道的文章列表容器 scroll-wrapper 滚动之前记录的位置
    // 有几个频道就有几个scroll-wrapper（容器） 现在是一个数组[dom,dom...]
    if (this.$refs['scrollWrapper']) {
      const dom = this.$refs['scrollWrapper'][this.activeIndex]
      dom.scrollTop = this.activeChannel.scrollTop
    }
  },
  methods: {
    // 实现上拉加载
    async onLoad () {
      // @load特点： 默认在组件初始化会 加载一次
      // @load特点： 当架子啊的内容渲染后不足一屏 继续加载一次
      // @load 事件触发事件 往上滑动到底部触发
      // 业务：获取列表数据进行渲染
      // window.setTimeout(() => {
      //   // 数据加载成功
      //   // 1.结束加载中效果
      //   this.upLoading = false
      //   // 2.模拟数据
      //   const data = []
      //   for (let i = this.articles.length; i < this.articles.length + 10; i++) {
      //     data.push(i + 1)
      //   }
      //   // 3.追加数据
      //   this.articles.push(...data)
      //   // 4.数据是否全部加载完毕  假设50条
      //   if (this.articles.length >= 50) {
      //     this.finished = true
      //   }
      // }, 1000)

      // await this.$sleep()
      // 获取文章列表（组件初始化默认激活频道一定是：推荐）
      // 获取传参：当前频道的ID  时间戳
      await this.$sleep()
      const data = await getArticles(
        this.activeChannel.id,
        this.activeChannel.timestamp
      )
      // 结束上拉加载效果
      this.activeChannel.upLoading = false
      // 把获取的数据累加到当前频道下的文章列表中
      this.activeChannel.articles.push(...data.results)
      // 判断是否所有数据已经加载完毕
      if (!data.pre_timestamp) {
        // 已经没有更多数据了
        this.activeChannel.finished = true
      } else {
        // 把后端返回的时间戳 记录下来 下次请求时需要使用
        this.activeChannel.timestamp = data.pre_timestamp
      }
    },
    // 实现下拉刷新
    async onRefresh () {
      // onRefresh 在下拉后 松手后 触发的函数 （获取数据，替换，进行列表渲染）
      // 获取数据 (获取到了数据，获取不到数据--->提示“暂无更新”,不需要替换列表)
      // window.setTimeout(() => {
      //   // 1. 结束正在刷新的效果
      //   this.downLoading = false
      //   // 2. 模拟数据
      //   const data = [1, 2, 3, 4]
      //   // 判断是否有数据
      //   if (data.length) {
      //     // 3. 更新数据
      //     this.articles = data
      //     // 4.给刷新后的提示
      //     this.refreshSuccessText = '更新完毕'
      //     // 5.重置加载全部数据是否加载完毕状态
      //     this.finished = false
      //     // 6.更新出的数据 有可能不满足一屏 主动加载一次
      //     this.onLoad()
      //   } else {
      //     // 没有数据
      //     // 3.给刷新后的提示
      //     this.refreshSuccessText = '暂无更新'
      //   }
      // }, 1000)
      // 同步进行
      await this.$sleep()
      this.activeChannel.timestamp = Date.now()
      const data = await getArticles(
        this.activeChannel.id,
        this.activeChannel.timestamp
      )
      // 结束下拉刷新效果
      this.activeChannel.downLoading = false
      // 判断是否有数据
      if (data.results.length) {
        this.activeChannel.articles = data.results
        // 加载有数据的文案
        this.refreshSuccessText = '更新完毕'
        // 防止看到 '没有更多了'信息  --->重新刷新列表 下一页应该是有数据的
        this.activeChannel.finished = false
        // 加上时间戳 加载下一页数据
        this.activeChannel.timestamp = data.pre_timestamp
        // 防止数据不够一屏 再来一次上拉加载数据 onLoad
        this.onLoad()
      } else {
        this.refreshSuccessText = '暂无更新'
      }
    },
    // 获取频道数据
    async getMyChannels () {
      const data = await getMyChannels()
      // this.myChannels = data.channels
      // 渲染频道 （标签页 tab组件）
      // myChannels 每一项值包含频道id 频道名称
      // myChannels 每一项值包含频道id 频道名称+文章列表+正在加载+正在刷新+是否全部加载+是否全部数据加载完成+时间戳
      //  map() 数组提供的函数，遍历当前数组，生成一个新的数组，
      this.myChannels = [] // 清除tabs组件的缓存
      this.$nextTick(() => {
        this.myChannels = data.channels.map(item => {
          return {
            id: item.id,
            name: item.name,
            articles: [],
            upLoading: false,
            downLoading: false,
            finished: false,
            timestamp: Date.now(),
            // 记录阅读位置
            scrollTop: 0
          }
        })
      })
    },
    // 切换频道
    changeChannel () {
      // 当前频道是否有文章数据 没有文章---> 自己来加载数据
      if (!this.activeChannel.articles.length) {
        // 显示加载中效果
        this.activeChannel.upLoading = true
        this.onLoad()
      } else {
        // 根据当前频道记录位置进行滚动 （覆盖tab组件滚动到顶部功能）
        // 覆盖： 我们滚动的操作需要在tab组件操作之后执行
        // 自己操作滚动代码(不推荐)
        // window.setTimeout(() => {
        //   const dom = this.$refs['scroll-wrapper'][this.activeIndex]
        //   dom.scrollTop = this.activeChannel.scrollTop
        // })

        // tab执行默认滚动的代码
        // vue 项目中 使用$nextTick() 下一帧
        // 情况1：当你同时操作dom时 前面的操作效果失效
        // 情况2：当你修改数据驱动视图更新(慢) 后面操作dom可能失败
        this.$nextTick(() => {
          const dom = this.$refs['scrollWrapper'][this.activeIndex]
          dom.scrollTop = this.activeChannel.scrollTop
        })
      }
    },
    // 记住滚动位置
    remember (e) {
      // 给当前频道记录阅读位置
      this.activeChannel.scrollTop = e.target.scrollTop
    },
    // 打开更多操作对话框
    openMoreAction (id) {
      this.showMoreAction = true
      this.articleId = id
    },
    // 删除文章
    removeArticle () {
      const index = this.activeChannel.articles.findIndex(item => item.art_id.toString() === this.articleId)
      // splice (索引，删几条)
      this.activeChannel.articles.splice(index, 1)
    },
    // 打开频道编辑
    openChannelEdit () {
      this.showChannelEdit = true
    }
  }
}
</script>

<style scoped lang='less'>
//  /deep/  :v-deep  >>>   深度影响
.van-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
  /deep/ .van-tabs__wrap {
    height: 36px;
    padding-right: 36px;
    .van-tab {
      line-height: 36px;
    }
    .van-tabs__line {
      background-color: #3296fa;
      height: 2px;
    }
  }
  /deep/ .van-tabs__content {
    flex: 1;
    overflow: hidden;
  }
  /deep/ .van-tab__pane {
    height: 100%;
    .scroll-wrapper {
      height: 100%;
      overflow-y: auto;
    }
  }
}
.bar_btn {
  width: 36px;
  height: 35px;
  position: absolute;
  top: 0;
  right: 0;
  &::before {
    content: "";
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 999;
    box-shadow: 0 0 10px #999;
    transform: scale(1, 0.6);
  }
  .van-icon-wap-nav {
    width: 100%;
    height: 100%;
    background: #fff;
    text-align: center;
    line-height: 35px;
    position: relative;
    z-index: 1000;
    &::before {
      font-size: 20px;
    }
  }
}
// 文章列表样式
.article_item {
  h3 {
    font-weight: normal;
    line-height: 2;
  }
  .img_box {
    display: flex;
    justify-content: space-between;
    .w33 {
      width: 33%;
      height: 90px;
    }
    .w100 {
      width: 100%;
      height: 180px;
    }
  }
  .info_box {
    color: #999;
    line-height: 2;
    position: relative;
    font-size: 12px;
    span {
      padding-right: 10px;
      &.close {
        border: 1px solid #ddd;
        border-radius: 2px;
        line-height: 15px;
        height: 12px;
        width: 16px;
        text-align: center;
        padding-right: 0;
        font-size: 8px;
        position: absolute;
        right: 0;
        top: 7px;
      }
    }
  }
}
</style>
