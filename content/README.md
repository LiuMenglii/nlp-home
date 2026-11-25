# 内容维护指南

本站所有日常内容都放在仓库根目录的 `content/` 里，`src/` 只放代码。**日常更新只需修改 `content/` 下的文件，不需要改动任何组件、页面或样式代码。** 修改后运行 `npm run build`（或直接推送），构建通过即自动生效。

## 内容位置一览

| 文件 / 目录 | 内容 | 对应页面 |
|-------------|------|----------|
| `site.json` | 站点品牌与命名信息（字段见下文「修改课题组名称 / 品牌信息」） | 顶栏品牌区、主页 Hero、页脚、标签页标题/描述、favicon |
| `teachers/` | 教师团队，一位教师一个条目目录（4 位） | 主页 Team、Team 页 |
| `students.json` | 在读学生 | Team 页 |
| `graduates.json` | 毕业生去向 | Team 页 |
| `publications.json` | 论文全列表 | 主页 Publications、发表页 |
| `news/` | 新闻，一文件一条；配图与文章同目录 | 新闻列表/详情、主页新闻概览 |
| `gallery/` | 组内活动照片，一张照片一个条目目录（≤12 张） | 主页 Gallery |

> `public/` 只放 `logo.svg`、`favicon.svg` 这类站点装饰资源；照片、教师头像、新闻配图一律放 `content/`，不要再放回 `public/`。

## 常见更新流程

### 新增一篇论文（publications.json）

在数组中追加一条（按习惯加在最前面）：

```json
{
  "title": "论文标题（与正式发表版本一致）",
  "venue": "会议或期刊名，如 ACL / Findings of EMNLP / IEEE TASLP",
  "year": 2026,
  "ccf": "A",
  "url": "https://arxiv.org/abs/xxxx.xxxxx",
  "date": "2026-07-15",
  "featured": true
}
```

字段规则：

- `title` / `venue` 必填；`year` 为 1980–2100 之间的整数。
- `ccf` 可填 `"A"` / `"B"` / `"C"`，无评级就删掉该字段（页面对应位置不显示徽标，不要写 `null`）。
- `url` 必须以 `https://` 开头；没有可靠链接就删掉该字段（纯文本展示）。
- `date` 为 `YYYY-MM-DD`；有 `url` 必须填写 `date`，没有 `url` 必须不要写 `date`。
- `featured` 仅用于主页「代表性论文」：设为 `true` 的条目按年份降序取前 8 条展示；可省略（等同 `false`）。

### 新增一条新闻（content/news/）

新建一个 Markdown 文件，文件名即网址 slug（小写字母、数字、连字符，如 `acl-2027-acceptances.md`）：

```markdown
---
title: "新闻标题"
date: 2027-05-01
summary: "一句话摘要（不超过 200 字符），显示在列表页和主页。"
---

正文支持标准 Markdown。需要配图时把图片放到同目录，
用相对文件名引用：![](photo.jpg)
```

- `date` 为发布日期，列表按它倒序排列；主页自动展示最新 5 条。
- 支持子目录：`content/news/lab-notes/probe.md` 发布为 `/news/lab-notes/probe/`。
- 配图必须与 `.md` 文件放在同一目录，用相对文件名引用，不要外链；文件缺失会导致构建失败（防止裂图）。
- 新闻详情页支持高亮块、BibTeX 引用块与表格块三种控件，完整语法、限制与排错见 [`docs/news-markdown-guide.md`](../docs/news-markdown-guide.md)。

### 新增 / 更换一位教师（content/teachers/）

一位教师一个条目目录，目录名是「两位数字序号 + 小写姓名拼音」，序号即展示顺序：

```text
content/teachers/05-zhang-san/
├── index.md
└── zhang-san.svg        # 照片，可选
```

`index.md` 的 frontmatter：

```yaml
---
name: 张三
title: Associate Professor
advisorRole: master
directions:
  - Natural Language Processing
  - Efficient LLM Applications
email: zhangsan@iie.ac.cn
ucasProfile: https://people.ucas.ac.cn/~zhangsan
homepage: null
photo: ./zhang-san.svg
bio: Associate Professor at IIE, CAS ...
---
```

字段规则：

- `name`、`title`、`advisorRole`（`"phd"` 博导 / `"master"` 硕导）、`directions`（英文研究方向，至少 1 项）必填。
- `email`、`ucasProfile`、`homepage`、`photo`、`bio` 可省略或写 `null`。
- `ucasProfile` 只放国科大（UCAS）个人资料页（页面标签 **UCAS Profile**）；`homepage` 只放教师本人维护的个人主页（页面标签 **Homepage**），**不要**把 UCAS 资料页填进 `homepage`。两者都必须以 `https://` 开头。
- `photo` 写 `./文件名`，照片必须放在该教师自己的条目目录里；没有照片写 `null` 或省略。
- 新增教师：复制一个已有条目目录，改目录序号、`index.md` 与照片文件名即可；页面按目录序号排序，新教师用下一个序号（如 `05-...`）。
- 更换照片：把新文件放进该教师条目目录，保持 `photo` 文件名一致（或同步修改 `photo`），其他教师不受影响。

### 新增 / 更换一张 Gallery 照片（content/gallery/）

一张照片一个条目目录，目录名是「两位数字序号 + 小写短名」，序号即展示顺序：

```text
content/gallery/13-emnlp-2027/
├── index.md
└── emnlp-2027.jpg
```

`index.md` 的 frontmatter：

```yaml
---
image: ./emnlp-2027.jpg
caption: "EMNLP 2027 · 北京"
date: "2027-11"          # 可选
---
```

