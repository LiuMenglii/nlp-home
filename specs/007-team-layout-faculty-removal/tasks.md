---

description: "Task list for Team 页学生分组纵向展开、教师移除与成员链接标签"
---

# Tasks: Team 页学生分组纵向展开、教师移除与成员链接标签（Team Layout, Faculty Removal & Member Link Tags）

**Input**: Design documents from `/specs/007-team-layout-faculty-removal/`

**Prerequisites**: [plan.md](./plan.md)、[spec.md](./spec.md)、[research.md](./research.md)、[data-model.md](./data-model.md)、[contracts/team-layout-member-links.md](./contracts/team-layout-member-links.md)、[quickstart.md](./quickstart.md)

**Tests**: 本特性未在 spec 中要求自动化测试，不新增 e2e/单元测试框架。验证以 `npm run check` + `npm run build`（CI 同口径）与 quickstart 的浏览器量测为准；此类验证作为各故事的验收任务列出。

**Organization**: 按用户故事组织，US1（P1）→ US2（P2）→ US3（P2），每个故事可独立实现与验收。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行（不同文件、无未完成依赖）
- **[Story]**: 所属用户故事（US1 / US2 / US3）
- 每条任务含精确文件路径

## Path Conventions

单一 Astro 项目：源码在 `src/`，静态资源在 `public/`，规划产物在 `specs/007-team-layout-faculty-removal/`。

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 确认改动前基线干净，避免把既有失败误判为本特性引入。

- [X] T001 在仓库根执行 `npm run check` 与 `npm run build`，确认改动前基线全部通过（npm scripts 定义见 package.json）；同时确认 `public/teachers/wang-weiping.svg` 存在、`src/pages/team.astro` 与 `src/pages/index.astro` 的 `.teacher-grid` 当前为 `repeat(3, minmax(0, 1fr))`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 本特性为零新依赖、零新组件、零新 CSS 工具类的展示层与数据改动，**无跨故事共享的阻塞性基础设施任务**。Phase 1 完成即可按优先级进入任一用户故事；三个故事之间无相互依赖（仅存在后文列出的同文件写入顺序约束）。

**Checkpoint**: 基线通过，可开始 US1 / US2 / US3。

---

## Phase 3: User Story 1 - 学生分组纵向排列 (Priority: P1) 🎯 MVP

**Goal**: PhD Candidates 与 Master's Students 在所有视口下上下排列，各自占据内容区整行；分组内条目排版保持不变。

**Independent Test**: 宽屏（≥1280px）与窄屏（375px）打开 `/team/`，两个分组标题纵向排列、左右边缘与内容区一致，同一分组内列表横跨整行；转 `getBoundingClientRect()` 量测左右边缘差 ≤1px、纵向间距 ≥32px。

### Implementation for User Story 1

- [X] T002 [US1] 将 `src/components/StudentGroup.astro` 中 `.student-groups` 的 `grid-template-columns` 由 `repeat(auto-fit, minmax(min(320px, 100%), 1fr))` 改为 `minmax(0, 1fr)`，保留 `display: grid` 与 `gap: 32px`；同步更新该处注释（不再描述 2 列阈值）。不得改动 `li` 的 `display: flex` / `flex-wrap: wrap` / `gap: 4px 10px` / `padding: 8px 24px`、`.grade` 的 `margin-left: auto` 与空分组分支
- [X] T003 [US1] 按 [quickstart.md](./quickstart.md) §3 在真实浏览器（`npm run dev` → `http://localhost:4321/nlp-home/team/`）按 1920 / 1280 / 1024 / 768 / 767 / 576 / 481 / 480 / 375 / 320px 十档验收：两分组始终上下排列且 PhD Candidates 在上、Master's Students 在下、`left`/`right` 与内容区差值 ≤1px、两组 `top` 不同且无水平重叠、纵向间距 ≥32px、Master's Students 空分组仍独占整行并显示 `coming soon`

**Checkpoint**: US1 可独立演示；此时 US2、US3 尚未实施，页面其余行为保持改动前状态。

---

## Phase 4: User Story 2 - 移除王老师介绍 (Priority: P2)

