# Research: Team 页布局优化与移动端修复

**Date**: 2026-10-12（rev：R6 按 spec 2026-10-12 GitHub 澄清回填修订，新增 R7） | **Status**: Complete（无遗留 NEEDS CLARIFICATION——技术栈由用户确认沿用现状，所有未知项已在代码调研中解决）

## R1: 移动端教师卡片右侧裁切——根因与修复方案

**调研结论（根因）**: `src/pages/team.astro` 的 `.teacher-grid` 使用 `grid-template-columns: repeat(auto-fill, minmax(420px, 1fr))`。375px 视口下容器可用宽度 = 375 − 2×16（`.container` 在 ≤480px 时 padding-inline 16px）= 343px < 420px 最小列宽 → 网格轨道溢出容器；`src/styles/global.css` 中 `body { overflow-x: hidden }`（FR-014 防横向滚动）将溢出部分直接裁切且无滚动条 → 卡片右侧内容不可见。主页 `index.astro` 的同名网格用 `minmax(320px, 1fr)`（343px ≥ 320px）所以手机上不溢出，这解释了缺陷只出现在 Team 页。

**Decision**: 教师网格最小列宽改为 `minmax(min(420px, 100%), 1fr)`。

**Rationale**: `min(420px, 100%)` 保证轨道最小宽度永不超过容器宽度——宽视口（≥~900px）维持现状两列，窄视口自动降为恰好贴合容器的单列，全部宽度区间连续自适应，一行声明解决，无断点维护成本。同时移除 detailed 模式方向标签的 `white-space: nowrap`（该 nowrap 是 420px 最小列宽的成因注释"保证研究方向标签不溢出"，修复后标签允许换行，消除最后一个溢出隐患）；≤640px 时卡片头已有纵向堆叠（照片在上、信息在下，标签可用宽度进一步增大），保持不变。

**Alternatives considered**:

- 媒体查询切换列数（≥900px 两列 / 以下单列）：效果等价但需维护断点，且 768–900px 区间行为与 `min()` 方案无差异，多余代码。
- 直接把最小列宽降到 280px：会在中等宽度（如 700–880px）产生两张过窄卡片（照片 120px + 间距后信息区 <200px），且重新引入长标签溢出风险——正是当初选 420px 想规避的问题。

## R2: Graduates 三字段列对齐实现方案

**Decision**: 每个 `li` 用 CSS Grid 三列、前两列采用**与内容无关的固定轨道宽度**（`grid-template-columns: <姓名列> <学位·年份列> minmax(0, 1fr)`），仅 ≥768px 生效；<768px 降级为紧凑流式布局（媒体查询切换）。

**Rationale**: 列对齐的充要条件是各行的列轨道宽度一致且不随该行内容变化——固定轨道（按最宽实际内容留余量的 em 定宽）天然满足；`minmax(0, 1fr)` 的去向列吸收剩余宽度并允许长单位名（如"北京大学（攻读博士）"10 个汉字）在列内换行（FR-003 边缘用例）。年份缺失（`year: null`，如谭宇彤、温哲）时学位列仍占位，对齐不破坏。降级阈值 768px 与 spec 的对齐视口下限一致。

**Alternatives considered**:

- 语义化 `<table>`：数据确属表格式，但改动面大（markup + 全套表格样式）、窄屏表格适配更繁琐，且要保持现有列表视觉需大量覆写——违背最小改动。
- `ul` 整体网格 + `li { display: contents }`：破坏 li 的语义/无障碍边界，hack。
- flex + 定宽前两列：与 Grid 等价，但 Grid 声明更直接、列宽语义更清晰。

## R3: 在读学生条目右侧空白消除方案

**调研结论**: `StudentGroup.astro` 两组（PhD/Master）并排各约 558px（容器 1180px − padding 48px − gap 32px 后对半），而单条内容"姓名 + Since 2020"仅约 150px → 每行右端连续空白 ≈ 70%，超出 FR-004 的 50% 判定线。

**Decision**: 条目行改为两端分布——姓名居左、`Since 年份` 与备注（如有）靠右（`margin-left: auto` 类机制），行内容两端贴合分组列边界。

**Rationale**: 名录式"姓名……入学年份"是成员列表的标准排布（直觉上是有意设计而非空白浪费）；内容右端连续空白归零，直接满足 FR-004；无年级的条目（如李江楠）仅左侧姓名，右侧无内容，仍整齐。备注字段紧随年份右侧，当前数据全为 null，不产生额外视觉噪音。

**Alternatives considered**:

- 分组列收缩为内容宽（`max-content` 轨道）：列表本身紧凑了，但空白转移到区块右缘，两组宽窄不一还会显得参差——用户投诉的"空白过大"观感并未解决。
- 合并为单列全宽列表：每行更长、右端空白比例更高，更差。

## R4: 教师卡片研究方向区域右侧空白消除方案

**调研结论**: detailed 模式下 `.teacher-directions` 被覆写为纵向堆叠（每行一个标签、`nowrap`、左对齐），标签列约 150–220px，而卡片内容区约 558px、信息列约 418px（扣除照片 120px + 间距 20px）→ 标签右侧空白 ≈ 50–60%，超出判定线。该纵向堆叠是 001 实现期的样式覆写，非 spec 要求。

