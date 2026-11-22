# Contract: Team 页在读学生名单行内对齐（student-row-alignment）

**Date**: 2026-11-22 | **Spec**: [spec.md](../spec.md) | **消费方**: 在读学生行样式实现与验收（[quickstart.md](../quickstart.md)） | **视图实体**: [data-model.md](../data-model.md)

本契约对象是 Team 页（`/team/`）PhD Candidates 与 Master's Students 两个分组**每条学生记录的行内水平布局**：三列固定宽度、两侧空白相等、Since 列内居中、链接右对齐、空列保留、竖排右对齐、缺失字段语义与测量容差。断点、特定数值与验收档位以 spec 为唯一规范源；本契约记录实现层取值与判定口径。

## 1. 视口行为矩阵（MUST）

| 视口 | 栏数 | 行内容区宽 `W` | 行形态 | Since 水平位置 | 两侧空白 `g`（5em / 5.5em） |
| --- | --- | --- | --- | --- | --- |
| 1920px | 2 | 502px | 姓名 / Since / 链接三列同行 | 第 2 列内居中（行中点左 27px） | 116 / 111.5px |
| 1440px | 2 | 502px | 同上 | 同上 | 116 / 111.5px |
| 1280px | 2 | 502px | 同上 | 同上 | 116 / 111.5px |
| 1024px | 2 | 424px | 同上 | 同上 | 77 / 72.5px |
| **768px** | 2 | **296px** | 同上（最紧档） | 同上 | **13 / 8.5px** |
| **767px** | 1 | 671px | 同上 | 同上 | 200.5 / 196px |
| 576px | 1 | 480px | 同上 | 同上 | 105 / 100.5px |
| 481px | 1 | 385px | 同上 | 同上 | 57.5 / 53px |
| **480px** | 1 | 400px | 同上 | 同上 | 65 / 60.5px |
| **375px** | 1 | 295px | 竖排：第 1 行姓名 + Since 右对齐；第 2 行链接右对齐（若有） | 右对齐 | — |
| **320px** | 1 | 240px | 同上（最窄档） | 右对齐 | — |

- 按整数视口宽度验收：CSS `max-width: 479.98px` 与 ≤479px 等价；带小数的视口宽度（如 479.5px）不纳入验收。
- 1920 / 1440 / 1280px 的 `W` 同为 502px（容器 1180px 封顶后每行可用宽度一致），测量以 1440px 为代表；480–767px 单栏横向与 ≥768px 双栏横向使用同一套三列声明。

任何档位 MUST NOT 出现空栏、半宽列、表头行、栏间竖线、占位文本或第 3 行；横向态（≥480px）任何行 MUST NOT 出现槽位折行（超长姓名在姓名列内换行除外，见 §5）。

## 2. 横向态三列固定宽度（≥480px，FR-001～FR-003）

| 列 | 宽度 | 定位 | 对齐 | 说明 |
| --- | --- | --- | --- | --- |
| 姓名 `.student-name` | `3.5em` = 63px | `grid-column: 1` | 列内居左（缺省 stretch + 左对齐） | 姓名列贴行内容左缘；超长在列内换行 |
| Since `.grade` | `5em` = 90px（必要时 `5.5em` = 99px） | `grid-column: 2` | `justify-self: center` | 必须 `margin-left: 0`（覆盖基线 `auto`）、`white-space: nowrap`；字号 18px |
| 链接 `.member-link` | `6.5em` = 117px | `grid-column: 3` | `justify-self: end` | 标签单行；右缘贴行内容右缘；缺失时列宽保留但不渲染元素 |

- 容器几何：`display: grid`、`grid-template-columns: 3.5em 5em 6.5em`（必要时整组改为 `3.5em 5.5em 6.5em`）、`column-gap: 0`、`justify-content: space-between`、行内距 `padding: 8px 24px`（零改动）、`align-items: baseline`。
- `justify-content: space-between` MUST 把 `W − (63 + S + 117)` 的剩余空间等分为两个列间空白：`g = (W − 63 − S − 117) / 2`。
- 三列宽度 MUST 与内容无关：MUST NOT 使用 `1fr` / `max-content` 侧轨、MUST NOT 按行设置列宽、MUST NOT 用固定 `column-gap` 或 `justify-content: center` 近似等隙。
- 行内距、栏距、两栏断点、容器内距沿用既有值，本特性零改动。

