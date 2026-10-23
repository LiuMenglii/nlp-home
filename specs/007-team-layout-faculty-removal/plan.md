# Implementation Plan: Team 页学生分组纵向展开、教师移除与成员链接标签（Team Layout, Faculty Removal & Member Link Tags）

**Branch**: `007-team-layout-faculty-removal` | **Date**: 2026-10-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-team-layout-faculty-removal/spec.md`

## Summary

本特性改 Team 页的三处**展示层**并伴随一处**数据契约扩展**，沿用 001–006 的纯 Astro 静态站点 + 组件 scoped CSS，零新增依赖、零新增运行时 JS：

1. **学生分组纵向排列**（US1 / FR-001～FR-005）：`StudentGroup.astro` 的 `.student-groups` 由 `repeat(auto-fit, minmax(min(320px, 100%), 1fr))` 改为单列 `minmax(0, 1fr)`，PhD Candidates 与 Master's Students 在**所有视口**下各占整行、上下排列；既有 `gap: 32px` 直接满足 FR-005 的 ≥32px 纵向间距；分组内条目排版（姓名居左、年级/备注靠右、24px 对称内距、跨区块姓名列对齐）保持不动。
2. **移除王老师介绍**（US2 / FR-006～FR-010、FR-020）：从数据源 `teachers.json` 删除王伟平整条记录（Team 页与首页共用同一 collection，两处同步消失），删除其不再被引用的照片 `public/teachers/wang-weiping.svg`（构建产物中该路径不可访问）；其余 4 位教师的字段与相对顺序零改动；`index.astro` 与 `team.astro` 的 `.teacher-grid` 在 ≥1280px 由 3 列改为 2 列，使 4 张卡片呈 2×2（FR-009 / SC-011）；更新 `src/data/README.md` 的教师人数（5 → 4）。
3. **成员链接标签三选一**（US3 / FR-012～FR-019）：students / graduates schema 新增 `scholar` 字段（复用既有 HTTPS 校验），并以对象级 `superRefine` 强制 `url` / `github` / `scholar` **至多填写一个**，冲突时构建失败并指明数据文件、成员姓名与**全部**冲突字段（按 `url` → `github` → `scholar` 顺序）。展示层：在读学生姓名改为纯文本，标签由「姓名链接 + 可选 GitHub」改为**唯一标签**（Homepage / GitHub / Scholar）；毕业生列表增加 Scholar 渲染，`is-empty` 判定扩展到三个字段。实测三种标签文案宽度为 `Homepage ↗` 106.11px、`GitHub ↗` 74.48px、`Scholar ↗` 76.50px，最长者仍是既有 Homepage，标签列沿用既有 **6.5em = 117px**（约 10% 余量）并在列内居中，两类名单姓名列统一 **5em**（毕业生五列首列 4.5em → 5em，去向列相应收窄 0.5em），不新增列宽；在读学生在视口 <480px（`max-width: 479.98px`，与 `global.css` 的 480px 媒体查询同值）降级为标签独占一行的堆叠态、左对齐。

数据补齐：顾佴彬 `url = https://gccnlp.github.io/`；杨晨旭保留既有 `url`（展示形态由姓名链接改为 Homepage 标签）；新增李雨晴（`phd`，`grade: "2022"`，`url = https://qdcassie-li.github.io/`，插在顾佴彬之后）；刘曦雨 `scholar = https://scholar.google.com/citations?user=94lNc6oAAAAJ&hl=zh-CN`，并删除其无法核实的 `grade`（页面不显示 Since，FR-022）。

改动收敛于 8 个文件：`src/components/StudentGroup.astro`、`src/pages/team.astro`、`src/pages/index.astro`（仅 `.teacher-grid` 列数）、`src/content.config.ts`、`src/data/students.json`、`src/data/teachers.json`、`src/data/README.md`，以及删除 `public/teachers/wang-weiping.svg`。`TeacherCard.astro`、`global.css` 与两处共享的教师展示组件零改动。

## Technical Context

**Language/Version**: TypeScript 5.9.x（Astro 内置）；Node.js ≥ 22 LTS；Astro 7.3.8（lockfile 已锁定，沿用现状）

