# Implementation Plan: Team 页 Master's Students 双栏布局

**Branch**: `011-team-master-two-column-layout` | **Date**: 2026-11-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/011-team-master-two-column-layout/spec.md`

## Summary

把 010 在 PhD Candidates 上落地的「两栏 + 行内三槽 + 窄屏退化」规则同样应用到 Team 页 Master's Students，并按澄清结果统一调整两个在读分组的排序、Since 列定位与字号。技术路线沿用既有 Astro 静态站点与组件级 scoped CSS（零新依赖、零新增 JS、零数据内容改动、零新增组件）；版式改动收敛在 `src/components/StudentGroup.astro`，另清理未使用的 `note` 字段：

1. **排序**（FR-003）：`byLevel` 从「grade 降序」改为「grade 升序 → 无年级排最后 → 同级保持数据文件顺序」，对 PhD 与 Master's 同时生效；当前 Master's 升序为 2024（朱祉同、张蓓泽、叶振雷）→ 2025（艾明旭、刘润泽）→ 2026（刘梦犁、张蓬月、顾树焕、温泽林、李佳睿、毛乐平）。
2. **两栏结构**（US1 / FR-001～FR-003）：按 `ceil(n/2)` 把已排序数组切成左右两段（当前 11 条 → 6 + 5），分别渲染为两个 `<ul>`；外层 `.master-columns` 复用 010 的 `.phd-columns` 两栏/单栏声明，n=1 时只渲染一个列表并加 `.is-single`。
3. **行内三槽**（US2 / FR-004～FR-007）：Master's 行内只保留「姓名 → Since → 成员链接」三槽（备注支持已随澄清移除）；≥768px 使用 `minmax(4em, 1fr) 5.5em auto` 三轨（8px 列间隙、24px 内距；Since 槽 5.5em = 99px，为 18px 文本约 90px 留余量），姓名列吸收多余宽度，Since 列随视口右移，链接贴齐栏右缘；480–767px 单栏横向行使用 `name: flex 1 1 4em / Since: 0 0 5.5em / link: auto`，得到同样的右移效果；<480px 沿用竖排两行形态。无年级、无链接只留空槽，不渲染占位。
4. **Since 字号**（FR-013）：把 `.grade` 字号改为显式 `18px`（PhD 与 Master's 共用；站点根字号 16px，`1rem` 仅 16px，MUST NOT 使用）；其他文本字号不变。
5. **验证**（SC-001～SC-007 / Constitution VI）：`npm run check` + `npm run build` 作为机器门禁；真实浏览器按 11 档视口逐项测量栏宽、顶线、Since 左缘单调右移、Since↔链接 8px 间隙、竖排态链接左缘与字号，并回归 PhD 分组。

`team.astro`、`global.css`、`TeacherCard.astro`、Graduates 名单与其余页面零改动；`students.json` / `content.config.ts` / `README.md` 仅移除未使用的 `note` 字段与文档。

## Technical Context

**Language/Version**: TypeScript 5.9.x（Astro 内置类型检查）；Node.js ≥ 22 LTS；Astro 7.3.8（`package-lock.json` 锁定，沿用现状）

**Primary Dependencies**: `astro`（唯一运行依赖，不变）。**本特性零新增依赖、零新增运行时 JS、零新增组件文件**

**Storage**: N/A——`src/data/students.json` 只读使用，本特性逐字节不改；分组排序规则改为 `grade` 升序（无年级最后、稳定序），链接标签映射（`url` → `github` → `scholar` 取第一个非空）原样复用

**Testing**: 沿用既有口径——`npm run check` + `npm run build` 作为 CI 门禁；布局验收为真实浏览器视口矩阵（1920 / 1440 / 1280 / 1024 / 768 / 767 / 576 / 481 / 480 / 375 / 320px），以 `getBoundingClientRect()` 逐项测量栏宽、顶线、Since 左缘随宽度右移、Since↔链接间隙、字号与越界；不引入 e2e / 视觉回归框架（Constitution V）

**Target Platform**: 纯静态 HTML（GitHub Pages，`output: 'static'`）；现代浏览器最新两个大版本；断点按整数视口宽度验收（768px 两栏、767px 单栏横向、479px 及以下竖排）

**Project Type**: 静态网站（Astro 单项目，沿用 001–010 结构）

**Performance Goals**: 零新增 JS、零新增请求与资源；仅新增一次构建期排序比较与共享 scoped CSS 选择器，渲染开销可忽略

**Constraints**:
- 版式改动仅 `src/components/StudentGroup.astro`：`byLevel` 排序、Master's 分支包装类 `.master-columns`、共享行内/响应式选择器与 `.grade` 字号；另在 `content.config.ts`、`students.json`、`README.md` 移除未使用的 `note` 字段；`team.astro`、其余页面与组件零改动（FR-011 / SC-006）。
- 数据内容零改动：除移除全为 null 的 `note` 字段外，`students.json` 的成员内容、students schema 其余字段、链接标签文案与箭头形态不变（FR-006、FR-010）；排序仅为展示层派生，不改写成员数据。
- 数据边界：数据更新（新增 11 位硕士、15 位博士，5 位原 PhD 转入 Graduates）已在特性开始前作为独立 commit `54f3b81` 提交，不属于本特性；范围核对以该提交为起点基线（spec Clarifications 2026-11-21）。
- 版式数值：≥768px 两栏、32px 栏距、`minmax(4em, 1fr) 5.5em auto` 三轨、8px 列间隙、24px 对称内距；480–767px 单栏横向行使用弹性姓名列与 Since 固定槽 5.5em；<480px 竖排；不新增断点、不新增视觉元素。
- Since 字号：两个分组的 `.grade` 统一为显式 `18px`（或等价的 `1.125rem`；站点根字号 16px 下 `1rem` = 16px，MUST NOT 使用）；其他字号不变（FR-013）。
- Since 左缘对齐口径（research R3 / 契约 §6）：Master's 当前 11 行全部无链接，第三轨宽 0，Since 左缘 MUST 全同线；PhD 混排栏（有链接 / 无链接同行一栏）按 Clarifications 的 8px 规则，有链接行 Since 随该行链接宽度左移，同线判定仅在链接槽占用一致的行组内进行。
- MUST NOT 用页面级 `overflow-x: hidden`（或 `clip`）掩盖溢出；MUST NOT 以缩小字号换取两栏（Constitution VI、spec Assumptions）。
- 单栏（<768px）时两个 `<ul>` 合并为一条连续列表，第二个列表首行不重复顶部分隔线；空分组沿用 "Master's students coming soon." 占位并占满整行。

**Scale/Scope**: 4 个源文件（版式：`StudentGroup.astro`；`note` 清理：`content.config.ts`、`students.json`、`README.md`）；Master's 数据 11 条（`grade` 为 2024–2026、0 链接），升序两栏切分 6 + 5；PhD 数据 19 条（升序 10 + 9，4 条链接，仅作回归观察）；1 个渲染界面 = `/team/` 的两个在读学生分组。

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原则 | Gate 检查项 | 状态 |
|------|------------|------|
| I. 内容准确性（不可妥协） | 姓名、Since 文案、链接地址与标签均原样复用 `students.json` 与既有映射；排序规则按 FR-003 改为升序，但不新增/改写任何成员信息；`note` 字段为未使用字段，随本特性移除。实现前核对 11 条硕士、11 个 `Since <年份>`（2024–2026）、0 链接；PhD 19 条、4 链接，见 research R8 与 data-model §1 | PASS |
| II. 内容与展示分离 | 版式只改展示排序、模板与 scoped CSS，不触碰成员内容；`note` 字段移除是一次性清理，不改变其余字段与数据语义；后续成员增删仍只需改 `students.json`，两栏切分由 `ceil(n/2)` 自动推导 | PASS |
| III. 静态站点与 GitHub Pages | 构建配置、CI、部署方式零改动；变更后 `npm run check` + `npm run build` MUST 通过 | PASS |
| IV. 简洁学术化设计 | 不新增视觉元素（无表头、无竖线、无折叠/动效）、不改配色；唯一字号变化是 Since 按 FR-013 从 0.95rem（15.2px）调为 18px，其他文本不变；沿用既有分隔线与链接色板；零新依赖、零新 JS | PASS |
| V. 最小复杂度（YAGNI） | 不新增组件、工具类或构建脚本：Master's 复用 010 已实现的同一套布局声明（选择器并列），仅新增一个包装类、一次数组切分与一个排序比较；不引入 `@container`、subgrid 或 CSS 多列等额外机制 | PASS |
| VI. 无布局破损（不可妥协） | 断点沿用 010；按 11 档真实浏览器逐项检查元素重叠、文字截断、内容溢出、非预期换行与页面横向滚动；以逐元素 `getBoundingClientRect()` 越界检查为权威判据；横向三槽形态覆盖 480–1920px（最紧档为 768px 两栏），<480px 为契约声明的竖排形态；长姓名在姓名槽内换行不属于破损，链接脱离本行三槽或溢出栏边界才按缺陷处理 | PASS |

**无违规项。**

**Phase 1 后复核**：设计未引入数据写入、新依赖、运行时脚本、新组件或公共样式层；DOM 由工作区既有骨架把 Master's 的单个 `<ul>` 拆为 1–2 个 `<ul>`，行内顺序为 姓名 → Since → 链接（相对 HEAD `54f3b81` 的 010 模板调整了链接与 Since 的先后，并移除了 `note`），本特性不再改动行内顺序；三种形态（≥768px 两栏 / 480–767px 单栏横向 / <480px 竖排）由同一 DOM 经媒体查询切换；PhD 分支的 DOM 除移除 `note` span 外零改动，仅排序、Since 位置与 Since 字号随共享规则调整；六条原则复核（含 VI 的溢出判定口径与 <480px 竖排声明）仍为 PASS。

## Project Structure

### Documentation (this feature)

```text
specs/011-team-master-two-column-layout/
├── plan.md                          # 本文件（/speckit-plan 输出）
├── spec.md                          # 特性规格（已澄清）
├── checklists/
│   └── requirements.md              # 规格质量清单（已通过）
├── research.md                      # Phase 0 输出——R1 复用方式、R2 排序与切分、
│                                    #   R3 768px 槽宽复核、R4 单栏退化与 <480px 竖排、
│                                    #   R5 缺失字段、R6 验收方法、R7 宪法合规、
│                                    #   R8 数据快照
├── data-model.md                    # Phase 1 输出——排序/切分函数、三态槽位几何、
│                                    #   缺失字段矩阵、对齐与字号不变量
├── quickstart.md                    # Phase 1 输出——11 档视口验证矩阵、测量脚本、回归与门禁
├── contracts/
│   └── team-master-two-column.md    # Phase 1 输出——视口行为矩阵、升序分栏、行内槽位几何、
│                                    #   DOM 契约、竖排形态声明、对齐/字号不变量与回归范围
├── evidence/                        # 实现期产物（实现与验收时生成并提交）
│   └── layout-verification.md       # 11 档视口测量记录与构建门禁结果
└── tasks.md                         # Phase 2 输出（/speckit-tasks 生成，本命令不创建）
```

### Source Code (repository root)

> 基线：`StudentGroup.astro` 已含未提交的 011 骨架（`.master-columns` 包装、6+5 切分、链接后置调整），实现从该工作区状态继续，仅做本计划列出的三项规则调整。

```text
nlp-home/
├── src/
│   ├── components/
│   │   └── StudentGroup.astro       # 【改动·版式源文件】
│   │                                #   byLevel：grade 升序 → 无年级最后 → 稳定序；
│   │                                #   Master's 分支：master 按 ceil(n/2) 拆为左右两段，
│   │                                #   渲染 1–2 个 <ul> 于 .master-columns 内（n=1 加 .is-single）；
│   │                                #   行内 DOM 顺序保持 姓名 → Since → 链接（note 已移除）；
│   │                                #   CSS：010 的 .phd-columns 规则选择器并列 .master-columns；
│   │                                #   三轨改为 minmax(4em,1fr) 5.5em auto，姓名列弹性；
│   │                                #   .grade 字号显式 18px
│   ├── pages/
│   │   └── team.astro               # 【零改动】h3、student-section、Graduates；
│   │                                #   教师名片单列断点 .teacher-grid（767.98px）与 010 同阈值
│   ├── data/
│   │   └── students.json            # 【零改动】本特性不修改数据
│   ├── content.config.ts            # 【零改动】students schema 与链接三选一校验不变
│   └── styles/global.css            # 【零改动】容器 1180px 上限、24/16px 内距与色板不变
├── src/components/TeacherCard.astro # 【零改动】
└── .github/workflows/deploy.yml     # 【零改动】CI 门禁照常拦截构建失败
```

**Structure Decision**: 沿用 001–010 的单一 Astro 项目结构，不新增文件或公共 CSS 层。排序与两栏切分是分组展示决策，放在 `StudentGroup.astro` 的 frontmatter 中；PhD 与 Master's 共用 `byLevel` 与同一套响应式选择器，Master's 分支保留独立包装类 `.master-columns`，使验收与调试可按分组定位。`team.astro` 无需感知栏数，`h3` 标题仍只出现一次并横跨内容区。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

无违规项，无需记录。
