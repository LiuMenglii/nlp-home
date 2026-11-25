# Phase 1 Data Model: 项目内容结构重构

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Research**: [research.md](./research.md) | **Date**: 2026-11-24

本特性不改变任何内容字段的值，只改变内容的存放位置、条目组织方式与加载路径。以下实体描述迁移后的目标模型；字段约束与迁移前的 schema / 校验保持一致。

## 1. 实体关系

```text
content/（Content Area）
├── site.json                 → SiteBrand（1）
├── students.json             → Student[]（31）
├── graduates.json            → Graduate[]（13）
├── publications.json         → Publication[]（135）
├── news/<path>.md            → NewsEntry[]（4），每篇可带同目录 NewsAsset（3）
├── teachers/<NN-slug>/       → TeacherEntry[]（4）
│   ├── index.md              → 字段
│   └── <photo>               → TeacherPhoto（1，可选）
└── gallery/<NN-slug>/        → GalleryEntry[]（12）
    ├── index.md              → image / caption / date
    └── <image>               → GalleryPhoto（1）

public/（站点装饰性静态资源）
├── logo.svg                  → BrandAsset
└── favicon.svg               → BrandAsset
```

- 一个 `TeacherEntry` 至多引用一张同目录照片；一个 `GalleryEntry` 必须引用一张同目录照片。
- 一篇 `NewsEntry` 可引用零或多张同目录配图；当前 3 篇带 1 张配图，1 篇无配图。
- `SiteBrand` 引用 `public/` 下的 `BrandAsset`，但不把品牌资源视为日常内容条目。

## 2. Content Area（内容区）

| 属性 | 值 |
|------|-----|
| 根路径 | `content/`（仓库根目录） |
| 必须存在 | `README.md`、`site.json`、`students.json`、`graduates.json`、`publications.json`、`news/`、`teachers/`、`gallery/` |
| 禁止 | 构建逻辑、组件、页面、样式、Markdown 控件代码 |
| 唯一事实来源 | 每条内容只存在于 `content/` 一处；旧位置不得保留副本 |
| 维护入口 | `content/README.md`（唯一维护指南） |

## 3. SiteBrand（站点品牌信息）— `content/site.json`

单对象 JSON，直接 import，不转为 collection。

| 字段 | 类型 | 必填 | 约束 / 说明 |
|------|------|------|-------------|
| `instituteZh` | string | ✓ | 非空，机构中文名 |
| `lab` | string | ✓ | 非空，研究室归属 |
| `groupName` | string | ✓ | 非空，课题组中文名 |
| `alias` | string | ✓ | 非空，课题组别名 |
| `fullName` | string | ✓ | 非空，英文全称 |
| `navBrand` | string | ✓ | 非空，顶栏品牌文字 |
| `logo` | string | ✓ | 以 `/` 开头、不含 `..` 的站内绝对路径；目标文件必须存在于 `public/` |
| `favicon` | string | ✓ | 同上 |
| `institute` | string | ✓ | 研究所中英文全称（展示字段，当前校验覆盖命名相关字段） |
| `directions` | string[] | ✓ | 研究方向标签，按数组顺序渲染 |
| `admissions` | object | ✓ | `apply`（string）、`skills`（string[]）、`email`（string） |

**校验**：沿用 `validateSiteBrand()`；文件路径改为 `content/site.json`，`logo` / `favicon` 仍以 `public/` 为资源根。报错必须指出 `content/site.json` 与具体字段。

## 4. TeacherEntry（教师条目）— `content/teachers/<NN-slug>/`

| 属性 | 类型 | 必填 | 约束 / 说明 |
|------|------|------|-------------|
| `id` | string | ✓ | 目录名，匹配 `^\d{2}-[a-z0-9-]+$`；去掉 `index.md` 后由 glob loader 生成 |
| `order` | number | ✓ | 由目录名前两位数字派生；`01`–`04`，排序用 |
| `name` | string | ✓ | 非空，教师姓名 |
| `title` | string | ✓ | 非空，英文职称 |
| `advisorRole` | `'phd'` \| `'master'` | ✓ | 导师角色 |
| `directions` | string[] | ✓ | 至少 1 项 |
| `email` | string \| null | — | 邮箱；缺省或 null 合法 |
| `ucasProfile` | string \| null | — | HTTPS 外链；缺省或 null 合法 |
| `homepage` | string \| null | — | HTTPS 外链；缺省或 null 合法；不得填 UCAS 资料页 |
| `photo` | ImageMetadata \| null | — | 同目录相对路径 `./文件名`；缺省 / null 表示无照片；有值时文件必须存在 |
| `bio` | string \| null | — | 简介；缺省或 null 合法 |

