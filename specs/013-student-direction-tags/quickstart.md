# Quickstart: Team 页在读学生研究方向标签验证指南

**Date**: 2026-11-22 | **Spec**: [spec.md](./spec.md) | **数据契约**: [contracts/students-data.md](./contracts/students-data.md) | **行布局契约**: [contracts/team-row.md](./contracts/team-row.md) | **数据模型**: [data-model.md](./data-model.md)

改动 = 数据字段（`students.json`）+ 数据校验（`content.config.ts`）+ 行渲染与样式（`StudentGroup.astro`）+ 维护文档（`src/data/README.md`）。零新依赖、零新 JS、零新组件。验证 = 机器门禁 + 数据违约构建用例 + 31 名学生链接审计 + 九档真实浏览器视口测量 + 回归范围核对。

## 前置条件

- Node.js ≥ 22，仓库根目录已 `npm install`
- 使用当前智能体工具自带浏览器（页面缩放 100%、站点默认字体）；脚本在 Console 执行
- 已按 [spec.md](./spec.md) 完成数据、组件、schema 与 README 改动
- 链接核实需要浏览器与公开资料；逐条核实，不凭搜索摘要或同名判断；不要求单独证据文件

## 启动

```bash
npm run dev        # 打开 http://localhost:4321/nlp-home/team/（站点 base: '/nlp-home'）
```

构建产物复核（最终验收前执行）：

```bash
npm run check && npm run build && npm run preview
```

## 1. 数据契约检查（FR-001 / FR-002 / FR-009 / FR-015）

在仓库根目录执行：

```bash
node -e "
const fs = require('node:fs');
const students = JSON.parse(fs.readFileSync('src/data/students.json', 'utf8'));
const byLevel = (level) => students.filter((s) => s.level === level);
const linkFields = (s) => ['url', 'github', 'scholar'].filter((k) => s[k]);
console.log('总记录', students.length);                       // 31
console.log('PhD / Master', byLevel('phd').length, byLevel('master').length); // 20 / 11
console.log('directions 缺失/空', students.filter((s) => !Array.isArray(s.directions) || s.directions.length === 0).map((s) => s.name));
console.log('directions 空白项', students.filter((s) => s.directions?.some((d) => typeof d !== 'string' || !d.trim())).map((s) => s.name));
console.log('grade 残留', students.filter((s) => 'grade' in s).map((s) => s.name));
console.log('多链接', students.filter((s) => linkFields(s).length > 1).map((s) => s.name));
console.log('非 https', students.flatMap((s) => linkFields(s).map((k) => [s.name, s[k]])).filter(([, u]) => !u.startsWith('https://')));
console.log('无链接', students.filter((s) => linkFields(s).length === 0).map((s) => s.name));
console.log('标签总数', students.reduce((n, s) => n + (s.directions?.length ?? 0), 0));
"
```

**预期**：

- 总记录 31；PhD 20、Master's 11。
- `directions 缺失/空`、`directions 空白项`、`grade 残留`、`多链接`、`非 https` 均为空数组（`grade 残留` 仅作数据检查，不要求构建失败）。
- 当前每条 `directions` 为 `["TBD"]`，标签总数 31。
- `无链接` 列表与完成报告中的名单一致（实施前为 15 人，链接补全后以审计结果为准）。

## 2. 构建失败用例（FR-009 / SC-004）

以下用例逐个执行。每个用例开始前备份、结束后恢复；MUST NOT 把临时数据提交。

```bash
cp src/data/students.json /tmp/students.json.bak
trap 'cp /tmp/students.json.bak src/data/students.json' EXIT
```

| # | 临时改动 | 期望 |
| --- | --- | --- |
| 1 | 删除某条记录的 `directions` | `npm run build` 失败，错误含 `src/data/students.json`、该学生姓名、`directions` |
| 2 | `directions = []` | 同上，含「至少 1 项」 |
| 3 | `directions = ""`（非数组） | 同上，含 `directions` |
| 4 | `directions = [""]` | 同上，含项序号 |
| 5 | `directions = ["   "]` | 同上，含项序号 |
| 6 | `directions = [123]` | 同上，含项序号 |
| 7 | 同时填 `url` 与 `github` | 失败，错误含姓名与全部冲突字段（既有 `singleLinkRefiner`） |

