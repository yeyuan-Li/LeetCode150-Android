/**
 * clicktest-target.js —— 每日目标切换的点击回归
 *
 * 真机报的 bug：每日目标 3 → 5 → 3 之后，今日题单仍然停在 5 题。
 * 根因是 store.planToday() 只补题不收缩（nos.length > target 时没处理），
 * 属于「逻辑正确、但逻辑本身缺一条分支」，只有把真实点击链路走一遍才看得出来。
 *
 * 本脚本断言：
 *   1. 目标 3 → 今日 3 行，plan 缓存 3 个
 *   2. 目标 5 → 今日 5 行，plan 缓存 5 个
 *   3. 目标 5 → 3 → 今日必须回到 3 行（本次修复的核心）
 *   4. 再调回 5 → 又变 5 行（可逆）
 *   5. 目标按钮的高亮与实际设置一致
 *   6. 全程无 JS 异常
 *
 * 用法：先起本地服务，再 node tools/clicktest-target.js
 *      BASE=http://127.0.0.1:8766 node tools/clicktest-target.js
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

async function main() {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true })

  const ch = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--remote-debugging-port=' + PORT,
    '--user-data-dir=' + fs.mkdtempSync(path.join(os.tmpdir(), 'lc150-tg-')),
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

  const shot = async (name) => {
    const s = await send('Page.captureScreenshot', { format: 'png' })
    fs.writeFileSync(path.join(OUT, name), Buffer.from(s.result.data, 'base64'))
  }

  // 按文本找 tab 并真实点击
  const goTab = async (label) => {
    const box = await evaluate(
      "(function(){var els=document.querySelectorAll('#tabbar .tab');for(var i=0;i<els.length;i++){" +
      "if(els[i].textContent.indexOf('" + label + "')>=0){var r=els[i].getBoundingClientRect();" +
      "return {x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2)}}}return null})()"
    )
    if (!box) return false
    await clickAt(box.x, box.y)
    await sleep(420)
    return true
  }

  // 点「我的」里的目标按钮
  const setTarget = async (n) => {
    if (!(await goTab('我的'))) return false
    const box = await evaluate(
      "(function(){var b=document.querySelector('[data-act=\"set-target\"][data-v=\"" + n + "\"]');" +
      "if(!b)return null;var r=b.getBoundingClientRect();" +
      "return {x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2)}})()"
    )
    if (!box) return false
    await clickAt(box.x, box.y)
    await sleep(320)
    return true
  }

  // 今日页快照：题单行数 + plan 缓存长度 + 设置里的目标 + 高亮的按钮
  const snapToday = async () => evaluate(
    "(function(){" +
    "var plan=null;try{plan=JSON.parse(localStorage.getItem('lc150:plan'))}catch(e){}" +
    "var st=null;try{st=JSON.parse(localStorage.getItem('lc150:settings'))}catch(e){}" +
    "var on=document.querySelector('[data-act=\"set-target\"].on');" +
    "return {rows:document.querySelectorAll('.qrow').length," +
    " plan:plan&&plan.nos?plan.nos.length:-1," +
    " target:st?st.dailyTarget:-1," +
    " segOn:on?Number(on.getAttribute('data-v')):-1}})()"
  )

  await send('Page.enable')
  await send('Runtime.enable')
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390, height: 844, deviceScaleFactor: 2, mobile: true
  })

  await send('Page.navigate', { url: BASE + '/index.html' })
  await sleep(1400)

  // 从干净状态开始，避免上一次测试留下的目标数干扰
  await evaluate("(function(){localStorage.clear();location.reload()})()")
  await sleep(1400)

  console.log('\n=== 1. 初始状态（默认 3 题） ===')
  let s = await snapToday()
  check('今日题单 3 行', s && s.rows === 3, JSON.stringify(s))
  check('plan 缓存 3 个题号', s && s.plan === 3, JSON.stringify(s))
  // 首次进应用时设置还没落盘，不能读 localStorage，改看今日页「今日完成 x/N」的分母
  const denom0 = await evaluate(
    "(function(){var s=document.querySelectorAll('.stats .stat');if(s.length<2)return null;" +
    "var t=s[1].querySelector('.v').textContent;var m=t.match(/\\/(\\d+)/);return m?Number(m[1]):null})()"
  )
  check('今日页分母显示 /3', denom0 === 3, String(denom0))

  console.log('\n=== 2. 目标 3 → 5 ===')
  check('点到「5 题」按钮', await setTarget(5))
  check('切到今日 tab', await goTab('今日'))
  s = await snapToday()
  check('今日题单变 5 行', s && s.rows === 5, JSON.stringify(s))
  check('plan 缓存补到 5 个', s && s.plan === 5, JSON.stringify(s))
  await shot('target-1-five.png')

  console.log('\n=== 3. 目标 5 → 3（本次修复的核心） ===')
  check('点到「3 题」按钮', await setTarget(3))
  check('切到今日 tab', await goTab('今日'))
  s = await snapToday()
  check('今日题单收缩回 3 行', s && s.rows === 3, JSON.stringify(s))
  check('plan 缓存收缩回 3 个', s && s.plan === 3, JSON.stringify(s))
  check('设置里的目标回到 3', s && s.target === 3, JSON.stringify(s))
  await shot('target-2-back-to-three.png')

  console.log('\n=== 4. 再调回 5（验证可逆） ===')
  check('再次点到「5 题」按钮', await setTarget(5))
  check('切到今日 tab', await goTab('今日'))
  s = await snapToday()
  check('今日题单又变 5 行', s && s.rows === 5, JSON.stringify(s))
  check('plan 缓存又补到 5 个', s && s.plan === 5, JSON.stringify(s))

  console.log('\n=== 5. 目标按钮高亮与实际设置一致 ===')
  await goTab('我的')
  const seg = await evaluate(
    "(function(){var on=document.querySelector('[data-act=\"set-target\"].on');" +
    "var st=JSON.parse(localStorage.getItem('lc150:settings'));" +
    "return {segOn:on?Number(on.getAttribute('data-v')):-1,target:st?st.dailyTarget:-1}})()"
  )
  check('高亮的按钮 = 实际目标（5）', seg && seg.segOn === 5 && seg.target === 5, JSON.stringify(seg))

  console.log('\n=== 6. 运行期异常 ===')
  check('全程无 JS 异常', errors.length === 0, errors.slice(0, 2).join(' | '))

  console.log('\n' + '─'.repeat(42))
  console.log('通过 ' + pass + ' 项，失败 ' + fail + ' 项')
  console.log('截图目录: ' + OUT)

  ws.close()
  ch.kill()
  process.exit(fail === 0 ? 0 : 1)
}

main().catch((e) => { console.error(e); process.exit(1) })
