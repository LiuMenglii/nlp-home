# Research: Team 页在读学生名单的列布局调整（三列固定、两侧空白相等、Since 列内居中、链接右对齐）

**Date**: 2026-11-22 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

本特性无 `NEEDS CLARIFICATION`（spec 已于 2026-11-22 按 [checklists/layout.md](../checklists/layout.md) D1–D3 / S1–S3（S4 仅归档）澄清）。Phase 0 研究聚焦三个技术问题：**如何在不引入 JS、不硬编码视口公式的前提下实现三列固定宽度且两侧空白相等**、**27px 偏左是否可静态推导**、**5em Since 列在验收浏览器中是否放得下**。以下结论同时给出几何推导与 plan 期字体度量核对。

## R1 行内布局机制：三轨固定网格 + `justify-content: space-between`

**Decision**: ≥480px 时 `li` 采用三轨 Grid（PhD 与 Master's 共用）：

```text
grid-template-columns: 3.5em 5em 6.5em    /* 必要时整组改为 3.5em 5.5em 6.5em */
column-gap: 0
justify-content: space-between
姓名 .student-name  → grid-column: 1（列内左对齐，缺省 stretch + 左对齐）
Since .grade       → grid-column: 2（justify-self: center；margin-left: 0；white-space: nowrap）
链接 .member-link  → grid-column: 3（justify-self: end；text-align: right）
```

**Rationale**:

- 三条轨道都是固定宽度，列位置与姓名长短、链接有无、标签宽窄无关；同一分组所有行天然共享列线（FR-002）。
- `justify-content: space-between` 在三条固定轨道之外把剩余空间**等分为两个列间空白**：姓名列贴行内容左缘、链接列贴行内容右缘。768px 时剩余 26px（5em）或 17px（5.5em），两侧各 13px / 8.5px（D1 / D3 / S1）。
- 显式 `grid-column: 1/2/3` 保证槽位缺失时其余元素不移动：缺链接时第 3 列仍占 117px，Since 不右移；缺年级时第 2 列仍占 90/99px，姓名与链接不互相靠近（Edge Cases）。
- `justify-self: center` 以列盒为基准；Since 盒宽 = 文本宽，文本中心与列中心重合（±1px）。必须同时把基线的 `.grade { margin-left: auto }` 覆盖为 `0`——网格项上的自动外边距会先行吸收列内剩余空间，使 `justify-self` 失效。
- 固定列宽 + 等隙把行内几何变成纯静态常量，不需要任何 JS 测量或字体敏感的分支。

**Alternatives considered**:

| 方案 | 否决原因 |
| --- | --- |
| flex + 固定宽度 + `justify-content: space-between` | 缺链接时剩余空间改在姓名与 Since 之间分配，Since 右移；无法保证同组所有行列位置一致 |
| 三轨固定宽度 + `column-gap: 8px`（默认左对齐） | 768px 时 270 + 16 = 286px，剩余 10px 堆在行尾，链接不贴右缘；空白不随行宽增大 |
| 三轨固定宽度 + `justify-content: center` | 左右各留外边距，姓名不贴左缘、链接不贴右缘，与 FR-002 的“列间空白相等”定义不符 |
| `3.5em minmax(5em, 1fr) 6.5em` | Since 列吸收剩余空间，中心随视口变化，两列间空白不等 |
| `1fr auto 1fr` / 011 的 `minmax(4em,1fr) 5.5em auto` | 列宽随内容与视口变化，Since 位置随之移动（011 现状），正是本特性要取代的行为 |
| 列表级网格 / subgrid 统一列宽 | 需要跨 `ul/li` 共享轨道或改 DOM，复杂度高；固定 em 宽度已能保证同组列线一致 |
| 绝对定位 + 计算偏移 | 与字体度量、视口强耦合，需 JS 或手写 `calc()`，违反最小复杂度 |

## R2 等隙与 27px 偏左的几何证明

记三列宽度 `N = 63px`（3.5em）、`S = 90px`（5em）或 `99px`（5.5em）、`L = 117px`（6.5em），行内容区宽 `W`（`li` 边框盒扣除左右各 24px 内距），两侧空白 `g`：

```text
g = (W − N − S − L) / 2
Since 列左缘 = N + g
Since 中心 x = N + g + S/2
行内容区中点 m = W/2 = (N + S + L + 2g)/2
x − m = (N − L)/2 = (63 − 117)/2 = −27px
```

**结论**：

1. 两侧空白相等时，Since 中心恒在行中点左侧 **27px**，**与 W、S、g 全部无关**；5em 与 5.5em 结果相同，不需要重算。
2. 该偏移只由姓名列与链接列的宽度差（3em = 54px）决定；FR-002 的“两侧空白相等”与“Since 列内居中”同时成立时，27px 是唯一结果（Assumptions 已声明它不是缺陷）。
3. 不存在碰撞：三列宽度合计 270 / 279px，任一支持视口的横向行内容区都 ≥385px，列间空白最少 8.5px；Since 与链接不会重叠，011 的夹取逻辑没有存在空间（FR-004）。

