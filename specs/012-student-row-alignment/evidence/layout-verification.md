# 012 布局验收证据：Team 页在读学生名单列布局

**日期**: 2026-11-22 | **特性**: `012-student-row-alignment` | **规格**: [spec.md](../spec.md) | **契约**: [student-row-alignment.md](../contracts/student-row-alignment.md)

本文件按 tasks.md 的 T002 → T003 → T007 → T008 → T010 → T011 → T012 → T013 → T014 顺序追加，T014 汇总。

## T002 改动前基线（机器门禁 + 变更范围）

**命令**：`npm run check` → `npm run build`（仓库根目录，改动前）

```text
> nlp-home@1.0.0 check
> astro check
[content] Syncing content / Synced content
[types] Generated 993ms
[check] Getting diagnostics for Astro files in /home/photon/workspace/nlp-home...
Result (22 files):
- 0 errors
- 0 warnings
- 0 hints

> nlp-home@1.0.0 build
> astro build
[build] 19 page(s) built in 1.58s
[build] Complete!
```

**结论**：改动前 `check` 0 错误 / 0 警告 / 0 提示，`build` 19 页全部成功。

**改动前 `git status --porcelain`**：

```text
 M specs/012-student-row-alignment/checklists/requirements.md
 M specs/012-student-row-alignment/contracts/student-row-alignment.md
 M specs/012-student-row-alignment/data-model.md
 M specs/012-student-row-alignment/plan.md
 M specs/012-student-row-alignment/quickstart.md
 M specs/012-student-row-alignment/research.md
 M specs/012-student-row-alignment/spec.md
 M specs/012-student-row-alignment/tasks.md
```

**改动前 `git diff --stat`**：8 个文件、+161 / −111，全部位于 `specs/012-student-row-alignment/`（规格澄清阶段的文档更新）；`src/` 与 `package*.json` 均无改动。

**基线口径说明**：本次实现的源码基线为 HEAD `d395f60`（上列规格文档改动为澄清阶段未提交内容，属于本特性文档，不涉及源码）。改动前的 `src/components/StudentGroup.astro` 与 HEAD 完全一致。

## T003 字体环境与 Since 文字宽度参考值（改动前，1440px）

**验收浏览器**：TraeCN 1.107.1（Chromium 142.0.7444.235，Electron 39.2.7），DPR 1.5，页面缩放 100%，站点默认字体。

**字体环境**：`body` 计算字体族为 `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, ...`；`document.fonts.check('18px Inter')` = `true`（Inter 可用）；`.grade` 计算字号 18px、行高 1.65（元素高 29.7px）。

**测量方法**：对 30 个 `.grade` 逐个用 `document.createRange()` + `selectNodeContents` 取文字范围宽度（MUST NOT 用 `getBoundingClientRect().width`；改动前 `.grade` 占满 5.5em 轨道，元素盒宽恒为 99px，不代表文字宽度）。

| 指标 | 结果 |
|------|------|
| Since 条数 | 30 |
| 最大文字宽度 | **85.58px**（文案 `Since 2021`；30 条均为 85.58px，数字等宽） |
| 单行高度 | 29.7px（30 条一致，无折行） |
| 参考结论 | 85.58px ≤ 90px（5em），T007 实现后若复测仍 ≤90px，则整组保持 5em，不切 5.5em |

**改动前 011 现状对照（同次测量）**：`.grade` 在行内的水平中心随行滑动，1440px 下 Since 中心相对行内容区中点偏移分布在 +87.39px ～ +193.5px（`sinceOffsetSet` 含 87/117/194 三档），各栏内极差 582 / 688px——即本次要消除的「Since 随视口与姓名长度漂移」现象。

## T004–T006 实现变更（唯一源文件）

仅改动 [src/components/StudentGroup.astro](../../../src/components/StudentGroup.astro) 的 scoped `<style>`：

