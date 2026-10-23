# Data Model: Team 页学生分组纵向展开、教师移除与成员链接标签

**Date**: 2026-10-23 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Research**: [research.md](./research.md)

本特性涉及 **3 个持久化数据契约**（teachers / students / graduates，其中 students、graduates 新增 `scholar` 字段）与 **2 个派生显示模型**（学生分组视图、两类名单的链接标签列）。所有派生在 `StudentGroup.astro` 模板与 `team.astro` frontmatter 内完成；运行时无脚本参与布局或标签选择。

---

## 1. 数据契约

### 1.1 Teacher Record（`src/data/teachers.json`）

| 字段 | 类型 | 约束（schema） | 本特性 |
|------|------|----------------|--------|
| `name` | string | `min(1)` | 只读 |
| `title` | string | `min(1)` | 只读 |
| `advisorRole` | `'phd'｜'master'` | enum | 只读 |
| `directions` | string[] | 至少 1 项 | 只读 |
| `email` | string(email)｜null | 可选/nullable | 只读 |
| `homepage` | string(https)｜null | 必须 `https://` | 只读 |
| `photo` | string｜null | 可为空；非空时必须是 `public/teachers/` 下已存在文件 | 只读；王伟平照片文件删除 |
| `bio` | string｜null | 可选/nullable | 只读 |

**本特性数据变更**：删除王伟平整条记录并删除其照片 `public/teachers/wang-weiping.svg`；剩余 **4 条**，顺序为 林政 → 付鹏 → 吴大衍 → 谷井子（与删除前相对顺序一致）。字段定义零改动。

### 1.2 Student Record（`src/data/students.json`）

| 字段 | 类型 | 约束（schema） | 本特性 |
|------|------|----------------|--------|
| `name` | string | `min(1)`；展示按「最多 4 个汉字」设计 | 只读 |
| `level` | `'phd'｜'master'` | enum | 只读 |
| `grade` | string｜null | 可选/nullable（如 `"2022"`） | 只读；李雨晴新增 `"2022"`；刘曦雨删除（null） |
| `url` | string(https)｜null | 必须 `https://`；与另两字段互斥 | 顾佴彬补值；李雨晴新增 |
| `github` | string(https)｜null | 必须 `https://`；与另两字段互斥 | 只读 |
| `scholar` | string(https)｜null | **新增**；必须 `https://`；与另两字段互斥 | 刘曦雨补值 |
| `note` | string｜null | 可选/nullable | 只读 |

**互斥规则（FR-014）**：`url`、`github`、`scholar` 三者中非空字段数 MUST ≤ 1；≥ 2 时 `npm run check` 与 `npm run build` 均失败，错误信息包含数据文件路径、成员姓名与全部冲突字段（按 `url` → `github` → `scholar` 顺序）。三者皆空合法（不渲染标签）。

**目标状态（9 条，全部 `phd`；`master` 分组为空）**：

| 数据序 | 姓名 | grade | url | github | scholar | 展示标签 |
|--------|------|-------|-----|--------|---------|----------|
| 1 | 李江楠 | null | — | `https://github.com/LeqsNaN` | — | GitHub |
| 2 | 张瀚文 | 2020 | — | `https://github.com/Heaven-zhw` | — | GitHub |
| 3 | 季慧山 | 2021 | — | — | — | 无 |
| 4 | 郑明钰 | 2021 | — | `https://github.com/SpursGoZmy` | — | GitHub |
| 5 | 杨晨旭 | 2022 | `https://iie-ycx.github.io/` | — | — | Homepage |
| 6 | 刘曦雨 | null | — | — | `https://scholar.google.com/citations?user=94lNc6oAAAAJ&hl=zh-CN` | Scholar |
| 7 | 顾佴彬 | 2022 | `https://gccnlp.github.io/` | — | — | Homepage |
| 8 | 李雨晴 | 2022 | `https://qdcassie-li.github.io/` | — | — | Homepage |
| 9 | 刘正宵 | null | — | `https://github.com/jluliuzx` | — | GitHub |

> 展示顺序由 `StudentGroup` 派生：`level` 分组 → 组内 `grade` 降序（空值最后）→ 同级保持数据文件顺序（稳定排序）。按上表数据，PhD 组渲染顺序为：杨晨旭、顾佴彬、李雨晴（2022）→ 季慧山、郑明钰（2021）→ 张瀚文（2020）→ 李江楠、刘曦雨、刘正宵（无年级）。同年级内的顺序属稳定排序结果，不构成永久验收约束；刘曦雨不渲染 Since 文案。

