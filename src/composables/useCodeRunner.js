import { ref, onBeforeUnmount } from 'vue'
import { buildPreview } from '../utils/buildPreview'

export function useCodeRunner({
  htmlFile,
  cssFile,
  jsFile,
  previewRef
}) {
  const Code = ref('')
  const consoleList = ref([])
  const maxLogs = 200
  let runtimer = null
  let runID = 0

  function pushlog(log) {
    consoleList.value.push(log)
    if (consoleList.value.length > maxLogs) {
      consoleList.value.splice(0, consoleList.value.length - maxLogs)
    }
  }


  function runCode() {
    runID++

    const currentRunId = runID

    // 清除上一次超时检测
    clearTimeout(runtimer)
    runtimer = null

    // 清空控制台
    consoleList.value = []

    // 重新生成运行代码
    Code.value = buildPreview(
      htmlFile.value?.content ?? '',
      cssFile.value?.content ?? '',
      jsFile.value?.content ?? '',
      currentRunId
    )

    // 销毁旧 iframe，重新执行
    previewRef.value?.reload()

    // 超时检测
    runtimer = setTimeout(() => {
      if (currentRunId !== runID) {
        return
      }

      pushlog({
        level: 'error',
        args: [
          '代码执行超时，可能存在死循环，请重新检查代码'
        ]
      })

      previewRef.value?.destroy()

      runtimer = null
    }, 3000)
  }



  const handleMessage = (event) => {
    const message = event.data
    if (!message || message.runId !== runID) return

    if (message.type === 'console') {
      pushlog({
        level: message.level,
        args: message.args
      })
    }

    if (message.type === 'runtime-error') {
      pushlog({
        level: 'error',
        args: [
          `[${message.kind}] ${message.message}` +
          (message.source ? ` (${message.source}:${message.line}:${message.column})` : '')
        ],
        stack: message.stack
      })
    }
    if (message.type === 'execution-complete') {
      clearTimeout(runtimer)
      runtimer = null
    }
  }

  function clearLogs() {
    consoleList.value = []
  }

  function destroy() {
    clearTimeout(runtimer)
    runtimer = null

    previewRef.value?.destroy()
  }

  onBeforeUnmount(() => {
    destroy()
  })

  return {
    Code,
    consoleList,
    runCode,
    handleMessage,
    clearLogs
  }
}