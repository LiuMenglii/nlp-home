# Data Model: Team 页多分辨率响应式布局

**Date**: 2026-10-15 | **Constraint**: 数据改动**仅限 `graduates.json` 内容**（FR-011/FR-015），schema 字段定义与其余数据文件逐字节不变；`content.config.ts` 仅新增 teachers `photo` 字段的存在性校验逻辑（FR-016，FR-015 的显式例外）。因此本文件的「实体」分两部分：**① 数据层——毕业生条目的目标状态（FR-011 合并映射）与 teachers photo 校验规则；② 渲染层——视图实体**（模板 + scoped CSS 呈现的排布单元）。教师/在读学生的字段定义以 [001 data-model.md](../001-homepage-rebuild/data-model.md)（field-level 权威源，已含 002 回填的 `github` / 毕业生 `url`）为准，本文不复述。

## 数据层变更

### 1. `graduates.json` 内容合并（FR-011）

权威源：《2026年招生介绍-G3.pptx》第 7 页「G3 组学生就业情况」表（14 行，已逐字提取核对）。合并策略：**更新重叠 5 条的 `destination`（`year`/`url` 保留现值）+ 新增未收录 9 条**（`name` 用 PPTX 原文、`degree` 类型映射硕士→`master`/博士→`phd`、`year` 置 `null`、`url`/`github` 键省略，真名/年份/链接待正式上线前获得后补齐）；去向原文「->」规范化为「 → 」（箭头前后各补一个空格，与 spec FR-011 正文示例一致，见 [research.md R10](./research.md)）。

**目标状态**（14 条；前 5 条为既有条目的更新版，`~` 标记本次改动的字段；后 9 条为新增，按 PPTX 行序追加）：

| # | name | destination ~ | degree | year | url / github |
| ---- | ---- | ---- | ---- | ---- | ---- |
| 1 | 佀庆一 | **华为天才少年 → 京东大模型**（原「京东（大模型）」） | phd | 2024（不变） | `https://phoebussi.github.io/`（不变） |
| 2 | 杨泽娴 | 福州大学（值不变） | phd | 2025（不变） | `https://ccds.fzu.edu.cn/info/1204/11629.htm`（不变） |
| 3 | 谭宇彤 | 米哈游（值不变） | master | null（不变） | —（不变） |
| 4 | 温哲 | 工商银行（值不变） | master | null（不变） | —（不变） |
| 5 | 刘源鑫 | **北京大学 → 小米mimo**（原「北京大学（攻读博士）」） | master | 2021（不变） | `https://llyx97.github.io/`（不变） |
| 6 | 许同学 | 腾讯微信 → 拼多多 | master | **null** | —（新增，键省略） |
| 7 | 刘同学 | 蚂蚁金服 | phd | **null** | —（新增，键省略） |
| 8 | 李同学 | 腾讯微信 | phd | **null** | —（新增，键省略） |
| 9 | 王同学 | 华为鸿蒙 | master | **null** | —（新增，键省略） |
| 10 | 王同学 | 腾讯混元大模型 | master | **null** | —（新增，键省略） |
| 11 | 陈同学 | 字节跳动 | master | **null** | —（新增，键省略） |
| 12 | 申同学 | 小米mimo | master | **null** | —（新增，键省略） |
| 13 | 赵同学 | 小红书大模型 | master | **null** | —（新增，键省略） |
| 14 | 郑同学 | 蚂蚁基座大模型 | phd | **null** | —（新增，键省略） |

约束：

- 两「刘同学」（#7 博士 / #5 即其硕士匿名行的实名条目）与两「王同学」（#9 / #10）各自独立成条，**不做去重合并**；毕业生与在读学生条目内容重复的也不处理（CHK037）。
- `graduates` schema **零改动**（`name`/`destination` 必填、`degree` enum、`year` optional nullable、`url`/`github` optional nullable httpsUrl），新条目形态完全落入既有 schema。
- 展示顺序按既有排序算法输出（年份降序 → 无年份最后 → 同组 PhD 在 Master 前 → 数组序 tiebreak），不再逐一枚举页面顺序；核对时以该算法对 14 条数据的实际输出为准（含保留的 `year=null` 条目 谭宇彤、温哲）。

### 2. teachers `photo` 构建期校验（FR-016）

`content.config.ts` 的 teachers schema `photo` 字段新增 `superRefine`（复用 gallery `src` 校验模式）：

- `photo` 为空 → 不校验（缺照片合法，卡片头部正常排布）；
- `photo` 非空 → MUST 为 `/teachers/<文件名>` 形态（剩余部分不含 `/` 与 `..`）且文件存在于 `public/teachers/`；违反 → schema issue（报错定位数据文件、教师姓名、缺失路径），构建报错并中断。

字段定义（`string optional nullable`）不变；该逻辑是 FR-015「仅模板与样式」限制的显式例外（spec FR-016 授权）。

## 视图实体

### 3. 教师卡片（TeacherCard）— `src/components/TeacherCard.astro`

Team 页（`detailed`）与主页（`compact`）共享组件；主页实例展示内容可与 Team 页不同，布局行为随组件一致且与 Team 页一致（分栏数量、按档头部排布、标签收纳三者 MUST 一致，CHK034/FR-012）。数据来源不变（`teachers` collection）；本文仅规定其**按视口分档的内部排布**。

