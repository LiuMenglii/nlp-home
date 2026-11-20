# Feature Specification: Publications 链接修复与 CCF 等级完整标注

**Feature Branch**: `009-publication-link-ccf`

**Created**: 2026-11-19

**Status**: Clarified

**Input**: User description: "修复 Publications 页部分文章的链接，目前发现中文文章的链接都是错误的。还需要更为完整地标注 CCF 等级，部分文章没有标注。如果中文期刊找不到准确的链接，就不放链接了。等级标注可以参考 `https://people.ucas.ac.cn/~linzheng`。存在很多灵活、细微的规则，例如 A 会的 findings 不算 A，发的文章以当年的 CCF 标准来算（IJCAI 前面算 A，后面变成 B 了）等。如果有需要我做决策的地方，请向我提问。"

## 目标与范围

本特性处理 Publications 页的数据准确性问题，交付三部分结果：

1. **链接可信**：逐条核验 135 条论文条目现有的 125 条链接；修正指向其他论文、书籍、期刊首页或检索页的错误链接。中文论文必须链接到期刊官方文章页或 DOI；找不到准确链接时移除链接，不以其他页面凑数。
2. **CCF 标注完整且正确**：按论文发表年份对应的 CCF 目录版本、论文类型（仅限 Full/Regular paper）与中文期刊目录，为所有符合条件但尚未标注的条目补齐等级；移除错误等级（如 Findings 被标成 CCF-A）；Findings、Workshop、Companion、Short/Demo 等不标注。
3. **链接补全与审计留痕**：对 10 条当前无链接的条目查找权威链接，能核实则补齐，不能核实则保持无链接；为每条链接的决定、来源与核验证据留下可追溯记录。

**范围之外**：

- 修改论文标题、作者、venue 名称、year 字段或 featured 标记；
- 调整 Publications 页的版式、筛选器、分组规则或视觉设计；
- 新增论文条目、删除论文条目或合并重复条目；
- 为其他页面（首页、Team、News、Projects 等）做链接或 CCF 标注治理；
- 引入运行时链接检查服务、定时爬虫或重量级依赖；
- 改用其他中文期刊分级体系（如 T1/T2/T3）或改用“计算领域高质量科技期刊分级目录”；
- 修正与本次链接/CCF 无关的数据瑕疵（例如标题中残留的 ". ICME" 字样），另案处理。

## Clarifications

### Session 2026-11-19

- Q: 中文期刊的 CCF 等级按哪个口径标注？ → A: 按《CCF 推荐中文科技期刊目录（2019）》的 A/B/C 三类标注：计算机学报、计算机研究与发展为 A，信息安全学报为 B。
- Q: CCF 等级按论文哪个时点的目录版本判定？ → A: 按发表年份整年切换目录版本。2022–2025 年论文使用 2022 版目录（IJCAI 为 A）；2026 年及以后使用 2026 版目录（IJCAI 自 2026 年起为 B）。2025 年 IJCAI 仍为 A。
- Q: 英文论文的链接选择优先级如何定？ → A: 官方链接优先：DOI > 出版社/会议论文集正式页面 > 期刊官网 > arXiv。已有 arXiv 链接若存在对应官方页面，必须替换为官方链接；仅当正式版本或官方页面不存在时才保留 arXiv。
- Q: 对目前没有链接的条目，是否补齐权威链接？ → A: 能核实就补齐；无法核实是同一篇论文时先提交课题组负责人确认，确认后保持无链接并记录原因。

### Session 2026-11-20

- Q: Publications 页的布局验收应使用哪一套视口矩阵？ → A: 恢复 006 的十档视口：1440/1280/1024/768/767/576/575/480/375/320px + 200% 缩放，不再只测四档。

### 补充判定（基于官方目录与用户规则）

