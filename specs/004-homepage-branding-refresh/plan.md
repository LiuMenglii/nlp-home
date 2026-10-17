# Implementation Plan: 主页品牌焕新（Homepage Branding Refresh）

**Branch**: `004-homepage-branding-refresh` | **Date**: 2026-10-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-homepage-branding-refresh/spec.md`

## Summary

对站点做一次**品牌焕新**，改动范围**仅限主页课题组名栏与站点级共享元素**（顶部栏、底部栏、favicon、标签页标题/描述）。表现层沿用 001/002/003 既有技术栈（Astro 7.x 静态站点 + 组件级 scoped CSS，零新依赖、零新 JS）；命名与品牌文案收敛到 `site.json` 字段（FR-006），logo 为仓库内纯矢量静态资源；新增一条构建期「站点品牌数据校验」（FR-011，`content.config.ts`，与 teachers 照片/gallery 既有校验同型：静态资源路径合法性 + 命名字段存在且非空）。覆盖四项：

1. **Logo 现代化**（US1 / FR-001/FR-002/FR-008）：以原站 `images/icon.drawio.svg` 为基础产出**纯矢量**新 logo——保留橙/绿/蓝三色依次排列、向右延展的 V 形（chevron）主体构图，及原图中白色**翻译/语言符号**与**笔形符号**；仅做细节现代化（几何清理、轮廓统一、色值小幅微调——三色**色相不变**、明度/饱和度偏移 ≤10%），去除 draw.io 导出痕迹与内嵌位图（原两处白色符号是 `data:image/svg+xml` 内嵌 `<image>`，本次**内联为原生 `<path>`**）。交付 `public/logo.svg`（完整标识）+ `public/favicon.svg`（同源简化·仅三色 V 形主体，替换现 "G3" 蓝底方块）。
2. **顶部栏品牌区改造**（US2 / FR-003）：品牌区由纯文字 "G3 CIGMA" 改为**「左 logo 图形 + 右文字 CIGMA」**组合，整体为指向主页的链接；logo 为装饰性图形（`alt=""`，品牌区可访问名由文字 "CIGMA" 提供），MUST NOT 绑定任何点击放大/灯箱行为（点击品牌区唯一行为是导航至主页，既有 Gallery lightbox MUST NOT 扩展到 logo/品牌区）；顶栏不再出现 "G3" 字样。
3. **主页名栏分层改版**（US3 / FR-005）：名栏由「kicker(iie-CIGMA) → h1(G3 CIGMA) → 研究所 → 标签」改为**四层命名体系**——① 机构归属链行：`{instituteZh} · {lab}` =「中国科学院信息工程研究所 · 第六研究室/智能认知安全研究室」（以 "·" 显式表达研究所 ⊃ 研究室 ⊃ 课题组的三级从属）② 主名称 h1：`{groupName} {navBrand}` =「认知智能生成课题组 CIGMA」（**由 `${groupName}` + 一个空格 + `${navBrand}` 组合派生**，不设完整名称/中文简称字段）③ 别名 + 英文全称行：`{alias} · {fullName}` =「G3课题组 · Cognitive Intelligence with Generative and Multimodal Algorithms」④ 研究方向标签（保持不变）；研究所英文全称不在名栏重复（由底部栏保留）；删除 "iie-CIGMA"。
4. **底部栏命名更新**（US4 / FR-004）：名称行由 "G3 CIGMA" 改为"认知智能生成课题组 CIGMA"（由 `${site.groupName} ${site.navBrand}` 组合派生，模板行结构不变）。

命名（机构中文名 `instituteZh`、研究室归属 `lab`、课题组中文名称 `groupName`（不含品牌字）、别名 `alias`、英文全称 `fullName`、导航品牌文字 `navBrand`、logo/favicon 路径）全部进入 `src/data/site.json`，模板只读字段（FR-006/SC-004）；**完整主名称由 `${groupName} ${navBrand}` 组合派生**（名栏 h1、底栏名称行、其余页标题），标签页标题由站点数据派生——主页 `{groupName} - {instituteZh}`（=「认知智能生成课题组 - 中国科学院信息工程研究所」），其余页 `{页名} · {groupName} {navBrand}`（FR-007）。

## Technical Context

**Language/Version**: TypeScript 5.x（Astro 内置）；Node.js ≥ 22 LTS；Astro ^7.3.8（沿用现状，lockfile 已锁定）

**Primary Dependencies**: `astro`（唯一运行依赖，不变）；devDependencies `@astrojs/check` + `typescript`（不变）。**本特性零新增依赖、零新增 JS**。

**Storage**: **数据改动仅限 `src/data/site.json`**——新增品牌命名字段（`instituteZh`/`lab`/`alias`/`navBrand`）与静态资源路径字段（`logo`/`favicon`）、调整取值字段（`groupName`→「认知智能生成课题组」（不含品牌字）、`fullName`）；**不引入 `groupNameZh` 等冗余字段**（完整主名称由 `${groupName} ${navBrand}` 组合派生）；`institute`/`directions`/`admissions` 取值不变。**新增静态资产**：`public/logo.svg`（新）、`public/favicon.svg`（替换旧 "G3" 方块）。`src/content.config.ts` 新增一条「站点品牌数据校验」（FR-011：资源路径 + 命名字段非空，与 teachers `photo` / gallery `src` 校验同型的显式例外）。其余数据文件（teachers/students/graduates/publications/gallery）与全部 collection schema 字段定义**零改动**。

**Testing**: 沿用 001/002/003 口径——`npm run check` + `npm run build` 作为 CI 门禁（照常通过）；品牌/布局验收为 quickstart.md 浏览器视口矩阵（375 / 768 / 1024 / ≥1280px + 边界 575 / 767 / 1279px，并向 320px 覆盖，FR-009）+ 新 logo 与原 logo 并排比对（SC-001）；FR-011 以「临时构造缺失/改名资产或置空命名字段 → 构建报错 → 还原 → 构建恢复」负向用例验证。部署后（线上渲染）核对由 CI / 既有维护工作流承载，不属本特性任务范围。不引入 e2e / 视觉回归框架（Constitution V / YAGNI）。

**Target Platform**: 纯静态 HTML（GitHub Pages，`output: 'static'`）；现代浏览器（Chrome/Firefox/Safari/Edge 最新两个大版本）；验收视口 375 / 768 / 1024 / ≥1280px（FR-009）及边界 575 / 767 / 1279px，更窄覆盖至 320px。

**Project Type**: 静态网站（Astro `output: 'static'`，不变）

**Performance Goals**: 零 JS 新增；新 logo 为小体积 SVG（无位图、无外部请求），顶栏 `img` 显式 `width/height` 防布局抖动（CLS）；无资源热链、无渲染性能劣化。

**Constraints**: 变更 MUST 收敛于——`src/data/site.json`（品牌字段）、`public/logo.svg`(新) + `public/favicon.svg`(替换)、`src/components/Navbar.astro`（品牌区 markup）、`src/components/Hero.astro`（名栏分层）、`src/components/BaseLayout.astro`（favicon 来源 + 底栏名称行 + 站点描述默认值）、`src/pages/index.astro`（主页 `<title>` 取值，站点级元信息）、`src/pages/team|news|publications` 的 `.astro` 标题模板（**仅** `<title>` 派生式一次性对齐，若原为其它写法；FR-007）、`src/content.config.ts`（FR-011 站点品牌数据校验，显式例外）、`src/data/README.md`（字段文档同步）。**MUST NOT** 改动主页其余区块（Join Us / News / Team / Publications / Gallery）与 News/Team/Publications 页面正文内容/布局，**MUST NOT** 新增页面或路由（FR-010）。新 logo MUST 纯矢量、无 draw.io 属性、无 `<image>`/`foreignObject`/data-URI 内嵌（FR-002）；色值仅可小幅微调（色相不变、明度/饱和度偏移 ≤10%，FR-001）。品牌区 logo `alt=""` 且 MUST NOT 绑定点击放大/灯箱（FR-003）。主页标题 MUST 逐字为「认知智能生成课题组 - 中国科学院信息工程研究所」（由 `groupName`/`instituteZh` 派生，FR-007）。命名文案以用户明确给出的中文为主展示（不受 001 "固定文案以英文为主"惯例约束，spec Assumptions 已授权）。

**Scale/Scope**: 5 个源码文件（`Navbar.astro` / `Hero.astro` / `BaseLayout.astro` / `pages/index.astro` / `content.config.ts`）+ 可能需一次性对齐标题派生式的其余页 `.astro`（`news` / `team` / `publications`，仅 `<title>`）+ 1 个数据文件（`site.json`）+ 2 个静态资产（`logo.svg` 新增、`favicon.svg` 替换）+ 1 个文档（`src/data/README.md` 字段说明同步）；零新增目录、零新建公共 CSS 层。命名数据量：单对象 JSON 新增 6 字段（`instituteZh`/`lab`/`alias`/`navBrand`/`logo`/`favicon`）、调整 2 字段取值（`groupName`/`fullName`）；不设冗余简称/完整名称字段。

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原则 | Gate 检查项 | 状态 |
|------|------------|------|
| I. 内容准确性（不可妥协） | 新 logo 以原站 `images/icon.drawio.svg` 为唯一设计依据（保留三色 V 形主体 + 白色辅助符号，仅细节现代化，色相不变、明度/饱和度偏移 ≤10%，FR-001）；命名文案（机构中文名、研究室归属、主名称、别名、英文全称、顶栏/底栏名称、主页标题）逐字采用用户 spec 明确给出的取值，不凭推测填写；研究所行与方向标签取值零改动 | PASS |
| II. 内容与展示分离 | 全部命名与品牌文案收敛到 `site.json` 字段，Hero/Navbar/BaseLayout/index 只读字段（FR-006）；顶栏/底栏/名栏/标签页标题均数据驱动——完整主名称由 `${groupName} ${navBrand}` 组合派生（名栏 h1、底栏、其余页标题），主页标题 `{groupName} - {instituteZh}`、其余页 `{页名} · {groupName} {navBrand}`，后续任一命名调整只改 `site.json`（SC-004，10 分钟零模板改动）；`content.config.ts` 新增的站点品牌数据校验为 FR-011 的显式例外（字段定义不新增语义约束以外内容），并使「资源缺失/命名字段为空」在构建期显式暴露，强化数据/资源约定 | PASS（含 spec 授权例外） |
| III. 静态站点与 GitHub Pages | `output: 'static'`、构建流程、CI 门禁、部署方式不变；变更后 `astro check` + `astro build` 照常通过；logo/favicon 为仓库内相对路径引用的静态资产，**不热链外部资源**（FR-002）；FR-011 使缺失资源在构建期拦截、不合入发布分支 | PASS |
| IV. 简洁学术化设计 | 零新依赖、零新 JS、无动效；logo 现代化仅几何清理/色值微调，不引入渐变滥用/3D/重阴影；logo 不绑定点击放大/灯箱（无新增交互）；复用既有色板与标签模式；视觉基调不变（FR-001/FR-003 Assumptions） | PASS |
| V. 最小复杂度（YAGNI） | 5 个文件 + 1 数据文件 + 2 资产的小步改动，无新抽象、无公共工具类、无新构建环节；FR-011 复用既有「schema 内 `existsSync` 构建期校验」模式（不新增 CI 步骤） | PASS |

**无违规项。** FR-011 的站点品牌数据校验（资源路径合法性 + 命名字段非空）与 003 FR-016（teachers `photo` 校验）为同型显式例外，均由 spec 授权，不构成宪法违规。

**Post-design 复核（Phase 1 后）**：`data-model.md` / `contracts/site-branding.md` / `quickstart.md` 与 spec FR-001–FR-011 逐条对齐（含名栏四层从属链、完整主名称 `${groupName} ${navBrand}` 组合派生、命名间距、主页/其余页标题派生式、logo 色值与等高（渲染后矩形竖向高度相同，CHK040 修订口径）口径、灯箱禁绑）后复核，五原则仍**全部 PASS**，未引入新违规项。

## Project Structure

### Documentation (this feature)

```text
specs/004-homepage-branding-refresh/
├── plan.md                        # This file (/speckit-plan command output)
├── research.md                    # Phase 0 output——R1 logo 现代化与纯矢量化、R2 favicon 同源简化、
│                                  #   R3 顶栏品牌区（logo+CIGMA）、R4 名栏分层布局、R5 站点级元信息、
│                                  #   R6 品牌数据字段化、R7 FR-011 构建期资源校验、R8 验收方式、R9 宪法合规
├── data-model.md                  # Phase 1 output——SiteBrand（site.json 字段）+ LogoMark/简化 favicon
│                                  #   （资产契约、原图要素提取与内联映射）
├── quickstart.md                  # Phase 1 output——品牌/视口验证矩阵 + logo 比对 + FR-011 负向用例
├── contracts/
│   └── site-branding.md           # 站点品牌契约：顶栏品牌区、名栏分层、底栏名称、favicon/标题元信息、
│                                  #   site.json 数据契约、资源构建期校验、不变量与回归范围
└── tasks.md                       # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
nlp-home/
├── src/
│   ├── components/
│   │   ├── Navbar.astro           # 【改动】品牌区 `<a class="brand">` 由纯文字 "G3 CIGMA" 改为
│   │   │                          #   「左 <img src={withBase(site.logo)} alt="" width/height> + 右
│   │   │                          #   <span>{site.navBrand}</span>」，整体仍为指向主页的链接（logo 装饰性、
│   │   │                          #   不绑定点击放大/灯箱）；新增 img 尺寸与窄屏不重叠的 scoped CSS
│   │   ├── Hero.astro             # 【改动】名栏改为四层：① .hero-affil（`{site.instituteZh} · {site.lab}`）
│   │   │                          #   ② h1（`{site.groupName} {site.navBrand}` 组合派生）③ .hero-alias
│   │   │                          #   （site.alias · site.fullName，窄屏优雅换行）④ 方向标签（不变）；
│   │   │                          #   删除 .hero-kicker（iie-CIGMA）与 .hero-institute（研究所英文全称改由底部栏保留）
│   │   └── BaseLayout.astro       # 【改动】favicon href 由硬编码 '/favicon.svg' 改为 withBase(site.favicon)；
│   │                              #   底栏 .footer-name 改为 `${site.groupName} ${site.navBrand}` 组合派生；
│   │                              #   description 默认值沿用 `${site.groupName}, ${site.institute}`（随数据更新）
│   ├── content.config.ts          # 【改动·FR-011 显式例外】新增站点品牌数据校验：
│   │                              #   读 src/data/site.json，校验 logo/favicon 为合法相对路径且文件存在于 public/，
│   │                              #   且 instituteZh/lab/groupName/alias/navBrand 存在且非空
│   │                              #   （复用 gallery/teachers 的 existsSync 构建期校验模式）；其余 schema 零改动
│   ├── data/
│   │   ├── site.json              # 【改动·数据】新增 instituteZh / lab / alias / navBrand /
│   │   │                          #   logo / favicon；groupName 调整为「认知智能生成课题组」（中文名称，不含品牌字；
│   │   │                          #   不设 groupNameZh 冗余字段）、fullName 调整为英文全称（=Cognitive Intelligence
│   │   │                          #   with Generative and Multimodal Algorithms）；institute / directions / admissions 不变
│   │   └── README.md              # 【改动·文档】同步 site.json 字段说明（新字段含义、旧 "iie-CIGMA" 表述移除）
│   ├── pages/
│   │   ├── index.astro            # 【改动·站点级元信息】主页 `<title>` 由 `${site.groupName} · ${site.institute}`
│   │   │                          #   改为 `${site.groupName} - ${site.instituteZh}`（其余区块零改动）
│   │   └── team / news / publications  # 【仅标题模板】正文内容与布局零改动；`<title>` 若原为其它写法，
│   │                              #   一次性对齐为 `${页名} · ${site.groupName} ${site.navBrand}` 派生式（FR-007）
│   └── styles/global.css          # 【零改动】色板/容器/正文字号不变
├── public/
│   ├── logo.svg                   # 【新增】现代化后的完整课题组 logo（三色 V 形主体 + 内联白色语言符号/笔形符号）
│   └── favicon.svg                # 【替换】同源简化版（仅三色 V 形主体），替换现 "G3" 蓝底方块
└── .github/workflows/deploy.yml   # 【零改动】CI 门禁照常拦截构建失败
```

**Structure Decision**: 沿用 001–003 的单一 Astro 项目结构，新资产直接置于既有的 `public/` 根（与 `favicon.svg` 同层级），不新增目录、不新建公共 CSS 工具类（改动点彼此独立，抽公共层违反 YAGNI）。命名与品牌文案的**唯一数据源**为 `src/data/site.json`（直接 `import`，继承 001 §7 约定）；完整主名称由 `${groupName} ${navBrand}` 组合派生，不设冗余简称/完整名称字段。FR-011 的站点品牌数据校验（资源路径 + 命名字段非空）作为既有「schema 层 `existsSync` 构建期校验」惯例的延伸放在 `content.config.ts`（不新增构建脚本或 CI 步骤）。顶栏/底栏/名栏/主页标题四处展示共用同一份数据字段，天然满足 SC-004。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

无违规项，无需记录。
