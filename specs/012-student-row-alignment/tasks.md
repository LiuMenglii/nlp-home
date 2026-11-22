---

description: "Task list for 012-student-row-alignment"
---

# Tasks: Team 页在读学生名单的列布局调整（三列固定、两侧空白相等、Since 列内居中、链接右对齐）

**Input**: Design documents from `/specs/012-student-row-alignment/`

**Prerequisites**: [plan.md](./plan.md)、[spec.md](./spec.md)、[research.md](./research.md)、[data-model.md](./data-model.md)、[contracts/student-row-alignment.md](./contracts/student-row-alignment.md)、[quickstart.md](./quickstart.md)

**Tests**: 本特性未要求 TDD 或自动化测试；plan 明确不引入 e2e / 视觉回归框架（Constitution V）。验收由真实浏览器逐档测量任务与 `npm run check` + `npm run build` 门禁承担，不新增测试文件。

**Organization**: 按用户故事分组；US1 与 US2 均为 P1（横向三列、竖排右对齐），US3 为 P2（名册规模与结构稳定）。每个故事阶段可独立完成与验证。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可与同阶段其他 [P] 任务并行（不同文件 / 不同工具，无未完成依赖）
- **[Story]**: 对应 spec.md 的用户故事（US1 / US2 / US3）
- 每条任务均含精确文件路径或验收证据文件路径

## Path Conventions

- 唯一源码改动：`src/components/StudentGroup.astro` 的 scoped `<style>`
- 验收证据：`specs/012-student-row-alignment/evidence/layout-verification.md`
- 数据、页面、公共样式与 CI 均零改动

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 建立验收产物目录与改动前基线，供后续范围核对

- [X] T001 创建验收证据目录 `specs/012-student-row-alignment/evidence/`，用于存放实现期产物 `layout-verification.md`（plan.md 已声明其路径）
- [X] T002 在仓库根目录运行 `npm run check && npm run build` 并保存输出，同时记录 `git status --porcelain` 与 `git diff --stat` 作为范围核对基线（预期改动前仅 `specs/012-student-row-alignment/` 为新增），结果追加到 `specs/012-student-row-alignment/evidence/layout-verification.md`（依赖 T001 创建证据目录）

**Checkpoint**: 证据路径与基线就绪

---

## Phase 2: Foundational (Environment & Reference Measurement)

**Purpose**: 记录验收字体环境与 Since 文字宽度参考值；本阶段不作为列宽实现的阻塞门槛。T004 先按 5em 实现，T007 在实现后用文字范围判定是否整组改为 5.5em。

**说明**: 改样式前 `.grade` 是占满 5.5em 轨道的元素，元素盒宽恒为 99px，不能代表文字宽度；因此 T003 只用 `document.createRange()` 量文字范围，不以该数值直接决定列宽。

- [X] T003 启动 `npm run dev`，用验收浏览器（页面缩放 100%、站点默认字体）打开 `http://localhost:4321/nlp-home/team/`，在 1440px 视口用 `document.createRange()` 量全部 30 个 `.grade` 的 `Since <年份>` 文字宽度（MUST NOT 用 `getBoundingClientRect().width` 量元素盒），记录字体环境、最大文字宽度与对应文案；结果写入 `specs/012-student-row-alignment/evidence/layout-verification.md`，作为 T007 的对照数据（FR-011 / SC-008）。本任务不决定 5em / 5.5em，不阻塞 T004

**Checkpoint**: 字体环境与参考字宽已记录，可开始 US1（T004 固定先按 5em 实现）

---

## Phase 3: User Story 1 - 横向行三列固定、Since 列内居中、链接居右 (Priority: P1) 🎯 MVP

**Goal**: ≥480px 每行为姓名列 3.5em（63px）、Since 列 5em（90px）或 5.5em（99px）、链接列 6.5em（117px）的三轨固定网格；两侧列间空白相等（`g ≥ 8px`）、Since 在列内居中（行内容区中点左 27px、±1px）、链接文字右缘贴齐行右缘且标签宽度 ≤117px；空列保留宽度且不渲染占位。

