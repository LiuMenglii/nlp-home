# Data Model: Team 页布局优化与移动端修复

**Date**: 2026-10-12（rev：纳入 `github` 字段） | **Constraint**: 数据层改动严格限定为 GitHub 链接所需的最小调整（spec FR-006）——为 `students` / `graduates` 新增可选 `github` 字段、迁移学生既有 `url` 中的 GitHub 取值；除此以外 schema 与数据零改动（teachers 维持现状）。完整 schema 定义见 `src/content.config.ts`（本特性的 schema 变更点见 §校验规则变更）。

## 实体

### Teacher（`src/data/teachers.json` → `teachers` collection）【零改动】

| 字段 | 类型 | 布局相关性 |
| ---- | ---- | ---- |
| `name` | string（必填） | 卡片标题行 |
| `title` | string（必填） | 职称行（英文，如 Professor） |
| `directions` | string[]（≥1） | **本特性核心**：标签集合，横向换行填满卡片信息列（R4）；单标签长度不定，必须允许换行 |
| `photo` | string（可选） | 缺图时卡片头仍需正常排布（边缘用例）；有图时固定 120×150 缩略 |
| `email` / `homepage` / `bio` | 可选 | Team 页 detailed 模式展示；排布不变 |

消费组件：`TeacherCard.astro`（Team 页 detailed + 主页 compact 共用 → 回归范围，FR-009）。教师不加 `github` 字段（FR-006：teachers 维持现状）。

### Student（`src/data/students.json` → `students` collection）【github 字段新增 + url 迁移】

| 字段 | 类型 | 布局相关性 |
| ---- | ---- | ---- |
| `name` | string（必填） | 条目行左端；`url` 非空时姓名为链接 |
| `level` | `'phd' \| 'master'` | 决定分组（PhD Candidates / Master's Students），组内按 `grade` 降序 |
| `grade` | string（可空） | 非空时展示 `Since {grade}`，**行右端**（R3 两端分布）；为空（如李江楠）则行内仅有姓名 |
| `url` | httpsUrl（可空） | **语义收窄：仅个人主页**（如杨晨旭）；GitHub 链接 MUST NOT 存于此字段 |
| `github` | httpsUrl（可空，**新增**） | 非空时姓名后渲染 `GitHub↗` 独立标签（FR-010），计入条目左簇内容（FR-004 中间间隙判定） |
| `note` | string（可空） | 非空时紧随 `Since` 右侧；当前数据全为 null |

#### url → github 迁移明细（4 条）

| 姓名 | 原 `url`（迁移至 `github`） | 迁移后 `url` |
| ---- | ---- | ---- |
| 李江楠 | `https://github.com/LeqsNaN` | null |
| 张瀚文 | `https://github.com/Heaven-zhw` | null |
| 郑明钰 | `https://github.com/SpursGoZmy` | null |
| 刘正宵 | `https://github.com/jluliuzx` | null |

**不迁移**：杨晨旭 `url: https://iie-ycx.github.io/`（GitHub Pages 个人主页，非 GitHub 个人页）——保留 `url`，姓名仍可点击。迁移仅搬移取值，URL 逐字不变（Constitution I）。

消费组件：`StudentGroup.astro`。

### Graduate（`src/data/graduates.json` → `graduates` collection）【github 字段新增，内容零改动】

| 字段 | 类型 | 布局相关性 |
| ---- | ---- | ---- |
| `name` | string（必填） | 第 1 列；现值均为 2–4 个汉字 → 固定列宽按 ≤4 字 + 余量取值 |
| `degree` | `'phd' \| 'master'` | 第 2 列，经 `degreeLabel` 映射为 `PhD` / `Master`（UI 标签英文化，001 既有逻辑） |
| `year` | int（可空） | 非空时第 2 列显示 `{degree} · {year}`；**为空（如谭宇彤、温哲）时仅显示学位、列仍占位**，对齐不破坏（FR-003）；第 2 列固定宽度按最宽值 `Master · 2025` 取值 |
| `destination` | string（必填） | 第 3 列 `minmax(0, 1fr)` 弹性列；现值最长"北京大学（攻读博士）"10 个汉字，须可在列内换行 |
| `github` | httpsUrl（可空，**新增**） | 非空时去向文字后渲染 `GitHub↗` 标签（第 3 列内联，不引入新轨道，FR-003/FR-010）；当前数据均无 GitHub 链接，字段为导入完整名单预留 |

消费页面：`src/pages/team.astro`；排序：`year` 降序（无年份排后）→ `id` 字典序。

## 派生展示值（模板层）

- `degreeLabel = { phd: 'PhD', master: 'Master' }`（既有，不变）
- 学位·年份拼接：`year` 非空 → `PhD · 2024`；为空 → `Master`（无多余分隔符，边缘用例）
- 学生行：`grade` 非空 → `Since 2021`（既有，不变）
- **新增**：`github` 非空 → `GitHub <span aria-hidden="true">↗</span>` 标签（与既有 `Link ↗` / `Homepage ↗` 模式同构）；为空 → 不渲染（FR-010）

## 校验规则变更（本特性唯一 schema 改动）

`src/content.config.ts`：

- `students` schema 新增 `github: httpsUrl`（复用既有校验器：合法 URL + MUST `https://` + optional/nullable）
- `graduates` schema 新增 `github: httpsUrl`（同上）
- 其余 collection 与字段零改动；`npm run check` + `astro build` 继续在构建期拦截数据错误（含新字段格式错误）

**维护者文档同步**：`specs/001-homepage-rebuild/data-model.md` 的 Student / Graduate 字段表补 `github` 行（`url`="个人主页"既有定义不变）——001 contracts/data-files.md 指向该文件作为字段参考（Constitution II：数据文件 MUST 有清晰的字段约定）。
