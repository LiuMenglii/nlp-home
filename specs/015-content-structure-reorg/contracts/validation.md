# Validation Contract

**Feature**: [spec.md](../spec.md) | **Plan**: [plan.md](../plan.md) | **Data model**: [data-model.md](../data-model.md) | **Date**: 2026-11-24

**消费方**: `src/content.config.ts`、`astro.config.mjs`、内容维护者、[quickstart.md](../quickstart.md) 验收。

本契约定义内容校验的触发点、规则、报错定位与修复提示。任何校验失败都必须中断 `astro check` / `astro build`，并指向 `content/` 中的具体文件、条目、姓名或字段。

## 1. 校验层次

| 层次 | 位置 | 触发时机 | 适用规则 |
|------|------|----------|----------|
| A. 模块加载期审计 | `src/content.config.ts` 顶层函数 | `astro check` / `astro build` 载入配置时 | 品牌信息与 logo/favicon、学生 directions、特定新闻规则、Gallery 条目目录与资产、教师条目资产 |
| B. Collection schema | `src/content.config.ts` 的 `schema` | 内容层加载 / 生成类型时 | 字段类型、枚举、必填、HTTPS、摘要长度、URL/date 配对、链接三选一、`image()` 解析 |
| C. 构建前预渲染 | `astro.config.mjs` 的 `newsWidgetsValidation` | 构建开始前 | 新闻控件硬错误 |

模块加载期审计与 schema 可同时覆盖同一规则（如图片存在性），以审计报错作为优先的可操作提示；两者都不能被移除。

## 2. Gallery 校验

| 规则 | 违约示例 | 报错必须包含 | 修复提示 |
|------|----------|--------------|----------|
| 条目总数 ≤12 | `content/gallery/` 下有 13 个含 `index.md` 的条目 | `content/gallery/`、当前条目数、上限 12 | 精选保留 12 条，删除或合并多余条目 |
| 条目目录命名 | `gallery/team-building/` | `content/gallery/team-building`、命名规则 | 改为 `NN-slug`，两位数字前缀即顺序 |
| 条目目录必须有 `index.md` | `content/gallery/01-foo/photo.jpg` 无 `index.md` | 该目录路径、缺失文件 | 在该目录新建 `index.md` 并填写 frontmatter |
| `index.md` 必须有 `image` | frontmatter 无 `image` | `content/gallery/<id>/index.md`、字段 `image` | 填写 `image: ./文件名` |
| `image` 必须同目录 | `image: ../shared/photo.jpg`、`/photo.jpg` | 条目路径、字段 `image`、非法值 | 改为 `./文件名`，将图片放入该条目目录 |
| 图片文件必须存在 | `image: ./missing.jpg` | 条目路径、字段 `image`、目标路径 | 放入文件并保持文件名一致 |
| `caption` 非空 | `caption: ""` | 条目路径、字段 `caption` | 填写中文说明 |
| `date` 为字符串（有值时） | `date: 2026-11-01T00:00:00Z` 等非预期类型 | 条目路径、字段 `date` | 使用 `"YYYY-MM"` 或 `"YYYY-MM-DD"` 字符串 |

**Schema 报错兜底**：`image: image()` 在文件不存在时由 Astro 抛出 `ImageNotFound`，必须能定位到条目文件与 `image` 字段；审计层应先行给出中文提示。

## 3. 教师校验

| 规则 | 违约示例 | 报错必须包含 | 修复提示 |
|------|----------|--------------|----------|
| 条目目录命名 | `teachers/lin-zheng/` | 目录路径、命名规则 | 改为 `NN-slug` |
| 每个条目必须有 `index.md` | 只有照片 | 目录路径、缺失文件 | 新建 `index.md` |
| `name` 非空 | 空字符串 | 条目路径、字段 `name` | 填写姓名 |
| `title` 非空 | 空字符串 | 条目路径、字段 `title` | 填写英文职称 |
| `advisorRole` 枚举 | `advisorRole: professor` | 条目路径、字段、合法值 `phd` / `master` | 改为合法值 |
| `directions` 至少 1 项且非空 | `[]`、`[""]` | 条目路径、字段 `directions` | 填写至少一个研究方向 |
| `email` / `ucasProfile` / `homepage` HTTPS | `http://...`、非 URL | 条目路径、字段、非法值 | 改为 HTTPS URL 或省略 |
| `homepage` 不得为 UCAS 资料页 | 与 `ucasProfile` 相同的 URL | 条目路径、字段 `homepage` | 改为个人主页或 `null` |
| `photo` 同目录且存在（有值时） | `photo: /teachers/x.svg`、`photo: ./missing.svg` | 条目路径、字段 `photo`、目标路径 | 改为 `./文件名` 并把照片放入该条目目录 |
| `photo` 可为空 | 无 `photo` 或 `photo: null` | — | 合法，不报错 |

## 4. 新闻校验

