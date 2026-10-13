# Tasks: Team 页布局优化与移动端修复（Team Page Polish）——rev2

**Input**: Design documents from `/specs/002-team-page-polish/`

**Prerequisites**: plan.md ✅（rev2）、spec.md ✅（2026-10-12 两轮澄清回填）、research.md ✅（rev2，含 R8 链接列设计、R9 排序比较器）、data-model.md ✅（rev2）、contracts/team-layout.md ✅（rev2）、quickstart.md ✅（rev2）

**Tests**: 未要求自动化测试（research R5：纯 CSS 排版 + 最小数据扩展，不引入 e2e/视觉回归框架）。验收 = 机器门禁（`npm run check` + `npm run build`）+ quickstart.md 四档视口手动矩阵（375 / 768 / 1024 / ≥1280px，浏览器 DevTools 响应式模式），各故事阶段含对应手动验收任务。

**Organization**: 本版为 2026-10-12 rev2 再生成（spec 第二轮澄清回填：毕业生 `url` 字段与三条已核实取值、Graduates 五列布局与 FR-011 链接列、FR-012 排序、FR-004 适用范围拓展）。**rev1（T001–T021 + 合并后线上抽查）已合入 `main`**——US1 移动端修复、US4 教师卡片换行、`github` 字段与学生 `url→github` 迁移、Graduates 三列对齐初版均已在库，本 rev 无新增实现任务、仅由 Polish 阶段统一复验；rev1 任务清单与验收注记见本文件 git 历史。任务编号自 T001 重排；上一版 Phase 8 收敛项映射：T022 → 本版 T006、T023 → 本版 T010。FR-004 分档阈值以 spec FR-004 为唯一规范源，本文一律引用不复述具体数值（spec Assumptions）。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行执行（不同文件、无未完成依赖）
- **[Story]**: 所属用户故事（US2/US3）；Setup / Foundational / Polish 阶段无故事标签
- 描述含精确文件路径

## Path Conventions

- 单项目结构：`src/`、`specs/` 位于仓库根目录
- rev2 src 层改动 4 个文件：`src/pages/team.astro`、`src/components/StudentGroup.astro`、`src/content.config.ts`、`src/data/graduates.json`
- 文档同步 1 处：`specs/001-homepage-rebuild/data-model.md`（§5 Graduate 字段表补 `url` 行 + `github` 行说明更新 + FR-012 渲染排序派生说明）
- 回归验证对象：`src/pages/index.astro`（零改动，仅验证）
- 零改动：`src/data/teachers.json`、`src/data/students.json`、`astro.config.*`、`package.json` / `package-lock.json`、`.github/workflows/deploy.yml`；零新增 JS 与运行时依赖（FR-008 / 契约 §6）

---

## Phase 1: Setup（共享基础设施）

**Purpose**: 特性分支与改动前基线确认

- [X] T001 从 `main` 创建并切换到特性分支 `002-team-page-polish`（repo root，git；若同名旧分支已存在则基于 `main` 重建）。工作区已含本特性 rev2 设计文档更新（`specs/002-team-page-polish/` 下六个设计文档 + 本 tasks.md），随分支携带、与实现改动按 Constitution V 小步提交入库
- [X] T002 在 repo root 执行 `npm run check && npm run build`，确认改动前基线门禁通过（任何后续失败才可归因于本 rev 改动；rev1 已合入 main，main 应为绿）

**Checkpoint**: 分支就绪、基线绿

---

## Phase 2: Foundational（阻塞性前置）

**Purpose**: 跨故事共享的数据层最小扩展（rev2）——`graduates` 的 `url` 字段同时服务 US2 的链接列（`Homepage↗` 标签）与五列结构的字段完整性；schema、数据取值、维护者文档三处同步就绪，置于 Foundational 以消除 US2 内部的数据↔展示耦合（多故事共享实体 → Foundational 阶段）

