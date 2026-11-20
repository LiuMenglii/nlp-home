# Quickstart: Publications 链接修复与 CCF 等级标注验证指南

**Date**: 2026-11-19 | **Spec**: [spec.md](./spec.md) | **数据契约**: [contracts/publications-data.md](./contracts/publications-data.md) | **CCF 表**: [contracts/ccf-rating.md](./contracts/ccf-rating.md) | **DOM 契约**: [contracts/publication-item-dom.md](./contracts/publication-item-dom.md)

改动 = 数据治理（`src/data/publications.json` 的 `url` / `ccf` / 随链接增删的 `date`）+ 一处 DOM 真实性修复（`PublicationItem.astro`）+ 一条 schema refine（`content.config.ts`）。零新依赖、零运行时 JS、零版式改动。

## 前置条件

- Node.js ≥ 22，仓库根目录已 `npm install`
- 已确认基线：`npm run check` + `npm run build` 在数据与组件改动前通过
- 浏览器 DevTools 响应式模式（可精确设定视口宽度）
- 一次性审计脚本只在本地运行，不提交；`evidence/` 下的 Markdown 记录随特性提交

## 启动

```bash
npm run dev
# Publications 页：http://localhost:4321/nlp-home/publications/
# 主页概览：    http://localhost:4321/nlp-home/
```

最终验收前：

```bash
npm run check && npm run build
```

## 1. 构建门禁（FR-020 / SC-007）

```bash
npm run check && npm run build
```

期望：两条命令退出码 0，无新增依赖、无构建配置改动。

## 2. 数据门禁（FR-001～FR-018 / SC-004 / SC-005）

在仓库根目录运行：

```bash
node --input-type=module - <<'JS'
import { readFileSync } from 'node:fs';

const pubs = JSON.parse(readFileSync('src/data/publications.json', 'utf8'));
const fail = [];

const norm = (v) => {
  const s = v.trim().toUpperCase();
  const alias = {
    'IEEE ICME': 'ICME',
    'IEEE TRANSACTIONS ON AUDIO, SPEECH AND LANGUAGE PROCESSING': 'TASLP',
    'IEEE/ACM TRANSACTIONS ON AUDIO, SPEECH AND LANGUAGE PROCESSING': 'TASLP',
    'IEEE TRANSACTIONS ON INFORMATION FORENSICS AND SECURITY': 'TIFS',
  };
  return alias[s] ?? s;
};

const A = new Set(['AAAI','ACL','CVPR','NEURIPS','SIGIR','ICCV','ICLR','ACM MM','TOIS','TIFS','计算机学报','计算机研究与发展']);
const B = new Set(['EMNLP','COLING','NAACL','ECAI','ECCV','ICME','ICASSP','ICMR','CIKM','WSDM','DASFAA','TASLP','TCSVT','TOMM','信息安全学报']);
const C = new Set(['CVMJ','KNOWLEDGE-BASED SYSTEMS']);

const expected = (p) => {
  const v = norm(p.venue);
  if (v.startsWith('FINDINGS')) return null;
  if (v === 'WWW') return p.year === 2015 ? null : 'A';
  if (v === 'IJCAI') return p.year >= 2026 ? 'B' : 'A';
  if (v === 'CVMJ') return p.year >= 2026 ? 'B' : 'C';
  if (A.has(v)) return 'A';
  if (B.has(v)) return 'B';
  if (C.has(v)) return 'C';
  return null;
};

const dist = { A: 0, B: 0, C: 0, none: 0 };
for (const p of pubs) {
  if (p.url === null) fail.push(`url 为 null: ${p.title}`);
  if (p.ccf === null) fail.push(`ccf 为 null: ${p.title}`);
  if (p.url && !p.date) fail.push(`url 无 date: ${p.title}`);
  if (!p.url && p.date) fail.push(`date 无 url: ${p.title}`);
  if (p.url && !p.url.startsWith('https://')) fail.push(`非 HTTPS: ${p.title}`);
  if (p.ccf && !['A', 'B', 'C'].includes(p.ccf)) fail.push(`非法 ccf: ${p.title}`);
  const exp = expected(p);
  if ((p.ccf ?? null) !== exp) {
    fail.push(`CCF 不符: ${p.title} | venue=${p.venue} year=${p.year} | data=${p.ccf ?? '无'} expected=${exp ?? '无'}`);
  }
  dist[p.ccf ?? 'none']++;
}

console.log(`entries=${pubs.length} url=${pubs.filter((p) => p.url).length}`);
console.log(`A=${dist.A} B=${dist.B} C=${dist.C} none=${dist.none}`);
if (pubs.length !== 135) fail.push(`条目数 ${pubs.length} != 135`);
if (dist.A !== 66 || dist.B !== 48 || dist.C !== 3 || dist.none !== 18) {
  fail.push('分布不符：期望 A=66 B=48 C=3 none=18');
}
if (fail.length) {
  console.error(fail.join('\n'));
  process.exit(1);
}
console.log('DATA GATE PASS');
JS
```

关键抽查（脚本已覆盖，也可人工确认）：

