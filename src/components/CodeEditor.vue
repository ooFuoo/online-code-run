<script setup>
import { ref, onMounted, onBeforeUnmount, onUpdated } from 'vue'
import * as monaco from 'monaco-editor'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})
const emit = defineEmits(['update:modelValue'])

const container = ref(null)

let editor = null


onMounted(() => {
  editor = monaco.editor.create(container.value, {
    value: props.modelValue,
    language: 'html'
  })

  editor.onDidChangeModelContent(() => {
    emit('update:modelValue', editor.getValue())
  })
})

onBeforeUnmount(() => {
  editor?.dispose()
})
</script>

<template>
  <div ref="container" class="editor"></div>
</template>

<style scoped>

.editor {
  /* width: 40%; */
  height: 50vh;
  border: 3px solid black;
}
</style>