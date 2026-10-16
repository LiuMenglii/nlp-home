---

description: "Task list for feature implementation"
---

# Tasks: Team 页多分辨率响应式布局（Team Responsive Layout）

**Feature**: `003-team-responsive-layout` | **Input**: [spec.md](./spec.md) / [plan.md](./plan.md) / [research.md](./research.md)（R1–R11）/ [data-model.md](./data-model.md) / [contracts/team-responsive-layout.md](./contracts/team-responsive-layout.md) / [quickstart.md](./quickstart.md)

**Prerequisites**: plan.md（技术栈与结构：Astro 静态站点，零新依赖/零新 JS）、spec.md（用户故事与优先级）、research.md（R1–R11 设计决策）、data-model.md（毕业生目标状态与视图实体）、contracts/team-responsive-layout.md（视口行为矩阵）、quickstart.md（九档视口验证矩阵）

**Tests**: 本特性**不新增自动化测试**——spec/plan 已明确验证方式为「手动视口矩阵（DevTools 响应式模式）+ 构建门禁 + FR-016 负向用例」，不引入 e2e / 视觉回归框架（Constitution V / YAGNI）。因此下列任务不含测试代码编写任务，改以**验收任务**呈现（浏览器矩阵核对 / 构建负向用例 / 数据核对）。

**Organization**: 按用户故事分组，每个故事可独立实现、独立验收、独立交付。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行执行（不同文件、且不依赖未完成任务）
- **[Story]**: 所属用户故事（US1 / US2 / US3）
- 每个任务均含精确文件路径

## Path Conventions

沿用 001/002 的单一 Astro 项目结构（仓库根 `/home/photon/workspace/nlp-home`）：`src/pages/`、`src/components/`、`src/data/`、`src/content.config.ts`。本特性**不新增任何目录或文件**，改动收敛于 6 个既有文件。

---

## Phase 1: Setup（共享基线）

**Purpose**: 建立构建绿灯基线与可视验收环境，避免把既有问题误判为本特性回归

- [x] T001 在仓库根执行 `npm install`（如依赖未安装）并跑 `npm run check && npm run build`，确认当前基线通过并记录结果（既有站点为起点，无项目初始化动作）
- [x] T002 [P] 建立验收环境：`npm run dev` 启动本地站点（`/team/` 与 `/`），并按 [quickstart.md](./quickstart.md) 准备九档视口清单（≥1280 / 1279 / 1024 / 768 / 767 / 576 / 575 / 375 / 320px）供各故事验收复用

---

## Phase 2: Foundational（阻塞前置）

**Purpose**: 动手改样式前锁定断点实现约定与改动白名单，保证多处媒体查询口径一致、不越界（断点数值以 spec FR-001 为唯一规范源）

**⚠️ CRITICAL**: 本阶段完成前不得开始任何用户故事的样式改动

- [x] T003 [P] 锁定断点实现约定：以 spec [FR-001](./spec.md) 为唯一数值来源，沿用既有 `.98px` 半开区间写法（`max-width: 1279.98px` / `767.98px` / `575.98px`，必要时 `min-width: 768px`）；各文件在自身 scoped CSS 内各自声明，**不新增公共 CSS 层**（YAGNI）。参考 [contracts/team-responsive-layout.md](./contracts/team-responsive-layout.md) §1 视口行为矩阵
- [x] T004 [P] 记录改动白名单基线：`git status` 记录初始工作区状态，确认本特性仅允许改动 6 个文件——`src/pages/team.astro`、`src/components/TeacherCard.astro`、`src/components/StudentGroup.astro`、`src/pages/index.astro`、`src/data/graduates.json`、`src/content.config.ts`；其余数据文件与全部 schema 字段定义为不变量（FR-015 / SC-008）

**Checkpoint**: 断点约定与改动边界确认完成——三个用户故事可并行推进

---

## Phase 3: User Story 1 - 教师卡片分栏随宽度响应（Priority: P1）🎯 MVP