- 新增单一 `@media (min-width: 480px)` 块（PhD / Master's 选择器并列）：`display: grid`、`grid-template-columns: 3.5em 5em 6.5em`、`column-gap: 0`、`justify-content: space-between`；`.student-name` 落 `grid-column: 1`；`.grade` 落 `grid-column: 2` + `justify-self: center` + `margin-left: 0` + `white-space: nowrap`；`.member-link` 落 `grid-column: 3` + `justify-self: end` + `text-align: right` + `white-space: nowrap`。
- 删除 011 的 `minmax(4em, 1fr) 5.5em auto` 三槽规则、`column-gap: 8px`、`padding: 8px 24px` 重复声明，以及 480–767px 的 flex 行内规则（`flex: 1 1 4em`、`flex: 0 0 5.5em`、`margin-left: auto`）。
- 保留两栏断点（≥768px）、32px 栏距、`.is-single`、`ul + ul` 顶线、`overflow-wrap`、<480px 竖排块与既有 `padding: 8px 24px` / `align-items: baseline`。
- <480px 两处 `.member-link` 的 `text-align: left` 同步改为 `right`（消除基线重复声明与竖排块的语义冲突）。
- 模板 frontmatter、DOM、类名、字号、配色、排序/切分逻辑零改动；无 `1fr` / `max-content` 侧轨、无硬编码像素列宽、无 `translateX`、无碰撞夹取。

## T007 Since 列宽判定（实现后，仍按 5em）

实现后在 1440px 用同一 `document.createRange()` 方法复测 30 个 `.grade`：

| 指标 | 结果 |
|------|------|
| 最大文字宽度 | **85.58px**（`Since 2021`） |
| Since 列宽 | 90px（5em），轨道实测 `63px 90px 117px` |
| 元素高度 | 30 条均为 29.7px（单行，无折行） |
| 判定 | 85.58px ≤ 90px，**保持 5em，不切换 5.5em**；PhD 与 Master's 取同一值 |

## T008 横向态九档逐档测量（30 行/档）

测量脚本按 [quickstart.md §3–§4](../quickstart.md)：`getComputedStyle(li).gridTemplateColumns` 取轨道，两侧空白由 Since 中心反推，链接右缘与标签宽度用 `document.createRange()` 文字范围，姓名/链接单行高度用元素盒高。

| 视口 | 轨道（全部 30 行） | 两侧空白 `g`（L=R） | 空白差 | Since 偏移 | 同栏极差 | 姓名左缘差 | 链接文字右缘差 | 链接宽度 max | 行内溢出 |
|------|------------------|--------------------|--------|------------|----------|------------|----------------|--------------|----------|
| 1920px | `63/90/117` | 116 / 116px | 0 | −27px | 0 | 0 | 0 | 106.11px | 0 |
| 1440px | `63/90/117` | 116 / 116px | 0 | −27px | 0 | 0 | 0 | 106.11px | 0 |
| 1280px | `63/90/117` | 116 / 116px | 0 | −27px | 0 | 0 | 0 | 106.11px | 0 |
| 1024px | `63/90/117` | 77 / 77px | 0 | −27px | 0 | 0 | 0 | 106.11px | 0 |
| **768px** | `63/90/117` | **13 / 13px** | 0 | −27px | 0 | 0 | 0 | 106.11px | 0 |
| 767px | `63/90/117` | 200.67 / 200.67px | 0 | −27px | 0 | 0 | 0 | 106.11px | 0 |
| 576px | `63/90/117` | 105 / 105px | 0 | −27px | 0 | 0 | 0 | 106.11px | 0 |
| 481px | `63/90/117` | 57.67 / 57.67px | 0 | −27px | 0 | 0 | 0 | 106.11px | 0 |
| 480px | `63/90/117` | 65 / 65px | 0 | −27px | 0 | 0 | 0 | 106.11px | 0 |

- 九档全部 30 行的轨道集合均为单一值 `63/90/117`；`g ≥ 8px`（最紧 768px 为 13px）；`gapL == gapR` 偏差 0。
- `Since 中心 − 行内容区中点` 集合恒为 `[-27]`，极差 0；四个栏（PhD 左/右、Master's 左/右）内 Since 中心极差均为 0，有链接行与无链接行一致。
- 链接文字右缘差 0、标签单行（元素高 29.7px）、宽度 106.11px ≤117px、向左溢出链接列的行数 0；姓名左缘差 0；行内 `scrollWidth − clientWidth` 0。
- 两栏结构：1920/1440/1280px 为 `550px 550px`、1024px 为 `472px 472px`、768px 为 `344px 344px`，栏距均 32px；767px 及以下为单轨，栏距 `normal`。

## T010 竖排态 375 / 320px

按 [quickstart.md §5](../quickstart.md)，链接右缘以文字范围（`document.createRange()`）判定，链接元素占满整行、其盒右缘不作判据。

