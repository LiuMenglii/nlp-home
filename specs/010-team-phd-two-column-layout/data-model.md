# Data Model: Team 页 PhD Candidates 双栏布局

**Date**: 2026-11-20 | **Spec**: [spec.md](./spec.md) | **Research**: [research.md](./research.md) | **布局契约**: [contracts/team-phd-two-column.md](./contracts/team-phd-two-column.md)

本特性不新增、不修改任何持久化数据。数据模型仅描述**构建期派生**的视图实体（视图模型）及其不变量，供模板实现与验收对照。字段定义见 [content.config.ts](../../src/content.config.ts) 的 students schema（零改动）。

## 1. 数据快照（2026-11-20，只读基准）

PhD Candidates 共 **9** 条；其中 **6** 条有 `grade`（2020/2021/2022），**8** 条有唯一链接（`url` / `github` / `scholar` 三选一），季慧山为唯一无链接者，李江楠、刘曦雨、刘正宵为无年级者，9 人均无 `note`。

排序规则沿用 `StudentGroup.astro` 现状：`grade` 字符串降序、空值最后、同键保持 `students.json` 条目顺序。排序后的完整行序与切分位置：

| 全局序 | 姓名 | grade | 唯一链接字段 | 标签文案 | 栏 | 栏内序 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 杨晨旭 | 2022 | url | Homepage | 左 | 1 |
| 2 | 顾佴彬 | 2022 | url | Homepage | 左 | 2 |
| 3 | 李雨晴 | 2022 | url | Homepage | 左 | 3 |
| 4 | 季慧山 | 2021 | — | — | 左 | 4 |
| 5 | 郑明钰 | 2021 | github | GitHub | 左 | 5 |
| 6 | 张瀚文 | 2020 | github | GitHub | 右 | 1 |
| 7 | 李江楠 | — | github | GitHub | 右 | 2 |
| 8 | 刘曦雨 | — | scholar | Scholar | 右 | 3 |
| 9 | 刘正宵 | — | github | GitHub | 右 | 4 |

> **spec 一致性**：spec US2 AS4 / AS5 已按数据修正——无年级者为李江楠、刘曦雨、刘正宵，季慧山为 `grade=2021`、无链接；与 FR-010（6 Since / 8 链接）一致，详见 research R8。

## 2. 视图实体

### 2.1 `PhdRow`（行）

| 槽位 | 来源 | 存在条件 | 渲染约束 |
| --- | --- | --- | --- |
| `name` | `student.name` | 恒存在 | 纯文本，非链接；第 1 槽；横向态在固定槽内换行，竖排态自适应宽度 |
| `since` | `"Since " + student.grade` | `grade` 非空 | 第 2 槽；无年级则不渲染元素（留空槽，无占位文本） |
| `link` | `url` → `github` → `scholar` 第一个非空 | 三者至少一个非空 | 第 3 槽；标签文案 Homepage / GitHub / Scholar + `↗`；`target="_blank" rel="noopener"`；无链接则不渲染锚点 |
| `note` | `student.note` | 非空 | 另起一行占满整栏宽；当前数据无实例 |

### 2.2 `PhdColumn`（栏）

- 字段：`rows: PhdRow[]`（按全局序切片）、`index: 0 | 1`。
- 渲染载体：一个 `<ul>`；同一栏内所有行共享列宽与内距，横向态下 Since 左缘与链接右缘在栏内同线。
- 空栏不渲染（不生成空 `<ul>`）。
- 单栏状态下两个 `<ul>` 顺序堆叠为一条连续列表，第二个 `<ul>` 首行不重复顶部分隔线。

### 2.3 `PhdList`（分组区域）

- 字段：`columns: PhdColumn[]`（长度 1 或 2）、`single: boolean`。
- 渲染载体：`.phd-columns` 包装层 + 唯一 `<h3>PhD Candidates</h3>`（标题不随栏数复制）。
- 栏数由视口决定：≥768px 且 `columns.length === 2` 时两栏；否则单栏。
- 单栏内再按视口分两形态：480–767px 横向三槽；<480px 竖排两行（第 1 行姓名与 Since、第 2 行链接）。

## 3. 派生规则（切分函数）

```text
split(rows):
  n = rows.length
  if n == 0: return { columns: [], single: true }        // 保持既有占位文案
  if n == 1: return { columns: [rows], single: true }    // 不渲染空右栏
  k = ceil(n / 2)
  return { columns: [rows[0..k), rows[k..n)], single: false }
```

验证：n=9 → 5 + 4；n=8 → 4 + 4；n=3 → 2 + 1；n=2 → 1 + 1；n=1 → 1 + 0（单栏）。排序输入 MUST NOT 被切分改变。

## 4. 状态与转换

| 状态 | 触发条件 | 布局表现 |
| --- | --- | --- |
| 两栏 | 视口 ≥768px 且 `columns.length === 2` | 两列等宽（差 ≤1px）、顶线一致、栏距 32px；行内三槽网格，Since 左缘与链接右缘逐行对齐 |
| 单栏横向 | 480px ≤ 视口 < 768px，或 `columns.length === 1` | 单列占满内容区；行内为固定前缀轨道的 flex 行（姓名 4em / Since 5em / 链接右对齐） |
| 单栏竖排 | 视口 <480px | 单列；第 1 行姓名居左、Since 右对齐；第 2 行链接独占一行、左缘与姓名左缘对齐 |
| 空分组 | `rows.length === 0` | 既有 "PhD candidates coming soon." 占位，占满内容区整行 |

状态切换为纯 CSS 媒体查询，不依赖 JS；切分结果与视口无关（同一份 DOM 同时承载三种状态）。

## 5. 不变量

- **INV-1 数据零改动**：`students.json`、students schema、排序规则、链接映射与文案不变；9 条记录各渲染一次，0 丢失、0 重复。
- **INV-2 计数**：`.phd-columns` 内恰有 9 个行元素、6 个 `.grade`、8 个 `.member-link`；季慧山行无 `.member-link`；李江楠 / 刘曦雨 / 刘正宵行无 `.grade`。
- **INV-3 栏内对齐**（横向态：两栏与 480–767px 单栏均成立）：同一栏内 `.grade` 左缘差 ≤1px；`.member-link` 右缘差 ≤1px，且与栏右缘（扣除 24px 内距）差 ≤1px。
- **INV-3b 竖排对齐**（<480px）：`.grade` 右缘跨行差 ≤1px，且与内容区右缘（扣除 24px 内距）差 ≤1px；`.member-link` 左缘与同行 `.student-name` 左缘差 ≤1px。
- **INV-4 跨区块对齐**：左栏 `.student-name` 左缘与 `.grad-name` 左缘差 ≤1px（24px 对称内距），三种状态均成立。
- **INV-5 无伪造内容**：不存在 "Since" 占位、空锚点、隐藏链接文本、表头行或假徽标；姓名不可点击。
- **INV-6 范围隔离**：Master's Students 分组、Graduates 名单、Faculty 与其余页面的 DOM/样式零变化。
