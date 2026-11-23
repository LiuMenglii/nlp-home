# Tasks: Team 页教师链接标签与学生主页信息补全

**Input**: Design documents from `/specs/014-team-faculty-links-student-directions/`

**Prerequisites**: [plan.md](./plan.md)（Rev.2，必需）、[spec.md](./spec.md)（必需）、[research.md](./research.md)、[data-model.md](./data-model.md)、[contracts/teachers-data.md](./contracts/teachers-data.md)、[contracts/team-card.md](./contracts/team-card.md)、[quickstart.md](./quickstart.md)

**Tests**: 未生成测试任务——spec / plan 明确不引入 e2e 或视觉回归框架（Constitution V）。验证由 `npm run check` + `npm run build`、quickstart 数据契约探针与九档真实浏览器测量承担。

**Organization**: 任务按用户故事分组，每个故事可独立实现与独立验收。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行执行（不同文件、无未完成依赖）
- **[Story]**: 所属用户故事（US1 / US2 / US3 / US4）
- 每项任务均给出精确文件路径或可执行命令

## Path Conventions

单项目静态站点（Astro）：源码位于 `src/`，数据位于 `src/data/`，组件位于 `src/components/`，特性文档位于 `specs/014-team-faculty-links-student-directions/`。

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 建立实施分支与可对比的回归基准；本特性零新增依赖、零配置改动。

- [X] T001 创建并切换到特性分支 `014-team-faculty-links-student-directions`（当前在 `013-student-direction-tags`），确认 `src/` 无未提交改动（`specs/014-team-faculty-links-student-directions/` 为未跟踪规格文档），记录基线提交 SHA，作为 T020 零 diff 判定的对照
- [X] T002 [P] 在基线提交上运行 `npm run check` 与 `npm run build`，记录退出码与输出摘要，确认实施前基线为绿色

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 记录实施前的渲染基线——SC-006 要求首页除教师名片链接区外逐项一致，T008 与 T020 需要可比对的基准

**⚠️ CRITICAL**: 在任何数据或组件修改前完成

- [X] T003 运行 `npm run build` 后用 `npm run preview` 记录实施前基线：`/team/` Faculty 每张名片为「邮箱 + 1 个 `Homepage ↗`（指向 `people.ucas.ac.cn`）」、首页 `/` Team 概览 4 张名片各 1 个 `Homepage ↗`（指向 UCAS URL）；同时记录首页新闻、发表、Gallery、Team 标题等非名片链接区内容，并确认 `document.documentElement.scrollWidth === window.innerWidth`；结果写入 PR 说明或本地草稿，不新增或提交快照文件

**Checkpoint**: 基线可用 — 用户故事的内容实现与回归判定可以开始

---

## Phase 3: User Story 1 - 访客区分 UCAS 资料页与教师个人主页 (Priority: P1) 🎯 MVP

**Goal**: Team 页 Faculty 与首页 Team 概览共 8 张教师名片统一以 `UCAS Profile ↗` 指代 UCAS 资料页；付鹏在两处的名片额外显示 `Homepage ↗` 指向 `https://fupeng.ac.cn/`；其余三位教师只显示 `UCAS Profile ↗`。

**Independent Test**: 构建并预览 `/team/` 与 `/`：两处共 8 张名片各有且仅有 1 个 `UCAS Profile ↗`（指向原 4 个 `people.ucas.ac.cn` URL）；付鹏在两处各有 1 个 `Homepage ↗` → `https://fupeng.ac.cn/`，其余三位无 `Homepage`；首页仅教师名片链接区相对 T003 基线变化。

