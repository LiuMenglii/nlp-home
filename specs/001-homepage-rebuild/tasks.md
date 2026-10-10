---
description: "Task list for 学术主页重建（Homepage Rebuild）"
---

# Tasks: 学术主页重建（Homepage Rebuild）

**Input**: Design documents from `/specs/001-homepage-rebuild/`

**Prerequisites**: plan.md ✓ | spec.md ✓ | research.md ✓ | data-model.md ✓ | contracts/（routes.md、data-files.md）✓ | quickstart.md ✓ | Constitution（`.specify/memory/constitution.md`）✓

**Tests**: 未要求自动化测试（YAGNI）。验证方式：`astro check` + `astro build` 构建期校验 + quickstart.md 手动清单；每个用户故事末尾含验证任务，Polish 阶段全站收口。

**Organization**: 任务按用户故事分组（US1–US5，对应 spec.md 优先级 P1–P5），支持逐故事独立实现与验证。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行（不同文件、无未完成依赖）
- **[Story]**: 所属用户故事（US1–US5；Setup/Foundational/Polish 无故事标签）
- 每条任务含确切文件路径

## Path Conventions

单项目：仓库根即项目根。内容区 `src/data/*.json` + `src/content/news/*.md`（维护者只改这里）；展示区 `src/components/` + `src/pages/` + `src/styles/`。

***

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 项目初始化与基础结构

- [x] T001 Initialize Astro ^7.x 项目（`npm create astro@latest`，minimal 模板、TypeScript strict、零前端框架）：仓库根 package.json（scripts: dev/build/preview/check；devDeps: `@astrojs/check` + `typescript`）、astro.config.mjs（`site: 'https://<org>.github.io'` + `base: '/<repo>'`，仓库名未定时先占位、T041 部署时确认）、tsconfig.json、.gitignore（node_modules/dist/.astro + 排除 2026年招生介绍-G3.pptx）、public/favicon.svg；specs/ 随仓库管理；2026年招生介绍-G3.pptx 仅为制作网页的本地参考资料，MUST NOT 提交至 git（写入本任务的 .gitignore 排除项）
- [x] T002 [P] Create .github/workflows/deploy.yml — CI 部署门禁（FR-013）：触发 push main + workflow_dispatch；permissions contents:read / pages:write / id-token:write；步骤 checkout@v6 → setup-node + `npm ci` + `npx astro check`（类型与 schema 校验，失败即中止）→ withastro/action@v6（构建并上传）→ deploy-pages；校验或构建任一失败则不部署，线上保留上一正常版本
- [x] T003 [P] Create src/styles/global.css — CSS 变量色板（nlp-home-simple：`--ink #102b4e`、`--ink-soft #47627d`、`--blue #1b78bf`、`--blue-deep #07548f`、`--sky #eaf5fc`、`--sky-soft #f5faff`、`--line #cfe1ee`）、Inter 字体栈（系统回退）、1180px 内容容器、卡片式区块基础样式、正文基础字号 ≥18px（参考站 body 字号，FR-019）、流式自适应基础（无横向溢出，FR-014）

***

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 全部用户故事共享的内容管线与布局骨架

**⚠️ CRITICAL**: 本阶段完成前不得开始任何用户故事

