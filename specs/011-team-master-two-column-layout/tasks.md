---

description: "Task list for Team 页 Master's Students 双栏布局"
---

# Tasks: Team 页 Master's Students 双栏布局

**Input**: Design documents from `/specs/011-team-master-two-column-layout/`

**Prerequisites**: plan.md（必需）、spec.md（必需）、research.md、data-model.md、contracts/team-master-two-column.md、quickstart.md

**Tests**: spec 未要求 TDD，plan 明确不引入 e2e / 视觉回归框架（Constitution V）。因此本清单不生成 `tests/` 任务；验证由 `npm run check` + `npm run build` 门禁与 quickstart.md 的真实浏览器十一档视口测量承担，证据写入 `specs/011-team-master-two-column-layout/evidence/layout-verification.md`。

**Organization**: 按 user story 分组，保证每个 story 可独立实现与验收。三个 story 共用唯一源文件 `src/components/StudentGroup.astro`，且证据写入同一 evidence 文件，故实现与测量任务串行；仅 Setup 阶段的只读快照可与基线门禁并行。

**当前基线（生成本清单时核对）**: HEAD = `54f3b81`（数据独立提交）；`src/components/StudentGroup.astro` 已有未提交的 `.master-columns` 两栏切分与三槽骨架，但 `byLevel` 仍为 grade **降序**、三轨仍为 `4em 5em minmax(0, 1fr)`、姓名列仍为 `flex: 0 0 4em`、480–767px Since 仍为 `flex: 0 0 5em`、`.grade` 为 `0.95rem`（站点根字号 16px → 计算值 15.2px）；`note` 字段、渲染与样式已于 2026-11-22 澄清后移除，不再作为本特性基线。本清单的任务即把该骨架对齐澄清后的 spec，并整份重测（旧 evidence 的降序测量与「1rem=18px」假设不得沿用）。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行（不同文件、无未完成依赖）
- **[Story]**: 所属 user story（US1–US3）
- 每条任务均给出明确文件路径

## Path Conventions

单一 Astro 项目：源文件位于 `src/`；本特性改动文件为 `src/components/StudentGroup.astro`（版式/排序）以及 `src/content.config.ts`、`src/data/students.json`、`src/data/README.md`（仅移除 `note` 字段与文档）；特性产物位于 `specs/011-team-master-two-column-layout/`；一次性快照与排序脚本放 `/tmp`（不入库）。

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 建立基线、快照与验收证据骨架

- [X] T001 运行基线门禁 `npm run check && npm run build`，确认退出码均为 0；重写 `specs/011-team-master-two-column-layout/evidence/layout-verification.md`，写入「Baseline」章节（命令、退出码、构建摘要、`git rev-parse HEAD` = `54f3b81`、`git status --porcelain` 的起点清单：`M src/components/StudentGroup.astro`、`M src/content.config.ts`、`M src/data/students.json`、`M src/data/README.md` 与 `?? specs/011-team-master-two-column-layout/`），并用 Node 读取 `src/data/students.json` 记录 **master 11 条 / phd 19 条 / master 链接 0 / note 字段 0**；同时建立十一档视口矩阵（1920 / 1440 / 1280 / 1024 / 768 / 767 / 576 / 481 / 480 / 375 / 320px）空表，列含视觉栏数、栏宽差、顶线差、Since 横向差、链接右缘差、跨区块姓名左缘差、越界元素；旧文件中的降序测量结果 MUST 被整体替换，不得沿用
- [X] T002 [P] 固化改动前快照与升序预期（只读，不改仓库文件）：`cp src/components/StudentGroup.astro /tmp/student-group-011-pre.astro`；用 Node 读取 `src/data/students.json`，按「grade 升序 → 无年级最后 → 同级保持文件顺序」与 `ceil(n/2)` 生成预期栏序，输出到 `/tmp/master-order-expected.txt`，核对 Master's 左 6（朱祉同、张蓓泽、叶振雷、艾明旭、刘润泽、刘梦犁）/ 右 5（张蓬月、顾树焕、温泽林、李佳睿、毛乐平）与 PhD 升序 10 + 9；不写入仓库

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 统一两个在读分组的展示顺序，作为 US1 分栏名单与 US2/US3 验收的前置