## 3. 等隙与 27px 偏左（FR-002 / FR-004）

记 `N = 63px`、`S = 90` 或 `99px`、`L = 117px`、`W` = 行内容区宽（`li` 边框盒扣除左右各 24px 行内距）、`g = (W − N − S − L)/2`。

1. **两侧空白相等**：姓名列右缘到 Since 列左缘的空白与 Since 列右缘到链接列左缘的空白 MUST 相等（偏差 ≤1px），且 MUST ≥8px。
2. **Since 列内居中**：Since 文本可见中心 MUST 与第 2 列中心对齐（偏差 ≤1px）。
3. **27px 偏左**：`Since 中心 − W/2 = (N − L)/2 = −27px`（±1px）。该结果与 `W`、`S`、`g` 无关；MUST NOT 视为缺陷，也 MUST NOT 用额外偏移“修正”到行中点。
4. **同线**：同一栏内所有行（含无链接行）的 Since 中心 MUST 落在同一条竖线上（极差 ≤1px）；有链接行的链接标签宽窄 MUST NOT 改变 Since 位置。
5. **无夹取**：固定列宽下三列 MUST NOT 相互重叠；MUST NOT 实现 011 的碰撞夹取或任何基于字体度量的左移逻辑。
6. **贴边与单行**：链接右缘 MUST 贴齐行内容区右缘（偏差 ≤1px），标签 MUST 单行；无链接行 MUST NOT 渲染占位、破折号或隐藏文本。

## 4. 竖排态（<480px，FR-005）

| 行 | 内容 | 对齐 |
| --- | --- | --- |
| 第 1 行 | 姓名 + Since | 姓名居左；Since 右对齐，右缘与行内容右缘偏差 ≤1px |
| 第 2 行 | 链接（仅有链接时渲染） | `flex: 0 0 100%` 独占整行；`text-align: right`，右缘与第 1 行右缘偏差 ≤1px |

- 无链接 MUST NOT 渲染第 2 行或占位；DOM 顺序仍为姓名 → Since → 链接（链接以 `order` 后置）。
- 两行之间的间距沿用现有的 4px，行高沿用现有值；本特性不新增间距或行高数值。验收只判三件事：是否为两行（有链接 2 行、无链接 1 行）、链接右缘是否对齐、是否没有占位。
- 320px 档 MUST 无重叠、截断、溢出或页面横向滚动。

## 5. 收纳声明

- **超长姓名**（含无空格拉丁串）：在姓名列（63px）内换行，行高增长；不得越入 Since 列、不得撑宽行、不得造成页面横向滚动。姓名换行属已声明形态，不计布局破损，也不计入 SC-004 的「非预期换行」；姓名换行本身不纳入本期验收（S2）。
- **链接标签**（Homepage / GitHub / Scholar + `↗`）：MUST 单行且完整落在 117px 列内；不得换行或截断；未来标签宽于列宽时按缺陷上报，不得缩字号或隐藏。
- **Since**：`Since <年份>` MUST 单行且完整落在 90 / 99px 列内；5em 实测放不下时整组切 5.5em；仍放不下按缺陷停止验收；无年级不渲染。
- **竖排两行**与**姓名列内换行**均为契约声明形态，不计破损；其余重叠、截断、溢出、非预期换行按破损处理。

## 6. DOM 契约（零改动）

```text
div.student-group
├── h3                                "PhD Candidates" / "Master's Students"
└── div.phd-columns / div.master-columns[.is-single]
    ├── ul  → li × 左栏条数
    │    ├── span.student-name
    │    ├── span.grade               "Since <grade>"（有年级时）
    │    └── a.member-link            "Homepage|GitHub|Scholar ↗"（有链接时）
    └── ul  → li × 右栏条数（n=1 时不渲染）
```

- 类名、元素、顺序、`href`、`target="_blank" rel="noopener"`、标题与两栏包装层 MUST 与 011 现状一致；本特性不改模板。
- 结构 MUST 保持 `ul` / `li` 列表：MUST NOT 改为 `<table>`，MUST NOT 添加 `th`、表头行或 `role="table"` 等表格语义。
- 同一 DOM 承载三种形态；无表头、无占位、无隐藏文本、无额外 `<h3>`；姓名不可点击。
- PhD 与 Master's MUST 命中同一组三列与媒体查询声明（选择器并列），不得出现两套行内几何；Since 列宽度 MUST 在两个分组中取同一值（5em 或 5.5em）。

