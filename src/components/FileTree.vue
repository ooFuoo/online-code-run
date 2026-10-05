<template>
  <div class="file-tree">

    <!-- 标题栏 -->
    <div class="tree-header">
      <span>PROJECT</span>
      <button class="add-btn" @click="openCreate">+</button>
    </div>

    <!-- 新建文件 -->
    <div v-if="showCreateInput" class="create-box">
      <input ref="createInputRef" v-model="newFileName" placeholder="文件名，例如 utils.js" @keyup.enter="handleCreate"
        @keyup.esc="cancelCreate" />

      <div class="actions">
        <button @click="handleCreate">创建</button>
        <button @click="cancelCreate">取消</button>
      </div>

      <div v-if="createError" class="error"> {{ createError }} </div>
    </div>

    <!-- 文件列表 -->
    <div v-for="file in files" :key="file.id" class="file-item" :class="{
      active: file.id === activeFileId
    }" @click="selectFile(file.id)">

      <span class="file-name">{{ file.name }}</span>
      <button class="more-btn" @click.stop="toggleMenu(file.id)">⋮</button>

      <!-- 操作菜单 -->
      <div v-if="menuFileId === file.id" class="file-menu" @click.stop>
        <button @click="startRename(file)">重命名</button>
        <button @click="handleDelete(file)"> 删除</button>
      </div>
    </div>

    <!-- 重命名 -->
    <div v-if="renameFileData" class="rename-box">
      <input ref="renameInputRef" v-model="renameName" @keyup.enter="handleRename" @keyup.esc="cancelRename" />
      <div class="actions">
        <button @click="handleRename"> 确定</button>
        <button @click="cancelRename">取消</button>
      </div>
      <div v-if="renameError" class="error">{{ renameError }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
const props = defineProps({
  files: {
    type: Array,
    default: () => []
  },
  activeFileId: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits(['select',
  'create',
  'delete',
  'rename'])

function selectFile(id) {
  emit('select', id)
}

const showCreateInput = ref(false)
const newFileName = ref('')
const createError = ref('')

const createInputRef = ref(null)

async function openCreate() {
  showCreateInput.value = true

  await nextTick()

  createInputRef.value?.focus()
}

function handleCreate() {
  createError.value = ''

  const name = newFileName.value.trim()

  if (!name) {
    createError.value = '请输入文件名'
    return
  }

  emit('create', name)

  newFileName.value = ''
  showCreateInput.value = false
}

function cancelCreate() {
  newFileName.value = ''
  createError.value = ''
  showCreateInput.value = false
}

// 文件菜单
const menuFileId = ref(null)

function toggleMenu(id) {
  menuFileId.value =
    menuFileId.value === id ? null : id
}

// 删除文件
function handleDelete(file) {
  const confirmed = window.confirm(
    `确定删除 ${file.name} 吗？`
  )
  if (!confirmed) {
    return
  }
  emit('delete', file.id)
  menuFileId.value = null
}

// 重命名
const renameFileData = ref(null)
const renameName = ref('')
const renameError = ref('')

const renameInputRef = ref(null)

async function startRename(file) {
  renameFileData.value = file
  renameName.value = file.name
  renameError.value = ''
  menuFileId.value = null
  await nextTick()
  renameInputRef.value?.focus()
}

function handleRename() {
  renameError.value = ''
  const name = renameName.value.trim()
  if (!name) {
    renameError.value = '请输入文件名'
    return
  }
  emit('rename', renameFileData.value.id, name)
  renameFileData.value = null
  renameName.value = ''
}

function cancelRename() {
  renameFileData.value = null
  renameName.value = ''
  renameError.value = ''
}

</script>

<style scoped>
.file-tree {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 12px 0;
}

.file-item {
  padding: 6px 10px;
  cursor: pointer;
  border: 1px solid transparent;
}

.file-item.active {
  border-color: #333;
  background: #e7e9ff;
}
</style>