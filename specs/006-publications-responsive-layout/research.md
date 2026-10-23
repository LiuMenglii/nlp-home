# Research: Publications 条目与年份导航响应式优化

**Date**: 2026-10-23 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

本特性全部为表现层决策，无需外部检索：现有技术栈（Astro 7.3.8 + 组件 scoped CSS）、现有组件结构与数据已足以消解全部未知项。以下为 Phase 0 结论，R1–R4 对应条目三档布局，R5–R7 对应年份导航与锚点，R8 为验收度量，R9 为宪法合规映射。断点数值以 spec FR-001 为唯一规范源。

---

## R1 宽屏（≥768px）：两栏结构与「期刊名整体另起一行」

**Decision**：

- `.pub-item`（≥768px）：`display: flex; flex-wrap: nowrap; align-items: baseline; column-gap: 16px; padding: 12px 0;`（保留现有分隔线规则）。
- `.pub-main`：`flex: 1 1 0; min-width: 0; display: flex; flex-wrap: wrap; align-items: baseline; column-gap: 12px; row-gap: 6px;`。
- `.pub-title` / `.pub-venue`：`flex: 0 1 auto;`；`.pub-venue` 另加 `min-width: 0`。
- `.pub-side`：`flex: 0 0 auto;`（永不收缩、永不被挤出右栏）。

**Rationale**：

1. 外层 `flex-wrap: nowrap` + `.pub-side { flex: none }` 从结构上保证 FR-002「标签簇 MUST NOT 因期刊名换行而掉落到条目下方」——右栏不存在换行路径。
2. 内层 flex 的**行断裂判据使用各 item 的 hypothetical main size（即 max-content 宽度）**，而不是收缩后的宽度。因此「标题 max-content + 间距 + 期刊名 max-content ≤ 文本区宽度」时二者共行；否则期刊名作为一个整体 item 落到下一行，绝不会被挤在标题末行右侧（FR-002 / SC-001）。这正好实现 spec 中「以实际渲染宽度与间距之和不超过文本区可用宽度为准」的共行判定。
3. 期刊名独占一行时，其 max-content 若仍大于行宽，flex item 收缩到行宽并在**行内**继续换行（满足「期刊名称单行仍放不下时在其所在行内换行」）；`min-width: 0` 解除自动最小尺寸（min-content）对收缩的阻碍。
4. 外层 `align-items: baseline` 使 `.pub-side` 的第一基线（CCF 槽内徽标文字基线）与文本区第一行基线对齐（FR-002）。

**Alternatives considered**：

- **inline / inline-block 文本流**：inline-block 能实现「整体换行」，但行首的 `margin-left` 会在换行后留下缩进，破坏「左边缘与标题左边缘对齐」；用空格分隔则宽度不可控。放弃。
- **外层 CSS Grid `1fr auto`**：两栏可行，但窄屏需要 `grid-template-areas` 重排，且无标签时列轨道与 gap 仍保留（需 `:has()` 或模板分支消除），不如同一 flex 容器按档覆盖简单。放弃。
- **`float: right` 标签簇**：文本会环绕标签，标题变窄且换行不可预测。放弃。

**验证**：1440 / 1280 / 1024 / 768px 下逐条检查；重点用例为 62 字符期刊全名条目与超长标题条目，确认期刊名整体另起一行、标签簇不动。

---

## R2 标签簇：固定双槽与缺失槽占位

**Decision**：

- 模板结构：`<div class="pub-side">` 内固定顺序两个槽 `<span class="pub-slot pub-slot-ccf">` / `<span class="pub-slot pub-slot-link">`，`display: flex; align-items: center; column-gap: 10px;`。
- **仅当条目至少有一个标签时渲染 `.pub-side`**（`ccf || url`）；两者都没有时整个标签簇不渲染（FR-005）。
- 缺失槽渲染**同构隐藏占位**：
  - 缺 CCF：槽内仍渲染 `CCFBadge`（`rating="A"` 作占位内容），槽容器 `visibility: hidden; aria-hidden="true"`；
  - 缺 LINK：槽内渲染 `<span class="pub-link" aria-hidden="true">Link ↗</span>`（**span 而非 a**，不可聚焦），槽容器 `visibility: hidden`。
