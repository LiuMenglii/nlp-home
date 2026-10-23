---

description: "Task list for Publications 条目与年份导航响应式优化"
---

# Tasks: Publications 条目与年份导航响应式优化（Publications Responsive Layout）

**Input**: Design documents from `/specs/006-publications-responsive-layout/`

**Prerequisites**: [plan.md](./plan.md)（必需）、[spec.md](./spec.md)（必需）、[research.md](./research.md)、[data-model.md](./data-model.md)、[contracts/publications-layout.md](./contracts/publications-layout.md)、[quickstart.md](./quickstart.md)

**Tests**: 本特性**不生成测试任务**——spec / plan 明确不引入 e2e 框架、不新增脚本（FR-011 / Constitution V），验收方式为 machine gate（`npm run check && npm run build`）+ quickstart 视口矩阵 + DevTools 一次性量测脚本。

**Organization**: 按用户故事分阶段，每个故事可独立实现与验收。断点数值（768 / 576）以 spec FR-001 为唯一规范源，任务中不引入 768 / 576 之外的新断点；媒体查询实现值（767.98 / 575.98，半开区间口径）沿用 plan「Structure Decision」的既定表述。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行（不同文件、无未完成依赖）
- **[Story]**: 所属用户故事（US1 / US2 / US3）
- 每个任务均含精确文件路径

## Path Conventions

单一 Astro 项目，源码在仓库根 `src/`；本特性改动 5 个文件，不新增源文件。

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 改动前确认基线可构建、数据事实与规划一致

- [x] T001 在仓库根执行 `npm run check && npm run build` 确认基线通过，并复核 `src/data/publications.json` 的现状：135 条、66 条 DOI / 59 条仅 arXiv / 10 条无链接、缺 `ccf` 58 条、缺 `url` 10 条、两者皆缺 7 条、最长 `venue` 62 字符；记录结果供后续验收比对（不改任何文件）；并记录 1440px 下 `.site-header` 实测高度与现有 84px 的偏差，供 T014 复核桌面锚点偏移

---

## Phase 2: Foundational (Blocking Prerequisites)

**说明**：本特性无跨故事阻塞项。US1 是纯模板 + scoped CSS 改动，不依赖数据层；唯一持久化变更（`date` 字段）只被 US2 消费，故整体放入 US2 阶段，使 US1 可作为 MVP 独立交付。本阶段无任务。

**Checkpoint**: Phase 1 完成即可直接进入 US1。

---

## Phase 3: User Story 1 - 论文条目在三档视口下排布稳定 (Priority: P1) 🎯 MVP

**Goal**: `PublicationItem.astro` 的条目结构改为「文本区 + 固定双槽标签簇」，并在宽屏 / 窄屏 / 很窄屏三档下按 [contracts/publications-layout.md §2–§3](./contracts/publications-layout.md) 排布；Publications 页与主页概览同步生效。

**Independent Test**: 在 1440 / 1280 / 1024 / 768 / 767 / 576 / 575 / 480 / 375 / 320px 打开 `/publications/`，任一条目均符合三档形态；运行 quickstart §4 量测脚本，CCF / LINK 左右边缘极差 ≤1px、CCF 自身宽度极差 <1px、`.pub-side` 数 = 128（当前数据）；`document.documentElement.scrollWidth === clientWidth`。无需 `date` 字段即可独立验收。

### Implementation for User Story 1

