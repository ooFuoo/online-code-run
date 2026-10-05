<template>
   <div class="preview-box">
    <span v-if="isDestroyed">点击运行查看预览</span>
    <iframe 
      v-else
      :srcdoc="Code"
      :key="iframekey"
      class="preview"
      frameborder="0"
      sandbox="allow-scripts allow-modals allow-forms allow-popups">
    </iframe>
   </div>
  
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  Code: {
    type: String,
    default: ''
  }
})

const iframekey = ref(0)
const isDestroyed = ref(false)

function reload() {
  isDestroyed.value = false
  iframekey.value++
}

function destroy() {
  isDestroyed.value = true
}

defineExpose({ reload, destroy })

</script>

<style scoped>
.preview-box {
  width: 100%;
  height: 33vh;
  min-height: 220px;
  border: 3px solid black;
  background-color: aliceblue;
  box-sizing: border-box;
  display: block;
}
</style>