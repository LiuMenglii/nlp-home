# Implementation Plan: Publications 链接修复与 CCF 等级完整标注

**Branch**: `main`（特性目录 `009-publication-link-ccf`；当前未创建独立特性分支） | **Date**: 2026-11-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-publication-link-ccf/spec.md`

## Summary

本特性是对 Publications 数据的**一次性治理**，外加一处最小的展示层真实性修复。技术路线沿用既有 Astro 静态站点（零新增依赖、零新增运行时 JS）：

1. **链接核验与修复**（US1 / US3 / FR-001～FR-009）：对 135 条条目中的 125 条现有链接（66 条 DOI + 59 条 arXiv）逐条核验。DOI 用 Crossref REST 元数据 + 落地页题名核对；arXiv 用 arXiv API 的 `doi` / `journal_ref` 判断是否存在正式版本，存在则按「DOI > 出版社/会议论文集 > 期刊官网 > arXiv」替换。4 条中文论文优先改用期刊官方 DOI（若复核无法确认则按审计规则移除），EMNLP 2019 条目改用 `10.18653/v1/D19-1245`；10 条无链接条目逐条检索，能核实则补 `url` + `date`，不能核实则先提交课题组负责人确认，确认后保持无链接并记录原因。所有决定写入 135/135 条审计记录。
2. **CCF 等级判定与标注**（US2 / FR-010～FR-018）：按 `year` 选择目录版本（2026+ / 2022–2025 / 2019–2021 / 2015–2018 / 2014 及以前），按论文类型资格（仅 Full/Regular paper）与中文期刊目录（2019）生成「venue × year → A/B/C/无」判定表；对 42 条数据做变更（38 条补 B、3 条补 C、1 条 Findings of ACL 2021 撤销 A）。最终分布锁定 A=66、B=48、C=3、无等级=18。
3. **DOM 真实性修复**（US4 / FR-016 / FR-017 / SC-006）：`PublicationItem.astro` 不再渲染隐藏的 CCF-A 假徽标与隐藏的 `Link ↗` 假文案；缺失槽改为**空槽 + CSS `min-inline-size` 预留宽度**，仅由样式占位，DOM 中不存在任何伪造等级或伪造链接文本。`CCFBadge.astro` 保持现状（其 59.66px 宽度归一化被复用）。
4. **数据契约强化**（FR-007 / FR-018）：在既有 publications schema 中补反向 refine——无 `url` 时不得存在 `date`；同时去掉 `ccf` 的 `.nullable()`，并在 publications `superRefine` 中拒绝 `url === null`，使「移除链接必须同步移除日期」与「缺省字段必须省略、不得写 null」由构建强制发现，而非仅靠人工审查。
5. **留痕与验证**（SC-008 / Constitution 维护工作流）：链接审计、CCF 判定审计、构建/DOM/布局验证结果分别落在 `specs/009-publication-link-ccf/evidence/` 下的三份记录中。

改动收敛为 3 个源文件：`src/data/publications.json`（`url` / `ccf` / 随链接增删的 `date`）、`src/components/PublicationItem.astro`（DOM 与槽位样式）、`src/content.config.ts`（url/date 双向 + ccf/url 非 null 校验）。`publications.astro`、`index.astro`、`CCFBadge.astro`、`global.css` 与部署配置零改动（主页概览复用 `PublicationItem` 与共享数据，链接/CCF 更新会同步反映在渲染结果中，属预期；`index.astro` 源文件不动）。

## Technical Context

**Language/Version**: TypeScript 5.9.x（Astro 内置类型检查）；Node.js v26.13.0（仓库约束 ≥22 LTS）；Astro 7.3.8（`package-lock.json` 锁定，沿用现状）

**Primary Dependencies**: `astro`（唯一运行依赖）；`zod` 经 `astro/zod` 使用（既有）。**本特性零新增依赖**；审计使用 Node 内置 `fetch` / `urllib` 与公开只读 API（Crossref REST、arXiv API、DOI resolver），一次性脚本不入库。

**Storage**: `src/data/publications.json`（file loader 加载的 135 条 JSON 数组，构建期只读）；`src/content.config.ts` 中的 publications schema 为数据契约唯一机器校验点。本特性只改 `url`、`ccf` 与随链接增删所必需的 `date`。

**Testing**: 沿用既有口径 `npm run check` + `npm run build` 作为 CI 门禁；新增一次性数据门禁脚本（URL/date 配对、HTTPS、CCF 枚举与分布、venue×year 期望矩阵）、构建产物 DOM 断言脚本（徽标计数 117、A/B/C=66/48/3、`.pub-link` 锚点数=有链接条目数且每个有链接条目 2 个同 URL 锚点、无隐藏假徽标/假链接文本）与浏览器视口矩阵（1440 / 1280 / 1024 / 768 / 767 / 576 / 575 / 480 / 375 / 320px + 200% 缩放）。不引入 e2e 框架或新测试依赖（Constitution V）。

**Target Platform**: 纯静态 HTML（GitHub Pages，`output: 'static'`，`base='/nlp-home'`）；现代浏览器最新两个大版本。

**Project Type**: 静态网站（Astro 单项目，沿用 001–008 结构）

**Performance Goals**: 零新增运行时 JS、零新增站点请求；审计与判定全部发生在构建前的一次性流程与数据文件中；135 条渲染路径不变。

**Constraints**:
- 数据层只允许改 `url`、`ccf`、随链接增删的 `date`；`title` / `venue` / `year` / `authors` / `featured` 零改动（FR-008、FR-019）。
- 展示层只允许改 `PublicationItem.astro` 的槽位模板结构与 scoped CSS；不得改版式、筛选、分组、配色、字号（FR-019）。
- 外部链接必须 HTTPS；中文论文只接受期刊官方 DOI 或期刊官网文章页；无链接条目不得保留 `date`，`url`/`ccf` 缺省必须省略字段、不得为 `null`（FR-003、FR-006、FR-007、FR-018）。
- CCF 槽宽度以 `CCFBadge.astro` 现有 `min-inline-size: 59.66px` 为基准；LINK 槽宽度取实测 `Link ↗` 自然宽度并向上取整（预期 45–47px，非硬性；实测后写入 DOM 契约），空槽与满槽宽度差 ≤1px 为硬性验收。
- 不得用页面级 `overflow-x: hidden` 掩盖溢出；不新增运行时依赖、外部服务或定时任务（FR-020、Constitution VI）。

**Scale/Scope**: 135 条论文（125 条现有链接 = 66 DOI + 59 arXiv；10 条无链接；77 条现有 CCF = 67 A + 10 B；4 条中文期刊）；42 条 CCF 数据变更；5 条已知错误链接；2 个消费界面（`/publications/` 与主页概览）；3 个源文件改动 + 3 份证据记录。

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原则 | Gate 检查项 | 状态 |
|------|------------|------|
| I. 内容准确性（不可妥协） | 全部链接以 Crossref / arXiv API / 官方落地页题名核验；CCF 以官方目录版本与中文目录判定；无法确认时先提交课题组负责人确认，确认后保持无链接/无等级并在审计记录说明；5 条已知错误链接按 spec 指定目标修正；135/135 条审计留痕 | PASS |
| II. 内容与展示分离 | 内容变更只改 `src/data/publications.json`；`PublicationItem.astro` 的改动仅移除伪造占位、以 CSS 预留槽宽，不改变「常规内容更新只改数据文件」的维护方式；schema 仅增加 url/date 双向 refine 与 ccf/url 非 null 校验 | PASS |
| III. 静态站点与 GitHub Pages | 构建配置、CI、部署方式零改动；变更后 `npm run check` + `npm run build` MUST 通过；无服务端运行时或定时任务 | PASS |
| IV. 简洁学术化设计 | 不新增视觉元素、不改配色/字号/间距；CCF 徽标与 Link 外观保持现状；零新依赖、零运行时 JS | PASS |
| V. 最小复杂度（YAGNI） | 不新增组件、工具库或构建插件；审计脚本一次性使用、不入库；CCF 判定用一张显式映射表而非抽象规则引擎；schema 仅在既有 publications 校验上增加 url/date 配对与 null 拒绝 | PASS |
| VI. 无布局破损（不可妥协） | 空槽以 `min-inline-size` 预留原宽度，满槽宽度不变；按 006 的 10 档视口口径复检 1440 / 1280 / 1024 / 768 / 767 / 576 / 575 / 480 / 375 / 320px 与 200% 缩放；以逐元素 `getBoundingClientRect()` 判定溢出，不以 `scrollWidth` 单独判定 | PASS |

**无违规项。** 说明：`src/content.config.ts` 的 url/date 配对与 null 拒绝属于数据契约（FR-007、FR-018），不是页面/模板/样式改动，不违反 FR-019；它让这些不变量在构建期被强制发现，符合 Constitution I 的准确性要求。

**Phase 1 后复核**：设计未引入数据写入、新依赖、运行时脚本或新组件；数据契约字段集合不变（`date` 已是 006 引入的既有字段），仅强化 url/date 双向与 ccf/url 非 null 约束；`Props` 接口不变，主页与 Publications 页共享同一渲染路径。六条原则复核（含 VI 无布局破损）仍为 PASS。

## Project Structure

### Documentation (this feature)

```text
specs/009-publication-link-ccf/
├── plan.md                          # 本文件（/speckit-plan 输出）
├── spec.md                          # 特性规格（已澄清）
├── checklists/
│   └── requirements.md              # 规格质量清单（已通过）
├── research.md                      # Phase 0 输出——R1 槽位 CSS 预留、R2 链接审计方法与网络能力、
│                                    #   R3 链接替换/保留判定、R4 CCF 映射方式、R5 数据契约强化、
│                                    #   R6 验证方法、R7 审计留痕、R8 宪法合规映射
├── data-model.md                    # Phase 1 输出——Publication / Catalog Version / Venue Rating /
│                                    #   Link Source / Audit Record 与不变量、预期分布
├── quickstart.md                    # Phase 1 输出——数据门禁、审计记录核对、DOM 断言、视口矩阵
├── contracts/
│   ├── publications-data.md         # Phase 1 输出——数据契约、允许的 diff、不变量与校验命令
│   ├── ccf-rating.md                # Phase 1 输出——venue×year 判定表、归一化规则、预期分布
│   └── publication-item-dom.md      # Phase 1 输出——条目 DOM 契约与槽位宽度契约
├── evidence/                        # 实现期产物（由一次性脚本/人工核验生成并提交）
│   ├── link-audit.md                # 135/135 条链接审计记录（当前/最终 URL、来源、证据、决定）
│   ├── ccf-audit.md                 # 135/135 条 CCF 判定记录（目录版本、类型资格、结论）
│   └── verification.md              # 构建、DOM 断言、视口矩阵与 diff 范围记录
└── tasks.md                         # Phase 2 输出（/speckit-tasks 生成，本命令不创建）
```

### Source Code (repository root)

```text
nlp-home/
├── src/
│   ├── components/
│   │   ├── PublicationItem.astro    # 【改动】移除 CCFBadge 的隐藏 A 假徽标与隐藏 "Link ↗" 假文案；
│   │   │                            #   有任一标签时渲染双槽，空槽为无子元素空 span；
│   │   │                            #   .pub-slot-ccf 预留 59.66px，.pub-slot-link 预留实测宽度；
│   │   │                            #   有标签时徽标/Link 外观与位置不变；Props 接口不变
│   │   └── CCFBadge.astro           # 【零改动】保留 min-inline-size: 59.66px 宽度归一化
│   ├── pages/
│   │   ├── publications.astro       # 【零改动】年份分组、排序、导航与吸顶标题不变
│   │   └── index.astro              # 【零改动】主页概览复用 PublicationItem，自动继承
│   ├── data/
│   │   └── publications.json        # 【改动】125 条链接核验/修正、10 条无链接审计补全；
│   │                                #   42 条 CCF 变更；随链接增删同步 date
│   ├── content.config.ts            # 【改动】publications schema 增加 url/date 配对与 ccf/url 非 null 校验
│   └── styles/global.css            # 【零改动】色板、字体、容器与 overflow 防线不变
└── .github/workflows/deploy.yml     # 【零改动】CI 门禁照常拦截构建失败
```

**Structure Decision**: 沿用 001–008 的单一 Astro 项目结构，不新增组件、目录或公共样式。链接与 CCF 的内容变更全部收敛在 `src/data/publications.json`；DOM 真实性修复只落在共享条目组件 `PublicationItem.astro`（主页与 Publications 页同时受益，`publications.astro` 零改动）；数据契约仅增加 url/date 配对与 ccf/url 非 null 校验。审计脚本为一次性工具，不进入仓库，避免引入需要长期维护的运行时/CI 依赖。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

无 Constitution 违规项，无需记录。
