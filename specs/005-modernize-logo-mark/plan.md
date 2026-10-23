# Implementation Plan: 课题组图标现代化（Logo Mark Modernization）

**Branch**: `005-modernize-logo-mark` | **Date**: 2026-10-17（同日按 spec 澄清会话修订：三候选 + 对比页 + ±20% / ≤20% 放宽口径；2026-10-20 按 spec 澄清会话修订：SC-006 评审者口径、失败路径 = 迭代候选、候选阶段定性评审、favicon 验收口径；同日勘误：顶栏实际渲染高度由约 24.8px 修正为约 22.1px——原推导误把 rem 按 body 18px 计算，rem 实相对 html 根元素 16px 解析，各档口径同步修正；同日**迭代 2**：首轮候选未被选定，按失败路径重锁参数并重做三版——分界角度、节奏、圆角、符号光学框与明度杠杆全部推进；同日**迭代 3**：迭代 2 三版丢失「大脑电路」符号，维护者指定「文 / 脑 / 笔 各占一带」重做——三符号恢复、绿带统一 42、脑符号同语义重绘） | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-modernize-logo-mark/spec.md`

## Summary

以仓库内现有的课题组标识（`public/logo.svg`，三色向右 chevron 主体 + 白色辅助符号 + 右下蓝色尖角）为唯一设计依据，按 spec FR-009 的评审工作流交付：**先产出三版候选标识 + 单一并排对比页供维护者选定，选定版通过 SC-006 外部评审后，再派生 favicon 并全站替换**。技术路线沿用 001–004 的静态站点基线（Astro 7.x + 组件级 scoped CSS，**零新增依赖、零新增 JS**）。

**阶段一 · 设计与评审（FR-009）**——产出物全部位于 `specs/005-modernize-logo-mark/candidates/`（评审用产物，MUST NOT 进入 `public/` / `src/` 站点交付物）：

1. **三版候选**（均满足 FR-001 身份不变量与放宽口径：整体宽高比相对现状变化 ≤20%、三色明度/饱和度偏移 ≤20%、色相不变、无渐变；白色符号 1–3 个）。**迭代 3（2026-10-20）**：迭代 2 三版（2 个符号：文 + 笔）丢失「大脑电路」符号，维护者指定「文 / 脑 / 笔 各占一带」重做——三符号全部恢复、绿带统一 42 单位、脑符号按同语义重绘为 20.6×15.0 单线脑形，三版为：
   - **候选 A「疾进」**（几何升级）：分界折线 `w=27`（55.98°）、色带 **54/42/44**（橙带最宽，推进起点最平缓）、外轮廓六顶点真切线 **r=5** 圆角（`clipPath`）、尖角 r=2.5；三符号 **2.8 笔画**（文 17.2×18.3 / 脑 20.6×15.0 / 笔 18.7×18.4）；三色色值逐字保留（色偏 0%）——现代化来自角度、节奏与圆角。
   - **候选 B「锋锐」**（几何 + 提亮）：分界 60.09°、色带 **46/42/52**、外轮廓 **r=6**、尖角 r=3；三色统一 **+10% 相对明度**（`#f8a138` / `#2cbf77` / `#038bd5`，色相锁定）；三符号 2.8 笔画——现代化来自更陡的动势、更重的圆角与更鲜活的色板。
   - **候选 C「极构」**（最大跨度）：分界 **62.3°**、色带 **42/42/56**（蓝带约占四成）、**非对称圆角**（左端 r=9、右端 r=3、其余 r=5）、三色统一 **−12% 相对明度**（`#eb8408` / `#23995f` / `#036fab`）、三符号 **3.0** 笔画、尖角 r=3——把比例、圆角、色板与符号重量一次性拉开。
   - 三版画布均保持 `140×105`（4:3）——宽高比变化 0%：±20% 杠杆仍刻意不用（内在尺寸与顶栏布局零位移，见 [research.md](./research.md) R10 / R13）。
