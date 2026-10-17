# 数据维护指南

本站所有页面内容均由 `src/data/` 下的数据文件与 `src/content/news/` 下的新闻 Markdown 驱动。**日常更新只需修改这些文件，不需要改动任何组件或页面代码。** 修改后运行 `npm run build`（或直接推送），构建通过即自动生效。

## 数据文件一览

| 文件 | 内容 | 对应页面 |
|------|------|----------|
| `site.json` | 站点品牌与命名信息（字段说明见下文「修改课题组名称 / 品牌信息」） | 顶栏品牌区、主页 Hero、页脚、标签页标题/描述、favicon |
| `teachers.json` | 教师团队（5 位） | 主页 Team、Team 页 |
| `students.json` | 在读学生 | Team 页 |
| `graduates.json` | 毕业生去向 | Team 页 |
| `publications.json` | 论文全列表 | 主页 Publications、发表页 |
| `gallery.json` | 组内活动照片（≤12 张） | 主页 Gallery |
| `../content/news/*.md` | 新闻（一文件一条） | 新闻列表/详情、主页新闻概览 |

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
  "featured": true
}
```

字段规则：
- `title` / `venue` 必填；`year` 为 1980–2100 之间的整数。
- `ccf` 可填 `"A"` / `"B"` / `"C"`，无评级就删掉该字段（页面对应位置不显示徽标）。
- `url` 必须以 `https://` 开头；没有可靠链接就删掉该字段（纯文本展示）。
- `featured` 仅用于主页"代表性论文"：设为 `true` 的条目按年份降序取前 8 条展示；可省略（等同 `false`）。

### 新增一条新闻（src/content/news/）

新建一个 Markdown 文件，文件名即网址 slug（小写字母、数字、连字符，如 `acl-2027-acceptances.md`）：

```markdown
---
title: "新闻标题"
date: 2027-05-01
summary: "一句话摘要（不超过 200 字符），显示在列表页和主页。"
---

正文支持标准 Markdown。需要配图时把图片放到同目录，
用相对路径引用：![](photo.jpg)
```

- `date` 为发布日期，列表按它倒序排列；主页自动展示最新 5 条。
- 配图必须与 .md 文件放在同一目录（`src/content/news/`）并用相对路径引用；文件缺失会导致构建失败（防止裂图）。

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

### 成员变动（teachers / students / graduates）

- 教师信息改动 `teachers.json`：`name`、`title`（英文职称）、`advisorRole`（`"phd"` 博导 / `"master"` 硕导）、`directions`（英文研究方向，至少 1 项）、`email`、`homepage`（https 链接或 `null`）、`photo`、`bio`。
- 更换老师照片：把图片（建议 JPEG，≤500KB）放入 `public/teachers/`，再更新 `teachers.json` 对应条目的 `photo`（`/teachers/文件名` 路径）；当前为占位图，待课题组提供授权照片后替换。
- 学生入学/毕业：在 `students.json` 增删条目，字段为 `name`、`level`（`"phd"` / `"master"`）、`grade`（入学年份字符串，如 `"2025"`）、`url`（个人主页或 GitHub，可 `null`）、`note`。
- 学生毕业：从 `students.json` 移除，并在 `graduates.json` 添加 `name`、`destination`（去向单位中文名）、`degree`（`"phd"` / `"master"`）、`year`（毕业年份，可 `null`）。
- 空数组 `[]` 合法：对应分组会显示英文占位文案（"coming soon"）。

### 更换 / 新增照片

1. 把 JPEG 图片放入 `public/gallery/`：**单张 ≤500KB、长边 ≤2000px、文件名小写字母+连字符**（如 `team-building-2027.jpg`）。
2. 在 `gallery.json` 中登记：`src`（文件名，不带路径）、`caption`（中文说明，兼作图片替代文本）、`date`（可选，`YYYY-MM-DD`）。
3. `gallery.json` 上限 **12 条**，超出会构建失败（需要精选替换而非追加）。
4. 引用 `public/gallery/` 中不存在的文件同样会构建失败——请先放图片、再改 JSON。

## 构建校验与部署

```bash
npm run build     # 本地构建，校验所有数据格式
npm run preview   # 本地预览 http://localhost:4321/nlp-home/
```

- 所有数据错误（缺字段、链接不是 https、图片缺失、gallery 超 12 张、新闻摘要超 200 字符等）都会**让构建失败并指明文件与字段**，按报错信息修改即可。
- 推送到 GitHub `main` 分支后，Actions 自动执行类型检查 + 构建，**构建失败不会上线**，线上保持上一正常版本。
- 部署地址与仓库配置见 `astro.config.mjs`（`site` / `base`）与 `.github/workflows/deploy.yml`。

## 上线前内容确认

含不确定信息（无法与官方来源核实的论文条目、毕业生去向推断等）的清单见 `specs/001-homepage-rebuild/content-review.md`，需课题组负责人确认后方可对外发布。