- [X] T003 [P] 在 `src/content.config.ts` 扩展 `graduates` schema（FR-006(b) 唯一新 schema 改动）：`z.object` 内新增可选字段 `url: httpsUrl`（个人主页链接，与学生字段命名一致）——复用既有 `httpsUrl` 校验器（合法 URL + MUST `https://` 开头 + optional/nullable，Constitution：外部链接 MUST HTTPS）；其余 collection 与字段零改动（`students.github` / `graduates.github` 已在库，`teachers` 不加任何字段）。字段约定见 `specs/002-team-page-polish/data-model.md` §校验规则变更
- [X] T004 在 `src/data/graduates.json` 填入三条已核实个人主页取值（FR-006(b) / data-model.md §Graduate / spec Assumptions，URL 逐字不变、Constitution I）：佀庆一 → `"url": "https://phoebussi.github.io/"`、杨泽娴 → `"url": "https://ccds.fzu.edu.cn/info/1204/11629.htm"`、刘源鑫 → `"url": "https://llyx97.github.io/"`；谭宇彤、温哲暂无主页，`url` 不填（可空字段缺失不填）；`github` 现值均为空、字段为导入完整名单预留；其余字段与条目零改动（`teachers.json` / `students.json` 不触碰）。依赖 T003（schema 先接受 `url`，再写入取值）
- [X] T005 [P] 维护者文档同步（Constitution II：数据文件 MUST 有清晰的字段约定）：`specs/001-homepage-rebuild/data-model.md` §5 Graduate（graduates.json）字段表——① 补一行 `url`（类型 string (url)、必填 ✗、校验 https、说明：个人主页（可选，与学生字段命名一致；非空时于链接列渲染 `Homepage↗` 独立标签））；② 同步更新既有 `github` 行说明：由"非空时去向文字后渲染 `GitHub↗` 独立标签"（rev1 内联口径，已过时）改为"非空时于链接列集中渲染 `GitHub↗` 独立标签"（FR-011 rev2 口径）；③ 该节补渲染排序派生说明：渲染时按 FR-012 排序（毕业年份降序 → 同年份 PhD 在 Master 前 → 无年份条目最后组内 PhD 在前 → 稳定排序），与 graduates.json 条目顺序无关。字段参考源：`specs/002-team-page-polish/data-model.md` §Graduate（001 contracts/data-files.md 指向该文件作为字段参考）

**Checkpoint**: 数据层与字段文档就绪（`npm run check` 绿），用户故事实现可以开始

---

## Phase 3: User Story 1 - 移动端完整浏览教师卡片 (Priority: P1) ✅ 已合入（rev1）

**Status**: rev1 已实现并合入 `main`（`src/pages/team.astro` 教师网格 `min(420px, 100%)` 修复 + `TeacherCard.astro` detailed 标签 `nowrap` 移除，US1 验收通过）。rev2 无新增实现任务——375 / 768px 教师卡片完整可见性随 Phase 7 T013 整页四档终检一并复验（SC-002）。

---

## Phase 4: User Story 3 - 在读学生列表空间利用 (Priority: P2)

**Goal**: 四档验收视口（375 / 768 / 1024 / ≥1280px）下在读学生条目两端分布的中间间隙收敛达标——两侧内容朝中间收拢（姓名自分组左缘内收、Since/备注自分组右缘内收），消除 rev1 两端分布遗留的中间间隙超标（上一版 converge 指认项 T022）

**Independent Test**: 四档验收视口浏览学生分组，任一条目两端分布中间间隙与内容右端连续空白均满足 FR-004 分档阈值；带 `GitHub↗` 标签行、无年级行与 <768px 布局零回归（SC-001/SC-004/SC-006）

### Implementation for User Story 3