2. **并排对比页**（`comparison.html`）：单一自包含 HTML（4 个图标以内联 `<defs>` + `<use>` 定义一次、多处引用；零 JS、零外部请求），现有图标 + 三版候选各一行，每行展示 128px / 64px / 顶栏 22px（白底条模拟）/ 16px（完整图标缩至 16px 的模拟渲染；favicon 按选定版派生，不在候选阶段逐版产出）四档渲染，并标注每版杠杆与口径使用（分界角度 / 节奏 / 圆角 / 色偏 Δ / 符号数）。
3. **选定与评审**：维护者从对比页选定一版（身份不变量为硬性门槛，其余取舍交由维护者裁量；记录于 `candidates/SELECTION.md`）→ 选定版做 SC-006 新旧并排外部评审——评审者为**未参与设计的实验室老师**（≥1 人，由维护者邀请；维护者本人与候选制作方均属"参与设计"，不得担任），在无提示的并排对照下由**同一评审者**作出"同一标识的现代化版本"与"更现代、未大改整体设计"两项判定，均须通过→ 通过后进入阶段二；维护者无法从三版中选定任何候选、或选定版未通过 SC-006 → **迭代候选**：重新生成三版候选并重新进入对比评审与选定流程（评审流程异常场景不定义，由维护者届时裁量）。迭代 2 与迭代 3 均按此路径发生：重锁 T003 参数 → 重生成 T005–T009（迭代 3 因"丢失大脑符号"恢复三符号）。

**阶段二 · 全站落地（US3 / FR-004–FR-008）**——改动收敛为**两份 SVG 资产 + `Navbar.astro` 中 `img` 的宽高比回退属性**：

- `public/logo.svg` ← 选定候选原样落位；`public/favicon.svg` ← 由选定候选派生的同源简化版（沿用既有策略：`-10 -21 160 160` 方形画布、三色箭头主体、无白色符号、无尖角、透明底），两者 MUST 同一次变更替换；
- `Navbar.astro` 的 `img` 回退宽高 32×32 → **40×30**（三版候选均保持 4:3 画布，回退比例固定 4:3）；
- `site.json` 路径、`BaseLayout` favicon 引用、`content.config.ts` 构建期校验与全部页面/数据**零改动**。

验收沿用既有口径：`npm run check` + `npm run build` 机器门禁；候选阶段仅经对比页三档渲染（≥64px / 约 22px / 16px 模拟）做目视定性判断（SC-002 / SC-003 不逐版量化验收，两者的量化验收仅针对选定版执行）；选定版与最终资产按 16 / 22 / 64 / 128 / 256px 光栅化并新旧并排目视，SC-003 的各项数值以设计文件几何量测；favicon 验收仅按 SC-002 的 16px 口径执行（SC-006 不覆盖 favicon，无需单独评审）；四档视口（375 / 768 / 1024 / ≥1280px）与 320px 下限回归；构建期资源校验以负向用例复核。

## Technical Context

**Language/Version**: SVG 1.1（手写纯矢量，无设计工具产物/无编辑器元数据）；HTML（对比页，零 JS、内联样式与系统字体）；TypeScript 5.x（Astro 内置）；Node.js ≥ 22 LTS；Astro ^7.3.8（沿用现状，lockfile 已锁定）

**Primary Dependencies**: `astro`（唯一运行依赖，不变）；devDependencies `@astrojs/check` + `typescript`（不变）。**本特性零新增依赖、零新增 JS**。审查期光栅化可临时复用 `node_modules` 中已由 Astro 图像管线间接提供的 `sharp`（**不写入 `package.json`、不提交脚本、不属于构建链**）。

**Storage**: 阶段一评审产物位于 `specs/005-modernize-logo-mark/candidates/`（`candidate-a/b/c.svg` + `comparison.html` + 选定后产生的 `SELECTION.md`），均在特性目录内，不进入站点构建与交付物；阶段二仅替换 `public/logo.svg` 与 `public/favicon.svg` 两份静态资产；`src/data/site.json` 的 `logo` / `favicon` 路径（`/logo.svg`、`/favicon.svg`）与其余字段**零改动**；`src/content/news/`、`src/data/*.json`、`src/styles/global.css` 全部零改动。

**Testing**: 沿用 001–004 口径——`npm run check`（`astro check`，0 error）与 `npm run build`（静态构建，18 页）作为 CI 门禁并须 100% 通过；候选验证以对比页（4 版 × 4 档尺寸）目视定性判断（候选阶段对 SC-002 / SC-003 不逐版量化验收）；选定版与最终资产以尺寸矩阵光栅化（16 / 22 / 64 / 128 / 256px，DPR 1–3）目视；SC-003 数值以选定版 SVG 几何（路径坐标 + 笔画宽度）直接量测；favicon 验收仅按 SC-002 的 16px 口径（SC-006 不覆盖）；布局回归为 quickstart.md 的视口矩阵（375 / 768 / 1024 / ≥1280px，覆盖至 320px）；构建期校验以「临时改名/改错资源 → 构建报错 → 还原 → 构建恢复」负向用例复核。**不引入** e2e / 视觉回归框架或新测试依赖（Constitution V / YAGNI）；部署后线上渲染核对由 CI / 既有维护工作流承载，不属本特性任务。