**Primary Dependencies**: `astro`（唯一运行依赖）；devDependencies `@astrojs/check` + `typescript`。**本特性零新增依赖、零新增 JS**。

**Storage**: N/A（纯静态站点）。构建期只读数据：`src/data/teachers.json`（5 → 4 条）、`src/data/students.json`（8 → 9 条，新增 `scholar` 字段）、`src/data/graduates.json`（14 条，schema 新增 `scholar`，本期无数据变更）。schema 定义集中在 `src/content.config.ts`；展示排序在页面/组件 frontmatter 派生，无运行期读写。

**Testing**: 沿用既有口径：`npm run check` + `npm run build` 作为 CI 门禁（`.github/workflows/deploy.yml` 同口径）。**实测确认**：`astro check` 会执行 content sync 并校验集合 schema（含对象级 `superRefine`），字段类型错误与自定义校验失败均以退出码 1 中断，因此互斥数据用例在 `check` 与 `build` 两处均生效。新增负向数据用例（同一成员填写 `url` + `github` / 三字段全填 → 失败并报出文件、姓名、按顺序的全部冲突字段，验证后还原），以及毕业生 `scholar` 渲染的临时正向 fixture（佀庆一临时改为 `scholar`，验证后还原）。布局验收按 [quickstart.md](./quickstart.md) 的十档视口矩阵（1920 / 1280 / 1024 / 768 / 767 / 576 / 481 / 480 / 375 / 320px）在真实浏览器核对，并用 `getBoundingClientRect()` 量测分组边缘、标签列线与横向溢出；不引入 e2e 框架（Constitution V / YAGNI，FR-011 禁止新增运行时脚本）。

**Target Platform**: 纯静态 HTML（GitHub Pages，`output: 'static'`，`base='/nlp-home'`）；现代浏览器最新两个大版本，验收基准为 Chrome 最新稳定版 + 系统字体栈（Windows/macOS 复测）；验收最窄 320px，向上不设上限（spec Assumptions）。

**Project Type**: 静态网站（Astro 单项目，沿用 001–006 结构）

**Performance Goals**: 零 JS 新增；纯 CSS（Grid/Flex + 媒体查询）与数据改动，无新请求、无新资源；Teachers 卡由 5 张降为 4 张，学生条目由 8 条增至 9 条，页面 DOM 规模基本持平。

**Constraints**: 展示层改动限于 `StudentGroup.astro` / `team.astro` 的模板与 scoped CSS，以及 `index.astro` 与 `team.astro` 的 `.teacher-grid` 在 ≥1280px 的列数（3 → 2，构成 2×2）；数据侧仅允许删除王伟平记录与照片、新增李雨晴、补齐三个链接字段、删除刘曦雨 `grade` 与新增 `scholar` schema 字段；不改配色、字体、字号与既有断点定义（学生堆叠态按视口宽度判定，写作 `max-width: 479.98px`，与 `global.css` 的 480px 媒体查询同值）；两类名单姓名列均按最多 4 个汉字设计为 5em（毕业生五列首列 4.5em → 5em，去向列收窄 0.5em），标签在 6.5em 列内居中；`StudentGroup` 的 `Props` 接口不变；不得依赖 `body { overflow-x: hidden }` 掩盖横向溢出（Constitution VI），溢出判定以逐元素 `getBoundingClientRect().right ≤ document.documentElement.clientWidth` 为权威。

