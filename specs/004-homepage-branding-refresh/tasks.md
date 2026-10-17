---

description: "Task list for 主页品牌焕新（Homepage Branding Refresh）"
---

# Tasks: 主页品牌焕新（Homepage Branding Refresh）

**Input**: Design documents from `/specs/004-homepage-branding-refresh/`

**Prerequisites**: [plan.md](./plan.md) (required), [spec.md](./spec.md) (required), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/site-branding.md](./contracts/site-branding.md), [quickstart.md](./quickstart.md)

**Tests**: 本特性**未要求** TDD / 自动化测试——验收口径沿用 001–003：`npm run check` + `npm run build` 机器门禁（含 FR-011 负向用例）+ quickstart.md 浏览器视口矩阵手动核对。故不生成独立测试任务，仅在各故事内保留必要的验收核对任务。

**Organization**: 任务按用户故事分组，每个故事可独立实现与验收。改动收敛于 5 个源码文件 + 1 个数据文件 + 2 个静态资产 + 1 个文档（见 plan.md Constraints）。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行执行（不同文件、无未完成任务依赖）
- **[Story]**: 该任务所属用户故事（US1 / US2 / US3 / US4）
- 每个任务均含精确文件路径

## Path Conventions

单一 Astro 项目（`output: 'static'`，沿用 001–003）：组件在 `src/components/`、页面在 `src/pages/`、数据在 `src/data/`、静态资产在 `public/`、构建配置在 `src/`。全部路径均相对仓库根。

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 建立回归基线，确认改动前仓库处于绿色状态

- [X] T001 在仓库根执行 `npm run check && npm run build`，确认当前 HEAD 构建通过，作为本次改动的回归基线（SC-005）

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: SiteBrand 品牌命名数据的唯一数据源——被 US2/US3/US4 共同消费，MUST 先于所有用户故事完成

**⚠️ CRITICAL**: 所有用户故事均读取 `src/data/site.json` 字段，本阶段完成前不得开始故事实现

- [X] T002 更新 `src/data/site.json`（SiteBrand 实体，唯一数据源，FR-006/SC-004）——新增字段并逐字采用 spec/用户给定值：`instituteZh`="中国科学院信息工程研究所"、`lab`="第六研究室/智能认知安全研究室"、`alias`="G3课题组"、`navBrand`="CIGMA"、`logo`="/logo.svg"、`favicon`="/favicon.svg"；将 `groupName` 取值调整为 "认知智能生成课题组"（**中文名称，不含品牌字**；**不新增/不使用 `groupNameZh` 等冗余简称字段**）、`fullName` 调整为 "Cognitive Intelligence with Generative and Multimodal Algorithms"；完整主名称 "认知智能生成课题组 CIGMA" 由 `${site.groupName} ${site.navBrand}`（一个空格）在展示位组合派生；`institute` / `directions` / `admissions` 取值**保持不变**（FR-005/FR-007/FR-010）
- [X] T003 [P] 更新 `src/data/README.md`：同步 `site.json` 字段说明（新增 `instituteZh`/`lab`/`alias`/`navBrand`/`logo`/`favicon` 的含义、`groupName` 语义为「课题组中文名称（不含品牌字）」、完整主名称由 `${groupName} ${navBrand}` 组合派生故不设 `groupNameZh`、`fullName` 语义由「研究组标识」改为「英文全称」），移除旧 "iie-CIGMA" 表述（Constitution II）

**Checkpoint**: 品牌数据源就绪——用户故事实现可开始（此时构建仍绿：新字段尚无消费方，FR-011 校验尚未落地）

---

## Phase 3: User Story 1 - 课题组 Logo 现代化 (Priority: P1) 🎯 MVP

**Goal**: 基于原站 `images/icon.drawio.svg` 产出**纯矢量**现代化 logo（`public/logo.svg`）+ 同源简化 favicon（`public/favicon.svg`），并接通 favicon 引用与构建期站点品牌数据校验

