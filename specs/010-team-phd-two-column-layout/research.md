# Research: Team 页 PhD Candidates 双栏布局

**Date**: 2026-11-20 | **Status**: Complete（无遗留 NEEDS CLARIFICATION——断点、切分公式、行内顺序均已在 spec 澄清中定稿；技术栈沿用 001–009 现状）

本特性为纯表现层改动（组件模板 + scoped CSS），无数据、无依赖、无构建配置变更。以下 R1–R8 记录每个设计决策及其取舍；断点与容差数值以 spec 为唯一规范源，本文件仅在推导时引用。

## R1: 两栏结构的实现方式——服务端显式拆分 vs CSS 多列/单列表格

**调研结论（现状）**: `StudentGroup.astro` 的 PhD 分组当前为单个 `<ul>`，`li` 为 `flex-wrap` 两端分布行（姓名固定 5em、链接固定 6.5em、Since 由 `margin-left:auto` 推至右缘），与 FR-004「姓名 → Since → 链接」及两栏要求均不符。9 条数据当前按 grade 降序排序结果为：杨晨旭、顾佴彬、李雨晴（2022）→ 季慧山、郑明钰（2021）→ 张瀚文（2020）→ 李江楠、刘曦雨、刘正宵（无年级）。

**Decision**: 在组件 frontmatter 中按 `k = Math.ceil(n / 2)`（n ≥ 2）切分——左栏 `slice(0, k)`、右栏 `slice(k)`，依原排序顺序分别渲染为两个 `<ul>`，外层 `.phd-columns` 在 ≥768px 为两列网格（`repeat(2, minmax(0,1fr))`，`column-gap: 32px`，`align-items: start`）。n=1 时只渲染左栏并加 `.is-single`（单列占满整宽）；n=0 保持既有 "PhD candidates coming soon." 占位。

**Rationale**: 切分在构建期完成，5 + 4 的分布、左栏先排的阅读顺序、两栏顶线一致（两个 `<ul>` 同时起始于网格行 1）都可确定性验收；`ceil(n/2)` 同时满足「偶数均分、奇数左多 1」的澄清结论（FR-003）。空列表不渲染第二个 `<ul>`，天然满足「不渲染空栏」。

**Alternatives considered**:

- CSS 多列（`column-count: 2`）：列高平衡由浏览器启发式决定，无法保证 5/4，也无法保证「左栏先放前 5 条」；n=1 时还会产生空列或半宽列，否决。
- 单 `<ul>` + `grid-auto-flow: column` + 固定行数：行数需按 n 内联注入，且要在 <768px 切回按行流动，`li` 还需 subgrid 才能对齐 Since，复杂度和浏览器支持风险均高于收益，否决。
- 把两栏做成新组件或在 `team.astro` 中切分：仅为一次局部展示决策引入文件/跨层耦合，违反 YAGNI 与「改动收敛于 PhD 区域」，否决。

## R2: 行内三槽的对齐技术——固定轨道 Grid（两栏）+ 固定轨道 Flex（480–767px）+ 基线竖排（<480px）

**调研结论（现状）**: 现有行用 `flex-wrap` + `margin-left:auto` 实现「姓名居左、Since/备注靠右」，无法表达「Since 左对齐在固定第二列、链接贴右缘」；`<480px` 的既有堆叠规则（姓名自适应、Since 右对齐、链接 `order:9; flex:0 0 100%` 独占一行左对齐）与本特性澄清后的竖排要求一致，应原样沿用。

**Decision**:

- **≥768px（两栏）**：`li` 为 `display:grid`，`grid-template-columns: 4em 5em minmax(0,1fr)`，`column-gap: 8px`；`.student-name` 第 1 列、`.grade` 第 2 列、`.member-link` 第 3 列且 `justify-self:end`，`.note` 跨 `1 / -1` 另起一行。三个轨道前两个固定、第三个弹性，保证同一栏内 Since 左缘与链接右缘跨行同线（FR-005/FR-006）。
- **480–767px（单栏横向）**：沿用基线 `flex-wrap` 行并覆盖 PhD 槽位——`column-gap:8px`、姓名 `flex:0 0 4em`、Since `flex:0 0 5em; margin-left:0`、链接 `flex:0 0 auto; margin-left:auto; text-align:right`、备注 `flex:0 0 100%`。固定前缀轨道使 Since 起始线不随姓名/链接宽度漂移；`margin-left:auto` 使链接右缘贴齐行右缘。
- **<480px（单栏竖排，沿用现状）**：保留基线堆叠规则，仅以 `.phd-columns` 作用域规则确保其生效——姓名 `flex:0 0 auto`（自适应宽度、居左）、Since `margin-left:auto`（右对齐）、链接 `order:9; flex:0 0 100%; margin-left:0; text-align:left`（独占第 2 行、左缘与姓名左缘对齐）、备注 `flex:0 0 100%`（独占一行，位于链接之前）。DOM 顺序改动后该组规则仍产出「第 1 行姓名 + Since → 备注行 → 第 2 行链接」的既有阅读形态。
- **DOM 顺序（仅 PhD）**：姓名 → Since → 链接 → 备注。视觉顺序与 DOM 顺序一致，避免只靠布局属性制造阅读顺序。
- **列表分隔线衔接**：单栏时第二个 `<ul>` 的首行不再重复顶部分隔线（`ul + ul li:first-child { border-top:0 }`）；≥768px 两栏时恢复该顶线，使两列各有顶线且顶线一致。

**Rationale**: 三种形态各取最短路径——两栏用 Grid 才能在 768px 最紧档锁定 Since/链接两条竖线，不依赖各行链接文案宽度；480–767px 空间充裕（481px 行内可用 385px），Flex 固定前缀轨道即可同时满足「Since 第二列」与「链接贴右缘」；<480px 直接复用已验证的基线竖排，既满足澄清要求，也把移动端回归风险降到最低。

**Alternatives considered**:

- 全程 Flex：双栏时链接与 Since 的轨道宽度随标签文案变化，Since 左缘会因 Homepage/GitHub 宽度差漂移，违反 FR-005，否决。
- 全程 Grid：<768px 单栏时需要为竖排态再拆一套模板或覆写 Grid 行为，复杂度高于沿用基线，否决。
- 子网格（`subgrid`）让整栏共用轨道：可减少重复声明，但需把 `li` 变为 `display:contents` 或全栏共用网格，行分隔线与 24px 内距实现复杂、浏览器支持面更窄，违反 V，否决。

## R3: 768px 最紧档的槽宽反推与实测校核

**调研结论（计算）**: ≥768px 时内容区 = min(视口 − 48, 1132)（`.container` 1180px 含 24px 左右内距）；768px 档内容区 720px，两栏各 (720 − 32)/2 = **344px**，`li` 左右内距 24px 后行内可用 **296px**。

- 姓名「最多 4 个汉字」为数据维护既有上限（007 FR-021），基数字号 18px → 4em = 72px；
- `Since 2020` 为 0.95rem（17.1px），实测/估算约 83–84px → 5em = 90px；
- `Homepage ↗` 在 1em 下 007 已实测 **106.11px**；第三列为弹性轨道，768px 时 = 296 − 72 − 90 − 16 = **118px**，余量约 11.9px（11%）。
- 三槽 + 两间隙合计 72 + 8 + 90 + 8 + 106.11 ≈ **284.1px** < 296px（768px 两栏最紧档）；单栏横向态更宽松：767px 行内可用 671px，481px 为 385px（容器内距 24px），480px 为 400px（容器内距 16px），均远大于 284.1px，不会触发槽位折行。
- <480px 为竖排形态：375px 第 1 行可用 295px、320px 为 240px；当前姓名均 3 字（54px）+ 8px 间隙 + `Since YYYY`（约 84px）≈ 146px < 240px，姓名与 Since 同行且 Since 右对齐成立。