- [x] T004 Create src/content.config.ts — 六个 collection（loader + Zod schema，字段约束按 data-model.md）：news（glob loader `**/*.md` base `./src/content/news`；title 非空、date `z.coerce.date()`、summary 非空 ≤200 字符、cover 可选）；publications（file loader `src/data/publications.json`；title 非空、venue 非空、year int 1980–2100、ccf enum A/B/C 可空、url https:// 开头可空、featured 缺省 false、authors 可选）；teachers（name/title 非空、advisorRole enum phd|master、directions ≥1 项、email 邮箱格式可空、homepage https 可空、photo/bio 可空）；students（name 非空、level enum phd|master、grade/url/note 可空）；graduates（name/destination 非空、degree enum phd|master、year int 可空）；gallery（src 为 public/gallery/ 下文件名、禁止 `/` 与 `..`、caption 非空、date 可选；src 构建期存在性校验——`z.refine` + `fs.existsSync('public/gallery/' + src)`，引用缺失文件即构建报错并定位到具体文件与字段，不渲染裂图（spec 边缘用例）；条目 >12 构建报错，FR-017）
- [x] T005 Create 最小合法种子数据（保证 `npm run build` 通过）：src/data/site.json、src/data/teachers.json、src/data/students.json、src/data/graduates.json、src/data/publications.json（2–3 条样本，覆盖含 ccf+url / 无 ccf / 无 url 三种形态）、src/data/gallery.json（1–2 条占位，指向 public/gallery/ 占位 JPEG）、src/content/news/ 1 条样本 .md（frontmatter: title/date/summary）——种子条目在后续故事阶段被真实内容替换
- [x] T006 [P] Create src/components/Navbar.astro — sticky 顶部导航，固定四项 Home / News / People / Publications（contracts/routes.md，SC-001）；窄屏（375px）下不横向溢出
- [x] T007 Create src/components/BaseLayout.astro — HTML 骨架（语义化结构 FR-014）+ meta + 引入 src/styles/global.css 与 Navbar + footer（组名/研究所/联系邮箱）；四个页面共用

**Checkpoint**: Foundation ready — `npm run build` 通过，用户故事实现可以开始

***

## Phase 3: User Story 1 - 主页信息总览 (Priority: P1) 🎯 MVP

**Goal**: 访客打开主页，自上而下浏览六个区块（介绍/招募/新闻概览/人员/代表性 publications/Gallery），一次访问建立课题组完整画像。

**Independent Test**: 打开主页，核对六区块存在性与内容完整性；mailto、老师外部主页、论文外链、lightbox 可用（指向 /news/、/people/、/publications/ 的站内链接在 US2–US4 交付后生效，属预期，见 Dependencies）。

### Implementation for User Story 1

