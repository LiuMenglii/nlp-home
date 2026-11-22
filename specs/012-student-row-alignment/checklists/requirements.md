# Specification Quality Checklist: Team 页在读学生名单的列布局调整

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-11-22
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Validation Notes

- 通过（第 1 轮，2026-11-22，当时 10 条 FR 与 7 条 SC；后续新增 FR-011、SC-008）：均可通过真实浏览器渲染与元素外接矩形量测验证；无待澄清标记。
- 2026-11-22 用户澄清（2 项，其中 Since 口径已被第二轮澄清取代）：Since 曾以「整行水平居中」为准；<480px 竖排时 Since 保持右对齐、链接改为右对齐。竖排口径仍有效，已写入 Clarifications / FR-005。
- 冲突曾按「最小必要左移」处理（768px 双栏行内无法同时满足严格居中与 8px 间隙）；该规则已被第二轮澄清取消，改为三列固定宽度、两侧空白相等。
- 范围明确：仅调整两个在读分组的行内水平对齐；两栏结构、排序、切分、字号、数据、Graduates、Faculty 与其他页面均在范围之外；与 011 FR-005 / FR-006 的取代关系已声明。
- 数据快照已核对：30 位在读学生（19 PhD / 11 Master）、30 个 Since、4 个链接（均在 PhD）、全部有年级；验收计数与两栏条数（10 + 9、6 + 5）与 011 evidence 一致。
- 对齐判定口径已统一：以「行内容区」（行盒扣除 24px 行内内距）为基准，容差 ±1px；无链接行与有链接行分别表述，避免同线要求与链接宽度差异冲突。
- 2026-11-22 第二轮澄清（4 项）：验收环境改为智能体内置浏览器；SC-001 增至 9 档（含 768px）；支持下限 320px；横向行改为三列固定宽度 3.5em / 5em / 6.5em、两侧空白相等、Since 列内居中（整行中点偏左 27px），空链接列保留，取消碰撞夹取。此前「最小左移」判定已由本次澄清取代。
- 2026-11-22 补充（005–008）：新增 FR-011（Since 必须单行；5em 放不下时改为 5.5em，仍放不下按缺陷处理）与 SC-008（30 个 Since 单行）；姓名换行移出本期范围；右栏与左栏同理、不单独验收；CHK007 的 816px 观察已随夹取取消而失效。当前共 11 条 FR、8 条 SC。