| 规则 | 违约示例 | 报错必须包含 | 修复提示 |
|------|----------|--------------|----------|
| `title` 非空 | 空标题 | `content/news/<file>.md`、字段 `title` | 填写标题 |
| `date` 合法日期 | `date: not-a-date` | 文件路径、字段 `date` | 填写 ISO 日期 |
| `summary` 非空且 ≤200 code points | 超长摘要 | 文件路径、字段 `summary`、当前长度 | 压缩摘要 |
| 特定文章标题 / 摘要 / 控件规则 | `self-taught-rlvr-2026.md` 不合规 | 文件路径、具体规则 | 按 `docs/news-markdown-guide.md` 修正 |
| 图片同目录且存在 | `![](../x.png)`、`![](missing.png)` | 文件路径、行号、目标路径 | 将配图放入同目录并用相对文件名引用 |
| 控件语法硬错误 | 未闭合的 `:::highlight`、表格列数不符 | 文件路径、行号、错误原因 | 按新闻 Markdown 指南修正 |

**注**：新闻图片解析由 Astro 内容资源管线与 `newsWidgetsValidation` 预渲染共同覆盖；两者报错都必须指向 `content/news/<file>.md`，不得出现 `src/content/news/`。

## 5. 学生 / 毕业生 / 论文校验

### 5.1 学生（`content/students.json`）

- 数组解析错误 → 报错含 `content/students.json` 与解析原因；
- `name` 非空；`level` 为 `phd` / `master`；
- `directions` 至少 1 项，每项非空白；报错含学生姓名与字段；
- `url` / `github` / `scholar` 均为 HTTPS 且三选一（至多一个）。

### 5.2 毕业生（`content/graduates.json`）

- 数组解析错误 → `content/graduates.json`；
- `name`、`destination` 非空；`degree` 枚举；`year` 为数字或 `null`；
- 三个链接 HTTPS 且三选一；报错含姓名与字段。

### 5.3 论文（`content/publications.json`）

- 数组解析错误 → `content/publications.json`；
- `title`、`venue` 非空；`year` 为 1980–2100 整数；
- `ccf` 仅 `A` / `B` / `C`，无评级时省略（不得 `null`）；
- `url` HTTPS，缺省时省略；
- `date` 为合法 `YYYY-MM-DD`，且与 `url` 成对：有 `url` 必须有 `date`，无 `url` 必须无 `date`；
- 报错含论文标题、字段与原因。

## 6. 站点品牌校验

| 规则 | 违约示例 | 报错必须包含 | 修复提示 |
|------|----------|--------------|----------|
| 必填字段非空 | `instituteZh: ""` | `content/site.json`、字段 | 填写非空值 |
| `logo` / `favicon` 站内绝对路径 | 外链、`../` | `content/site.json`、字段、非法值 | 使用 `/logo.svg` 形式 |
| `logo` / `favicon` 文件存在 | 指向 `public/missing.svg` | `content/site.json`、字段、目标路径 | 将文件放入 `public/` 或修正路径 |
| `directions` 数组 | 非数组 / 空 | `content/site.json`、字段 | 填写至少一个方向 |
| `admissions` 结构 | 缺 `apply` / `skills` / `email` | `content/site.json`、字段 | 补齐招生信息 |

## 7. 报错文案规范

1. **路径前缀**：所有操作指引以 `content/` 开头，例如 `content/gallery/01-emnlp-2025-suzhou/index.md`。
2. **定位元素**：至少包含以下之一：文件路径、条目 id / 目录、教师或学生姓名、字段名。
3. **修复方向**：说明「放哪里 / 改哪个字段 / 用什么格式」，不能只写「invalid」。
4. **禁止旧路径**：不得把 `src/data/`、`src/content/news/`、`public/gallery/`、`public/teachers/` 作为操作指引出现；历史 `specs/` 文档除外。
5. **语言**：面向维护者的校验文案使用中文；Astro 原生错误可保留英文，但必须能由路径 / 字段定位。

## 8. 验收命令

```bash
npm run check
npm run build
node --test tests/news-widgets.test.mjs
```

**额外审计**（在仓库根执行，排除历史 specs、依赖与构建产物）：

```bash
grep -rn "src/data/\|src/content/news/\|public/gallery/\|public/teachers/" \
  src content docs astro.config.mjs package.json .github 2>/dev/null
# 期望：无输出
```

**负向抽检**（在临时副本或临时分支执行，完成后还原）：

- 删除某 Gallery 条目图片 → 构建失败，报错指向 `content/gallery/<id>/index.md` 的 `image`；
- 复制第 13 个 Gallery 条目 → 构建失败，报错指向 `content/gallery/` 与 12 条上限；
- 将某教师 `photo` 指向不存在的文件 → 构建失败，报错指向该教师条目与 `photo`；
- 在 `content/news/` 写入未闭合高亮块 → 构建失败，报错指向具体新闻文件与行号。
