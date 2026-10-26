/**
 * utils/store.js —— 全应用唯一的数据读写出口
 *
 * 约束（务必遵守）：
 * 1. 页面层不允许直接调用 wx.getStorageSync / wx.setStorageSync，一律走本文件。
 * 2. 所有派生数据（今日题单、复习队列、阶段统计、打卡天数）都在本文件算好再给页面。
 * 3. 每次写入都整体回写，保证 storage 与内存缓存一致，进程重启后可直接恢复。
 *
 * 存储分区：
 *   lc150:progress  按题号 no 索引的进度对象
 *   lc150:settings  每日目标 / 考试模式 / 主题
 *   lc150:plan      当日题单缓存（保证同一天出题不重复、顺序稳定）
 *   lc150:meta      版本与创建时间
 */

var bank = require('./bank.js')
var date = require('./date.js')

var K = {
  PROGRESS: 'lc150:progress',
  SETTINGS: 'lc150:settings',
  PLAN: 'lc150:plan',
  META: 'lc150:meta',
  // 导入前自动留的旧数据快照，用于「撤销这次导入」
  PREIMPORT: 'lc150:preimport'
}

var VERSION = 1

var DEFAULT_SETTINGS = {
  dailyTarget: 3,
  examMode: false,
  theme: 'dark'
}

// 内存缓存，避免每帧重复读 storage
var state = { progress: null, settings: null }

/* ============================================================
 * 基础读写（唯一触碰 wx.*Storage 的地方）
 * ============================================================ */

function readRaw(key, fallback) {
  try {
    var v = wx.getStorageSync(key)
    if (v === '' || v === null || v === undefined) return fallback
    return v
  } catch (e) {
    return fallback
  }
}

function writeRaw(key, value) {
  try {
    wx.setStorageSync(key, value)
    return true
  } catch (e) {
    return false
  }
}

function removeRaw(key) {
  try { wx.removeStorageSync(key) } catch (e) { /* 忽略 */ }
}

/* ============================================================
 * 结构修复（脏数据 / 版本升级时兜底，绝不抛错）
 * ============================================================ */

function normalizeRecord(p) {
  if (!p || typeof p !== 'object') return null

  var reviews = []
  if (Object.prototype.toString.call(p.reviews) === '[object Array]') {
    p.reviews.forEach(function (r) {
      if (!r || typeof r.due !== 'string') return
      var round = Number(r.round)
      if (round !== 1 && round !== 2 && round !== 3) return
      reviews.push({
        due: r.due,
        round: round,
        done: !!r.done,
        doneDate: typeof r.doneDate === 'string' ? r.doneDate : ''
      })
    })
  }

  var grade = ''
  if (p.grade === 'indep' || p.grade === 'hint' || p.grade === 'solution') grade = p.grade

  var history = []
  if (Object.prototype.toString.call(p.history) === '[object Array]') {
    p.history.forEach(function (h) {
      if (h && typeof h.ts === 'number') history.push(h)
    })
  }

  return {
    done: !!p.done,
    date: typeof p.date === 'string' ? p.date : '',
    minutes: typeof p.minutes === 'number' && p.minutes >= 0 ? Math.round(p.minutes) : 0,
    grade: grade,
    note: typeof p.note === 'string' ? p.note : '',
    reviews: reviews,
    history: history
  }
}

function normalizeProgress(raw) {
  var out = {}
  if (!raw || typeof raw !== 'object') return out
  Object.keys(raw).forEach(function (k) {
    // 只保留题库里真实存在的题号，其余丢弃
    if (!bank.has(k)) return
    var rec = normalizeRecord(raw[k])
    if (rec) out[Number(k)] = rec
  })
  return out
}

function normalizeSettings(raw) {
  var s = {
    dailyTarget: DEFAULT_SETTINGS.dailyTarget,
    examMode: DEFAULT_SETTINGS.examMode,
    theme: DEFAULT_SETTINGS.theme
  }
  if (!raw || typeof raw !== 'object') return s
  var t = Number(raw.dailyTarget)
  if (t >= 1 && t <= 10) s.dailyTarget = Math.round(t)
  s.examMode = !!raw.examMode
  if (raw.theme === 'light' || raw.theme === 'dark') s.theme = raw.theme
  return s
}