- [x] T002 [P] [US1] 重构 `src/components/PublicationItem.astro` 模板：保留 `div.pub-main`（`span.pub-title` + `span.pub-venue`），新增仅在 `ccf || url` 时渲染的 `div.pub-side`；`div.pub-side` 内按固定顺序放 `span.pub-slot.pub-slot-ccf` 与 `span.pub-slot.pub-slot-link`；缺 CCF 时槽内渲染 `<CCFBadge rating="A" />` 并将槽容器标记为 `pub-slot--empty` + `aria-hidden="true"`；缺 LINK 时槽内渲染 `<span class="pub-link">Link ↗</span>`（**span 而非 a**，不可聚焦）并将槽容器同样标记为 `pub-slot--empty` + `aria-hidden="true"`；空槽可复用同宽隐藏标记，但 MUST 无可见/可读占位文字、不得产生可聚焦元素；两标签皆无时不渲染 `div.pub-side`；`interface Props { pub: CollectionEntry<'publications'> }` 与所有条目文案/链接取值保持不变
- [x] T003 [P] [US1] 在 `src/components/CCFBadge.astro` 做宽度归一化：量测 `CCF-A` / `CCF-B` / `CCF-C` 三者实际渲染宽度，为 `.ccf-badge` 增加 `min-inline-size`（取三者最大宽度，`box-sizing: border-box` 下含 padding）与 `text-align: center`，使同类标签最大宽度差 <1px；**不得**改动 `padding` / `font-size` / `font-weight` / `color` / `ccf-A/B/C` 背景色与 `white-space: nowrap`
- [x] T004 [US1] 在 `src/components/PublicationItem.astro` 的 scoped CSS 实现宽屏（≥768px）两栏：`.pub-item { display: flex; flex-wrap: nowrap; align-items: baseline; column-gap: 16px; padding: 12px 0; }`（保留 `border-bottom` / `:first-of-type` 分隔线规则，移除 `justify-content: space-between`）；`.pub-main { flex: 1 1 0; min-width: 0; display: flex; flex-wrap: wrap; align-items: baseline; column-gap: 12px; row-gap: 6px; }`；`.pub-title` / `.pub-venue { flex: 0 1 auto; }` 且 `.pub-venue { min-width: 0; }`；`.pub-side { flex: 0 0 auto; display: flex; align-items: center; column-gap: 10px; }`；`.pub-slot--empty { visibility: hidden; }`；确保期刊名不能共行时整体另起一行、标签簇永不掉落
- [x] T005 [US1] 在 `src/components/PublicationItem.astro` 的 scoped CSS 增加窄屏规则于 `@media (max-width: 767.98px)`（该媒体查询覆盖 <768px 全档；<576px 时 T006 的媒体查询同时生效，T006 的规则块 MUST 位于本条之后，同名属性按源码顺序覆盖为三行形态）：`.pub-item { flex-wrap: wrap; align-items: flex-start; row-gap: 6px; column-gap: 0; }`；`.pub-main { display: contents; }`；`.pub-title { flex: 1 1 100%; }`；`.pub-venue { flex: 1 1 0; min-width: 0; }`；`.pub-side { flex: 0 0 auto; margin-left: 12px; align-self: flex-start; }`；确保 576–<768px 下标签簇与期刊名首行对齐、不下坠到末行
- [x] T006 [US1] 在 `src/components/PublicationItem.astro` 的 scoped CSS 增加很窄屏（<576px）覆盖于 `@media (max-width: 575.98px)`：`.pub-title, .pub-venue { flex: 1 1 100%; }`；`.pub-side { flex: 0 0 auto; margin-left: auto; margin-right: 0; align-self: auto; }`；无标签条目不渲染 `.pub-side`，不得出现空白第三行或多余 `row-gap`
- [x] T007 [US1] 在 `/publications/` 逐档验收 `src/components/PublicationItem.astro`：按 [quickstart.md §1–§4](./quickstart.md) 核对 1440 / 1280 / 1024 / 768 / 767 / 576 / 575 / 480 / 375 / 320px 三档形态（含 62 字符 `venue` 条目、超长标题条目、「仅 CCF」「仅 LINK」「两者皆有」「两者皆无」四类条目），运行 §4 量测脚本确认 CCF / LINK 左右边缘极差 ≤1px、CCF 宽度极差 <1px、`sides = 128`、`items = 135`，且各档 `scrollWidth === clientWidth`；另对 `.pub-item`、`.pub-side`、`.pub-title`、`.pub-venue` 逐元素检查 `getBoundingClientRect().right ≤ document.documentElement.clientWidth`（不得仅依赖 scrollWidth 或 `overflow-x: hidden`）；发现偏差则回到 T003–T006 修正

