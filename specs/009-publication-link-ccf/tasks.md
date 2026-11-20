---

description: "Task list for Publications 链接修复与 CCF 等级完整标注"
---

# Tasks: Publications 链接修复与 CCF 等级完整标注

**Input**: Design documents from `/specs/009-publication-link-ccf/`

**Prerequisites**: plan.md、spec.md、research.md、data-model.md、contracts/（publications-data.md、ccf-rating.md、publication-item-dom.md）、quickstart.md

**Tests**: spec 未要求 TDD，plan 明确「不引入 e2e 框架或新测试依赖」。因此不生成 tests/ 目录下的测试任务；验证由 quickstart.md 中的一次性门禁脚本完成（脚本放 `/tmp`，不入库，证据入 `specs/009-publication-link-ccf/evidence/`）。

**Organization**: 按 user story 分组，保证每个 story 可独立实现与验收。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行（不同文件、无未完成依赖）
- **[Story]**: 所属 user story（US1–US4）
- 每条任务均给出明确文件路径

## Path Conventions

单一 Astro 项目：`src/`、`public/` 位于仓库根；特性产物在 `specs/009-publication-link-ccf/`；一次性脚本放 `/tmp`（不入库）。

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 建立基线、快照与一次性审计工具的前置条件

- [X] T001 运行基线门禁 `npm run check && npm run build`，确认两条命令退出码均为 0；创建 `specs/009-publication-link-ccf/evidence/verification.md` 并写入「Baseline」章节（命令、退出码、构建摘要）
- [X] T002 [P] 生成改动前数据快照并固化基线：`git rev-parse HEAD > /tmp/publications-base.sha`、`git show HEAD:src/data/publications.json > /tmp/publications-base.json`；把基线 commit SHA 写入 `evidence/verification.md` 的 Baseline 章节，确认快照为 135 条；后续不可变字段与范围检查一律以该快照/SHA 为准（源文件 `src/data/publications.json`）
- [X] T003 [P] 记录基线数据普查（只读，不改文件）：用 Node 读取 `src/data/publications.json` 确认 135 条、125 条 `url`（66 条 `doi.org` + 59 条 `arxiv.org`）、CCF 现状 A=67/B=10/C=0/无等级=58、17 条 `Findings of *`、1 条 WWW 2015 Companion；把数字暂存在 `/tmp/baseline-census.txt`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 数据契约强化 + 一次性判定脚本；所有 user story 都依赖

**⚠️ CRITICAL**: 本阶段完成前，任何数据改动都可能绕过构建校验

- [X] T004 [P] 在 `src/content.config.ts` 的 publications schema 中强化数据契约：将 `ccf` 的 `.nullable()` 去掉（保留 `z.enum(['A','B','C'])` 取值）；在既有 `superRefine` 中新增 `pub.url === null` 即 `ctx.addIssue`（`path: ['url']`，消息说明「url 缺省必须省略字段，不得为 null」）；新增 `url` 缺失且 `date` 存在时的反向规则（`path: ['date']`，消息说明「无 url 的条目不得保留 date」），与既有「有 url 必须有 date」构成双向约束（FR-007、FR-018）；不修改共享 `httpsUrl` 校验，以免影响 teachers/students/graduates
- [X] T005 [P] 编写一次性链接审计脚本 `/tmp/audit-links.mjs`（不入库）：读取 `src/data/publications.json`；对 `doi.org` 链接调用 `https://api.crossref.org/works/{doi}`（取 title/container-title/published）与 `https://doi.org/api/handles/{doi}`；对 `arxiv.org` 链接调用 `https://export.arxiv.org/api/query?id_list={id}`（取 title/`doi`/`journal_ref`）；按 research.md R3 归一化题名（NFKC、小写、去标点与空白）并输出 TSV：条目、当前 URL、元数据题名、题名是否匹配、发现的形式 DOI/journal_ref
- [X] T006 [P] 编写一次性 CCF 判定脚本 `/tmp/ccf-expect.mjs`（不入库）：实现 venue 归一化（`IEEE ICME`→`ICME`；两种 TASLP 全称→`TASLP`；`IEEE TRANSACTIONS ON INFORMATION FORENSICS AND SECURITY`→`TIFS`；其余 trim+大写；中文原样）、类型资格前置（`Findings of ACL` 7 条、`Findings of EMNLP` 10 条、WWW 2015 Companion 1 条→无等级）、年份分支（IJCAI `year ≥ 2026 → B` 否则 `A`；CVMJ `year ≥ 2026 → B` 否则 `C`）与 `contracts/ccf-rating.md` §4 判定表；读取 `src/data/publications.json` 输出逐条期望值与分布
- [X] T007 运行 T005/T006 脚本核对基线：确认现行数据相对期望矩阵恰好有 42 条差异（38 条 `none→B`：EMNLP 9、IJCAI2026 4、COLING 5、ICME 3、ICASSP 4、NAACL 1、DASFAA 1、TASLP 3、信息安全学报 1、ECAI 1、CIKM 5、WSDM 1；3 条 `none→C`：CVMJ 2 + KBS 1；1 条 `A→none`：Findings of ACL 2021）；结果写入 `/tmp/ccf-baseline-diff.txt`

