# Research: Team 页 Master's Students 双栏布局

**Date**: 2026-11-21 | **Status**: Complete（无遗留 NEEDS CLARIFICATION——断点、切分公式、排序方向、行内槽位与字号均已在 spec Clarifications 2026-11-21 定稿；010 已给出可复用的实现基线；技术栈沿用 001–010 现状）

本特性为纯表现层改动（组件模板 + scoped CSS），无数据、无依赖、无构建配置变更。以下 R1–R8 记录每个设计决策及其取舍；断点与容差数值以 spec 为唯一规范源，本文件仅在推导时引用。

**本版更新范围**：相对澄清前的草案，本文件按最新 spec 重写了排序方向（grade **升序**，FR-003）、Since 字号（显式 `18px`，FR-013）、姓名列弹性与第二列右移（FR-005）、以及相应的验收口径（SC-004 / SC-007）。

## R1: 与 010 版式的复用方式——共享声明 vs 复制样式 vs 重命名包装类

**调研结论（现状）**: `StudentGroup.astro` 已为 PhD 实现完整的 `.phd-columns` 布局（两栏网格、三槽 Grid/Flex、<480px 竖排）。Master's 分支已按 010 的旧规则接入 `.master-columns` 包装与两栏切分，但排序仍为 `grade` 降序、姓名固定 `4em`、Since 字号 `0.95rem`，与最新 spec 的三项调整不符。

**Decision**: 保留 `.phd-columns` 与 `.master-columns` 两个包装类，继续让二者命中同一组声明（选择器并列）；在共享声明上做三处受控修改，且**对 PhD 与 Master's 同时生效**：

1. `byLevel` 排序改为 `grade` 升序 → 无年级最后 → 同级保持数据文件顺序（FR-003）；
2. ≥768px 行内三轨由 `4em 5em minmax(0,1fr)` 改为 `minmax(4em,1fr) 5.5em auto`（Since 槽 99px，为 18px 文本约 90px 留余量）；480–767px 单栏横向行的姓名由 `flex: 0 0 4em` 改为 `flex: 1 1 4em`（FR-005）；
3. `.grade` 字号由 `0.95rem`（15.2px）改为显式 `18px`（FR-013；站点根字号为 16px，`1rem` 只有 16px，MUST NOT 用 `1rem`，也不得修改 `html` 根字号）。

不重命名 `.phd-columns`、不给 Master's 复制独立样式块、不新增公共 CSS 层：前者会作废 010 的证据锚点，中者形成两套事实来源，后者违反 YAGNI。

**Rationale**:

- Master's 与 PhD 的栏宽/栏距/槽位要求视觉一致（US1 AS4），共享同一份声明是唯一不产生漂移的实现方式。
- 三项调整都是 spec 明确要求跨两个分组统一的规则（FR-003 / FR-005 / FR-013），共享后未来只需改一处。
- PhD 的 DOM、类名、断点阈值与三槽结构不变，符合 FR-011「PhD 其余版式零改动」。

**Alternatives considered**:

- **复制 `.phd-columns` 全部规则为 `.master-columns` 独立样式块**：约 90 行重复，三项共享调整需双写，长期漂移风险高；否决。
- **把 `.phd-columns` 重命名为中性的 `.student-columns`**：改变 PhD DOM 类名并作废 010 的查询契约，违反 SC-006，否决。
- **Master's 直接复用 `.phd-columns` 类名**：页面出现两个 `.phd-columns`，010 回归脚本失真，且语义错误，否决。

## R2: 排序、两栏拆分与 DOM 结构

**调研结论（数据）**: Master's 共 11 条，`grade` 均为 2024–2026、无链接；`note` 字段已移除。数据文件顺序为 2026 级 6 人在前、2025 级 2 人、2024 级 3 人在后。按 FR-003 的 `grade` 升序、无年级最后、同级稳定排序后：

- 2024：朱祉同、张蓓泽、叶振雷（数据文件顺序）
- 2025：艾明旭、刘润泽
- 2026：刘梦犁、张蓬月、顾树焕、温泽林、李佳睿、毛乐平

