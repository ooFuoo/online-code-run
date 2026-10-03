<template>
  <div class="container">
    <button @click="runCode">运行</button>
    <div class="html-editor">
      <CodeEditor v-model="htmlcode" language="html" title="HTML"></CodeEditor>
    </div>

    <div class="css-editor">
      <CodeEditor v-model="csscode" language="css" title="CSS"></CodeEditor>
    </div>

    <div class="js-editor">
      <CodeEditor v-model="jscode" language="javascript" title="JavaScript"></CodeEditor>
    </div>

    <div class="preview">
      <Preview :Code="Code" ref="previewRef"></Preview>
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
import { saveCode, loadCode } from './utils/storage'

const savedCode = loadCode()

const htmlcode = ref(savedCode?.html ??
  `<h2>默认标签样式页面</h2>
<h1 id="title">Hello World</h1>
<div class="contain">盒子one</div>`)
const csscode = ref(savedCode?.css ??
  `#title {
    color: red;
    cursor: pointer;
      background-color: pink;
  }
  .contain{
     background-color: aliceblue;
  }`)
const jscode = ref(savedCode?.js ??
  ` console.log("默认打印")
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
let runtimer = null
const previewRef = ref(null)
let runID = 0
const maxLogs = 200

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
  // 1.先清除旧定时器

  // ② 生成新代码
  Code.value = buildPreview(
    htmlcode.value,
    csscode.value,
    jscode.value
  )

  // 3.销毁旧 iframe，然后创建新的 iframe 并执行代码
  previewRef.value?.reload()

  // 4. 5 秒后检查有没有执行完成.先清除旧定时器，在创建新定时器
  runtimer = setTimeout(() => {
    if (currentRunId !== runID) return
    pushlog({
      level: 'error',
      args: ['代码执行超时，可能存在死循环,请重新检查代码']
    })
    // 超时后销毁旧iframe，不创建新
    previewRef.value?.destory()
    runtimer=null
  }, 3000)
}

// 防抖后自动保存代码
const autosave = debounce(() => {
  const success = saveCode(
    {
      html: htmlcode.value,
      css: csscode.value,
      js: jscode.value
    })

  if (!success) {
    pushlog({
      level: 'error',
      args: ['代码保存失败']
    })
  }
}, 500)

// 防抖
const autorun = debounce(runCode, 500)
watch([htmlcode, jscode, csscode], () => {
  autorun()
  autosave()
})

// 一加载就读取localStorege中的，不运行
onMounted(() => {
  // runCode()
  Code.value=buildPreview(
     htmlcode.value,
    csscode.value,
    jscode.value
  )
})

const handleMessage = (event) => {
  if (event.data?.type === 'console') {
    pushlog({
      level: event.data.level,
      args: event.data.args
    })
  }

  if (event.data?.type === 'runtime-error') {
    pushlog({
      level: 'error',
      args: [
        `[${event.data.kind}] ${event.data.message}` +
        (event.data.source ? ` (${event.data.source}:${event.data.line}:${event.data.column})` : '')
      ],
      stack: event.data.stack
    })
  }
  if (event.data?.type === 'execution-complete') {
    clearTimeout(runtimer)
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