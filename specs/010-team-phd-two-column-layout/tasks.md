---

description: "Task list for Team 页 PhD Candidates 双栏布局"
---

# Tasks: Team 页 PhD Candidates 双栏布局

**Input**: Design documents from `/specs/010-team-phd-two-column-layout/`

**Prerequisites**: plan.md（必需）、spec.md（必需）、research.md、data-model.md、contracts/team-phd-two-column.md、quickstart.md

**Tests**: spec 未要求 TDD，plan 明确不引入 e2e / 视觉回归框架。因此本清单不生成 `tests/` 任务；验证由 `npm run check` + `npm run build` 门禁与 quickstart.md 的真实浏览器十一档视口测量承担，证据写入 `specs/010-team-phd-two-column-layout/evidence/layout-verification.md`。

**Organization**: 按 user story 分组，保证每个 story 可独立实现与验收。三个 story 共用唯一源文件 `src/components/StudentGroup.astro`，故实现任务按 story 顺序串行，仅证据/门禁类只读任务可并行。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行（不同文件、无未完成依赖）
- **[Story]**: 所属 user story（US1–US3）
- 每条任务均给出明确文件路径

## Path Conventions

单一 Astro 项目：源文件位于 `src/`；本特性唯一改动文件为 `src/components/StudentGroup.astro`；特性产物位于 `specs/010-team-phd-two-column-layout/`；一次性测量脚本放 `/tmp`（不入库）。

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 建立基线、快照与验收证据骨架

- [X] T001 运行基线门禁 `npm run check && npm run build`，确认退出码均为 0；创建 `specs/010-team-phd-two-column-layout/evidence/layout-verification.md`，写入「Baseline」章节（命令、退出码、构建摘要、`git rev-parse HEAD` 的 commit SHA）
- [X] T002 [P] 固化改动前基线快照（只读，不改文件）：`git show HEAD:src/components/StudentGroup.astro > /tmp/student-group-base.astro`；用 Node 读取 `src/data/students.json`，确认 PhD 9 条、6 条 `grade`（2020/2021/2022）、8 个链接标签、9 人无 `note`，输出到 `/tmp/phd-baseline.txt`，并把计数写入 evidence 的「Baseline」章节
- [X] T003 在 `specs/010-team-phd-two-column-layout/evidence/layout-verification.md` 建立十一档视口矩阵表格骨架（1920 / 1440 / 1280 / 1024 / 768 / 767 / 576 / 481 / 480 / 375 / 320px）与测量列（视觉栏数（computed grid-template-columns）、两栏宽度差、顶线差、Since 左缘差、链接右缘差、跨区块姓名左缘差、越界计数），供 US1–US3 与 Polish 阶段填充

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 建立所有 user story 共用的 `.phd-columns` 作用域样式入口与列表基线

**⚠️ CRITICAL**: 本阶段完成前，后续各 story 的样式规则无处挂载

- [X] T004 在 `src/components/StudentGroup.astro` 的 `<style>` 末尾新增 `.phd-columns` 作用域样式骨架：包装层 `display: grid; grid-template-columns: minmax(0, 1fr)`；`.phd-columns ul` 列表重置（`list-style: none; margin: 0; padding: 0`）；单栏分隔线衔接 `.phd-columns ul + ul li:first-child { border-top: 0 }`；姓名收纳 `.phd-columns .student-name { overflow-wrap: break-word }`（无空格超长姓名在槽内换行）；MUST NOT 修改任何既有选择器、Master's 分支样式与 480px 断点阈值

**Checkpoint**: `.phd-columns` 作用域就绪，US1 可开始

---

## Phase 3: User Story 1 - 宽屏下 PhD Candidates 呈左右两栏 (Priority: P1) 🎯 MVP

**Goal**: 视口 ≥768px 时 9 条记录按 5 左 / 4 右等宽两栏呈现，两栏顶线一致、栏距 32px；<768px 单栏且无空栏；n=1 与 n=0 边界正确。

**Independent Test**: 在 1440 / 1280 / 1024 / 768px 打开 `/team/`，测量两个 `<ul>` 的宽度差与顶线差均 ≤1px、栏距 32px、外缘与内容区对齐；每栏条数为 [5, 4]、总行数 9、`h3` 唯一；行内列顺序尚未调整也可独立确认两栏结构成立。