| 视口 | 有链接/无链接行 | Since 右缘差 | 4 条链接文字右缘差 | 链接与同条 Since 右缘差 | 链接独占第 2 行 | 行高（有链接 / 无链接） | 页面横向溢出 |
|------|----------------|--------------|--------------------|--------------------------|------------------|--------------------------|--------------|
| 375px | 4 / 26 | 0 | 0 / 0 / 0 / 0 | ≤0.00001px | 4/4 为 true | 80.06px / 47.03、46.36px | false |
| 320px | 4 / 26 | 0 | 0 / 0 / 0 / 0 | ≤0.00001px | 4/4 为 true | 80.06px / 47.03、46.36px | false |

无链接行只有 1 行（无空第 2 行、无占位）；第 1 行姓名居左、Since 右对齐；两档均无越界元素（badCount 0）、无横向滚动。

## T011 计数、结构、数据与缺失字段

- **计数**：在读学生 30 条（PhD 19 / Master's 11）、`.grade` 30 个、`.member-link` 4 个（全部在 PhD，Master's 0）、`th` 0 个、`.student-name a` 0 个、分组标题 2 个（各 1）；页面文本无 `N/A`、`—`、`&nbsp;` 占位。
- **数据逐项比对**（脚本读取 `src/data/students.json`，按既有 `byLevel` + `ceil(n/2)` 规则生成期望，与 `/team/` 渲染结果逐条比对姓名、`Since <年份>`、链接标签）：`ALL_MATCH=true`，PhD [10, 9]、Master's [6, 5]，0 处 mismatch——0 丢失、0 重复、0 改写；顺序与年级升序一致。
- **两栏结构（767 / 768px）**：767px `grid-template-columns` 为单轨 `719.33px`、`column-gap: normal`；768px 为 `344px 344px`、`column-gap: 32px`；两档栏内条数均为 10+9 / 6+5。
- **缺年级 DOM 注入**（临时移除一行 `.grade`，不改数据，注入后恢复）：轨道保持 `63px 90px 117px`，第 2 列仍 90px；该行链接文字仍在第 3 列（`linkInThirdColumn=true`）、文字右缘差 0；行内文本未出现 `N/A` / `—` 占位；注入后子元素仅剩姓名 + 链接。
- **缺链接 DOM 注入**（临时移除一行 `.member-link`）：轨道保持 `63px 90px 117px`，第 3 列仍 117px；该行 Since 中心位移 0；无占位。
- **超长姓名（768px，补充检查）**：姓名在 63px 列内换行 5 行，姓名右缘 ≤ Since 左缘，行内无溢出、页面无横向滚动（属已声明形态，不纳入本期验收）。
- **装饰检查**：30 行 `li` 左右 `border` 均为 `0px/0px`；子元素形态仅 `span.student-name,span.grade` 与 `span.student-name,span.grade,a.member-link` 两种（与改动前一致）；额外装饰节点 0 个；无表头、无栏间竖线。

## T012 机器门禁与改动范围（实现后）

```text
> npm run check
Result (22 files):
- 0 errors
- 0 warnings
- 0 hints

> npm run build
[build] 19 page(s) built in 1.31s
[build] Complete!
```

**`git status --porcelain`**（临时验收 harness 已删除，不在仓库中）：

```text
 M specs/012-student-row-alignment/checklists/requirements.md
 M specs/012-student-row-alignment/contracts/student-row-alignment.md
 M specs/012-student-row-alignment/data-model.md
 M specs/012-student-row-alignment/plan.md
 M specs/012-student-row-alignment/quickstart.md
 M specs/012-student-row-alignment/research.md
 M specs/012-student-row-alignment/spec.md
 M specs/012-student-row-alignment/tasks.md
 M src/components/StudentGroup.astro
?? specs/012-student-row-alignment/evidence/
```

**`git diff --stat`（源码）**：`src/components/StudentGroup.astro | 60 ++++++------`，其余 8 个文件均为 `specs/012-student-row-alignment/` 的规格文档（澄清阶段既有改动）。

**零 diff 核对**：`src/data/students.json`、`src/data/graduates.json`、`src/content.config.ts`、`src/pages/team.astro`、`src/styles/global.css`、`src/components/TeacherCard.astro`、`tests/news-widgets.test.mjs`、`package.json`、`package-lock.json` 的 diff 文件数为 **0**。

