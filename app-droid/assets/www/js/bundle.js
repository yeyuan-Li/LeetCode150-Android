/* ============================================================
 * bundle.js —— 由 app-droid/tools/bundle.js 自动生成，请勿手工编辑
 * 源文件：data/questions.js + utils/{date,bank,store}.js（与小程序共用）
 * 生成时间：2026-10-26T09:35:15.621Z
 * ============================================================ */
(function (global) {
  'use strict'

  var defs = {}
  var cache = {}

  /* ---------- data/questions.js ---------- */
  defs['questions'] = function (module, exports, require) {
// ============================================================
// 本文件由 leetcode150.json 自动生成，请勿手工编辑
// 数据源：Leetcode_top_interview_150_checklist.md 的结构化题库
// 共 150 题，order 1..150；字段：order/no/slug/url/titleCn/titleEn/
// difficulty/star/stage/stageTitle/topic/done
// ============================================================

module.exports = [
  { order: 1, no: 242, slug: "valid-anagram", url: "https://leetcode.cn/problems/valid-anagram/", titleCn: "有效的字母异位词", titleEn: "Valid Anagram", difficulty: "Easy", star: true, stage: 1, stageTitle: "哈希表 / 双指针 / 滑动窗口", topic: "哈希表", done: false },
  { order: 2, no: 383, slug: "ransom-note", url: "https://leetcode.cn/problems/ransom-note/", titleCn: "赎金信", titleEn: "Ransom Note", difficulty: "Easy", star: false, stage: 1, stageTitle: "哈希表 / 双指针 / 滑动窗口", topic: "哈希表", done: false },
  { order: 3, no: 205, slug: "isomorphic-strings", url: "https://leetcode.cn/problems/isomorphic-strings/", titleCn: "同构字符串", titleEn: "Isomorphic Strings", difficulty: "Easy", star: false, stage: 1, stageTitle: "哈希表 / 双指针 / 滑动窗口", topic: "哈希表", done: false },
  { order: 4, no: 290, slug: "word-pattern", url: "https://leetcode.cn/problems/word-pattern/", titleCn: "单词规律", titleEn: "Word Pattern", difficulty: "Easy", star: false, stage: 1, stageTitle: "哈希表 / 双指针 / 滑动窗口", topic: "哈希表", done: false },
  { order: 5, no: 202, slug: "happy-number", url: "https://leetcode.cn/problems/happy-number/", titleCn: "快乐数", titleEn: "Happy Number", difficulty: "Easy", star: false, stage: 1, stageTitle: "哈希表 / 双指针 / 滑动窗口", topic: "哈希表", done: false },
  { order: 6, no: 219, slug: "contains-duplicate-ii", url: "https://leetcode.cn/problems/contains-duplicate-ii/", titleCn: "存在重复元素 II", titleEn: "Contains Duplicate II", difficulty: "Easy", star: false, stage: 1, stageTitle: "哈希表 / 双指针 / 滑动窗口", topic: "哈希表", done: false },
  { order: 7, no: 1, slug: "two-sum", url: "https://leetcode.cn/problems/two-sum/", titleCn: "两数之和", titleEn: "Two Sum", difficulty: "Easy", star: true, stage: 1, stageTitle: "哈希表 / 双指针 / 滑动窗口", topic: "哈希表", done: false },
  { order: 8, no: 49, slug: "group-anagrams", url: "https://leetcode.cn/problems/group-anagrams/", titleCn: "字母异位词分组", titleEn: "Group Anagrams", difficulty: "Medium", star: true, stage: 1, stageTitle: "哈希表 / 双指针 / 滑动窗口", topic: "哈希表", done: false },
  { order: 9, no: 128, slug: "longest-consecutive-sequence", url: "https://leetcode.cn/problems/longest-consecutive-sequence/", titleCn: "最长连续序列", titleEn: "Longest Consecutive Sequence", difficulty: "Medium", star: true, stage: 1, stageTitle: "哈希表 / 双指针 / 滑动窗口", topic: "哈希表", done: false },
  { order: 10, no: 392, slug: "is-subsequence", url: "https://leetcode.cn/problems/is-subsequence/", titleCn: "判断子序列", titleEn: "Is Subsequence", difficulty: "Easy", star: false, stage: 1, stageTitle: "哈希表 / 双指针 / 滑动窗口", topic: "双指针", done: false },
  { order: 11, no: 125, slug: "valid-palindrome", url: "https://leetcode.cn/problems/valid-palindrome/", titleCn: "验证回文串", titleEn: "Valid Palindrome", difficulty: "Easy", star: false, stage: 1, stageTitle: "哈希表 / 双指针 / 滑动窗口", topic: "双指针", done: false },
  { order: 12, no: 167, slug: "two-sum-ii-input-array-is-sorted", url: "https://leetcode.cn/problems/two-sum-ii-input-array-is-sorted/", titleCn: "两数之和 II - 输入有序数组", titleEn: "Two Sum II", difficulty: "Medium", star: false, stage: 1, stageTitle: "哈希表 / 双指针 / 滑动窗口", topic: "双指针", done: false },
  { order: 13, no: 11, slug: "container-with-most-water", url: "https://leetcode.cn/problems/container-with-most-water/", titleCn: "盛最多水的容器", titleEn: "Container With Most Water", difficulty: "Medium", star: true, stage: 1, stageTitle: "哈希表 / 双指针 / 滑动窗口", topic: "双指针", done: false },
  { order: 14, no: 15, slug: "3sum", url: "https://leetcode.cn/problems/3sum/", titleCn: "三数之和", titleEn: "3Sum", difficulty: "Medium", star: true, stage: 1, stageTitle: "哈希表 / 双指针 / 滑动窗口", topic: "双指针", done: false },
  { order: 15, no: 209, slug: "minimum-size-subarray-sum", url: "https://leetcode.cn/problems/minimum-size-subarray-sum/", titleCn: "长度最小的子数组", titleEn: "Minimum Size Subarray Sum", difficulty: "Medium", star: true, stage: 1, stageTitle: "哈希表 / 双指针 / 滑动窗口", topic: "滑动窗口", done: false },
  { order: 16, no: 3, slug: "longest-substring-without-repeating-characters", url: "https://leetcode.cn/problems/longest-substring-without-repeating-characters/", titleCn: "无重复字符的最长子串", titleEn: "Longest Substring Without Repeating Characters", difficulty: "Medium", star: true, stage: 1, stageTitle: "哈希表 / 双指针 / 滑动窗口", topic: "滑动窗口", done: false },
  { order: 17, no: 30, slug: "substring-with-concatenation-of-all-words", url: "https://leetcode.cn/problems/substring-with-concatenation-of-all-words/", titleCn: "串联所有单词的子串", titleEn: "Substring with Concatenation of All Words", difficulty: "Hard", star: false, stage: 1, stageTitle: "哈希表 / 双指针 / 滑动窗口", topic: "滑动窗口", done: false },
  { order: 18, no: 76, slug: "minimum-window-substring", url: "https://leetcode.cn/problems/minimum-window-substring/", titleCn: "最小覆盖子串", titleEn: "Minimum Window Substring", difficulty: "Hard", star: true, stage: 1, stageTitle: "哈希表 / 双指针 / 滑动窗口", topic: "滑动窗口", done: false },
  { order: 19, no: 141, slug: "linked-list-cycle", url: "https://leetcode.cn/problems/linked-list-cycle/", titleCn: "环形链表", titleEn: "Linked List Cycle", difficulty: "Easy", star: true, stage: 2, stageTitle: "链表 / 栈", topic: "链表", done: false },
  { order: 20, no: 21, slug: "merge-two-sorted-lists", url: "https://leetcode.cn/problems/merge-two-sorted-lists/", titleCn: "合并两个有序链表", titleEn: "Merge Two Sorted Lists", difficulty: "Easy", star: true, stage: 2, stageTitle: "链表 / 栈", topic: "链表", done: false },
  { order: 21, no: 2, slug: "add-two-numbers", url: "https://leetcode.cn/problems/add-two-numbers/", titleCn: "两数相加", titleEn: "Add Two Numbers", difficulty: "Medium", star: true, stage: 2, stageTitle: "链表 / 栈", topic: "链表", done: false },
  { order: 22, no: 19, slug: "remove-nth-node-from-end-of-list", url: "https://leetcode.cn/problems/remove-nth-node-from-end-of-list/", titleCn: "删除链表的倒数第 N 个结点", titleEn: "Remove Nth Node From End of List", difficulty: "Medium", star: true, stage: 2, stageTitle: "链表 / 栈", topic: "链表", done: false },
  { order: 23, no: 61, slug: "rotate-list", url: "https://leetcode.cn/problems/rotate-list/", titleCn: "旋转链表", titleEn: "Rotate List", difficulty: "Medium", star: false, stage: 2, stageTitle: "链表 / 栈", topic: "链表", done: false },
  { order: 24, no: 86, slug: "partition-list", url: "https://leetcode.cn/problems/partition-list/", titleCn: "分隔链表", titleEn: "Partition List", difficulty: "Medium", star: false, stage: 2, stageTitle: "链表 / 栈", topic: "链表", done: false },
  { order: 25, no: 92, slug: "reverse-linked-list-ii", url: "https://leetcode.cn/problems/reverse-linked-list-ii/", titleCn: "反转链表 II", titleEn: "Reverse Linked List II", difficulty: "Medium", star: false, stage: 2, stageTitle: "链表 / 栈", topic: "链表", done: false },
  { order: 26, no: 82, slug: "remove-duplicates-from-sorted-list-ii", url: "https://leetcode.cn/problems/remove-duplicates-from-sorted-list-ii/", titleCn: "删除排序链表中的重复元素 II", titleEn: "Remove Duplicates from Sorted List II", difficulty: "Medium", star: false, stage: 2, stageTitle: "链表 / 栈", topic: "链表", done: false },
  { order: 27, no: 138, slug: "copy-list-with-random-pointer", url: "https://leetcode.cn/problems/copy-list-with-random-pointer/", titleCn: "随机链表的复制", titleEn: "Copy List with Random Pointer", difficulty: "Medium", star: true, stage: 2, stageTitle: "链表 / 栈", topic: "链表", done: false },
  { order: 28, no: 146, slug: "lru-cache", url: "https://leetcode.cn/problems/lru-cache/", titleCn: "LRU 缓存", titleEn: "LRU Cache", difficulty: "Medium", star: true, stage: 2, stageTitle: "链表 / 栈", topic: "链表", done: false },
  { order: 29, no: 25, slug: "reverse-nodes-in-k-group", url: "https://leetcode.cn/problems/reverse-nodes-in-k-group/", titleCn: "K 个一组翻转链表", titleEn: "Reverse Nodes in k-Group", difficulty: "Hard", star: true, stage: 2, stageTitle: "链表 / 栈", topic: "链表", done: false },
  { order: 30, no: 20, slug: "valid-parentheses", url: "https://leetcode.cn/problems/valid-parentheses/", titleCn: "有效的括号", titleEn: "Valid Parentheses", difficulty: "Easy", star: true, stage: 2, stageTitle: "链表 / 栈", topic: "栈", done: false },
  { order: 31, no: 71, slug: "simplify-path", url: "https://leetcode.cn/problems/simplify-path/", titleCn: "简化路径", titleEn: "Simplify Path", difficulty: "Medium", star: false, stage: 2, stageTitle: "链表 / 栈", topic: "栈", done: false },
  { order: 32, no: 155, slug: "min-stack", url: "https://leetcode.cn/problems/min-stack/", titleCn: "最小栈", titleEn: "Min Stack", difficulty: "Medium", star: true, stage: 2, stageTitle: "链表 / 栈", topic: "栈", done: false },
  { order: 33, no: 150, slug: "evaluate-reverse-polish-notation", url: "https://leetcode.cn/problems/evaluate-reverse-polish-notation/", titleCn: "逆波兰表达式求值", titleEn: "Evaluate Reverse Polish Notation", difficulty: "Medium", star: false, stage: 2, stageTitle: "链表 / 栈", topic: "栈", done: false },
  { order: 34, no: 224, slug: "basic-calculator", url: "https://leetcode.cn/problems/basic-calculator/", titleCn: "基本计算器", titleEn: "Basic Calculator", difficulty: "Hard", star: true, stage: 2, stageTitle: "链表 / 栈", topic: "栈", done: false },
  { order: 35, no: 104, slug: "maximum-depth-of-binary-tree", url: "https://leetcode.cn/problems/maximum-depth-of-binary-tree/", titleCn: "二叉树的最大深度", titleEn: "Maximum Depth of Binary Tree", difficulty: "Easy", star: true, stage: 3, stageTitle: "二叉树 / BST", topic: "二叉树递归基础", done: false },
  { order: 36, no: 100, slug: "same-tree", url: "https://leetcode.cn/problems/same-tree/", titleCn: "相同的树", titleEn: "Same Tree", difficulty: "Easy", star: false, stage: 3, stageTitle: "二叉树 / BST", topic: "二叉树递归基础", done: false },
  { order: 37, no: 226, slug: "invert-binary-tree", url: "https://leetcode.cn/problems/invert-binary-tree/", titleCn: "翻转二叉树", titleEn: "Invert Binary Tree", difficulty: "Easy", star: true, stage: 3, stageTitle: "二叉树 / BST", topic: "二叉树递归基础", done: false },
  { order: 38, no: 101, slug: "symmetric-tree", url: "https://leetcode.cn/problems/symmetric-tree/", titleCn: "对称二叉树", titleEn: "Symmetric Tree", difficulty: "Easy", star: false, stage: 3, stageTitle: "二叉树 / BST", topic: "二叉树递归基础", done: false },
  { order: 39, no: 112, slug: "path-sum", url: "https://leetcode.cn/problems/path-sum/", titleCn: "路径总和", titleEn: "Path Sum", difficulty: "Easy", star: false, stage: 3, stageTitle: "二叉树 / BST", topic: "二叉树递归基础", done: false },
  { order: 40, no: 129, slug: "sum-root-to-leaf-numbers", url: "https://leetcode.cn/problems/sum-root-to-leaf-numbers/", titleCn: "求根节点到叶节点数字之和", titleEn: "Sum Root to Leaf Numbers", difficulty: "Medium", star: false, stage: 3, stageTitle: "二叉树 / BST", topic: "二叉树递归基础", done: false },
  { order: 41, no: 114, slug: "flatten-binary-tree-to-linked-list", url: "https://leetcode.cn/problems/flatten-binary-tree-to-linked-list/", titleCn: "二叉树展开为链表", titleEn: "Flatten Binary Tree to Linked List", difficulty: "Medium", star: false, stage: 3, stageTitle: "二叉树 / BST", topic: "二叉树递归基础", done: false },
  { order: 42, no: 105, slug: "construct-binary-tree-from-preorder-and-inorder-traversal", url: "https://leetcode.cn/problems/construct-binary-tree-from-preorder-and-inorder-traversal/", titleCn: "从前序与中序遍历序列构造二叉树", titleEn: "Construct Binary Tree from Preorder and Inorder Traversal", difficulty: "Medium", star: true, stage: 3, stageTitle: "二叉树 / BST", topic: "二叉树进阶", done: false },
  { order: 43, no: 106, slug: "construct-binary-tree-from-inorder-and-postorder-traversal", url: "https://leetcode.cn/problems/construct-binary-tree-from-inorder-and-postorder-traversal/", titleCn: "从中序与后序遍历序列构造二叉树", titleEn: "Construct Binary Tree from Inorder and Postorder Traversal", difficulty: "Medium", star: false, stage: 3, stageTitle: "二叉树 / BST", topic: "二叉树进阶", done: false },
  { order: 44, no: 117, slug: "populating-next-right-pointers-in-each-node-ii", url: "https://leetcode.cn/problems/populating-next-right-pointers-in-each-node-ii/", titleCn: "填充每个节点的下一个右侧节点指针 II", titleEn: "Populating Next Right Pointers in Each Node II", difficulty: "Medium", star: false, stage: 3, stageTitle: "二叉树 / BST", topic: "二叉树进阶", done: false },
  { order: 45, no: 222, slug: "count-complete-tree-nodes", url: "https://leetcode.cn/problems/count-complete-tree-nodes/", titleCn: "完全二叉树的节点个数", titleEn: "Count Complete Tree Nodes", difficulty: "Easy", star: false, stage: 3, stageTitle: "二叉树 / BST", topic: "二叉树进阶", done: false },
  { order: 46, no: 173, slug: "binary-search-tree-iterator", url: "https://leetcode.cn/problems/binary-search-tree-iterator/", titleCn: "二叉搜索树迭代器", titleEn: "Binary Search Tree Iterator", difficulty: "Medium", star: false, stage: 3, stageTitle: "二叉树 / BST", topic: "二叉树进阶", done: false },
  { order: 47, no: 236, slug: "lowest-common-ancestor-of-a-binary-tree", url: "https://leetcode.cn/problems/lowest-common-ancestor-of-a-binary-tree/", titleCn: "二叉树的最近公共祖先", titleEn: "Lowest Common Ancestor of a Binary Tree", difficulty: "Medium", star: true, stage: 3, stageTitle: "二叉树 / BST", topic: "二叉树进阶", done: false },
  { order: 48, no: 124, slug: "binary-tree-maximum-path-sum", url: "https://leetcode.cn/problems/binary-tree-maximum-path-sum/", titleCn: "二叉树中的最大路径和", titleEn: "Binary Tree Maximum Path Sum", difficulty: "Hard", star: true, stage: 3, stageTitle: "二叉树 / BST", topic: "二叉树进阶", done: false },
  { order: 49, no: 102, slug: "binary-tree-level-order-traversal", url: "https://leetcode.cn/problems/binary-tree-level-order-traversal/", titleCn: "二叉树的层序遍历", titleEn: "Binary Tree Level Order Traversal", difficulty: "Medium", star: true, stage: 3, stageTitle: "二叉树 / BST", topic: "层序 BFS", done: false },
  { order: 50, no: 637, slug: "average-of-levels-in-binary-tree", url: "https://leetcode.cn/problems/average-of-levels-in-binary-tree/", titleCn: "二叉树的层平均值", titleEn: "Average of Levels in Binary Tree", difficulty: "Easy", star: false, stage: 3, stageTitle: "二叉树 / BST", topic: "层序 BFS", done: false },
  { order: 51, no: 199, slug: "binary-tree-right-side-view", url: "https://leetcode.cn/problems/binary-tree-right-side-view/", titleCn: "二叉树的右视图", titleEn: "Binary Tree Right Side View", difficulty: "Medium", star: false, stage: 3, stageTitle: "二叉树 / BST", topic: "层序 BFS", done: false },
  { order: 52, no: 103, slug: "binary-tree-zigzag-level-order-traversal", url: "https://leetcode.cn/problems/binary-tree-zigzag-level-order-traversal/", titleCn: "二叉树的锯齿形层序遍历", titleEn: "Binary Tree Zigzag Level Order Traversal", difficulty: "Medium", star: false, stage: 3, stageTitle: "二叉树 / BST", topic: "层序 BFS", done: false },
  { order: 53, no: 530, slug: "minimum-absolute-difference-in-bst", url: "https://leetcode.cn/problems/minimum-absolute-difference-in-bst/", titleCn: "二叉搜索树的最小绝对差", titleEn: "Minimum Absolute Difference in BST", difficulty: "Easy", star: false, stage: 3, stageTitle: "二叉树 / BST", topic: "二叉搜索树 BST", done: false },
  { order: 54, no: 230, slug: "kth-smallest-element-in-a-bst", url: "https://leetcode.cn/problems/kth-smallest-element-in-a-bst/", titleCn: "二叉搜索树中第 K 小的元素", titleEn: "Kth Smallest Element in a BST", difficulty: "Medium", star: false, stage: 3, stageTitle: "二叉树 / BST", topic: "二叉搜索树 BST", done: false },
  { order: 55, no: 98, slug: "validate-binary-search-tree", url: "https://leetcode.cn/problems/validate-binary-search-tree/", titleCn: "验证二叉搜索树", titleEn: "Validate Binary Search Tree", difficulty: "Medium", star: true, stage: 3, stageTitle: "二叉树 / BST", topic: "二叉搜索树 BST", done: false },
  { order: 56, no: 17, slug: "letter-combinations-of-a-phone-number", url: "https://leetcode.cn/problems/letter-combinations-of-a-phone-number/", titleCn: "电话号码的字母组合", titleEn: "Letter Combinations of a Phone Number", difficulty: "Medium", star: false, stage: 4, stageTitle: "回溯 / 分治 / 二分", topic: "回溯", done: false },
  { order: 57, no: 77, slug: "combinations", url: "https://leetcode.cn/problems/combinations/", titleCn: "组合", titleEn: "Combinations", difficulty: "Medium", star: false, stage: 4, stageTitle: "回溯 / 分治 / 二分", topic: "回溯", done: false },
  { order: 58, no: 46, slug: "permutations", url: "https://leetcode.cn/problems/permutations/", titleCn: "全排列", titleEn: "Permutations", difficulty: "Medium", star: true, stage: 4, stageTitle: "回溯 / 分治 / 二分", topic: "回溯", done: false },
  { order: 59, no: 39, slug: "combination-sum", url: "https://leetcode.cn/problems/combination-sum/", titleCn: "组合总和", titleEn: "Combination Sum", difficulty: "Medium", star: false, stage: 4, stageTitle: "回溯 / 分治 / 二分", topic: "回溯", done: false },
  { order: 60, no: 22, slug: "generate-parentheses", url: "https://leetcode.cn/problems/generate-parentheses/", titleCn: "括号生成", titleEn: "Generate Parentheses", difficulty: "Medium", star: true, stage: 4, stageTitle: "回溯 / 分治 / 二分", topic: "回溯", done: false },
  { order: 61, no: 79, slug: "word-search", url: "https://leetcode.cn/problems/word-search/", titleCn: "单词搜索", titleEn: "Word Search", difficulty: "Medium", star: true, stage: 4, stageTitle: "回溯 / 分治 / 二分", topic: "回溯", done: false },
  { order: 62, no: 52, slug: "n-queens-ii", url: "https://leetcode.cn/problems/n-queens-ii/", titleCn: "N 皇后 II", titleEn: "N-Queens II", difficulty: "Hard", star: false, stage: 4, stageTitle: "回溯 / 分治 / 二分", topic: "回溯", done: false },
  { order: 63, no: 108, slug: "convert-sorted-array-to-binary-search-tree", url: "https://leetcode.cn/problems/convert-sorted-array-to-binary-search-tree/", titleCn: "将有序数组转换为二叉搜索树", titleEn: "Convert Sorted Array to BST", difficulty: "Easy", star: false, stage: 4, stageTitle: "回溯 / 分治 / 二分", topic: "分治", done: false },
  { order: 64, no: 148, slug: "sort-list", url: "https://leetcode.cn/problems/sort-list/", titleCn: "排序链表", titleEn: "Sort List", difficulty: "Medium", star: true, stage: 4, stageTitle: "回溯 / 分治 / 二分", topic: "分治", done: false },
  { order: 65, no: 427, slug: "construct-quad-tree", url: "https://leetcode.cn/problems/construct-quad-tree/", titleCn: "建立四叉树", titleEn: "Construct Quad Tree", difficulty: "Medium", star: false, stage: 4, stageTitle: "回溯 / 分治 / 二分", topic: "分治", done: false },
  { order: 66, no: 23, slug: "merge-k-sorted-lists", url: "https://leetcode.cn/problems/merge-k-sorted-lists/", titleCn: "合并 K 个升序链表", titleEn: "Merge k Sorted Lists", difficulty: "Hard", star: true, stage: 4, stageTitle: "回溯 / 分治 / 二分", topic: "分治", done: false },
  { order: 67, no: 35, slug: "search-insert-position", url: "https://leetcode.cn/problems/search-insert-position/", titleCn: "搜索插入位置", titleEn: "Search Insert Position", difficulty: "Easy", star: true, stage: 4, stageTitle: "回溯 / 分治 / 二分", topic: "二分", done: false },
  { order: 68, no: 74, slug: "search-a-2d-matrix", url: "https://leetcode.cn/problems/search-a-2d-matrix/", titleCn: "搜索二维矩阵", titleEn: "Search a 2D Matrix", difficulty: "Medium", star: false, stage: 4, stageTitle: "回溯 / 分治 / 二分", topic: "二分", done: false },
  { order: 69, no: 162, slug: "find-peak-element", url: "https://leetcode.cn/problems/find-peak-element/", titleCn: "寻找峰值", titleEn: "Find Peak Element", difficulty: "Medium", star: false, stage: 4, stageTitle: "回溯 / 分治 / 二分", topic: "二分", done: false },
  { order: 70, no: 33, slug: "search-in-rotated-sorted-array", url: "https://leetcode.cn/problems/search-in-rotated-sorted-array/", titleCn: "搜索旋转排序数组", titleEn: "Search in Rotated Sorted Array", difficulty: "Medium", star: true, stage: 4, stageTitle: "回溯 / 分治 / 二分", topic: "二分", done: false },
  { order: 71, no: 34, slug: "find-first-and-last-position-of-element-in-sorted-array", url: "https://leetcode.cn/problems/find-first-and-last-position-of-element-in-sorted-array/", titleCn: "在排序数组中查找元素的第一个和最后一个位置", titleEn: "Find First and Last Position of Element in Sorted Array", difficulty: "Medium", star: true, stage: 4, stageTitle: "回溯 / 分治 / 二分", topic: "二分", done: false },
  { order: 72, no: 153, slug: "find-minimum-in-rotated-sorted-array", url: "https://leetcode.cn/problems/find-minimum-in-rotated-sorted-array/", titleCn: "寻找旋转排序数组中的最小值", titleEn: "Find Minimum in Rotated Sorted Array", difficulty: "Medium", star: false, stage: 4, stageTitle: "回溯 / 分治 / 二分", topic: "二分", done: false },
  { order: 73, no: 4, slug: "median-of-two-sorted-arrays", url: "https://leetcode.cn/problems/median-of-two-sorted-arrays/", titleCn: "寻找两个正序数组的中位数", titleEn: "Median of Two Sorted Arrays", difficulty: "Hard", star: true, stage: 4, stageTitle: "回溯 / 分治 / 二分", topic: "二分", done: false },
  { order: 74, no: 200, slug: "number-of-islands", url: "https://leetcode.cn/problems/number-of-islands/", titleCn: "岛屿数量", titleEn: "Number of Islands", difficulty: "Medium", star: true, stage: 5, stageTitle: "图 / 堆 / Trie", topic: "图 · 通用", done: false },
  { order: 75, no: 130, slug: "surrounded-regions", url: "https://leetcode.cn/problems/surrounded-regions/", titleCn: "被围绕的区域", titleEn: "Surrounded Regions", difficulty: "Medium", star: false, stage: 5, stageTitle: "图 / 堆 / Trie", topic: "图 · 通用", done: false },
  { order: 76, no: 133, slug: "clone-graph", url: "https://leetcode.cn/problems/clone-graph/", titleCn: "克隆图", titleEn: "Clone Graph", difficulty: "Medium", star: false, stage: 5, stageTitle: "图 / 堆 / Trie", topic: "图 · 通用", done: false },
  { order: 77, no: 399, slug: "evaluate-division", url: "https://leetcode.cn/problems/evaluate-division/", titleCn: "除法求值", titleEn: "Evaluate Division", difficulty: "Medium", star: false, stage: 5, stageTitle: "图 / 堆 / Trie", topic: "图 · 通用", done: false },
  { order: 78, no: 207, slug: "course-schedule", url: "https://leetcode.cn/problems/course-schedule/", titleCn: "课程表", titleEn: "Course Schedule", difficulty: "Medium", star: true, stage: 5, stageTitle: "图 / 堆 / Trie", topic: "图 · 通用", done: false },
  { order: 79, no: 210, slug: "course-schedule-ii", url: "https://leetcode.cn/problems/course-schedule-ii/", titleCn: "课程表 II", titleEn: "Course Schedule II", difficulty: "Medium", star: false, stage: 5, stageTitle: "图 / 堆 / Trie", topic: "图 · 通用", done: false },
  { order: 80, no: 909, slug: "snakes-and-ladders", url: "https://leetcode.cn/problems/snakes-and-ladders/", titleCn: "蛇梯棋", titleEn: "Snakes and Ladders", difficulty: "Medium", star: false, stage: 5, stageTitle: "图 / 堆 / Trie", topic: "图 · BFS 最短路径", done: false },
  { order: 81, no: 433, slug: "minimum-genetic-mutation", url: "https://leetcode.cn/problems/minimum-genetic-mutation/", titleCn: "最小基因变化", titleEn: "Minimum Genetic Mutation", difficulty: "Medium", star: false, stage: 5, stageTitle: "图 / 堆 / Trie", topic: "图 · BFS 最短路径", done: false },
  { order: 82, no: 127, slug: "word-ladder", url: "https://leetcode.cn/problems/word-ladder/", titleCn: "单词接龙", titleEn: "Word Ladder", difficulty: "Hard", star: false, stage: 5, stageTitle: "图 / 堆 / Trie", topic: "图 · BFS 最短路径", done: false },
  { order: 83, no: 215, slug: "kth-largest-element-in-an-array", url: "https://leetcode.cn/problems/kth-largest-element-in-an-array/", titleCn: "数组中的第 K 个最大元素", titleEn: "Kth Largest Element in an Array", difficulty: "Medium", star: true, stage: 5, stageTitle: "图 / 堆 / Trie", topic: "堆 / 优先队列", done: false },
  { order: 84, no: 373, slug: "find-k-pairs-with-smallest-sums", url: "https://leetcode.cn/problems/find-k-pairs-with-smallest-sums/", titleCn: "查找和最小的 K 对数字", titleEn: "Find K Pairs with Smallest Sums", difficulty: "Medium", star: false, stage: 5, stageTitle: "图 / 堆 / Trie", topic: "堆 / 优先队列", done: false },
  { order: 85, no: 295, slug: "find-median-from-data-stream", url: "https://leetcode.cn/problems/find-median-from-data-stream/", titleCn: "数据流的中位数", titleEn: "Find Median from Data Stream", difficulty: "Hard", star: true, stage: 5, stageTitle: "图 / 堆 / Trie", topic: "堆 / 优先队列", done: false },
  { order: 86, no: 502, slug: "ipo", url: "https://leetcode.cn/problems/ipo/", titleCn: "IPO", titleEn: "IPO", difficulty: "Hard", star: false, stage: 5, stageTitle: "图 / 堆 / Trie", topic: "堆 / 优先队列", done: false },
  { order: 87, no: 208, slug: "implement-trie-prefix-tree", url: "https://leetcode.cn/problems/implement-trie-prefix-tree/", titleCn: "实现 Trie (前缀树)", titleEn: "Implement Trie (Prefix Tree)", difficulty: "Medium", star: true, stage: 5, stageTitle: "图 / 堆 / Trie", topic: "Trie 前缀树", done: false },
  { order: 88, no: 211, slug: "design-add-and-search-words-data-structure", url: "https://leetcode.cn/problems/design-add-and-search-words-data-structure/", titleCn: "添加与搜索单词 - 数据结构设计", titleEn: "Design Add and Search Words Data Structure", difficulty: "Medium", star: false, stage: 5, stageTitle: "图 / 堆 / Trie", topic: "Trie 前缀树", done: false },
  { order: 89, no: 212, slug: "word-search-ii", url: "https://leetcode.cn/problems/word-search-ii/", titleCn: "单词搜索 II", titleEn: "Word Search II", difficulty: "Hard", star: false, stage: 5, stageTitle: "图 / 堆 / Trie", topic: "Trie 前缀树", done: false },
  { order: 90, no: 88, slug: "merge-sorted-array", url: "https://leetcode.cn/problems/merge-sorted-array/", titleCn: "合并两个有序数组", titleEn: "Merge Sorted Array", difficulty: "Easy", star: false, stage: 6, stageTitle: "数组 / 字符串 / 矩阵", topic: "数组 · 基础", done: false },
  { order: 91, no: 27, slug: "remove-element", url: "https://leetcode.cn/problems/remove-element/", titleCn: "移除元素", titleEn: "Remove Element", difficulty: "Easy", star: false, stage: 6, stageTitle: "数组 / 字符串 / 矩阵", topic: "数组 · 基础", done: false },
  { order: 92, no: 26, slug: "remove-duplicates-from-sorted-array", url: "https://leetcode.cn/problems/remove-duplicates-from-sorted-array/", titleCn: "删除有序数组中的重复项", titleEn: "Remove Duplicates from Sorted Array", difficulty: "Easy", star: false, stage: 6, stageTitle: "数组 / 字符串 / 矩阵", topic: "数组 · 基础", done: false },
  { order: 93, no: 80, slug: "remove-duplicates-from-sorted-array-ii", url: "https://leetcode.cn/problems/remove-duplicates-from-sorted-array-ii/", titleCn: "删除有序数组中的重复项 II", titleEn: "Remove Duplicates from Sorted Array II", difficulty: "Medium", star: false, stage: 6, stageTitle: "数组 / 字符串 / 矩阵", topic: "数组 · 基础", done: false },
  { order: 94, no: 169, slug: "majority-element", url: "https://leetcode.cn/problems/majority-element/", titleCn: "多数元素", titleEn: "Majority Element", difficulty: "Easy", star: true, stage: 6, stageTitle: "数组 / 字符串 / 矩阵", topic: "数组 · 基础", done: false },
  { order: 95, no: 189, slug: "rotate-array", url: "https://leetcode.cn/problems/rotate-array/", titleCn: "轮转数组", titleEn: "Rotate Array", difficulty: "Medium", star: false, stage: 6, stageTitle: "数组 / 字符串 / 矩阵", topic: "数组 · 基础", done: false },
  { order: 96, no: 121, slug: "best-time-to-buy-and-sell-stock", url: "https://leetcode.cn/problems/best-time-to-buy-and-sell-stock/", titleCn: "买卖股票的最佳时机", titleEn: "Best Time to Buy and Sell Stock", difficulty: "Easy", star: true, stage: 6, stageTitle: "数组 / 字符串 / 矩阵", topic: "数组 · 基础", done: false },
  { order: 97, no: 122, slug: "best-time-to-buy-and-sell-stock-ii", url: "https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-ii/", titleCn: "买卖股票的最佳时机 II", titleEn: "Best Time to Buy and Sell Stock II", difficulty: "Medium", star: false, stage: 6, stageTitle: "数组 / 字符串 / 矩阵", topic: "数组 · 基础", done: false },
  { order: 98, no: 55, slug: "jump-game", url: "https://leetcode.cn/problems/jump-game/", titleCn: "跳跃游戏", titleEn: "Jump Game", difficulty: "Medium", star: true, stage: 6, stageTitle: "数组 / 字符串 / 矩阵", topic: "数组 · 基础", done: false },
  { order: 99, no: 45, slug: "jump-game-ii", url: "https://leetcode.cn/problems/jump-game-ii/", titleCn: "跳跃游戏 II", titleEn: "Jump Game II", difficulty: "Medium", star: false, stage: 6, stageTitle: "数组 / 字符串 / 矩阵", topic: "数组 · 基础", done: false },
  { order: 100, no: 274, slug: "h-index", url: "https://leetcode.cn/problems/h-index/", titleCn: "H 指数", titleEn: "H-Index", difficulty: "Medium", star: false, stage: 6, stageTitle: "数组 / 字符串 / 矩阵", topic: "数组 · 基础", done: false },
  { order: 101, no: 380, slug: "insert-delete-getrandom-o1", url: "https://leetcode.cn/problems/insert-delete-getrandom-o1/", titleCn: "O(1) 时间插入、删除和获取随机元素", titleEn: "Insert Delete GetRandom O(1)", difficulty: "Medium", star: false, stage: 6, stageTitle: "数组 / 字符串 / 矩阵", topic: "数组 · 基础", done: false },
  { order: 102, no: 238, slug: "product-of-array-except-self", url: "https://leetcode.cn/problems/product-of-array-except-self/", titleCn: "除自身以外数组的乘积", titleEn: "Product of Array Except Self", difficulty: "Medium", star: true, stage: 6, stageTitle: "数组 / 字符串 / 矩阵", topic: "数组 · 基础", done: false },
  { order: 103, no: 134, slug: "gas-station", url: "https://leetcode.cn/problems/gas-station/", titleCn: "加油站", titleEn: "Gas Station", difficulty: "Medium", star: false, stage: 6, stageTitle: "数组 / 字符串 / 矩阵", topic: "数组 · 基础", done: false },
  { order: 104, no: 135, slug: "candy", url: "https://leetcode.cn/problems/candy/", titleCn: "分发糖果", titleEn: "Candy", difficulty: "Hard", star: false, stage: 6, stageTitle: "数组 / 字符串 / 矩阵", topic: "数组 · 进阶 Hard", done: false },
  { order: 105, no: 42, slug: "trapping-rain-water", url: "https://leetcode.cn/problems/trapping-rain-water/", titleCn: "接雨水", titleEn: "Trapping Rain Water", difficulty: "Hard", star: true, stage: 6, stageTitle: "数组 / 字符串 / 矩阵", topic: "数组 · 进阶 Hard", done: false },
  { order: 106, no: 13, slug: "roman-to-integer", url: "https://leetcode.cn/problems/roman-to-integer/", titleCn: "罗马数字转整数", titleEn: "Roman to Integer", difficulty: "Easy", star: false, stage: 6, stageTitle: "数组 / 字符串 / 矩阵", topic: "字符串", done: false },
  { order: 107, no: 12, slug: "integer-to-roman", url: "https://leetcode.cn/problems/integer-to-roman/", titleCn: "整数转罗马数字", titleEn: "Integer to Roman", difficulty: "Medium", star: false, stage: 6, stageTitle: "数组 / 字符串 / 矩阵", topic: "字符串", done: false },
  { order: 108, no: 58, slug: "length-of-last-word", url: "https://leetcode.cn/problems/length-of-last-word/", titleCn: "最后一个单词的长度", titleEn: "Length of Last Word", difficulty: "Easy", star: false, stage: 6, stageTitle: "数组 / 字符串 / 矩阵", topic: "字符串", done: false },
  { order: 109, no: 14, slug: "longest-common-prefix", url: "https://leetcode.cn/problems/longest-common-prefix/", titleCn: "最长公共前缀", titleEn: "Longest Common Prefix", difficulty: "Easy", star: false, stage: 6, stageTitle: "数组 / 字符串 / 矩阵", topic: "字符串", done: false },
  { order: 110, no: 151, slug: "reverse-words-in-a-string", url: "https://leetcode.cn/problems/reverse-words-in-a-string/", titleCn: "反转字符串中的单词", titleEn: "Reverse Words in a String", difficulty: "Medium", star: false, stage: 6, stageTitle: "数组 / 字符串 / 矩阵", topic: "字符串", done: false },
  { order: 111, no: 6, slug: "zigzag-conversion", url: "https://leetcode.cn/problems/zigzag-conversion/", titleCn: "Z 字形变换", titleEn: "Zigzag Conversion", difficulty: "Medium", star: false, stage: 6, stageTitle: "数组 / 字符串 / 矩阵", topic: "字符串", done: false },
  { order: 112, no: 28, slug: "find-the-index-of-the-first-occurrence-in-a-string", url: "https://leetcode.cn/problems/find-the-index-of-the-first-occurrence-in-a-string/", titleCn: "找出字符串中第一个匹配项的下标", titleEn: "Find the Index of the First Occurrence in a String", difficulty: "Easy", star: false, stage: 6, stageTitle: "数组 / 字符串 / 矩阵", topic: "字符串", done: false },
  { order: 113, no: 68, slug: "text-justification", url: "https://leetcode.cn/problems/text-justification/", titleCn: "文本左右对齐", titleEn: "Text Justification", difficulty: "Hard", star: false, stage: 6, stageTitle: "数组 / 字符串 / 矩阵", topic: "字符串", done: false },
  { order: 114, no: 36, slug: "valid-sudoku", url: "https://leetcode.cn/problems/valid-sudoku/", titleCn: "有效的数独", titleEn: "Valid Sudoku", difficulty: "Medium", star: false, stage: 6, stageTitle: "数组 / 字符串 / 矩阵", topic: "矩阵", done: false },
  { order: 115, no: 54, slug: "spiral-matrix", url: "https://leetcode.cn/problems/spiral-matrix/", titleCn: "螺旋矩阵", titleEn: "Spiral Matrix", difficulty: "Medium", star: true, stage: 6, stageTitle: "数组 / 字符串 / 矩阵", topic: "矩阵", done: false },
  { order: 116, no: 48, slug: "rotate-image", url: "https://leetcode.cn/problems/rotate-image/", titleCn: "旋转图像", titleEn: "Rotate Image", difficulty: "Medium", star: true, stage: 6, stageTitle: "数组 / 字符串 / 矩阵", topic: "矩阵", done: false },
  { order: 117, no: 73, slug: "set-matrix-zeroes", url: "https://leetcode.cn/problems/set-matrix-zeroes/", titleCn: "矩阵置零", titleEn: "Set Matrix Zeroes", difficulty: "Medium", star: false, stage: 6, stageTitle: "数组 / 字符串 / 矩阵", topic: "矩阵", done: false },
  { order: 118, no: 289, slug: "game-of-life", url: "https://leetcode.cn/problems/game-of-life/", titleCn: "生命游戏", titleEn: "Game of Life", difficulty: "Medium", star: false, stage: 6, stageTitle: "数组 / 字符串 / 矩阵", topic: "矩阵", done: false },
  { order: 119, no: 70, slug: "climbing-stairs", url: "https://leetcode.cn/problems/climbing-stairs/", titleCn: "爬楼梯", titleEn: "Climbing Stairs", difficulty: "Easy", star: true, stage: 7, stageTitle: "动态规划", topic: "一维 DP", done: false },
  { order: 120, no: 198, slug: "house-robber", url: "https://leetcode.cn/problems/house-robber/", titleCn: "打家劫舍", titleEn: "House Robber", difficulty: "Medium", star: true, stage: 7, stageTitle: "动态规划", topic: "一维 DP", done: false },
  { order: 121, no: 139, slug: "word-break", url: "https://leetcode.cn/problems/word-break/", titleCn: "单词拆分", titleEn: "Word Break", difficulty: "Medium", star: false, stage: 7, stageTitle: "动态规划", topic: "一维 DP", done: false },
  { order: 122, no: 322, slug: "coin-change", url: "https://leetcode.cn/problems/coin-change/", titleCn: "零钱兑换", titleEn: "Coin Change", difficulty: "Medium", star: true, stage: 7, stageTitle: "动态规划", topic: "一维 DP", done: false },
  { order: 123, no: 300, slug: "longest-increasing-subsequence", url: "https://leetcode.cn/problems/longest-increasing-subsequence/", titleCn: "最长递增子序列", titleEn: "Longest Increasing Subsequence", difficulty: "Medium", star: true, stage: 7, stageTitle: "动态规划", topic: "一维 DP", done: false },
  { order: 124, no: 120, slug: "triangle", url: "https://leetcode.cn/problems/triangle/", titleCn: "三角形最小路径和", titleEn: "Triangle", difficulty: "Medium", star: false, stage: 7, stageTitle: "动态规划", topic: "多维 / 字符串 DP", done: false },
  { order: 125, no: 64, slug: "minimum-path-sum", url: "https://leetcode.cn/problems/minimum-path-sum/", titleCn: "最小路径和", titleEn: "Minimum Path Sum", difficulty: "Medium", star: true, stage: 7, stageTitle: "动态规划", topic: "多维 / 字符串 DP", done: false },
  { order: 126, no: 63, slug: "unique-paths-ii", url: "https://leetcode.cn/problems/unique-paths-ii/", titleCn: "不同路径 II", titleEn: "Unique Paths II", difficulty: "Medium", star: false, stage: 7, stageTitle: "动态规划", topic: "多维 / 字符串 DP", done: false },
  { order: 127, no: 221, slug: "maximal-square", url: "https://leetcode.cn/problems/maximal-square/", titleCn: "最大正方形", titleEn: "Maximal Square", difficulty: "Medium", star: false, stage: 7, stageTitle: "动态规划", topic: "多维 / 字符串 DP", done: false },
  { order: 128, no: 5, slug: "longest-palindromic-substring", url: "https://leetcode.cn/problems/longest-palindromic-substring/", titleCn: "最长回文子串", titleEn: "Longest Palindromic Substring", difficulty: "Medium", star: true, stage: 7, stageTitle: "动态规划", topic: "多维 / 字符串 DP", done: false },
  { order: 129, no: 97, slug: "interleaving-string", url: "https://leetcode.cn/problems/interleaving-string/", titleCn: "交错字符串", titleEn: "Interleaving String", difficulty: "Medium", star: false, stage: 7, stageTitle: "动态规划", topic: "多维 / 字符串 DP", done: false },
  { order: 130, no: 72, slug: "edit-distance", url: "https://leetcode.cn/problems/edit-distance/", titleCn: "编辑距离", titleEn: "Edit Distance", difficulty: "Hard", star: true, stage: 7, stageTitle: "动态规划", topic: "多维 / 字符串 DP", done: false },
  { order: 131, no: 123, slug: "best-time-to-buy-and-sell-stock-iii", url: "https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-iii/", titleCn: "买卖股票的最佳时机 III", titleEn: "Best Time to Buy and Sell Stock III", difficulty: "Hard", star: false, stage: 7, stageTitle: "动态规划", topic: "多维 / 字符串 DP", done: false },
  { order: 132, no: 188, slug: "best-time-to-buy-and-sell-stock-iv", url: "https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-iv/", titleCn: "买卖股票的最佳时机 IV", titleEn: "Best Time to Buy and Sell Stock IV", difficulty: "Hard", star: false, stage: 7, stageTitle: "动态规划", topic: "多维 / 字符串 DP", done: false },
  { order: 133, no: 228, slug: "summary-ranges", url: "https://leetcode.cn/problems/summary-ranges/", titleCn: "汇总区间", titleEn: "Summary Ranges", difficulty: "Easy", star: false, stage: 8, stageTitle: "区间 / 位运算 / 数学", topic: "区间", done: false },
  { order: 134, no: 56, slug: "merge-intervals", url: "https://leetcode.cn/problems/merge-intervals/", titleCn: "合并区间", titleEn: "Merge Intervals", difficulty: "Medium", star: true, stage: 8, stageTitle: "区间 / 位运算 / 数学", topic: "区间", done: false },
  { order: 135, no: 57, slug: "insert-interval", url: "https://leetcode.cn/problems/insert-interval/", titleCn: "插入区间", titleEn: "Insert Interval", difficulty: "Medium", star: false, stage: 8, stageTitle: "区间 / 位运算 / 数学", topic: "区间", done: false },
  { order: 136, no: 452, slug: "minimum-number-of-arrows-to-burst-balloons", url: "https://leetcode.cn/problems/minimum-number-of-arrows-to-burst-balloons/", titleCn: "用最少数量的箭引爆气球", titleEn: "Minimum Number of Arrows to Burst Balloons", difficulty: "Medium", star: false, stage: 8, stageTitle: "区间 / 位运算 / 数学", topic: "区间", done: false },
  { order: 137, no: 67, slug: "add-binary", url: "https://leetcode.cn/problems/add-binary/", titleCn: "二进制求和", titleEn: "Add Binary", difficulty: "Easy", star: false, stage: 8, stageTitle: "区间 / 位运算 / 数学", topic: "位运算", done: false },
  { order: 138, no: 190, slug: "reverse-bits", url: "https://leetcode.cn/problems/reverse-bits/", titleCn: "颠倒二进制位", titleEn: "Reverse Bits", difficulty: "Easy", star: false, stage: 8, stageTitle: "区间 / 位运算 / 数学", topic: "位运算", done: false },
  { order: 139, no: 191, slug: "number-of-1-bits", url: "https://leetcode.cn/problems/number-of-1-bits/", titleCn: "位1的个数", titleEn: "Number of 1 Bits", difficulty: "Easy", star: false, stage: 8, stageTitle: "区间 / 位运算 / 数学", topic: "位运算", done: false },
  { order: 140, no: 136, slug: "single-number", url: "https://leetcode.cn/problems/single-number/", titleCn: "只出现一次的数字", titleEn: "Single Number", difficulty: "Easy", star: true, stage: 8, stageTitle: "区间 / 位运算 / 数学", topic: "位运算", done: false },
  { order: 141, no: 137, slug: "single-number-ii", url: "https://leetcode.cn/problems/single-number-ii/", titleCn: "只出现一次的数字 II", titleEn: "Single Number II", difficulty: "Medium", star: false, stage: 8, stageTitle: "区间 / 位运算 / 数学", topic: "位运算", done: false },
  { order: 142, no: 201, slug: "bitwise-and-of-numbers-range", url: "https://leetcode.cn/problems/bitwise-and-of-numbers-range/", titleCn: "数字范围按位与", titleEn: "Bitwise AND of Numbers Range", difficulty: "Medium", star: false, stage: 8, stageTitle: "区间 / 位运算 / 数学", topic: "位运算", done: false },
  { order: 143, no: 9, slug: "palindrome-number", url: "https://leetcode.cn/problems/palindrome-number/", titleCn: "回文数", titleEn: "Palindrome Number", difficulty: "Easy", star: false, stage: 8, stageTitle: "区间 / 位运算 / 数学", topic: "数学", done: false },
  { order: 144, no: 66, slug: "plus-one", url: "https://leetcode.cn/problems/plus-one/", titleCn: "加一", titleEn: "Plus One", difficulty: "Easy", star: false, stage: 8, stageTitle: "区间 / 位运算 / 数学", topic: "数学", done: false },
  { order: 145, no: 69, slug: "sqrtx", url: "https://leetcode.cn/problems/sqrtx/", titleCn: "x 的平方根", titleEn: "Sqrt(x)", difficulty: "Easy", star: false, stage: 8, stageTitle: "区间 / 位运算 / 数学", topic: "数学", done: false },
  { order: 146, no: 172, slug: "factorial-trailing-zeroes", url: "https://leetcode.cn/problems/factorial-trailing-zeroes/", titleCn: "阶乘后的零", titleEn: "Factorial Trailing Zeroes", difficulty: "Medium", star: false, stage: 8, stageTitle: "区间 / 位运算 / 数学", topic: "数学", done: false },
  { order: 147, no: 50, slug: "powx-n", url: "https://leetcode.cn/problems/powx-n/", titleCn: "Pow(x, n)", titleEn: "Pow(x, n)", difficulty: "Medium", star: false, stage: 8, stageTitle: "区间 / 位运算 / 数学", topic: "数学", done: false },
  { order: 148, no: 149, slug: "max-points-on-a-line", url: "https://leetcode.cn/problems/max-points-on-a-line/", titleCn: "直线上最多的点数", titleEn: "Max Points on a Line", difficulty: "Hard", star: false, stage: 8, stageTitle: "区间 / 位运算 / 数学", topic: "数学", done: false },
  { order: 149, no: 53, slug: "maximum-subarray", url: "https://leetcode.cn/problems/maximum-subarray/", titleCn: "最大子数组和", titleEn: "Maximum Subarray", difficulty: "Medium", star: true, stage: 8, stageTitle: "区间 / 位运算 / 数学", topic: "Kadane 贪心", done: false },
  { order: 150, no: 918, slug: "maximum-sum-circular-subarray", url: "https://leetcode.cn/problems/maximum-sum-circular-subarray/", titleCn: "环形子数组的最大和", titleEn: "Maximum Sum Circular Subarray", difficulty: "Medium", star: false, stage: 8, stageTitle: "区间 / 位运算 / 数学", topic: "Kadane 贪心", done: false },
]

  }

  /* ---------- utils/date.js ---------- */
  defs['date'] = function (module, exports, require) {
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

  }

  /* ---------- utils/bank.js ---------- */
  defs['bank'] = function (module, exports, require) {
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

  }

  /* ---------- utils/store.js ---------- */
  defs['store'] = function (module, exports, require) {
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

  }

  /* ---------- 极简模块运行时 ---------- */
  function resolveId(p) {
    // 只需要按文件名匹配：./bank.js -> bank，../data/questions.js -> questions
    return String(p).split('/').pop().replace(/\.js$/, '')
  }

  function load(id) {
    id = resolveId(id)
    if (cache[id]) return cache[id].exports
    if (!defs[id]) throw new Error("module not found: " + id)
    var m = { exports: {} }
    cache[id] = m
    defs[id](m, m.exports, load)
    return m.exports
  }

  global.LC150 = {
    date: load('date'),
    bank: load('bank'),
    store: load('store')
  }

})(typeof window !== "undefined" ? window : this);
