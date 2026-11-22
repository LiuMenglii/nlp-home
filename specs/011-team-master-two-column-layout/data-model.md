# Data Model: Team 页 Master's Students 双栏布局

**Date**: 2026-11-21 | **Spec**: [spec.md](./spec.md) | **Research**: [research.md](./research.md) | **布局契约**: [contracts/team-master-two-column.md](./contracts/team-master-two-column.md)

本特性不新增、不修改任何持久化数据。数据模型仅描述**构建期派生**的视图实体（视图模型）及其不变量，供模板实现与验收对照。字段定义见 [content.config.ts](../../src/content.config.ts) 的 students schema（零改动）。

## 1. 数据快照（2026-11-21，只读基准）

Master's Students 共 **11** 条；全部有 `grade`（2024–2026）、全部无链接（`url` / `github` / `scholar` 皆空）；`note` 字段已移除。

排序规则按 FR-003：`grade` 字符串**升序**、空值（无年级）最后、同键保持 `students.json` 条目顺序。排序后的完整行序与切分位置：

| 全局序 | 姓名 | grade | 唯一链接字段 | 标签文案 | 栏 | 栏内序 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 朱祉同 | 2024 | — | — | 左 | 1 |
| 2 | 张蓓泽 | 2024 | — | — | 左 | 2 |
| 3 | 叶振雷 | 2024 | — | — | 左 | 3 |
| 4 | 艾明旭 | 2025 | — | — | 左 | 4 |
| 5 | 刘润泽 | 2025 | — | — | 左 | 5 |
| 6 | 刘梦犁 | 2026 | — | — | 左 | 6 |
| 7 | 张蓬月 | 2026 | — | — | 右 | 1 |
| 8 | 顾树焕 | 2026 | — | — | 右 | 2 |
| 9 | 温泽林 | 2026 | — | — | 右 | 3 |
| 10 | 李佳睿 | 2026 | — | — | 右 | 4 |
| 11 | 毛乐平 | 2026 | — | — | 右 | 5 |

> **数据边界**：数据更新（新增 11 位硕士、15 位博士，5 位原 PhD 转入 Graduates）已作为独立 commit `54f3b81` 在特性开始前提交，不属于本特性，本特性逐字节不改数据文件。快速验收以本表为准，长期以数据文件与 FR-003/FR-010 规则为准。

## 2. 视图实体

### 2.1 `MasterRow`（行）

| 槽位 | 来源 | 存在条件 | 渲染约束 |
| --- | --- | --- | --- |
| `name` | `student.name` | 恒存在 | 纯文本，非链接；第 1 槽；横向态在弹性姓名轨内换行，竖排态自适应宽度 |
| `since` | `"Since " + student.grade` | `grade` 非空 | 第 2 槽；字号显式 `18px`（站点根字号 16px，`1rem` = 16px，MUST NOT 使用）；无年级则不渲染元素（留空槽，无占位文本） |
| `link` | `url` → `github` → `scholar` 第一个非空 | 三者至少一个非空 | 第 3 槽；标签文案 Homepage / GitHub / Scholar + `↗`；`target="_blank" rel="noopener"`；无链接则不渲染锚点 |

当前 11 条 `MasterRow` 的实际槽位：`name` + `since`（均存在），`link`（均缺失）。

### 2.2 `MasterColumn`（栏）

- 字段：`rows: MasterRow[]`（按全局序切片）、`index: 0 | 1`。
- 渲染载体：一个 `<ul>`；同一栏内所有行共享列宽与内距。
- 横向态（≥480px）下，同栏内链接槽占用一致的行 Since 左缘同线；Master's 当前全部无链接，第三轨恒为 0，故 11 行 Since 左缘同线（FR-005）。
- 空栏不渲染（不生成空 `<ul>`）。
- 单栏状态下两个 `<ul>` 顺序堆叠为一条连续列表，第二个 `<ul>` 首行不重复顶部分隔线。

### 2.3 `MasterList`（分组区域）

- 字段：`columns: MasterColumn[]`（长度 1 或 2）、`single: boolean`。
- 渲染载体：`.master-columns` 包装层 + 唯一 `<h3>Master's Students</h3>`（标题不随栏数复制）。
- 栏数由视口决定：≥768px 且 `columns.length === 2` 时两栏；否则单栏。
- 单栏内再按视口分两形态：480–767px 横向三槽；<480px 竖排两行（第 1 行姓名与 Since、第 2 行链接，若有）。

## 3. 派生规则（排序与切分函数）

