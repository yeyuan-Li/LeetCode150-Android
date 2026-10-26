/**
 * tests/verify-store.js —— 本地自测（Node 环境，mock 掉 wx 存储）
 * 覆盖验收标准：
 *   1 题库与 JSON 完全一致
 *   2 完成后重进状态仍在（写盘 -> 重新 init -> 读回）
 *   3 三档自评的复习日期符合规则
 *   4 导出 -> 清空 -> 导入完整还原
 *   5 今日页按 dailyTarget 出题、不重复、不含已完成
 *   6 阶段门禁锁定 / 解锁与「还差几题」
 *   7 待复习队列（逾期 / 今日到期）与复习后顺延
 *   8 导入非法数据时报错且不覆盖
 *
 * 运行：node tests/verify-store.js
 */

var path = require('path')
var fs = require('fs')

var ROOT = path.resolve(__dirname, '..')

/* ---------------- mock wx 本地存储 ---------------- */
var store_raw = {}
global.wx = {
  getStorageSync: function (k) {
    if (!Object.prototype.hasOwnProperty.call(store_raw, k)) return ''
    return JSON.parse(JSON.stringify(store_raw[k]))
  },
  setStorageSync: function (k, v) {
    store_raw[k] = JSON.parse(JSON.stringify(v))
  },
  removeStorageSync: function (k) {
    delete store_raw[k]
  }
}

var store = require(path.join(ROOT, 'utils/store.js'))
var bank = require(path.join(ROOT, 'utils/bank.js'))
var date = require(path.join(ROOT, 'utils/date.js'))

/* ---------------- 断言工具 ---------------- */
var pass = 0
var fail = 0
var lines = []

function ok(name, cond, extra) {
  if (cond) {
    pass++
    lines.push('  PASS  ' + name)
  } else {
    fail++
    lines.push('  FAIL  ' + name + (extra ? '  → ' + extra : ''))
  }
}

function eq(name, actual, expect) {
  var a = JSON.stringify(actual)
  var b = JSON.stringify(expect)
  ok(name, a === b, 'got ' + a + ' / expect ' + b)
}

function section(t) {
  lines.push('')
  lines.push('■ ' + t)
}

var TODAY = date.today()

/* ============================================================
 * 1. 题库与 JSON 完全一致
 * ============================================================ */
section('1. 题库一致性（150 题，逐字段比对）')

var srcJson = JSON.parse(fs.readFileSync('D:/Obsidian/存放仓库/D盘仓库部署/leetcode150.json', 'utf8'))
var local = bank.all()
var FIELDS = ['order', 'no', 'slug', 'url', 'titleCn', 'titleEn', 'difficulty', 'star', 'stage', 'stageTitle', 'topic', 'done']

eq('题量 150', local.length, 150)
eq('字段集合一致', Object.keys(local[0]).sort(), Object.keys(srcJson[0]).sort())

var diffCount = 0
var detail = ''
srcJson.forEach(function (s, i) {
  FIELDS.forEach(function (f) {
    if (JSON.stringify(local[i][f]) !== JSON.stringify(s[f])) {
      diffCount++
      if (!detail) detail = '第 ' + (i + 1) + ' 项字段 ' + f + ' 不一致'
    }
  })
})
ok('12 个字段 × 150 题逐项一致', diffCount === 0, detail)

var orders = local.map(function (q) { return q.order })
eq('order 连续 1..150', orders, Array.from({ length: 150 }, function (_, i) { return i + 1 }))
eq('题号唯一', new Set(local.map(function (q) { return q.no })).size, 150)

var bigJson = srcJson.filter(function (q) { return q.difficulty === 'Hard' }).length
eq('Hard 题数 19', bigJson, 19)
eq('⭐ 题数 57', local.filter(function (q) { return q.star }).length, 57)
eq('8 个阶段题数', bank.stageList().map(function (s) { return s.total }), [18, 16, 21, 18, 16, 29, 14, 18])

/* ============================================================
 * 2. 完成 -> 落盘 -> 重启后仍在
 * ============================================================ */
section('2. 持久化（完成后重进状态仍存）')

store.init()
store.clearAll()