**Goal**: Faculty 网格按档显式取列数（≥1280px 每行 3 张 / 768px–<1280px 每行 2 张 / 576px–<768px 每行 1 张 / <576px 每行 1 张）；卡片头部 ≥576px 保持「照片在左、姓名/职称/研究方向在右」横向排布，<576px 改为「照片水平居中在上；其下姓名与职称同行（姓名居左、职称右对齐）；研究方向标签紧随其下、占内容整宽并左对齐」；方向标签优先整标签换行、仅单标签自身超宽时标签内换行；教师 `photo` 非空但文件缺失时构建报错中断。

**Independent Test**: 在 ≥1280 / 1279 / 1024 / 768 / 767 / 576 / 575 / 375 / 320px 打开 `/team/` Faculty 区块，逐档统计每行卡片数量；在 576 / 767px 核对横向头部；在 575 / 375 / 320px 核对照片水平居中在上、姓名与职称同行（职称右对齐）、标签整宽左对齐；超长单标签不溢出。FR-016 以「临时缺失照片 → 构建报错 → 还原 → 构建恢复」验证。

### Implementation for User Story 1

- [x] T005 [P] [US1] 将 `src/pages/team.astro` 的 `.teacher-grid` 由 `repeat(auto-fill, minmax(min(420px, 100%), 1fr))` 改为**显式分档列数**：基础 `repeat(3, minmax(0, 1fr))`；`@media (max-width: 1279.98px)` 覆写为 `repeat(2, minmax(0, 1fr))`；`@media (max-width: 767.98px)` 覆写为 `repeat(1, minmax(0, 1fr))`（576–<768px 与 <576px 同为 1 列）。要求同行卡片等宽（外缘宽差 ≤1px）、除末行外无半满/多余空轨道（FR-002）
- [x] T006 [US1] 删除 `src/components/TeacherCard.astro` 中既有的 `@media (max-width: 640px) { .teacher-head { flex-direction: column } }` 覆写，使 ≥576px（含 576–640px）恢复基础横向排布（`.teacher-photo` 在左、`.teacher-identity` 在右）（FR-003）
- [x] T007 [US1] 在 `src/components/TeacherCard.astro` 新增 `@media (max-width: 575.98px)` 很窄档头部规则（depends on T006）：`.teacher-head { flex-direction: column; align-items: center }`（照片**水平居中**于卡片内容区上方）；`.teacher-identity { display: grid; grid-template-columns: 1fr auto; align-items: baseline; width: 100% }`（姓名落第 1 列居左，职称落第 2 列）；`.teacher-title { text-align: right }`（职称右对齐、与姓名同行）；`.teacher-directions { grid-column: 1 / -1; width: 100% }`（紧随姓名/职称行之下、占内容整宽、左对齐）（FR-003 / CHK008 / CHK009 / CHK038）
- [x] T008 [US1] 在 `src/components/TeacherCard.astro` 对 `.teacher-directions li` 增加 `max-width: 100%` 与 `overflow-wrap: break-word`（depends on T007）：整标签优先由既有 `flex-wrap` 换行，仅单个标签自身超宽时在该标签内换行；**MUST NOT** 引入 `white-space: nowrap`（FR-004 / 契约 §3）
- [x] T009 [P] [US1] 在 `src/content.config.ts` 为 teachers schema 的 `photo` 字段新增 `superRefine` 构建期校验：新增常量 `TEACHER_ASSET_DIR = fileURLToPath(new URL('../public/teachers/', import.meta.url))`；`photo` 为空/未定义 → 不校验（缺照片为合法状态）；非空 → MUST 以 `/teachers/` 开头、剥前缀后的文件名不含 `/` 与 `..`，且 `existsSync(TEACHER_ASSET_DIR + fileName)`；违反 → `ctx.addIssue`，message MUST 定位数据文件、教师姓名（可用 `ctx.parent` 取 `name`）与缺失路径；复用 gallery `src` 的既有校验模式，字段定义（`string optional nullable`）不变（FR-016）
- [x] T010 [US1] 验收 US1（FR-002/FR-003/FR-004/FR-005 / SC-001/SC-002）：在 `/team/` 逐档统计 Faculty 每行卡片数（≥1280→3；1279/1024/768→2；767→1 且为切换点；576→1；575/375/320→1），核对同行等宽（外缘宽差 ≤1px）与除末行无半满轨道；576/767px 核对「照片在左、信息在右」横向头部（原 ≤640px 堆叠 MUST 已消失）；575/375/320px 核对照片水平居中在上、姓名与职称同行且职称右对齐、方向标签占内容整宽左对齐；临时将某教师 `photo` 置空（验证后还原）核对缺照片时头部不错位；按 [quickstart.md](./quickstart.md) §3.2 临时给某教师加一条超长研究方向标签复验（验证后还原）——常规标签组合核对优先以整标签为单位换行（标签间断行、标签内文字不断开），超长单标签核对仅当其自身宽度超过可用行宽时在标签内文字换行收纳，任何情况下不溢出、不截断（FR-004）；任一档无溢出、截断、横向滚动
- [x] T011 [US1] FR-016 负向用例（SC-009，depends on T009）：临时将 `src/data/teachers.json` 某教师 `photo` 改为 `/teachers/missing.svg` → `npm run build` MUST 报错中断且信息能定位教师与缺失路径；还原后 `npm run build` 恢复通过；可选：临时把该 `photo` 置空 → 构建照常通过（验证后还原）

