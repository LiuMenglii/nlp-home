# Quickstart: Publications 条目与年份导航响应式优化验证指南

**Date**: 2026-10-23 | **Spec**: [spec.md](./spec.md) | **布局契约**: [contracts/publications-layout.md](./contracts/publications-layout.md) | **显示模型**: [data-model.md](./data-model.md)

改动 = 展示层（`PublicationItem.astro` + `publications.astro` 的 scoped CSS 与模板结构、必需项 `CCFBadge.astro` 宽度归一化）+ 数据层新增 `date` 字段（有链接必填、无链接留空）。零新依赖、零新 JS。验证 = 日期数据门禁 + 机器门禁 + 浏览器视口矩阵 + 一次性量测脚本。断点数值以 spec FR-001 为唯一规范源，本文引用其口径，不引入额外断点。

## 前置条件

- Node.js ≥ 22，仓库根目录已 `npm install`
- 浏览器 DevTools 响应式模式（可精确设定视口宽度）
- 基线已确认：`npm run check` + `npm run build` 在改动前通过（2026-10-23 已验证）

## 启动

```bash
npm run dev
# Publications 页：http://localhost:4321/nlp-home/publications/
# 主页概览：    http://localhost:4321/nlp-home/
```

最终验收前执行一次构建产物验证：

```bash
npm run check && npm run build && npm run preview
```

## 验证矩阵

验收档位：**1440 / 1280 / 1024 / 768 / 767 / 576 / 575 / 480 / 375 / 320px**；两处界面共检：`/publications/` 与 `/`。逐项对照 [publications-layout.md §2](./contracts/publications-layout.md)。

### 1. 宽屏条目（US1 / FR-002 / SC-001）— 档位 1440 / 1280 / 1024 / 768px

1. 逐条目核对：标题与期刊名能共行时共行；不能共行时期刊名**整体**另起一行、左边缘与标题左边缘对齐，**不出现**期刊名贴在标题末行右侧的情况。
2. 重点用例：`venue` 最长（62 字符）的条目、标题超长的条目；两者都确认标签簇仍固定在右侧、未掉落到条目下方。
3. 标签簇与条目**第一行文字基线**对齐：以 CCF 槽（含隐藏占位）首行文字基线为锚点，与条目首行文字基线偏差 ≤1px；簇内两标签垂直中心偏差 ≤1px。
4. 挑一条「无 url 有 ccf」「有 url 无 ccf」的条目，确认标签仍在各自列线上。

### 2. 窄屏条目（US1 / FR-003 / SC-002）— 档位 767 / 576px

1. 每条条目为两行：第一行**仅**标题且占满内容宽度；第二行为期刊名（左）+ 标签簇（右缘）。
2. 长期刊名换行成多行时，标签簇仍对齐**首行**，不下坠到末行、不垂直居中。
3. 无标签条目：期刊名占满第二行整宽，右侧无空白列。

### 3. 很窄屏条目（US1 / FR-004 / SC-003）— 档位 575 / 480 / 375 / 320px

1. 每条条目为三行：标题 / 期刊名 / 标签簇；标签簇贴内容右缘。
2. 「两标签皆无」的条目**只有两行**，第三行不出现、无多余间距。
3. 320px 下长期刊名与长标题正常收纳，无截断、无溢出、无重叠、页面无横向滚动。

### 4. 标签双槽列线量测（FR-005 / SC-004）— 每个档位各做一次

在 DevTools Console 执行（只读量测，不入库；覆盖隐藏占位槽）：

```js
(() => {
  const items = [...document.querySelectorAll('.pub-item')];
  const pick = (sel) => items
    .map((i) => i.querySelector(sel)?.getBoundingClientRect())
    .filter(Boolean);
  const ccf = pick('.pub-slot-ccf .ccf-badge');
  const link = pick('.pub-slot-link .pub-link');
  const spread = (rs, k) => Math.max(...rs.map(r => r[k])) - Math.min(...rs.map(r => r[k]));
  return {
    sides: document.querySelectorAll('.pub-side').length,
    items: items.length,
    ccfCount: ccf.length,
    linkCount: link.length,
    ccfLeftSpread: spread(ccf, 'left'),
    ccfRightSpread: spread(ccf, 'right'),
    linkLeftSpread: spread(link, 'left'),
    linkRightSpread: spread(link, 'right'),
  };
})()
```

- 四个 spread 均 ≤1px；另需单独量测 CCF 徽标**自身宽度**极差 <1px（FR-005 归一化项）：

```js
(() => {
  const ws = [...document.querySelectorAll('.pub-slot-ccf .ccf-badge')]
    .map((el) => el.getBoundingClientRect().width);
  return { ccfWidthSpread: Math.max(...ws) - Math.min(...ws) };
})()
```
- 当前数据下：`items = 135`、`sides = 128`（7 条两标签皆缺不渲染簇）、`ccfCount = 128`（58 条缺 CCF 但保留占位槽、7 条无簇）、`linkCount = 128`（10 条缺 LINK 但保留占位槽、7 条无簇）。
- 数据变化时以「sides = 非两标签皆缺条目数」为准，不硬套 128。

