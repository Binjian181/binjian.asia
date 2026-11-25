#!/usr/bin/env python3
"""抓取 HelloGitHub 月刊与科技爱好者周刊，以「摘要 + 外链」并入科技资讯页。

数据按 page_type=weekly 单独沉淀（有独立保留上限），页面与 tech 合并渲染，
避免被科技资讯的 1500 条窗口挤出。
"""
import datetime
import os
import re
import shutil
import subprocess
import sys
import tempfile

import requests

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import store

BACKFILL = 12
SUMMARY_MAX_LENGTH = 150
SCORE = 65
UA = {'User-Agent': 'binjian-site-fetcher'}

SOURCES = [
    {
        'name': 'HelloGitHub',
        'repo': '521xueweihan/HelloGitHub',
        'branch': 'master',
        'readme_re': r'/content/HelloGitHub(\d+)\.md',
        'path_fmt': 'content/HelloGitHub{n}.md',
        'title_fmt': 'HelloGitHub 第 {n} 期',
        'date_mode': 'monthly28',
    },
    {
        'name': '科技爱好者周刊',
        'repo': 'ruanyf/weekly',
        'branch': 'master',
        'readme_re': r'\(docs/issue-(\d+)\.md\)',
        'path_fmt': 'docs/issue-{n}.md',
        'title_fmt': '科技爱好者周刊 第 {n} 期',
        'date_mode': 'git',
    },
]


def _clean_markdown(text):
    text = re.sub(r'!\[[^\]]*\]\([^)]*\)', '', text)
    text = re.sub(r'\[([^\]]*)\]\([^)]*\)', r'\1', text)
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'(?m)^[>\s]+', '', text)
    text = re.sub(r'[*_`#]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def _truncate(text):
    if len(text) <= SUMMARY_MAX_LENGTH:
        return text
    return text[:SUMMARY_MAX_LENGTH] + '...'


def _hg_summary(md):
    match = re.search(r'(?m)^## 内容\s*$(.*)', md, re.S)
    body = match.group(1) if match else md
    for line in body.splitlines():
        if re.match(r'^\d+、', line):
            return _truncate(_clean_markdown(re.sub(r'^\d+、\s*', '', line)))
    return _truncate(_clean_markdown(body))


def _weekly_summary(md):
    skip_sections = {'封面图', '目录', '往期回顾', '订阅', '关于'}
    in_section = False
    for line in md.splitlines():
        if line.startswith('## '):
            in_section = line[3:].strip() not in skip_sections
            continue
        if not in_section or not line.strip():
            continue
        if line.startswith(('#', '>', '!', '<', '|', '- ', '* ')):
            continue
        cleaned = _clean_markdown(line)
        if len(cleaned) < 20:
            continue
        return _truncate(cleaned)
    return ''


SUMMARY_PARSERS = {
    '521xueweihan/HelloGitHub': _hg_summary,
    'ruanyf/weekly': _weekly_summary,
}


def _monthly_date(n):
    """HelloGitHub 固定每月 28 号发布；按第 127 期（2026-10-28）倒推。"""
    month_index = (2026 * 12 + 9) - (127 - n)
    return f"{month_index // 12}-{month_index % 12 + 1:02d}-28"


def _weekly_fallback_date(n):
    return (datetime.date(2026, 11, 21) + datetime.timedelta(days=7 * (n - 420))).isoformat()


def _weekly_git_dates(repo, branch, numbers):
    """周刊文件可能被多次修改，用提交历史里最早日期标注发布周。"""
    tmp = tempfile.mkdtemp(prefix='binjian-weekly-')
    try:
        subprocess.run(
            ['git', 'clone', '-q', '--depth', '100', '--single-branch',
             '--branch', branch, f'https://github.com/{repo}.git', tmp],
            check=True, timeout=180,
        )
        dates = {}
        for n in numbers:
            path = f'docs/issue-{n}.md'
            result = subprocess.run(
                ['git', '-C', tmp, 'log', '-1', '--format=%cI', '--', path],
                capture_output=True, text=True, timeout=30,
            )
            iso = result.stdout.strip()
            if iso:
                dates[n] = iso[:10]
        return dates
    except Exception as exc:
        print(f"   ⚠️  周刊提交历史获取失败（{exc}），日期按发行节奏估算")
        return {}
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def _issue_url(source, n):
    path = source['path_fmt'].format(n=n)
    return f"https://github.com/{source['repo']}/blob/{source['branch']}/{path}"


def _fetch_source(source, seen):
    repo = source['repo']
    readme_url = f"https://raw.githubusercontent.com/{repo}/{source['branch']}/README.md"
    resp = requests.get(readme_url, headers=UA, timeout=20)
    resp.raise_for_status()
    numbers = sorted({int(n) for n in re.findall(source['readme_re'], resp.text)}, reverse=True)

    candidates = []
    for n in numbers:
        url = _issue_url(source, n)
        if url not in seen:
            candidates.append(n)
        if len(candidates) >= BACKFILL:
            break

    if not candidates:
        return []

    git_dates = {}
    if source['date_mode'] == 'git':
        git_dates = _weekly_git_dates(repo, source['branch'], candidates)

    records = []
    for n in candidates:
        path = source['path_fmt'].format(n=n)
        raw_url = f"https://raw.githubusercontent.com/{repo}/{source['branch']}/{path}"
        resp = requests.get(raw_url, headers=UA, timeout=20)
        if resp.status_code != 200:
            print(f"   ⚠️  {source['name']} 第 {n} 期正文获取失败：HTTP {resp.status_code}")
            continue

        text = resp.text
        title_match = re.search(r'(?m)^#\s+(.+)$', text)
        title = _clean_markdown(title_match.group(1)) if title_match else source['title_fmt'].format(n=n)
        title = title.replace('《', '').replace('》', '').replace('HelloGitHub第', 'HelloGitHub 第')

        if source['date_mode'] == 'monthly28':
            publish_time = _monthly_date(n)
        else:
            publish_time = git_dates.get(n) or _weekly_fallback_date(n)

        records.append({
            'title': title,
            'summary': SUMMARY_PARSERS[repo](text),
            'url': _issue_url(source, n),
            'source': source['name'],
            'publish_time': publish_time,
            'author': '',
            'like_count': 0,
            'comment_count': 0,
            'score': SCORE,
            'page_type': 'weekly',
        })
        seen.add(_issue_url(source, n))
        print(f"   · {source['name']} 第 {n} 期 {publish_time}")
    return records


def fetch_weeklies():
    seen = store.load_seen_urls()
    records = []
    for source in SOURCES:
        try:
            records.extend(_fetch_source(source, seen))
        except Exception as exc:
            print(f"⚠️  {source['name']} 抓取失败：{exc}")
    if not records:
        print("   推荐周刊没有新内容")
        return 0
    added = store.insert(records, 'weekly')
    print(f"💾 推荐周刊入库：{added} 期")
    return added


if __name__ == '__main__':
    fetch_weeklies()