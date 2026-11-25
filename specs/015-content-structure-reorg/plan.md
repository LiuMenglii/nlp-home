# Implementation Plan: 项目内容结构重构（可维护内容与源码分离）

**Branch**: `main`（特性目录 `015-content-structure-reorg`） | **Date**: 2026-11-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/015-content-structure-reorg/spec.md`

## Summary

把全部日常维护内容从 `src/` 与 `public/` 迁移到仓库根目录的唯一内容区 `content/`，并将 Gallery 与教师改为「一条目一目录」：

- `content/gallery/<NN-slug>/index.md` + 同目录图片；
- `content/teachers/<NN-slug>/index.md` + 同目录图片；
- `content/news/**/*.md` 保持「一文件一条」，正文与配图同目录，URL 派生规则不变；
- `content/students.json`、`graduates.json`、`publications.json`、`site.json` 保持既有结构。

技术路线：沿用 Astro 7 内容层（`glob` / `file` loader）与 `image()` schema；图片经 Astro 资源管线输出带 base 前缀的哈希 URL；不新增依赖，不改页面设计、样式、路由、Markdown 控件行为与部署方式。迁移后 `npm run check`、`npm run build`、现有 Node 测试通过，页面数量、顺序、文案、链接、图片与 4 篇新闻 URL 逐项不变。

## Technical Context

**Language/Version**: TypeScript 5.9 / JavaScript（Node 22，CI 与本地一致）；Astro 7.3.8

**Primary Dependencies**: `astro`、`@astrojs/markdown-satteri`、`satteri`、`@astrojs/check`、`typescript`——全部为现有依赖，本特性不新增

**Storage**: 文件系统内容区 `content/`（Markdown 条目、JSON 数据集、图片）；站点装饰性品牌资源仍为 `public/logo.svg`、`public/favicon.svg`；无数据库、无外部 CMS

**Testing**: `npm run check`（类型 / Astro 语法）、`npm run build`（内容校验 + 静态构建）、`node --test tests/news-widgets.test.mjs`（现有控件测试）；迁移前后页面一致性采用构建产物比对与人工浏览器核对

**Target Platform**: 纯静态站点，GitHub Pages，`base: '/nlp-home'`，`site: 'https://liumenglii.github.io'`

**Project Type**: 单项目静态网站（Astro）

**Performance Goals**: 无运行时性能目标变化；迁移只影响构建期内容加载与资源输出。图片仍由构建期资源管线处理，不引入客户端运行时

**Constraints**:
- 零新增依赖、零新增运行时 JS；
- 不改组件视觉模板、样式、路由、Markdown 控件行为、`site` / `base` 配置与 GitHub Actions 功能；
- 新闻 URL（`/news/<slug>/`，含子目录）保持不变；
- 内容值（文字、链接、字段值、图片内容与数量）零变更；
- 所有现有构建期校验保留并在新结构下生效；
- 支持的 320–1920px 九档视口无布局破损。

**Scale/Scope**: 12 张 Gallery 照片、4 位教师、31 位在读学生、13 位毕业生、135 条论文、4 篇新闻、1 份站点品牌信息；内容区约 12 个 Gallery 条目目录、4 个教师条目目录、4 篇新闻与 4 个 JSON 数据集。

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原则 | 本特性的落实方式 | 结论 |
|------|------------------|------|
| I. 内容准确性（不可妥协） | 迁移为纯位置/组织形式变更；迁移前后逐字段比对教师、Gallery、学生、毕业生、论文、新闻与品牌信息；图片按内容哈希比对 | PASS |
| II. 内容与展示分离 | 全部可编辑内容集中到 `content/`；`src/` 只保留代码；维护者新增/替换内容不需要改模板或样式 | PASS（强化） |
| III. 静态站点与 GitHub Pages 交付 | 不改变 Astro 静态构建、`base` / `site` 配置与 `deploy.yml`；构建产物仍为纯静态文件 | PASS |
| IV. 简洁学术化设计 | 无视觉、布局、交互变更；不引入框架或运行时依赖 | PASS |
| V. 最小复杂度（YAGNI） | 复用 Astro 内容层与 `image()`；不拆分无图片的学生 / 毕业生 / 论文数据集；不新增依赖或抽象 | PASS |
| VI. 无布局破损（不可妥协） | 不改模板与样式；图片按原比例、原展示尺寸输出；迁移后按 320/375/480/576/768/1024/1280/1440/1920px 逐页检查元素重叠、截断、溢出与页面横向滚动 | PASS（需构建后实测） |

**Gate 结论**：无违规项，无需 Complexity Tracking。

## Project Structure

### Documentation (this feature)

```text
specs/015-content-structure-reorg/
├── plan.md              # 本文件
├── research.md          # Phase 0 技术决策
├── data-model.md        # Phase 1 内容实体与字段
├── quickstart.md        # Phase 1 验证与运行指南
├── contracts/
│   ├── content-layout.md    # 内容区目录 / 条目 / 图片契约
│   └── validation.md        # 构建期校验规则与报错契约
└── tasks.md             # Phase 2 输出（由 /speckit-tasks 生成，不在本阶段创建）
```

### Source Code (repository root)

```text
content/                              # 唯一日常维护内容区（本特性新增）
├── README.md                         # 唯一维护指南（由 src/data/README.md 改写迁移）
├── site.json                         # 站点品牌、导航、方向、招生、logo/favicon 路径
├── students.json                     # 31 位在读学生（数组，结构不变）
├── graduates.json                    # 13 位毕业生（数组，结构不变）
├── publications.json                 # 135 条论文（数组，结构不变）
├── news/                             # 一文件一条新闻；配图与 .md 同目录
│   ├── acl-2025-spc-award.md
│   ├── homepage-relaunch.md
│   ├── iie-nlp-founded.md
│   ├── self-taught-rlvr-2026.md
│   ├── copd-method.png
│   ├── npo-overview.png
│   └── rlsd-method.png
├── teachers/                         # 一位教师一个条目目录
│   ├── 01-lin-zheng/
│   │   ├── index.md                  # 姓名 / 职称 / 导师角色 / 方向 / 邮箱 / 链接 / 简介
│   │   └── lin-zheng.svg
│   ├── 02-fu-peng/
│   │   ├── index.md
│   │   └── fu-peng.svg
│   ├── 03-wu-dayan/
│   │   ├── index.md
│   │   └── wu-dayan.svg
│   └── 04-gu-jingzi/
│       ├── index.md
│       └── gu-jingzi.svg
└── gallery/                          # 一张照片一个条目目录；序号即展示顺序
    ├── 01-emnlp-2025-suzhou/
    │   ├── index.md                  # image / caption / 可选 date
    │   └── emnlp-2025-suzhou.jpg
    ├── 02-emnlp-2026/
    ├── 03-team-building-2026-1/
    ├── 04-team-building-2026-2/
    ├── 05-acl-2025/
    ├── 06-ccac-2025/
    ├── 07-4th-large-model-generation-conference/
    ├── 08-new-year-celebration/
    ├── 09-ccac-2024/
    ├── 10-yssnlp-2024/
    ├── 11-team-building-2024/
    └── 12-yanqi-lake-library/

