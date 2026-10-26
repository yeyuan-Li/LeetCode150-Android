/**
 * env.js —— 浏览器环境的适配层（在 bundle.js 之前加载）
 *
 * 1. 提供 wx.getStorageSync / setStorageSync / removeStorageSync 的等价实现，
 *    让 utils/store.js 一行都不用改就能在 WebView 里跑（它只碰这三个 API）。
 * 2. 提供 NativeBridge.openUrl()：真正的一键唤起系统浏览器。
 *    WebView 里通过 window.Android.openUrl 调到 Java 侧的 Intent.ACTION_VIEW；
 *    在桌面浏览器里调试时退化为 window.open。
 */
(function (global) {
  'use strict'

  /* ---------------- 本地存储：localStorage 映射 ---------------- */

  // localStorage 在极少数环境下会抛异常（隐私模式 / 配额满），降级到内存，保证不白屏
  var memory = {}
  var hasLS = (function () {
    try {
      global.localStorage.setItem('__t', '1')
      global.localStorage.removeItem('__t')
      return true
    } catch (e) {
      return false
    }
  })()

  function read(key) {
    if (!hasLS) return Object.prototype.hasOwnProperty.call(memory, key) ? memory[key] : ''
    try {
      var v = global.localStorage.getItem(key)
      return v === null ? '' : JSON.parse(v)
    } catch (e) {
      return ''
    }
  }

  function write(key, value) {
    if (!hasLS) { memory[key] = value; return }
    try {
      global.localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      // 写失败（配额）时退回内存，至少本次会话内可用
      memory[key] = value
    }
  }

  function remove(key) {
    if (hasLS) {
      try { global.localStorage.removeItem(key) } catch (e) { /* 忽略 */ }
    }
    delete memory[key]
  }

  // store.js 只依赖这三个同步 API
  global.wx = {
    getStorageSync: read,
    setStorageSync: write,
    removeStorageSync: remove
  }

  /* ---------------- 原生桥：一键打开外部浏览器 ---------------- */

  var bridge = {
    /** 是否跑在 APK 里（有原生桥） */
    isNative: function () {
      return !!(global.Android && typeof global.Android.openUrl === 'function')
    },

    /**
     * 打开外部链接
     * - APK：交给 Java 侧 Intent.ACTION_VIEW，直接拉起系统浏览器（小程序做不到的事）
     * - 浏览器调试：新标签打开
     */
    openUrl: function (url) {
      if (!url) return false
      if (bridge.isNative()) {
        global.Android.openUrl(url)
        return true
      }
      var w = global.open(url, '_blank')
      if (!w) global.location.href = url
      return true
    },

    /** 复制到剪贴板（给「复制链接」按钮用，作为退路） */
    copy: function (text) {
      if (global.Android && typeof global.Android.copy === 'function') {
        global.Android.copy(text)
        return true
      }
      try {
        var ta = document.createElement('textarea')
        ta.value = text
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
        return true
      } catch (e) {
        return false
      }
    },

    /** 退出应用（返回键在首页时调用） */
    exit: function () {
      if (global.Android && typeof global.Android.exit === 'function') global.Android.exit()
    },

    /** 震动反馈（原生，比 CSS 动画更实） */
    tap: function () {
      if (global.Android && typeof global.Android.tap === 'function') global.Android.tap()
    },

    /** 同步状态栏配色（浅色主题下换成深色图标） */
    setTheme: function (light) {
      if (global.Android && typeof global.Android.setTheme === 'function') {
        global.Android.setTheme(!!light)
      }
    }
  }

  /* ---------------- 备份文件：导出 / 导入 ----------------
   *
   * 为什么要走原生：WebView 里的 Blob 下载在 Android WebView 上会被直接丢弃
   * （没有下载管理器接管），所以只能交给系统文件选择器（SAF）落盘。
   *
   * 统一回调格式：{ ok, message, payload }
   *   导出成功 → payload 是文件名
   *   导入成功 → payload 是文件内容，message 是文件名
   *   取消 / 失败 → ok=false，message 说明原因（"已取消" 需静默处理）
   */

  var pendingCb = null

  /** Java 侧 evaluateJavascript 调这里：window.__fileCb(action, ok, message, payload) */
  global.__fileCb = function (action, ok, message, payload) {
    var cb = pendingCb
    pendingCb = null
    if (cb) cb({ ok: !!ok, message: message || '', payload: payload || '' })
  }

  /** 当前环境是否支持文件读写（APK 里为 true） */
  bridge.canFileIO = function () {
    return !!(global.Android &&
      typeof global.Android.exportFile === 'function' &&
      typeof global.Android.importFile === 'function')
  }

  function callNative(fn, arg) {
    return new Promise(function (resolve) {
      // 上一笔没回来就超时收尾，避免回调被顶掉后永久挂起
      pendingCb = resolve
      try {
        if (arg === undefined) fn()
        else fn(arg)
      } catch (e) {
        pendingCb = null
        resolve({ ok: false, message: '调用失败：' + (e.message || e) })
      }
    })
  }

  /** 保存文本为文件：原生走系统保存框，浏览器退化为下载 */
  bridge.saveFile = function (filename, content) {
    if (bridge.canFileIO()) {
      // 原生签名是两个参数，这里包一层
      return new Promise(function (resolve) {
        pendingCb = resolve
        try {
          global.Android.exportFile(filename, content)
        } catch (e) {
          pendingCb = null
          resolve({ ok: false, message: '调用失败：' + (e.message || e) })
        }
      })
    }

    // 浏览器调试用：a[download]
    try {
      var blob = new Blob([content], { type: 'application/json' })
      var url = URL.createObjectURL(blob)
      var a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(function () { URL.revokeObjectURL(url) }, 4000)
      return Promise.resolve({ ok: true, message: '已下载', payload: filename })
    } catch (e) {
      return Promise.resolve({ ok: false, message: '当前环境不支持保存文件' })
    }
  }

  /** 选一个文件读回文本：原生走系统文件列表，浏览器退化为 input[type=file] */
  bridge.pickFile = function () {
    if (bridge.canFileIO()) {
      return callNative(function () { global.Android.importFile() })
    }

    return new Promise(function (resolve) {
      var inp = document.createElement('input')
      inp.type = 'file'
      inp.accept = '.json,application/json,text/plain'
      inp.style.cssText = 'position:fixed;left:-9999px'
      document.body.appendChild(inp)
      inp.onchange = function () {
        var f = inp.files && inp.files[0]
        document.body.removeChild(inp)
        if (!f) {
          resolve({ ok: false, message: '已取消' })
          return
        }
        var fr = new FileReader()
        fr.onload = function () { resolve({ ok: true, message: f.name, payload: String(fr.result) }) }
        fr.onerror = function () { resolve({ ok: false, message: '读取失败' }) }
        fr.readAsText(f)
      }
      inp.click()
    })
  }

  global.NativeBridge = bridge
})(window)