**Checkpoint**: US1 可在不改数据的情况下独立交付（MVP）。

---

## Phase 4: User Story 2 - 年份标签合并与手机端整齐排布 (Priority: P2)

**Goal**: `publications.astro` 从数据派生「2020+ 每年一组 + 2019 & Earlier 合并组」的 8 个分组与导航；组内按新增 `date` 降序、同日标题升序；≥768px 保留标签导航，<768px 视觉隐藏导航（DOM MUST 保留）并让分组标题吸顶显示计数。

**Independent Test**: ≥768px 下年份导航恰好 8 个标签（2026→…→2020→2019 & Earlier），计数 20/23/15/20/21/12/8/16、合计 135；合并组 16 条且组内 `date` 非递增；点击合并标签定位到 `#year-2019-earlier` 且不被导航遮挡。375px 下 `.year-nav` 计算样式为 `display: none`（DOM MUST 保留）、可见数量 0、8 个分组标题吸顶、计数和 135、无横向滚动。US1 未完成时仍可先做数据层（T008–T010）并独立核对日期覆盖。

### Data Contract & Backfill（US2 前置，仅 US2/US3 消费）

- [x] T008 [P] [US2] 在 `src/content.config.ts` 的 publications schema 中于 `year` 之后新增可空 `date`：声明为可选字符串（缺省即空值，不要求显式 `null`），存在时校验 ISO `YYYY-MM-DD` 且为合法日历日期（正则 + round-trip `new Date(s).toISOString().slice(0,10) === s`，拒绝 `2026-02-30` 这类非法日历日期）；并以 `.refine` / `.superRefine` 强制「`url` 存在时 `date` MUST 存在」，无 `url` 时允许缺失；该 refine MUST 与 T009–T010 同批提交（回填完成前 `npm run build` 因 125 条缺 `date` 失败属预期门禁）；其余字段与 `httpsUrl` 等既有校验保持不变；不引入新依赖
- [x] T009 [US2] 在 `src/data/publications.json` 为 66 条有 DOI/正式出版页的条目回填 `date`：按 FR-011 优先级取**正式出版日期优先，无正式出版日期时取上线日期**（可用 Crossref `api.crossref.org/works/<doi>` 的 `published-print` / `published-online` 或出版社页面核对），在每条 `"year"` 之后插入 `"date": "YYYY-MM-DD"`；有链接条目 MUST 填写；`title` / `venue` / `year` / `ccf` / `url` / `featured` / `authors` 取值与文件缩进格式不得改动
- [x] T010 [US2] 在 `src/data/publications.json` 为 59 条仅 arXiv 条目用 **arXiv 首次提交日期（v1）** 回填 `date`（有链接 MUST 填写），10 条无链接条目**不填**（不写 `date` 键）；随后在仓库根执行 quickstart §8 的覆盖率脚本，期望 `total 135 / withDate 125 / empty 10 / bad 0 / linkedWithoutDate 0`，并确认空值全部落在无链接条目

### Implementation for User Story 2