**Target Platform**: 纯静态 HTML（GitHub Pages，`output: 'static'`）；现代浏览器（Chrome / Firefox / Safari / Edge 最新两个大版本）；图标实际消费尺寸：顶栏约 22.1px（`1.2em` × `1.15rem` × 16px 根字号——rem 相对 html 根元素解析，`global.css` 仅设 body 18px）、浏览器标签页 16px，另需覆盖 64px 以上的放大查看与高 DPR 屏幕。对比页仅以浏览器直接打开（`file://` 或任意静态服务器），不部署。

**Project Type**: 静态网站（Astro `output: 'static'`，不变）；对比页为 specs/ 下的评审文档产物，不属站点页面。

**Performance Goals**: 零 JS 新增；单文件 SVG 体积 ≤ 2KB（原型 logo ≈ 1.0KB、favicon ≈ 0.5KB）；无外部请求、无字体依赖、无位图；两份资源的内在尺寸 / 宽高比不变（140×105 / 160×160）→ 顶栏品牌区无 CLS、无布局位移、无渲染性能劣化；对比页为评审产物，体积不作门禁（预期 ≤ 64KB）。

**Constraints**:

- **阶段一**：三版候选均 MUST 满足 FR-001 身份不变量（含放宽口径：宽高比变化 ≤20%、三色色相不变、明度/饱和度偏移 ≤20%、无渐变；白色辅助符号 1–3 个、完整位于单一色带内并保留安全边距；右下蓝色尖角 MUST NOT 删除）；候选文件 MUST 为纯矢量自包含（与最终资产同一格式规则）；对比页 MUST 为单一 HTML、零 JS、零外部请求、位于 `specs/` 特性目录内，MUST NOT 进入 `public/` 或 `src/`；favicon MUST NOT 在候选阶段逐版产出。
- **阶段二**：变更 MUST 收敛于——`public/logo.svg`（替换）、`public/favicon.svg`（替换）、`src/components/Navbar.astro`（仅 `img` 的 `width`/`height` 回退属性 32×32 → 40×30）。**MUST NOT** 改动 `site.json`、`BaseLayout.astro`、`content.config.ts`、`global.css`、任何页面/组件结构或内容。资产 MUST 为纯矢量自包含文件（无外部引用、无字体、无内嵌位图、无编辑器元数据、无脚本）；选定版色值以 `SELECTION.md` 记录为准（A 逐字 `#f7941d` / `#28ae6c` / `#037ec2`；B 统一 +10% L `#f8a138` / `#2cbf77` / `#038bd5`；C 统一 −12% L `#eb8408` / `#23995f` / `#036fab`；三版均色相锁定、偏移 ≤20%），白色 `#ffffff`；MUST NOT 引入渐变、阴影、发光、3D、纹理、动效或描边滥用；顶栏与较大尺寸 MUST 由同一份完整图标资产覆盖（不新增顶栏专用小尺寸资产）；顶栏 logo 渲染高度规则（`height: 1.2em; width: auto`）、品牌区结构（左 logo + 右文字 "CIGMA"）、回主页链接、装饰性语义（`alt=""`）MUST 保持不变，MUST NOT 绑定点击放大/灯箱。

