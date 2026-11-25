# Content Layout Contract

**Feature**: [spec.md](../spec.md) | **Plan**: [plan.md](../plan.md) | **Data model**: [data-model.md](../data-model.md) | **Date**: 2026-11-24

**消费方**: 内容维护者、`src/content.config.ts` 校验实现、[quickstart.md](../quickstart.md) 验收。

本契约定义 `content/` 的目录结构、条目字段、图片规则与新增 / 替换 / 删除流程。任何违反本契约的内容都会让 `npm run check` 或 `npm run build` 失败。

## 1. 目录契约

```text
content/
├── README.md                         # 唯一维护指南；不含站点内容
├── site.json                         # 站点品牌信息（单对象）
├── students.json                     # 在读学生（数组）
├── graduates.json                    # 毕业生（数组）
├── publications.json                 # 论文（数组）
├── news/                             # 新闻；一文件一条
│   ├── <slug>.md
│   ├── <slug>/                        # 允许子目录
│   │   └── <slug>.md
│   └── <image files>                  # 与引用它的 .md 同目录
├── teachers/                         # 教师；一目录一条
│   └── <NN-slug>/
│       ├── index.md
│       └── <photo>                    # 可选；photo 有值时必须存在
└── gallery/                          # 照片；一目录一条
    └── <NN-slug>/
        ├── index.md
        └── <image>                    # 必填
```

**硬性规则**：

- `content/` 是唯一日常内容区；`src/` 下不得出现新闻 Markdown、新闻配图、Gallery / 教师照片，或学生 / 毕业生 / 论文 / 站点品牌数据文件。
- `public/` 只保留 `logo.svg`、`favicon.svg` 等站点装饰性资源；不得再出现 `public/gallery/`、`public/teachers/`。
- 旧位置不得保留内容副本；同一内容只能有一处事实来源。

## 2. 条目命名与顺序

- `<NN-slug>`：两位数字前缀 + 小写字母 / 数字 / 连字符，例如 `01-lin-zheng`、`12-yanqi-lake-library`。必须匹配 `^\d{2}-[a-z0-9-]+$`。
- 数字前缀即展示顺序：Gallery `01`–`12`、教师 `01`–`04`。
- 页面按 `entry.id` 字典序排序；两位前缀保证字典序与数值序一致。
- 新增条目默认追加到末尾（如 Gallery 当前 12 条已满，必须先删除或替换；教师新增用 `05-...`）。
- 调整顺序 = 调整目录名前缀；不得依赖文件系统返回顺序。

## 3. 教师条目契约

路径：`content/teachers/<NN-slug>/index.md` + 同目录照片。

```yaml
---
name: 林政
title: Professor
advisorRole: phd
directions:
  - Natural Language Processing
  - Multimodal Analysis
email: linzheng@iie.ac.cn
ucasProfile: https://people.ucas.ac.cn/~linzheng
homepage: null
photo: ./lin-zheng.svg
bio: Professor at IIE, CAS ...
---
```

| 字段 | 规则 |
|------|------|
| `name` | 必填，非空 |
| `title` | 必填，非空，英文职称 |
| `advisorRole` | 必填，`phd` 或 `master` |
| `directions` | 必填，至少 1 项非空字符串 |
| `email` | 可选；缺省或 `null` |
| `ucasProfile` | 可选；HTTPS 外链或 `null`；仅 UCAS 资料页 |
| `homepage` | 可选；HTTPS 外链或 `null`；仅个人主页，不得填 UCAS 资料页 |
| `photo` | 可选；`./文件名`，文件必须位于同一教师条目目录；`null` 或缺省表示无照片 |
| `bio` | 可选；简介 |

**替换照片**：把新文件放入该教师条目目录，更新 `photo` 文件名（或保持同名直接替换文件），无需改其他教师。

## 4. Gallery 条目契约

路径：`content/gallery/<NN-slug>/index.md` + 同目录图片。

```yaml
---
image: ./emnlp-2025-suzhou.jpg
caption: "EMNLP 2025 · 苏州"
date: "2026-11"        # 可选
---
```

| 字段 | 规则 |
|------|------|
| `image` | 必填；`./文件名`，文件必须位于同一 Gallery 条目目录 |
| `caption` | 必填，非空；兼作图片替代文本与灯箱图注 |
| `date` | 可选字符串；保持原值，如 `2026-11`、`2024-06-23` |

**约束**：

- 条目总数 0–12；超过 12 条构建失败（需精选替换，不能追加第 13 条）。
- 每个 `content/gallery/` 下的条目目录必须包含 `index.md`；不得只放图片。
- 新增照片：创建 `<NN-slug>/`，放入图片并新建 `index.md`，填写三个字段；如已达 12 条，先删除一条。
- 替换照片：只改该条目目录内的图片文件（并同步 `image` 文件名，如有变化）；caption / 顺序不变。
- 删除照片：删除该条目目录；其余条目顺序不变。

## 5. 新闻条目契约

路径：`content/news/**/*.md`，一文件一条；配图与引用它的 `.md` 同目录。

```markdown
---
title: "新闻标题"
date: 2027-05-01
summary: "一句话摘要（不超过 200 字符）。"
---

正文支持标准 Markdown。配图使用相对文件名引用：![](photo.jpg)
```

