#!/usr/bin/env node
/**
 * check.js —— 验证 H5 侧（bundle.js）与小程序侧行为一致
 *
 * 做法：用 Node 模拟出浏览器最小环境（window + localStorage），
 * 加载 env.js + bundle.js（与 APK 里完全相同的文件），再跑一遍核心断言。
 * 这样能确保「同一份源码在两端表现一致」，而不是靠肉眼比对。
 */

var fs = require('fs')
var path = require('path')

var WWW = path.resolve(__dirname, '../assets/www')

/* ---------------- 模拟浏览器环境 ---------------- */

var disk = {}
var localStorage = {
  getItem: function (k) { return Object.prototype.hasOwnProperty.call(disk, k) ? disk[k] : null },
  setItem: function (k, v) { disk[k] = String(v) },
  removeItem: function (k) { delete disk[k] }
}

global.window = global
global.localStorage = localStorage
global.document = {
  createElement: function () { return { style: {}, select: function () {} } },
  body: { appendChild: function () {}, removeChild: function () {} },
  execCommand: function () { return true }
}

/* ---------------- 加载真实文件 ---------------- */

function load(rel) {
  var code = fs.readFileSync(path.join(WWW, rel), 'utf8')
  // 用 Function 包装执行，作用域仍指向 global
  new Function(code)()
}

load('js/env.js')
load('js/bundle.js')

var LC = global.LC150
var store = LC.store
var bank = LC.bank
var date = LC.date

/* ---------------- 断言框架 ---------------- */

var pass = 0
var fail = 0
var lines = []

function ok(name, cond, extra) {
  if (cond) { pass++; lines.push('  PASS  ' + name) }
  else { fail++; lines.push('  FAIL  ' + name + (extra ? '  →  ' + extra : '')) }
}

function eq(name, actual, expect) {
  var a = JSON.stringify(actual)
  var b = JSON.stringify(expect)
  ok(name, a === b, 'actual=' + a + ' expect=' + b)
}

function section(t) { lines.push(''); lines.push('■ ' + t) }

/* ---------------- 用例 ---------------- */

section('1. 题库与存储桥接')

ok('LC150 已挂载', !!LC)
eq('题库 150 题', bank.all().length, 150)
ok('wx shim 存在', typeof global.wx.getStorageSync === 'function')
ok('localStorage 可写', (function () {
  global.wx.setStorageSync('lc150:test', { a: 1 })
  var back = global.wx.getStorageSync('lc150:test')
  global.wx.removeStorageSync('lc150:test')
  return back && back.a === 1
})())

store.init()
store.clearAll()
ok('init + clearAll 正常', store.summary().doneCount === 0)

section('2. 复习排期（与小程序同一套规则）')

var TODAY = date.today()

store.completeQuestion(129, { grade: 'indep', minutes: 21 })
eq('独立 → D+7', store.getProgress(129).reviews.map(function (r) { return r.due }), [date.addDays(TODAY, 7)])

store.completeQuestion(49, { grade: 'hint', minutes: 18 })
eq('提示 → D+3, D+7', store.getProgress(49).reviews.map(function (r) { return r.due }),
  [date.addDays(TODAY, 3), date.addDays(TODAY, 7)])

store.completeQuestion(76, { grade: 'solution', minutes: 33 })
eq('题解 → D+1, D+3, D+7', store.getProgress(76).reviews.map(function (r) { return r.due }),
  [date.addDays(TODAY, 1), date.addDays(TODAY, 3), date.addDays(TODAY, 7)])

section('3. 视图模型（页面实际消费的字段）')

var row = bank.toRow(bank.byNo(242), store.getProgress(242))
ok('题目行带 url', /^https:\/\/leetcode\.cn/.test(row.url), row.url)
ok('题目行带难度类', !!row.diffClass)

var dv = store.detailView(49)
ok('detailView 带 reviews', dv.reviews.length === 2)
ok('detailView 带 note 字段', typeof dv.note === 'string')

var s = store.summary()
eq('已完成 3 题', s.doneCount, 3)
// 刚完成的题最早已排到 D+1，今天不该出现在「待复习」里
eq('今天没有到期复习（排期都在未来）', s.dueCount, 0)
eq('今日完成 3 题', s.todayDone, 3)
eq('连续打卡 1 天', s.streak, 1)

section('4. 今日题单与门禁')

var plan = store.planToday()
ok('今日题单有内容', plan.nos.length > 0, 'nos=' + plan.nos.length)
ok('今日题单不含已完成题', plan.nos.indexOf(129) < 0 && plan.nos.indexOf(49) < 0 && plan.nos.indexOf(76) < 0)

var st = store.stageStats()
eq('8 个阶段', st.length, 8)
eq('阶段一总数 18', st[0].total, 18)
ok('阶段一已解锁', st[0].unlocked === true)
ok('阶段三锁定', st[2].unlocked === false, 'gap=' + st[2].gap)

section('5. 复习队列与顺延')

// 构造一个逾期场景：把 129 的第 1 轮到期日改成昨天
var seeded = JSON.parse(store.exportJson())
seeded.progress['129'].reviews[0].due = date.addDays(TODAY, -1)
ok('构造逾期数据成功', store.importJson(JSON.stringify(seeded)).ok === true)

var queue = store.reviewQueue()
ok('逾期题进入待复习队列', queue.length === 1 && queue[0].no === 129,
  'len=' + queue.length + ' first=' + (queue[0] && queue[0].no))
eq('逾期天数 = 1', queue[0] && queue[0].overdue, 1)
eq('待复习红点数同步', store.summary().dueCount, 1)

ok('队列按到期日升序', (function () {
  for (var i = 1; i < queue.length; i++) {
    if (queue[i - 1].due > queue[i].due) return false
  }
  return true
})())

var before = store.getProgress(76).reviews.length
var g = store.gradeReview(76, { round: 1, grade: 'indep', minutes: 12 })
ok('复习第 1 轮成功', g.ok === true, g.msg)
ok('重新自评后按新档重排', store.getProgress(76).reviews.length === 1, 'was ' + before)

section('6. 导出 → 清空 → 导入')

var dump = store.exportJson()
ok('导出非空', dump.length > 100)
store.clearAll()
eq('清空后归零', store.summary().doneCount, 0)

var back2 = store.importJson(dump)
ok('导入成功', back2.ok === true, back2.msg)
eq('导入后还原完成数', store.summary().doneCount, 3)
eq('导入后备注还在', store.getProgress(129).note || '', '')

var bad = store.importJson('{"app":"wrong"}')
ok('非法导入被拒绝', bad.ok === false, bad.msg)

section('7. 本地持久化（模拟重启）')

ok('progress 确实落到 localStorage', (function () {
  var raw = localStorage.getItem('lc150:progress')
  if (!raw) return false
  var obj = JSON.parse(raw)
  return !!obj['129'] && obj['129'].done === true
})())

/* ---------------- 汇总 ---------------- */

lines.push('')
lines.push('──────────────────────────────────────────')
lines.push('H5 侧通过 ' + pass + ' 项，失败 ' + fail + ' 项')
console.log(lines.join('\n'))
process.exit(fail === 0 ? 0 : 1)
