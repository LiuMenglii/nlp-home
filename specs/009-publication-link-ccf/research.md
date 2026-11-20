# Research: Publications 链接修复与 CCF 等级完整标注

**Date**: 2026-11-19 | **Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

本特性无 `[NEEDS CLARIFICATION]` 遗留项（spec 状态为 Clarified）。以下 R1–R8 记录实现前必须确定的技术决策与依据。

---

## R1. 缺失 CCF / LINK 槽位的「仅样式占位」方案

**Decision**：`PublicationItem.astro` 在 `hasCcf || hasLink` 时始终渲染双槽容器 `.pub-side`，但槽内只在实际有值时渲染 `CCFBadge` 或链接锚点；缺失槽渲染**无子元素、无文本的空 `<span>`**，宽度由槽自身 CSS 预留：

```css
.pub-slot-ccf  { min-inline-size: 59.66px; }   /* 与 CCFBadge 的宽度归一化一致 */
.pub-slot-link { min-inline-size: <measured>px; justify-content: flex-end; }
```

删除现有 `visibility: hidden` 占位、隐藏的 `CCFBadge rating="A"` 与隐藏的 `<span class="pub-link">Link ↗</span>`。

**Rationale**：
- 满足 FR-016 / FR-017：无等级/无链接条目的 DOM 中不存在任何 `CCF-A/B/C` 文本或 `Link ↗` 文本，测试统计与内容抽取不会误读。
- 保留 006 建立的固定双槽列线：有标签条目的徽标与 Link 位置不变；两槽皆缺时仍不渲染 `.pub-side`，不产生空白第三行。
- 纯 CSS `min-inline-size` 是布局预留，不是内容伪造；空槽无 `aria-hidden` 需要（无内容）。

**Alternatives considered**：
- 保留隐藏真实徽标/链接（现状）：会在 DOM 产生伪造等级与文案，直接违反 FR-016 / FR-017 / SC-006，否决。
- 用 `::after { content: "Link ↗"; visibility: hidden }` 预留：伪元素内容仍属生成内容，语义上仍是「假文案」，且会进入部分内容抽取工具，否决。
- 用固定 `width` 而非 `min-inline-size`：字体或缩放下可能截断真实标签，且满槽宽度不受控，否决。

**宽度取值与风险**：
- CCF 槽：`59.66px`（既有 `CCFBadge` 的 `min-inline-size` 实测归一化值），空槽与满槽完全一致。
- LINK 槽：`Link ↗` 为 `1rem`（16px）文本，站点未加载 Web 字体，宽度随系统字体略有差异。实现期在真实浏览器中量测自然宽度并向上取整（预期 45–47px，仅作异常检测），把数值写入 [contracts/publication-item-dom.md](./contracts/publication-item-dom.md)；验收要求空槽与满槽宽度差 ≤1px（SC-006）。`justify-content: flex-end` 保证槽略宽时链接右缘仍与列线对齐。
- 基线风险：`.pub-item` 使用 `align-items: baseline`，空槽（无文本）没有真实基线。若浏览器对空 flex 子项的合成基线导致标签簇上下偏移，修复方式是为两个槽设置相同的 `min-block-size`（实测满槽高度），仍不引入任何文本；按 006 quickstart 的「首行基线偏差 ≤1px」口径验收。

---

## R2. 链接审计工具与网络能力

**Decision**：使用**一次性脚本**（Node 内置 `fetch` 或 Python 标准库 `urllib`，均不新增依赖、不入库）批量核验，人工复核争议条目：