PhD 共 19 条（4 条链接），同一比较器升序后为 2021 → 2026；`ceil(19/2)=10`，左 10 / 右 9，链接 4 人全部落在左栏（仅作回归观察，不是本特性的验收对象）。

**Decision**:

- `byLevel(level)` 的组内比较器改为：两侧均有 `grade` 时 `localeCompare` 升序；一侧为空时非空在前、空值在后；两侧均为空返回 0。`Array.prototype.sort` 在 Node 18+ 为稳定排序，同级自然保持数据文件顺序（不引入额外 tiebreak 字段，不改数据文件）。
- frontmatter 新增与 PhD 同构的 `masterColumns`：`n ≥ 2` 时 `k = ceil(n / 2)`，左栏 `slice(0, k)`、右栏 `slice(k)`；`n = 1` 时 `[master]` 且 `masterSingle = true`；`n = 0` 保持既有占位分支，不渲染 `.master-columns`。当前 11 条 → **左 6（朱祉同、张蓓泽、叶振雷、艾明旭、刘润泽、刘梦犁）/ 右 5（张蓬月、顾树焕、温泽林、李佳睿、毛乐平）**。
- 每个 `<ul>` 内行的 DOM 顺序为「姓名 → Since → 链接」，与视觉顺序一致；Astro 模板中缺失字段不渲染元素。
- 外层包装 `<div class:list={['master-columns', { 'is-single': masterSingle }]}>`；`h3` 只出现一次、位于包装层上方。

**Rationale**: 构建期排序与切分使「升序 + 6/5 分布 + 左栏先排」可确定性验收；`ceil(n/2)` 满足「偶数均分、奇数左多 1」（FR-003）；空列表不渲染包装层，天然满足「不渲染空栏」。

**Alternatives considered**:

- CSS 多列（`column-count: 2`）：列高平衡由浏览器启发式决定，无法保证 6/5 与左栏先排，n=1 还会产生空列，否决。
- 单 `<ul>` + `grid-auto-flow: column` + 固定行数：行数需内联注入，切回单栏还需改流动方向，复杂度和风险高于收益，否决。
- 在数据文件中预先排序或新增 `order` 字段：违反 FR-003「排序仅为展示层派生，不改写数据文件」与 Constitution II，否决。
- 新组件承载两栏名单：spec 禁止新增组件，且 PhD 已有同款实现，否决。

## R3: 768px 最紧档的槽宽复核与第二列右移

**调研结论（计算）**: 容器上限 1180px、行内左右内距 24px。768px 档内容区 = 768 − 48 = 720px，两栏各 (720 − 32) / 2 = **344px**，`li` 扣除两侧 24px 后行内可用 **296px**。

≥768px 三轨为 `minmax(4em, 1fr) 5.5em auto`（Since 槽 99px），相邻轨道列间隙 8px（3 轨共 2 条间隙 = 16px）：

- **Master's 当前无链接**：第三轨 `auto` 宽度为 0，姓名轨 = 296 − 99 − 16 = **181px**；姓名左缘距 li 左缘 24px，Since 左缘 213px、右缘 312px，距 li 内容右缘 **8px**（FR-005 允许 ≤8px 尾隙）。18px 下 `Since YYYY` 约 90px（010 实测 `Since 2022` 在 0.95rem/15.2px 下 76px，按 18px 线性折算约 90px），落在 5.5em = 99px 槽内并留约 9px 余量；实现期仍 MUST 在 768px 逐行复核单行显示。
- **未来有链接**：设链接盒宽 W，姓名轨 = 296 − 99 − W − 16，Since 左缘 = 24 + 姓名轨 + 8，Since 右缘与链接左缘恒为 8px（列间隙），链接右缘贴齐 li 内容右缘。按 010 实测 `Homepage ↗` = 108.16px（正文 18px），姓名轨 72.84px，高于 4em = 72px 下限，三槽可单行容纳；按 4em 下限计最小需求 72 + 8 + 99 + 8 + 108.16 = 295.16px ≤ 296px，余 0.84px（实际由 1fr 吸收至 296px）。
- **480–767px 单栏横向行**：行内可用宽 767px 档 671px、481px 档 385px、480px 档 400px，均远大于三槽合计；姓名 `flex: 1 1 4em` 吸收余量，Since 与链接随行宽变宽整体右移，链接右缘贴齐行内容右缘，无链接时 Since 右缘即行内容右缘（尾隙 0 ≤ 8px）。
- **<480px 竖排**：375px 档第 1 行可用约 295px、320px 档约 240px；3 字姓名约 54px + 间距 + `Since 2026` 约 90px ≈ 154px < 240px，姓名与 Since 同行且 Since 右对齐成立。

