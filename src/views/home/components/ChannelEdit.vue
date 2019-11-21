<template>
  <van-action-sheet
    :value="value"
    @closed="editing=false"
    @input="$emit('input', $event)"
    title="编辑频道"
  >
    <div class="channel">
      <div class="tit">
        我的频道：
        <span class="tip">点击可进入频道</span>
        <van-button v-if="!editing" @click="editing=true" size="mini" type="info" plain>编辑</van-button>
        <van-button v-else @click="editing=false" size="mini" type="danger" plain>完成</van-button>
      </div>
      <van-grid class="van-hairline--left">
        <van-grid-item v-for="(item, i) in myChannels" :key="item.id">
          <span class="f12" @click="enterChannel(i)" :class="{red:activeIndex===i}">{{item.name}}</span>
          <van-icon v-if="editing && i!==0" class="btn" name="cross"  @click="delChannel(i,item.id)"></van-icon>
        </van-grid-item>
      </van-grid>
    </div>
    <div class="channel">
      <div class="tit">可选频道：</div>
      <van-grid class="van-hairline--left">
        <van-grid-item v-for="item in optionChannels" :key="item.id">
          <span class="f12">{{item.name}}</span>
          <van-icon class="btn" name="plus" @click="addChannel(item)"></van-icon>
        </van-grid-item>
      </van-grid>
    </div>
  </van-action-sheet>
</template>

<script>
import { getAllChannels, delChannel, addChannel } from '@/api/channel'
export default {
  props: {
    value: {
      type: Boolean,
      default: false
    },
    // 我的频道
    myChannels: {
      type: Array,
      // 如果默认值是复杂数据类型 必须是函数返回
      default: () => []
    },
    activeIndex: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      // 控制编辑/完成
      editing: false,
      // 全部频道
      allChannels: []
    }
  },
  created () {
    // 获取全部频道数据
    this.getAllChannels()
  },
  computed: {
    // 可选频道
    optionChannels () {
      // 可选频道 = 全部频道 - 我的频道
      // 在遍历全部频道时 去我的频道中找
      // 如果找到 不是可选频道 不该出现在新数组中
      // 如果找不到 是可选频道 出现在新数组中
      // this.allChannels.filter(item=>'布尔类型')
      return this.allChannels.filter(item => this.myChannels.findIndex(myItem => myItem.id === item.id) === -1)
    }

  },
  methods: {
    // 获取全部频道
    async getAllChannels () {
      const data = await getAllChannels()
      this.allChannels = data.channels
    },
    // 进入频道
    enterChannel (index) {
      // 把当前的index传给父组件
      // 父组件去修改activeIndex值为index即可  --->$event
      this.$emit('update:activeIndex', index)
      // 关闭 编辑频道组件
      this.$emit('input,false')
    },
    // 删除频道
    async delChannel (index, channelId) {
      try {
      // 1.调用删除API删除即可\
        await delChannel(channelId)
        // 2.提示
        this.$toast.success('删除成功')
        // 3.(删除频道索引小于或等于当前激活的频道索引)  当前激活的频道前移1位
        if (index <= this.activeIndex) {
        // activeIndex是复杂数据类型
        // 这是修改父组件的数据
          this.$emit('update:activeIndex', this.activeIndex - 1)
        }
        // 4.删除mychannels数据中index对应频道
        // 4.1 父传子 子使用props接收 数据特点：只读(单项数据流)
        // 4.2 当你去修改props中的数据 在不改变其引用这个条件下 可以修改数据
        // 总结：当你传入的是数组或对象 可以修改值(父组件受影响) 但是不可以重新赋值
        this.myChannels.splice(index, 1)
        // 5.通知父组件去调用changeChannel函数
        this.$emit('on-delete')
      } catch (e) {
        this.$toast.success('删除失败')
      }
    },
    // 添加频道
    async addChannel ({ id, item }) {
      try {
      // 包装一下传参 --> 支持接口调用 同时支持本地存储
      // 接口要数组 [{id,seq},...] 排除推荐
      // 本地要id name 即可
      // 最终数据 [{id,name,seq},...] seq:排序

        // 得到排序频道数组
        const orderChannels = this.myChannels.map((item, i) => {
          return {
            id: item.id,
            name: item.name,
            seq: i
          }
        })
        // 追加频道
        orderChannels.push({ id, name, seq: orderChannels.length })
        // 后台不要推荐
        orderChannels.splice(0, 1)
        // 调用添加API
        await addChannel(orderChannels)
        // 提示
        this.$toast.success('添加成功')
        // 在我的频道上追加一个新的频道
        this.myChannels.push({
          id,
          name,
          timestamp: Date.now(),
          upLoading: false,
          downLoading: false,
          finished: false,
          articles: [],
          scrollTop: 0
        })
      } catch (e) {
        this.$toast.success('添加失败')
      }
    }
  }
}
</script>

<style scoped lang='less'>
.van-popup--bottom {
  &.van-popup--round {
    border-radius: 0;
  }
}
.van-action-sheet {
  max-height: 100%;
  height: 100%;
  .van-action-sheet__header {
    background: #3296fa;
    color: #fff;
    .van-icon-close {
      color: #fff;
    }
  }
}
.channel {
  padding: 10px;
  .tit {
    line-height: 3;
    .tip {
      font-size: 10px;
      color: #999;
    }
  }
  .van-button {
    float: right;
    margin-top: 7px;
  }
  .btn {
    position: absolute;
    bottom: 0;
    right: 0;
    background: #ddd;
    font-size: 12px;
    color: #fff;
  }
  .f12 {
    font-size: 12px;
    color: #555;
  }
  .red {
    color: red;
  }
}
</style>
