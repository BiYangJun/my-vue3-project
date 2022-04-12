<template>
  <div class="test-com-box">
    <div>俩个熟悉{{foo1}}{{foo2}}</div>
    <div class="test-com" @click="emitFn">TstCom</div>
  </div>
</template>
<script setup>
import {defineProps, defineEmits} from 'vue';
const props = defineProps({
  foo1: String,
  foo2: String,
})
const emit = defineEmits(['click-me'])
function emitFn() {
  console.log('props', props)
  emit('click-me', 'hello')
}
</script>
<style lang="css">
  .test-com-box {
    width: 100px;
    height: 100px;
    background: green;
    margin: 10px;
  }
</style>