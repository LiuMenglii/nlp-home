# Contract: Publications 条目与年份导航布局行为（publications-layout）

**Date**: 2026-10-23 | **Spec**: [spec.md](../spec.md) | **消费方**: 实现与验收（[quickstart.md](../quickstart.md)）、主页 Publications 概览回归 | **显示模型**: [data-model.md](../data-model.md)

本契约对象有三：① **论文条目在 Publications 页（`/publications/`）与主页 Publications 概览（`/`）的响应式排版行为**——共享组件 `PublicationItem.astro` 的 UI 契约，是后续样式改动的回归基线；② **标签簇双槽契约**——CCF / LINK 槽的占用、占位与列线稳定性（FR-005）；③ **年份导航与分组契约**——合并标签、锚点、日期排序，以及桌面标签导航 / 移动端移除导航并吸顶标题（FR-006～FR-008）。断点数值以 spec FR-001 为唯一规范源，本契约引用其口径，不引入额外断点。

## 1. 结构契约（MUST）

```text
article.pub-item
├── div.pub-main
│   ├── span.pub-title      # 有 url → a[href^="https://"][target="_blank"][rel="noopener"]
│   └── span.pub-venue      # "<venue> · <year>"（year 缺失时仅 venue）
└── div.pub-side            # 仅当条目至少有一个标签时存在
    ├── span.pub-slot.pub-slot-ccf → CCFBadge（缺 CCF 时为隐藏占位）
    └── span.pub-slot.pub-slot-link → a.pub-link（缺 LINK 时为 span.pub-link 隐藏占位）
```

- `PublicationItem` 的 `Props` 接口 MUST 保持不变（`{ pub: CollectionEntry<'publications'> }`），主页零改动即继承全部行为。
- `.pub-main` 与 `.pub-title` / `.pub-venue` 的文本内容、链接取值 MUST 与数据一致，不新增/改写条目文案。
- 两个槽位的顺序 MUST 为「CCF 左、LINK 右」，不得交换、不得按占用状态重排。
- `.pub-side` MUST NOT 在「两标签皆无」的条目上渲染（不保留空槽、不保留空白区）。

## 2. 视口行为矩阵（MUST）

| 视口 | 论文名称 | 期刊名称 | 标签簇 | 关联 |
|------|----------|----------|--------|------|
| ≥768px（验收 1440 / 1280 / 1024 / 768） | 与期刊名共行（二者单行宽度 + 间距 ≤ 文本区宽）；否则独占首行并按可用宽度换行 | 共行时紧随标题；不能共行时**整体**另起一行、左边缘与标题对齐，可在行内继续换行；MUST NOT 贴在标题末行右侧 | 固定右栏，以 CCF 槽（含隐藏占位）首行文字基线为锚点与第一行文字基线对齐（偏差 ≤1px）；MUST NOT 因期刊名换行掉落到条目下方 | FR-002 / SC-001 |
| 576–<768px（验收 767 / 576） | **独占第一行**、占满条目内容宽度 | 第二行左侧，在标签簇剩余宽度内换行；多行时标签簇对齐其**首行**、不下坠 | 第二行、贴内容右缘 | FR-003 / SC-002 |
| <576px（验收 575 / 480 / 375 / 320） | 第一行、整宽 | 第二行、整宽 | 第三行、贴内容右缘；无标签时**无第三行** | FR-004 / SC-003 |

- 全档位：任何内容不溢出条目、不重叠、不截断，且不引起页面横向滚动（FR-010）。
- 档位边界（768 / 576）为半开区间，切换处不得出现两档规则叠加或丢失。

## 3. 标签簇双槽契约（FR-005 / SC-004）

| 条目状态 | CCF 槽 | LINK 槽 | `.pub-side` |
|----------|--------|---------|-------------|
| 两者都有 | 可见徽标 | 可见链接 | 渲染 |
| 仅 CCF | 可见徽标 | **隐藏占位且占宽** | 渲染 |
| 仅 LINK | **隐藏占位且占宽** | 可见链接 | 渲染 |
| 两者皆无 | — | — | 不渲染 |

