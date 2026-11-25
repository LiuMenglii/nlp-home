---

description: "Task list for 015-content-structure-reorg"
---

# Tasks: 项目内容结构重构（可维护内容与源码分离）

**Input**: Design documents from `/specs/015-content-structure-reorg/`

**Prerequisites**: plan.md（必需）、spec.md（用户故事）、research.md、data-model.md、contracts/content-layout.md、contracts/validation.md、quickstart.md

**Tests**: 本特性未要求新增自动化测试，故不生成测试任务。一致性验证以构建产物比对、字段比对与浏览器逐页核对承担（见 US3 与 Polish）。

**Organization**: 任务按用户故事分组，每个故事可独立实现与验证。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行（不同文件、无未完成依赖）
- **[Story]**: 所属用户故事（US1 / US2 / US3 / US4）
- 所有任务均含确切文件路径或可执行命令

## Path Conventions

单 Astro 项目：内容区 `content/`（仓库根）、源码 `src/`、静态品牌资源 `public/`、校验与文档 `docs/`、测试 `tests/`。

---

## Phase 1: Setup（基线准备）

**Purpose**: 保存迁移前基线，供后续逐项比对与回滚。

- [X] T001 在仓库根 `/home/photon/workspace/nlp-home` 建立迁移基线：确认为干净工作区；运行 `npm run check`、`npm run build`、`node --test tests/news-widgets.test.mjs` 并记录全部通过；执行 `cp -a dist /tmp/nlp-dist-before`；记录 `find dist/news -name index.html | sort` 的 4 个新闻 URL 与内容计数（教师 4、Gallery 12、学生 31、毕业生 13、论文 135、新闻 4）
- [X] T002 [P] 保存迁移前内容快照到 `/tmp`（不提交）：`git show HEAD:src/data/teachers.json > /tmp/teachers-before.json`、`git show HEAD:src/data/gallery.json > /tmp/gallery-before.json`、复制 4 篇新闻正文到 `/tmp/news-before/`、`sha256sum public/gallery/* public/teachers/* > /tmp/assets-before.sha256`

**Checkpoint**: 基线构建与快照就绪，可随时比对或回滚。

---

## Phase 2: Foundational（阻塞性前置：数据集与新闻进入 `content/`）

**Purpose**: 建立唯一内容区并迁移无图片数据集与新闻；完成后构建恢复绿色，才可开始各用户故事。

**⚠️ CRITICAL**: 本阶段完成前不得开始 US1–US4 的实现任务。

- [X] T003 创建内容区骨架：`content/`、`content/news/`、`content/teachers/`、`content/gallery/`
- [X] T004 [P] 用 `git mv` 迁移结构化数据集到内容区：`src/data/site.json`、`src/data/students.json`、`src/data/graduates.json`、`src/data/publications.json` → `content/` 同名文件（内容零改动）
- [X] T005 [P] 用 `git mv` 迁移新闻与配图：`src/content/news/*.md`（4 篇）与 `copd-method.png`、`npo-overview.png`、`rlsd-method.png` → `content/news/`（保留相对路径，文件名不变）
- [X] T006 更新 `src/content.config.ts` 的路径常量与 loader 指向新位置：`SITE_DATA_FILE` → `content/site.json`、`STUDENTS_DATA_FILE` → `content/students.json`、`FEATURED_NEWS_FILE` → `content/news/self-taught-rlvr-2026.md`；news 的 `glob` base → `./content/news`；publications / students / graduates 的 `file()` → `content/publications.json`、`content/students.json`、`content/graduates.json`（本步只改路径，报错文案统一在 T028 改写）
- [X] T007 [P] 更新 9 处 `site.json` import 路径：`src/components/Navbar.astro`、`src/components/BaseLayout.astro`、`src/components/Hero.astro`、`src/components/Admissions.astro` → `../../content/site.json`；`src/pages/index.astro`、`src/pages/team.astro`、`src/pages/publications.astro` → `../content/site.json`；`src/pages/news/index.astro`、`src/pages/news/[...id].astro` → `../../content/site.json`
- [X] T008 [P] 更新 `astro.config.mjs`：`NEWS_DIR` 由 `./src/content/news/` 改为 `./content/news/`，同步注释；不改变 `site` / `base` 与插件逻辑
- [X] T009 运行 `npm run check` 与 `npm run build`，确认数据集与新闻迁移后构建通过（Gallery / 教师仍走旧 JSON 与 `public/` 资源），并确认 `dist/news` 下仍有原 4 个 URL

