# 布局需求质量检查清单：Publications 条目与年份导航响应式优化

**Purpose**: 检验 Publications 响应式布局需求（三档条目排布、标签双槽、年份合并与手机导航）的完整性、清晰性、一致性与可度量性
**Created**: 2026-10-23
**Feature**: [spec.md](../spec.md)

**Note**: 本清单由 `/speckit-checklist` 基于特性上下文与需求生成，仅检验"需求写得对不对"，不检验实现是否正确。
**Review Ownership**: 本清单为评审者所有的需求质量评审产物。仅当评审者确认某条需求质量准则已满足时才标记 `[x]`。
**Marker Semantics**: `[x]` 表示该准则已通过需求质量评审，不代表实现工作完成。

## 跨文档一致性与验收标准

- [x] CHK001 - 验收视口矩阵在四处枚举不一致（FR-001：≥1280/1024/768/767/576/575/480/375/320；US1 Independent Test：1440/1024/768/767/576/575/375/320；US3 Independent Test：320/375/576/767/768/1024/1440；SC-008：320/375/480/575/576/767/768/1024/1440）。是否存在唯一权威的验收视口集合？缺少 480px 或 575px 的验收场景是否构成覆盖缺口？[Consistency, Coverage, Spec §FR-001, §US1 IT, §US3 IT, §SC-008]
- [x] CHK002 - SC-004 同时出现「所有带标签条目」的全量要求与「抽查覆盖四类条目」的抽样要求；验收到底是全量还是抽样？若为抽样，样本量、抽样规则与四类条目的最少样本数是否定义？[Consistency, Measurability, Spec §SC-004]

## 内部冲突与可满足性

- [x] CHK003 - FR-005 要求「槽位宽度由标签自身内容决定」且跨条目边缘偏差 ≤1px，Assumptions 又允许取「内容固有宽度」且不规定像素值；若 CCF-A/B/C 等标签固有宽度差 >1px，该需求是否仍可满足？宽度归一化是必需还是可选，spec 与 plan 的「仅实测 >1px 才改」口径是否一致？[Conflict, Measurability, Spec §FR-005, §Assumptions, Plan §R2]
- [x] CHK004 - FR-003 先写标签簇「MAY 与期刊名称首行同高」，后写「MUST 保持与期刊名称首行对齐」；MAY 与 MUST 是否矛盾？若 MAY 成立，何种情形允许不对齐，该情形是否可判定？[Ambiguity, Conflict, Spec §FR-003]

## 边界与切换

- [x] CHK005 - FR-001 规定 768 / 576 处为半开区间且「无缝、无重叠」，但未规定亚像素视口（767.5px、575.5px、浏览器缩放与分数 DPR）归入哪一档；Assumptions 将亚像素边界交给浏览器固有行为，这是否足以保证切换时不出现两档规则叠加或丢失？[Gap, Assumption, Spec §FR-001, §Assumptions, Edge Cases]
- [x] CHK006 - FR-008 允许年份导航容器内横向滑动，FR-010 又要求页面级横向滚动为 0；「容器内滑动」与「页面溢出」的边界是否有可量测判据？滑动条的占位/视觉呈现、滑动可达性提示，以及滑动是否改变页面宽度，是否属于「布局破损」？[Consistency, Measurability, Spec §FR-008, §FR-010]

## 覆盖与追溯

- [x] CHK007 - Edge Cases 的 11 条场景（共行恰临界、期刊名超整行、长标题+短期刊名、无标签第三行省略、320px、空合并组、2019/2020 边界、横竖屏与跨档切换等）是否每条都有对应的 FR 或验收场景？仅存在于 Edge Cases 叙述、未进入 Requirements/Acceptance Scenarios 的条目，应视为需求缺口还是非约束性说明？[Coverage, Traceability, Spec §Edge Cases]
- [x] CHK008 - 年份合并的「同年份按标题字母序」是否定义了大小写、空格/标点与 locale 规则？默认 `sort` 与 `localeCompare` 可能给出不同顺序，验收以何为准？[Clarity, Ambiguity, Spec §FR-007]
- [x] CHK009 - 年份导航点击后的「锚点偏移」是否量化（相对粘性导航高度的偏移值、目标标题可见性判据），还是仅由 SC-006 的「不被遮挡」兜底？锚点 slug（如 `year-2019-earlier`）属于需求还是实现细节，是否需要在 spec 中约定？[Clarity, Gap, Spec §FR-007, §SC-006]