- [x] T011 [US2] 在 `src/components/PublicationItem.astro` 的 `article.pub-item` 上增加 `data-date={pub.data.date ?? ''}`（供 quickstart §5 组内顺序量测，无视觉影响）；该任务依赖 T002 的模板重构
- [x] T012 [US2] 重写 `src/pages/publications.astro` frontmatter：保留 `year` 降序；派生 `recentYears = years.filter(y => y >= 2020)` 与 `earlier = publications.filter(p => p.data.year <= 2019)`；按 FR-007 定义**不使用 locale 规则**的比较器——`sortByDate` 先按 `date` 降序（显式三路比较：`da === db` 返回 0，`da < db` 返回 1，否则返回 -1；空串最小自然落组末），`date` 相等（含同为空）时按标题字符串字典序升序（`a.data.title < b.data.title ? -1 : a.data.title > b.data.title ? 1 : 0`）；初始全列表排序仅需 `year` 降序（MUST 移除现有 `title.localeCompare` 兜底，避免与「不使用 locale 规则」口径并存）；组装 `groups`（独立年份 `key: year-<year>`、`label: String(year)`、`items: sortByDate(byYear.get(y)!)`；合并组 `key: 'year-2019-earlier'`、`label: '2019 & Earlier'`、`items: sortByDate(earlier)`，仅 `earlier.length > 0` 时追加在最后），每个分组的 `items` MUST 经 `sortByDate` 排序，导航与列表共用同一 `groups` 数组
- [x] T013 [US2] 改写 `src/pages/publications.astro` 模板：`.year-nav` 与分组 section 均由 `groups` 渲染；年份标签 `href={'#' + g.key}`，标签内 MUST 输出 `g.label` + `<span class="year-count">{g.items.length}</span>`（不加括号，与现有 `year-count` 展示一致；≥768px 计数可见）；分组 `<section id={g.key} aria-labelledby={`${g.key}-heading`}>` 内 `<h3 id={`${g.key}-heading`}>` 输出 `g.label` + `<span class="group-count">({g.items.length})</span>`（保留现有 section 与 h3 的 `aria-labelledby` / id 关联，不得丢失）；列表改用 `g.items`；不得再渲染 2011–2019 任何独立标签或分组
- [x] T014 [US2] 在 `src/pages/publications.astro` 的 scoped CSS 实现移动端形态：先在 320 / 375 / 480 / 576 / 767px 实测 `.site-header` 高度（记为 H_m，若各档不同则按档分别记录），并把最终数值记录到 PR 与 quickstart，再于 `@media (max-width: 767.98px)` 设置 `.year-nav { display: none; }`（DOM 保留，不删除导航节点）、`.year-group h3 { position: sticky; top: H_m; z-index: 5; background: #ffffff（与 body 页面背景一致的不透明色，配色不变）; line-height: L_h3; white-space: nowrap; padding-block: 4px; }`（`z-index` 低于 `.site-header` 的 10，标题 MUST 保持单行且行高不随计数位数变化）、`.group-count` 仅移动端显示（≥768px `display: none`）、`.year-group { scroll-margin-top: H_m + 8px; }`；H_m 与 L_h3 MUST 以具体像素常量写入提交的 CSS，不得保留占位符或变量，L_h3 取 h3 字号 1.3rem 对应的固定单行行高并实测确认不裁切；**现有桌面端基础规则 `.year-group { scroll-margin-top: 84px }`（FR-007 桌面锚点偏移）MUST 保留**——移动端值仅在本媒体查询内覆盖，不得删除或改写桌面端基础规则（如桌面实测 header 高度与 84px 不符，则按实测复核修正并同步验证 1440px 下锚点不遮挡）；若 header 高度随档位变化，用媒体查询分别给出对应常量；`src/styles/global.css` 保持零改动
- [x] T015 [US2] 验收 `src/pages/publications.astro`：1440px 下核对 8 个 `.year-chip` 顺序与计数（20/23/15/20/21/12/8/16，合计 135；`.year-count` MUST 可见）、无 2011–2019 独立标题、合并组 16 条；并在 768 / 1024px 核对标签自然换行、左对齐、无截断；显式断言 EC-005：2020 为独立标签与独立分组，2019 条目仅出现在合并组、不单独成组；点击 2020 与合并标签确认落点不被粘性导航遮挡；375 / 320px 下确认 `.year-nav` 计算样式为 `display: none` 且可见数量为 0（DOM MUST 保留）、8 个分组标题吸顶且计数和 135、标题单行且高度恒定、与导航下缘相接（≤4px）的吸顶标题 ≤1、标题不遮挡条目、逐元素 `getBoundingClientRect().right ≤ clientWidth`（`scrollWidth === clientWidth` 仅作辅助）；运行 quickstart §5 的组内顺序脚本确认每组 `sorted: true` 且同日标题升序；以逻辑审查验证 EC-004：`earlier.length === 0` 时合并标签与合并分组都不渲染（不改提交数据）；发现偏差回到 T012–T014 修正

**Checkpoint**: US1 + US2 分别可用；合并组与日期排序可独立验收。

---

## Phase 5: User Story 3 - 两处入口一致且无版式回归 (Priority: P3)