## T013 十一档破损扫描与横向溢出

判据：页面横向溢出以 `document.documentElement.scrollWidth > window.innerWidth` 判定（不用差值等于 0）；越界元素为 `getBoundingClientRect()` 中 `width > 0` 且 `left < −0.5` 或 `right > innerWidth + 0.5` 的 `main` 内元素。

| 视口 | scrollWidth / innerWidth / clientWidth | 页面横向溢出 | 越界元素数 | 行内溢出 | 链接/姓名/Since 字号 | 分组标题字号 |
|------|----------------------------------------|--------------|------------|----------|----------------------|--------------|
| 1920px | 1920 / 1920 / 1920 | false | 0 | 0 | 18px | 20px |
| 1440px | 1440 / 1440 / 1440 | false | 0 | 0 | 18px | 20px |
| 1280px | 1280 / 1280 / 1280 | false | 0 | 0 | 18px | 20px |
| 1024px | 1024 / 1024 / 1024 | false | 0 | 0 | 18px | 20px |
| 768px | 768 / 768 / 768 | false | 0 | 0 | 18px | 20px |
| 767px | 767 / 767 / 767 | false | 0 | 0 | 18px | 20px |
| 576px | 576 / 576 / 576 | false | 0 | 0 | 18px | 20px |
| 481px | 481 / 481 / 481 | false | 0 | 0 | 18px | 20px |
| 480px | 480 / 480 / 480 | false | 0 | 0 | 18px | 20px |
| 375px | 375 / 375 / 375 | false | 0 | 0 | 18px | 20px |
| 320px | 320 / 320 / 320 | false | 0 | 0 | 18px | 20px |

- 十一档均无元素重叠、文字截断、内容溢出或非预期换行；`.grade` / 链接均单行（29.7px），链接宽度 106.11px ≤117px；姓名换行仅出现在超长姓名的已声明形态中。
- **768px 最紧档 `focus-visible`**：先用真实 Tab 键建立键盘输入模态，再聚焦 PhD 链接；`matches(':focus-visible') = true`，计算 `outline-width: 2px`、`outline-offset: 2px`；链接文字右缘 344px、所在行右边 368px（24px 内距），外框外扩 4px 后仍完全落在行内；`scrollWidth 768 = innerWidth 768`、页面横向溢出 false、越界元素 0。
- 768px 补充：链接 `getBoundingClientRect().height` 29.7px（单行），与 1440px 一致。

## T014 汇总

| 验收项 | 结果 |
|--------|------|
| Since 列宽判定（T007） | 85.58px ≤ 90px → 保持 5em；30 条单行 29.7px |
| 九档横向几何（T008） | 30/30 行轨道 `63/90/117`；`gapL == gapR`、最小 13px；Since 偏移恒 −27px、栏内极差 0；链接文字右缘差 0、宽度 106.11px；姓名贴左缘 |
| 375 / 320px 竖排（T010） | 4 条链接第 2 行文字右对齐、右缘差 0；26 条无链接仅 1 行；无占位 |
| 计数与数据（T011） | 30 条（19+11）、30 Since、4 链接、0 表头、0 姓名链接；与 `students.json` 逐项一致 |
| 767 / 768px 结构（T011） | 767px 单栏 / 768px 双栏 + 32px 栏距；10+9、6+5 |
| 空列与缺失字段（T011） | 缺年级第 2 列 90px、缺链接第 3 列 117px；无占位；链接仍定位第 3 列 |
| 十一档破损（T013） | 页面横向溢出 0、越界元素 0、行内溢出 0；字号 18 / 20px 不变；768px focus 外框不引起滚动 |
| 机器门禁（T012） | `check` 0/0/0；`build` 19 页成功 |
| 改动范围（T012） | 源码仅 `StudentGroup.astro`；9 个受保护文件零 diff；无新依赖 |
| 名单为空 / n=1（声明不测） | 按 spec Edge Cases：空分组沿用既有 `coming soon` 分支，n=1 由既有 `.is-single` 单栏规则承载，本特性未改这两条分支，故不实测 |

## T015 合规自查