示例（用例 1）：

```bash
cp src/data/students.json /tmp/students.json.bak
node -e "const fs=require('node:fs');const p='src/data/students.json';const s=JSON.parse(fs.readFileSync(p,'utf8'));delete s[0].directions;fs.writeFileSync(p,JSON.stringify(s,null,2)+'\n')"
npm run build; echo "expected failure, exit=$?"
cp /tmp/students.json.bak src/data/students.json
```

**预期**：每次构建 MUST 失败；错误信息能直接定位文件、学生与字段；恢复后 `npm run build` MUST 通过。记录每个用例的实际错误首行。

## 3. 成员链接审计（US4 / FR-015～FR-019 / SC-006 / SC-007）

### 3.1 待审计清单

```bash
node -e "
const s = require('./src/data/students.json');
console.table(s.map((x) => ({
  name: x.name,
  level: x.level,
  url: x.url ?? '',
  github: x.github ?? '',
  scholar: x.scholar ?? '',
  chosen: x.url ? 'Homepage' : x.github ? 'GitHub' : x.scholar ? 'Scholar' : '—',
})));
"
```

### 3.2 逐条核实

对 31 名学生逐一执行：

1. 先搜索自建个人主页（含 GitHub Pages 学术主页），再查机构个人资料页、GitHub、Google Scholar。
2. 打开候选页面，确认至少一项强关联证据：中科院信工所 / 国科大 / G3（CIGMA）/ 在读层次 / 导师，或与课题组成员合作的论文。
3. 仅姓名相同、无法确认身份的页面 MUST NOT 写入。
4. 按「自建主页 → 机构个人资料页 → GitHub → Scholar」选择唯一来源；`url` 承载前两类，`github` / `scholar` 各承载后两类。
5. 现有链接全部重新核实；找到更高优先级来源时替换并删除低优先级字段；失效或不属于本人的移除。
6. 无可靠来源时 `url` / `github` / `scholar` 全部为 `null`，页面不显示链接标签；仅有 HTTP 版本的主页也视为无链接。

### 3.3 无链接学生

不新增单独证据文件。逐条核实后，将「无链接学生」及已排查来源列入完成报告，供课题组人工补充（SC-007）。

## 4. 九档视口布局验收（US1 / US3 / FR-003～FR-008 / SC-001～SC-003）

在 **1920 / 1440 / 1280 / 1024 / 768 / 576 / 480 / 375 / 320px** 逐档执行（1920 / 1440 / 1280px 行宽相同，可详测 1440px）：

```js
const rows = [...document.querySelectorAll('.phd-columns > ul > li, .master-columns > ul > li')];
const textRect = (el) => {
  const r = document.createRange();
  r.selectNodeContents(el);
  return r.getBoundingClientRect();
};
const overlap = (a, b) =>
  a && b && a.left < b.right - 0.5 && b.left < a.right - 0.5 &&
  a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;
const report = rows.map((li) => {
  const lr = li.getBoundingClientRect();
  const contentLeft = lr.left + 24;
  const contentRight = lr.right - 24;
  const name = li.querySelector('.student-name');
  const group = li.querySelector('.direction-tags');
  const link = li.querySelector('.member-link');
  const tags = [...li.querySelectorAll('.direction-tag')];
  const nr = name.getBoundingClientRect();
  const gr = group.getBoundingClientRect();
  const linkRect = link ? textRect(link) : null;
  return {
    name: name.textContent.trim(),
    tagCount: tags.length,
    tags: tags.map((t) => t.textContent).join('|'),
    nameLeftGap: +(nr.left - contentLeft).toFixed(2),
    groupAfterName: +(gr.left - nr.right).toFixed(2),
    linkRightGap: linkRect ? +(contentRight - linkRect.right).toFixed(2) : null,
    groupBeforeLink: linkRect ? +(linkRect.left - gr.right).toFixed(2) : null,
    linkBelowGroup: linkRect ? linkRect.top >= gr.bottom - 0.5 : null,
    overlapName: overlap(nr, gr),
    overlapLink: link ? overlap(gr, link.getBoundingClientRect()) : false,
    tagOverflow: tags.filter((t) => t.scrollWidth > t.clientWidth + 1).length,
    rowOverflow: li.scrollWidth > li.clientWidth + 1,
  };
});
console.table(report);
console.log('rows', rows.length, 'tags', document.querySelectorAll('.direction-tag').length);
console.log('Since nodes', document.querySelectorAll('.student-groups .grade').length);
console.log('year hits', rows.filter((li) => /\b(19|20)\d{2}\b/.test(li.textContent)).length);
console.log('page overflow', document.documentElement.scrollWidth > window.innerWidth);
console.log('role list groups', document.querySelectorAll('.direction-tags[role="list"][aria-label="Research directions"]').length);
```