- 2026 版 CCF 目录于 2026-03-31 正式发布，并明确“会议论文指 Full paper 或 Regular paper；Short paper、Demo paper、Technical Brief、Summary、Findings 以及作为伴随会议的 Workshop 等不计入目录考虑范围”。因此 Findings 不继承主会等级。
- 参考页 `https://people.ucas.ac.cn/~linzheng` 仅作交叉参考。与官方目录或本 spec 规则冲突时，以官方目录与本 spec 为准。典型差异：参考页把 Findings of ACL 2021 标为 CCF-A，但 Findings 不标注；参考页对部分 EMNLP/COLING/ICASSP/CIKM 等条目未标注，本次应按目录补齐。
- 参考页把 IJCAI 2025 标为 CCF-A，与 2022 版目录一致，本次保留 A；IJCAI 2026 条目按 2026 版目录标 B。
- CCF 槽位当前通过渲染一个隐藏的 CCF-A 徽标占位。该做法会在 DOM 中产生伪造等级，测试统计与内容抽取会误读。本次 MUST 改为仅用样式预留槽位宽度，缺失等级的条目 DOM 中不得出现任何 CCF-A/B/C 徽标文本。
- 缺失链接的条目同样不得在 DOM 中渲染隐藏的 "Link ↗" 文案；无链接就是无链接。
- 若出现无法核实的链接或 CCF 判定，按 FR-005/FR-018 缺省并记录；审计清单 MUST 先提交课题组负责人确认，确认结果写入 `evidence/`（Constitution I）。

## 术语与判定规则

### CCF 目录版本与年份

论文的 CCF 等级以条目的 `year` 字段为准，不按 `date` 字段的月日切换，也不按目录实际发布日期切分。

| 论文 year | 使用的目录 | 本次涉及的关键结论 |
|---|---|---|
| 2026 及以后 | 2026 版（第七版，2026-03-31 发布） | IJCAI 为 B；CVMJ 升为 B；Findings/Workshop/Companion 不标注 |
| 2022–2025 | 2022 版 | IJCAI 为 A；CVMJ 为 C；KBS 为 C |
| 2019–2021 | 2019 版 | IJCAI 为 A；EMNLP/COLING/NAACL 等为 B |
| 2015–2018 | 2015 版 | 当前数据涉及的 CIKM、WSDM、ICMR、ICME、ICASSP、TASLP 均为 B |
| 2014 及以前 | 以当时版本核对 | 当前数据仅涉及 CIKM 与 WSDM，二者在可查的 2015/2019/2022 版中均为 B；无法确认时先提交负责人确认，确认后不标注 |

说明：

- 2026 年论文即使发表于 2026-03-31 之前，也按 2026 版目录判定（用户选择“按年份”）。
- 中文期刊不随国际目录年份切换，统一使用《CCF 推荐中文科技期刊目录（2019）》。
- 若未来新增 2014 年以前的条目，涉及当时版本差异且无法确认等级的 venue，先提交负责人确认，确认后宁可不标，不得按相邻年份类推。

### 可标注对象

- 只有正式发表的长文（Full paper / Regular paper）才可以获得 CCF 等级。
- 以下形式一律不标注，即使发表于 CCF-A 主会：Findings、Workshop、Companion、Short paper、Demo paper、Technical Brief、Summary、Poster 等。
- 未被 CCF 目录收录的 venue 不标注；不得用“同领域相似会议”“主会等级”“参考页没标所以不标”等方式推断。
- 中文期刊按中文目录标注；中文期刊的 A/B/C 仍沿用现有 `CCF-A` / `CCF-B` / `CCF-C` 徽标，不新增“中文”前缀。
- 若 venue 与年份组合无法在对应目录中确认，保持无等级并在审计记录中说明。

### 链接权威性与有效性

**权威来源优先级**（从高到低）：

1. DOI（`https://doi.org/...`）；
2. 出版社或会议论文集正式页面（IEEE Xplore、ACM DL、Springer、Elsevier、AAAI OJS、IJCAI Proceedings、ACL Anthology、PMLR、CVF Open Access、OpenReview 等）；
3. 期刊官方网站的文章页；
4. arXiv（仅当没有正式版本，或正式版本/官方页面尚不存在时）。

**有效性判定**：

