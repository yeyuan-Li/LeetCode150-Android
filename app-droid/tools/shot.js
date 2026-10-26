#!/usr/bin/env node
/**
 * shot.js —— 用 Chrome DevTools Protocol 按真机尺寸截图
 *
 * 为什么不用 chrome --screenshot：
 * 无头 Chrome 有最小窗口宽度限制（约 500px），传 --window-size=390 会被静默放大，
 * 截出来的图看起来像"横向溢出"，其实是假象。
 * CDP 的 Emulation.setDeviceMetricsOverride 可以精确设定 CSS 视口，结果才可信。
 *
 * 用法：node tools/shot.js [baseUrl]
 * 依赖：Node 22+（内置 fetch 与 WebSocket），无需安装任何包
 */

const { spawn } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')

const CHROME = process.env.CHROME_BIN ||
  'C:/Program Files/Google/Chrome/Application/chrome.exe'
const PORT = 9333
const BASE = process.argv[2] || 'http://127.0.0.1:8765/index.html'

// 390x844 = iPhone 14/15 逻辑尺寸
const VIEW = { width: 390, height: 844, deviceScaleFactor: 2, mobile: true }

const PAGES = [
  { name: '1-today', url: BASE + '?page=today' },
  { name: '2-bank', url: BASE + '?page=bank' },
  { name: '3-detail', url: BASE + '?page=detail&no=242' },
  { name: '4-review', url: BASE + '?page=review' },
  { name: '5-stats', url: BASE + '?page=stats' },
  { name: '6-me', url: BASE + '?page=me' }
]

const OUT_DIR = path.resolve(__dirname, '../build/shots')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function waitPort(times = 60) {
  for (let i = 0; i < times; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`)
      if (r.ok) return true
    } catch (e) { /* 还没起来 */ }
    await sleep(200)
  }
  throw new Error('Chrome 调试端口未就绪')
}

function makeClient(wsUrl) {
  const ws = new WebSocket(wsUrl)
  let seq = 0
  const pending = new Map()

  const ready = new Promise((resolve, reject) => {
    ws.onopen = resolve
    ws.onerror = reject
  })

  ws.onmessage = (ev) => {
    let msg
    try { msg = JSON.parse(ev.data) } catch (e) { return }
    if (msg.id && pending.has(msg.id)) {
      const fn = pending.get(msg.id)
      pending.delete(msg.id)
      fn(msg)
    }
  }

  function send(method, params) {
    return new Promise((resolve) => {
      const id = ++seq
      pending.set(id, resolve)
      ws.send(JSON.stringify({ id, method, params: params || {} }))
    })
  }

  return { ready, send, close: () => ws.close() }
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'lc150-shot-'))

  const chrome = spawn(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--disable-extensions',
    '--remote-debugging-port=' + PORT,
    '--user-data-dir=' + profile,
    'about:blank'
  ], { stdio: 'ignore' })

  try {
    await waitPort()

    for (const p of PAGES) {
      // 每个页面新开一个 target，避免上一页 localStorage 污染
      const res = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })
      const target = await res.json()

      const client = makeClient(target.webSocketDebuggerUrl)
      await client.ready

      await client.send('Page.enable')
      await client.send('Emulation.setDeviceMetricsOverride', VIEW)
      await client.send('Emulation.setEmulatedMedia', {
        features: [{ name: 'prefers-color-scheme', value: 'dark' }]
      })
      await client.send('Page.navigate', { url: p.url })
      await sleep(1400)

      const shot = await client.send('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: false
      })

      const file = path.join(OUT_DIR, p.name + '.png')
      fs.writeFileSync(file, Buffer.from(shot.result.data, 'base64'))
      const kb = (fs.statSync(file).size / 1024).toFixed(0)
      console.log(`  ${p.name.padEnd(10)} ${VIEW.width}x${VIEW.height}  ${kb} KB`)

      client.close()
      await fetch(`http://127.0.0.1:${PORT}/json/close/${target.id}`)
    }

    console.log('\n截图完成 → ' + OUT_DIR)
  } finally {
    chrome.kill()
  }
}

main().catch((e) => {
  console.error('截图失败:', e.message)
  process.exit(1)
})
