# Data Model: Team 页布局优化与移动端修复

**Date**: 2026-10-12（rev2：纳入毕业生 `url` 字段与五列结构） | **Constraint**: 数据层改动严格限定为链接展示与毕业生信息结构所需的最小调整（spec FR-006 两轮授权累计）——为 `students` / `graduates` 新增可选 `github` 字段、迁移学生既有 `url` 中的 GitHub 取值（已合入）；为 `graduates` 新增可选 `url` 字段并填入三个已核实主页取值；除此以外 schema 与数据零改动（teachers 维持现状）。完整 schema 定义见 `src/content.config.ts`（本特性的 schema 变更点见 §校验规则变更）。

## 实体

### Teacher（`src/data/teachers.json` → `teachers` collection）【零改动】

| 字段 | 类型 | 布局相关性 |
| ---- | ---- | ---- |
| `name` | string（必填） | 卡片标题行 |
| `title` | string（必填） | 职称行（英文，如 Professor） |
| `directions` | string[]（≥1） | **本特性核心**：标签集合，横向换行填满卡片信息列（R4）；单标签长度不定，必须允许换行 |
| `photo` | string（可选） | 缺图时卡片头仍需正常排布（边缘用例）；有图时固定 120×150 缩略 |
| `email` / `homepage` / `bio` | 可选 | Team 页 detailed 模式展示；排布不变 |

消费组件：`TeacherCard.astro`（Team 页 detailed + 主页 compact 共用 → 回归范围，FR-009）。教师不加 `github` 字段（FR-006：teachers 维持现状）。

### Student（`src/data/students.json` → `students` collection）【github 字段新增 + url 迁移】

| 字段 | 类型 | 布局相关性 |
| ---- | ---- | ---- |
| `name` | string（必填） | 条目行左端；`url` 非空时姓名为链接 |
| `level` | `'phd' \| 'master'` | 决定分组（PhD Candidates / Master's Students），组内按 `grade` 降序 |
| `grade` | string（可空） | 非空时展示 `Since {grade}`，**行右端**（R3 两端分布）；为空（如李江楠）则行内仅有姓名 |
| `url` | httpsUrl（可空） | **语义收窄：仅个人主页**（如杨晨旭）；GitHub 链接 MUST NOT 存于此字段 |
| `github` | httpsUrl（可空，**新增**） | 非空时姓名后渲染 `GitHub↗` 独立标签（FR-010），计入条目左簇内容（FR-004 中间间隙判定） |
| `note` | string（可空） | 非空时紧随 `Since` 右侧；当前数据全为 null |

#### url → github 迁移明细（4 条）

| 姓名 | 原 `url`（迁移至 `github`） | 迁移后 `url` |
| ---- | ---- | ---- |
| 李江楠 | `https://github.com/LeqsNaN` | null |
| 张瀚文 | `https://github.com/Heaven-zhw` | null |
| 郑明钰 | `https://github.com/SpursGoZmy` | null |
| 刘正宵 | `https://github.com/jluliuzx` | null |

**不迁移**：杨晨旭 `url: https://iie-ycx.github.io/`（GitHub Pages 个人主页，非 GitHub 个人页）——保留 `url`，姓名仍可点击。迁移仅搬移取值，URL 逐字不变（Constitution I）。

消费组件：`StudentGroup.astro`。

### Graduate（`src/data/graduates.json` → `graduates` collection）【github 字段新增（已合入）+ url 字段新增（rev2）】

| 字段 | 类型 | 布局相关性 |
| ---- | ---- | ---- |
| `name` | string（必填） | 第 1 列；现值均为 2–4 个汉字 → 固定列宽按 ≤4 字 + 余量取值 |
| `degree` | `'phd' \| 'master'` | 第 2 列，经 `degreeLabel` 映射为 `PhD` / `Master`（UI 标签英文化，001 既有逻辑）；固定列宽按 `Master` + 余量取值 |
| `year` | int（可空） | **单独成列（第 3 列，rev2 拆列）**；非空时显示 `{year}`；**为空（如谭宇彤、温哲）时该列留空占位**，对齐不破坏（FR-003）；固定列宽按 4 位数字 + 余量取值；同时为 FR-012 排序主键 |
| `destination` | string（必填） | 第 4 列 `minmax(0, 1fr)` 弹性列；现值最长"北京大学（攻读博士）"10 个汉字，须可在列内换行 |
| `url` | httpsUrl（可空，**rev2 新增**） | 非空时链接列渲染 `Homepage↗` 标签（FR-011）；与学生 `url` 字段命名一致、语义同为个人主页；三条已核实取值：佀庆一→`https://phoebussi.github.io/`、杨泽娴→`https://ccds.fzu.edu.cn/info/1204/11629.htm`、刘源鑫→`https://llyx97.github.io/`（谭宇彤、温哲暂无，留空） |
| `github` | httpsUrl（可空，**新增**） | 非空时链接列渲染 `GitHub↗` 标签（FR-010/FR-011，rev2 变更——自去向列内联迁至链接列集中放置）；当前数据均无 GitHub 链接，字段为导入完整名单预留 |

消费页面：`src/pages/team.astro`；排序（FR-012，渲染时完成，与数据文件条目顺序无关）：`year` 降序 → 同年份内 PhD 在 Master 之前 → 无年份条目排在全部有年份条目之后（组内同样 PhD 在前）→ 同排序键保持数据文件相对顺序（稳定排序，以零填充 `id` 字典序 = 数据顺序作显式 tiebreak，比较器设计见 [research.md](./research.md) R9）。当前数据预期渲染顺序：杨泽娴（2025·PhD）→ 佀庆一（2024·PhD）→ 刘源鑫（2021·Master）→ 谭宇彤、温哲（无年份组，保持数据顺序）。

## 派生展示值（模板层）

- `degreeLabel = { phd: 'PhD', master: 'Master' }`（既有，不变）
- 学位与毕业年份分列展示（rev2 拆列）：学位列 `PhD` / `Master`、年份列 `{year}`；`year` 为空 → 年份列留空占位、学位照常显示（无多余分隔符，边缘用例）
- 学生行：`grade` 非空 → `Since 2021`（既有，不变）
- **新增**：`github` 非空 → `GitHub <span aria-hidden="true">↗</span>` 标签（与既有 `Link ↗` / `Homepage ↗` 模式同构）；为空 → 不渲染（FR-010）
- **rev2 新增**：毕业生 `url` 非空 → `Homepage <span aria-hidden="true">↗</span>` 标签（复用 TeacherCard 既有 `Homepage ↗` 模式，FR-011）；为空 → 不渲染、链接列保留空占位；两标签集中于链接列并列（`Homepage↗ GitHub↗`）

## 校验规则变更（本特性 schema 改动累计）

`src/content.config.ts`：

- `students` schema 新增 `github: httpsUrl`（已合入；复用既有校验器：合法 URL + MUST `https://` + optional/nullable）
- `graduates` schema 新增 `github: httpsUrl`（已合入，同上）
- `graduates` schema 新增 `url: httpsUrl`（rev2，同上——个人主页链接，与学生字段命名一致）
- 其余 collection 与字段零改动；`npm run check` + `astro build` 继续在构建期拦截数据错误（含新字段格式错误）

**维护者文档同步**：`specs/001-homepage-rebuild/data-model.md` 的 Student / Graduate 字段表补 `github` 行（已同步）与 Graduate 字段表补 `url` 行（rev2 待同步，含 FR-012 渲染排序说明）——001 contracts/data-files.md 指向该文件作为字段参考（Constitution II：数据文件 MUST 有清晰的字段约定）。