/* ============================================================
 * 初始化
 * ============================================================ */

function init() {
  state.progress = normalizeProgress(readRaw(K.PROGRESS, {}))
  state.settings = normalizeSettings(readRaw(K.SETTINGS, null))

  // 首次启动写入 meta，便于将来做数据迁移
  var meta = readRaw(K.META, null)
  if (!meta || typeof meta !== 'object') {
    writeRaw(K.META, { version: VERSION, createdAt: Date.now(), lastOpen: Date.now() })
  } else {
    meta.lastOpen = Date.now()
    writeRaw(K.META, meta)
  }
  return true
}

function ensure() {
  if (!state.progress) state.progress = normalizeProgress(readRaw(K.PROGRESS, {}))
  if (!state.settings) state.settings = normalizeSettings(readRaw(K.SETTINGS, null))
}

/* ============================================================
 * 设置
 * ============================================================ */

function getSettings() {
  ensure()
  return {
    dailyTarget: state.settings.dailyTarget,
    examMode: state.settings.examMode,
    theme: state.settings.theme
  }
}

function setSettings(patch) {
  ensure()
  var next = normalizeSettings(Object.assign({}, state.settings, patch || {}))
  state.settings = next
  writeRaw(K.SETTINGS, next)
  // 目标数变化时，当日题单需要重新补齐
  if (patch && typeof patch.dailyTarget !== 'undefined') planToday()
  return next
}

/* ============================================================
 * 进度读取
 * ============================================================ */

function getAllProgress() {
  ensure()
  return state.progress
}

function getProgress(no) {
  ensure()
  var p = state.progress[Number(no)]
  if (!p) {
    return { done: false, date: '', minutes: 0, grade: '', note: '', reviews: [], history: [] }
  }
  return p
}

/* ============================================================
 * 复习排期
 * 规则：indep -> D+7；hint -> D+3, D+7；solution -> D+1, D+3, D+7
 * round 取自该档位阶梯中的位置（1 起）
 * ============================================================ */

function buildReviews(grade, baseDate) {
  var offsets = bank.OFFSETS[grade]
  if (!offsets) return []
  return offsets.map(function (d, i) {
    return { due: date.addDays(baseDate, d), round: i + 1, done: false, doneDate: '' }
  })
}

/* ============================================================
 * 今日题单
 * ============================================================ */

/**
 * 目标数调小时收缩题单
 * 已完成的题优先保留（不让用户觉得白做了），不够 target 再按原顺序补足，
 * 最后仍按原顺序输出，避免题单跳序。
 */
function shrinkPlan(nos, target) {
  var keep = {}
  var count = 0
  var i

  for (i = 0; i < nos.length && count < target; i++) {
    var p = state.progress[nos[i]]
    if (p && p.done) { keep[nos[i]] = true; count++ }
  }
  for (i = 0; i < nos.length && count < target; i++) {
    if (!keep[nos[i]]) { keep[nos[i]] = true; count++ }
  }
  return nos.filter(function (no) { return keep[no] })
}

function planToday() {
  ensure()
  var t = date.today()
  var target = state.settings.dailyTarget
  var cached = readRaw(K.PLAN, null)
  var nos = []

  if (cached && cached.date === t && Object.prototype.toString.call(cached.nos) === '[object Array]') {
    nos = cached.nos.filter(function (no) { return bank.has(no) })
  }

  // 目标调小时必须收缩，否则「3 → 5 → 3」会一直停在 5 题
  if (nos.length > target) {
    nos = shrinkPlan(nos, target)
  }

  // 只在数量不足时补题；已完成的不补位，保证「今日 x/目标」不会无限增长
  if (nos.length < target) {
    var all = bank.all()
    for (var i = 0; i < all.length && nos.length < target; i++) {
      var q = all[i]
      if (nos.indexOf(q.no) >= 0) continue
      var p = state.progress[q.no]
      if (p && p.done) continue
      nos.push(q.no)
    }
  }

  var changed = !cached || cached.date !== t || JSON.stringify(cached.nos) !== JSON.stringify(nos)
  if (changed) writeRaw(K.PLAN, { date: t, nos: nos })

  return { date: t, nos: nos }
}

/**
 * 今日页视图数据
 * rows 只含未完成的题（严格不含已完成），doneNos 用于底部「今日已完成」提示
 */
