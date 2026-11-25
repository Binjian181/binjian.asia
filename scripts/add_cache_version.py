#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""统一全站静态资源的缓存版本号，并注入首屏主题引导脚本。

CSS/JS 在线上带一年缓存，改了文件而不换版本号，老访客看不到更新。
覆盖对象：
  - 根目录页面：index.html / 四个列表页
  - daily/*.html、article/*.html（已生成的详情页）
  - templates/ 下的模板与 process_original_articles.py 的 ARTICLE_TEMPLATE
    （改这些，未来生成的页面自动带上版本号与引导脚本）

同时把 /css/common.css 与 /js/common.js 统一成当前版本，并在样式表前
插入 theme-boot 内联脚本：首屏渲染前应用已保存的明暗与纸色，避免闪烁。

用法：
  python scripts/add_cache_version.py           # 写入
  python scripts/add_cache_version.py --check   # 只检查，不写
"""
import re
import sys
from pathlib import Path

SITE = Path(__file__).resolve().parent.parent
VER = '20261125'
WRITE = '--check' not in sys.argv

BOOT = (
    '<script>/* theme-boot */try{var d=document.documentElement,'
    "t=localStorage.getItem('theme'),p=localStorage.getItem('palette');"
    "if(t==='light'||t==='dark')d.setAttribute('data-theme',t);"
    "if(p&&['xuanzhi','qingjian','songyan','piaoxiang','sujian'].indexOf(p)>-1)"
    "d.setAttribute('data-palette',p);}catch(e){}</script>"
)

CSS_REF = re.compile(r'/css/common\.css(?:\?v=[0-9a-z]+)?')
JS_REF = re.compile(r'/js/common\.js(?:\?v=[0-9a-z]+)?')
CSS_LINE = re.compile(r'^([ \t]*)(<link rel="stylesheet" href="/css/common\.css[^"]*">)[ \t]*$',
                      re.M)


def targets():
    paths = [SITE / 'index.html',
             SITE / 'tech-news.html', SITE / 'people-news.html',
             SITE / 'articles.html', SITE / 'daily.html']
    paths += sorted((SITE / 'daily').glob('*.html'))
    paths += sorted((SITE / 'article').glob('*.html'))
    paths += sorted((SITE / 'templates').glob('*.html'))
    paths.append(SITE / 'scripts' / 'process_original_articles.py')
    return [p for p in paths if p.exists()]


def refresh(text):
    text = CSS_REF.sub('/css/common.css?v=' + VER, text)
    text = JS_REF.sub('/js/common.js?v=' + VER, text)
    if 'theme-boot' not in text:
        text = CSS_LINE.sub(lambda m: m.group(1) + BOOT + '\n' + m.group(1) + m.group(2), text, count=1)
    return text


def main():
    changed, same = [], []
    for p in targets():
        old = p.read_text(encoding='utf-8')
        new = refresh(old)
        (changed if new != old else same).append(p)

    print('目标文件 %d 个；需更新 %d 个；已是最新 %d 个'
          % (len(changed) + len(same), len(changed), len(same)))
    for p in changed[:8]:
        print('  ↻', p.relative_to(SITE))
    if len(changed) > 8:
        print('  … 另有 %d 个' % (len(changed) - 8))

    if not WRITE:
        print('（--check 模式，未写入）')
        return
    for p in changed:
        p.write_text(refresh(p.read_text(encoding='utf-8')), encoding='utf-8', newline='')
    print('✅ 已更新 %d 个文件（v%s）' % (len(changed), VER))


if __name__ == '__main__':
    main()