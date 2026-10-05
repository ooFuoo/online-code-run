export function buildPreview(html, css, js, runId = 0) {

  const safeJs = js.replace(/<\/script>/gi, '<\\/script>')
  const safeHtml = html.replace(/<\/script>/gi, '&lt;/script&gt;')

  return `
<!DOCTYPE html>
  <html lang="zh-CN">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        ${css}
      </style>
    </head>
    <body>
      ${safeHtml}
      <script>
       const RUN_ID = ${JSON.stringify(runId)}
        const methods = ['log', 'warn', 'error']
methods.forEach(method => {
  const original = console[method]
  console[method] = (...args) => {
    try {
          window.parent.postMessage({
            type: 'console',
             runId: RUN_ID,
            level: method,
            args: args.map(a => {
              try { return JSON.parse(JSON.stringify(a)) }
              catch { return String(a) }
            })
          }, '*')
        } catch (e) {

        }
        original(...args)
  }
})

// 运行时同步错误
window.onerror = (message, source, line, column, error) => {
  try {
          window.parent.postMessage({
            type: 'runtime-error',
             runId: RUN_ID,
            kind: 'error',
            message: String(message),
            source: source || '',
            line: line || 0,
            column: column || 0,
            stack: error?.stack || ''
          }, '*')
        } catch (e) { }
        return false
}

// 捕获promise产生的错误
window.addEventListener('unhandledrejection', (e) => {
  try {
          window.parent.postMessage({
            type: 'runtime-error',
             runId: RUN_ID,
            kind: 'unhandledrejection',
            message: e.reason?.message || String(e.reason),
            source: '',
            line: 0,
            column: 0,
            stack: e.reason?.stack || ''
          }, '*')
        } catch (e) { }
})

        ${safeJs}
        // 执行完发消息
        window.parent.postMessage({
          type:'execution-complete',
           runId: RUN_ID,
     },'*')

        <\/script>
    </body>
  </html>
  `
}