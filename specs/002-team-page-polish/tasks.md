# Tasks: Team 页布局优化与移动端修复（Team Page Polish）

**Input**: Design documents from `/specs/002-team-page-polish/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/team-layout.md ✅, quickstart.md ✅

**Tests**: 未要求自动化测试（research R5 裁决：纯 CSS 排版 + 最小数据迁移改动，不引入 e2e/视觉回归框架）。验收 = 机器门禁（`npm run check` + `npm run build`）+ quickstart.md 四档视口手动矩阵（375 / 768 / 1024 / ≥1280px，浏览器 DevTools 响应式模式），各故事阶段含对应手动验收任务。

**Organization**: 任务按用户故事分组（US1–US4），每个故事可独立实现与验收。本版为 2026-10-12 重新生成——纳入 spec 2026-10-12 GitHub 澄清回填（FR-006 数据层最小扩展 + FR-010 `GitHub↗` 标签，替代 2026-10-11 零数据改动口径版本，见 plan.md ⚠️ 标注）。改动收敛于 3 个 `.astro` 组件 + `src/content.config.ts` + `src/data/students.json` + 1 处维护者文档同步（`specs/001-homepage-rebuild/data-model.md`）；`teachers.json`、`graduates.json`（内容）、构建与 CI 配置零改动（FR-006 / 契约 §6）。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行执行（不同文件、无未完成依赖）
- **[Story]**: 所属用户故事（US1–US4）；Setup / Foundational / Polish 阶段无故事标签
- 描述含精确文件路径

## Path Conventions

- 单项目结构：`src/`、`specs/` 位于仓库根目录
- 改动文件 5 个（src 层）：`src/pages/team.astro`、`src/components/TeacherCard.astro`、`src/components/StudentGroup.astro`、`src/content.config.ts`、`src/data/students.json`
- 文档同步 1 处：`specs/001-homepage-rebuild/data-model.md`（Student / Graduate 字段表补 `github` 行）
- 回归验证对象：`src/pages/index.astro`（零改动，仅验证）

---

## Phase 1: Setup（共享基础设施）

**Purpose**: 特性分支与改动前基线确认

- [x] T001 从 `main` 创建并切换到特性分支 `002-team-page-polish`（repo root，git）
- [x] T002 在 repo root 执行 `npm run check && npm run build`，确认改动前基线门禁通过（任何后续失败才可归因于本特性改动）

**Checkpoint**: 分支就绪、基线绿

---

## Phase 2: Foundational（阻塞性前置）

**Purpose**: ① 所有故事共用的改动前基线观测（FR-009 回归对照基准）；② 跨故事共享的数据层最小扩展——`github` 字段同时服务 US2（毕业生标签）与 US3（学生标签与 `url→github` 迁移），置于 Foundational 以消除跨故事依赖（多故事共享实体 → Setup 阶段）

**⚠️ CRITICAL**: T003 基线观测 MUST 在任何代码/数据改动之前完成，否则 FR-009 回归比对失去对照基准

- [x] T003 捕获改动前基线观测：`npm run dev` 启动后（http://localhost:4321），在浏览器 DevTools 响应式模式下记录 `/team/` 与 `/`（主页 Team 概览区块）在 375 / 768 / 1024 / ≥1280px 四档视口的当前布局表现（截图或文字记录），作为 FR-009 主页回归比对（T018）与各故事验收的对照基线
- [x] T004 [P] 在 `src/content.config.ts` 扩展 schema（FR-006 唯一 schema 改动）：`students` 与 `graduates` 两个 collection 的 `z.object` 各新增可选字段 `github: httpsUrl`——复用既有 `httpsUrl` 校验器（合法 URL + MUST `https://` 开头 + optional/nullable，Constitution：外部链接 MUST HTTPS）；其余 collection 与字段零改动，`teachers` 不加 `github` 字段（FR-006：teachers 维持现状）。字段约定见 specs/002-team-page-polish/data-model.md §校验规则变更
- [x] T005 [P] 维护者文档同步（Constitution II：数据文件 MUST 有清晰的字段约定）：`specs/001-homepage-rebuild/data-model.md` §4 Member（students.json，"字段"表含既有 `url` = 个人主页（可选）行）与 §5 Graduate（graduates.json）两张字段表各补一行 `github`（类型 string (url)、非必填、校验 https、说明：GitHub 个人页链接，非空时页面渲染 `GitHub↗` 独立标签）；`url` 既有"个人主页（可选）"定义不变（迁移后语义收窄为仅个人主页，更加名副其实）