- [X] T005 [US1] 在 `src/components/StudentGroup.astro` frontmatter 新增 PhD 切分逻辑：`n = phd.length`；`n === 0` 时不生成栏（保留既有占位分支）；`n === 1` 时为单栏单条并标记 `single: true`；`n ≥ 2` 时 `k = Math.ceil(n / 2)`，左栏 `phd.slice(0, k)`、右栏 `phd.slice(k)`（当前 9 条 → 5 + 4）；MUST NOT 改动 `byLevel` 排序（grade 降序 → 无年级最后 → 稳定序）与 `linkOf` 映射
- [X] T006 [US1] 改写 `src/components/StudentGroup.astro` 的 PhD 分支 markup：在唯一 `<h3>PhD Candidates</h3>` 下方渲染 `div.phd-columns`（n=1 时加 `is-single`），按 T005 结果映射为 1–2 个 `<ul>`，每栏 `<li>` 保留 `student-name` / `grade` / `member-link` / `note` 类名与既有内容；`phd.length === 0` 时保留 `p.empty`「PhD candidates coming soon.」且不渲染 `.phd-columns`；MUST NOT 改动 Master's 分支 markup
- [X] T007 [US1] 在 `src/components/StudentGroup.astro` scoped 样式中新增两栏规则：`@media (min-width: 768px)` 内 `.phd-columns { grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 32px; align-items: start }`，并在该断点恢复 `.phd-columns ul + ul li:first-child { border-top: 1px solid var(--line) }`（两列各有顶线）；n=1 时 `.phd-columns.is-single { grid-template-columns: minmax(0, 1fr) }` 回到单列整宽；<768px 保持单列（不出现半宽列或空栏）
- [X] T008 [US1] 真实浏览器验收 US1（`http://localhost:4321/team/`，1440 / 1280 / 1024 / 768px）：执行 quickstart §2 脚本测量两栏宽度差、顶线差、栏距、外缘差、最长记录宽（≤ 内容区宽/2 + 1px），并核对每栏条数 [5, 4]、`.phd-columns` 内行数 9、分组标题唯一；结果写入 `specs/010-team-phd-two-column-layout/evidence/layout-verification.md` 的 US1 表格

**Checkpoint**: US1 可独立验收并作为 MVP 交付（两栏结构成立，行内顺序可未调整）

---

## Phase 4: User Story 2 - 每行按「姓名 → Since → 右侧链接」分层 (Priority: P1)

**Goal**: 横向行（≥480px）中每行按姓名、Since 年份、个人链接三槽排列；同栏 Since 左缘同线、链接右缘贴齐栏右缘；缺失字段不渲染任何占位。

**Independent Test**: 在 1440 与 768px 逐行核对 9 条记录视觉顺序为姓名 → Since → 链接；同栏 `.grade` 左缘差 ≤1px、`.member-link` 右缘差 ≤1px 且与 `ul` 右缘 −24px 差 ≤1px；6 个 Since、8 个链接；季慧山无链接、李江楠 / 刘曦雨 / 刘正宵无年级且无占位文本；姓名不可点击。

- [X] T009 [US2] 调整 `src/components/StudentGroup.astro` 中 PhD 行的 DOM 顺序为「`span.student-name` → `span.grade`（Since）→ `a.member-link` → `span.note`」；仅在字段存在时渲染对应元素，无年级 / 无链接不渲染任何占位（无 "Since"、破折号、`&nbsp;`）；姓名保持纯文本；MUST NOT 改变 Master's 分支的既有顺序（姓名 → 链接 → Since → 备注）
- [X] T010 [US2] 在 `src/components/StudentGroup.astro` 的 `@media (min-width: 768px)` 内新增行内三槽网格：`.phd-columns li { display: grid; grid-template-columns: 4em 5em minmax(0, 1fr); column-gap: 8px; padding: 8px 24px }`；`.phd-columns .student-name { grid-column: 1 }`、`.phd-columns .grade { grid-column: 2; margin-left: 0 }`、`.phd-columns .member-link { grid-column: 3; justify-self: end; text-align: right }`、`.phd-columns .note { grid-column: 1 / -1 }`；缺失年级时链接仍由显式 `grid-column: 3` 定位
- [X] T011 [US2] 真实浏览器验收 US2（1440 与 768px）：逐行确认视觉顺序；按栏测量 Since 左缘差 ≤1px、链接右缘差 ≤1px 且与 `ul` 右缘 −24px ≤1px；核对 `.phd-columns` 内 6 个 `.grade`、8 个 `.member-link`、季慧山行无 `.member-link`、无年级三行无 `.grade`、`.student-name a` 数量为 0；在 768px 实测姓名槽 / Since 文本 / 链接占用宽与行内可用宽（quickstart §8），三槽合计 + 16px 间隙 ≤ 行内可用宽，实测值写入 `specs/010-team-phd-two-column-layout/evidence/layout-verification.md`；并测量左栏 `.student-name` 左缘与 `.grad-name` 左缘差 ≤1px（FR-008）；若 Since 文本超出 5em，将 5em 收紧为「实测 Since 宽 + 4px」；若 `Homepage ↗` 仍超出第三列，再将列间隙由 8px 收至 4px，仍不足时记录实测值并上报（MUST NOT 反向增大 5em 轨道、缩小字号、换行标签或隐藏链接）

