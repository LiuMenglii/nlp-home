# Implementation Plan: Publications 条目与年份导航响应式优化（Publications Responsive Layout）

**Branch**: `006-publications-responsive-layout` | **Date**: 2026-10-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-publications-responsive-layout/spec.md`

## Summary

本特性改 Publications 的**展示层**，并为论文数据新增 `date` 字段用于组内时间排序；展示层覆盖两处共享同一条目组件的界面：Publications 页（`/publications/`）与主页 Publications 概览（`/`）。技术路线沿用 001–003 的纯 Astro 静态站点 + 组件 scoped CSS，零新增依赖、零新增运行时 JS：

1. **论文条目三档布局**（US1 / FR-002～FR-005）：`PublicationItem.astro` 由当前「外层 flex-wrap + 内层 flex-wrap」改为**按档切换的单一 flex 容器**——宽屏（≥768px）外层 `nowrap` 固定「文本区 + 标签簇」两栏、文本区内部 `wrap` 利用 flex 断行的 max-content 判据实现「期刊名整体另起一行，不贴标题末行」；窄屏（576–<768px）`display: contents` 让标题与期刊名成为外层 flex item，标题独占第一行、期刊名与标签簇同处第二行；很窄屏（<576px）三行依次为标题、期刊名、右对齐标签簇。标签簇改为**固定双槽**（CCF 左槽、LINK 右槽），缺失槽渲染同构隐藏占位（`visibility: hidden` + `aria-hidden`，非可聚焦元素），保证同类标签跨条目落在同一条列线上；两标签都缺失时不渲染标签簇、不保留空槽。
2. **年份合并与手机导航**（US2 / FR-006～FR-008）：`publications.astro` 在 frontmatter 派生分组——2020 年及以后每年一组，2019 年及以前合并为「2019 & Earlier」一组（当前 16 条，锚点 `#year-2019-earlier`）；组内按新增的 `date` 降序、同日按标题字符串字典序升序（不引入 locale 规则）。年份导航 ≥768px 自然换行左对齐；<768px 视觉隐藏顶部年份导航（`display: none`，DOM MUST 保留），年份分组标题吸顶并显示该组计数。
3. **日期数据与一致性门禁**（US3 / FR-009～FR-012）：为 135 条论文新增 `date`——有链接必填；66 条 DOI 正式出版日期优先、无则用上线日期，59 条仅 arXiv 用 arXiv 首次提交日（v1），10 条无链接留空；空值条目在组内排末尾。主页条目随共享组件自动继承三档规则（`index.astro` 零改动）；锚点偏移按桌面粘性导航实际高度复核；`npm run check` + `npm run build` 照常通过。

改动收敛于 5 个文件：`src/components/PublicationItem.astro`（布局与双槽）、`src/pages/publications.astro`（年份合并、日期排序、移动端视觉隐藏导航与吸顶标题）、`src/components/CCFBadge.astro`（**必需**的宽度归一化，见 research R2）、`src/content.config.ts`（新增 `date` 字段）、`src/data/publications.json`（135 条回填 `date`）。`global.css`、`index.astro` 零改动。

## Technical Context

**Language/Version**: TypeScript 5.9.x（Astro 内置）；Node.js ≥ 22 LTS；Astro 7.3.8（lockfile 已锁定，沿用现状）

**Primary Dependencies**: `astro`（唯一运行依赖）；devDependencies `@astrojs/check` + `typescript`。**本特性零新增依赖、零新增 JS**。

**Storage**: N/A（纯静态站点）。`src/data/publications.json` 为构建期只读数据——135 条论文；本特性新增 `date` 字段（`YYYY-MM-DD`，无链接可空、有链接必填）并回填：66 条 DOI 正式出版日期优先、无则用上线日期，59 条仅 arXiv 用 arXiv 首次提交日（v1），10 条无链接留空；其余字段 `title` / `venue` / `year` / `ccf` / `url` / `featured` / `authors` 不变；`content.config.ts` 的 publications schema 同步新增 `date`，并以 refine 强制「`url` 存在时 `date` 必填」。年份合并在展示层派生。

**Testing**: 沿用既有口径：`npm run check` + `npm run build` 作为 CI 门禁（基线已验证通过）；数据门禁核对「有链接条目 `date` 必填且格式合法 = 125/135、空值仅出现在 10 条无链接条目」、`year` 格式合法、除 `date` 外无字段 diff；布局验收按 [quickstart.md](./quickstart.md) 的 10 档视口矩阵（1440 / 1280 / 1024 / 768 / 767 / 576 / 575 / 480 / 375 / 320px）在 DevTools 响应式模式下全量核对，并用 `getBoundingClientRect()` 量测标签列线与横向溢出；不引入 e2e 框架（Constitution V / YAGNI，FR-011 禁止新增运行时脚本）。

