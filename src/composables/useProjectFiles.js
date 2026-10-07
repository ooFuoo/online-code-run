import { computed, ref, watch } from 'vue'
import { debounce } from '../utils/debounce'
import { loadFiles, saveFiles } from '../utils/storage'

const defaultFiles = [
  {
    id: createID(),
    name: 'index.html',
    type: 'file',
    parentId: null,
    language: 'html',
    content: `<h2>默认标签样式页面</h2>
    <h1 id="title">Hello World</h1>
    <div class="contain">盒子one</div>`,
  },
  {
    id: createID(),
    name: 'style.css',
    type: 'file',
    parentId: null,
    language: 'css',
    content: `#title {
                    color: red;
                    cursor: pointer;
                    background-color: pink;
                }
              .contain{
                 background-color: aliceblue;
                }`,
  },
  {
    id: createID(),
    name: 'script.js',
    type: 'file',
    parentId: null,
    language: 'javascript',
    content: ` console.log("默认打印")
                console.log('Hello Console')
                console.log(123)
                console.log('普通日志')
                console.warn('警告')
                console.error('错误')
                const title = document.querySelector('#title')
                 if(title) {
                title.onclick = function () {
                  console.log('点击成功！')
                  alert('点击成功！')
                }
                  }
  `,
  }
]

function createID() {
  return crypto.randomUUID()
}

// 获取文件语言后缀
function getLanguage(fileName) {
  const ext = fileName.split('.').pop()?.toLowerCase()
  const languageMap = {
    html: 'html',
    css: 'css',
    js: 'javascript',
    ts: 'typescript',
    json: 'json'
  }
  return languageMap[ext] ?? 'plaintext'
}

// 创建文件节点
function createFileNode(name, parentId = null) {
  name = name.trim()
  return {
    id: createID(),
    name: name,
    type: 'file',
    parentId: parentId,
    language: getLanguage(name),
    content: ''
  }
}

// 创建文件夹节点
function createFolderNode(name, parentId = null) {
  name = name.trim()
  return {
    id: createID(),
    name: name,
    type: 'folder',
    parentId: parentId,
  }
}

export function useProjectFiles() {
  const storedFiles = loadFiles()

  const files = ref(storedFiles?.length
    ? storedFiles.map(file => ({
      ...file,
      parentId: file.parentId ?? null
    }))
    : defaultFiles
  )

  // 找到激活文件，兜底第一个？？null
  const activeFileId = ref(files.value[0]?.id ?? null)

  const activeFile = computed(() => {
    return files.value.find(
      file => file.id === activeFileId.value && file.type === 'file')
      ?? files.value.find(file => file.type === 'file')
      ?? null
  })

  const childrenMap = computed(() => {
    const map = new Map()
    for (const file of files.value) {
      const parentId = file.parentId
      if (!map.has(parentId)) {
        map.set(parentId, [])
      }
      map.get(parentId).push(file)
    }
    return map
  })

  const htmlFile = computed(() => files.value.find(
    file => file.name === 'index.html'
  ))
  const cssFile = computed(() => files.value.find(
    file => file.language === 'css'
  ))
  const jsFile = computed(() => files.value.find(
    file => file.language === 'javascript'
  ))

  // 自动保存代码
  const autosave = debounce(() => {
    const success = saveFiles(files.value)

    if (!success) {
      console.error('代码保存失败')
    }
  }, 500)

  watch(files, () => {
    autosave()
  }, { deep: true })


  // 11再增加“根据 ID 找节点”
  function getNodeByID(id) {
    return files.value.find(
      item => item.id === id
    ) ?? null
  }

  // 22获取某个目录下的直接子节点
  function getChildren(parentId = null) {
    return childrenMap.value.get(parentId) ?? []
  }

  // 33获取某个节点下面所有后代节点 ID
  function getDescendantIds(id) {
    const visited = new Set([id])
    const stack = [id]
    const result = []
    while (stack.length) {
      const currentID = stack.pop()
      const children = childrenMap.value.get(currentID)
      if (!children) {
        continue
      }
      for (const child of children) {
        if (visited.has(child.id)) {
          continue
        }
        visited.add(child.id)
        result.push(child.id)
        if (child.type === 'folder') {
          stack.push(child.id)
        }
      }
    }
    return result
  }

  // 1.创建文件
  function createFile(fileNmae, parentId = null) {
    const name = fileNmae.trim()
    if (!name) {
      return {
        success: false,
        message: "文件名不能为空"
      }
    }

    const parent = getNodeByID(parentId)
    if (parentId !== null && parent?.type !== 'folder') {
      return {
        success: false,
        message: '目标目录不存在'
      }
    }
    const exists = files.value.some(file => file.name === name && file.parentId === parentId)

    if (exists) {
      return {
        success: false,
        message: "当前目录下名称不能重复"
      }
    }

    const newFile = createFileNode(name, parentId)

    files.value.push(newFile)
    activeFileId.value = newFile.id

    return {
      success: true,
      message: "文件创建成功",
      node: newFile
    }
  }

  // 2.创建文件夹
  function createFolder(folderName, parentId = null) {
    const name = folderName.trim()
    if (!name) {
      return {
        success: false,
        message: '文件夹名称不能为空'
      }
    }
    const parent = getNodeByID(parentId)
    if (parentId !== null && parent?.type !== 'folder') {
      return {
        success: false,
        message: '目标目录不存在'
      }
    }
    const exists = files.value.some(
      file =>
        file.parentId === parentId &&
        file.name === name
    )

    if (exists) {
      return {
        success: false,
        message: '当前目录下名称不能重复'
      }
    }

    const newFolder = createFolderNode(name, parentId)

    files.value.push(newFolder)

    return {
      success: true,
      message: '文件夹创建成功',
      node: newFolder
    }
  }

  // 3.删除节点
  function deleteNode(id) {
    const node = getNodeByID(id)
    if (!node) {
      return {
        success: false,
        message: '待删除文件节点不存在'
      }
    }

    const deleteIds = new Set([id, ...getDescendantIds(id)])
    const wasActive = deleteIds.has(activeFileId.value)

    files.value = files.value.filter(f => !deleteIds.has(f.id))

    if (wasActive) {
      const nextFile = files.value.find(file => file.type === 'file') ?? null
      activeFileId.value = nextFile?.id ?? null
    }

    return {
      success: true,
      message: node.type === 'folder' ? '文件夹删除成功' : '文件删除成功'
    }
  }

  // 4.重名名文件
  function renameNode(id, newName) {
    // 新名去空格，判断是否存在，有值，有重名
    const name = newName.trim()
    if (!name) {
      return {
        success: false,
        message: '名称不能为空'
      }
    }

    const node = getNodeByID(id)

    if (!node) {
      return {
        success: false,
        message: "该节点不存在"
      }
    }
    const exist = getChildren(node.parentId).some(file => file.id !== id && file.name === name)

    if (exist) {
      return {
        success: false,
        message: "当前目录下名称不能重复"
      }
    }
    const oldName = node.name
    node.name = name
    if (node.type === 'file') {
      node.language = getLanguage(name)
    }

    return {
      success: true,
      message: '重命名成功',
      oldName,
      node

    }
  }

  return {
    files,
    childrenMap,

    activeFileId,
    activeFile,

    htmlFile,
    cssFile,
    jsFile,

    getNodeByID,
    getChildren,
    getDescendantIds,

    createFile,
    createFolder,
    deleteNode,
    renameNode
  }
}

