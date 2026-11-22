# Data Model: Team 页在读学生的研究方向标签（替换年级字段）

**Date**: 2026-11-22 | **Spec**: [spec.md](./spec.md) | **Research**: [research.md](./research.md) | **数据契约**: [contracts/students-data.md](./contracts/students-data.md) | **行布局契约**: [contracts/team-row.md](./contracts/team-row.md)

本特性修改在读学生（Student）的持久化字段，并改变该实体的视图呈现；不新增其他数据文件，不改变 Faculty、Graduates、论文、新闻等实体。

## 1. 数据快照（2026-11-22，只读基准）

| 分组 | 条数 | 现有 `grade` | 目标 `directions` | 现有链接 |
| --- | --- | --- | --- | --- |
| PhD Candidates | 20 | 2020–2026，全部有值 | 全部 `["TBD"]` | 14（url 4 / github 9 / scholar 1） |
| Master's Students | 11 | 2024–2026，全部有值 | 全部 `["TBD"]` | 2（github 2） |
| 合计 | **31** | 31 条 | 31 条 | **16** |

- `url` 4 条：杨晨旭、顾佴彬、李雨晴、佟政阳。
- `github` 11 条：张瀚文、牟凌宇、秦川于、朱哲良、姚丁钰、刘润泽、冀焕翔、陈翔楠、邱明阳、刘梦犁、李佳睿。
- `scholar` 1 条：刘曦雨。
- 无链接 15 人：周俊豪、赵语林、汪嘉、朱祉同、张蓓泽、叶振雷、王娅彤、彭诗忠、艾明旭、冯宇辰、沈斌、张蓬月、顾树焕、温泽林、毛乐平。
- 链接在实现期 MUST 全部重新核实，最终数量可能变化；以上仅作验收基准。

## 2. 持久化实体

### 2.1 `Student`（在读学生）

| 字段 | 类型 | 必填 | 约束 | 说明 |
| --- | --- | --- | --- | --- |
| `name` | `string` | 是 | 非空字符串；姓名列 3.5em，当前名单最多 3 个汉字；4 字姓名在列内换行为已声明的预期行为 | 姓名，页面纯文本展示，不生成链接 |
| `level` | `"phd" \| "master"` | 是 | 枚举 | 决定进入 PhD Candidates 或 Master's Students 分组 |
| `directions` | `string[]` | 是 | 数组长度 ≥ 1；每一项为非空、非纯空白字符串；顺序有意义 | 研究方向标签；当前全部为 `["TBD"]`；页面按数组顺序渲染全部标签 |
| `url` | `string \| null` | 否 | HTTPS URL；与 `github` / `scholar` 至多一个非空 | 自建个人主页（含 GitHub Pages 学术主页）或机构个人资料页；页面标签 Homepage |
| `github` | `string \| null` | 否 | HTTPS URL；与 `url` / `scholar` 至多一个非空 | GitHub 个人主页；页面标签 GitHub |
| `scholar` | `string \| null` | 否 | HTTPS URL；与 `url` / `github` 至多一个非空 | Google Scholar 主页；页面标签 Scholar |

- **禁止字段**：`grade` 或任何表示入学年份的字段。`grade` 的删除由数据清理与 `src/` 检索保证；本期不新增构建期残留检测（评审决定：避免过度防御）。
- **排序字段**：无。展示顺序由数据文件条目顺序决定，不依赖任何字段排序。
- **entry id**：由 `jsonArrayParser` 按数组下标注入（`stu-001`…`stu-031`），不是维护者填写的字段；用于稳定排序与错误定位。

### 2.2 `DirectionTag`（方向标签，值对象）

| 属性 | 来源 | 约束 |
| --- | --- | --- |
| `text` | `student.directions[i]` | 原样渲染，不 trim、不改写、不截断、不省略；前后空格与重复项不校验，由维护者避免；长文本允许在标签内部换行 |
| `index` | 数组下标 | 渲染顺序必须等于数组顺序（FR-014） |
| `student` | 所属 `Student` | 同一学生的全部标签属于同一标签组，供辅助技术识别 |

### 2.3 `MemberLink`（成员链接，值对象）

| 属性 | 来源 | 约束 |
| --- | --- | --- |
| `href` | `url` → `github` → `scholar` 第一个非空字段 | 必须为 HTTPS；每人至多一个非空字段 |
| `label` | `url` → `"Homepage"`；`github` → `"GitHub"`；`scholar` → `"Scholar"` | 页面渲染为 `Label ↗`，`target="_blank"`、`rel="noopener"` |

## 3. 视图实体