**Decision**: 采用 `minmax(4em, 1fr) 5.5em auto` + `column-gap: 8px` + `padding: 8px 24px`；480–767px 用 `flex: 1 1 4em` 的姓名列与 `flex: 0 0 5.5em` 的 Since 实现同样的右移；不新增断点或内距数值。实现期 MUST 在 768px 档实测三槽矩形，若链接标签（18px）超过 109px（296 − 72 − 99 − 16）导致姓名轨跌破 4em 或折行，按缺陷处理；MUST NOT 反向缩小字号、换行标签或隐藏链接。

**对齐口径（与 010 的差异，需在验收中按此解释）**:

- 「同栏 Since 左缘 ≤1px」在**链接槽占用一致**的行之间成立：Master's 当前 11 行全部无链接，第三轨恒为 0，全部行 Since 左缘同线；单栏 480–767px 同理。
- PhD 存在「有链接 / 无链接」混排的栏：按 FR-005 的 8px 规则，有链接行的 Since 会随该行链接宽度整体左移，与同栏无链接行不再同线（差额 = 该行链接盒宽，`Homepage ↗` 010 实测 108.16px）。这是 Clarifications Q3/Q5 明确要求的「Since 与链接保持 8px、姓名列弹性吸收余量」的直接结果，优先于 010 的固定 `4em` 槽对齐。若后续要求 PhD 混排栏也严格同线，需要另行决策（例如为整列预留链接槽或引入 subgrid），不在本特性范围内。
- 因此验收时对 Master's 与「链接槽占用相同」的行组测 Since 左缘；对 PhD 混排栏改测「有链接行链接左缘与 Since 右缘 8px±1px」与「无链接行 Since 右缘距行右缘 ≤8px」。

**Rationale**: spec Assumptions 要求「同上一个 feature」的断点、栏距、均分与内距，同时 Clarifications 要求第二列随视口右移；共享声明（R1）保证两组数值不分叉。

**Alternatives considered**:

- 保留 010 的 `4em 5em minmax(0,1fr)`：Since 固定在姓名右侧 4em 处、不随视口右移，与 FR-005/SC-004 的「整体右移」冲突，否决。
- 姓名轨 `max-content`：Since 位置由最长姓名决定，短姓名行出现大空隙，且不随视口单调右移，否决。
- 为整列预留固定链接槽（如 `7.5em`）+ `min-width` 链接：可让混排栏 Since 同线，但 768px 档 PhD 三槽合计会超过 296px 可用宽，且无链接行出现大尾隙，否决。
- 引入 subgrid 让同栏各行共享轨道：能对齐但复杂度与风险明显高于单页局部收益，违反 Constitution V，且 plan 已声明不引入额外机制，否决。

## R4: 单栏退化与 <480px 竖排

**Decision**: 直接继承 010 的三态，仅按 FR-005 调整横向行的姓名弹性：

- **≥768px**：`.master-columns` 为两列网格（`repeat(2, minmax(0,1fr))`、`column-gap: 32px`、`align-items: start`），两栏顶线一致；`.is-single` 回到单列整宽。
- **480–767px**：单列，行内 flex——姓名 `flex: 1 1 4em`、Since `flex: 0 0 5.5em; margin-left: 0`、链接 `flex: 0 0 auto; text-align: right`（姓名吸收余量后链接自然贴齐行右缘）；两个 `<ul>` 连续堆叠，第二个列表首行不重复顶线。
- **<480px**：单列竖排——姓名自适应、Since `margin-left: auto` 右对齐；链接 `order: 9; flex: 0 0 100%; margin-left: 0; text-align: left` 独占第 2 行、左缘与姓名左缘对齐。当前 11 人无链接，只渲染第 1 行。

