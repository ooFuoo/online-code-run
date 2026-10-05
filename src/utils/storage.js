// 代码保存持久化
const STORAGE_KEY = "online-code-editor"

export function saveFiles(files) {
  if (!Array.isArray(files)) {
    console.log('保存内容为空')
    return false
  }
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(files)
    )
    return true
  } catch (error) {
    console.log('代码自动保存失败', error)
    return false
  }
}

export function loadCode() {
  const data = localStorage.getItem(STORAGE_KEY)
  if (!data) {
    console.log("无值")
    return null
  }
  try {
    const files = JSON.parse(data)
    if (!Array.isArray(files) || files.length === 0) {
      return null
    }

    const isValidFile = file => file
      && Number.isInteger(file.id)
      && typeof file.name === 'string'
      && typeof file.language === 'string'
      && typeof file.content === 'string'

    return files.every(isValidFile) ? files : null
  } catch (error) {
    console.log("代码数据读取失败", error)
    return null
  }
}