**关系**：`photo` 指向同一条目目录内的图片文件，不跨目录。

**排序**：`getCollection('teachers')` 按 `entry.id` 字典序升序，得到迁移前数组顺序：
`01-lin-zheng`（林政）→ `02-fu-peng`（付鹏）→ `03-wu-dayan`（吴大衍）→ `04-gu-jingzi`（谷井子）。

**迁移字段映射**：旧 `teachers.json` 的每个字段原值写入对应 `index.md` frontmatter；`photo` 由 `/teachers/<file>` 改为 `./<file>`。

## 5. GalleryEntry（Gallery 条目）— `content/gallery/<NN-slug>/`

| 属性 | 类型 | 必填 | 约束 / 说明 |
|------|------|------|-------------|
| `id` | string | ✓ | 目录名，匹配 `^\d{2}-[a-z0-9-]+$`；glob loader 生成 |
| `order` | number | ✓ | 目录名前两位数字；`01`–`12`，迁移前数组顺序 |
| `image` | ImageMetadata | ✓ | 同目录相对路径 `./文件名`；文件必须存在，禁止 `/` 子目录与 `..` |
| `caption` | string | ✓ | 非空，中文说明，兼作 `<img alt>` 与灯箱图注 |
| `date` | string | — | 可选；当前值形如 `2026-11`、`2024-06-23`，保持原字符串 |

**关系**：`image` 指向同一条目目录内的图片文件。

**排序**：按 `entry.id` 字典序升序，得到迁移前 `gallery.json` 数组顺序（`01`–`12`）。

**约束**：条目总数 12；超过 12 条构建失败。每个目录必须包含 `index.md`；`image` 必填。

**迁移字段映射**：旧 `gallery.json` 的 `src` → frontmatter `image: ./<src>`；`caption` / `date` 原值保留；原图 `public/gallery/<src>` 迁入条目目录。

## 6. NewsEntry（新闻条目）— `content/news/**/*.md`

| 属性 | 类型 | 必填 | 约束 / 说明 |
|------|------|------|-------------|
| `id` | string | ✓ | 相对 `content/news/` 的路径去掉 `.md` 并 slug 化；如 `acl-2025-spc-award`、`lab-notes/probe` |
| `title` | string | ✓ | 非空 |
| `date` | Date | ✓ | frontmatter 日期，列表倒序依据 |
| `summary` | string | ✓ | 非空；按 code point 计不超过 200 字符 |
| `cover` | string | — | 现有 schema 可选字段，当前未使用；保持不变 |
| `body` | string | ✓ | Markdown 正文；可含同目录相对图片引用与控件语法 |

**关系**：正文图片与 Markdown 同目录，使用相对文件名引用（如 `rlsd-method.png`），不跨目录、不外链。

**URL 规则**：`entry.id` 直接映射为 `/news/<id>/`；`content/news/` 迁移不改变相对路径，因此 4 个既有 URL 不变；子目录继续派生为 `/news/<subdir>/<slug>/`。

**专项校验**：`self-taught-rlvr-2026.md` 的标题 CJK 上限 40、标题原创性、摘要 80–200 字符、摘要不得含控件语法，继续作用于 `content/news/self-taught-rlvr-2026.md`。

## 7. Student（在读学生）— `content/students.json`

顶层数组，31 条，字段与迁移前一致：

| 字段 | 类型 | 必填 | 约束 |
|------|------|------|------|
| `name` | string | ✓ | 非空 |
| `level` | `'phd'` \| `'master'` | ✓ | 学位层次 |
| `directions` | string[] | ✓ | 至少 1 项；每项非空、非纯空白 |
| `url` | string \| null | — | HTTPS 外链 |
| `github` | string \| null | — | HTTPS 外链 |
| `scholar` | string \| null | — | HTTPS 外链 |
| `url` / `github` / `scholar` | — | — | 三选一（至多一个非空） |

**id**：`jsonArrayParser` 按数组下标注入 `stu-001`…；数组顺序即页面顺序。

