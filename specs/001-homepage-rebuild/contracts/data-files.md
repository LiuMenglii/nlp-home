# Contract: 维护者数据文件（data-files.md）

**Date**: 2026-10-10 | **消费方**: 课题组内容维护者（不熟悉前端开发）

**核心约定（Constitution II / FR-012 / SC-004）**: 常规内容更新只改 `src/data/*.json` 或新增 `src/content/news/*.md`，10 分钟内完成，MUST NOT 修改 `src/components/`、`src/pages/`、`src/styles/`、`astro.config.mjs`、`deploy.yml`。字段细节见 [data-model.md](../data-model.md)。

## 数据文件 → 页面映射

| 要更新什么 | 改哪个文件 | 方式 |
|------------|-----------|------|
| 新增论文 | `src/data/publications.json` | 数组追加一条对象 |
| 论文上主页精选 | `src/data/publications.json` | 该条加 `"featured": true` |
| 新增新闻 | `src/content/news/{slug}.md` | 新建 Markdown 文件（frontmatter + 正文） |
| 老师信息变动 | `src/data/teachers.json` | 改对应条目 |
| 学生入学/毕业 | `src/data/students.json` / `src/data/graduates.json` | 追加或移动条目 |
| 更换活动照片 | `public/gallery/*.jpg` + `src/data/gallery.json` | 丢图片 + 改清单 |
| 招募信息/组名 | `src/data/site.json` | 改字段值（`groupName`、`fullName`、`institute`、`directions`、`admissions`，字段约定见 data-model.md §7） |

## 新增一条论文（示例）

`src/data/publications.json` 数组内追加：

```json
{
  "title": "Paper Title Here",
  "venue": "ACL 2026",
  "year": 2026,
  "ccf": "A",
  "url": "https://arxiv.org/abs/2026.xxxxx",
  "featured": true
}
```

- `ccf`：有评级填 `"A"`/`"B"`/`"C"`；无评级（arXiv 预印本/Findings/SCI/中文期刊）删除该字段。
- `url`：arXiv 优先；无 arXiv 填 DOI/出版方页面；都没有则删除该字段（纯文本展示）。链接展示文字统一为 "Link"，无需标注类型。
- `featured`：仅主页精选需要；普通条目省略。

## 新增一条新闻（示例）

新建 `src/content/news/2026-10-paper-accepted.md`：

```markdown
---
title: "Three Papers Accepted to ACL 2026"
date: 2026-10-08
summary: "Our work on XXX has been accepted by ACL 2026."
---

正文（Markdown）。简讯类新闻直接写简讯本身。
配图放同目录，用 ![说明](./fig1.png) 引用。
```

- 文件名 = 详情页 URL（`/news/2026-10-paper-accepted/`），不可与既有文件重名。
- `summary` ≤200 字符，显示在新闻列表与主页概览。

## 图片资产约定

- Gallery 照片：`public/gallery/`，JPEG，单张 ≤500KB，长边 ≤2000px，文件名用小写字母与连字符；清单超过 12 条会导致构建报错；清单引用 `public/gallery/` 中不存在的文件同样导致构建报错（换图时请先传图片、再改清单）。
- 新闻配图：与 `.md` 同目录，路径缺失会导致构建失败（提示定位到具体文件）。

## 校验与部署流程（Constitution III）

```bash
npm run build        # 本地构建：字段错误在此报错（Zod 指明文件+字段）
git add src/data/ src/content/ public/gallery/
git commit -m "content: add ACL 2026 paper"
git push             # GitHub Actions 自动构建部署，构建失败不会上线
```

- 部署后检查线上渲染（Constitution 维护工作流）。
- 涉及模板/样式/构建配置的变更 MUST 走 Pull Request（不属于常规内容更新）。
