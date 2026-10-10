# Contract: 站点 URL 路由（routes.md）

**Date**: 2026-10-10 | **消费方**: 站点访客、搜索引擎、站内链接

纯静态站点；实际 URL 前缀由 `astro.config.mjs` 的 `site` + `base` 决定（GitHub Pages：`https://<org>.github.io/<repo>/`）。下表路径均为 `base` 后相对路径。

## 路由表

| 路径 | 页面 | 渲染来源 | 导航入口 |
|------|------|----------|----------|
| `/` | 主页（六区块：介绍/招募/新闻概览/人员/代表性 publications/Gallery） | `src/pages/index.astro` | Navbar 首项 |
| `/news/` | 新闻列表（时间倒序概要列表） | `src/pages/news/index.astro` ← `news` collection | Navbar |
| `/news/{id}/` | 新闻详情（id = Markdown 文件名 slug） | `src/pages/news/[id].astro`，每条新闻一个静态页 | 列表条目、主页新闻概览条目 |
| `/people/` | 人员页（老师详情/在读学生分组/毕业生去向） | `src/pages/people.astro` | Navbar、主页人员区块"View all" |
| `/publications/` | 发表页（全列表，按年份分组 + `#year-{yyyy}` 锚点） | `src/pages/publications.astro` | Navbar、主页 publications 区块"View all" |

## 导航契约（SC-001）

- Navbar 固定四项：Home / News / People / Publications，任一页面 1 次点击可达其余三个页面。
- 跳转锚点：发表页年份导航使用 `/publications/#year-2024` 形式（`id="year-{yyyy}"` 置于各年份分组标题）。

## 外链契约

| 链接源 | 目标 | 行为 |
|--------|------|------|
| 老师外部个人主页（`teachers.homepage`） | UCAS 等权威主页 | `target="_blank" rel="noopener"`，https 强制（schema 校验） |
| 论文条目（`publications.url`） | arXiv 优先，回退 DOI/出版方/scholar | `target="_blank" rel="noopener"`；url 为空 → 不可点击纯文本 |
| 招募邮箱（`site.admissions.email`） | `mailto:` | 带默认主题（`site.admissions.emailSubject`） |

## 空态契约（spec 边缘用例）

- `news` collection 为空 → 新闻页显示友好占位文案（"No news yet."），主页隐藏新闻概览区块。
- `gallery` collection 为空 → 主页隐藏 Gallery 区块。
- `students` / `graduates` collection 为空 → 人员页对应分组显示友好占位文案（不隐藏区块、不留空白，2026-10-10 澄清回填）。
- 其余页面数据为空 → 构建期 schema 校验失败（teachers 至少 5 条、publications 非空为内容准备阶段保证）。