```text
sortByGradeAsc(rows):
  stableSort(rows, (a, b) => {
    if (!a.grade && !b.grade) return 0
    if (!a.grade) return 1
    if (!b.grade) return -1
    return a.grade.localeCompare(b.grade)   // 2024 → 2026
  })

splitMaster(rows):                          // rows 已按 sortByGradeAsc 排序
  n = rows.length
  if n == 0: return { columns: [], single: true }        // 保持既有占位文案
  if n == 1: return { columns: [rows], single: true }    // 不渲染空右栏
  k = ceil(n / 2)
  return { columns: [rows[0..k), rows[k..n)], single: false }
```

验证：n=11 → 6 + 5（当前数据）；n=6 → 3 + 3；n=7 → 4 + 3；n=5 → 3 + 2；n=2 → 1 + 1；n=1 → 1 + 0（单栏）。切分 MUST NOT 改变排序结果；排序 MUST NOT 改写数据文件。

PhD 分组复用同一 `sortByGradeAsc`：19 条按 2021 → 2026 升序，`ceil(19/2)=10` → 左 10 / 右 9（仅回归观察）。

## 4. 状态与转换

| 状态 | 触发条件 | 布局表现 |
| --- | --- | --- |
| 两栏 | 视口 ≥768px 且 `columns.length === 2` | 两列等宽（差 ≤1px）、顶线一致、栏距 32px；行内三轨 `minmax(4em,1fr) 5.5em auto`（Since 槽 99px），姓名列吸收余量，Since 左缘随视口右移，链接贴齐栏右缘 |
| 单栏横向 | 480px ≤ 视口 < 768px；或 ≥768px 且 `columns.length === 1`（后者仍用网格三轨、单列整宽） | 单列占满内容区；行内 flex：姓名 `flex: 1 1 4em`、Since `0 0 5.5em`、链接贴行右缘 |
| 单栏竖排 | 视口 <480px | 单列；第 1 行姓名居左、Since 右对齐；第 2 行链接独占一行、左缘与姓名左缘对齐（无链接不渲染） |
| 空分组 | `rows.length === 0` | 既有 "Master's students coming soon." 占位，占满内容区整行 |

状态切换为纯 CSS 媒体查询，不依赖 JS；切分结果与视口无关（同一份 DOM 同时承载三种状态）。

## 5. 不变量

- **INV-1 数据内容零改动**：除移除未使用的 `note` 字段外，`students.json` 成员内容、students schema 其余字段、链接映射与文案不变；排序改为 `grade` 升序（仅展示层派生），MUST NOT 改写成员数据；11 条记录各渲染一次，0 丢失、0 重复。
- **INV-2 计数（当前数据快照下）**：`.master-columns` 内恰有 11 个行元素、2 个 `<ul>`（6 + 5）、11 个 `.grade`、0 个 `.member-link`；"Master's Students" 标题恰 1 个；姓名无锚点。n=1 或空分组时按 §2.2 / §4 的对应状态放宽，不适用本条。
- **INV-3 栏内对齐**（横向态：两栏与 480–767px 单栏均成立）：同一栏内链接槽占用一致的行 `.grade` 左缘差 ≤1px；`.member-link` 右缘差 ≤1px，且与栏右缘（扣除 24px 内距）差 ≤1px；有链接行 Since 右缘与链接左缘差 8px±1px。Master's 当前全部无链接，第三轨宽 0，Since 右缘距行内容右缘 8px。
- **INV-3b 竖排对齐**（<480px）：`.grade` 右缘跨行差 ≤1px，且与内容区右缘（扣除 24px 内距）差 ≤1px；`.member-link` 左缘与同行 `.student-name` 左缘差 ≤1px（无实例时不适用）。
- **INV-4 跨区块对齐**：左栏 `.student-name` 左缘与 `.phd-columns .student-name`、`.grad-name` 左缘差 ≤1px（24px 对称内距），三种状态均成立。
- **INV-5 无伪造内容**：不存在 "Since" 占位、空锚点、隐藏链接文本、表头行或假徽标；姓名不可点击。
- **INV-6 范围隔离**：PhD 分组 DOM（除移除 `note`）/类名/断点/栏距/三槽结构不变（仅排序、Since 位置与字号随共享规则调整）、Graduates 名单、Faculty 与其余页面的 DOM/样式零变化；数据更新已作为独立 commit `54f3b81` 在特性前提交，不属于本特性；`note` 字段移除除外（spec Clarifications 2026-11-22）。
- **INV-7 主分组一致性**：两栏宽度、栏距、行高、槽位与 PhD 分组一致（同一份声明），不出现「一套宽一套窄」。
- **INV-8 字号**：`.grade` 计算字号为 18px（容差 ≤0.5px；PhD 与 Master's 一致；MUST 用显式 `18px`/`1.125rem`，MUST NOT 用 `1rem` 或修改 `html` 根字号）；其余文本字号不变。