**Checkpoint**: US1 独立可用且可验收（MVP 达成）

---

## Phase 4: User Story 2 - 毕业生条目窄屏布局（Priority: P2）

**Goal**: <768px 时 Graduates 每条目为三段式——第 1 行左侧姓名、右侧自右向左为毕业年份与学位（年份贴行右缘且容器宽＝数字宽、学位与年份隔一个空格、文字右对齐）；第 2 行去向左对齐；第 3 行外链标签左对齐；毕业生姓名左边缘与上方在读学生姓名左边缘同线（两列表条目左右内边距统一收窄为 24px）；≥768px 五列混合对齐形态零回归；毕业生数据按 FR-011 由 5 条合并为 14 条。

**Independent Test**: 在 <768px（375 / 320px）打开 `/team/` 逐条核对三段式与缺失字段（无年份/无链接）渲染；再用 `getBoundingClientRect().left` 比对毕业生与在读学生姓名左边缘（差值 ≤1px）；在 ≥768px 核对五列形态无回归。

### Implementation for User Story 2

- [x] T012 [P] [US2] 依据《2026年招生介绍-G3.pptx》第 7 页「G3 组学生就业情况」表（14 行）合并 `src/data/graduates.json`（FR-011）：**更新重叠 5 条**——佀庆一 `destination` → `华为天才少年 → 京东大模型`、刘源鑫 → `北京大学 → 小米mimo`（杨泽娴/谭宇彤/温哲 值不变；`year`/`url` 一律保留现值）；**按 PPTX 行序新增 9 条**——`name` 用 PPTX 原文（如「许同学」）、`degree` 类型映射（硕士→`master` / 博士→`phd`）、`destination` 录去向列（原文「->」规范化为「 → 」，箭头前后各补一个空格）、`year` 置 `null`、`url`/`github` 键省略；目标状态见 [data-model.md](./data-model.md) §1；schema 与其余数据文件零改动（FR-011 / FR-015）
- [x] T013 [US2] 将 `src/pages/team.astro` 的 `.graduate-list li` 左右内边距 `44px` → `24px`（`padding: 10px 24px`，左右对称）（FR-007 组成部分 / CHK035）
- [x] T014 [P] [US2] 将 `src/components/StudentGroup.astro` 的 `li` 左右内边距 `44px` → `24px`（`padding: 8px 24px`，左右对称），其余样式与既有两端分布机制不变；该组件即 FR-007 的跨区块对齐基准
- [x] T015 [US2] 在 `src/pages/team.astro` 的 `@media (max-width: 767.98px)` 内将 `.graduate-list li` 由 `display: block` 改为**三段式 flex**（depends on T013，同文件）：`display: flex; flex-wrap: wrap; align-items: baseline; column-gap: 0.25em; row-gap: 0`；`.grad-degree { margin-left: auto }`（推向行右端、文字右对齐）；`.grad-year` 紧随学位之后（flex item 默认 shrink-to-fit → 容器宽＝数字宽、右对齐贴行右缘）；`.grad-dest { flex: 0 0 100% }`（第 2 行、左对齐）。**链接行（第 3 行）左对齐的落法（2026-10-15 裁定）**：沿用既有高特异度选择器 `.graduate-list li > .grad-links`，**原地改写**该规则内的 `justify-content: flex-end` → `flex-start`，并在同一规则内补 `flex: 0 0 100%`；**MUST NOT** 另加一条特异度更低的 `.grad-links` 规则（0,1,0 < 既有 0,2,1，不会生效）——单一规则来源、不依赖声明顺序，避免后续维护出现两条相反声明。同时移除该媒体查询内既有的 `.graduate-list li > span { display: block }`（会把所有子元素强制为块级、破坏三段式 flex）。（FR-006 / CHK010；markup 保持不变）
- [x] T016 [US2] 验收 US2（FR-006/FR-008 / SC-004）：确认 `.graduate-list li > .is-empty { display: none }` 保留且选择器仍有效；在 375 / 320px 逐条核对 14 条——第 1 行左侧姓名、右侧「学位 ←一个空格→ 年份」，年份贴行右缘、`.grad-year` 盒宽 ≈ 数字宽、学位文字右对齐；第 2 行去向左对齐；第 3 行链接左对齐；9 条匿名新条目与谭宇彤/温哲（无年份、无链接）仅学位贴行右缘、不渲染第三行、无占位文本/符号/空行残留；长去向（华为天才少年 → 京东大模型 / 北京大学 → 小米mimo）在去向行内换行且不破坏三行左起点
- [x] T017 [US2] 验收 FR-007 / FR-009（SC-004 / SC-005）：在 576 / 375 / 320px 执行 `document.querySelector('.grad-name').getBoundingClientRect().left` 与在读学生姓名对应值比对，差值 ≤1px（目测同一竖直线）；在 768 / 1024 / ≥1280px 核对 Graduates 仍为五列混合对齐（姓名/学位/年份左对齐、去向居中、链接标签右对齐），行内距收窄为 24px 属预期变更；毕业生展示顺序按既有排序算法输出（年份降序 → 无年份最后 → 同组 PhD 在 Master 前 → 数组序 tiebreak），核对以该算法对 14 条数据（含保留的 `year=null` 条目 谭宇彤、温哲）的实际输出为准