**Checkpoint**: 数据集与新闻已在 `content/`，构建恢复绿色，用户故事可在其上展开。

---

## Phase 3: User Story 1 - 维护者在一个内容区完成日常更新 (Priority: P1)

**Goal**: 内容区提供唯一维护入口；数据集与新闻只在 `content/` 维护，维护者新增新闻无需改源码。

**Independent Test**: 只修改 `content/` 新增一篇测试新闻，`npm run build` 成功且 `/news/<slug>/` 与列表出现；删除后构建恢复；源码改动文件数为 0。（教师与照片的新增流程依赖 US2 的条目结构，在 T021 一并复验。）

### Implementation for User Story 1

- [X] T010 [US1] 将 `src/data/README.md` 改写迁移为 `content/README.md`（`git mv` 后重写）：列为唯一维护指南，说明 7 类内容位置（`site.json`、`students.json`、`graduates.json`、`publications.json`、`news/`、`teachers/`、`gallery/`）、字段表、新增 / 替换 / 删除步骤、图片规则与 `npm run build` 校验方式；旧路径字样清零
- [X] T011 [P] [US1] 更新 `docs/news-markdown-guide.md` 中 2 处 `src/content/news/` → `content/news/`（第 3 行与第 117 行），其余控件语法与限制不变
- [X] T012 [US1] 新闻维护冒烟测试（临时分支 / 临时副本，完成后还原）：在 `content/news/` 新建 `smoke-test.md`（合法 `title` / `date` / `summary`）→ `npm run build` → 确认 `dist/news/smoke-test/index.html` 生成且新闻列表出现 → 删除文件后重新构建恢复；确认源码改动文件数为 0
- [X] T013 [US1] 清理旧位置并审计：删除空的 `src/content/` 目录；确认 `src/data/` 仅剩 `teachers.json`、`gallery.json`（由 US2 处理）；运行 `grep -rn "src/content/news/\|src/data/site.json\|src/data/students.json\|src/data/graduates.json\|src/data/publications.json" src docs astro.config.mjs` 应只剩 T006 尚未改写的报错文案（若已含则记录，留待 T028 清零）

**Checkpoint**: 内容区可作为唯一维护入口；新闻新增流程无需源码改动。

---

## Phase 4: User Story 2 - 图片与说明就近，不再跨目录对照 (Priority: P1)

**Goal**: Gallery 与教师改为「一条目一目录」，图片与 caption / 成员信息同目录；新闻配图与正文同目录；页面展示不变。

**Independent Test**: 12 个 Gallery 条目与 4 个教师条目中，图片与全部说明位于同一目录；替换任一条目图片后构建，仅该条目展示变化，其余条目与顺序不变。

### Implementation for User Story 2