**Goal**: 王伟平从 Team 页 Faculty 与首页人员区块同步消失，照片与主页链接不可访问；其余 4 位教师字段与顺序不变，≥1280px 呈 2×2。

**Independent Test**: `/team/` 与 `/` 中检索「王伟平」与 `people.ucas.edu.cn/~0012246` 命中 0；教师卡片各 4 张、≥1280px 为两行两列；`/teachers/wang-weiping.svg` 返回 404。

### Implementation for User Story 2

- [X] T004 [US2] 从 `src/data/teachers.json` 删除王伟平整条记录（`name`/`title`/`advisorRole`/`directions`/`email`/`homepage`/`photo`/`bio` 全部字段），其余 4 条（林政 → 付鹏 → 吴大衍 → 谷井子）字段与相对顺序零改动
- [X] T005 [P] [US2] 删除 `public/teachers/wang-weiping.svg`，确保构建产物 `dist/teachers/` 中不存在该文件、`/teachers/wang-weiping.svg` 不可访问
- [X] T006 [US2] 将 `src/pages/team.astro` 中 `.teacher-grid` 的基础列数由 `repeat(3, minmax(0, 1fr))` 改为 `repeat(2, minmax(0, 1fr))`（≥1280px 生效），同步修正该处注释；`@media (max-width: 1279.98px)`（2 列）与 `@media (max-width: 767.98px)`（1 列）保持不变
- [X] T007 [P] [US2] 将 `src/pages/index.astro` 中 `.teacher-grid` 的基础列数由 `repeat(3, minmax(0, 1fr))` 改为 `repeat(2, minmax(0, 1fr))`，同步修正该处注释；两个既有媒体查询保持不变
- [X] T008 [US2] 将 `src/data/README.md` 中数据文件一览的「`teachers.json` | 教师团队（5 位）」更新为「教师团队（4 位）」（教师字段与照片说明其余内容不动）
- [X] T009 [US2] 按 [quickstart.md](./quickstart.md) §2 验收：`npm run check` + `npm run build` 通过；`/team/` 与 `/` 各 4 张教师卡片、≥1280px 呈 2×2 且宽度差 ≤1px、768–1279px 两列、<768px 单列；全站渲染产物中「王伟平」与 `people.ucas.edu.cn/~0012246` 命中 0；`public/teachers/` 与 `dist/teachers/` 均无 `wang-weiping.svg`

**Checkpoint**: US1 + US2 均独立可用；US3 尚未实施，学生链接仍为「姓名链接 + GitHub 标签」旧形态。

---

## Phase 5: User Story 3 - 成员链接标签三选一 (Priority: P2)

**Goal**: 在读学生与毕业生每人至多一个链接标签（Homepage / GitHub / Scholar），姓名不可点击；同一成员填写两个及以上链接字段时 `check` 与 `build` 失败并定位文件、姓名与全部冲突字段。

**Independent Test**: `/team/` 中顾佴彬/杨晨旭/李雨晴各 1 个 Homepage↗、李江楠/张瀚文/郑明钰/刘正宵各 1 个 GitHub↗、刘曦雨 1 个 Scholar↗、季慧山 0 个；姓名元素为 `span`；李雨晴在 PhD Candidates 显示 Since 2022；刘曦雨不显示 Since；临时为任一成员补第二个链接字段后 `check`/`build` 均失败并报出文件、姓名、全部冲突字段。

### Implementation for User Story 3