**Goal**: 主页概览与 Publications 页条目形态一致，十档视口无布局破损，数据 diff 受控，构建 / CI 门禁通过。

**Independent Test**: 在 `/` 与 `/publications/` 的同档视口逐项比对条目形态；`git diff` 仅含 `date`；`npm run check && npm run build` 通过且部署流水线未改。

### Implementation for User Story 3

- [x] T016 [US3] 在 `src/pages/index.astro` 与 `src/styles/global.css` **零改动**的前提下，于 320 / 375 / 480 / 575 / 576 / 767 / 768 / 1024 / 1280 / 1440px 逐档比对 `/` 与 `/publications/` 的条目形态（三档排布、标签双槽列线、换行规则），确认两处一致且主页概览 8 条条目（featured 优先、按既有时间序取前 8；当前数据 featured 共 10 条）无破损；同时确认主页不出现年份导航、条目选取与排序逻辑未变
- [x] T017 [US3] 执行 `package.json` 中的机器门禁：`npm run check && npm run build` 必须通过（含 `src/content.config.ts` 新增 `date` 校验），再 `npm run preview` 抽查构建产物在 320 / 768 / 1440px 下 `/publications/` 与 `/` 渲染正常
- [x] T018 [US3] 数据与范围审计：`git diff -- src/data/publications.json src/content.config.ts` 仅包含 `date` 新增与回填、无其他字段变化；`git diff -- package.json package-lock.json` 为空；无新增源文件 / 组件 / 公共 CSS 工具类；`git diff -- src/pages/index.astro src/styles/global.css` 为空；`/publications/` 渲染条目数 = 135，主页 = 8

**Checkpoint**: 两处一致、零回归、门禁全绿。

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 全量矩阵复核与交付前收尾

- [x] T019 [P] 按 [quickstart.md](./quickstart.md) §1–§7 在 `/publications/` 与 `/` 完整跑一遍 10 档视口矩阵（含跨 768 / 576 边界切换），确认布局破损数 0、无元素越界：对 `.pub-item`、`.pub-side`、`.year-group h3` 逐元素检查 `getBoundingClientRect().right ≤ document.documentElement.clientWidth`（权威判据；`scrollWidth === clientWidth` 仅作辅助，不得以 `overflow-x: hidden` 作为无溢出证据），修复任何残留偏差
- [x] T020 [P] 无障碍与占位审计：确认 `src/components/PublicationItem.astro` 中两个隐藏槽（CCF 与 LINK）均为 `visibility: hidden` + `aria-hidden="true"`、LINK 占位为 `span` 且无 `tabindex`、无可见/可读占位文字、无可聚焦空元素；可见 CCF 徽标的 `title` 属性与条目分隔线保持不变；两标签皆无的 7 条条目不渲染 `.pub-side`
- [x] T021 交付前合规复核：对照 [quickstart.md](./quickstart.md) 与 `package.json` 确认零新增依赖 / 脚本 / e2e（Constitution III / V）、配色字体字号与其他区块不变（IV）、`global.css` 零改动，并把 T001 基线与 T019 矩阵结果记录到 PR 描述（Constitution「维护工作流」要求合并前记录检查结果）；PR 描述 MUST 同时记录 `body { overflow-x: hidden }` 保留的决定、其可能夹断 `scrollWidth` 的风险，以及本特性以逐元素 `getBoundingClientRect()` 越界为权威判据的验收口径

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖，先执行（T001）
- **Foundational (Phase 2)**: 无任务——无跨故事阻塞项
- **User Story 1 (Phase 3)**: 依赖 T001；不需要数据层改动，可立即开始
- **User Story 2 (Phase 4)**: 数据层（T008–T010）只依赖 T001；页面层（T012–T014）与 `data-date`（T011）依赖 T002，且 T011–T014 另需 T008 提供 `date` 的 schema 类型（否则 `p.data.date` 类型检查失败）；验收 T015 依赖 T008–T014 与 T011
- **User Story 3 (Phase 5)**: 依赖 US1 与 US2 完成（T016–T018 为一致性 / 回归 / 审计）
- **Polish (Phase 6)**: 依赖全部用户故事完成