## 约束可验证性

- [x] CHK010 - FR-010 的「非预期换行」「布局破损」是否有客观定义，能否逐项判定？「不得依赖 `overflow-x: hidden` 掩盖溢出」只出现在 plan 的 Constraints 中，是否应上升为 spec 需求？FR-011/FR-012 的零数据改动、零新增依赖/脚本、构建与 CI 通过，是否都配有可执行的验证方式？[Measurability, Constraint, Spec §FR-010～§FR-012, Plan §Constraints]

## 日期与导航变更后的新增核查

- [x] CHK011 - FR-011 将数据改动限定为「新增 `date` 并回填 135 条」，但 `date` 口径依赖正式出版页；当前 59 条仅有 arXiv、10 条无链接。spec 是否定义来源无法核实时的处理（阻止上线 / 暂留空 / 降级为年月），以及来源审计由谁验收？[Completeness, Dependency, Spec §FR-011, §Assumptions]
- [x] CHK012 - FR-007 要求所有分组内按 `date` 降序、同一日期按标题字母序，但未定义比较规则（字符串比较 vs `localeCompare`、locale、大小写与标点）；验收以何为准？[Ambiguity, Spec §FR-007, §SC-006]
- [x] CHK013 - FR-008 规定 <768px 分组标题吸顶且「同一时刻只显示当前分组标题」，但未定义它与顶部粘性导航的层级/重叠关系，也未定义计数为三位数时标题高度变化如何保持不遮挡内容；该行为是否可客观验收？[Clarity, Edge Case, Spec §FR-008, §SC-007]

## 评审决议记录（2026-10-23）

| 条目 | 决议 |
|---|---|
| CHK001 | 验收视口统一为 10 档并补 480px、575px（spec FR-001、US1/US3 IT、SC-008） |
| CHK002 | SC-004 改为全量验收，删除「抽查」口径 |
| CHK003 | CCF 宽度归一化改为必需项，同类最大宽度差 <1px（FR-005、Assumptions、plan R2） |
| CHK004 | 拆为不换行（同行右对齐）与换行（首行对齐）两种条件，删除 MAY（FR-003） |
| CHK005 | 亚像素与分数 DPR 交由浏览器媒体查询处理；验收只取整数视口（Assumptions） |
| CHK006 | 否决标签墙方案：<768px 移除顶部年份导航，改由吸顶分组标题定位（FR-008、plan R6） |
| CHK007 | 仅升级 5 条高风险边界为 EC-001～EC-005，其余保留为设计参考 |
| CHK008 | 标题比较已明确：字符串字典序（逐字符），不引入 locale；与 CHK012 同源，一并关闭（spec Clarifications、FR-007） |
| CHK009 | 不作需求：锚点 slug 与偏移值留给实现/plan，spec 只保留「不被遮挡」判据 |
| CHK010 | 已由 Constitution v2.1.0 原则 VI 覆盖，spec FR-010 直接引用五类布局破损定义与 `overflow-x` 禁令 |
| CHK011 | 来源口径已放开：DOI/正式出版页优先，仅 arXiv 的用首次提交日，无链接留空（10 条）；空值组内排末尾（FR-007/FR-011、SC-009） |
| CHK012 | 已澄清：按字符串字典序比较，不使用 locale 规则（spec Clarifications、FR-007、Assumptions） |
| CHK013 | 已澄清：吸顶标题紧贴站点导航下方、不透明背景、层级低于导航、单行固定行高、计数同行；三位数只增宽不增高（FR-008、SC-007） |

## Notes

- 本版为深化修订：10 条均指向 spec 中的具体冲突、缺口或歧义点，替代首版「是否定义了 X」式的泛化问法
- CHK011～CHK013 为评审决议落地后新增的待核查项；原 10 条保留原文，决议见上表
- 已勾选（13/13）：CHK001～CHK013 全部通过需求质量评审；CHK008 与 CHK012 同源，已由同一澄清关闭
- 仅当评审确认需求质量准则满足后才勾选 `[x]`；仍需澄清、修正或评审的项目保持未勾选
- `/speckit-implement` 只读取勾选状态作为门禁，不修改标记
- `checklists/requirements.md` 由 `/speckit-specify` 与 `/speckit-clarify` 单独维护
- 可在条目下就地记录发现与评审批注
