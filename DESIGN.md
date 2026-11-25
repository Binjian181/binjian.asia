# Design

<!-- impeccable:design-schema 1 · world=monyun-zhuyin seed=c0368a31 -->

> Visual world for binjian.asia, written from the built surface (not before it). Replaces the
> incumbent indigo→purple→orange→pink gradient system.

## World

**墨韵·朱印** — an ink-and-paper Chinese editorial system drawn from 古籍 / 碑帖 / 印学
(classical books, stone rubbings, seal art). A calm reading room, not a portal. The single
committed accent is 朱砂 / 印泥红 (cinnabar vermilion); everything else is 宣纸 (paper) and 墨
(ink). The material discipline is pulled from the world's saturated roots — 朱丝栏 column rules,
印章 seal chips, 句读 vermilion marks — so it is not the generic "cream + serif + terracotta"
AI default.

- **Mode:** Read (readers come to read curated 精读). Color strategy: **Restrained** (neutrals + one accent).
- **Form:** replacement world, brief-pinned. The rolled catalog direction (seed `c0368a31`) was a
  whimsical physical metaphor unfit for a personal Chinese reading hub, so it was set aside on
  factual grounds per new-work; the user confirmed this direction.

## Palette

| Token | Light (宣纸) | Dark (夜色) | Role |
|---|---|---|---|
| `--bg-color` | `#f3ecdd` | `#16130d` | page ground |
| `--text-color` | `#211c15` | `#ece1cf` | 墨 ink |
| `--card-bg` | `#fbf6ea` | `#1f1a12` | panels / cards |
| `--border-color` | `#e2d7c2` | `#342d20` | hairlines |
| `--secondary-text` | `#6a5f4f` | `#b3a78e` | 淡墨 |
| `--muted-text` | `#9c9080` | `#8a7e69` | captions / meta |
| `--seal` / `--accent-color` | `#b1342b` | `#d9543f` | 朱砂 accent (only saturated color) |
| `--seal-soft` | `rgba(177,52,43,.10)` | `rgba(217,84,63,.16)` | 朱印 tint fields |
| `--on-seal` | `#fff` (6.2:1) | `#16130d` (4.67:1) | foreground on solid 朱砂 surfaces |
| `--rule` | `rgba(33,28,21,.14)` | `rgba(236,225,207,.16)` | 界栏 / 朱丝栏 hairline |

Gradients are removed everywhere; `--accent-gradient` is defined as a flat seal color only for
backward-compat with inline `var(--accent-gradient)` usages, which now render solid.

## Palette variants · 五套纸色（2026-11-25）

主题拆成两个正交维度：`data-theme`（light / dark）与 `data-palette`（纸色）。无 `data-palette`
时即默认的 宣纸·朱砂；五套共用同一套组件、印章语法与来源签，只换纸面、墨色与单一实色印色，
不引入第二强调色，也不回退到被否决的渐变主题。

| `data-palette` | 名称 | 亮色 纸 / 印 | 暗色 纸 / 印 | 气质 |
|---|---|---|---|---|
| *(默认)* | 宣纸·朱砂 | `#f3ecdd` / `#b1342b` | `#16130d` / `#d9543f` | 原世界，暖纸朱批 |
| `qingjian` | 青笺·石青 | `#e7edf0` / `#2c5c79` | `#0f151a` / `#7ba6c4` | 冷纸、清冷 |
| `songyan` | 松烟·墨绿 | `#ecefe8` / `#33523d` | `#111510` / `#86a98b` | 灰绿、沉静 |
| `piaoxiang` | 缥缃·藤黄 | `#f1ead3` / `#836011` | `#16120a` / `#d1a54c` | 书帙装帧、温润 |
| `sujian` | 素笺·松墨 | `#efede8` / `#3b352c` | `#131211` / `#b8ae9c` | 无彩、最安静 |

- 对比度：正文/纸面 13.4–14.8:1；次要文字 5.3–8.4:1；印面文字（`--on-seal`）亮色 5.4–8.7:1、
  暗色 4.67–8.18:1。每套亮色用白字压印、暗色用纸色字压亮印，与既有 `--on-seal` 约定一致。