**Checkpoint**: US1 + US2 同时满足（两栏 + 行内三槽对齐）

---

## Phase 5: User Story 3 - 页面收窄时退化为单栏与竖排条目 (Priority: P2)

**Goal**: 480–767px 为单栏横向三槽行；<480px 为单栏竖排（第 1 行姓名 + Since 右对齐，第 2 行链接左对齐）；两种形态均无空栏、半宽列与横向滚动。

**Independent Test**: 在 767 / 576 / 481 / 480px 确认单栏横向行、链接贴右缘；在 375 / 320px 确认竖排两行（Since 右缘差 ≤1px、链接左缘与姓名左缘差 ≤1px）；六档均无重叠、截断、溢出与页面横向滚动。

- [X] T012 [US3] 在 `src/components/StudentGroup.astro` 新增 `@media (min-width: 480px) and (max-width: 767.98px)` 单栏横向覆盖（均以 `.phd-columns` 限定）：`li { column-gap: 8px }`、`.student-name { flex: 0 0 4em }`、`.grade { flex: 0 0 5em; margin-left: 0 }`、`.member-link { flex: 0 0 auto; margin-left: auto; text-align: right }`、`.note { flex: 0 0 100% }`；MUST NOT 修改既有全局 `li` / `.student-name` / `.member-link` 基线规则（Master's 依赖它们）
- [X] T013 [US3] 在 `src/components/StudentGroup.astro` 的 `@media (max-width: 479.98px)` 内新增 `.phd-columns` 限定覆盖：`.student-name { flex: 0 0 auto }`、`.grade { margin-left: auto }`（第 1 行右对齐）、`.member-link { order: 9; flex: 0 0 100%; margin-left: 0; text-align: left }`（第 2 行独占、与姓名左缘对齐）、`.note { flex: 0 0 100% }`（位于链接之前）；确保 DOM 改序后竖排阅读顺序为「姓名 + Since → 备注 → 链接」；不得调整 479.98px 阈值
- [X] T014 [US3] 真实浏览器验收 US3（767 / 576 / 481 / 480 / 375 / 320px）：确认 `.phd-columns` 的 `gridTemplateColumns` 解析为单列、9 条自上而下、无空栏 / 半宽列；480–767px 行内三槽不折行且链接右缘与 `ul` 右缘 −24px 差 ≤1px；375 / 320px 竖排态 Since 右缘差 ≤1px、链接左缘与同行姓名左缘差 ≤1px、链接位于姓名下一行、季慧山行无链接节点、无年级行无 `.grade`；六档均核对 `.student-name` 左缘与 `.grad-name` 左缘差 ≤1px（FR-008）；六档无重叠 / 截断 / 溢出 / 横向滚动；结果写入 `specs/010-team-phd-two-column-layout/evidence/layout-verification.md` 的 US3 表格

**Checkpoint**: 三个 story 全部可独立验收

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 全档位破损检查、回归与门禁收口

