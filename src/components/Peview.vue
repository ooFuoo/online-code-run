<template>
  <iframe :srcdoc="previewCode" class="preview" frameborder="0"></iframe>
</template>

<script setup>
defineProps({
  previewCode: {
    type: String,
    default: ''
  }

})
</script>

<style scoped>
.preview {
  width: 700px;
  height: 50vh;
  border: 3px solid black ;
  background-color: aliceblue;
}
</style>