# Layout Verification: Team 页 Master's Students 双栏布局

**Date**: 2026-11-22 | **Feature**: 011-team-master-two-column-layout | **Contract**: [contracts/team-master-two-column.md](../contracts/team-master-two-column.md)

> 本文件按 2026-11-21 / 2026-11-22 澄清后的规则整份重测：grade **升序**、三轨 `minmax(4em, 1fr) 5.5em auto`、`.grade` 显式 18px、`note` 字段已移除。旧版（降序、`4em 5em minmax(0,1fr)`、0.95rem、note 测量）整体作废，未沿用任何旧结论。

## 测量方法

- 环境：Linux headless Chromium 159.0.8154.6（Playwright 驱动），`page.setViewportSize()` 严格按整数视口逐档打开 **`http://localhost:4321/nlp-home/team/`**（站点 `base: '/nlp-home'`；`http://localhost:4321/team/` 在 headless 导航下返回 404，故使用真实 base 路径），`networkidle` 后执行 `getBoundingClientRect()` / `getComputedStyle()`。
- 字体：安装 Noto Sans CJK SC 以正常渲染中文。主验收按站点字体栈的 **Segoe UI 度量**（Windows 目标环境）执行：以 Microsoft 官方 Segoe UI 度量兼容字体 Selawik 提供 `Segoe UI` 别名，`Homepage ↗` 实测 107px，与契约假设的 108.16px 同量级。另复核了无 Segoe UI 度量的 Linux 回退环境（Latin 回退实测 114px），其字体敏感风险记录在「Breakage」。
- 链接测量：克隆 PhD 分组既有 `.member-link`（保留 Astro scope 属性、文案与箭头不变）临时注入 Master's 行首 2 条，测完刷新还原；不修改数据文件。
- 截图：`/tmp/011-check/shot-{1440,768,480,375}.png`，已逐张目视检查（临时产物，不入库）。

## Baseline

| 项 | 结果 |
| --- | --- |
| 起点 commit | `54f3b81f63ff233a5d49db51b8c03ef4a461515f`（`chore(team): 更新团队名单数据（2024–2026 级）`） |
| 起点 `git status --porcelain` | `M src/components/StudentGroup.astro`、`M src/content.config.ts`、`M src/data/students.json`、`M src/data/README.md`、`?? specs/011-team-master-two-column-layout/` |
| 基线门禁 `npm run check` | 退出码 0（22 files，0 errors / 0 warnings / 0 hints） |
| 基线门禁 `npm run build` | 退出码 0，`19 page(s) built in 1.60s`（`Complete!`） |
| 改动前快照 | `/tmp/student-group-011-pre.astro`（只读，不入库） |
| 升序预期 | `/tmp/master-order-expected.txt` |
| master 总数 / 链接数 / note 数 | **11 / 0 / 0** |
| PhD 总数 / 链接数 / note 数 | **19 / 4 / 0** |
| Master's 切分预期 | `ceil(11/2)` → 左 6 / 右 5 |
| PhD 切分预期 | `ceil(19/2)` → 左 10 / 右 9 |

升序预期名单（Node 直读 `src/data/students.json`）：

- Master's（11）：朱祉同(2024)、张蓓泽(2024)、叶振雷(2024)、艾明旭(2025)、刘润泽(2025)、刘梦犁(2026) ｜ 张蓬月(2026)、顾树焕(2026)、温泽林(2026)、李佳睿(2026)、毛乐平(2026)。
- PhD（19）：牟凌宇(2021)、杨晨旭(2022)、刘曦雨(2022)、顾佴彬(2022)、李雨晴(2022)、周俊豪(2022)、赵语林(2023)、汪嘉(2023)、秦川于(2024)、佟政阳(2024) ｜ 朱哲良(2024)、姚丁钰(2025)、王娅彤(2025)、彭诗忠(2025)、沈斌(2026)、冀焕翔(2026)、陈翔楠(2026)、邱明阳(2026)、冯宇辰(2026)。

## Viewport Matrix（十一档）

“链接右缘差”为注入链接后链接右缘与所在栏右缘（扣除 24px 内距）的偏差；“Since 横向差”在 ≥480px 取同一栏内 Since 左缘极差，在 <480px 取右缘极差；“跨区块姓名左缘差”为 Master's 首行姓名与 PhD 首行姓名、Graduates 首个 `.grad-name` 左缘的偏差。

| 视口 | 视觉栏数 | 栏宽差 | 顶线差 | Since 横向差 | 链接右缘差 | 跨区块姓名左缘差 | 越界元素 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1920px | 2 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0 |
| 1440px | 2 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0 |
| 1280px | 2 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0 |
| 1024px | 2 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0 |
| 768px | 2 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0 |
| 767px | 1 | — | — | 0.00 | 0.00 | 0.00 | 0 |
| 576px | 1 | — | — | 0.00 | 0.00 | 0.00 | 0 |
| 481px | 1 | — | — | 0.00 | 0.00 | 0.00 | 0 |
| 480px | 1 | — | — | 0.00 | 0.00 | 0.00 | 0 |
| 375px | 1 | — | — | 0.00 | 0.00 | 0.00 | 0 |
| 320px | 1 | — | — | 0.00 | 0.00 | 0.00 | 0 |