- 占位槽保留布局宽度但不可见、无可见或可读的占位文字（`visibility: hidden` + 槽容器 `aria-hidden` 同时移出无障碍树）、无可聚焦空元素。
- 槽宽归一化为**必需项**（FR-005）：`CCFBadge.astro` 以 `min-inline-size` 对齐 A/B/C 三者宽度，同类 CCF 标签自身最大宽度差 MUST <1px；LINK 文案恒为 `Link ↗`，宽度天然一致。归一化只改布局宽度，配色/字体/字号不变。
- 标签簇水平位置：宽屏右栏贴条目右缘、窄屏与很窄屏同样贴内容右缘（由布局分配自然实现）。

**Rationale**：

- 缺失槽若直接不渲染，flex/grid 容器内另一标签会左移（当前 58 条缺 CCF、10 条缺 LINK，其中 7 条两者皆缺），无法满足「同类标签跨条目落在同一组竖线、偏差 ≤1px」（FR-005 / SC-004）。
- 隐藏占位复用真实徽标组件与真实文案，宽度天然等于该标签的固有宽度，避免硬编码像素在字体回退时失准。
- 「槽宽由内容决定」与「同类宽度差 <1px」在 A/B/C 文案宽度不一致时会冲突；因此归一化不是可选补丁，而是满足 SC-004 的前提。
- 空槽无 `a` 元素、无 `tabindex`、无文案可读，满足 spec 边缘用例「不得出现 Link 占位文字、空链接或可聚焦空元素」。

**Alternatives considered**：

- **固定像素槽宽**（如 `width: 56px`）：字体回退或字号调整后徽标可能宽于槽位而侵占间隙，对齐偏差不可控；且违背「槽位宽度由标签自身内容决定」。放弃。
- **`grid-template-columns: max-content max-content`**：缺槽时该列塌缩为 0，LINK 左移，恰是需要修复的缺陷。放弃。
- **始终渲染徽标并整体 `opacity: 0`**：与 `visibility: hidden` 等效但元素仍在无障碍树/可被读屏感知，不如隐藏占位干净。放弃。

**验证**：quickstart §4 的量测脚本对全部条目（含四类占用状态）取 `.ccf-badge` 与 `.pub-link` 的 `getBoundingClientRect()`，左右边缘极差 ≤1px；并确认 `.pub-side` 数量 = 非「两标签皆缺」条目数。

---

## R3 窄屏（576px–<768px）：标题独占首行、期刊名与标签簇第二行

**Decision**（`@media (max-width: 767.98px)`）：

- `.pub-item`：`flex-wrap: wrap; align-items: flex-start; row-gap: 6px; column-gap: 0;`。
- `.pub-main`：`display: contents;`（标题与期刊名直接成为 `.pub-item` 的 flex item）。
- `.pub-title`：`flex: 1 1 100%;` → 独占第一行、占满内容宽度。
- `.pub-venue`：`flex: 1 1 0; min-width: 0;` → 第二行从 0 起增长，**永远给标签簇留出位置**，并按剩余宽度在行内换行。
- `.pub-side`：`flex: 0 0 auto; margin-left: 12px; align-self: flex-start;` → 贴第二行右缘、与期刊名首行顶部对齐（不会下坠到末行）。
- 无标签条目：`.pub-side` 不存在，`.pub-venue` 的 `flex-grow: 1` 自然占满第二行整宽。

**Rationale**：

- 标题 `flex-basis: 100%` 使第一行只容纳标题，且即使标题较短也占满整行（FR-003 明文要求）。
- 期刊名 `flex-basis: 0` 是关键：flex 行断裂按 hypothetical main size 判断，若用 `auto`（max-content），长期刊名会先占满第二行，把标签簇挤到第三行；用 `0` 则标签簇必定与期刊名同处第二行，期刊名再增长到剩余宽度内换行。
- `display: contents` 让同一个 DOM 在两个断点采用不同 flex 归属，无需重复模板或绝对定位；现有浏览器支持成熟。
- `align-self: flex-start` 使标签簇顶边对齐第二行行首，满足「与期刊名称首行对齐，MUST NOT 垂直居中或下坠到末行」。

**Alternatives considered**：