- 链接目标的题名、作者、venue、年份必须与条目指向同一篇论文。题名大小写、标点、连字符差异可接受；题名或作者指向另一篇论文、另一本书、期刊首页、检索页、作者主页、DOI 前缀错误等均视为缺陷。
- 付费墙、登录墙、自动化访问 403 不单独构成移除理由；只要书目元数据与论文题名一致即可保留。
- 404、域名失效、跳转到无关首页、跳转到其他论文，均视为缺陷，必须替换或移除。
- 所有外部链接必须使用 HTTPS。
- 中文论文只接受期刊官方 DOI 或期刊官网文章页；不接受 CNKI、万方、维普、百度学术等平台的检索页/摘要页作为论文链接。DOI 字符串中包含 `cnki` 只是注册机构标识，不等于 CNKI 平台页面。
- 找不到准确链接时，移除 `url` 并同步移除 `date`；条目标题保持纯文本展示，不放置“伪链接”。
- 新增链接时必须同步补充准确的 `date`；无链接条目不得保留 `date`。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 中文论文链接不再指向无关文献 (Priority: P1)

访问者在 Publications 页点击中文论文标题，打开的是该论文在期刊官方页面或 DOI 上的正式页面，而不是同名的其他文章、其他期刊文章或出版社首页；如果确实找不到准确链接，标题就不显示为链接。

**Why this priority**: 当前 4 条中文论文的链接全部指向无关文献，是本页最直接、最容易被发现的内容错误；错误链接会误导访问者与学术评价。

**Independent Test**: 逐条检查 4 条中文论文条目的 `url`，确认链接目标的题名、作者、期刊、年份与条目一致；确认不存在指向 Hans 出版社其他期刊、其他 DOI 或检索页的链接。即使其他 story 未完成，本 story 也可独立验收。

**Acceptance Scenarios**:

1. **Given** 文本后门攻击与防御综述条目，**When** 访问者点击标题，**Then** 打开《计算机研究与发展》官方 DOI 页面，题名与条目一致。
2. **Given** 智能回复系统研究综述条目，**When** 访问者点击标题，**Then** 打开《信息安全学报》官方 DOI 页面，题名与条目一致。
3. **Given** 文本情绪分析综述条目，**When** 访问者点击标题，**Then** 打开《计算机研究与发展》官方 DOI 页面，题名与条目一致。
4. **Given** 一种面向大规模社会信息网络的多层社区发现算法条目，**When** 访问者点击标题，**Then** 打开《计算机学报》官方 DOI 页面，题名与条目一致。
5. **Given** 上述任一条目在任何时候被确认没有准确链接，**When** 页面渲染，**Then** 标题为纯文本，不渲染链接，且该条目没有 `date`。

---

### User Story 2 - CCF 等级按论文年份与类型准确标注 (Priority: P1)

访问者在每条论文旁看到正确、完整的 CCF 等级：该有的有，不该有的没有；Findings 不会被误标为 A；2025 年 IJCAI 为 A，2026 年 IJCAI 为 B；中文期刊按中文目录标注。

**Why this priority**: CCF 等级是学术展示的核心信息之一，错误或缺失会直接影响读者对论文分量的判断；当前存在 Findings 误标 A、EMNLP/COLING/ICASSP/CIKM 等大量应标未标。

**Independent Test**: 按“预期 CCF 结果矩阵”逐 venue 检查，统计 A/B/C/无等级的数量；重点抽查 IJCAI 2025/2026、Findings of ACL 2021、信息安全学报、CVMJ、KBS、WWW 2015 Companion。

**Acceptance Scenarios**:

1. **Given** 一篇 2025 年 IJCAI 论文，**When** 页面渲染，**Then** 显示 CCF-A。
2. **Given** 一篇 2026 年 IJCAI 论文，**When** 页面渲染，**Then** 显示 CCF-B。
3. **Given** 一篇 Findings of ACL/EMNLP 论文，**When** 页面渲染，**Then** 不显示任何 CCF 等级，即使主会为 A/B。
4. **Given** 一篇发表于信息安全学报的论文，**When** 页面渲染，**Then** 显示 CCF-B。
5. **Given** 一篇 CVMJ 2024/2025 论文，**When** 页面渲染，**Then** 显示 CCF-C；一篇 KBS 论文显示 CCF-C。
6. **Given** 一篇 WWW 2015 Companion 论文，**When** 页面渲染，**Then** 不显示 CCF 等级。

---

