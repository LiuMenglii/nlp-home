---
description: "Task list for 课题组图标现代化（Logo Mark Modernization）"
---

# Tasks: 课题组图标现代化（Logo Mark Modernization）

**Input**: Design documents from `/specs/005-modernize-logo-mark/`

**Prerequisites**: [plan.md](./plan.md) (required), [spec.md](./spec.md) (required for user stories), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/logo-mark.md](./contracts/logo-mark.md), [contracts/candidates-review.md](./contracts/candidates-review.md), [contracts/site-integration.md](./contracts/site-integration.md), [quickstart.md](./quickstart.md)

**Tests**: 本特性**未要求** TDD / 自动化测试——验收口径沿用 001–004：`npm run check` + `npm run build` 机器门禁、`candidates/comparison.html` 四行 × 四档目视评审、`sharp` 尺寸矩阵光栅化（临时目录，不新增依赖）、构建期校验负向用例与浏览器视口矩阵。故**不生成独立测试任务**，仅在各用户故事内保留必要的验收核对任务。

**Organization**: 任务按用户故事分组（US1 三版候选与选定评审 → US2 小尺寸质量与 favicon → US3 全站替换），每个故事可独立实现与验收。阶段一产物全部收敛于 `specs/005-modernize-logo-mark/candidates/`（不进站点）；阶段二源码改动仅 `public/logo.svg`、`public/favicon.svg`、`src/components/Navbar.astro` 三处。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行执行（不同文件、无未完成任务依赖）
- **[Story]**: 该任务所属用户故事（US1 / US2 / US3）
- 每个任务均含精确文件路径

## Path Conventions

单一 Astro 项目（`output: 'static'`，沿用 001–004）：静态资产在 `public/`、组件在 `src/components/`、数据在 `src/data/`、构建期校验在 `src/content.config.ts`；阶段一评审产物在 `specs/005-modernize-logo-mark/candidates/`（不参与构建、不部署）。全部路径相对仓库根。

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 确认改动前基线为绿色，建立阶段一评审工作区并对齐现状资产事实

- [X] T001 在仓库根执行 `npm run check && npm run build`，确认改动前 HEAD 为绿色基线（预期 `Result (20 files)`、0 errors / 0 warnings / 0 hints；`18 page(s) built`），作为后续门禁对照（FR-008 / SC-005；脚本定义见 `package.json`）
- [X] T002 [P] 创建阶段一评审产物目录 `specs/005-modernize-logo-mark/candidates/`，并逐字核对现状资产基线：`public/logo.svg` 的 `viewBox="0 19 140 105"`、三色路径（橙 `M30 19 L60 59 L30 99 L0 59 Z`、绿 `M30 19 L70 19 L100 59 L70 99 L30 99 L60 59 Z`、蓝 `M70 19 L110 19 L140 59 L110 99 L70 99 L100 59 Z`）、右下尖角 `M119.142 79.505 L110.176 123.319 80.505 89.858 Z`、3 个白色符号；`public/favicon.svg` 的 `viewBox="-10 -21 160 160"`；旧版内联快照仅经 `git show HEAD:public/logo.svg` 取得（供 T008 内联，**不落盘**为仓库副本，不新增旧资产文件）

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 锁定三版候选与最终资产共用的符号系统、色板与格式规则——被 US1/US2/US3 共同消费

**⚠️ CRITICAL**: 本阶段完成前不得开始任何用户故事；参数一旦锁定，三版候选与阶段二资产 MUST 逐字复用

