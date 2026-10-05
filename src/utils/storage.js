const STORAGE_KEY = 'online-code-editor'

export function saveFiles(files) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(files)
    )

    return true
  } catch (error) {
    console.error('保存文件失败:', error)
    return false
  }
}

export function loadFiles() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)

    if (!data) {
      return null
    }

    const files = JSON.parse(data)

    return Array.isArray(files)
      ? files
      : null

  } catch (error) {
    console.error('读取文件失败:', error)
    return null
  }
}