## 7. 对齐与计数测量口径（SC-001～SC-008）

| 测量项 | 判据 |
| --- | --- |
| 列宽 | `getComputedStyle(li).gridTemplateColumns` 的三个像素值 = 63 / 90（或 99）/ 117，同组所有行一致 |
| 等隙 | `g = (W − 63 − S − 117)/2`；姓名列右缘—Since 列左缘与 Since 列右缘—链接列左缘之差 ≤1px；`g ≥ 8px` |
| Since 位置 | `grade` 中心与行内容区中点偏差 = −27px（±1px）；同一栏所有行极差 ≤1px |
| Since 列内居中 | `grade` 中心与第 2 列中心（`contentLeft + 63 + g + S/2`）偏差 ≤1px |
| 链接右缘 | `link.right` 与 `li` 内容区右缘偏差 ≤1px；同栏所有链接右缘极差 ≤1px |
| 链接单行 | 链接 `getBoundingClientRect().height` 约等于单行行高（18px × 1.65 ≈ 29.7px），无折行 |
| 姓名贴边 | `name.left` 与 `li` 内容区左缘偏差 ≤1px |
| 空列保留 | 无链接行第 3 列仍为 117px；缺年级行第 2 列仍为 90 / 99px；无占位文本 |
| 竖排链接右缘 | 第 2 行 `.member-link` 右缘与 `li` 内容区右缘偏差 ≤1px；与同条 Since 右缘偏差 ≤1px |
| 竖排行数 | 有链接行 = 2 行；无链接行 = 1 行；无空第 2 行 |
| Since 单行 | 30 个 `.grade` 高度 ≈29.7px，宽度 ≤ 列宽；无折行、截断或省略 |
| 计数 | 在读分组 30 条、30 个 `.grade`、4 个 `.member-link`；PhD 19（10+9）、Master's 11（6+5） |
| 数据一致 | 渲染姓名、`Since <年份>` 与链接标签与 `students.json` 逐项一致；0 丢失、0 重复、0 改写 |
| 结构 | 无表头 `th`、无栏间竖线、无 `.note`、无空锚点、姓名非链接 |
| 字号 | `.grade` / 姓名 / 链接计算字号 18px；分组标题 20px（容差 ≤0.5px） |
| 破损 | 逐元素 `getBoundingClientRect()` 不越出视口；`documentElement.scrollWidth − innerWidth = 0`；无重叠、截断、内容溢出、非预期换行 |

## 8. 回归范围与不变量

- **零改动**：`src/data/students.json`、`src/data/graduates.json`、`src/content.config.ts`、`src/pages/team.astro`、`src/styles/global.css`、`TeacherCard.astro`、Graduates 名单、Faculty 区块、其他页面、`package.json` / `package-lock.json`、CI 配置。
- **唯一改动**：`src/components/StudentGroup.astro` 的 scoped CSS——≥480px 固定三列网格与三列定位；移除 011 的 `minmax(4em,1fr) 5.5em auto` 与 480–767px flex 行内规则；<480px 链接 `text-align` 改为 `right`；并同步清理基线 `@media (max-width: 479.98px)` 中 `.member-link` 的 `text-align: left`，避免两处规则语义冲突。模板 frontmatter（排序、切分、`linkOf`）零改动。
- **不变**：两栏断点（768px）、32px 栏距、排序（年级升序）、切分（`ceil(n/2)`）、字号、配色、字体族、分隔线、箭头、hover、`focus-visible` 外框（不得引起横向滚动）、容器 1180px 上限与 24/16px 内距。
- **范围外**：打印样式；200% 缩放与最小字号检查（与 007 / 010 / 011 口径一致）。
- **零新增**：依赖、运行时 JS、构建配置、CI 步骤、组件文件、公共 CSS 层。
- **不掩盖**：MUST NOT 使用页面级 `overflow-x: hidden` / `clip`；MUST NOT 以缩小字号、隐藏链接、截断姓名规避列宽问题。
