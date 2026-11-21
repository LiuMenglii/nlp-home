# Implementation Plan: Team 页 PhD Candidates 双栏布局

**Branch**: `010-team-phd-two-column-layout` | **Date**: 2026-11-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/010-team-phd-two-column-layout/spec.md`

## Summary

把 Team 页 PhD Candidates 名单由「单列铺满」改为「左右两栏 + 行内三槽」，并在页面收窄时退化为单栏。技术路线沿用既有 Astro 静态站点与组件级 scoped CSS（零新依赖、零新增 JS、零数据改动），全部改动收敛在 `src/components/StudentGroup.astro` 的 PhD 分组：

1. **两栏结构**（US1 / FR-001～FR-003）：在组件内把已排序的 PhD 数组按 `ceil(n/2)` 显式拆成左右两段，分别渲染为两个 `<ul>`，外层 `.phd-columns` 在 ≥768px 用 `repeat(2, minmax(0,1fr))` + 32px 栏间距布局，两栏顶线一致、等宽；`<768px` 单列（与教师名片单列断点同阈值）。n=1 时只渲染一个列表并标记 `is-single`，不产生空栏。
2. **行内三槽**（US2 / FR-004～FR-007）：每个 PhD 行按「姓名 → Since → 个人链接 → 备注」DOM 顺序输出，并在 ≥768px 用固定轨道网格 `4em 5em minmax(0,1fr)`（8px 间隙、24px 内距）把 Since 的起始竖线锁死、把唯一链接标签右对齐贴栏右缘；无年级、无链接的行只留空槽，不渲染任何占位；姓名仍为纯文本。480–767px 单栏用固定前缀轨道的 flex 行（姓名 4em、Since 5em、链接 `margin-left:auto` 靠右），Since 起始线与链接右缘在单栏内同样对齐。
3. **窄屏退化**（US3 / FR-002 / FR-009 / FR-012）：`<480px` 沿用基线竖排条目——第 1 行姓名居左、Since `margin-left:auto` 右对齐；第 2 行链接 `order:9` 独占整行、与姓名左缘对齐；姓名恢复自适应宽度。任何档位均无空栏、半宽列、链接折行或横向滚动。
4. **验证**（SC-001～SC-006 / Constitution VI）：`npm run check` + `npm run build` 作为机器门禁；真实浏览器按 11 档视口（1920 / 1440 / 1280 / 1024 / 768 / 767 / 576 / 481 / 480 / 375 / 320px）逐项测量栏宽、顶线、横向态 Since 左缘与链接右缘、竖排态 Since 右缘与链接左缘、跨区块姓名对齐与逐元素越界。

`team.astro`、`students.json`、`global.css`、Master's Students 分组、Graduates 名单与其余页面零改动。

## Technical Context

**Language/Version**: TypeScript 5.9.x（Astro 内置类型检查）；Node.js ≥ 22 LTS；Astro 7.3.8（`package-lock.json` 锁定，沿用现状）

**Primary Dependencies**: `astro`（唯一运行依赖，不变）。**本特性零新增依赖、零新增运行时 JS、零新增组件文件**

**Storage**: N/A——`src/data/students.json` 只读使用，逐字节不变；分组排序规则（grade 降序 → 无年级最后 → 稳定序）与链接标签映射（`url` → `github` → `scholar` 取第一个非空）原样复用

**Testing**: 沿用既有口径——`npm run check` + `npm run build` 作为 CI 门禁；布局验收为真实浏览器视口矩阵（1920 / 1440 / 1280 / 1024 / 768 / 767 / 576 / 481 / 480 / 375 / 320px），以 `getBoundingClientRect()` 逐项测量栏宽、顶线、槽位对齐与越界，不以 `scrollWidth` 单独判定；不引入 e2e / 视觉回归框架（Constitution V）

**Target Platform**: 纯静态 HTML（GitHub Pages，`output: 'static'`）；现代浏览器最新两个大版本；断点按整数视口宽度验收（768px 两栏、767px 单栏横向、479px 及以下竖排）

**Project Type**: 静态网站（Astro 单项目，沿用 001–009 结构）

**Performance Goals**: 零新增 JS、零新增请求与资源；仅新增 scoped CSS 规则与一次构建期数组切分，渲染开销可忽略

**Constraints**:
- 改动范围仅 `src/components/StudentGroup.astro` 的 PhD 分组分支与其新增的 PhD 作用域样式；Master's Students 分组（占位文案与既有单列样式）、Graduates 名单、Faculty 区块、`team.astro`、其余页面 MUST 零改动（FR-011）。
- 数据零改动：`students.json`、schema、排序规则、链接标签文案与箭头形态不变（FR-006、FR-010）。
- 行内固定内距沿用 24px（左右对称），左栏姓名左缘 MUST 与 Graduates 姓名左缘同线（FR-008）。
- MUST NOT 用页面级 `overflow-x: hidden`（或 `clip`）掩盖溢出；MUST NOT 以截断、隐藏链接、缩小字号换取两栏（Constitution VI、spec Assumptions）。
- 断点与教师名片单列断点一致（≥768px 两栏、<768px 单栏），不新增其他布局断点；<480px 竖排沿用既有 `max-width: 479.98px` 媒体查询，不调整其阈值。

**Scale/Scope**: 1 个源文件（`StudentGroup.astro`）；PhD 数据 9 条（6 条 Since、8 个链接标签，其余 1 条两者皆无）；1 个渲染界面 = `/team/` 的 PhD 分组（Master's 分组与 Graduates 为回归观察对象）；两栏切分 5 + 4

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原则 | Gate 检查项 | 状态 |
|------|------------|------|
| I. 内容准确性（不可妥协） | 本特性只改变展示位置：姓名、Since 文案、链接地址与标签、备注、排序均原样复用 `students.json` 与既有映射；不新增/改写任何成员信息。实现前以数据文件核对 9 条、6 Since、8 链接；spec US2 AS4/AS5 已按数据修正（季慧山 `grade=2021`、无链接；无年级者为李江楠、刘曦雨、刘正宵），见 research R8 与 data-model §1 | PASS |
| II. 内容与展示分离 | 只改展示模板与 scoped CSS，不触碰数据文件与 schema；后续成员增删仍只需改 `students.json`，两栏切分由 `ceil(n/2)` 自动推导 | PASS |
| III. 静态站点与 GitHub Pages | 构建配置、CI、部署方式零改动；变更后 `npm run check` + `npm run build` MUST 通过 | PASS |
| IV. 简洁学术化设计 | 不新增视觉元素（无表头、无竖线、无折叠/动效）、不改配色与字号；沿用既有分隔线与链接色板；零新依赖、零新 JS | PASS |
| V. 最小复杂度（YAGNI） | 不新增组件、工具类或构建脚本：一次数组切分 + 一个包装层 + 一组 PhD 作用域样式；不引入 `@container`、subgrid 或 CSS 多列等额外机制 | PASS |
| VI. 无布局破损（不可妥协） | 断点与槽宽按 768px 最紧档反推（见 research R3），并按 11 档真实浏览器逐项检查元素重叠、文字截断、内容溢出、非预期换行与页面横向滚动；以逐元素 `getBoundingClientRect()` 越界检查为权威判据；横向三槽形态覆盖 480–1920px（最紧档为 768px 两栏），<480px 为契约声明的竖排形态；任何档位的槽位折行均按缺陷处理 | PASS |

**无违规项。**

**Phase 1 后复核**：设计未引入数据写入、新依赖、运行时脚本、新组件或公共样式层；DOM 仅把 PhD 的单个 `<ul>` 拆为 1–2 个 `<ul>` 并调整行内元素顺序，三种形态（≥768px 两栏 / 480–767px 单栏横向 / <480px 竖排）由同一 DOM 经媒体查询切换；Master's 分组的 markup 与全部基线样式零改动；六条原则复核（含 VI 的溢出判定口径与 <480px 竖排声明）仍为 PASS。

## Project Structure

### Documentation (this feature)

```text
specs/010-team-phd-two-column-layout/
├── plan.md                          # 本文件（/speckit-plan 输出）
├── spec.md                          # 特性规格（已澄清）
├── checklists/
│   └── requirements.md              # 规格质量清单（已通过）
├── research.md                      # Phase 0 输出——R1 两栏拆分方式、R2 行内三槽技术、
│                                    #   R3 768px 槽宽反推、R4 单栏退化与 <480px 竖排、
│                                    #   R5 缺失字段与备注、R6 验收方法、R7 宪法合规、R8 数据快照
├── data-model.md                    # Phase 1 输出——PhD 成员行 / 栏 / 分组区域视图实体、
│                                    #   切分函数、字段缺失矩阵、三态不变量
├── quickstart.md                    # Phase 1 输出——11 档视口验证矩阵、测量脚本、回归与门禁
├── contracts/
│   └── team-phd-two-column.md       # Phase 1 输出——视口行为矩阵、分栏规则、行内槽位几何、
│                                    #   DOM 契约、竖排形态声明、对齐不变量与回归范围
├── evidence/                        # 实现期产物（实现与验收时生成并提交）
│   └── layout-verification.md       # 11 档视口测量记录与构建门禁结果
└── tasks.md                         # Phase 2 输出（/speckit-tasks 生成，本命令不创建）
```

### Source Code (repository root)

```text
nlp-home/
├── src/
│   ├── components/
│   │   └── StudentGroup.astro       # 【改动·唯一源文件】
│   │                                #   PhD 分支：phd 按 ceil(n/2) 拆为左右两段，渲染 1–2 个 <ul>
│   │                                #   于 .phd-columns 内（n=1 加 .is-single，不渲染空栏）；
│   │                                #   行内 DOM 顺序改为 姓名 → Since → 链接 → 备注（仅 PhD）；
│   │                                #   ≥768px 两栏网格 + 行内固定轨道 4em/5em/1fr；
│   │                                #   480–767px 单栏 flex（4em/5em/右对齐链接）；
│   │                                #   <480px 沿用基线竖排（姓名 + Since 右对齐 / 链接独占一行）；
│   │                                #   单栏时第二个 <ul> 首行不重复顶部分隔线，两栏时两列各有顶线；
│   │                                #   Master's 分支与全部基线样式零改动，新增规则以 .phd-columns 限定
│   ├── pages/
│   │   └── team.astro               # 【零改动】h3、student-section、Graduates；教师名片单列断点 .teacher-grid（767.98px）与本特性同阈值
│   ├── data/
│   │   └── students.json            # 【零改动】9 条数据逐字节不变
│   ├── content.config.ts            # 【零改动】students schema 与链接三选一校验不变
│   └── styles/global.css            # 【零改动】容器 1180px 上限、24/16px 内距与色板不变
├── src/components/TeacherCard.astro # 【零改动】名片组件本身；单列断点位于 team.astro .teacher-grid（767.98px）
└── .github/workflows/deploy.yml     # 【零改动】CI 门禁照常拦截构建失败
```

**Structure Decision**: 沿用 001–009 的单一 Astro 项目结构，不新增文件或公共 CSS 层。两栏切分是 PhD 分组独有的展示决策，放在 `StudentGroup.astro` 的 frontmatter 中（一次 `Math.ceil` 切片）；行内槽位与退化规则全部以 `.phd-columns` 前缀写成 scoped CSS，天然不影响同组件的 Master's 分支与页面其他区块。`team.astro` 无需感知栏数，`h3` 标题仍只出现一次并横跨内容区。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

无违规项，无需记录。