- **Grid `1fr auto`**：无标签时第二列轨道与 gap 仍占位，需 `:has()` 或模板分支；flex 用 `margin-left` 承担间距，缺失时自动消失。放弃。
- **绝对定位标签簇**：脱离文档流易与长文本重叠，且需固定条目高度。放弃。
- **为窄屏重复一份模板**：违反最小复杂度。放弃。

**验证**：767 / 576px；重点看 62 字符期刊名（多行时标签簇仍在首行顶部）、仅 CCF、仅 LINK、两者皆无四类条目。

---

## R4 很窄屏（<576px）：三行、标签簇右对齐

**Decision**（`@media (max-width: 575.98px)`）：

- `.pub-title`、`.pub-venue` 均 `flex: 1 1 100%;` → 各占一整行（R3 已给标题 100%，此处补充期刊名）。
- `.pub-side`：`flex: 0 0 auto; margin-left: auto; margin-right: 0; align-self: auto;` → 第三行、靠内容右缘。
- 无标签条目不渲染 `.pub-side`，flex 容器无第三行 item，`row-gap` 只在相邻 item 之间产生——**不会出现空白第三行或多余间距**（FR-004 边缘用例）。

**Rationale**：

- 三个 item 都以 100% 为 flex-basis，天然各占一行，无需改 `flex-direction`。
- flex 的 `gap` 仅作用于实际存在的 item 之间；若用 `grid-template-areas` 固定三行，缺标签时仍保留空行与行间距，故不采用 grid。
- `margin-left: auto` 在行内吃掉剩余空间，使标签簇贴右缘（与窄屏、宽屏右缘位置一致，符合 spec「三档下标签右边缘位置一致」）。

**Alternatives considered**：

- **`flex-direction: column`**：会改变 `align-items` 语义与第一档规则叠加顺序，需更多覆盖；本方案只改 basis 与 margin。放弃。
- **左对齐标签簇**：spec 明确要求沿用右对齐口径。放弃。

**验证**：575 / 480 / 375 / 320px；含无标签条目（第三行不存在）、长标题 + 长期刊名（不溢出、不重叠）。

---

## R5 年份合并：展示层派生「2019 & Earlier」

**Decision**（`publications.astro` frontmatter）：

- 保留现有全列表排序：`year` 降序；组内再按 `date` 降序、同一日期标题字符串字典序升序（FR-007）。
- 派生：`recentYears = years.filter(y => y >= 2020)`（降序）；`earlier = publications.filter(p => p.data.year <= 2019)`。
- 组装 `groups = [...recentYears.map(y => ({ key: `year-${y}`, label: String(y), items: sortByDate(byYear.get(y)!) })), ...(earlier.length ? [{ key: 'year-2019-earlier', label: '2019 & Earlier', items: sortByDate(earlier) }] : [])]`；`sortByDate` 先按 `date` 降序（空串最小，自然落组末），同日按标题字符串字典序升序（`<` 比较，不用 locale）。
- 合并组排在最后；合并组内不再按 `year` 分组，而是整组按 `date` 降序（必要时用各条 `venue · year` 表示年份）。
- 标签计数取 `items.length`；列表分组标题取 `label`，锚点 `#${key}`；合并组为空时不生成该组（不显示计数 0）。
- 数据唯一改动：新增 `date` 字段（`YYYY-MM-DD`，无链接可空、有链接必填）并回填：正式出版日期优先 → 无则上线日期 → 仅 arXiv 用首次提交日（v1）→ 无链接留空；`content.config.ts` 的 publications schema 同步声明 `date` 并以 refine 强制有链接必填。

**Rationale**：

- 合并是完全由数据派生的展示规则：新增 ≤2019 论文自动并入，新增 2020+ 论文自动获得独立标签，维护者仍只需改 `publications.json`（Constitution II）。
- 组内需要精确到日的时间序，而 `year` 只能给到年；因此必须引入 `date`。日期口径：正式出版日期优先 → 上线日期 → 仅 arXiv 条目用 arXiv 首次提交日（v1）→ 无链接留空；有链接条目必填（FR-011）。
- 空 `date` 以空串参与降序比较，自然落到组末，再按标题升序（FR-007）。
- 空组合法：数据可能演化，spec 边缘用例要求不渲染 0 计数标签。

**Alternatives considered**：