**Rationale**: 三种形态由同一 DOM 经媒体查询切换，阅读顺序与对齐与 PhD 完全等价；<480px 是既有手机形态，保留可把移动端回归风险降到最低。

**Alternatives considered**:

- 在 <480px 强制三槽同行：240px 内放不下约 284px 的三槽，只能折行，违反 US3 AS3 与 FR-002/FR-009，否决。
- 为 Master's 另设 640px 等中间断点：spec 要求与 PhD 完全一致，否决。
- 单栏时用 `margin-left: auto` 代替姓名弹性：Since 会被推至右缘而姓名列不增长，Since 左缘仍固定，无法实现 FR-005 的右移，否决。

## R5: 缺失字段与边界数据

**Decision**:

- **无年级**（当前无实例）：不渲染 `.grade`；横向态第二列保留空轨道（链接由显式 `grid-column: 3` 定位），竖排态第 1 行仅姓名；不渲染 "Since"、破折号或空白占位（FR-005）。
- **无链接**（当前 11 人全部）：不渲染 `.member-link`，第三轨宽度为 0，Since 右缘距行内容右缘 8px；不渲染锚点、隐藏文本或占位；姓名保持纯文本（FR-007）。
- **空名单**：沿用 "Master's students coming soon." 占位并占满整行，不渲染 `.master-columns`。
- **n=1**：仅左栏 1 条 + `.is-single`，记录占满内容区整宽，不渲染空右栏。
- **超长姓名**（含无空格拉丁串）：在姓名轨内 `overflow-wrap: break-word` 换行收纳，不越入 Since 列、不溢出栏边界；链接标签保持单行。
- **容器 1180px 上限（内容区 1132px）**：超宽视口下两栏宽度与 Since 位置不再继续增大，仍等宽、顶线一致。

**Rationale**: 省略渲染是「不伪造内容」的唯一干净做法（与 009 移除隐藏假徽标的教训一致）；共享 PhD 的声明使以上行为自动一致。

**Alternatives considered**:

- 用 `&nbsp;`/`—` 占位保持槽宽：伪造内容且会被内容抽取与统计误计，否决。

## R6: 验收方法与证据

**Decision**: 机器门禁为 `npm run check` + `npm run build`；布局验收用真实浏览器（DevTools 响应式模式）按 **1920 / 1440 / 1280 / 1024 / 768 / 767 / 576 / 481 / 480 / 375 / 320px** 十一档执行，测量项：

- 计数：`.master-columns` 内 11 行、2 个 `<ul>`（6 + 5）、11 个 `.grade`、0 个 `.member-link`、1 个 "Master's Students" 标题、0 个姓名链接；行序为升序（朱祉同、张蓓泽、叶振雷、艾明旭、刘润泽、刘梦犁 ｜ 张蓬月、顾树焕、温泽林、李佳睿、毛乐平）。
- 两栏：宽度差 ≤1px、顶线差 ≤1px、栏距 32px、外缘与内容区差 ≤1px、单条宽度 ≤ 内容区一半（≥768px）。
- 横向态：同栏 `.grade` 左缘跨行差 ≤1px（Master's 当前全无链接，第三轨恒为 0）；`.grade` 左缘随视口变宽单调右移（1180px 上限后不变）；链接注入后链接左缘与 Since 右缘差 8px±1px、链接右缘与栏右缘（扣除 24px）差 ≤1px；无链接行 Since 右缘距行内容右缘 ≤8px。
- 字号：1440 与 768px 下 `.grade` 计算字号为 18px（显式单位，容差 ≤0.5px）；其余文本与 010 一致（SC-007）。
- 竖排态：`.grade` 右缘跨行差 ≤1px；链接左缘与姓名左缘差 ≤1px。
- 跨区块：Master's 左栏 `.student-name` 左缘与 `.phd-columns .student-name`、`.grad-name` 左缘差 ≤1px。
- 破版：逐元素 `getBoundingClientRect()` 不越出视口，`documentElement.scrollWidth ≤ window.innerWidth`，无重叠、截断、内容溢出、非预期换行。
- 回归：PhD 两栏结构不变、19 条升序 10 + 9、4 条链接；Since 字号同为 18px；Graduates 与其他页面无变化。

