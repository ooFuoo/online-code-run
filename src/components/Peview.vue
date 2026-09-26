<template>
  <iframe :srcdoc="code" class="preview" frameborder="0"></iframe>
</template>

<script setup>
defineProps({
  code: {
    type: String,
    default: ''
  }

})
</script>

<style scoped>
.preview {
  width: 50%;
  height: 300px;
  border: 3px solid black ;
  background-color: aliceblue;
}
</style>