**Checkpoint**: US1 与 US2 均可独立工作与验收

---

## Phase 5: User Story 3 - 跨档位无破损与共享组件一致（Priority: P3）

**Goal**: 各验收档位下 Team 页全部区块与主页教师区块均无布局破损、无横向滚动、无内容裁切；主页 `.teacher-grid` 与共享 `TeacherCard` 行为同 US1，两页分栏一致。

**Independent Test**: 在九档位（含 1279 / 767 / 575px 边界切换点与 320px）浏览 `/team/` 与 `/`，核对无重叠、无截断、无溢出容器、无非预期换行、无横向滚动条，且主页卡片呈现 US1 的头部排布。

### Implementation for User Story 3

- [x] T018 [P] [US3] 将 `src/pages/index.astro` 的 `.teacher-grid` 由 `repeat(auto-fill, minmax(320px, 1fr))` 改为与 US1 同一组显式分档（基础 `repeat(3, minmax(0, 1fr))`；`@media (max-width: 1279.98px)` → 2 列；`@media (max-width: 767.98px)` → 1 列），修复主页在 1040–1279px 区间的越档 3 列并使两页分栏一致（FR-012 / US3 AS2）；主页卡片头部行为随共享 `TeacherCard.astro` 改动自动一致（内容可与 Team 页不同）
- [x] T019 [US3] 验收 US3（FR-010 / FR-012 / SC-003 / SC-006）：在 ≥1280 / 1279 / 1024 / 768 / 767 / 576 / 575 / 375 / 320px 浏览 `/team/` 全部区块（Faculty、PhD/Master、Graduates）与 `/` 教师区块，核对无元素重叠、文字截断、内容溢出容器、非预期换行、内容横向超出视口；页面底部无水平滚动条；主页卡片呈现 §2 头部排布、主页无新增破损

