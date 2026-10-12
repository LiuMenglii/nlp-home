# Implementation Plan: Team 页布局优化与移动端修复（Team Page Polish）

**Branch**: `002-team-page-polish` | **Date**: 2026-10-12（rev：纳入 GitHub 链接需求——spec 2026-10-12 澄清回填） | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-team-page-polish/spec.md`

## Summary

对重建后的 Team 页（/team/）做表现层优化与最小数据层扩展，**沿用 001 既有技术栈**（Astro 7.x 静态站点 + scoped CSS，零新依赖、零 JS）：

1. **移动端缺陷修复**：教师网格 420px 最小列宽超出 375px 手机可视宽度，叠加 `body { overflow-x: hidden }` 导致卡片右侧被裁切不可见——最小列宽改为 `min(420px, 100%)`。
2. **Graduates 列对齐**：≥768px 三字段（姓名 / 学位·年份 / 去向）列对齐；<768px 降级紧凑流式（同类字段位置仍跨行一致）。
3. **空白消除**：在读学生条目两端分布、教师卡片研究方向横向换行（四档视口分档判定，分档阈值以 spec FR-004 为唯一规范源，本文不复述具体数值）。
4. **GitHub 链接承载**（2026-10-12 spec 回填）：为学生与毕业生新增可选 `github` 数据字段，学生现有 `url` 中的 GitHub 链接迁移至 `github`（`url` 仅保留个人主页），页面以独立 `GitHub↗` 标签展示（FR-006 / FR-010 / SC-006）。

改动收敛于 3 个 `.astro` 组件 + `src/content.config.ts` + `src/data/students.json`；主页共享组件回归验证。

## Technical Context

**Language/Version**: TypeScript 5.x（Astro 内置）；Node.js ≥ 22 LTS；Astro ^7.3.8（沿用现状，lockfile 已锁定）

**Primary Dependencies**: `astro`（唯一运行依赖，不变）；devDependencies `@astrojs/check` + `typescript`（不变）。**本特性零新增依赖、零新增 JS**。

**Storage**: 最小扩展（FR-006）——`src/content.config.ts` 为 `students` / `graduates` 两个 collection 新增可选 `github` 字段（复用既有 `httpsUrl` 校验器，Constitution：外部链接 MUST HTTPS）；`src/data/students.json` 将 4 条 GitHub 链接自 `url` 迁移至 `github`（`url` 置 null，此后仅承载个人主页）；`src/data/graduates.json` 内容零改动（现值均无 GitHub 链接，字段为后续导入完整名单预留）；`teachers.json` 与其余全部字段零改动。

**Testing**: 沿用 001 口径：`npm run check` + `npm run build` 作为 CI 门禁（Zod schema 扩展后照常在构建期拦截数据错误）；布局验收为 quickstart.md 手动视口矩阵（375 / 768 / 1024 / ≥1280px，浏览器 DevTools 响应式模式），不引入 e2e 框架（YAGNI）。

**Target Platform**: 纯静态 HTML（GitHub Pages）；现代浏览器（Chrome/Firefox/Safari/Edge 最新两个大版本）；验收视口 375px / 768px / 1024px / ≥1280px。

**Project Type**: 静态网站（Astro `output: 'static'`，不变）

**Performance Goals**: 零 JS 新增；纯 CSS + 模板条件渲染改动；渲染性能不劣化（无新请求、无新资源）。

**Constraints**: 表现层改动（模板 + scoped CSS）+ 数据层严格限定 `github` 字段（FR-006）；不触碰构建配置与 CI；`TeacherCard.astro` 为 Team 页与主页共享组件，改动须保证主页无回归（FR-009）；教师（teachers）不加 `github` 字段、不展示 GitHub 标签。

**Scale/Scope**: 改动 5 个文件（`src/pages/team.astro`、`src/components/TeacherCard.astro`、`src/components/StudentGroup.astro`、`src/content.config.ts`、`src/data/students.json`）+ 1 个文档同步（`specs/001-homepage-rebuild/data-model.md` 学生/毕业生字段表补 `github` 行——维护者字段参考，Constitution II）；回归验证 1 个文件（`src/pages/index.astro`）；数据量：教师 5 人、在读学生 8 人（4 人带 GitHub 链接）、毕业生 5 条。

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原则 | Gate 检查项 | 状态 |
|------|------------|------|
| I. 内容准确性（不可妥协） | GitHub 迁移保持原链接 URL 逐字不变，仅换承载字段与展示形态；其余展示内容不改、仅改排版；信息字段完整性与 001 一致（FR-007） | PASS |
| II. 内容与展示分离 | 数据层改动严格限定于 `github` 字段新增与学生 `url→github` 迁移（用户 2026-10-12 澄清授权，FR-006），且该改动**强化**分离：GitHub 链接今后成为纯数据维护项，不再混入 `url` 语义；schema 变更随本特性 PR 走审查流程（维护工作流合规） | PASS |
| III. 静态站点与 GitHub Pages | 构建流程、CI 门禁、部署方式不变；变更后 `astro check` + `astro build` 必须照常通过（FR-009） | PASS |
| IV. 简洁学术化设计 | `GitHub↗` 为纯文本链接，复用既有 `Link ↗` / `Homepage ↗` 模式与色板；零新依赖、零新 JS、无动效 | PASS |
| V. 最小复杂度（YAGNI） | 不引入 CSS 框架/e2e 工具/新抽象；一个可选字段 + 一处条件渲染；尽量做减法（移除 detailed 模式纵向标签覆写）；小步提交 | PASS |

**无违规项**（原则 II 的数据层改动有 spec 澄清与 FR-006 最小范围授权，属合规例外而非违规）。

## Project Structure

### Documentation (this feature)

```text
specs/002-team-page-polish/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)——github 字段约定 + url→github 迁移明细 + 消费的既有字段
├── quickstart.md        # Phase 1 output (/speckit-plan command)——四档视口手动验证矩阵（含 GitHub 标签验证）
├── contracts/
│   └── team-layout.md   # Team 页布局契约（视口行为矩阵、对齐规则、空白判定、GitHub 标签规则、回归范围）
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
nlp-home/
├── src/
│   ├── content.config.ts           # 【改动】students / graduates schema 新增可选 github（httpsUrl 校验器）
│   ├── data/
│   │   ├── teachers.json           # 【零改动】（FR-006：teachers 维持现状）
│   │   ├── students.json           # 【改动】4 条 GitHub 链接 url→github 迁移（李江楠/张瀚文/郑明钰/刘正宵），
│   │   │                           #        url 置 null；杨晨旭的个人主页 url 保留
│   │   └── graduates.json          # 【零内容改动】github 字段经 schema 可用，现值均无 GitHub 链接
│   ├── components/
│   │   ├── TeacherCard.astro       # 【改动】detailed 模式研究方向布局（纵向堆叠→横向换行填充），
│   │   │                           #        移除 white-space: nowrap 溢出隐患；主页 compact 模式回归验证
│   │   └── StudentGroup.astro      # 【改动】① 条目行改为两端分布（姓名居左、Since/备注居右）消除右侧空白
│   │                               #        ② 姓名后渲染 GitHub↗ 标签（github 非空时，FR-010）
│   └── pages/
│       ├── team.astro              # 【改动】① teacher-grid 最小列宽 min(420px, 100%) 修复移动端溢出
│       │                           #        ② Graduates 行 CSS Grid 三列对齐（≥768px，<768px 降级流式）
│       │                           #        ③ 毕业生行渲染 GitHub↗ 标签（github 非空时，去向列内联，FR-010）
│       └── index.astro             # 【仅回归验证】主页 Team 概览区块（共享 TeacherCard，FR-009）
├── specs/001-homepage-rebuild/
│   └── data-model.md               # 【文档同步】Student / Graduate 字段表补 github 行（维护者字段参考）
└── .github/workflows/deploy.yml    # 【零改动】CI 门禁照常拦截构建失败
```

**Structure Decision**: 沿用 001 单一 Astro 项目结构，不新增任何目录/文件；代码改动收敛在 Team 页直接相关的 3 个 `.astro` 文件 + schema 定义 + 一份学生数据迁移；不新建公共 CSS 工具类（改动点彼此独立，抽公共层违反 YAGNI）。`github` 字段的维护者文档以本特性 data-model.md 为准，并同步补入 001 data-model.md 字段表（其 `url`="个人主页"既有定义在迁移后更加名副其实，无需改动）。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

无违规项，无需记录。
