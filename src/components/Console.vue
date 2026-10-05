<template>
  <div class="args">
    <span>控制台 </span>
    <button @click="clear">清空</button>
    <div v-for="(item, index) in logs" :key="index" class="console-item">
      <span>{{ item.level }}</span>
      <span>{{ item.args }}</span>
    </div>

  </div>
</template>

<script setup>
defineProps({
  logs: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['clear'])
function clear() {
  emit('clear')
}

function formatArgs(args) {
  return (Array.isArray(args) ? args : [args]).map(arg => {
    if (typeof arg === 'string') return arg
    try {
      return JSON.stringify(arg)
    } catch {
      return String(arg)
    }
  }).join(' ')
}
</script>

<style scoped>
.args {
  width: 100%;
  height: 200px;
  border: 2px solid black;
  box-sizing: border-box;
  overflow: scroll;
  /* margin: 10px; */
}
</style>