<template>
  <iframe :srcdoc="Code" class="preview" frameborder="0"
    sandbox="allow-scripts allow-modals allow-forms allow-popups"></iframe>
</template>

<script setup>
defineProps({
  Code: {
    type: String,
    default: ''
  }
})
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