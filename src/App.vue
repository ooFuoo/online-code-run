<template>
  <div class="container">
    <button @click="runCode">运行</button>
    <div class="html-editor">
      <CodeEditor v-model="htmlcode" language="html"></CodeEditor>
    </div>

    <div class="css-editor">
      <CodeEditor v-model="csscode" language="css"></CodeEditor>
    </div>

    <div class="js-editor">
      <CodeEditor v-model="jscode" language="javascript"></CodeEditor>
    </div>

    <div class="preview">
      <Preview :Code="Code"></Preview>
    </div>
    <div class="logs">
      <Console :logs="consoleList" @clear="consoleList = []"></Console>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import CodeEditor from './components/CodeEditor.vue';
import Preview from './components/Preview.vue';
import Console from './components/Console.vue';

import { buildPreview } from './utils/buildPreview'
import { debounce } from './utils/debounce'

const htmlcode = ref(`<h1 id="title">Hello World</h1>
<div class="contain">盒子one</div>`)
const csscode = ref(`
  #title {
    color: red;
    cursor: pointer;
      background-color: pink;
  }
  .contain{
     background-color: aliceblue;
  }
`)
const jscode = ref(`
console.log('Hello Console')
  console.log(123)
  console.log('普通日志')
console.warn('警告')
console.error('错误')
  const title = document.querySelector('#title')
  if (title) {
    title.onclick = function () {
      console.log('点击成功！')
      alert('点击成功！')
    }
  }
  `)


// 初始渲染时直接生成预览，避免首次打开为空白
const Code = ref('')
const consoleList = ref([])

function runCode() {
  Code.value = buildPreview(
    htmlcode.value,
    csscode.value,
    jscode.value
  )
}

runCode()

// 防抖
const autorun = debounce(runCode, 500)
watch([htmlcode, jscode, csscode], () => {
  autorun()
})

onMounted(() => {
  runCode()
})

const handleMessage = (event) => {
  if (event.data?.type === 'console') {
    consoleList.value.push({
      level: event.data.level,
      args: event.data.args
    })
  }

  if (event.data?.type === 'runtime-error') {
    consoleList.value.push({
      level: 'error',
      args: [
        `[${event.data.kind}] ${event.data.message}` +
        (event.data.source ? ` (${event.data.source}:${event.data.line}:${event.data.column})` : '')
      ],
      stack: event.data.stack
    })
  }
}

window.addEventListener('message', handleMessage)
onBeforeUnmount(() => {
  window.removeEventListener('message', handleMessage)
})
</script>

<style scoped>
.container {
  display: grid;
  grid-template-columns: repeat(2, minmax(320px, 1fr));
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
  padding: 12px;
}

.html-editor,
.css-editor,
.js-editor,
.preview,
.logs {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.preview {
  grid-column: 2;
  grid-row: 1 / span 3;
}

.logs {
  grid-column: 1 / -1;
}
</style>