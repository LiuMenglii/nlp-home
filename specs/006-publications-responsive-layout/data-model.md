# Data Model: Publications 条目与年份导航响应式优化

**Date**: 2026-10-23 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Research**: [research.md](./research.md)

本特性 **只新增一个持久化字段**：为 `src/data/publications.json` 的 135 条论文新增 `date`（`YYYY-MM-DD`，有链接必填、无链接留空），并在 `src/content.config.ts` 的 publications schema 中声明；其余字段与取值不变（FR-011）。本文描述 ① 数据契约（含新增字段）；② 由数据派生的**显示模型**（Publication Item / Badge Cluster / Year Nav & Group）；③ 派生规则、排序与校验口径。所有派生均在 `publications.astro` frontmatter 与 `PublicationItem.astro` 模板内完成；运行时无脚本参与分组或布局。

---

## 1. 数据契约（仅新增 `date`）

### 1.1 Publication Record（`src/data/publications.json`）

| 字段 | 类型 | 约束（schema） | 本特性 |
|------|------|----------------|--------|
| `title` | string | `min(1)` | 只读 |
| `venue` | string | `min(1)` | 只读 |
| `year` | number | int，1980–2100 | 只读；继续决定年份分组与展示年份 |
| `date` | string（可缺省） | 可缺省，缺省即空值（不要求显式 `null`）；存在时为 ISO `YYYY-MM-DD` 且为合法日历日期；`url` 存在时必填 | **新增**；有链接必填（125 条），无链接留空（10 条）；仅用于组内时间排序，不直接展示 |
| `ccf` | `'A'｜'B'｜'C'｜null` | 可选/nullable | 只读；决定 CCF 槽占用 |
| `url` | string(https)｜null | 必须 `https://`，可选/nullable | 只读；决定 LINK 槽占用 |
| `featured` | boolean | 默认 false | 只读（主页选取仍沿用既有逻辑） |
| `authors` | string[] | 可选 | 只读、不参与本特性展示 |

**`date` 口径**：优先取出版社、期刊或会议论文集的正式出版日期；无正式出版日期时取上线日期；仅有 arXiv 链接的条目 MUST 使用 arXiv 首次提交日期（v1）；无链接条目不填。有链接条目 MUST 填写 `date`，缺失或格式非法视为数据缺陷。`year` 是分组与展示用的年份，可能与 `date` 的年份不同（例如在线优先出版），二者不要求相等；`date` 只影响组内排序，空值排组末。

数据现状（2026-10-23）：**135 条**；`ccf` 缺失 58 条、`url` 缺失 10 条、两者皆缺 7 条；`venue` 最长 62 字符。链接来源：66 条 DOI、59 条仅 arXiv、10 条无链接——预期 125 条有 `date`、10 条为空。

### 1.2 年份分布（用于验收核对）

| 分组 | 成员年份 | 条数 |
|------|----------|------|
| 2026 | 2026 | 20 |
| 2025 | 2025 | 23 |
| 2024 | 2024 | 15 |
| 2023 | 2023 | 20 |
| 2022 | 2022 | 21 |
| 2021 | 2021 | 12 |
| 2020 | 2020 | 8 |
| **2019 & Earlier** | 2019 / 2018 / 2017 / 2016 / 2015 / 2014 / 2012 / 2011 | **16**（3+4+1+2+1+1+3+1） |
| 合计 | — | **135** |

> 该表是 SC-005/SC-006 的核对基线；数据变化后由派生逻辑实时更新，文档数值仅用于当前数据验收。

---

## 2. 显示模型（派生，不持久化）

### 2.1 Publication Item（论文条目视图）

由 Publication Record 派生的展示单元，承载于 `PublicationItem.astro`：