**Scale/Scope**: 1 个页面（`/team/`）的 3 个区块 + 首页人员区块的数据与教师网格联动；4 位教师、9 位在读学生、14 位毕业生；8 个改动文件（含删除 1 个静态资源）；无新增源文件（除本目录规划产物）。

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原则 | Gate 检查项 | 状态 |
|------|------------|------|
| I. 内容准确性（不可妥协） | 王伟平删除依据 spec 明示的用户更正；其余 4 位教师字段逐项不动（FR-008）。三个新增主页与 Google Scholar 地址均来自 spec 扩展输入并已在 Assumptions 中记录归属核实（顾佴彬 / 李雨晴 / 杨晨旭 / 刘曦雨，Scholar 主页已确认有内容）；李雨晴入学年份 2022 由用户确认；刘曦雨年级无法核实，本期删除其 `grade` 字段、页面不显示 Since（FR-022），不凭推测展示。未凭推测填写任何信息 | PASS |
| II. 内容与展示分离 | 王伟平移除、李雨晴新增、链接字段补齐、刘曦雨 `grade` 删除全部只改 JSON 数据文件；`scholar` 是数据契约的一次性扩展，后续成员维护仍只改 `students.json` / `graduates.json`。互斥约束由 schema 在构建期执行，不需要模板承载业务规则 | PASS |
| III. 静态站点与 GitHub Pages | 构建配置、CI、部署方式零改动；`astro check` + `astro build` 照常通过（实测 check 会校验集合 schema），反向数据用例证明不合规数据无法合入发布分支 | PASS |
| IV. 简洁学术化设计 | 零新依赖、零新运行时 JS、无动效；标签沿用既有配色（`--blue-deep`，hover `--blue`）与 `↗` 形制；不引入标签墙或图标库 | PASS |
| V. 最小复杂度（YAGNI） | 不新增组件、公共样式文件或抽象层；单列分组只改一条 `grid-template-columns`；教师 2×2 只改两条既有列数声明；互斥校验为一个局部 `superRefine`；标签渲染在既有两处模板内原地扩展 | PASS |
| VI. 无布局破损（不可妥协） | 五项破损定义纳入 [quickstart.md](./quickstart.md) 验收：320–1920px 十档视口 × `/team/` 全区块与 `/` 教师区块；标签列沿用 6.5em（117px）并在列内居中，最长标签 `Homepage ↗` 实测 106.11px，并在 Windows/macOS 复测；两类名单姓名列均按最多 4 个汉字设计为 5em（毕业生首列 +0.5em、去向列 -0.5em）；逐元素 `getBoundingClientRect().right ≤ documentElement.clientWidth` 为权威判据，不以 `overflow-x: hidden` 或 `scrollWidth` 单独判定 | PASS |
| 维护工作流 | 模板/样式变更经 Pull Request 合入；合并前确认本地 `check` / `build` 与渲染无布局破损；部署后检查线上页面渲染（tasks T023/T024） | PASS |

**无违规项。** 数据改动（删除 1 位教师及其照片、新增 1 位学生、补 3 个链接字段、删除刘曦雨 `grade`、新增 `scholar` schema 字段）均在 spec FR-015～FR-017、FR-020、FR-022 中显式授权，不属于 Constitution 违规。

**Phase 1 后复核**：设计未引入数据写入、新依赖或运行时脚本；`Props` 接口不变，数据契约仅新增一个可选 HTTPS 字段并增加互斥 refine；单列分组、2×2 教师网格与标签列宽决策在 [research.md](./research.md) R1/R2/R4/R5 中记录。六条原则与维护工作流复核仍为 PASS；交付流程按维护工作流纳入 PR 与部署后线上复核（T023/T024）。

## Project Structure

### Documentation (this feature)