- 无页面级 `overflow-x: hidden` / `clip`；`src/styles/news-widgets.css` 中三处 `overflow-x: auto` 为既有的组件块内滚动（代码块/宽表格），与本特性无关且属宪法 VI 允许范围。
- 未用缩小字号、隐藏链接、截断姓名换取对齐：`.grade` / 姓名 / 链接均为 18px，链接与 Since 均 `white-space: nowrap`，姓名仅在 63px 列内换行（已声明形态）。
- 无新增依赖、运行时 JS、组件文件或公共 CSS 层；`package.json` / `package-lock.json` 零 diff。
- 无 011 碰撞夹取残留：`minmax(4em`、`translateX`、按视口左移逻辑在 `src/` 中检索结果为 0。
- `git diff src/components/StudentGroup.astro` 仅 scoped `<style>` 段变化：模板 frontmatter、DOM、类名、`href` / `target` / `rel` 零改动。

## T016 / T017 提交、推送与线上验收

**本地提交（已完成）**：

```text
commit d4cf7d36602e39977c77b7b254a984069c5c5363
Author: Mengli LIU <114163423+LiuMenglii@users.noreply.github.com>
Commit: Mengli LIU <114163423+LiuMenglii@users.noreply.github.com>

feat(team): 012 在读学生行三列固定与链接右对齐

- ≥480px 行改为 3.5em / 5em / 6.5em 固定三列网格，space-between 等分两侧空白
- Since 列内居中（5em，实测文字宽 85.58px），链接文字贴行右缘
- <480px 竖排链接改为右对齐，与第 1 行 Since 同贴右缘
- 删除 011 的 minmax 侧轨、480–767px flex 行内规则与碰撞夹取逻辑
- 新增验收证据 specs/012-student-row-alignment/evidence/layout-verification.md
```

- 作者与提交者均为项目维护者本人；提交信息无 Claude / AI 共同作者尾注。
- 提交范围：10 个文件（`StudentGroup.astro` + `specs/012-student-row-alignment/` 的 8 个规格文档 + 证据文件），`git status --porcelain` 为空。
- 本地已通过 `npm run check`（0/0/0）与 `npm run build`（19 页）。

**推送与线上验收（已完成）**：

- 远程分支：`origin/main` = `d4cf7d36602e39977c77b7b254a984069c5c5363`（`git ls-remote origin refs/heads/main` 与本地 HEAD 一致）。
- CI：workflow run [45003902876](https://github.com/LiuMenglii/nlp-home/actions/runs/45003902876)（head `d4cf7d3`），`build` 与 `deploy` 两个 job 均 `success`，`astro check` 门禁通过并完成 GitHub Pages 部署。
- 线上检查：`https://liumenglii.github.io/nlp-home/team/`（浏览器视口 innerWidth 944px、页面地址带 `?v=d4cf7d3` 防缓存）——30 行（PhD 19 / Master's 11）、30 个 Since、4 个链接；轨道集合 `63px 90px 117px`；两侧空白均 53.17px；Since 偏移集合 `[-27]`；链接文字右缘差 0、最大宽度 106.11px、单行高 29.7px；`scrollWidth 929 ≤ innerWidth 944`、页面横向溢出 false、越界元素 0；字号 18px / 分组标题 20px。
- 作者核对：提交作者与提交者均为 `Mengli LIU <114163423+LiuMenglii@users.noreply.github.com>`，提交信息无 Claude / AI 署名。

> 注：证据文件本节的补充记录作为 docs-only 后续提交推送；代码提交 `d4cf7d3` 的 CI 与 Pages 部署结果如上。

## T018 / T019 收敛处理（补记）

- **PR 门禁偏离（维护者已确认）**：012 的样式提交 `d4cf7d3` 于 2026-11-22 直接推送到 `main`（CI run 45003902876，event=`push`），GitHub 仓库中不存在 012 的 PR（仅有 PR #1–#5）。在不改写既有远程历史、不 force-push 的前提下无法补走 PR；维护者确认采用「记录偏离、不回滚」的处理方式。后续涉及模板 / 样式 / 构建配置的变更仍 MUST 通过 PR。
- **最终证据推送**：本地提交 `91c11a3`（最终验收记录）与本次收敛补记推送到 `origin/main`，远程 `main` 包含本文件最新内容。
- **伴随数据调整（本特性范围外）**：维护者同时调整 `src/data/students.json` 的记录顺序；逐条比对为 0 新增、0 删除、0 字段改写，PhD 19 / Master's 11 与 4 个链接不变，行内几何与上述验收数字不受影响。