- [X] T006 [US3] 修复学生条目中间间隙超标（用户 2026-10-12 裁定：修复布局达标；上一版 converge T022）：调整 `src/components/StudentGroup.astro` 条目行布局，将两侧内容朝中间收拢——姓名自分组左缘内收、`Since`/备注自分组右缘内收（收拢量按四档视口 375 / 768 / 1024 / ≥1280px 实测校准），使无 `GitHub↗` 标签的 4 行（季慧山 / 杨晨旭 / 刘曦雨 / 顾佴彬）两端分布中间间隙满足 FR-004 默认分档阈值（rev1 T015 验收注记实测约 217 / 218 / 346 / 424px，均略超）；收拢产生的行内容两端空白须保持在 FR-004 右端口径内（不引入新违规）；带 `GitHub↗` 标签行（李江楠 / 张瀚文 / 郑明钰 / 刘正宵，其中李江楠、刘正宵无年级仅左簇内容）、无年级条目与 <768px 布局零回归；分组空态占位文案行为不变
- [X] T007 [US3] 按 `specs/002-team-page-polish/quickstart.md` §3 + §5 手动验收（四档视口 375 / 768 / 1024 / ≥1280px）：条目内容右端连续空白与两端分布行中间间隙均满足 FR-004 分档阈值（记录四档实测值）；无年级条目（李江楠）行整齐不错位；`GitHub↗` 标签零回归——李江楠、张瀚文、郑明钰、刘正宵姓名后标签在位、指向其 GitHub 个人页（新标签打开）、姓名不可点击（`url` 已迁移），杨晨旭无标签且姓名仍链接个人主页，季慧山、刘曦雨、顾佴彬无标签无占位残留；375px 视口标签随行内流动、不溢出不截断

**Checkpoint**: 学生条目空白全口径达标，US3 可独立验收（SC-004 学生条目部分 + SC-006 学生部分）

---

## Phase 5: User Story 2 - 毕业生去向列表列对齐与排序 (Priority: P2)

**Goal**: Graduates 列表升级五列对齐（姓名 / 学位 / 毕业年份 / 去向 / 链接，学位与年份拆列）+ 独立链接列集中放置 `Homepage↗` / `GitHub↗` 标签（FR-011）+ 按 FR-012 渲染排序 + 列表宽度与内容相称（上一版 converge 指认项 T023）；<768px 降级窄屏整齐布局

**Independent Test**: 各档验收视口（375 / 768 / 1024 / ≥1280px）打开 Graduates 部分，任取两行核对五类字段位置跨行一致（≥768px 五列起始位置对齐、<768px 窄屏堆叠同类字段位置一致）；自上而下顺序满足 FR-012；各行右端连续空白满足 FR-004 分档阈值

### Implementation for User Story 2

