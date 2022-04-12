<template>
  <button @click="createList">生成数据</button>
  <!-- 可视区域容器 -->
  <ul class="big-data-list" id="list" ref="list" @scroll="scrollEvent($event)">
    <!-- 占位容器，高度为总列表高度，用于形成滚动条 -->
    <div class="list-phantom" :style="{ height: listHeight + 'px'}"></div>
    <!-- 列表的实际渲染区域 -->
    <div class="list" ref="content" :style="{transform: getTransForm}">
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
    // 虚拟列表基础版 列表项高度固定
    let bigDataList = Array.from(Array(1000), (item, ind) => ({
      id: ind,
      value: ind
    }));
    const itemHeight = 50;
    const listHeight = computed(() => {
      return itemHeight * bigDataList.length;
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
    });

    onMounted(() => {
      console.log('el', document.getElementById('list'))
      start.value = 0;
      end.value = start.value + visibleCount;
    })
      //获取列表起始索引
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
      setTimeout(() => {
        console.log('总运行时间：',Date.now() - now);
      },0)
      // print JS运行时间：38
      // print 总运行时间：957
    }

    function scrollEvent(e){
      let scrollTop = list.value.scrollTop;
      start.value = Math.floor(scrollTop / itemHeight);
      end.value = start.value + visibleCount;
      startOffset.value = scrollTop - (scrollTop % itemHeight); 
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
      items,
      content
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
