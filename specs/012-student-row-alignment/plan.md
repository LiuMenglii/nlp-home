# Implementation Plan: Team 页在读学生名单的列布局调整（三列固定、两侧空白相等、Since 列内居中、链接右对齐）

**Branch**: `012-student-row-alignment` | **Date**: 2026-11-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/012-student-row-alignment/spec.md`

## Summary

把 Team 页 PhD Candidates 与 Master's Students 两个在读分组的行内布局，从 011 的「姓名弹性增长 → Since 固定槽随视口右移 → 链接贴右缘」改为 `checklists/layout.md` 需求变更记录 D1–D3 / S1–S3（S4 仅归档）确定的**三列固定宽度 + 两侧空白相等**：姓名列 3.5em（63px）、Since 列 5em（90px；若验收环境实测单行 Since 超过 90px 则整组改为 5.5em / 99px）、链接列 6.5em（117px）；姓名在列内居左、Since 在列内居中、链接在列内居右。技术路线仍为 Astro 组件级 scoped CSS（零新依赖、零新增 JS、零新增组件、数据零改动），全部收敛在 `src/components/StudentGroup.astro`：

1. **≥480px 三列固定网格**（PhD 与 Master's 共用同一组声明）：`li` 为三轨 Grid，`grid-template-columns: 3.5em 5em 6.5em`（判定需 5.5em 时整组改为 `3.5em 5.5em 6.5em`）、`column-gap: 0`、`justify-content: space-between`；姓名 / Since / 链接分别显式落在第 1 / 2 / 3 列，列内对齐为 `start / center / end`。
   - `justify-content: space-between` 把 `W − 270px`（或 `W − 279px`）的剩余空间**等分为两个列间空白**：姓名列贴行内容左缘、链接列贴行内容右缘，两个空白恒等（±1px）。768px 最紧档：三列合计 270 / 279px，行内容区 296px，两侧空白各 13 / 8.5px。
   - 三列宽度固定，与姓名长短、链接有无、链接标签宽窄、视口宽度均无关；同一分组所有行的列位置一致，Since 中心落在同一条竖线上。
   - 空链接保留第 3 列 6.5em，缺年级保留第 2 列宽度，均不渲染占位；显式 `grid-column` 定位保证槽位缺失时其余元素不左移。
2. **Since 居中口径**：Since 在自身列内居中（`justify-self: center`；`margin-left: 0` 覆盖基线的 `auto`，否则自动外边距会吞掉列内剩余空间并破坏居中），不再要求位于整行中点。姓名列 63px 比链接列 117px 窄 54px，两侧空白相等时 Since 中心必然在行内容区中点左侧 **27px**。该偏移与视口宽度、Since 列取 5em 或 5.5em 均无关，是方案的定义结果，不是缺陷。
3. **竖排态右对齐**（<480px）：保持既有 flex 竖排，仅把第 2 行链接的 `text-align: left` 改为 `right`；第 1 行姓名居左、Since 右对齐不变；无链接不渲染第 2 行。验收以链接文字范围的右缘为准（链接块占满整行，盒右缘恒等于行右缘）。
4. **取消碰撞夹取**：固定列宽下三列在全部支持视口都不会相互挤压（768px 最紧档仍有 13 / 8.5px 空白），011 的 `minmax(4em,1fr) 5.5em auto` 与 480–767px 的 flex 行内规则由这组固定网格取代；不再有基于字体度量的左移逻辑。

两栏断点（≥768px）、32px 栏距、`ceil(n/2)` 切分、年级升序、字号（18px）、配色、分隔线、DOM 结构与学生数据全部不变。

## Technical Context

**Language/Version**: TypeScript 5.9.x（Astro 内置类型检查）；Node.js ≥ 22 LTS；Astro 7.3.8（`package-lock.json` 锁定，沿用现状）

**Primary Dependencies**: `astro`（唯一运行依赖，不变）。**本特性零新增依赖、零新增运行时 JS、零新增组件文件**

**Storage**: N/A——`src/data/students.json` 只读使用，本特性逐字节不改；分组、排序、切分与链接标签映射（`url` → `github` → `scholar` 取第一个非空）原样复用

**Testing**: 机器门禁 `npm run check` + `npm run build`；布局验收使用当前智能体工具自带浏览器，按十一档视口矩阵（1920 / 1440 / 1280 / 1024 / 768 / 767 / 576 / 481 / 480 / 375 / 320px）以 `getBoundingClientRect()` 与 `getComputedStyle()` 测量：三轨实际宽度（63/90/117 或 63/99/117）、Since 中心相对行内容区中点的 −27px 偏移、同栏 Since 中心极差、列间空白是否相等、链接文字/姓名贴边、链接标签宽度、竖排文字右对齐、767px / 768px 两栏结构与 32px 栏距、越界与横向滚动。Since 文字宽度 MUST 用 `document.createRange()` 取文字范围（改样式前 `.grade` 元素盒恒为 5.5em/99px，不得用元素盒宽代替）；链接右缘同样以文字范围为准；页面横向溢出以 `scrollWidth > innerWidth` 判定。不引入 e2e / 视觉回归框架（Constitution V）。现有 `tests/news-widgets.test.mjs` 与本特性无关，零改动

**Target Platform**: 纯静态 HTML（GitHub Pages，`output: 'static'`）；现代浏览器最新两个大版本；断点按整数视口宽度验收（≥768px 两栏、480–767px 单栏横向、≤479px 竖排）

**Project Type**: 静态网站（Astro 单项目，沿用 001–011 结构）

**Performance Goals**: 零新增 JS、零新增请求与资源；仅改动构建期生成的 CSS 声明，渲染开销可忽略

**Constraints**:
- 版式改动仅 `src/components/StudentGroup.astro` 的 scoped CSS；模板 DOM、`team.astro`、`global.css`、`content.config.ts`、`students.json`、Graduates、Faculty 与其他页面零改动（FR-009 / SC-006）。
- ≥480px 三列宽度 MUST 为 3.5em / 5em（或 5.5em）/ 6.5em，同一分组共用同一套值；MUST NOT 使用 `1fr` / `max-content` 侧轨、MUST NOT 硬编码像素或按视口写 `translateX`；剩余空间 MUST 由 `justify-content: space-between` 在两列之间等分，MUST NOT 用固定 `column-gap` 或 `justify-content: center` 近似。
- Since MUST 在自身列内居中；行内容区中点左偏 27px 是定义结果，MUST NOT 试图用额外偏移“修正”；MUST NOT 实现碰撞夹取（FR-004）。
- Since 列取 5em 还是 5.5em MUST 以验收浏览器实测为准（FR-011）：先按 5em 实现，用 `document.createRange()` 测量 30 条 `Since <年份>` 的最大文字宽度（MUST NOT 用元素盒宽）；超过 90px 则 PhD 与 Master's 同时改为 5.5em 并复测，仍超宽按缺陷停止验收。5em 与 5.5em MUST NOT 混用。
- 无链接 / 缺年级 MUST 保留各自列宽但不渲染占位、破折号或隐藏文本（FR-003 / FR-007）。
- <480px 竖排态：第 1 行姓名居左、Since 右对齐；第 2 行链接独占整行且文字右对齐；无链接不渲染第 2 行（FR-005）。右对齐验收 MUST 量链接文字范围，链接元素占满整行，其元素盒右缘不得作为判据。
- ≥480px 链接标签 MUST 单行且宽度 ≤117px（±1px），完整落在第 3 列内；不得以 `justify-self: end` 的盒右缘贴齐掩盖标签向左溢出（FR-003 / SC-002）。
- 两栏断点与 32px 栏距 MUST 在 767px / 768px 实测确认（767px 单栏、768px 双栏）；页面横向溢出的失败判据为 `document.documentElement.scrollWidth > window.innerWidth`，不得用差值等于 0 判定（FR-006 / SC-004）。
- 不新增断点、表头、竖线、占位、动效或交互；不改字号（18px）、配色、字体族与分隔线（FR-001 / FR-010）。
- 结构 MUST 保持现有 `ul` / `li` 列表：MUST NOT 改为 `<table>`，MUST NOT 添加 `<th>`、表头行或 `role="table"` 等表格语义（FR-001）。
- 断点按整数视口宽度验收（CSS `max-width: 479.98px` 与 ≤479px 等价，带小数的视口不纳入）；验收证据 MUST 写入 `specs/012-student-row-alignment/evidence/layout-verification.md`；悬停与 `focus-visible` 沿用现有样式且外框不得引起横向滚动，打印样式不在本期（SC-006 / Assumptions）。
- 实现完成后 MUST 先提交并推送变更（作者与提交者仅项目维护者本人），再按宪法「维护工作流」通过 PR 合并：合并前 `npm run check` + `npm run build` 与十一档布局验收全部通过，部署后检查线上 Team 页；MUST NOT 添加 Claude / AI 共同作者尾注（SC-006 / 宪法维护工作流）。
- MUST NOT 用页面级 `overflow-x: hidden`（或 `clip`）掩盖溢出；MUST NOT 以缩小字号或隐藏链接换取对齐（Constitution VI）。

**Scale/Scope**: 1 个源文件（`src/components/StudentGroup.astro`）的 CSS 段；在读学生 30 条（PhD 19 / Master's 11），30 个 `Since <年份>`、4 个成员链接（均在 PhD）；3 种行形态（两栏横向 / 单栏横向 / 竖排）；11 档视口；1 个渲染界面 = `/team/` 的两个在读学生分组。

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原则 | Gate 检查项 | 状态 |
|------|------------|------|
| I. 内容准确性（不可妥协） | 只改变行内水平位置；姓名、`Since <年份>` 文案、链接地址与标签、排序与切分全部原样复用数据与既有派生逻辑；不新增/改写任何成员信息。实现前计数：30 条（PhD 19 / Master's 11）、30 个 Since、4 个链接，见 [research.md R7](./research.md) 与 [data-model.md §1](./data-model.md) | PASS |
| II. 内容与展示分离 | 仅改 scoped CSS；数据文件与模板解耦关系不变，后续成员增删仍只需改 `students.json`，行序与切分由既有派生逻辑决定 | PASS |
| III. 静态站点与 GitHub Pages | 构建配置、CI 与部署方式零改动；变更后 `npm run check` + `npm run build` MUST 通过 | PASS |
| IV. 简洁学术化设计 | 不新增视觉元素（无表头、无竖线、无动效）、不改配色、不改字号；仅改变行内三列的水平位置与竖排链接对齐方向 | PASS |
| V. 最小复杂度（YAGNI） | 不新增组件、工具类、脚本或公共 CSS 层；用一组固定三列声明取代 011 的两套行内规则并删除夹取逻辑，净复杂度下降；不引入 JS 测量、容器查询、subgrid 等额外机制 | PASS |
| VI. 无布局破损（不可妥协） | 断点沿用 011；固定列宽把风险从“列被挤压”转为“文字宽于列宽”，按 11 档真实浏览器逐项检查元素重叠、文字截断、内容溢出、非预期换行与页面横向滚动；以逐元素 `getBoundingClientRect()` 越界检查为权威判据；超长姓名在姓名列内换行、Since / 链接单行均显式约束（姓名换行形态不纳入本期验收）；MUST NOT 用 `overflow-x: hidden` 掩盖 | PASS |

**无违规项。**

**维护工作流门禁**：由 tasks.md 的 T016（提交与推送）和 T017（CI、合并与部署后验收）覆盖；提交作者与提交者仅为项目维护者本人，不添加 AI 共同作者尾注。

**Phase 1 后复核**：设计未引入数据写入、新依赖、运行时脚本、新组件或公共样式层；DOM 与 HEAD 完全一致（仍是 `姓名 → Since → 链接` 三个槽位，缺失字段不渲染）；三种形态由既有媒体查询切换；≥480px 的两套旧行内规则被一组固定三列网格取代，<480px 竖排仅改链接 `text-align`；固定列宽消除了夹取，几何可静态推导（见 [research.md R2](./research.md)）；六条原则复核（含 VI 的溢出判定口径）仍为 PASS。

## Project Structure

### Documentation (this feature)

```text
specs/012-student-row-alignment/
├── plan.md                          # 本文件（/speckit-plan 输出）
├── spec.md                          # 特性规格（已澄清）
├── checklists/
│   ├── requirements.md              # 规格质量清单（已通过）
│   └── layout.md                    # 布局质量清单与需求变更记录（D1–D3 / S1–S3，S4 仅归档）
├── research.md                      # Phase 0 输出——R1 固定三列机制、R2 等隙与 27px 几何证明、
│                                    #   R3 768px 与字宽可行性、R4 窄屏形态、R5 缺失字段、
│                                    #   R6 验收方法、R7 宪法合规、R8 数据快照
├── data-model.md                    # Phase 1 输出——行/列视图实体、固定列宽几何、缺失字段矩阵、不变量
├── quickstart.md                    # Phase 1 输出——11 档视口测量脚本、竖排与回归检查、门禁
├── contracts/
│   └── student-row-alignment.md     # Phase 1 输出——视口行为矩阵、固定三列几何、等隙不变量、
│                                    #   DOM 契约、测量口径与回归范围
├── evidence/                        # 实现期产物（实现与验收时生成并提交）
│   └── layout-verification.md       # 11 档视口测量记录与构建门禁结果
└── tasks.md                         # Phase 2 输出（/speckit-tasks 生成，本命令不创建）
```

### Source Code (repository root)

```text
nlp-home/
├── src/
│   ├── components/
│   │   └── StudentGroup.astro       # 【唯一改动·样式】
│   │                                #   ≥480px：li 改为三轨固定网格（3.5em / 5em 或 5.5em / 6.5em，
│   │                                #   column-gap:0，justify-content:space-between），姓名 / Since /
│   │                                #   链接分别固定在第 1/2/3 列，Since justify-self:center 且
│   │                                #   margin-left:0、white-space:nowrap，链接 justify-self:end；
│   │                                #   删除 011 的 minmax(4em,1fr) 5.5em auto 与 480–767px flex
│   │                                #   行内规则；<480px：保持 flex 竖排，链接 text-align:left → right（同步清理基线重复声明）；
│   │                                #   DOM、类名、排序、切分、字号均不变
│   ├── pages/
│   │   └── team.astro               # 【零改动】分组标题、两栏包装层与 Graduates 区块
│   ├── data/
│   │   ├── students.json            # 【零改动】30 条学生数据只读
│   │   └── graduates.json           # 【零改动】
│   ├── content.config.ts            # 【零改动】students schema 与链接三选一校验不变
│   └── styles/global.css            # 【零改动】容器 1180px 上限、24/16px 内距与色板不变
├── src/components/TeacherCard.astro # 【零改动】
├── tests/news-widgets.test.mjs      # 【零改动】与本特性无关
└── .github/workflows/deploy.yml     # 【零改动】CI 门禁照常拦截构建失败
```

**Structure Decision**: 沿用 001–011 的单一 Astro 项目结构，不新增文件或公共 CSS 层。行内对齐属于 `StudentGroup` 的展示职责，全部规则留在该组件的 scoped `<style>` 内；PhD 与 Master's 共用同一组固定三列与媒体查询选择器（选择器并列），避免两个分组出现两套几何。`team.astro` 无需感知行内布局，`h3` 与两栏包装层保持不变。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

无违规项，无需记录。