**Target Platform**: 纯静态 HTML（GitHub Pages，`output: 'static'`，`base='/nlp-home'`）；现代浏览器最新两个大版本；验收视口见 FR-001，320px 为最窄下限。

**Project Type**: 静态网站（Astro 单项目，沿用 001–005 结构）

**Performance Goals**: 零 JS 新增；纯 CSS（Flex + 媒体查询）改动，无新请求、无新资源；135 条条目渲染路径不变，无额外 DOM 层级爆炸（标签槽最多新增 2 个 wrapper/条）。

**Constraints**: 展示层改动限于模板 + scoped CSS；数据侧仅允许新增 `date` 并回填，其余字段、schema 与配色/字体/字号零改动（FR-011）；`PublicationItem` 的 `Props` 接口不变，主页与 Publications 页必须呈现同一形态（FR-009）；移动端视觉隐藏顶部年份导航（DOM MUST 保留）、零运行时脚本；CCF 标签宽度归一化为必需，同类最大宽度差 <1px；不得依赖 `body { overflow-x: hidden }` 掩盖横向溢出（FR-010 要求真实无溢出）——溢出判定以逐元素 `getBoundingClientRect().right ≤ clientWidth` 为权威，`scrollWidth === clientWidth` 仅作辅助信号（该声明保留时该值可能被夹断）；断点唯一规范源为 spec FR-001（768 / 576），下游文档引用该口径时 MAY 复述实现值（含半开区间媒体查询值 767.98 / 575.98），但 MUST NOT 引入 FR-001 之外的新断点。

**Scale/Scope**: 2 个消费界面、135 条论文、桌面 8 个年份标签（2026–2020 七个 + 「2019 & Earlier」一个）、5 个文件（含 `src/data/publications.json` 与 `src/content.config.ts`）；无新增源文件（除本目录规划产物）。

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原则 | Gate 检查项 | 状态 |
|------|------------|------|
| I. 内容准确性（不可妥协） | 论文标题、期刊名、年份、CCF 等级与链接取值零改动；`date` 正式出版日期优先、无则上线日期，arXiv-only 条目 MUST 用 arXiv 首次提交日（v1），无链接留空；年份合并只是展示层分组，不重写数据、不生成新事实；合并组成员由数据实时派生，计数可回溯到 135 条原始条目 | PASS |
| II. 内容与展示分离 | 常规内容更新（新增论文）仍只改 `publications.json`：新增 2020+ 论文自动获得独立年份标签，新增 ≤2019 论文自动进入合并分组；模板与数据解耦关系不变。本特性为排序新增 `date` 字段，属于一次性的数据契约扩展，不改变「内容更新只改数据文件」的维护方式 | PASS |
| III. 静态站点与 GitHub Pages | 构建配置、CI、部署方式不变；变更后 `astro check` + `astro build` MUST 照常通过（FR-012，基线已通过） | PASS |
| IV. 简洁学术化设计 | 零新依赖、零新运行时 JS、无动效；配色/字体/字号与其他区块不变；手机端视觉隐藏顶部年份导航（DOM MUST 保留），只用吸顶分组标题，不引入标签墙或横向滑动 | PASS |
| V. 最小复杂度（YAGNI） | 不抽象通用布局工具类，不新增组件文件；双槽占位复用现有 badge 标记，分组逻辑以局部派生数组实现；CCF 宽度归一化用一处 `min-inline-size` 解决，不改配色/字号 | PASS |
| VI. 无布局破损（不可妥协） | FR-010 五项破损定义逐项覆盖；FR-001 的十档验收视口 × 两处界面全量核对；横向溢出以逐元素 `getBoundingClientRect().right ≤ documentElement.clientWidth` 为权威判据（至少 `.pub-item` / `.pub-side` / `.year-group h3`），不以 `body { overflow-x: hidden }` 或 `scrollWidth` 单独判定；矩阵结果按「维护工作流」记录于 PR（T019 / T021） | PASS |

**无违规项。** 宪法 II 要求的「内容更新只改数据文件」在本特性后依然成立：年份分组规则对新增数据自动生效，无需改模板。

**Phase 1 后复核**：设计未引入数据写入、新依赖或运行时脚本；`Props` 接口不变，数据契约仅新增 `date` 字段，并在既有 schema 内增加「有链接必填」的 refine。六条原则复核（含 VI 无布局破损）仍为 PASS，无 Constitution 违规项。

