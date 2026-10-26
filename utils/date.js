/**
 * 日期工具
 * 全项目统一使用本地时区的 "YYYY-MM-DD" 字符串，避免 Date 对象跨时区/序列化踩坑。
 * 复习排期的 D+n 全部基于这里的 addDays 计算。
 */

function pad(n) {
  return n < 10 ? '0' + n : '' + n
}

/** Date -> "YYYY-MM-DD" */
function fmt(d) {
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
}

/** 今天 */
function today() {
  return fmt(new Date())
}

/** "YYYY-MM-DD" -> Date（本地 0 点） */
function parse(s) {
  var a = String(s).split('-')
  return new Date(Number(a[0]), Number(a[1]) - 1, Number(a[2]))
}

/** 在 "YYYY-MM-DD" 上加减天数 */
function addDays(s, n) {
  var d = parse(s)
  d.setDate(d.getDate() + n)
  return fmt(d)
}

/** a 到 b 相差几天（b 晚于 a 为正） */
function diffDays(a, b) {
  return Math.round((parse(b).getTime() - parse(a).getTime()) / 86400000)
}

/** 时间戳 -> "YYYY-MM-DD" */
function fromTs(ts) {
  return fmt(new Date(ts))
}

/** 时间戳 -> "MM-DD HH:mm" */
function fromTsShort(ts) {
  var d = new Date(ts)
  return pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes())
}

var WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

/** "YYYY-MM-DD" -> "10 月 26 日 · 周一" */
function cnDate(s) {
  var d = parse(s)
  return (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日 · ' + WEEK[d.getDay()]
}

/** 相对今天的人性化描述 */
function relative(s) {
  var n = diffDays(today(), s)
  if (n === 0) return '今天'
  if (n === 1) return '明天'
  if (n === -1) return '昨天'
  if (n > 1) return n + ' 天后'
  return Math.abs(n) + ' 天前'
}

module.exports = {
  pad: pad,
  fmt: fmt,
  today: today,
  parse: parse,
  addDays: addDays,
  diffDays: diffDays,
  fromTs: fromTs,
  fromTsShort: fromTsShort,
  cnDate: cnDate,
  relative: relative
}
