# Research: Team 页布局优化与移动端修复

**Date**: 2026-10-12（rev2：R2/R6/R7 按 spec 2026-10-12 第二轮澄清修订——五列拆分、链接列、FR-012 排序、FR-004 适用范围拓展；新增 R8/R9） | **Status**: Complete（无遗留 NEEDS CLARIFICATION——技术栈由用户确认沿用现状，所有未知项已在代码调研中解决）

## R1: 移动端教师卡片右侧裁切——根因与修复方案

**调研结论（根因）**: `src/pages/team.astro` 的 `.teacher-grid` 使用 `grid-template-columns: repeat(auto-fill, minmax(420px, 1fr))`。375px 视口下容器可用宽度 = 375 − 2×16（`.container` 在 ≤480px 时 padding-inline 16px）= 343px < 420px 最小列宽 → 网格轨道溢出容器；`src/styles/global.css` 中 `body { overflow-x: hidden }`（FR-014 防横向滚动）将溢出部分直接裁切且无滚动条 → 卡片右侧内容不可见。主页 `index.astro` 的同名网格用 `minmax(320px, 1fr)`（343px ≥ 320px）所以手机上不溢出，这解释了缺陷只出现在 Team 页。

**Decision**: 教师网格最小列宽改为 `minmax(min(420px, 100%), 1fr)`。

**Rationale**: `min(420px, 100%)` 保证轨道最小宽度永不超过容器宽度——宽视口（≥~900px）维持现状两列，窄视口自动降为恰好贴合容器的单列，全部宽度区间连续自适应，一行声明解决，无断点维护成本。同时移除 detailed 模式方向标签的 `white-space: nowrap`（该 nowrap 是 420px 最小列宽的成因注释"保证研究方向标签不溢出"，修复后标签允许换行，消除最后一个溢出隐患）；≤640px 时卡片头已有纵向堆叠（照片在上、信息在下，标签可用宽度进一步增大），保持不变。

**Alternatives considered**:

- 媒体查询切换列数（≥900px 两列 / 以下单列）：效果等价但需维护断点，且 768–900px 区间行为与 `min()` 方案无差异，多余代码。
- 直接把最小列宽降到 280px：会在中等宽度（如 700–880px）产生两张过窄卡片（照片 120px + 间距后信息区 <200px），且重新引入长标签溢出风险——正是当初选 420px 想规避的问题。

## R2: Graduates 五字段列对齐实现方案（rev2 修订）

**Decision**: 每个 `li` 用 CSS Grid 五列、除去向列外均采用**与内容无关的固定轨道宽度**（`grid-template-columns: <姓名列> <学位列> <毕业年份列> minmax(0, 1fr) <链接列>`），仅 ≥768px 生效；<768px 降级为窄屏整齐布局（媒体查询切换，五字段逐行堆叠、同类字段位置跨行一致）。

**Rationale**: 列对齐的充要条件是各行的列轨道宽度一致且不随该行内容变化——固定轨道（按最宽实际内容留余量的 em 定宽）天然满足。学位与毕业年份拆列（spec 2026-10-12 澄清：学位列按 `Master` 取宽、年份列按 4 位数字取宽，两列均窄于合并列 `Master · 2025`，且年份列独立后支持按列纵向扫描年份）；去向列 `minmax(0, 1fr)` 弹性并允许长单位名（"北京大学（攻读博士）"10 个汉字）列内换行；链接列为集中放置 `Homepage↗` / `GitHub↗` 标签的独立末列（FR-011，轨道设计见 R8）。年份缺失（`year: null`，如谭宇彤、温哲）时年份列留空占位，学位照常显示，对齐不破坏。降级阈值 768px 与 spec 的对齐视口下限一致。列表整体宽度与内容相称（T010 校准，见 R3'注记：FR-004 适用范围已拓展至 Graduates 列表行）。

**Alternatives considered**:

- 学位·年份合并单列（上一版三列方案）：spec 第二轮澄清明确拆列；合并列在年份缺失时留"半空列"观感，且无法单独按年份列扫描。
- 语义化 `<table>`：数据确属表格式，但改动面大（markup + 全套表格样式）、窄屏表格适配更繁琐——违背最小改动。
- `ul` 整体网格 + `li { display: contents }`：破坏 li 的语义边界，hack。
- flex + 定宽前几列：与 Grid 等价，但 Grid 声明更直接、列宽语义更清晰。

## R3: 在读学生条目右侧空白消除方案

