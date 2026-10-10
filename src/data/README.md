# 数据维护指南

本站所有页面内容均由 `src/data/` 下的数据文件与 `src/content/news/` 下的新闻 Markdown 驱动。**日常更新只需修改这些文件，不需要改动任何组件或页面代码。** 修改后运行 `npm run build`（或直接推送），构建通过即自动生效。

## 数据文件一览

| 文件 | 内容 | 对应页面 |
|------|------|----------|
| `site.json` | 组名、研究所、研究方向、招募信息 | 主页 Hero / 招募区块、页脚 |
| `teachers.json` | 教师团队（5 位） | 主页 People、人员页 |
| `students.json` | 在读学生 | 人员页 |
| `graduates.json` | 毕业生去向 | 人员页 |
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

### 成员变动（teachers / students / graduates）

- 教师信息改动 `teachers.json`：`name`、`title`（英文职称）、`advisorRole`（`"phd"` 博导 / `"master"` 硕导）、`directions`（英文研究方向，至少 1 项）、`email`、`homepage`（https 链接或 `null`）、`photo`、`bio`。
- 学生入学/毕业：在 `students.json` 增删条目，字段为 `name`、`level`（`"phd"` / `"master"`）、`grade`（入学年份字符串，如 `"2025"`）、`url`（个人主页或 GitHub，可 `null`）、`note`。
- 学生毕业：从 `students.json` 移除，并在 `graduates.json` 添加 `name`、`destination`（去向单位中文名）、`degree`（`"phd"` / `"master"`）、`year`（毕业年份，可 `null`）。
- 空数组 `[]` 合法：对应分组会显示"名单待更新"占位文案。

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