- [X] T004 [US1] 在 [src/content.config.ts](file:///home/photon/workspace/nlp-home/src/content.config.ts) 的 teachers schema 中把 `homepage: httpsUrl` 拆为 `ucasProfile: httpsUrl` 与 `homepage: httpsUrl`：两字段均沿用既有 `httpsUrl`（`z.url().refine(v => v.startsWith('https://')).optional().nullable()`），缺省或 `null` 合法且不导致构建失败，非 HTTPS 值构建失败；`name` / `title` / `advisorRole` / `directions` / `email` / `photo` / `bio` 与照片 `superRefine` 不变
- [X] T005 [US1] 迁移 [src/data/teachers.json](file:///home/photon/workspace/nlp-home/src/data/teachers.json)：4 条记录的 `homepage` 键更名为 `ucasProfile` 并保留原 URL 原值（`https://people.ucas.ac.cn/~linzheng`、`~fupeng`、`~dayan`、`~0082145`）；新增 `homepage` 字段——付鹏为 `"https://fupeng.ac.cn/"`，林政、吴大衍、谷井子为 `null`。约束：两字段 MUST 为 `https://` 外链或 `null`；本任务 MUST 与 T004 在同一提交内完成，禁止分步提交 schema 与数据（旧 UCAS URL 会被误渲染为 `Homepage ↗`）
- [X] T006 [US1] 更新 [src/components/TeacherCard.astro](file:///home/photon/workspace/nlp-home/src/components/TeacherCard.astro) 的链接渲染：解构 `ucasProfile` 与 `homepage`；两种名片共用同一渲染路径，固定顺序为「邮箱（仅 `detailed` 且非空）→ `UCAS Profile ↗` → `Homepage ↗`」，`detailed` 自此只控制邮箱与 bio，不再切换链接文案或数量；`null` / 缺省跳过且 MUST NOT 渲染空 `<a>`、空标签或 `#` 占位；两个网页外链保留 `target="_blank"` 与 `rel="noopener"`，箭头保留 `aria-hidden="true"`，标签文案精确为 `UCAS Profile` / `Homepage`
- [X] T007 [US1] 更新 [src/data/README.md](file:///home/photon/workspace/nlp-home/src/data/README.md) 的教师字段说明：`ucasProfile` 承载 UCAS 个人资料页（`https://` 或 `null`）、`homepage` 承载教师个人主页（`https://` 或 `null`，未配置写 `null`，MUST NOT 填 UCAS 资料页）；说明两字段缺省/`null` 合法、非 HTTPS 构建失败，并同步替换第 79 行仍只提 `homepage` 的字段清单
- [X] T008 [US1] 验证 US1：`npm run build` 后预览 `/team/` 与 `/`，确认两处共 8 张名片各有且仅有 1 个 `UCAS Profile ↗`，分别指向 `~linzheng` / `~fupeng` / `~dayan` / `~0082145`；付鹏在 Team 页依次为「邮箱 → `UCAS Profile ↗` → `Homepage ↗`」、首页为「`UCAS Profile ↗` → `Homepage ↗` 且无邮箱」，`Homepage ↗` 指向 `https://fupeng.ac.cn/`；其余三位不出现 `Homepage`；对照 T003 基线确认首页仅教师名片链接区变化

**Checkpoint**: US1 可独立验收（MVP 可交付）

---

## Phase 4: User Story 2 - 访客通过 Google Scholar 了解无主页学生 (Priority: P1)

**Goal**: 顾树焕、温泽林显示 `Scholar ↗` 并指向本人档案；赵语林及其余 11 位原无链接学生保持三字段全空。

**Independent Test**: `git diff src/data/students.json` 仅新增 2 行 `scholar`；12 位原无链接学生的 `url` / `github` / `scholar` 均为 `null`。

- [X] T009 [US2] 按 [research.md](./research.md) R4 的检索结论（14 位均已检索，不重复检索），在 [src/data/students.json](file:///home/photon/workspace/nlp-home/src/data/students.json) 为顾树焕写入 `"scholar": "https://scholar.google.com/citations?user=Fqk9CMkAAAAJ"`、为温泽林写入 `"scholar": "https://scholar.google.com/citations?user=3gjCYDMAAAAJ"`（两者 `url` / `github` 保持 `null`；MUST NOT 改动这两条记录的其余字段）
- [X] T010 [US2] 验证 US2：确认赵语林、周俊豪、汪嘉、王娅彤、彭诗忠、沈斌、朱祉同、张蓓泽、叶振雷、艾明旭、张蓬月、毛乐平 12 位的 `url` / `github` / `scholar` 全部为 `null`；赵语林 MUST NOT 写入 `https://scholar.google.com/citations?user=77QrjwYAAAAJ`；确认无学生出现两个及以上非空链接字段

**Checkpoint**: US2 可独立验收

---

## Phase 5: User Story 3 - 访客看到真实研究方向而非占位符 (Priority: P1)

**Goal**: 6 位有本人自述来源的学生显示 1–2 个真实方向标签；其余 25 位保留 `["TBD"]`，不填入推测内容。

**Independent Test**: 6 组标签文本与 [data-model.md](./data-model.md) §2.1 完全一致；`grep -c '"TBD"' src/data/students.json` 输出 `25`。

- [X] T011 [US3] 在 [src/data/students.json](file:///home/photon/workspace/nlp-home/src/data/students.json) 替换 6 位学生的 `directions`：杨晨旭 `["Multimodal LLM", "Reinforcement Learning"]`、顾佴彬 `["Efficient LLM", "Post-Training"]`、李雨晴 `["RAG", "Agent Memory"]`、佟政阳 `["LLM"]`、刘曦雨 `["LLM", "Knowledge Editing"]`、李佳睿 `["RAG", "Memory"]`；其余 25 位 MUST 保持 `["TBD"]`；6 位学生均已拥有链接，本任务只改 `directions`，其 `url` / `github` / `scholar` 原值不动；每项 MUST 为非空、非纯空白字符串（013 既有校验）
- [X] T012 [US3] 验证 US3：逐条核对上述 6 组标签的文本、顺序与数量（每位 1–2 项），确认其余 25 条 `directions` 仍为 `["TBD"]`、没有任何学生被填入推测方向

**Checkpoint**: US1、US2、US3 均可独立验收（US2 与 US3 因共用 students.json 须顺序执行）

---

## Phase 6: User Story 4 - 新增链接与标签在支持视口内稳定 (Priority: P2)

**Goal**: 付鹏在 Team 页与首页两张名片上的双链接、以及新增方向标签，在九档视口下不重叠、不截断、不越出卡片、不造成页面横向滚动。

**Independent Test**: 320 / 375 / 480 / 576 / 768 / 1024 / 1280 / 1440 / 1920px 下 `document.documentElement.scrollWidth === window.innerWidth`；两种名片的链接均按整项换行；方向标签在 ≥1024px 不内部换行。

- [X] T013 [US4] 在 [src/components/TeacherCard.astro](file:///home/photon/workspace/nlp-home/src/components/TeacherCard.astro) 的 scoped `<style>` 中为 `.teacher-links a`（不带 `.teacher-card--detailed` 前缀，同时覆盖 Team 详细名片与首页概览名片）增加 `white-space: nowrap;`，使两种名片的链接整项换行、不在 `UCAS` / `Profile` / `Homepage` / 箭头内部断行；MUST NOT 新增固定列宽、Grid 布局、媒体查询或 `overflow-x` 声明，MUST NOT 用页面级 `overflow-x: hidden` 掩盖溢出
- [X] T014 [P] [US4] 九档视口检查 `/team/` Faculty 链接区：逐元素 `getBoundingClientRect()` 对照卡片 padding box 与视口，无元素重叠、无文字截断（`scrollWidth > clientWidth`）、无越出卡片 padding box、`UCAS Profile` / `Homepage` 不在单词内部断行，且 `document.documentElement.scrollWidth === window.innerWidth`；付鹏名片三项链接（邮箱 → UCAS Profile → Homepage）完整可见；按 [quickstart.md](./quickstart.md) §5.4 矩阵逐档记录结果
- [X] T015 [P] [US4] 九档视口检查 `/` 首页 Team 概览名片：逐元素 `getBoundingClientRect()` 无越界；4 张名片各 1 个 `UCAS Profile ↗`，付鹏另有 `Homepage ↗` 且两项完整可见，不出现邮箱；无元素重叠、无文字截断、无越出卡片 padding box、无页面横向滚动；按 [quickstart.md](./quickstart.md) §5.4 记录
- [X] T016 [P] [US4] 九档视口检查在读学生方向标签：逐元素 `getBoundingClientRect()` 无越界；≥1024px 每个标签内部单行（标签元素 `scrollHeight` 等于单行高度）；320–768px 允许标签内部换行但无页面横向滚动、无元素重叠；其余 25 位 `TBD` 的呈现不变；按 [quickstart.md](./quickstart.md) §5.3 记录

**Checkpoint**: 布局稳定性验收完成

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 构建门禁、数据契约探针、链接核对、零 diff 回归与部署验收

- [X] T017 运行 `npm run check` 与 `npm run build`，确认两条命令退出码均为 0，无 schema / 类型错误
- [X] T018 执行 [quickstart.md](./quickstart.md) §4 数据契约探针并逐项恢复：P1 付鹏 `homepage` 临时改为 `http://fupeng.ac.cn/` → 构建失败且报错含 `homepage` 与 https 要求；P2 临时改为 `null` 或删除该键 → 构建通过且付鹏在 Team 页与首页都只剩 `UCAS Profile ↗`；P3 临时删除杨晨旭 `directions` → 构建失败且报错含 `src/data/students.json`、`杨晨旭`、`directions`；P4 付鹏 `ucasProfile` 临时改为 `http://people.ucas.ac.cn/~fupeng` → 构建失败且报错含 `ucasProfile` 与 https 要求；每次恢复原值后重新运行 `npm run build`
- [X] T019 链接落地页核对：Team 页与首页共 8 个 `UCAS Profile ↗` 分别打开 `https://people.ucas.ac.cn/~linzheng`、`~fupeng`、`~dayan`、`~0082145`；付鹏在两处的 `Homepage ↗` 均打开 `https://fupeng.ac.cn/`；顾树焕与温泽林 `Scholar ↗` 打开对应本人档案；所有网页外链在新标签页打开且带 `rel="noopener"`
- [X] T020 回归检查：`git diff --stat` 仅出现 5 个文件（[src/data/teachers.json](file:///home/photon/workspace/nlp-home/src/data/teachers.json)、[src/data/students.json](file:///home/photon/workspace/nlp-home/src/data/students.json)、[src/content.config.ts](file:///home/photon/workspace/nlp-home/src/content.config.ts)、[src/components/TeacherCard.astro](file:///home/photon/workspace/nlp-home/src/components/TeacherCard.astro)、[src/data/README.md](file:///home/photon/workspace/nlp-home/src/data/README.md)）；对 `src/components/StudentGroup.astro`、`src/pages/team.astro`、`src/pages/index.astro`、`src/pages/publications.astro`、`src/data/graduates.json`、`src/data/publications.json`、`src/data/site.json`、`package.json`、`package-lock.json`、`astro.config.mjs`、`tests/news-widgets.test.mjs` 执行 `git diff --exit-code` 无输出；首页仅教师名片链接区相对 T003 基线变化（4 个 `UCAS Profile ↗`、付鹏 1 个 `Homepage ↗`），新闻、发表、Gallery 等其余区块一致；`students.json` 仅含 2 条 `scholar` + 6 条 `directions` 变更，其余 23 条记录零 diff（11 条已有链接 + 12 条三字段全空）；6 位方向变更学生的 `url` / `github` / `scholar` 原值不变，其余 11 位已有链接学生整条记录零 diff
- [X] T021 将 5 个文件作为单一变更集提交（T004 + T005 必须同提交），推送特性分支并创建 PR，PR 说明记录 T004 + T005 原子迁移与单提交理由（Constitution V）；确认 CI 的 check / build 门禁通过后合并；提交信息不添加 AI 共同作者尾注
- [X] T022 部署后检查线上 Team 页与首页：两处各 4 个 `UCAS Profile ↗`、付鹏 `Homepage ↗`、顾树焕与温泽林 `Scholar ↗`、6 组方向标签均正确显示，桌面与移动视口无布局破损

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖，可立即开始
- **Foundational (Phase 2)**: 依赖 T002 的构建产物（预览需先 build）；阻塞 T008、T020 的基线比对
- **User Stories (Phase 3–6)**: 均依赖 Phase 2 完成；按优先级 P1 → P1 → P1 → P2 顺序推进
- **Polish (Phase 7)**: 依赖所有目标用户故事完成

### User Story Dependencies

- **US1 (P1)**: Phase 2 后可开始；不依赖其他故事
- **US2 (P1)**: Phase 2 后可开始；与 US1 不同文件，可并行；与 US3 共用 `src/data/students.json`，MUST 顺序执行
- **US3 (P1)**: Phase 2 后可开始；MUST 在 US2 的 `students.json` 编辑之后执行，避免同文件冲突
- **US4 (P2)**: T013 依赖 T006（同一 `TeacherCard.astro`），应在 T006 之后执行；T014 / T015 / T016 的九档验证依赖 US1（付鹏双链接）与 US3（新方向标签）已落地

### Within Each User Story

- **US1**: T004 与 T005 原子完成（同一提交）→ T006 → T007 → T008
- **US2**: T009 → T010
- **US3**: T011 → T012
- **US4**: T013 → T014 / T015 / T016

### Parallel Opportunities

- T001 与 T002 可并行（T002 为独立命令）
- T014、T015 与 T016 可并行（三项浏览器测量互不依赖）
- US1（teachers.json / content.config.ts / TeacherCard.astro / README.md）与 US2（students.json）文件不重叠，可由不同执行者并行
- US2 与 US3 不可并行：两者修改同一个 `src/data/students.json`

---

## Parallel Example: User Story 1

```bash
# US1 内部：schema 与数据迁移必须原子完成，不可拆分提交
Task: "T004 更新 src/content.config.ts 的 teachers schema"
Task: "T005 迁移 src/data/teachers.json（与 T004 同一提交）"

# 跨故事并行：US1 与 US2 文件不重叠
Task: "T004–T008 US1 教师链接语义（teachers.json / content.config.ts / TeacherCard.astro / README.md）"
Task: "T009–T010 US2 学生 Scholar 补全（students.json）"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational（基线记录）
3. 完成 Phase 3: User Story 1
4. **STOP and VALIDATE**：按 T008 独立验收教师链接语义（Team 页 + 首页共 8 张名片）
5. 可先行演示两页教师名片

### Incremental Delivery

1. Setup + Foundational → 基线就绪
2. US1 → 独立验收 → 可演示（MVP）
3. US2 → 独立验收（2 位学生 Scholar）
4. US3 → 独立验收（6 组真实方向）
5. US4 → 九档视口验收，作为合并前的布局门禁
6. Polish → 构建门禁、契约探针、回归零 diff、PR 合并与部署后验收
7. 每个故事只新增内容、不破坏前一故事，最终一次 PR 交付 5 个文件的完整变更集

---

## Notes

- [P] 任务 = 不同文件、无未完成依赖
- [Story] 标签用于追溯任务与用户故事的对应关系
- 本特性不新增测试文件；测试任务的缺席是 spec / plan 的显式决定，验证按 quickstart 执行
- T004 与 T005 MUST 原子提交：Zod object 会忽略未知键，若只改 schema 不改数据，旧 UCAS URL 会被渲染为 `Homepage ↗`，造成语义错误
- 除 5 个预期文件外，其余文件（含 `StudentGroup.astro`、`team.astro`、`index.astro`、Graduates、发表页、新闻页）MUST 零 diff
- 首页与 Team 页共用 `TeacherCard`，链接标签与顺序 MUST 一致；MUST NOT 给组件新增 props 或复制组件，`detailed` 只控制邮箱与 bio
- 每个检查点均可停下来独立验收；合并前必须通过 `npm run check` + `npm run build`