function todayView() {
  var plan = planToday()
  var rows = []
  var doneNos = []
  plan.nos.forEach(function (no) {
    var q = bank.byNo(no)
    if (!q) return
    var p = state.progress[no]
    if (p && p.done) doneNos.push(no)
    else rows.push(bank.toRow(q, p))
  })
  return {
    date: plan.date,
    dateText: date.cnDate(plan.date),
    total: plan.nos.length,
    rows: rows,
    doneNos: doneNos
  }
}

/* ============================================================
 * 完成 / 复习
 * ============================================================ */

function completeQuestion(no, payload) {
  ensure()
  var q = bank.byNo(no)
  if (!q) return { ok: false, msg: '题目不存在' }

  payload = payload || {}
  var grade = payload.grade
  if (grade !== 'indep' && grade !== 'hint' && grade !== 'solution') {
    return { ok: false, msg: '请先选择自评档位' }
  }

  var t = date.today()
  var minutes = Math.max(1, Math.round(Number(payload.minutes) || 0))
  var prev = state.progress[q.no]
  var note = typeof payload.note === 'string' ? payload.note : (prev ? prev.note : '')

  var rec = {
    done: true,
    date: t,
    minutes: minutes,
    grade: grade,
    note: note,
    reviews: buildReviews(grade, t),
    history: (prev && prev.history ? prev.history.slice() : [])
  }
  rec.history.push({ ts: Date.now(), action: 'complete', grade: grade, minutes: minutes })

  state.progress[q.no] = rec
  writeRaw(K.PROGRESS, state.progress)

  return {
    ok: true,
    record: rec,
    nextDue: rec.reviews.length ? rec.reviews[0].due : '',
    rounds: rec.reviews.length
  }
}

/**
 * 完成一轮复习：标记 done，并按「本次新自评」从今天起重排后续阶梯（顺延）
 */
function gradeReview(no, payload) {
  ensure()
  var q = bank.byNo(no)
  if (!q) return { ok: false, msg: '题目不存在' }
  var rec = state.progress[q.no]
  if (!rec) return { ok: false, msg: '这道题还没有完成记录' }

  payload = payload || {}
  var grade = payload.grade
  if (grade !== 'indep' && grade !== 'hint' && grade !== 'solution') {
    return { ok: false, msg: '请先选择自评档位' }
  }

  var round = Number(payload.round)
  var idx = -1
  for (var i = 0; i < rec.reviews.length; i++) {
    if (rec.reviews[i].round === round && !rec.reviews[i].done) { idx = i; break }
  }
  if (idx < 0) return { ok: false, msg: '这一轮复习不存在或已完成' }

  var t = date.today()
  var minutes = Math.max(1, Math.round(Number(payload.minutes) || 0))

  // 记录本轮已完成，然后按新档位重排「后续」阶梯
  rec.reviews[idx].done = true
  rec.reviews[idx].doneDate = t
  rec.reviews = buildReviews(grade, t)
  rec.grade = grade
  if (typeof payload.note === 'string') rec.note = payload.note
  rec.history.push({ ts: Date.now(), action: 'review', round: round, grade: grade, minutes: minutes })

  state.progress[q.no] = rec
  writeRaw(K.PROGRESS, state.progress)

  return {
    ok: true,
    record: rec,
    nextDue: rec.reviews.length ? rec.reviews[0].due : '',
    rounds: rec.reviews.length
  }
}

function setNote(no, note) {
  ensure()
  var q = bank.byNo(no)
  if (!q) return false
  if (!state.progress[q.no]) return false
  state.progress[q.no].note = typeof note === 'string' ? note : ''
  writeRaw(K.PROGRESS, state.progress)
  return true
}

/* ============================================================
 * 复习队列（按到期日升序）
 * ============================================================ */

