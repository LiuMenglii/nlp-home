# Implementation Plan: Team 页在读学生的研究方向标签（替换年级字段）

**Branch**: `013-student-direction-tags` | **Date**: 2026-11-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/013-student-direction-tags/spec.md`

## Summary

把 Team 页 PhD Candidates 与 Master's Students 两个在读学生分组的「姓名 → Since 入学年份 → 成员链接」行，改为「姓名 → 研究方向标签组 → 成员链接」：

1. **数据契约替换**：`students.json` 以 `directions`（非空字符串数组，至少 1 项）取代 `grade`；31 条在读学生当前一律写 `["TBD"]`。`grade` 从数据文件、students schema、组件排序/渲染与 `src/data/README.md` 中彻底删除。构建期新增校验：`directions` 缺失、非数组、空数组、含空/空白项时构建失败，错误信息包含文件、学生姓名与字段；不新增 `grade` 残留检测（评审决定：避免过度防御，`grade` 的删除由数据清理与检索保证）。
2. **展示替换**：在姓名与成员链接之间渲染该学生 `directions` 的全部标签（不截断、不省略），标签使用与教师研究方向一致的浅色 chip（具体视觉值以 [contracts/team-row.md §5](./contracts/team-row.md) 为唯一来源），标签组以 `role="list"` + `aria-label="Research directions"` 提供集合语义，顺序与数组顺序一致。页面不再出现 "Since" 或入学年份。
3. **排序调整**：删除按 `grade` 升序的排序；每个 `level` 分组内按数据文件条目顺序（entry id `stu-###`）展示。既有按 `level` 分组、≥768px 按 `ceil(n/2)` 切分两栏、`is-single` 单栏与空分组 "coming soon" 规则不变。
4. **布局**：≥480px 行内三轨 Grid：姓名 `3.5em` / 标签组 `minmax(0, 1fr)` / 链接 `6.5em`，`column-gap: 10px`；姓名居左、链接居右，标签组在列内 `flex-wrap` 换行。视口 <480px 沿用 flex 竖排：姓名与标签组共享可用行、标签组 `flex: 1 1 0; min-width: 0`，链接 `order: 9; flex: 0 0 100%` 独占最后一行并右对齐。单个标签 `max-width: 100%` + `overflow-wrap: anywhere`，标签组与姓名/链接不重叠，页面无横向滚动。
5. **成员链接补全**：对全部 31 名在读学生逐一核查，按「自建个人主页（含 GitHub Pages 学术主页）→ 机构个人资料页 → GitHub → Google Scholar」优先级择一填写；至少一项强关联证据，仅同名不写入；无可靠来源时三个字段保持 `null`。现有 16 条链接全部重新核实，发现更高优先级来源时替换并删除低优先级字段。不新增单独的证据文件（评审决定）；无链接学生名单在完成报告中列出。

技术路线：沿用 Astro 单项目与现有数据/组件结构，零新增依赖、零新增运行时 JS、零新增组件；改动集中在 `src/data/students.json`、`src/content.config.ts`、`src/components/StudentGroup.astro` 与 `src/data/README.md`。Phase 0 无 `NEEDS CLARIFICATION`，技术决策见 [research.md](./research.md)。

## Technical Context

**Language/Version**: TypeScript 5.9.x（Astro 内置类型检查）；Node.js ≥ 22 LTS；Astro 7.3.8（`package-lock.json` 锁定，沿用现状）

**Primary Dependencies**: `astro`（唯一运行依赖，不变）；`astro/zod`（Astro 内置，用于 students schema）；**本特性零新增依赖、零新增运行时 JS、零新增组件文件**

**Storage**: `src/data/students.json`（`file` loader 读取的 JSON 数组）；无数据库、无服务端存储。教师、毕业生、论文等数据文件零改动

**Testing**: 机器门禁 `npm run check` + `npm run build`；数据契约用「临时修改 → 构建失败 → 恢复」验证；布局用当前智能体工具自带浏览器按 320 / 375 / 480 / 576 / 768 / 1024 / 1280 / 1440 / 1920px 九档视口测量；链接逐条在浏览器中核实；其他页面以源文件与数据文件零 diff 验收，不做截图对比；不要求单独证据文件。不引入 e2e 或视觉回归框架（Constitution V）。现有 `tests/news-widgets.test.mjs` 与本特性无关，零改动

**Target Platform**: 纯静态 HTML（GitHub Pages，`output: 'static'`）；现代浏览器最新两个大版本；断点沿用既有 480px / 768px

**Project Type**: 静态网站（Astro 单项目，沿用 001–012 结构）

**Performance Goals**: 零新增 JS、零新增请求与资源；每条学生行新增一个标签组 DOM 与少量 CSS 声明，渲染开销可忽略

