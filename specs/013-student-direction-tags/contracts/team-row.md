# Contract: Team 页在读学生行（team-row）

**Date**: 2026-11-22 | **Spec**: [spec.md](../spec.md) | **消费方**: `src/components/StudentGroup.astro` 实现与验收（[quickstart.md](../quickstart.md)） | **数据契约**: [students-data.md](./students-data.md) | **视图实体**: [data-model.md](../data-model.md)

本契约对象是 Team 页（`/team/`）PhD Candidates 与 Master's Students 两个分组**每条学生记录的行内结构、标签组布局与成员链接呈现**。断点、数值与验收档位以 spec 为唯一规范源；本契约记录实现层结构与判定口径。

## 1. 视口行为矩阵（MUST）

| 视口 | 栏数 | 行内容区宽 `W` | 行形态 | 标签组可用宽度 | 链接位置 |
| --- | --- | --- | --- | --- | --- |
| 1920px | 2 | 502px | 姓名 / 标签组 / 链接三槽同行 | 302px | 第 3 槽，文字右缘贴行内容右缘 |
| 1440px | 2 | 502px | 同上 | 302px | 同上 |
| 1280px | 2 | 502px | 同上 | 302px | 同上 |
| 1024px | 2 | 424px | 同上 | 224px | 同上 |
| **768px（最紧）** | 2 | **296px** | 同上 | **96px** | 同上 |
| **767px** | 1 | 671px | 同上 | 471px | 同上 |
| 576px | 1 | 480px | 同上 | 280px | 同上 |
| 481px | 1 | 385px | 同上 | 185px | 同上 |
| **480px** | 1 | 400px | 同上 | 200px | 同上 |
| **375px** | 1 | 295px | 竖排：姓名 + 标签组共享首行/依次换行；链接独占最后一行 | 约 231px（`W − 姓名宽 − 10`） | 最后一行，文字右对齐 |
| **320px** | 1 | 240px | 同上（最窄档） | 约 176px | 同上 |

- `W` = `li` 边框盒扣除左右各 24px 行内距；标签组可用宽度 = `W − 3.5em（63px）− 6.5em（117px）− 2 × 10px`（≥480px）。
- 1920 / 1440 / 1280px 的 `W` 同为 502px（容器 1180px 封顶），测量以 1440px 为代表。
- 按整数视口宽度验收；CSS `max-width: 479.98px` 与 ≤479px 等价，带小数的视口不纳入。
- 任何档位 MUST NOT 出现表头行、栏间竖线、占位文本或页面级横向滚动。
- 无链接行不渲染链接元素，但 ≥480px 固定第三轨仍保留 6.5em 列宽；两栏只要求顶线一致，不要求跨栏逐行对齐。

## 2. DOM 契约

```text
div.student-groups
├── div.student-group
│   ├── h3                                "PhD Candidates" / "Master's Students"
│   └── div.phd-columns / div.master-columns[.is-single]
│       ├── ul
│       │   ├── li
│       │   │   ├── span.student-name
│       │   │   ├── span.direction-tags[role="list"][aria-label="Research directions"]
│       │   │   │   └── span.direction-tag[role="listitem"] × N（N ≥ 1）
│       │   │   └── a.member-link          "Homepage|GitHub|Scholar ↗"（有链接时）
│       │   └── li × 左栏条数
│       └── ul → li × 右栏条数（n=1 时不渲染）
```

- 行内顺序 MUST 为 `student-name` → `direction-tags` → `member-link`；标签组 MUST NOT 出现在姓名之前或链接之后。
- `direction-tags` MUST 使用 `span`（不是嵌套 `ul` / `li`），以避免 `StudentGroup.astro` 中通用 `li` 样式命中标签项；集合语义由 `role="list"` + 子项 `role="listitem"` 提供。
- `direction-tags` MUST 带 `aria-label="Research directions"`；标签项数量 MUST 等于 `directions.length`，文本与顺序 MUST 与数据一致。
- 姓名 MUST 保持纯文本、非链接；链接 MUST 保留 `target="_blank"` 与 `rel="noopener"`。
- 结构 MUST 保持 `ul` / `li` 列表：MUST NOT 改为 `<table>`，MUST NOT 添加 `th`、表头行或 `role="table"` 等表格语义。
- 无链接 MUST NOT 渲染 `a.member-link`、占位、破折号、空锚点或隐藏文本。
- PhD 与 Master's MUST 命中同一组标签样式与媒体查询声明（选择器并列），不得出现两套行内几何。