**Checkpoint**: 三个用户故事全部独立可用

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 收口数据范围、机器门禁与全量验收记录

- [x] T020 [P] 核对数据改动范围（FR-015 / SC-008）：`git diff --stat` 确认数据/schema 文件中**仅** `src/data/graduates.json` 与 `src/content.config.ts`（teachers photo 校验）有改动；`teachers.json` / `students.json` / `publications.json` / `gallery.json` / `site.json` 与 schema 字段定义 diff 为空
- [x] T021 [P] 数据内容终检（FR-011 / SC-008）：对照《2026年招生介绍-G3.pptx》就业情况表（14 行）与 [data-model.md](./data-model.md) §1 目标状态逐条核对 `src/data/graduates.json`（条数 14、`name` PPTX 原文、`degree` 类型映射、`destination` 取值与「 → 」规范化、`year=null`、无 `url`/`github`）
- [x] T022 机器门禁（FR-014 / SC-007）：`npm run check && npm run build && npm run preview` 全部通过（含 FR-016 校验、14 条毕业生落入既有 schema），复核构建产物 `/team/` 与 `/` 渲染正常；另确认 FR-013 落实——`package.json` 与 lockfile 零改动、无新增运行时依赖/新 JS/新动效
- [x] T023 [P] 按 [quickstart.md](./quickstart.md) 复跑完整九档视口矩阵（两页 × 全部验收项）并记录 SC-001–SC-009 结果，确认无遗漏验收项

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup（Phase 1）**: 无依赖，可立即开始
- **Foundational（Phase 2）**: 依赖 Setup 完成；**阻塞**全部用户故事
- **User Stories（Phase 3–5）**: 均依赖 Foundational 完成；三故事互不阻塞，可并行或按 P1 → P2 → P3 顺序推进
- **Polish（Phase 6）**: 依赖全部目标用户故事完成

### User Story Dependencies

- **US1（P1）**: Foundational 后可独立开始；无跨故事依赖（MVP）
- **US2（P2）**: Foundational 后可独立开始；仅与 US1 共享同一文件 `team.astro`（不同样式规则，无逻辑依赖）；FR-011 数据合并独立于任何布局改动
- **US3（P3）**: Foundational 后可独立开始；其验收覆盖 US1/US2 成果（`index.astro` 网格改动本身不依赖 US1 完成）

### Within Each User Story

- 样式/数据实现 → 正向后验收 → 负向/回归验收
- 同文件的样式任务串行（`TeacherCard.astro`: T006 → T007 → T008；`team.astro`: T005 / T013 → T015）
- 每个任务即一个小步提交（Constitution V）

### Parallel Opportunities

- Phase 1：T002 与 T001 可并行
- Phase 2：T003、T004 可并行
- US1：T005（`team.astro`）与 T009（`content.config.ts`）可并行；T011 可与 T010 并行
- US2：T012（`graduates.json`）与 T014（`StudentGroup.astro`）可并行；两者与 US1 的 T005/T009 也互不冲突
- US3：T018（`index.astro`）可与 US1/US2 任意文件级任务并行
- Polish：T020、T021、T023 可并行

---

## Parallel Example: User Story 1

```bash
# 不同文件、互不依赖，可同时开工：
Task: "T005 [US1] team.astro .teacher-grid 显式分档列数（3/2/1）"
Task: "T009 [US1] content.config.ts teachers photo superRefine 构建期校验"
```

## Parallel Example: User Story 2

```bash
# 数据与另一组件文件互不依赖，可同时开工：
Task: "T012 [US2] graduates.json 按 PPTX 就业情况表合并为 14 条"
Task: "T014 [US2] StudentGroup.astro li 内距 44px → 24px"
```