- [x] T008 [P] [US1] Create 真实 src/data/site.json — 内容取自原站 https://iienlp.github.io/ 与仓库根本地参考《2026年招生介绍-G3.pptx》（PPT 仅为参考资料、已入 .gitignore；data-model §7）：groupName（G3 CIGMA，已确认）、institute（中国科学院信息工程研究所 / Institute of Information Engineering, CAS）、directions（自然语言处理、多媒体大数据分析、大模型高效应用）、admissions.targets（面向对象，中文关键信息保留 FR-016）、admissions.skills（Coding/Math/Logic/English）、admissions.email（<linzheng@iie.ac.cn>）、admissions.emailSubject（"XXX-学校-毕业时间-保研/实习申请"格式）
- [x] T009 [P] [US1] Create 真实 src/data/teachers.json — 5 位老师（FR-015，PPT 口径：林政-研究员/博导/NLP·多模态、王伟平-研究员/博导/大数据AI·数据安全（信工所副所长写入其 bio 字段）、付鹏-副研究员/硕导/NLP·大模型高效应用、吴大衍-副研究员/硕导/CV·多模态、谷井子-高级工程师/硕导/CV·多模态检索生成）；职称与研究方向用英文展示（FR-016）；email/homepage 从 UCAS 主页补充；photo 授权前用原站素材（存 public/）或占位图
- [x] T010 [P] [US1] Create Gallery 素材 — 从原站 Gallery 收集组内活动照片，精选 8–12 张存入 public/gallery/（JPEG、单张 ≤500KB、长边 ≤2000px、文件名小写字母+连字符），创建 src/data/gallery.json（每张：src/caption 必填、date 可选）
- [x] T011 [P] [US1] Create src/data/publications.json 代表性子集 — 从 <https://people.ucas.ac.cn/~linzheng> 与 <https://people.ucas.ac.cn/~dayan> 选取 8–12 篇代表性论文（优先 CCF-A），标注 `featured: true`（主页区块按时间降序取 featured 前 8 条、不足按时间最新补齐——时间即 year 字段，data-model §1 派生规则）；全量聚合在 T022 完成
- [x] T012 [P] [US1] Create src/components/SectionHeading.astro — 区块标题组件（主页六区块与各内页共用）
- [x] T013 [P] [US1] Create src/components/Hero.astro — 介绍区块：组名、所属研究所、研究方向总结（读 site.json，FR-002）
- [x] T014 [P] [US1] Create src/components/Admissions.astro — 招募区块：面向对象 + 技能要点 + 联系邮箱（mailto 带 emailSubject 默认主题；中文关键信息保留，FR-003/FR-016）
- [x] T015 [P] [US1] Create src/components/NewsCard.astro — 新闻概览条目：日期 + 标题/摘要，链接 /news/{id}/（FR-004；新闻列表页复用）
- [x] T016 [P] [US1] Create src/components/TeacherCard.astro — 老师卡片：照片/姓名/职称/研究方向；区块含"View all"入口 → /people/，老师外部主页链接 target="_blank" rel="noopener"（contracts/routes.md）
- [x] T017 [P] [US1] Create src/components/CCFBadge.astro — CCF-A/B/C 徽标；无评级不渲染（边缘用例）
- [x] T018 [P] [US1] Create src/components/PublicationItem.astro — 论文条目：标题 + venue + CCFBadge + 链接（展示文字统一 "Link"，target="_blank" rel="noopener"）；url 为空 → 纯文本不可点击（FR-006/FR-011 边缘用例）
- [x] T019 [P] [US1] Create src/components/Gallery.astro — 缩略图网格 + 原生 `<dialog>` lightbox（~30 行 vanilla JS、事件委托：点击缩略图 → `showModal()` 填充大图与 caption；Esc / 关闭按钮 / 点击遮罩三种关闭，FR-017）；collection 为空 → 区块整体不渲染（边缘用例）；caption 兼作缩略图 alt
- [x] T020 [US1] Create src/pages/index.astro — 按 FR-001 顺序组装六区块：Hero → Admissions → 新闻概览（date 倒序前 5 条；空 → 隐藏区块）→ 人员（5 位老师 TeacherCard）→ 代表性 publications（featured 按时间降序取前 8 条 + "View all" → /publications/）→ Gallery（页面底部，publications 之后）
- [x] T021 [US1] 主页验证（src/pages/index.astro）— 六区块顺序与内容完整；mailto 默认主题正确；老师外链/arXiv 外链新标签打开；lightbox 三种关闭方式均有效；四档视口（375 / 768 / 1024 / ≥1280px）无布局破损（判定标准：元素重叠、文字截断、内容溢出容器、非预期换行，SC-006）、无横向溢出

**Checkpoint**: 主页六区块 MVP 完成，可独立验证并部署演示

***

## Phase 4: User Story 2 - 发表全列表 (Priority: P2)

**Goal**: 发表页展示课题组全部论文，按年份分组、CCF 徽标、可跳转 arXiv。

**Independent Test**: 进入 /publications/，核对列表覆盖两位老师 UCAS 主页论文去重合集，每条字段完整（标题/发表地点/评级），抽检外链可达。

### Implementation for User Story 2

- [x] T022 [P] [US2] 全量聚合 src/data/publications.json — 从 https://people.ucas.ac.cn/~linzheng（111 篇）与 https://people.ucas.ac.cn/~dayan（32 篇）抓取论文列表：按标题忽略大小写去重（FR-010）；CCF 评级以 UCAS 主页标注为准（论文发表时的评级；Workshop/poster/short paper 不计入）；预印本与正式版并存以正式版信息为准（标题/venue/年份）；url arXiv 优先、回退 DOI/出版方/scholar、均无则省略（纯文本）；保留 T011 已有 featured 标记；每条书目事实与正式发表版本（DOI / 会议论文集 / 期刊页面）核对，无法核实的条目标记并提请课题组负责人确认，确认后方可上线（FR-010 上线门禁）
- [x] T023 [P] [US2] Create src/pages/publications.astro — 全列表按 year 降序分组 + 年份锚点导航（分组标题 `id="year-{yyyy}"`，纯 HTML 锚点零 JS，research §7）；复用 SectionHeading/PublicationItem/CCFBadge；满足 SC-003：100% 条目含标题+venue、有评级条目 100% 显示徽标
- [x] T024 [US2] 发表页验证（src/pages/publications.astro）— 条目数与去重合集一致；无 CCF 条目无徽标但标题/venue 完整；无 url 条目为纯文本；年份锚点跳转可用；随机抽检 ≥20 条外链可达（主流浏览器可正常打开，SC-003）；无"未核对即上线"条目（FR-010 上线门禁：无法核实条目须已经课题组负责人确认）；四档视口无布局破损