- [X] T003 锁定共用白色辅助符号系统与色板（供 `specs/005-modernize-logo-mark/candidates/candidate-a.svg`、`candidate-b.svg`、`candidate-c.svg` 逐字复用）：三个符号共用 `fill="none"` / `stroke="#ffffff"` / `stroke-linecap="round"` / `stroke-linejoin="round"`——文 4 笔 `M0 -7.91 V-6.81`、`M-7.18 -3.31 H7.18`、`M-6.26 0.18 L6.07 7.54`、`M6.26 0.18 L-6.07 7.54`（17.2×18.3）；脑 2 笔（单线脑形 + 中央裂 `M0 -3.61V0.95`，20.6×15.0）；笔 1 笔闭合笔身 `M-7.95 7.83 L-3.18 5.99 L7.94 -5.13 L5.25 -7.82 L-5.87 3.3 Z`（18.7×18.4）；A/B 取 `stroke-width="2.8"`、C 取 `3.0`；锚点 = 所属色带 y=59 横截面中点（A 文 `(27,59)` / 脑 `(75,59.99)` / 笔 `(118,59)`；B 文 `(23,59)` / 脑 `(67,59.99)` / 笔 `(114,59)`；C 文 `(21,59)` / 脑 `(63,59.99)` / 笔 `(112,59)`）；锁定三色 A 逐字 `#f7941d` / `#28ae6c` / `#037ec2`、B 统一 +10% L（`#f8a138` / `#2cbf77` / `#038bd5`）、C 统一 −12% L（`#eb8408` / `#23995f` / `#036fab`）（色相锁定、逐色偏移 ≤20%，记录逐色 ΔL/ΔS）；复核墨迹到任一分色边界 ≥6.4 单位（色带高度 80 × 8%）——实测 A 文 11.73 / 脑 7.09 / 笔 7.38、B 9.52 / 7.84 / 11.70、C 8.21 / 8.10 / 13.88，墨迹 bbox 中心偏差 文 y 0.18 / 脑 0.00 / 笔 0.00（≤0.25）
- [X] T004 [P] 锁定阶段一产物格式与边界规则（供 `specs/005-modernize-logo-mark/candidates/` 全部产物）：三版候选统一 `viewBox="0 19 140 105"`、SVG 1.1 纯矢量自包含、无 `<script>` / `<image>` / `data:` / `<foreignObject>` / `<metadata>` / draw.io 元数据（`host`、`content`、`xmlns:v`）、无渐变 / 滤镜 / 透明度叠色；`clipPath` 的 `id` 文件内唯一；三色叠绘顺序橙 → 绿 → 蓝（A 可沿用现状文件顺序）；`candidates/` 产物 MUST NOT 进入 `public/`、`src/` 或构建产物；确认 `package.json`、`astro.config.mjs`、`src/data/site.json`、`src/content.config.ts`、`src/components/BaseLayout.astro` 本特性零改动

**Checkpoint**: 共用参数与边界就绪——三版候选可按同一符号系统与格式并行产出

---

## Phase 3: User Story 1 - 同一个标识，更现代的图形 (Priority: P1) 🎯 MVP

**Goal**: 产出三版候选标识（均满足 FR-001 身份不变量与 ±20% / ≤20% 放宽口径）+ 单一并排对比页；维护者选定一版，并经 SC-006 外部评审通过，形成进入阶段二的设计决策

**Independent Test**: 浏览器直接打开 `specs/005-modernize-logo-mark/candidates/comparison.html`，核对四行（现状 / A / B / C）× 四档（128 / 64 / 22 / 16px）渲染齐全、22px 为白底顶栏模拟、16px 为等比模拟；三版逐项通过身份不变量清单与参数界限；`candidates/SELECTION.md` 已记录选定版与 SC-006 两项判定。全程无需改动站点。

### Implementation for User Story 1