**Checkpoint**: 基线留存完毕、`github` 字段就绪，用户故事实现可以开始

---

## Phase 3: User Story 1 - 移动端完整浏览教师卡片 (Priority: P1) 🎯 MVP

**Goal**: 修复 375px / 768px 视口下教师卡片右侧被裁切的缺陷——每张卡片（照片、姓名、职称、研究方向、邮箱、主页链接）完整落在可视宽度内，页面无横向滚动

**Independent Test**: 在 375px（及 768px）视口打开 /team/，逐张核对教师卡片右侧内容（方向标签、链接等）完整可见、无截断

### Implementation for User Story 1

- [x] T006 [P] [US1] 修复 `src/pages/team.astro` 中 `.teacher-grid` 的最小列宽：`grid-template-columns` 由 `repeat(auto-fill, minmax(420px, 1fr))` 改为 `repeat(auto-fill, minmax(min(420px, 100%), 1fr))`，并同步更新其上方注释（R1：`min(420px, 100%)` 保证轨道最小宽度永不超过容器宽度——宽视口 ≥~900px 维持两列、窄视口自动降为恰好贴合容器的单列，全部宽度区间连续自适应）
- [x] T007 [P] [US1] 移除 `src/components/TeacherCard.astro` 中 `.teacher-card--detailed .teacher-directions li` 的 `white-space: nowrap` 规则（R1：该 nowrap 是当初 420px 最小列宽的溢出成因，修复后标签允许换行，消除移动端最后一个溢出隐患，满足 FR-005 收纳规则）
- [x] T008 [US1] 按 quickstart.md §1 手动验收（375px 与 768px 视口，`npm run dev` 打开 /team/）：每张教师卡片完整落在可视宽度内（照片、姓名、职称、研究方向标签、邮箱、Homepage 链接右缘无截断）；整页从上到下（Faculty → 在读学生 → Graduates）无横向滚动条、无内容被裁切；无布局破损（元素重叠 / 文字截断 / 内容溢出容器 / 非预期换行）

**Checkpoint**: 移动端缺陷已修复，US1 可独立验收（SC-002）

---

## Phase 4: User Story 2 - 毕业生去向列表列对齐 (Priority: P2)

**Goal**: ≥768px 视口下 Graduates 每行的姓名、学位·年份、去向三类字段分别对齐到一致的列位置；<768px 降级为紧凑流式布局；行内支持 `GitHub↗` 标签（`github` 非空时，FR-010）

**Independent Test**: ≥768px 视口打开 Graduates 部分，任取两行，核对同类字段（姓名 / 学位·年份 / 去向）起始位置处于同一水平位置

### Implementation for User Story 2

