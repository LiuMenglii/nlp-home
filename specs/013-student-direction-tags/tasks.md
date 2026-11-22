# Tasks: Team 页在读学生的研究方向标签（替换年级字段）

**Input**: Design documents from `/specs/013-student-direction-tags/`

**Prerequisites**: plan.md（必需）、spec.md（必需）、research.md、data-model.md、contracts/、quickstart.md

**Tests**: 本特性不新增测试文件或测试框架（spec 未要求 TDD；Constitution V）。验证通过 `npm run check` + `npm run build`、6 + 1 个数据违约构建用例（T011 + T016）、真实浏览器九档视口测量与链接审计执行；其他页面以零 diff 验收，不做截图对比。

**Organization**: 任务按用户故事分组，每个故事可独立实现与验证。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行（不同文件、无未完成依赖）
- **[Story]**: 所属用户故事（US1 / US2 / US3 / US4）
- 每个任务均包含准确的文件路径

## Path Conventions

- 单一 Astro 项目：源文件位于 `src/`，规格位于 `specs/013-student-direction-tags/`
- 本特性只改 4 个源文件：`src/data/students.json`、`src/content.config.ts`、`src/components/StudentGroup.astro`、`src/data/README.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 建立改动范围与数据基线，确认清理范围

- [X] T001 运行 `git status --porcelain` 与 `git diff src/data/students.json`，记录并保留工作区已有的未提交数据改动（不得覆盖或回退）；保存改动前 `git diff --name-only` 作为范围基线；再运行 `npm run check` 与 `npm run build` 确认起点通过，记录基线 31 条（PhD 20 / Master's 11）与当前链接计数
- [X] T002 [P] 检索并记录 `grade` 的全部出现位置：`src/data/students.json`、`src/content.config.ts`、`src/components/StudentGroup.astro`、`src/data/README.md`，作为 Phase 2～4 的清理清单

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 替换数据字段并建立构建期校验；所有用户故事都依赖此阶段

**⚠️ CRITICAL**: 本阶段完成前不得开始任何用户故事

- [X] T003 [P] 在 `src/data/students.json` 把全部 31 条记录的 `grade` 替换为 `"directions": ["TBD"]`，保留 `name` / `level` / `url` / `github` / `scholar`；不 trim、不去重；完成后确认 31 条（PhD 20 / Master's 11）均无 `grade`、均有且仅有 1 项 `TBD`
- [X] T004 在 `src/content.config.ts` 的 `students` collection schema 中删除 `grade` 字段，新增 `directions: z.array(z.string().min(1).refine((v) => v.trim().length > 0)).min(1)`
- [X] T005 在 `src/content.config.ts` 新增模块级 `validateStudentsData()`（沿用 `validateSiteBrand` / `validateFeaturedNews` 模式）并在模块加载期调用：按 `import.meta.url` 定位 `src/data/students.json` 原始数组，对顶层非数组、`directions` 缺失 / 非数组 / 空数组 / 含非字符串或空或纯空白项，抛出可定位错误——顶层非数组错误含文件路径与顶层类型；学生级错误含文件路径、学生姓名、`directions` 字段与项序号；不新增 `grade` 残留检测

**Checkpoint**: `directions` 契约、构建期错误信息与 31 条数据就绪——四个用户故事可以开始

---

## Phase 3: User Story 1 - 访客看到研究方向标签而非年级 (Priority: P1) 🎯 MVP

**Goal**: Team 页两个在读学生分组每行显示「姓名 → 方向标签组 → 成员链接」，不再显示 "Since" 或入学年份，名单按数据文件顺序展示

**Independent Test**: 打开 Team 页（或 `dist/team/index.html`），确认 31 行均显示至少 1 个 `TBD` 标签、两个在读分组内无 "Since" 与四位入学年份；检索 `src/components/StudentGroup.astro`、`src/content.config.ts`、`src/data/students.json` 无 `grade`

### Implementation for User Story 1

- [X] T006 [US1] 在 `src/components/StudentGroup.astro` 的 `byLevel` 中删除按 `grade` 的排序分支，改为 `.sort((a, b) => a.id.localeCompare(b.id))`（按数据文件条目顺序），并同步修改 `byLevel` / `phdColumns` / `masterColumns` 注释中的年级排序表述，清理脚本段其余 `grade` 注释
- [X] T007 [US1] 在 `src/components/StudentGroup.astro` 的 PhD 与 Master's 两处行模板中删除 `s.data.grade && <span class="grade">Since …</span>`，改为渲染该学生 `directions` 的全部标签：`<span class="direction-tags" role="list" aria-label="Research directions">` + 每项 `<span class="direction-tag" role="listitem">`，标签顺序与数组顺序一致
- [X] T008 [US1] 在 `src/components/StudentGroup.astro` 的 `<style>` 中删除全部 `.grade` 声明（颜色、字号、`margin-left: auto`、≥480px 第 2 轨、<480px 覆盖），按 `contracts/team-row.md §5` 新增 `.direction-tag` chip 基础视觉与 `.direction-tags` 在姓名与链接之间的基础定位；删除/改写样式与模板注释中残留的 `Since` / `grade` 表述；PhD 与 Master's 共用同一组选择器
- [X] T009 [US1] 执行验证：`npm run check && npm run build` 通过；对 `src/components/StudentGroup.astro`、`src/content.config.ts`、`src/data/students.json` 检索 `grade` 与 `Since` 均为 0 命中；在 `dist/team/index.html` 确认 31 条在读记录各含 ≥1 个 `.direction-tag`、`role="listitem"` 计数 31、两个在读分组无 "Since" 与四位入学年份、全页 "Since" 计数为 0；抽查两栏首/末姓名与 `students.json` 条目顺序一致

**Checkpoint**: 访客已能看到方向标签，US1 可独立验收（MVP 达成）

---

## Phase 4: User Story 2 - 内容维护者替换占位研究方向 (Priority: P1)

**Goal**: 维护者只改 `src/data/students.json` 即可把 `TBD` 替换为真实方向；`directions` 违约时构建失败并定位文件、学生与字段

**Independent Test**: 把一名学生的 `directions` 临时改为两个真实方向字符串，仅构建即按顺序显示两个标签；构造缺失 / 空数组 / 空字符串 / 纯空白 / 非字符串数据时构建失败且错误含文件、姓名、字段；每步后恢复原数据

### Implementation for User Story 2

- [X] T010 [P] [US2] 更新 `src/data/README.md`：删除 `grade`（入学年份）字段说明；补充 `directions` 格式（字符串数组、至少 1 项、每项非空、按数组顺序原样渲染、不 trim 不去重）、当前 `TBD` 占位约定、成员链接优先级（自建个人主页 → 机构个人资料页 → GitHub → Google Scholar）、HTTPS 要求与无链接时三个字段统一写 `null` 的约定；说明姓名列保持 3.5em，4 字姓名在列内换行为既定行为
- [X] T011 [US2] 备份 `src/data/students.json` 后逐个执行 6 个构建失败用例：`directions` 缺失、`""`（非数组）、`[]`、`[""]`、`["   "]`、`[123]`；每次 `npm run build` MUST 失败且错误含 `src/data/students.json`、该学生姓名、`directions`（项级错误含项序号），每次恢复原文件；恢复后 `npm run build` MUST 通过
- [X] T012 [US2] 临时把一名学生的 `directions` 改为两个真实方向字符串，构建后在 Team 页确认两个标签按数组顺序显示且样式一致，其他学生不受影响；随后恢复 `["TBD"]` 并重新构建通过

**Checkpoint**: 维护者仅改数据即可上线真实方向，违约数据无法构建通过

---

## Phase 5: User Story 4 - 通过成员链接访问学生主页 (Priority: P1)

**Goal**: 31 名在读学生每人至多一个可核实的成员链接，按「自建个人主页 → 机构个人资料页 → GitHub → Google Scholar」优先级选取；无可靠来源留空且不渲染链接标签

**Independent Test**: 对 `src/data/students.json` 逐条核对三个链接字段至多一个非空、全部为 HTTPS；逐一打开链接确认页面属于本人且有强关联证据；无链接学生行不显示链接标签；构建通过

### Implementation for User Story 4

- [X] T013 [P] [US4] 审计现有 16 条链接（4 条 `url` / 11 条 `github` / 1 条 `scholar`）：逐条打开页面，核对中科院信工所 / 国科大 / G3（CIGMA）/ 在读层次 / 导师或合作论文等强关联证据与 HTTPS，标记需替换（存在更高优先级来源）、需移除（失效或非本人）与保留项，输出待改清单
- [X] T014 [P] [US4] 为当前 15 名无链接学生（周俊豪、赵语林、汪嘉、朱祉同、张蓓泽、叶振雷、王娅彤、彭诗忠、艾明旭、冯宇辰、沈斌、张蓬月、顾树焕、温泽林、毛乐平）搜索自建个人主页（含 GitHub Pages 学术主页）、机构个人资料页、GitHub 与 Google Scholar，按强关联证据判定可写入项与留空项；仅同名不写入
- [X] T015 [US4] 依据 T013 / T014 结果更新 `src/data/students.json` 的 `url` / `github` / `scholar`（依赖 T013、T014）：每人至多一个字段非空；所有链接为 HTTPS；GitHub Pages 个人站记入 `url`；更高优先级来源替换时删除低优先级字段；无可靠来源统一写 `null`
- [X] T016 [US4] 运行 quickstart §1 数据检查脚本确认 `grade 残留` / `多链接` / `非 https` 均为空（§3.1 仅用于输出待审计清单）；执行 quickstart 用例 7（同时填 `url` 与 `github`）确认构建失败且错误含姓名与冲突字段；恢复后 `npm run build` 通过，抽查有链接行只渲染一个 Homepage / GitHub / Scholar 标签、无链接行不渲染 `.member-link`，并记录无链接学生名单供完成报告使用

**Checkpoint**: 成员链接归属正确、每人至多一个、无链接行干净

---

## Phase 6: User Story 3 - 标签在支持视口内稳定排布 (Priority: P2)

**Goal**: 九档视口下标签组在姓名与链接之间换行收纳，文本完整可见，无重叠、无截断、无页面横向滚动

**Independent Test**: 在 320 / 375 / 480 / 576 / 768 / 1024 / 1280 / 1440 / 1920px 检查两个在读分组：标签组可换行、无元素重叠、无行内与页面横向溢出；767/768px 两栏切分仍为 `ceil(n/2)`

### Implementation for User Story 3

- [X] T017 [US3] 在 `src/components/StudentGroup.astro` 的 `@media (min-width: 480px)` 中把行网格改为 `grid-template-columns: 3.5em minmax(0, 1fr) 6.5em`、`column-gap: 10px`；`.student-name` 固定第 1 列、`.direction-tags` 第 2 列、`.member-link` 第 3 列（`justify-self: end; text-align: right; white-space: nowrap`），确保无链接行仍保留第 3 轨宽度且不渲染占位
- [X] T018 [US3] 在 `src/components/StudentGroup.astro` 为 `.direction-tags` 设置 `display: flex; flex-wrap: wrap; gap: 4px 6px; align-items: center; min-width: 0`，为 `.direction-tag` 设置 `max-width: 100%; overflow-wrap: anywhere; white-space: normal`；MUST NOT 使用 `text-overflow: ellipsis`、`line-clamp`、`overflow: hidden` 或缩小字号
- [X] T019 [US3] 在 `src/components/StudentGroup.astro` 的 `@media (max-width: 479.98px)` 中设置 `.student-name { flex: 0 0 auto }`、`.direction-tags { flex: 1 1 0; min-width: 0 }`、`.member-link { order: 9; flex: 0 0 100%; text-align: right }`，保证竖排顺序为姓名 → 标签组 → 链接（链接独占最后一行）
- [X] T020 [US3] 按 quickstart §4 在 320 / 375 / 480 / 576 / 768 / 1024 / 1280 / 1440 / 1920px 九档视口执行测量脚本，记录：行数 31、标签组 31、`role="list"` 组 31、无重叠、无标签截断、无行内溢出、无页面横向滚动；在 767px 与 768px 核对两栏为 1 轨 / 2 轨、`column-gap: 32px`、PhD `[10,10]`、Master's `[6,5]`，并核对 ≥768px 两栏首行顶线 `top` 相等（容差 ≤1px）
- [X] T021 [US3] 在 768px 或 480px 视口按 quickstart §5 临时改 DOM：验证超长无空格标签在自身内部换行（`scrollWidth ≤ clientWidth + 1`）且不撑破行/页面；再克隆为 7 个标签验证组内换行与行高增高；验证后恢复 DOM

**Checkpoint**: 九档视口全部通过，US1 的展示在任意支持宽度下不破损

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 全量门禁、回归确认、交付记录与发布

- [X] T022 运行 `npm run check && npm run build` 全量门禁，确认通过且无警告引入
- [X] T023 回归核对：以 T001 保存的 `git diff --name-only` 为基线，确认新增改动仅包含 `src/data/students.json`、`src/content.config.ts`、`src/components/StudentGroup.astro`、`src/data/README.md` 与 `specs/013-student-direction-tags/`；确认 `src/pages/team.astro`、`src/styles/global.css`、`src/data/teachers.json`、`src/data/graduates.json`、`src/data/publications.json`、`src/components/TeacherCard.astro`、`tests/news-widgets.test.mjs`、`package*.json`、`astro.config.mjs`、`.github/workflows/deploy.yml` 相对 HEAD 零 diff；不做截图对比，零 diff 加构建通过即视为其他页面未受影响
- [X] T024 汇总完成报告（不新增证据文件）：31 行 / 31 个标签组 / 标签总数、6 + 1 个构建失败用例结果、九档视口测量摘要、767/768px 两栏结构与顶线对齐、`check` + `build` 输出、无链接学生名单与已排查来源；说明本期全部 `directions` 仍为 `TBD`（FR-012 自真实内容回填起生效）与 4 字姓名为已声明的预期换行行为
- [ ] T025 按 Constitution 维护工作流提交并推送变更、创建 PR、合并后检查线上 Team 页；PR 描述包含 T024 的验收摘要，作者与提交者仅为项目维护者（不添加 AI 共同作者尾注）

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖，可立即开始
- **Foundational (Phase 2)**: 依赖 Setup 完成——阻塞全部用户故事
- **User Stories (Phase 3～6)**: 均依赖 Foundational 完成
  - US1（P1）与 US2（P1）、US4（P1）可并行
  - US3（P2）依赖 US1 的 DOM 与基础样式完成（T017～T019 与 T007 / T008 改同一文件）
  - US2 的 T010（README）与 US1 并行无冲突；T011 / T012 与 US4 的 T015 都改 `students.json`，MUST NOT 同时执行
- **Polish (Phase 7)**: 依赖全部选定用户故事完成

### User Story Dependencies

- **US1 (P1)**: Foundational 完成后可开始——无其他故事依赖
- **US2 (P1)**: Foundational 完成后可开始——依赖 T004 / T005 的校验实现；与 US1 无代码依赖
- **US4 (P1)**: Foundational 完成后可开始——只改 `students.json` 链接字段；T015 依赖 T013 / T014
- **US3 (P2)**: 依赖 US1 的标签组 DOM 与芯片基础样式——无其他故事依赖

### Within Each User Story

- US1：排序（T006）与模板（T007）先于样式（T008），验证（T009）最后
- US2：README（T010）可先行；构建失败用例（T011）先于真实方向回填验证（T012）
- US4：现有链接审计（T013）与无链接学生检索（T014）并行，之后统一落库（T015）与校验（T016）
- US3：三轨几何（T017）→ 换行收纳（T018）→ 竖排（T019）→ 九档测量（T020）→ 极端内容验证（T021）
- 任何临时修改数据的验证任务结束后 MUST 恢复 `src/data/students.json` 并确认构建通过

### Parallel Opportunities

- T002 可与 T001 并行
- T003 与 T004 可并行（不同文件）；T005 紧随 T004（同一文件）
- Foundational 完成后：US1（T006～T009）、US2（T010）、US4（T013 / T014）可并行启动
- T013 与 T014 可并行（分别审计已有链接与检索无链接学生）
- 同一文件的任务不得并行：`StudentGroup.astro`（T006～T008、T017～T019）与 `content.config.ts`（T004、T005）以及 `students.json`（T003、T011、T012、T015）内部串行

---

## Parallel Example: Foundational + P1 Stories

```bash
# Phase 2：数据替换与 schema 可并行
Task: "T003 替换 src/data/students.json 的 grade 为 directions"
Task: "T004 更新 src/content.config.ts 的 students schema"