- `nav-btn.active`、今日朱印徽标、页码圆章、回顶/随机跳转按钮统一改用 `var(--on-seal)`，
  不再写死白色——否则亮印纸色（青笺、素笺暗色）上的白字会失守 4.5:1。
- 来源签与数据分级色保持语义固定，不随纸色变化（人民网签仍随 `--seal` 走，维持“权威红=印章色”）。
- 切换入口：点导航/顶栏「主题」打开「印谱」小面板——上排明暗（跟随系统 / 亮 / 暗），下排五枚
  纸色签。纸色签样本固定画亮色纸面与印色，不随当前明暗翻转，便于横向比较。
- 实现：令牌分别写在 `:root[data-palette=…]:not([data-theme="dark"])`、
  `@media (prefers-color-scheme: dark)` 内的 `:root:not([data-theme="light"])[data-palette=…]`
  与 `[data-theme="dark"][data-palette=…]` 三处；`js/common.js` 的 `PaletteManager` /
  `ThemePanel` 管理 `localStorage.palette`，面板按触发按钮定位、点外部/滚动/Esc 关闭。
- 首屏：`<head>` 内的 `theme-boot` 内联脚本（由 `scripts/add_cache_version.py` 注入全部页面与
  模板）在样式表之前恢复明暗与纸色，避免闪一下默认纸面。
- 打印：`@media print` 仍强制白纸黑字，纸色选择不影响导出。

### Source-tag harmonized palette (印学)
Per-source chips keep recognizable distinct hues but are muted into the world: 人民网 → 朱砂
`--seal`; 少数派/sspai → 石青 `#3f5d7a`; 36氪 → 石绿 `#2f6f5b`; 澎湃 → 暖灰 `#6f6757`;
浙江宣传 → 紫泥 `#6b4a5c`（紫檀印泥，色相 327°，离其余四色最远）；原创 → 缃黄 (`--seal-soft` bg,
`--seal` text). Dark variants carry ink text on lightened grounds, all ≥4.5:1: 少数派 `#6689ac`
(5.06), 人民网 `#d75b4c` (4.85), 浙江宣传 `#9c7189`, 36氪 `#3f8d74`, 澎湃 `#8c8270`; 原创's
text lightens to `#e9795f` (5.5) because its tinted ground cannot deepen far enough (caps at 4.33).

Chip label and filter key both come from a display layer: `news_page.html` maps 浙江宣传 → 浙宣
via `source_labels`（仅展示，数据库与爬虫原值不动）, and filter keys are space-normalized
(`replace(' ','')`) so the 36氪 / "36 氪" DB variants collapse to one hue and one filter.

### Data-viz exception (documented, intentional)
`article/f6ba6edd.html` holds a reference comparison table (`.ref-table`) whose rows are
tier-coded — 最高规格 blue `#3b82f6`, 高规格 purple `#a855f7`, 中规格 green `#22c55e`,
特色栏目 yellow `#eab308` (each with dark-mode variants) — plus two header gradients. These are
**semantic tier discriminators**, not theme accents: collapsing them into a single 朱砂 ramp
would destroy the table's information function. Kept as a deliberate exception to the
single-accent rule — do not "correct" them back to 朱砂, and do not mistake them for the banned
indigo/purple/orange/pink gradient *themes* (a separate concern).

## Typography

- Reading face (headings, article body, summaries, 导语, markdown): CJK **宋体** stack —
  `'Songti SC','STSong','Source Han Serif SC','Noto Serif SC','SimSun',serif`. Deliberately
  *not* a named training-data display serif (Fraunces/Playfair/etc.); 宋体 is subject-appropriate.
- UI face (nav, meta, tags, footer): system sans — `-apple-system,'PingFang SC','Microsoft YaHei'`.
- No web fonts (Google Fonts blocked in CN); system stacks only.

## Material discipline (the raises from 印学)

