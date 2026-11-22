# Contract: Team 页 Master's Students 双栏布局（team-master-two-column）

**Date**: 2026-11-21 | **Spec**: [spec.md](../spec.md) | **消费方**: Master's 分组实现与验收（[quickstart.md](../quickstart.md)） | **视图实体**: [data-model.md](../data-model.md)

本契约对象是 Team 页（`/team/`）Master's Students 区域的**界面布局行为**：栏数随视口切换、栏内切分与排序、行内槽位几何、缺失字段的空白语义、字号与对齐容差，作为后续样式改动的回归基线。断点与容差数值以 spec 为唯一规范源；本契约记录实现层取值。

## 1. 视口行为矩阵（MUST）

| 视口 | 栏数 | 行内形态 | 备注 |
| --- | --- | --- | --- |
| 1920px | 2（左右各 1 份列表） | 姓名 / Since / 成员链接 同一行三槽 | 容器 1180px（内容区 1132px）上限约束，两栏随之上限 |
| 1440px | 2 | 同上 | SC-001 档 |
| 1280px | 2 | 同上 | |
| 1024px | 2 | 同上 | |
| **768px** | 2 | 同上（最紧档，三槽仍单行） | 与教师名片单列断点同阈值；下方即切换 |
| **767px** | 1 | 同上 | 边界切换验证点 |
| 576px | 1 | 同上 | |
| 481px | 1 | 同上 | 容器内距 24px，行内可用 385px |
| **480px** | 1 | 同上 | 容器内距 16px（≤480），行内可用 400px |
| **375px** | 1 | 竖排：第 1 行姓名 + Since 右对齐；第 2 行链接左对齐（若有） | <480 竖排形态 |
| **320px** | 1 | 同上 | 最窄档，第 1 行可用 240px |

任何档位 MUST NOT 出现空栏、半宽列、表头行或栏间竖线；横向态（≥480px）任何档位的槽位折行均按布局破损处理。当前 11 条记录无链接，竖排态只渲染第 1 行。

## 2. 排序与分栏规则（FR-001～FR-003）

- 排序对象：两个在读分组共用的 `byLevel` 结果；比较器为 `grade` **升序**（2024 → 2026）→ 无年级最后 → 同级保持 `students.json` 条目顺序；排序 MUST NOT 改写数据文件。
- 当前 Master's 升序：朱祉同、张蓓泽、叶振雷（2024）｜艾明旭、刘润泽（2025）｜刘梦犁、张蓬月、顾树焕、温泽林、李佳睿、毛乐平（2026）。
- 切分对象：已排序的 master 数组；切分 MUST NOT 改变排序。
- `n ≥ 2`：`k = ceil(n/2)`，左栏 = 前 k 条，右栏 = 其余；当前 11 条 → **6 + 5**（左：朱祉同、张蓓泽、叶振雷、艾明旭、刘润泽、刘梦犁；右：张蓬月、顾树焕、温泽林、李佳睿、毛乐平）。
- `n = 1`：仅左栏 1 条、占单栏整宽（`.master-columns.is-single`），不渲染第二个 `<ul>`。
- `n = 0`：保留 "Master's students coming soon." 占位，不渲染 `.master-columns`。
- 标题 "Master's Students"（`h3`）MUST 只出现一次，横跨内容区全宽并位于两栏上方。
- 两栏宽度差 ≤1px、顶线差 ≤1px、栏间距 32px；每条记录宽度 ≤ 内容区一半（容差 1px）。
- 两栏宽度与栏间距 MUST 与 PhD Candidates 分组一致（同一份样式声明；PhD 19 条升序 10 + 9，仅回归观察）。

## 3. 行内槽位几何（FR-004～FR-006）

### 3.1 ≥768px（两栏，Grid 行）

| 槽 | 轨道 | 对齐 | 说明 |
| --- | --- | --- | --- |
| 姓名 `.student-name` | `minmax(4em, 1fr)` | 左对齐 | 第 1 列；在 4em 最小宽度基础上弹性吸收余量；超长在槽内换行 |
| Since `.grade` | `5.5em`（固定，99px） | 左对齐 | 第 2 列；字号显式 `18px`（站点根字号 16px，`1rem` = 16px，MUST NOT 使用）；`Since YYYY` 文本宽度 MUST ≤ 5.5em |
| 链接 `.member-link` | `auto`（按内容） | `justify-self: end`（右缘贴齐） | 第 3 列；宽度按内容收缩，不换行；缺失时轨道宽 0 |