<480px 的“视觉栏数 1”由两个 `<ul>` 纵向拼接而成（6 + 5），链接注入后按契约位于第 2 行；该档 Since 横向差按右缘计算，链接右缘差仍为 0。

## US1 两栏结构（T006）

- 结构核对：唯一 `<h3>Master's Students</h3>`；`div.master-columns` 内 1–2 个 `<ul>`，行类名 `student-name` / `grade` / `member-link` 保留；页面 `.note` 为 0；`th` 为 0（无表头行）；无栏间竖线。n=1 时 1 个 `<ul>` + `.is-single`，n=0 时 `p.empty` 占位且不渲染 `.master-columns`（结构与 010 一致，未补齐改动）。
- 两栏容器：`repeat(2, minmax(0, 1fr))`、`column-gap: 32px`、`align-items: start`，第二 `<ul>` 首行顶线 1px；`.is-single` 回到单列。

| 视口 | 两栏宽度 | 内容区宽 | 栏距 | 顶线差 | 外缘差（左/右） | 最长记录宽 | 内容区宽/2+1 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 768px | 344 / 344 | 720 | 32 | 0.00 | 0.00 / 0.00 | 344 | 361 |
| 1024px | 472 / 472 | 976 | 32 | 0.00 | 0.00 / 0.00 | 472 | 489 |
| 1280px | 550 / 550 | 1132 | 32 | 0.00 | 0.00 / 0.00 | 550 | 567 |
| 1440px | 550 / 550 | 1132 | 32 | 0.00 | 0.00 / 0.00 | 550 | 567 |
| 1920px | 550 / 550 | 1132 | 32 | 0.00 | 0.00 / 0.00 | 550 | 567 |

- 每栏条数 `[6, 5]`，`.master-columns` 内共 11 条；左右栏姓名逐字核对与预期一致（见 Baseline）。
- 分组标题唯一、宽度与内容区一致（768px：720 = 720；1440px：1132 = 1132），计算字号 20px。
- 与 PhD 对比：两栏 `<ul>` 宽度差 0、栏距差 0（五档均为 0）。
- 目视（1440 / 768 截图）：两栏等宽、顶线齐平、无空栏、无表头、无竖线。

## US2 行内三槽与字号（T009）

- Master's 内 **11 个 `.grade`、0 个 `.member-link`、`.student-name a` 0 个、`.note` 0 个**；11 行文案为 `Since 2024` ×3、`Since 2025` ×2、`Since 2026` ×6，无 `N/A` / `—` / `&nbsp;` 占位。
- 计算字号：Master's 与 PhD 的 `.grade` 在 1440px 与 768px 均为 **18px**；姓名、链接同为 18px，标题 20px。
- 行内轨道（无链接态实测）：

| 视口 | `grid-template-columns` | 姓名轨 / Since 盒 / 链接轨 | 行内可用宽 | 三槽 + 16px 间隙 |
| --- | --- | --- | --- | --- |
| 768px | `181px 99px 0px` | 181 / 99 / 0 | 296 | 296 |
| 1024px | `309px 99px 0px` | 309 / 99 / 0 | 424 | 424 |
| 1280px | `387px 99px 0px` | 387 / 99 / 0 | 502 | 502 |
| 1440px | `387px 99px 0px` | 387 / 99 / 0 | 502 | 502 |
| 1920px | `387px 99px 0px` | 387 / 99 / 0 | 502 | 502 |

- Since 左缘（同栏 11 行极差均为 0.00）与随视口右移：

| 视口 | Since 绝对左缘（左栏 / 右栏） | 相对内容区左缘 |
| --- | --- | --- |
| 768px | 237 / 613 | 189 |
| 1024px | 365 / 869 | 317 |
| 1280px | 493 / 1075 | 395 |
| 1440px | 573 / 1155 | 395 |
| 1920px | 813 / 1395 | 395 |

相对内容区左缘单调不减（189 → 317 → 395 → 395 → 395），1440 与 1920 差 0（绝对坐标的位移来自页面居中，内容区宽度均为 1132px）。

