#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
pack.py —— 把 classes.dex 塞进 aapt2 生成的 base.apk

不使用 Gradle 的原因：本项目只有 1 个 Activity、无第三方依赖，
用 aapt2 + javac + d8 + apksigner 手工串起来，构建产物更小、过程更透明，
也避免为了一个 WebView 壳下载整套 Gradle/AGP。
"""
import os
import shutil
import sys
import zipfile


def main():
    if len(sys.argv) < 4:
        print('用法: pack.py <base.apk> <classes.dex> <out.apk>')
        return 1

    base, dex, out = sys.argv[1], sys.argv[2], sys.argv[3]

    if not os.path.exists(base):
        print('找不到 base.apk: ' + base)
        return 1
    if not os.path.exists(dex):
        print('找不到 classes.dex: ' + dex)
        return 1

    shutil.copyfile(base, out)

    with zipfile.ZipFile(out, 'a', zipfile.ZIP_DEFLATED) as z:
        # 已存在同名条目时先移除，保证可重复构建
        if 'classes.dex' in z.namelist():
            z.remove('classes.dex')
        z.write(dex, 'classes.dex')

    print('已打包 classes.dex -> %s (%.1f KB)' % (os.path.basename(out), os.path.getsize(out) / 1024.0))
    return 0


if __name__ == '__main__':
    sys.exit(main())
