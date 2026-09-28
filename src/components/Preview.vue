<template>
  <iframe :srcdoc="Code" :key="iframekey" class="preview" frameborder="0"
    sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"></iframe>
</template>

<script setup>
import { ref, watch } from 'vue';

defineProps({
  Code: {
    type: String,
    default: ''
  }
})

const iframekey = ref(0)

function reload() {
  iframekey.value++
}
defineExpose({ reload })

</script>

<style scoped>
.preview {
  width: 100%;
  height: 33vh;
  min-height: 220px;
  border: 3px solid black;
  background-color: aliceblue;
  box-sizing: border-box;
  display: block;
}
</style>