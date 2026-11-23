# Implementation Plan: Team 页教师链接标签与学生主页信息补全

**Branch**: `014-team-faculty-links-student-directions` | **Date**: 2026-11-22（Rev.2：2026-11-23 按 spec 澄清统一首页名片）| **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/014-team-faculty-links-student-directions/spec.md`

## Summary

在 Team 页与首页 Team 概览区完成三处内容补全，同时保持发表页、新闻页、首页其余区块与既有响应式规则零改动：

1. **教师链接语义拆分**：`teachers.json` 中原本承载 UCAS 资料页的 `homepage` 字段更名为 `ucasProfile`，并新增可选的个人主页字段 `homepage`；付鹏配置 `https://fupeng.ac.cn/`，其余三位显式写 `null`。`TeacherCard` 对两种名片统一渲染「邮箱（仅 Team 详细名片，如有）→ `UCAS Profile ↗` → `Homepage ↗`」：Team 页 Faculty 与首页 Team 概览共 8 张名片均以 `UCAS Profile ↗` 指代 UCAS 资料页，付鹏在两处的名片都额外显示 `Homepage ↗` 指向 `https://fupeng.ac.cn/`（2026-11-23 澄清）。链接项统一增加整项不换行约束（`.teacher-links a`），空间不足时按整项换行；`detailed` 分支自此只控制邮箱与 bio，不再控制链接文案与数量。
2. **学生 Scholar 补全**：仅向顾树焕、温泽林两条原本三字段全空的记录写入 `scholar`；赵语林因同名不同人不写入；其余 11 位保持三字段全空。已有链接的 17 位学生的 `url` / `github` / `scholar` 字段零 diff；其中 6 位按 FR-011/FR-012 更新 `directions`（其余 11 条链接记录整条零 diff）。14 位学生的检索结论见 [research.md](./research.md) R4，实施只按结论写入，不重复检索。
3. **学生研究方向**：把 6 位有公开自述来源的学生由 `["TBD"]` 替换为 1–2 个确认标签（杨晨旭、顾佴彬、李雨晴、佟政阳、刘曦雨、李佳睿）；其余 25 位保留 `["TBD"]`。`StudentGroup.astro` 已支持标签渲染与三轨布局，不改。

技术路线：沿用 Astro 单项目与既有数据/组件结构，零新增依赖、零新增运行时 JS、零新增组件或样式层；改动集中在 `src/data/teachers.json`、`src/data/students.json`、`src/content.config.ts`、`src/components/TeacherCard.astro` 与 `src/data/README.md`。Phase 0 无 `NEEDS CLARIFICATION`，技术决策与内容证据见 [research.md](./research.md)。

## Technical Context

**Language/Version**: TypeScript 5.9.x（Astro 内置类型检查）；Node.js ≥ 22 LTS；Astro 7.3.8（`package-lock.json` 锁定，沿用现状）

**Primary Dependencies**: `astro`（唯一运行依赖，不变）；`astro/zod`（Astro 内置，用于 teachers / students schema）；**本特性零新增依赖、零新增运行时 JS、零新增组件文件**

**Storage**: `src/data/teachers.json`（4 条）与 `src/data/students.json`（31 条），均由 `file` loader 读取；无数据库、无服务端存储

**Testing**: 机器门禁 `npm run check` + `npm run build`；数据契约用「临时修改 → 构建失败 / 构建通过 → 恢复」验证；布局用浏览器按 320 / 375 / 480 / 576 / 768 / 1024 / 1280 / 1440 / 1920px 九档视口测量；链接逐条在浏览器中核实；回归以源文件与数据文件的 `git diff` 范围验收，不做截图对比；不引入 e2e 或视觉回归框架（Constitution V）。现有 `tests/news-widgets.test.mjs` 与本特性无关，零改动

**Target Platform**: 纯静态 HTML（GitHub Pages，`output: 'static'`）；现代浏览器最新两个大版本；沿用既有 480px / 768px 断点，不新增断点

**Project Type**: 静态网站（Astro 单项目，沿用 001–013 结构）

**Performance Goals**: 零新增 JS、零新增请求与资源；付鹏在 Team 与首页两张名片各新增一个链接元素，6 位学生把占位标签换成真实文本，渲染与传输开销可忽略

**Constraints**:

- 教师数据 MUST 能区分 UCAS 资料页与个人主页；`ucasProfile` 与 `homepage` 均为 HTTPS 外链或 `null`；`homepage` 缺省 / `null` MUST NOT 导致构建失败（FR-002 / FR-015）。
- Team 页 Faculty 与首页 Team 概览的教师名片 MUST 以 `UCAS Profile ↗` 指代 UCAS 资料页，MUST NOT 再以 `Homepage` 指代；付鹏在两处的名片 MUST 依次显示 `UCAS Profile ↗` 与 `Homepage ↗`，其他教师只显示 `UCAS Profile ↗`（FR-001 / FR-003）。
- 链接区视觉顺序 MUST 为「邮箱（如有）→ UCAS Profile → Homepage」，首页概览名片无邮箱、为「UCAS Profile → Homepage」；`ucasProfile` / `homepage` 两个网页外链 MUST 使用 HTTPS、`target="_blank"` 与 `rel="noopener"`，`mailto:` 邮箱不受此约束（FR-004）。
- 两种名片的教师链接 MUST 按整项换行收纳，MUST NOT 元素重叠、文字截断、单词内部断行或越出卡片；MUST NOT 用页面级 `overflow-x: hidden` 掩盖（FR-005，Constitution VI）。
- `index.astro`、`team.astro`、`StudentGroup.astro`、Graduates、发表页、新闻页、导航与页脚 MUST 相对实施前零 diff；首页仅教师名片的链接标签文案与链接项可按 FR-001 / FR-003 / FR-004 / FR-005 变化，首页其余部分 MUST 零 diff（FR-016 / SC-006）。
- 学生 `scholar` MUST 只写入顾树焕 `https://scholar.google.com/citations?user=Fqk9CMkAAAAJ` 与温泽林 `https://scholar.google.com/citations?user=3gjCYDMAAAAJ`；赵语林与其余 11 位 MUST 保持三字段全空（FR-006 / FR-007 / FR-008）。
- 学生链接「`url` / `github` / `scholar` 三选一、至多一个非空」校验 MUST 保留；已有链接的 17 位学生的链接字段 MUST 零 diff；其中 6 位学生的 `directions` 按 FR-011 / FR-012 更新（FR-009）。
- 研究方向 MUST 只写入经本人自述来源确认的 6 位学生：杨晨旭 `Multimodal LLM` / `Reinforcement Learning`；顾佴彬 `Efficient LLM` / `Post-Training`；李雨晴 `RAG` / `Agent Memory`；佟政阳 `LLM`；刘曦雨 `LLM` / `Knowledge Editing`；李佳睿 `RAG` / `Memory`；其余 25 位保留 `["TBD"]`（FR-010 / FR-011 / FR-012 / FR-013）。
- 每个方向标签在 ≥1024px 视口 MUST 不在标签内部换行；窄视口按 013 既有规则换行，MUST NOT 造成页面级横向滚动、元素重叠或文字截断（FR-014）。
- `directions` 非空数组与 `src/data/README.md` 的维护约定 MUST 保持有效；教师新字段的 HTTPS 与可省略规则 MUST 写入数据维护文档（FR-015）。
- 变更 MUST 通过 `npm run check` + `npm run build`；实现后按宪法维护工作流提交/推送并经 PR 合并，部署后检查线上 Team 页与首页教师名片（Constitution 维护工作流）。

**Scale/Scope**: 5 个文件（`teachers.json`、`students.json`、`content.config.ts`、`TeacherCard.astro`、`README.md`）；4 位教师；31 位在读学生（8 条数据变更：2 条 Scholar + 6 条方向）；2 个渲染界面 = `/team/`（Faculty 区与两个在读学生分组）与 `/` 首页 Team 概览区（共 8 张教师名片）；9 档视口；既有 2 个断点（480 / 768px）。

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原则 | Gate 检查项 | 状态 |
|------|------------|------|
| I. 内容准确性（不可妥协） | UCAS 资料页 URL 原值保留；付鹏个人主页为规格确认的 `https://fupeng.ac.cn/`；Scholar 仅写入有强关联证据的 2 位，赵语林同名档案明确排除；方向标签全部来自个人主页 / Scholar 兴趣 / GitHub 简介的自述，无来源者保留 `TBD`，不凭课题组方向推测（FR-006～FR-013） | PASS |
| II. 内容与展示分离 | 两个教师链接、学生 Scholar 与方向全部只存在于 JSON 数据文件；组件按字段渲染，替换方向或补链接无需改模板或样式（FR-002 / FR-010） | PASS |
| III. 静态站点与 GitHub Pages | 构建配置、依赖、CI 与部署方式零改动；`npm run check` + `npm run build` 作为合并门禁（Constitution 维护工作流） | PASS |
| IV. 简洁学术化设计 | 沿用既有链接样式与 `--sky` 方向 chip；不新增动效、图标、边框装饰或交互；`UCAS Profile` 与 `Homepage`、`GitHub`、`Scholar` 标签风格一致 | PASS |
| V. 最小复杂度（YAGNI） | 零新增依赖、零新增运行时 JS、零新增组件或公共 CSS 层；以字段更名 + 一个可选字段表达两种链接，不引入通用链接数组；首页与 Team 页复用同一组件且链接渲染不再分支，仅邮箱与 bio 仍由 `detailed` 控制，不复制组件 | PASS |
| VI. 无布局破损（不可妥协） | 两种名片的教师链接沿用既有 `flex-wrap`，新增 `white-space: nowrap` 使整项换行；方向标签沿用 013 的 `minmax(0,1fr)` + `flex-wrap` + `overflow-wrap`；按九档真实浏览器检查重叠、截断、内容溢出、非预期换行与页面横向滚动；MUST NOT 用 `overflow-x: hidden` 掩盖（FR-005 / FR-014 / SC-004 / SC-005） | PASS |

