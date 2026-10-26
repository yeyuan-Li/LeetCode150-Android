#!/usr/bin/env node
/**
 * 生成 assets/www/js/bundle.js
 *
 * 目的：让 APK 里的 H5 直接复用小程序工程中 utils/ 与 data/ 的**同一份源码**，
 * 不复制、不改写业务逻辑——那部分已被 tests/verify-store.js 的 75 项断言验证过。
 *
 * 做法：把每个源文件包进 CommonJS 风格的工厂函数，提供一个 30 行的 loaders 运行时。
 * 源文件里的 module.exports / require('./bank.js') 在浏览器里照常工作。
 */

var fs = require('fs')
var path = require('path')

var ROOT = path.resolve(__dirname, '../..')          // 工程根（含 utils/ 与 data/）
var OUT = path.resolve(__dirname, '../assets/www/js/bundle.js')

var FILES = [
  { id: 'questions', file: 'data/questions.js' },
  { id: 'date', file: 'utils/date.js' },
  { id: 'bank', file: 'utils/bank.js' },
  { id: 'store', file: 'utils/store.js' }
]

var parts = []

parts.push('/* ============================================================')
parts.push(' * bundle.js —— 由 app-droid/tools/bundle.js 自动生成，请勿手工编辑')
parts.push(' * 源文件：data/questions.js + utils/{date,bank,store}.js（与小程序共用）')
parts.push(' * 生成时间：' + new Date().toISOString())
parts.push(' * ============================================================ */')
parts.push('(function (global) {')
parts.push("  'use strict'")
parts.push('')
parts.push('  var defs = {}')
parts.push('  var cache = {}')
parts.push('')

// 逐个模块包装
FILES.forEach(function (m) {
  var src = fs.readFileSync(path.join(ROOT, m.file), 'utf8')
  parts.push('  /* ---------- ' + m.file + ' ---------- */')
  parts.push("  defs['" + m.id + "'] = function (module, exports, require) {")
  parts.push(src)
  parts.push('  }')
  parts.push('')
})

parts.push('  /* ---------- 极简模块运行时 ---------- */')
parts.push('  function resolveId(p) {')
parts.push("    // 只需要按文件名匹配：./bank.js -> bank，../data/questions.js -> questions")
parts.push("    return String(p).split('/').pop().replace(/\\.js$/, '')")
parts.push('  }')
parts.push('')
parts.push('  function load(id) {')
parts.push('    id = resolveId(id)')
parts.push('    if (cache[id]) return cache[id].exports')
parts.push('    if (!defs[id]) throw new Error("module not found: " + id)')
parts.push('    var m = { exports: {} }')
parts.push('    cache[id] = m')
parts.push('    defs[id](m, m.exports, load)')
parts.push('    return m.exports')
parts.push('  }')
parts.push('')
parts.push('  global.LC150 = {')
parts.push("    date: load('date'),")
parts.push("    bank: load('bank'),")
parts.push("    store: load('store')")
parts.push('  }')
parts.push('')
parts.push('})(typeof window !== "undefined" ? window : this);')
parts.push('')

fs.writeFileSync(OUT, parts.join('\n'), 'utf8')

var size = fs.statSync(OUT).size
console.log('已生成 ' + path.relative(ROOT, OUT))
console.log('体积 ' + (size / 1024).toFixed(1) + ' KB，模块 ' + FILES.length + ' 个')