- [X] T014 [P] [US2] 按迁移前 `gallery.json` 数组顺序创建 12 个 Gallery 条目目录，每个 `index.md` 写入 frontmatter `image: ./<原文件名>`、`caption` 原值、可选 `date`（值必须是带引号字符串，如 `"2026-11"`、`"2024-06-23"`），并用 `git mv public/gallery/<原文件名> content/gallery/<目录>/<原文件名>` 迁入原图；目录顺序：`01-emnlp-2025-suzhou`、`02-emnlp-2026`、`03-team-building-2026-1`、`04-team-building-2026-2`、`05-acl-2025`、`06-ccac-2025`、`07-4th-large-model-generation-conference`、`08-new-year-celebration`、`09-ccac-2024`、`10-yssnlp-2024`、`11-team-building-2024`、`12-yanqi-lake-library`
- [X] T015 [P] [US2] 按迁移前 `teachers.json` 数组顺序创建 4 个教师条目目录 `content/teachers/01-lin-zheng`、`02-fu-peng`、`03-wu-dayan`、`04-gu-jingzi`，每个 `index.md` frontmatter 写入全部原值（`name`、`title`、`advisorRole`、`directions`、`email`、`ucasProfile`、`homepage`、`bio`），`photo: ./<原文件名>`；用 `git mv public/teachers/<file>.svg` 迁入对应目录
- [X] T016 [US2] 改造 `src/content.config.ts` 的 gallery collection：loader 改为 `glob({ pattern: '*/index.md', base: './content/gallery' })`；schema 改为 `({ image }) => z.object({ image: image(), caption: z.string().min(1), date: z.string().optional() })`；删除 `gallery.json` 的 `file()` loader、`GALLERY_DATA_FILE`、`GALLERY_ASSET_DIR` 与旧 `src` 路径校验、旧 12 条上限校验（条目审计在 US4 重建）
- [X] T017 [US2] 改造 `src/content.config.ts` 的 teachers collection：loader 改为 `glob({ pattern: '*/index.md', base: './content/teachers' })`；保留 `name` / `title` / `advisorRole` / `directions` / `email` / `ucasProfile` / `homepage` / `bio` 字段规则；`photo` 改为 `image().nullable().optional()`；删除 `teachers.json` 的 `file()` loader、`TEACHER_ASSET_DIR` 与旧 photo 路径校验（条目审计在 US4 重建）
- [X] T018 [P] [US2] 更新 `src/components/Gallery.astro`：缩略图 `<img src>` 与 `data-gallery-src` 改用 `photo.data.image.src`，移除 `withBase` 的 import 与调用；模板结构、class、灯箱脚本与 CSS 不变
- [X] T019 [P] [US2] 更新 `src/components/TeacherCard.astro`：`<img src={photo.src}>`，移除 `withBase` 的 import 与调用；模板结构、class、`width` / `height` 与 CSS 不变
- [X] T020 [US2] 删除旧位置残留：`src/data/`（此时仅 `teachers.json`、`gallery.json`）、`public/gallery/`、`public/teachers/`；确认 `public/` 仅剩 `logo.svg`、`favicon.svg`，`content/` 内无重复副本
- [X] T021 [US2] 构建与维护冒烟验证：`npm run check`、`npm run build` 通过；确认 Gallery 12 条按 `01`–`12` 渲染、教师 4 位按 `01`–`04` 渲染，图片输出为带 `/nlp-home` 前缀的 `_astro` 资源；临时分支中替换 `content/gallery/01-emnlp-2025-suzhou/` 图片文件并新增 `content/teachers/05-test-teacher/`（合法 frontmatter + 照片），构建后仅对应位置变化且新教师排在末位，随后删除并重建恢复

**Checkpoint**: 图片与说明同目录；12 张照片与 4 位教师完全由 `content/` 条目驱动，展示不变。

---

## Phase 5: User Story 3 - 访客看到与重构前完全一致的站点 (Priority: P1)

**Goal**: 页面内容、数量、顺序、链接与图片与迁移前一致；4 个新闻 URL 不变；无裂图与布局破损。

**Independent Test**: 比对迁移前后构建产物与页面：Gallery 12、教师 4、学生 31、毕业生 13、论文 135、新闻 4；新闻 URL 零变化；所有图片可加载。

### Verification for User Story 3

- [X] T022 [US3] 比对新闻 URL 与页面数量：`find dist/news -name index.html | sort` 与 `/tmp/nlp-dist-before/news` 清单做 diff（期望 4 个 URL 完全一致）；`find /tmp/nlp-dist-before -name index.html | wc -l` 与 `find dist -name index.html | wc -l` 相等
- [X] T023 [US3] 字段与顺序比对（一次性脚本，不提交）：解析 `content/gallery/*/index.md` 与 `/tmp/gallery-before.json`，逐条比对 caption、date、图片文件名与顺序完全相等；解析 `content/teachers/*/index.md` 与 `/tmp/teachers-before.json`，比对 `name` / `title` / `advisorRole` / `directions` / `email` / `ucasProfile` / `homepage` / `bio` 与照片文件名；比对 `content/{students,graduates,publications}.json` 与基线快照的条目数、字段值与顺序；比对 4 篇新闻正文文本与配图引用
- [X] T024 [US3] 图片可访问性审计：提取 `dist/**/*.html` 中所有 `<img src>` 与 `data-gallery-src`，确认站内资源均以 `/nlp-home/` 开头且在 `dist` 中存在对应文件；确认无旧的 `/gallery/`、`/teachers/` 资源引用；输出无 `MISSING` / `UNEXPECTED`
- [X] T025 [US3] 浏览器逐页核对（`npm run dev` 或 `npm run build && npm run preview`）：首页（4 位教师名片、12 张 Gallery 与灯箱开合 / 左右切换 / ESC、8 条代表性论文、新闻概览）、Team（4 位教师、31 位学生、13 位毕业生）、Publications（135 条与筛选 / CCF 徽标）、News 列表与 4 篇详情（配图 3 篇、高亮 / BibTeX / 表格控件）；在 320 / 375 / 480 / 576 / 768 / 1024 / 1280 / 1440 / 1920px 九档视口确认无元素重叠、文字截断、内容溢出与横向滚动

