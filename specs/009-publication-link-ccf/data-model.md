# Data Model: Publications 链接修复与 CCF 等级完整标注

**Date**: 2026-11-19 | **Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

本文件描述本特性涉及的实体、字段可变性、判定规则与不变量。完整链接审计字段见 [contracts/publications-data.md](./contracts/publications-data.md)，CCF 判定表见 [contracts/ccf-rating.md](./contracts/ccf-rating.md)，DOM 契约见 [contracts/publication-item-dom.md](./contracts/publication-item-dom.md)。

## 1. Publication（论文条目，现有 135 条）

数据源：`src/data/publications.json`（顶层为 JSON 数组，由 Astro file loader 注入 `id`）。本特性**只允许**改变下表中标注为「可变」的字段。

| 字段 | 类型 | 必填 | 本特性可变性 | 说明 |
|------|------|------|--------------|------|
| `title` | string | 是 | **不可变** | 论文题名；链接核验只读，不修订标题 |
| `venue` | string | 是 | **不可变** | 会议/期刊名；CCF 判定的输入，只读 |
| `year` | integer (1980–2100) | 是 | **不可变** | CCF 目录版本的唯一判定键 |
| `date` | `YYYY-MM-DD` | 见不变量 | **仅随链接增删变化** | 组内排序锚点；有 `url` 必有，无 `url` 必无 |
| `ccf` | `'A' \| 'B' \| 'C'` | 否 | **可变** | 无等级时字段缺省；不得写 `null` 或其他值 |
| `url` | HTTPS string | 否 | **可变** | 论文官方页面；无可靠链接时字段缺省，不得写 `null` |
| `featured` | boolean | 否（默认 false） | **不可变** | 主页精选标记 |
| `authors` | string[] | 否 | **不可变** | 作者列表 |

### 不变量（构建期或验收期强制）

- **I1**：`url` 存在 ⇒ `date` 存在且为合法日历日期（既有 schema refine）。
- **I2**：`url` 不存在 ⇒ `date` 不存在；`url` 缺省 MUST 省略字段，不得写 `null`（本特性新增 publications schema 校验，FR-007）。
- **I3**：`url` 存在 ⇒ 以 `https://` 开头（既有 schema）。
- **I4**：`ccf` 存在 ⇒ 取值 ∈ {`A`,`B`,`C`}；缺省 MUST 省略字段，不得写 `null`（本特性新增 schema 非 `null` 约束，FR-018）。
- **I5**：`ccf` 的取值 MUST 等于 [ccf-rating.md](./contracts/ccf-rating.md) 对 `(venue, year)` 的判定结果；判定为「无等级」时字段缺省。
- **I6**：`title` / `venue` / `year` / `authors` / `featured` 在本特性前后逐条相同。
- **I7**：每条 `url` 指向的题名与条目 `title` 归一化后一致（链接审计记录为证）。
- **I8**：135 条条目总数不变；不新增、不删除、不合并条目。

## 2. Catalog Version（CCF 目录版本）

| 版本 | 适用 `year` | 本特性关键结论 |
|------|------------|----------------|
| 2026 版（第七版，2026-03-31 发布） | 2026 及以后 | IJCAI = B；CVMJ = B；Findings / Workshop / Companion / Short / Demo 等不计入 |
| 2022 版 | 2022–2025 | IJCAI = A；CVMJ = C；KBS = C |
| 2019 版 | 2019–2021 | IJCAI = A；EMNLP / COLING / NAACL = B |
| 2015 版 | 2015–2018 | CIKM / WSDM / ICMR / ICME / ICASSP / TASLP = B |
| 当时版本核对 | 2014 及以前 | 当前数据仅 CIKM / WSDM，按 B 处理（见合同说明）；无法确认时先提交负责人确认，确认后缺省 |
| 中文目录（2019） | 全部年份（不随国际版本切换） | 计算机学报 / 计算机研究与发展 = A；信息安全学报 = B |

版本切换只按 `year` 整年判定，不按 `date` 的月日、也不按目录实际发布日期切分（FR-010、FR-013）。

## 3. Venue Rating（venue 等级判定）

判定输入：`venue` 归一化键、`year`、论文类型资格。

**类型资格前置规则**（FR-012）：

- 仅 Full paper / Regular paper 可获得等级。
- `Findings of ACL`、`Findings of EMNLP`、`WWW 2015 Companion` 一律无等级，不继承主会等级。
- 其他 Findings / Workshop / Companion / Short / Demo / Technical Brief / Summary / Poster 同样无等级。