**⚠️ CRITICAL**: 本阶段完成前，US1 的 6 + 5 名单与全部顺序核对均不成立

- [X] T003 在 `src/components/StudentGroup.astro` frontmatter 把 `byLevel` 的组内比较器由 grade 降序改为 **grade 升序 → 无年级最后 → 稳定序**（两侧均无 `grade` 返回 0；仅一侧为空时非空在前；否则 `a.data.grade.localeCompare(b.data.grade)`），使 PhD 与 Master's 同时生效；同步修正第 10 行、第 19–20 行与第 31 行全部「grade 降序」注释为 011 升序表述；MUST NOT 改动 `masterColumns` 的 `Math.ceil(n / 2)` 切分、`.master-columns` 包装、`.is-single` 判定与 `linkOf` 的 `url` → `github` → `scholar` 映射；MUST NOT 修改 `src/data/students.json`（`note` 字段移除已在澄清阶段完成）

**Checkpoint**: Master's 升序 2024 → 2026（6 + 5）、PhD 升序 2021 → 2026（10 + 9），后续 story 可开始

---

## Phase 3: User Story 1 - 宽屏下 Master's Students 呈左右两栏 (Priority: P1) 🎯 MVP

**Goal**: 视口 ≥768px 时 11 条记录按左 6 / 右 5 等宽两栏呈现，两栏顶线一致、栏距 32px；<768px 单栏且无空栏；n=1 与 n=0 边界正确；PhD 分组零改动。

**Independent Test**: 在 1920 / 1440 / 1280 / 1024 / 768px 打开 `/team/`，测量 `.master-columns` 两个 `<ul>` 的宽度差与顶线差均 ≤1px、栏距 32px、外缘与内容区对齐；每栏条数 [6, 5]、总行数 11、`h3` 唯一；行内列宽尚未调整也可独立确认两栏结构与升序名单成立。

- [X] T004 [US1] 核对并保持 `src/components/StudentGroup.astro` 的 Master's 两栏结构符合 FR-001～FR-003（现状已实现，不得回退）：唯一 `<h3>Master's Students</h3>` 在上、`div.master-columns`（`class:list={['master-columns', { 'is-single': masterSingle }]}`）内渲染 1–2 个 `<ul>`，每栏 `<li>` 保留 `student-name` / `grade` / `member-link` 类名且不再渲染 `note`；n=1 仅 1 个 `<ul>` 加 `.is-single`，n=0 继续走 `p.empty`「Master's students coming soon.」且不渲染 `.master-columns`；若与上述结构有偏差按最小改动补齐，MUST NOT 改动 PhD 分支 markup
- [X] T005 [US1] 核对并保持 `src/components/StudentGroup.astro` 中 `@media (min-width: 768px)` 的两栏容器声明（`.phd-columns, .master-columns` 选择器并列）：`grid-template-columns: repeat(2, minmax(0, 1fr))`、`column-gap: 32px`、`align-items: start`、`.is-single` 回到单列、第二个 `<ul>` 首行保留顶线；声明值与 010 逐条一致，MUST NOT 新增第二套栏宽/栏距数值或新断点，MUST NOT 改动 PhD 分支 DOM/类名
- [X] T006 [US1] 真实浏览器验收 US1（`http://localhost:4321/team/`，1920 / 1440 / 1280 / 1024 / 768px）：执行 quickstart §2 脚本测量两栏宽度差（≤1px）、顶线差（≤1px）、栏距（期望 32px）、外缘差（≤1px）、最长记录宽（≤ 内容区宽/2 + 1px），核对每栏条数 [6, 5]、`.master-columns` 内行数 11、分组标题唯一且横跨内容区；按升序核对左右栏姓名与 data-model §1 表格逐字一致；对比 PhD 的 `<ul>` 宽度差与栏距差均 ≤1px；结果写入 `specs/011-team-master-two-column-layout/evidence/layout-verification.md` 的 US1 章节

**Checkpoint**: US1 可独立验收并作为 MVP 交付（两栏结构 + 升序 6 / 5 成立）

