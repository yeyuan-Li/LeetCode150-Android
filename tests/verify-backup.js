/**
 * tests/verify-backup.js —— 换机备份专项自测（Node 环境，mock 掉 wx 存储）
 *
 * 覆盖「导出成文件 → 传到新设备 → 导入」这条链路里逻辑层的全部环节：
 *   1 导出内容的完整性（题目数、设置、字段）
 *   2 validateImport 与 importJson 判定一致（前者通过，后者必成功）
 *   3 导入前快照 → 导入 → 撤销，能完整回到导入前
 *   4 导入失败不产生快照、也不冲掉已有快照
 *   5 重复导入 / 跨设备往返不丢数据
 *
 * 运行：node tests/verify-backup.js
 */

var path = require('path')

var ROOT = path.resolve(__dirname, '..')

/* ---------------- mock wx 本地存储 ---------------- */
var raw = {}
global.wx = {
  getStorageSync: function (k) {
    if (!Object.prototype.hasOwnProperty.call(raw, k)) return ''
    return JSON.parse(JSON.stringify(raw[k]))
  },
  setStorageSync: function (k, v) {
    raw[k] = JSON.parse(JSON.stringify(v))
  },
  removeStorageSync: function (k) {
    delete raw[k]
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
  lines.push('── ' + t + ' ' + new Array(Math.max(2, 46 - t.length)).join('─'))
}

/* ============================================================
 * 0. 准备
 * ============================================================ */
store.init()
store.clearAll()

var TODAY = date.today()

/* ============================================================
 * 1. 导出内容完整性
 * ============================================================ */
section('1. 导出内容完整性')

store.completeQuestion(242, { grade: 'hint', minutes: 23, note: '哈希计数' })
store.completeQuestion(49, { grade: 'indep', minutes: 15, note: '' })
store.completeQuestion(76, { grade: 'solution', minutes: 41, note: '看题解才懂' })
store.setSettings({ dailyTarget: 5, theme: 'light', examMode: true })

var exported = store.exportJson()
var obj = JSON.parse(exported)

eq('app 标识', obj.app, 'lc150')
eq('题目数声明', obj.questionCount, 150)
eq('progress 条数', Object.keys(obj.progress).length, 3)
eq('设置一并导出', obj.settings, { dailyTarget: 5, examMode: true, theme: 'light' })
ok('含导出时间戳', typeof obj.exportedAt === 'string' && obj.exportedAt.length > 10)
ok('备注写进导出内容', obj.progress['242'].note === '哈希计数')
ok('自评档位写进导出内容', obj.progress['76'].grade === 'solution')
ok('复习排期写进导出内容', Array.isArray(obj.progress['76'].reviews) && obj.progress['76'].reviews.length === 3)
ok('导出是合法 JSON 单行文本（可整存文件）', exported.indexOf('\n') === -1 && exported.length > 200)

/* ============================================================
 * 2. validateImport 与 importJson 判定一致
 * ============================================================ */
section('2. 校验与导入判定一致')

var good = store.validateImport(exported)
ok('合法数据校验通过', good.ok === true)
ok('校验结果带回原始对象', good.data && typeof good.data === 'object')

// 各类非法输入：两者必须给出相同结论
var bads = [
  ['空字符串', ''],
  ['纯空白', '   '],
  ['非 JSON', 'not json at all'],
  ['JSON 但不是对象', '[1,2,3]'],
  ['缺 app 标识', JSON.stringify({ progress: {} })],
  ['缺 progress', JSON.stringify({ app: 'lc150' })],
  ['progress 是数组', JSON.stringify({ app: 'lc150', progress: [] })],
  ['progress 为空', JSON.stringify({ app: 'lc150', progress: {} })],
  ['题号不存在', JSON.stringify({ app: 'lc150', progress: { '99999': { done: true, grade: 'indep' } } })],
  ['done 非布尔', JSON.stringify({ app: 'lc150', progress: { '242': { done: 'yes' } } })],
  ['grade 非法', JSON.stringify({ app: 'lc150', progress: { '242': { done: true, grade: 'easy' } } })],
  ['轮次越界', JSON.stringify({
    app: 'lc150',
    progress: { '242': { done: true, grade: 'indep', reviews: [{ due: '2026-01-01', round: 5 }] } }
  })],
  ['日期格式错', JSON.stringify({ app: 'lc150', progress: { '242': { done: true, grade: 'indep', date: '2026/01/01' } } })],
  ['复习日期错', JSON.stringify({
    app: 'lc150',
    progress: { '242': { done: true, grade: 'indep', reviews: [{ due: '01-01', round: 1 }] } }
  })]
]

var consistent = true
var mismatch = ''
for (var i = 0; i < bads.length; i++) {
  var v = store.validateImport(bads[i][1])
  var r = store.importJson(bads[i][1])
  if (v.ok !== r.ok) {
    consistent = false
    mismatch = bads[i][0] + ' 判定不一致'
    break
  }
  if (v.ok) {
    consistent = false
    mismatch = bads[i][0] + ' 竟然通过了校验'
    break
  }
}
ok('14 类非法输入：校验与导入结论完全一致', consistent, mismatch)

/* ============================================================
 * 3. 快照 → 导入 → 撤销
 * ============================================================ */
section('3. 导入前快照与撤销')

// 先制造「老设备有 3 题」的状态，并留快照
var beforeImport = store.exportJson()
store.snapshotBeforeImport()

var snap = store.getSnapshot()
ok('快照已生成', snap !== null)
eq('快照记录题数', snap.count, 3)
ok('快照带时间戳', snap.at > 0)

// 模拟：把新设备（空进度）的备份导入进来 —— 这是最容易点错的场景
var emptyDevice = JSON.stringify({
  app: 'lc150',
  version: 1,
  progress: { '1': { done: true, grade: 'indep', minutes: 10, reviews: [], history: [] } },
  settings: { dailyTarget: 3, examMode: false, theme: 'dark' }
})

var r1 = store.importJson(emptyDevice)
ok('导入另一台设备的数据成功', r1.ok === true)
eq('导入后只剩 1 题', Object.keys(JSON.parse(store.exportJson()).progress).length, 1)
eq('导入后设置被替换', store.getSettings().dailyTarget, 3)

// 撤销
var r2 = store.restoreSnapshot()
ok('撤销成功', r2.ok === true)
eq('撤销后回到 3 题', Object.keys(JSON.parse(store.exportJson()).progress).length, 3)
eq('撤销后设置恢复', store.getSettings(), { dailyTarget: 5, examMode: true, theme: 'light' })
eq('撤销后导出内容与导入前逐字节相同', store.exportJson().replace(/"exportedAt":"[^"]*"/, ''), beforeImport.replace(/"exportedAt":"[^"]*"/, ''))
ok('撤销后快照被清理（不能反复撤销）', store.getSnapshot() === null)
ok('再次撤销会失败而不是清空数据', store.restoreSnapshot().ok === false && Object.keys(JSON.parse(store.exportJson()).progress).length === 3)

/* ============================================================
 * 4. 导入失败不污染状态
 * ============================================================ */
section('4. 导入失败时状态零改动')

store.snapshotBeforeImport()
var keep = store.exportJson().replace(/"exportedAt":"[^"]*"/, '')

var rBad = store.importJson('{"app":"lc150","progress":{"88888":{"done":true,"grade":"indep"}}}')
ok('非法题号被拒', rBad.ok === false)

var after = store.exportJson().replace(/"exportedAt":"[^"]*"/, '')
eq('现有数据一字未改', after, keep)
eq('题目数仍为 3', Object.keys(JSON.parse(store.exportJson()).progress).length, 3)

// 失败时不能把已有快照冲掉：先校验再快照，是页面层遵守的顺序
ok('失败后快照仍在（页面先校验后快照）', store.getSnapshot() !== null)

/* ============================================================
 * 5. 跨设备往返：老设备 → 文件 → 新设备 → 再导回
 * ============================================================ */
section('5. 跨设备往返')

// 老设备导出（这就是要发到新手机的那段文本）
var deviceA = store.exportJson()

// 新设备：清空模拟全新安装
store.clearAll()
eq('新设备初始为空', Object.keys(JSON.parse(store.exportJson()).progress).length, 0)

// 新设备导入
var r3 = store.importJson(deviceA)
ok('新设备导入成功', r3.ok === true)
eq('新设备题数', Object.keys(JSON.parse(store.exportJson()).progress).length, 3)
eq('新设备备注还原', store.detailView(242).note, '哈希计数')
ok('新设备复习排期还原', store.detailView(76).reviews.length === 3)

// 逐字段比对（忽略时间戳）
function stripExport(s) {
  return s.replace(/"exportedAt":"[^"]*"/, '').replace(/"exportedAt": "[^"]*"/g, '')
}
eq('往返后全量一致（逐字节）', stripExport(store.exportJson()), stripExport(deviceA))

// 在新设备继续做题，再导回老设备
store.completeQuestion(11, { grade: 'indep', minutes: 12, note: '双指针' })
var deviceB = store.exportJson()
eq('新设备继续做题后 4 题', Object.keys(JSON.parse(deviceB).progress).length, 4)

store.importJson(deviceB)
eq('导回老设备后 4 题', Object.keys(JSON.parse(store.exportJson()).progress).length, 4)
ok('新加的题也在', !!JSON.parse(store.exportJson()).progress['11'])

/* ============================================================
 * 6. 清空也要清掉快照
 * ============================================================ */
section('6. 清空彻底')

store.snapshotBeforeImport()
ok('清空前快照存在', store.getSnapshot() !== null)
store.clearAll()
ok('清空后快照一并清除', store.getSnapshot() === null)
eq('清空后无记录', Object.keys(JSON.parse(store.exportJson()).progress).length, 0)

/* ============================================================
 * 汇总
 * ============================================================ */
console.log(lines.join('\n'))
console.log('')
console.log('──────────────────────────────────────────')
console.log('通过 ' + pass + ' 项，失败 ' + fail + ' 项')
process.exit(fail === 0 ? 0 : 1)