| 视图分区 | 组成 | 布局角色（本特性） |
| ---- | ---- | ---- |
| `.teacher-head` | 照片（`.teacher-photo`，自由宽 120×150）+ 信息区（`.teacher-identity`） | 头部排布容器：≥576px 横向（照片在左、信息在右）；<576px 纵向且照片水平居中于内容区上方（FR-003/CHK008） |
| `.teacher-identity` | 姓名（`h3`）+ 职称（`.teacher-title`）+ 研究方向标签（`.teacher-directions`） | ≥576px：标签横向流式填满信息列；<576px：两列 Grid（姓名左 / 职称右），方向标签整宽左对齐紧随其下（FR-003/CHK009） |
| `.teacher-directions` → `li` | 每个标签一项（`directions[]` 逐项） | 整标签优先换行；单个标签超宽时标签内换行（FR-004） |
| `.teacher-bio` / `.teacher-links` | 简介 / 邮箱+主页链接 | 始终完整可见，不被裁切（FR-005）；排布不变 |

分档状态（表驱动的呈现状态，非数据字段）：

| 视口 | `.teacher-head` 方向 | 照片 | 姓名/职称 | 方向标签 |
| ---- | ---- | ---- | ---- | ---- |
| ≥576px | 横向（flex row） | 左 | 上下堆叠（`h3` 上、`title` 下） | 信息列内横向流式（照片右侧） |
| <576px | 纵向（flex column，`align-items:center`） | 水平居中在上 | 同行（Grid `1fr auto`：姓名左、职称右对齐） | 占内容整宽（`grid-column: 1 / -1`）、左对齐，紧随姓名/职称行之下 |

### 4. 毕业生条目（Graduate）— `src/pages/team.astro` 的 `.graduate-list li`

数据来源 `graduates` collection（内容见上文 §1）；渲染值映射不变（`degreeLabel`：`phd→PhD` / `master→Master`；`year` 原值；链接标签 `Homepage↗` / `GitHub↗`）。本文规定其**按视口的分档排布**。

| 视图分区 | 数据来源字段 | ≥768px 角色 | <768px 角色（FR-006/CHK010） |
| ---- | ---- | ---- | ---- |
| `.grad-name` | `name` | 第 1 列（左对齐固定轨道） | 第 1 行左（flex 首项） |
| `.grad-degree` | `degree` → `PhD`/`Master` | 第 2 列（左对齐固定轨道） | 第 1 行右组：`margin-left:auto` 推向行右端，文字右对齐，与年份隔一个词空格 |
| `.grad-year` | `year`（可空） | 第 3 列（左对齐固定轨道）；空则留空占位（空 span 仍占轨道） | 第 1 行右组末位：shrink-to-fit → **容器宽＝数字宽**，右对齐贴行右缘；空则不渲染、学位独占右缘 |
| `.grad-dest` | `destination` | 第 4 列（`minmax(0,1fr)`，居中、列内换行） | 第 2 行（`flex: 0 0 100%`，左对齐） |
| `.grad-links` | `url` / `github` | 第 5 列（右对齐固定轨道）；两字段皆空则空占位 | 第 3 行（`flex: 0 0 100%`，**左对齐** flex-start，取代 002 窄屏右对齐）；两字段皆空则不渲染、行塌缩 |

分档状态：

| 视口 | `li` 形态 | 行结构 |
| ---- | ---- | ---- |
| ≥768px | `display: grid`（五列 `4.5em / 4em / 3em / minmax(0,1fr) / 6.5em`，`column-gap:38px`，`padding: 10px 24px`） | 单行五列混合对齐（既有形态，零回归，FR-009；内距 44→24px） |
| <768px | `display: flex; flex-wrap: wrap; align-items: baseline`（`column-gap` ≈ 一个词空格，`padding: 10px 24px`） | 三段式：①姓名 + 右组「学位 ←一个空格→ 年份」 ②去向左对齐 ③链接左对齐（FR-006） |

**缺失字段渲染规则**（FR-008，两档一致复用 `is-empty` 机制）：`year` 为空 → 不渲染年份（≥768px 第 3 列留空占位；<768px 学位单独贴行右缘）；`url` 与 `github` 皆空 → 不渲染链接标签（≥768px 第 5 列留空占位；<768px 第 3 行塌缩）；均不产生占位文本、分隔符（如 N/A、—）或空行残留。

### 5. 在读学生条目（Student）— `src/components/StudentGroup.astro`

**本特性修改一处**：`li` 左右内边距 `44px → 24px`（`padding: 8px 24px`，左右对称，FR-007 组成部分），其余样式与结构不变。该组件同时是 FR-007 的**对齐基准**：毕业生条目保留同一 24px 左内边距，二者姓名左边缘落在同一竖直线（验收测量 `getBoundingClientRect().left` 差值 ≤1px，SC-004）。

## 派生展示值（模板层，不变）

- `degreeLabel = { phd: 'PhD', master: 'Master' }`（既有）
- 学生行 `Since {grade}`、毕业生 `Homepage↗` / `GitHub↗` 标签（既有）
- 本特性**不新增任何派生值**——仅调整既有元素的排布与毕业生数据内容。

## 校验规则

- `graduates` schema 零改动；新条目由既有 Zod 校验照常覆盖（`destination` 必填、`degree` enum、`year`/`url`/`github` 可空）。
- `teachers.photo` 新增构建期存在性校验（见 §2，FR-016）；SC-009 负向用例：临时将某教师 `photo` 指向不存在文件 → 构建报错；还原 → 构建恢复通过。
- 数据文件损坏仍由既有 `jsonArrayParser` + Zod 在构建期拦截。
