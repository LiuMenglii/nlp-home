# Verification: Publications 链接修复与 CCF 等级完整标注

**Feature**: 009-publication-link-ccf | **Date**: 2026-11-20 | **Spec**: [spec.md](../spec.md)

本文件记录基线、构建门禁、数据门禁、DOM 计数、视口矩阵与 diff 范围。

## Baseline

### T001 构建基线（改动前）

| 命令 | 退出码 | 摘要 |
|------|--------|------|
| `npm run check` | 0 | 22 files；0 errors / 0 warnings / 0 hints |
| `npm run build` | 0 | 19 pages built；`output: "static"`；`Complete!` |

### T002 数据基线快照

- 基线 commit SHA：`c87e39d3776525351af7d094d23afc7aabe5278f`
- 快照文件：`/tmp/publications-base.json`（`git show HEAD:src/data/publications.json`）
- 快照条目数：135
- 说明：后续不可变字段与范围检查一律以该快照/SHA 为准，不重新从 HEAD 生成。

### T003 基线数据普查

```text
entries=135
url=125
hosts={"arxiv.org":59,"doi.org":66}
A=67 B=10 C=0 none=58
findingsACL=7 findingsEMNLP=10 www2015=1
nullUrl=0 nullCcf=0
```

与 spec 假设一致：135 条、125 条链接（66 DOI + 59 arXiv）、CCF 现状 A=67/B=10/C=0/无等级=58、17 条 Findings、1 条 WWW 2015 Companion。

## T020 LINK 槽实测

- 量测环境：内置浏览器（Chromium，视口 960×640，DPR=1），页面 `/nlp-home/publications/`
- `.pub-link`（`Link ↗`，`1rem`）自然宽度：**44.52px** → 向上取整写入 `min-inline-size: 45px`
- 与预期区间 45–47px 的差异：44.52px 略低于下限，属本机字体渲染差异；该区间仅作异常检测、不作硬性门槛
- 实测满槽 / 空槽宽度：`.pub-slot-link` 45px / 45px（差 0）；`.pub-slot-ccf` 59.66px / 59.66px（差 0）
- 契约更新：[publication-item-dom.md §3](../contracts/publication-item-dom.md)

## T023 十档视口 + 200% 缩放检查

**方法**：`npm run preview` 产物 `dist/` 由同源临时静态服务（`/tmp/vp-server.mjs`，不入库）承载，临时 harness 页面在 12 个固定宽度 iframe 中加载 `/nlp-home/publications/` 与 `/nlp-home/`（iframe 内 CSS 视口 = iframe 宽度，媒体查询按该宽度生效，与 DevTools 响应式模式等效）。量测脚本只读页面（`getBoundingClientRect` / `Range.getClientRects()[0].bottom`，006 口径）。200% 缩放以 CSS 视口折半模拟：1440→720、1280→640（布局只依赖 CSS 视口宽度）。

### Publications 页（`/nlp-home/publications/`，135 条）

| CSS 视口 | page overflow | overflowing items | 文字截断 | CCF 槽 spread | LINK 槽 spread | 基线偏差（标签簇 vs 首行文字） |
|----------|---------------|-------------------|----------|---------------|----------------|-------------------------------|
| 1440px | 0 | 0 | 0 | 0（59.66） | 0（45） | 0.67px |
| 1280px | 0 | 0 | 0 | 0（59.66） | 0（45） | 0.67px |
| 1024px | 0 | 0 | 0 | 0（59.66） | 0（45） | 0.67px |
| 768px | 0 | 0 | 0 | 0（59.66） | 0（45） | 0.67px |
| 767px | 0 | 0 | 0 | 0（59.66） | 0（45） | 0.67px |
| 576px | 0 | 0 | 0 | 0（59.66） | 0（45） | 0.67px |
| 575px | 0 | 0 | 0 | 0（59.66） | 0（45） | 不适用（第三行标签簇） |
| 480px | 0 | 0 | 0 | 0（59.66） | 0（45） | 不适用（第三行标签簇） |
| 375px | 0 | 0 | 0 | 0（59.66） | 0（45） | 不适用（第三行标签簇） |
| 320px | 0 | 0 | 0 | 0（59.66） | 0（45） | 不适用（第三行标签簇） |
| 720px（200% 缩放） | 0 | 0 | 0 | 0（59.66） | 0（45） | 0.67px |
| 640px（200% 缩放） | 0 | 0 | 0 | 0（59.66） | 0（45） | 0.67px |