**Constraints**:

- `directions` MUST 为非空字符串数组且至少 1 项；当前 31 条 MUST 为 `["TBD"]`；MUST NOT 保留 `grade` 或任何入学年份字段（FR-001 / FR-002 / FR-011）。
- `directions` 缺失、非数组、空数组或含空/空白项时 MUST 构建失败，错误信息 MUST 包含 `src/data/students.json`、学生姓名与 `directions` 字段（FR-009）。
- 在读名单 MUST NOT 再按年级排序；组内 MUST 按数据文件条目顺序（entry id `stu-###`）展示；分组、`ceil(n/2)` 切分、两栏断点与空分组占位不变（FR-004）。
- ≥480px 行内顺序 MUST 为「姓名 → 方向标签组 → 成员链接」；标签 MUST 使用可辨识 chip 样式；标签组 MUST 换行收纳；每个标签文本 MUST 完整可见，MUST NOT 裁剪、遮挡或省略；MUST NOT 与姓名/链接重叠（FR-005 / FR-006 / FR-007）。
- <480px MUST 依次呈现姓名、标签组、链接；链接独占最后一行并右对齐；标签组 MUST NOT 覆盖或截断姓名与链接（FR-008）。
- `directions` MUST 以一组方向信息的语义呈现（`role="list"` + `aria-label="Research directions"`，子项 `role="listitem"`），标签顺序 MUST 与数据数组顺序一致（FR-014）。
- 每个学生至多一个链接字段非空；优先级 MUST 为自建个人主页（含 GitHub Pages 学术主页）→ 机构个人资料页 → GitHub → Google Scholar；链接 MUST 为 HTTPS；无可靠链接时三个字段保持 `null`（FR-015 / FR-017 / FR-019）。
- 写入链接前 MUST 至少取得一项强关联证据（中科院信工所 / 国科大 / G3（CIGMA）/ 在读层次 / 导师，或与课题组成员合作论文）；仅同名 MUST NOT 写入（FR-016）。
- 现有链接 MUST 重新核实；发现更高优先级来源时 MUST 替换并删除低优先级字段；失效或不属于本人的链接 MUST 移除（FR-018）。
- `src/data/README.md` MUST 删除 `grade` 说明，补充 `directions` 格式、至少 1 项、当前 `TBD` 占位、链接优先级/HTTPS 要求与无链接时统一写 `null` 的约定（FR-010）。
- Faculty、Graduates（含 `year`）、首页、发表页、新闻页、导航与页脚对应的源文件与数据文件 MUST 零 diff；不做截图对比；`specs/001`–`012` 历史文档 MUST NOT 改写（FR-013）。
- MUST NOT 用页面级 `overflow-x: hidden`（或 `clip`）掩盖溢出；MUST NOT 以缩小字号、隐藏标签或省略号规避长标签（`0.9rem` 为既有教师 chip 基准，不因长标签再缩小；Constitution VI）。
- 变更 MUST 通过 `npm run check` + `npm run build`；实现后按宪法维护工作流提交/推送并经 PR 合并，部署后检查线上 Team 页（Constitution 维护工作流）。

**Scale/Scope**: 4 个源文件（`students.json`、`content.config.ts`、`StudentGroup.astro`、`README.md`）；无新增证据文件；在读学生 31 条（PhD 20 / Master's 11），当前 16 条有链接、15 条无链接；1 个渲染界面 = `/team/` 的两个在读学生分组；9 档视口；2 个断点（480 / 768px）。

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原则 | Gate 检查项 | 状态 |
|------|------------|------|
| I. 内容准确性（不可妥协） | `TBD` 是规格明确授权的临时占位，不构成虚构；成员链接 MUST 经强关联证据核实，仅同名不写入；现有链接全部重新核实，无法核实时留空并在报告中列出（FR-016 / FR-018 / SC-007） | PASS |
| II. 内容与展示分离 | 研究方向只存在于 `students.json` 的 `directions` 数组；组件按数组渲染，维护者替换 `TBD` 无需改模板或样式（US2 / FR-010） | PASS |
| III. 静态站点与 GitHub Pages | 构建配置、依赖、CI 与部署方式零改动；`npm run check` + `npm run build` 作为合并门禁（Constitution 维护工作流） | PASS |
| IV. 简洁学术化设计 | 标签 chip 复用教师研究方向既有视觉（具体值以 `contracts/team-row.md §5` 为准）；不新增动效、图标、边框装饰或交互 | PASS |
| V. 最小复杂度（YAGNI） | 零新增依赖、零新增运行时 JS、零新增组件/工具类/公共 CSS 层；删除 `grade` 排序与 `.grade` 样式，净复杂度下降；不引入筛选、折叠、分页或容器查询 | PASS |
| VI. 无布局破损（不可妥协） | 标签组 `flex-wrap` + `min-width: 0`，单标签 `max-width: 100%` + `overflow-wrap: anywhere`；≥480px 三轨 Grid 与 <480px flex 均由既有媒体查询切换；按九档真实浏览器逐项检查重叠、截断、内容溢出、非预期换行与页面横向滚动；MUST NOT 用 `overflow-x: hidden` 掩盖（FR-006 / FR-007 / SC-003） | PASS |

