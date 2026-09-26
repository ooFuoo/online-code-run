<template>
  <div class="container">
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
      <Peview :previewCode="previewCode"></Peview>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import CodeEditor from './components/CodeEditor.vue';
import Peview from './components/Peview.vue';

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
  document.querySelector('#title').onclick = function () {
    alert('点击成功！')
  }`)

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
          ${jscode.value}
        <\/script>
      </body>
  </html>`
})

</script>

<style scoped>
.container{
  display: flex;
flex-wrap: wrap;
}
</style>