### 1.3 Graduate Record（`src/data/graduates.json`）

| 字段 | 类型 | 约束（schema） | 本特性 |
|------|------|----------------|--------|
| `name` | string | `min(1)` | 只读 |
| `destination` | string | `min(1)` | 只读 |
| `degree` | `'phd'｜'master'` | enum | 只读 |
| `year` | number(int)｜null | 可选/nullable | 只读 |
| `url` | string(https)｜null | 必须 `https://`；与另两字段互斥 | 只读 |
| `github` | string(https)｜null | 必须 `https://`；与另两字段互斥 | 只读 |
| `scholar` | string(https)｜null | **新增**；必须 `https://`；与另两字段互斥 | 本期无数据 |

**现状（14 条）**：3 条 `url`（佀庆一、杨泽娴、刘源鑫 → Homepage 标签），其余 11 条三字段皆空（无标签）；`github` 与 `scholar` 当前均为空。三选一约束对现状全部成立，无需数据迁移。

---

## 2. 派生显示模型（不持久化）

### 2.1 Link Tag（链接标签）

由成员记录派生、每个成员至多一个：

| `linkType` 判定 | 标签文案 | `href` | 渲染元素 |
|-----------------|----------|--------|----------|
| `url` 非空 | `Homepage` | `url` | `a[target="_blank"][rel="noopener"]` |
| 否则 `github` 非空 | `GitHub` | `github` | 同上 |
| 否则 `scholar` 非空 | `Scholar` | `scholar` | 同上 |
| 三者皆空 | — | — | 不渲染、不留占位 |

- 全部标签后接 `<span aria-hidden="true">↗</span>`；颜色与 hover 沿用 `--blue-deep` / `--blue`。
- 互斥约束使「按优先级取第一个」仅作为渲染实现，不会出现数据中两个字段同时存在的情况（构建期已拦截）。
- 成员姓名 MUST NOT 渲染为 `<a>`（在读学生由姓名链接改为纯文本；毕业生本就为纯文本）。

### 2.2 Student Group View（`StudentGroup.astro`）

```text
div.student-groups                    # grid, 单列 minmax(0,1fr), gap 32px
├── div.student-group                 # PhD Candidates（恒渲染）
│   ├── h3
│   └── ul
│       └── li                        # flex, wrap, gap 4px 10px, padding 8px 24px
│           ├── span.student-name     # flex: 0 0 5em（视口 <480px 恢复 auto；按姓名 ≤4 汉字设计）
│           ├── a.member-link         # 至多 1 个，flex: 0 0 6.5em（视口 <480px 独占整行）
│           ├── span.grade            # margin-left: auto（靠右）
│           └── span.note
└── div.student-group                 # Master's Students（空时显示既有占位文案）
```

| 属性 | 规则 | 关联 |
|------|------|------|
| 分组方向 | 所有视口单列、上下排列，PhD 在上、Master 在下 | FR-001 / FR-002 / FR-003 |
| 分组间距 | 32px（`gap`） | FR-005 |
| 分组内排布 | 姓名左、年级/备注右、上下分隔线、24px 对称内距 | FR-004 |
| 标签列 | 固定 6.5em，姓名列固定 5em，标签在列内居中（中心线跨行极差 ≤1px） | FR-018 / FR-019 |
| 视口 <480px 堆叠 | 标签 `order: 9`、`flex: 0 0 100%`，独占一行、左对齐；姓名宽度自适应；行序为「姓名与年级同行 → 备注自然换行 → 标签最后一行」 | FR-019 |
| 无年级成员 | 不渲染 Since、不留占位（刘曦雨本期为此状态） | FR-022 |
| 空分组 | 仍渲染 `.student-group`，独占整行，显示既有 `coming soon` 文案 | 边缘用例 |

### 2.3 Graduate Row View（`team.astro`）

```text
ul.graduate-list
└── li                                 # ≥768px: grid 五列 + 38px 列距
    ├── span.grad-name
    ├── span.grad-degree
    ├── span.grad-year                 # 空值带 .is-empty，列位保留
    ├── span.grad-dest                 # minmax(0,1fr)，≥768px 居中
    └── span.grad-links                # 标签列 6.5em、列内居中；is-empty = 三字段皆空
        └── a                          # 至多 1 个：Homepage / GitHub / Scholar
```