var r242 = store.completeQuestion(242, { grade: 'hint', minutes: 23, note: '先比长度再比计数' })
ok('完成 242 返回成功', r242.ok === true, r242.msg)
ok('生成 2 轮复习（hint）', r242.rounds === 2, 'rounds=' + r242.rounds)

// 模拟「关掉小程序再打开」：清空 require 缓存重新加载模块
delete require.cache[require.resolve(path.join(ROOT, 'utils/store.js'))]
delete require.cache[require.resolve(path.join(ROOT, 'utils/bank.js'))]
delete require.cache[require.resolve(path.join(ROOT, 'utils/date.js'))]
var store2 = require(path.join(ROOT, 'utils/store.js'))
store2.init()

var back = store2.getProgress(242)
ok('重启后 done 仍为 true', back.done === true)
eq('重启后用时仍是 23', back.minutes, 23)
eq('重启后自评仍是 hint', back.grade, 'hint')
eq('重启后备注仍在', back.note, '先比长度再比计数')
eq('重启后排期仍是 2 轮', back.reviews.length, 2)

// 后面的用例继续用重新加载后的实例，验证的是同一份真实存储
store = store2

/* ============================================================
 * 3. 三档自评的复习日期
 * ============================================================ */
section('3. 复习排期规则（三档各验证一题）')

function duesOf(no) {
  return store.getProgress(no).reviews.map(function (r) { return r.due + '#r' + r.round })
}

store.clearAll()

store.completeQuestion(129, { grade: 'indep', minutes: 21 })
seq('独立档 → D+7（1 轮）', duesOf(129), [date.addDays(TODAY, 7) + '#r1'])

store.completeQuestion(49, { grade: 'hint', minutes: 18 })
seq('提示档 → D+3、D+7（2 轮）', duesOf(49), [
  date.addDays(TODAY, 3) + '#r1',
  date.addDays(TODAY, 7) + '#r2'
])

store.completeQuestion(76, { grade: 'solution', minutes: 31 })
seq('题解档 → D+1、D+3、D+7（3 轮）', duesOf(76), [
  date.addDays(TODAY, 1) + '#r1',
  date.addDays(TODAY, 3) + '#r2',
  date.addDays(TODAY, 7) + '#r3'
])

/* ============================================================
 * 4. 今日题单
 * ============================================================ */
section('4. 今日题单（按 order、不重复、不含已完成）')

store.clearAll()
store.setSettings({ dailyTarget: 3 })

var plan1 = store.planToday()
eq('出题数量 = dailyTarget', plan1.nos.length, 3)
eq('取 order 最前 3 题', plan1.nos, [242, 383, 205])
eq('同日再次调用顺序不变', store.planToday().nos, plan1.nos)

// 完成其中一题后，题单不再包含它，且不会补新题（保证 x/3 的分母稳定）
store.completeQuestion(242, { grade: 'indep', minutes: 20 })
var v = store.todayView()
eq('已完成题从题单剔除', v.rows.map(function (r) { return r.no }), [383, 205])
eq('今日已完成数量为 1', store.summary().todayDone, 1)
eq('题单总量仍为 3', store.planToday().nos.length, 3)
ok('已完成题不出现在 rows 里', v.rows.every(function (r) { return !r.done }))
eq('doneNos 记录已完成题号', v.doneNos, [242])

// 目标改成 5，补齐到 5 且不与已有重复
store.setSettings({ dailyTarget: 5 })
var plan5 = store.planToday()
eq('目标改为 5 后补齐到 5 题', plan5.nos.length, 5)
eq('补齐后无重复', new Set(plan5.nos).size, 5)
eq('已完成的 242 仍保留在 plan 里（不重复占位）', plan5.nos.indexOf(242) >= 0, true)

// 再切回 3：必须收缩（旧版只补不缩，3 -> 5 -> 3 会一直停在 5 题）
store.setSettings({ dailyTarget: 3 })
var plan3 = store.planToday()
eq('目标改回 3 后收缩到 3 题', plan3.nos.length, 3)
eq('收缩后仍是原 5 题的前 3 个（顺序不变）', plan3.nos, plan5.nos.slice(0, 3))
eq('收缩后保留已完成的 242', plan3.nos.indexOf(242) >= 0, true)
eq('今日目标同步显示为 3', store.summary().dailyTarget, 3)
eq('今日页分母为 3', store.todayView().total, 3)

