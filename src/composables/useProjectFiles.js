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

    return {
    files,
    activeFileId,
    activeFile,
    htmlFile,
    cssFile,
    jsFile
  }
}