### User Story 3 - 全量链接经过核验并尽量补全 (Priority: P2)

访问者点击任何论文链接，都能到达该论文的正式页面；本次审计同时修复非中文的错误链接，并为当前无链接的条目补上权威链接（能核实的前提下）。

**Why this priority**: 中文链接只是最明显的错误；全量核验能发现同类的 DOI 错配，避免下一条错误链接继续误导访问者。补全链接提升可用性，但优先级略低于纠错。

**Independent Test**: 按审计记录逐条抽查全部 125 条现有链接与 10 条无链接条目；确认没有链接指向其他作品、没有非 HTTPS 链接、没有未经核实的补链。

**Acceptance Scenarios**:

1. **Given** Ranking and Sampling in Open-Domain Question Answering（EMNLP 2019），**When** 访问者点击标题，**Then** 打开 ACL Anthology / DOI 的 D19-1245 页面，而不是书籍 DOI。
2. **Given** 一条已有 arXiv 链接且已有正式 DOI/论文集的论文，**When** 本次变更完成，**Then** 链接替换为官方页面。
3. **Given** 一条当前无链接但可核实官方页面的条目，**When** 本次变更完成，**Then** 补齐链接与日期。
4. **Given** 一条当前无链接且无法核实官方页面的条目，**When** 本次变更完成，**Then** 保持无链接、记录原因并提交课题组负责人确认。
5. **Given** 任意一条链接，**When** 访问者打开它，**Then** 页面题名与条目题名指向同一篇论文；付费墙或登录墙不视为错误。

---

### User Story 4 - 页面渲染与数据契约无回归 (Priority: P3)

本次变更只影响链接与 CCF 数据，不改变页面版式；没有 CCF 等级的条目不产生伪造徽标，没有链接的条目不产生隐藏的 "Link" 文案；构建与现有响应式布局保持通过。

**Why this priority**: 数据和 DOM 的真实性会影响测试统计、内容抽取与长期维护；视觉回归会破坏既有 006 布局成果。

**Independent Test**: 构建站点；在 1440/1280/1024/768/767/576/575/480/375/320px 十档视口检查 Publications 页；检查无等级/无链接条目的 DOM 中不存在伪造徽标或伪造链接文本。

**Acceptance Scenarios**:

1. **Given** 一条 Findings 论文，**When** 检查渲染后的 DOM，**Then** 不存在 CCF-A/B/C 徽标或隐藏的等级文本。
2. **Given** 一条无链接条目，**When** 检查渲染后的 DOM，**Then** 不存在链接锚点，也不存在隐藏的 "Link ↗" 文本。
3. **Given** 桌面与移动视口，**When** 打开 Publications 页，**Then** 无元素重叠、文字截断、内容溢出或页面横向滚动；CCF 槽位宽度保持稳定。
4. **Given** 本次变更，**When** 运行构建与现有检查，**Then** 构建通过，无新增依赖与无关页面改动。

---

### Edge Cases

- 中文论文链接指向 Hans 出版社的其他期刊、其他 DOI 或期刊首页：视为错误，必须替换；无准确替代则移除。
- DOI 可解析但落到付费墙/登录页/403：不单独判错；以题名与书目元数据一致为准。
- DOI 可解析但落到另一篇论文、一本书或期刊首页：判错，替换或移除。
- 官方页面与 arXiv 并存：官方优先；仅当官方页面尚不存在时保留 arXiv。
- 官方页面与 arXiv 题名有细微差异（版本标题、标点、大小写）：视为同一篇，以官方版本为准；不得因此改站点标题（标题修订不在本特性范围）。
- Findings/Workshop/Companion/Short/Demo：不标注，即使主会为 CCF-A。
- WWW 2015 Companion 条目：venue 写的是 WWW，但论文发表于 Companion，不标注 A。
- IJCAI 2025 与 2026：2025 为 A，2026 为 B；不以 2026 目录回溯修改 2025。
- 2026 年 3 月 31 日之前发表的 2026 年论文：仍按 2026 版目录判定（按年份）。
- CVMJ：2024/2025 为 C；2026 版目录起为 B；当前数据没有 2026 年 CVMJ 条目。
- 中文期刊无准确链接：移除 `url` 与 `date`，标题以纯文本显示，CCF 等级不受影响。
- 新增链接但遗漏 `date`：违反数据契约，构建或审查必须发现。
- 移除链接但保留 `date`：违反 006 约定，必须同步移除。
- 链接为 HTTP：不允许；必须改为 HTTPS 官方页面或 DOI。
- 链接为通用首页、搜索结果页、作者主页、会议主页：不是论文链接，必须替换或移除。
- 同一论文有 DOI 与 ACL Anthology 两个官方页面：按优先级选 DOI；只保留一个 `url`。
- 无法确认 venue 的 CCF 等级：先提交负责人确认，确认后宁可不标，不得猜测；在审计记录中注明。
- 未来年份（2027+）：使用届时最新版目录；没有最新版依据时不标注。

