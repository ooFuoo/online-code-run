// 代码保存持久化
const STORAGE_KEY = "online-code-editor"

export function saveCode(code) {
  if (code === undefined || code === "null") {
    console.log('保存内容为空')
    return false
  }
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(code)
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
    return JSON.parse(data)
  } catch (error) {
    console.log("代码数据读取失败", error)
    return null
  }
}