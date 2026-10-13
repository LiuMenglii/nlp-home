# Implementation Plan: Team 页布局优化与移动端修复（Team Page Polish）

**Branch**: `002-team-page-polish` | **Date**: 2026-10-12（rev2：纳入毕业生 `url` 字段、Graduates 五列布局与 FR-011 链接列、FR-012 排序、FR-004 适用范围拓展——spec 2026-10-12 第二轮澄清回填） | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-team-page-polish/spec.md`

## Summary

对重建后的 Team 页（/team/）做表现层优化与最小数据层扩展，**沿用 001 既有技术栈**（Astro 7.x 静态站点 + scoped CSS，零新依赖、零 JS）：

1. **移动端缺陷修复**（已合入 main）：教师网格 420px 最小列宽超出 375px 手机可视宽度，叠加 `body { overflow-x: hidden }` 导致卡片右侧被裁切不可见——最小列宽改为 `min(420px, 100%)`。
2. **Graduates 五列对齐与排序**（rev2）：≥768px 五字段（姓名 / 学位 / 毕业年份 / 去向 / 链接）列对齐——学位与毕业年份拆为两列，链接列为集中放置 `Homepage↗` / `GitHub↗` 外链标签的独立列（FR-011）；列表按 FR-012 排序（毕业年份降序 → 同年 PhD 在前 → 无年份最后 → 稳定排序，渲染时完成）；<768px 降级窄屏整齐布局（同类字段位置仍跨行一致）。
3. **空白消除**：在读学生条目两端分布（T006 中间间隙收拢校准）、教师卡片研究方向横向换行、Graduates 行宽度与内容相称（T010，与五列布局一体设计）；FR-004 适用范围拓展至 Team 页内容区全部内容容器（嵌套逐层适用），分档阈值以 spec FR-004 为唯一规范源，本文不复述具体数值。
4. **链接承载**（两轮 spec 回填累计）：学生与毕业生可选 `github` 字段 + 学生 `url→github` 迁移（已合入 main）；毕业生新增可选 `url` 字段并填入三个已核实主页取值，页面以独立 `GitHub↗` / `Homepage↗` 标签展示（FR-006 / FR-010 / FR-011 / SC-006 / SC-007）。

rev2 增量改动收敛于 `src/pages/team.astro`（五列 Grid + 链接列 + 排序）+ `src/components/StudentGroup.astro`（T006）+ `src/content.config.ts`（graduates `url`）+ `src/data/graduates.json`（3 条主页取值）；主页共享组件回归验证。

## Technical Context

**Language/Version**: TypeScript 5.x（Astro 内置）；Node.js ≥ 22 LTS；Astro ^7.3.8（沿用现状，lockfile 已锁定）

**Primary Dependencies**: `astro`（唯一运行依赖，不变）；devDependencies `@astrojs/check` + `typescript`（不变）。**本特性零新增依赖、零新增 JS**。

**Storage**: 最小扩展（FR-006，两轮澄清授权累计）——`src/content.config.ts` 为 `students` / `graduates` 新增可选 `github` 字段（已合入 main）、为 `graduates` 新增可选 `url` 字段（rev2，均复用既有 `httpsUrl` 校验器，Constitution：外部链接 MUST HTTPS）；`src/data/students.json` 4 条 GitHub 链接已自 `url` 迁移至 `github`（已合入 main）；`src/data/graduates.json` 填入三个已核实主页取值（佀庆一 / 杨泽娴 / 刘源鑫，FR-006(b)；谭宇彤、温哲暂无），`github` 现值均为空、字段为导入完整名单预留；`teachers.json` 与其余全部字段零改动。

**Testing**: 沿用 001 口径：`npm run check` + `npm run build` 作为 CI 门禁（Zod schema 扩展后照常在构建期拦截数据错误）；布局验收为 quickstart.md 手动视口矩阵（375 / 768 / 1024 / ≥1280px，浏览器 DevTools 响应式模式），不引入 e2e 框架（YAGNI）。

**Target Platform**: 纯静态 HTML（GitHub Pages）；现代浏览器（Chrome/Firefox/Safari/Edge 最新两个大版本）；验收视口 375px / 768px / 1024px / ≥1280px。

**Project Type**: 静态网站（Astro `output: 'static'`，不变）

**Performance Goals**: 零 JS 新增；纯 CSS + 模板条件渲染改动；渲染性能不劣化（无新请求、无新资源）。

**Constraints**: 表现层改动（模板 + scoped CSS）+ 数据层严格限定 `github` / 毕业生 `url` 字段（FR-006）；不触碰构建配置与 CI；`TeacherCard.astro` 为 Team 页与主页共享组件，改动须保证主页无回归（FR-009）；教师（teachers）不加 `github` 字段、不展示 GitHub 标签。

**Scale/Scope**: rev2 增量改动 4 个文件（`src/pages/team.astro`：Graduates 五列 Grid + 链接列渲染 + FR-012 排序比较器 + T010 宽度校准；`src/components/StudentGroup.astro`：T006 中间间隙收拢；`src/content.config.ts`：graduates schema 新增 `url`；`src/data/graduates.json`：3 条 `url` 取值）+ 1 个文档同步（`specs/001-homepage-rebuild/data-model.md` Graduate 字段表补 `url` 行——维护者字段参考，Constitution II）；回归验证 1 个文件（`src/pages/index.astro`）；US1 / US4 / `github` 迁移已合入 main，本 rev 仅回归验证。数据量：教师 5 人、在读学生 8 人（4 人带 GitHub 链接）、毕业生 5 条（3 条带个人主页、均无 GitHub 链接）。

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原则 | Gate 检查项 | 状态 |
|------|------------|------|
| I. 内容准确性（不可妥协） | GitHub 迁移保持原链接 URL 逐字不变（已合入）；三个毕业生主页 URL 已对照源页面核实归属（2026-10-12，spec Assumptions）：佀庆一→phoebussi.github.io、杨泽娴→ccds.fzu.edu.cn/info/1204/11629.htm、刘源鑫→llyx97.github.io；其余展示内容不改、仅改排版；信息字段完整性与 001 一致（FR-007） | PASS |
| II. 内容与展示分离 | 数据层改动严格限定于 `github` 字段新增、学生 `url→github` 迁移与毕业生 `url` 字段新增及三条已核实取值（用户 2026-10-12 两轮澄清授权，FR-006），且该改动**强化**分离：GitHub / 主页链接今后均为纯数据维护项，不再混入 `url` 语义；FR-012 排序在渲染层完成、与数据文件条目顺序解耦；schema 变更随本特性 PR 走审查流程（维护工作流合规） | PASS |
| III. 静态站点与 GitHub Pages | 构建流程、CI 门禁、部署方式不变；变更后 `astro check` + `astro build` 必须照常通过（FR-009） | PASS |
| IV. 简洁学术化设计 | `GitHub↗` / `Homepage↗` 为纯文本链接，复用既有 `Link ↗` / `Homepage ↗` 模式与色板；零新依赖、零新 JS、无动效 | PASS |
| V. 最小复杂度（YAGNI） | 不引入 CSS 框架/e2e 工具/新抽象；两个可选字段 + 条件渲染 + 一个排序比较器；小步提交 | PASS |

**无违规项**（原则 II 的数据层改动有 spec 澄清与 FR-006 最小范围授权，属合规例外而非违规）。

## Project Structure

### Documentation (this feature)

```text
specs/002-team-page-polish/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)——含 R8 链接列设计、R9 FR-012 排序比较器
├── data-model.md        # Phase 1 output (/speckit-plan command)——github / 毕业生 url 字段约定 + url→github 迁移明细 + 五列结构与 FR-012 排序
├── quickstart.md        # Phase 1 output (/speckit-plan command)——四档视口手动验证矩阵（含五列对齐、排序、Homepage↗ / GitHub↗ 标签、全容器空白判定验证）
├── contracts/
│   └── team-layout.md   # Team 页布局契约（视口行为矩阵、五列对齐规则、链接列、FR-012 排序、空白判定、回归范围）
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
nlp-home/
├── src/
│   ├── content.config.ts           # 【rev2 改动】graduates schema 新增可选 url（httpsUrl 校验器）；
│   │                               #   students / graduates github 字段已合入 main
│   ├── data/
│   │   ├── teachers.json           # 【零改动】（FR-006：teachers 维持现状）
│   │   ├── students.json           # 【已合入】4 条 GitHub 链接 url→github 迁移完成
│   │   └── graduates.json          # 【rev2 改动】填入 3 条已核实主页取值（佀庆一/杨泽娴/刘源鑫）；
│   │                               #   谭宇彤、温哲暂无主页留空；github 现值均为空（字段已就绪）
│   ├── components/
│   │   ├── TeacherCard.astro       # 【已合入】detailed 模式研究方向横向换行（US4）；本 rev 仅主页回归验证
│   │   └── StudentGroup.astro      #   【已合入】两端分布 + GitHub↗ 标签；【rev2 改动】T006 中间间隙收拢校准
│   └── pages/
│       ├── team.astro              # 【已合入】teacher-grid min(420px, 100%) 修复移动端溢出（US1）、
│       │                           #   Graduates 三列对齐初版（US2）
│       │                           # 【rev2 改动】① Graduates 行升级五列 Grid（姓名/学位/毕业年份/去向/链接，
│       │                           #   学位与年份拆列、链接列集中放 Homepage↗/GitHub↗ 标签，FR-003/FR-011）
│       │                           #   ② 排序比较器改按 FR-012（年份降序→同年 PhD 在前→无年份最后→稳定）
│       │                           #   ③ T010 列表宽度与内容相称校准（与 T006 左起始节奏一致）
│       └── index.astro             # 【仅回归验证】主页 Team 概览区块（共享 TeacherCard，FR-009）
├── specs/001-homepage-rebuild/
│   └── data-model.md               # 【文档同步】Graduate 字段表补 url 行（github 行已同步；维护者字段参考）
└── .github/workflows/deploy.yml    # 【零改动】CI 门禁照常拦截构建失败
```

**Structure Decision**: 沿用 001 单一 Astro 项目结构，不新增任何目录/文件；rev2 代码改动收敛在 Team 页直接相关的 2 个 `.astro` 文件 + schema 定义一处字段新增 + 毕业生数据三条取值；不新建公共 CSS 工具类（改动点彼此独立，抽公共层违反 YAGNI）。`github` / 毕业生 `url` 字段的维护者文档以本特性 data-model.md 为准，并同步补入 001 data-model.md 字段表（其 `url`="个人主页"定义与学生字段命名一致）。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

无违规项，无需记录。