- [X] T010 [US3] 在 `src/content.config.ts` 新增本地工具 `singleLinkRefiner(dataFile: string)` 并应用于 `students` collection 的对象 schema：按 `url` → `github` → `scholar` 顺序收集值非空字段，非空数 ≥2 时 `ctx.addIssue`，消息 MUST 同时包含数据文件路径（`src/data/students.json`）、成员姓名与按该顺序用「、」连接的全部冲突字段（如 `url、github、scholar`）；`if (!entry.name) return;` 防御解析错误载体；三字段皆空为合法
- [X] T011 [US3] 在 `src/content.config.ts` 为 `students` 与 `graduates` schema 各新增 `scholar: httpsUrl` 字段（复用既有 `httpsUrl`：合法 URL 且 `https://` 开头、optional/nullable），并将 T010 的 `singleLinkRefiner` 同样应用到 `graduates` schema，错误消息指向 `src/data/graduates.json`
- [X] T012 [US3] 更新 `src/data/students.json`：顾佴彬 `url` 由 `null` 改为 `https://gccnlp.github.io/`；刘曦雨新增 `"scholar": "https://scholar.google.com/citations?user=94lNc6oAAAAJ&hl=zh-CN"`（逐字使用，保留 `&hl=zh-CN`）并删除其 `grade` 字段（或置为 `null`）；在顾佴彬之后、刘正宵之前插入李雨晴 `{ "name": "李雨晴", "level": "phd", "grade": "2022", "url": "https://qdcassie-li.github.io/", "note": null }`；杨晨旭 `url` 保持 `https://iie-ycx.github.io/`，其余成员字段与顺序不动
- [X] T013 [US3] 改造 `src/components/StudentGroup.astro` 的模板与 scoped CSS：姓名改为纯文本 `span.student-name`（`flex: 0 0 5em`，不得为 `a`）；删除姓名链接分支；把「可选 GitHub 标签」替换为唯一标签 `a.member-link`（`target="_blank" rel="noopener"`，按 `url` → `github` → `scholar` 取第一个非空字段渲染 `Homepage` / `GitHub` / `Scholar`，后接 `<span aria-hidden="true">↗</span>`，`flex: 0 0 6.5em`，`text-align: center` 使标签在列内居中（≥480px；堆叠态恢复左对齐），沿用 `--blue-deep` / hover `--blue`）；删除 `.github-link` 规则；新增 `@media (max-width: 479.98px)`：姓名列恢复自适应宽度、标签 `order: 9; flex: 0 0 100%` 独占一行并 `text-align: left` 左对齐；`Props` 接口保持不变
- [X] T014 [US3] 修改 `src/pages/team.astro` 毕业生区：`.grad-links` 内新增 `scholar` 分支渲染 `Scholar <span aria-hidden="true">↗</span>`（与既有 `url` / `github` 分支同结构、同样式、`target="_blank" rel="noopener"`）；`.grad-links` 的 `is-empty` 条件由 `!g.data.url && !g.data.github` 扩展为同时包含 `!g.data.scholar`；五列轨道由 `4.5em 4em 3em minmax(0,1fr) 6.5em` 调整为 `5em 4em 3em minmax(0,1fr) 6.5em`（去向列收窄 0.5em），38px 列距、24px 内距与 <768px 三段式不变；`.grad-links` 在 ≥768px 由右对齐改为 `justify-content: center`（标签列内居中），<768px 仍左对齐
- [X] T015 [US3] 更新 `src/data/README.md` 成员变动说明：`students.json` 字段列表补 `github` 与 `scholar`，`graduates.json` 字段列表补 `url` / `github` / `scholar`；将现有 `url`（个人主页或 GitHub）描述改为「`url`＝个人主页，渲染 Homepage 标签」，并将 `github` / `scholar` 分列说明；明确「`url` / `github` / `scholar` 三选一（至多填一个），同时填写两个及以上会使 `npm run check` 与 `npm run build` 失败」，说明三者皆空时不显示标签，并补充「成员姓名最多 4 个汉字，超长姓名另开变更处理」
- [X] T016 [US3] 按 [quickstart.md](./quickstart.md) §4–§5 验收标签矩阵与列对齐：学生 9 人标签与 href 逐项一致（顾佴彬/杨晨旭/李雨晴 = Homepage、李江楠/张瀚文/郑明钰/刘正宵 = GitHub、刘曦雨 = Scholar、季慧山 = 无）；毕业生佀庆一/杨泽娴/刘源鑫 = Homepage，其余无标签；全站 Scholar 标签数 = 1；姓名元素为 `span`；李雨晴显示 Since 2022；刘曦雨不显示 Since；学生 ≥480px `.member-link` 与毕业生 ≥768px `.grad-links a` 在 6.5em 标签列内居中（中心线跨行极差 ≤1px）、堆叠态左对齐；`Homepage ↗` 单行不换行（6.5em = 117px ≥ 106.11px）
- [X] T017 [US3] 按 [quickstart.md](./quickstart.md) §6 执行互斥负向用例：(a) 给学生某成员补第二个链接字段（如顾佴彬加 `github`）；(b) 给毕业生某成员补第二个字段（如佀庆一加 `github`）；(c) 某成员三字段全填。三项分别执行 `npm run check` 与 `npm run build`，预期全部失败且消息含对应数据文件、成员姓名、按 `url` → `github` → `scholar` 顺序的全部冲突字段；每次验证后还原，最终数据恢复为每人至多一个链接字段
- [X] T018 [US3] 毕业生 Scholar 渲染正向验证：临时将 `src/data/graduates.json` 中佀庆一的 `url` 字段改名为 `scholar`（值不变），`npm run build` 通过且其标签渲染为 `Scholar ↗`；验证后还原为 `url` 字段并重新构建确认通过