**调研结论**: `StudentGroup.astro` 两组（PhD/Master）并排各约 558px（容器 1180px − padding 48px − gap 32px 后对半），而单条内容"姓名 + Since 2020"仅约 150px → 每行右端连续空白 ≈ 70%，超出 FR-004 的 50% 判定线。

**Decision**: 条目行改为两端分布——姓名居左、`Since 年份` 与备注（如有）靠右（`margin-left: auto` 类机制），行内容两端分布；**rev2 修订（2026-10-12）**：两侧内容朝中间收拢（姓名自分组左缘内收、`Since`/备注自分组右缘内收，收拢量按四档视口实测校准），中间间隙与收拢产生的两端空白均按 FR-004 分档口径判定（见下 rev2 注记）。

**Rationale**: 名录式"姓名……入学年份"是成员列表的标准排布（直觉上是有意设计而非空白浪费）；内容右端连续空白归零（rev1 口径；rev2 修订为两端内收，收拢后两端空白保持在 FR-004 右端口径内，见下注记）；无年级的条目（如李江楠）仅左侧姓名，右侧无内容，仍整齐。备注字段紧随年份右侧，当前数据全为 null，不产生额外视觉噪音。

**Alternatives considered**:

- 分组列收缩为内容宽（`max-content` 轨道）：列表本身紧凑了，但空白转移到区块右缘，两组宽窄不一还会显得参差——用户投诉的"空白过大"观感并未解决。
- 合并为单列全宽列表：每行更长、右端空白比例更高，更差。

**rev2 注记（T006 + FR-004 适用范围拓展）**: ① 两端分布合入后复验发现中间间隙超标（无 GitHub↗ 标签的 4 行实测 217/218/346/424px，超约 3/3/51/24px @ 375/768/1024/≥1280px 档）——用户 2026-10-12 裁定修复布局达标：两侧内容朝中间收拢（姓名自分组左缘内收、`Since`/备注自分组右缘内收，收拢量按四档视口实测校准），使中间间隙满足 FR-004 分档阈值且收拢产生的两端空白保持在右端口径内（任务 T006）。② spec 第二轮澄清将 FR-004 适用范围拓展至 Team 页内容区全部内容容器（学生分组条目、教师卡片及其子容器、Graduates 列表行、各区块/分组容器，嵌套逐层适用）；主页仅共享教师卡片组件实例随组件同规则判定，其余区域维持 FR-009 回归约束；主容器 max-width 1180px 居中版式的超宽屏两侧边距豁免（有意版式设计，非缺陷）。

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

## R6: 数据层改动范围（2026-10-12 spec 两轮回填后修订）

**Decision**: 最小数据层扩展——① 为 `students` / `graduates` 新增可选 `github` 字段（复用既有 `httpsUrl` 校验器），并将学生现有 `url` 中的 GitHub 链接取值迁移至 `github`（已合入）；② 为 `graduates` 新增可选 `url` 字段（个人主页链接，与学生字段命名一致）并填入三个已核实取值：佀庆一→`https://phoebussi.github.io/`、杨泽娴→`https://ccds.fzu.edu.cn/info/1204/11629.htm`、刘源鑫→`https://llyx97.github.io/`（谭宇彤、温哲暂无，留空）；除此以外数据与 schema 零改动（FR-006）。

**Rationale**: 用户 2026-10-12 两轮澄清确立链接独立承载：既有数据将 GitHub 个人页混存于 `url`（001 data-model.md 对 `url` 的定义本就是"个人主页"），语义过载；专用字段 + 独立标签使学生与毕业生机制统一，毕业生 `url` 与学生 `url` 命名一致、语义同为个人主页，后续导入完整名单时链接成为纯数据维护项（Constitution II）。迁移与新填取值仅搬移已核实 URL、逐字不变（Constitution I）。

**Alternatives considered**:

- 维持零数据改动、模板层按 `url` 前缀识别 GitHub 链接：魔法字符串判定脆弱（`github.io` 个人主页会被误判），且"GitHub 链接"语义被迫留在展示层，违背内容与展示分离。
- 学生与毕业生分用两套机制：增加模板与维护心智成本，与"机制统一"的澄清直接冲突。

## R7: GitHub 字段与标签展示设计（rev2 修订）

