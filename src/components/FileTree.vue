<template>
  <div class="file-tree">
    <div class="tree-header">
      <span>PROJECT</span>
      <div class="header-actions">
        <button class="add-btn" @click="openCreate(null, 'file')">新建文件</button>
        <button class="add-btn" @click="openCreate(null, 'folder')">新建文件夹</button>
      </div>
    </div>

    <div v-if="showCreateInput" class="create-box">
      <input
        ref="createInputRef"
        v-model="newFileName"
        :placeholder="createMode === 'folder' ? '文件夹名称' : '文件名，例如 utils.js'"
        @keyup.enter="handleCreate"
        @keyup.esc="cancelCreate"
      />
      <div class="actions">
        <button @click="handleCreate">创建</button>
        <button @click="cancelCreate">取消</button>
      </div>
      <div v-if="createError" class="error">{{ createError }}</div>
    </div>

    <div class="tree-list">
      <FileTreeNode
        v-for="node in rootNodes"
        :key="node.id"
        :node="node"
        :children-map="childrenMap"
        :active-file-id="activeFileId"
        @select="selectFile"
        @create-file="parentId => openCreate(parentId, 'file')"
        @create-folder="parentId => openCreate(parentId, 'folder')"
        @rename="startRename"
        @delete="handleDeleteById"
      />
    </div>

    <div v-if="renameFileData" class="rename-box">
      <input
        ref="renameInputRef"
        v-model="renameName"
        @keyup.enter="handleRename"
        @keyup.esc="cancelRename"
      />
      <div class="actions">
        <button @click="handleRename">确定</button>
        <button @click="cancelRename">取消</button>
      </div>
      <div v-if="renameError" class="error">{{ renameError }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, ref } from 'vue'
import FileTreeNode from './FireTreeNode.vue'

const props = defineProps({
  files: { type: Array, default: () => [] },
  childrenMap: { type: Map, default: () => new Map() },
  activeFileId: { type: String, default: null }
})

const emit = defineEmits([
  'select',
  'create-file',
  'create-folder',
  'delete',
  'rename'
])

const rootNodes = computed(() => props.childrenMap.get(null) ?? [])

function selectFile(id) {
  emit('select', id)
}

const showCreateInput = ref(false)
const newFileName = ref('')
const createError = ref('')
const createParentId = ref(null)
const createMode = ref('file')
const createInputRef = ref(null)

async function openCreate(parentId = null, mode = 'file') {
  createParentId.value = parentId
  createMode.value = mode
  showCreateInput.value = true
  await nextTick()
  createInputRef.value?.focus()
}

function handleCreate() {
  const name = newFileName.value.trim()
  if (!name) {
    createError.value = '请输入文件名'
    return
  }

  emit(createMode.value === 'folder' ? 'create-folder' : 'create-file', {
    name,
    parentId: createParentId.value
  })
  cancelCreate()
}

function cancelCreate() {
  newFileName.value = ''
  createError.value = ''
  createParentId.value = null
  createMode.value = 'file'
  showCreateInput.value = false
}

function handleDeleteById(id) {
  const node = props.files.find(file => file.id === id)
  if (node && window.confirm(`确定删除 ${node.name} 吗？`)) {
    emit('delete', id)
  }
}

const renameFileData = ref(null)
const renameName = ref('')
const renameError = ref('')
const renameInputRef = ref(null)

async function startRename(node) {
  renameFileData.value = node
  renameName.value = node.name
  renameError.value = ''
  await nextTick()
  renameInputRef.value?.focus()
}

function handleRename() {
  const name = renameName.value.trim()
  if (!name) {
    renameError.value = '请输入名称'
    return
  }

  emit('rename', renameFileData.value.id, name)
  cancelRename()
}

function cancelRename() {
  renameFileData.value = null
  renameName.value = ''
  renameError.value = ''
}
</script>

<style scoped>
.file-tree { display: flex; flex-direction: column; gap: 4px; padding: 8px 12px 0; }
.tree-header { display: flex; align-items: center; justify-content: space-between; }
.header-actions { display: flex; gap: 4px; }
.add-btn { cursor: pointer; }
.tree-list { display: flex; flex-direction: column; }
.actions { display: flex; gap: 4px; }
.error { color: #c00; }
</style>