| 视口 | 形态 |
|------|------|
| ≥768px | 五列网格：`5em 4em 3em minmax(0,1fr) 6.5em`（本特性首列 4.5em → 5em，去向列收窄 0.5em），标签在列内居中 |
| <768px | 既有 flex 三段式：姓名 + 学位/年份一行，去向一行，标签一行（左对齐） |

### 2.4 Teacher Grid View（`team.astro` / `index.astro`）

| 视口 | 列数 | 4 张卡片结果 |
|------|------|--------------|
| ≥1280px | 2 列（本特性由 3 列改为 2 列） | 2×2，每行 2 张、等宽 |
| 768–1279px | 2 列（既有，未改动） | 4 卡呈 2×2，属既有行为 |
| <768px | 1 列（既有） | 单列 4 张 |

- 卡片内容、字体、间距（`gap: 16px`）与 `TeacherCard.astro` 零改动；仅两条既有列数声明（`team.astro` 与 `index.astro` 的 `.teacher-grid`）在 ≥1280px 由 `repeat(3, …)` 改为 `repeat(2, …)`。
- 宽屏 2×2 下卡片变宽，需按宪法 VI 在 1280/1920px 复验卡片内部无重叠、截断或溢出。

---

## 3. 校验口径（对应 spec）

| 规则 | 判定 | 关联 |
|------|------|------|
| 教师数量 | Team 页与首页各渲染 4 张教师卡片，顺序林政 → 付鹏 → 吴大衍 → 谷井子 | FR-006～FR-008 / SC-003 |
| 教师排布 | ≥1280px 两页均为 2×2（每行 2 张、宽度差 ≤1px）；768–1279px 两列；<768px 单列 | FR-009 / SC-011 |
| 无王伟平残留 | 渲染产物中「王伟平」与 `people.ucas.edu.cn/~0012246` 命中数为 0；`public/teachers/wang-weiping.svg` 不存在且构建产物中 URL 不可访问 | FR-009 / FR-010 / FR-020 / SC-002 |
| 链接互斥（学生） | 每条 `url`/`github`/`scholar` 非空数 ≤1；构造 2 个非空 → `check` 与 `build` 均失败且消息含文件、姓名、全部冲突字段 | FR-014 / SC-008 |
| 链接互斥（毕业生） | 同上 | FR-014 / SC-008 |
| 标签唯一 | 每个在读学生与毕业生渲染的 `.member-link` / `.grad-links a` 数量 ∈ {0,1} | FR-012 / SC-006 / SC-007 |
| 标签映射 | 顾佴彬/杨晨旭/李雨晴 = Homepage；李江楠/张瀚文/郑明钰/刘正宵 = GitHub；季慧山 = 0；刘曦雨 = Scholar（本期全站唯一） | FR-015～FR-017 / SC-006 / SC-007 |
| 李雨晴条目 | 出现在 PhD Candidates，显示 `Since 2022`，与顾佴彬同年份文案一致 | FR-016 / SC-009 |
| 刘曦雨年级 | 条目不显示 Since；`grade` 为空 | FR-022 / SC-012 |
| 姓名非链接 | 在读学生姓名元素为 `span`，无 `href` | FR-013 / SC-006 |
| 标签列对齐 | 学生 ≥480px `.member-link` 与毕业生 ≥768px `.grad-links a` 在 6.5em 列内居中，中心线跨行极差 ≤1px；堆叠态左对齐 | FR-019 / SC-010 |
| 列宽预留 | `Homepage ↗` 实测 106.11px ≤ 6.5em(117px)，标签单行不截断；Windows/macOS 复测 | FR-018 / FR-019 / SC-010 |
| 分组纵向 | 所有视口下两分组不处于同一水平行，左右边缘与内容区差值 ≤1px，纵向间距 ≥32px | FR-001～FR-003 / SC-001 |
| 无破损 | 十档视口（1920/1280/1024/768/767/576/481/480/375/320px）无重叠、截断、溢出、非预期换行、页面横向滚动 | SC-004 / SC-010 |

---

## 4. 状态与持久化

无状态迁移、无写入路径、无缓存：教师删除与学生/链接字段在数据文件中持久化一次，所有排序、分组、标签选择与列宽在构建期固化为静态 HTML/CSS；运行时零脚本。
