# Quickstart: Team 页 PhD Candidates 双栏布局验证指南

**Date**: 2026-11-20 | **Spec**: [spec.md](./spec.md) | **布局契约**: [contracts/team-phd-two-column.md](./contracts/team-phd-two-column.md) | **视图实体**: [data-model.md](./data-model.md)

改动 = 表现层（`src/components/StudentGroup.astro` 的 PhD 分支 + scoped CSS）。数据、schema、其他组件与页面零改动；零新依赖、零新 JS。验证 = 机器门禁（`check` + `build`）+ 真实浏览器十一档视口矩阵 + 计数与对齐测量。

## 前置条件

- Node.js ≥ 22，仓库根目录已 `npm install`
- Chromium 系浏览器（Chrome / Edge）DevTools 响应式模式；测量脚本在 Console 执行

## 启动

```bash
npm run dev        # http://localhost:4321/team/
```

构建产物复核（最终验收前执行）：

```bash
npm run check && npm run build && npm run preview
```

## 1. 结构与计数（FR-001～FR-003 / FR-010 / SC-003）

在 `/team/` Console 执行：

```js
const rows = [...document.querySelectorAll('.phd-columns > ul > li')];
const cols = [...document.querySelectorAll('.phd-columns > ul')];
const visualCols = getComputedStyle(document.querySelector('.phd-columns')).gridTemplateColumns.split(' ').length;
console.log('行数', rows.length);                                  // 期望 9
console.log('DOM 列表数（n≥2 恒为 2；n=1 为 1）', cols.length);
console.log('视觉栏数（≥768px 期望 2；<768px 期望 1）', visualCols);
console.log('每栏条数', cols.map((c) => c.children.length));        // ≥768px 期望 [5, 4]
console.log('Since 数', document.querySelectorAll('.phd-columns .grade').length);        // 期望 6
console.log('链接数', document.querySelectorAll('.phd-columns .member-link').length);    // 期望 8
console.log('分组标题数', [...document.querySelectorAll('h3')].filter((h) => h.textContent.trim() === 'PhD Candidates').length); // 期望 1
console.log('姓名链接触点数', document.querySelectorAll('.phd-columns .student-name a').length); // 期望 0
```

逐条核对行序（左栏前 5、右栏后 4）与 [data-model.md §1](./data-model.md) 表格一致；9 条姓名各出现一次。

## 2. 两栏几何（US1 / FR-001 / SC-001）— 1920 / 1440 / 1280 / 1024 / 768px

```js
const ul = [...document.querySelectorAll('.phd-columns > ul')];
const r = ul.map((u) => u.getBoundingClientRect());
const top = ul.map((u) => u.querySelector('li').getBoundingClientRect().top);
const content = document.querySelector('.student-group').getBoundingClientRect();
console.log('宽度差', Math.abs(r[0].width - r[1].width));           // ≤1px
console.log('顶线差', Math.abs(top[0] - top[1]));                    // ≤1px
console.log('栏距', r[1].left - r[0].right);                        // 期望 32px
console.log('外缘', r[0].left - content.left, content.right - r[1].right); // 均 ≤1px
console.log('最长记录宽', Math.max(...[...document.querySelectorAll('.phd-columns li')].map((li) => li.getBoundingClientRect().width))); // ≤ 内容区宽/2 + 1
```

目视确认：除末行外两栏行数分布为 5 / 4，标题在栏上方横跨整宽，无空栏、无表头、无竖线。

## 3. 行内三槽与对齐（US2 / FR-004～FR-006 / SC-003 / SC-004）— 1440 与 768px

逐行确认视觉顺序为「姓名 → Since → 链接」；再按栏测量：

```js
const grid = [...document.querySelectorAll('.phd-columns > ul')];
for (const [i, ul] of grid.entries()) {
  const grades = [...ul.querySelectorAll('.grade')].map((e) => e.getBoundingClientRect());
  const links = [...ul.querySelectorAll('.member-link')].map((e) => e.getBoundingClientRect());
  const ulR = ul.getBoundingClientRect();
  const spread = (xs) => Math.max(...xs) - Math.min(...xs);
  console.log(`栏${i} Since 左缘差`, spread(grades.map((g) => g.left)));        // ≤1px
  console.log(`栏${i} 链接右缘差`, spread(links.map((l) => l.right)));          // ≤1px
  console.log(`栏${i} 链接右缘余差`, Math.abs(links[0].right - (ulR.right - 24))); // ≤1px
}
```

缺失字段专项：

- 季慧山行：无 `.member-link`、无空锚点；姓名不是链接；
- 李江楠 / 刘曦雨 / 刘正宵行：无 `.grade` 元素、无 "Since" 文本；该行链接仍右对齐；
- 全表无 `N/A`、`—`、`&nbsp;` 等占位文本（`li.textContent` 核对）。

跨区块姓名对齐（FR-008）：

```js
const phdName = document.querySelector('.phd-columns .student-name').getBoundingClientRect();
const gradName = document.querySelector('.grad-name').getBoundingClientRect();
console.log('姓名左缘差', Math.abs(phdName.left - gradName.left)); // ≤1px
```