---

## Phase 4: User Story 2 - 每行按「姓名 → Since → 右侧链接」分层 (Priority: P1)

**Goal**: 横向行（≥480px）中每行按姓名、Since 年份、成员链接三槽排列；姓名列弹性吸收余量、Since 随视口右移；同栏 Since 左缘同线、链接右缘贴齐栏右缘；Since 字号 18px；缺失字段不渲染任何占位。

**Independent Test**: 在 1440 / 1024 / 768px 逐行核对 11 条记录视觉顺序为姓名 → Since →（链接，若有）；同栏 `.grade` 左缘差 ≤1px 且左缘随视口变宽单调右移；11 个 Since 计算字号 18px；当前 0 链接、姓名不可点击、无占位文本；临时注入链接后同栏 `.member-link` 右缘差 ≤1px、与 `ul` 右缘 −24px 差 ≤1px、与 Since 右缘间隙 8px±1px。

- [X] T007 [US2] 在 `src/components/StudentGroup.astro` 的 `@media (min-width: 768px)` 内把共享行三轨由 `grid-template-columns: 4em 5em minmax(0, 1fr)` 改为 **`minmax(4em, 1fr) 5.5em auto`**（选择器仍为 `.phd-columns li, .master-columns li`；Since 槽 5.5em = 99px，为 18px 文本约 90px 留余量），保留 `column-gap: 8px`、`padding: 8px 24px` 与 `.student-name` / `.grade` / `.member-link`（`justify-self: end`）的 `grid-column` 定位；姓名保持 `overflow-wrap: break-word`；MUST NOT 重命名 `.phd-columns` 或修改 PhD 分支 markup、断点与栏距
- [X] T008 [US2] 在 `src/components/StudentGroup.astro` 中把 `.grade { color: var(--ink-soft); font-size: 0.95rem }` 改为 `.grade { color: var(--ink-soft); font-size: 18px }`（站点根字号 16px，`1rem` 只有 16px，MUST NOT 用 `1rem` 实现 18px；MUST NOT 修改 `html` 根字号），保留 `.grade { margin-left: auto }`（单栏基线）与网格/窄屏规则中的 `margin-left: 0` 覆盖；该项对 PhD 与 Master's 同时生效，其他文本字号 MUST NOT 变化
- [X] T009 [US2] 真实浏览器验收 US2（1920 / 1440 / 1280 / 1024 / 768px）：逐行确认视觉顺序为「姓名 → Since →（链接）」，核对 `.master-columns` 内 11 个 `.grade`、0 个 `.member-link`、`.student-name a` 为 0、无 `N/A` / `—` / `&nbsp;` 占位；按栏测量 Since 左缘跨行差 ≤1px 与尾隙 ≤8px；在 768 / 1024 / 1280 / 1440 / 1920px 记录 `.grade` 左缘，确认 768→1024→1280→1440→1920 单调不减，并断言 1440 与 1920 的左缘差 ≤1px（容器 1180px 上限、内容区 1132px 后保持不变）；测 `.grade` 计算字号 18px、页面 `.note` 元素为 0；按 quickstart §3 临时注入 `.member-link` 后测同栏右缘差 ≤1px、与 Since 右缘间隙 8px±1px（随后刷新还原，不改数据文件）；测 Master's 姓名左缘与 `.phd-columns .student-name`、`.grad-name` 左缘差均 ≤1px；在 768px 按 quickstart §8 实测姓名轨 / Since 盒 / 行内可用宽（期望 181 / ≤99 / 296px），三槽合计 + 16px 间隙 ≤ 行内可用宽，否则按缺陷记录并上报（MUST NOT 缩小字号、换行标签、隐藏链接或改共享声明值兜底）；`linkOf` 的 `url` → `github` → `scholar` 映射不在本特性改动范围，由 T017 的零 diff 核对保证，注入链接仅验证槽位几何；结果写入 evidence 的 US2 章节

**Checkpoint**: US1 + US2 同时满足（两栏 + 行内三槽、右移、字号与对齐）

---

## Phase 5: User Story 3 - 页面收窄时退化为单栏与竖排条目 (Priority: P2)