## Requirements *(mandatory)*

### Functional Requirements

#### 链接核验与修复

- **FR-001**: 现有 125 条 `url` MUST 逐条核验；每条链接的目标 MUST 与条目指向同一篇论文（题名、作者、venue、年份至少题名一致），MUST NOT 指向其他论文、书籍、期刊首页、检索页、作者主页或会议主页。
- **FR-002**: 链接选择 MUST 遵循“DOI > 出版社/会议论文集正式页面 > 期刊官网 > arXiv”的优先级；已有 arXiv 链接且存在对应官方页面时，MUST 替换为官方链接。
- **FR-003**: 中文论文 MUST 使用期刊官方 DOI 或期刊官网文章页；MUST NOT 使用 CNKI、万方、维普、百度学术等平台的检索页/摘要页作为论文链接。
- **FR-004**: 已确认的 5 条错误链接 MUST 按“已知缺陷与核验结果”表修正，默认以替换实现（替换优先于移除）；修正后的链接 MUST 通过题名与书目元数据核验。仅当复核确认表中目标不可用（DOI 失效、跳转到其他文献等）且经课题组负责人确认后，才允许降级为移除 `url` 并同步移除 `date`（遵循 FR-005/FR-007）。
- **FR-005**: 当前 10 条无链接条目 MUST 逐条查找权威链接；能确认是同一篇论文的 MUST 补齐 `url` 与 `date`（`date` 取正式发布日期；仅 arXiv 可用时取 arXiv v1 提交日）；不能确认的 MUST 先提交课题组负责人确认，确认后保持无链接并在审计记录中说明原因。
- **FR-006**: 所有 `url` MUST 使用 HTTPS。付费墙、登录墙或自动化访问 403 不单独构成移除理由；404、域名失效、跳转无关页面、题名不匹配构成缺陷。
- **FR-007**: 每个有 `url` 的条目 MUST 有 `date`；每个无 `url` 的条目 MUST 无 `date`，且 `url` 缺省 MUST 省略字段（不得写 JSON `null`）（沿用 006 数据契约）。
- **FR-008**: 链接变更 MUST 只修改 `url` 与随链接增删所必需的 `date`；MUST NOT 修改 `title`、`venue`、`year`、`authors`、`featured`。
- **FR-009**: 每条链接的最终决定 MUST 留下可追溯记录：条目、当前 URL、新 URL、来源类型、核验证据（题名匹配）、决定（保留/替换/新增/移除）、无法核实的理由（如有）。

#### CCF 等级判定与标注