**Checkpoint**: 三个用户故事全部独立可用。

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 跨故事的全站回归与最终门禁。

- [X] T019 [P] 按 [quickstart.md](./quickstart.md) §7 在 1920 / 1280 / 1024 / 768 / 767 / 576 / 481 / 480 / 375 / 320px 十档浏览 `/team/` 全部区块与 `/` 教师区块：无元素重叠、文字截断、内容溢出、非预期换行；逐元素检查 `getBoundingClientRect().right ≤ document.documentElement.clientWidth`（至少覆盖 `.student-group`、`.student-name`、`.member-link`、`.graduate-list li`、`.grad-links`、`.grad-dest`、`.teacher-card`），页面无横向滚动
- [ ] T020 [P] 按 [quickstart.md](./quickstart.md) §5 在 Windows 与 macOS 各复测一次标签列：Chrome 最新稳定版 + 站点默认系统字体栈（18px）下三种标签均单行、不截断、在 6.5em 列内居中（中心线跨行极差 ≤1px）；若复测仍换行，按实测宽度 +10% 调整标签列宽后重测
- [X] T021 最终门禁：仓库根执行 `npm run check` 与 `npm run build` 均通过；检查 `dist/` 中无 `teachers/wang-weiping.svg`，且 `dist/` 全部 HTML 产物（全站口径，FR-010）中无「王伟平」与 `people.ucas.edu.cn/~0012246`
- [X] T022 核对改动范围：`git status` / `git diff --stat` 确认改动仅落在 `src/components/StudentGroup.astro`、`src/pages/team.astro`、`src/pages/index.astro`、`src/content.config.ts`、`src/data/students.json`、`src/data/teachers.json`、`src/data/README.md` 与删除 `public/teachers/wang-weiping.svg`；`src/data/graduates.json`、`src/components/TeacherCard.astro`、`src/styles/global.css`、`.github/workflows/deploy.yml` 零改动
- [ ] T023 按 Constitution 维护工作流，将本特性的模板/样式与数据改动通过 Pull Request 合入：合并前确认 `npm run check` / `npm run build` 通过、十档渲染无布局破损；合并后确认 GitHub Pages 构建流水线成功
- [ ] T024 部署完成后检查线上 `/team/` 与 `/` 的实际渲染：成员、教师、标签矩阵与桌面/移动视口均无布局破损，记录结果（Constitution 维护工作流）

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖，最先执行
- **Foundational (Phase 2)**: 无共享阻塞任务
- **User Stories (Phase 3–5)**: 均只依赖 Phase 1；故事之间无代码依赖
- **Polish (Phase 6)**: 依赖全部目标故事完成；T023 需 T019–T022 全部通过，T024 依赖 T023 合并后的部署完成

### User Story Dependencies

- **US1 (P1)**: 独立，仅改 `StudentGroup.astro` 的 `.student-groups` 列定义
- **US2 (P2)**: 独立，仅改教师数据、教师照片与两页 `.teacher-grid` 列数
- **US3 (P2)**: 独立；故事内顺序为 schema（T010）→ 毕业生 schema（T011）→ 数据与模板（T012–T015）

### 跨故事同文件写入顺序（并行时 MUST 遵守）

- `src/components/StudentGroup.astro`：US1 T002 在前，US3 T013 在后
- `src/pages/team.astro`：US2 T006 在前，US3 T014 在后
- `src/data/README.md`：US2 T008（教师人数）与 US3 T015（链接字段）分处不同章节，先后均可但不得并发写同一文件

