/**
 * clicktest-backup.js —— 备份/恢复链路的真实点击回归
 *
 * 教训来自上一版：只做「直接打开某页截图」，没真的点过按钮，
 * 结果事件绑定的 bug 一路漏到真机。所以这里同样用 CDP 派发真实鼠标事件。
 *
 * 做法：注入一个假的 window.Android，把原生层换成可观测的桩，
 * 于是「保存为文件 / 选择文件导入」这两条链路的 JS 部分能被完整走通
 * 并逐项断言（真正的 SAF 弹窗只能在真机上验）。
 *
 * 用法：先起本地服务（python -m http.server 8765），再 node tools/clicktest-backup.js
 */
const { spawn } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE = process.env.BASE || 'http://127.0.0.1:8765'
const OUT = path.resolve(__dirname, '../build/shots')
const PORT = 9479

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

let pass = 0, fail = 0
function check(name, ok, detail) {
  if (ok) { pass++; console.log('  ✅ ' + name) }
  else { fail++; console.log('  ❌ ' + name + (detail ? '  → ' + detail : '')) }
}

/* 注入到页面里的假原生层：记录调用、模拟用户操作结果 */
const STUB = `
window.__mock = { exports: [], importCalls: 0, copied: '', opened: '', pendingImport: null }

window.Android = {
  openUrl: function (u) { window.__mock.opened = u },
  copy: function (t) { window.__mock.copied = t },
  exit: function () {},
  tap: function () {},
  setTheme: function (l) { window.__mock.light = !!l },

  /* 模拟系统保存框：立刻视为「用户选了位置并保存成功」 */
  exportFile: function (name, content) {
    window.__mock.exports.push({ name: name, size: content.length, content: content })
    setTimeout(function () {
      window.__fileCb('export', true, '备份文件已保存', name)
    }, 40)
  },

  /* 模拟系统文件列表：内容由测试通过 __mock.pendingImport 预先放好 */
  importFile: function () {
    window.__mock.importCalls++
    var c = window.__mock.pendingImport
    if (c == null) {
      setTimeout(function () { window.__fileCb('import', false, '已取消', '') }, 40)
      return
    }
    setTimeout(function () {
      window.__fileCb('import', true, 'lc150-backup.json', c)
    }, 40)
  }
}
`