## 4. 单栏退化（US3 / FR-002 / FR-009 / SC-002）— 767 / 576 / 481 / 480 / 375 / 320px

1. **列表数与视觉栏数**：DOM 中仍为 2 个 `<ul>`（切分与视口无关），但 `getComputedStyle(document.querySelector('.phd-columns')).gridTemplateColumns` 只解析出一列；视觉上 9 行自上而下、无半宽列、无空栏；两个 `<ul>` 之间无重复分隔线。
2. **767 / 576 / 481 / 480px（横向行）**：姓名居左、Since 紧随其后且跨行左缘差 ≤1px、链接贴右缘（与 `ul` 右缘 −24px 差 ≤1px）；任何行不得折行。可复用第 3 节脚本，按 `ul` 索引合并。
3. **375 / 320px（竖排）**：执行以下脚本，预期第 1 行姓名居左、Since 右对齐；链接独占第 2 行、左缘与姓名左缘对齐；季慧山行无链接节点（`no-link`）；无年级行无 `.grade` 节点。

```js
const rows = [...document.querySelectorAll('.phd-columns li')];
const spread = (xs) => Math.max(...xs) - Math.min(...xs);
const nameL = rows.map((li) => li.querySelector('.student-name').getBoundingClientRect().left);
const gradeR = rows.flatMap((li) => [...li.querySelectorAll('.grade')].map((g) => g.getBoundingClientRect().right));
const linkL = rows.flatMap((li) => [...li.querySelectorAll('.member-link')].map((a) => a.getBoundingClientRect().left));
console.log('Since 右缘差', spread(gradeR));                       // ≤1px
console.log('链接左缘与姓名左缘差', spread([...nameL, ...linkL]));  // ≤1px（各行均同线）
console.log('链接是否在姓名下一行', rows.map((li) => {
  const n = li.querySelector('.student-name').getBoundingClientRect();
  const a = li.querySelector('.member-link');
  return a ? a.getBoundingClientRect().top > n.bottom : 'no-link';
}));
```

4. 六档均无重叠、截断、溢出与页面横向滚动。

## 5. 无破损与横向溢出（FR-012 / SC-005）— 全部 11 档

每档执行：

```js
console.log('页面横向溢出', document.documentElement.scrollWidth - window.innerWidth); // ≤0
const bad = [...document.querySelectorAll('main *')].filter((el) => {
  const r = el.getBoundingClientRect();
  return r.width > 0 && (r.left < -0.5 || r.right > window.innerWidth + 0.5);
});
console.log('越界元素数', bad.length); // 期望 0
```

目视复核：无元素重叠、无文字截断、无非预期换行（<480px 的竖排两行是既定形态）、无横向滚动条。

## 6. 零回归（FR-011 / SC-006）

1. **Master's Students**：占位文案 "Master's students coming soon." 原样显示，样式与现状一致（无 `.phd-columns` 结构、无两栏）。
2. **Graduates**：五列桌面形态、<768px 三段式、14 条内容与 24px 内距均无变化。
3. **范围**：`git diff --stat` 仅显示 `src/components/StudentGroup.astro` 与 `specs/010-*`；`src/data/students.json`、`src/pages/team.astro`、`src/styles/global.css`、`src/content.config.ts` diff 为空。

## 7. 机器门禁（FR-012 / SC-006）

```bash
npm run check      # 类型与 schema 校验通过（数据未改）
npm run build      # 静态构建通过（CI 同口径）
```

## 8. 实现期实测校核（research R3）

在 768px 档读取三个槽位的实际宽度并写入代码注释 / `evidence/layout-verification.md`：

```js
const li = document.querySelector('.phd-columns li');
console.log('姓名槽', document.querySelector('.student-name').getBoundingClientRect().width);
console.log('Since 文本宽', document.querySelector('.grade').getBoundingClientRect().width);
console.log('链接占用宽', document.querySelector('.member-link').getBoundingClientRect().width);
console.log('行内可用宽', li.getBoundingClientRect().width - 48);
```

判据：三槽合计 + 16px 间隙 ≤ 行内可用宽（否则链接或姓名将换行，属缺陷）；`Homepage ↗` 需完整落在第三列内。若 Since 文本超出 5em，将 5em 收紧为「实测 Since 宽 + 4px」；若 `Homepage ↗` 仍超出第三列，再将列间隙由 8px 收至 4px；仍不足则记录实测值并上报。MUST NOT 反向增大 5em 轨道、缩小字号或换行标签。

## 预期结果（全部通过即特性达成）

- 9 条记录、2 栏 5 + 4、6 个 Since、8 个链接，标题唯一；
- 两栏宽度差、顶线差、横向态 Since 左缘差与链接右缘差、竖排态 Since 右缘差与链接左缘差、跨区块姓名差均 ≤1px；
- 11 档视口下形态切换正确（768px 两栏 / 767px 单栏横向 / 479px 及以下竖排），破损与横向溢出计数为 0；
- Master's、Graduates 与其他页面零回归；`check` + `build` 通过；源文件 diff 仅 `StudentGroup.astro`。