**Independent Test**: 在 1440px 与 768px 测量同栏 Since 中心极差、Since 中心相对行内容区中点的 −27px 偏移、`gapL == gapR`、链接文字右缘差与标签宽度；无需竖排态完成即可确认横向三列成立。

### Implementation for User Story 1

- [X] T004 [US1] 在 `src/components/StudentGroup.astro` 的 scoped `<style>` 中把 ≥480px 的行改为三轨固定网格（PhD 与 Master's 选择器并列、共用同一组声明）：`display: grid`、`grid-template-columns: 3.5em 5em 6.5em`（先按 5em 实现；T007 判定需 5.5em 时整组改为 `3.5em 5.5em 6.5em`，两个分组同值，MUST NOT 混用）、`column-gap: 0`、`justify-content: space-between`；保留既有 `padding: 8px 24px` 与 `align-items: baseline`。MUST NOT 使用 `1fr` / `max-content` 侧轨、硬编码像素列宽或按视口写 `translateX`
- [X] T005 [US1] 在 `src/components/StudentGroup.astro` 为三列显式定位并对齐：`.student-name` → `grid-column: 1`（列内居左，保留既有 `overflow-wrap: break-word`）；`.grade` → `grid-column: 2`、`justify-self: center`、`margin-left: 0`（覆盖基线 `margin-left: auto`，否则自动外边距吞掉列内余量并破坏居中）、`white-space: nowrap`，字号保持 18px；`.member-link` → `grid-column: 3`、`justify-self: end`、`text-align: right`、`white-space: nowrap`。缺链接时第 3 列仍占 6.5em（117px）、缺年级时第 2 列仍占 90 / 99px，但 MUST NOT 渲染占位、破折号或隐藏文本（FR-001～FR-003 / FR-007）
- [X] T006 [US1] 删除 `src/components/StudentGroup.astro` 中被取代的旧行内规则：≥768px 块内的 `grid-template-columns: minmax(4em, 1fr) 5.5em auto`、`column-gap: 8px` 及三槽 `grid-column` 定位，和 480–767px 的 flex 行内规则（`flex: 1 1 4em`、`flex: 0 0 5.5em`、`margin-left: auto` 等）；把 ≥480px 的三列声明收敛为单一 `@media (min-width: 480px)` 块。保留两栏断点（≥768px）、32px 栏距、`.is-single` 单栏规则、`ul + ul` 顶线规则、`overflow-wrap` 规则与 <480px 竖排块不变；MUST NOT 保留任何碰撞夹取或基于字体度量的左移逻辑（FR-004）
- [X] T007 [US1] 实现后在 1440px 验收浏览器用 `document.createRange()` 量 30 个 `.grade` 的文字宽度（MUST NOT 用元素盒宽）：5em 下最大文字宽度 >90px 时，把 PhD 与 Master's 的 Since 列同时改为 5.5em（99px）并复测；仍 >99px 或出现折行按缺陷停止验收。MUST NOT 通过缩小字号、折行、截断或隐藏内容规避（FR-011 / SC-008）；判定结果追加到 `specs/012-student-row-alignment/evidence/layout-verification.md`
- [X] T008 [US1] 按 [quickstart.md §3–§4](./quickstart.md) 在 1920 / 1440 / 1280 / 1024 / 768 / 767 / 576 / 481 / 480px 逐档测量 30 行：`getComputedStyle(li).gridTemplateColumns` 恒为 `63px 90px 117px`（或 `63px 99px 117px`）且同组一致；两侧空白差 ≤1px 且最小 `g ≥ 8px`（768px 最紧档为 13px 或 8.5px，无重叠）；`Since 中心 − 行内容区中点 = −27px（±1px）`且同栏极差 ≤1px；链接文字右缘差 ≤1px、标签单行（高度 ≈29.7px）且宽度 ≤117px（±1px）、链接左缘不越过第 3 列左边界；姓名左缘差 ≤1px。结果追加到 `specs/012-student-row-alignment/evidence/layout-verification.md`（SC-001 / SC-002）