async function main() {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true })

  const ch = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--remote-debugging-port=' + PORT,
    '--user-data-dir=' + fs.mkdtempSync(path.join(os.tmpdir(), 'lc150-bk-')),
    'about:blank'
  ], { stdio: 'ignore' })

  let ready = false
  for (let i = 0; i < 80; i++) {
    try {
      const r = await fetch('http://127.0.0.1:' + PORT + '/json/version')
      if (r.ok) { ready = true; break }
    } catch (e) { /* 还没起 */ }
    await sleep(150)
  }
  if (!ready) { console.error('Chrome 调试端口未就绪'); ch.kill(); process.exit(1) }

  const target = await (await fetch('http://127.0.0.1:' + PORT + '/json/new?about:blank', { method: 'PUT' })).json()
  const ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((r) => { ws.onopen = r })

  let seq = 0
  const pending = new Map()
  const errors = []

  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data)
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); return }
    if (m.method === 'Runtime.exceptionThrown') {
      const d = m.params.exceptionDetails
      errors.push((d.exception && d.exception.description) || d.text)
    }
  }

  const send = (method, params) => new Promise((r) => {
    const id = ++seq
    pending.set(id, r)
    ws.send(JSON.stringify({ id, method, params: params || {} }))
  })

  const evaluate = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })
    if (r.result && r.result.exceptionDetails) return { __err: r.result.exceptionDetails.text }
    return r.result && r.result.result ? r.result.result.value : undefined
  }

  const clickAt = async (x, y) => {
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1, buttons: 1 })
    await sleep(40)
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1, buttons: 0 })
  }

  /* 按选择器真实点击（滚到可视区再点，避免点到屏幕外） */
  const clickSel = async (sel) => {
    const box = await evaluate(
      "(function(){var el=document.querySelector(" + JSON.stringify(sel) + ");" +
      "if(!el)return null;el.scrollIntoView({block:'center'});" +
      "var r=el.getBoundingClientRect();" +
      "return {x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2),w:r.width,h:r.height}})()"
    )
    if (!box || !box.w) return false
    await clickAt(box.x, box.y)
    await sleep(320)
    return true
  }

  const shot = async (name) => {
    const s = await send('Page.captureScreenshot', { format: 'png' })
    fs.writeFileSync(path.join(OUT, name), Buffer.from(s.result.data, 'base64'))
  }

  const boot = async () => {
    await send('Page.navigate', { url: BASE + '/index.html' })
    await sleep(1400)
  }

  await send('Page.enable')
  await send('Runtime.enable')
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390, height: 844, deviceScaleFactor: 2, mobile: true
  })
  // 在页面任何脚本之前注入假原生层
  await send('Page.addScriptToEvaluateOnNewDocument', { source: STUB })

  /* ============================================================
   * 1. 干净启动 + 造一点真实进度
   * ============================================================ */
  console.log('\n=== 1. 准备初始数据 ===')
  await boot()
  await evaluate('localStorage.clear()')
  await boot()

  const seeded = await evaluate(`(function(){
    var s = window.LC150.store
    s.completeQuestion(242, { grade: 'hint', minutes: 23, note: '哈希计数' })
    s.completeQuestion(49, { grade: 'indep', minutes: 15, note: '' })
    s.completeQuestion(76, { grade: 'solution', minutes: 41, note: '看题解才懂' })
    return Object.keys(s.getAllProgress()).length
  })()`)
  check('造出 3 题进度', seeded === 3, '实际 ' + seeded)
  await boot()   // 重新加载，让界面读到最新数据

  /* ============================================================
   * 2. 导出：真实点击「保存为文件」
   * ============================================================ */
  console.log('\n=== 2. 导出为文件（真实点击） ===')

  check('点开「我的」tab', await clickSel("#tabbar .tab:nth-child(4)"))
  const mePage = await evaluate("(document.querySelector('.nav-title')||{}).textContent")
  check('已在我的页', mePage === '我的', mePage)

  check('展开「导出数据」面板', await clickSel('[data-act="panel"][data-p="export"]'))
  const hasPrimary = await evaluate("!!document.querySelector('[data-act=\"export-file\"]')")
  check('面板里出现「保存为文件」主按钮', hasPrimary === true)

  check('点击「保存为文件」', await clickSel('[data-act="export-file"]'))
  await sleep(600)

  const exp = await evaluate('(function(){var e=window.__mock.exports;return e.length?{name:e[0].name,size:e[0].size,content:e[0].content}:null})()')
  check('原生导出接口被调用', exp !== null)
  if (exp) {
    check('文件名带日期：lc150-backup-YYYY-MM-DD.json',
      /^lc150-backup-\d{4}-\d{2}-\d{2}\.json$/.test(exp.name), exp.name)
    check('内容非空且超过 200 字节', exp.size > 200, exp.size + ' 字节')

    let parsed = null
    try { parsed = JSON.parse(exp.content) } catch (e) { /* 下面断言会报 */ }
    check('内容是合法 JSON', parsed !== null)
    check('内容带 app 标识', parsed && parsed.app === 'lc150')
    check('内容含 3 题记录', parsed && Object.keys(parsed.progress).length === 3,
      parsed && Object.keys(parsed.progress).length)
    check('内容含备注', parsed && parsed.progress['242'].note === '哈希计数')
  }

  const afterExport = await evaluate("(document.querySelector('.toast')||{}).textContent || ''")
  check('弹出「已保存」提示', /已保存/.test(afterExport), afterExport)
  await shot('bk-1-导出.png')

  /* 确保某面板处于展开态（已展开就不重复点，否则会把它收起来） */
  const ensurePanel = async (p) => {
    const hasImport = await evaluate("!!document.querySelector('[data-act=\"import-file\"]')")
    const hasExport = await evaluate("!!document.querySelector('[data-act=\"export-file\"]')")
    if (p === 'import' && hasImport) return true
    if (p === 'export' && hasExport) return true
    await clickSel('[data-act="panel"][data-p="' + p + '"]')
    await sleep(200)
    return p === 'import'
      ? await evaluate("!!document.querySelector('[data-act=\"import-file\"]')")
      : await evaluate("!!document.querySelector('[data-act=\"export-file\"]')")
  }

  /* ============================================================
   * 3. 新设备：清空后从文件导入，进度应完整回来
   * ============================================================ */
  console.log('\n=== 3. 模拟新设备：清空 → 导入 ===')

  const fileContent = exp ? exp.content : ''
  await evaluate('localStorage.clear()')
  await boot()

  const emptyCount = await evaluate('Object.keys(window.LC150.store.getAllProgress()).length')
  check('新设备初始为空', emptyCount === 0, '实际 ' + emptyCount)

  // 把「用户选中的那个文件」放进桩里
  await evaluate('window.__mock.pendingImport=' + JSON.stringify(fileContent))

  check('点开「我的」tab', await clickSel("#tabbar .tab:nth-child(4)"))
  check('展开「导入数据」面板', await ensurePanel('import'))
  check('点击「选择文件导入」', await clickSel('[data-act="import-file"]'))
  await sleep(700)

  const importCalls = await evaluate('window.__mock.importCalls')
  check('原生选择文件接口被调用', importCalls === 1, '调用 ' + importCalls + ' 次')

  const restored = await evaluate(`(function(){
    var s = window.LC150.store
    var all = s.getAllProgress()
    return { count: Object.keys(all).length, note: s.detailView(242).note, reviews: s.detailView(76).reviews.length }
  })()`)
  check('3 题记录全部恢复', restored && restored.count === 3, JSON.stringify(restored))
  check('备注一起恢复', restored && restored.note === '哈希计数', restored && restored.note)
  check('复习排期一起恢复（3 轮）', restored && restored.reviews === 3, restored && restored.reviews)

  const afterImport = await evaluate("(document.querySelector('.toast')||{}).textContent || ''")
  check('弹出导入成功提示', /已导入/.test(afterImport), afterImport)
  await shot('bk-2-导入.png')

  /* ============================================================
   * 4. 撤销：误把别的备份导进来，能撤回
   * ============================================================ */
  console.log('\n=== 4. 导入错文件 → 撤销 ===')

  // 此时设备上有 3 题；塞一个只有 1 题的「错文件」
  const wrongFile = JSON.stringify({
    app: 'lc150',
    version: 1,
    progress: { '1': { done: true, grade: 'indep', minutes: 10, reviews: [], history: [] } },
    settings: { dailyTarget: 3, examMode: false, theme: 'dark' }
  })
  await evaluate('window.__mock.pendingImport=' + JSON.stringify(wrongFile))

  check('展开「导入数据」面板', await ensurePanel('import'))
  check('点击「选择文件导入」（错文件）', await clickSel('[data-act="import-file"]'))
  await sleep(700)

  const afterWrong = await evaluate('Object.keys(window.LC150.store.getAllProgress()).length')
  check('错文件确实生效了（变 1 题）', afterWrong === 1, '实际 ' + afterWrong)

  check('展开「导入数据」面板', await ensurePanel('import'))
  const hasUndo = await evaluate("!!document.querySelector('[data-act=\"undo-import\"]')")
  check('出现「撤销上次导入」入口', hasUndo === true)

  if (hasUndo) {
    check('点击「撤销上次导入」', await clickSel('[data-act="undo-import"]'))
    const modalShown = await evaluate("!document.getElementById('modal').hidden")
    check('弹出二次确认', modalShown === true)

    check('确认撤销', await clickSel('#modal-ok'))
    await sleep(500)

    const afterUndo = await evaluate(`(function(){
      var s = window.LC150.store
      return { n: Object.keys(s.getAllProgress()).length, note: s.detailView(242).note }
    })()`)
    check('撤销后回到 3 题', afterUndo && afterUndo.n === 3, JSON.stringify(afterUndo))
    check('撤销后备注也回来了', afterUndo && afterUndo.note === '哈希计数', afterUndo && afterUndo.note)
    check('撤销入口消失（只能用一次）',
      (await evaluate("!!document.querySelector('[data-act=\"undo-import\"]')")) === false)
    await shot('bk-3-撤销.png')
  }

  /* ============================================================
   * 5. 导入非法文件：必须拒绝且不覆盖
   * ============================================================ */
  console.log('\n=== 5. 非法文件必须被拒 ===')

  const beforeBad = await evaluate('Object.keys(window.LC150.store.getAllProgress()).length')
  await evaluate('window.__mock.pendingImport=' + JSON.stringify('{"app":"lc150","progress":{"88888":{"done":true}}}'))

  check('展开「导入数据」面板', await ensurePanel('import'))
  check('点击「选择文件导入」（非法文件）', await clickSel('[data-act="import-file"]'))
  await sleep(700)

  const modalTitle = await evaluate("(document.getElementById('modal-title')||{}).textContent || ''")
  const modalText = await evaluate("(document.getElementById('modal-body')||{}).textContent || ''")
  check('弹出「导入失败」', /导入失败/.test(modalTitle), modalTitle + ' / ' + modalText)
  check('未覆盖现有数据',
    (await evaluate('Object.keys(window.LC150.store.getAllProgress()).length')) === beforeBad,
    '之前 ' + beforeBad)
  check('提示里说明数据未改动', /没有任何改动|没有被改动/.test(modalText), modalText)
  await shot('bk-4-导入失败.png')

  /* ============================================================
   * 6. 粘贴文本这条退路仍然可用
   * ============================================================ */
  console.log('\n=== 6. 粘贴文本退路 ===')

  await clickSel('#modal-ok')
  await sleep(250)
  await ensurePanel('import')

  check('点「改为粘贴文本」展开输入框', await clickSel('[data-act="toggle-paste"]'))
  const hasBox = await evaluate("!!document.getElementById('importBox')")
  check('粘贴框已渲染', hasBox === true)

  if (hasBox && fileContent) {
    await evaluate("(function(){var b=document.getElementById('importBox');b.value=" +
      JSON.stringify(fileContent) + "})()")
    check('点「校验并导入」', await clickSel('[data-act="do-import"]'))
    await sleep(600)
    const cnt = await evaluate('Object.keys(window.LC150.store.getAllProgress()).length')
    check('粘贴导入同样恢复 3 题', cnt === 3, '实际 ' + cnt)
  }

  /* ============================================================
   * 7. 全程无异常
   * ============================================================ */
  console.log('\n=== 7. 运行期异常 ===')
  check('全程无 JS 异常', errors.length === 0, errors.join(' | '))

  console.log('')
  console.log('──────────────────────────────────────────')
  console.log('通过 ' + pass + ' 项，失败 ' + fail + ' 项')

  ch.kill()
  process.exit(fail === 0 ? 0 : 1)
}

main().catch((e) => {
  console.error('测试脚本异常：', e)
  process.exit(1)
})