**venue 归一化**：

| 原始值（示例） | 归一化键 |
|----------------|----------|
| `IEEE ICME` | `ICME` |
| `IEEE Transactions on Audio, Speech and Language Processing` | `TASLP` |
| `IEEE/ACM Transactions on Audio, Speech and Language Processing` | `TASLP` |
| `IEEE TRANSACTIONS ON INFORMATION FORENSICS AND SECURITY` | `TIFS` |
| 其他英文 venue | `trim` + 大写 |
| 中文 venue | 原样（去除首尾空白） |

**等级分组**：

| 等级 | venue / 条件 | 当前条数 |
|------|--------------|----------|
| A | AAAI、ACL、CVPR、NeurIPS、SIGIR、ICCV、ICLR、ACM MM、TOIS、TIFS、WWW 主会（非 2015）、计算机学报、计算机研究与发展 | 61 |
| A | IJCAI（`year ≤ 2025`） | 5 |
| B | IJCAI（`year ≥ 2026`） | 4 |
| B | EMNLP、COLING、NAACL、ECAI、ECCV、ICME、ICASSP、ICMR、CIKM、WSDM、DASFAA、TASLP、TCSVT、TOMM、信息安全学报 | 44 |
| C | CVMJ（2022–2025）、Knowledge-Based Systems | 3 |
| 无等级 | Findings of ACL（7）、Findings of EMNLP（10）、WWW 2015 Companion（1） | 18 |

合计 135 条；A=66、B=48、C=3、无等级=18（SC-004）。

## 4. Link Source（链接来源）

| 字段 | 取值 | 说明 |
|------|------|------|
| `url` | HTTPS string | 最终写入数据的唯一链接 |
| `sourceType` | `doi` / `publisher` / `proceedings` / `journal-site` / `arxiv` / `none` | 来源类型 |
| `targetTitle` | string | 目标页面题名（核验证据） |
| `accessibility` | `ok` / `paywall` / `login` / `403` / `404` / `invalid-domain` / `captcha` | 可访问性；`paywall` / `login` / `403` / `captcha` 不单独判错 |

**来源优先级**：DOI > 出版社/会议论文集正式页面 > 期刊官网文章页 > arXiv（FR-002）。已有 arXiv 且确认存在正式版本时 MUST 替换。

## 5. Audit Record（审计记录）

### 5.1 LinkAuditRecord（135 条，`evidence/link-audit.md`）

| 字段 | 说明 |
|------|------|
| # | 1–135 连续编号（行计数脚本依赖行首的编号列，与 CcfAuditRecord 对齐） |
| 条目 | `title` + `venue` + `year`（与数据行一一对应） |
| 当前 URL | 变更前的 `url`，无则写「无」 |
| 最终 URL | 变更后的 `url`，无则写「无」 |
| 来源类型 | 见 §4 `sourceType` |
| 核验证据 | 元数据来源（Crossref / arXiv / 落地页）+ 题名匹配结论 |
| 决定 | `保留` / `替换` / `新增` / `移除` / `保持无链接` |
| 理由 | 无法核实（含负责人确认）、付费墙、404 等说明；无则留空 |

### 5.2 CcfAuditRecord（135 条，`evidence/ccf-audit.md`）

| 字段 | 说明 |
|------|------|
| # | 1–135 连续编号（T027 依赖该列计数） |
| 条目 | `title` + `venue` + `year` |
| 目录版本 | 2015 / 2019 / 2022 / 2026 / 中文 2019 / 当时版本 |
| 类型资格 | Full/Regular 或 Findings/Companion/其他（无资格） |
| 最终 CCF | A / B / C / 无 |
| 依据 | 目录中的 venue 条目或例外说明 |

## 6. 预期变更规模

| 变更类型 | 数量 | 明细 |
|----------|------|------|
| 链接修正 | 5 | 4 条中文论文 + EMNLP 2019 书籍 DOI |
| 现有链接核验 | 125 | 66 DOI + 59 arXiv；arXiv 存在正式版本时替换 |
| 无链接条目审计 | 10 | 能核实则补链 + 补 `date`，否则保持无链接 |
| CCF 变更 | 42 | 新增 B 38、新增 C 3、撤销 A 1（Findings of ACL 2021） |
| CCF 不变 | 93 | A 66、B 10、无等级 17 |

**最终分布**：A=66、B=48、C=3、无等级=18，合计 135。
