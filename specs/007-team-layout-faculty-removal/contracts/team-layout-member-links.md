# Contract: Team 页布局、教师移除与成员链接标签（team-layout-member-links）

**Date**: 2026-10-23 | **Spec**: [spec.md](../spec.md) | **消费方**: 实现与验收（[quickstart.md](../quickstart.md)）、首页人员区块回归 | **显示模型**: [data-model.md](../data-model.md)

本契约对象有四：① **在读学生分组的纵向布局**（FR-001～FR-005）；② **王伟平移除后的展示不变量**（FR-006～FR-010）；③ **成员链接标签的唯一性与映射**（FR-012～FR-018）；④ **标签列的宽度与列内居中，以及窄屏堆叠态**（FR-019）。断点与视口口径以 spec 为唯一规范源；学生堆叠态判据为视口宽度，沿用 `global.css` 既有 480px 断点同值。

## 1. 结构契约（MUST）

### 1.1 学生分组

```text
div.student-groups                     # grid，单列 minmax(0,1fr)，gap 32px
├── div.student-group                  # PhD Candidates（恒渲染，顺序第一）
│   ├── h3
│   └── ul > li                        # 每条学生记录一个 li
│       ├── span.student-name          # 纯文本，MUST NOT 为 a
│       ├── a.member-link              # 0 或 1 个；文案 Homepage / GitHub / Scholar
│       ├── span.grade                 # 有 grade 时渲染，Since <grade>
│       └── span.note                  # 有 note 时渲染
└── div.student-group                  # Master's Students（顺序第二，空时显示既有占位文案）
```

- `StudentGroup` 的 `Props` 接口 MUST 保持 `{ students: CollectionEntry<'students'>[] }`。
- 两分组 MUST 在所有视口上下排列，MUST NOT 并排；每个分组占内容区整行，左右边缘与内容区对齐（容差 ≤1px）。
- 分组顺序 MUST 为 PhD Candidates 在前、Master's Students 在后。
- 分组间纵向间距 MUST ≥32px（实现值 32px）。
- 分组内条目 MUST 保持：姓名居左、年级/备注靠右（`margin-left:auto`）、上下分隔线、左右 24px 对称内距、姓名左边缘与毕业生姓名同线。
- 学生姓名 MUST 为 `span`（纯文本）；唯一链接出口为标签。

### 1.2 毕业生列表

```text
ul.graduate-list > li                  # ≥768px 五列 grid；<768px flex 三段式
├── span.grad-name
├── span.grad-degree
├── span.grad-year                     # 空值带 .is-empty
├── span.grad-dest
└── span.grad-links                    # .is-empty 当且仅当 url/github/scholar 全空
    └── a                              # 0 或 1 个；文案 Homepage / GitHub / Scholar
```

- 五列 MUST 为 `5em 4em 3em minmax(0,1fr) 6.5em`（本特性将首列由 4.5em 调整为 5em，去向列相应收窄 0.5em；其余轨道不变），列距 38px，内距 10px 24px。
- 标签列 MUST 在列内居中对齐（≥768px 单行态）；`<768px` 标签行 MUST 独占一行、左对齐。
- `<768px` 的三段式第 1 行（姓名 + 学位 + 年份）与第 2 行（去向）规则零改动。

## 2. 链接标签契约（FR-012 / FR-013 / FR-018）

| 数据状态 | 渲染 |
|----------|------|
| `url` 非空 | 唯一标签 `Homepage ↗` → `url` |
| `github` 非空 | 唯一标签 `GitHub ↗` → `github` |
| `scholar` 非空 | 唯一标签 `Scholar ↗` → `scholar` |
| 三者皆空 | 不渲染标签、不留占位 |

- 每个成员的标签数量 MUST ∈ {0,1}；同一成员 MUST NOT 出现两个及以上标签。
- 所有标签 MUST 为 `a[href^="https://"][target="_blank"][rel="noopener"]`，箭头 `<span aria-hidden="true">↗</span>`。
- 标签配色 MUST 沿用 `--blue-deep`，hover `--blue`，字体字号与所在列表正文一致。
- 本期不要求 `aria-label` 或视觉隐藏姓名：标签的可访问名仅为标签文案（spec Assumptions「无障碍范围」）。
- 成员姓名 MUST NOT 呈现为链接（在读学生与毕业生均是）。
- 当前数据下的标签矩阵 MUST 为：李江楠/张瀚文/郑明钰/刘正宵 = GitHub；杨晨旭/顾佴彬/李雨晴 = Homepage；刘曦雨 = Scholar；季慧山 = 无；毕业生中佀庆一/杨泽娴/刘源鑫 = Homepage，其余无。
- 本期验收时全站（`/team/`）可见的 Scholar 标签数 MUST 为 1（仅刘曦雨；不作为永久不变量）。

## 3. 标签列宽与视口行为矩阵（FR-018 / FR-019）

**实测基准（18px 字号；Chrome 最新稳定版 + 站点默认系统字体栈）**：`Homepage ↗` 106.11px；`GitHub ↗` 74.48px；`Scholar ↗` 76.50px。三者中最长为 `Homepage ↗`。

