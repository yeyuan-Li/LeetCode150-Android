/**
 * clicktest.js —— 真机行为的浏览器侧回归
 *
 * 为什么需要它：之前只做了「带 ?page=xxx 参数直接打开某页」的截图，
 * 从没真的点过底部 tab，结果 #tabbar 事件委托漏绑的 bug 一路漏到真机。
 * 本脚本用 CDP 派发真实鼠标事件点击每个 tab，并校验：
 *   1. 点击后高亮切到目标 tab
 *   2. 页面内容确实换成了目标页的独有元素
 *   3. 全程没有 JS 异常
 *
 * 用法：先起本地服务（node tools/serve.js 或 python -m http.server 8765），
 *      再 node tools/clicktest.js
 */
const { spawn } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE = process.env.BASE || 'http://127.0.0.1:8765'
const OUT = path.resolve(__dirname, '../build/shots')
const PORT = 9477

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

let pass = 0, fail = 0
function check(name, ok, detail) {
  if (ok) { pass++; console.log('  ✅ ' + name) }
  else { fail++; console.log('  ❌ ' + name + (detail ? '  → ' + detail : '')) }
}

async function main() {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true })

  const ch = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--remote-debugging-port=' + PORT,
    '--user-data-dir=' + fs.mkdtempSync(path.join(os.tmpdir(), 'lc150-ct-')),
    'about:blank'
  ], { stdio: 'ignore' })

  // 等调试端口就绪
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

  const shot = async (name) => {
    const s = await send('Page.captureScreenshot', { format: 'png' })
    fs.writeFileSync(path.join(OUT, name), Buffer.from(s.result.data, 'base64'))
  }

  await send('Page.enable')
  await send('Runtime.enable')
  // 390x844，模拟真机视口（Chrome 有 500px 最小窗口，必须用 CDP 覆盖）
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390, height: 844, deviceScaleFactor: 2, mobile: true
  })

  await send('Page.navigate', { url: BASE + '/index.html' })
  await sleep(1500)

  console.log('\n=== 1. 初始状态 ===')
  const boot_ = await evaluate("({nav: (document.querySelector('.nav-title')||{}).textContent, tabs: document.querySelectorAll('#tabbar .tab').length, on: (document.querySelector('#tabbar .tab.on span')||{}).textContent})")
  check('底部渲染出 4 个 tab', boot_ && boot_.tabs === 4, JSON.stringify(boot_))
  check('初始停在「今日」', boot_ && boot_.on === '今日', boot_ && boot_.on)
  check('页面无 JS 异常', errors.length === 0, errors.join(' | '))

  // 各 tab 的期望：标签名 → 该页独有的判定表达式
  const TABS = [
    { label: '题库', probe: "document.querySelectorAll('.grp').length >= 8" , desc: '8 个阶段分组' },
    { label: '进度', probe: "document.querySelectorAll('.ring').length === 1", desc: '总进度环' },
    { label: '我的', probe: "document.querySelectorAll('.setting').length >= 3", desc: '设置项' },
    { label: '今日', probe: "document.querySelectorAll('.stats').length === 1", desc: '打卡统计' }
  ]

  console.log('\n=== 2. 逐个点击底部 tab（真实鼠标事件） ===')
  for (let i = 0; i < TABS.length; i++) {
    const t = TABS[i]
    // 每次都重新取坐标，避免页面重排
    const box = await evaluate(
      "(function(){var els=document.querySelectorAll('#tabbar .tab');for(var i=0;i<els.length;i++){" +
      "if(els[i].textContent.indexOf('" + t.label + "')>=0){var r=els[i].getBoundingClientRect();" +
      "return {x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2)}}}return null})()"
    )
    if (!box) { check('找到「' + t.label + '」tab', false); continue }

    await clickAt(box.x, box.y)
    await sleep(450)

    const st = await evaluate(
      "({on:(document.querySelector('#tabbar .tab.on span')||{}).textContent," +
      " probe:(" + t.probe + ")," +
      " nav:(document.querySelector('.nav-title')||{}).textContent})"
    )
    check('点击「' + t.label + '」→ 高亮切换', st && st.on === t.label, '实际 ' + (st && st.on))
    check('点击「' + t.label + '」→ 内容渲染（' + t.desc + '）', st && st.probe === true, JSON.stringify(st))
    await shot('tab-' + (i + 1) + '-' + t.label + '.png')
  }

  console.log('\n=== 3. 页面内部交互 ===')
  // 题库 → 点第一道题 → 进详情 → 返回
  await evaluate("(function(){var e=document.querySelectorAll('#tabbar .tab');for(var i=0;i<e.length;i++){if(e[i].textContent.indexOf('题库')>=0){e[i].click()}}})()")
  await sleep(400)
  const q = await evaluate("(function(){var r=document.querySelector('.qrow');if(!r)return null;var b=r.getBoundingClientRect();return {x:Math.round(b.left+40),y:Math.round(b.top+20),no:r.getAttribute('data-no')}})()")
  if (q) {
    await clickAt(q.x, q.y)
    await sleep(500)
    const d = await evaluate("({nav:(document.querySelector('.nav-title')||{}).textContent, hasTimer:!!document.getElementById('timerBtn'), hasOpen:document.querySelectorAll('[data-act=\"open-url\"]').length})")
    check('题库点题目 → 打开详情页', d && d.hasTimer === true, JSON.stringify(d))
    check('详情页有「打开题目」按钮', d && d.hasOpen === 1)
    await shot('tab-5-detail.png')

    // 返回
    const bk = await evaluate("(function(){var b=document.querySelector('[data-act=\"back\"]');if(!b)return null;var r=b.getBoundingClientRect();return {x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2)}})()")
    if (bk) {
      await clickAt(bk.x, bk.y)
      await sleep(400)
      const backOk = await evaluate("document.querySelectorAll('.grp').length >= 8")
      check('详情页返回 → 回到题库', backOk === true)
    }
  } else {
    check('题库里找到题目行', false)
  }

  // 我的 → 切浅色主题
  await evaluate("(function(){var e=document.querySelectorAll('#tabbar .tab');for(var i=0;i<e.length;i++){if(e[i].textContent.indexOf('我的')>=0){e[i].click()}}})()")
  await sleep(400)
  const light = await evaluate(
    "(function(){var b=document.querySelectorAll('[data-act=\"set-theme\"]');" +
    "for(var i=0;i<b.length;i++){if(b[i].getAttribute('data-v')==='light'){b[i].click();return true}}return false})()"
  )
  await sleep(400)
  const isLight = await evaluate("document.body.className.indexOf('light')>=0")
  check('「我的」切浅色主题生效', light === true && isLight === true, 'light=' + light + ' body=' + isLight)
  await shot('tab-6-me-light.png')

  // 切回深色，避免影响后续
  await evaluate("(function(){var b=document.querySelectorAll('[data-act=\"set-theme\"]');for(var i=0;i<b.length;i++){if(b[i].getAttribute('data-v')==='dark'){b[i].click();return true}}})()")
  await sleep(300)

  console.log('\n=== 4. 全程异常检查 ===')
  check('无未捕获异常', errors.length === 0, errors.join(' | '))
  const errbar = await evaluate("!!document.getElementById('errbar')")
  check('没有触发错误兜底条', errbar === false)

  console.log('\n----------------------------------------')
  console.log('通过 ' + pass + ' 项，失败 ' + fail + ' 项')
  console.log('截图目录: ' + OUT)

  ch.kill()
  process.exit(fail === 0 ? 0 : 1)
}

main().catch((e) => { console.error(e); process.exit(1) })