**Checkpoint**: 数据契约（url/date 双向 + ccf/url 非 null）生效，判定工具就绪

---

## Phase 3: User Story 1 - 中文论文链接不再指向无关文献 (Priority: P1) 🎯 MVP

**Goal**: 4 条中文论文链接改为期刊官方 DOI，题名一致；无准确替代时移除 `url` 与 `date`

**Independent Test**: 逐条打开 4 条中文条目的 `url`，落地页题名与条目一致；无任何指向 Hans 出版社其他期刊、无关 DOI 或检索页的链接

- [X] T008 [US1] 核验 4 条中文论文的官方目标（只读网络核验）：`https://doi.org/10.7544/issn1000-1239.202220340`（文本后门攻击与防御综述）、`https://doi.org/10.19363/J.cnki.cn10-1380/tn.2020.01.03`（智能回复系统研究综述）、`https://doi.org/10.7544/issn1000-1239.2018.20170055`（文本情绪分析综述）、`https://doi.org/10.11897/SP.J.1016.2016.00169`（一种面向大规模社会信息网络的多层社区发现算法）；每条用 handle API（`https://doi.org/api/handles/{doi}`）+ 期刊落地页/官方 PDF 题名确认同一篇；若某条无法确认，先整理为清单提交课题组负责人确认；确认无法核实后再决定改为「移除」（删除 `url` 并同步删除 `date`），确认结果写入 `link-audit.md`（Constitution I）
- [X] T009 [US1] 按 T008 结论修改 `src/data/publications.json` 中 4 条中文条目的 `url`：判定为替换时写入目标 DOI 且 `date` 保持不变；判定为移除时删除 `url` 并同步删除 `date`；不得改动 `title`/`venue`/`year`/`authors`/`featured`
- [X] T010 [P] [US1] 创建 `specs/009-publication-link-ccf/evidence/link-audit.md`：写入契约固定表头 `| # | 条目（title · venue · year） | 当前 URL | 最终 URL | 来源类型 | 核验证据 | 决定 | 理由 |`，填写 4 条中文行（来源类型=DOI、决定=替换；若 T008 判定移除则来源类型=无、决定=移除；证据写明 handle API 与落地页题名匹配或无法核实的确认记录）
- [X] T011 [US1] 运行 `npm run build` 并通过 Node 检查 `dist/publications/index.html`：判定为替换的中文条目标题均为指向新 DOI 的锚点且无旧 Hans DOI 残留；判定为移除的条目应为纯文本且无 `date`；构建退出码 0（独立验收本 story）

**Checkpoint**: US1 可独立验收（中文链接正确，其余数据未受影响的构建通过）

---

## Phase 4: User Story 2 - CCF 等级按论文年份与类型准确标注 (Priority: P1)

**Goal**: 按 `year` 对应目录版本、类型资格与中文目录完成 42 条 CCF 变更，最终 A=66/B=48/C=3/无等级=18