**Goal**: 480–767px 为单栏横向三槽行（姓名弹性吸收余量、Since 随之右移）；<480px 为单栏竖排（第 1 行姓名 + Since 右对齐，第 2 行链接左对齐）；两种形态均无空栏、半宽列与横向滚动。

**Independent Test**: 在 767 / 576 / 481 / 480px 确认单栏横向行、Since 位于第二列且跨行左缘差 ≤1px；在 375 / 320px 确认竖排（Since 右缘差 ≤1px、11 行均无链接因而不渲染第 2 行）；六档均无空栏、双分隔线、重叠、截断、溢出与页面横向滚动。

- [X] T010 [US3] 在 `src/components/StudentGroup.astro` 的 `@media (min-width: 480px) and (max-width: 767.98px)` 内把共享姓名列由 `flex: 0 0 4em` 改为 **`flex: 1 1 4em`**（选择器为 `.phd-columns .student-name, .master-columns .student-name`），把 Since 由 `flex: 0 0 5em` 改为 **`flex: 0 0 5.5em`**（99px，容纳 18px 的 `Since YYYY`）并保留 `margin-left: 0`，链接保持 `flex: 0 0 auto; margin-left: auto; text-align: right` 与 `column-gap: 8px`；MUST NOT 修改全局 `li` / `.student-name` 基线规则与 479.98px / 767.98px 断点
- [X] T011 [US3] 核对并保持 `src/components/StudentGroup.astro` 中 `@media (max-width: 479.98px)` 的竖排规则符合 FR-002 / FR-004～FR-007：姓名 `flex: 0 0 auto`、Since `margin-left: auto` 右对齐、链接 `order: 9; flex: 0 0 100%; margin-left: 0; text-align: left` 独占第 2 行且左缘与姓名对齐；确认 DOM 顺序「姓名 → Since → 链接」在竖排态呈现为「姓名 + Since → 链接」；无链接不渲染第 2 行；若有偏差按最小改动补齐，MUST NOT 调整断点阈值
- [X] T012 [US3] 真实浏览器验收 US3（767 / 576 / 481 / 480 / 375 / 320px）：确认 `.master-columns` 的 `gridTemplateColumns` 解析为单列、11 条按升序自上而下、无空栏 / 半宽列、两个 `<ul>` 之间无双分隔线；480–767px 行内三槽不折行、Since 跨行左缘差 ≤1px、姓名槽宽 ≥72px（4em）、每条记录横跨内容区整宽；375 / 320px 竖排态 Since 跨行右缘差 ≤1px 且与 `<ul>` 右缘 −24px 差 ≤1px、11 行均无 `.member-link` 因而无第 2 行；随后按 quickstart §3 方式在 481 / 480 / 375px 各临时注入 2 行 `.member-link`（刷新还原），测 480–767px 的 Since↔链接间隙 8px±1px 与链接右缘差 ≤1px、375px 的链接左缘与姓名左缘差 ≤1px；六档均核对姓名左缘与 `.grad-name` 左缘差 ≤1px，且无重叠 / 截断 / 溢出 / 页面横向滚动；结果写入 `specs/011-team-master-two-column-layout/evidence/layout-verification.md` 的 US3 章节

**Checkpoint**: 三个 story 全部可独立验收

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 全档位破损检查、边界场景、回归、门禁与范围收口

