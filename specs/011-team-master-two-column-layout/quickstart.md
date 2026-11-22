# Quickstart: Team 页 Master's Students 双栏布局验证指南

**Date**: 2026-11-21 | **Spec**: [spec.md](./spec.md) | **布局契约**: [contracts/team-master-two-column.md](./contracts/team-master-two-column.md) | **视图实体**: [data-model.md](./data-model.md)

改动 = 表现层（`src/components/StudentGroup.astro` 的共享排序、Master's 分支与 scoped CSS）。数据、schema、PhD 分支 DOM/类名与其他组件/页面零改动；零新依赖、零新 JS。验证 = 机器门禁（`check` + `build`）+ 真实浏览器十一档视口矩阵 + 计数、排序、对齐与字号测量。

> 本指南按 spec Clarifications 2026-11-21 的最终规则编写（grade 升序、Since 显式 18px、姓名列弹性 + 第二列右移）。工作区 `evidence/layout-verification.md` 产生于澄清前，须在实现后按本指南整份重测。

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
const rows = [...document.querySelectorAll('.master-columns > ul > li')];
const cols = [...document.querySelectorAll('.master-columns > ul')];
const visualCols = getComputedStyle(document.querySelector('.master-columns')).gridTemplateColumns.split(' ').length;
console.log('行数', rows.length);                                  // 期望 11
console.log('DOM 列表数（n≥2 恒为 2；n=1 为 1）', cols.length);      // 期望 2
console.log('视觉栏数（≥768px 期望 2；<768px 期望 1）', visualCols);
console.log('每栏条数', cols.map((c) => c.children.length));        // ≥768px 期望 [6, 5]
console.log('Since 数', document.querySelectorAll('.master-columns .grade').length);      // 期望 11
console.log('链接数', document.querySelectorAll('.master-columns .member-link').length);  // 期望 0
console.log('分组标题数', [...document.querySelectorAll('h3')].filter((h) => h.textContent.trim() === "Master's Students").length); // 期望 1
console.log('姓名链接触点数', document.querySelectorAll('.master-columns .student-name a').length); // 期望 0
```

逐条核对升序行序（左栏 6：朱祉同、张蓓泽、叶振雷、艾明旭、刘润泽、刘梦犁；右栏 5：张蓬月、顾树焕、温泽林、李佳睿、毛乐平）与 [data-model.md §1](./data-model.md) 表格一致；11 条姓名各出现一次。

## 2. 两栏几何（US1 / FR-001 / SC-001）— 1920 / 1440 / 1280 / 1024 / 768px

```js
const ul = [...document.querySelectorAll('.master-columns > ul')];
const r = ul.map((u) => u.getBoundingClientRect());
const top = ul.map((u) => u.querySelector('li').getBoundingClientRect().top);
const content = document.querySelector('.student-group').getBoundingClientRect();
console.log('宽度差', Math.abs(r[0].width - r[1].width));           // ≤1px
console.log('顶线差', Math.abs(top[0] - top[1]));                    // ≤1px
console.log('栏距', r[1].left - r[0].right);                        // 期望 32px
console.log('外缘', r[0].left - content.left, content.right - r[1].right); // 均 ≤1px
console.log('最长记录宽', Math.max(...[...document.querySelectorAll('.master-columns li')].map((li) => li.getBoundingClientRect().width))); // ≤ 内容区宽/2 + 1
```

与 PhD 分组对比（US1 AS4）：

```js
const phdUl = [...document.querySelectorAll('.phd-columns > ul')];
console.log('与 PhD 栏宽差', Math.abs(ul[0].getBoundingClientRect().width - phdUl[0].getBoundingClientRect().width)); // ≤1px
console.log('与 PhD 栏距差', Math.abs((r[1].left - r[0].right) - (phdUl[1].getBoundingClientRect().left - phdUl[0].getBoundingClientRect().right))); // ≤1px
```

目视确认：6 / 5 分布、标题在栏上方横跨整宽，无空栏、无表头、无竖线。

## 3. 行内三槽、第二列右移与字号（US2 / FR-004～FR-006 / FR-013 / SC-004 / SC-007）— 1920、1440、1280、1024、768px

逐行确认视觉顺序为「姓名 → Since →（链接，若有）」；再按栏测量：

```js
for (const [i, ul] of [...document.querySelectorAll('.master-columns > ul')].entries()) {
  const grades = [...ul.querySelectorAll('.grade')].map((e) => e.getBoundingClientRect());
  const links = [...ul.querySelectorAll('.member-link')].map((e) => e.getBoundingClientRect());
  const spread = (xs) => Math.max(...xs) - Math.min(...xs);
  console.log(`栏${i} Since 左缘差`, spread(grades.map((g) => g.left))); // ≤1px（Master's 全无链接）
  console.log(`栏${i} Since 右尾隙`, Math.max(...grades.map((g) => ul.getBoundingClientRect().right - 24 - g.right))); // ≤8px
  console.log(`栏${i} 链接右缘差`, links.length > 1 ? spread(links.map((l) => l.right)) : 'n/a');
}
```

第二列随视口右移（在 768 / 1024 / 1280 / 1440 / 1920px 五档分别执行，记录 `.grade` 左缘）：

```js
console.log('Since 左缘', document.querySelector('.master-columns .grade').getBoundingClientRect().left);
// 768 ≤ 1024 ≤ 1280 ≤ 1440，且 1440 与 1920 相等（容器 1180px 上限 / 内容区 1132px 后保持不变）
```

字号（SC-007）：

```js
const grade = getComputedStyle(document.querySelector('.master-columns .grade'));
console.log('Since 字号', grade.fontSize);                         // 期望 18px（显式单位；根字号 16px 下 1rem 只有 16px）
const phdGrade = getComputedStyle(document.querySelector('.phd-columns .grade'));
console.log('PhD Since 字号', phdGrade.fontSize);                  // 期望 18px
```

缺失字段专项：

- 11 行均无 `.member-link`、无空锚点；姓名不是链接；
- 全表无 `N/A`、`—`、`&nbsp;` 等占位文本（`li.textContent` 核对）；
- 无年级的成员（当前无实例）不渲染 `.grade` 元素。

跨区块姓名对齐（FR-008）：

```js
const masterName = document.querySelector('.master-columns .student-name').getBoundingClientRect();
const phdName = document.querySelector('.phd-columns .student-name').getBoundingClientRect();
const gradName = document.querySelector('.grad-name').getBoundingClientRect();
console.log('与 PhD 姓名左缘差', Math.abs(masterName.left - phdName.left)); // ≤1px
console.log('与 Graduates 姓名左缘差', Math.abs(masterName.left - gradName.left)); // ≤1px
```

未来链接的 8px 间隙与右缘（FR-005 / FR-006，当前数据无链接）——在原页面临时注入两行链接后测量，随后刷新还原（不改数据文件）：

```js
// 克隆 PhD 分组既有链接以保留 Astro scoped 属性（类名 + data-astro-cid-*），
// 仅改 href 后追加到 Master's 行尾；刷新页面即还原。
const template = document.querySelector('.phd-columns .member-link');
[...document.querySelectorAll('.master-columns > ul')].forEach((ul) => {
  [...ul.querySelectorAll('li')].slice(0, 2).forEach((li) => {
    const a = template.cloneNode(true);
    a.href = 'https://example.com/';
    li.append(a);
  });
});
const linkRects = [...document.querySelectorAll('.master-columns > ul')].map((ul) => {
  const ulR = ul.getBoundingClientRect();
  const pairs = [...ul.querySelectorAll('li')]
    .filter((li) => li.querySelector('.member-link'))
    .map((li) => ({
      gradeRight: li.querySelector('.grade').getBoundingClientRect().right,
      linkLeft: li.querySelector('.member-link').getBoundingClientRect().left,
      linkRight: li.querySelector('.member-link').getBoundingClientRect().right,
    }));
  return {
    sinceLinkGap: pairs.map((p) => p.linkLeft - p.gradeRight),       // 均 8px ± 1px
    rightGap: pairs.map((p) => Math.abs(p.linkRight - (ulR.right - 24))), // ≤1px
  };
});
console.log('Since↔链接间隙 / 距栏右缘差', linkRects);
```

> PhD 存在「有链接 / 无链接」混排的栏：有链接行的 Since 会随链接宽度左移（与链接保持 8px），因此 Since 左缘同线只在链接槽占用一致的行组内判定；Master's 当前全无链接，第 3 轨宽 0，11 行 MUST 全同线。
>
> 竖排态（<480px）：在 375px 执行同一注入，测 `.member-link` 左缘与同行 `.student-name` 左缘差 ≤1px（FR-006）。

## 4. 单栏退化（US3 / FR-002 / FR-009 / SC-002）— 767 / 576 / 481 / 480 / 375 / 320px

1. **列表数与视觉栏数**：DOM 中仍为 2 个 `<ul>`（切分与视口无关），但 `getComputedStyle(document.querySelector('.master-columns')).gridTemplateColumns` 只解析出一列；视觉上 11 行自上而下、无半宽列、无空栏；两个 `<ul>` 之间无重复分隔线。
2. **767 / 576 / 481 / 480px（横向行）**：姓名居左并吸收余量（槽宽 ≥72px / 4em）、Since 紧随其后（固定槽 5.5em / 99px）且跨行左缘差 ≤1px；每条记录横跨内容区整宽；任何行不得折行。可复用第 3 节 Since 脚本并按两个 `ul` 合并。
3. **375 / 320px（竖排）**：第 1 行姓名居左、Since 右对齐；11 行均无链接节点，不渲染第 2 行；无占位。执行：

```js
const rows = [...document.querySelectorAll('.master-columns li')];
const spread = (xs) => Math.max(...xs) - Math.min(...xs);
const gradeR = rows.flatMap((li) => [...li.querySelectorAll('.grade')].map((g) => g.getBoundingClientRect().right));
console.log('Since 右缘差', spread(gradeR)); // ≤1px
console.log('无链接行数', rows.filter((li) => !li.querySelector('.member-link')).length); // 期望 11
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

