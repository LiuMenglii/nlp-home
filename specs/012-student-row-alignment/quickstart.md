# Quickstart: Team 页在读学生名单列布局调整验证指南

**Date**: 2026-11-22 | **Spec**: [spec.md](./spec.md) | **布局契约**: [contracts/student-row-alignment.md](./contracts/student-row-alignment.md) | **视图实体**: [data-model.md](./data-model.md)

改动 = 表现层（`src/components/StudentGroup.astro` 的行内 scoped CSS）。DOM、数据、排序/切分、其他组件与页面零改动；零新依赖、零新 JS。验证 = 机器门禁（`check` + `build`）+ 真实浏览器十一档视口矩阵 + 固定列宽 / 等隙 / 27px 偏左 / 右对齐 / 计数测量。

## 前置条件

- Node.js ≥ 22，仓库根目录已 `npm install`
- 使用当前智能体工具自带浏览器（页面缩放 100%、站点默认字体）；脚本在 Console 执行
- 记录字体环境与实测的 Since 文本宽度（决定 5em 或 5.5em，见 §1）

## 启动

```bash
npm run dev        # 打开 http://localhost:4321/nlp-home/team/（站点 base: '/nlp-home'）
```

构建产物复核（最终验收前执行）：

```bash
npm run check && npm run build && npm run preview
```

## 1. Since 列宽判定（FR-011 / SC-008，先做；在 ≥480px 视口执行，如 1440px）

```js
const grades = [...document.querySelectorAll('.phd-columns .grade, .master-columns .grade')];
const widths = grades.map((g) => +g.getBoundingClientRect().width.toFixed(2));
console.log('Since 条数', grades.length);                       // 30
console.log('Since 最大文本宽', Math.max(...widths));           // 5em 时须 ≤ 90；5.5em 时须 ≤ 99
console.log('Since 行高', [...new Set(grades.map((g) => +g.getBoundingClientRect().height.toFixed(1)))]); // [29.7] 单行
const li = document.querySelector('.phd-columns li');
console.log('实际轨道', getComputedStyle(li).gridTemplateColumns); // "63px 90px 117px" 或 "63px 99px 117px"
```

**预期**：最大文本宽 ≤ Since 列宽。若 5em（90px）下出现超宽或折行，把 PhD 与 Master's 的 Since 列同时改为 5.5em（99px）后复测；5.5em 仍超宽则按缺陷停止验收，不得折行、缩字号或截断。

## 2. 结构与计数（FR-006 / FR-007 / SC-005）

```js
const allRows = [...document.querySelectorAll('.phd-columns li, .master-columns li')];
console.log('总记录数', allRows.length);                                  // 期望 30
for (const g of ['.phd-columns', '.master-columns']) {
  console.log(g,
    '记录', document.querySelectorAll(`${g} li`).length,
    'Since', document.querySelectorAll(`${g} .grade`).length,
    '链接', document.querySelectorAll(`${g} .member-link`).length,
    '姓名链接', document.querySelectorAll(`${g} .student-name a`).length);
}
// 期望：PhD 19 / 19 / 4 / 0；Master's 11 / 11 / 0 / 0
console.log('Since 总数', document.querySelectorAll('.grade').length);    // 30
console.log('链接总数', document.querySelectorAll('.member-link').length); // 4
console.log('表头数', document.querySelectorAll('th').length);             // 0
```

逐条核对：名单顺序仍为年级升序（PhD 2021 → 2026，Master's 2024 → 2026）；≥768px 时 PhD 左 10 / 右 9、Master's 左 6 / 右 5；无 `N/A`、`—`、`&nbsp;` 等占位文本；姓名节点为纯文本。

## 3. 横向态：固定三列、等隙、27px 偏左（US1 / FR-002～FR-004 / SC-001 / SC-002）

在 **1920 / 1440 / 1280 / 1024 / 768 / 767 / 576 / 481 / 480px** 逐档执行（按整数视口宽度验收；CSS `max-width: 479.98px` 与 ≤479px 等价，带小数的视口不纳入；1920 / 1440 / 1280px 每行 `W` 同为 502px，可只详测 1440px）：