**Checkpoint**: 横向三列固定、等隙、Since 列内居中、链接贴右均独立可用；US1 可作为 MVP 交付

---

## Phase 4: User Story 2 - 竖排条目中链接右对齐 (Priority: P1)

**Goal**: <480px 时第 1 行为姓名（居左）与 Since（右对齐），有链接时第 2 行由链接独占整行且文字右对齐；无链接不渲染第 2 行。

**Independent Test**: 在 375px 与 320px 检查 PhD 的 4 条有链接记录：链接文字位于第 2 行且文字右缘与行内容右缘偏差 ≤1px（以文字范围为准）；其余 26 条无链接记录只有 1 行。

### Implementation for User Story 2

- [X] T009 [US2] 在 `src/components/StudentGroup.astro` 的 `@media (max-width: 479.98px)` 块中，把 `.phd-columns .member-link, .master-columns .member-link` 的 `text-align: left` 改为 `right`；保留 `order: 9`、`flex: 0 0 100%`、`margin-left: 0`；第 1 行姓名居左、Since `margin-left: auto` 右对齐不变；无链接时 MUST NOT 渲染第 2 行或占位；同时同步基线 `@media (max-width: 479.98px)` 中 `.member-link` 的 `text-align: left`（改为 `right` 或删除该重复声明），避免两处规则语义冲突（FR-005）
- [X] T010 [US2] 在 375px 与 320px 验收浏览器按 [quickstart.md §5](./quickstart.md) 检查：4 条有链接记录的链接文字独占第 2 行且文字右缘与行内容右缘偏差 ≤1px，与同条 Since 右缘偏差 ≤1px（用 `document.createRange()` 量文字范围；链接元素占满整行，其盒右缘恒等于行右缘，MUST NOT 作为判据）；其余 26 条仅 1 行；30 行的 Since 右缘与行内容右缘偏差均 ≤1px；320px 无重叠、截断、溢出或页面横向滚动。结果追加到 `specs/012-student-row-alignment/evidence/layout-verification.md`（SC-003）

**Checkpoint**: US1 与 US2 均可独立验证通过

---

## Phase 5: User Story 3 - 名册规模与既有结构在各视口保持稳定 (Priority: P2)

**Goal**: 十一档视口下 30 位在读学生（PhD 19 / Master's 11）各出现一次，Since 文案、链接数量、两栏结构、排序、字号与改动范围均不变，无布局破损。

**Independent Test**: 在十一档视口统计学生条数、Since 文案、链接数量与分组结构，逐档检查横向溢出与元素越界，并核对 `git diff` 范围与构建门禁。

### Verification for User Story 3

