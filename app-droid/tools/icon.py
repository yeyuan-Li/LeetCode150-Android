#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
icon.py —— 生成应用图标（不依赖 PIL，手写 PNG 编码）

图形：深色圆角底 + 蓝色进度环（3/4 圈）+ 白色对勾
寓意：刷题进度。输出 5 档 mipmap 尺寸。
"""
import math
import os
import struct
import zlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SS = 4          # 超采样倍数，做抗锯齿
BASE = 192      # 基准尺寸

BG = (18, 22, 28)
RING_A = (76, 141, 255)
RING_B = (122, 176, 255)
TICK = (255, 255, 255)


def seg_dist(px, py, ax, ay, bx, by):
    """点到线段的距离"""
    vx, vy = bx - ax, by - ay
    wx, wy = px - ax, py - ay
    L = vx * vx + vy * vy
    t = 0.0 if L == 0 else max(0.0, min(1.0, (wx * vx + wy * vy) / L))
    dx, dy = px - (ax + t * vx), py - (ay + t * vy)
    return math.hypot(dx, dy)


def in_round_rect(u, v, pad, radius):
    """u,v ∈ [0,1]，判断是否在圆角矩形内"""
    x0, y0 = pad, pad
    x1, y1 = 1 - pad, 1 - pad
    if u < x0 or u > x1 or v < y0 or v > y1:
        return False
    # 四角圆判断
    cx = min(max(u, x0 + radius), x1 - radius)
    cy = min(max(v, y0 + radius), y1 - radius)
    if (u < x0 + radius or u > x1 - radius) and (v < y0 + radius or v > y1 - radius):
        return math.hypot(u - cx, v - cy) <= radius
    return True


def shape_at(u, v):
    """只画前景（进度环 + 对勾），不含底色；范围外返回 None"""
    cx, cy = 0.5, 0.5
    d = math.hypot(u - cx, v - cy)

    # 2) 进度环：内 0.255 ~ 外 0.335，角度从顶部顺时针 270°
    if 0.255 <= d <= 0.335:
        theta = math.atan2(v - cy, u - cx)      # [-pi, pi]
        if -math.pi / 2 <= theta <= math.pi:
            t = (theta + math.pi / 2) / (1.5 * math.pi)   # 0..1
            return (
                int(RING_A[0] + (RING_B[0] - RING_A[0]) * t),
                int(RING_A[1] + (RING_B[1] - RING_A[1]) * t),
                int(RING_A[2] + (RING_B[2] - RING_A[2]) * t),
            )

    # 3) 对勾
    w = 0.042
    d1 = seg_dist(u, v, 0.345, 0.505, 0.45, 0.615)
    d2 = seg_dist(u, v, 0.45, 0.615, 0.665, 0.375)
    if min(d1, d2) <= w:
        return TICK

    return None


def color_at(u, v):
    """完整图标：圆角底 + 前景"""
    if not in_round_rect(u, v, 0.035, 0.23):
        return None
    return shape_at(u, v) or BG


def render(size, sampler=None):
    """以 BASE*SS 精度渲染，再按区块平均到目标尺寸"""
    hi = BASE * SS
    # 先在高精度上算颜色
    grid = [[None] * hi for _ in range(hi)]
    for yy in range(hi):
        v = (yy + 0.5) / hi
        for xx in range(hi):
            u = (xx + 0.5) / hi
            grid[yy][xx] = (sampler or color_at)(u, v)

    # 缩到目标尺寸（box filter）
    step = hi / float(size)
    out = bytearray()
    for y in range(size):
        row = bytearray()
        for x in range(size):
            r = g = b = a = 0
            n = 0
            y0, y1 = int(y * step), int((y + 1) * step)
            x0, x1 = int(x * step), int((x + 1) * step)
            for yy in range(y0, y1):
                for xx in range(x0, x1):
                    c = grid[yy][xx]
                    n += 1
                    if c is not None:
                        r += c[0]; g += c[1]; b += c[2]; a += 255
            if n == 0:
                row += bytes((0, 0, 0, 0))
            else:
                row += bytes((r // n, g // n, b // n, a // n))
        out += row
    return bytes(out)


def png(w, h, rgba):
    def chunk(tag, data):
        return (struct.pack('>I', len(data)) + tag + data +
                struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff))

    sig = b'\x89PNG\r\n\x1a\n'
    ihdr = struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0)

    raw = bytearray()
    stride = w * 4
    for y in range(h):
        raw.append(0)
        raw.extend(rgba[y * stride:(y + 1) * stride])

    idat = zlib.compress(bytes(raw), 9)
    return sig + chunk(b'IHDR', ihdr) + chunk(b'IDAT', idat) + chunk(b'IEND', b'')


def main():
    targets = [
        ('mipmap-mdpi', 48),
        ('mipmap-hdpi', 72),
        ('mipmap-xhdpi', 96),
        ('mipmap-xxhdpi', 144),
        ('mipmap-xxxhdpi', 192),
    ]

    for folder, size in targets:
        d = os.path.join(ROOT, 'res', folder)
        os.makedirs(d, exist_ok=True)
        data = render(size)
        path = os.path.join(d, 'ic_launcher.png')
        with open(path, 'wb') as f:
            f.write(png(size, size, data))
        print('  %-16s %3d px  %5.1f KB' % (folder, size, os.path.getsize(path) / 1024.0))

    # Android 8+ 自适应图标前景：108dp 画布，内容压在中间 66.7% 安全区内
    fg_size = 432
    def fg_sampler(u, v):
        u2 = (u - 0.1667) / 0.6666
        v2 = (v - 0.1667) / 0.6666
        if u2 < 0 or u2 > 1 or v2 < 0 or v2 > 1:
            return None
        return shape_at(u2, v2)

    d = os.path.join(ROOT, 'res', 'mipmap-xxxhdpi')
    fg_path = os.path.join(d, 'ic_launcher_fg.png')
    with open(fg_path, 'wb') as f:
        f.write(png(fg_size, fg_size, render(fg_size, fg_sampler)))
    print('  %-16s %3d px  %5.1f KB' % ('前景(adaptive)', fg_size, os.path.getsize(fg_path) / 1024.0))

    print('图标生成完成')


if __name__ == '__main__':
    main()
