<template>
  <button @click="createList">生成数据</button>
  <!-- 可视区域容器 -->
  <ul class="big-data-list" id="list" ref="list" @scroll="scrollEvent($event)">
    <!-- 占位容器，高度为总列表高度，用于形成滚动条 -->
    <div class="list-phantom" :style="{ height: listHeight + 'px'}"></div>
    <!-- 列表的实际渲染区域 -->
    <div class="list" ref="content">
      <div class="list-item" :ref="el => { if (el) items[i] = el }" v-for="item in visibleData" :key="item.id" :style="{minHeight: itemHeight+'px'}">
        {{ item.value }}
      </div>
    </div>
  </ul>
</template>
<script>
import { ref, reactive, getCurrentInstance, onMounted, computed, onBeforeUpdate, onUpdated } from 'vue'

export default {
  setup() {
    // 虚拟列表升级版 支持列表项高度不固定

    const zimu = 'abcdefghigklmnopqistuvwxyz,.'
    // 生成一个长度50到100的随机字符串
    function createRandomStr(ind, z) {
      let len = Math.floor(Math.random()*100);
      let str = '';
      let zLen = z.length;
      for (let i = 0; i < len; i++) {
        let r = Math.floor(Math.random()*zLen);
        str += z[r];
      }
      return ind + ':' + str;
    }
    let bigDataList = Array.from(Array(1000), (item, ind) => ({
      id: ind,
      value: createRandomStr(ind, zimu)
    }));
    const instance = getCurrentInstance(); // 获取访问内部组件实例
    // 预估高度
    const estimatedItemHeight = 50;
    // 用于列表渲染后存储每一项的高度以及位置
    let position = reactive([]);
    const itemHeight = 50;
    const listHeight = computed(() => {
      return position.length ? position[position.length-1].bottom : 0;
    }); // 列表总高度
    const screenHeight = 500;
    // list ref 标记
    const list = ref(null);
    // content ref 标记
    const content = ref(null);
    // 子节点 ref 标记数组
    const items = ref([]);
    // 开始索引
    const start = ref(0);
    // 结束索引
    const end = ref(null);
    // 偏移量
    const startOffset = ref(0);
    // 可显示列表内数据量
    const visibleCount = 10;
    // 实际渲染在页面的数据
    const visibleData = computed(() => {
      return bigDataList.slice(start.value, Math.min(end.value, bigDataList.length))
    });
    console.log('visibleData', visibleData)
    const getTransForm = computed(() => {
      return `translate3d(0, ${startOffset.value}px, 0)`
    })

    
    initPositions()
    onMounted(() => {
      console.log('el', document.getElementById('list'))
      start.value = 0;
      end.value = start.value + visibleCount;
      
    })

  // 确保在每次更新之前重置ref
    onBeforeUpdate(() => {
      items.value = []
    })

    onUpdated(() => {
      let nodes = [...items.value];
      nodes.forEach((node)=>{
        let rect = node.getBoundingClientRect();
        let height = rect.height;
        let index = +node.id.slice(1)
        let oldHeight = position[index].height;
        let dValue = oldHeight - height;
        //存在差值
        if(dValue){
          position[index].bottom = position[index].bottom - dValue;
          position[index].height = height;
          for(let k = index + 1;k<position.length; k++){
            position[k].top = position[k-1].bottom;
            position[k].bottom = position[k].bottom - dValue;
          }
        }
      })
    })

      //获取列表起始索引
    function getStartIndex(scrollTop = 0){
      // let item = position.find(i => i && i.bottom > scrollTop);
      // return item.index;
      return binarySearch(position, scrollTop)
    }

    function createList() {
      // 记录任务开始时间
      let now = Date.now();
      // 插入一万条数据
      const total = 10000;
      // 获取容器
      let ul = document.getElementById('list');
      // 将数据插入容器中
      for (let i = 0; i < total; i++) {
          let li = document.createElement('li');
          li.innerText = ~~(Math.random() * total)
          ul.appendChild(li);
      }
      console.log('JS运行时间：',Date.now() - now);
      setTimeout(()=>{
        console.log('总运行时间：',Date.now() - now);
      },0)
      // print JS运行时间：38
      // print 总运行时间：957
    }

    function scrollEvent(e) {
      let scrollTop = list.value.scrollTop;
      // start.value = Math.floor(scrollTop / itemHeight);
      start.value = getStartIndex(scrollTop)
      end.value = start.value + visibleCount;
      setStartOffset()
      
    }
    // 设置偏移量
    function setStartOffset() {
      startOffset.value = start.value >= 1 ? position[start.value - 1].bottom : 0;
      // content.value.style.transform = `translate3d(0,${startOffset.value}px,0)`;
      content.value.style.top = `${startOffset.value}px`;
    }
    function initPositions(){
      position = bigDataList.map((item, index) => {
        return {
          index,
          height: estimatedItemHeight,
          top: index * estimatedItemHeight,
          bottom: (index + 1) * estimatedItemHeight
        }
      })
    }
    //二分法查找
    function binarySearch(list, value) {
      let start = 0;
      let end = list.length - 1;
      let tempIndex = null;
      while (start <= end) {
        let midIndex = parseInt((start + end) / 2);
        let midValue = list[midIndex].bottom;
        if (midValue === value) {
          return midIndex + 1;
        } else if (midValue < value) {
          start = midIndex + 1;
        } else if (midValue > value) {
          if (tempIndex === null || tempIndex > midIndex) {
            tempIndex = midIndex;
          }
          end = end - 1;
        }
      }
      return tempIndex;
    }
    return {
      createList,
      scrollEvent,
      getTransForm,
      itemHeight,
      start,
      end,
      visibleData,
      listHeight,
      list,
      position,
      items,
      content,
    }
  }
}
</script>

<style scoped>
.big-data-list {
  height: 500px;
  overflow-y: scroll;
  position: relative;
  text-align: left;
}
.big-data-list li {
  border-bottom: 1px solid #000;
}
.list {
  position: absolute;
  top: 0;
}
.list-item {
  max-width: 50px;
  word-wrap: break-word;
}
</style>