- [X] T013 十一档视口逐元素越界与横向溢出检查（quickstart §5，1920 / 1440 / 1280 / 1024 / 768 / 767 / 576 / 481 / 480 / 375 / 320px）：每档执行 `document.documentElement.scrollWidth - window.innerWidth ≤ 0` 与 `main *` 越界元素数为 0；目视确认无元素重叠、文字截断、内容溢出、非预期换行（<480px 竖排两行为契约声明的既定形态，不计为破损）、无表头行 / 栏间竖线；结果写入 `specs/011-team-master-two-column-layout/evidence/layout-verification.md` 的「Breakage」章节
- [X] T014 回归检查（`http://localhost:4321/team/`）：PhD Candidates 仍以 `.phd-columns` 两栏呈现，19 条按升序 10 + 9（2021 → 2026）、19 个 `.grade`、4 个 `.member-link`、页面 `.note` 元素为 0、行内顺序与 010 验收脚本定位不变、Since 字号在 1440 与 768px 均为 18px；Graduates 桌面五列形态、<768px 三段式（定义见 `src/pages/team.astro` 的 `.graduate-list` 规则）、内容与 24px 内距不变；Faculty 区块与其余页面不变；结果写入 evidence 的「Regression」章节（quickstart §6 第 1–2 项）
- [X] T015 边界场景验收（只读数据文件；临时 DOM 注入后刷新还原，不入库）：在 dev 环境验证 n=1（仅保留 1 条 `li` 并加 `.is-single`，确认单栏整宽、无空栏）、缺年级（移除 `.grade`，确认无占位且 `.member-link` 仍由 `grid-column: 3` 定位）、超长姓名（改写 `.student-name` 文本，确认在姓名槽内换行、不越入 Since 列）；用 Node 脚本对合成数组核对 `ceil(n/2)` 切分（n=0 / 1 / 2 / 5 / 6 / 7 / 11）、n=0 占位分支条件，以及含空 grade / 同 grade 的排序结果（无年级排最后、同级保持输入顺序）；在 dev 浏览器把 `.master-columns` 临时替换为 `<p class="empty">Master's students coming soon.</p>`，确认占位文案占满内容区整行、无空栏 / 半宽列，刷新还原；结果写入 evidence 的「Edge Cases」章节
- [X] T016 运行最终门禁 `npm run check && npm run build`，确认退出码均为 0 且静态构建成功；构建摘要与时间写入 `specs/011-team-master-two-column-layout/evidence/layout-verification.md`
- [X] T017 核对改动范围：以 T001 记录的起点（HEAD = `54f3b81`）为基线，`git status --porcelain` 与 `git diff --stat` 确认本特性改动仅为 `src/components/StudentGroup.astro`、`src/content.config.ts`、`src/data/students.json`、`src/data/README.md` 与 `specs/011-team-master-two-column-layout/`；`git diff HEAD -- src/data/graduates.json src/pages/team.astro src/styles/global.css src/components/TeacherCard.astro` 为空；`students.json` 的 diff 仅删除 `note` 键、`content.config.ts` 仅删除 `note` schema 行、`README.md` 仅删除 `note` 字段说明；`StudentGroup.astro` 的 diff 仅含 `byLevel` 升序比较器与注释、Master's 分支 / `.master-columns` 包装、note 渲染与 `.note` 样式移除、共享四项调整（三轨 `minmax(4em,1fr) 5.5em auto`、480–767px 姓名 `flex: 1 1 4em`、480–767px Since `flex: 0 0 5em → 5.5em`、`.grade` 字号 `18px`）；`linkOf` 的 `url` → `github` → `scholar` 映射零 diff（FR-006 标签选择逻辑不变）；数据更新已在独立 commit `54f3b81`、`note` 字段移除除外，不属于本特性；结论写入 evidence 的「Scope」章节
- [X] T018 定稿 `specs/011-team-master-two-column-layout/evidence/layout-verification.md`：十一档矩阵全部填齐（视觉栏数 / 宽度差 / 顶线差 / Since 横向差 / 链接右缘差 / 跨区块姓名左缘差 / 越界元素）、三 story 测量明细、768px 三槽实测值、边界场景、回归与范围结论、门禁结果；对照 quickstart「预期结果」逐项勾选，确认旧降序测量已被替换

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖，立即开始；T001 与 T002 无共享写入，可并行
- **Foundational (Phase 2)**: 依赖 Setup（T002 的快照用于后续 diff 核对）；T003 完成后全部 story 才具备正确升序名单
- **User Stories (Phase 3–5)**: 均依赖 T003
  - US1（T004–T006）→ US2（T007–T009）→ US3（T010–T012）顺序执行：三个 story 共用 `src/components/StudentGroup.astro`，且 US2 的三轨建立在 US1 的两栏容器上、US3 的退化规则建立在 US2 的行内顺序与槽位上
