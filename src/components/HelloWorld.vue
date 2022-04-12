<template>
  <ModalButton />
</template>
<script setup>
import { ref } from 'vue'
import ModalButton from './ModalButton.vue';

defineProps({
  msg: String
})

const count = ref(0)
</script>

<style scoped>
a {
  color: #42b983;
}
</style>