- [x] T009 [US2] 在 `src/pages/team.astro` 将 `.graduate-list li` 由 flex 布局改为 CSS Grid 三列对齐（R2，仅 ≥768px 生效）：`grid-template-columns` 前两列为与内容无关的固定轨道宽——第 1 列姓名按"现值均为 2–4 个汉字 → 固定列宽按 ≤4 字 + 余量取值"、第 2 列学位·年份按最宽值 `Master · 2025` 取值，第 3 列去向为 `minmax(0, 1fr)` 弹性列（"现值最长'北京大学（攻读博士）'10 个汉字，须可在列内换行"）；`year` 为空的行（谭宇彤、温哲）第 2 列仅显示学位、**列仍占位**、无多余分隔符，不影响其他行对齐；<768px 媒体查询降级为紧凑流式布局（不对齐三列，但同类字段位置仍跨行一致——窄屏布局形态中各字段的排布规则跨行统一，FR-003；不溢出、不截断）。模板既有 `.grad-name` / `.grad-meta` / `.grad-dest` 三个 span 结构可直接复用，仅需改 scoped 样式
- [x] T010 [US2] 在 `src/pages/team.astro` 为 Graduates 行渲染 `GitHub↗` 标签（FR-010 / R7）：`g.data.github` 非空时在 `.grad-dest` span 的去向文字之后内联渲染 `<a href={g.data.github} target="_blank" rel="noopener">GitHub <span aria-hidden="true">↗</span></a>`——与既有 `Homepage ↗`（TeacherCard.astro）/ `Link ↗`（PublicationItem.astro）模式同构，样式复用既有链接色板；标签内联于第 3 列、不引入第 4 条轨道（前两列固定轨道与第 3 列起始位置不受任何影响）；`github` 为空 MUST 不渲染该标签、无占位残留；<768px 降级布局中随行内流动、不溢出。依赖 T004（schema 字段）与 T009（同文件 team.astro，先对齐后加标签）
- [x] T011 [US2] 按 quickstart.md §2 手动验收：≥768px 视口任取两行核对姓名 / 学位·年份 / 去向三类字段起始位置分别一致；无年份条目（谭宇彤、温哲）占位对齐；长去向"北京大学（攻读博士）"在第 3 列内正常换行、不溢出不错位；视口调至 <768px 列表降级为紧凑流式且不溢出，并任取两行核对同类字段位置仍跨行一致（SC-003 <768px 档）；当前毕业生数据均无 `github` 值——全部行不渲染 `GitHub↗` 标签、无占位残留，并按 §2 第 5 条临时给某条加 `"github": "https://github.com/octocat"` 本地验证标签内联于去向文字后、不破坏三列对齐（**验证后还原，`graduates.json` 最终零内容改动**）

**Checkpoint**: Graduates 列对齐与 GitHub 标签机制达成，US2 可独立验收（SC-003 + SC-006 毕业生部分）

---

## Phase 5: User Story 3 - 在读学生列表空间利用 (Priority: P2)

**Goal**: 四档验收视口（375 / 768 / 1024 / ≥1280px）下 PhD Candidates / Master's Students 每行条目（姓名、Since 年份、备注）改为两端分布——姓名居左、Since/备注贴合分组右缘，消除条目右侧大片空白；学生 GitHub 链接迁移至 `github` 字段并以 `GitHub↗` 标签展示（FR-006 / FR-010）

**Independent Test**: 四档验收视口（375 / 768 / 1024 / ≥1280px）浏览学生分组，任一条目内容右端连续空白与两端分布行中间间隙均满足 FR-004 分档阈值；带 GitHub 链接的学生姓名后显示 `GitHub↗` 标签且姓名不再可点击

### Implementation for User Story 3

