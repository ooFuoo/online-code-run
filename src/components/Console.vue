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
const props = defineProps({
  logs: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['clear'])
function clear() {
  emit('clear')
}
</script>

<style scoped>
.args {
  width: 100%;
  height: 200px;
  border: 2px solid black;
  box-sizing: border-box;
  overflow: scroll;
}
</style>