**Checkpoint**: 页面与重构前逐项一致，无裂图、无 URL 变化、无布局破损。

---

## Phase 6: User Story 4 - 构建校验在新结构下继续拦截内容错误 (Priority: P2)

**Goal**: 全部既有校验在新结构下生效，报错指向 `content/` 的文件 / 条目 / 字段与修复方向。

**Independent Test**: 按 quickstart §9 构造违约输入，每项均构建失败且报错指向内容区文件与字段，恢复后构建通过。

### Implementation for User Story 4

- [X] T026 [US4] 在 `src/content.config.ts` 增加 Gallery 模块加载期条目审计：目录名匹配 `^\d{2}-[a-z0-9-]+$`；每个条目目录必须含 `index.md`；条目总数 ≤12；`image` 必须为 `./文件名`（禁止 `/`、`..`、子目录）且同目录文件存在；`caption` 非空；`date` 有值时必须是字符串；报错包含 `content/gallery/<id>/index.md`、字段与修复提示
- [X] T027 [US4] 在 `src/content.config.ts` 增加教师条目审计：目录命名规则同上；每个条目目录必须含 `index.md`；`photo` 有值时必须是 `./文件名` 且同目录存在（缺失 / 含 `/` / `..` 即失败），`null` 或缺省合法；报错包含 `content/teachers/<id>/index.md` 与字段
- [X] T028 [US4] 统一改写 `src/content.config.ts` 全部报错路径与文案为 `content/`：`validateSiteBrand` → `content/site.json`（含 logo / favicon 指向 `public/` 的提示）；`validateStudentsData` → `content/students.json`；`validateFeaturedNews` → `content/news/self-taught-rlvr-2026.md`；`jsonArrayParser` 的 `dataFile` 前缀 → `content/`；`singleLinkRefiner('content/students.json')` / `singleLinkRefiner('content/graduates.json')`；错误载体 `_jsonParseError` 文案同步
- [X] T029 [US4] 核对新闻相关校验文案：`src/content.config.ts` 的 news schema（`title` / `date` / `summary` 长度）与 `astro.config.mjs` 的 `newsWidgetsValidation` 报错必须定位到 `content/news/<file>.md`（含行号，若有）；确认无 `src/content/news/` 残留
- [X] T030 [US4] 负向抽检（临时分支，逐项还原）：删除某 Gallery 条目图片 → 失败指向 `image`；复制第 13 个 Gallery 条目 → 失败并提示上限 12；教师 `photo: ./missing.svg` → 失败；教师 `photo: /teachers/x.svg` 或 `../x.svg` → 失败；删除 `content/site.json` 的 `logo` → 失败；新闻写入未闭合 `:::highlight` → 失败并指文件与行号；某学生同时填 `url` 与 `github` → 失败；某论文填 `date` 不填 `url` → 失败；逐项确认报错含 `content/` 且无旧路径
- [X] T031 [US4] 旧路径审计：`grep -rn "src/data/\|src/content/news/\|public/gallery/\|public/teachers/" src content docs astro.config.mjs package.json .github` 无输出（`specs/` 历史文档除外）

**Checkpoint**: 校验体系完整迁移，报错可操作且全部指向 `content/`。

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 最终门禁与交付核对。

