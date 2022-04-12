<template>
  <button @click="showModal">
    展示一个弹框
  </button>
  <teleport to="body">
    <div class="modal-box">
      <TestCom foo1="foo1" foo2="foo2" @click-me="handelClickMe"/>
    </div>
  </teleport>
</template>
<script setup>
  import { ref } from 'vue';
  import TestCom from './TestCom.vue';
  const visible = ref(false);
  function showModal() {
    visible.value = true;
  }
  function handelClickMe(val) {
    alert(val)
  }
</script>
<style lang="css">
  .modal-box {
    width: 500px;
    height: 500px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: red;
  }
</style>