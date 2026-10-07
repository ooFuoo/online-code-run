<template>
  <div class="tree-node">

    <!-- 当前节点 -->
    <div
      class="node-item"
      :class="{
        active: node.type === 'file' && node.id === activeFileId
      }"
      :style="{ paddingLeft: `${level * 16 + 10}px` }"
      @click="handleClick"
    >

      <!-- 文件夹 -->
      <template v-if="node.type === 'folder'">
        <span class="arrow">
          {{ expanded ? '▼' : '▶' }}
        </span>

        <span class="icon">📁</span>
        <span class="node-name">{{ node.name }}</span>
      </template>

      <!-- 文件 -->
      <template v-else>
        <span class="arrow-placeholder"></span>

        <span class="icon">📄</span>
        <span class="node-name">{{ node.name }}</span>
      </template>

      <!-- 操作菜单 -->
      <button
        class="more-btn"
        @click.stop="toggleMenu"
      >
        ⋮
      </button>

      <div
        v-if="showMenu"
        class="node-menu"
        @click.stop
      >
        <template v-if="node.type === 'folder'">
          <button @click="handleCreateFile">
            新建文件
          </button>

          <button @click="handleCreateFolder">
            新建文件夹
          </button>
        </template>

        <button @click="handleRename">
          重命名
        </button>

        <button @click="handleDelete">
          删除
        </button>
      </div>
    </div>

    <!-- 子节点 -->
    <template v-if="node.type === 'folder' && expanded">
      <FileTreeNode
        v-for="child in children"
        :key="child.id"
        :node="child"
        :children-map="childrenMap"
        :active-file-id="activeFileId"
        :level="level + 1"
        @select="emit('select', $event)"
        @create-file="emit('create-file', $event)"
        @create-folder="emit('create-folder', $event)"
        @rename="emit('rename', $event.id, $event.name)"
        @delete="emit('delete', $event)"
      />
    </template>

  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

defineOptions({
  name: 'FileTreeNode'
})

const props = defineProps({
  node: {
    type: Object,
    required: true
  },

  childrenMap: {
    type: Object,
    required: true
  },

  activeFileId: {
    type: String,
    default: null
  },

  level: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits([
  'select',
  'create-file',
  'create-folder',
  'rename',
  'delete'
])

// 当前文件夹是否展开
const expanded = ref(true)

// 当前节点的子节点
const children = computed(() => {
  return props.childrenMap.get(props.node.id) ?? []
})

// 操作菜单
const showMenu = ref(false)

function toggleMenu() {
  showMenu.value = !showMenu.value
}

function handleClick() {
  // 文件夹：展开 / 收起
  if (props.node.type === 'folder') {
    expanded.value = !expanded.value
    return
  }

  // 文件：选中
  emit('select', props.node.id)
}

function handleCreateFile() {
  showMenu.value = false
  emit('create-file', props.node.id)
}

function handleCreateFolder() {
  showMenu.value = false
  emit('create-folder', props.node.id)
}

function handleRename() {
  showMenu.value = false

  emit('rename', {
    id: props.node.id,
    name: props.node.name
  })
}

function handleDelete() {
  showMenu.value = false

  emit('delete', props.node.id)
}
</script>

<style scoped>
.tree-node {
  width: 100%;
}

.node-item {
  position: relative;

  display: flex;
  align-items: center;

  min-height: 30px;

  padding-right: 28px;

  cursor: pointer;

  border: 1px solid transparent;
}

.node-item:hover {
  background: #f3f3f3;
}

.node-item.active {
  background: #e7e9ff;
  border-color: #333;
}

.arrow {
  width: 16px;
  font-size: 10px;
}

.arrow-placeholder {
  width: 16px;
}

.icon {
  margin-right: 6px;
}

.node-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.more-btn {
  position: absolute;
  right: 4px;

  border: 0;
  background: transparent;

  cursor: pointer;

  opacity: 0;
}

.node-item:hover .more-btn {
  opacity: 1;
}

.node-menu {
  position: absolute;
  right: 4px;
  top: 28px;

  z-index: 10;

  display: flex;
  flex-direction: column;

  min-width: 80px;

  padding: 4px;

  background: white;
  border: 1px solid #ddd;
}

.node-menu button {
  padding: 6px 10px;

  border: 0;
  background: transparent;

  text-align: left;

  cursor: pointer;
}

.node-menu button:hover {
  background: #f3f3f3;
}
</style>