---

## Implementation Strategy

### MVP First（仅 User Story 1）

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational（阻塞项）
3. 完成 Phase 3: User Story 1（教师分栏 + 头部按档排布 + 标签收纳 + photo 构建期校验）
4. **STOP and VALIDATE**：按 T010 / T011 独立验收 US1
5. 可先行演示/合入（P1 为最首要诉求：宽屏每行 3 张、移动端头部不割裂）

### Incremental Delivery

1. Setup + Foundational → 基线就绪
2. + US1 → 独立验收 → 交付（MVP）
3. + US2（含 FR-011 数据合并）→ 独立验收 → 交付
4. + US3 → 跨档回归与主页一致性验收 → 交付
5. Polish → 数据范围核对 + 机器门禁 + 全量矩阵记录

### Parallel Team Strategy

1. 全员完成 Setup + Foundational
2. 并行分工：A → US1（`team.astro` 网格 + `TeacherCard.astro` + `content.config.ts`）；B → US2（`graduates.json` + `StudentGroup.astro`），完成后接 `team.astro` 的 T013/T015；C → US3（`index.astro`）与跨档回归
3. 各故事独立验收后统一跑 Phase 6

---

## Notes

- **[P]** = 不同文件且无未完成依赖，可并行
- **[Story]** 标签用于追溯任务 → 用户故事 → 验收判据
- 本特性**零新增文件、零新增依赖、零新增 JS**；改动仅限 6 个既有文件（Constitution IV/V）
- 断点数值以 spec FR-001 为唯一规范源；亚像素边界（如 1279.98px）交由 CSS 媒体查询固有行为处理
- 每个任务完成后建议单独提交（小步提交，便于审查与回滚）
- 任一处出现横向滚动/溢出请回到对应故事的实现任务修正，不得依赖 `body { overflow-x: hidden }` 掩盖问题
- 约定：不新增公共 CSS 层与工具类（YAGNI）

### 验收记录（2026-10-15，T010–T023 全量执行）

- **方法**：以 `getComputedStyle` / `getBoundingClientRect` 在 **生产构建**（`npm run preview`）下对 9 档精确宽度（1280 / 1279 / 1024 / 768 / 767 / 576 / 575 / 375 / 320px）× 2 页（`/team/`、`/`）做机器测量（同源 iframe 定宽渲染，避免 dev 工具栏干扰）；临时测量工装用完即删，未进入交付。
- **US1**：Faculty 每行卡片数各档为 3 / 2 / 2 / 2 / 1 / 1 / 1 / 1 / 1（与 FR-002 矩阵逐档一致，767px 为切换点），同行卡片宽度差 `0.0px`、除末行无半满轨道；`>=576px` 头部 `flex-direction: row`（照片左、信息右），`<576px` 为 `column` + 照片水平居中（照片中心−卡片中心 = `0.0px`）+ 身份区 `grid (1fr auto)` + 职称 `text-align: right`；方向标签 `max-width: 100%` / `overflow-wrap: break-word` 全档生效、无标签溢出（超长单标签以临时加长数据复验）。
- **US2**：`<768px` 条目为 `display: flex`、可视子元素分 3 组行（姓名+学位+年份 / 去向 / 链接），年份盒宽 38.8px ≈ 数字宽（`scrollWidth` 39）且右侧间隙 `0.0px`、去向 `text-align: start`、链接 `justify-content: flex-start`；`.is-empty` 全档 `display: none`（无年份/无链接者不渲染空行）；毕业生姓名左边缘与在读学生姓名左边缘差值 **0.0px**（576 / 375 / 320px 实测）。
- **US3**：主页每行卡片数 3 / 2 / 2 / 2 / 1 / 1 / 1 / 1 / 1（修复 1040–1279px 越档 3 列），两页分栏一致；两页各档 `pageOverflowX = 0`，超出视口元素清单为空。
- **T019 验收发现并修复**：320px 档 `/team/` 曾横向溢出 16px（`documentElement.scrollWidth − clientWidth = 16`），溢出元素定位为 `.student-group` / `h3` / `ul` / `li`（宽 320、左 16）；根因 `StudentGroup.astro` 的 `.student-groups` 为 `minmax(320px, 1fr)`，而 320px 档内容区仅 288px（`sectionWidth = 288`、轨道 `scrollWidth = 320`）。按任务 Notes 要求**不以 `overflow-x: hidden` 掩盖**，改用 `min(320px, 100%)`（沿用 team.astro 既有写法）；复测 `pageOverflowX = 0`、`studentGroupsWidth = scrollWidth = 288`，其余 375 / 576 / 768px 与主页全档无回归。属 002 遗留缺陷，非本特性引入。
- **T011 / FR-016 负向用例**：`photo` 改 `/teachers/missing.svg` → `npm run build` **EXIT=1** 且报错定位数据文件 + 教师姓名 + 缺失路径；还原后构建恢复通过；另验 `photo: null` → 构建照常通过、卡片不渲染 `<img>`（条件渲染生效）且无 `/teachers/null` 破图 src。
- **T020 / T021 / T022**：数据改动面仅 `graduates.json` 与 `content.config.ts`（`teachers.json` / `students.json` / `publications.json` / `gallery.json` / `site.json` diff 为空）；14 条毕业生逐条与 data-model §1 一致（`name` PPTX 原文、`degree` 映射、去向「 → 」规范化、新增 9 条 `year = null` 且无 `url`/`github`）；`npm run check`（0 errors / 0 warnings / 0 hints）+ `npm run build`（18 页）+ `npm run preview` 全通过，`package.json` 与 lockfile 零改动。
- **收尾**：验收用临时页面已删除；`npm run dev` / `npm run preview` 均已停止；最终工作区改动恰为 6 个白名单文件（`git status` 另含未跟踪的 `specs/003-team-responsive-layout/`）。