src/                                  # 只保留代码
├── content.config.ts                 # 内容层 loader / schema / 构建期校验（路径与条目模型更新）
├── markdown/news-widgets.mjs         # 不变
├── components/                       # TeacherCard / Gallery 仅改图片来源表达式
├── pages/                            # 仅改 site.json import 路径与注释
├── styles/                           # 不变
└── utils.ts                          # 不变

public/                               # 只保留站点装饰性品牌资源
├── logo.svg
└── favicon.svg

tests/
└── news-widgets.test.mjs             # 不变

astro.config.mjs                      # 仅更新新闻目录常量与注释
docs/news-markdown-guide.md           # 路径说明更新
```

**Structure Decision**：沿用单 Astro 项目。新增顶层 `content/` 作为唯一内容根；`src/` 只承载组件、页面、样式、路由、内容校验与 Markdown 控件；`public/` 只保留 logo / favicon 等站点装饰性静态资源。删除 `src/data/`、`src/content/news/`、`public/gallery/`、`public/teachers/`。

## Technical Approach

### 1. 内容区与条目模型

- **Gallery**：`content/gallery/<NN-slug>/index.md` + 同目录图片。frontmatter：
  - `image`：同目录相对路径，如 `./emnlp-2025-suzhou.jpg`；
  - `caption`：非空字符串，兼作 `<img alt>`；
  - `date`：可选字符串（当前值如 `2026-11`、`2024-06-23`）。
- **教师**：`content/teachers/<NN-slug>/index.md` + 同目录照片。frontmatter 保留现有字段：
  `name`、`title`、`advisorRole`、`directions`、`email`、`ucasProfile`、`homepage`、`photo`、`bio`。
  `photo` 为同目录相对路径（如 `./lin-zheng.svg`）或省略 / `null`（无照片，合法）。
- **序号与顺序**：目录名统一为两位数字前缀 + 小写 slug。`getCollection` 按 `entry.id` 字典序排序即得到迁移前顺序；不依赖文件系统返回顺序。
  - Gallery 序号：`01`–`12` 对应迁移前 `gallery.json` 数组顺序；
  - 教师序号：`01`–`04` 对应迁移前 `teachers.json` 数组顺序。
- **新闻**：`content/news/**/*.md`，一文件一条；配图与 Markdown 同目录，正文相对引用不变；`glob` 的 base 改为 `./content/news`，`entry.id` 与迁移前一致，因此 URL 不变。
- **数据集**：`students.json`、`graduates.json`、`publications.json` 原样迁移到 `content/`，数组顺序、字段、条目 id 生成规则（`stu-001` / `gra-001` / `pub-001`）不变。
- **品牌信息**：`content/site.json` 原样迁移；组件与页面直接 import JSON；`logo` / `favicon` 仍指向 `public/` 下的站点静态资源。

### 2. Loader 与 Schema

- `gallery`：`glob({ pattern: '*/index.md', base: './content/gallery' })`；schema 使用 `({ image }) => z.object({...})`，`image: image()`。
- `teachers`：`glob({ pattern: '*/index.md', base: './content/teachers' })`；`photo: image().nullable().optional()`。
- `news`：`glob({ pattern: '**/*.md', base: './content/news' })`；现有 frontmatter schema 不变。
- `students` / `graduates` / `publications`：继续使用 `file('content/<name>.json', { parser: jsonArrayParser(...) })`；解析错误载体、id 注入、链接三选一、HTTPS、日期配对等规则不变。
- `site`：不转为 collection，保持直接 import + 模块加载期校验，避免无谓的异步改造。
- `image()` 的路径解析以条目 `index.md` 为基准；只允许同目录相对路径（`./文件名`），schema 先做正则约束，再由 `image()` 校验文件存在。

### 3. 图片访问路径

- Gallery / 教师图片不再放 `public/`，改由 `image()` 引入，构建期输出到 Astro 资源目录（`_astro/...`），URL 自动带 `base` 前缀。
- 组件直接使用 `ImageMetadata.src`，**不再套 `withBase`**：
  - `TeacherCard.astro`：`<img src={photo.src}>`；
  - `Gallery.astro`：缩略图与灯箱均用 `photo.data.image.src`，灯箱仍加载原始资源 URL，不额外裁剪。
- 新闻正文图片继续由 Markdown 相对引用经 Astro 内容资源管线处理，URL 可变化但页面显示不变。
- `logo.svg` / `favicon.svg` 继续由 `withBase(site.logo)` / `withBase(site.favicon)` 引用。

### 4. 构建期校验

保留并迁移全部规则，新增条目级资产审计，确保报错指向 `content/`：

| 校验 | 实现位置 | 新报错定位 |
|------|----------|------------|
| Gallery 上限 12 条、条目目录与 `index.md` 完整性 | `content.config.ts` 模块加载期审计 | `content/gallery/` + 条目目录 |
| Gallery `image` 同目录、文件存在 | 模块加载期审计 + `image()` schema | `content/gallery/<id>/index.md` 的 `image` |
| 教师 `photo` 同目录、文件存在（有值时） | 模块加载期审计 + `image()` schema | `content/teachers/<id>/index.md` 的 `photo` |
| 教师字段、链接、方向 | teacher schema（不变） | 条目 id / 字段 |
| 学生 directions / 链接三选一 | 模块加载期 + students schema | `content/students.json`、姓名、字段 |
| 毕业生链接三选一 | graduates schema | `content/graduates.json`、姓名、字段 |
| 论文字段 / URL / date / CCF | publications schema | `content/publications.json`、标题、字段 |
| 品牌字段、logo / favicon 路径与存在性 | 模块加载期 `validateSiteBrand` | `content/site.json`、字段 |
| 新闻 schema、摘要长度、特定文章标题/摘要/控件语法 | news schema + `validateFeaturedNews` | `content/news/<file>.md` |
| 新闻控件硬错误 | `astro.config.mjs` 构建前预渲染 | 具体新闻文件与行号 |

错误文案统一以 `content/...` 开头，包含条目 / 姓名 / 字段与修复方向；不得再出现 `src/data/`、`src/content/news/`、`public/gallery/`、`public/teachers/` 作为操作指引。

### 5. 代码改动边界

- `src/content.config.ts`：路径、loader、gallery/teacher schema、资产审计、报错文案。
- `astro.config.mjs`：`NEWS_DIR` 改为 `./content/news/`，注释同步。
- `src/components/TeacherCard.astro`、`src/components/Gallery.astro`：仅改图片来源表达式，移除不再使用的 `withBase`。
- `src/components/{Navbar,BaseLayout,Hero,Admissions}.astro`、`src/pages/{index,team,publications}.astro`、`src/pages/news/{index,[...id]}.astro`：仅改 `site.json` import 路径（及新闻路由注释）。
- `docs/news-markdown-guide.md`：`src/content/news/` → `content/news/`。
- `src/data/README.md` → `content/README.md`：改写为唯一维护指南。
- 不改：组件模板结构 / CSS、`src/markdown/news-widgets.mjs`、`src/styles/`、`src/utils.ts`、`tests/`、`package.json`、`deploy.yml`。

### 6. 迁移步骤（实施顺序）

1. **基线**：确认工作区干净；运行 `npm run check`、`npm run build`、`node --test tests/news-widgets.test.mjs`；保存 `dist/` 快照与内容计数。
2. **建内容区**：创建 `content/{news,teachers,gallery}/`；用 `git mv` 迁移 `site.json`、`students.json`、`graduates.json`、`publications.json`、4 篇新闻及其 3 张配图。
3. **转换 Gallery**：按迁移前数组顺序创建 `01`–`12` 条目目录，`index.md` 写入 `image` / `caption` / 可选 `date`；用 `git mv` 迁入原图。
4. **转换教师**：按迁移前数组顺序创建 `01`–`04` 条目目录，frontmatter 写入全部字段；`photo` 改为 `./<原文件名>`；迁入原 SVG。
5. **更新配置**：`src/content.config.ts`、`astro.config.mjs` 按上述方案修改。
6. **更新代码与文档**：组件图片来源、9 处 `site.json` import、新闻路由注释、两份指南。
7. **删除旧位置**：`src/data/`、`src/content/`、`public/gallery/`、`public/teachers/`；确认无重复副本。
8. **审计**：`grep` 检查 `src/`、`docs/`、`content/`、根配置中旧路径出现次数为 0（历史 `specs/` 除外）。
9. **验证**：`npm run check`、`npm run build`、Node 测试；比对迁移前后页面文本、数量、顺序、新闻 URL、图片可访问性；按九档视口人工检查。

### 7. 验证与风险

**验证门禁**：

- `npm run check`、`npm run build`、`node --test tests/news-widgets.test.mjs` 全部通过；
- `dist/` 中 4 个 `/news/<slug>/index.html` 存在且正文一致；
- 12 张 Gallery、4 位教师、31 位学生、13 位毕业生、135 条论文、4 篇新闻数量与顺序一致；
- 所有 `<img>` 的 `src` 在 `dist` 中可解析（无裂图），且带 `/nlp-home` base；
- 旧内容路径下的文件数量为 0，内容区不存在重复副本。

**主要风险与缓解**：

| 风险 | 缓解 |
|------|------|
| `image()` 生成的 URL 在 dev/build 的 base 处理不一致 | 构建后检查 HTML 的 `src` 是否以 `/nlp-home/_astro/` 开头且文件存在；dev 下逐页检查 Gallery / 教师照片；不使用 `withBase` 二次拼接 |
| 新闻图片移至 `content/` 后相对引用解析失败 | 迁移后立即 `npm run build`；Astro 内容资源管线以 Markdown 文件为基准解析；若失败，保持相对文件名不变并检查条目 `filePath` |
| `astro check` 未重新生成内容类型导致 `ImageMetadata` 类型错误 | 先运行 `npm run check` / `astro sync` 生成 `.astro` 类型，再修正类型 |
| Gallery / 教师顺序变化 | 序号目录 + 按 `entry.id` 排序；构建后逐项比对 caption / 姓名顺序 |
| 校验报错残留旧路径 | 迁移完成后全仓 `grep` 审计（排除 `specs/`、`node_modules/`、`dist/`、`.astro/`） |
| 图片视觉尺寸变化 | 不改变图片内容与固有比例；`TeacherCard` / `Gallery` 既有 CSS 尺寸与 `object-fit` 不变；九档视口实测 |

## Post-Design Constitution Re-evaluation

Phase 1 设计产物（[research.md](./research.md)、[data-model.md](./data-model.md)、[contracts/content-layout.md](./contracts/content-layout.md)、[contracts/validation.md](./contracts/validation.md)、[quickstart.md](./quickstart.md)）完成后重新评估：

| 原则 | 设计是否引入新风险 | 结论 |
|------|--------------------|------|
| I. 内容准确性 | 数据模型定义逐字段迁移与不变量；Quickstart 要求迁移前后比对 | PASS |
| II. 内容与展示分离 | 内容区契约禁止源码混入；条目图片与说明同目录 | PASS |
| III. 静态站点与 GitHub Pages | 未改构建 / 部署 / base 方案；图片仍为构建期静态资源 | PASS |
| IV. 简洁学术化设计 | 无视觉 / 模板 / 交互变更 | PASS |
| V. 最小复杂度 | 无新依赖；复用现有内容层与校验模式；不拆分无图片数据集 | PASS |
| VI. 无布局破损 | 契约要求图片原内容 / 原比例；Quickstart 覆盖九档视口 | PASS |

**Post-Design Gate 结论**：PASS，无新增违规，无需 Complexity Tracking。

## Complexity Tracking

> 本特性无 Constitution Check 违规项，无需填写。

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