1. **DOI 链接（66 条）**：调用 `https://api.crossref.org/works/{doi}` 取 `title` / `container-title` / `published`，与条目题名做归一化比较；同时访问 `https://doi.org/{doi}` 确认解析目标（允许付费墙、登录墙、403、验证码）。
2. **arXiv 链接（59 条）**：解析 arXiv ID，调用 `https://export.arxiv.org/api/query?id_list={id}` 取题名、`doi`、`journal_ref`；若存在正式 DOI，则经 Crossref 复核后按优先级替换；无正式版本则保留 arXiv。
3. **中文论文（4 条）**：Crossref 通常无记录（如 `10.7544/*` 返回 404），改用 `doi.org` 解析 + 期刊落地页题名/摘要核对；`10.19363/*` 经 `chndoi.org` 解析页确认题名；期刊站点的验证码/自动访问拦截不构成移除理由。
4. **无链接条目（10 条）**：用题名 + venue + year 组合检索出版商/论文集/DOI；仅在题名与书目元数据一致时补链。

**Probe 结果（2026-11-19）**：
- `api.crossref.org/works/10.18653/v1/D19-1245` 返回 200，题名 `Ranking and Sampling in Open-Domain Question Answering` 与条目一致，可作为错误书籍 DOI 的替换依据。
- `export.arxiv.org/api/query?id_list=2508.18651` 返回 200 且包含 `<entry>`，arXiv API 可用；该条目无 `journal_ref`。
- `10.7544/issn1000-1239.202220340` 解析到 `https://crad.ict.ac.cn/cn/article/doi/...`，官方文章页题名为「文本后门攻击与防御综述」。
- `10.7544/issn1000-1239.2018.20170055` 由 doi.org 302 到 `http://crad.ict.ac.cn/CN/...`，随后被站点验证码拦截（`/captcha/page`）；`doi.org/api/handles/...` 返回 `responseCode: 1`，目标即该期刊文章页。验证码属自动化访问限制，不判错。
- `10.11897/SP.J.1016.2016.00169` 在本环境直接请求 doi.org 返回 HTTP 600（`DOI Cannot Connect to Server`），但 handle API 返回 `responseCode: 1`，目标为 `http://cjc.ict.ac.cn/online/onlinepaper/ky-20151228131246.pdf`；该官方 PDF 首页含「多层社区发现」及作者「林政、王伟平」，确认同一篇论文。**doi.org 600/连接失败不等于 DOI 错误**，不得据此移除。
- `10.19363/J.cnki.cn10-1380/tn.2020.01.03` 经 `chndoi.org` 解析页出现「智能回复系统研究综述」，题名匹配。
- 全部 125 条现有链接的 host 只有 `doi.org`（66）与 `arxiv.org`（59），无 HTTP、无第三方检索页，审计面收敛。

**Rationale**：Crossref / arXiv API 提供权威书目元数据，能稳定支持「同一篇论文」判定；一次性脚本避免把审计基础设施沉淀为长期维护负担（Constitution V）。

**Alternatives considered**：
- 纯人工逐条打开 125 条链接：易漏、不可复现，否决。
- 引入 Playwright / 爬虫框架：新增依赖且超出一次性需求，否决。
- 只依赖 DOI 解析状态不看元数据：会放过「DOI 可解析但指向另一篇论文」的错误（如现有 5 条缺陷），否决。

---

## R3. 链接替换 / 保留判定规则

**Decision**：

1. **题名匹配**：两侧题名做归一化（去首尾空白、压缩连续空白、统一小写、去除标点与连字符差异、Unicode 归一化 NFKC）。完全一致视为同一篇；仅大小写/标点/连字符差异可接受；语义不同的标题判为不一致。
2. **优先级**：DOI > 出版社/会议论文集正式页面 > 期刊官网文章页 > arXiv。已有 arXiv 且能确认正式版本时 MUST 替换。
3. **缺陷判定**：404、域名失效、跳转无关首页/检索页/作者主页、题名指向另一作品、非 HTTPS = 缺陷，必须替换或移除。付费墙、登录墙、403、验证码拦截**不单独**构成移除理由（FR-006）。DOI resolver 返回 600 / 连接重置 / 超时属于自动化访问限制，必须用 `doi.org/api/handles/{doi}` + 官方落地页/PDF 题名进一步核实；能确认同一篇则保留 DOI，不得因解析失败移除。
4. **移除链接**：无准确替代时删除 `url` 并同步删除 `date`，标题以纯文本渲染。
5. **补链**：仅当题名与书目元数据一致时新增 `url`，并补官方日期；arXiv-only 情形的日期沿用 006 约定（arXiv v1 提交日）。
6. **中文论文**：只接受期刊官方 DOI / 官网文章页；不接受 CNKI、万方、维普、百度学术等检索页/摘要页。DOI 字符串含 `cnki` 仅是注册机构标识，不据此判错。