## 3. 横向态（≥480px）

| 槽 | 选择器 | 轨道 | 对齐 | 说明 |
| --- | --- | --- | --- | --- |
| 1 | `.student-name` | `grid-column: 1`；`3.5em` = 63px | 列内居左 | 姓名贴行内容左缘；超长在列内换行 |
| 2 | `.direction-tags` | `grid-column: 2`；`minmax(0, 1fr)` | 列内起始；组内 `flex-wrap` | 全部标签可见；组内换行；单标签内部可换行 |
| 3 | `.member-link` | `grid-column: 3`；`6.5em` = 117px | `justify-self: end`；`text-align: right` | 标签单行；文字右缘贴行内容右缘；无链接保留列宽但不渲染（固定第三轨，无需占位元素） |

- 容器几何：`display: grid`、`grid-template-columns: 3.5em minmax(0, 1fr) 6.5em`、`column-gap: 10px`、`align-items: baseline`；行内距沿用 `8px 24px`。
- 三轨总和 = `63px + 中间列 + 117px + 20px`，中间列 MUST 为 `W − 200px`；姓名左缘与行内容左缘偏差 ≤1px，链接文字右缘与行内容右缘偏差 ≤1px。
- `minmax(0, 1fr)` MUST NOT 被替换为 `auto` / `max-content`，否则长标签会把中间列撑宽并挤出链接列。
- 标签组 MUST NOT 向无链接行的空链接列扩张；固定第三轨天然保留链接列宽，无链接行与有链接行的姓名、标签组位置 MUST 一致。
- 行高可以随标签换行增高；姓名与链接 MUST 与标签组首行基线对齐，MUST NOT 被标签组覆盖。

## 4. 竖排态（<480px）

| 行 | 内容 | 对齐 |
| --- | --- | --- |
| 首行/中间行 | 姓名 + 标签组（标签组在组内换行） | 姓名居左；标签组占姓名之外的剩余宽度 |
| 最后一行 | 链接（仅有链接时渲染） | `order: 9; flex: 0 0 100%` 独占整行；文字右对齐 |

- `li` 保持 `display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 10px`。
- `.student-name` `flex: 0 0 auto`；`.direction-tags` `flex: 1 1 0; min-width: 0`；`.member-link` `order: 9; flex: 0 0 100%; text-align: right`。
- 标签组 MUST NOT 覆盖或截断姓名与链接；链接 MUST 位于标签组下方；无链接 MUST NOT 渲染最后一行。
- 链接元素占满整行，其元素盒右缘恒等于行右缘；右对齐验收 MUST 以链接文字范围（`document.createRange()`）为准，MUST NOT 用元素盒右缘代替。
- 320px 档 MUST 无重叠、截断、内容溢出或页面横向滚动。

## 5. 标签视觉与收纳契约

| 属性 | 值 |
| --- | --- |
| 标签组 | `display: flex; flex-wrap: wrap; gap: 4px 6px; align-items: center; min-width: 0` |
| 标签 | `background: var(--sky)`、`border-radius: 4px`、`padding: 2px 8px`、`font-size: 0.9rem`、`line-height: 1.4`、`color: var(--ink-soft)` |
| 文本收纳 | `max-width: 100%; overflow-wrap: anywhere; white-space: normal` |
| 禁止 | `text-overflow: ellipsis`、`line-clamp`、`overflow: hidden`、`white-space: nowrap`（单标签）、固定高度裁剪 |
| 交互 | 纯展示；无 hover、无链接、无按钮语义、无 `tabindex` |