- 无链接尾隙：≥768px 均为 8px（24px 内距 + 8px 轨间距，≤8px）；<480px 为 0。
- 临时注入 `.member-link`（Segoe UI 度量）：五档链接宽均 107px、链接高度 29.7px（单行）、与 Since 右缘间隙 8px、链接右缘差 0.00。
- 768px 三槽：姓名 181 / Since 99 / 行内可用 296，无链接时三槽 + 16px 间隙 = 296 恰好闭合；注入 `Homepage ↗`（107px）后为 72 + 99 + 107 + 16 = 294 ≤ 296，链接保持单行，余量 2px（契约按 108.16px 预留 0.84px，同向通过）。无 Segoe UI 度量的宽字体会使该档余量转负，风险见 Breakage。
- 跨区块姓名左缘差：Master's / PhD / Graduates 均为 0.00（十一档全部 0.00）。

## US3 窄屏退化（T012）

| 视口 | 视觉形态 | 内容区宽 | 行内可用宽 | 姓名槽宽 | Since 盒宽 | Since 位置 | 行高 | 第二 `<ul>` 顶线 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 767px | 单栏横向 | 719 | 671 | 564 | 99 | 左缘 620，尾隙 0 | 47.69 / 46.69 | 0px |
| 576px | 单栏横向 | 528 | 480 | 373 | 99 | 左缘 429，尾隙 0 | 47.69 / 46.69 | 0px |
| 481px | 单栏横向 | 433 | 385 | 278 | 99 | 左缘 334，尾隙 0 | 47.69 / 46.69 | 0px |
| 480px | 单栏横向 | 448 | 400 | 293 | 99 | 左缘 341，尾隙 0 | 47.69 / 46.69 | 0px |
| 375px | 单栏竖排 | 343 | 295 | 54 | 90 | 右缘贴齐（极差 0） | 47.69 / 46.69 | 0px |
| 320px | 单栏竖排 | 288 | 240 | 54 | 90 | 右缘贴齐（极差 0） | 47.69 / 46.69 | 0px |

- 六档均为单列（两个 `<ul>` 上下拼接，6 + 5 = 11 条，按升序连续），无空栏 / 半宽列 / 双分隔线；每行横跨内容区整宽（行宽 = `<ul>` 宽）。
- 480–767px：姓名槽 278–564px（≥72px / 4em），Since 固定盒 99px，11 行左缘极差 0.00，尾隙 0；注入链接后链接宽 107px、Since↔链接间隙 8px、链接右缘差 0.00、与姓名同处一行（`sameRow=true`）。
- 375 / 320px：11 行均无链接（无第 2 行），Since 右缘跨行极差 0.00、与 `<ul>` 右缘 −24px 差 0；注入链接后链接独占第 2 行，左缘与姓名左缘差 0.00，右缘差 0.00。
- 跨区块姓名左缘差：六档均为 0.00（与 `.grad-name` 同线）；容器内距在 480px 为 16px、481px 起为 24px，行内 24px 不变。
- 480 / 375 截图：横向态单行三槽、竖排态「姓名 + Since → 链接」两行，无重叠 / 截断 / 横向滚动。

## Breakage（T013）

- 十一档逐档：`document.documentElement.scrollWidth - window.innerWidth = 0`，`main *` 越界元素数 = 0。
- 目视与量测：无元素重叠、无文字截断、无内容溢出、无表头行、无栏间竖线、无空栏 / 半宽列；<480px 的链接第 2 行属契约声明形态，不计破损。
- **非预期折行计数 0（主验收环境）**：按 Segoe UI 度量（Selawik 别名，`Homepage ↗` 107px）实测，768px 三槽 72 + 99 + 107 + 16 = 294 ≤ 296，PhD 既有 4 条链接行与模拟注入的 Master's 链接行均保持单行（链接高 29.7px），十一档无非预期折行。
- **回退字体兼容性风险（非本期缺陷，记录并上报）**：无 Segoe UI 度量的 Linux 回退环境下 `Homepage ↗` 实测 114px，768px 三槽最小需求 72 + 99 + 114 + 16 = 301px > 296px，PhD 既有 4 条链接行在该档会折成 2 行。该差异源于字体回退，不是 011 代码回归（011 未改动链接槽、栏距与断点；Master's 当前 11 行全无链接，本特性内容在该档无折行）。设计契约按链接 108.16px 预留 0.84px 余量，主验收字体与契约假设同量级并通过。按 quickstart §8，未采用缩小字号、换行标签、隐藏链接或修改共享声明值的兜底方案；如需在宽字体的 Linux 环境下也保持单行，需另开变更评估（例如更宽的内容区或更小的固定内距），不在本期范围。

## Regression（T014）