- [X] T015 [P] 回归检查（`http://localhost:4321/team/`）：Master's Students 占位文案「Master's students coming soon.」原样显示、无 `.phd-columns` 结构；Graduates 14 条内容、五列桌面形态与 <768px 三段式、24px 内距与姓名左缘不变；结果写入 `specs/010-team-phd-two-column-layout/evidence/layout-verification.md` 的「Regression」章节（quickstart §6.1–6.2）
- [X] T016 [P] 十一档视口逐元素越界与横向溢出检查（quickstart §5）：`document.documentElement.scrollWidth - window.innerWidth ≤ 0`、`main *` 越界元素数为 0；<480px 的竖排两行按既定形态处理，不计为破损；结果写入 `specs/010-team-phd-two-column-layout/evidence/layout-verification.md` 的「Breakage」章节
- [X] T017 运行最终门禁 `npm run check && npm run build`，确认退出码均为 0 且静态构建成功；构建摘要与时间写入 `specs/010-team-phd-two-column-layout/evidence/layout-verification.md`
- [X] T018 核对改动范围：`git diff --stat` 仅显示 `src/components/StudentGroup.astro` 与 `specs/010-team-phd-two-column-layout/`；确认 `src/data/students.json`、`src/pages/team.astro`、`src/styles/global.css`、`src/content.config.ts`、`src/components/TeacherCard.astro` 的 diff 为空；结论写入 `specs/010-team-phd-two-column-layout/evidence/layout-verification.md` 的「Scope」章节
- [X] T019 定稿 `specs/010-team-phd-two-column-layout/evidence/layout-verification.md`：十一档矩阵全部填齐（视觉栏数 / 宽度差 / 顶线差 / Since 左缘差 / 链接右缘差 / 跨区块姓名左缘差 / 越界计数）、三 story 测量明细、768px 三槽实测值、回归与范围结论、门禁结果；对照 quickstart「预期结果」逐项勾选

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖，立即开始；T002 可与 T001 并行
- **Foundational (Phase 2)**: 依赖 T001（基线确认）；T004 完成后才可挂载 story 样式
- **User Stories (Phase 3–5)**: 均依赖 Phase 2
  - US1（T005–T008）→ US2（T009–T011）→ US3（T012–T014）顺序执行：三个 story 共用 `src/components/StudentGroup.astro`，且 US2 的网格/槽位与 US3 的退化规则分别建立在 US1 的 `.phd-columns` 包装层与 US2 的 DOM 顺序之上
- **Polish (Phase 6)**: 依赖 US1–US3 全部完成；T015 / T016 可并行，T017–T019 收口

### User Story Dependencies

- **US1 (P1)**: Phase 2 后可开始，无其他 story 依赖 → MVP
- **US2 (P1)**: 依赖 US1 的 `.phd-columns` 包装层与两栏结构；仍可按「行内顺序 + 槽位对齐」独立验收
- **US3 (P2)**: 依赖 US1 包装层与 US2 的 DOM 顺序；退化形态可独立验收

### Within Each User Story

- US1：切分逻辑（T005）→ markup（T006）→ 两栏样式（T007）→ 浏览器验收（T008）
- US2：DOM 顺序（T009）→ 三槽网格（T010）→ 验收与 768px 实测（T011）
- US3：单栏横向覆盖（T012）→ 竖排覆盖（T013）→ 六档验收（T014）
- 每个 story 完成后停在该 Checkpoint 独立验收，再进入下一 story

### Parallel Opportunities

- Setup：T001 与 T002 可并行（不同文件）
- Polish：T015 与 T016 可并行；T018（只读 diff 检查）可与 T016 并行
- story 内部实现任务均落在同一文件 `src/components/StudentGroup.astro`，不可并行；证据文档的 story 章节由对应验收任务串行写入（T003 已建骨架）

---

## Parallel Example: Setup / Polish

```bash
# Setup（不同文件，可并行）
Task: "T001 运行基线门禁并创建 evidence/layout-verification.md"
Task: "T002 固化改动前 StudentGroup.astro 与 students.json 基线快照到 /tmp"

# Polish（只读检查，可并行）
Task: "T015 回归检查 Master's 与 Graduates 并写入 evidence"
Task: "T016 十一档逐元素越界与横向溢出检查并写入 evidence"
Task: "T018 git diff --stat 核对改动范围"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. 完成 Phase 1: Setup（T001–T003）
2. 完成 Phase 2: Foundational（T004）
3. 完成 Phase 3: US1（T005–T008）
4. **STOP and VALIDATE**: 在 1440 / 1280 / 1024 / 768px 独立验收两栏结构（5 + 4、等宽、顶线一致、栏距 32px）
5. 两栏结构即用户「消除横向空旷」的核心诉求，可先行演示

### Incremental Delivery

1. Setup + Foundational → 基线与作用域就绪
2. US1 → 两栏结构验收（MVP）
3. US2 → 行内「姓名 → Since → 链接」三槽与对齐验收（P1 完整达成）
4. US3 → 窄屏单栏横向与 <480px 竖排验收
5. Polish → 十一档无破损、回归、门禁与范围收口

### Notes

- [P] 任务 = 不同文件、无依赖；本特性源文件唯一，实现类任务默认串行
- 每条任务完成后按逻辑组提交，保持小步可回滚（Constitution V）
- 严格禁止：页面级 `overflow-x: hidden` 掩盖溢出、缩小字号 / 隐藏链接 / 截断姓名换取两栏、任何 `students.json` 与 schema 改动
- 数据基准：9 条记录、6 条 Since、8 个链接、季慧山无链接、李江楠 / 刘曦雨 / 刘正宵无年级（data-model §1、research R8）
- 验收以整数视口宽度为准：768px 两栏、767px 单栏横向、479px 及以下竖排