**Decision**: 槽宽定为姓名 `4em`、Since `5em`、间隙 `8px`，第三列 `minmax(0,1fr)`（双栏）/ `auto` + `margin-left:auto`（480–767px 单栏）；768px 以上余量继续增大，不另设断点；<480px 不设槽宽，沿用基线竖排。实现期用真实浏览器在 768px 档实测三个槽的 `getBoundingClientRect()`：若 Since 文本超出 5em，将 5em 收紧为「实测 Since 宽 + 4px」；若 `Homepage ↗` 仍超出第三列，再把列间隙由 8px 收至 4px；仍不足时记录实测值并上报。MUST NOT 反向增大 5em 轨道（会进一步压缩第三列），不得以缩小字号或换行标签换取两栏。

**Rationale**: spec Assumptions 明确要求「通过收紧姓名列、Since 列与字段间距保持单行三列」；4em/5em 分别对应「4 字姓名」与「Since + 4 位年份」，8px 间隙是保持三槽可辨的最小值，且 24px 内距不变以维持 FR-008 的跨区块对齐。768px 档保留 11.9px 链接余量与 11.9px 姓名余量（按 3 字姓名则更多），可容纳字体度量的小幅差异；480–767px 与 <480px 竖排各有充足余量，无需另设槽宽。

**Alternatives considered**:

- 姓名轨道 5em（007 既有）：768px 行内仅剩 56px 给姓名以外的弹性开销，3 字姓名可过但 4 字姓名必然换行，且余量过薄，否决。
- 姓名轨道 `max-content`/`auto`：各行姓名宽度不同 → Since 起始线漂移，直接违反 FR-005，否决。
- 链接轨道 6.5em（007 既有）居中：与 FR-006「贴齐栏右缘」冲突，且挤压 768px 档弹性余量，否决。

## R4: 单栏退化与 <480px 竖排沿用

**Decision**: 断点取 `@media (min-width: 768px)` 启用两栏；默认（<768px）单列。单列内部再按现状分两档：480–767px 保持横向三槽（固定前缀轨道、链接右对齐）；`@media (max-width: 479.98px)` 沿用基线竖排——第 1 行姓名居左、Since 右对齐，第 2 行链接独占一行并与姓名左缘对齐，姓名恢复自适应宽度。两种窄屏形态均不渲染空栏、半宽列或占位。

**Rationale**: 澄清结论要求「竖排阈值沿用现状（<480px）」，使本次分栏改动不改变已上线的手机阅读形态；480–767px 行内可用 385–671px，三槽（约 284px）可从容同行，无需折行。320px 竖排下第 1 行仅需约 146px（< 240px），链接第 2 行约 106px，均能单行容纳，不产生重叠或截断。

**Alternatives considered**:

- 在 <480px 继续强制三槽同行：240px 内物理上放不下（三槽约 284px），只能靠整项折行把链接挤出「第 2 行左对齐」的既定形态，与 US3 AS3 / FR-009 冲突，否决。
- 缩小字号/内距以在 <480px 强行同行：spec 明确禁止（字号与 24px 对齐均为范围之外或硬约束），否决。
- 在 320px 隐藏链接或截断标签：违反 FR-007/FR-010 与「标签保持单行」的可读性要求，否决。

## R5: 缺失字段与备注的渲染

**Decision**:

- **无年级**（李江楠、刘曦雨、刘正宵）：不渲染 `.grade`，第二列在 Grid 中保留空轨道（链接经显式 `grid-column:3` 定位），Flex 中直接跳过；不渲染 "Since"、破折号或空白占位文本（FR-005）。
- **无链接**（季慧山）：不渲染 `.member-link`，右侧区域为空，不渲染锚点、隐藏文本或占位符；姓名保持纯文本（FR-007）。
- **备注**（当前 9 人均无）：`note` 仍渲染，另起一行跨整栏（Grid `grid-column:1 / -1`；Flex `flex:0 0 100%`），不挤压链接右缘、不与姓名/年份重叠。