**Independent Test**: 运行 `/tmp/ccf-expect.mjs` 全部 135 条 0 不一致；抽查 IJCAI 2025=A、IJCAI 2026=B、Findings of ACL 2021=无、信息安全学报=B、CVMJ 2024/2025=C、KBS=C、WWW 2015=无

- [X] T012 [US2] 按 T007 判定结果修改 `src/data/publications.json` 的 `ccf`（共 42 条）：新增 B 38 条（EMNLP 9、IJCAI 2026 4、COLING 5、ICME 3、ICASSP 4、NAACL 1、DASFAA 1、TASLP 3、信息安全学报 1、ECAI 1、CIKM 5、WSDM 1）；新增 C 3 条（CVMJ 2、Knowledge-Based Systems 1）；删除 1 条错误 A（Findings of ACL 2021 `Enhanching Zero-shot and Few-shot Stance Detection with Commonsense Knowledge Graph`）；其余 93 条保持不变
- [X] T013 [P] [US2] 创建 `specs/009-publication-link-ccf/evidence/ccf-audit.md`：135 行，表头固定为 `| # | 条目 | venue | year | 目录版本 | 类型资格 | 最终 CCF | 依据 |`（`#` 为 1–135 连续编号，T027 依赖该列计数；目录版本取 2015/2019/2022/2026/中文2019/当时版本）；18 条无等级行的类型资格必须写明 Findings/Companion，不得写「目录未收录」；2014 及以前 CIKM/WSDM 行注明按 B 处理及依据
- [X] T014 [US2] 用 `/tmp/ccf-expect.mjs` 复算修改后的 `src/data/publications.json`：0 条不一致、分布恰为 A=66/B=48/C=3/none=18，且 7 条关键抽查全部符合；输出留存到 `/tmp/ccf-after.txt`

**Checkpoint**: US2 可独立验收（CCF 分布与关键抽查全通过）

---

## Phase 5: User Story 3 - 全量链接经过核验并尽量补全 (Priority: P2)

**Goal**: 125 条现有链接全部核验并修正（含 EMNLP 2019 书籍 DOI），10 条无链接条目审计后补链或保持无链接

**Independent Test**: `evidence/link-audit.md` 135 行齐全；所有链接 HTTPS；arXiv 行均有「未发现正式版本/正式版尚未上线」理由；无 CNKI/万方/维普/百度学术平台页面（按 host 判定）

- [X] T015 [US3] 用 `/tmp/audit-links.mjs` 核验 US1 之外的现有链接（62 条 DOI + 59 条 arXiv），逐条判定：题名匹配则保留；arXiv 存在 `doi`/`journal_ref` 且经 Crossref/论文集/期刊官网复核为题名一致的正式版本则替换；付费墙/登录/403/验证码/doi.org 600 不作为移除理由；付费墙说明写入审计
- [X] T016 [US3] 逐条审计 10 条无链接条目（IRIS 2026 Findings of EMNLP；AutoPrompt ICCV 2025；Pruning LLMs Findings of ACL 2024；CLIO / Slot Dependency / TAKE / Target Really Matters 四条 COLING 2022；Enhanching Zero-shot Findings of ACL 2021；Addressing Extraction and Generation Separately TASLP 2021；Learning Class-Transductive Intent Representations IJCAI 2021）：检索 DOI/出版社/会议论文集/期刊官网，题名与书目元数据一致才补链；若存在无法核实项，先整理清单提交课题组负责人确认，再将确认结果写入 `link-audit.md`（Constitution I）
- [X] T017 [US3] 按 T015/T016 结论修改 `src/data/publications.json`：修正 EMNLP 2019 `Ranking and Sampling in Open-Domain Question Answering` 的书籍 DOI 为 `https://doi.org/10.18653/v1/D19-1245`（`date` 不变）；应用所有已确认的 arXiv→官方替换（仅改 `url`，`date` 不变）；为可核实的无链接条目补 `url` 与准确 `date`（正式发布日期或 arXiv v1 提交日，格式 `YYYY-MM-DD` 合法日历日期）；无法核实且经课题组负责人确认的保持无 `url`、无 `date`；不得改动 `title`/`venue`/`year`/`authors`/`featured`
- [X] T018 [P] [US3] 补全 `specs/009-publication-link-ccf/evidence/link-audit.md` 至 135 行（其余 131 行）：来源类型（DOI/出版社/会议论文集/期刊官网/arXiv/无）、核验证据（Crossref/arXiv API/落地页 + 题名匹配结论）、决定（保留/替换/新增/移除/保持无链接）、理由；每条 arXiv 行必须写明「未发现正式版本」或「正式版尚未上线」；无法核实项的理由须引用课题组负责人确认记录
- [X] T019 [US3] 运行链接数据门禁（quickstart.md §2 中的 url/date/HTTPS 断言 + `awk '/^\| [0-9]+ \|/{n++} END{print n}' specs/009-publication-link-ccf/evidence/link-audit.md`）：输出 0 条 `url⇔date` 违规、0 条非 HTTPS、0 条 CNKI/万方/维普/百度学术平台页面（按 host 判定：`cnki.net`、`wanfangdata.com.cn`、`cqvip.com`、`xueshu.baidu.com`；DOI 字符串中的 `cnki` 注册机构标识不判错）、审计表 135 行，且 `npm run build` 退出码 0