- [X] T008 [US2] 在 `src/pages/team.astro` 将 Graduates 行由三列升级五列 Grid + 链接列（FR-003 / FR-011 / R2 / R8，仅 ≥768px 生效）：① 模板——将既有 `.grad-meta`（学位·年份合并 span）拆为学位、毕业年份两个独立 span；新增链接列 span 集中渲染毕业生外链标签：`url` 非空 → `Homepage <span aria-hidden="true">↗</span>`（复用 TeacherCard 既有 `Homepage ↗` 模式与色板）、`github` 非空 → `GitHub <span aria-hidden="true">↗</span>`，两标签并列、间距复用 `.teacher-links` 的 gap 语义；`GitHub↗` 自 `.grad-dest` 去向文字后内联**迁出**至链接列（rev2 变更）；对应字段为空的行 MUST 不渲染该标签、链接列保留空占位（不渲染占位文本或符号）；既有 `.grad-dest a { margin-left: 8px }` 内联规则随标签迁出一并清理。② 样式——`grid-template-columns` 五列固定轨道：第 1 列姓名按"现值均为 2–4 个汉字 → 固定列宽按 ≤4 字 + 余量"（现 4.5em 可沿用）、第 2 列学位按最宽值 `Master` + 余量、第 3 列年份按 4 位数字 + 余量、第 4 列去向 `minmax(0, 1fr)` 弹性吸收剩余宽度（"北京大学（攻读博士）"10 个汉字须可在列内换行）、第 5 列链接列按最坏组合 `Homepage↗ GitHub↗` + 间距 + 余量取定宽（MUST 内容无关定宽——`max-content` 轨道会随各行内容变宽、破坏跨行对齐；各列"余量"的具体取值由后置 T010 四档实测校准确定）；`year` 为空的行（谭宇彤、温哲）第 3 列留空占位、学位照常显示、无多余分隔符。③ <768px 降级——五字段逐行堆叠（姓名 / 学位 / 毕业年份 / 去向 / 链接行），同类字段起始位置跨行一致；`year` 缺失行的年份行不渲染，链接行无标签则为空行不渲染。列对齐判定与具体数据取值无关：更长姓名/单位名按列内换行收纳、不破坏跨行对齐（FR-003 / CHK014）
- [X] T009 [US2] 在 `src/pages/team.astro` frontmatter 按 FR-012 / R9 重写 Graduates 排序比较器：替换现有 `(b.data.year ?? 0) - (a.data.year ?? 0) || a.id.localeCompare(b.id)`（缺学位 tiebreak，同年份 PhD/Master 混排会错序——当前数据侥幸无同年混排，导入完整名单即暴露）为四分支比较器：① 有年份条目排在无年份条目之前；② 年份降序；③ 同年份内 PhD 在 Master 之前（无年份组内同样）；④ 同排序键（年份与学位均相同）以 file loader 注入的零填充 `id`（`gra-001…`）字典序作显式 tiebreak（id 序 = 数据文件条目序，不依赖 `Array.prototype.sort` 稳定性）。排序 MUST 在渲染时完成，与 `graduates.json` 条目顺序无关（Constitution II）。依赖 T008（同文件 `src/pages/team.astro`，先后均为 frontmatter+模板协同改动，串行执行）
- [X] T010 [US2] 消除 Graduates 行右端大片空白（上一版 converge T023；FR-004 适用范围已拓展至 Graduates 列表行）：在 `src/pages/team.astro` 校准 `.graduate-list` 布局，使各行内容右端（链接列最右标签或去向文字末端）至行右缘的连续空白满足 FR-004 分档阈值（rev1 三列形态实测各行右端空白约为超宽屏档像素口径的 2.3–2.7 倍，五列拆分后按新列宽结构重测校准）；列表整体宽度与内容相称，姓名列起始位置（列表左起始节奏）与学生条目 T006 收拢后的起始位置做同样处理、两区块左起始节奏一致；保持 FR-003 五列对齐、year 缺失占位、`Homepage↗` / `GitHub↗` 链接列与 <768px 降级行为零回归（SC-003/SC-004/SC-006/SC-007）。依赖 T006（收拢量先定）与 T008（五列结构先就位）。**2026-10-12 第三轮用户裁定注记**：fit-content 收缩 + 全定宽轨道方案被用户裁定推翻——列表改满宽形态（行左右 padding 对称 44px、字段间 column-gap 加大至 16px、去向列 `minmax(0,1fr)` 居中、链接列标签右对齐贴行右缘），无任何外链标签的毕业生行右侧空白豁免 FR-004（spec Clarifications / FR-004 豁免条款 / 契约 §3）；T010 已按新裁定重做完成。**2026-10-13 用户裁定注记**：链接列（第 5 列）由 `11.5em`（按 `Homepage↗ GitHub↗` 最坏并列组合预留）收窄至 `6.5em`（贴合 `Homepage↗` 实际文本宽，浏览器实测约 106px），释放的约 5em 宽度全部并入字段间 `column-gap`（`16px` → `38px`）；五列固定轨道、混合对齐口径与标签右对齐/贴行右缘行为不变，`Homepage↗` 保持单行不换行（`src/pages/team.astro` `.graduate-list li`）
- [X] T011 [US2] 按 `specs/002-team-page-polish/quickstart.md` §2 手动验收（四档视口）：① ≥768px 任取两行核对姓名 / 学位 / 毕业年份 / 去向 / 链接五类字段起始位置分别一致；② 谭宇彤、温哲学位照常显示 `Master`、年份列留空占位、无多余分隔符且按 FR-012 排最后；③ 长去向"北京大学（攻读博士）"在第 4 列内正常换行、不溢出不错位；④ 视口调至 <768px 列表降级窄屏整齐布局、不溢出，同类字段位置仍跨行一致；⑤ 排序核对（SC-008）：自上而下为 杨泽娴（2025·PhD）→ 佀庆一（2024·PhD）→ 刘源鑫（2021·Master）→ 谭宇彤、温哲（无年份组保持数据顺序），可临时打乱 `graduates.json` 条目顺序重新构建核对渲染顺序不变（**验证后还原**）；⑥ 链接列核对（SC-007）：佀庆一、杨泽娴、刘源鑫的 `Homepage↗` 标签分别指向 phoebussi.github.io / ccds.fzu.edu.cn/info/1204/11629.htm / llyx97.github.io（新标签打开），谭宇彤、温哲链接列留空占位、无占位残留；当前数据均无 `github` 值、全部行不渲染 `GitHub↗`（可临时给某条加 `"github": "https://github.com/octocat"` 核对两标签并列于链接列且不破坏五列对齐——**验证后还原，`graduates.json` 最终仅含三条 `url` 取值**）；⑦ Graduates 行空白实测记录（FR-004/SC-004：验收矩阵空白判定自此覆盖 Graduates，自链接列最右标签或去向文字末端起算）。**复核注记（2026-10-12 第三轮裁定后）**：满宽 + 去向居中 + 链接右对齐布局重测复核——① 改按混合口径核对（姓名/学位/年份起始一致、去向中心一致、链接标签结束一致）；有外链行右端空白 ≈ 右 padding 44；无外链行（谭宇彤、温哲）EXEMPT 豁免。**2026-10-13 窄屏缺陷修复注记**：用户反馈"窄页面下 Graduates 表格布局混乱"——经 360/560/700px 视口实测确认根因为 `.grad-dest { text-align: center }`（≥768px 的去向居中口径）泄漏进 <768px 堆叠降级态，导致姓名/学位/年份左对齐、去向居中、标签右对齐的错乱。修复：将去向居中规则包进 `@media (min-width: 768px)`，<768px 堆叠态去向行恢复左对齐（与契约 §2 既有约定一致）。修复后 360/560/700px 实测 name/degree/year/dest 均左对齐、`Homepage↗` 仍右对齐，无溢出/重叠；780px 五列形态不受影响（去向居中、链接右对齐）