- 列间隙 `column-gap: 8px`；行内距 `padding: 8px 24px`（左右对称）。
- 768px 档反推（行内可用 296px）：无链接时姓名轨 = 296 − 99 − 16 = **181px**，Since 左缘 213px、右缘 312px，距 li 内容右缘 **8px**；有链接时姓名轨 = 296 − 99 − W − 16，Since 右缘与链接左缘恒为 8px，链接右缘贴齐内容右缘；最大链接（`Homepage ↗`，108.16px）下姓名轨 72.84px（≥4em=72px）；按 4em 下限计最小需求 295.16px ≤ 296px（余 0.84px）。
- 当前 11 人均无链接：第三轨宽 0，11 行 Since 左缘同线；`Since 2026` 在 18px 下 MUST 单行落在 5.5em 槽内（768px 实测复核）。
- 缺失年级的行：第 2 列保留空轨道，链接仍由显式 `grid-column: 3` 定位；不渲染任何占位文本。
- 缺失链接的行（当前全部）：第 3 列留空，不渲染锚点或隐藏文本；姓名仍为纯文本。
- **混排栏说明**：PhD 存在「有链接 / 无链接」混排的栏；按本契约，有链接行的 Since 随该行链接宽度左移（与链接保持 8px），故 Since 左缘同线只在链接槽占用一致的行组内判定（见 §6）。

### 3.2 480–767px（单栏，横向 Flex 行）

| 槽 | 规则 | 对齐 |
| --- | --- | --- |
| 姓名 | `flex: 1 1 4em` | 行首，左对齐，吸收余量 |
| Since | `flex: 0 0 5.5em; margin-left: 0`（99px） | 姓名右侧 8px，随视口变宽整体右移 |
| 链接 | `flex: 0 0 auto; text-align: right` | 行右缘（扣除 24px 内距） |

- 列间隙 MUST 为 `column-gap: 8px`（覆盖基线的 10px）；行内顺序 MUST 为「姓名 → Since → 链接」；行内可用宽 ≥385px，三槽 MUST 单行、不得折行。
- 无链接行：姓名吸收余量，Since 右缘即行内容右缘（尾隙 0，满足 ≤8px）。

### 3.3 <480px（单栏，竖排两行）

| 槽 | 规则 | 对齐 |
| --- | --- | --- |
| 姓名 | `flex: 0 0 auto`（自适应宽度） | 第 1 行行首，左对齐 |
| Since | `margin-left: auto` | 第 1 行右缘（扣除 24px 内距） |
| 链接 | `order: 9; flex: 0 0 100%; margin-left: 0; text-align: left` | 第 2 行独占整行，左缘与姓名左缘对齐 |

- 该形态即基线已有的手机阅读形态，本特性 MUST 保留其阅读顺序与对齐，仅随 DOM 顺序调整保持等价结果。

## 4. DOM 契约

```text
div.student-group                     （既有容器）
├── h3                                "Master's Students"
└── div.master-columns[.is-single]    （新包装层，n=0 时不存在）
    ├── ul  → li × ceil(n/2)          左栏
    │    └── span.student-name
    │        [span.grade]             "Since <grade>"
    │        [a.member-link]          "Homepage|GitHub|Scholar ↗"
    └── ul  → li × floor(n/2)         右栏（n=1 时不渲染）
```

- 顺序即视觉顺序；不新增表头、列标题、占位元素或第二个 `<h3>`。
- 同一 DOM 承载三种形态：≥768px 两栏网格、480–767px 单栏横向、<480px 单栏竖排（姓名 + Since 同行、链接次行）。
- 单栏时第二个 `<ul>` 首行不重复顶部分隔线；≥768px 两栏时两个 `<ul>` 各自保留顶线，使两列顶线一致。
- `a.member-link` 仅在存在已选链接字段时渲染，`href` 原样复用数据；`target="_blank" rel="noopener"` 不变。
- `.student-name` MUST NOT 为 `<a>`，MUST NOT 带可点击事件。
- 每行 MUST NOT 包含空文本节点以外的占位：无 "Since"、破折号、`N/A`、`&nbsp;`。
- **PhD 分组 DOM 除移除 `note` 外 MUST 保持 010 现状**：`.phd-columns` 包装、两个 `<ul>`、行内顺序姓名 → Since → 链接；本特性不得删除、重命名或复用其余类名。
- **样式共享契约**：`.master-columns` MUST 与 `.phd-columns` 命中同一组声明（选择器并列）；断点与槽宽逐条一致；本特性允许且仅允许四处调整——`byLevel` 升序（排序，非样式）、姓名轨 `minmax(4em,1fr)`（及 480–767px 的 `flex: 1 1 4em`）、480–767px Since 槽 `flex: 0 0 5em → 5.5em`、`.grade` 字号 `18px`。此处「三槽结构不变」指槽位数量与顺序不变，不限制上述轨道宽度调整。