### User Story Dependencies

- **US1 (P1)**: 仅依赖 T001 — 独立可交付（MVP）
- **US2 (P2)**: 数据层与 US1 无耦合；`data-date`（T011）需 T002 的模板；页面改动（T012–T014）需 T008 的 `date` 类型，与 T009 / T010 的回填可并行
- **US3 (P3)**: 依赖 US1 + US2（一致性与回归门禁）

### Within Each User Story

- 模板结构（T002）先于分档 CSS（T004–T006）与 `data-date`（T011）
- 数据：schema（T008）→ DOI 回填（T009）→ arXiv 回填与覆盖率（T010）
- 页面：frontmatter 分组（T012）→ 模板渲染（T013）→ 移动端 CSS（T014）→ 验收（T015）；`data-date`（T011）须在 T008 之后、T012 之前完成
- 每档 CSS 完成后即可先做该档人工核对，全档完成后执行 T007

### Parallel Opportunities

- **US1**：T002（`PublicationItem.astro`）∥ T003（`CCFBadge.astro`）
- **US2**：T008（`content.config.ts`）∥ T009（`publications.json`）；T012 可与 T009 / T010 并行（不同文件），但 T012 需要先定稿分组数据结构
- **US3**：T016 ∥ T017 ∥ T018（互不改文件）
- **Polish**：T019 ∥ T020

### Parallel Example: US1

```bash
# 不同文件、无依赖，可同时进行：
Task: "重构 PublicationItem.astro 双槽模板（T002）"
Task: "CCFBadge.astro 宽度归一化（T003）"
```

### Parallel Example: US2 数据层

```bash
# schema 与数据回填分属不同文件：
Task: "content.config.ts 新增可空 date（T008）"
Task: "publications.json 回填 66 条 DOI 日期（T009）"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. T001 确认基线
2. T002–T006 完成条目结构与三档布局
3. T007 独立验收（量测 + 十档视口）
4. **STOP and VALIDATE**：US1 不依赖 `date`，可单独合并 / 演示

### Incremental Delivery

1. **US1** → 条目排布稳定（MVP）
2. **US2 数据层**（T008–T010）→ 日期覆盖率门禁通过
3. **US2 页面层**（T011–T014）→ 年份合并 + 日期排序 + 移动端吸顶标题；T015 验收
4. **US3**（T016–T018）→ 两处一致性与门禁
5. **Polish**（T019–T021）→ 全矩阵复核与合规记录

### Parallel Team Strategy

- 开发者 A：US1（T002–T007）
- 开发者 B：US2 数据层（T008–T010），随后接 US2 页面层（T012–T014，需 T002 已合入）
- 开发者 C：US3 / Polish（前置条件为 A、B 完成）

---

## Notes

- [P] 任务 = 不同文件、无未完成依赖；同一文件的任务必须串行
- 每个任务均含文件路径；验收类任务以 [quickstart.md](./quickstart.md) 的具体章节为准
- 日期口径以 **spec FR-011 / Assumptions 为准**：正式出版日期优先 → 上线日期 → 仅 arXiv 链接用 arXiv 首次提交日期（v1） → 无链接留空；有链接条目 MUST 填写 `date`（research R9 已同步此口径）
- `year` 只决定分组与展示，`date` 只用于组内排序，二者允许不同年份（online-first）；不得改写 `year`
- 不新增测试文件、不引入 Playwright / e2e、不新增 npm 依赖或脚本
- 移动端年份导航口径：DOM 保留 + CSS `display: none`；验收看计算样式与可见数量，不要求删除节点
- LINK 槽无需宽度归一化任务：所有 LINK 标签文本恒为「Link ↗」且隐藏占位复用同构标记，宽度天然一致；由 quickstart §4 的 `linkLeftSpread` / `linkRightSpread` 量测兜底（FR-005）
- 提交按任务或逻辑组拆分（Constitution V），合并前在 PR 中记录 quickstart 矩阵结果