- **FR-010**: CCF 等级 MUST 按论文 `year` 对应的目录版本判定：2026+ 使用 2026 版；2022–2025 使用 2022 版；2019–2021 使用 2019 版；2015–2018 使用 2015 版；2014 及以前以当时版本核对，无法确认时缺省。MUST NOT 按 `date` 的月日或目录实际发布日期切换。
- **FR-011**: 中文期刊 MUST 按《CCF 推荐中文科技期刊目录（2019）》标注：计算机学报、计算机研究与发展为 A；信息安全学报为 B。
- **FR-012**: 仅 Full paper / Regular paper 可获得等级；Findings、Workshop、Companion、Short paper、Demo paper、Technical Brief、Summary、Poster 等 MUST NOT 标注。
- **FR-013**: IJCAI 论文 MUST 按年份区分：2025 及以前为 A；2026 及以后为 B。2026 年论文即使发表于 2026-03-31 之前，也按 2026 版目录标 B。
- **FR-014**: 所有被 CCF 目录收录且属于 Full/Regular paper 的条目 MUST 有且仅有一个正确等级；当前应补齐的 venue 至少包括 EMNLP、COLING、NAACL、IJCAI（2026+）、ICASSP、ICME、CIKM、WSDM、ECAI、DASFAA、TASLP、CVMJ、KBS 与信息安全学报。
- **FR-015**: 依据 FR-012 的类型资格规则，Findings of ACL/EMNLP 全部 17 条 MUST 无等级；错误等级 MUST 移除，至少包括 Findings of ACL 2021 的 CCF-A。
- **FR-016**: 无 CCF 等级的条目 MUST NOT 在 DOM 中渲染任何 CCF-A/B/C 徽标、隐藏徽标或伪造等级文本；CCF 槽位宽度 MUST 仅由样式预留。
- **FR-017**: 无链接条目 MUST NOT 在 DOM 中渲染链接锚点、隐藏的 "Link ↗" 文案或伪造链接；LINK 槽位宽度 MUST 仅由样式预留。
- **FR-018**: CCF 值 MUST 仅为 `"A"`、`"B"`、`"C"` 或缺省；缺省 MUST 省略字段，MUST NOT 写入 JSON `null` 或其他值，构建期 MUST 拒绝 `null`。无法确认等级时 MUST 先提交课题组负责人确认，确认后缺省并在审计记录中说明，不得猜测。
- **FR-019**: 本次变更 MUST NOT 修改 Publications 页以外的页面、模板或样式；为满足 FR-016/FR-017 所需的槽位占位调整 MUST 局限在 Publications 条目组件及其既有样式内。
- **FR-020**: 构建 MUST 通过；MUST NOT 新增运行时依赖、外部服务或定时任务。现有响应式布局（006）与 CCF 徽标尺寸 MUST 保持稳定。

### Key Entities

- **Publication（论文条目）**：标题、venue、year、date、url、ccf、authors/featured；本次仅允许改变 url、ccf，以及随 url 增删的 date。
- **Venue Rating（venue 等级）**：venue 名称、适用年份、目录版本、等级（A/B/C/无）、论文类型资格（Full/Regular 与 Findings/Workshop/Companion 等）。
- **Link Source（链接来源）**：URL、来源类型（DOI/出版社/会议论文集/期刊官网/arXiv）、目标作品身份（题名/DOI）、可访问性（正常/付费墙/登录/403/404）。
- **Audit Record（审计记录）**：每条论文的当前链接、最终链接、来源、核验证据、决定与理由；以及 CCF 判定所依据的目录版本与条目。
- **Catalog Version（目录版本）**：2015/2019/2022/2026 国际目录与 2019 中文目录；包含适用年份与关键等级变化（IJCAI、CVMJ 等）。

### 已知缺陷与核验结果

以下 5 条链接已确认错误，作为必须修复的最小集合：

| 条目 | 当前链接 | 问题 | 核验后的目标 |
|---|---|---|---|
| 文本后门攻击与防御综述（计算机研究与发展，2023） | `https://doi.org/10.12677/csa.2024.1411213` | 指向 Hans 出版社《计算机科学与应用》的无关文章 | `https://doi.org/10.7544/issn1000-1239.202220340`（2024, 61(1): 221-242） |
| 智能回复系统研究综述（信息安全学报，2020） | `https://doi.org/10.12677/sg.2020.106034` | 指向 Hans 出版社《软件工程》的无关文章 | `https://doi.org/10.19363/J.cnki.cn10-1380/tn.2020.01.03` |
| 文本情绪分析综述（计算机研究与发展，2018） | `https://doi.org/10.70693/rwsk.v1i4.935` | 指向无关文献 | `https://doi.org/10.7544/issn1000-1239.2018.20170055`（2018, 55(1): 30-52） |
| 一种面向大规模社会信息网络的多层社区发现算法（计算机学报，2016） | `https://doi.org/10.12677/orf.2014.41003` | 指向 Hans 出版社《运筹与模糊学》的无关文章 | `https://doi.org/10.11897/SP.J.1016.2016.00169`（2016, 39(1): 169-182） |
| Ranking and Sampling in Open-Domain Question Answering（EMNLP，2019） | `https://doi.org/10.1561/9781601980533` | 指向书籍 DOI，非该论文 | `https://doi.org/10.18653/v1/D19-1245`（ACL Anthology D19-1245） |

