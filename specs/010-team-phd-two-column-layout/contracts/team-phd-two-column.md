# Contract: Team 页 PhD Candidates 双栏布局（team-phd-two-column）

**Date**: 2026-11-20 | **Spec**: [spec.md](../spec.md) | **消费方**: PhD 分组实现与验收（[quickstart.md](../quickstart.md)） | **视图实体**: [data-model.md](../data-model.md)

本契约对象是 Team 页（`/team/`）PhD Candidates 区域的**界面布局行为**：栏数随视口切换、栏内切分、行内槽位几何、缺失字段的空白语义与对齐容差，作为后续样式改动的回归基线。断点与容差数值以 spec 为唯一规范源；本契约记录实现层取值。

## 1. 视口行为矩阵（MUST）

| 视口 | 栏数 | 行内形态 | 备注 |
| --- | --- | --- | --- |
| 1920px | 2（左右各 1 份列表） | 姓名 / Since / 链接 同一行三槽 | 内容区受 1180px 上限约束，两栏随之上限 |
| 1440px | 2 | 同上 | SC-001 档 |
| 1280px | 2 | 同上 | |
| 1024px | 2 | 同上 | |
| **768px** | 2 | 同上（最紧档，三槽仍单行） | 与教师名片单列断点同阈值；下方即切换 |
| **767px** | 1 | 同上 | 边界切换验证点 |
| 576px | 1 | 同上 | |
| 481px | 1 | 同上 | 容器内距 24px，行内可用 385px |
| **480px** | 1 | 同上 | 容器内距 16px（≤480），行内可用 400px |
| **375px** | 1 | 竖排：第 1 行姓名 + Since 右对齐；第 2 行链接左对齐 | <480 竖排形态 |
| **320px** | 1 | 同上 | 最窄档，第 1 行可用 240px |

任何档位 MUST NOT 出现空栏、半宽列、表头行或栏间竖线；横向态（≥480px）任何档位的槽位折行均按布局破损处理。

## 2. 分栏规则（FR-001～FR-003）

- 切分对象：已按既有规则排序的 PhD 数组（grade 降序 → 无年级最后 → 稳定序）；切分 MUST NOT 改变排序。
- `n ≥ 2`：`k = ceil(n/2)`，左栏 = 前 k 条，右栏 = 其余；当前 9 条 → **5 + 4**。
- `n = 1`：仅左栏 1 条、占单栏整宽（`.phd-columns.is-single`），不渲染第二个 `<ul>`。
- `n = 0`：保留 "PhD candidates coming soon." 占位，不渲染 `.phd-columns`。
- 标题 "PhD Candidates"（`h3`）MUST 只出现一次，横跨内容区全宽并位于两栏上方。
- 两栏宽度差 ≤1px、顶线差 ≤1px、栏间距 32px；每条记录宽度 ≤ 内容区一半（容差 1px）。

## 3. 行内槽位几何（FR-004～FR-006）

### 3.1 ≥768px（两栏，Grid 行）

| 槽 | 轨道 | 对齐 | 说明 |
| --- | --- | --- | --- |
| 姓名 `.student-name` | `4em`（固定） | 左对齐 | 第 1 列；4 字姓名上限（007 FR-021）刚好容纳；超长在槽内换行 |
| Since `.grade` | `5em`（固定） | 左对齐 | 第 2 列；0.95rem 下 `Since YYYY` 实测约 83–84px |
| 链接 `.member-link` | `minmax(0,1fr)` | `justify-self:end`（右缘贴齐） | 第 3 列；元素宽度按内容收缩，不换行 |
| 备注 `.note` | 跨 `1 / -1` | 左对齐 | 第 2 行；当前无实例 |

- 列间隙 `column-gap: 8px`；行内距 `padding: 8px 24px`（左右对称）。
- 768px 档反推：行内可用 296px − 72 − 90 − 16 = **118px** 第三列，`Homepage ↗`（106.11px）余量约 11.9px。
- 缺失年级的行：第 2 列保留空轨道，链接仍由显式 `grid-column: 3` 定位；不渲染任何占位文本。
- 缺失链接的行：第 3 列留空，不渲染锚点或隐藏文本；姓名仍为纯文本。

### 3.2 480–767px（单栏，横向 Flex 行）

| 槽 | 规则 | 对齐 |
| --- | --- | --- |
| 姓名 | `flex: 0 0 4em` | 行首，左对齐 |
| Since | `flex: 0 0 5em; margin-left: 0` | 姓名右侧 8px，左缘固定 |
| 链接 | `flex: 0 0 auto; margin-left: auto; text-align: right` | 行右缘（扣除 24px 内距） |
| 备注 | `flex: 0 0 100%` | 另起一行、左对齐 |

- 列间隙 MUST 为 `column-gap: 8px`（覆盖基线的 10px）；行内顺序 MUST 为「姓名 → Since → 链接（→ 备注）」；行内可用宽 ≥385px，三槽 MUST 单行、不得折行。

### 3.3 <480px（单栏，竖排两行，沿用现状）