### 3.1 `StudentRow`（行）

| 位置 | 内容 | 存在条件 | 渲染约束（本特性后） |
| --- | --- | --- | --- |
| 第 1 槽 | `span.student-name` | 恒存在 | 姓名纯文本；≥480px 居行内容左缘；<480px 居首行左侧 |
| 第 2 槽 | `span.direction-tags[role="list"]` + N × `span.direction-tag[role="listitem"]` | 恒存在（`directions` 至少 1 项） | 全部标签可见；组内换行；≥480px 位于姓名与链接之间；<480px 与姓名共享可用行并在组内换行；不与姓名/链接重叠 |
| 第 3 槽 | `a.member-link` | `url` / `github` / `scholar` 至少一个非空 | 标签单行、右对齐；≥480px 贴行内容右缘；<480px 独占最后一行并文字右对齐；无链接不渲染元素，但 ≥480px 由固定第三轨保留 117px 列宽，无需占位元素 |

- 行内顺序 MUST 为「姓名 → 标签组 → 链接」；标签组 MUST NOT 出现在姓名之前或链接之后。
- 无链接行 MUST NOT 渲染占位、破折号、空锚点或隐藏文本；≥480px 的空链接列仅保留宽度，不产生可见内容。

### 3.2 `StudentGroup`（分组）

- 结构：唯一 `<h3>`（`PhD Candidates` / `Master's Students`）+ `.phd-columns` / `.master-columns` 包装层 + 1–2 个 `<ul>`。
- 条数与切分：按 `level` 分组后，组内按 entry id（数据文件顺序）排列；≥768px 按 `ceil(n/2)` 切分左右两栏；`n=1` 使用 `.is-single` 单栏；`n=0` 沿用 "coming soon" 占位。
- 本特性不改变分组标题、两栏断点、32px 栏距、24px 行内距与空分组文案。

### 3.3 `TeamPage`（页面）

- `/team/` 包含 Faculty 区块、两个在读学生分组与 Graduates 区块。
- 本特性只改变两个在读学生分组的行内容与行内布局；Faculty、Graduates、导航、页脚与其他页面零改动。

## 4. 校验规则与错误矩阵

### 4.1 数据级校验（构建期）

| 场景 | 结果 | 错误信息 MUST 包含 |
| --- | --- | --- |
| `students.json` 不是合法 JSON | 构建失败 | 文件路径、JSON 解析错误 |
| 顶层不是数组 | 构建失败 | 文件路径、"顶层必须是数组" |
| 某条记录缺少 `directions` | 构建失败 | `src/data/students.json`、学生姓名、`directions` |
| `directions` 不是数组 | 构建失败 | 文件、学生姓名、`directions` |
| `directions` 为空数组 | 构建失败 | 文件、学生姓名、`directions`、至少 1 项 |
| `directions` 含空字符串 | 构建失败 | 文件、学生姓名、`directions`、项序号 |
| `directions` 含纯空白字符串 | 构建失败 | 文件、学生姓名、`directions`、项序号 |
| `directions` 含非字符串项 | 构建失败 | 文件、学生姓名、`directions`、项序号 |
| 同时填写 ≥2 个链接字段 | 构建失败（既有 `singleLinkRefiner`） | 文件、学生姓名、全部冲突字段 |
| 链接不是 HTTPS | 构建失败（既有 `httpsUrl`） | entry id、字段；错误信息含 https 要求 |
| 缺少 `name` / `level` 非法 | 构建失败（既有 schema） | entry id、字段；`directions` 由模块级校验补足文件与姓名 |

`grade` 残留不新增构建期校验；由数据清理与检索保证（评审决定：避免过度防御）。

### 4.2 渲染级校验

| 场景 | 期望 |
| --- | --- |
| 当前 31 条数据 | 每条至少渲染 1 个标签；标签文本为 `TBD`；两个在读分组内无 "Since"、无四位入学年份；全页 "Since" 为 0 |
| 某学生 `directions` 有多个标签 | 按数组顺序全部渲染；组内换行；无省略号 |
| 某学生无链接 | 不渲染 `a.member-link`；姓名与标签正常显示；不出现空链接行 |
| 超长标签 | 在标签内部换行；`scrollWidth ≤ clientWidth + 1`；不撑破行、不造成页面横向滚动 |
| 超长姓名 | ≥480px 在 3.5em 姓名列内换行（当前名单最多 3 个汉字，4 字姓名会换行）；<480px 沿用既有 `flex: 0 0 auto` 行为；本期不调整列宽 |

### 4.3 布局级校验（九档视口）