// 收缩时已完成的题优先保留（哪怕它排在后面）
store.clearAll()
store.setSettings({ dailyTarget: 5 })
var p5 = store.planToday()
store.completeQuestion(p5.nos[3], { grade: 'indep', minutes: 20 })
store.completeQuestion(p5.nos[4], { grade: 'indep', minutes: 20 })
store.setSettings({ dailyTarget: 3 })
var p3 = store.planToday()
eq('收缩后仍为 3 题', p3.nos.length, 3)
ok('收缩时优先保留已完成的两题',
  p3.nos.indexOf(p5.nos[3]) >= 0 && p3.nos.indexOf(p5.nos[4]) >= 0, p3.nos.join(','))
eq('剩余名额按原顺序补最前面的未完成题', p3.nos, [p5.nos[0], p5.nos[3], p5.nos[4]])
eq('今日已完成数量为 2', store.summary().todayDone, 2)

/* ============================================================
 * 5. 阶段门禁
 * ============================================================ */
section('5. 阶段门禁（独立率 >= 80%）')

store.clearAll()
var stage1 = bank.stageQuestions(1) // 18 题，需 ceil(0.8*18)=15 题独立

// 14 题独立 -> 阶段二应保持锁定，还差 1 题
stage1.slice(0, 14).forEach(function (q) { store.completeQuestion(q.no, { grade: 'indep', minutes: 20 }) })
var st1 = store.stageStats()
eq('阶段一 14 题独立时独立率 78%', st1[0].rate, 78)
eq('阶段一 need = 15', st1[0].need, 15)
eq('阶段一 gap = 1', st1[0].gap, 1)
eq('阶段一本身解锁', st1[0].unlocked, true)
eq('阶段二仍然锁定', st1[1].unlocked, false)

// 再补 1 题独立 -> 15/18 = 83%，阶段二解锁
store.completeQuestion(stage1[14].no, { grade: 'indep', minutes: 20 })
st1 = store.stageStats()
eq('阶段一 15 题独立时独立率 83%', st1[0].rate, 83)
eq('阶段一 gap 归零', st1[0].gap, 0)
eq('阶段二已解锁', st1[1].unlocked, true)
eq('阶段三仍锁定（阶段二 0/16）', st1[2].unlocked, false)
eq('阶段二还差 13 题（ceil(0.8*16)）', st1[1].gap, 13)
eq('阶段三自身独立率 0%', st1[2].rate, 0)

/* ============================================================
 * 6. 复习队列与顺延
 * ============================================================ */
section('6. 复习队列（到期 / 逾期 / 复习后顺延）')

store.clearAll()

// 造数据：一条今日到期、一条昨日逾期（走导入通道，同时验证导入可用）
var fixture = {
  app: 'lc150',
  version: 1,
  settings: { dailyTarget: 3, examMode: false, theme: 'dark' },
  progress: {}
}
fixture.progress[49] = {
  done: true, date: date.addDays(TODAY, -3), minutes: 20, grade: 'hint', note: '',
  reviews: [
    { due: TODAY, round: 1, done: false },
    { due: date.addDays(TODAY, 4), round: 2, done: false }
  ],
  history: [{ ts: Date.now() - 3 * 86400000, action: 'complete', grade: 'hint', minutes: 20 }]
}
fixture.progress[76] = {
  done: true, date: date.addDays(TODAY, -1), minutes: 30, grade: 'solution', note: '',
  reviews: [
    { due: date.addDays(TODAY, -1), round: 1, done: false },
    { due: date.addDays(TODAY, 1), round: 2, done: false },
    { due: date.addDays(TODAY, 5), round: 3, done: false }
  ],
  history: [{ ts: Date.now() - 86400000, action: 'complete', grade: 'solution', minutes: 30 }]
}

var imp = store.importJson(JSON.stringify(fixture))
ok('导入构造数据成功', imp.ok === true, imp.msg)