- [x] T012 [P] [US3] 在 `src/components/StudentGroup.astro` 将条目行 `li` 改为两端分布（R3）：姓名居左，`Since {grade}` 与备注（note 非空时紧随 Since 右侧；当前数据全为 null）靠右（`margin-left: auto` 类机制），行内容两端贴合分组列边界；`grade` 为空的条目（如李江楠）仅左侧姓名、行内布局保持整齐不错位。PhD 与 Master 两个分组共用同一 scoped 样式，一处修改同时生效
- [x] T013 [P] [US3] 在 `src/data/students.json` 执行 `url→github` 迁移（FR-006 / data-model.md 迁移明细，共 4 条）：李江楠 `https://github.com/LeqsNaN`、张瀚文 `https://github.com/Heaven-zhw`、郑明钰 `https://github.com/SpursGoZmy`、刘正宵 `https://github.com/jluliuzx`——各条 `url` 取值逐字搬移至新增 `github` 字段（URL 逐字不变，Constitution I），`url` 置 null；**不迁移**：杨晨旭 `url: https://iie-ycx.github.io/`（GitHub Pages 个人主页，非 GitHub 个人页）保留 `url`，姓名仍可点击；其余条目与字段零改动。依赖 T004（schema 已含 `github` 字段）
- [x] T014 [US3] 在 `src/components/StudentGroup.astro` 为学生条目渲染 `GitHub↗` 标签（FR-010 / R7）：`s.data.github` 非空时在姓名之后（条目左簇内联）渲染 `<a href={s.data.github} target="_blank" rel="noopener">GitHub <span aria-hidden="true">↗</span></a>`——与既有 `Homepage ↗` / `Link ↗` 模式同构，样式复用既有链接色板；标签计入条目左簇内容（FR-004 中间间隙自左簇末端含标签起算）；`github` 为空 MUST 不渲染；PhD 与 Master 两处条目模板（L26–38 / L52–66）同步修改。依赖 T012（同文件 StudentGroup.astro，先两端分布后加标签）
- [x] T015 [US3] 按 quickstart.md §3 + §5 手动验收：四档视口（375 / 768 / 1024 / ≥1280px）学生分组空白判定——条目内容右端连续空白与两端分布行中间间隙均满足 FR-004 分档阈值；无年级条目（李江楠）行整齐不错位；GitHub 标签——李江楠、张瀚文、郑明钰、刘正宵姓名后显示 `GitHub↗` 标签且链接指向其 GitHub 个人页（新标签打开）、姓名本身不再可点击（`url` 已迁移置 null）；杨晨旭无 `GitHub↗` 标签、姓名仍链接到个人主页；季慧山、刘曦雨、顾佴彬无标签、无占位残留；375px 视口标签随行内流动、不溢出不截断。验收注记（2026-10-12）：除中间间隙外全部通过（标签迁移/渲染、右端空白全档 0px、无年级行整齐、375px 不溢出均合规）；无 GitHub 标签的行（季慧山/杨晨旭/刘曦雨/顾佴彬）中间间隙实测约 217/218/346/424px，略超默认阈值（约 214/215/295/400px @ 375/768/1024/1280px）——两端分布为 SC-005 规定形态、FR-004 阈值注明为"默认验收口径，后续可调整"（CHK013），该 Finding 列入最终报告待用户裁定

**Checkpoint**: 学生列表空白消除 + GitHub 迁移与标签落地，US3 可独立验收（SC-004 学生条目部分 + SC-006 学生部分）

---

## Phase 6: User Story 4 - 教师卡片空间利用 (Priority: P3)

**Goal**: 四档验收视口（375 / 768 / 1024 / ≥1280px）下教师卡片研究方向区域改为横向流式换行填充，消除标签右侧大片空白，卡片视觉均衡

**Independent Test**: 四档验收视口（375 / 768 / 1024 / ≥1280px）核对研究方向区域右侧连续空白满足 FR-004 分档阈值

### Implementation for User Story 4

- [ ] T016 [US4] 移除 `src/components/TeacherCard.astro` 中 detailed 模式的纵向堆叠覆写 `.teacher-card--detailed .teacher-directions { flex-direction: column; align-items: flex-start; }`（及"研究方向每行一个"配套注释），使方向标签恢复组件默认的横向流式换行、自然填满卡片信息列（R4：与主页 compact 卡片同构；`white-space: nowrap` 已在 T007 移除，本任务为纯删码）。保持 FR-005 收纳规则：优先整标签换行（标签内文字不断开），仅当单个标签宽度超过卡片可用宽度时该标签内文字换行，任何情况下不溢出、不截断。依赖 T007（同文件 `TeacherCard.astro` 同一 scoped 样式块内的两处删除，T016 在 T007 之后执行避免冲突）
- [ ] T017 [US4] 按 quickstart.md §4 手动验收（四档视口 375 / 768 / 1024 / ≥1280px）：研究方向标签横向流式排布（优先整标签换行、单标签超长时标签内文字换行），标签区域右侧连续空白满足 FR-004 分档阈值；可临时注释某教师 `photo` 字段于本地验证缺图卡片头排布正常（**验证后还原，数据文件最终零改动**）