**Rationale**: 空轨道与省略渲染是「不伪造内容」的唯一干净做法（与 009 移除隐藏假徽标的教训一致）；备注放在整行下方是对「不得把链接挤出右缘」的最小满足方式，且无需为假设中的备注形态引入第四列。

**Alternatives considered**:

- 用 `&nbsp;`/`—` 占位保持槽宽：伪造内容且会被内容抽取与统计误计，否决。
- 备注放第三列链接左侧：会改变链接右对齐位置或挤压 768px 档余量，否决。

## R6: 验收方法与证据

**Decision**: 机器门禁为 `npm run check` + `npm run build`；布局验收用真实浏览器（DevTools 响应式模式）按 **1920 / 1440 / 1280 / 1024 / 768 / 767 / 576 / 481 / 480 / 375 / 320px** 十一档执行，测量项：两栏 `<ul>` 宽度差、顶线差（≤1px）、横向态 Since 左缘跨行差（≤1px）、链接右缘跨行差（≤1px）且与栏右缘 −24px 差（≤1px）、<480px 竖排态 Since 右缘跨行差（≤1px）与链接左缘—姓名左缘差（≤1px）、左栏姓名左缘与 `.grad-name` 左缘差（≤1px）、每条记录宽度 ≤ 内容区一半、逐元素 `getBoundingClientRect()` 越界与 `documentElement.scrollWidth ≤ innerWidth`。结果记录到 `evidence/layout-verification.md`。

**Rationale**: 纯 CSS 排版改动的判定含像素级对齐，真实浏览器测量是 Constitution VI 的硬性要求；不引入 Playwright/视觉回归（V / YAGNI，且上一特性已清理浏览器自动化依赖）。

**Alternatives considered**:

- 仅静态阅读 CSS 推断：Constitution VI 明确禁止，否决。
- 引入截图对比框架：对单页局部改动属过度工程，否决。

## R7: 宪法合规与改动范围

**Decision**: 唯一源文件为 `src/components/StudentGroup.astro` 的 PhD 分支与新增 `.phd-columns` 作用域样式；`students.json`、schema、`team.astro`、`global.css`、Master's 分支、Graduates 与其余页面零改动；零新依赖、零新 JS。

**Rationale**: 与 Constitution I（展示内容原样复用数据，不改写信息）、II（展示与数据分离，未来成员增删只改数据文件）、III（静态构建不变）、IV（无新视觉元素、无动效）、V（最小改动）一致；VI 通过真实浏览器十一档矩阵与逐元素越界检查满足，且不使用页面级 `overflow-x: hidden` 掩盖。

## R8: 数据快照

**Decision**: 以 2026-11-20 的 `src/data/students.json` 为唯一数据基准，排序与切分结果如下（左栏 5 / 右栏 4）：

| 序号 | 姓名 | Since | 链接标签 |
| --- | --- | --- | --- |
| 1 | 杨晨旭 | 2022 | Homepage |
| 2 | 顾佴彬 | 2022 | Homepage |
| 3 | 李雨晴 | 2022 | Homepage |
| 4 | 季慧山 | 2021 | —（无链接） |
| 5 | 郑明钰 | 2021 | GitHub |
| 6 | 张瀚文 | 2020 | GitHub |
| 7 | 李江楠 | —（无年级） | GitHub |
| 8 | 刘曦雨 | —（无年级） | Scholar |
| 9 | 刘正宵 | —（无年级） | GitHub |

**与 spec 的一致性**: spec US2 AS4 / AS5、Edge Cases 与 FR-010 已按数据修正并一致——无年级者为李江楠、刘曦雨、刘正宵；季慧山 `grade=2021`、无链接；6 条 Since、8 个链接。验收以数据与 FR-010 为准。

**Rationale**: Constitution I 要求展示信息与权威数据一致；本表同时作为两栏切分与计数的验收基准。