- **朱批 top rule** — every `page-header` / hero panel carries a 3px `--seal` top border on a
  宣纸 card (replaces the white-on-gradient banner).
- **印章 active / badge** — `nav-btn.active` is a solid 朱砂 block (white text); the 精读
  `is-today` card carries a 朱印 (`--seal`) "今日更新" badge.
- **句读 / 朱批 block marks** — the 导语 (lead) and blockquotes carry a vermilion left rule
  (`--seal`); this is the one place a saturated side-rule is intentional (semantic emphasis, not
  card decoration). The impeccable detector's `side-tab` rule flags these; they are kept as a
  documented raise.
- **界栏 hover** — article cards are uniform-bordered; on hover the left edge turns 朱砂 (the
  朱丝栏 → 朱印 transition). Avoids the always-on colored side-border tell.
- **朱印签筛选栏** — `.source-filter` / `.filter-btn` (科技资讯 / 时政观点) are the 印章 language
  applied to a control: 宣纸 chip + hairline border, active = solid 朱砂 block (same as
  `nav-btn.active`); the row sits on a 界栏 hairline, not a floating glass panel. Foreground on
  solid 朱砂 is `--on-seal` — white in light (6.2:1), ink in dark (4.67:1, following the dark
  source-chip convention rather than the white-on-seal badge's 3.97:1). On narrow screens the row
  becomes a single-line horizontal strip whose edge fades appear only while chips overflow.

## Component language (cross-surface)

Driven entirely by `css/common.css` tokens. Templates (`news_page`, `articles_page`,
`daily`, `daily_detail`, `discussion_page`) and the crawler-generated article detail page
(`process_original_articles.py` → `ARTICLE_TEMPLATE`) no longer set per-section `--accent-*`
overrides or gradients; they inherit the unified world. `index.html` (standalone, not
crawler-regenerated) is restyled inline to match.

## Preserved quality floor

- Dark / light via `data-theme` on `<html>` + `localStorage` (`js/common.js` untouched).
- Responsive layout + mobile menu + theme toggle IDs preserved.
- SEO: JSON-LD Person/Article blocks kept in `daily.html`, `daily_detail.html`, `ARTICLE_TEMPLATE`.
- Behavior: infinite scroll, random-jump (`#randomJumpBtn`), back-to-top (`#backToTop`/`#backToTopBtn`)
  all preserved in `ARTICLE_TEMPLATE`.
- Identity: 张彬健 / Binjian name, `profile.png`, `icons.png`/`icons.svg` untouched.
- Cross-context adaptation (added via `/impeccable adapt`, all in `css/common.css`): `@media print` clean print/PDF export (white paper, black ink, 朱砂 top rule as brand mark, nav/footer/floating buttons/返回链接 hidden, source URLs expanded for traceability, sensible page breaks); touch/mouse split via `@media (hover: none)` (`:active` feedback instead of stuck hover) + `@media (pointer: coarse)` (≥44px tap targets on drawer nav / theme toggle / menu / source tags); `@media (max-width: 390px)` small-screen fallback (tightened spacing, `article-title` forced to 17px against the detail-page inline 22px).

## Provenance

- Tool: impeccable v4.1.2 (`pbakaus/impeccable`), new-work flow.
- Direction seed: `c0368a31` (rolled catalog world set aside as unfit; brief-pinned replacement).
- No raster assets were produced; the world is type/CSS-only, so no image provenance is owed.
- Finish: detected (web, degraded regex mode) → `common.css` clean; residual `side-tab` on
  semantic blockquote/导语 rules accepted as intentional raises.
- Refinement (2026-09-22, v4.3.1): 来源筛选栏 rebuilt from its ad-hoc inline style
  (glass panel + rounded pills + `#667eea` indigo fallback) into the world as 朱印签; added the
  `--on-seal` token and the single-line overflow strip. Detector vs the HEAD baseline: the old
  bar's real violation (`#fff on #667eea`, 3.7:1) is gone; the remaining findings are pre-existing
  raises (7× `side-tab` 朱批/导语 rules, `border-accent-on-rounded` on the 朱批 page-header) plus
  one cross-scope false positive — degraded regex mode pairs dark `--on-seal #16130d` with light
  `--seal #b1342b`, which never co-occur (each theme defines the pair together: 6.18:1 light,
  4.67:1 dark; the same mode also pairs the print-only tokens `#000 on #b1342b`).
- Refinement (2026-09-22, v4.3.1 · 来源签): 浙江宣传 chip added (紫泥 `#6b4a5c` light / `#9c7189`
  dark — it previously rendered with no chip at all). WCAG audit of every chip pair against the
  4.5:1 floor found three dark-mode failures, fixed under the fix-only-the-failing-values scope:
  two grounds lightened (人民网 `#cf4a3d` 4.15 → `#d75b4c` 4.85, 少数派 `#5a7da0` 4.30 → `#6689ac`
  5.06) and one text lightened (原创 3.95 → `#e9795f` 5.5, the tint-deepening route capping at
  4.33). Provenance gap noted, not fixed: dark chip variants key on `[data-theme="dark"]` only, so
  first-time system-dark visitors (no `data-theme` attribute) still get the light chips — they
  remain legible there, so this degrades gracefully; a `prefers-color-scheme` variant would be the
  fix if it ever matters. Cache note: the chip edits initially shipped under the unchanged
  `?v=20260922` and were invisible to anyone who had already loaded that URL (nginx `expires 1y`,
  and `.article-source` has no base background, so a missing rule = an invisible chip). All 190
  pages + templates + `ARTICLE_TEMPLATE` now point at `?v=20260922b`;
  **every `css/common.css` edit must bump the version via `/home/ubuntu/add_cache_version.py`**.

- Refinement (2026-11-25, v5.x · 五套纸色): theme split into `data-theme` × `data-palette`.
  Added 青笺·石青 / 松烟·墨绿 / 缥缃·藤黄 / 素笺·松墨 alongside 宣纸·朱砂, each with light/dark
  token sets; switcher is the 印谱 popover on every page (drawn by `js/common.js`, so existing
  generated detail pages get it without re-render). White-on-seal hardcodes (`nav-btn.active`,
  `today-badge`, `para-num`, back-to-top, `random-jump-btn`) replaced with `--on-seal`; the
  人民网 chip keeps its own dark override. All pages + templates + `ARTICLE_TEMPLATE` bumped to
  `?v=20261125` and now carry a `theme-boot` inline script before the stylesheet
  (`python scripts/add_cache_version.py` in the repo, replacing the old `/home/ubuntu` tool).

- Refinement (2026-11-25, v5.x · 统一线性图标 + 主页栅格): every UI emoji was replaced by one
  stroke-icon set (24 viewBox, stroke 2, round caps/joins, `currentColor`), sourced from
  `templates/_icons.html` for Jinja pages and a static 17-symbol sprite in `index.html` /
  `ARTICLE_TEMPLATE` / the 258 already-generated detail pages. Pages carry the sprite once and
  reference `<use href="#i-…">` per element — inline copies per card had inflated tech-news to
  1.4 MB raw. Section identity is echoed in the page header icon (globe/smartphone/book-open/
  file-text, seal color); UI copy no longer contains emoji. Icon sizes live in `common.css`
  (`.nav-btn svg` 17, `.meta-icon` 14, `.section-icon` 20, `.label-icon` 12, `.stat-badge
  .meta-icon` 12) so stale `width`/`height` attributes on pre-existing generated pages cannot
  shrink them. Homepage: new `.home-header` masthead (印-style 彬 seal + wordmark + tagline)
  matching the section `page-header` language; quick-entry grid goes 4-across at ≥1200 (container
  widened to 1200 to match `.container`), 2×2 below, and compact horizontal rows at ≤520 so all
  four boards fit a phone viewport; sidebar no longer stretches full height
  (`align-items: flex-start`). 琥珀 card ground darkened `#b07a2a → #8a5f1c` to restore 5.62:1
  white-on-amber. Cache bumped to `?v=20261125b`.