**Checkpoint**: 五列对齐 + 链接列 + 排序 + 空白全口径达成，US2 可独立验收（SC-003 + SC-004 Graduates 部分 + SC-007 + SC-008）

---

## Phase 6: User Story 4 - 教师卡片空间利用 (Priority: P3) ✅ 已合入（rev1）

**Status**: rev1 已实现并合入 `main`（`TeacherCard.astro` detailed 模式纵向堆叠覆写移除，方向标签横向流式换行，US4 验收通过——四档右侧空白实测均达标）。rev2 无新增实现任务——教师卡片及主页共享实例随 Phase 7 T012 / T013 复验（SC-004 教师卡片部分）；rev2 不触碰 `TeacherCard.astro`。

---

## Phase 7: Polish & Cross-Cutting（收尾与横切关注点）

**Purpose**: 跨故事的回归验证、全容器空白终检与合并前审计

- [X] T012 [P] 主页回归验证（FR-009）：对照 quickstart.md §6，在 375 / 768 / 1024 / ≥1280px 四档视口核对 `/` 主页 Team 概览区块的 compact 教师卡片（`src/pages/index.astro`，共享 `TeacherCard.astro`，rev2 零改动——结构性回归风险为零，此为合并前例行复核）无新增布局破损，共享卡片实例满足 FR-004 空白判定。**验证注记（2026-10-13，iframe 视口仿真）**：375 / 768 / 1024 / 1280px 下主页 5 张 compact 卡片 `.teacher-links` 内部连续空白均为 0（阈值 47.2px），无横向滚动（scrollWidth ≤ innerWidth）、卡片全部完整可见，无新增布局破损。
- [X] T013 [P] 整页四档视口终检 + 全容器空白判定（SC-001/SC-002/SC-004）：/team/ 在 375 / 768 / 1024 / ≥1280px 下从上到下（Faculty → 在读学生 → Graduates）全部区块无布局破损、无横向滚动、无内容裁切（含 rev1 已修的移动端教师卡片复验）；按 quickstart.md §4' 逐层检查 Team 页内容区全部内容容器——学生分组条目、教师卡片及其内部子容器（方向标签区、链接区、bio 区）、Graduates 列表行、各区块/分组容器，任一容器最右内容元素右端至容器右边缘的连续空白满足 FR-004 分档阈值（嵌套逐层适用）；豁免项核对：主容器 max-width 1180px 居中版式在超宽屏两侧的边距不计为缺陷，导航栏、页脚等页面框架级元素不在判定范围；教师卡片显式增补两项复验（rev1 已实现、rev2 未触碰 TeacherCard，此为合并前例行复核）：①方向标签收纳符合 FR-005——优先整标签换行（标签内文字不断开），仅当单个标签宽度超过卡片可用宽度时该标签内文字换行，任何视口不溢出、不截断；②字段完整性符合 FR-007——每张卡片 photo / 姓名 / 职称 / 研究方向 / 邮箱 / 主页链接 / bio 均照常完整展示（可空字段允许为空、缺失不填、无占位残留）。**验证注记（2026-10-13）**：/team/ 四档视口无横向滚动、无裁切、教师卡片完整可见；教师链接区内部空白 0；Graduates 五列起始位置跨行一致（nameL/degL 逐档恒定、destC 与 linksR 逐档恒定，右端空白＝行右 padding 44px）；学生条目中间间隙 113.7 / 129.7 / 257.7 / 335.7px（阈值 62.5%）、右端空白均 44px，全部达标；<768px 堆叠态 name/degree/year/dest 左对齐一致、链接行右对齐；无年份行占位为空、无残留符号。
- [X] T014 [P] 最终机器门禁与产物验证（SC-005）：repo root 执行 `npm run check && npm run build && npm run preview`，确认类型 + schema 校验（含 `graduates.url` 字段与三条取值）与静态构建通过（CI 同口径），且构建产物中 /team/ 与 / 渲染正常；合并部署后在 GitHub Pages 线上抽查 `/team/` 与 `/` 渲染正常（Constitution §维护工作流：内容变更部署后 MUST 检查线上实际渲染效果）。**验证注记（2026-10-13）**：`npm run check`（0 errors / 0 warnings）+ `npm run build`（18 页面）通过；`npm run preview` 启动后 `/team/` 与 `/` 均返回 200。线上抽查待合并部署后执行。
- [X] T015 合并前范围审计：`git diff main...002-team-page-polish --stat` 确认 src 层改动仅限 4 个文件——`src/pages/team.astro`（五列 Grid + 链接列 + FR-012 排序 + T010 校准）、`src/components/StudentGroup.astro`（T006 收拢）、`src/content.config.ts`（graduates `url` schema）、`src/data/graduates.json`（3 条 `url` 取值），外加 1 处文档同步 `specs/001-homepage-rebuild/data-model.md`（§5 Graduate 表）与本特性 `specs/002-team-page-polish/` 规格文档；零改动：`src/data/teachers.json`、`src/data/students.json`、`astro.config.*`、`package.json` / `package-lock.json`、`.github/workflows/deploy.yml`；零新增 JS 与运行时依赖；quickstart 临时验证值（乱序测试、octocat）已还原、`graduates.json` 仅含三条 `url` 取值（FR-006 / FR-008 / 契约 §6 不变量）；审计通过后创建 PR（分支 `002-team-page-polish` 携带本特性规格文档与全部 src 改动），经审查确认后合并至 `main`（Constitution 维护工作流：模板/样式变更 MUST 通过 PR）。**审计注记（2026-10-13）**：`git diff main --stat` 显示 src 层实测改动 5 个文件——`src/pages/team.astro`、`src/components/StudentGroup.astro`、`src/components/TeacherCard.astro`（T016/T017 收敛项，超出原 4 文件清单）、`src/content.config.ts`、`src/data/graduates.json`；文档同步 `specs/001-homepage-rebuild/data-model.md` §5 + 本特性规格文档；`teachers.json` / `students.json` / `astro.config.*` / `package.json` / lockfile / `deploy.yml` 零改动，零新增 JS 与运行时依赖；quickstart 临时验证值未写入数据文件、`graduates.json` 仅含三条 `url` 取值（临时视口仿真工具已清理）。PR 待创建。