**Scale/Scope**: 阶段一新增评审产物 5 个文件（3 候选 SVG + `comparison.html` + `SELECTION.md`，均在 specs/ 特性目录内，0 进入站点）；阶段二源码改动 3 个文件（2 份 SVG 资产 + `Navbar.astro` 一处属性）；新增 0 个依赖、0 个脚本、0 个站点页面/路由、0 个数据字段；设计文档 1 份 research、1 份 data-model、3 份契约、1 份 quickstart；图标几何以 0–140 × 19–124 的既有整数网格为基准（圆角切点、色带重排与圆弧坐标为派生值）。

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原则 | Gate 检查项 | 状态 |
|------|------------|------|
| I. 内容准确性（不可妥协） | 设计以仓库内现有 `public/logo.svg` 为唯一权威依据（其来源与逐字取色见 [004 research.md R1](../004-homepage-branding-refresh/research.md)）；身份不变量逐条对照 spec FR-001 与 SC-001，并以新旧并排比对确认；放宽口径（宽高比 ≤20% / L/S ≤20%）以 spec 2026-10-17 澄清会话为据，色相不变、无渐变仍为硬约束，不凭推测改色（C 的微调值须记录并按口径量测）；不涉及课题组信息、论文或成员内容 | PASS |
| II. 内容与展示分离 | 图标仅作为两份静态资产存在，仍经 `site.json` 的 `logo` / `favicon` 字段与既有组件引用，无路径与字段变更；候选与对比页为 specs/ 下的评审文档产物，不构成站点数据、模板或样式改动；后续替换图标仍只需替换 `public/` 文件 | PASS |
| III. 静态站点与 GitHub Pages | 站点构建产物与交付物零变化（阶段二仅 2 资产 + 1 属性）；对比页位于 specs/、不进入构建（`public/`/`src/` 之外）、不部署；`output: 'static'`、构建流程、CI 门禁与部署方式不变；既有「资源缺失/路径错误即构建报错」的 `content.config.ts` 校验继续生效（负向用例复核） | PASS |
| IV. 简洁学术化设计 | 三版候选均保持扁平矢量：无渐变、阴影、发光、3D、纹理、动效或描边滥用；无新增装饰性图形（白色符号分别承载语言/认知/书写语义）；对比页为零 JS、系统字体的静态评审工具，中性浅色版式、不加与评审无关的装饰；无新交互、零 JS | PASS |
| V. 最小复杂度（YAGNI） | 三候选与对比页为 FR-009 明确要求的工作流产物，非过度设计；不新增依赖、脚本、CI 步骤、公共 CSS 层或图标变体；候选复用同一符号系统与格式规则（A 与 B 仅差圆角一档、B 与 C 参数同族），控制探索成本；三符号以统一笔画与光学尺寸分级重绘，脑符号用 20.6×15.0 单线形替代 74 条命令的电路碎线（减法落在细节而非语义） | PASS |

**无违规项。** 三处范围判断均有 spec 明确授权：(1) 白色辅助符号保持 3 个并同语义重绘——spec 澄清 Q1 与 FR-001（数量 1–3）；(2) 新增 `candidates/` 评审产物——FR-009 明确要求且限定"不进入站点交付物"，不构成 FR-007 禁止的新增页面/路由/图标使用场景；(3) C 候选使用色彩微调杠杆——spec 澄清放宽口径（≤20%）且同样适用于最终合入版。

**Post-design 复核（Phase 1 后）**：`research.md`（R1–R12）、`data-model.md`、`contracts/logo-mark.md`、`contracts/candidates-review.md`、`contracts/site-integration.md`、`quickstart.md` 与 FR-001–FR-009、SC-001–SC-006 逐条对齐（三候选身份不变量与放宽口径、对比页四档渲染与自包含约束、选定 → SC-006 → favicon 派生 → 全站替换的流程与失败路径、`site.json` 与组件引用不变、视口与负向用例）后复核，五原则仍**全部 PASS**，未引入新违规项。2026-10-20 按 spec 澄清会话同步修订：SC-006 评审者 = 未参与设计的实验室老师（同一评审者作出两项判定）、失败路径 = 重新生成三版候选并重新进入评审、候选阶段 SC-002 / SC-003 仅目视定性判断、favicon 验收仅按 SC-002 的 16px 口径——修订后再次复核，仍全部 PASS。**迭代 2（2026-10-20）**：三版候选升级为 56.0° / 60.1° / 62.3° 分界、54/36/50 · 46/34/60 · 42/30/68 节奏、r=5 / r=6 / 非对称 r=9·5·3 圆角、22 框 / 3.2–3.4 笔画符号、色偏 0% / +10% L / −12% L。**迭代 3（2026-10-20）**：恢复文 / 脑 / 笔三符号，绿带统一 42（节奏 54/42/44 · 46/42/52 · 42/42/56），脑符号 20.6×15.0 单线形、三符号 2.8/3.0 笔画——所有杠杆仍在 spec 澄清 Q1 与 ±20% / ≤20% 放宽口径内，未新增图形/页面/依赖，画布与集成层不变，五原则仍**全部 PASS**。

## Project Structure

### Documentation (this feature)