1. **PhD Candidates**：`.phd-columns` 仍存在且为两栏（≥768px），19 条按升序 10 + 9 分布（2021 → 2026）；Since 19 条、链接 4 条（以当前数据文件为准）；行内顺序仍为姓名 → Since → 链接；Since 字号 18px；断点、栏距、三槽结构与 010 的测量脚本定位不变。
2. **Graduates**：五列桌面形态、<768px 三段式（定义见 `src/pages/team.astro` 的 `.graduate-list` 规则）、内容与 24px 内距均无变化。
3. **范围**：以 T001 记录的起点快照（`git status --porcelain`，HEAD 已含数据独立提交 `54f3b81`）为基线对比——本特性新增/修改仅 `src/components/StudentGroup.astro`（排序、Master's 分支与共享四项调整，含 480–767px Since 槽 `5em → 5.5em`）与 `specs/011-team-master-two-column-layout/`；`src/data/students.json` / `graduates.json` 的数据更新已在特性前单独提交，不属本特性、且本特性不得再产生数据文件 diff；`src/pages/team.astro`、`src/styles/global.css`、`src/content.config.ts` 相对起点零 diff。

## 7. 机器门禁（FR-012 / SC-006）

```bash
npm run check      # 类型与 schema 校验通过（数据未改）
npm run build      # 静态构建通过（CI 同口径）
```

