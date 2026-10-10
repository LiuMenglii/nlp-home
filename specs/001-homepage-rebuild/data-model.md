# Data Model: 001-homepage-rebuild (Phase 1)

**Date**: 2026-10-10 | **Source entities**: spec.md「Key Entities」| **Implementation**: Astro Content Collections（`src/content.config.ts`）

数据分两类：
- **Collection 数据**（经 Zod schema 构建期校验）：news（glob loader, Markdown）、publications / teachers / students / graduates / gallery（file loader, JSON）
- **直接 import 数据**（不入 collection）：site.json（课题组元信息 + 招募，低频更新）

---

## 1. Publication（论文）— `src/data/publications.json`

file loader collection：`publications`。JSON 顶层数组，每元素一个 entry。

| 字段 | 类型 | 必填 | 校验规则 | 说明 |
|------|------|------|----------|------|
| `title` | string | ✓ | 非空 | 论文标题（英文原文） |
| `venue` | string | ✓ | 非空 | 发表地点（会议/期刊 + 年份信息，如 "ACL 2024"、"IEEE TPAMI"） |
| `year` | number | ✓ | int，1980–2100 | 用于年份分组与排序 |
| `ccf` | enum `"A"\|"B"\|"C"` | ✗ | 缺省/null = 无评级 | 无评级（arXiv/Findings/SCI/中文期刊）不显示徽标 |
| `url` | string (url) | ✗ | 合法 https URL | arXiv 优先；回退 DOI/出版方/scholar；均无则缺省 → 纯文本展示 |
| `featured` | boolean | ✗ | 缺省 false | 主页"代表性 publications"选取标志 |
| `authors` | string[] | ✗ | 可空数组 | 展示用（可选） |

**Zod schema（要点）**:

```ts
z.object({
  title: z.string().min(1),
  venue: z.string().min(1),
  year: z.number().int().min(1980).max(2100),
  ccf: z.enum(['A', 'B', 'C']).optional().nullable(),
  url: z.string().url().startsWith('https://').optional().nullable(),
  featured: z.boolean().optional().default(false),
  authors: z.array(z.string()).optional(),
})
```

**派生规则**: 发表页按 `year` 降序分组渲染；主页按时间降序取 `featured === true` 前 8 条（时间即 `year` 字段；选取、截断与展示顺序一致；不足则按时间最新补齐，2026-10-10 澄清回填）；渲染时 `url` 为空 → 不可点击纯文本；`url` 存在时链接文字统一为 "Link"（不以 arXiv/DOI/出版方类型区分标注）。

**数据口径**（2026-10-10 澄清回填）: 书目事实（标题/发表地点/年份）以正式发表版本为准；范围为两位老师 UCAS 主页论文列表的去重合集，去重以论文标题为准、忽略大小写；CCF 评级以两位老师 UCAS 主页标注为准（论文发表时的评级），Workshop、poster、short paper 不计入评级；预印本与正式版并存时以正式版信息为准；条目上线前与正式发表版本（DOI / 会议论文集 / 期刊页面）核对，无法核实的条目先向课题组负责人确认、确认后方可上线（FR-010 上线门禁，2026-10-10 澄清回填）。

**Relationships**: 无引用关系（venue 为纯字符串，不做规范化实体——百余篇规模下 YAGNI）。

---

## 2. NewsItem（新闻）— `src/content/news/*.md`

glob loader collection：`news`。每条新闻一个 Markdown 文件；entry id = 文件名（去扩展名，即详情页 URL slug）。

**Frontmatter schema**:

| 字段 | 类型 | 必填 | 校验规则 | 说明 |
|------|------|------|----------|------|
| `title` | string | ✓ | 非空 | 新闻标题 |
| `date` | date | ✓ | `z.coerce.date()` | 发布日期（非事件发生日期，由维护者手动填写）；排序键（时间倒序） |
| `summary` | string | ✓ | 非空，≤200 字符 | 列表页/主页概览摘要 |
| `cover` | string | ✗ | 图片相对路径 | 预留（v1 列表不显示封面，YAGNI） |

**正文 body**: Markdown 渲染为详情页内容；配图用 `![alt](./img.png)` 相对路径（图片缺失 → 构建报错）；简讯类新闻正文即简讯本身（spec 边缘用例）。

**派生规则**: 新闻列表与主页概览均按 `date` 倒序；主页取前 5 条。

**Identity**: 文件名即 slug（`news/[id].astro` 的 `getStaticPaths` 参数）；新增新闻不得重名。

---

## 3. Teacher（老师）— `src/data/teachers.json`

file loader collection：`teachers`。JSON 顶层数组（5 个 entry，顺序即展示顺序）。

| 字段 | 类型 | 必填 | 校验规则 | 说明 |
|------|------|------|----------|------|
| `name` | string | ✓ | 非空 | 姓名（中文/英文按权威来源） |
| `title` | string | ✓ | 非空 | 职称（英文存储与展示：Professor / Associate Professor / Senior Engineer） |
| `advisorRole` | enum `"phd"\|"master"` | ✓ | — | 博导/硕导 |
| `directions` | string[] | ✓ | ≥1 项 | 研究方向 |
| `email` | string | ✗ | 合法邮箱 | 联系邮箱（FR-009；有则展示） |
| `homepage` | string (url) | ✗ | https | 外部个人主页（UCAS 等；有则新标签打开） |
| `photo` | string | ✗ | `public/` 下路径 | 照片（授权前可占位） |
| `bio` | string | ✗ | — | 简介段落（人员页详情用） |