- `<576px` 右对齐检查：`.pub-side` 右缘与条目右缘偏差 0px（全部 4 档）
- 槽位顺序：12 档全部为 CCF 左 / LINK 右，CCF–LINK 间距恒为 10px，0 例顺序异常
- 基线口径：≥768px 对照 `.pub-title` 首行；576–<768px 对照 `.pub-venue` 首行；偏差均 ≤0.67px（阈值 1px）

### 主页（`/nlp-home/`，精选 8 条）

| CSS 视口 | page overflow | overflowing items | 文字截断 | CCF 槽 spread | LINK 槽 spread | 基线偏差 |
|----------|---------------|-------------------|----------|---------------|----------------|----------|
| 1440 / 1280 / 1024 / 768 / 767 / 576 / 720 / 640px | 0 | 0 | 0 | 0（59.66） | 0（45） | 0px |
| 575 / 480 / 375 / 320px | 0 | 0 | 0 | 0（59.66） | 0（45） | 不适用（第三行标签簇） |

**结论**：T023 PASS。12 档宽度（含 767/575 边界与 200% 缩放等价视口）下无水平滚动、无条目溢出、无文字截断；两槽宽度 spread=0；标签簇基线偏差 ≤0.67px；`<576px` 右对齐偏差 0px。

## T025 最终门禁

| 门禁 | 命令 | 结果 |
|------|------|------|
| 类型检查 | `npm run check` | 0 errors / 0 warnings；退出码 0 |
| 构建 | `npm run build` | 19 pages built；`Complete!`；退出码 0 |
| 数据门禁 | quickstart.md §2 | `entries=135 url=135`、`A=66 B=48 C=3 none=18`、`DATA GATE PASS` |
| 不可变字段 | quickstart.md §3（基准 `/tmp/publications-base.json`） | `IMMUTABLE FIELDS PASS` |
| DOM 门禁 | quickstart.md §6（`/tmp/dom-gate.mjs`） | `articles=135`、`badges=117 (A=66 B=48 C=3)`、`linkAnchors=135`、`DOM GATE PASS` |

输出全文：`/tmp/final-gates.txt`；收敛复核（T028/T029）输出：`/tmp/final-gates-converge.txt`（一次性产物，不入库）。

## T026 最终汇总

### 构建与门禁

见 T025：`check` / `build` / 数据门禁 / 不可变字段 / DOM 门禁全部退出码 0。

### DOM 计数

- `articles=135`；`badges=117`（A=66 / B=48 / C=3）；`urlEntries=135`、`noUrlEntries=0`、`linkAnchors=135`
- 有 `url` 条目：标题锚点与 `.pub-link` 共 2 个同 href 锚点；当前已无无链接条目
- `Link ↗` 仅出现在 `.pub-link` 锚点内；无隐藏徽标/伪链接；无 `.pub-slot--empty`

### 视口矩阵

见 T023：Publications 页与主页在 1440/1280/1024/768/767/576/575/480/375/320px 及 720/640px（200% 缩放等价视口）共 12 档均 PASS。

### 改动范围（基线 `c87e39d3776525351af7d094d23afc7aabe5278f`）

```text
 src/components/PublicationItem.astro |  46 +++----
 src/content.config.ts                |  21 +++-
 src/data/publications.json           | 238 ++++++++++++++++++++++-------------
 3 files changed, 193 insertions(+), 112 deletions(-)
```

`git status --short`：3 个已修改源文件 + `?? specs/009-publication-link-ccf/`。无 `publications.astro`、`index.astro`、`CCFBadge.astro`、`global.css`、部署配置改动。

## T027 审计覆盖与成功标准复核

- `link-audit.md` 数据行 135；`ccf-audit.md` 数据行 135（`awk` 编号列计数）
- 链接构成：135 条全部有链接（125 DOI + 5 ACL Anthology + 1 CVF + 4 arXiv），0 条无链接
- 4 条 arXiv 行均写明理由：`#10`「未发现正式版本」（ICLR 2026）、`#16–18`「正式版尚未上线」（NeurIPS 2026）
- 18 条无等级条目的类型资格均为 Findings/Companion；2014 及以前 CIKM/WSDM 行注明按 B 处理