var queue = store.reviewQueue()
eq('队列长度 2（未到期的不进队列）', queue.length, 2)
eq('按到期日升序（逾期在前）', queue.map(function (r) { return r.no }), [76, 49])
eq('76 逾期 1 天', queue[0].overdue, 1)
eq('49 今日到期', queue[1].overdue, 0)

// 完成 76 的第 1 轮，重新自评为 indep -> 后续重排为 D+7
var gr = store.gradeReview(76, { round: 1, grade: 'indep', minutes: 12 })
ok('复习提交成功', gr.ok === true, gr.msg)
seq('复习后按新档位顺延为 D+7（1 轮）', duesOf(76), [date.addDays(TODAY, 7) + '#r1'])
eq('队列剩 1 条', store.reviewQueue().length, 1)
ok('历史里留下复习记录', store.getProgress(76).history.some(function (h) { return h.action === 'review' }))

// 已完成轮次不能重复提交
var gr2 = store.gradeReview(76, { round: 1, grade: 'indep', minutes: 10 })
// round 1 已被重排成新的待复习轮次，这里应继续成功（新周期第 1 轮）
ok('重排后的第 1 轮可再次提交', gr2.ok === true, gr2.msg)

/* ============================================================
 * 7. 导出 -> 清空 -> 导入 完整还原
 * ============================================================ */
section('7. 导出 / 清空 / 导入 往返')

store.clearAll()
store.completeQuestion(242, { grade: 'hint', minutes: 23, note: '往返测试备注' })
store.completeQuestion(146, { grade: 'solution', minutes: 41, note: '' })
store.completeQuestion(1, { grade: 'indep', minutes: 9, note: '' })
store.setSettings({ dailyTarget: 4, theme: 'light', examMode: true })

var before = {
  progress: JSON.parse(JSON.stringify(store.getAllProgress())),
  settings: store.getSettings()
}
var dump = store.exportJson()

store.clearAll()
eq('清空后进度为空', Object.keys(store.getAllProgress()).length, 0)
eq('清空后目标回到默认 3', store.getSettings().dailyTarget, 3)

var back2 = store.importJson(dump)
ok('导入成功', back2.ok === true, back2.msg)
eq('进度完全还原', JSON.parse(JSON.stringify(store.getAllProgress())), before.progress)
eq('设置完全还原', store.getSettings(), before.settings)
ok('导出串带 app 标识', JSON.parse(dump).app === 'lc150')

/* ============================================================
 * 8. 导入校验：非法数据不覆盖
 * ============================================================ */
section('8. 导入校验（失败不覆盖现有数据）')

var keep = JSON.parse(JSON.stringify(store.getAllProgress()))

var bads = [
  ['非 JSON', 'not json at all', 'JSON 解析失败'],
  ['缺 app 标识', JSON.stringify({ progress: { 242: { done: true } } }), '不是本应用'],
  ['缺 progress', JSON.stringify({ app: 'lc150' }), '缺少 progress'],
  ['题号不在题库', JSON.stringify({ app: 'lc150', progress: { 99999: { done: true, grade: 'indep' } } }), '不存在题号'],
  ['done 非布尔', JSON.stringify({ app: 'lc150', progress: { 242: { done: 'yes', grade: 'indep' } } }), 'done 布尔值'],
  ['grade 非法', JSON.stringify({ app: 'lc150', progress: { 242: { done: true, grade: 'perfect' } } }), 'grade 非法'],
  ['复习轮次越界', JSON.stringify({ app: 'lc150', progress: { 242: { done: true, grade: 'indep', reviews: [{ due: TODAY, round: 5 }] } } }), '轮次必须是 1/2/3'],
  ['日期格式错', JSON.stringify({ app: 'lc150', progress: { 242: { done: true, grade: 'indep', reviews: [{ due: '2026/10/26', round: 1 }] } } }), '日期格式']
]

bads.forEach(function (b) {
  var r = store.importJson(b[1])
  ok('拒绝：' + b[0], r.ok === false && r.msg.indexOf(b[2]) >= 0, 'msg=' + r.msg)
})