**Checkpoint**: 全部验收口径（SC-001–SC-008）达成，可合并；建议合并后运行 /speckit-converge 复核清零（上一版 Phase 8 遗留建议，T022/T023 已吸收为本版 T006/T010）

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖，立即开始（当前在 `main` 分支，T001 需先建分支）
- **Foundational (Phase 2)**: 依赖 Phase 1；T004 依赖 T003（schema 先接受字段、再写入取值）；T003 / T005 可并行
- **User Stories (Phase 4–5)**: 均依赖 Phase 2 完成
- **Polish (Phase 7)**: T012–T014 依赖全部实现任务（T006–T011）完成；T015 为最终审计，最后执行

### User Story Dependencies

- **US1 (P1) / US4 (P3)**: 已合入 main（rev1），无新任务、无依赖
- **US3 (P2)**: 依赖 Phase 2 数据层就绪后即可开始（`StudentGroup.astro` 仅 Team 页使用，无外部回归面）
- **US2 (P2)**: 依赖 Phase 2（`graduates.url` schema + 取值 + T005 文档）；**US3 先于 US2 执行**（同为 P2，因 T010 的列表左起始节奏须与 T006 收拢量对齐——契约 §3"左起始节奏与学生条目收拢后一致"）；但 T006 ∥ T008 可并行起步（不同文件），仅 T010 需等 T006 + T008 均完成