**范围说明**：新增 `date` 字段与回填属于数据层变更，不是 Constitution 违规；它是组内时间排序的必要前提，FR-011 已显式限定为「唯一数据改动」，并明确有链接必填、arXiv-only 用 v1 提交日、无链接留空。空值排序规则由 FR-007 约束（组末、按标题）。

## Project Structure

### Documentation (this feature)

```text
specs/006-publications-responsive-layout/
├── plan.md                          # This file (/speckit-plan command output)
├── research.md                      # Phase 0 output——R1 宽屏双栏与原子换行、R2 标签双槽与缺失占位、
│                                    #   R3 窄屏两行、R4 很窄屏三行、R5 年份合并与日期排序、R6 手机导航移除、
│                                    #   R7 锚点偏移、R8 验收度量方式、R9 宪法合规映射、R10 日期回填与来源审计
├── data-model.md                    # Phase 1 output——论文数据契约（含新增 date）+ 派生显示模型
│                                    #   （Publication Item / Badge Cluster / Year Nav & Group）+ 分组与排序规则
├── quickstart.md                    # Phase 1 output——10 档视口验证矩阵 + 标签列线量测 + 年份导航核对 + 日期数据门禁
├── contracts/
│   └── publications-layout.md       # Phase 1 output——条目三档布局契约、双槽契约、年份导航/分组与锚点契约、不变量
└── tasks.md                         # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
nlp-home/
├── src/
│   ├── components/
│   │   ├── PublicationItem.astro    # 【改动】条目结构改为「文本区 + 可选双槽标签簇」；
│   │   │                            #   ≥768px 外层 nowrap 两栏、文本区 wrap 原子换行（FR-002）；
│   │   │                            #   576–<768px .pub-main display:contents、标题整行、期刊名+标签簇第二行（FR-003）；
│   │   │                            #   <576px 三行、标签簇右对齐（FR-004）；
│   │   │                            #   固定双槽 + 缺失槽隐藏占位；两标签都缺失时不渲染标签簇（FR-005）；
│   │   │                            #   Props 接口不变（FR-009 主页自动继承）
│   │   └── CCFBadge.astro           # 【改动】宽度归一化（min-inline-size，同类 CCF 标签最大宽度差 <1px）；
│   │                                #   只影响布局宽度，配色/字号不变（FR-005）
│   ├── pages/
│   │   └── publications.astro       # 【改动】年份分组派生（2020+ 独立、≤2019 合并为「2019 & Earlier」，
│   │                                #   锚点 year-2019-earlier，空合并组不渲染，FR-006/FR-007）；
│   │                                #   组内按 date 降序、同日标题字符串字典序；
│   │                                #   ≥768px 年份导航自然换行；<768px 视觉隐藏顶部导航、
│   │                                #   年份分组标题吸顶并显示计数（FR-008）；
│   │                                #   锚点偏移按桌面粘性导航高度复核（FR-007）
│   ├── pages/index.astro            # 【零改动】主页概览复用 PublicationItem，自动继承三档规则（FR-009）
│   ├── styles/global.css            # 【零改动】色板、字体、容器宽度、overflow-x 防线不变
│   ├── content.config.ts            # 【改动】publications schema 新增 date（YYYY-MM-DD）；url 存在时必填
│   └── data/
│       └── publications.json        # 【改动】135 条新增 date（有链接填、无链接留空）；其余字段不变（FR-011）
└── .github/workflows/deploy.yml     # 【零改动】CI 门禁照常拦截构建失败
```

**Structure Decision**: 沿用 001–005 的单一 Astro 项目结构，不新增组件、目录或公共 CSS 工具类。条目布局全部收敛在共享组件 `PublicationItem.astro` 的 scoped CSS 与少量模板结构（双槽 wrapper）中，主页因此零改动即获得一致形态；年份导航、日期排序与移动端吸顶标题改动只落在 `publications.astro`（frontmatter 派生 + scoped CSS），主页无年份导航、不受影响。数据侧只改 `content.config.ts`（新增 `date`）与 `publications.json`（回填），不新增数据文件。断点 768 / 576 以 spec FR-001 为唯一规范源，亚像素边界（767.98 / 575.98）交由媒体查询固有行为处理，与 003 口径一致。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

无 Constitution 违规项，无需记录。

**范围说明（非违规）**：新增 `date` 字段与回填是本特性唯一的数据层改动，用于组内时间排序；不新增数据文件、不改变其余字段。该改动在 FR-011 中显式限定，PR 描述需列出日期口径（正式出版优先 → 上线日期 → arXiv v1 → 无链接留空；有链接必填）。