- [X] T005 [P] [US1] 新建候选 A「疾进」`specs/005-modernize-logo-mark/candidates/candidate-a.svg`：分界折线 run `w=27`（与水平夹角 **55.98°**），色带 y=59 宽度 **54/42/44**，三色路径 `M27 19 L54 59 27 99 0 59 Z` / `M27 19 L69 19 L96 59 69 99 27 99 54 59 Z` / `M69 19 L113 19 140 59 113 99 69 99 96 59 Z`，色值逐字沿用现状；外轮廓六顶点真切线 **r=5** `clipPath`（路径逐字采用 [candidates-review.md](./contracts/candidates-review.md) §3）；右下尖角三顶点 **r=2.5**（基准 (121.7,79.5)/(112.7,123.32)/(83.1,89.86)，§3 路径）；符号 2.8 笔画、文 @`(27,59)`、脑 @`(75,59.99)`、笔 @`(118,59)`；无渐变、无编辑器元数据
- [X] T006 [P] [US1] 新建候选 B「锋锐」`specs/005-modernize-logo-mark/candidates/candidate-b.svg`：分界折线 run `w=23`（**60.09°**），色带 **46/42/52**，三色路径 `M23 19 L46 59 23 99 0 59 Z` / `M23 19 L65 19 L88 59 65 99 23 99 46 59 Z` / `M65 19 L117 19 140 59 117 99 65 99 88 59 Z`；三色统一 **+10% L** `#f8a138` / `#2cbf77` / `#038bd5`；外轮廓六顶点真切线 **r=6** `clipPath`（§4）；右下尖角三顶点 **r=3**（§4）；符号 2.8 笔画、文 @`(23,59)`、脑 @`(67,59.99)`、笔 @`(114,59)`
- [X] T007 [P] [US1] 新建候选 C「极构」`specs/005-modernize-logo-mark/candidates/candidate-c.svg`：分界折线 run `w=21`（**62.3°**），色带 **42/42/56**（蓝带约占四成），三色路径 `M21 19 L42 59 21 99 0 59 Z` / `M21 19 L63 19 L84 59 63 99 21 99 42 59 Z` / `M63 19 L119 19 140 59 119 99 63 99 84 59 Z`；三色统一 **−12% L** `#eb8408` / `#23995f` / `#036fab`；外轮廓**非对称**真切线圆角（左端 r=9、右端 r=3、其余 r=5，§6 路径）；右下尖角三顶点 **r=3**（§6）；符号 **3.0** 笔画、文 @`(21,59)`、脑 @`(63,59.99)`、笔 @`(112,59)`
- [X] T008 [US1] 新建并排对比页 `specs/005-modernize-logo-mark/candidates/comparison.html`：单一自包含 HTML（零 JS、零外部请求、系统字体、内联样式）；4 个图标（现状内联快照 + A + B + C）以 `<defs><g id="…">` 各定义一次、`<use href="#…">` 引用；**4 行 × 4 档**渲染（128px、64px、高 22px、高 16px），22px 档为白底顶栏模拟条（白底 + 底部细边框），16px 档注明「favicon 按选定版派生，此列为完整图标缩至 16px 的等比模拟，非 favicon 资产」；每行标注代号 / 名称 / 杠杆摘要 / 口径（分界角度、节奏、圆角、色偏 Δ、符号数）；页内三版 `clipPath` id 唯一（`clip-a` / `clip-b` / `clip-c`）；页面 MUST NOT 引用 `public/` 路径或进入构建（依赖 T005–T007）
- [X] T009 [US1] 候选三版自查（实现阶段）：(i) 身份不变量——3 枚橙 → 绿 → 蓝向右箭头形色块、3 个白色符号（文 / 脑 / 笔）语义可读且各完整位于单一色带、右下尖角存在、无新增图形/文字/装饰、扁平无渐变、`viewBox` 4:3 宽高比变化 0%；(ii) 参数界限——A 55.98°/54-42-44/r=5、B 60.09°/46-42-52/r=6/+10% L、C 62.3°/42-42-56/非对称 r=9·5·3/3.0 笔画/−12% L；逐色 HSL 偏移 ≤20% 且色相不变（实测 A 0%、B +9.8~10.2% L、C −11.7~−12.1% L，ΔS ≤0.4%、ΔH ≤0.22°）；(iii) SC-003 几何预检——三符号笔画极差 0%、锚点 = 所属色带 y=59 横截面中点、墨迹到分色边界 ≥6.4 单位（最低 A 脑 7.09）、bbox 中心偏差 ≤0.25（文 y0.18 / 脑 0 / 笔 0）；(iv) 格式——`viewBox` 正确、单文件 ≤2KB（1544 / 1543 / 1535 B）、`clipPath` id 唯一、禁止项 `grep -nE '<image|<foreignObject|<script|data:image|draw\.io|host=|xmlns:v|<metadata|<linearGradient|<radialGradient|<filter'` 对 `candidate-a.svg`/`b.svg`/`c.svg` 无输出；(v) 对照 `comparison.html` 四档渲染（满足 FR-009 三档口径，128px 与 64px 同属「≥64px」档）逐版目视定性判断 SC-002 / SC-003（候选阶段**不逐版量化验收**）
- [ ] T010 [US1] **维护者选定**（人工门禁）：打开 `specs/005-modernize-logo-mark/candidates/comparison.html` 并排评审，从三版中选定一版（身份不变量为硬性门槛，其余取舍标准由维护者裁量）；在 `specs/005-modernize-logo-mark/candidates/SELECTION.md` 记录候选 id、选定人、日期、理由摘要、选定版关键参数与色值快照（尤其 C 的逐色微调 hex）
- [ ] T011 [US1] **SC-006 外部评审**（人工门禁，选定之后、合入之前，仅针对选定版）：由未参与设计的实验室老师（≥1 人，由维护者邀请；维护者本人与候选制作方均属「参与设计」，不得担任）在**无提示并排对照**下对「现状 vs 选定版」作出两项判定——「同一标识的现代化版本」与「更现代、未大改整体设计」（同一评审者作出、均须通过），结论（评审人身份、日期、两项判定）记入 `specs/005-modernize-logo-mark/candidates/SELECTION.md`；无法选定任一候选或任一项未通过 → **迭代候选**：回到 T005 重新生成三版并重跑 T008–T011（若失败根因在 T003 锁定的共用符号系统/色板，须先回到 T003 重新锁定参数再重生成），MUST NOT 进入 Phase 4；外部评审者不可得、意见不一致、迭代轮数上限等流程异常不在本轮定义，由维护者届时裁量

