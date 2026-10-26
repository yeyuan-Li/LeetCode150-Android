/**
 * 题库只读访问层（不碰 storage，纯数据）
 * data/questions.js 是唯一数据源，本文件只做索引、分组、常量与展示映射。
 */

var questions = require('../data/questions.js')

/* ---------------- 常量 ---------------- */

// 三档自评 -> 复习间隔（天）。数组下标即轮次 round（从 1 开始）
var OFFSETS = {
  indep: [7],
  hint: [3, 7],
  solution: [1, 3, 7]
}

var GRADE_LIST = [
  { key: 'indep', label: '独立', desc: '没看提示自己 AC', rule: 'D+7' },
  { key: 'hint', label: '提示', desc: '看了提示/部分题解', rule: 'D+3 · D+7' },
  { key: 'solution', label: '题解', desc: '抄了题解', rule: 'D+1 · D+3 · D+7' }
]

var GRADE_LABEL = { indep: '独立', hint: '提示', solution: '题解' }

var DIFF_NAME = { Easy: 'Easy', Medium: 'Medium', Hard: 'Hard' }

// 难度 -> 样式类（绿/黄/红）
var DIFF_CLASS = { Easy: 'easy', Medium: 'medium', Hard: 'hard' }

var STAGE_INDEX_CN = ['一', '二', '三', '四', '五', '六', '七', '八']

/* ---------------- 索引 ---------------- */

var byNoMap = {}
var byOrder = questions.slice().sort(function (a, b) { return a.order - b.order })

byOrder.forEach(function (q) { byNoMap[q.no] = q })

/** 全部题目（按 order 升序） */
function all() {
  return byOrder
}

/** 按题号取题 */
function byNo(no) {
  return byNoMap[Number(no)] || null
}

/** 是否题库内题号 */
function has(no) {
  return !!byNoMap[Number(no)]
}

/** 8 个阶段的元信息（按 stage 升序） */
function stageList() {
  var map = {}
  byOrder.forEach(function (q) {
    if (!map[q.stage]) {
      map[q.stage] = {
        stage: q.stage,
        title: q.stageTitle,
        indexCn: STAGE_INDEX_CN[q.stage - 1] || String(q.stage),
        total: 0
      }
    }
    map[q.stage].total++
  })
  return Object.keys(map)
    .map(function (k) { return map[k] })
    .sort(function (a, b) { return a.stage - b.stage })
}

/** 某阶段全部题目 */
function stageQuestions(stage) {
  return byOrder.filter(function (q) { return q.stage === Number(stage) })
}

/* ---------------- 展示映射 ---------------- */

/**
 * 把题目 + 该题进度压成列表项视图模型
 * @param {Object} q 题目
 * @param {Object} p 进度（可为 undefined）
 */
function toRow(q, p) {
  var done = !!(p && p.done)
  var due = 0
  if (p && p.reviews) {
    for (var i = 0; i < p.reviews.length; i++) {
      if (!p.reviews[i].done) { due++; }
    }
  }
  var graded = p && p.grade ? GRADE_LABEL[p.grade] : ''
  return {
    no: q.no,
    order: q.order,
    // url / slug 必须透传：详情页「复制题目链接」依赖它，漏了会导致 setClipboardData 拿到 undefined
    url: q.url || '',
    slug: q.slug || '',
    titleCn: q.titleCn,
    titleEn: q.titleEn,
    difficulty: q.difficulty,
    diffClass: DIFF_CLASS[q.difficulty] || 'easy',
    diffName: DIFF_NAME[q.difficulty] || q.difficulty,
    star: !!q.star,
    stage: q.stage,
    stageCn: STAGE_INDEX_CN[q.stage - 1] || String(q.stage),
    stageTitle: q.stageTitle,
    topic: q.topic,
    done: done,
    graded: graded,
    pendingReview: due > 0,
    minutes: (p && p.minutes) || 0,
    date: (p && p.date) || ''
  }
}

module.exports = {
  OFFSETS: OFFSETS,
  GRADE_LIST: GRADE_LIST,
  GRADE_LABEL: GRADE_LABEL,
  DIFF_CLASS: DIFF_CLASS,
  all: all,
  byNo: byNo,
  has: has,
  stageList: stageList,
  stageQuestions: stageQuestions,
  toRow: toRow
}