```text
specs/007-team-layout-faculty-removal/
├── plan.md                                  # This file (/speckit-plan command output)
├── research.md                              # Phase 0 output——R1 纵向分组、R2 教师移除范围、
│                                            #   R3 三选一数据契约、R4 标签列宽实测、R5 学生行布局与堆叠、
│                                            #   R6 毕业生行扩展、R7 验收方式、R8 宪法合规、R9 数据落地
├── data-model.md                            # Phase 1 output——教师/学生/毕业生数据契约 + 链接标签
│                                            #   派生模型 + 两类名单显示模型 + 校验口径
├── quickstart.md                            # Phase 1 output——视口矩阵、标签矩阵、负向构建用例
├── contracts/
│   └── team-layout-member-links.md          # Phase 1 output——结构契约、视口行为矩阵、标签列契约、
│                                            #   数据互斥契约、移除不变量
└── tasks.md                                 # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
nlp-home/
├── src/
│   ├── components/
│   │   └── StudentGroup.astro          # 【改动】.student-groups 单列（FR-001～FR-003）；
│   │                                   #   姓名改纯文本（FR-013）；单一标签渲染
│   │                                   #   Homepage / GitHub / Scholar（FR-012/FR-018）；
│   │                                   #   姓名列 5em + 标签列 6.5em 固定轨道、列内居中（FR-019）；
│   │                                   #   <480px 堆叠态标签独占一行、左对齐（FR-019）；Props 不变
│   ├── pages/
│   │   ├── team.astro                  # 【改动】毕业生 .grad-links 增加 scholar 渲染（FR-012）；
│   │   │                               #   is-empty 判定扩至 url/github/scholar（FR-012）；
│   │   │                               #   毕业生姓名列 5em、标签列沿用 6.5em 并居中（去向列 -0.5em）；<768px 堆叠态规则保持；
│   │   │                               #   .teacher-grid ≥1280px 由 3 列改为 2 列（2×2，FR-009）
│   │   └── index.astro                 # 【改动】.teacher-grid ≥1280px 由 3 列改为 2 列（2×2，FR-009）；
│   │                                   #   人员区块随 teachers collection 自动同步（FR-007）
│   ├── content.config.ts               # 【改动】students / graduates schema 新增 scholar（https）；
│   │                                   #   新增单一链接字段 refine：≥2 个非空即构建失败，
│   │                                   #   报错含数据文件、姓名、冲突字段（FR-014）
│   └── data/
│       ├── teachers.json               # 【改动】删除王伟平整条记录（FR-006～FR-008）
│       ├── students.json               # 【改动】顾佴彬补 url；刘曦雨补 scholar 并删除 grade；
│       │                               #   新增李雨晴（phd / 2022 / url），插在顾佴彬之后（FR-015/016/017/022）
│       ├── graduates.json              # 【零改动】schema 新增 `scholar`（T011，见 content.config.ts），本期数据零变更
│       └── README.md                   # 【改动】教师人数 5 → 4；补充三个链接字段、互斥约定、`url` 语义与姓名长度（FR-021）
├── public/
│   └── teachers/
│       └── wang-weiping.svg            # 【删除】王伟平照片，构建产物中不可访问（FR-020）
├── src/components/TeacherCard.astro    # 【零改动】教师卡片组件与卡片内容不变
├── src/styles/global.css               # 【零改动】色板、字体、容器宽度、480px 断点不变
└── .github/workflows/deploy.yml        # 【零改动】CI 门禁照常拦截构建失败
```

**Structure Decision**: 沿用 001–006 的单一 Astro 项目结构，不新增组件、目录或公共 CSS 工具类。分组方向切换只在 `StudentGroup.astro` 内替换一条 `grid-template-columns`；教师 2×2 只在 `team.astro` 与 `index.astro` 的 `.teacher-grid` 各改一条列数声明；链接标签在两个既有列表模板内原地扩展（在读学生新增 `.member-link` 类，毕业生沿用 `.grad-links`），两类标签均在 6.5em 列内居中，毕业生五列首列由 4.5em 调整为 5em（去向列收窄 0.5em）；互斥校验放在 `content.config.ts` 的既有 collection schema 中，复用 `httpsUrl` 与对象级 `superRefine` 模式（与 teachers photo / publications date 校验同型）。数据侧只改两个 JSON 文件与数据维护指南，不新增数据文件。学生堆叠态按视口宽度判定，沿用与 `global.css` 480px 媒体查询同值的 `max-width: 479.98px`，不引入新断点。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

无 Constitution 违规项，无需记录。

**范围说明（非违规）**：`scholar` 字段是本特性唯一的数据契约扩展（FR-017），用于承载 Scholar 标签；它与 `url` / `github` 的互斥由构建期校验保证，不改变「内容更新只改数据文件」的维护方式。

**布局权衡（非违规）**：按 A1 决策，毕业生姓名列 4.5em → 5em，去向列相应收窄 0.5em（9px）；长去向在列内换行仍属既有允许行为（spec Assumptions），不改变五项布局破损判据。