**Checkpoint**: US1 独立完成——三版候选 + 对比页 + 选定记录 + SC-006 结论齐备，站点零改动

---

## Phase 4: User Story 2 - 小尺寸下依然干净利落 (Priority: P2)

**Goal**: 把选定版落位为最终完整图标并派生同源 favicon，使约 22px 顶栏、16px 标签页与 64px 以上尺寸下的观感达标（SC-002 / SC-003）

**Independent Test**: 用 `sharp`（Astro 图像管线间接提供，**不新增依赖**）把 `public/logo.svg` 光栅化到 16 / 22 / 64 / 128 / 256px、`public/favicon.svg` 到 16 / 32px，新旧并排目视：22px 三色边界清晰、白色为均匀点缀无糊块/脏边/锯齿；64px 以上文 / 脑 / 笔可逐个辨认；favicon 16px 三色可辨、向右箭头轮廓可辨；并按几何量测笔画极差、中心偏差与安全边距。

### Implementation for User Story 2

- [ ] T012 [P] [US2] 落位完整图标 `public/logo.svg` = `candidates/SELECTION.md` 记录的选定候选**原样内容**（仅允许无语义空白 / 注释差异；几何、圆角、尖角、色值、符号参数与该候选完全一致，不重新设计）；与 T013 的 favicon 属**同一次变更**（同一提交落位，MUST NOT 出现「logo 已换、favicon 仍旧」的中间态）（依赖 T011 通过）
- [ ] T013 [P] [US2] 派生并落位 `public/favicon.svg`：保留选定候选**完全相同**的三条三色路径、同套圆角处理（A r=5 / B r=6 / C 非对称 r=9·5·3）与同色值；去除三个白色辅助符号与右下尖角；`viewBox="-10 -21 160 160"` 方形画布、透明底、纯矢量无字体/外部引用/位图（FR-004；候选阶段未产出 favicon，此任务为首次派生）（依赖 T011 通过）
- [ ] T014 [US2] 同源性与格式核对：比对 `public/logo.svg` 与 `public/favicon.svg` 的三条路径 `d`、`fill` 色值与圆角处理一致；favicon 无 `#ffffff`、无尖角、无符号；logo 色值仅 `#f7941d` / `#28ae6c` / `#037ec2` / `#ffffff`（选定 B/C 时为 `SELECTION.md` 记录的微调 hex，逐字一致）；两份文件各 ≤2KB；`viewBox` 分别为 `0 19 140 105` / `-10 -21 160 160`；三版均含且仅含一个 `clipPath`、尖角路径位于裁切组外
- [ ] T015 [US2] SC-003 数值量测（以 `public/logo.svg` 的 viewBox 坐标直接量测）：三个符号 `stroke-width` 极差 ≤10%（选定 A/B 均 2.8、C 均 3.0 → 极差 0%）；符号墨迹中心与所属色带 y=59 横截面中点偏差 ≤4 单位（色带高度 80 的 5%，锚点即中点）、墨迹 bbox 中心偏差 ≤0.25 单位；墨迹到最近分色边界 ≥6.4 单位（80 × 8%，选定 C 按重排后色带几何复核）；白色墨迹无越界、未跨越分色边界；内容覆盖率宽高均 ≥90%
- [ ] T016 [US2] 尺寸矩阵光栅化目视（临时目录，**不提交任何 PNG/脚本**）：`public/logo.svg` → 16 / 22 / 64 / 128 / 256px，并与旧版（`git show HEAD:public/logo.svg` 写入临时目录）同尺寸并排；`public/favicon.svg` → 16 / 32px，新旧并排；覆盖 DPR 2 / 3 与深、浅标签栏背景；判定 SC-002 / FR-003（22px 干净、64px 以上符号可辨、16px favicon 三色与箭头轮廓可辨、高 DPR 边缘清晰无裁切变形），完成后 `rm -rf` 临时目录

