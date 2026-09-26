<template>
  <div class="container">
    <div class="editor">
      <CodeEditor v-model="code"></CodeEditor>
    </div>

    <div class="preview">
      <Peview :code="code"></Peview>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CodeEditor from './components/CodeEditor.vue';
import Peview from './components/Peview.vue';

const code = ref(`<h1 id="title">Hello World</h1>
<div class="contain">盒子one</div>
<style>
  #title {
    color: red;
    cursor: pointer;
      background-color: pink;
  }
  .contain{
     background-color: aliceblue;
  }
</style>

<script>
  document.querySelector('#title').onclick = function () {
    alert('点击成功！')
  }
<\/script>
`)

</script>

<style scoped>
</style>