**Decision**:
① schema：`github: httpsUrl`（可选、可空、MUST HTTPS，与 `url` 同校验器，`src/content.config.ts`）；
② 迁移：李江楠（LeqsNaN）、张瀚文（Heaven-zhw）、郑明钰（SpursGoZmy）、刘正宵（jluliuzx）4 条 `url` → `github`，`url` 置 null；杨晨旭的 `https://iie-ycx.github.io/` 为 GitHub Pages 个人主页（非 GitHub 个人页），保留在 `url`；毕业生现值均无 GitHub 链接（`github` 字段已就绪，为导入完整名单预留）；
③ 标签：`GitHub <span aria-hidden="true">↗</span>` 纯文本链接，与既有 `Link ↗`（PublicationItem）/ `Homepage ↗`（TeacherCard）模式同构，样式复用既有链接色板；
④ 位置：在读学生条目中紧随姓名（左簇内联）；毕业生行中位于独立链接列（FR-011，rev2 变更——原"去向文字后内联"方案随 spec 第二轮澄清废弃，见 R8）；
⑤ 行为：`github` 为空 MUST 不渲染（FR-010）；`url` 为 null 后姓名不再可点击，`GitHub↗` 标签成为该生的链接出口（如李江楠）；杨晨旭姓名仍链接个人主页。

**Rationale**: 学生条目标签在左簇（姓名后）不改变两端分布形态；FR-004 中间间隙自左簇末端起算，标签计入左簇内容。毕业生标签集中于链接列（对齐安全性见 R8）。纯文本标签零新资源（Constitution IV），可选字段 + 条件渲染为最小改动（Constitution V）。

**Alternatives considered**:

- 标签放在学生条目右簇（Since 之前）：右侧信息簇语义混杂（时间信息与链接混排），窄屏换行时标签位置不稳定。
- 图标字体/SVG 图标：新资源引入，违反零新依赖约束。

## R8: 毕业生链接列设计（FR-011，rev2 新增）

**Decision**: 链接列为 Graduates 五列 Grid 的固定宽末列（位于去向列右侧），集中放置毕业生的外链标签：`Homepage↗`（`url` 非空）与 `GitHub↗`（`github` 非空）并列，间距复用 `.teacher-links` 的 gap 语义；对应字段为空的行不渲染相应标签、链接列保留空占位。

**Rationale**: 固定轨道宽（按最坏组合 `Homepage↗ GitHub↗` 两标签 + 间距 + 余量取定宽）保证链接列起始位置跨行一致（FR-003/FR-011）——`max-content` 轨道会随各行内容变宽、破坏对齐。`Homepage↗` 复用 TeacherCard 既有 `Homepage ↗` 标签模式（同构、同色板），零新样式资源（Constitution IV）。标签集中于链接列使去向列语义纯净（单位名不与链接混排）。FR-004 交互：无任何标签的行（谭宇彤、温哲）右端空白自去向文字末端起算、包含空链接列——由 T010 列表宽度校准（宽度与内容相称）兜住，不在链接列设计内单独处理。

**Alternatives considered**:

- 去向列内联（上一版方案）：spec FR-011 已明确独立链接列，废弃。
- `max-content` 轨道：各行轨道宽随内容变化，破坏跨行对齐。
- 标签图标（GitHub logo SVG）：新资源引入，违反零新依赖约束。

## R9: Graduates 渲染排序比较器（FR-012，rev2 新增）

**Decision**: 渲染层（team.astro frontmatter）比较器依次比较：① 有年份条目在无年份条目之前；② 年份降序；③ 同年份内 PhD 在 Master 之前；④ 同排序键（年份与学位均相同）保持数据文件相对顺序——以 file loader 注入的零填充 id（`gra-001…`）字典序作显式 tiebreak（id 序 = 数据文件条目序），不依赖 `Array.prototype.sort` 稳定性。

**Rationale**: FR-012 四条排序规则一一映射到比较器分支，替换现有 `(b.year ?? 0) - (a.year ?? 0) || a.id.localeCompare(b.id)`——该式缺学位 tiebreak，同年份 PhD/Master 混排时会错序（当前数据恰好无同年混排才侥幸正确，未来导入完整名单即暴露）；无年份在现有式中因 `?? 0` 恰排最后、行为正确，新比较器显式表达该意图。排序在渲染时完成，与 graduates.json 条目顺序无关（Constitution II：排序属展示规则，MUST NOT 要求维护者手工整理数据文件顺序）。当前数据预期输出：杨泽娴（2025·PhD）→ 佀庆一（2024·PhD）→ 刘源鑫（2021·Master）→ 谭宇彤、温哲（无年份组，均为 Master，保持数据顺序）。

**Alternatives considered**:

- 数据文件手工排序：把展示规则转嫁给维护者，违反内容与展示分离（Constitution II）。
- 仅依赖 sort 稳定性（ES2019+ 保证）：Node 22 环境成立，但显式 id tiebreak 更自明、零成本。