```js
const rows = [...document.querySelectorAll('.phd-columns li, .master-columns li')];
const report = rows.map((li) => {
  const lr = li.getBoundingClientRect();
  const [n, s, l] = getComputedStyle(li).gridTemplateColumns.split(' ').map(parseFloat);
  const contentLeft = lr.left + 24;
  const contentRight = lr.right - 24;
  const W = contentRight - contentLeft;
  const g = (W - n - s - l) / 2;
  const ge = li.querySelector('.grade')?.getBoundingClientRect();
  const link = li.querySelector('.member-link')?.getBoundingClientRect();
  const name = li.querySelector('.student-name')?.getBoundingClientRect();
  const sinceCenter = ge ? (ge.left + ge.right) / 2 : null;
  return {
    name: li.querySelector('.student-name')?.textContent,
    tracks: `${n}/${s}/${l}`,                                            // 63/90/117 或 63/99/117
    gapL: ge ? +((sinceCenter - s / 2) - (contentLeft + n)).toFixed(2) : null, // = g
    gapR: ge ? +((contentRight - l) - (sinceCenter + s / 2)).toFixed(2) : null, // = g
    sinceOffset: ge ? +(sinceCenter - (contentLeft + contentRight) / 2).toFixed(2) : null, // −27 ± 1
    nameLeftGap: name ? +(name.left - contentLeft).toFixed(2) : null,   // ≤ 1
    linkRightGap: link ? +(contentRight - link.right).toFixed(2) : null, // ≤ 1
    hasLink: !!link,
  };
});
console.table(report);
const spread = (xs) => Math.max(...xs) - Math.min(...xs);
console.log('轨道集合', [...new Set(report.map((r) => r.tracks))]);       // 单一值
console.log('两侧空白差最大', Math.max(...report.map((r) => Math.abs(r.gapL - r.gapR)))); // ≤ 1
console.log('最小列间空白', Math.min(...report.map((r) => r.gapL)));       // ≥ 8（768px：13 或 8.5）
console.log('Since 偏移集合', [...new Set(report.map((r) => Math.round(r.sinceOffset)))]); // [-27]
console.log('Since 偏移极差', spread(report.map((r) => r.sinceOffset)));   // ≤ 1
console.log('姓名左缘差最大', Math.max(...report.map((r) => Math.abs(r.nameLeftGap)))); // ≤ 1
console.log('链接右缘差最大', Math.max(...report.filter((r) => r.hasLink).map((r) => Math.abs(r.linkRightGap)))); // ≤ 1
```

**预期**：

- 九档下所有行（30 行）`tracks` 恒为同一组值（`63/90/117` 或 `63/99/117`），`gapL == gapR`（±1px），`gapL ≥ 8px`。
- 九档下所有行 `sinceOffset = −27px（±1px）`；同一栏内极差 ≤1px；有链接行与无链接行一致，不因链接标签宽窄移动。
- 链接右缘差 ≤1px、姓名左缘差 ≤1px；链接标签单行（高度 ≈29.7px）。
- 768px 最紧档：`gapL = gapR = 13px`（5em）或 `8.5px`（5.5em），无重叠；`sinceOffset` 仍为 −27px（5em / 5.5em 均成立）。
- 任何档位 MUST NOT 出现 `sinceOffset` 随视口或随链接标签变化的趋势；该值不要求接近 0，−27px 是通过条件。

## 4. 链接右缘与单行（FR-003 / SC-002）

```js
const links = [...document.querySelectorAll('.member-link')];
console.log('链接行高', links.map((a) => +a.getBoundingClientRect().height.toFixed(2))); // ≈29.7（单行）
console.log('链接宽度', links.map((a) => +a.getBoundingClientRect().width.toFixed(2)));  // 均 ≤117
console.log('链接行数', links.length);                                                   // 4（均在 PhD 左栏 ≥768px）
```

目视确认：链接标签 `Homepage / GitHub / Scholar ↗` 均单行、右缘与同栏其他链接同线；姓名无锚点、不越入 Since 列。

## 5. 竖排态：链接右对齐（US2 / FR-005 / SC-003）— 375 / 320px

```js
const rows = [...document.querySelectorAll('.phd-columns li, .master-columns li')];
const out = rows.map((li) => {
  const lr = li.getBoundingClientRect();
  const contentRight = lr.right - 24;
  const g = li.querySelector('.grade').getBoundingClientRect();
  const link = li.querySelector('.member-link')?.getBoundingClientRect();
  const name = li.querySelector('.student-name').getBoundingClientRect();
  return {
    name: li.querySelector('.student-name').textContent,
    sinceRightGap: +(contentRight - g.right).toFixed(2),          // ≤ 1
    hasLink: !!link,
    linkRightGap: link ? +(contentRight - link.right).toFixed(2) : null, // ≤ 1
    linkBelowName: link ? link.top > name.bottom - 1 : null,      // true：独占第 2 行
    rowHeight: +lr.height.toFixed(2),                             // 无链接 ≈47；有链接 ≈80（两行 + 4px 行间隙）
  };
});
console.table(out);
console.log('无链接行数', out.filter((r) => !r.hasLink).length);  // 26
console.log('有链接行数', out.filter((r) => r.hasLink).length);   // 4
```

**预期**：4 条 PhD 链接记录为两行、链接 `flex: 0 0 100%` 且 `text-align: right`，右缘与 Since 右缘同线（行内容右缘，差 ≤1px）；其余 26 条只有 1 行，无空链接行或占位；30 行的 Since 右缘与行内容右缘偏差均 ≤1px。