**Decision**: 移除 detailed 模式的纵向堆叠覆写，让方向标签恢复组件默认的**横向流式换行**（与主页 compact 卡片同构）；同步移除 `white-space: nowrap`。

**Rationale**: 3–5 个标签横向换行后自然填满信息列宽度（1–2 行）；删除一段覆写代码而非新增样式，符合 YAGNI；Team 页与主页卡片行为同构，降低两套布局的心智成本。若个别标签组合换行后末行仍有空白，以 FR-004 的空白判定口径实测验收。

**Alternatives considered**:

- 网格改三列收窄卡片：卡片约 350px，照片 120px + 间距后信息区过挤，且 5 位老师成 3+2 不对称排布，观感更差。
- 保持纵向堆叠、标签右移或居中：堆叠列右侧空白依旧存在，不解决问题。

## R5: 布局验收与回归验证方式

**Decision**: 沿用 001 口径——`npm run check` + `npm run build` 作为机器门禁；布局验收用浏览器 DevTools 响应式模式按 quickstart.md 的四档视口矩阵（375 / 768 / 1024 / ≥1280px）手动核对，另加 `npm run preview` 验证构建产物；不引入 e2e/视觉回归框架。

**Rationale**: 纯 CSS 排版改动，判定标准含"大片空白"等视觉判断，自动化收益低于工具引入与维护成本（Constitution V）；回归范围明确且小（共享组件 `TeacherCard.astro` 波及主页 Team 概览区块，FR-009 要求四档视口下主页不出现新布局破损）。

**Alternatives considered**:

- Playwright 视觉回归：对 5 人课题组的静态主页属过度工程，否决。

## R6: 数据层改动范围（2026-10-12 spec 回填后修订）

**Decision**: 最小数据层扩展——仅为 `students` / `graduates` 新增可选 `github` 字段（复用既有 `httpsUrl` 校验器），并将学生现有 `url` 中的 GitHub 链接取值迁移至 `github`；除此以外数据与 schema 零改动（FR-006）。

**Rationale**: 用户 2026-10-12 澄清确立 GitHub 链接独立承载：既有数据将 GitHub 个人页混存于 `url`（001 data-model.md 对 `url` 的定义本就是"个人主页"），语义过载；专用字段 + 独立标签使学生与毕业生机制统一，后续导入完整名单时 GitHub 链接成为纯数据维护项（Constitution II）。迁移仅搬移取值，URL 逐字不变（Constitution I）。

**Alternatives considered**:

- 维持零数据改动、模板层按 `url` 前缀识别 GitHub 链接：魔法字符串判定脆弱（`github.io` 个人主页会被误判），且"GitHub 链接"语义被迫留在展示层，违背内容与展示分离。
- 学生与毕业生分用两套机制：增加模板与维护心智成本，与"机制统一"的澄清直接冲突。

## R7: GitHub 字段与标签展示设计

**Decision**:
① schema：`github: httpsUrl`（可选、可空、MUST HTTPS，与 `url` 同校验器，`src/content.config.ts`）；
② 迁移：李江楠（LeqsNaN）、张瀚文（Heaven-zhw）、郑明钰（SpursGoZmy）、刘正宵（jluliuzx）4 条 `url` → `github`，`url` 置 null；杨晨旭的 `https://iie-ycx.github.io/` 为 GitHub Pages 个人主页（非 GitHub 个人页），保留在 `url`；毕业生现值均无 GitHub 链接，`graduates.json` 零内容改动；
③ 标签：`GitHub <span aria-hidden="true">↗</span>` 纯文本链接，与既有 `Link ↗`（PublicationItem）/ `Homepage ↗`（TeacherCard）模式同构，样式复用既有链接色板；
④ 位置：在读学生条目中紧随姓名（左簇内联）；毕业生行中位于去向文字之后（第 3 列内联）；
⑤ 行为：`github` 为空 MUST 不渲染（FR-010）；`url` 为 null 后姓名不再可点击，`GitHub↗` 标签成为该生的链接出口（如李江楠）；杨晨旭姓名仍链接个人主页。

**Rationale**: 位置决策的对齐安全性——毕业生三列对齐（FR-003）由前两列固定轨道 + 第 3 列 `minmax(0, 1fr)` 保证，GitHub 标签内联在第 3 列不引入新轨道，任何行的列位置不受影响；<768px 降级流式布局中标签随行内流动，不溢出。学生条目标签在左簇（姓名后）不改变两端分布形态；FR-004 中间间隙自左簇末端起算，标签计入左簇内容。纯文本标签零新资源（Constitution IV），一个可选字段 + 一处条件渲染为最小改动（Constitution V）。

**Alternatives considered**:

- 毕业生行加第 4 条固定轨道专放标签：右端位置更整齐，但无 GitHub 的行产生空轨道噪声、多一条轨道维护成本，且 spec 对齐口径只定义三类字段（YAGNI）。
- 标签放在学生条目右簇（Since 之前）：右侧信息簇语义混杂（时间信息与链接混排），窄屏换行时标签位置不稳定。
- 图标字体/SVG 图标：新资源引入，违反零新依赖约束。