结果记录到 `evidence/layout-verification.md`。链接右缘与 8px 间隙因当前 0 链接无法直接测量，验收时在 Console 临时向同栏两行注入 `.member-link` 后测量右缘差与 Since↔链接间隙，随后刷新还原（数据文件不变）。

**Rationale**: 纯 CSS 排版改动的判定含像素级对齐，真实浏览器测量是 Constitution VI 的硬性要求；不引入 Playwright/视觉回归（V / YAGNI，仓库既有测试仅覆盖 Markdown 控件）。

**Alternatives considered**:

- 仅静态阅读 CSS 推断：Constitution VI 明确禁止，否决。
- 引入截图对比框架：对单页局部改动属过度工程，否决。
- 沿用澄清前的 evidence：其排序、字号与槽位均按旧规则测量，不能作为本版验收证据，否决；须在实现后整份重测。

## R7: 宪法合规与改动范围

**Decision**: 唯一源文件为 `src/components/StudentGroup.astro`：`byLevel` 比较器、Master's 分支的 DOM 与 `.master-columns` 包装、共享选择器的三处调整（姓名轨、Since 字号、480–767px 姓名弹性）；`students.json`、schema、`team.astro`、`global.css`、PhD 分支 DOM/类名、Graduates 与其余页面零改动；零新依赖、零新 JS、零新组件。数据更新（students / graduates）已作为独立 commit `54f3b81` 在特性前提交，不属于本特性。

**Rationale**: 与 Constitution I（展示内容原样复用数据，不改写信息；排序只是展示层派生）、II（展示与数据分离，未来成员增删只改数据文件）、III（静态构建不变）、IV（无新视觉元素、无动效；唯一字号变化是 spec 明确要求的 Since 18px）、V（单文件、复用既有声明）、VI（真实浏览器十一档矩阵与逐元素越界检查，不使用页面级 `overflow-x: hidden`）一致。

## R8: 数据快照（升序）

**Decision**: 以数据独立提交 `54f3b81` 的 `src/data/students.json` 为唯一数据基准。Master's Students 共 **11** 条（2024 级 3 人、2025 级 2 人、2026 级 6 人），均有 `grade`、无链接；`note` 字段已移除；按 FR-003 升序与 `ceil(11/2)=6` 的切分结果：

| 全局序 | 姓名 | Since | 链接标签 | 栏 | 栏内序 |
| --- | --- | --- | --- | --- | --- |
| 1 | 朱祉同 | 2024 | —（无链接） | 左 | 1 |
| 2 | 张蓓泽 | 2024 | —（无链接） | 左 | 2 |
| 3 | 叶振雷 | 2024 | —（无链接） | 左 | 3 |
| 4 | 艾明旭 | 2025 | —（无链接） | 左 | 4 |
| 5 | 刘润泽 | 2025 | —（无链接） | 左 | 5 |
| 6 | 刘梦犁 | 2026 | —（无链接） | 左 | 6 |
| 7 | 张蓬月 | 2026 | —（无链接） | 右 | 1 |
| 8 | 顾树焕 | 2026 | —（无链接） | 右 | 2 |
| 9 | 温泽林 | 2026 | —（无链接） | 右 | 3 |
| 10 | 李佳睿 | 2026 | —（无链接） | 右 | 4 |
| 11 | 毛乐平 | 2026 | —（无链接） | 右 | 5 |

**说明**: 数据更新（新增 11 位硕士、15 位博士，5 位原 PhD 转入 Graduates）已在特性开始前作为独立 commit `54f3b81` 提交，不属于本特性；本表同时作为计数与切分验收基准；未来数据变化时以数据文件与 FR-003/FR-010 的规则为准，不锁定具体姓名。

**Rationale**: Constitution I 要求展示信息与权威数据一致；本表用于核对「11 条完整呈现、11 个 Since、0 链接、0 个 note 字段」，并与 spec FR-003 的名单逐字一致。