**Checkpoint**: US1–US3 数据层全部就绪，链接与 CCF 审计记录可追溯

---

## Phase 6: User Story 4 - 页面渲染与数据契约无回归 (Priority: P3)

**Goal**: DOM 中无伪造 CCF 徽标/伪造 Link 文案，槽位宽度由 CSS 预留，布局与改动范围无回归

**Independent Test**: 构建产物中 135 个条目、117 个徽标（66/48/3）、`.pub-link` 锚点数等于有 `url` 条目数且每个有 `url` 条目共 2 个同 URL 锚点、0 条裸 `Link ↗`；十档视口（1440/1280/1024/768/767/576/575/480/375/320px）与 200% 缩放下槽宽与布局稳定

- [X] T020 [US4] 在浏览器（`npm run dev` + DevTools）量测当前 `.pub-link` 中 `Link ↗` 的自然宽度（`1rem`，预期 45–47px），向上取整并把实测值写入 `specs/009-publication-link-ccf/contracts/publication-item-dom.md` §3 的 LINK 槽目标宽度作为实现值；45–47px 仅为预期区间，不作为 MUST；记录与预期区间的差异原因（如有），硬性验收为满槽/空槽宽度差 ≤1px
- [X] T021 [US4] 修改 `src/components/PublicationItem.astro`：`hasCcf || hasLink` 时渲染 `.pub-side` 双槽；有 `ccf` 才渲染 `CCFBadge`，否则槽内为空（无子元素、无文本、无 `aria-hidden`）；有 `url` 才渲染 `<a class="pub-link">`，否则槽内为空；删除 `.pub-slot--empty` 的 `visibility: hidden` 与伪造的 `CCFBadge rating="A"`、伪造的 `<span class="pub-link">Link ↗</span>`；新增 `.pub-slot-ccf { min-inline-size: 59.66px; }` 与 `.pub-slot-link { min-inline-size: <T020 实测值>px; justify-content: flex-end; }`；不改 `Props`、断点、列宽、字号与标签顺序
- [X] T022 [US4] 编写并运行一次性 DOM 门禁 `/tmp/dom-gate.mjs`（quickstart.md §6），对 `dist/publications/index.html`（剔除 `<style>`）断言：`articles=135`；徽标 117 且 A=66/B=48/C=3；每条目徽标 ≤1；有 `url` 条目锚点总数为 2 且两个 `href` 均等于该条目 `url`；`.pub-link` 锚点数 = 有 `url` 条目数；0 条不在锚点内的 `Link ↗`；无 `url` 条目 0 个 `<a>`；无 `ccf` 条目 0 个 `ccf-badge`；输出 `DOM GATE PASS`
- [X] T023 [US4] 运行 `npm run preview`，在 `/nlp-home/publications/` 与 `/` 按 1440/1280/1024/768/767/576/575/480/375/320px 十档视口 + 200% 缩放检查（重点关注 767/575 边界）：用 quickstart.md §7 控制台脚本量测 `.pub-slot-ccf`/`.pub-slot-link` 宽度 spread ≤1px、page overflow ≤0、overflowing items = 0；按 006 口径确认标签簇与首行文字基线偏差 ≤1px（若超出，仅为两槽补相同 `min-block-size`，不得恢复假标签）
- [X] T024 [US4] 范围检查：运行 `git diff --stat "$(cat /tmp/publications-base.sha)"` 与 `git status --short`（以 T002 记录的基线 SHA 为基准，覆盖中途提交与未提交改动），确认源文件改动仅 `src/data/publications.json`、`src/components/PublicationItem.astro`、`src/content.config.ts`，无 `src/pages/publications.astro`、`src/pages/index.astro`、`src/components/CCFBadge.astro`、`src/styles/global.css`、`.github/workflows/deploy.yml` 改动；结果暂存到 `/tmp/scope-check.txt`