## 8. 实现期实测校核（research R3）

在 768px 档读取 Master's 槽位实际宽度并写入代码注释 / `evidence/layout-verification.md`：

```js
const li = document.querySelector('.master-columns li');
console.log('姓名轨', document.querySelector('.master-columns .student-name').getBoundingClientRect().width);
console.log('Since 盒宽', document.querySelector('.master-columns .grade').getBoundingClientRect().width);
console.log('行内可用宽', li.getBoundingClientRect().width - 48); // 期望 296px
```

判据：三槽合计 + 16px 间隙 ≤ 行内可用宽（否则姓名或链接将折行，属缺陷）；当前无链接时第三轨宽 0，姓名轨 181px。若未来链接标签（18px）超过约 109px 导致姓名轨跌破 4em 或折行，按缺陷记录并上报；MUST NOT 反向缩小字号、换行标签或隐藏链接。

## 预期结果（全部通过即特性达成）

- 11 条记录、2 栏 6 + 5、升序排列、11 个 Since（18px）、0 个链接，标题唯一；
- 两栏宽度差、顶线差、横向态 Since 左缘差、竖排态 Since 右缘差、跨区块姓名差均 ≤1px；无链接行 Since 尾隙 ≤8px；注入链接后 8px 间隙与链接右缘差 ≤1px；
- Since 左缘在 768 → 1024 → 1440px 单调右移；
- 11 档视口下形态切换正确（768px 两栏 / 767px 单栏横向 / 479px 及以下竖排），破损与横向溢出计数为 0；
- PhD、Graduates 与其他页面零回归；`check` + `build` 通过；源文件 diff 仅排序、Master's 分支与共享四项调整（含 480–767px Since 槽 `5em → 5.5em`；数据更新已在特性前作为独立 commit `54f3b81` 提交）。