**Rationale**：与 spec「链接权威性与有效性」逐条对齐；归一化匹配兼顾正式版与 arXiv 版本的细微题名差异，同时避免把「同领域相似标题」误判为同一篇。

**Alternatives considered**：
- 仅比较 DOI 前缀或域名：无法发现「DOI 正确但指向书籍」这类缺陷，否决。
- 对任何付费墙/403 一律移除：会把合法官方页面误删，违反 FR-006，否决。

---

## R4. CCF 判定的实现方式

**Decision**：用**显式映射表 + 少量年份分支**实现，不引入规则引擎：

- venue 归一化：`trim` + 英文统一大写 + 同义名映射（`IEEE ICME` → `ICME`；两种 TASLP 全称 → `TASLP`；`IEEE TRANSACTIONS ON INFORMATION FORENSICS AND SECURITY` → `TIFS`）。
- 规则优先级：**论文类型资格 > 年份对应目录 > venue 等级**。`Findings of ACL` / `Findings of EMNLP` / `WWW 2015 Companion` 先判「无等级」；`IJCAI` 按 `year ≥ 2026 → B`、否则 `A`；`CVMJ` 按 `2022–2025 → C`、`2026+ → B`（当前无 2026 条目）；中文期刊按 2019 中文目录。
- 其余 venue 查表；未收录 venue 一律无等级，不猜、不类推。
- 预期结果：A=66、B=48、C=3、无等级=18（与 spec SC-004 一致）。完整表见 [contracts/ccf-rating.md](./contracts/ccf-rating.md)。

**Rationale**：135 条数据只涉及有限 venue；显式表可逐行审查、可机器复算，比抽象规则更易验证，符合 Constitution V。

**Alternatives considered**：
- 逐条目按参考页手工标注：不可复现、易受参考页错误影响（参考页把 Findings 标为 A），否决。
- 抓取 CCF 官网 PDF 自动解析：目录为 PDF、版本多、一次性需求，成本远高于收益，否决。

---

## R5. 数据契约强化

**Decision**：`src/content.config.ts` 的 publications schema 通过 `superRefine` + `ccf` enum 强化如下规则：

```text
url 存在 且 date 缺失 → 构建失败（既有规则）
url 缺失 且 date 存在 → 构建失败（superRefine，新增，FR-007）
url === null → 构建失败（superRefine，新增，FR-007 / FR-018）
ccf === null → 构建失败（zod enum 去掉 .nullable()，FR-018）
```

不新增字段、不改变 `ccf` 枚举取值（`'A' | 'B' | 'C'`）与共享 `httpsUrl` 校验；`ccf` 仅去掉 `.nullable()`，`url` 在 publications `superRefine` 内单独拒绝 `null`，避免影响 teachers/students/graduates；数据门禁仍复核 `url` / `ccf` 不得为 JSON `null`。

**Rationale**：FR-007 要求双向配对，FR-018 明确禁止 `ccf: null`；edge case 明确「移除链接但保留 date 必须同步移除」。机器强制比人工审查可靠，且改动局限在既有 publications 校验，不引入依赖或复杂度。

**Alternatives considered**：
- 仅在审查清单中人工检查：无法防止后续数据更新回归，否决。
- 在组件层忽略无 url 的 date：只是掩盖数据缺陷，违反 Constitution I，否决。

---

## R6. 验证方法

**Decision**：四层验证，全部命令写入 [quickstart.md](./quickstart.md)：

