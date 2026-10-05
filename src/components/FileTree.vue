<template>
  <div class="file-tree">
    <div
      v-for="file in files"
      :key="file.id"
      class="file-item"
      :class="{ active: file.id === activeFileId }"
      @click="selectFile(file.id)"
    >
      {{ file.name }}
    </div>
  </div>    
</template>
  
<script setup>
  const props = defineProps({
    files:{
      type:Array,
      default:() => []
    },
    activeFileId:{
      type:Number,
      default:1
    }
  })

  const emit=defineEmits(['select'])

  function selectFile(id){
    emit('select',id)
  }

  
</script>
  
<style scoped>
.file-tree {
  display: flex;
  gap: 4px;
  padding: 8px 12px 0;
}

.file-item {
  padding: 6px 10px;
  cursor: pointer;
  border: 1px solid transparent;
}

.file-item.active {
  border-color: #333;
  background: #e7e9ff;
}
</style>