- 单个标签 MUST 完整可见；长标签 MUST 在自身内部换行，`scrollWidth ≤ clientWidth + 1`。
- 标签组 MUST 在可用宽度内换行；标签数量增加或文本变长时，行高可以增高，但 MUST NOT 造成页面级横向滚动。
- 标签 SHOULD 与教师卡片的 `teacher-directions` chip 保持同一视觉语言；本特性不新增图标、边框装饰或动效。

## 6. 测量口径（SC-001～SC-007）

| 测量项 | 判据 |
| --- | --- |
| 记录数 | 在读分组共 31 行；PhD 20、Master's 11 |
| 标签数 | 每条 ≥1 个 `.direction-tag`；总数 = 数据中 `directions` 长度之和（当前 31） |
| 标签文本 | 与 `students.json` 的 `directions` 逐项一致；当前全部为 `TBD`；无省略号 |
| 旧字段 | 在读分组内无 `.grade`、"Since" 或四位入学年份（正则 `\b(19\|20)\d{2}\b` 0 命中）；全页 "Since" 0 命中；Graduates 的 `year` 不计入 |
| 姓名位置 | `name.left − li 内容区左缘 ≤1px` |
| 链接位置 | 链接文字范围右缘与 `li` 内容区右缘偏差 ≤1px；同栏链接右缘极差 ≤1px |
| 行内顺序 | `name.right ≤ tags.left + 0.5`；有链接时 `tags.right ≤ link.left + 0.5` |
| 不重叠 | 姓名、标签组、链接两两 `getBoundingClientRect()` 不相交 |
| 标签收纳 | 每个标签 `scrollWidth ≤ clientWidth + 1`；无 `text-overflow: ellipsis` |
| 行内溢出 | `li.scrollWidth ≤ li.clientWidth + 1` |
| 页面溢出 | 失败判据为 `document.documentElement.scrollWidth > window.innerWidth`；不用差值等于 0 判定 |
| 越界 | `main` 内元素 `getBoundingClientRect()` 不超出视口（容差 0.5px） |
| 两栏结构 | 767px 为 1 轨；768px 为 2 轨且 `column-gap: 32px`；PhD 10+10、Master's 6+5 |
| 两栏顶线 | ≥768px 时两栏首行 `getBoundingClientRect().top` 相等（容差 ≤1px） |
| 空链接 | 无链接行不渲染 `.member-link`；无 `N/A`、`—`、`&nbsp;` 等占位 |
| 语义 | 31 个 `role="list"` 标签组；每组的 `role="listitem"` 数量等于该学生 `directions` 长度；`aria-label="Research directions"` |
| 计数 | 31 行、31 个标签组、当前 31 个标签、16 个成员链接（链接补全后以数据为准） |

## 7. 回归范围与不变量

- **唯一改动**：`src/data/students.json`（字段替换与链接）、`src/content.config.ts`（students schema 与构建期校验）、`src/components/StudentGroup.astro`（排序、渲染、CSS）、`src/data/README.md`（字段说明）与 `specs/013-student-direction-tags/`（计划）。
- **零改动**：`src/pages/team.astro`、`src/styles/global.css`、`TeacherCard.astro`、`students` 之外的 collections、`graduates.json` 的 `year`、`team.astro` 的 Graduates 区块、首页、发表页、新闻页、导航、页脚、`package.json` / `package-lock.json`、CI 配置、`tests/news-widgets.test.mjs`。
- **不变**：两栏断点 768px、480px 横向/竖排断点、32px 栏距、24px 行内距、`ceil(n/2)` 切分、`is-single` 单栏、空分组 "coming soon"、字号基准、配色、字体族、分隔线、链接箭头与 `focus-visible` 外框。
- **零新增**：依赖、运行时 JS、构建配置、CI 步骤、组件文件、公共 CSS 层。
- **不掩盖**：MUST NOT 使用页面级 `overflow-x: hidden` / `clip`；MUST NOT 以缩小字号、隐藏标签、截断标签或省略号规避布局问题（`0.9rem` 为既有教师 chip 基准，不因长标签再缩小）。
- **历史归档**：`specs/001`–`012` 中的 `grade` / Since 记录保持原样，MUST NOT 作为本特性的清理对象。