### Within Each User Story

- 先实现（改模板 / scoped CSS / 数据 / schema）后手动验收（DevTools 视口矩阵）
- 同文件任务串行：T008 → T009 → T010（均为 `src/pages/team.astro`）
- 验收发现问题 → 修复后重跑该故事验收任务

### Parallel Opportunities

- T003 ∥ T005（Foundational：`src/content.config.ts` / `specs/001-homepage-rebuild/data-model.md`，不同文件）
- T006 ∥ T008（US3 / US2 首任务：`src/components/StudentGroup.astro` / `src/pages/team.astro`，不同文件）
- T012 ∥ T013 ∥ T014（Polish：主页观测 / 整页观测 / 构建门禁，互不依赖）
- 不可并行（同文件）：T008 ↔ T009 ↔ T010（team.astro）、T003 ↔ T004（schema → 数据依赖）

---

## Parallel Example: US3 + US2 起步

```bash
# Foundational 就绪后，以下可同时进行（两个不同文件，无依赖）：
Task: "T006 学生条目中间间隙收拢（src/components/StudentGroup.astro）"
Task: "T008 Graduates 五列 Grid + 链接列（src/pages/team.astro）"

# 之后串行（同文件 / 依赖）：
Task: "T009 FR-012 排序比较器（src/pages/team.astro，待 T008 完成后）"
Task: "T010 宽度校准与左起始节奏对齐（src/pages/team.astro，待 T006 + T008 完成后）"
Task: "T007 US3 验收（待 T006）"
Task: "T011 US2 验收（待 T008–T010）"
```

---

## Implementation Strategy

### MVP First

rev2 体量小（4 个文件 + 1 处文档同步），建议 MVP = Phase 1 + Phase 2 + US3 + US2 全量一次交付（rev2 全部用户可见价值）；Phase 1–2（纯数据层）单独可先行合入——可选字段未被模板消费时无渲染影响、构建绿（惰性增量，随任意批次安全合入）。

### Incremental Delivery

1. Setup + Foundational → 数据层与文档就绪（构建绿、无渲染变化）
2. 加 US3（T006 中间间隙收拢）→ §3+§5 独立验收
3. 加 US2（五列对齐 + 链接列 + FR-012 排序 + T010 校准）→ §2 独立验收
4. Polish（主页回归 + 整页全容器终检 + 门禁 + 范围审计）→ 合并
5. 部署后线上抽查 `/team/` 与 `/`（T014 注记，Constitution 维护工作流义务）

### Parallel Team Strategy

单人执行按 Phase 顺序即可；多人协作时：

- Developer A: US2 全链（T008 → T009 → T010 → T011，team.astro 串行）
- Developer B: US3（T006 → T007，独立文件）——T010 需待 Developer B 的 T006 收拢量先定

---

## Notes