# Foundation 完成后：三个 P1 故事并行启动
Task: "T006～T008 实现 StudentGroup.astro 的标签渲染"
Task: "T010 更新 src/data/README.md"
Task: "T013 审计现有 16 条成员链接"
Task: "T014 检索 15 名无链接学生"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. 完成 Phase 1：Setup
2. 完成 Phase 2：Foundational（CRITICAL——阻塞全部故事）
3. 完成 Phase 3：User Story 1
4. **STOP and VALIDATE**：按 US1 Independent Test 独立验收
5. 可先行演示「方向标签替换年级」的展示变更

### Incremental Delivery

1. Setup + Foundational → 数据契约与校验就绪
2. US1 → 展示替换完成 → 独立验收（MVP）
3. US2 → 维护流程与构建失败用例完成 → 独立验收
4. US4 → 链接补全与审计完成 → 独立验收
5. US3 → 九档布局验收完成 → 独立验收
6. Polish → 全量门禁、回归、PR 与线上检查

> 注：US1、US2、US4 同为 P1；MVP 演示可只含 US1，但正式发布前 MUST 完成 US2 与 US4（内容准确性与校验要求）。

---

## Notes

- [P] 任务 = 不同文件、无未完成依赖；同一文件的任务不并行
- [Story] 标签用于追溯任务所属用户故事
- 本特性不新增测试文件、依赖、运行时 JS 或组件；验证以真实构建与真实浏览器为准
- 每完成一个任务或逻辑组提交一次；临时数据测试 MUST NOT 提交
- 避免：模糊任务、同一文件并行、跨故事引入破坏独立性的依赖

---

## Phase 8: Convergence

- [X] T026 在 `src/data/students.json` 为 14 名无链接学生（周俊豪、赵语林、汪嘉、朱祉同、张蓓泽、叶振雷、王娅彤、彭诗忠、艾明旭、沈斌、张蓬月、顾树焕、温泽林、毛乐平）补齐 `"github": null` 与 `"scholar": null`，使无链接记录 `url` / `github` / `scholar` 三字段统一写 `null`（保留现有 `"url": null`），随后运行 `npm run check && npm run build` 确认通过 per FR-017 / contracts/students-data.md §2.3 (partial)