### Within Each User Story

- US1：T002 → T003
- US2：T004/T005 可与 T006/T007 并行；T009 在 T004–T008 全部完成后执行
- US3：T010 → T011 →（T012、T015 可并行）→ T013、T014 → T016 → T017 → T018

### Parallel Opportunities

- Setup 无可并行任务
- US2：T004（`teachers.json`）与 T005（`public/teachers/wang-weiping.svg`）并行；T006（`team.astro`）与 T007（`index.astro`）并行
- US3：T012（`students.json`）与 T015（`README.md`）在 T011 完成后并行；T013 与 T014 分属不同文件，可在 T011 完成后并行（T013 依赖 T010 的 `scholar` 类型）
- Polish：T019 与 T020 并行；T023 → T024 串行（PR 合入并部署后再做线上复核）

---

## Parallel Example: User Story 2

```bash
# 教师数据移除与照片删除互不影响：
Task: "从 src/data/teachers.json 删除王伟平整条记录"
Task: "删除 public/teachers/wang-weiping.svg"

# 两页教师网格分属不同文件：
Task: "将 src/pages/team.astro 的 .teacher-grid 基础列数改为 repeat(2, minmax(0, 1fr))"
Task: "将 src/pages/index.astro 的 .teacher-grid 基础列数改为 repeat(2, minmax(0, 1fr))"
```

## Parallel Example: User Story 3

```bash
# schema 完成后，数据与文档可并行：
Task: "更新 src/data/students.json（顾佴彬 url、刘曦雨 scholar 去 grade、新增李雨晴）"
Task: "更新 src/data/README.md（三选一约定与字段列表）"

# 学生模板与毕业生模板分属不同文件：
Task: "改造 src/components/StudentGroup.astro（姓名纯文本 + 唯一 member-link + <480px 堆叠）"
Task: "修改 src/pages/team.astro（毕业生 scholar 分支与 is-empty 扩展）"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. 完成 Phase 1（基线门禁）
2. 完成 US1（T002–T003，一条列定义 + 十档量测）
3. **STOP and VALIDATE**：按 quickstart §3 独立验收 US1
4. 可与维护者确认版面后先行发布

> 说明：US2 属内容更正（Constitution I），US3 属数据约束 + 链接入口统一；两者虽为 P2，建议与 US1 同批交付，避免站点长期保留已确认错误的教师信息。

### Incremental Delivery

1. Phase 1 → 基线
2. US1 → 验收 → 可发布（MVP）
3. US2 → 验收 → 发布（教师 4 人、2×2、照片不可访问）
4. US3 → 验收 → 发布（三选一标签与构建期互斥）
5. Phase 6 全站回归与最终门禁 → T023 PR 合入 → T024 部署后线上复核

### Parallel Team Strategy

1. 先完成 Phase 1
2. 三人分别领 US1 / US2 / US3，按上文「跨故事同文件写入顺序」协调 `StudentGroup.astro`、`team.astro`、`README.md` 的写入次序
3. 每个故事完成后各自跑 `npm run check` + `npm run build`，最后统一执行 Phase 6 回归，并由一人执行 T023 → T024（PR 合入、部署后线上复核）

---

## Notes

- [P] 任务 = 不同文件、无未完成依赖
- [Story] 标签用于把任务映射回 spec 的 US1 / US2 / US3
- 不新增依赖、运行时脚本、组件或公共 CSS 工具类；不得用 `overflow-x: hidden` 掩盖溢出
- 验证以真实浏览器渲染为准，覆盖 spec 声明的十档视口矩阵
- 毕业生 `scholar` 本期无数据；正向渲染经 T018 临时 fixture 验证后还原
- 每个故事完成后提交一次，便于审查与回滚
- 两类名单姓名列统一 5em；标签在 6.5em 列内居中（堆叠态左对齐）；毕业生去向列因此收窄 0.5em（9px）
- 交付按 Constitution 维护工作流：PR 合入 + 部署后线上复核（T023/T024）
- 成员姓名最多 4 个汉字，超长另开变更（T015 写入数据维护指南）
