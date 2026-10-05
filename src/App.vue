<template>
  <FileTree :files="files" :activeFileId="activeFileId" @select="activeFileId = $event" @create="handleCreateFile"
    @delete="handleDeleteFile" @rename="handleRenameFile" />

  <div class="container">

    <button @click="runCode">运行</button>

    <CodeEditor v-if="activeFile" :key="activeFile.id" v-model="activeFile.content" :language="activeFile.language"
      :title="activeFile.name">
    </CodeEditor>

    <div class="preview">
      <Preview :Code="Code" ref="previewRef"></Preview>
    </div>

    <div class="logs">
      <Console :logs="consoleList" @clear=clearLogs></Console>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import CodeEditor from './components/CodeEditor.vue';
import Preview from './components/Preview.vue';
import Console from './components/Console.vue';
import FileTree from './components/FileTree.vue';

import { useProjectFiles } from './composables/useProjectFiles'
import { useCodeRunner } from './composables/useCodeRunner'

const previewRef = ref(null)
const { files, activeFileId, activeFile, htmlFile, cssFile, jsFile, createFile, deleteFile, renameFile } = useProjectFiles()
const { Code, consoleList, runCode, handleMessage, clearLogs, addLog } = useCodeRunner({ htmlFile, cssFile, jsFile, previewRef })

function handleCreateFile(name) {
  const result = createFile(name)

  if (!result.success) {
    alert(result.message)
    return
  }

  addLog('info', result.message)
}

function handleDeleteFile(id) {
  const result = deleteFile(id)

  if (!result.success) {
    alert(result.message)
    return
  }

  addLog('info', result.message)
}

function handleRenameFile(id, name) {
  const result = renameFile(id, name)

  if (!result.success) {
    alert(result.message)
    return
  }

  addLog('info', '文件重命名成功')
}

onMounted(() => {
  window.addEventListener('message', handleMessage)
})

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