| 派生属性 | 规则 | 消费者 |
|----------|------|--------|
| `venueLine` | `venue + (year ? ' · ' + year : '')` | 期刊名行（FR-002～FR-004） |
| `hasCcf` | `ccf ∈ {A, B, C}` | 槽占用判定（FR-005） |
| `hasLink` | `url` 为非空 https 链接 | 槽占用判定（FR-005） |
| `hasBadges` | `hasCcf \|\| hasLink` | 是否渲染 `.pub-side`（FR-005） |
| `titleIsLink` | `Boolean(url)` | 标题是否渲染 `<a>`（沿用现状） |
| `sortDate` | `date` 的 ISO 字符串（或解析后的时间戳） | 组内排序；不渲染 |

模板结构契约（`Props` 接口不变）：

```text
article.pub-item
├── div.pub-main
│   ├── span.pub-title            # 有 url 时为 a[href][target=_blank][rel=noopener]
│   └── span.pub-venue            # venueLine
└── div.pub-side                  # 仅 hasBadges 时渲染
    ├── span.pub-slot.pub-slot-ccf
    │   └── CCFBadge (rating)     # 缺 CCF 时为隐藏占位（rating="A"），槽 visibility:hidden + aria-hidden
    └── span.pub-slot.pub-slot-link
        └── a.pub-link            # 缺 LINK 时为 span.pub-link 隐藏占位（非 a，不可聚焦），槽同样 visibility:hidden + aria-hidden
```

### 2.2 Badge Cluster（标签簇）

固定双槽结构，槽位顺序不可交换（FR-005）：

| 条目状态 | CCF 槽 | LINK 槽 | `.pub-side` | 说明 |
|----------|--------|---------|-------------|------|
| 有 CCF、有 LINK | 可见徽标 | 可见链接 | 渲染 | 常态 |
| 仅 CCF | 可见徽标 | 隐藏占位（占宽） | 渲染 | LINK 列不塌缩 |
| 仅 LINK | 隐藏占位（占宽） | 可见链接 | 渲染 | CCF 列不塌缩 |
| 两者皆无 | — | — | **不渲染** | 无空槽、无空白区 |

槽宽不变量：同类槽位跨条目宽度一致（同文案同字号）；**CCF 槽以最宽 CCF 标签为基准归一化、LINK 槽以 LINK 标签为基准归一化，同类标签最大宽度差 <1px**（FR-005，见 research R2）。隐藏占位与可见标签**宽度相同**，因此列线可量测；空槽 MUST 无可见/可读占位文字、不可聚焦，并整体设置 `aria-hidden`。

### 2.3 Year Nav Item（年份标签，仅桌面）

| 属性 | 独立年份标签 | 合并标签 |
|------|--------------|----------|
| `key` | `year-<year>` | `year-2019-earlier` |
| `label` | `"<year>"` | `"2019 & Earlier"` |
| `count` | 该年条目数 | 合并组条目数（当前 16） |
| `href` | `#year-<year>` | `#year-2019-earlier` |

当前数据下恰好 **8 个**标签，顺序固定为 2026 → 2025 → 2024 → 2023 → 2022 → 2021 → 2020 → 2019 & Earlier；计数之和 = 135（SC-005）。`Year Nav` 仅在 ≥768px 可见；<768px MUST 为 `display: none`（DOM MUST 保留，验收以计算样式与可见数量为准），也不用横向滚动替代。

### 2.4 Year Group（年份分组）

| 属性 | 独立年份分组 | 合并分组 |
|------|--------------|----------|
| 条件 | `year >= 2020` | `year <= 2019` |
| `id` | `year-<year>` | `year-2019-earlier` |
| 标题文本 | `<year>` + 计数（移动端显示，如 `2026 (20)`） | `2019 & Earlier` + 计数（移动端显示 `2019 & Earlier (16)`） |
| 成员 | 该年全部条目 | 全部 ≤2019 条目（当前 16） |
| 排序 | 组内按 `date` 降序、同日 `title` 升序 | 同左（合并组内同样按 `date` 降序） |
| 空组 | 不会出现（年份由数据派生） | **不渲染**（不显示 0 计数、不显示空标题） |

分组展示顺序 = 标签顺序：独立年份降序，合并组最后。每条论文在合并组内仍展示自身 `venue · year`（数据不被改写）。