**各视口横向行的两侧空白 `g`**（`W` 取自 [contracts §1](./contracts/student-row-alignment.md)）：

| 视口 | 栏数 | `W` | `g`（Since 5em，合计 270） | `g`（Since 5.5em，合计 279） |
| --- | --- | --- | --- | --- |
| 1920 / 1440 / 1280px | 2 | 502px | 116px | 111.5px |
| 1024px | 2 | 424px | 77px | 72.5px |
| **768px（最紧）** | 2 | **296px** | **13px** | **8.5px** |
| 767px | 1 | 671px | 200.5px | 196px |
| 576px | 1 | 480px | 105px | 100.5px |
| 481px | 1 | 385px | 57.5px | 53px |
| 480px | 1 | 400px | 65px | 60.5px |

所有档位 `g ≥ 8px`（D3 / FR-004）。

## R3 768px 最紧档与字宽可行性

**Decision**: 沿用 ≥768px 两栏与 32px 栏距，不新增断点、不缩小字号；三列宽度按 R1 固定，单一风险转为“文字宽于列宽”。

**逐列核对**（18px 正文基准，`em = 18px`）：

| 列 | 宽 | 当前最宽内容 | 余量 | 结论 |
| --- | --- | --- | --- | --- |
| 姓名 | 3.5em = 63px | 3 个汉字约 54px | 9px | 单行可容纳（D2）；更长姓名换行不纳入本期（S2） |
| Since | 5em = 90px 或 5.5em = 99px | Windows/Segoe UI 约 85px；Linux Arial→Liberation Sans 实测字宽 **90.07px**；Ubuntu Sans 87.12px；DejaVu Sans 100.34px | 5em 下 −0.07 ~ +5px；5.5em 下 9px | **5em 在本 Linux 环境处于临界之外**，按 FR-011 应取 5.5em；实现期以验收浏览器实测为准 |
| 链接 | 6.5em = 117px | `Homepage ↗` Segoe UI 107–110px；Liberation Sans 93.06px + 箭头回退 15.08px ≈ 108.1px；011 evidence 记录 Linux 回退 114px | 3–9px | 单行可容纳（D2） |

- **Since 5em 判定（FR-011 / S1）**：plan 期以 fontTools 读取本机字体度量，`Since 2021`–`Since 2026` 在 18px 下的文本宽：Liberation Sans **90.07px**、Ubuntu Sans 87.12px、DejaVu Sans 100.34px。站点字体栈在 Arial 之前没有本机可用的 Inter / Segoe UI / Roboto，Chromium 通常把 Arial 映射到 Liberation Sans——该度量已超过 5em（90px），因此**本验收环境预期切换 5.5em**。实现第一步 MUST 在验收浏览器逐条测量 30 个 `.grade` 的 `getBoundingClientRect().width` 取最大值；>90px 则把 PhD 与 Master's 的 Since 列同时改为 5.5em 并复测，仍超宽按缺陷停止（MUST NOT 折行、缩字号或截断）。
- **5.5em 时的 768px 闭合**：63 + 99 + 117 = 279px，行内容区 296px，两侧空白各 8.5px；仍 ≥8px，满足 FR-004。
- **链接单行**：链接列 117px 覆盖现有全部 4 个标签（Homepage / GitHub / Scholar）；若未来标签宽于 117px，按缺陷上报，不折行、不缩字号、不隐藏（FR-003 / S2 同类口径）。
- **页面不溢出**：三列与空白完全落在行内容区内，`li.scrollWidth == li.clientWidth`；无页面横向滚动。

## R4 480–767px 单栏横向与 <480px 竖排

**Decision**:

- 480–767px：与 ≥768px 使用**同一组**固定三列声明（同一 `@media (min-width: 480px)` 块），不保留独立的 flex 行内规则。单栏行内容区 385–671px，两侧空白 53–200.5px（5.5em），Since 中心同样比行中点偏左 27px（固定列宽的必然结果，不是单栏特例）。
- <480px：保留既有 flex 竖排——第 1 行姓名居左、Since `margin-left: auto` 右对齐；第 2 行链接 `order: 9; flex: 0 0 100%`，仅把 `text-align` 由 `left` 改为 `right`，使链接右缘与 Since 右缘同线（行内容区右缘）。

**Rationale**: 统一 ≥480px 的几何可避免“单栏横向仍用旧右移规则”造成 Since 位置随视口漂移，也减少一套重复声明；竖排两行形态、DOM 顺序与无链接不渲染第 2 行的规则不变（FR-005）。