**预期**：

- 九档下：`rows = 31`；`tags = 31`（当前每条一个 `TBD`，链接补全或方向替换后以数据为准）；`Since nodes = 0`；`year hits = 0`；`page overflow = false`；`role list groups = 31`。
- ≥480px：`nameLeftGap ≤ 1`；`groupAfterName ≥ 0`；有链接行 `groupBeforeLink ≥ 0`；`overlapName = false`、`overlapLink = false`；`tagOverflow = 0`；`rowOverflow = false`；有链接行 `linkRightGap ≤ 1`。
- <480px：有链接行 `linkBelowGroup = true`、`linkRightGap ≤ 1`；`overlapName = false`、`overlapLink = false`；`tagOverflow = 0`；`rowOverflow = false`。
- 768px 最紧档：标签组列宽约 96px，`TBD` chip 可单行放下；多标签时在组内逐行换行，不挤压姓名或链接。
- 逐档目视：无元素重叠、标签文本完整、无内容溢出、无页面横向滚动；375 / 320px 链接独占最后一行且文字右对齐。
- 页面横向溢出的失败判据为 `documentElement.scrollWidth > window.innerWidth`，MUST NOT 用差值等于 0 判定（竖向滚动条会使差值为负）。

### 4.1 两栏结构（FR-004 / SC-003）

分别在 **767px** 与 **768px** 执行：

```js
console.log('PhD 栏数', document.querySelectorAll('.phd-columns > ul').length);
console.log('PhD 每栏条数', [...document.querySelectorAll('.phd-columns > ul')].map((u) => u.children.length));
console.log('Master 每栏条数', [...document.querySelectorAll('.master-columns > ul')].map((u) => u.children.length));
const phdCols = document.querySelector('.phd-columns');
console.log('PhD 轨道', getComputedStyle(phdCols).gridTemplateColumns);
console.log('PhD 栏距', getComputedStyle(phdCols).columnGap);
const phdLists = [...document.querySelectorAll('.phd-columns > ul')];
const masterLists = [...document.querySelectorAll('.master-columns > ul')];
for (const [name, lists] of [['PhD', phdLists], ['Master', masterLists]]) {
  if (lists.length === 2) {
    const tops = lists.map((u) => +u.getBoundingClientRect().top.toFixed(2));
    console.log(name, '两栏顶线', tops, '差', +(tops[1] - tops[0]).toFixed(2));
  }
}
```

**预期**：767px 为 1 轨；768px 为 2 轨、`column-gap: 32px`，PhD 每栏 `[10, 10]`、Master's 每栏 `[6, 5]`；两栏顶线差 ≤1px。

## 5. 标签换行与长文本（Edge Cases / FR-006 / FR-007 / SC-003）

在 768px 或 480px 视口执行（不改数据，只临时改 DOM，测完恢复）：