| 用例 | 期望 |
|------|------|
| 2025 年 IJCAI | `ccf: "A"` |
| 2026 年 IJCAI | `ccf: "B"` |
| Findings of ACL 2021 | 无 `ccf` 字段 |
| 信息安全学报 2020 | `ccf: "B"` |
| CVMJ 2024 / 2025 | `ccf: "C"` |
| Knowledge-Based Systems 2025 | `ccf: "C"` |
| WWW 2015 | 无 `ccf` 字段 |

## 3. 不可变字段检查（FR-008 / FR-019）

```bash
# 基线快照由 tasks.md T002 在改动前生成；此处不得重新从 HEAD 生成，
# 否则增量提交后基线会漂移（基线 commit SHA 记录于 evidence/verification.md）
test -s /tmp/publications-base.json || { echo "缺少基线快照：按 tasks.md T002 生成"; exit 1; }
node --input-type=module - <<'JS'
import { readFileSync } from 'node:fs';
const cur = JSON.parse(readFileSync('src/data/publications.json', 'utf8'));
const base = JSON.parse(readFileSync('/tmp/publications-base.json', 'utf8'));
const fail = [];
const key = (p) => `${p.title}\u0000${p.venue}\u0000${p.year}`;
const bmap = new Map(base.map((p) => [key(p), p]));
if (base.length !== cur.length) fail.push(`条目数 ${base.length} → ${cur.length}`);
for (const p of cur) {
  const b = bmap.get(key(p));
  if (!b) { fail.push(`身份新增/改动: ${p.title}`); continue; }
  const pairs = [
    ['title', p.title, b.title],
    ['venue', p.venue, b.venue],
    ['year', p.year, b.year],
    ['featured', p.featured ?? false, b.featured ?? false],
    ['authors', JSON.stringify(p.authors ?? null), JSON.stringify(b.authors ?? null)],
  ];
  for (const [field, a, c] of pairs) {
    if (JSON.stringify(a) !== JSON.stringify(c)) fail.push(`${field} 改动: ${p.title}`);
  }
}
if (fail.length) { console.error(fail.join('\n')); process.exit(1); }
console.log('IMMUTABLE FIELDS PASS');
JS
```

期望：`IMMUTABLE FIELDS PASS`；`git diff "$(cat /tmp/publications-base.sha)" -- src/data/publications.json`（对比基线 commit 与当前工作区，覆盖中途提交）只出现 `url`、`ccf`、`date` 三类键的变化。

## 4. 链接审计记录核对（FR-009 / SC-001～SC-003 / SC-008）

1. 打开 [evidence/link-audit.md](./evidence/link-audit.md)，确认表格数据行数为 135：

```bash
awk '/^\| [0-9]+ \|/{n++} END{print n}' specs/009-publication-link-ccf/evidence/link-audit.md
```

2. 逐条抽查（必须全部通过）：
   - 4 条中文论文：打开最终 DOI，落地页题名为《文本后门攻击与防御综述》《智能回复系统研究综述》《文本情绪分析综述》《一种面向大规模社会信息网络的多层社区发现算法》。
   - EMNLP 2019 `Ranking and Sampling in Open-Domain Question Answering`：打开 `https://doi.org/10.18653/v1/D19-1245`，题名一致。
   - 当前无链接的 10 条：`决定` 为 `新增` 的必须在数据中有 `url` 与 `date`；`保持无链接` 的必须无 `url`、无 `date`，且 `理由` 写明无法核实的原因与课题组负责人确认记录。
3. 检查所有 `来源类型=arXiv` 的行：`理由` 必须记录「未发现正式版本」或「正式版尚未上线」；若某条已有正式 DOI 仍保留 arXiv，判为失败（SC-001）。
4. 检查所有非 HTTPS 链接与 CNKI/万方/维普/百度学术平台页面（按 host 判定：`cnki.net`、`wanfangdata.com.cn`、`cqvip.com`、`xueshu.baidu.com`；DOI 中的 `cnki` 注册机构标识不算）：数量必须为 0。

## 5. CCF 审计记录核对（FR-010～FR-018 / SC-008）

打开 [evidence/ccf-audit.md](./evidence/ccf-audit.md)：

```bash
awk '/^\| [0-9]+ \|/{n++} END{print n}' specs/009-publication-link-ccf/evidence/ccf-audit.md
```

期望 135 行（表头含 `#` 编号列，`awk` 依赖 `| 数字 |` 行首）；每行有「目录版本」与「依据」；18 条无等级条目的「类型资格」必须写明 Findings / Companion，而不是「目录未收录」。

## 6. DOM 真实性门禁（FR-016 / FR-017 / SC-006）

构建后运行：