## 6. 无破损与横向溢出（FR-008 / SC-004）— 全部 11 档

```js
console.log('页面横向溢出', document.documentElement.scrollWidth - window.innerWidth); // 0
const bad = [...document.querySelectorAll('main *')].filter((el) => {
  const r = el.getBoundingClientRect();
  return r.width > 0 && (r.left < -0.5 || r.right > window.innerWidth + 0.5);
});
console.log('越界元素数', bad.length); // 0
```

逐档目视：无元素重叠、文字截断、内容溢出、非预期换行、横向滚动；<480px 的竖排两行与超长姓名换行属声明形态，不计入 SC-004 的「非预期换行」。

## 7. 边界与回归

### 7.1 超长姓名（768px，姓名列 63px）

```js
const li = document.querySelector('.phd-columns li');
const name = li.querySelector('.student-name');
const old = name.textContent;
name.textContent = 'AlexandertheGreatLongname';
const g = li.querySelector('.grade').getBoundingClientRect();
const n = name.getBoundingClientRect();
console.log('姓名右缘 ≤ Since 左缘', n.right <= g.left + 0.5);        // true
console.log('姓名列宽不变', +getComputedStyle(li).gridTemplateColumns.split(' ')[0].replace('px','')); // 63
console.log('行内无溢出', li.scrollWidth <= li.clientWidth);          // true
name.textContent = old;
```

**预期**：姓名在 63px 姓名列内换行（本期不验收换行形态），Since / 链接位置不变，页面无横向滚动。

### 7.2 缺年级 / 缺链接（必做；当前数据无缺年级，用一次性 DOM 注入，不改数据）

- 临时移除某行 `.grade`：不出现 "N/A" / "—" 占位；第 2 列仍保留 90 / 99px，姓名与链接位置不变。
- 移除某行 `.member-link`：第 3 列仍占 117px，该行 Since 位置与有链接行一致；无占位。
- 结果写入证据文件（T011）；不得修改 `students.json`。

### 7.3 结构与范围回归（FR-006 / FR-009 / SC-006）

```js
console.log('PhD 栏数', document.querySelectorAll('.phd-columns > ul').length);       // 2
console.log('Master 栏数', document.querySelectorAll('.master-columns > ul').length); // 2
console.log('PhD 每栏条数', [...document.querySelectorAll('.phd-columns > ul')].map((u) => u.children.length));       // [10, 9]
console.log('Master 每栏条数', [...document.querySelectorAll('.master-columns > ul')].map((u) => u.children.length)); // [6, 5]
```

- 两栏宽度差 / 顶线差 / 与 PhD 栏距差均 ≤1px（沿用 011 脚本）；`h3` 各 1 个；无表头、无竖线，`li` 无新增左右 `border` 或装饰节点。
- Graduates：五列桌面形态、<768px 三段式与 24px 内距无变化。
- 范围：`git status --porcelain` 应只显示 `M src/components/StudentGroup.astro` 与 `?? specs/012-student-row-alignment/`；`src/data/*.json`、`content.config.ts`、`team.astro`、`global.css`、`TeacherCard.astro`、Graduates 与 `package*.json` 零 diff。

## 8. 机器门禁（SC-006）

```bash
npm run check      # 类型检查通过
npm run build      # 静态构建通过（GitHub Pages 同口径）
```

合并前 CI、PR 与部署后线上检查按 [tasks.md T016](./tasks.md) 执行（宪法维护工作流）。

## 9. 证据记录

实现后在 `specs/012-student-row-alignment/evidence/layout-verification.md` 记录：字体环境与 Since 列宽判定（5em / 5.5em）、十一档视口的轨道宽 / 两侧空白 / Since 偏移 / 链接右缘 / 姓名左缘 / 竖排右缘 / 破损计数、计数与回归结果、`check` + `build` 输出、`git status` 与 `git diff --stat` 范围核对、缺年级 DOM 注入与装饰检查、数据逐项比对、PR/CI/部署后线上检查。测量口径与容差见 [契约 §7](./contracts/student-row-alignment.md)。

## 预期结果（全部通过即特性达成）

- 横向态：九档视口（480–1920px）30 行的三轨恒为 `63 / 90（或 99）/ 117px`；两侧空白相等且 ≥8px；Since 中心恒在行内容区中点左侧 27px（±1px），同栏极差 ≤1px；链接右缘差 ≤1px、标签单行；姓名贴左缘。
- 竖排态：375 / 320px 的 4 条链接记录第 2 行右对齐、右缘差 ≤1px；其余 26 条仅 1 行；Since 右缘差 ≤1px。
- 计数：30 条、30 个 Since、4 个链接、PhD 10+9、Master's 6+5；字号不变。
- 十一档破损与横向溢出计数为 0；PhD / Master's / Graduates 结构零回归；`check` + `build` 通过；源文件仅 `StudentGroup.astro` 样式改动。