function reviewQueue() {
  ensure()
  var t = date.today()
  var out = []
  Object.keys(state.progress).forEach(function (key) {
    var p = state.progress[key]
    var q = bank.byNo(key)
    if (!q) return
    p.reviews.forEach(function (r) {
      if (r.done) return
      if (date.diffDays(r.due, t) < 0) return // 未到期
      out.push({
        no: q.no,
        order: q.order,
        titleCn: q.titleCn,
        titleEn: q.titleEn,
        difficulty: q.difficulty,
        diffClass: bank.DIFF_CLASS[q.difficulty] || 'easy',
        grade: p.grade,
        gradeLabel: bank.GRADE_LABEL[p.grade] || '',
        stageTitle: q.stageTitle,
        due: r.due,
        round: r.round,
        roundTotal: p.reviews.length,
        overdue: date.diffDays(r.due, t)
      })
    })
  })
  out.sort(function (a, b) {
    if (a.due !== b.due) return a.due < b.due ? -1 : 1
    return a.order - b.order
  })
  return out
}

/* ============================================================
 * 汇总与统计
 * ============================================================ */

function streak() {
  ensure()
  var set = {}
  Object.keys(state.progress).forEach(function (key) {
    var p = state.progress[key]
    if (p.date) set[p.date] = 1
    p.history.forEach(function (h) {
      if (h.ts) set[date.fromTs(h.ts)] = 1
    })
  })

  var cursor = date.today()
  if (!set[cursor]) cursor = date.addDays(cursor, -1) // 今天还没做题，从昨天开始数
  var n = 0
  var guard = 0
  while (set[cursor] && guard < 3650) {
    n++
    cursor = date.addDays(cursor, -1)
    guard++
  }
  return n
}

function summary() {
  ensure()
  var total = bank.all().length
  var doneCount = 0
  var indepCount = 0
  var starDone = 0
  var starTotal = 0
  var t = date.today()
  var todayDone = 0

  bank.all().forEach(function (q) {
    if (q.star) starTotal++
    var p = state.progress[q.no]
    if (p && p.done) {
      doneCount++
      if (p.grade === 'indep') indepCount++
      if (q.star) starDone++
      // 「今日完成」只统计今天首次完成的题，不含复习（复习算打卡但不占新题目标）
      if (p.date === t) todayDone++
    }
  })

  var queue = reviewQueue()

  return {
    total: total,
    doneCount: doneCount,
    percent: total ? Math.round(doneCount / total * 100) : 0,
    indepCount: indepCount,
    indepRate: total ? Math.round(indepCount / total * 100) : 0,
    starDone: starDone,
    starTotal: starTotal,
    todayDone: todayDone,
    dailyTarget: state.settings.dailyTarget,
    dueCount: queue.length,
    streak: streak()
  }
}

/**
 * 阶段统计 + 门禁
 * 独立率 = 本阶段「独立」档题数 / 本阶段总题数
 * 解锁条件：上一阶段独立率 >= 80%（即 indep >= ceil(0.8 * total)）
 */
function stageStats() {
  ensure()
  var list = bank.stageList()
  var prevOk = true
  var out = []

  list.forEach(function (s) {
    var qs = bank.stageQuestions(s.stage)
    var done = 0
    var indep = 0
    qs.forEach(function (q) {
      var p = state.progress[q.no]
      if (p && p.done) {
        done++
        if (p.grade === 'indep') indep++
      }
    })

    var need = Math.ceil(s.total * 0.8)
    var unlocked = prevOk
    prevOk = indep >= need

    out.push({
      stage: s.stage,
      indexCn: s.indexCn,
      title: s.title,
      total: s.total,
      done: done,
      indep: indep,
      need: need,
      gap: Math.max(0, need - indep),
      rate: s.total ? Math.round(indep / s.total * 100) : 0,
      pct: s.total ? Math.round(done / s.total * 100) : 0,
      unlocked: unlocked,
      passed: indep >= need
    })
  })

  return out
}

/** 详情页需要的单题完整视图 */
function detailView(no) {
  var q = bank.byNo(no)
  if (!q) return null
  var p = getProgress(no)
  var row = bank.toRow(q, p)
  row.note = p.note || ''
  row.reviews = p.reviews.map(function (r) {
    return {
      due: r.due,
      round: r.round,
      done: r.done,
      doneDate: r.doneDate || '',
      dueText: date.cnDate(r.due),
      offsetText: r.done ? '已完成' : date.relative(r.due)
    }
  })
  row.history = p.history.slice().reverse().slice(0, 8).map(function (h) {
    return {
      key: 'h' + h.ts + '_' + (h.round || 0),
      text: (h.action === 'review' ? '第 ' + h.round + ' 轮复习' : '首次完成') +
        ' · ' + (bank.GRADE_LABEL[h.grade] || h.grade) +
        (h.minutes ? ' · ' + h.minutes + ' 分' : ''),
      time: date.fromTsShort(h.ts)
    }
  })
  return row
}