**Checkpoint**: 教师卡片空白消除，US4 可独立验收（SC-004 教师卡片部分）

---

## Phase 7: Polish & Cross-Cutting（收尾与横切关注点）

**Purpose**: 跨故事的回归验证与合并前审计

- [ ] T018 [P] 主页回归验证（FR-009）：对照 T003 基线，在 375 / 768 / 1024 / ≥1280px 四档视口核对 `/` 主页 Team 概览区块的 compact 教师卡片（`src/pages/index.astro`，共享 `TeacherCard.astro` 组件，本身零改动）无新增布局破损（quickstart.md §6）
- [ ] T019 [P] 整页四档视口终检（SC-001）：/team/ 在 375 / 768 / 1024 / ≥1280px 下从上到下（Faculty → 在读学生 → Graduates）全部区块无布局破损、无横向滚动、无内容裁切（各故事已单独验收，此处核对全部改动叠加后的整页状态）
- [ ] T020 [P] 最终机器门禁与产物验证（SC-005）：repo root 执行 `npm run check && npm run build && npm run preview`，确认类型 + schema 校验（含 `github` 字段）与静态构建通过（CI 同口径），且构建产物中 /team/ 与 / 渲染正常（quickstart.md §7）；合并部署后在 GitHub Pages 线上抽查 `/team/` 与 `/` 渲染正常（Constitution §维护工作流：内容变更部署后 MUST 检查线上实际渲染效果）
- [ ] T021 合并前范围审计：`git diff main...002-team-page-polish --stat` 确认 src 层改动仅限 5 个文件——`src/pages/team.astro`、`src/components/TeacherCard.astro`、`src/components/StudentGroup.astro`、`src/content.config.ts`、`src/data/students.json`（模板 / scoped 样式 / schema `github` 字段 / 4 条 `url→github` 迁移），外加 1 处文档同步 `specs/001-homepage-rebuild/data-model.md`；零改动：`src/data/teachers.json`、`src/data/graduates.json`（quickstart §2 临时验证值已还原）、`astro.config.*`、`package.json` / `package-lock.json`、`.github/workflows/deploy.yml`；零新增 JS 与运行时依赖（FR-006 / FR-008 / 契约 §6 不变量）

**Checkpoint**: 全部验收口径（SC-001–SC-006）达成，可合并

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖，立即开始（当前在 `main` 分支，T001 需先建分支）
- **Foundational (Phase 2)**: 依赖 Phase 1；T003 基线观测 MUST 先于一切代码/数据改动；T004 schema 先于所有 `github` 消费方（T010 / T013 / T014）
- **User Stories (Phase 3–6)**: 均依赖 Phase 2 完成
- **Polish (Phase 7)**: T018–T020 依赖全部故事实现完成（T006–T017）；T021 为最终审计，最后执行

### User Story Dependencies

- **US1 (P1)**: 无故事间依赖——但 T006 与 T009 / T010 同改 `src/pages/team.astro` 的模板与 scoped 样式块，同文件任务不可并行，先 US1 后 US2
- **US2 (P2)**: 在 US1 的 team.astro 改动（T006）之后执行（同文件串行；逻辑上 `.teacher-grid` 与 `.graduate-list` 两处改动相互独立）；GitHub 标签（T010）依赖 Foundational 的 T004
- **US3 (P2)**: 完全独立（`StudentGroup.astro` 仅 Team 页使用、`students.json` 无他任务触碰，契约 §5），可与 US1 / US2 并行；T013 迁移与 T014 标签渲染建议同批完成，避免"姓名失去链接且无 `GitHub↗` 出口"的中间态长期存在（特性分支内短暂时序可接受，合并前由 T019 / T021 终检兜底）
- **US4 (P3)**: 依赖 US1 的 T007 先完成（同文件 `TeacherCard.astro` 同一 scoped 样式块内的两处删除，T016 在 T007 之后执行避免冲突）

### Within Each User Story