- **Polish (Phase 6)**: 依赖 US1–US3 全部完成；T013–T018 均写入同一 evidence 文件，串行执行；T016 为最终门禁，T017 在其后核对范围，T018 最后汇总定稿

### User Story Dependencies

- **US1 (P1)**: T003 后可开始，无其他 story 依赖 → MVP
- **US2 (P1)**: 依赖 US1 的 `.master-columns` 包装与两栏结构；仍可按「行内三槽 + 右移 + 字号」独立验收
- **US3 (P2)**: 依赖 US1 包装层与 US2 的 DOM/槽位规则；退化形态可独立验收

### Within Each User Story

- US1：两栏结构核对（T004）→ 两栏容器声明核对（T005）→ 四档浏览器验收（T006）
- US2：三轨与弹性姓名（T007）→ 字号拆分（T008）→ 三档验收与 768px 实测（T009）
- US3：480–767px 姓名弹性（T010）→ <480px 竖排核对（T011）→ 六档验收（T012）
- 每个 story 完成后停在该 Checkpoint 独立验收，再进入下一 story

### Parallel Opportunities

- **T001 ⇄ T002**：T001 写 evidence 并跑门禁，T002 只写 `/tmp` 快照与预期名单，互不冲突
- 其余任务无 `[P]`：实现类任务均落在同一文件 `src/components/StudentGroup.astro`；所有验收与证据任务共享同一 evidence 文件，串行写入避免并发冲突

---

## Parallel Example: Setup

```bash
# 终端 A：基线门禁与 evidence 骨架
npm run check && npm run build

# 终端 B：只读快照与升序预期（/tmp，不入库）
cp src/components/StudentGroup.astro /tmp/student-group-011-pre.astro
node -e "/* 按 FR-003 排序并 ceil 切分，核对 6+5 与 10+9 */"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. 完成 Phase 1: Setup（T001–T002）
2. 完成 Phase 2: Foundational（T003）
3. 完成 Phase 3: US1（T004–T006）
4. **STOP and VALIDATE**: 在 1920 / 1440 / 1280 / 1024 / 768px 独立验收两栏结构（升序 6 + 5、等宽、顶线一致、栏距 32px、与 PhD 栏宽一致）
5. 两栏结构即用户「将硕士也写成两栏」的核心诉求，可先行演示

### Incremental Delivery

1. Setup + Foundational → 基线、快照与升序排序就绪
2. US1 → 两栏结构与升序名单验收（MVP）
3. US2 → 行内三槽、Since 右移、链接右缘与 18px 字号验收（P1 完整达成）
4. US3 → 窄屏单栏横向与 <480px 竖排验收
5. Polish → 十一档无破损、边界场景、回归、门禁与范围收口

### Notes

- [P] 任务 = 不同文件、无依赖；本特性源文件唯一且 evidence 文件共享，故仅 T001 / T002 可并行
- 字号硬约束：站点 `html` 未设置字号（根字号 = 浏览器默认 16px，`body` 的 18px 不改变 `rem` 基准），T008 MUST 用显式 `18px`；MUST NOT 用 `1rem`（=16px）、MUST NOT 修改 `html` 根字号（会放大全站 rem 尺寸）
- 每条任务完成后按逻辑组提交，保持小步可回滚（Constitution V）；evidence 目录随实现期产物提交
- 严格禁止：页面级 `overflow-x: hidden` 掩盖溢出、缩小字号 / 隐藏链接 / 截断姓名换取两栏、除 `note` 字段移除外的 `students.json` 与 schema 改动、重命名或复制 `.phd-columns` 样式块、沿用澄清前的降序 / 旧字号 / 旧槽宽测量
- 数据基准：11 条 master（2024–2026，均无链接），升序切分 6 + 5；PhD 19 条、4 链接、升序 10 + 9（data-model §1、research R8）
- 数据边界：数据更新（新增 11 位硕士、15 位博士，5 位原 PhD 转入 Graduates）已在特性开始前作为独立 commit `54f3b81` 提交，不属于本特性——除 `note` 字段移除外，本特性不修改、不提交数据文件
- 验收以整数视口宽度为准：768px 两栏、767px 单栏横向、479px 及以下竖排