- 在 `publications.json` 中把 2019 及以前的 `year` 改写为 2019（破坏内容准确性、丢失逐年信息，违反 FR-011/宪法 I）。放弃。
- 硬编码 16 条/8 个标签（数据变化即失效）。放弃。
- 仅用 `year` + `title` 排序（无法满足「越前面的论文越晚」到日级别的要求）。放弃。

**数据前置**：135 条中 66 条有 DOI、59 条仅 arXiv、10 条无链接。预计 125 条有 `date`，10 条为空；空值条目排组末。

**验证**：quickstart §5；当前数据预期标签序列与计数：2026:20、2025:23、2024:15、2023:20、2022:21、2021:12、2020:8、2019 & Earlier:16，合计 135；列表无 2011–2019 独立分组标题；各组内 `date` 降序、同一日期标题字符串字典序升序。

---

## R6 手机年份导航：视觉隐藏顶部导航，改用吸顶分组标题

**Decision**（`publications.astro` 模板 + scoped CSS）：

- 现有 `.year-nav { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 32px; }` 保留为 ≥768px 形态。
- `@media (max-width: 767.98px)`：`.year-nav { display: none; }`——移动端不显示标签墙，也不用横滑替代；导航 DOM MUST 保留，验收看计算样式与可见数量。
- 年份分组标题在 <768px 变为 `position: sticky`，吸顶位置取 T014 实测并记录的 header 高度常量 H_m（`top: H_m`），带不透明背景；显示该组论文数（如 `2026 (20)`），与导航下缘相接（间距 ≤4px）的吸顶标题数量同一时刻 ≤1，分组结束后随分组滚出。
- 桌面端标题不吸顶、不重复显示计数（计数已在导航标签内）。

**Rationale**：

- 用户明确否定「标签在顶上堆一大坨」的观感；横滑、网格、折叠都仍是标签墙，只是换了排列方式，因此换导航范式：让年份标题承担定位。
- 纯 CSS `position: sticky` + `display: none`，零 JS，符合 Constitution IV/V。
- 吸顶标题同时也是分组语义标签，减少顶部固定区域的总高度。

**Alternatives considered**：

- 单行横滑：仍隐藏部分标签且需要滑动（用户已否决）。放弃。
- 等宽网格 / 折叠面板：仍是标签墙（用户已否决）。放弃。
- 原生 `<select>` 下拉：可用但不提供滚动上下文，且需额外控件样式。放弃。

**验证**：767 / 576 / 575 / 480 / 375 / 320px 下 `.year-nav` 计算样式为 `display: none` 且可见数量为 0（DOM MUST 保留）、8 个分组标题吸顶且计数之和 135、页面无横向滚动；≥768px 正常换行左对齐。

---

## R7 锚点偏移与粘性导航

**Decision**：

- 保留 `.year-group { scroll-margin-top: 84px }` 作为 ≥768px 口径。
- `@media (max-width: 767.98px)` 下粘性导航为单行（品牌行）且不再生成年份导航，header 更矮；实测 `.site-header` 高度后以实测值 + 8px 设定 `scroll-margin-top`，保证分组标题不被吸顶导航遮挡。验收以 320 / 375 / 767px 三点核对。
- 移动端分组标题自身吸顶，`top` 取同一实测 header 高度；标题有不透明背景，避免论文文字透出。
- 锚点 id 规则：独立年份 `year-<year>`（沿用现状），合并组 `year-2019-earlier`；id 仅在 `publications.astro` 内生成。

**Rationale**：

- 现有 84px 是按单行导航估算的；移动端移除标签墙后 header 高度变化，必须按实测值复核。
- 不引入 JS 计算偏移，用媒体查询给出静态常量，符合零脚本约束。

**Alternatives considered**：

- JS 动态写入 `scroll-margin-top`：新增脚本。放弃。
- 去掉粘性导航：影响全站，超出范围。放弃。
- 移动端保留标签导航只为锚点：与用户否决的标签墙冲突。放弃。

**验证**：分别点击独立的 2020 标签与合并标签，核对落点（≥768px）；移动端核对吸顶标题不遮挡条目内容。

---

## R8 验收与度量方式

**Decision**：