## 8. Graduate（毕业生）— `content/graduates.json`

顶层数组，13 条，字段与迁移前一致：

| 字段 | 类型 | 必填 | 约束 |
|------|------|------|------|
| `name` | string | ✓ | 非空 |
| `destination` | string | ✓ | 非空，去向单位 |
| `degree` | `'phd'` \| `'master'` | ✓ | 学位 |
| `year` | number \| null | — | 毕业年份；可缺省或 null |
| `url` / `github` / `scholar` | string \| null | — | HTTPS，三选一 |

**id**：`gra-001`…；页面排序规则不变（毕业年份降序 → PhD 先于 Master → 无年份最后 → id 字典序 tiebreak）。

## 9. Publication（论文）— `content/publications.json`

顶层数组，135 条，字段与迁移前一致：

| 字段 | 类型 | 必填 | 约束 |
|------|------|------|------|
| `title` | string | ✓ | 非空 |
| `venue` | string | ✓ | 非空 |
| `year` | number | ✓ | 1980–2100 整数 |
| `date` | string | — | `YYYY-MM-DD` 合法日历日期；有 `url` 时必须存在，无 `url` 时必须不存在 |
| `ccf` | `'A'` \| `'B'` \| `'C'` | — | 无评级时省略字段，不得为 null |
| `url` | string | — | HTTPS；缺省时省略字段 |
| `featured` | boolean | — | 缺省 `false` |
| `authors` | string[] | — | 可选 |
| `_jsonParseError` | string | — | 仅解析错误载体，正常条目不得出现 |

**id**：`pub-001`…；页面排序规则不变（年份降序 → id 字典序；发表页组内 date 降序 → 标题字典序）。

## 10. BrandAsset（站点品牌资源）

| 属性 | 值 |
|------|-----|
| 路径 | `public/logo.svg`、`public/favicon.svg` |
| 引用 | `content/site.json` 的 `logo` / `favicon` 站内绝对路径 |
| 约束 | 文件必须存在；不得放入 `content/` 条目体系；不参与日常内容编辑流程 |

## 11. ContentValidation（内容校验）

构建期校验分为三层：

1. **模块加载期**（`src/content.config.ts`）：品牌字段 / 资源、学生 directions、特定新闻规则、Gallery 条目目录与资产审计、教师条目资产审计。
2. **Schema 层**：各 collection 字段类型、枚举、HTTPS、摘要长度、论文 URL/date 配对、链接三选一、`image()` 文件解析。
3. **构建前预渲染**（`astro.config.mjs`）：新闻控件硬错误。

任一违约必须中断 `astro check` / `astro build`；报错必须指向 `content/` 中的文件 / 条目 / 字段，且不得引用旧路径。规则细节见 [contracts/validation.md](./contracts/validation.md)。

## 12. 迁移映射与不变量

### 12.1 路径映射

| 迁移前 | 迁移后 |
|--------|--------|
| `src/data/site.json` | `content/site.json` |
| `src/data/students.json` | `content/students.json` |
| `src/data/graduates.json` | `content/graduates.json` |
| `src/data/publications.json` | `content/publications.json` |
| `src/data/gallery.json` 第 N 条 + `public/gallery/<src>` | `content/gallery/<NN-slug>/index.md` + 同目录 `<src>` |
| `src/data/teachers.json` 第 N 条 + `public/teachers/<file>` | `content/teachers/<NN-slug>/index.md` + 同目录 `<file>` |
| `src/content/news/<path>.md` | `content/news/<path>.md` |
| `src/content/news/<image>` | `content/news/<image>` |
| `src/data/README.md` | `content/README.md`（改写） |

### 12.2 不变量

- 内容数量：Gallery 12、教师 4、学生 31、毕业生 13、论文 135、新闻 4、品牌信息 1。
- 内容顺序：Gallery 与教师按目录序号；学生按 JSON 数组；毕业生 / 论文按既有排序规则。
- 内容值：所有字符串、链接、布尔、年份、图片内容与文件名保持原值（教师 / Gallery 的图片字段仅由绝对 public 路径改为同目录相对路径）。
- 新闻 URL：4 个既有 URL 零变化。
- 单一事实来源：旧目录内容文件数量为 0，`content/` 中不存在重复副本。
- 页面可见性：组件模板、CSS、路由、Markdown 控件行为不变。