- [P] 任务 = 不同文件、无未完成依赖
- [Story] 标签将任务映射到 spec.md 用户故事（US1/US4 已合入、US3→Phase 4、US2→Phase 5），便于追溯
- FR-004 分档阈值以 spec FR-004 为唯一规范源，本文引用不复述具体数值（spec Assumptions / plan.md）
- 每个故事独立可验收；任一检查点可暂停验证
- 遵循 Constitution V（小步提交）：建议提交分批——① rev2 规格文档（`specs/002-team-page-polish/` 全套含本 tasks.md）② Foundational（T003 + T004 + T005）③ US3（T006）④ US2（T008 + T009 + T010），Polish 审计后合并
- 禁止改动：`src/data/teachers.json`、`src/data/students.json`、构建与 CI 配置（FR-006 / 契约 §6）；禁止新增依赖与 JS（FR-008）
- quickstart 临时验证值（graduates.json 乱序测试、octocat `github` 测试值）验收后 MUST 还原，最终 `graduates.json` 仅含三条 `url` 取值
- 布局判定口径统一见 `specs/002-team-page-polish/contracts/team-layout.md`；验收步骤详见 `specs/002-team-page-polish/quickstart.md`
- `checklists/` 下的需求质量清单为评审产物，实现阶段不修改其勾选状态

---

## Phase 8: Convergence

- [X] T016 消除教师卡片链接区（`.teacher-links`）右端大片空白 per FR-004 / SC-004 (partial)：`src/components/TeacherCard.astro` 的 `.teacher-links` 为 `.teacher-card`（`display:flex; flex-direction:column`）的直接子项，默认 `align-items: stretch` 使其横向拉伸至卡片内容全宽，而链接内容短（Team 页 detailed = email + `Homepage ↗`；主页 compact 仅 `Homepage ↗`）且左对齐——Team 页 768px 单列卡片下右端连续空白约 386px，超过卡片内容宽 672px 的 50%（336px）；主页共享实例在 375 / 768 / 1024px 视口同样超标（卡片内宽 295 / 304 / 432px，空白约 201 / 214 / 342px）。修复：为 `.teacher-links` 增加 `align-self: flex-start`（收缩为内容宽度，消除该子容器内的拉伸空白）。验收：四档视口（375 / 768 / 1024 / ≥1280px）下 Team 页 768px 视口与主页共享实例的教师卡片链接区均满足 FR-004 分档阈值；不引入 FR-005 方向标签收纳、FR-003 五列对齐与 FR-009 主页回归的违规（随 Phase 7 T012 / T013 复验）。**完成注记（2026-10-13）**：`.teacher-links` 增加 `align-self: flex-start`；iframe 视口仿真实测四档（375 / 768 / 1024 / 1280px）Team 页 5 张卡片与主页 5 张卡片链接区内部空白均为 0，达标。

---

## Phase 9: Convergence

- [X] T017 消除教师卡片链接区（`.teacher-links`）右端大片空白 per FR-004 / SC-004 (partial)：承接 Phase 8 T016（仍未落库）——`src/components/TeacherCard.astro` 的 `.teacher-links` 作为 `.teacher-card`（`display:flex; flex-direction:column`）的直接子项，默认 `align-items: stretch` 横向拉伸至卡片内容全宽，而链接内容短且左对齐，导致该子容器内右端连续空白超 FR-004 分档阈值（Team 页 768px 单列卡片内容宽 672px，连续空白约 376px > 336px（50%）；主页共享实例在 375 / 768 / 1024px 视口空白约 195 / 204 / 332px，分别超 147.5 / 152 / 216px 阈值）。修复：为 `.teacher-links` 增加 `align-self: flex-start`（收缩为内容宽度，消除该子容器内的拉伸空白）。验收：四档视口（375 / 768 / 1024 / ≥1280px）下 Team 页与主页共享教师卡片实例的链接区均满足 FR-004 分档阈值；不引入 FR-003 五列对齐、FR-005 方向标签收纳与 FR-009 主页回归的违规。**完成注记（2026-10-13）**：与 T016 同一改动（`.teacher-links { align-self: flex-start }`）已落库，四档实测链接区空白 0，无 FR-003 / FR-005 / FR-009 违规。