**移动端（<768px）**：`.year-nav` MUST 为 `display: none`（DOM MUST 保留）；8 个分组标题在滚动时吸顶于顶部粘性导航下方，并显示该组论文数；与导航下缘相接（间距 ≤4px）的吸顶标题数量同一时刻 ≤1，标题不遮挡论文内容，分组结束时随分组滚出。桌面端标题不吸顶、不重复显示计数（计数在导航标签内）。

---

## 3. 派生规则（实现口径）

1. **分组**：`years = [...new Set(publications.map(p => p.data.year))].sort((a, b) => b - a)`；`recentYears = years.filter(y => y >= 2020)`；`earlier = publications.filter(p => p.data.year <= 2019)`。
2. **组内排序**：`items.sort((a, b) => { const da = a.data.date ?? ''; const db = b.data.date ?? ''; if (da !== db) return da < db ? 1 : -1; return a.data.title < b.data.title ? -1 : a.data.title > b.data.title ? 1 : 0; })`；显式三路比较，空 `date` 因空串最小而降序排到组末，同日或同为空的条目按标题字符串字典序升序（不使用 locale 规则）。
3. **分组组装**：`groups = [...recentYears.map(y => ({ key: \`year-\${y}\`, label: String(y), items: byYear.get(y)! })), ...(earlier.length ? [{ key: 'year-2019-earlier', label: '2019 & Earlier', items: earlier }] : [])]`；每个组的 `items` 均按规则 2 排序。
4. **导航与列表同源**：桌面标签与分组均由同一个 `groups` 数组渲染，天然保证顺序、计数与锚点一致；不重复计算。
5. **移动端标题**：`groups` 渲染为 `<h3>` 吸顶标题；计数由 `items.length` 派生，仅在 <768px 通过 CSS 显示。
6. **主页不受影响**：主页只消费 `PublicationItem`（条目视图），不消费年份分组；条目规则随组件生效（FR-009）。

---

## 4. 校验口径（对应 spec）

| 规则 | 判定 | 关联 |
|------|------|------|
| 日期覆盖 | 有链接条目（`url` 非空）`date` 为合法 `YYYY-MM-DD`，= 125/135，`linkedWithoutDate` = 0；空值仅出现在 10 条无链接条目 | FR-011 / SC-009 |
| 日期来源 | 正式出版日期优先 → 上线日期 → 仅 arXiv 用 arXiv 首次提交日（v1）→ 无链接留空 | FR-011 / Assumptions |
| 数据 diff 范围 | `publications.json` / `content.config.ts` 的 diff 仅含 `date` 字段与回填 | FR-011 / SC-009 |
| 组内时间序 | 每个分组的 `date` 非递增；同日 `title` 升序 | FR-007 |
| 条目不漏不重 | 两处界面渲染条目总数与数据条目数一致（主页按既有 8 条选取规则） | FR-009 |
| 分组完备 | 独立组 + 合并组成员并集 = 全部 135 条，交集为空 | FR-007 / SC-006 |
| 计数正确 | 桌面 8 个标签计数之和 = 135；移动端 8 个分组标题计数之和 = 135；合并标签 = 16 | SC-005 |
| 标签缺失不塌缩 | 四类占用状态下，同类槽左右边缘极差 ≤1px；CCF 标签自身最大宽度差 <1px | FR-005 / SC-004 |
| 无标签不占位 | 7 条「两者皆无」条目不渲染 `.pub-side`；当前数据 `.pub-side` 数 = 128 | FR-005 |
| 移动端无可见导航 | <768px 下 `.year-nav` 计算样式为 `display: none`、可见数量为 0（DOM MUST 保留）；8 个分组标题存在且吸顶 | FR-008 / SC-007 |
| 空组合法 | 构造「无 ≤2019 论文」时合并标签与分组均不渲染（验收以 T015 逻辑审查为准，不改数据） | EC-004 |

---

## 5. 状态与持久化

无状态迁移、无写入路径、无缓存或存储：`date` 在数据文件中持久化一次，所有派生值在构建期计算并固化为静态 HTML；运行时无脚本参与分组、排序或布局。