```text
specs/005-modernize-logo-mark/
├── plan.md                        # This file (/speckit-plan command output)
├── research.md                    # Phase 0 output——R1 现状基线与身份不变量、R2 几何现代化、
│                                  #   R3 白色符号系统与数量决策、R4 色彩策略、R5 favicon 同源简化、
│                                  #   R6 集成点与最小改动、R7 验证方法、R8 风险与备选、R9 宪法合规、
│                                  #   R10 三版候选策略与探索跨度、R11 对比页实现方案、R12 选定与评审工作流
├── data-model.md                  # Phase 1 output——CandidateLogoMark / LogoComparisonPage / LogoMark /
│                                  #   AccentGlyph / FaviconMark / BrandAssetSet / SiteBrandReference 与量测规则
├── quickstart.md                  # Phase 1 output——候选评审与选定、门禁、尺寸矩阵、新旧比对、
│                                  #   视口回归、负向用例
├── contracts/
│   ├── logo-mark.md               # 最终资产契约（阶段二落位 public/ 的两份 SVG）：格式、口径包络、
│   │                              #   身份不变量、favicon 派生规则、渲染验收矩阵、变更协议
│   ├── candidates-review.md       # 候选集与评审工作流契约（FR-009）：三版候选参数规格（A/B/C）、
│   │                              #   统一符号系统、对比页结构与自包含约束、选定与 SC-006 流程
│   └── site-integration.md        # 站点集成契约：site.json / Navbar / BaseLayout / 构建期校验 / 门禁
├── candidates/                    # 阶段一评审产物（FR-009；MUST NOT 进入 public/ 或 src/）
│   ├── candidate-a.svg            # 候选 A「疾进」：56° 分界 + 节奏 54/42/44 + r=5 圆角 + 文/脑/笔 2.8 笔画（迭代 3）
│   ├── candidate-b.svg            # 候选 B「锋锐」：60° 分界 + 节奏 46/42/52 + r=6 圆角 + 三色 +10% L（迭代 3）
│   ├── candidate-c.svg            # 候选 C「极构」：62° 分界 + 节奏 42/42/56 + 非对称圆角 + 三色 −12% L（迭代 3）
│   ├── comparison.html            # 单一并排对比页：现状 + 三候选 × 128/64/22/16px 四档，零 JS
│   └── SELECTION.md               # 选定记录 + SC-006 评审结果（维护者选定后产生）
├── checklists/
│   └── requirements.md            # 既有规格质量清单（本阶段不改动）
└── tasks.md                       # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
nlp-home/
├── public/
│   ├── logo.svg                   # 【阶段二·替换】选定候选原样落位（三色 chevron 主体 + 圆角轮廓 +
│   │                              #   尖角 + 1–3 个白色辅助符号；色值按 SELECTION.md 记录）
│   └── favicon.svg                # 【阶段二·替换】选定候选的同源简化：同一三色路径 + 同一圆角轮廓，
│                                  #   无白色符号、无尖角，保留 -10 -21 160 160 方形画布与透明底
├── src/
│   ├── components/
│   │   ├── Navbar.astro           # 【阶段二·改动·仅一处】`img.brand-logo` 回退宽高 32×32 → 40×30
│   │   │                          #   （4:3，与三版候选内在比例一致，防 CLS）；品牌区结构、`alt=""`、
│   │   │                          #   `height:1.2em; width:auto`、链接与灯箱约束不变
│   │   └── BaseLayout.astro       # 【零改动】favicon 仍经 `withBase(site.favicon)` 引用
│   ├── content.config.ts          # 【零改动】站点品牌数据校验（资源存在性/路径合法性）继续生效
│   ├── data/site.json             # 【零改动】`logo` / `favicon` 路径与全部命名字段不变
│   └── styles/global.css          # 【零改动】色板、容器、字号不变
└── .github/workflows/deploy.yml   # 【零改动】CI 门禁（astro check + 构建）照常拦截构建失败
```

**Structure Decision**: 沿用 001–004 的单一 Astro 项目结构。图标属于 `public/` 根下的站点级静态资产（与 004 建立的位置一致），不新增目录、不新建公共 CSS 类、不新增构建脚本或 CI 步骤；评审产物收敛在 `specs/005-modernize-logo-mark/candidates/`（文档空间，不参与构建、不部署），使 FR-009 的候选/对比页/选定记录与站点交付物物理隔离。展示层唯一改动是修正 `img` 的宽高比回退属性（`32×32` 与 4:3 资源不符，属既有隐患，本次为满足 FR-006/FR-007 的"按原始宽高比展示"而顺带修正）。`site.json` 仍为图标路径的唯一数据源，`content.config.ts` 的构建期校验继续承担"资源缺失即构建失败"的职责，二者均无需改动。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

无违规项，无需记录。