/* ============================================================
 * 导入 / 导出 / 清空
 * ============================================================ */

function exportJson() {
  ensure()
  var payload = {
    app: 'lc150',
    version: VERSION,
    exportedAt: new Date().toISOString(),
    questionCount: bank.all().length,
    settings: getSettings(),
    progress: state.progress
  }
  return JSON.stringify(payload)
}

var DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/**
 * 只校验、不写入。返回 { ok, msg, data }
 * data 为解析后的原始对象；importJson 直接复用它，避免校验规则写两遍。
 * 单独暴露出来，是为了让「导入前留快照」只在确定能导成功时才发生。
 */
function validateImport(text) {
  if (typeof text !== 'string' || !text.trim()) {
    return { ok: false, msg: '内容为空' }
  }

  var obj
  try {
    obj = JSON.parse(text)
  } catch (e) {
    return { ok: false, msg: 'JSON 解析失败，请检查是否完整复制' }
  }

  if (!obj || typeof obj !== 'object') return { ok: false, msg: '不是合法的数据对象' }
  if (obj.app !== 'lc150') return { ok: false, msg: '不是本应用导出的数据（缺少 app 标识）' }

  var prog = obj.progress
  if (!prog || typeof prog !== 'object' || Object.prototype.toString.call(prog) === '[object Array]') {
    return { ok: false, msg: '缺少 progress 字段' }
  }

  var keys = Object.keys(prog)
  if (keys.length === 0) return { ok: false, msg: 'progress 为空，没有可导入的题目' }
  if (keys.length > bank.all().length) return { ok: false, msg: '题目数量超过题库总数' }

  for (var i = 0; i < keys.length; i++) {
    var k = keys[i]
    if (!/^\d+$/.test(k)) return { ok: false, msg: '题号非法：' + k }
    if (!bank.has(k)) return { ok: false, msg: '题库中不存在题号 ' + k }

    var p = prog[k]
    if (!p || typeof p !== 'object') return { ok: false, msg: '题 ' + k + ' 的数据格式错误' }
    if (typeof p.done !== 'boolean') return { ok: false, msg: '题 ' + k + ' 缺少 done 布尔值' }
    if (p.done && p.grade !== 'indep' && p.grade !== 'hint' && p.grade !== 'solution') {
      return { ok: false, msg: '题 ' + k + ' 的 grade 非法（应为 indep/hint/solution）' }
    }
    if (typeof p.minutes !== 'undefined' && typeof p.minutes !== 'number') {
      return { ok: false, msg: '题 ' + k + ' 的 minutes 必须是数字' }
    }
    if (typeof p.date !== 'undefined' && p.date !== '' && !DATE_RE.test(p.date)) {
      return { ok: false, msg: '题 ' + k + ' 的完成日期格式应为 YYYY-MM-DD' }
    }
    if (typeof p.reviews !== 'undefined') {
      if (Object.prototype.toString.call(p.reviews) !== '[object Array]') {
        return { ok: false, msg: '题 ' + k + ' 的 reviews 必须是数组' }
      }
      for (var j = 0; j < p.reviews.length; j++) {
        var r = p.reviews[j]
        if (!r || typeof r.due !== 'string' || !DATE_RE.test(r.due)) {
          return { ok: false, msg: '题 ' + k + ' 第 ' + (j + 1) + ' 条复习日期格式错误' }
        }
        var round = Number(r.round)
        if (round !== 1 && round !== 2 && round !== 3) {
          return { ok: false, msg: '题 ' + k + ' 的复习轮次必须是 1/2/3' }
        }
      }
    }
    if (typeof p.history !== 'undefined' && Object.prototype.toString.call(p.history) !== '[object Array]') {
      return { ok: false, msg: '题 ' + k + ' 的 history 必须是数组' }
    }
  }

  return { ok: true, data: obj }
}

/**
 * 导入：先全量校验，全部通过才一次性写入；任一不合法直接返回错误，现状不动
 */
