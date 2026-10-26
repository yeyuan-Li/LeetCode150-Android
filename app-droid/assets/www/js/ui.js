/**
 * ui.js —— 应用界面层
 *
 * 设计原则：
 * 1. 业务逻辑（存储、排期、门禁、统计）全部来自 window.LC150（即小程序同一份源码），
 *    本文件只负责渲染与交互，不碰 localStorage。
 * 2. 路由用栈管理，返回键由 Java 侧调 window.__handleBack()。
 * 3. 「打开题目」直接走 NativeBridge.openUrl → 系统浏览器，这是小程序做不到的核心能力。
 */
(function () {
  'use strict'

  var LC = window.LC150
  var store = LC.store
  var bank = LC.bank
  var date = LC.date
  var bridge = window.NativeBridge

  /* ============================================================
   * 图标（内联 SVG，不引任何图片资源）
   * ============================================================ */
  var PATHS = {
    today: '<rect x="3" y="4.5" width="18" height="16" rx="3"/><path d="M8 3v3M16 3v3M3 9.5h18"/><path d="M8.5 14h2M13.5 14h2M8.5 17.5h2"/>',
    bank: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v18H6.5A2.5 2.5 0 0 1 4 18.5z"/><path d="M4 17.5h15"/><path d="M9 7.5h6"/>',
    stats: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    me: '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c1.2-3.6 4-5.4 7.5-5.4s6.3 1.8 7.5 5.4"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>',
    external: '<path d="M14 4h6v6"/><path d="M20 4l-8.5 8.5"/><path d="M19 14.5V18a2.5 2.5 0 0 1-2.5 2.5H6A2.5 2.5 0 0 1 3.5 18V7.5A2.5 2.5 0 0 1 6 5h3.5"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M15 6.5A2.5 2.5 0 0 0 12.5 4H6A2.5 2.5 0 0 0 3.5 6.5V15"/>',
    check: '<path d="M4 12.5l5 5 11-11"/>',
    lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
    star: '<path d="M12 3.5l2.7 5.6 6.1.9-4.4 4.3 1 6-5.4-2.9-5.4 2.9 1-6L3.2 10l6.1-.9z"/>',
    fire: '<path d="M12 3s5 4.2 5 9a5 5 0 0 1-10 0c0-2 1-3.4 1-3.4S8.6 11 10 11c1.6 0 1.4-2.2 1.4-4.2C11.4 5.4 12 3 12 3z"/>',
    play: '<path d="M7 4.5l12 7.5-12 7.5z"/>',
    pause: '<rect x="7" y="4.5" width="3.5" height="15" rx="1"/><rect x="13.5" y="4.5" width="3.5" height="15" rx="1"/>'
  }

  function icon(name, size) {
    var s = size || 20
    return '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" ' +
      'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (PATHS[name] || '') + '</svg>'
  }

  /* ============================================================
   * 轻提示 / 二次确认
   * ============================================================ */
  var toastEl = document.getElementById('toast')
  var toastTimer = null

  function toast(msg, ms) {
    toastEl.textContent = msg
    toastEl.classList.add('show')
    if (toastTimer) clearTimeout(toastTimer)
    toastTimer = setTimeout(function () { toastEl.classList.remove('show') }, ms || 1700)
  }

  var modalEl = document.getElementById('modal')
  var modalCb = null

  function confirmBox(opts) {
    document.getElementById('modal-title').textContent = opts.title || '确认'
    document.getElementById('modal-body').textContent = opts.body || ''
    var ok = document.getElementById('modal-ok')
    ok.textContent = opts.ok || '确定'
    ok.className = 'modal-btn' + (opts.danger ? ' danger' : '')
    document.getElementById('modal-cancel').textContent = opts.cancel || '取消'
    modalCb = opts.onOk || null
    modalEl.hidden = false
  }

  function closeModal() {
    modalEl.hidden = true
    modalCb = null
  }

  document.getElementById('modal-cancel').addEventListener('click', closeModal)
  document.getElementById('modal-ok').addEventListener('click', function () {
    var cb = modalCb
    closeModal()
    if (cb) cb()
  })

  /* ============================================================
   * 路由（栈式）
   * ============================================================ */
  var TABS = [
    { key: 'today', label: '今日', icon: 'today' },
    { key: 'bank', label: '题库', icon: 'bank' },
    { key: 'stats', label: '进度', icon: 'stats' },
    { key: 'me', label: '我的', icon: 'me' }
  ]

  var app = document.getElementById('app')
  var routeStack = [{ name: 'today' }]
  var scrollMemo = {}

  function current() {
    return routeStack[routeStack.length - 1]
  }

  function go(r) {
    scrollMemo[current().name] = window.scrollY
    routeStack.push(r)
    window.scrollTo(0, 0)
    render()
  }

  function back() {
    if (routeStack.length <= 1) return false
    routeStack.pop()
    render()
    var y = scrollMemo[current().name] || 0
    setTimeout(function () { window.scrollTo(0, y) }, 0)
    return true
  }

  function switchTab(key) {
    if (routeStack.length === 1 && current().name === key) {
      window.scrollTo(0, 0)
      return
    }
    scrollMemo[current().name] = window.scrollY
    routeStack = [{ name: key }]
    window.scrollTo(0, 0)
    render()
  }

  // 交给 Java 侧：返回键先给 JS 处理，处理不了再退出应用
  window.__handleBack = function () {
    if (!modalEl.hidden) { closeModal(); return }
    if (detailState.no) { stopTimer(); detailState.no = 0 }
    if (!back()) bridge.exit()
  }

  /* ============================================================
   * 通用片段
   * ============================================================ */
  function navBar(title, opts) {
    opts = opts || {}
    var left = opts.back
      ? '<button class="nav-btn" data-act="back">' + icon('back') + '</button>'
      : ''
    return '<div class="nav solid">' + left +
      '<div class="nav-title">' + title + (opts.sub ? '<span class="nav-sub">' + opts.sub + '</span>' : '') + '</div>' +
      '<div class="nav-right">' + (opts.right || '') + '</div></div>'
  }

  function tabbarHtml() {
    var cur = current().name
    return TABS.map(function (t) {
      var on = (cur === t.key) ? ' on' : ''
      var bub = ''
      if (t.key === 'today') {
        var due = store.summary().dueCount
        if (due > 0) bub = '<i class="bubble">' + (due > 99 ? '99+' : due) + '</i>'
      }
      return '<div class="tab' + on + '" data-act="tab" data-tab="' + t.key + '">' +
        icon(t.icon, 21) + '<span>' + t.label + '</span>' + bub + '</div>'
    }).join('')
  }

  function emptyBox(e1, e2, e3) {
    return '<div class="empty"><div class="e1">' + e1 + '</div><div class="e2">' + e2 + '</div>' +
      (e3 ? '<div class="e3">' + e3 + '</div>' : '') + '</div>'
  }

  /* ============================================================
   * ① 今日
   * ============================================================ */
  function renderToday() {
    var s = store.summary()
    var v = store.todayView()
    var target = s.dailyTarget
    var doneToday = s.todayDone

    var html = navBar('今天', { sub: v.dateText, right: '' })

    html += '<div class="page">'
    html += '<div class="stats">' +
      '<div class="stat"><div class="v">' + s.streak + '</div><div class="k">连续打卡</div></div>' +
      '<div class="stat"><div class="v">' + doneToday + '<span class="muted" style="font-size:13px;font-weight:500">/' + target + '</span></div><div class="k">今日完成</div></div>' +
      '<div class="stat link" data-act="go-review"><div class="v">' + s.dueCount + '</div><div class="k">待复习</div>' +
      (s.dueCount > 0 ? '<i class="dot">' + s.dueCount + '</i>' : '') + '</div>' +
      '</div>'

    if (s.dueCount > 0) {
      html += '<div class="card" style="display:flex;align-items:center;gap:10px;padding:12px 14px" data-act="go-review">' +
        '<span style="color:var(--hard)">' + icon('fire', 18) + '</span>' +
        '<div class="grow"><div style="font-size:13.5px;font-weight:600">该复习了</div>' +
        '<div class="small muted">' + s.dueCount + ' 道题到期，趁热回顾一遍</div></div>' +
        '<span class="muted">›</span></div>'
    }

    html += '<div class="sec-title">今日题单 · ' + v.rows.length + ' 题待做</div>'

    if (v.total === 0) {
      html += '<div class="card">' + emptyBox('🎯', '今日还没有题单', '去「我的」设置每日目标') + '</div>'
    } else if (v.rows.length === 0) {
      html += '<div class="card">' + emptyBox('✅', '今日收工', '目标 ' + target + ' 题已全部完成') + '</div>'
    } else {
      html += '<div class="card tight">' + v.rows.map(function (r) {
        return qrow(r)
      }).join('') + '</div>'
    }

    // 今日已完成的部分
    if (v.doneNos.length > 0) {
      html += '<div class="sec-title">今天已完成 · ' + v.doneNos.length + ' 题</div>'
      html += '<div class="card tight">' + v.doneNos.map(function (no) {
        var q = bank.byNo(no)
        var p = store.getProgress(no)
        return qrow(bank.toRow(q, p))
      }).join('') + '</div>'
    }

    html += '</div>'
    return html
  }

  function qrow(r) {
    var right = ''
    if (r.pendingReview) right += '<span class="pend">待复习</span>'
    if (r.done) right += '<span class="ok">' + icon('check', 15) + '</span>'
    return '<div class="qrow" data-act="open-detail" data-no="' + r.no + '">' +
      '<div class="no">' + r.no + '</div>' +
      '<div class="mid"><div class="t1 ellipsis">' + esc(r.titleCn) + '</div>' +
      '<div class="t2 ellipsis">' + esc(r.titleEn) + (r.stageTitle ? ' · ' + esc(r.stageTitle) : '') + '</div></div>' +
      (r.star ? '<span class="star">★</span>' : '') +
      '<i class="d ' + r.diffClass + '"></i>' +
      right + '</div>'
  }

  /* ============================================================
   * ② 题库
   * ============================================================ */
  var bankState = { filter: 'all', keyword: '', open: {} }

  function renderBank() {
    var stages = bank.stageList()
    var stats = store.stageStats()

    // 默认展开：第一个没做完的阶段
    if (Object.keys(bankState.open).length === 0) {
      for (var i = 0; i < stats.length; i++) {
        if (stats[i].done < stats[i].total) { bankState.open[stats[i].stage] = true; break }
      }
      if (Object.keys(bankState.open).length === 0) bankState.open[1] = true
    }

    var html = navBar('题库', { sub: '150 题 · 8 阶段' })
    html += '<div class="page">'

    html += '<div class="search">' + icon('search', 16) +
      '<input id="kw" type="search" inputmode="search" placeholder="搜题号或题名" value="' + esc(bankState.keyword) + '">' +
      (bankState.keyword ? '<span class="clr" data-act="clear-kw">✕</span>' : '') +
      '</div>'

    var chips = [
      ['all', '全部'], ['todo', '未做'], ['done', '已完成'], ['due', '待复习'], ['star', '仅★'],
      ['Easy', 'Easy'], ['Medium', 'Medium'], ['Hard', 'Hard']
    ]
    html += '<div class="chips">' + chips.map(function (c) {
      return '<span class="chip' + (bankState.filter === c[0] ? ' on' : '') + '" data-act="filter" data-f="' + c[0] + '">' + c[1] + '</span>'
    }).join('') + '</div>'

    html += '<div id="stageList">' + stageListHtml(stages, stats) + '</div>'
    html += '</div>'
    return html
  }

  function stageListHtml(stages, stats) {
    var filtering = bankState.filter !== 'all' || bankState.keyword

    return stages.map(function (s, idx) {
      var st = stats[idx]
      var qs = bank.stageQuestions(s.stage)
      var rows = qs.filter(function (q) { return matchFilter(q) })

      // 筛选状态下若本阶段无匹配，整组隐藏
      if (filtering && rows.length === 0) return ''

      var open = filtering ? true : !!bankState.open[s.stage]
      var pct = st.total ? Math.round(st.done / st.total * 100) : 0

      var head = '<div class="grp-head" data-act="toggle-stage" data-stage="' + s.stage + '">' +
        '<span class="grp-idx">' + s.indexCn + '</span>' +
        '<div class="grow"><div class="grp-title ellipsis">' + esc(s.title) + '</div>' +
        '<div class="grp-meta">' + rows.length + ' / ' + s.total + ' 题 · 完成 ' + st.done + ' · 独立率 ' + st.rate + '%' +
        (st.unlocked ? '' : ' · <span class="grp-lock">待解锁</span>') + '</div>' +
        '<div class="bar"><i style="width:' + pct + '%"></i></div></div>' +
        '<span class="grp-arrow">›</span></div>'

      var body = open && rows.length
        ? rows.map(function (q) { return qrow(bank.toRow(q, store.getProgress(q.no))) }).join('')
        : ''

      return '<div class="grp' + (open ? ' open' : '') + '">' + head + body + '</div>'
    }).join('')
  }

  function matchFilter(q) {
    var p = store.getProgress(q.no)
    var kw = bankState.keyword.trim().toLowerCase()

    if (kw) {
      var byNo = String(q.no).indexOf(kw) === 0
      var byTitle = q.titleCn.toLowerCase().indexOf(kw) >= 0 || q.titleEn.toLowerCase().indexOf(kw) >= 0
      if (!byNo && !byTitle) return false
    }

    var f = bankState.filter
    if (f === 'todo') return !p.done
    if (f === 'done') return !!p.done
    if (f === 'star') return !!q.star
    if (f === 'due') return !!(p.done && p.reviews && p.reviews.some(function (r) { return !r.done && date.diffDays(r.due, date.today()) >= 0 }))
    if (f === 'Easy' || f === 'Medium' || f === 'Hard') return q.difficulty === f
    return true
  }

  function refreshStageList() {
    var box = document.getElementById('stageList')
    if (!box) return
    box.innerHTML = stageListHtml(bank.stageList(), store.stageStats())
  }

  /* ============================================================
   * ③ 详情
   * ============================================================ */
  var detailState = { no: 0, mode: 'edit', round: 0, grade: '', note: '', duration: 25 * 60, baseMs: 0, lastStart: 0, ticker: null }
  var DEFAULT_MIN = 25
  var HARD_MIN = 40

  function renderDetail(r) {
    var no = r.no
    var q = store.detailView(no)
    if (!q) {
      return navBar('题目不存在', { back: true }) + '<div class="page">' + emptyBox('✕', '题目不存在') + '</div>'
    }

    // 初始化计时状态（只在换题时重置）
    if (detailState.no !== no || detailState.mode !== (r.mode || 'edit')) {
      stopTimer()
      detailState.no = no
      detailState.mode = r.mode || 'edit'
      detailState.round = r.round || 0
      detailState.grade = ''
      detailState.note = q.note || ''
      detailState.duration = (q.difficulty === 'Hard' ? HARD_MIN : DEFAULT_MIN) * 60
      detailState.baseMs = 0
      detailState.lastStart = Date.now()
    }

    var isReview = detailState.mode === 'review'
    var isDone = !!q.done
    var examMode = !!store.getSettings().examMode

    var html = navBar('NO.' + no, { back: true, sub: isReview ? '复习模式' : '' })
    html += '<div class="page has-actionbar">'

    // 标题区
    html += '<div class="detail-head">'
    html += '<div class="detail-no">NO.' + no + ' · 第 ' + q.order + ' 题</div>'
    html += '<div class="detail-title">' + esc(q.titleCn) + '</div>'
    html += '<div class="detail-en">' + esc(q.titleEn) + '</div>'
    html += '<div class="detail-tags">'
    html += '<span class="badge ' + q.diffClass + '">' + q.diffName + '</span>'
    if (q.star) html += '<span class="badge medium">★ 高频</span>'
    if (!examMode) {
      html += '<span class="badge">阶段' + q.stageCn + ' · ' + esc(q.stageTitle) + '</span>'
      html += '<span class="badge">' + esc(q.topic) + '</span>'
    }
    if (isReview) html += '<span class="badge accent">第 ' + detailState.round + ' 轮复习</span>'
    html += '</div></div>'

    // ★ 一键打开浏览器（核心能力）
    html += '<button class="btn-open" data-act="open-url" data-no="' + no + '">' +
      icon('external', 17) + '打开题目</button>'
    html += '<div class="btn-open-sub">点击直接用浏览器打开 leetcode.cn，无需复制粘贴</div>'

    // 计时
    html += '<div class="card" style="margin-top:12px">' +
      '<div class="row" style="justify-content:space-between">' +
      '<span class="small muted">专注计时</span>' +
      '<span class="badge accent" id="timerState">' + (isDone && !isReview ? '已查看' : '进行中') + '</span></div>' +
      '<div class="timer-v mono" id="timerText">' + fmtSec(detailState.duration) + '</div>' +
      '<div class="timer-bar"><i id="timerBar" style="width:100%"></i></div>' +
      '<div class="timer-tip"><span class="tiny muted">' +
      (q.difficulty === 'Hard' ? 'Hard 建议上限 ' + HARD_MIN + ' 分钟' : '建议 20–25 分钟独立完成') +
      '</span><span class="timer-ctrl">' +
      '<button class="btn-xs" data-act="toggle-timer" id="timerBtn">暂停</button>' +
      '<button class="btn-xs" data-act="reset-timer">重置</button></span></div>' +
      '</div>'

    // 自评
    html += '<div class="sec-title">完成自评<span style="color:var(--hard)"> *</span>' +
      (isReview ? '<span class="tiny muted">（本轮重新评估，决定后续排期）</span>' : '') + '</div>'
    html += '<div class="grades">' + bank.GRADE_LIST.map(function (g) {
      var on = detailState.grade === g.key ? ' on' : ''
      return '<div class="grade' + on + '" data-act="pick-grade" data-g="' + g.key + '">' +
        '<div class="g1">' + g.label + '</div>' +
        '<div class="g2">' + g.desc + '</div>' +
        '<div class="g3">' + g.rule + '</div></div>'
    }).join('') + '</div>'

    // 备注
    html += '<div class="sec-title">备注</div>'
    html += '<textarea class="note" id="noteInput" placeholder="写一句卡点，比如「边界没想清楚」" maxlength="300">' + esc(detailState.note) + '</textarea>'

    // 排期
    if (q.reviews.length) {
      html += '<div class="sec-title">复习排期</div><div class="card">'
      html += q.reviews.map(function (rv) {
        var cls = rv.done ? ' done' : (date.diffDays(rv.due, date.today()) >= 0 ? ' due' : '')
        return '<div class="sched' + cls + '"><i class="dot2"></i><div class="grow">' +
          '<div class="st">第 ' + rv.round + ' 轮 · ' + rv.dueText + '</div>' +
          '<div class="sd">' + (rv.done ? '已完成于 ' + rv.doneDate : rv.offsetText) + '</div></div></div>'
      }).join('')
      html += '</div>'
    }

    // 历史
    if (q.history.length) {
      html += '<div class="sec-title">最近记录</div><div class="card">'
      html += q.history.map(function (h) {
        return '<div class="hist"><span>' + esc(h.text) + '</span><span class="ht">' + h.time + '</span></div>'
      }).join('')
      html += '</div>'
    }

    html += '<div style="height:8px"></div></div>'

    // 底部固定按钮
    var btnText = isReview ? '完成本轮复习' : (isDone ? '重新记录（覆盖排期）' : '标记完成（需选自评）')
    html += '<div class="actionbar"><button class="btn-main" id="submitBtn" data-act="submit"' +
      (detailState.grade ? '' : ' disabled') + '>' + btnText + '</button></div>'

    return html
  }

  /* ---------------- 计时器 ---------------- */

  function elapsedMs() {
    var base = detailState.baseMs || 0
    if (detailState.lastStart) base += Date.now() - detailState.lastStart
    return base
  }

  function fmtSec(total) {
    var m = Math.floor(Math.abs(total) / 60)
    var s = Math.abs(total) % 60
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s
  }

  function paintTimer() {
    var el = document.getElementById('timerText')
    if (!el) return
    var left = detailState.duration * 1000 - elapsedMs()
    var over = left < 0
    el.textContent = (over ? '+' : '') + fmtSec(Math.floor(Math.abs(left) / 1000))
    el.className = 'timer-v mono' + (over ? ' over' : '')
    var bar = document.getElementById('timerBar')
    if (bar) {
      var pct = Math.max(0, Math.min(100, left / (detailState.duration * 1000) * 100))
      bar.style.width = pct + '%'
      bar.className = over ? 'over' : ''
    }
  }

  function startTimer() {
    if (detailState.ticker) return
    detailState.lastStart = Date.now()
    paintTimer()
    detailState.ticker = setInterval(paintTimer, 1000)
    var b = document.getElementById('timerBtn')
    if (b) b.textContent = '暂停'
  }

  function pauseTimer() {
    if (detailState.lastStart) {
      detailState.baseMs = elapsedMs()
      detailState.lastStart = 0
    }
    if (detailState.ticker) {
      clearInterval(detailState.ticker)
      detailState.ticker = null
    }
    var b = document.getElementById('timerBtn')
    if (b) b.textContent = '继续'
  }

  function stopTimer() {
    if (detailState.ticker) {
      clearInterval(detailState.ticker)
      detailState.ticker = null
    }
    detailState.baseMs = 0
    detailState.lastStart = 0
  }

  /* ============================================================
   * ④ 复习
   * ============================================================ */
  function renderReview() {
    var list = store.reviewQueue()
    var html = navBar('复习', { back: true, sub: list.length ? list.length + ' 项' : '' })
    html += '<div class="page">'

    if (!list.length) {
      html += '<div class="card">' + emptyBox('🌤', '暂无待复习', '完成题目后会自动排入复习计划') + '</div>'
      return html + '</div>'
    }

    html += '<div class="sec-title">按到期日排序 · 逾期优先</div>'
    html += '<div class="card tight">' + list.map(function (it) {
      var overdue = it.overdue > 0
      return '<div class="qrow" data-act="review-item" data-no="' + it.no + '" data-round="' + it.round + '">' +
        '<div class="no">' + it.no + '</div>' +
        '<div class="mid"><div class="t1 ellipsis">' + esc(it.titleCn) + '</div>' +
        '<div class="t2">第 ' + it.round + '/' + it.roundTotal + ' 轮 · ' +
        (overdue ? '<span style="color:var(--hard)">逾期 ' + it.overdue + ' 天</span>' : '今天到期') +
        ' · 上次「' + it.gradeLabel + '」</div></div>' +
        '<i class="d ' + it.diffClass + '"></i></div>'
    }).join('') + '</div>'

    html += '</div>'
    return html
  }

  /* ============================================================
   * ⑤ 进度
   * ============================================================ */
  function renderStats() {
    var s = store.summary()
    var stats = store.stageStats()
    var R = 72
    var C = 2 * Math.PI * R
    var dash = C * s.percent / 100

    var html = navBar('进度', { sub: s.doneCount + ' / ' + s.total })

    html += '<div class="page">'
    html += '<div class="card"><div class="ring-wrap"><div class="ring">' +
      '<svg viewBox="0 0 168 168">' +
      '<circle class="bgc" cx="84" cy="84" r="' + R + '" fill="none" stroke-width="11"/>' +
      // 0% 时用 butt 端帽，否则 round 会在顶端留一个孤立圆点
      '<circle class="fgc" cx="84" cy="84" r="' + R + '" fill="none" stroke-width="11" ' +
      'style="stroke-dasharray:' + dash.toFixed(1) + ' ' + (C - dash).toFixed(1) + ';' +
      'stroke-linecap:' + (s.percent > 0 ? 'round' : 'butt') + '"/>' +
      '</svg>' +
      '<div class="ring-center"><div class="big mono">' + s.percent + '%</div><div class="sm">已完成 ' + s.doneCount + ' 题</div></div>' +
      '</div></div>' +
      '<div class="row" style="justify-content:space-around;padding:8px 0 2px">' +
      '<div style="text-align:center"><div style="font-size:17px;font-weight:700">' + s.indepRate + '%</div><div class="tiny muted">总体独立率</div></div>' +
      '<div style="text-align:center"><div style="font-size:17px;font-weight:700">' + s.starDone + '/' + s.starTotal + '</div><div class="tiny muted">高频题</div></div>' +
      '<div style="text-align:center"><div style="font-size:17px;font-weight:700">' + s.streak + '</div><div class="tiny muted">连续天数</div></div>' +
      '</div></div>'

    html += '<div class="sec-title">阶段进度与解锁</div><div class="card">'
    html += stats.map(function (st) {
      var gate = st.unlocked
        ? '<div class="gate ok">' + icon('check', 13) + '已解锁 · 独立率 ' + st.rate + '%（门槛 80%）</div>'
        : '<div class="gate lock">' + icon('lock', 13) + '暂未解锁 · 还差 ' + st.gap + ' 题独立完成</div>'
      return '<div class="stage-row">' +
        '<div class="stage-top"><span class="grp-idx">' + st.indexCn + '</span>' +
        '<span class="stage-name ellipsis">' + esc(st.title) + '</span>' +
        '<span class="stage-num">' + st.done + '/' + st.total + '</span></div>' +
        '<div class="bar' + (st.passed ? ' green' : '') + '"><i style="width:' + st.pct + '%"></i></div>' +
        gate + '</div>'
    }).join('')
    html += '</div>'

    html += '<div class="card small muted" style="line-height:1.6">' +
      '解锁规则：本阶段「独立完成」达到 80% 才解锁下一阶段。' +
      '独立 = 没看任何提示自己写出来；看提示记 D+3、D+7；抄题解记 D+1、D+3、D+7。</div>'

    html += '</div>'
    return html
  }

  /* ============================================================
   * ⑥ 我的
   * ============================================================ */
  var meState = {
    panel: '',
    exportText: '',
    importText: '',
    showPaste: false,
    busy: false
  }

  /* 备份时间：纯界面状态，不进「导出数据」，也不参与业务逻辑 */
  function lastBackupAt() {
    try {
      return Number(window.wx.getStorageSync('lc150:lastBackup')) || 0
    } catch (e) {
      return 0
    }
  }

  function markBackupDone() {
    try {
      window.wx.setStorageSync('lc150:lastBackup', Date.now())
    } catch (e) { /* 忽略 */ }
  }

  function fmtShort(iso) {
    if (!iso) return ''
    var d = new Date(iso)
    if (isNaN(d.getTime())) return ''
    function p2(n) { return n < 10 ? '0' + n : '' + n }
    return p2(d.getMonth() + 1) + '-' + p2(d.getDate()) + ' ' + p2(d.getHours()) + ':' + p2(d.getMinutes())
  }

  function renderMe() {
    var s = store.getSettings()
    var sum = store.summary()

    var html = navBar('我的')

    html += '<div class="page">'

    // 概览
    html += '<div class="card" style="display:flex;align-items:center;gap:12px">' +
      '<div style="width:44px;height:44px;border-radius:13px;background:var(--accent-soft);color:var(--accent);display:flex;align-items:center;justify-content:center;font-weight:700">LC</div>' +
      '<div class="grow"><div style="font-size:15px;font-weight:650">LeetCode 150 打卡</div>' +
      '<div class="small muted">已完成 ' + sum.doneCount + ' 题 · 独立率 ' + sum.indepRate + '%</div></div></div>'

    // 每日目标
    html += '<div class="card tight">' +
      '<div class="setting"><span class="label">每日目标</span><div class="seg">' +
      [3, 4, 5].map(function (n) {
        return '<button class="' + (s.dailyTarget === n ? 'on' : '') + '" data-act="set-target" data-v="' + n + '">' + n + ' 题</button>'
      }).join('') + '</div></div>' +

      '<div class="setting"><span class="label">主题</span><div class="seg">' +
      [['dark', '深色'], ['light', '浅色']].map(function (t) {
        return '<button class="' + (s.theme === t[0] ? 'on' : '') + '" data-act="set-theme" data-v="' + t[0] + '">' + t[1] + '</button>'
      }).join('') + '</div></div>' +

      '<div class="setting"><span class="label">考试模式<div class="tiny muted">隐藏阶段与专题标签</div></span>' +
      '<div class="switch ' + (s.examMode ? 'on' : '') + '" data-act="toggle-exam"></div></div>' +
      '</div>'

    // 数据：备份与恢复
    var snap = store.getSnapshot()
    var lastBk = lastBackupAt()
    var canFile = bridge.canFileIO()

    html += '<div class="sec-title">换机 / 备份</div>'

    html += '<div class="card"><div class="small muted" style="line-height:1.75">' +
      '换手机或重装前，先在老设备「导出数据」存成文件，' +
      '把文件发到新手机，再在新设备「导入数据」选中它，进度就接上了。' +
      (canFile ? '' : '<br><span style="color:var(--mid)">当前为浏览器预览，文件读写需在 App 内使用。</span>') +
      '</div></div>'

    html += '<div class="card tight">' +

      // 导出
      '<div class="setting" data-act="panel" data-p="export"><span class="label">导出数据' +
      '<div class="tiny muted">' +
      (lastBk ? '上次备份 ' + fmtShort(new Date(lastBk).toISOString()) : '还没备份过') +
      '</div></span><span class="val">' + (meState.panel === 'export' ? '收起' : '展开') + ' ›</span></div>' +

      (meState.panel === 'export' ? '<div style="padding:0 14px 14px">' +
        '<button class="btn-primary" data-act="export-file"' + (meState.busy ? ' disabled' : '') + '>' +
        (meState.busy ? '处理中…' : '保存为文件') + '</button>' +
        '<div class="tiny muted" style="margin-top:8px;line-height:1.7">' +
        '文件名 lc150-backup-' + date.today() + '.json，可存到「下载」或网盘。</div>' +
        '<button class="btn-ghost" style="margin-top:8px" data-act="copy-export">改为一键复制文本</button>' +
        (meState.exportText
          ? '<textarea class="export-box" readonly>' + esc(meState.exportText) + '</textarea>' +
            '<div class="tiny muted" style="margin-top:6px">已复制可长按粘贴到微信/备忘录</div>'
          : '') +
        '</div>' : '') +

      // 导入
      '<div class="setting" data-act="panel" data-p="import"><span class="label">导入数据' +
      '<div class="tiny muted">校验不通过不会覆盖现有数据</div></span>' +
      '<span class="val">' + (meState.panel === 'import' ? '收起' : '展开') + ' ›</span></div>' +

      (meState.panel === 'import' ? '<div style="padding:0 14px 14px">' +
        '<button class="btn-primary" data-act="import-file"' + (meState.busy ? ' disabled' : '') + '>' +
        (meState.busy ? '处理中…' : '选择文件导入') + '</button>' +
        '<button class="btn-ghost" style="margin-top:8px" data-act="toggle-paste">' +
        (meState.showPaste ? '收起粘贴框' : '改为粘贴文本') + '</button>' +

        (meState.showPaste ? '<textarea class="export-box" id="importBox" placeholder="把导出的 JSON 粘贴到这里">' +
          esc(meState.importText) + '</textarea>' +
          '<button class="btn-ghost" style="margin-top:8px" data-act="do-import">校验并导入</button>' : '') +

        (snap && snap.count > 0
          ? '<div style="margin-top:10px;padding:9px 11px;border-radius:10px;background:var(--card2)">' +
            '<div class="tiny muted" style="line-height:1.65">导入前已自动留了一份旧数据（' +
            snap.count + ' 题）。</div>' +
            '<button class="btn-ghost" style="margin-top:8px" data-act="undo-import">撤销上次导入</button></div>'
          : '') +
        '</div>' : '') +

      '<div class="setting" data-act="clear-all"><span class="label" style="color:var(--hard)">清空全部数据</span><span class="val">›</span></div>' +
      '</div>'

    // 关于
    html += '<div class="sec-title">关于</div><div class="card tight">' +
      '<div class="setting"><span class="label">版本</span><span class="val">1.2.0</span></div>' +
      '<div class="setting"><span class="label">题库</span><span class="val">LeetCode Top Interview 150</span></div>' +
      '<div class="setting"><span class="label">数据存储</span><span class="val">仅本机 · 不联网</span></div>' +
      '</div>'

    html += '<div class="tiny muted" style="text-align:center;padding:14px 0 4px;line-height:1.7">' +
      '完全离线 · 无需注册<br>数据只存在这台手机上，换机请用「导出数据」迁移</div>'

    html += '</div>'
    return html
  }

  /* ============================================================
   * 渲染调度
   * ============================================================ */
  function render() {
    var r = current()
    var html = ''

    if (r.name === 'today') html = renderToday()
    else if (r.name === 'bank') html = renderBank()
    else if (r.name === 'detail') html = renderDetail(r)
    else if (r.name === 'review') html = renderReview()
    else if (r.name === 'stats') html = renderStats()
    else if (r.name === 'me') html = renderMe()

    app.innerHTML = html
    document.getElementById('tabbar').innerHTML = tabbarHtml()
    document.getElementById('tabbar').style.display = (r.name === 'detail' || r.name === 'review') ? 'none' : 'flex'

    // 详情页启动计时
    if (r.name === 'detail') startTimer()
    else stopTimer()

    // 绑定输入事件（避免整体重渲染导致失焦）
    bindInputs(r)
  }

  function bindInputs(r) {
    var kw = document.getElementById('kw')
    if (kw) {
      kw.addEventListener('input', function () {
        bankState.keyword = kw.value
        refreshStageList()
      })
    }

    var note = document.getElementById('noteInput')
    if (note) {
      note.addEventListener('input', function () {
        detailState.note = note.value
      })
    }

  }

  /* ============================================================
   * 事件委托
   * ============================================================ */
  /**
   * 点击委托
   * 关键：#tabbar 与 #app 在 index.html 里是兄弟节点，不是父子关系。
   * 曾经只把监听绑在 #app 上，导致底部四个 tab 收不到任何点击
   * （表现就是今日页正常、题库/进度/我的点不开）。所以两个容器都要绑。
   */
  function handleClick(e, root) {
    var el = e.target
    while (el && el !== root) {
      // 文本节点没有 getAttribute，遇到元素才判断
      if (el.nodeType === 1 && el.getAttribute('data-act')) break
      el = el.parentNode
    }
    if (!el || el === root || el.nodeType !== 1) return

    var act = el.getAttribute('data-act')
    var r = current()

    switch (act) {
      case 'back':
        back()
        break

      case 'tab':
        switchTab(el.getAttribute('data-tab'))
        break

      case 'go-review':
        go({ name: 'review' })
        break

      case 'open-detail':
        go({ name: 'detail', no: Number(el.getAttribute('data-no')), mode: 'edit', round: 0 })
        break

      case 'review-item':
        go({
          name: 'detail',
          no: Number(el.getAttribute('data-no')),
          mode: 'review',
          round: Number(el.getAttribute('data-round'))
        })
        break

      case 'filter':
        bankState.filter = el.getAttribute('data-f')
        var chips = app.querySelectorAll('.chip')
        for (var i = 0; i < chips.length; i++) {
          chips[i].className = 'chip' + (chips[i].getAttribute('data-f') === bankState.filter ? ' on' : '')
        }
        refreshStageList()
        break

      case 'clear-kw':
        bankState.keyword = ''
        render()
        break

      case 'toggle-stage':
        var st = Number(el.getAttribute('data-stage'))
        if (bankState.filter !== 'all' || bankState.keyword) break
        bankState.open[st] = !bankState.open[st]
        refreshStageList()
        break

      /* ---------------- 详情页 ---------------- */

      case 'open-url':
        var no1 = Number(el.getAttribute('data-no'))
        var q1 = bank.byNo(no1)
        if (!q1) break
        var url = q1.url || ('https://leetcode.cn/problems/' + q1.slug + '/')
        bridge.openUrl(url)
        toast('正在用浏览器打开…')
        break

      case 'copy-link':
        var no2 = Number(el.getAttribute('data-no'))
        var q2 = bank.byNo(no2)
        if (!q2) break
        bridge.copy(q2.url || ('https://leetcode.cn/problems/' + q2.slug + '/'))
        toast('链接已复制')
        break

      case 'pick-grade':
        detailState.grade = el.getAttribute('data-g')
        var cards = app.querySelectorAll('.grade')
        for (var j = 0; j < cards.length; j++) {
          cards[j].className = 'grade' + (cards[j].getAttribute('data-g') === detailState.grade ? ' on' : '')
        }
        var sb = document.getElementById('submitBtn')
        if (sb) sb.removeAttribute('disabled')
        break

      case 'toggle-timer':
        if (detailState.ticker) { pauseTimer(); toast('已暂停') } else { startTimer(); toast('继续计时') }
        break

      case 'reset-timer':
        detailState.baseMs = 0
        detailState.lastStart = Date.now()
        paintTimer()
        toast('计时已重置')
        break

      case 'submit':
        doSubmit()
        break

      /* ---------------- 我的页 ---------------- */

      case 'set-target':
        store.setSettings({ dailyTarget: Number(el.getAttribute('data-v')) })
        toast('每日目标已更新')
        render()
        break

      case 'set-theme':
        store.setSettings({ theme: el.getAttribute('data-v') })
        applyTheme()
        render()
        break

      case 'toggle-exam':
        store.setSettings({ examMode: !store.getSettings().examMode })
        render()
        break

      case 'panel':
        var p = el.getAttribute('data-p')
        meState.panel = (meState.panel === p) ? '' : p
        // 收起导入面板时顺便折起粘贴框，下次展开是干净状态
        if (meState.panel !== 'import') meState.showPaste = false
        render()
        break

      case 'export-file':
        doExportFile()
        break

      case 'import-file':
        doImportFile()
        break

      case 'toggle-paste':
        // 先把输入框里可能已粘的内容记下来，避免重渲染丢失
        var ib = document.getElementById('importBox')
        if (ib) meState.importText = ib.value
        meState.showPaste = !meState.showPaste
        render()
        break

      case 'copy-export':
        // 退路：没有文件选择界面的环境 / 想用微信直接发一段文本
        meState.exportText = store.exportJson()
        bridge.copy(meState.exportText)
        markBackupDone()
        toast('已复制，可粘贴到微信或备忘录')
        render()
        break

      case 'undo-import':
        confirmBox({
          title: '撤销上次导入？',
          body: '数据将恢复到导入前的状态，当前进度会被替换掉。',
          ok: '撤销导入',
          onOk: function () {
            var r = store.restoreSnapshot()
            toast(r.ok ? '已恢复到导入前' : (r.msg || '恢复失败'))
            meState.panel = ''
            render()
          }
        })
        break

      case 'do-import':
        doImport()
        break

      case 'clear-all':
        confirmBox({
          title: '清空全部数据？',
          body: '将删除所有做题记录、备注与设置，且无法撤销。建议先导出备份。',
          ok: '继续',
          danger: true,
          onOk: function () {
            confirmBox({
              title: '再确认一次',
              body: '这是最后一次确认，清空后无法恢复。',
              ok: '确认清空',
              danger: true,
              onOk: function () {
                store.clearAll()
                toast('已清空')
                render()
              }
            })
          }
        })
        break
    }
  }

  // 两个容器分别绑定：内容区 + 底部标签栏
  app.addEventListener('click', function (e) { handleClick(e, app) })
  var tabbarEl = document.getElementById('tabbar')
  if (tabbarEl) tabbarEl.addEventListener('click', function (e) { handleClick(e, tabbarEl) })

  /* ============================================================
   * 提交完成 / 复习
   * ============================================================ */
  function doSubmit() {
    var r = current()
    if (r.name !== 'detail') return
    if (!detailState.grade) {
      toast('请先选择自评档位')
      return
    }

    var minutes = Math.max(1, Math.round(elapsedMs() / 60000))
    var payload = { grade: detailState.grade, minutes: minutes, note: detailState.note }
    var res

    if (detailState.mode === 'review') {
      payload.round = detailState.round
      res = store.gradeReview(detailState.no, payload)
    } else {
      var q = store.getProgress(detailState.no)
      if (q.done) {
        var self = { no: detailState.no }
        confirmBox({
          title: '重新记录？',
          body: '会覆盖原有完成记录与复习排期。',
          ok: '覆盖',
          danger: true,
          onOk: function () { finishSubmit(store.completeQuestion(self.no, payload)) }
        })
        return
      }
      res = store.completeQuestion(detailState.no, payload)
    }

    finishSubmit(res)
  }

  function finishSubmit(res) {
    if (!res || !res.ok) {
      toast((res && res.msg) || '保存失败')
      return
    }

    stopTimer()
    detailState.no = 0

    var msg = detailState.mode === 'review'
      ? '已复习 · 下一轮 ' + date.relative(res.nextDue)
      : '已完成 · 排了 ' + res.rounds + ' 轮复习'

    toast(msg)
    setTimeout(function () {
      if (!back()) switchTab('today')
    }, 620)
  }

  /* ============================================================
   * 备份：导出成文件 / 从文件导入
   *
   * 换机迁移的完整链路：
   *   老设备「保存为文件」→ 文件发到新设备 → 新设备「选择文件导入」
   * 全程走系统文件选择器，不联网、不申请存储权限。
   * ============================================================ */

  function doExportFile() {
    if (meState.busy) return

    var text = store.exportJson()
    meState.exportText = text
    var name = 'lc150-backup-' + date.today() + '.json'

    meState.busy = true
    render()

    bridge.saveFile(name, text).then(function (r) {
      meState.busy = false
      if (!r.ok) {
        if (r.message && r.message !== '已取消') toast(r.message)
        render()
        return
      }
      markBackupDone()
      meState.panel = ''
      toast('已保存：' + (r.payload || name))
      render()
    })
  }

  function doImportFile() {
    if (meState.busy) return
    meState.busy = true
    render()

    bridge.pickFile().then(function (r) {
      meState.busy = false
      if (!r.ok) {
        if (r.message && r.message !== '已取消') toast(r.message)
        render()
        return
      }
      applyImport(r.payload, r.message)
    })
  }

  /**
   * 校验 → 留快照 → 写入。
   * 顺序很关键：先校验，确认能导成功才留快照，
   * 这样导入失败时既不动现有数据，也不会把上一次的快照冲掉。
   */
  function applyImport(text, sourceName) {
    if (!text || !String(text).trim()) {
      toast('文件是空的')
      meState.busy = false
      render()
      return
    }

    var v = store.validateImport(text)
    if (!v.ok) {
      meState.busy = false
      render()
      confirmBox({
        title: '导入失败',
        body: (sourceName ? '文件：' + sourceName + '\n\n' : '') +
          (v.msg || '数据格式不正确') + '\n\n现有数据没有任何改动。',
        ok: '知道了'
      })
      return
    }

    store.snapshotBeforeImport()
    var res = store.importJson(text)

    meState.busy = false
    if (!res.ok) {
      store.dropSnapshot()
      render()
      confirmBox({ title: '导入失败', body: res.msg || '数据格式不正确', ok: '知道了' })
      return
    }

    meState.panel = ''
    meState.showPaste = false
    meState.importText = ''
    toast(res.msg || '导入成功')
    render()
  }

  /** 粘贴框这条退路 */
  function doImport() {
    var box = document.getElementById('importBox')
    var text = box ? box.value : meState.importText
    meState.importText = text
    applyImport(text, '')
  }

  /* ============================================================
   * 启动
   * ============================================================ */
  function applyTheme() {
    var s = store.getSettings()
    var light = s.theme === 'light'
    document.body.className = light ? 'light' : ''
    var meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', light ? '#F2F4F8' : '#0E1116')
    // 让状态栏跟着一起换（比小程序能做的更进一步）
    bridge.setTheme(light)
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  /* ============================================================
   * 运行期错误兜底
   * 手机上没法连调试器，出错时直接把原因显示在屏幕上：
   * 截图一张就能定位问题，比白屏干等着强。点一下可关闭。
   * ============================================================ */
  function showFatal(text) {
    try {
      var bar = document.getElementById('errbar')
      if (!bar) {
        bar = document.createElement('div')
        bar.id = 'errbar'
        bar.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:99999;background:#B3261E;color:#fff;' +
          'font:11px/1.45 monospace;padding:9px 11px;max-height:40vh;overflow:auto;' +
          'white-space:pre-wrap;word-break:break-all;border-radius:10px 10px 0 0'
        bar.addEventListener('click', function () {
          if (bar.parentNode) bar.parentNode.removeChild(bar)
        })
        document.body.appendChild(bar)
      }
      bar.textContent = '出错（点此关闭，可截图反馈）\n' + text
    } catch (e) { /* 兜底本身失败就放弃 */ }
  }

  window.onerror = function (msg, src, line, col, err) {
    showFatal((err && err.stack) || (msg + '\n@' + String(src || '').split('/').pop() + ':' + line + ':' + col))
    return false
  }
  window.addEventListener('unhandledrejection', function (e) {
    var r = e && e.reason
    showFatal('Promise 未捕获：' + ((r && (r.stack || r.message)) || r))
  })

  function boot() {
    store.init()

    // 调试/预览入口：?page=bank / ?page=stats / ?page=detail&no=242&mode=review&round=1
    // 正常使用（从桌面图标启动）没有查询参数，不受影响
    var qs = {}
    location.search.replace(/^\?/, '').split('&').forEach(function (kv) {
      if (!kv) return
      var p = kv.split('=')
      qs[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || '')
    })
    if (qs.page) {
      if (qs.page === 'detail') {
        routeStack = [{ name: 'detail', no: Number(qs.no) || 1, mode: qs.mode || 'edit', round: Number(qs.round) || 0 }]
      } else if (qs.page === 'review') {
        routeStack = [{ name: 'review' }]
      } else {
        routeStack = [{ name: qs.page }]
      }
    }

    applyTheme()
    render()

    // 从后台回到前台时刷新（跨天、目标变更等）
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) render()
    })
  }

  boot()
})()