### 5. 年份标签与分组（US2 / FR-006 / FR-007 / SC-005 / SC-006）— 档位 1440 / 375px

1. **≥768px**：年份导航恰好 8 个标签，顺序 2026 → 2025 → 2024 → 2023 → 2022 → 2021 → 2020 → 2019 & Earlier；**不存在** 2011–2019 的任何独立标签。
2. 计数依次为 20 / 23 / 15 / 20 / 21 / 12 / 8 / 16，合计 135。
3. 列表只有 7 个独立年份分组标题 + 1 个「2019 & Earlier」分组标题；合并组内 16 条，所有分组组内均按 `date` 降序、同一日期按标题字符串字典序升序（不引入 locale 规则），每条仍显示自身「期刊名 · 年份」。
4. 分别点击 2020 标签与「2019 & Earlier」标签：分组标题完整露出、不被粘性导航遮挡（重点 320px 归入下节移动端核对）。
5. 合并组内条目形态与独立年份组完全一致（三档布局规则相同）。
6. EC-005 边界：2020 MUST 为独立标签与独立分组；2019 条目 MUST 仅出现在合并组、不单独成组。
7. 用 Console 核对组内日期非递增（空 `date` 视为末尾）且同一日期标题升序（不引入 locale 规则）：

```js
(() => {
  const groups = [...document.querySelectorAll('.year-group')];
  return groups.map((g) => {
    const ds = [...g.querySelectorAll('.pub-item')].map((i) => i.dataset.date || '');
    const ts = [...g.querySelectorAll('.pub-item .pub-title')].map((el) => el.textContent.trim());
    const sorted = ds.every((d, i) => {
      if (i === 0) return true;
      const prev = ds[i - 1];
      if (prev === '') return d === '';
      return d !== '' && prev >= d;
    });
    const titleSorted = ts.every((t, i) => i === 0 || ds[i - 1] !== ds[i] || ts[i - 1] <= t);
    return { id: g.id, sorted, titleSorted };
  });
})()
```

### 6. 手机年份导航（US2 / FR-008 / SC-007）— 档位 767 / 575 / 480 / 375 / 320px

1. 页面顶部**不出现可见的**年份导航或任何标签墙：`.year-nav` 计算样式为 `display: none`，可见数量为 0（DOM MUST 保留，不删除节点）。

```js
(() => {
  const nav = document.querySelector('.year-nav');
  const visible = nav ? getComputedStyle(nav).display !== 'none' : false;
  return { navPresent: Boolean(nav), navVisible: visible };
})()
```

期望 `navVisible === false` 且 `navPresent === true`（DOM MUST 保留）。

2. 8 个年份分组标题存在，滚动时依次吸顶于顶部粘性导航下方，显示该组计数（如 `2026 (20)`、`2019 & Earlier (16)`）；与导航下缘相接（间距 ≤4px）的吸顶标题数量同一时刻 ≤1，标题不遮挡论文标题或内容，分组结束时随分组滚出；`top` 与 `scroll-margin-top` 使用 T014 实测并记录的 H_m 常量。
3. 页面本身无横向滚动。**逐元素越界为权威判据**：`offenders` MUST 为空；`scrollWidth === clientWidth` 不构成无溢出证明（`body` 的 `overflow-x: hidden` 可能夹断该值），若 `scrollWidth !== clientWidth` 但 `offenders` 为空，仍需查明 `scrollWidth` 来源。检查：

```js
(() => {
  const vw = document.documentElement.clientWidth;
  const offenders = [...document.querySelectorAll('.pub-item, .pub-side, .pub-title, .pub-venue, .year-group h3')]
    .filter((el) => el.getBoundingClientRect().right > vw + 1)
    .map((el) => el.className || el.tagName);
  return {
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: vw,
    offenders,
  };
})()
```

`offenders` MUST 为空（权威判据）；若 `scrollWidth !== clientWidth` 但 `offenders` 为空，仍需查明 `scrollWidth` 来源。

4. ≥768px 档（768 / 1024 / 1280 / 1440px 均需核对）：标签自然换行、左对齐，无截断。

### 7. 两处一致与跨档无破损（US3 / FR-009 / FR-010 / SC-008）

1. 在同一视口分别打开 `/publications/` 与 `/`，核对条目三档形态一致（标题/期刊换行规则、标签双槽位置）。
2. 全档位两页均无：元素重叠、文字截断、内容溢出容器、非预期换行、页面横向溢出；§6 的逐元素边界脚本在两页各跑一次，`offenders` 均为空。
3. 主页无年份导航，不受年份合并影响；主页条目的排序与选取规则不变。

### 8. 日期数据与门禁（FR-011 / FR-012 / SC-009）