**Checkpoint**: US2 独立完成——最终资产成立且小尺寸达标；此时站点页面尚未接入（`Navbar.astro` 回退属性仍为 32×32，CSS `height:1.2em` 下无视觉差异）

---

## Phase 5: User Story 3 - 全站一致替换，既有版式不被打扰 (Priority: P3)

**Goal**: 顶栏回退比例修正后，全站顶栏与标签页一致呈现新图标；门禁、负向用例、视口回归与改动范围全部收敛

**Independent Test**: 逐一打开 Home / News（列表与详情）/ Team / Publications，核对顶栏与标签页为新图标、品牌区行为与改版前一致；四档视口与 320px 下限无布局破损；`npm run check` + `npm run build` 全绿；构建期资源校验负向用例仍报错中断。

### Implementation for User Story 3

- [ ] T017 [US3] 修改 `src/components/Navbar.astro`：**仅**把 `<img class="brand-logo" ... width={32} height={32} />` 改为 `width={40} height={30}`（4:3，与 140:105 内在比例一致，修正回退宽高比）；品牌区结构（左 logo + 右 `{site.navBrand}`）、`alt=""`、回主页链接、`.brand-logo { height: 1.2em; width: auto; }`、`.brand` 的 `inline-flex` / `gap` / `white-space: nowrap` / `flex: 0 0 auto`、导航项与 `aria-current` 逻辑、无灯箱/无 JS 事件**全部不变**；MUST NOT 新增 CSS 类、断点、媒体查询或 `aspect-ratio`（依赖 T012）
- [ ] T018 [US3] 机器门禁：在仓库根执行 `npm run check`（预期 0 errors / 0 warnings / 0 hints）与 `npm run build`（预期 `[build] Complete!`、18 page(s) built），100% 通过（FR-008 / SC-005；脚本定义见 `package.json`）（依赖 T012、T013、T017）
- [ ] T019 [US3] 构建期校验负向用例（MUST 全部还原）：(a) `mv public/logo.svg public/logo.svg.bak` → `npm run build` 确认**报错中断**、错误信息指向 `src/data/site.json` 的 `logo` 字段与目标路径 → 还原；(b) 临时把 `src/data/site.json` 的 `logo` 改为 `/logo-missing.svg` → 构建报错 → 还原；两次还原后复跑 `npm run build` 确认恢复绿色；**不得把临时改动或 `.bak` 文件提交**（FR-008 / SC-005；须在 T018 之后、且不与其它构建任务并行执行）
- [ ] T020 [US3] 全站页面核对（Home、News 列表与详情、Team、Publications）：逐页确认 `src/components/Navbar.astro` 渲染的 `img.brand-logo`（`src={withBase(site.logo)}`）为新 logo、`src/components/BaseLayout.astro` 的 favicon 引用（`public/favicon.svg`）为新标签页图标（硬刷新 / 新会话排除缓存）、仓库不再引用或显示旧图标；品牌区点击回主页、logo 不被点击放大 / 触发灯箱；可访问名仍由文字 "CIGMA" 提供（logo `alt=""`）（FR-006 / SC-004）
- [ ] T021 [US3] 视口回归：375 / 768 / 1024 / ≥1280px 四档 + 320px 最窄下限 + 575 / 767 / 1279px 边界断点，逐档核对 `src/components/Navbar.astro` 的品牌区与 `public/logo.svg`：同一行不断折、不与导航重叠/截断/挤压、页面无横向滚动（`document.documentElement.scrollWidth <= innerWidth`）、logo 渲染尺寸约 29.4×22.1（4:3，`1.2em` × `1.15rem` × 16px 根字号）且未拉伸（实测若有偏差仅记录，MUST NOT 为凑尺寸改动字号/布局——FR-006 / FR-007）、其余版式（字体/字号/间距/配色）与改版前一致（FR-006 / FR-008 / SC-004）
- [ ] T022 [US3] 旧资产 / 旧引用 / 评审产物隔离审计：`git grep -nE "logo\.svg|favicon\.svg" -- src public` 仅命中 `src/data/site.json` 与既有组件引用；`find public -maxdepth 1 -name '*.svg'` 仅两份资产；`git grep -nE "candidate-[abc]\.svg|comparison\.html" -- src public` 无输出；确认 `dist/` 无 `candidates/` 产物、无旧图标副本（SC-004 / FR-004 / FR-007）
- [ ] T023 [US3] 改动范围审计：`git status --short` 与 `git diff --stat` 显示站点代码仅 `public/logo.svg`、`public/favicon.svg`、`src/components/Navbar.astro`（另有 `specs/005-modernize-logo-mark/` 特性文档与 `candidates/` 评审产物）；`src/data/site.json`、`src/components/BaseLayout.astro`、`src/content.config.ts`、`src/styles/global.css`、页面与数据文件 diff 为空；`package.json` / `package-lock.json` / `astro.config.mjs` / `.github/workflows/deploy.yml` 无依赖或构建链改动；两份资产与 `Navbar.astro` 属性**同一提交**（FR-007 / SC-005）