- 先实现（改 CSS / 模板 / 数据）后手动验收（DevTools 视口矩阵）
- 验收发现问题 → 修复后重跑该故事验收任务

### Parallel Opportunities

- T004 ∥ T005（Foundational：content.config.ts / 001 data-model.md，不同文件）
- T006 ∥ T007 ∥ T012 ∥ T013（四个不同文件：team.astro / TeacherCard.astro / StudentGroup.astro / students.json）
- Polish 阶段 T018 ∥ T019 ∥ T020（互不依赖：主页观测 / team 页观测 / 构建门禁）
- 不可并行（同文件）：T006 ↔ T009 ↔ T010（team.astro）、T007 ↔ T016（TeacherCard.astro）、T012 ↔ T014（StudentGroup.astro）

---

## Parallel Example: User Story 1 + User Story 3（数据层）

```bash
# 基线与 schema 就绪后，以下可同时进行（四个不同文件，无依赖）：
Task: "T006 修复 .teacher-grid 最小列宽（src/pages/team.astro）"
Task: "T007 移除 detailed 标签 nowrap（src/components/TeacherCard.astro）"
Task: "T012 学生条目行两端分布（src/components/StudentGroup.astro）"
Task: "T013 学生 GitHub 链接 url→github 迁移（src/data/students.json）"

# 之后串行（同文件后续任务）：
Task: "T009 Graduates 三列对齐（src/pages/team.astro，待 T006 完成后）"
Task: "T010 Graduates GitHub↗ 标签渲染（src/pages/team.astro，待 T009 完成后）"
Task: "T014 学生 GitHub↗ 标签渲染（src/components/StudentGroup.astro，待 T012 完成后）"
Task: "T016 移除方向标签纵向堆叠（src/components/TeacherCard.astro，待 T007 完成后）"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup（建分支 + 基线门禁）
2. Complete Phase 2: Foundational（基线观测 + `github` schema 与文档同步——均为惰性改动：可选字段未被数据使用、无渲染影响，随 MVP 合入安全）
3. Complete Phase 3: US1（移动端缺陷修复）
4. **STOP and VALIDATE**: 375px / 768px 视口独立验收 US1
5. 此时移动端可用性阻断已解除，即可先合入/部署（若需尽早止损）

### Incremental Delivery

1. Setup + Foundational → 基线与数据层就绪
2. 加 US1（移动端修复）→ 独立验收 → 可交付（MVP）
3. 加 US2（Graduates 列对齐 + 毕业生 GitHub 标签机制）→ 独立验收
4. 加 US3（学生列表空白 + GitHub 迁移与标签）→ 独立验收（可与步骤 3 并行）
5. 加 US4（教师卡片空白）→ 独立验收
6. Polish（主页回归 + 整页终检 + 门禁 + 范围审计）→ 合并

### Parallel Team Strategy

单人执行推荐按优先级顺序（US1 → US2 → US3 → US4）；多人协作时：

- Developer A: US1 → US2（串行，同文件 team.astro）
- Developer B: US3（独立文件：StudentGroup.astro + students.json）
- US4 待 Developer A 完成 T007 后接续（TeacherCard.astro）

---

## Notes

- [P] 任务 = 不同文件、无未完成依赖
- [Story] 标签将任务映射到 spec.md 用户故事，便于追溯
- 每个故事独立可验收；任一检查点可暂停验证
- 遵循 Constitution V（小步提交）：建议按关注点提交——① 数据层（T004 schema + T005 文档同步 + T013 迁移）② US1 ③ US2 ④ US3 ⑤ US4，Polish 审计后合并
- 禁止改动：`src/data/teachers.json`、`src/data/graduates.json`（内容）、构建与 CI 配置（FR-006）；禁止新增依赖与 JS（FR-008）
- 布局判定口径统一见 `specs/002-team-page-polish/contracts/team-layout.md`；验收步骤详见 `specs/002-team-page-polish/quickstart.md`
- `checklists/` 下的需求质量清单为评审产物，实现阶段不修改其勾选状态