```js
const group = document.querySelector('.direction-tags');
const tag = group.querySelector('.direction-tag');
const old = tag.textContent;
tag.textContent = 'ExtremelyLongResearchDirectionWithoutAnySpaces'.repeat(4);
const li = tag.closest('li');
console.log('tag scrollWidth / clientWidth', tag.scrollWidth, tag.clientWidth); // scrollWidth ≤ clientWidth + 1
console.log('row overflow', li.scrollWidth > li.clientWidth + 1);               // false
console.log('page overflow', document.documentElement.scrollWidth > window.innerWidth); // false
tag.textContent = old;
```

多标签收纳：

```js
const copies = Array.from({ length: 6 }, () => tag.cloneNode(true));
copies.forEach((c) => group.appendChild(c));
console.log('cloned tags', group.querySelectorAll('.direction-tag').length);      // 7
console.log('row height', tag.closest('li').getBoundingClientRect().height);     // 可增高
console.log('row overflow', tag.closest('li').scrollWidth > tag.closest('li').clientWidth + 1); // false
console.log('page overflow', document.documentElement.scrollWidth > window.innerWidth); // false
copies.forEach((c) => c.remove());
```

**预期**：长标签在自身内部换行，文本完整可见，无省略号；标签数量增加时行高增高，姓名/链接不被覆盖，行与页面均无横向溢出。记录测量结果。

## 6. 回归与范围核对（FR-013 / SC-005）

```bash
git status --porcelain
git diff --stat
grep -rnE "\bgrade\b|Since " src docs --include='*.json' --include='*.ts' --include='*.astro' --include='*.md' || true
grep -o 'role="listitem"' dist/team/index.html | wc -l
grep -n "Since" dist/team/index.html || true
```

**预期**：

- `git status --porcelain` 只显示 `M src/data/students.json`、`M src/content.config.ts`、`M src/components/StudentGroup.astro`、`M src/data/README.md` 与 `?? specs/013-student-direction-tags/`。
- `src` / `docs` 中无 `grade` / "Since" 残留（`specs/001`–`012` 历史归档不在检索范围）。
- `dist/team/index.html` 中 `role="listitem"` 数量 = 当前标签总数（31）；无 "Since"。
- `src/pages/team.astro`、`src/styles/global.css`、`src/data/teachers.json`、`src/data/graduates.json`、`src/data/publications.json`、`TeacherCard.astro`、`tests/news-widgets.test.mjs`、`package*.json`、`astro.config.mjs`、`.github/workflows/deploy.yml` 零 diff。
- 不做截图对比；上述源文件与数据文件零 diff 加 `npm run build` 通过即视为其他页面未受影响。Team 在读分组为预期变更区；Graduates 仍有 `year`，Faculty 卡片方向标签不变。

## 7. 验收记录

不新增证据文件。数据检查输出、6 + 1 个构建失败用例的实际错误首行、九档视口测量摘要、767/768px 两栏结构与顶线差、长标签/多标签测量、`check` + `build` 输出、`git status` / `git diff --stat` 范围核对、计数与回归结果，统一在完成报告与 PR 描述中汇总。

## 预期结果（全部通过即特性达成）

- 数据：31 条（PhD 20 / Master's 11），全部 `directions: ["TBD"]`，无 `grade`；每人至多一个链接字段非空，所有链接为 HTTPS 且有强关联证据；无链接学生留空并在完成报告中列出。
- 展示：Team 页两个在读分组每条记录显示至少 1 个 `TBD` 标签；两个在读分组内无 "Since" 与四位入学年份，全页 "Since" 为 0；标签组位于姓名与成员链接之间，顺序与数据一致。
- 布局：九档视口下无重叠、无标签截断、无内容溢出、无页面横向滚动；≥768px 两栏切分 PhD 10+10、Master's 6+5，两栏顶线差 ≤1px；<480px 链接独占最后一行且右对齐。
- 门禁：`npm run check` + `npm run build` 通过；6 + 1 个数据违约用例全部构建失败且错误可定位；回归范围仅 4 个源文件与 `specs/013-student-direction-tags/`，其他源文件与数据文件零 diff。