- 缺失槽占位 MUST：保持与可见标签相同宽度；不可见；无可见或可读的占位文字；不产生可聚焦元素（LINK 占位为 `span` 而非 `a`）；不产生可被读屏读取的内容；两个空槽容器均 MUST 设置 `aria-hidden="true"` + `visibility: hidden`。
- 槽宽归一化 MUST：CCF 槽以最宽 CCF 标签为基准、LINK 槽以 LINK 标签为基准，同类标签自身最大宽度差 <1px；`CCFBadge.astro` 的归一化是必需项，不是条件项。
- 跨条目量测：同一视口档内，CCF 徽标 `getBoundingClientRect()` 的 `left` 与 `right` 极差 MUST ≤1px；LINK 标签同理（含隐藏占位槽，因两者宽度相等）。三个验收视口档分别量测。
- 两标签都在簇内垂直居中对齐，垂直中心偏差 ≤1px。

## 4. 年份导航与分组契约（FR-006～FR-008 / SC-005～SC-007）

### 4.1 标签与分组

| 顺序 | 标签文本 | 锚点 | 分组标题 | 当前计数 |
|------|----------|------|----------|----------|
| 1 | 2026 | `#year-2026` | `2026` | 20 |
| 2 | 2025 | `#year-2025` | `2025` | 23 |
| 3 | 2024 | `#year-2024` | `2024` | 15 |
| 4 | 2023 | `#year-2023` | `2023` | 20 |
| 5 | 2022 | `#year-2022` | `2022` | 21 |
| 6 | 2021 | `#year-2021` | `2021` | 12 |
| 7 | 2020 | `#year-2020` | `2020` | 8 |
| 8 | **2019 & Earlier** | `#year-2019-earlier` | `2019 & Earlier` | **16** |

- MUST NOT 再渲染 2019 及以前的独立标签或独立分组标题（2011–2019 共 8 个旧标签消失）。
- 合并组 MUST 包含全部 `year <= 2019` 的论文；所有分组组内 MUST 按 `date` 降序、同一日期按标题字符串字典序升序；`date` 为空的条目 MUST 排在该组末尾并按标题字典序升序；每条仍展示自身 `venue · year`。
- 标签计数 MUST 等于对应分组条目数；当前数据 8 个计数之和 = 135。
- 移动端（<768px）分组标题 MUST 显示该组论文数（如 `2026 (20)`、`2019 & Earlier (16)`），8 个标题计数之和 = 135。
- 若数据中没有 ≤2019 的论文，合并标签与合并分组 MUST 都不渲染。
- 在 ≥768px 视口点击任一标签 MUST 定位到对应分组标题，标题不被粘性导航遮挡（`scroll-margin-top` 按 T014 实测并记录的 H_m 设置，桌面基础值 84px 复核保留）。

### 4.2 导航排布

| 视口 | 形态 |
|------|------|
| ≥768px | 年份标签自然换行、左对齐；每个标签完整可读；计数可见 |
| <768px | **视觉隐藏顶部年份导航与标签墙**（`.year-nav` MUST 为 `display: none`；DOM MUST 保留，验收看计算样式与可见数量）；8 个年份分组标题吸顶于站点导航正下方（不透明背景、层级低于导航），单行固定行高，年份与计数同行；与站点导航下缘相接（间距 ≤4px）的吸顶标题同一时刻 ≤1 个；不引发页面级横向滚动 |

- 移动端 MUST NOT 使用横向滑动标签、折叠网格或其他标签墙替代；年份定位由吸顶分组标题承担。
- 吸顶标题 MUST 有不透明背景，MUST NOT 遮挡论文条目标题或内容；分组结束时随分组滚出。

## 5. 不变量（MUST）

- `src/data/publications.json` 与 `src/content.config.ts` 的 publications schema **唯一改动**为新增 `date` 字段（有链接必填、无链接留空；正式出版日期优先 → 上线日期 → 仅 arXiv 用 v1 提交日）；其余字段与取值零改动（FR-011）。
- 不新增运行时依赖、脚本、组件文件或公共 CSS 工具类；零新 JS。
- 配色、字体、字号、圆角、分隔线与其他区块版式不变；`global.css` 零改动。
- 主页与 Publications 页在同一视口下条目形态一致（FR-009）。
- `npm run check` + `npm run build` 通过，部署流水线不变（FR-012）。
- 不得以 `overflow-x: hidden` 掩盖溢出：验收 MUST 基于真实渲染并逐元素检查 `getBoundingClientRect().right ≤ document.documentElement.clientWidth`（至少覆盖 `.pub-item`、`.pub-side`、`.year-group h3`），逐元素越界为**权威判据**；MUST NOT 仅依赖 `scrollWidth === clientWidth`——现有 `global.css` 的 `body { overflow-x: hidden }` 保留时该值可能被夹断，相等不构成无溢出证明，反之不等必为缺陷（FR-010）。