eq('8 次失败导入后现有数据未变', JSON.parse(JSON.stringify(store.getAllProgress())), keep)

/* ============================================================
 * 9. 连续打卡
 * ============================================================ */
section('9. 连续打卡天数')

store.clearAll()
var fx = { app: 'lc150', progress: {} }
// 用题库里真实存在的题号，避免被导入校验拒绝
var realNos = bank.all().slice(0, 5).map(function (q) { return q.no })

realNos.slice(0, 4).forEach(function (no, i) {
  fx.progress[no] = {
    done: true,
    date: date.addDays(TODAY, -i),
    minutes: 20,
    grade: 'indep',
    reviews: [],
    history: [{ ts: Date.now() - i * 86400000, action: 'complete', grade: 'indep', minutes: 20 }]
  }
})
// -4 天故意留空，-5 天有记录：验证断档后只数到 4 天
fx.progress[realNos[4]] = {
  done: true, date: date.addDays(TODAY, -5), minutes: 20, grade: 'indep',
  reviews: [], history: [{ ts: Date.now() - 5 * 86400000, action: 'complete', grade: 'indep', minutes: 20 }]
}

var r9 = store.importJson(JSON.stringify(fx))
ok('打卡测试数据导入成功', r9.ok === true, r9.msg)
eq('连续打卡 4 天（断档后重新计数）', store.streak(), 4)

/* ============================================================
 * 10. 视图模型字段完整性（映射层不许丢字段）
 * 回归：url 曾在 toRow 被漏掉，导致详情页 setClipboardData(undefined) 报「复制失败」
 * ============================================================ */
section('10. 视图模型字段完整性（防止映射层丢字段）')

// 详情页 / 列表页实际要用的字段，缺一个就算失败
var REQUIRE_ROW_KEYS = [
  'no', 'order', 'url', 'slug', 'titleCn', 'titleEn', 'difficulty',
  'diffClass', 'diffName', 'star', 'stage', 'stageTitle', 'topic',
  'done', 'graded', 'pendingReview', 'minutes', 'date'
]

var missingKeyHits = []
local.forEach(function (q) {
  var row = bank.toRow(q, store.getProgress(q.no))
  REQUIRE_ROW_KEYS.forEach(function (k) {
    if (row[k] === undefined || row[k] === null || row[k] === '') {
      if (k === 'graded' || k === 'date') return // 未做过时为空的合法字段
      missingKeyHits.push(q.no + '.' + k)
    }
  })
})
ok('150 题的行视图字段齐全', missingKeyHits.length === 0,
  missingKeyHits.length ? '缺失 ' + missingKeyHits.length + ' 处，如 ' + missingKeyHits.slice(0, 5).join(', ') : '')

// url 必须逐题与 JSON 源一致（不能是兜底拼出来的也算对）
var urlMismatch = local.filter(function (q) {
  return bank.toRow(q, null).url !== q.url
})
eq('150 题 url 与 JSON 源逐条一致', urlMismatch.length, 0)

var dv = store.detailView(242)
ok('detailView 带 url', !!(dv && dv.url && dv.url.indexOf('http') === 0), dv && dv.url)
eq('detailView.url 等于题库 url', dv.url, bank.byNo(242).url)
ok('detailView 带 slug（url 缺失时可兜底拼）', !!dv.slug, dv.slug)
ok('detailView 带 reviews 数组', Array.isArray(dv.reviews))
ok('detailView 带 history 数组', Array.isArray(dv.history))

// 逐题确认每道题都能拿到可复制的链接
var noUrl = local.filter(function (q) {
  var v = store.detailView(q.no)
  return !v || !v.url
})
eq('150 题全部可取到链接（复制按钮可用）', noUrl.length, 0)

/* ============================================================
 * 汇总
 * ============================================================ */
lines.push('')
lines.push('──────────────────────────────────────────')
lines.push('通过 ' + pass + ' 项，失败 ' + fail + ' 项')
console.log(lines.join('\n'))
process.exit(fail === 0 ? 0 : 1)

/* ---------------- 辅助 ---------------- */
function seq(name, actual, expect) {
  eq(name, actual, expect)
}