---

## Phase 7: Convergence

- [x] T024 保留并记录 `src/components/StudentGroup.astro` 的 `.student-groups` 轨道宽度改写（`minmax(320px, 1fr)` → `minmax(min(320px, 100%), 1fr)`）：该改动系满足 FR-010（320px 档无横向滚动）所必需，属 plan/contract「仅改 li 内边距、其余零改动」表述之外的合理超出；请确认保留该改动并在提交说明中标注其依据（如判定不再需要则回退该项并复验 320px 无横向滚动） per plan: StudentGroup 改动白名单 / FR-010 (unrequested)

### T024 收敛裁定记录（2026-10-16）

- **裁定：保留改写，不回退。** 依据：FR-010（320px 档无横向滚动 / SC-003）要求下，原 `minmax(320px, 1fr)` 在 320px 档（内容区仅 288px）迫使轨道 320px、整组溢出 16px（T019 验收实测，002 遗留缺陷）；contract §不变量「StudentGroup 仅改 li 内边距、其余零改动」系验收前表述，保留修复属合理超出，回退将重新引入横向滚动。
- **代码注释已就位**：`StudentGroup.astro` `.student-groups` 规则处已注明 FR-010 / SC-003 依据、溢出定位过程与「视口 ≥352px（容器 ≥320px）行为与原来完全一致、2 列阈值不变」的无回归论证。
- **复验（生产构建 `npm run preview`，同源 iframe 定宽测量，临时工装用完即删）**：`npm run check`（0 errors / 0 warnings / 0 hints）+ `npm run build`（18 页）通过；`/team/` 于 320 / 375 / 576 / 768 / 1024 / 1280px 与 `/` 于 320px 的 `pageOverflowX` 全部为 0；320px 档 `.student-groups` rectW == scrollW（贴容器宽，无强制 320px 轨道）——与 T019 验收记录一致，无回归。
- **提交说明要求**：`StudentGroup.astro` 对应提交 MUST 在说明中标注该改动的依据（FR-010 / T019 验收发现 / 002 遗留缺陷修复），不可归入「仅内距收窄」一类描述。