- [X] T011 [P] [US3] 按 [quickstart.md §2](./quickstart.md) 核对：在读学生 30 条（PhD 19 / Master's 11）、30 个 `.grade`、4 个 `.member-link`、0 个 `th`、0 个 `.student-name a`；无 `N/A`、`—`、`&nbsp;` 等占位；名单仍为年级升序；≥768px 两栏条数 PhD 10 + 9、Master's 6 + 5；在 767px 与 768px 读取 `.phd-columns` / `.master-columns` 的 `getComputedStyle(...).gridTemplateColumns` 与 `columnGap`：767px 为 1 轨，768px 为 2 轨且 `column-gap` 为 32px；分组标题各 1 个；无新增列间竖线/装饰（`li` 无新增左右 `border`、无新增装饰节点）；渲染姓名、`Since <年份>` 与链接标签与 `students.json` 逐项一致（若构建产物无法读取数据文件，则以 T012 的数据文件零 diff + T015 的 DOM 零改动作为等效证明）；并按 quickstart §7.2 做一次缺年级 DOM 注入（临时移除 `.grade`，不改数据）：第 2 列保宽、链接仍在第 3 列、无占位。结果追加到 `specs/012-student-row-alignment/evidence/layout-verification.md`（SC-005 / FR-006 / FR-007）
- [X] T012 [P] [US3] 运行 `npm run check && npm run build` 并保存输出；运行 `git status --porcelain` 与 `git diff --stat` 核对范围：仅 `src/components/StudentGroup.astro` 有 diff，`src/data/students.json`、`src/data/graduates.json`、`src/content.config.ts`、`src/pages/team.astro`、`src/styles/global.css`、`src/components/TeacherCard.astro`、`tests/news-widgets.test.mjs`、`package.json`、`package-lock.json` 零 diff（SC-006 / FR-009）
- [X] T013 [US3] 按 [quickstart.md §6](./quickstart.md) 在十一档视口做破损扫描：以 `document.documentElement.scrollWidth > window.innerWidth` 判定页面横向溢出（MUST NOT 用差值等于 0 判定，避免竖向滚动条造成误报），并记录 `scrollWidth` / `innerWidth` / `clientWidth`；逐元素 `getBoundingClientRect()` 无越界（`left < −0.5` 或 `right > innerWidth + 0.5` 的元素数为 0）；无元素重叠、文字截断、内容溢出、非预期换行（「非预期换行」不含姓名列内已声明的超长姓名换行）；`.grade` / 姓名 / 链接计算字号 18px、分组标题 20px；768px 最紧档聚焦链接时 `focus-visible` 外框不引起页面横向滚动。结果追加到 `specs/012-student-row-alignment/evidence/layout-verification.md`（SC-004 / SC-007）

**Checkpoint**: 全部用户故事完成，规模、结构与改动范围稳定

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 汇总证据并做最终合规复核

- [X] T014 汇总 `specs/012-student-row-alignment/evidence/layout-verification.md`，按 [quickstart.md §9](./quickstart.md) 包含：字体环境与 5em / 5.5em 判定（含文字范围测量方法）、链接文字右缘与标签宽度、九档横向测量、375 / 320px 竖排测量、767 / 768px 两栏结构与 32px 栏距、十一档破损计数（按 `scrollWidth > innerWidth` 判定）、计数与回归结果、`npm run check` + `npm run build` 输出、`git status --porcelain` 与 `git diff --stat` 范围核对、缺年级 DOM 注入与装饰检查结果、数据逐项比对结果、名单为空 / n=1 的声明不测理由（引用 spec Edge Cases）、T016/T017 的提交、推送与验收结果
- [X] T015 对照 [spec.md](./spec.md) 的 Assumptions 与 Constitution VI 做最终自查：无页面级 `overflow-x: hidden` / `clip`；未用缩小字号、隐藏链接或截断姓名换对齐；无新增依赖、运行时 JS、组件或公共 CSS 层；无 011 碰撞夹取残留；`git diff src/components/StudentGroup.astro` 仅样式段变化，模板 frontmatter、DOM 与类名零改动

---

## Phase 7: Delivery (Commit, Push & Acceptance)

**Purpose**: 把提交、推送与验收作为独立任务执行，并落实作者身份约束

- [ ] T016 [US3] **提交并推送**：确认 `git status` 仅包含本特性文件；使用仓库配置的项目维护者本人身份（`user.name` / `user.email`）执行 `git add` 与 `git commit`，MUST NOT 添加 Claude / AI 共同作者尾注；运行 `git push` 推送到远程分支，记录 commit hash、远程分支与 `git log -1 --format='%an <%ae>%n%cn <%ce>%n%B'` 输出。结果追加到 `specs/012-student-row-alignment/evidence/layout-verification.md`（SC-006）
- [ ] T017 [US3] **验收**：按宪法「维护工作流」确认 CI 通过、合并前 `npm run check` + `npm run build` 与十一档布局验收全部通过；合并后等待 GitHub Pages 部署完成并检查线上 Team 页；核对 T016 的提交作者与提交者均仅为项目维护者本人、提交信息无 Claude / AI 署名。结果追加到 `specs/012-student-row-alignment/evidence/layout-verification.md`（SC-006 / 宪法维护工作流）

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 可立即开始；T002 依赖 T001（证据目录）
- **Foundational (Phase 2)**: T003 依赖 T001 与 T002（同一证据文件顺序追加，不并行）；T003 不阻塞 T004
- **User Story 1 (Phase 3)**: T004 先按 5em 实现；T005 依赖 T004；T006 依赖 T005；T007、T008 依赖 T006（T007 负责最终列宽判定）
- **User Story 2 (Phase 4)**: T009 依赖 T006（同一文件、避免与 US1 样式重写冲突）；T010 依赖 T009 与 T007
- **User Story 3 (Phase 5)**: 依赖 US1 + US2 完成；T011 与 T012 可并行，T013 依赖 T011
- **Polish (Phase 6)**: T014 依赖 T008、T010、T011、T012、T013；T015 依赖 T012
- **Delivery (Phase 7)**: T016 依赖 T014、T015；T017 依赖 T016

