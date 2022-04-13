<template>
      <div>
      <input
        type="file"
        :disabled="status !== Status.wait"
        @change="handleFileChange"
      />
      <el-button @click="handleUpload" :disabled="uploadDisabled"
        >上传</el-button
      >
      <el-button @click="handleResume" v-if="status === Status.pause"
        >恢复</el-button
      >
      <el-button
        v-else
        :disabled="status !== Status.uploading || !container.hash"
        @click="handlePause"
        >暂停</el-button
      >
    </div>
    <div>
      <div>计算文件 hash</div>
      <el-progress :percentage="hashPercentage"></el-progress>
      <div>总进度</div>
      <el-progress :percentage="fakeUploadPercentage"></el-progress>
    </div>
    <el-table :data="table.data">
      <el-table-column
        prop="hash"
        label="切片hash"
        align="center"
      ></el-table-column>
      <el-table-column label="大小(KB)" align="center" width="120">
        <template v-slot="{ row }">
          {{ transformByte(row.size) }}
        </template>
      </el-table-column>
      <el-table-column label="进度" align="center">
        <template v-slot="{ row }">
          <el-progress
            :percentage="row.percentage"
            color="#909399"
          ></el-progress>
        </template>
      </el-table-column>
    </el-table>
</template>
<script>
import { ref, reactive, readonly, computed, getCurrentInstance } from 'vue';
import { ElMessage } from 'element-plus'
import request from '../../utils/ajax';

export default {
  setup() {
    const { proxy, appContext } = getCurrentInstance(); // 获取访问内部组件实例
    // data
    const Status = readonly({
      wait: "wait",
      pause: "pause",
      uploading: "uploading"
    });
    const container = reactive({
      file: null,
      hash: "",
      worker: null
    });
    let table = reactive({data: []});
    // 切片大小
    const SIZE = readonly(0.5 * 1024 * 1024);
    let hashPercentage = ref(0);
    // 上传请求存放列表
    let requestList = reactive([]);
    // 当暂停时会取消 xhr 导致进度条后退
    // 为了避免这种情况，需要定义一个假的进度条
    let fakeUploadPercentage = ref(0);
    let status = ref('wait');
    let uploadDisabled = computed(() => {});
    // methods
    // 选择文件
    function handleFileChange(e) {
      const [file] = e.target.files;
      if (!file) return;
      resetData();
      // Object.assign(this.$data, this.$options.data());
      container.file = file;
    }
    // 重置数据
    function resetData() {
      // 调用abort方法暂停接口调用
      requestList.forEach(xhr => xhr?.abort());
      requestList = reactive([]);
      // 如果线程正在计算，重置worker
      if (container.worker) {
        container.worker.onmessage = null;
      }
    }
    async function handleUpload() {
      if (!container.file) return;
      status.value = Status.uploading;
      // 创建文件切片，得到一个数组
      let fileChunkList = createFileChunk(container.file);
      // 将切片数组内容拼接后得到一个完整的内容，再将该内容转换为hash 用来判断是否上传过
      container.hash = await calculateHash(fileChunkList);
      
      // 判断是否上传过，用于实现秒传
      const { shouldUpload, uploadedList } = await verifyUpload(container.file.name, container.hash)
      if (!shouldUpload) {
        ElMessage({
          message: '秒传：上传成功',
          type: 'success'
        })
        status.value = Status.wait;
        return;
      }
      // 得到 各个文件的切片文件和切片文件名
      table.data = reactive(fileChunkList.map(({file}, index) => {
        return {
          fileHash: container.hash,
          index,
          hash: container.hash + '-' + index, // 切片文件hash，带上下标为了后端拼接
          chunk: file, // 切片文件
          size: file.size,
          percentage: uploadedList.includes(index) ? 100 : 0 // uploadedList 是后端返回的已上传过的文件
        }
      }))

      console.log('table.data', table.data)

      await uploadChunks(uploadedList);
    }
    // 生成文件切片
    function createFileChunk(file, size = SIZE) {
      let list = [];
      let cur = 0;
      while(cur < file.size) {
        list.push({
          file: file.slice(cur, cur+size)
        });
        cur += size;
      }
      return list;
    }
    // 上传切片，同时过滤已上传的切片
    async function uploadChunks(uploadedList = []) {
      // 过滤出没有上传过的文件
      const fileList = table.data.filter(({ hash }) => !uploadedList.includes(hash)).map(({ chunk, hash, index }) => {
        const formData = new FormData();
        formData.append("chunk", chunk);
        formData.append("hash", hash);
        formData.append("filename", container.file.name);
        formData.append("fileHash", container.hash);
        return { formData, index };
      });
      // 需要上传文件的请求list
      const reqList = fileList.map(async ({ formData, index }) => {
        return request({
          url: "http://localhost:8088/upload",
          data: formData,
          onProgress: createProgressHandler(table.data[index]),
          requestList: requestList
        })
      })
      // 等待全部执行完
      await Promise.all(reqList);
      // 之前上传的切片数量 + 本次上传的切片数量 = 所有切片数量时
      // 合并切片
      if (uploadedList.length + reqList.length === table.data.length) {
        await mergeRequest();
      }
    }
    // 通知服务端合并切片
    async function mergeRequest() {
      await request({
        url: "http://localhost:8088/merge",
        headers: {
          "content-type": "application/json"
        },
        data: JSON.stringify({
          size: SIZE,
          fileHash: container.hash,
          filename: container.file.name
        })
      })
      ElMessage({
        type: 'success',
        message: '上传成功'
      })
      status.value = Status.wait;
    }

    // 调用web-worker 生成文件hash
    function calculateHash(fileChunkList) {
      return new Promise(resolve => {
        container.worker = new Worker('/hash.js');
        // 向web-worker中传输切片文件list
        container.worker.postMessage({
          fileChunkList
        });
        // 监听web-worker中的内部postMessage事件，得到经过md5转换后文件hash
        container.worker.onmessage = e => {
          const { percentage, hash } = e.data;
          hashPercentage = percentage;
          if (hash) {
            resolve(hash)
          }
        }
      })
    }
    // 恢复
    async function handleResume() {
      status.value = Status.uploading;
      const { uploadedList } = await verifyUpload(container.file.name, container.hash);
      uploadChunks(uploadedList)
    }
    // 暂停
    function handlePause() {
      status.value = Status.pause;
      resetData();
    }
    function transformByte(val) {
      return val ? Number((val / 1024).toFixed(0)) : '';
    }
    // 保存每个 chunk 的进度数据
    function createProgressHandler(item) {
      return e => {
        item.percentage = parseInt(String((e.loaded / e.total) * 100));
      }
    }
    // **** ajax ****
    // 根据hash验证内容是否上传过
    async function verifyUpload(filename, fileHash) {
      const { data } = await request({
        url: "http://localhost:8088/verify",
        headers: {
          "content-type": "application/json"
        },
        data: JSON.stringify({
          filename,
          fileHash
        })
      })
      return JSON.parse(data);
    }
    return {
      status,
      container,
      Status,
      hashPercentage,
      table,
      uploadDisabled,
      fakeUploadPercentage,
      handleFileChange,
      handleUpload,
      handleResume,
      handlePause,
      transformByte
    }
  }
}
</script>