| 标准 | 结论 | 证据 |
|------|------|------|
| SC-001 | PASS | 135 条链接全部 HTTPS；arXiv→正式版替换 54 条；剩余 4 条 arXiv 均有理由；0 条指向无关论文/检索页 |
| SC-002 | PASS | 4 条中文论文均恢复为期刊官方 DOI 并通过题名核验（见 T028）；0 条 Hans/检索页链接 |
| SC-003 | PASS | EMNLP 2019 书籍 DOI 修正；10 条无链接条目全部审计（10 条补链，含 #21 AAAI 2025 补漏） |
| SC-004 | PASS | 数据门禁 `A=66 B=48 C=3 none=18` |
| SC-005 | PASS | 数据门禁的期望矩阵逐条比对 135/135，关键抽查全部覆盖并通过 |
| SC-006 | PASS | DOM 门禁通过；空槽无文本/隐藏节点；槽宽 59.66/45px spread=0 |
| SC-007 | PASS | 构建通过；10 档视口 + 200% 缩放检查通过；源文件改动仅 3 个预期文件 |
| SC-008 | PASS | 两表各 135 行；目录版本、类型资格、核验证据、无法核实理由齐全 |

## Convergence（T028 / T029）

### T028 4 条中文条目复核与链接恢复

课题组负责人确认的缺省规则：中文条目找不到准确链接时就不写链接。本次逐条复核 spec「已知缺陷与核验结果」表中的目标 DOI，4 条均找到且题名一致，故按 FR-004 以「替换」实现（而非移除）：

| 条目 | 最终 URL | 核验证据 | 决定 | date |
|------|----------|----------|------|------|
| 文本后门攻击与防御综述 · 计算机研究与发展 · 2023 | `https://doi.org/10.7544/issn1000-1239.202220340` | handle=1 → `https://crad.ict.ac.cn/cn/article/doi/10.7544/issn1000-1239.202220340`，官方页题名一致；Crossref 未收录该中文 DOI（Resource not found） | 替换 | 2024-01-01 |
| 智能回复系统研究综述 · 信息安全学报 · 2020 | `https://doi.org/10.19363/J.cnki.cn10-1380/tn.2020.01.03` | handle=1 → `https://link.cnki.net/doi/10.19363/J.cnki.cn10-1380/tn.2020.01.03`，落地页题名一致；URL 为期刊官方 DOI（`cnki` 仅注册机构标识） | 替换 | 2020-01-01 |
| 文本情绪分析综述 · 计算机研究与发展 · 2018 | `https://doi.org/10.7544/issn1000-1239.2018.20170055` | handle=1 → `http://crad.ict.ac.cn/CN/10.7544/issn1000-1239.2018.20170055`；官方页引文题名、卷期页码（2018, 55(1): 30-52）一致 | 替换 | 2018-01-01 |
| 一种面向大规模社会信息网络的多层社区发现算法 · 计算机学报 · 2016 | `https://doi.org/10.11897/SP.J.1016.2016.00169` | handle=1 → `http://cjc.ict.ac.cn/online/onlinepaper/ky-20151228131246.pdf`；官方 PDF 首页题名、卷期一致 | 替换 | 2016-01-01 |

- `date` 均取基线 `c87e39d3776525351af7d094d23afc7aabe5278f` 的原值，未改动 `title`/`venue`/`year`/`authors`/`featured`。
- `link-audit.md` 第 59/112/123/128 行已由「移除」改为「替换」，依据引用改为 FR-004。
- 复核后数据：`entries=135 url=135`、`url⇔date` 违规 0、非 HTTPS 0、`null` url/ccf 0。

### T029 来源类型枚举对齐

`link-audit.md` 第 10、16–18 行（保留 arXiv 的 4 条）「来源类型」由「出版社」改为「arXiv」，与 FR-009 的枚举一致。

### 收敛后门禁复跑

`npm run check`（0 errors/warnings）与 `npm run build`（19 pages，`Complete!`）退出码 0；数据门禁 `DATA GATE PASS`；不可变字段 `IMMUTABLE FIELDS PASS`；DOM 门禁 `articles=135 badges=117 (A=66 B=48 C=3) urlEntries=135 noUrlEntries=0 linkAnchors=135 DOM GATE PASS`；两审计表各 135 行；非 HTTPS=0、CNKI/万方/维普/百度学术平台 host=0。