**Checkpoint**: 所有 story 均独立可用且 DOM/布局验收通过

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 最终门禁、证据归档与成功标准复核

- [X] T025 [P] 最终门禁：依次运行 `npm run check && npm run build`、quickstart.md §2 数据门禁、quickstart.md §3 不可变字段检查（以 T002 的 `/tmp/publications-base.json` 为准，不得重新从 HEAD 生成）、§6 DOM 门禁，全部通过；输出暂存 `/tmp/final-gates.txt`
- [X] T026 补全 `specs/009-publication-link-ccf/evidence/verification.md`：最终构建输出、数据门禁计数（entries=135、A=66/B=48/C=3/none=18、url⇔date 违规=0、非 HTTPS=0、null url/ccf=0）、DOM 计数（articles=135、badges=117、anchors=有 url 条目数）、十档视口与 200% 缩放结论、基于基线 SHA 的 `git diff --stat` 范围（依赖 T023 的视口结论与 T025 的最终门禁输出；不得先于 T025）
- [X] T027 审计覆盖复核（依赖 T025/T026；两表均以 `| # |` 编号列计数）：对 `specs/009-publication-link-ccf/evidence/link-audit.md` 与 `ccf-audit.md` 各运行 `awk '/^\| [0-9]+ \|/{n++} END{print n}'`，均须为 135；逐条对照 spec.md 的 SC-001～SC-008 勾选结论，确认无未解释的缺失（无法核实项均有理由）

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖，立即开始
- **Foundational (Phase 2)**: 依赖 Setup；**阻塞全部 user story**（T004 的 schema refine 必须先于任何数据改动）
- **US1 (Phase 3)**: 依赖 Phase 2；无其他 story 依赖
- **US2 (Phase 4)**: 依赖 Phase 2；与 US1 同改 `publications.json`，须串行写入（US1 的 T009 先于 T012）
- **US3 (Phase 5)**: 依赖 Phase 2 与 US1（中文 4 条已定型）；与 US2 共用 `publications.json`，须串行
- **US4 (Phase 6)**: 代码改动（T020/T021）只依赖 Phase 2；但 T022 的徽标计数依赖 US2、锚点数依赖 US3，故按 P1→P2→P3 顺序收尾
- **Polish (Phase 7)**: 依赖全部 story 完成；T025 先行，T026 依赖 T025（另依赖 T023 的视口结论），T027 依赖 T026

### Within Each User Story

- US1：T008 核验 → T009 改数据 / T010 审计记录（[P]，不同文件）→ T011 构建验证
- US2：T012 改数据 → T013 审计记录（[P]）→ T014 复算验证
- US3：T015/T016 审计分析 → T017 改数据 → T018 审计记录（[P]）→ T019 门禁
- US4：T020 量测 → T021 组件改造 → T022/T023 门禁与视口 → T024 范围检查

### Parallel Opportunities