```bash
node --input-type=module - <<'JS'
import { readFileSync } from 'node:fs';

const pubs = JSON.parse(readFileSync('src/data/publications.json', 'utf8'));
const html = readFileSync('dist/publications/index.html', 'utf8').replace(/<style[\s\S]*?<\/style>/g, '');
const articles = [...html.matchAll(/<article class="pub-item"[\s\S]*?<\/article>/g)].map((m) => m[0]);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fail = [];
const dist = { A: 0, B: 0, C: 0 };

for (const a of articles) {
  const badges = [...a.matchAll(/class="ccf-badge ccf-([ABC])"/g)].map((m) => m[1]);
  if (badges.length > 1) fail.push('单条出现多个 CCF 徽标');
  if (badges[0]) dist[badges[0]]++;
  const anchors = (a.match(/<a class="pub-link"/g) || []).length;
  if (anchors > 1) fail.push('单条出现多个 .pub-link');
  const stripped = a.replace(/<a class="pub-link"[\s\S]*?<\/a>/g, '');
  if (stripped.includes('Link ↗')) fail.push('存在不在锚点内的 Link ↗ 文本');
}

for (const p of pubs.filter((p) => p.url)) {
  const a = articles.find((x) => x.includes(esc(p.title)));
  if (!a) {
    fail.push(`未找到有链接条目: ${p.title}`);
    continue;
  }
  const hrefs = [...a.matchAll(/<a\s[^>]*href="([^"]*)"/g)].map((m) => m[1]);
  if (hrefs.length !== 2) fail.push(`有链接条目锚点数 ${hrefs.length} != 2: ${p.title}`);
  if (hrefs.some((h) => h !== esc(p.url))) fail.push(`锚点 href 与 url 不一致: ${p.title}`);
}

for (const p of pubs.filter((p) => !p.url)) {
  const a = articles.find((x) => x.includes(esc(p.title)));
  if (!a) fail.push(`未找到无链接条目: ${p.title}`);
  else if (/<a\s/.test(a)) fail.push(`无链接条目含锚点: ${p.title}`);
  else if (a.includes('Link ↗')) fail.push(`无链接条目含 Link 文本: ${p.title}`);
}

for (const p of pubs.filter((p) => !p.ccf)) {
  const a = articles.find((x) => x.includes(esc(p.title)));
  if (!a) fail.push(`未找到无等级条目: ${p.title}`);
  else if (/ccf-badge/.test(a)) fail.push(`无等级条目含徽标: ${p.title}`);
}

const anchors = (html.match(/<a class="pub-link"/g) || []).length;
console.log(`articles=${articles.length} badges=${dist.A + dist.B + dist.C} A=${dist.A} B=${dist.B} C=${dist.C}`);
console.log(`anchors=${anchors} urlEntries=${pubs.filter((p) => p.url).length}`);
if (articles.length !== 135) fail.push(`articles=${articles.length} != 135`);
if (dist.A !== 66 || dist.B !== 48 || dist.C !== 3) fail.push('徽标分布不符 66/48/3');
if (anchors !== pubs.filter((p) => p.url).length) fail.push('锚点数与有 url 条目数不符');
if (fail.length) {
  console.error(fail.join('\n'));
  process.exit(1);
}
console.log('DOM GATE PASS');
JS
```

另需人工确认：构建产物中不存在 `pub-slot--empty` 配合假徽标/假文案的节点；空槽内无文本。

## 7. 布局与响应式检查（SC-006 / SC-007 / Constitution VI）

```bash
npm run preview
```

在 `/nlp-home/publications/` 与 `/` 两处界面，按 **1440 / 1280 / 1024 / 768 / 767 / 576 / 575 / 480 / 375 / 320px** 十档视口 + 200% 缩放检查（重点关注 767 / 575 边界）：

1. 无元素重叠、文字截断、内容溢出、非预期换行、页面横向滚动。
2. 控制台量测槽位宽度：

```js
const widths = (sel) => [...document.querySelectorAll(sel)].map((e) => e.getBoundingClientRect().width);
const spread = (a) => (a.length ? Math.max(...a) - Math.min(...a) : 0);
console.log('CCF slot spread', spread(widths('.pub-slot-ccf')));
console.log('LINK slot spread', spread(widths('.pub-slot-link')));
console.log('page overflow', document.documentElement.scrollWidth - window.innerWidth);
console.log('overflowing items', [...document.querySelectorAll('.pub-item, .pub-side, .year-group h3')]
  .filter((e) => e.getBoundingClientRect().right > document.documentElement.clientWidth + 0.5).length);
```

期望：两个 spread 均 ≤1px；page overflow ≤0；overflowing items = 0。

3. 基线对齐沿用 [006 quickstart §1.3](../006-publications-responsive-layout/quickstart.md) 的口径：标签簇与条目首行文字基线偏差 ≤1px；若不满足，按 DOM 契约 §3 为两槽补相同 `min-block-size`，不得恢复假标签。

## 8. 范围与交付检查（SC-007 / SC-008）

```bash
git status --short
git diff --stat "$(cat /tmp/publications-base.sha)"
```

期望的源文件改动只有：

```text
src/components/PublicationItem.astro
src/content.config.ts
src/data/publications.json
```

外加 `specs/009-publication-link-ccf/` 下的规划产物与 `evidence/` 记录。不得出现 `publications.astro`、`index.astro`、`CCFBadge.astro`、`global.css` 或部署配置的改动。

最后把构建结果、数据门禁输出、DOM 计数、十档视口结论与基于基线 SHA 的 `git diff --stat` 记录到 [evidence/verification.md](./evidence/verification.md)。
