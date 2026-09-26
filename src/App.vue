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
      <Peview :Code="Code"></Peview>
    </div>
    <div class="logs">
      <Console :logs="consoleList" @clear="consoleList = []"></Console>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import CodeEditor from './components/CodeEditor.vue';
import Peview from './components/Peview.vue';
import Console from './components/Console.vue';

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

  document.querySelector('#title').onclick = function () {
    console.log('点击成功！')
    alert('点击成功！')
  }
  `)

const previewCode = computed(() => {
  return `
<!DOCTYPE html>
  <html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        ${csscode.value}
      </style>
    </head>
      <body>
          ${htmlcode.value}
        <script>
        // 重写console，传给父组件一条消息
        const methods = ['log', 'warn', 'error']
methods.forEach(method => {
  const original = console[method]
  console[method] = (...args) => {
    window.parent.postMessage({
      type: 'console',
      level: method,
      args: args
    })

    original(...args)
  }
})
          ${jscode.value}
        <\/script>
      </body>
  </html>`
})

// 按钮处理用户死循环代码
const Code = ref("点击运行查看预览")
const consoleList = ref([])

function runCode() {
  Code.value = previewCode.value
}

// 防抖自动运行
function debounce(fn, delay) {
  // 定时器
  let timer = null
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}
const autorun = debounce(runCode, 500)
watch([htmlcode, jscode, csscode], () => {
  autorun()
})


window.addEventListener('message', (event) => {
  if (event.data?.type !== 'console') {
    return
  }
  consoleList.value.push({
    level: event.data.level,
    args: event.data.args
  })
})

</script>

<style scoped>
.container {
  display: flex;
  flex-wrap: wrap;
}
</style>