**Checkpoint**: 三个用户故事全部完成——新图标已全站生效，门禁与版式无回归

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 跨故事收口——Definition of Done 走查、旧新并排终验、清理与零新增确认

- [ ] T024 [P] 按 [quickstart.md](./quickstart.md) §13 Definition of Done 逐条走查 FR-009 与 SC-001–SC-006：确认 `candidates/SELECTION.md` 同时含选定记录与 SC-006 两项判定（时点在合入前、仅针对选定版、不覆盖 favicon）；确认候选阶段 SC-002 / SC-003 仅为目视定性判断、量化验收仅针对选定版；旧新并排（`git show HEAD:public/logo.svg` vs `public/logo.svg`，≥128px）逐条核对身份不变量清单与「同一标识的现代化版本」结论一致
- [ ] T025 [P] 清理与零新增确认：删除光栅化临时目录与本地 PNG/脚本（`.tmp*` 不提交）；`public/` 无旧图标备份文件、`candidates/` 未产出 favicon 变体；确认零新增依赖、零新增 JS、零新增 CI 步骤、零新增页面/路由/数据字段（FR-007 / Constitution V）

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖，可立即开始
- **Foundational (Phase 2)**: 依赖 T002（目录与现状基线核对）——**阻塞全部用户故事**
- **User Stories (Phase 3–5)**:
  - US1 (P1) 只依赖 Foundational
  - US2 (P2) 依赖 **US1 的 T011（选定 + SC-006 通过）**——无选定版则不得派生 favicon、不得落位资产
  - US3 (P3) 依赖 **US2 的 T012/T013（两份资产已同次落位）**
  - 阶段二是原子变更链：US2 与 US3 必须按序推进，US3 的 T017–T023 完成前**不得提交**阶段二改动
- **Polish (Phase 6)**: 依赖所有目标用户故事完成

### User Story Dependencies

- **US1 (P1)**: Foundational 后可开始——站点零改动，候选评审可独立进行
- **US2 (P2)**: US1 选定与 SC-006 均通过后可开始（无通过记录即阻塞）
- **US3 (P3)**: US2 两份资产落位后可开始（复用同一份资产，不重复替换）

### Within Each User Story

- **US1**：T003/T004（共用参数）→ {T005, T006, T007 并行} → T008（对比页，需三版齐备）→ T009（三版自查）→ T010（维护者选定）→ T011（SC-006）
- **US2**：T012 与 T013 并行 → {T014 同源性核对、T015 几何量测、T016 尺寸矩阵}；T014 依赖 T012 + T013，T015 依赖 T012，T016 依赖 T012 + T013
- **US3**：T017（Navbar 一处属性）→ T018（门禁）→ T019（负向用例，独占执行）→ {T020 全站页面、T021 视口回归、T022 引用审计、T023 范围审计}；T020–T023 依赖 T017 + T018，T023 必须在 T019 全部还原后执行

### Parallel Opportunities

- T002 可与 T001 并行（目录创建/基线核对 vs 门禁执行）
- T003 与 T004 可并行（符号/色板锁定 vs 格式/边界锁定，不同关注点）
- T005、T006、T007 可并行（三份不同候选文件，共用 T003/T004 参数）
- T012 与 T013 可并行（`public/logo.svg` vs `public/favicon.svg`，不同文件）
- T020、T021、T022 可并行（浏览器核对、视口回归、引用审计，互不写文件）；T019 须避开并行的构建/浏览器任务
- T024 与 T025 可并行

---

## Parallel Example: User Story 1