### 预期 CCF 结果矩阵

当前 135 条数据的 venue 均落在下表范围内。该矩阵是验收基准；新增 venue 必须按同一规则查目录，不得类推。

| 等级 | venue / 适用条件 | 说明 |
|---|---|---|
| A | AAAI、ACL、CVPR、NeurIPS、SIGIR、ICCV、ICLR、ACM MM、TOIS、TIFS、WWW 主会、计算机学报、计算机研究与发展 | WWW 仅限主会 Full/Regular paper；2015 Companion 不标注 |
| A | IJCAI（2025 及以前） | 2022 版目录中 IJCAI 为 A |
| B | IJCAI（2026 及以后）、EMNLP、COLING、NAACL、ECAI、ECCV、ICME、ICASSP、ICMR、CIKM、WSDM、DASFAA、TASLP（含 IEEE/ACM TASLP）、TCSVT、TOMM、信息安全学报 | 按对应年份目录；中文期刊按 2019 中文目录 |
| C | CVMJ（2022–2025）、Knowledge-Based Systems | CVMJ 自 2026 版目录起为 B，但当前无 2026 年 CVMJ 条目 |
| 无等级 | Findings of ACL（7 条）、Findings of EMNLP（10 条）、WWW 2015 Companion（1 条） | Findings/Companion 不属于 Full/Regular paper，不继承主会等级 |

**预期最终分布**（以当前 135 条、且不修改 title/venue/year 为前提）：

- CCF-A：66 条（现有 67 条减去 Findings of ACL 2021 的 1 条错误 A）；
- CCF-B：48 条（现有 10 条加上本次补齐的 38 条）；
- CCF-C：3 条（CVMJ 2 条 + KBS 1 条）；
- 无等级：18 条（17 条 Findings + 1 条 WWW 2015 Companion）；
- 合计：135 条。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% 的有链接条目通过“同一篇论文”核验；0 条链接指向其他论文、书籍、期刊首页、检索页或作者主页；0 条非 HTTPS 链接；0 条已有正式版本却仍指向 arXiv 的链接。
- **SC-002**: 4 条中文论文全部有可核实的官方 DOI/期刊页面（或按规则无链接）；0 条中文链接指向 Hans 出版社其他期刊、CNKI/万方/维普/百度学术检索页或无关 DOI。
- **SC-003**: 5 条已知错误链接全部修复；10 条无链接条目全部完成审计，所有能核实的补齐链接与日期，0 条未经核实的补链。
- **SC-004**: CCF 标注结果精确达到 A=66、B=48、C=3、无等级=18；0 条应标未标，0 条不应标而标。
- **SC-005**: 关键规则抽查全部通过：IJCAI 2025=A、IJCAI 2026=B、Findings of ACL 2021=无等级、信息安全学报=B、CVMJ 2024/2025=C、KBS=C、WWW 2015 Companion=无等级。
- **SC-006**: 无等级条目的 DOM 中不存在 CCF-A/B/C 文本或隐藏徽标；无链接条目 DOM 中不存在链接锚点或隐藏的 "Link ↗" 文本；CCF/LINK 槽位宽度与既有布局一致。
- **SC-007**: 站点构建通过；Publications 页在 1440/1280/1024/768/767/576/575/480/375/320px 十档视口及 200% 缩放下无重叠、截断、溢出或页面横向滚动；其他页面的源文件与版式无改动（主页概览复用 `PublicationItem` 且共享数据，链接/CCF 更新会同步反映在渲染结果中，属预期）。
- **SC-008**: 审计记录覆盖 135/135 条条目，包含每条链接的来源、核验证据与决定；CCF 判定记录注明所用目录版本；无法核实的事项有明确记录（含负责人确认），不遗留未解释的缺失。