- 机器门禁：`npm run check && npm run build`（CI 同口径）。
- 人工矩阵：1440 / 1280 / 1024 / 768 / 767 / 576 / 575 / 480 / 375 / 320px，两处界面（`/publications/` 与 `/`）。
- 量测脚本（DevTools Console，一次性执行，不入库）：
  - 标签列线：收集全部 `.pub-slot-ccf .ccf-badge` 与 `.pub-slot-link .pub-link` 的 `getBoundingClientRect()`，分别计算 `left` / `right` 的极差，要求 ≤1px（含隐藏占位槽）；另量测 CCF 徽标自身宽度极差 <1px。
  - 水平溢出：逐元素检查 `.pub-item`、`.pub-side`、`.year-group h3` 的 `getBoundingClientRect().right ≤ clientWidth`，元素越界为**权威判据**；`document.documentElement.scrollWidth === document.documentElement.clientWidth` 仅作辅助信号（`body` 的 `overflow-x: hidden` 可能夹断该值，相等不构成无溢出证明；反之不相等必为缺陷）。
  - 标签簇存在性：`.pub-side` 数量应等于非「两标签皆缺」条目数（当前数据为 128）。
  - 年份导航：≥768px 下 `.year-chip` 数量为 8、计数和 135；<768px 下 `.year-nav` 计算样式为 `display: none` 且可见数量为 0（DOM MUST 保留）、8 个分组标题存在并吸顶，与导航下缘相接（间距 ≤4px）的吸顶标题数量 ≤1。
  - 组内序：各分组 `.pub-item` 的 `data-date` 非递增；同日按标题升序。
  - 日期门禁：有链接条目（125 条）`date` 合法、无链接条目（10 条）为空、`linkedWithoutDate = 0`、空值不越界；数据 diff 仅含 `date`，schema diff 仅含 `date` 与有链接必填 refine。
- 不引入 Playwright/e2e：新增依赖与脚本均被 FR-011 / Constitution V 排除。

**Rationale**：spec 的成功标准都是可在浏览器内直接量测的几何/计数指标，人工矩阵 + 一次性脚本足以覆盖，且与 001–003 的验收方式一致。

---

## R9 宪法合规映射

| 原则 | 本设计的落点 |
|------|--------------|
| I 内容准确性 | 标题/期刊/年份/CCF/链接取值零改动；新增 `date` 以正式出版页核对，仅有 arXiv 链接的条目按 FR-011 使用 arXiv v1 首次提交日，无链接留空；合并组由数据派生，不引入新事实 |
| II 内容与展示分离 | 分组与双槽均为展示层规则；新增论文仍只改 `publications.json` 并填 `date` |
| III 静态站点与 GH Pages | 纯静态产物，构建/CI/部署不变，零新依赖 |
| IV 简洁学术化设计 | 沿用色板、字体、字号；无动效；手机端移除标签墙，仅吸顶分组标题 |
| V 最小复杂度 | 单一 flex 容器按档覆盖 + 少量派生数组；无新组件、无公共工具类、无新脚本 |
| VI 无布局破损（不可妥协） | FR-010 五项破损定义逐项覆盖；十档视口 × 两处界面实测；横向溢出以逐元素 `getBoundingClientRect().right ≤ clientWidth` 为权威判据，不以 `body { overflow-x: hidden }` 或 `scrollWidth` 单独判定；矩阵结果记录于 PR |

---

## R10 日期回填口径（DOI / arXiv / 留空）

**Decision**：

- `publications.json` 每条按需新增 `date`（`YYYY-MM-DD`，有链接必填、无链接可缺省）；`content.config.ts` 声明为可选 ISO 日期字符串（缺省即空值，不要求显式 `null`），并以 refine 强制 `url` 存在时必填。
- 取数优先级：DOI/出版社页面的正式出版日期 → 无正式出版日期时用上线日期 → 仅 arXiv 链接时用 arXiv 首次提交日期（v1） → 无链接时留空。有链接条目 MUST 填写 `date`。
- `year` 保持分组与展示用途，`date` 只用于组内排序；两者允许不同（如 online-first）。空值条目不展示日期，仅在组内排序时落到末尾。

**Rationale**：用户已确认 arXiv 可作日期来源、无链接条目留空，避免为 10 条无来源条目阻塞特性；排序规则对空值有确定行为（FR-007）。

**验证**：quickstart §8 的覆盖率/格式脚本（125 条有值、10 条为空、`linkedWithoutDate = 0`）+ `git diff` 仅含 `date`（schema 另含必填 refine）。