- [X] T032 [P] 全量门禁：`npm run check`、`npm run build`、`node --test tests/news-widgets.test.mjs` 全部通过；确认 `.github/workflows/deploy.yml` 与 `package.json` 未改动
- [X] T033 按 quickstart §8 完成内容编辑冒烟测试（临时分支）：新增一篇新闻、新增一位教师、替换一张 Gallery 图片、修改学生 / 毕业生 / 论文各一个非关键字段，每次 `npm run build` 通过且仅对应展示变化；源码改动文件数为 0；完成后全部还原
- [X] T034 交付核对：`find content -type f` 清单符合 plan 结构（12 Gallery 条目、4 教师条目、4 新闻 + 3 配图、4 JSON + `README.md`）；`find public -type f` 仅 `logo.svg`、`favicon.svg`；`find content -type f \( -name '*.astro' -o -name '*.ts' -o -name '*.css' -o -name '*.js' -o -name '*.mjs' \)` 为 0；`git status --short` 仅包含预期变更，无 `dist/` 或临时文件

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖，先执行
- **Foundational (Phase 2)**: 依赖 Setup 基线；**阻塞**所有用户故事
- **US1 (Phase 3)**: 依赖 Foundational 完成
- **US2 (Phase 4)**: 依赖 Foundational 完成；与 US1 无文件冲突，可按序执行
- **US3 (Phase 5)**: 依赖 US1 与 US2 的实现任务完成（需要完整迁移后的构建产物）
- **US4 (Phase 6)**: 依赖 US2 的条目模型（T016 / T017），并需在 US3 验收前保证校验不误报
- **Polish (Phase 7)**: 依赖 US1–US4 全部完成

### User Story Dependencies

- **US1 (P1)**: Foundational 完成后即可开始；新闻新增流程独立可测；教师 / 照片流程依赖 US2，在 T021 复验
- **US2 (P1)**: Foundational 完成后即可开始；条目结构与组件来源改造必须同批完成（T016–T019）后再构建
- **US3 (P1)**: 依赖 US1 + US2 的产物；只做比对与验收，不改代码
- **US4 (P2)**: 依赖 US2 的 `content/` 条目结构；T026–T029 改同一文件 `src/content.config.ts`，须串行

### Within Each User Story

- 内容条目创建（T014 / T015）先于 collection 改造（T016 / T017）
- collection 改造先于组件图片来源改造（T018 / T019）
- 组件改造完成后再删除旧目录并构建（T020 / T021）
- 校验实现（T026–T029）先于负向抽检（T030）与审计（T031）

### Parallel Opportunities

- T004 与 T005（不同目录的 `git mv`）
- T007 与 T008（不同文件）
- T010 与 T011（不同文档）
- T014 与 T015（Gallery / 教师条目互不依赖）
- T018 与 T019（两个不同组件）
- T032 与 T033/T034 中的文档核对部分可并行；T033、T034 需在 T032 之后串行复核

---

## Parallel Example: User Story 2

```bash
# 并行创建两类条目（互不依赖）：
Task: "T014 创建 content/gallery/01..12 条目并迁入图片"
Task: "T015 创建 content/teachers/01..04 条目并迁入照片"

# 条目就绪后并行修改两个组件：
Task: "T018 Gallery.astro 改用 photo.data.image.src"
Task: "T019 TeacherCard.astro 改用 photo.src"
```

---

## Implementation Strategy

### MVP First（US1 + US2 + US3，均为 P1）

1. 完成 Phase 1 Setup 与 Phase 2 Foundational
2. 完成 US1：维护指南与新结构下的新闻维护流程
3. 完成 US2：Gallery / 教师条目化与图片来源改造
4. 完成 US3：构建产物与页面一致性验收（**STOP and VALIDATE**）
5. 通过后进入 US4 校验迁移与 Polish

### Incremental Delivery

1. Foundational → 数据集与新闻先落位，构建保持绿色
2. US1 → 唯一维护入口可用（新闻增量可独立演示）
3. US2 → 图片与说明就近（Gallery / 教师增量可独立演示）
4. US3 → 证明「访客看到完全一致」
5. US4 → 恢复全部校验拦截能力，最后跑全量门禁

### Notes

- `[P]` 任务 = 不同文件、无未完成依赖
- 所有迁移用 `git mv` 保留文件历史；内容值零改动
- 每次删除旧目录前先确认无重复副本
- 负向抽检与冒烟测试均在临时分支 / 临时副本执行，完成后还原，避免污染工作区
- 报错文案统一以 `content/` 开头；`specs/001`–`014` 历史路径不回溯改写
