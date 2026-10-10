# Implementation Plan: 学术主页重建（Homepage Rebuild）

**Branch**: `001-homepage-rebuild` | **Date**: 2026-10-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-homepage-rebuild/spec.md`

## Summary

重建 G3 CIGMA 课题组学术主页（原 iienlp.github.io 后继）：主页（六区块）、新闻列表+详情、人员、发表四个页面，全部内容以结构化数据文件维护。技术方案：**Astro 7.x 静态站点生成器** + Content Collections（glob/file loader + Zod schema 构建期校验），零前端框架、零运行时依赖，产物为纯静态 HTML，经 GitHub Actions 部署到 GitHub Pages。视觉沿用 nlp-home-simple 简洁学术风（浅色、蓝色系、卡片式区块）。

## Technical Context

**Language/Version**: TypeScript 5.x（Astro 内置）；Node.js ≥ 22 LTS；Astro ^7.x（以初始化时最新 7.x 稳定版为准，lockfile 锁定）

**Primary Dependencies**: `astro`（唯一运行依赖）；devDependencies：`@astrojs/check` + `typescript`（用于 `astro check` 类型与 schema 校验）。无 React/Vue/Tailwind 等任何前端框架或 CSS 框架。

**Storage**: 文件系统——`src/data/*.json`（论文/人员/Gallery/站点信息）+ `src/content/news/*.md`（每条新闻一个 Markdown 文件，正文可内嵌配图）+ `public/gallery/`（活动照片原图）。无数据库、无外部 CMS。

**Testing**: 构建期校验（`astro check` + `astro build`，数据文件字段错误在构建阶段明确报错，满足 spec 边缘用例）+ quickstart.md 手动验证清单（六区块存在性、导航互通、CCF 徽标、lightbox、移动端 375px、外链抽检）。不引入自动化 e2e 框架（YAGNI）。

**Target Platform**: 纯静态 HTML，GitHub Pages 托管（`https://<org>.github.io/<repo>`）；现代浏览器（Chrome/Firefox/Safari/Edge 最新两个大版本），桌面 ≥1280px 与移动端 ≥375px。

**Project Type**: 静态网站（static site，Astro 默认 `output: 'static'`）

**Performance Goals**: 主页典型宽带 3 秒内首次渲染（SC-002）；默认零 JS 输出，页面级 JS 仅 Gallery lightbox（~30 行原生 JS）。

**Constraints**: 产物完全兼容 GitHub Pages；运行时零第三方依赖；图片等静态资源存仓库内相对路径引用；外部链接 HTTPS。

**Scale/Scope**: 4 个主要页面 + 每条新闻一个详情页（初始约 10–20 条）；论文列表约 130+ 条（林政 111 + 吴大衍 32 去重，按年份分组）；Gallery 精选 8–12 张。

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原则 | Gate 检查项 | 状态 |
|------|------------|------|
| I. 内容准确性（不可妥协） | 论文清单、老师信息在实现期从权威来源（UCAS 主页、招生 PPT、所方官方介绍）核对后方可上线；内容准备列为独立任务（见 tasks 阶段） | PASS |
| II. 内容与展示分离 | 全部内容走 `src/data/*.json` + `src/content/news/*.md`，由 Content Collections schema 校验；模板零内容硬编码；常规更新不触碰模板/样式/构建文件（FR-012） | PASS（架构保证） |
| III. 静态站点与 GitHub Pages | Astro static output + `.github/workflows/deploy.yml`（withastro/action@v6）；CI 构建失败即阻止部署 | PASS |
| IV. 简洁学术化设计 | 无前端框架、无运行时依赖；唯一 JS 为 lightbox ~30 行原生 `<dialog>`；视觉沿用参考站简洁色板；语义化 HTML + 基础无障碍 | PASS |
| V. 最小复杂度（YAGNI） | 直接依赖仅 `astro`；不引入 CSS 框架、e2e 框架、图片 CDN；Gallery v1 用 `public/` 直出（构建时图片优化列为可选后续增强） | PASS |

**无违规项**（Astro 为构建期工具、运行时零依赖，符合 Constitution IV "MUST NOT 引入重量级前端框架或运行时依赖"）。

## Project Structure

### Documentation (this feature)

```text
specs/001-homepage-rebuild/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   ├── routes.md        # 站点 URL 路由与导航契约
│   └── data-files.md    # 维护者数据文件契约（更新流程）
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
nlp-home/
├── astro.config.mjs          # site + base（GitHub Pages 仓库名）配置
├── package.json
├── tsconfig.json
├── .gitignore
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Pages 部署（push main 触发）
├── public/
│   ├── gallery/              # 活动照片原图（8–12 张，JPEG，单张 ≤500KB）
│   └── favicon.svg
├── src/
│   ├── content.config.ts     # Content Collections：loader + Zod schema（构建期校验入口）
│   ├── content/
│   │   └── news/             # 每条新闻一个 .md（frontmatter：title/date/summary；正文可内嵌配图）
│   ├── data/                 # 维护者日常编辑区（全部 JSON，字段约定见 data-model.md）
│   │   ├── site.json         # 课题组元信息 + 招募信息（低频更新，直接 import）
│   │   ├── teachers.json     # 5 位老师
│   │   ├── students.json     # 在读学生（博士生/硕士生）
│   │   ├── graduates.json    # 毕业生去向
│   │   ├── publications.json # 论文全列表（约 130+ 条）
│   │   ├── gallery.json      # Gallery 精选照片清单
│   │   └── README.md         # 维护者字段约定与更新教程（Constitution II / FR-020）
│   ├── components/
│   │   ├── BaseLayout.astro  # HTML 骨架 + Navbar + Footer + 全局样式引入
│   │   ├── Navbar.astro      # sticky 顶部导航（四页互通，SC-001）
│   │   ├── Hero.astro        # 主页介绍区块（组名/研究所/研究方向）
│   │   ├── SectionHeading.astro
│   │   ├── Admissions.astro  # 招募区块（中文关键信息保留）
│   │   ├── NewsCard.astro    # 新闻概览条目（日期+标题/摘要）
│   │   ├── TeacherCard.astro # 老师卡片（人员页详情/主页区块共用）
│   │   ├── StudentGroup.astro# 在读学生分组列表
│   │   ├── PublicationItem.astro # 论文条目（标题+venue+CCF 徽标+链接回退）
│   │   ├── CCFBadge.astro    # CCF-A/B/C 徽标（无评级不渲染）
│   │   └── Gallery.astro     # 缩略图网格 + <dialog> lightbox（唯一页面 JS）
│   ├── pages/
│   │   ├── index.astro       # 主页：六区块（介绍/招募/新闻/人员/publications/Gallery）
│   │   ├── news/
│   │   │   ├── index.astro   # 新闻列表（时间倒序）
│   │   │   └── [id].astro    # 新闻详情（getStaticPaths ← news collection）
│   │   ├── people.astro      # 人员页（老师详情+在读学生分组+毕业生去向）
│   │   └── publications.astro# 发表页（全列表，按年份分组+年份锚点导航）
│   └── styles/
│       └── global.css        # CSS 变量（nlp-home-simple 色板）+ 布局 + 公共样式
└── specs/                    # Spec Kit 文档（本目录）
```

**Structure Decision**: 单一 Astro 项目，仓库根即项目根（无 monorepo）。数据与展示物理分离：`src/data/` + `src/content/` 为内容区（维护者只改这里），`src/components/` + `src/pages/` + `src/styles/` 为展示区（PR 管理）。六个 collection（news 用 glob loader 加载 Markdown；publications/teachers/students/graduates/gallery 用 file loader 加载 JSON），`site.json` 为低频站点元信息，直接 import 使用（不入 collection，避免单对象 file loader 的 entry 语义别扭）。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

无违规项，无需记录。