**无违规项。**

**维护工作流门禁**：由 tasks.md 的提交与推送、CI、PR 合并与部署后验收覆盖；作者与提交者仅项目维护者本人，不添加 AI 共同作者尾注。

**Phase 1 后复核**：设计未引入新依赖、运行时 JS、新组件或公共样式层；数据契约与渲染职责仍分离；行内 DOM 由「姓名 → Since → 链接」变为「姓名 → 标签组 → 链接」，三种视口形态由既有媒体查询切换；标签组换行与 `min-width: 0` 消除了新增内容导致溢出的路径；六条原则复核（含 VI 的溢出判定口径）仍为 PASS。

## Project Structure

### Documentation (this feature)

```text
specs/013-student-direction-tags/
├── plan.md                          # 本文件（/speckit-plan 输出）
├── spec.md                          # 特性规格（已澄清）
├── checklists/
│   └── requirements.md              # 规格质量清单（已通过）
├── research.md                      # Phase 0 输出——R1 数据校验、R2 行布局、R3 排序、
│                                    #   R4 链接补全协议、R5 可访问性、R6 验收方法、
│                                    #   R7 宪法合规、R8 数据快照
├── data-model.md                    # Phase 1 输出——Student / DirectionTag / MemberLink、
│                                    #   校验规则、视图状态与不变量
├── quickstart.md                    # Phase 1 输出——数据检查、构建失败用例、链接审计、
│                                    #   九档视口测量与回归门禁
├── contracts/
│   ├── students-data.md             # Phase 1 输出——students.json 字段契约、链接优先级、
│   │                                #   校验错误与维护流程
│   └── team-row.md                  # Phase 1 输出——DOM 契约、视口矩阵、标签样式、
│                                    #   测量口径与回归范围
└── tasks.md                         # Phase 2 输出（/speckit-tasks 生成，本命令不创建）
```

### Source Code (repository root)

```text
nlp-home/
├── src/
│   ├── data/
│   │   ├── students.json            # 【改动】31 条：grade → directions ["TBD"]；
│   │   │                            #   链接按优先级补全/重新核实，每人至多一个非空
│   │   ├── README.md                # 【改动】删除 grade；补充 directions 格式、
│   │   │                            #   TBD 占位、链接优先级/HTTPS 与 null 约定
│   │   ├── teachers.json            # 【零改动】
│   │   ├── graduates.json           # 【零改动】year 字段保留
│   │   └── publications.json        # 【零改动】
│   ├── content.config.ts            # 【改动】students schema：移除 grade，新增 directions；
│   │                                #   新增 directions 校验（文件/姓名/字段级报错）
│   ├── components/
│   │   ├── StudentGroup.astro       # 【改动】删除 grade 排序、渲染与 .grade 样式；新增标签组；
│   │   │                            #   ≥480px 三轨 Grid、<480px flex 换行；
│   │   │                            #   两栏切分、链接映射、空分组占位不变
│   │   └── TeacherCard.astro        # 【零改动】chip 视觉基准
│   ├── pages/
│   │   └── team.astro               # 【零改动】分组标题、两栏包装层与 Graduates 区块
│   └── styles/
│       └── global.css               # 【零改动】容器、内距与色板不变
├── tests/news-widgets.test.mjs      # 【零改动】与本特性无关
├── .github/workflows/deploy.yml     # 【零改动】CI 门禁照常拦截构建失败
├── package.json                     # 【零改动】
├── package-lock.json                # 【零改动】
└── astro.config.mjs                 # 【零改动】
```

**Structure Decision**: 沿用 001–012 的单一 Astro 项目结构，不新增源文件或公共 CSS 层。学生数据契约属于 `students` collection 的 schema 职责，放在 `src/content.config.ts`；方向标签的渲染与行内布局属于 `StudentGroup` 的展示职责，全部留在该组件的 scoped `<style>` 内；PhD 与 Master's 共用同一组标签样式与媒体查询选择器，避免两个分组出现两套几何。`team.astro` 无需感知行内布局，`h3`、两栏包装层与 Graduates 区块保持不变。

## Complexity Tracking

无违规项，无需记录。