```bash
# 共用参数锁定后，三版候选可同时产出（不同文件）：
Task: "T005 新建 candidates/candidate-a.svg（保守：符号系统化）"
Task: "T006 新建 candidates/candidate-b.svg（中度：+ r=4 圆角）"
Task: "T007 新建 candidates/candidate-c.svg（大胆：节奏/圆角/色彩/重量）"

# 三版齐备后再建对比页（依赖三份几何定义）：
Task: "T008 新建 candidates/comparison.html（4 行 × 4 档、零 JS）"
```

## Parallel Example: User Story 2

```bash
# 选定 + SC-006 通过后，两份最终资产可并行落位：
Task: "T012 落位 public/logo.svg（选定候选原样）"
Task: "T013 派生 public/favicon.svg（同源简化、无符号无尖角）"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. 完成 Phase 1: Setup（T001–T002）
2. 完成 Phase 2: Foundational（T003–T004）——CRITICAL，锁定符号系统与格式
3. 完成 Phase 3: US1（T005–T011）
4. **STOP and VALIDATE**：在对比页上完成三版身份不变量核查、维护者选定与 SC-006 外部评审
5. 此时设计决策已成立、站点零改动——可先交付评审结论，不急于改资产

### Incremental Delivery

1. Setup + Foundational → 参数与评审工作区就绪
2. US1 → 三候选 + 对比页 + 选定 + SC-006 → 设计决策（MVP）
3. US2 → 两份最终资产 + 小尺寸达标 → 资产可独立评审
4. US3 → Navbar 属性 + 门禁 + 负向用例 + 视口回归 → 全站生效（三处改动同一提交）
5. Polish → DoD 走查 + 清理 → 收口

### Parallel Team Strategy

1. 团队共同完成 Setup + Foundational
2. Foundational 完成后：
   - 设计者 A：US1 的 T005–T009（三候选 + 对比页 + 自查）
   - 维护者：T010 选定 → 邀请实验室老师完成 T011
3. 选定与 SC-006 通过后：
   - 开发者 B：T012–T016（落位、派生、同源性、量测、尺寸矩阵）
   - 开发者 C：T017–T023（接入、门禁、负向用例、视口、审计）——须等 T012/T013
4. Polish 由维护者与开发者共同收口

---

## Notes

- **`[P]` 语义**：不同文件、无未完成任务依赖；标 [P] 的三份候选共用 T003/T004 参数，**不得**在各自文件中重新定义色值或符号形态
- **`[Story]` 标签**：将任务映射到具体用户故事，便于追溯；Setup / Foundational / Polish 不含故事标签
- T010 与 T011 是**人工门禁**：维护者选定与未参与设计的实验室老师评审，实现方不得代为填写或跳过；未通过即按 T011 的迭代路径回到 T005
- 候选阶段 MUST NOT 产出 favicon 变体；favicon 在 T013 首次派生，且必须与 `public/logo.svg` 同一次变更落位
- SC-002 / SC-003 的量化验收仅针对选定版（T015 / T016）；候选阶段仅作目视定性判断（T009）
- 光栅化复用 `node_modules` 中 Astro 间接提供的 `sharp`，**不写入 `package.json`、不提交脚本、不属于构建链**；PNG 仅存临时目录
- 阶段二改动（T012、T013、T017）MUST 在同一提交内完成，避免出现"logo 已换、favicon 仍旧"的中间态
- 旧版资产仅可经 `git show HEAD:public/logo.svg`（及 favicon）取用做并排比对，不得作为仓库文件留存
- 部署后线上渲染核对由 CI / 既有维护工作流承载，**不属本特性任务范围**
- 避免：模糊任务、同文件冲突、跨故事依赖破坏独立性；任何超出三文件收敛范围的改动都视为越界
- **迭代 2（2026-10-20）**：首轮三版（53.1° / 60-40-40 / 18 框 2.7 笔画）未被维护者选定——反馈为「还可以做出更多的改变，而不是局限于当前的样式」。按 T011 的失败路径回到 T003 重新锁定符号系统 / 色板 / 几何杠杆，并重生成 T005–T009。
- **迭代 3（2026-10-20）**：维护者指出迭代 2 三版均丢失「大脑电路」符号，指定「文 / 脑 / 笔 各占一带」重做。再次回到 T003 锁定三符号系统（绿带统一 42、脑 20.6×15.0 单线脑形、笔画 2.8/3.0），重生成 T005–T009；T010 / T011 仍为待执行的人工门禁，阶段二未开始、站点代码零改动。