- Setup：T002 与 T003 可并行
- Foundational：T004、T005、T006 可并行；T007 依赖 T005+T006
- US1：T009 与 T010 可并行（`publications.json` vs `link-audit.md`）
- US2：T013 可与 T012/T014 并行（`ccf-audit.md` 独立于数据文件）
- US3：T018 可与 T017/T019 并行（证据文件独立）
- US4：T022 与 T023 在 T021 完成后可并行（DOM 断言 vs 视口量测）
- Polish：T025 → T026 → T027 为串行链（T026 依赖 T023/T025，T027 依赖 T026），不可并行

**注意**：所有 `publications.json` 写入任务（T009、T012、T017）必须串行，同一文件不可并行编辑。

### Parallel Example: Foundational

```bash
Task: "T004 在 src/content.config.ts 增加无 url 不得有 date 的 refine"
Task: "T005 编写 /tmp/audit-links.mjs 链接审计脚本"
Task: "T006 编写 /tmp/ccf-expect.mjs CCF 判定脚本"
```

## Implementation Strategy

### MVP First（US1 + US2，二者均为 P1）

1. Phase 1 Setup → Phase 2 Foundational
2. US1：修复 4 条中文链接并产出 link-audit 前 4 行
3. US2：完成 42 条 CCF 变更并产出 ccf-audit
4. **STOP and VALIDATE**：`npm run build` + `/tmp/ccf-expect.mjs` 分布 66/48/3/18
5. 可先行演示：中文链接正确、CCF 标注完整

### Incremental Delivery

1. Setup + Foundational → 基础就绪
2. US1 → 独立验收（中文链接）
3. US2 → 独立验收（CCF 完整性）
4. US3 → 独立验收（全量链接 + 补链 + 审计 135 行）
5. US4 → 独立验收（DOM 真实性 + 布局 + 范围）
6. Polish → 最终门禁与证据归档

### Notes

- 一次性脚本（`/tmp/*.mjs`）不入库；`evidence/*.md` 随特性提交
- 数据改动仅限 `url` / `ccf` / 随 `url` 增删的 `date`；其余字段零改动
- 每个任务或逻辑组完成后可提交；任一 checkpoint 可停下独立验收；中途提交后，范围/不可变检查一律以 T002 记录的基线 SHA（`/tmp/publications-base.sha`）为基准，不得用 HEAD 重新生成基线
- 避免：并行编辑 `src/data/publications.json`、在组件中恢复假徽标/假链接、用页面级 `overflow-x: hidden` 掩盖溢出

---

## Phase 8: Convergence

**Source**: `/speckit-converge` 对照 spec.md / plan.md / tasks.md 与当前代码的复核结果（2026-11-20）

- [X] T028 **CRITICAL** 按 spec「已知缺陷与核验结果」表逐条复核 4 条中文条目的目标 DOI（`10.7544/issn1000-1239.202220340`、`10.19363/J.cnki.cn10-1380/tn.2020.01.03`、`10.7544/issn1000-1239.2018.20170055`、`10.11897/SP.J.1016.2016.00169`）：题名一致者恢复 `url` 并同步补回 `date`（取基线 `c87e39d3776525351af7d094d23afc7aabe5278f` 的原 `date` 或官方发布日期）；仅当目标经复核确认不可用（DOI 失效、跳转其他文献等）且经课题组负责人确认后，才允许保持无链接，并把确认记录写入 `specs/009-publication-link-ccf/evidence/link-audit.md`；同步修正该 4 行的移除依据引用（应为 FR-004/FR-005/FR-007，而非 FR-008）与 `evidence/verification.md` 的链接/锚点计数，重跑数据门禁、`npm run build` 与 DOM 门禁 per FR-004/FR-005/SC-002/Constitution I (contradicts)
- [X] T029 将 `specs/009-publication-link-ccf/evidence/link-audit.md` 中 4 条保留 arXiv 条目（#10、#16–#18）的「来源类型」由「出版社」改为「arXiv」，与 FR-009 的来源类型枚举一致 per FR-009 (partial)