1. **构建门禁**：`npm run check && npm run build`（基线先跑一次，改动后复跑）。
2. **数据门禁**（一次性 Node 脚本，读取 `src/data/publications.json`）：135 条；`url ⇒ date` 与 `¬url ⇒ ¬date`；`url`/`ccf` 不得为 JSON `null`；全部 `https://`；`ccf ∈ {A,B,C}` 或缺省；分布 66/48/3/18；venue×year 逐条对照期望矩阵；关键抽查 IJCAI 2025=A、IJCAI 2026=B、Findings of ACL 2021=无、信息安全学报=B、CVMJ 2024/2025=C、KBS=C、WWW 2015 Companion=无。
3. **DOM 门禁**（解析 `dist/publications/index.html`，剔除 `<style>` 后）：135 个 `<article class="pub-item">`；`CCF-A/B/C` 徽标共 117 个（66/48/3）；`.pub-link` 锚点数 = 有 `url` 条目数，且每个有 `url` 条目共 2 个同 URL 锚点；无 `pub-link` 的裸文本 `Link ↗`；无隐藏的 `CCF-A` 占位（即空槽内无徽标）。
4. **布局与范围**：1440 / 1280 / 1024 / 768 / 767 / 576 / 575 / 480 / 375 / 320px 十档视口与 200% 缩放，检查 006 的破损定义（重叠、截断、溢出、非预期换行、页面横向滚动），并量测 CCF/LINK 槽线；基于基线 SHA 的 `git diff --stat` 确认只改 3 个源文件 + specs 文档。

**Rationale**：数据正确性与 DOM 真实性都是可观测表面；布局验收沿用 006 已验证的口径，避免重新发明标准。

**Alternatives considered**：
- 只跑 `astro check`：不覆盖数据语义与 DOM，否决。
- 引入快照测试：135 条数据仍在治理中，快照只会制造噪声，否决。

---

## R7. 审计留痕格式与位置

**Decision**：三份 Markdown 记录放在 `specs/009-publication-link-ccf/evidence/`：

- `link-audit.md`：135 行，每条含「条目（title + venue + year）、当前 URL、最终 URL、来源类型（DOI/出版社/会议论文集/期刊官网/arXiv/无）、核验证据（题名匹配来源与结论）、决定（保留/替换/新增/移除/保持无链接）、理由/备注」。
- `ccf-audit.md`：135 行，每条含「条目、venue、year、使用目录版本、类型资格、最终 CCF、依据/例外说明」。
- `verification.md`：构建结果、数据门禁输出、DOM 计数、视口矩阵结论、diff 范围。

**Rationale**：SC-008 要求 135/135 覆盖与目录版本可追溯；Markdown 表格对课题组维护者可直接阅读，也便于 `grep` 复核。脚本不入库，证据入库。

**Alternatives considered**：
- JSON/CSV 证据：机器友好但维护者阅读成本高，且没有自动化消费者，否决。
- 只写变更条目（42 条 CCF 变更 + 5 条链接变更，去重后 45 条）：不满足「每条链接的决定均可追溯」（FR-009 / SC-008），否决。

---

## R8. 宪法合规映射

| 原则 | 本特性证据 |
|------|-----------|
| I. 内容准确性 | link-audit.md 135 行题名匹配证据；ccf-audit.md 目录版本与依据；无法核实条目先提交负责人确认，并记录「保持无链接/无等级」 |
| II. 内容与展示分离 | 内容变更只改 `publications.json`；组件改动仅为 DOM 真实性，不改变数据驱动方式 |
| III. 静态站点 | 零构建配置改动；`npm run check` + `npm run build` 通过并记录 |
| IV. 简洁学术化 | 无视觉变更、无新依赖、无运行时 JS；徽标与 Link 外观不变 |
| V. 最小复杂度 | 一次性脚本不入库；显式映射表；schema 仅在既有 publications 校验上增加 url/date 配对与 null 拒绝 |
| VI. 无布局破损 | 槽位宽度 CSS 预留 + 视口矩阵 + 逐元素 `getBoundingClientRect()` 记录（verification.md） |