| 视口 | 期望 |
| --- | --- |
| 1920 / 1440 / 1280 / 1024 / 768px | 两栏（≥768px）；行内三轨；姓名贴左、链接贴右；标签组在中间列换行 |
| 767 / 576 / 481 / 480px | 单栏横向；同一套三轨；标签组在中间列换行 |
| 375 / 320px | 竖排；姓名与标签组共享首行/依次换行；链接独占最后一行且文字右对齐 |
| 全部九档 | 无元素重叠、无标签截断、无内容溢出容器、无页面横向滚动（判据 `scrollWidth > innerWidth`） |

## 5. 状态与转换

| 状态 | 触发条件 | 行内表现 |
| --- | --- | --- |
| 占位方向 | 当前全部学生 `directions: ["TBD"]` | 每条显示一个 `TBD` chip；访客可识别为待补充方向 |
| 真实方向（多标签） | 维护者将 `directions` 改为 2 个及以上真实字符串 | 按数组顺序显示全部 chip；组内换行；无需改代码 |
| 真实方向（单标签） | 维护者将 `directions` 改为 1 个真实字符串 | 显示单个 chip；行高与现状基本一致 |
| 无链接 | `url` / `github` / `scholar` 均为 `null`（schema 兼容省略，数据文件统一写 `null`） | 不渲染链接标签；≥480px 固定第三轨保留空链接列宽；<480px 无链接行 |
| 有链接 | 三个字段中恰好一个非空 | 显示对应 Homepage / GitHub / Scholar 标签；右对齐 |
| 两栏横向 | 视口 ≥768px 且切分后 2 栏 | `ceil(n/2)` 切分；两栏顶线一致 |
| 单栏横向 | 480px ≤ 视口 < 768px | 单栏；三轨行内布局 |
| 单栏竖排 | 视口 < 480px | 姓名 + 标签组，链接独占最后一行 |
| 空分组 | 分组内 0 条 | 沿用 "…coming soon." 占位；不渲染行 |

状态切换均为纯 CSS 媒体查询或数据驱动，不依赖运行时 JS。

## 6. 不变量

- **INV-1 数据规模**：在读学生 31 条（PhD 20 / Master's 11），每条渲染一次，0 丢失、0 重复、0 改写。
- **INV-2 字段替换**：`students.json`、students schema、组件与 README 中无 `grade` 残留；`graduates.json` 的 `year` 保留，不受影响。
- **INV-3 方向非空**：每条 `directions` 为长度 ≥1 的字符串数组，每项非空且非纯空白；当前全部为 `["TBD"]`。
- **INV-4 顺序**：组内展示顺序 = 数据文件条目顺序（entry id 升序）；标签顺序 = `directions` 数组顺序；不按姓名、年级或标签文本排序。
- **INV-5 链接唯一**：每条记录至多一个链接字段非空；页面至多渲染一个成员链接；无链接不渲染占位。
- **INV-6 链接优先级**：`url`（自建主页 / 机构个人资料页）优先于 `github`，`github` 优先于 `scholar`；写入前有强关联证据。
- **INV-7 行内顺序**：姓名 → 标签组 → 链接；标签组不越过姓名或链接。
- **INV-8 标签完整**：每个标签文本完整可见；无 `text-overflow: ellipsis`、无 `line-clamp`、无 `overflow: hidden` 导致的裁剪；长标签在自身内部换行。
- **INV-9 无重叠/无溢出**：任意九档视口下，标签组与姓名/链接不重叠；行内元素不越出内容区；页面不出现横向滚动（`documentElement.scrollWidth ≤ window.innerWidth`）。
- **INV-10 结构不变**：两栏断点 768px、32px 栏距、24px 行内距、`ceil(n/2)` 切分、`is-single` 单栏与空分组占位不变；只要求两栏顶线一致，不要求跨栏逐行对齐；不新增表头、竖线、筛选、折叠、分页或动效。
- **INV-11 语义**：标签组为 `role="list"` + `aria-label="Research directions"`，每个标签为 `role="listitem"`；链接保留 `target="_blank" rel="noopener"`。
- **INV-12 范围隔离**：仅 `students.json`、`content.config.ts`、`StudentGroup.astro`、`src/data/README.md` 变化；Faculty、Graduates、首页、发表页、新闻页、导航、页脚、依赖与 CI 零改动。
- **INV-13 无掩盖**：不以页面级 `overflow-x: hidden` / `clip`、缩小字号、隐藏标签或省略号规避布局问题（`0.9rem` 为既有教师 chip 基准，不因长标签再缩小）。