function importJson(text) {
  var v = validateImport(text)
  if (!v.ok) return v

  var obj = v.data
  var prog = obj.progress

  // 校验全部通过，开始写入
  var normalized = normalizeProgress(prog)
  var settings = obj.settings ? normalizeSettings(obj.settings) : getSettings()

  state.progress = normalized
  state.settings = settings
  writeRaw(K.PROGRESS, normalized)
  writeRaw(K.SETTINGS, settings)
  removeRaw(K.PLAN) // 题单按新进度重算

  return {
    ok: true,
    count: Object.keys(normalized).length,
    msg: '已导入 ' + Object.keys(normalized).length + ' 题记录'
  }
}

function clearAll() {
  removeRaw(K.PROGRESS)
  removeRaw(K.SETTINGS)
  removeRaw(K.PLAN)
  removeRaw(K.PREIMPORT)
  state.progress = {}
  state.settings = normalizeSettings(null)
  writeRaw(K.PROGRESS, state.progress)
  writeRaw(K.SETTINGS, state.settings)
  return true
}

/* ============================================================
 * 导入撤销
 *
 * 导入是唯一会把全部进度一次性替换掉的操作，也是最容易点错的地方
 * （换手机时选错文件、把新设备的空备份导进老设备）。
 * 所以导入前先留一份旧数据，导入成功后还允许反悔一次。
 * ============================================================ */

/** 导入前留快照 */
function snapshotBeforeImport() {
  ensure()
  try {
    writeRaw(K.PREIMPORT, { at: Date.now(), data: exportJson() })
    return true
  } catch (e) {
    return false
  }
}

/** 查询是否有可撤销的快照；没有返回 null */
function getSnapshot() {
  var s = readRaw(K.PREIMPORT)
  if (!s || typeof s.data !== 'string') return null
  var n = 0
  try {
    n = Object.keys(JSON.parse(s.data).progress || {}).length
  } catch (e) {
    n = 0
  }
  return { at: s.at || 0, count: n }
}

/**
 * 把快照写回去（撤销上一次导入）
 *
 * 这里刻意不走 importJson：importJson 会拒绝「progress 为空」的输入
 * （那是对外部文件的合理防御），但快照是本应用自己生成的，
 * 在全新设备上导入后想撤销，快照里本来就是空的，必须能恢复成空。
 */
function restoreSnapshot() {
  var s = readRaw(K.PREIMPORT)
  if (!s || typeof s.data !== 'string') {
    return { ok: false, msg: '没有可恢复的数据' }
  }

  var obj
  try {
    obj = JSON.parse(s.data)
  } catch (e) {
    return { ok: false, msg: '快照已损坏，无法恢复' }
  }
  if (!obj || obj.app !== 'lc150' || !obj.progress || typeof obj.progress !== 'object') {
    return { ok: false, msg: '快照已损坏，无法恢复' }
  }

  var normalized = normalizeProgress(obj.progress)
  var settings = obj.settings ? normalizeSettings(obj.settings) : normalizeSettings(null)

  state.progress = normalized
  state.settings = settings
  writeRaw(K.PROGRESS, normalized)
  writeRaw(K.SETTINGS, settings)
  removeRaw(K.PLAN)      // 题单按恢复后的进度重算
  removeRaw(K.PREIMPORT) // 只能撤销一次

  return {
    ok: true,
    count: Object.keys(normalized).length,
    msg: '已恢复到导入前'
  }
}

/** 丢弃快照 */
function dropSnapshot() {
  removeRaw(K.PREIMPORT)
}

module.exports = {
  KEYS: K,
  init: init,
  getSettings: getSettings,
  setSettings: setSettings,
  getAllProgress: getAllProgress,
  getProgress: getProgress,
  planToday: planToday,
  todayView: todayView,
  completeQuestion: completeQuestion,
  gradeReview: gradeReview,
  setNote: setNote,
  reviewQueue: reviewQueue,
  streak: streak,
  summary: summary,
  stageStats: stageStats,
  detailView: detailView,
  exportJson: exportJson,
  validateImport: validateImport,
  importJson: importJson,
  clearAll: clearAll,
  snapshotBeforeImport: snapshotBeforeImport,
  getSnapshot: getSnapshot,
  restoreSnapshot: restoreSnapshot,
  dropSnapshot: dropSnapshot
}