**Independent Test**: 将 `public/logo.svg` 与原站 `icon.drawio.svg` 并排比对，核对三色 V 形主体与白色辅助符号完整保留、可辨识为同一标识；检查文件为纯矢量、无 draw.io 痕迹与内嵌位图；favicon 缩至约 16px 仍可辨

- [X] T004 [US1] 新建 `public/logo.svg`——纯矢量完整课题组标识：以一致网格重绘**橙(#f7941d)/绿(#28ae6c)/蓝(#037ec2) 三色依次排列、向右延展的 chevron 主体**（色相不变，明度/饱和度偏移 ≤10%），保留蓝色箭头尖角点缀；将原 `<image>` data-URI 内嵌的两处**白色语言/翻译符号内联为原生 `<path fill="#ffffff">`**、白色**笔形符号**保留为原生 path；去除 draw.io 属性（`host`/`content`/`xmlns:v`）与 `<image>`/`<foreignObject>`/data-URI；透明背景、内容经 `viewBox` 缩放（FR-001/FR-002，data-model.md §2 原图要素映射表）
- [X] T005 [US1] 替换 `public/favicon.svg`——**同源简化**版：仅保留三色 chevron 主体（去除白色辅助符号），采用贴合内容的方形 `viewBox` 并留少量内边距，去除字体依赖与旧 "G3" 蓝底方块标识，纯矢量、透明背景，确保约 16px 标签页尺寸下三色 V 形主体清晰可辨（FR-008/US1 AS4，research.md R2）
- [X] T006 [US1] 将 `src/components/BaseLayout.astro` 中 `<link rel="icon" ...>` 的硬编码 `href={withBase('/favicon.svg')}` 改为 `href={withBase(site.favicon)}`（数据驱动，favicon 指向 `/favicon.svg`）（FR-008）
- [X] T007 [US1] 在 `src/content.config.ts` 新增 **站点品牌数据校验**（FR-011，显式例外）：以 `fileURLToPath(new URL('../public/', import.meta.url))` 锚定资源根，读取并解析 `src/data/site.json`，校验 (a) `logo`/`favicon` MUST 为以 `/` 开头、无 `..` 的路径且其指向文件**存在于 `public/`**；(b) 命名字段 `instituteZh`/`lab`/`groupName`/`alias`/`fullName`/`navBrand` MUST **存在且为非空字符串**（`groupName`/`navBrand` 任一为空即失败，因完整主名称由其组合派生）；任一违反时抛出定位到 `site.json` 具体字段（与目标路径）、并给出可执行修复指引的构建错误使 `astro build` **中断并报错**（复用 gallery/teachers `existsSync` 校验模式；其余 schema 零改动）（依赖 T004、T005）
- [X] T008 [US1] 验收核对（要素级客观清单）：(i) 三色 chevron 数量 = 3 且顺序为 橙(#f7941d)→绿(#28ae6c)→蓝(#037ec2)、方向向右延展；(ii) 蓝色箭头尖角点缀、中部白色语言/翻译符号 2 处、右下白色笔形符号 1 处均保留；(iii) 色相不变、明度/饱和度偏移 ≤10%；(iv) 无 draw.io 属性（`host`/`content`/`xmlns:v`）、无 `<image>`/`<foreignObject>`/`data:` 内嵌；(v) 在白色（顶栏）与浅色（底栏 `--sky-soft`、名栏渐变头）背景上可辨、favicon 在约 16px 下三色可辨；以上逐项与 `icon.drawio.svg` 并排比对并判为同一标识（SC-001/US1 AS1–AS4，quickstart.md §1–§2）

**Checkpoint**: US1 独立可用——新 logo/favicon 资产可交付评审，纯矢量校验通过

---

## Phase 4: User Story 2 - 顶部栏品牌区改造 (Priority: P2)

**Goal**: 全站顶栏品牌区由纯文字 "G3 CIGMA" 改为「左 logo 图形 + 右文字 CIGMA」，整体为返回主页链接，且窄屏下品牌区始终同一行、不折断

**Independent Test**: 依次打开 `/`、`/news/`（含详情页）、`/team/`、`/publications/`，核对顶栏均为「左 logo + 右 CIGMA」、点击品牌区返回主页、导航项与高亮不变、无 "G3"/"G3 CIGMA"

- [X] T009 [US2] 修改 `src/components/Navbar.astro` 品牌区 markup：新增 `import site from '../data/site.json';`，将 `<a class="brand" href={withBase('/')}>G3 CIGMA</a>` 改为 `<a class="brand" href={withBase('/')}><img class="brand-logo" src={withBase(site.logo)} alt="" width={32} height={32} /><span class="brand-text">{site.navBrand}</span></a>`（`width`/`height` 属性仅作固有尺寸与防 CLS 提示，渲染高度由 T010 等高样式决定）；logo 为装饰性图形（`alt=""`，品牌区可访问名由文字 "CIGMA" 提供），**不绑定**任何点击放大/灯箱行为（点击品牌区唯一行为为导航至主页）（FR-003）（依赖 T004）
- [X] T010 [US2] 在 `src/components/Navbar.astro` `<style>` 中调整品牌区样式：`.brand` 设为 `display:inline-flex; align-items:center; gap`（logo 与 "CIGMA" 文字**等高对齐**）、`white-space:nowrap`、`flex:0 0 auto`；`.brand-logo` 渲染高度与 "CIGMA" 文字**行盒高度相等**（等高对齐 = 两元素渲染后占据的矩形竖向高度相同，CHK040 修订口径；实现如 `.brand-text { line-height: 1.2; }` 配合 `.brand-logo { height: 1.2em; width: auto; }`，随字号窄屏等比缩放、判据保持成立）；确保品牌区在含 375px/320px 的全部档位**始终同一行、内部不折断**，与既有 `flex-wrap` 导航项**不重叠/不截断**（保留导航项标签、href、`aria-current` 高亮逻辑不变）（FR-003 AS4/FR-009，research.md R3）
- [X] T011 [US2] 验收核对：全站逐页（`/`、`/news/` 及一条详情页、`/team/`、`/publications/`）确认顶栏为「左 logo 图形 + 右文字 CIGMA」（含 logo 与 "CIGMA" 文字等高对齐——渲染后矩形竖向高度相同）且整体链接返回主页、导航功能与当前页高亮不受影响、顶栏不出现 "G3" 字样或 "G3 CIGMA" 组合；点击 logo/品牌区仅导航回主页、MUST NOT 触发任何灯箱/放大（含 Gallery lightbox）；375px/320px 档品牌区不折断、与导航不重叠（US2 AS1–AS4，quickstart.md §3）（依赖 T009、T010）

**Checkpoint**: US1 + US2 均独立可用——全站顶栏品牌区已完成图形化焕新

---

## Phase 5: User Story 3 - 主页课题组名栏改版 (Priority: P3)

**Goal**: 主页名栏（Hero）改为四层命名体系（机构从属链 → 主名称 → 别名+英文全称 → 方向标签），删除 `.hero-kicker`/`.hero-institute`，并统一全站标签页标题派生式

**Independent Test**: 打开主页，核对名栏四层信息完整、顺序正确、无 "iie-CIGMA" 残留，且在 375/320px 下长命名优雅换行、不溢出

- [X] T012 [US3] 修改 `src/components/Hero.astro` markup 为四层结构：① `<p class="hero-affil">{site.instituteZh} · {site.lab}</p>`（机构归属链行，以 "·" 表达研究所 ⊃ 研究室 ⊃ 课题组三级从属）② `<h1 id="hero-title">{site.groupName} {site.navBrand}</h1>`（**完整主名称由 `${site.groupName}` + 一个空格 + `${site.navBrand}` 组合派生**，逐字为「认知智能生成课题组 CIGMA」，不依赖任何完整名称字段）③ `<p class="hero-alias">{site.alias} · {site.fullName}</p>` ④ `<ul class="hero-directions">`（保持现状）；**删除** `.hero-kicker`（原 "iie-CIGMA"）与 `.hero-institute`（研究所英文全称不在名栏重复，由底栏保留）（FR-005，research.md R4）
- [X] T013 [US3] 修改 `src/components/Hero.astro` `<style>`：删除 `.hero-kicker` / `.hero-institute` 规则；新增 `.hero-affil`（次要、`--ink-soft`，字号小于别名行）与 `.hero-alias`（字号介于 h1 与正文之间，中圆点 `·` 分隔）样式，保持居中与既有段落节奏；对长命名采用**词间断行**（自然空格断行 + `overflow-wrap: break-word` 兜底），**MUST NOT** 使用 `word-break: break-all`、**MUST NOT** 使用连字符断词，允许孤字/孤行、不设行数上限，以不溢出容器为准则（FR-005 AS3/FR-009，research.md R4）
- [X] T014 [P] [US3] 统一全站标签页标题派生式（FR-007）：主页 `src/pages/index.astro` 的 `<BaseLayout title=...>` 改为 `title={`${site.groupName} - ${site.instituteZh}`}`（逐字为「认知智能生成课题组 - 中国科学院信息工程研究所」）；其余页面（`news` 列表/详情、`team`、`publications`）的标题 MUST 为「{页名} · ${site.groupName} ${site.navBrand}」派生式（如「News · 认知智能生成课题组 CIGMA」）——若现有模板为其它写法（含硬编码 "iie-CIGMA"）则**一次性**改为该派生式；主页其余区块（Join Us/News/Team/Publications/Gallery）**零改动**；同时核对各页 `<meta name="description">` 默认值（`${site.groupName}, ${site.institute}`）随 `site.json` 更新、无 "iie-CIGMA" 等旧文案残留（FR-007，research.md R5）
- [X] T015 [US3] 验收核对：打开主页核对名栏自上而下四层（机构归属链「中国科学院信息工程研究所 · 第六研究室/智能认知安全研究室」→ 主名称「认知智能生成课题组 CIGMA」→ 「G3课题组 · Cognitive Intelligence with Generative and Multimodal Algorithms」→ 方向标签）；名栏不出现研究所英文全称与 "iie-CIGMA"；375px/320px 下别名行英文全称词间断行、不词中截断、不使用连字符断词、不溢出；主页其余区块与改版前一致（US3 AS1–AS4，quickstart.md §4、§6）（依赖 T012、T013、T014）

**Checkpoint**: US1 + US2 + US3 均独立可用——主页名栏与站点标题已完成命名体系改版

---

## Phase 6: User Story 4 - 底部栏命名更新 (Priority: P4)

**Goal**: 底栏课题组名称行由 "G3 CIGMA" 更新为「认知智能生成课题组 CIGMA」；研究所行与联系方式行不变

**Independent Test**: 打开任一页面滚动到底部，核对名称行显示「认知智能生成课题组 CIGMA」，研究所行与联系方式行不变

**说明**: 底栏模板 `BaseLayout.astro` 的 `.footer-name` 原绑定裸 `{site.groupName}`；因 T002 起 `groupName` 已改为「课题组中文名称（不含品牌字）」，需将其改为 `${site.groupName} ${site.navBrand}` 组合派生（**一处组合改动，样式零改动**）方满足 FR-004；研究所行与联系方式行保持原样（research.md R5）。

- [X] T016 [US4] 实现+验收：将 `src/components/BaseLayout.astro` 底部栏 `.footer-name` 内容由裸 `{site.groupName}` 改为 `${site.groupName} ${site.navBrand}` 组合派生（模板/样式其余零改动）；随后在任一页面底部确认名称行显示「认知智能生成课题组 CIGMA」、且不出现 "G3 CIGMA"；研究所行（中国科学院信息工程研究所 / Institute of Information Engineering, CAS）与联系方式行保持不变（US4 AS1–AS2，quickstart.md §5）（依赖 T002）

**Checkpoint**: 四个用户故事全部独立可用

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 跨故事验收——机器门禁、FR-011 负向用例、视口矩阵、命名一致性与改动范围收敛

- [X] T017 在仓库根执行 `npm run check && npm run build`，确认类型/schema 校验与静态构建（含 FR-011 站点品牌数据校验）**100% 通过**（FR-011/SC-005）（依赖 Phase 3–6 全部完成）
- [X] T018 FR-011 负向用例（资源 + 命名字段）：(a) 临时将 `public/logo.svg` 改名（如 `logo2.svg`）或把 `src/data/site.json` 的 `logo` 指向不存在文件 → 执行 `npm run build` 确认构建**报错并中断**、报错信息定位到 `site.json` 的 `logo` 字段与目标路径（favicon 可选同型复测）；(b) 临时把 `site.json` 的 `navBrand` 或 `groupName` 置为空字符串 → 确认构建**报错并中断**、报错定位到对应命名字段；随后**全部还原**并确认构建恢复通过（FR-011，quickstart.md §9）（依赖 T017）
- [X] T019 [P] 浏览器视口矩阵核对（`≥1280 / 1279 / 1024 / 768 / 767 / 575 / 375 / 320px`）逐档浏览 `/`、`/news/`、`/team/`、`/publications/`：顶栏品牌区与导航不重叠/不截断/不非预期换行、名栏长命名不溢出、**无横向滚动条**；主页既有区块（Join Us/News/Team/Publications/Gallery）内容与布局与改版前一致（FR-009/FR-010/SC-003/SC-005，quickstart.md §7）
- [X] T020 [P] 全站命名一致性审计：确认顶栏与底栏不出现 "G3 CIGMA"、名栏与标签页标题/meta description 不出现 "iie-CIGMA"（审计限于站点级元素；News/Team/Publications 正文历史文案不属审计范围——FR-010/CHK043）；"G3课题组" 仅按命名体系保留于主页名栏；主页标题为「认知智能生成课题组 - 中国科学院信息工程研究所」、其余页为「{页名} · 认知智能生成课题组 CIGMA」（SC-002）
- [X] T021 [P] `git diff` 改动范围审计（FR-010）：源码文件预期为 `src/components/Navbar.astro`、`src/components/Hero.astro`、`src/components/BaseLayout.astro`、`src/pages/index.astro`、`src/content.config.ts`；若 T014 需对齐其余页标题派生式，则相应页面文件（`src/pages/news/*`、`src/pages/team.astro`、`src/pages/publications.astro`）中**仅 `<title>`/`title=` 行**可出现在 diff 中；数据侧为 `src/data/site.json`（品牌字段），文档侧为 `src/data/README.md`（字段说明），二者之外的其余数据文件（teachers/students/graduates/publications/gallery）与全部 collection schema 字段定义 diff 为空；未新增页面/路由；未引入新依赖/新 JS（FR-010/FR-006/Constitution V）

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖，可立即开始
- **Foundational (Phase 2)**: 依赖 Setup 完成——**阻塞全部用户故事**（SiteBrand 数据源）
- **User Stories (Phase 3–6)**:
  - US1 (P1) 只依赖 Foundational（logo/favicon 资产独立于命名数据）
  - US2 (P2) 依赖 Foundational **+ US1**（需 `public/logo.svg` 资产存在）
  - US3 (P3) 依赖 Foundational（命名数据）
  - US4 (P4) 依赖 Foundational（命名数据；需在 `BaseLayout.astro` 就名称行做一处 `${groupName} ${navBrand}` 组合改动）
  - 故事间可按优先级顺序（P1→P2→P3→P4）推进；US3/US4 在 Foundational 完成后即可与 US1/US2 并行
- **Polish (Phase 7)**: 依赖所有目标用户故事完成

### User Story Dependencies

- **US1 (P1)**: Foundational 后可开始——无其他故事依赖
- **US2 (P2)**: Foundational + US1 后可开始（复用 US1 的 logo 资产）
- **US3 (P3)**: Foundational 后可开始——独立于 US1/US2
- **US4 (P4)**: Foundational 后可开始——实现载荷仅一处名称行组合改动（T016），独立于其他故事

### Within Each User Story

- 资产/模型 → 引用接线 → 校验 → 验收核对
- US1 内部：T004（logo）→ T005（favicon，复用 T004 几何）→ {T006 引用、T007 校验（依赖 T004/T005）} → T008
- US2 内部：T009（markup）→ T010（样式）→ T011（验收）
- US3 内部：T012（markup）→ T013（样式）→ {T014 标题（独立文件，可并行）} → T015（验收）

### Parallel Opportunities

- T003 可与 T002 并行（不同文件）
- T014（主页标题 + 其余页标题模板对齐）可与 T012/T013（`Hero.astro`）并行（不同文件，仅依赖 Foundational 数据）
- Foundational 完成后，US3 与 US4 可与 US1 并行推进（不同文件/数据消费）
- Polish 阶段 T019、T020、T021 可并行

---

## Parallel Example: User Story 3

```bash
# Hero 改动（同一文件，顺序执行）：
Task: "T012 改 Hero.astro 四层 markup"
Task: "T013 改 Hero.astro scoped CSS"

# 与 Hero 不同文件，可并行：
Task: "T014 统一主页与其余页 <title> 派生式"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. 完成 Phase 1: Setup（T001 基线）
2. 完成 Phase 2: Foundational（T002 site.json、T003 README）——CRITICAL，阻塞全部故事
3. 完成 Phase 3: User Story 1（T004–T008）
4. **STOP and VALIDATE**：并排比对 logo + 纯矢量检查（T008），独立交付评审
5. 若就绪即可部署/演示（新 logo + favicon 已成立）

### Incremental Delivery

1. Setup + Foundational → 品牌数据源就绪
2. 加 US1 → 独立验收 → 交付（MVP！）
3. 加 US2 → 独立验收 → 交付
4. 加 US3 → 独立验收 → 交付
5. 加 US4 → 独立验收 → 交付
6. Polish → 机器门禁 + 负向用例 + 视口矩阵全通过 → 收口

### Parallel Team Strategy

1. 团队共同完成 Setup + Foundational
2. Foundational 完成后：
   - 开发者 A：US1（logo/favicon 资产）→ 完成后接 US2
   - 开发者 B：US3（Hero + 全站标签页标题派生式）
   - 开发者 C：US4（底栏名称行一处组合改动，随时可做）
3. 各故事独立完成并集成，互不阻塞

---

## Notes

- [P] 任务 = 不同文件、无未完成任务依赖
- [Story] 标签将任务映射到具体用户故事，便于追溯
- 每个用户故事均可独立验收；US4 的实现载荷最小（仅底栏名称行一处组合改动，T016），其功能数据由 Foundational 的 T002 铺垫，故不存在独立于 Foundational 的实现路径
- 部署后（线上渲染）核对由 CI / 既有维护工作流承载，**不属本特性任务范围**（CHK037）；本特性负责的门禁为本地 `npm run check && npm run build`（T017）与 FR-011 负向用例（T018）
- `groupName` 为课题组中文名称（不含品牌字）；完整主名称一律由 `${groupName} ${navBrand}` 组合派生，**不设 `groupNameZh` 等冗余字段**（消除字段漂移，CHK035）
- 提交前核对 `git diff` 是否越出 plan.md Constraints 收敛范围（FR-010）
- 命名文案逐字采用 spec 给定值（Constitution I），`site.json` 为唯一数据源（SC-004）
- 避免：模糊任务、同文件冲突、跨故事依赖破坏独立性