字段规则：

- `image` 必填，写 `./文件名`，图片必须放在该条目自己的目录里（禁止 `/`、`..`、子目录或外链）。
- `caption` 必填，中文说明，同时作为图片替代文本与灯箱图注。
- `date` 可选，必须是带引号的字符串（如 `"2026-11"`、`"2024-06-23"`），保持原值展示。
- 图片要求：单张 ≤500KB、长边 ≤2000px、文件名小写字母+连字符。
- `gallery/` 上限 **12 条**，超出会构建失败（需要精选替换而非追加）。
- 新增照片：先删除或替换一条已有条目，再新建 `<序号-短名>/` 目录，放入图片与 `index.md`。
- 更换照片：只改该条目目录内的图片文件（并同步 `image` 文件名，如有变化），caption / 顺序不变。
- 删除照片：删除整个条目目录；其余条目顺序不变。

### 修改课题组名称 / 品牌信息（site.json）

| 字段 | 含义 |
|------|------|
| `instituteZh` | 机构中文名（中国科学院信息工程研究所），用于主页名栏机构从属链行与主页标题 |
| `lab` | 研究室归属（第六研究室/智能认知安全研究室），与 `instituteZh` 以 "·" 连接为名栏从属链行 |
| `groupName` | 课题组**中文名称**（不含品牌字），如「认知智能生成课题组」 |
| `alias` | 课题组别名（G3课题组），展示于主页名栏 |
| `fullName` | 课题组**英文全称**（Cognitive Intelligence with Generative and Multimodal Algorithms） |
| `navBrand` | 顶栏品牌文字（CIGMA） |
| `logo` / `favicon` | logo 与 favicon 的站内绝对路径（如 `/logo.svg`、`/favicon.svg`），文件必须已放入 `public/` |
| `institute` | 研究所中英文全称（页脚研究所行与 meta 描述） |
| `directions` | 研究方向标签（主页名栏） |
| `admissions` | Join Us 招募信息（英文申请文案 `admissions.apply` + 四项能力 + 邮箱） |

- 完整主名称（如「认知智能生成课题组 CIGMA」）由 `${groupName} ${navBrand}` 在各展示位（名栏主标题、页脚名称行、其余页标签标题）**组合派生**，因此**不设** `groupNameZh` 等冗余字段——改名只需改上表字段，全站自动生效。
- `logo` / `favicon` 指向 `public/` 中不存在的文件，或任一命名字段（`instituteZh`/`lab`/`groupName`/`alias`/`fullName`/`navBrand`）缺失/为空，都会**让构建失败**并指明字段与目标路径。

### 成员变动（students.json / graduates.json）

- 学生信息在 `students.json`：字段为 `name`、`level`（`"phd"` / `"master"`）、`directions`（研究方向字符串数组）、`url`（个人主页或机构个人资料页）、`github`（GitHub 主页）、`scholar`（Google Scholar 主页）。
- `directions` 为**至少 1 项**的字符串数组，每项必须是非空、非纯空白字符串；页面按数组顺序原样渲染为方向标签，不 trim、不去重。缺失、非数组、空数组或含空/空白/非字符串项会让 `npm run build` 失败并指出数据文件、学生姓名、`directions` 与项序号。
- 新学生默认写 `"directions": ["TBD"]`，待课题组提供真实研究方向后替换；`TBD` 是临时占位，不是真实方向。
- `url` / `github` / `scholar` 分别渲染为成员行内的 **Homepage** / **GitHub** / **Scholar** 标签；三者**三选一（至多填一个）**，同时填写两个及以上会让 `npm run check` 与 `npm run build` 失败并指出数据文件、成员姓名与全部冲突字段；三者皆空则不显示标签。
- 链接优先级：**自建个人主页（含 GitHub Pages 学术主页）→ 机构个人资料页 → GitHub → Google Scholar**；`url` 承载前两类（页面标签统一为 Homepage，两类都有时取自建主页）。所有链接必须以 `https://` 开头；无可靠来源时三个字段统一写 `null`，页面不显示链接标签。
- 学生毕业：从 `students.json` 移除，并在 `graduates.json` 添加 `name`、`destination`（去向单位中文名）、`degree`（`"phd"` / `"master"`）、`year`（毕业年份，可 `null`）、`url` / `github` / `scholar`（三选一，同上，均可省略）。
- 成员姓名在 ≥480px 的姓名列为 3.5em（约 3 个汉字宽）；4 字姓名会在列内换行为既定行为，更长的姓名需要另开变更调整列宽。
- 空数组 `[]` 合法：对应分组会显示英文占位文案（"coming soon"）。

## 构建校验与部署

```bash
npm run build     # 本地构建，校验所有内容格式
npm run preview   # 本地预览 http://localhost:4321/nlp-home/
```

- 所有内容错误（缺字段、链接不是 https、图片缺失、Gallery 超 12 张、新闻摘要超 200 字符、条目目录缺失 `index.md` 等）都会**让构建失败并指明 `content/` 下的文件、条目与字段**，按报错信息修改即可。
- 推送到 GitHub `main` 分支后，Actions 自动执行类型检查 + 构建，**构建失败不会上线**，线上保持上一正常版本。
- 部署地址与仓库配置见 `astro.config.mjs`（`site` / `base`）与 `.github/workflows/deploy.yml`。

## 上线前内容确认

含不确定信息（无法与官方来源核实的论文条目、毕业生去向推断等）的清单见 `specs/001-homepage-rebuild/content-review.md`，需课题组负责人确认后方可对外发布。