**Checkpoint**: 主页 + 发表页均可独立工作

***

## Phase 5: User Story 3 - 新闻列表与详情 (Priority: P3)

**Goal**: 新闻页按时间倒序展示概要列表，每条新闻有详情页（含配图与简讯支持）。

**Independent Test**: 从 /news/ 点击任意条目，详情页标题、日期与正文和列表一致，正文内相关论文链接可达。

### Implementation for User Story 3

- [x] T025 [P] [US3] Create src/pages/news/index.astro — 概要列表按 date 倒序（复用 NewsCard）；空态显示 "No news yet." 友好占位（contracts/routes.md 空态契约）
- [x] T026 [P] [US3] Create src/pages/news/[id].astro — getStaticPaths ← news collection；渲染 title/date + Markdown 正文；正文配图用相对路径（缺失构建报错，FR-018）；简讯类直接渲染原文（FR-007/FR-008）
- [x] T027 [P] [US3] Create 初始新闻内容 src/content/news/*.md — 自原站新闻条目与近两年论文成果整理 10–20 条（frontmatter：title、date=发布日期手动填写、summary ≤200 字符）；至少含 1 条简讯类 + 1 条含配图类（覆盖边缘用例）；文件名即 slug、不与既有重名
- [x] T028 [US3] 新闻验证（src/pages/news/）— 列表按时间倒序；条目点入详情后标题/日期/正文与列表一致；简讯详情无空白；含图新闻图片正常显示；主页新闻概览同步展示前 5 条；四档视口无布局破损

**Checkpoint**: 主页 + 发表页 + 新闻（列表/详情）均可独立工作

***

## Phase 6: User Story 4 - 人员详情 (Priority: P4)

**Goal**: 人员页展示 5 位老师详细信息、在读学生分组名单与毕业生去向。

**Independent Test**: 核对每位老师信息与权威来源（UCAS 主页、所方官方介绍）一致，在读学生名单与毕业生去向与原始资料一致。

### Implementation for User Story 4

- [x] T029 [P] [US4] Create src/data/students.json 与 src/data/graduates.json — 名单取原站 Team 页与课题组提供名单：在读学生（name、level phd|master、grade、url/note 可选）；毕业生（name、destination 去向单位名用中文展示 FR-016、degree phd|master、year 可选；收录人数不设上限）
- [x] T030 [P] [US4] Create src/components/StudentGroup.astro — 在读学生按 level 分博士生/硕士生两组、组内按 grade 降序（data-model §4）
- [x] T031 [US4] Create src/pages/people.astro — 老师详情区（复用 TeacherCard 展示完整信息：姓名、职称（英文）、研究方向（英文）、email、个人主页 target="_blank" rel="noopener"、bio）+ StudentGroup 在读学生分组 + 毕业生去向列表（FR-009/FR-015/FR-016）；students/graduates 为空时对应分组显示友好占位文案（spec 边缘用例）
- [ ] T032 [P] [US4] 老师信息核对 src/data/teachers.json（Constitution I / SC-005）— 5 位老师与 UCAS 主页（https://people.ucas.ac.cn/~linzheng、https://people.ucas.ac.cn/~dayan 等）及所方官方介绍逐字段核对并修正；联系邮箱真实可用；上线前交课题组老师审阅全站内容（审阅记录不展示在页面上）
- [x] T033 [US4] 人员页验证（src/pages/people.astro）— 5 位老师信息完整且与权威来源一致；学生分组正确；毕业生去向展示；外部主页新标签打开；四档视口无布局破损

**Checkpoint**: 四个主要页面全部交付，全站导航闭环

***

## Phase 7: User Story 5 - 内容维护 (Priority: P5)

**Goal**: 维护者（不熟悉前端）只编辑数据文件即可完成日常内容更新，全程不触碰模板/样式/构建配置。

**Independent Test**: 数据文件中新增一条论文记录，重新构建部署后发表页出现该条目，版本对比确认模板与样式文件零改动。

### Implementation for User Story 5

- [x] T034 [US5] 维护流程验证（SC-004）— 在 src/data/publications.json 追加一条测试论文 → `npm run build` → 发表页出现该条目 → `git status` 确认仅数据文件变更（src/components/、src/pages/、src/styles/、astro.config.mjs、deploy.yml 零改动）→ 移除测试数据
- [x] T035 [US5] 新闻维护验证 — 新建一条测试新闻 src/content/news/test-item.md → `npm run build` → 新闻列表与主页新闻概览同步出现该条目 → 移除测试文件
- [x] T036 [US5] 边缘用例验证 — ① 清空 src/data/gallery.json → 构建后主页 Gallery 区块隐藏、不留空白区块 → 恢复；② src/data/gallery.json 填入 13 条 → 构建报错（上限 12 由 schema 强制，FR-017）→ 恢复；③ 删除 src/data/publications.json 某条的 venue 字段 → 构建失败且错误定位到具体文件与字段名（spec 边缘用例"构建阶段明确报错"）→ 恢复；④ src/data/gallery.json 某条 src 填入 public/gallery/ 中不存在的文件名 → 构建失败且错误定位到具体文件与字段名（不渲染裂图，spec 边缘用例）→ 恢复
- [ ] T037 [US5] Create 维护者文档 src/data/README.md（Constitution II / FR-020）— 面向不熟悉前端的维护者：字段约定（对齐 data-model.md 各节）、常见更新流程（新增论文/新闻/成员变动/更换照片，对齐 contracts/data-files.md 映射表与示例）、图片资产约定（JPEG ≤500KB/长边 ≤2000px/Gallery ≤12 张）、本地构建与推送部署流程（CI 门禁：构建失败不上线）

**Checkpoint**: 内容与展示分离（Constitution II / FR-012 / SC-004）经端到端验证成立

***

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: 跨故事收口验证与部署

- [ ] T038 [P] 全站响应式审查 — 主页 / 新闻列表 / 新闻详情 / 人员 / 发表页 × 四档视口（375 / 768 / 1024 / ≥1280px）逐页核查：无布局破损（元素重叠、文字截断、内容溢出容器、非预期换行）、无横向溢出、导航可用（FR-014/SC-006）
- [ ] T039 [P] 全站导航与外链验证（SC-001/SC-003）— 从四个页面各出发一次，1 次点击可达其余三页；外链（老师主页/论文链接）抽查 ≥20 条全部可达
- [ ] T040 [P] 性能核查（SC-002 方向性目标）— DevTools Network：除 Gallery lightbox 小脚本外无其他 JS；public/gallery/ 图片符合 ≤500KB 约定；主页典型宽带下 3 秒内首屏
- [ ] T041 部署与 CI 门禁验证（FR-013）— GitHub 仓库 Settings → Pages → Source 设为 GitHub Actions；确认 astro.config.mjs 的 site/base 与实际仓库一致；push main → Actions 全绿 → 访问 https://<org>.github.io/<repo>/ 线上抽查；再按 quickstart.md「CI 门禁验证」：故意删除某论文 venue 字段并推送 → 构建失败、部署未执行、线上保持上一正常版本 → 恢复后推送部署成功
- [ ] T042 运行 quickstart.md 完整验证 — 按 specs/001-homepage-rebuild/quickstart.md 全清单逐项验证并勾选（覆盖 SC-001–SC-006 与全部边缘用例）

***

## Dependencies & Execution Order

### Phase Dependencies

- **Setup（Phase 1）**: 无依赖，立即开始
- **Foundational（Phase 2）**: 依赖 Phase 1 — **阻塞全部用户故事**
- **US1（Phase 3）**: 依赖 Phase 2 — 🎯 MVP
- **US2 / US3 / US4（Phase 4–6）**: 各依赖 US1（复用其组件与数据文件结构）；三者彼此独立，US1 之后原则上可并行（不同页面/文件）
- **US5（Phase 7）**: 依赖 US2 + US3（维护验证涉及发表页与新闻页）
- **Polish（Phase 8）**: 依赖全部故事完成

### User Story Dependencies

- **US1**: Phase 2 后即可开始，无其他故事依赖。注意：主页内指向 /news/、/people/、/publications/ 的链接在对应页面交付前为 404，属预期；SC-001 全站导航完备在 Polish 阶段统一验证
- **US2**: 依赖 US1（PublicationItem / CCFBadge / SectionHeading 组件与 publications.json 初始结构）
- **US3**: 依赖 US1（NewsCard 组件、主页新闻概览入口）
- **US4**: 依赖 US1（TeacherCard 组件、teachers.json）
- **US5**: 依赖 US2 + US3；与 US4 无依赖

### Within Each User Story

- 数据任务先行（[P] 并行）→ 组件任务（[P] 并行）→ 页面组装（汇总任务）→ 验证任务收尾
- 无自动化测试；故事级验证 = `npm run build` + 手动清单（对齐 quickstart.md 对应小节）
- 内容准备任务（T008–T011、T022、T027、T029）直接服务 Constitution I（内容准确性）：一律以权威来源为准，不确定信息先向课题组确认

### Parallel Opportunities

- Setup：T002 ∥ T003
- Foundational：T006 与 T004/T005 并行（T007 需等 T006）
- US1：T008–T011（数据）与 T012–T019（组件）共 12 项全部可并行；T020 汇总、T021 验证
- US2：T022 ∥ T023
- US3：T025 ∥ T026 ∥ T027
- US4：T029 ∥ T030 ∥ T032（T031 需等 T030）
- Polish：T038 ∥ T039 ∥ T040

***

## Parallel Example: User Story 1

```bash
# 数据与组件任务全部并行（不同文件、互不依赖）：
Task: "T008 Create src/data/site.json"
Task: "T009 Create src/data/teachers.json"
Task: "T010 Create public/gallery/ photos + src/data/gallery.json"
Task: "T011 Create src/data/publications.json featured subset"
Task: "T012–T019 Create components (SectionHeading/Hero/Admissions/NewsCard/TeacherCard/CCFBadge/PublicationItem/Gallery)"

# 汇总（等待以上全部完成）：
Task: "T020 Assemble src/pages/index.astro"
# 验证：
Task: "T021 Homepage validation"
```

***

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational（CRITICAL — 阻塞全部故事）
3. Complete Phase 3: US1
4. **STOP and VALIDATE**: 主页六区块 + lightbox + 外链独立验证（T021）
5. 可先部署演示（导航仅 Home 可用属预期）

### Incremental Delivery

1. Setup + Foundational → 基础就绪
2. <br />
   - US1 → 主页 MVP → 验证（T021）
3. <br />
   - US2 → 发表页 → 验证（T024）
4. <br />
   - US3 → 新闻 → 验证（T028）
5. <br />
   - US4 → 人员页 → 全站导航闭环 → 验证（T033）
6. <br />
   - US5 → 维护流程验证与维护者文档（T034–T037）
7. Polish → 全站收口 + 部署 + CI 门禁验证（T038–T042）

### Parallel Team Strategy

US2 / US3 / US4 在 US1 完成后可由不同实施者并行（不同页面与文件）；单实施者按 P1 → P2 → P3 → P4 → P5 顺序执行。

***

## Notes

- [P] 任务 = 不同文件、无未完成依赖
- [Story] 标签映射 spec.md 用户故事，便于追溯
- 每个故事完成后在 Checkpoint 停下独立验证，再进入下一优先级
- 每个任务或逻辑分组完成后小步提交（Constitution V）
- 避免事项：模糊任务、同文件并行冲突、破坏故事独立性的跨故事依赖