## 5. 收纳与竖排声明

- **姓名超长**（>4 字，含无空格拉丁字符串）：横向态在姓名轨内换行收纳（实现以 `overflow-wrap: break-word` 保证无空格姓名可断行），不得越入 Since 列或挤压链接，不得溢出栏边界；竖排态自适应宽度，必要时自然换行。
- **链接标签**：MUST 保持单行（`Homepage ↗` / `GitHub ↗` / `Scholar ↗`）；宽度由弹性余量容纳，不使用 `white-space:nowrap` 防溢出。
- **<480px 竖排形态**：第 1 行姓名独立、Since 右对齐；第 2 行链接独占一行、左对齐。该形态是 spec FR-002/FR-004 明确保留的现状设计，不是折行异常，也不计为布局破损。

## 6. 对齐不变量与测量口径（SC-001～SC-004、SC-007）

| 测量项 | 判据 |
| --- | --- |
| 两栏宽度 | 两个 `<ul>` 的 `getBoundingClientRect().width` 差 ≤1px |
| 两栏顶线 | 两个 `<ul>` 首个 `li` 的上边缘差 ≤1px |
| 栏外缘 | 左栏左缘与内容区左缘、右栏右缘与内容区右缘差 ≤1px |
| 栏距 | 右栏左缘 − 左栏右缘 = 32px |
| Since 左缘（横向态） | 同栏内链接槽占用一致的行 `.grade` 左缘差 ≤1px；Master's 当前 11 行全部无链接，MUST 全同线 |
| Since 右移（横向态） | `.grade` 左缘随视口变宽单调不减；达到容器 1180px 上限（内容区 1132px）后保持不变 |
| Since↔链接间隙 | 有链接行：`.grade` 右缘与 `.member-link` 左缘差 8px±1px |
| 无链接尾隙 | `.grade` 右缘与 `li` 内容右缘差 ≤8px（Master's 当前 8px） |
| 链接右缘（横向态） | 同栏内所有 `.member-link` 右缘差 ≤1px，且与 `ul` 右缘 −24px 差 ≤1px（当前无实例，以注入验证） |
| Since 右缘（竖排态） | 所有 `.grade` 右缘差 ≤1px，且与 `ul` 右缘 −24px 差 ≤1px |
| 链接左缘（竖排态） | 所有 `.member-link` 左缘与同行 `.student-name` 左缘差 ≤1px |
| 跨区块姓名 | Master's 左栏 `.student-name` 左缘与 `.phd-columns .student-name`、`.grad-name` 左缘差 ≤1px（三种状态） |
| 记录宽度 | 横向态任一 `li` 宽度 ≤ 内容区宽度 / 2（容差 1px；单栏不限） |
| 分组一致性 | Master's 两栏 `<ul>` 宽度与 PhD 两栏 `<ul>` 宽度差 ≤1px（同视口、同内容区） |
| 字号 | `.grade` 计算字号 = 18px（显式单位，容差 ≤0.5px）；PhD 与 Master's 一致 |
| 破损 | 逐元素 `getBoundingClientRect()` 不越出视口；`documentElement.scrollWidth ≤ window.innerWidth`；无重叠、截断、内容溢出 |

## 7. 回归范围与不变量

- **零改动**：`src/data/students.json`、`src/content.config.ts`、`src/pages/team.astro`、`src/styles/global.css`、`TeacherCard.astro`、PhD 分支 DOM/类名/断点/栏距/三槽结构、Graduates 名单及其排序、Faculty 区块、其余页面；范围核对以特性起点快照为基线，工作区既有的数据更新不属于本特性并显式排除（spec Clarifications 2026-11-21）。
- **零新增**：依赖、运行时 JS、构建配置、CI 步骤、组件文件、公共 CSS 层。
- **视觉基调**：色板、分隔线（`1px solid var(--line)`）、链接箭头 `↗` 与 hover 行为不变；唯一字号变化为 Since 的显式 `18px`（spec FR-013）。
- **不掩盖**：MUST NOT 以页面级 `overflow-x: hidden` / `clip` 掩盖溢出；MUST NOT 以缩小字号、隐藏链接、截断姓名换取两栏。