**无违规项。**

**维护工作流门禁**：由 tasks.md 的构建验证、提交与推送、PR 合并与部署后验收覆盖；作者与提交者仅项目维护者本人，不添加 AI 共同作者尾注。

**Phase 1 后复核**：设计未引入新依赖、运行时 JS、新组件或公共样式层；教师数据契约与渲染职责仍分离，学生数据只做文本替换；Team 详细名片与首页概览名片共用同一链接渲染路径（`detailed` 仅控制邮箱与 bio），8 张名片语义一致；新增内容只增加一个链接项与若干等长标签，换行路径由既有 `flex-wrap`、`min-width: 0` 与统一 `nowrap` 吸收；首页除教师名片链接区外零 diff。六条原则复核（含 VI 的溢出判定口径）仍为 PASS。

## Project Structure

### Documentation (this feature)

```text
specs/014-team-faculty-links-student-directions/
├── plan.md                          # 本文件（/speckit-plan 输出）
├── spec.md                          # 特性规格（已澄清）
├── checklists/
│   └── requirements.md              # 规格质量清单
├── research.md                      # Phase 0 输出——R1 教师字段迁移、R2 两处名片标签统一、
│                                    #   R3 链接换行、R4 Scholar 证据、R5 方向来源、
│                                    #   R6 验收方法
├── data-model.md                    # Phase 1 输出——Teacher / Student / DirectionTag、
│                                    #   校验规则、视图映射与不变量
├── quickstart.md                    # Phase 1 输出——数据审计、构建门禁、失败用例、
│                                    #   九档视口测量与回归检查
├── contracts/
│   ├── teachers-data.md             # Phase 1 输出——teachers.json 字段契约、迁移规则、
│   │                                #   校验错误与维护流程
│   └── team-card.md                 # Phase 1 输出——Team 教师名片链接 DOM、紧凑名片
│                                    #   保持输出、换行与测量口径
└── tasks.md                         # Phase 2 输出（/speckit-tasks 生成，本命令不创建）
```

### Source Code (repository root)

```text
nlp-home/
├── src/
│   ├── data/
│   │   ├── teachers.json            # 【改动】homepage → ucasProfile；新增可选 homepage；
│   │   │                            #   付鹏填 https://fupeng.ac.cn/，其余三位 null
│   │   ├── students.json            # 【改动】仅 8 条：2 条新增 scholar、6 条替换 directions；
│   │   │                            #   其余 23 条零 diff；17 位已有链接学生的链接字段零 diff（6 条仅改 directions）
│   │   ├── README.md                # 【改动】教师字段更名与 homepage 语义、可空/HTTPS 规则
│   │   ├── graduates.json           # 【零改动】Homepage 标签与 url 语义不变
│   │   ├── publications.json        # 【零改动】
│   │   └── site.json                # 【零改动】
│   ├── content.config.ts            # 【改动】teachers schema：homepage → ucasProfile，
│   │                                #   新增 homepage；students 校验不变
│   ├── components/
│   │   ├── TeacherCard.astro        # 【改动】统一渲染 UCAS Profile / Homepage（detailed 仅控
│   │   │                            #   制邮箱与 bio）；链接项整项不换行（.teacher-links a）
│   │   └── StudentGroup.astro       # 【零改动】013 的标签渲染与三轨布局已满足需求
│   └── pages/
│       ├── team.astro               # 【零改动】
│       ├── index.astro              # 【零改动】紧凑名片链接区随共享组件按新契约渲染
│       ├── publications.astro       # 【零改动】
│       └── news/                    # 【零改动】
├── tests/news-widgets.test.mjs      # 【零改动】与本特性无关
├── .github/workflows/deploy.yml     # 【零改动】CI 门禁照常拦截构建失败
├── package.json                     # 【零改动】
├── package-lock.json                # 【零改动】
└── astro.config.mjs                 # 【零改动】
```

**Structure Decision**: 沿用 001–013 的单一 Astro 项目结构，不新增源文件或公共 CSS 层。教师链接字段属于 `teachers` collection 的 schema 职责，放在 `src/content.config.ts`；两种名片共用的链接标签、顺序与换行属于 `TeacherCard` 的展示职责，全部留在该组件的 frontmatter 与 scoped `<style>` 内；学生方向与链接只改数据文件，`StudentGroup` 无需感知内容变化。`team.astro` 只负责区块编排，保持零改动；`index.astro` 不改，首页教师名片因共享组件按同一契约渲染。

## Complexity Tracking

无违规项，无需记录。