**Alternatives considered**: 仅在 ≥768px 使用固定三列、480–767px 保留 011 的 flex 右移——会使 480–767px 的 Since 位置与 ≥768px 不一致，违反 FR-002 “同一分组同一套列宽”。

## R5 缺失字段、超长姓名与长链接标签

**Decision**:

- **缺年级**：不渲染 `.grade`，第 2 列仍保留 90 / 99px 空位；姓名在第 1 列、链接在第 3 列，位置与有年级行一致；不渲染 “N/A” 或破折号（FR-007）。
- **缺链接**：不渲染 `.member-link`，第 3 列仍保留 117px；Since 仍在第 2 列居中，位置与有链接行完全一致；不渲染占位、破折号或隐藏文本（FR-003）。
- **超长姓名**：第 1 列 63px，既有 `overflow-wrap: break-word` 在列内换行，行高增长；不越入 Since 列；换行本身不纳入本期验收（S2），但不得造成溢出或横向滚动。
- **长链接标签**：第 3 列 117px，标签 MUST 单行；宽于 117px 时按缺陷记录并上报，不采取折行 / 缩字号 / 隐藏。

**Rationale**: 固定列宽下“无内容”与“有内容”共用同一列线，槽位缺失不会改变其他元素的位置；这与 011 的“无占位”规则一致，但不再依赖 `1fr` 自动补偿。

## R6 验收方法

**Decision**: 机器门禁 `npm run check` + `npm run build`；布局验收使用当前智能体工具自带浏览器，按整数视口宽度的十一档矩阵（1920 / 1440 / 1280 / 1024 / 768 / 767 / 576 / 481 / 480 / 375 / 320px；`max-width: 479.98px` 与 ≤479px 等价，带小数的视口不纳入）执行：

1. **列宽**：`getComputedStyle(li).gridTemplateColumns` 解析为三个像素值，期望 `63px 90px 117px`（5em）或 `63px 99px 117px`（5.5em），同组所有行一致。
2. **等隙**：由 `N`、`S`、`L`、`W` 计算 `g = (W − N − S − L)/2`，并验证 Since 中心 = `N + g + S/2`；等价的可测量判据是 `sinceCenter − W/2 = −27px（±1px）`。
3. **同线**：同栏所有行 Since 中心极差 ≤1px；有链接行与无链接行一致。
4. **贴边**：链接右缘与行内容区右缘偏差 ≤1px；姓名左缘与行内容区左缘偏差 ≤1px；链接单行（高度 ≈29.7px）。
5. **列间空白**：`g ≥ 8px`；用 `sinceCenter ± S/2` 与 `contentLeft + N` / `contentRight − L` 复核两侧空白差 ≤1px。
6. **竖排**：<480px 链接位于第 2 行且右缘偏差 ≤1px；无链接只有 1 行。
7. **破损与计数**：逐元素越界、`documentElement.scrollWidth − innerWidth = 0`；30 条记录、30 个 Since、4 个链接、两栏 10+9 / 6+5。

现有 4 条 PhD 链接（3 Homepage + 1 Scholar）覆盖“有链接行”；Master's 11 行全部无链接，覆盖“空链接列保留”与同线。无需临时注入链接。

**Rationale**: 与 010 / 011 的验收口径一致；新增 `gridTemplateColumns` 一项，使“固定列宽”可以直接读取而非间接推断。不新增测试框架（Constitution V）。

## R7 宪法合规

**Decision**: 六条核心原则全部 PASS，详见 [plan.md 的 Constitution Check](./plan.md#constitution-check)。关键点：

- I / II：数据与模板零改动，只改样式；计数与文案原样复用。
- III：构建与部署方式不变，门禁通过才合并。
- IV / V：无新视觉元素、无新依赖、无 JS、无新组件；一组固定三列取代两套旧行内规则，并删除夹取逻辑，实现反而更短。
- VI：真实浏览器 11 档验收；固定列宽下不会出现列挤压，风险集中在“文字宽于列宽”，按 R3 逐列核对并在 768px 最紧档复测；不掩盖溢出。

## R8 数据快照（2026-11-22，只读基准）

- 在读学生共 **30** 条：PhD **19** 条（年级 2021–2026，两栏 10 + 9）、Master's **11** 条（2024–2026，两栏 6 + 5）；全部有 `grade`。
- `Since <年份>` 共 **30** 个；成员链接共 **4** 个，全部在 PhD：
  - 杨晨旭（2022）— Homepage（`url`）
  - 刘曦雨（2022）— Scholar（`scholar`）
  - 顾佴彬（2022）— Homepage（`url`）
  - 李雨晴（2022）— Homepage（`url`）
- 按年级升序切分，4 条链接均位于左栏（前 10 条）；Master's 11 行全部无链接，用于验证“空链接列保留 + Since 同线”。
- 数据文件本特性逐字节不改；以上仅作验收基准，长期以数据文件与既有排序/切分规则为准。