**数据源约束**（Constitution I）: 内容以 PPT 口径为准——林政（研究员/博导/NLP·多模态）、王伟平（研究员/博导/信工所副所长/大数据AI·数据安全）、付鹏（副研究员/硕导/NLP·大模型高效应用）、吴大衍（副研究员/硕导/CV·多模态）、谷井子（高级工程师/硕导/CV·多模态检索生成）；`title` 字段以英文存储（Professor / Associate Professor / Senior Engineer，FR-016）；上线前与 UCAS 主页核对；行政职务（如信工所副所长）经 `bio` 字段展示，不入 `title`（2026-10-10 澄清回填）。

---

## 4. Member（在读学生）— `src/data/students.json`

file loader collection：`students`。

| 字段 | 类型 | 必填 | 校验规则 | 说明 |
|------|------|------|----------|------|
| `name` | string | ✓ | 非空 | 姓名 |
| `level` | enum `"phd"\|"master"` | ✓ | — | 分组键（博士生/硕士生两组渲染） |
| `grade` | string | ✗ | — | 年级（如 "2024级"） |
| `url` | string (url) | ✗ | https | 个人主页（可选） |
| `note` | string | ✗ | — | 备注（可选） |

**派生规则**: 渲染时按 `level` 分两组，组内按 `grade` 降序。

## 5. Graduate（毕业生）— `src/data/graduates.json`

file loader collection：`graduates`。

| 字段 | 类型 | 必填 | 校验规则 | 说明 |
|------|------|------|----------|------|
| `name` | string | ✓ | 非空 | 姓名 |
| `destination` | string | ✓ | 非空 | 去向（升学单位或就业单位） |
| `degree` | enum `"phd"\|"master"` | ✓ | — | 学位类别（可选分组展示） |
| `year` | number | ✗ | int | 毕业年份（可选排序） |

## 6. GalleryPhoto（活动照片）— `src/data/gallery.json` + `public/gallery/`

file loader collection：`gallery`。

| 字段 | 类型 | 必填 | 校验规则 | 说明 |
|------|------|------|----------|------|
| `src` | string | ✓ | `public/gallery/` 下文件名（禁止 `/`、`..`）；构建期校验文件存在（`z.refine` + `fs.existsSync`，缺失即构建失败并定位文件与字段） | 图片文件 |
| `caption` | string | ✓ | 非空 | 说明文字（lightbox 与缩略图 alt） |
| `date` | string | ✗ | — | 拍摄日期/活动日期（可选展示） |

**资产约束**: 精选 8–12 张（FR-017；8 张为建议下限，不强制）；JPEG，单张 ≤500KB，长边 ≤2000px；数量为 0 → 主页隐藏 Gallery 区块（spec 边缘用例）；超过 12 张 → Zod schema `.max(12)` 强制，构建报错（2026-10-10 澄清回填）；`src` 引用 `public/gallery/` 中不存在的文件 → 构建报错（Zod refine 存在性校验，spec 边缘用例"照片文件缺失不渲染裂图"）。

---

## 7. SiteInfo（站点元信息+招募）— `src/data/site.json`（直接 import，非 collection）

| 字段 | 类型 | 说明 |
|------|------|------|
| `groupName` | string | 课题组名称（G3 CIGMA，2026-10-10 确认） |
| `institute` | string | 所属研究所（中国科学院信息工程研究所 / Institute of Information Engineering, CAS） |
| `directions` | string[] | 研究方向总结（自然语言处理、多媒体大数据分析、大模型高效应用） |
| `admissions.targets` | string | 招募面向对象（中文关键信息，FR-016） |
| `admissions.skills` | string[] | 技能要点（Coding/Math/Logic/English） |
| `admissions.email` | string | linzheng@iie.ac.cn（mailto 链接） |
| `admissions.emailSubject` | string | 邮件主题格式（"XXX-学校-毕业时间-保研/实习申请"） |

**说明**: 单对象 JSON、更新频率极低（组名/邮箱级别），直接 `import site from '../data/site.json'` 使用；字段约定在文件内以 JSON 无注释的替代方式（README 或 data-model 本节）说明。展示错误风险由模板直接引用字段即可见，不需构建期强制。

---

## 校验与失败行为总表（spec 边缘用例映射）

| 边缘用例 | 机制 |
|----------|------|
| 数据文件字段缺失/格式错误 | Zod schema → `astro build` 失败，错误定位到文件与字段 |
| 论文无 CCF | `ccf` 可空 → CCFBadge 不渲染 |
| 论文无 arXiv | `url` 可空 → 纯文本；有回退链接则存回退 URL |
| 简讯类新闻 | body 即简讯，详情页直接渲染 |
| Gallery 为空 | `gallery` collection 空 → 主页隐藏区块（组件条件渲染） |
| Gallery 照片文件缺失/路径错误 | `src` Zod refine + `fs.existsSync` 存在性校验 → 构建报错、错误定位到文件与字段，不渲染裂图 |
| 学生/毕业生名单为空 | 人员页对应分组显示友好占位文案（不隐藏区块，2026-10-10 澄清回填） |
| 新闻配图缺失 | Markdown 相对路径图片缺失 → 构建报错 |
| 列表规模大 | `year` 分组 + 锚点导航（零 JS） |

## 状态转换

无动态状态（纯静态内容数据，无生命周期转换）。