```bash
# 1) 口径：有链接必须填合法日期；无链接必须为空。期望 125 有值 / 10 空 / 0 违规 / 0 有链接无日期
node -e '
const d = require("./src/data/publications.json");
const okDate = (s) =>
  typeof s === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(s) &&
  !isNaN(new Date(s)) &&
  new Date(s).toISOString().slice(0, 10) === s;
const linkedWithoutDate = d.filter((p) => p.url && !p.date).length;
const bad = d.filter((p) => (p.url ? !okDate(p.date) : Boolean(p.date)));
console.log(
  "total", d.length,
  "withDate", d.filter((p) => p.date).length,
  "empty", d.filter((p) => !p.date).length,
  "bad", bad.length,
  "linkedWithoutDate", linkedWithoutDate
);
process.exit(bad.length || linkedWithoutDate ? 1 : 0);
'

# 2) 数据 diff 只允许新增 date（其余字段不得变化）
git diff -- src/data/publications.json src/content.config.ts

npm run check && npm run build                                       # 必须通过
```

- 数据 diff 仅含 `date` 字段与填写；`title` / `venue` / `year` / `ccf` / `url` / `featured` / `authors` 取值不变。
- 日期口径：正式出版日期优先 → 无正式出版日期时用上线日期 → 仅 arXiv 链接用 arXiv 首次提交日（v1）→ 无链接留空；有链接条目 MUST 填写。空值条目在组内排末尾（FR-007）。
- 无新增文件、无新增依赖（`package.json` / `package-lock.json` diff 为空）、无新增脚本。
- `CCFBadge.astro` 的改动应仅包含布局宽度声明（`min-inline-size` 等），`ccf-A/B/C` 的配色与字号不变。

## 实测记录（2026-10-23，Chromium 1440/1280/1024/768/767/700/576/575/480/375/320px）

- `.site-header` 高度（H_m）：452–767.98px = **63.39px**；325–451.98px = **93.47px**；≤324.98px = **135.86px**；≥768px = 63.39px。移动端 `top` 取上表对应值，`scroll-margin-top` = H_m + 8px，`line-height: 26px`（h3 盒高恒为 34px）。
- 桌面锚点：header 实测 63.39px，桌面基础 `scroll-margin-top: 84px` 保留；点击 2020 与合并标签后目标顶部 83.89 / 84.13px，未被遮挡。
- 条目矩阵：`items = 135`、`sides = 128`、`ccf = 128`、`link = 128`、空槽 54（`visibility: hidden` + `aria-hidden="true"`，其中可聚焦元素 0、`span` 占位）、两标签皆无 7 条；各档四类 spread 与 CCF 宽度极差均为 0.00px；CCF 槽基线偏差 ≥768px 为 1.00px、576–767px 为 0px，簇内中心偏差 0px，右缘与内容右缘偏差 0px。
- 分组：8 个（2026→2020 + `year-2019-earlier`），计数 20/23/15/20/21/12/8/16 合计 135，组内 `sorted` 全为 true；<768px `.year-nav` 为 `display: none`（DOM 保留 8 个节点）、吸顶标题高度恒 34px、与导航下缘相接的标题数 = 1。
- 溢出：两页十档逐元素 `getBoundingClientRect().right ≤ clientWidth`，`offenders = 0`，`scrollWidth === clientWidth`。
- 门禁：`npm run check && npm run build` 通过；日期覆盖 `total 135 / withDate 125 / empty 10 / bad 0 / linkedWithoutDate 0`。
- 数据说明：5 条源数据 DOI 指向他文（`文本后门攻击与防御综述`、`智能回复系统研究综述`、`Ranking and Sampling in Open-Domain Question Answering`、`文本情绪分析综述`、`一种面向大规模社会信息网络的多层社区发现算法`），Crossref 返回值不可用，日期按权威书目信息人工校正（CRAD 2024,61(1):221-242；信息安全学报 2020,5(1):20-34；EMNLP-IJCNLP 2019；CRAD 2018,55(1):30-52；计算机学报 2016,(1):169-182），`url` 未改动。
- `body { overflow-x: hidden }` 保留：可能夹断 `scrollWidth`，故验收以逐元素 `getBoundingClientRect()` 越界为权威判据。

## 预期结果（全部通过即特性达成）

- **SC-001 / SC-002 / SC-003**：三档视口下 100% 条目符合对应形态；无标签条目不出现空行；页面横向滚动为 0。
- **SC-004**：四类占用状态下同类标签左右边缘极差 ≤1px、CCF 标签自身宽度极差 <1px；两标签皆缺条目未保留空槽；覆盖全量条目，不抽样。
- **SC-005 / SC-006**：8 个标签、计数和 135、合并组 16 条且组内按 `date` 降序、无 2011–2019 独立分组；锚点定位不被遮挡。
- **SC-007**：<768px 顶部无年份导航，8 个分组标题吸顶且计数之和 135、无页面横向滚动；≥768px 标签自然换行。
- **SC-008**：十档视口下两处界面布局破损数 0、形态一致。
- **SC-009**：125 条有链接条目 `date` 合法、10 条无链接为空、`linkedWithoutDate = 0`、空值仅出现在无链接条目；构建与 CI 门禁通过；数据 diff 仅含 `date`；零新增依赖/脚本。
