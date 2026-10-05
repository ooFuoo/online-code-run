<script setup>
import { ref, onMounted, onBeforeUnmount} from 'vue'
import * as monaco from 'monaco-editor'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  language:{
    type:String,
    default:'html'
  },
  title:{
    type:String,
    default:''
  }
})
const emit = defineEmits(['update:modelValue'])

const container = ref(null)

let editor = null


onMounted(() => {
  editor = monaco.editor.create(container.value, {
    value: props.modelValue,
    language: props.language
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
  <div ref="container" class="editor">
    <span class="langname">{{ title }}</span>
  </div>
</template>

<style scoped>

.editor {
  width: 100%;
  min-width: 0;
  height: 50vh;
  border: 3px solid black;
  box-sizing: border-box;
}
.langname{
  background-color: #b6bbeb;
}
</style>