| 列表 | 列实现 | 对齐 | 宽度要求 |
|------|--------|------|----------|
| 在读学生 | 姓名列 `flex: 0 0 5em`（按姓名 ≤4 汉字设计）+ 标签列 `flex: 0 0 6.5em` | 标签在列内居中，中心线跨行极差 ≤1px | 6.5em = 117px ≥ 106.11px |
| 毕业生 | 首列 `5em`（姓名）+ 末列 `6.5em`（标签，不变） | 标签在列内居中，中心线跨行极差 ≤1px | 同上 |

| 视口 | 在读学生行 | 毕业生行 |
|------|------------|----------|
| ≥768px | 单行：姓名列 + 标签列 + 弹性空白 + 年级/备注靠右 | 五列网格 |
| 480–767px | 单行（同上） | `<768px` 三段式；标签行左对齐 |
| <480px（≤479.98px） | 堆叠：第 1 行姓名 + 年级/备注靠右；第 2 行备注自然换行；标签恒为最后一行、左对齐 | 同上（`<768px` 三段式） |

- 堆叠判据 MUST 为视口宽度（媒体查询），写作 `max-width: 479.98px`：480px 及以上单行、479.98px 及以下堆叠。
- 任一档位：标签 MUST NOT 换行、截断、溢出容器，MUST NOT 与姓名或年份重叠。
- 标签列宽度 MUST 按最长标签实测宽度预留（6.5em），MUST NOT 随行内容收缩；Windows/macOS MUST 各复测一次，若仍换行则按实测宽度 +10% 调整。

## 4. 数据互斥契约（FR-014）

- `students.json` 与 `graduates.json` 中，每位成员的 `url` / `github` / `scholar` 非空字段数 MUST ≤ 1。
- 填写 ≥2 个时，`npm run check` / `npm run build` MUST 失败并中断，错误信息 MUST 同时包含：
  1. 数据文件路径（`src/data/students.json` 或 `src/data/graduates.json`）；
  2. 成员姓名；
  3. 全部冲突字段名，按 `url` → `github` → `scholar` 顺序排列。
- 实测（2026-10-23）：`astro check` 会执行 content sync 并校验集合 schema（含 `superRefine`），因此 `check` 与 `build` 是同一口径的双门禁。
- 三个字段皆空 MUST 合法（不渲染标签）。
- 任一非空链接 MUST 为合法 `https://` 地址（沿用既有 `httpsUrl` 校验）。

## 5. 王伟平移除不变量（FR-006～FR-010、FR-020）

- `/team/` 的 Faculty 区块与 `/` 的 Team 区块 MUST NOT 出现王伟平的姓名、职称、研究方向、简介、邮箱或主页链接。
- Faculty 卡片数 MUST 为 4，连续排列、无空白占位或破损卡片；其余 4 位教师的字段与相对顺序 MUST 与改动前逐项一致。
- `public/teachers/` 下 MUST NOT 保留 `wang-weiping.svg`；`/teachers/wang-weiping.svg` MUST NOT 存在于构建产物、MUST NOT 可访问；站点数据 MUST NOT 引用 `people.ucas.edu.cn/~0012246`。
- 全站构建产物 HTML MUST NOT 出现「王伟平」或 `people.ucas.edu.cn/~0012246`（FR-010；历史 `specs/` 规划文档除外）。
- ≥1280px 下 Team 页与首页的教师卡片 MUST 呈 2×2（每行 2 张、等宽）；768–1279px 两列、<768px 单列；MUST NOT 出现 3+1。

## 6. 不变量（MUST）

- 不新增运行时依赖、脚本、组件文件或公共 CSS 工具类；零新 JS。
- 配色、字体、字号、圆角、分隔线与其他区块版式不变；`global.css` 零改动。
- `src/data/graduates.json` 本期零改动；`teachers.json` 仅删除王伟平一条；`students.json` 仅新增李雨晴、补齐三个链接字段并删除刘曦雨 `grade`。
- `index.astro` 仅允许修改 `.teacher-grid` 的 ≥1280px 列数（3 → 2）；`team.astro` 仅允许修改 `.teacher-grid` 列数并扩展毕业生标签渲染；毕业生五列首列 MUST 由 4.5em 调整为 5em、标签列 MUST 保持 6.5em 并在列内居中，其余规则不变。
- 交付 MUST 遵循 Constitution 维护工作流：模板/样式变更经 Pull Request 合入，合并前确认 `check` / `build` 与十档渲染无破损；部署后 MUST 检查线上页面渲染。
- 既有断点（1279.98 / 767.98 / 575.98 / 480）之外 MUST NOT 引入新断点；学生堆叠使用 `max-width: 479.98px`（视口宽度判据）。
- `npm run check` + `npm run build` 通过，部署流水线不变。
- 不得以 `overflow-x: hidden` 掩盖溢出：验收 MUST 基于真实渲染并逐元素检查 `getBoundingClientRect().right ≤ document.documentElement.clientWidth`；逐元素越界为权威判据，`scrollWidth === clientWidth` 仅作辅助信号。
