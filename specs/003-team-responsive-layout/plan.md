# Implementation Plan: Team 页多分辨率响应式布局（Team Responsive Layout）

**Branch**: `003-team-responsive-layout` | **Date**: 2026-10-15（refresh，同步 spec 2026-10-15 批量澄清 CHK008–CHK040） | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-team-responsive-layout/spec.md`

## Summary

为 Team 页（`/team/`）补齐**按视口宽度分档的响应式布局行为**，并依据权威源完善毕业生数据。表现层沿用 001/002 既有技术栈（Astro 7.x 静态站点 + 组件级 scoped CSS，零新依赖、零新 JS）；数据改动**仅限** `graduates.json`（FR-011/FR-015），另含一条构建期校验逻辑（FR-016，FR-015 的显式例外）。覆盖五处：

1. **Faculty 教师网格与卡片头部**（US1）：网格列数按档显式取值——≥1280px 每行 3、768px–<1280px 每行 2、576px–<768px 与 <576px 每行 1（FR-002）；卡片头部 ≥576px 保持「照片在左、姓名/职称/研究方向在右」横向排布，<576px 改为「照片水平居中在上；其下姓名与职称同行（姓名居左、职称右对齐）；研究方向标签紧随其下、占卡片内容整宽并左对齐」（FR-003，CHK008/CHK009）；研究方向标签收纳遵 FR-004（优先整标签换行，仅单个标签自身超宽时才在标签内换行）。
2. **Graduates 窄屏三段式**（US2）：<768px 由既有「五字段逐行堆叠」改为三段式——第 1 行姓名居左，右侧自右向左依次为年份与学位：**年份右对齐贴行右缘且其容器宽度与年份数字等宽，学位居年份左侧、与年份间隔一个空格、学位文字右对齐**（CHK010）；第 2 行去向（左对齐）；第 3 行外链标签（左对齐，如有，取代 002 窄屏右对齐）；毕业生姓名左边缘与在读学生姓名左边缘落在同一竖直线（FR-007）。两个列表条目的左右内边距统一收窄为 **24px**（自现状 44px，CHK035/FR-007）。≥768px 维持既有五列混合对齐形态（FR-009 零回归）。
3. **毕业生数据完善**（FR-011）：依据《2026年招生介绍-G3.pptx》「G3 组学生就业情况」表（14 条）合并 `graduates.json`——新增未收录 9 条（匿名 name、类型映射 degree、去向「->」规范化为「→」、`year=null`、链接留空）+ 更新重叠 5 条（佀/杨/谭/温/刘）的 `destination`（`year`/`url` 保留现值）；毕业生与在读学生重复内容不做去重（CHK037）。
4. **构建期照片校验**（FR-016）：教师 `photo` 非空时其引用的图片文件 MUST 存在于 `public/teachers/`，缺失时构建报错并中断（复用 gallery 既有的 superRefine + existsSync 模式）。
5. **跨档无破损与共享组件一致**（US3 / FR-012）：主页（`index.astro`）教师网格同步采用 US1 的 3/2/1 分档与共享卡片头部行为（内容可与 Team 页不同，CHK034）；两页在各验收档位（≥1280 / 1024 / 768 / 576 / 375px，含边界切换点 1279 / 767 / 575px，并向 320px 覆盖）均无布局破损、无横向滚动。

改动收敛于 6 个文件：`src/pages/team.astro`、`src/components/TeacherCard.astro`、`src/components/StudentGroup.astro`（内距 24px，FR-007 组成部分）、`src/pages/index.astro`、`src/data/graduates.json`（FR-011）、`src/content.config.ts`（FR-016 显式例外）。

## Technical Context

**Language/Version**: TypeScript 5.x（Astro 内置）；Node.js ≥ 22 LTS；Astro ^7.3.8（沿用现状，lockfile 已锁定）

**Primary Dependencies**: `astro`（唯一运行依赖，不变）；devDependencies `@astrojs/check` + `typescript`（不变）。**本特性零新增依赖、零新增 JS**。

**Storage**: **数据改动仅限 `graduates.json` 内容**（FR-011/FR-015）——依据《2026年招生介绍-G3.pptx》就业情况表合并：新增 9 条 + 更新重叠 5 条的 `destination`，schema 与其余数据文件逐字节不变；`src/content.config.ts` 仅新增 teachers `photo` 字段的存在性校验逻辑（FR-016，FR-015「仅模板与样式」限制的显式例外，字段定义不变）；其余改动全部落在 `.astro` 模板与 scoped CSS。

**Testing**: 沿用 001/002 口径：`npm run check` + `npm run build` 作为 CI 门禁（照常通过）；布局验收为 quickstart.md 手动视口矩阵（≥1280 / 1279 / 1024 / 768 / 767 / 576 / 575 / 375px，并向 320px 覆盖，含三个边界切换验证点，FR-001；浏览器 DevTools 响应式模式），不引入 e2e 框架（Constitution V / YAGNI）。数据验收对照 FR-011 映射表（SC-008）；FR-016 以「临时构造缺失照片 → 构建报错 → 还原 → 构建恢复」负向用例验证（SC-009）。

**Target Platform**: 纯静态 HTML（GitHub Pages，`output: 'static'`）；现代浏览器（Chrome/Firefox/Safari/Edge 最新两个大版本）；验收视口 ≥1280px / 1024px / 768px / 576px / 375px 及边界切换点 1279 / 767 / 575px，更窄覆盖至 320px（FR-001）。

**Project Type**: 静态网站（Astro `output: 'static'`，不变）

**Performance Goals**: 零 JS 新增；纯 CSS（媒体查询 + Grid/Flex）改动，无新请求、无新资源、渲染性能不劣化。

**Constraints**: 表现层改动（模板 + scoped CSS）+ 两项 spec 明确授权的例外——① `graduates.json` 内容按权威源 PPTX 更新（FR-011/FR-015）；② `content.config.ts` 新增 teachers 照片存在性校验（FR-016 显式例外）。不触碰其余数据文件、schema 字段定义、构建配置与 CI；`TeacherCard.astro` 为 Team 页（detailed）与主页（compact）共享组件，改动 MUST 保证主页无回归（FR-012，内容可与 Team 页不同、布局行为与 Team 页一致——分栏数量、按档头部排布、标签收纳三者一致，CHK034）；`body { overflow-x: hidden }` 既有防线保留，不得依赖 `nowrap` 防溢出；两列表内边距统一 24px 为 FR-007 组成部分，graduates / students 两处 MUST 一起改（CHK035）。

**Scale/Scope**: 4 个 `.astro` 文件 + 1 个数据文件 + 1 个 schema 文件（`team.astro`：教师网格列数 + Graduates 窄屏三段式 + 内距 24px；`TeacherCard.astro`：卡片头部按档排布 + 标签收纳 + 移除 ≤640px 堆叠覆写；`StudentGroup.astro`：li 内距 44px→24px（FR-007）；`index.astro`：主页教师网格列数对齐 US1；`graduates.json`：FR-011 合并 5→14 条；`content.config.ts`：teachers photo 构建期校验）；零 CSS 公共层新增、零新文件。数据量：教师 5 人、在读学生 8 人不变，毕业生 5 → 14 条。

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原则 | Gate 检查项 | 状态 |
|------|------------|------|
| I. 内容准确性（不可妥协） | 毕业生数据改动以课题组权威源《2026年招生介绍-G3.pptx》为唯一依据（FR-011），逐条按其就业情况表映射，不凭推测填写；真名/年份/链接未获得前以 PPTX 匿名原文 + `year=null` + 链接留空呈现，待正式上线前获得后补齐；其余展示内容与链接取值零改动 | PASS（数据以权威源为准） |
| II. 内容与展示分离 | 常规内容更新（毕业生名单完善）只改数据文件 `graduates.json`，不需要动模板（本特性布局改动与数据改动彼此独立）；`content.config.ts` 仅新增 teachers `photo` 存在性校验——字段定义不变、属 FR-015「仅模板与样式」限制的显式例外（FR-016，spec 已授权），并使「图片缺失」这类数据问题在构建期显式暴露，强化数据文件的可维护约定 | PASS（含 spec 授权例外） |
| III. 静态站点与 GitHub Pages | `output: 'static'`、构建流程、CI 门禁、部署方式不变；变更后 `astro check` + `astro build` MUST 照常通过（FR-014）；FR-016 使破图数据在构建期被拦截、不合入发布分支，与 III 一致 | PASS |
| IV. 简洁学术化设计 | 零新依赖、零新 JS、无动效；复用既有色板与标签模式（`Homepage↗` / `GitHub↗`）；视觉基调不变（FR-013） | PASS |
| V. 最小复杂度（YAGNI） | 仅媒体查询 + Grid/Flex 声明 + 一条 schema 校验 + 一次数据合并，无新抽象、无公共工具类；改动点彼此独立、小步提交 | PASS |

**无违规项。** FR-016 对 FR-015「仅模板与样式」限制的例外由 spec 显式授权（「该校验逻辑是 FR-015 的显式例外，随本特性一并交付」），不构成宪法违规；宪法 II 所约束的「常规内容更新只改数据文件」在本特性中成立（毕业生数据完善仅落 `graduates.json`）。

## Project Structure

### Documentation (this feature)

```text
specs/003-team-responsive-layout/
├── plan.md                        # This file (/speckit-plan command output)
├── research.md                    # Phase 0 output (/speckit-plan command)——R1 分档实现、R2 网格列数、R3 卡片头部、
│                                  #   R4 标签收纳、R5 Graduates 三段式、R6 缺失字段处理、R7 姓名列对齐与 24px 内距、
│                                  #   R8 验收方式、R9 宪法合规、R10 毕业生数据合并（FR-011）、R11 构建期照片校验（FR-016）
├── data-model.md                  # Phase 1 output (/speckit-plan command)——FR-011 毕业生数据合并映射表（目标 JSON）
│                                  #   + 视图实体（TeacherCard / Graduate 条目 / Student 条目）+ teachers photo 校验
├── quickstart.md                  # Phase 1 output (/speckit-plan command)——九档视口验证矩阵
│                                  #   （≥1280 / 1279 / 1024 / 768 / 767 / 576 / 575 / 375 / 320px）+ 数据核对 + 构建校验负向用例
├── contracts/
│   └── team-responsive-layout.md  # Team 页响应式布局契约（视口行为矩阵含边界切换点、卡片头部排布、标签收纳、
│                                  #   Graduates 三段式与 24px 列对齐、数据契约扩展、回归范围、不变量）
└── tasks.md                       # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
nlp-home/
├── src/
│   ├── components/
│   │   ├── TeacherCard.astro      # 【改动】卡片头部按档排布（≥576px 照片在左/信息在右；
│   │   │                          #   <576px 照片水平居中在上、姓名与职称同行且职称右对齐、
│   │   │                          #   方向标签占内容整宽、左对齐紧随其下）；
│   │   │                          #   方向标签收纳（整标签优先换行、单标签超宽时标签内换行）；
│   │   │                          #   移除既有 @media (max-width:640px) 的头部纵向堆叠覆写（FR-003/FR-004）
│   │   └── StudentGroup.astro     # 【改动】li 左右内边距 44px → 24px（FR-007 组成部分，与毕业生列表一起改，
│   │                              #   保持两端分布行的姓名左起始与毕业生姓名同线；其余样式不变）
│   ├── pages/
│   │   ├── team.astro             # 【改动】① .teacher-grid 按档显式列数（3/2/1，FR-002）；
│   │   │                          #   ② Graduates <768px 三段式（flex-wrap：姓名+学位/年份右组行 / 去向行 / 链接行，
│   │   │                          #      年份贴右缘且容器与数字等宽、学位右对齐且与年份隔一个空格，FR-006/CHK010；
│   │   │                          #      链接行左对齐，FR-008 缺失字段不渲染）；
│   │   │                          #   ③ li 内边距 44px → 24px（左右对称，FR-007）
│   │   └── index.astro            # 【改动】主页 .teacher-grid 同步 US1 的 3/2/1 分档（US3 AS2 / FR-012；
│   │                              #   共享 TeacherCard 头部行为随组件生效）
│   ├── content.config.ts          # 【改动·FR-016 显式例外】teachers schema 的 photo 字段新增存在性校验
│   │                              #   （superRefine + existsSync，复用 gallery src 校验模式）；
│   │                              #   其余 schema 字段定义零改动
│   ├── styles/global.css          # 【零改动】容器宽度与色板不变；body overflow-x:hidden 保留
│   └── data/
│       ├── graduates.json        # 【改动·数据】FR-011：依据《2026年招生介绍-G3.pptx》合并——
│       │                          #   新增 9 条（匿名 name、degree 类型映射、去向「->」→「→」、
│       │                          #   year=null、链接留空）+ 更新重叠 5 条 destination（year/url 保留现值）
│       └── *.json                 # 【零改动】teachers / students / publications / gallery / site
│                                  #   逐字节不变（FR-015）
└── .github/workflows/deploy.yml   # 【零改动】CI 门禁照常拦截构建失败
```

**Structure Decision**: 沿用 001/002 的单一 Astro 项目结构，不新增任何目录或文件、不新建公共 CSS 工具类（改动点彼此独立，抽公共层违反 YAGNI）。布局改动收敛在 `team.astro` + 共享组件 `TeacherCard.astro` + 主页回归文件 `index.astro` 一处网格声明 + `StudentGroup.astro` 一处内距声明；数据改动仅 `graduates.json`（FR-011，模板与数据彼此独立、互不依赖）；校验改动仅 `content.config.ts` 的 teachers photo 一处（FR-016，复用 gallery 既有 superRefine + existsSync 模式，不新增脚本或 CI 步骤）。全部布局规则以 scoped CSS 媒体查询实现，无共享组件 API 变更（`TeacherCard` 的 `Props` 接口不变）。断点取值（1280 / 768 / 576）以 spec FR-001 为唯一规范源，下游文档引用不复述数值；亚像素边界（如 1279.98px）交由 CSS 媒体查询固有行为处理（CHK023）。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

无违规项，无需记录。