## Dependencies

- 现有 Publications 数据契约：`url` 必须为 HTTPS 且伴随 `date`；无链接条目不得保留 `date`。
- 006 已建立的 Publications 响应式布局与 CCF 徽标尺寸约束；本次不得破坏。
- 审计期可访问 CCF 官方目录页面/PDF、DOI 解析器、出版社与会议论文集页面、期刊官网。
- 现有站点构建与检查命令可用；不新增运行时依赖。

## Assumptions

- 当前数据快照为 135 条论文、125 条链接、77 条 CCF 标注（67 A + 10 B），审计日期为 2026-11-19。
- `year` 是论文的发表年份，也是 CCF 目录版本的唯一判定键；`date` 是在线/正式发表日期，仅用于展示与数据契约，不参与版本切换。
- 2026 版 CCF 目录是审计时最新版本；2019 中文期刊目录是当前唯一使用的 A/B/C 中文分级依据。
- 参考页 `https://people.ucas.ac.cn/~linzheng` 仅用于交叉参考，不作为最终裁决依据；官方目录与本 spec 规则优先。
- 官方链接优先于 arXiv；付费墙、登录墙与 403 不导致链接被移除，只要题名与书目元数据一致。
- 2026 年论文的正式 proceedings 可能尚未全部上线；此类条目在没有官方页面时可保留 arXiv，待正式版发布后再替换。
- 标题、作者、venue、year 的既有瑕疵不在本特性范围内；链接核验中发现的其他数据问题只记录，不顺手修改。
- 中文期刊的 `year` 保持数据现状（可能是在线发表年份），不因正式刊期年份不同而修改；CCF 等级不受该差异影响。
- 本次为一次性的数据治理，不新增常驻链接检查服务；实现期可使用脚本辅助核验，但不引入运行时依赖。
- CCF 槽位的视觉样式与宽度保持现状；为消除伪造徽标所需的 DOM/样式调整不得改变既有版式。

## 参考与证据来源

| 用途 | 来源 |
|---|---|
| 2026 版 CCF 国际目录（第七版，2026-03-31 发布；含 Findings 不计入说明） | `https://www.ccf.org.cn/Academic_Evaluation/By_category/` |
| 2022 版 CCF 国际目录（IJCAI 为 A） | `https://www.ccf.org.cn/Academic_Evaluation/By_category/2022-12-02/780280.shtml`；全文 PDF 镜像：`https://mse.bistu.edu.cn/docs//2025-09/5efeeac0420e4321aafd1d78849c90d1.pdf` |
| 2019 版 CCF 国际目录 | `https://www.ccf.org.cn/Focus/2019-04-25/663625.shtml` |
| 2015 版 CCF 国际目录（CIKM/WSDM/ICMR/ICME/ICASSP/TASLP 为 B） | `https://www.ccf.org.cn/c/2015-12-22/646970.shtml`；全文 PDF 镜像：`https://lib.ecnu.edu.cn/_upload/article/files/e2/d9/dd45764345088869915f6b3617a4/5b8fc1d6-d5bb-487d-a1db-42825ebc312a.pdf` |
| CCF 推荐中文科技期刊目录（2019） | `https://ai.nju.edu.cn/_upload/article/files/23/1b/ecccbc3a4f018394fc3a01bf0f20/25a3bd8c-4791-492a-bbca-919364d31135.pdf` |
| 参考页（仅交叉参考） | `https://people.ucas.ac.cn/~linzheng` |
| 文本后门攻击与防御综述官方页 | `https://crad.ict.ac.cn/cn/article/doi/10.7544/issn1000-1239.202220340` |
| 智能回复系统研究综述官方 DOI | `https://doi.org/10.19363/J.cnki.cn10-1380/tn.2020.01.03` |
| 文本情绪分析综述官方页 | `https://crad.ict.ac.cn/article/cstr/32373.14.issn1000-1239.2018.20170055` |
| 一种面向大规模社会信息网络的多层社区发现算法官方 DOI | `https://doi.org/10.11897/SP.J.1016.2016.00169` |
| Ranking and Sampling in Open-Domain Question Answering | `https://aclanthology.org/D19-1245/` |