- `title` 非空；`date` 为发布日期；`summary` 不超过 200 字符（按 code point）；`cover` 为现有可选字段，当前未使用。
- 文件名（相对 `content/news/` 的路径去掉 `.md`）即详情页 URL：`content/news/acl-2025-spc-award.md` → `/news/acl-2025-spc-award/`；子目录 `content/news/lab-notes/probe.md` → `/news/lab-notes/probe/`。
- 配图必须同目录、用相对文件名引用；不得外链、不得引用其他文章目录的图片。
- 高亮块、BibTeX 引用块、表格块的语法与限制见 `docs/news-markdown-guide.md`。

## 6. 数据集契约

### 6.1 `content/students.json`

顶层数组；字段 `name`、`level`（`phd` / `master`）、`directions`（至少 1 项非空字符串）、`url` / `github` / `scholar`（HTTPS，三选一，至多一个非空）。数组顺序即页面顺序。

### 6.2 `content/graduates.json`

顶层数组；字段 `name`、`destination`、`degree`（`phd` / `master`）、`year`（数字或 `null`）、`url` / `github` / `scholar`（HTTPS，三选一）。页面按既有规则排序，不依赖数组顺序。

### 6.3 `content/publications.json`

顶层数组；字段 `title`、`venue`、`year`（1980–2100 整数）、`date`（`YYYY-MM-DD`，与 `url` 成对出现 / 省略）、`ccf`（`A` / `B` / `C`，无评级时省略）、`url`（HTTPS，缺省时省略）、`featured`（布尔，可省略）、`authors`（可选）。

### 6.4 `content/site.json`

单对象；字段与校验见 [data-model.md §3](../data-model.md)。`logo` / `favicon` 为站内绝对路径（如 `/logo.svg`），文件必须位于 `public/`。

## 7. 图片规则

- **同目录**：条目图片必须与 `index.md` 位于同一目录；`image` / `photo` 值只能是 `./文件名`，禁止 `/`、`..`、子目录或外链。
- **文件名**：小写字母、数字、连字符，保留原扩展名（`.jpg` / `.jpeg` / `.png` / `.webp` / `.gif` / `.svg` / `.avif` / `.apng`）。
- **Gallery / 教师照片**：单张 ≤500KB；Gallery 长边 ≤2000px；教师照片建议 JPEG / SVG。
- **新闻配图**：单张 ≤500KB；推荐源图宽度不超过正文内容宽度（桌面约 1132px，2 倍屏约 2264px）。
- **构建行为**：图片经 Astro 资源管线输出为带哈希的站内 URL，访问路径可与迁移前不同；文件缺失或路径非法即构建失败。
- **不得**把图片复制到 `public/` 后再引用；`content/` 内图片是唯一来源。

## 8. 新增 / 替换 / 删除流程

### 8.1 新增一篇新闻

1. 在 `content/news/`（或已有子目录）新建 `<slug>.md`；
2. 填写 frontmatter，正文使用 Markdown；
3. 配图放入同一目录，用相对文件名引用；
4. 运行 `npm run build`，确认无控件硬错误、无图片缺失。

### 8.2 新增一位教师

1. 在 `content/teachers/` 新建 `<NN-slug>/`（序号接续，两位数字）；
2. 放入照片，新建 `index.md` 并填写全部字段，`photo: ./<文件名>`；
3. 运行 `npm run build`，确认 Team 页与首页教师名片出现该教师，顺序符合预期。

### 8.3 新增一张 Gallery 照片

1. 当前 12 条已满：先删除或替换一条；
2. 新建 `content/gallery/<NN-slug>/`，放入图片与 `index.md`（`image` / `caption` / 可选 `date`）；
3. 运行 `npm run build`；确认 12 条上限与展示顺序。

### 8.4 替换图片 / 修改说明

- 只改对应条目目录内的文件与 `index.md`；不得改其他条目。
- Gallery：caption / 顺序保持不变；教师：其他教师与图库不受影响。
- 新闻：替换同目录配图或修改 Markdown，构建后仅该篇变化。

### 8.5 删除条目

- 删除整个条目目录（Gallery / 教师）或 `.md` 文件（新闻）。
- Gallery 删除后其余条目序号可保持不变（允许不连续），页面按剩余 id 排序。
- 删除后运行 `npm run build`，确认无残留引用。

## 9. 路径与 URL 契约

| 内容 | 构建后 URL | 是否变化 |
|------|------------|----------|
| 新闻详情 | `/news/<entry.id>/` | 不变（4 篇既有 URL 必须一致） |
| 新闻子目录 | `/news/<subdir>/<slug>/` | 不变 |
| Gallery 图片 | Astro 哈希资源 URL（`/_astro/...`，带 `base`） | 允许变化 |
| 教师照片 | Astro 哈希资源 URL（`/_astro/...`，带 `base`） | 允许变化 |
| 新闻配图 | Astro 内容资源 URL（带 `base`） | 允许变化 |
| logo / favicon | `/logo.svg`、`/favicon.svg`（带 `base`） | 不变 |

## 10. 禁止事项

- 在 `src/` 下新增或保留新闻 Markdown、新闻配图、Gallery / 教师照片、成员 / 论文 / 站点品牌数据文件。
- 在 `content/` 中放组件、页面、样式、构建脚本或 Markdown 控件代码。
- 在条目目录之外登记图片路径，或使用绝对路径 / `..` / 子目录引用条目图片。
- 修改旧 `specs/001`–`014` 的历史路径（历史归档不回溯）。
- 新增依赖或改动 `astro.config.mjs` 的 `site` / `base`、`deploy.yml` 的功能步骤。
