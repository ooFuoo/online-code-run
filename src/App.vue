<template>
  <FileTree :files="files" :activeFileId="activeFileId" @select="activeFileId = $event" />

  <div class="container">

    <button @click="runCode">运行</button>

    <CodeEditor v-if="activeFile" :key="activeFile.id" v-model="activeFile.content" :language="activeFile.language"
      :title="activeFile.name">
    </CodeEditor>

    <div class="preview">
      <Preview :Code="Code" ref="previewRef"></Preview>
    </div>

    <div class="logs">
      <Console :logs="consoleList" @clear="consoleList = []"></Console>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import CodeEditor from './components/CodeEditor.vue';
import Preview from './components/Preview.vue';
import Console from './components/Console.vue';
import FileTree from './components/FileTree.vue';

import { buildPreview } from './utils/buildPreview'
import { debounce } from './utils/debounce'
import { saveFiles, loadCode } from './utils/storage'


const savedCode = loadCode()

const Code = ref('')
const consoleList = ref([])
let runtimer = null
const previewRef = ref(null)
let runID = 0
const maxLogs = 200



if (Array.isArray(savedCode)) {
  files.value = savedCode
}

const activeFileId = ref(files.value[0]?.id ?? null)

const htmlFile = computed(() => files.value.find(
  file => file.name === 'index.html'
))
const cssFile = computed(() => files.value.find(
  file => file.language === 'css'
))
const jsFile = computed(() => files.value.find(
  file => file.language === 'javascript'
))

// 一加载就读取localStorege中的，不运行
const activeFile = computed(() => {
  return files.value.find(file => file.id === activeFileId.value)
    ?? files.value[0]
})

function pushlog(log) {
  consoleList.value.push(log)
  if (consoleList.value.length > maxLogs) {
    consoleList.value.splice(0, consoleList.value.length - maxLogs)
  }
}


function runCode() {
  runID++
  const currentRunId = runID
  clearTimeout(runtimer)
  runtimer = null

  // 清空旧日志
  consoleList.value = []


  Code.value = buildPreview(
    htmlFile.value?.content ?? '',
    cssFile.value?.content ?? '',
    jsFile.value?.content ?? '',
    currentRunId
  )

  // 3.销毁旧 iframe，然后创建新的 iframe 并执行代码
  previewRef.value?.reload()

  // 3 秒后检查有没有执行完成
  runtimer = setTimeout(() => {
    if (currentRunId !== runID) return
    pushlog({
      level: 'error',
      args: ['代码执行超时，可能存在死循环,请重新检查代码']
    })
    // 超时后销毁旧iframe，不创建新
    previewRef.value?.destroy()
    runtimer = null
  }, 3000)
}

// 防抖后自动保存代码
const autosave = debounce(() => {
  const success = saveFiles(files.value)

  if (!success) {
    pushlog({
      level: 'error',
      args: ['代码保存失败']
    })
  }
}, 500)

// 防抖
const autorun = debounce(runCode, 500)
watch(files, () => {
  autorun()
  autosave()
}, { deep: true })

onMounted(() => {
  window.addEventListener('message', handleMessage)

  Code.value = buildPreview(
    htmlFile.value?.content ?? '',
    cssFile.value?.content ?? '',
    jsFile.value?.content ?? '',
    runID
  )
})

const handleMessage = (event) => {
  const message = event.data
  if (!message || message.runId !== runID) return

  if (message.type === 'console') {
    pushlog({
      level: message.level,
      args: message.args
    })
  }

  if (message.type === 'runtime-error') {
    pushlog({
      level: 'error',
      args: [
        `[${message.kind}] ${message.message}` +
        (message.source ? ` (${message.source}:${message.line}:${message.column})` : '')
      ],
      stack: message.stack
    })
  }
  if (message.type === 'execution-complete') {
    clearTimeout(runtimer)
    runtimer = null
  }
}


onBeforeUnmount(() => {
  clearTimeout(runtimer)
  autorun.cancel()
  autosave.cancel()
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

@media (max-width: 700px) {
  .container {
    grid-template-columns: minmax(0, 1fr);
  }

  .preview {
    grid-column: 1;
    grid-row: auto;
  }
}
</style>