| 槽 | 规则 | 对齐 |
| --- | --- | --- |
| 姓名 | `flex: 0 0 auto`（自适应宽度） | 第 1 行行首，左对齐 |
| Since | `margin-left: auto` | 第 1 行右缘（扣除 24px 内距） |
| 链接 | `order: 9; flex: 0 0 100%; margin-left: 0; text-align: left` | 第 2 行独占整行，左缘与姓名左缘对齐 |
| 备注 | `flex: 0 0 100%` | 独占一行，位于链接之前 |

- 该形态即基线已有的手机阅读形态，本特性 MUST 保留其阅读顺序与对齐，仅随 DOM 顺序调整保持等价结果。

## 4. DOM 契约

```text
div.student-group                     （既有容器）
├── h3                                "PhD Candidates"
└── div.phd-columns[.is-single]       （新包装层，n=0 时不存在）
    ├── ul  → li × ceil(n/2)          左栏
    │    └── span.student-name
    │        [span.grade]             "Since <grade>"
    │        [a.member-link]          "Homepage|GitHub|Scholar ↗"
    │        [span.note]
    └── ul  → li × floor(n/2)         右栏（n=1 时不渲染）
```

- 顺序即视觉顺序；不新增表头、列标题、占位元素或第二个 `<h3>`。
- 同一 DOM 承载三种形态：≥768px 两栏网格、480–767px 单栏横向、<480px 单栏竖排（姓名 + Since 同行、链接次行）。
- 单栏时第二个 `<ul>` 首行不重复顶部分隔线；≥768px 两栏时两个 `<ul>` 各自保留顶线，使两列顶线一致。
- `a.member-link` 仅在存在已选链接字段时渲染，`href` 原样复用数据；`target="_blank" rel="noopener"` 不变。
- `.student-name` MUST NOT 为 `<a>`，MUST NOT 带可点击事件。
- 每行 MUST NOT 包含空文本节点以外的占位：无 "Since"、破折号、`N/A`、`&nbsp;`。
- Master's Students 分组的 DOM MUST 保持现状（单个 `<ul>`、姓名 → 链接 → Since → 备注顺序、既有类名），不得复用 `.phd-columns` 包装。

## 5. 收纳与竖排声明

- **姓名超长**（>4 字，含无空格拉丁字符串）：横向态在 4em 槽内换行收纳（实现以 `overflow-wrap: break-word` 保证无空格姓名可断行），不得越入 Since 列或挤压链接，不得溢出栏边界；竖排态自适应宽度，必要时自然换行。
- **链接标签**：MUST 保持单行（`Homepage ↗` / `GitHub ↗` / `Scholar ↗`）；宽度由容器弹性余量容纳，不使用 `white-space:nowrap` 防溢出。
- **备注超长**：独占整行自然换行。
- **<480px 竖排形态**：第 1 行姓名独立、Since 右对齐；第 2 行链接独占一行、左对齐。该形态是 spec FR-009 明确保留的现状设计，不是折行异常，也不计为布局破损。

## 6. 对齐不变量与测量口径（SC-001～SC-004）

| 测量项 | 判据 |
| --- | --- |
| 两栏宽度 | 两个 `<ul>` 的 `getBoundingClientRect().width` 差 ≤1px |
| 两栏顶线 | 两个 `<ul>` 首个 `li` 的上边缘差 ≤1px |
| 栏外缘 | 左栏左缘与内容区左缘、右栏右缘与内容区右缘差 ≤1px |
| Since 列对齐（横向态） | 同栏内所有 `.grade` 左缘差 ≤1px |
| 链接右缘（横向态） | 同栏内所有 `.member-link` 右缘差 ≤1px，且与 `ul` 右缘 −24px 差 ≤1px |
| Since 右缘（竖排态） | 所有 `.grade` 右缘差 ≤1px，且与 `ul` 右缘 −24px 差 ≤1px |
| 链接左缘（竖排态） | 所有 `.member-link` 左缘与同行 `.student-name` 左缘差 ≤1px |
| 跨区块姓名 | 左栏 `.student-name` 左缘与 `.grad-name` 左缘差 ≤1px（三种状态） |
| 记录宽度 | 横向态任一 `li` 宽度 ≤ 内容区宽度 / 2（容差 1px；单栏不限） |
| 破损 | 逐元素 `getBoundingClientRect()` 不越出视口；`documentElement.scrollWidth ≤ window.innerWidth`；无重叠、截断、内容溢出 |

## 7. 回归范围与不变量

- **零改动**：`src/data/students.json`、`src/content.config.ts`、`src/pages/team.astro`、`src/styles/global.css`、`TeacherCard.astro`、Master's 分组、Graduates 名单、Faculty 区块、其余页面。
- **零新增**：依赖、运行时 JS、构建配置、CI 步骤、组件文件、公共 CSS 层。
- **视觉基调**：色板、分隔线（`1px solid var(--line)`）、正文字号、链接箭头 `↗` 与 hover 行为不变。
- **不掩盖**：MUST NOT 以页面级 `overflow-x: hidden` / `clip` 掩盖溢出；MUST NOT 以缩小字号、隐藏链接、截断姓名换取两栏。
