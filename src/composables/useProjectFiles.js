import { computed, ref, watch } from 'vue'
import { debounce } from '../utils/debounce'
import { loadFiles, saveFiles } from '../utils/storage'

const defaultFiles = ref([
  {
    id: 1,
    name: 'index.html',
    language: 'html',
    content: `<h2>默认标签样式页面</h2>
    <h1 id="title">Hello World</h1>
    <div class="contain">盒子one</div>`,
  },
  {
    id: 2,
    name: 'style.css',
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
    id: 3,
    name: 'script.js',
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
])

function getLanguage(fileNmae) {
  const ext = fileNmae.split('.').pop()?.toLowerCase()
  const languageMap = {
    html: 'html',
    css: 'css', 
    js: 'javascript',
    ts: 'typescript',
    json: 'json'
  }
  return languageMap[ext] ?? 'plaintext'
}

export function useProjectFiles() {
  const storedFiles = loadFiles()

  const files = ref(Array.isArray(storedFiles)
    ? storedFiles
    : defaultFiles
  )

  const activeFileId = ref(files.value[0]?.id ?? null)

  const activeFile = computed(() => {
    return files.value.find(file => file.id === activeFileId.value)
      ?? files.value[0]
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
      pushlog({
        level: 'error',
        args: ['代码保存失败']
      })
    }
  }, 500)

  watch(files, () => {
    autosave()
  }, { deep: true })


  function createFile(fileNmae) {
    const name = fileNmae.trim()
    if (!name) {
      return {
        success: false,
        message: "文件名不能为空"
      }
    }

    const exists = files.value.some(file => file.name === name)

    if (exists) {
      return {
        success: false,
        message: "文件名不能重复"
      }
    }

    const newFile = {
      id: Date.now(),
      name: name,
      language: getLanguage(name),
      content: ''
    }

    files.value.push(newFile)
    activeFileId.value = newFile.id

    return {
      success: true,
      message: "文件创建成功"
    }
  }

  function deleteFile(id) {
    const index = files.value.findIndex(
      file => file.id === id
    )

    if (index === -1) {
      return {
        success: false,
        message: '该文件不存在'
      }
    }

    const isActive = activeFileId.value === id
    files.value.splice(index, 1)

    if (isActive) {
      const nextFile = files.value[index] ?? files.value[index - 1] ?? files.value[0]
      activeFileId.value = nextFile?.id ?? null
    }
    return {
      success: true,
      message: '文件删除成功'
    }
  }

  function renameFile(id, newName) {
    // 新名去空格，判断是否存在，有值，有重名
    const name = newName.trim()
    if (!name) {
      return {
        success: false,
        message: '文件名不能为空'
      }
    }
    const oldFile = files.value.find(
      file => file.id === id
    )
    if (!oldFile) {
      return {
        success: false,
        message: "该文件不存在"
      }
    }
    const exist = files.value.some(
      file => file.id !== id && file.name === name
    )
    if (exist) {
      return {
        success: false,
        message: "该文件名已经存在"
      }
    }
    oldFile.name = name
    oldFile.language = getLanguage(name)

    return {
      success: true,
      oldFile
    }
  }


  return {
    files,
    activeFileId,
    activeFile,
    htmlFile,
    cssFile,
    jsFile,

    createFile,
    deleteFile,
    renameFile
  }
}