- PhD Candidates：`.phd-columns` 两栏，19 条按升序 **10 + 9**（2021 → 2026），19 个 `.grade`、4 个 `.member-link`、`.note` 0；行内顺序与 010 选择器一致；Since 字号在 1440px / 768px 均为 18px；两栏宽度差 0、与 Master's 栏距差 0；链接右缘与 Since 位置规则与 010 一致（主验收字体下 768px 链接单行；Linux 回退字体下的折行风险见 Breakage，仅影响行高，DOM 顺序与选择器定位不变）。
- Graduates：19 条；≥768px 为五列 Grid（1440px 轨道 `90px 72px 54px minmax(0px,1fr) 117px`），<768px 为 `display: flex` 三段式（姓名 / 元信息同一行，去向 `.grad-dest` 宽 100% 独占下一行、左对齐），行内左右 24px 内距不变；`.grad-name` 左缘与 Master's 姓名左缘差 0.00。
- 其他页面：构建 19 页；本地静态服务下 `/`、`/team/`、`/publications/`、`/news/` 均 200（站点无 `/faculty/` 路由）；未改动 Faculty / Team / Graduates 相关文件（见 Scope）。

## Edge Cases（T015）

- n=1：仅 1 条 `li` + `.is-single` → 单条 `<ul>` 宽 1132px（= 内容区宽），无空栏。
- n=0：临时替换为 `<p class="empty">Master's students coming soon.</p>` → 占位宽 1132px（= 内容区宽），`.master-columns` 不渲染，无空栏 / 半宽列。
- 缺年级（768px Grid）：移除首行 `.grade` 后无 `N/A` / `—` 占位；注入 `.member-link` 的计算 `grid-column` 为 `3 / auto`，与姓名同行，右缘差 0.00。
- 缺年级（480px Flex）：链接与姓名同行、右缘差 0.00。
- 超长姓名（768px）：改写为无空格拉丁长串后，姓名在槽内换行（右缘 229 ≤ Since 左缘 237），行高 107.06px，`li.scrollWidth == li.clientWidth`，页面横向溢出 0、越界元素 0。
- 排序/切分合成测试：无年级排最后；同年级保持输入顺序（2024-A 在 2024-B 前、2025-A 在 2025-B 前）；`ceil(n/2)`：n=0 → `[]`、1 → `[1]`、2 → `[1,1]`、5 → `[3,2]`、6 → `[3,3]`、7 → `[4,3]`、11 → `[6,5]`。

## 门禁（T016）

| 命令 | 结果 |
| --- | --- |
| `npm run check` | 退出码 0；0 errors / 0 warnings / 0 hints |
| `npm run build` | 退出码 0；`19 page(s) built in 2.01s`；`Complete!` |

## Scope（T017）

- `git status --porcelain`：`M src/components/StudentGroup.astro`、`M src/content.config.ts`、`M src/data/README.md`、`M src/data/students.json`、`?? specs/011-team-master-two-column-layout/`（与 Baseline 起点一致，无新增文件）。
- `git diff --stat`：上述 4 个文件（StudentGroup.astro 160 行、content.config.ts 1 行、README.md 2 行、students.json 90 行）。
- 禁止改动文件：`git diff HEAD -- src/data/graduates.json src/pages/team.astro src/styles/global.css src/components/TeacherCard.astro src/layouts` 为空；`package.json` / `package-lock.json` 零 diff（无新增依赖）。
- `students.json`：30 条注释删除 + 30 条尾逗号调整，无其他增删（`+` 行全部为对应 `-` 行去尾逗号；60 个 `-` 中 30 个为 `"note"`，30 个为去逗号对照）；条目 30 条、`note` 键 0。
- `content.config.ts`：仅删除 `note: z.string().optional().nullable()`；`README.md`：仅从字段清单删除 `note`。
- `StudentGroup.astro`：仅含 `byLevel` 升序比较器与注释、Master's 分支 / `.master-columns` 包装、note 渲染与 `.note` 样式移除、三轨 `minmax(4em,1fr) 5.5em auto`、480–767px 姓名 `flex: 1 1 4em`、480–767px Since `5em → 5.5em`、`.grade` 字号 `18px`；`linkOf` 的 `url` → `github` → `scholar` 映射零 diff。
- 数据更新属于独立 commit `54f3b81`，不在本特性 diff 内。
- 口径说明：quickstart §6.3 仍写有「`src/content.config.ts` 相对起点零 diff」，与 tasks.md T001 起点清单及 T017 的「`note` 字段移除（`content.config.ts` / `students.json` / `README.md`）」冲突。本特性以 tasks.md 为准——`note` 字段移除属 2026-11-22 澄清后的范围，故上述 4 个文件的 diff 均为预期，quickstart 该句待后续修订。

## 结论

FR-001～FR-013、SC-001～SC-007 的实测项全部通过：十一档视口无破损与横向溢出、无非预期折行（主验收字体下 768px 链接单行），两栏结构、三槽对齐、升序切分、窄屏退化、边界场景、回归、范围与门禁均符合 quickstart「预期结果」。唯一保留项为**无 Segoe UI 度量的 Linux 回退字体**在 768px 的链接折行兼容性风险（Master's 当前 0 链接，不受影响），已按 quickstart §8 记录并上报，未做违反约束的兜底修改。