### User Story Dependencies

- **US1 (P1)**: 基础完成后即可实现，无其他故事依赖，可独立交付 MVP
- **US2 (P1)**: 规则位于独立的 <480px 媒体查询块，逻辑上独立；因与 US1 同为 `StudentGroup.astro`，按文件顺序在 US1 之后执行
- **US3 (P2)**: 纯验证故事，依赖 US1 / US2 的实现结果

### Within Each User Story

- US1：网格结构 → 三列定位与对齐 → 删除旧规则 → Since 列宽判定 → 九档几何测量
- US2：修改竖排链接对齐 → 375 / 320px 测量
- US3：计数核对 → 门禁与范围 → 十一档破损扫描

### Parallel Opportunities

- T002 与 T003 都写入同一证据文件，MUST 顺序执行（T002 → T003），不并行
- T011（浏览器计数）与 T012（命令行门禁与 diff 核对）可并行
- 其余任务因唯一源文件 `src/components/StudentGroup.astro` 与顺序验收依赖，按编号顺序执行

---

## Sequential Example: Setup + Foundational

```bash
# T002 完成后顺序执行 T003（两者都追加同一证据文件，不并行）：
Task: "T002 记录改动前 npm run check && npm run build 与 git status 基线"
Task: "T003 用 document.createRange() 记录 30 个 .grade 的文字宽度参考值"
```

```bash
# US3 阶段可同时启动：
Task: "T011 统计 30 条记录 / 30 个 Since / 4 个链接与两栏条数"
Task: "T012 npm run check && npm run build 并核对 git diff 范围"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. 完成 Phase 1：T001–T002
2. 完成 Phase 2：T003（记录字体环境与参考字宽）
3. 完成 Phase 3：T004–T008（T004 先按 5em 实现，T007 决定是否改 5.5em）
4. **STOP and VALIDATE**：在 1440px 与 768px 独立验证横向三列、等隙、−27px 偏移与链接右缘
5. 可先交付横向行对齐成果

### Incremental Delivery

1. Setup + Foundational → 列宽与证据目录就绪
2. US1 → 九档横向测量通过 → 可交付（MVP）
3. US2 → 375 / 320px 竖排右对齐通过 → 可交付
4. US3 → 计数、范围、破损与门禁全部通过 → 可交付
5. Polish → 证据汇总与合规自查完成
6. Delivery → 提交与推送（T016）→ 验收（T017）完成

### Notes

- [P] 任务 = 不同文件或不同工具、无未完成依赖；同一 `StudentGroup.astro` 的编辑 MUST 顺序执行
- 量 Since 文字宽度与链接文字右缘 MUST 用 `document.createRange()` 取文字范围；MUST NOT 用占满轨道或占满整行的元素盒宽代替
- 不新增测试文件；验收判据以 [契约 §7](./contracts/student-row-alignment.md) 的测量口径为准
- 证据文件 `specs/012-student-row-alignment/evidence/layout-verification.md` 随实现逐步追加，最终在 T014 汇总
- 任一测量未达容差（±1px、`g ≥ 8px`、单行）即按缺陷处理，MUST NOT 用 `overflow-x: hidden`、缩小字号或隐藏内容掩盖
