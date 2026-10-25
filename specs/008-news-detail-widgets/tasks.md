---

description: "Task list for 新闻详情页重点控件与三论文解读新闻"
---

# Tasks: 新闻详情页重点控件与三论文解读新闻

**Input**: Design documents from `/specs/008-news-detail-widgets/`

**Prerequisites**: plan.md（技术栈与结构）、spec.md（US1–US5、FR-001–FR-048）、research.md（已验证的解析行为与事实基准）、data-model.md（字段约束）、contracts/markdown-authoring.md、contracts/rendered-dom.md、quickstart.md（验收与故障注入）

**Tests**: 本特性在 spec Assumptions 与 plan.md「Testing」中明确要求用 Node 内置 `node:test` 做轻量 Markdown fixture 回归（零新增依赖、不引入 E2E 框架），因此生成测试任务；未要求 TDD。

**Organization**: 任务按用户故事分组，每个故事可独立实现与验证。控件类故事（US1/US2/US4）只改插件、样式与测试；内容故事（US3）消费控件；文档故事（US5）记录实际语法与行为。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行执行（不同文件、且不依赖未完成任务）
- **[Story]**: 所属用户故事（US1–US5）；Setup / Foundational / Polish 阶段不带 Story 标签
- 每条任务都包含明确的文件路径与可验证的完成标准

## Path Conventions

- 单项目静态站点（Astro 7）：`astro.config.mjs`、`src/`、`tests/`、`docs/`
- 测试 fixture：`specs/008-news-detail-widgets/fixtures/`
- 新闻内容与配图：`src/content/news/`
- 构建产物：`dist/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 在改动 Markdown 管线前锁定基线，解除页面级裁剪的宪法冲突，并锁定插件所依赖的精确版本

- [x] T028 移除 `src/styles/global.css` 中 `body { overflow-x: hidden }`（Constitution VI 禁止以页面级容器裁剪掩盖横向溢出）：删除前用无头浏览器对全站 18 个页面 × 320/375/768/1024/1280/1440px 强制 `overflow-x: visible`，逐元素 `getBoundingClientRect()` + `scrollWidth` 双重审计；结果 108 次测量 0 溢出，故移除不暴露既有缺陷。MUST 早于 T001 基线记录执行（该行删除会改变 CSS 资产哈希与 HTML 引用）（2026-10-23 已完成）
- [X] T001 记录改动前基线：运行 `npm run build`，将改动前已存在的 14 个 slug 的 `dist/news/<slug>/index.html`（显式排除新增文章 `self-taught-rlvr-2026`）的 SHA-256 写入 `/tmp/news-baseline/before.sha256`、构建日志写入 `/tmp/news-baseline/build-before.log` 并记录 warning 数量（quickstart §2、CHK038、FR-032/036）
- [X] T002 在 `package.json` 的 `devDependencies` 中以精确版本（不带 `^`）锁定 `@astrojs/markdown-satteri@0.4.3` 与 `satteri@0.10.5`，运行 `npm install` 刷新 `package-lock.json`，并用 `npm ls @astrojs/markdown-satteri satteri` 确认版本（plan Technical Context、CHK027）

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 建立所有控件共用的构建期插件骨架、处理器注册、样式入口与 fixture 测试夹具

**⚠️ CRITICAL**: 本阶段完成前，任何用户故事都不能开始

- [X] T003 [P] 创建 `src/markdown/news-widgets.mjs`（ESM），导出 `newsHighlightPlugin`、`newsTablePlugin`、`newsBibtexPlugin`、`newsExternalLinksPlugin`；实现共用诊断助手（硬错误 `throw new Error("[news-widgets] <file>:<line> …")`，受控 warning `console.warn`，位置取自 `ctx.fileURL` 与 `node.position.start`）与基于 `ctx.source` 原始片段的容器闭合判定助手；实现 `newsExternalLinksPlugin`（hast：仅对“唯一子节点为 `img` 的 `a[href^="http"]`”与 `arxiv.org` 论文链接补 `target="_blank"` 与 `rel="noopener noreferrer"`，其他正文外链不改写），三个控件插件先以空 visitor 占位，保证配置可加载
- [X] T004 在 `astro.config.mjs` 注册 satteri processor：`markdown.processor = satteri({ features: { directive: true }, mdastPlugins: [newsHighlightPlugin, newsTablePlugin], hastPlugins: [newsBibtexPlugin, newsExternalLinksPlugin] })`，并设置 `markdown.syntaxHighlight = { type: 'shiki', excludeLangs: ['bibtex'] }`；`options: { position: true }` 必须写在读取位置的 mdast 插件定义上（`satteri()` 0.4.3 仅接受 `mdastPlugins`/`hastPlugins`/`features`）；运行 `npm run build` 并对照 T001 基线
- [X] T005 [P] 创建 `src/styles/news-widgets.css`（先写入 `.news-body` 作用域的占位注释与设计变量引用），并在 `src/pages/news/[id].astro` frontmatter 中 `import '../styles/news-widgets.css'`，确认样式只在详情页打包（FR-031）
- [X] T006 创建 `tests/news-widgets.test.mjs`（`node:test` + `node:assert/strict`，零新增依赖）：用 `createSatteriMarkdownProcessor`（`features: { directive: true }`、`syntaxHighlight: { type: 'shiki', excludeLangs: ['bibtex'] }`、四个插件）渲染 fixture，捕获 `console.warn` 并返回 `{ html, warnings }`；新增 `specs/008-news-detail-widgets/fixtures/plain.md`，断言普通表格不含 `.news-table`、普通代码块不含 `.news-bib`、被链接包裹的图片链接与 arXiv 论文链接带 `target="_blank"`、其他正文外链不带 `target`（RD-A8/A9）

**Checkpoint**: 管线可加载、构建通过、既有新闻 HTML 与基线完全一致（外链插件只作用于配图与 arXiv 论文链接）

---

## Phase 3: User Story 1 - 维护者用 Markdown 插入高亮块 (Priority: P1) 🎯 MVP

**Goal**: `:::highlight[可选标题] … :::` 渲染为圆角、带底色、左侧 4px 强调竖线的高亮块；标题可选，无标题不出现空标题行。

**Independent Test**: 新建一篇临时新闻，分别放入带标题与不带标题的高亮块，构建后详情页两种形态均正确；新闻列表页不出现控件样式。

### Implementation for User Story 1

- [X] T007 [US1] 在 `src/markdown/news-widgets.mjs` 实现 `newsHighlightPlugin`（mdast，`options: { position: true }`）：识别 `containerDirective` 且 `name === 'highlight'`；取 `data.directiveLabel` 为标题并输出 `p.news-highlight__title[role="heading"][aria-level="3"]`，无标题时不生成节点；输出 `data.hName='aside'`、`hProperties={ className: ['news-highlight'], role: 'note' }`；按 `ctx.source` 校验最后一行只有 `:::`，未闭合 → 硬错误（含文件与行号）；空内容（仅空白文本；`thematicBreak` 计为可见）→ warning 并整块移除；未知容器（name 不属于 `highlight`/`table`）→ warning 并展开 children；`textDirective`/`leafDirective` 按源码还原为文本；同名嵌套 → warning 并降级；末子节点为 `table` 且末行首格 trim 后为 `:::` 时删除该行并 warning（FR-006–FR-010、FR-048、CHK008）
- [X] T008 [P] [US1] 在 `src/styles/news-widgets.css` 增加 `.news-body .news-highlight` 及其标题/内部元素样式：`background: var(--sky)`、`border: 1px solid var(--line)`、`border-left: 4px solid var(--blue)`、`border-radius: 12px`、`padding: 18px 20px`、`margin-block: 1.25em`、`overflow-wrap: anywhere`；标题 `font-weight: 600`、`color: var(--ink)`；块内 `code`/`pre`/`blockquote`/`table` 仅加最小可读样式（RS-01、FR-010）
- [X] T009 [US1] 在 `tests/news-widgets.test.mjs` 追加高亮块 fixture 回归，并新增 `specs/008-news-detail-widgets/fixtures/highlight.md`、`highlight-empty.md`、`highlight-unclosed.md`、`highlight-nested.md`、`unknown-container.md`：断言带标题/无标题 DOM、多个块独立、长 URL 文本完整、空块 warning 且无 `aside`、`thematicBreak` 保留、未闭合抛出含文件与行号的错误、未知容器展开并 warning、`1:2` 等冒号文本不被当作指令（RD-A1、RB-01）

**Checkpoint**: US1 可独立交付；高亮块在详情页渲染正确，列表页零变化

---

## Phase 4: User Story 2 - 维护者用 Markdown 插入可复制的 BibTeX 引用块 (Priority: P1)

**Goal**: ` ```bibtex ` 围栏块渲染为带工具栏与固定 32×32 图标复制按钮的 BibTeX 引用块；复制逐字一致，长行只在块内横向滚动。

**Independent Test**: 在临时新闻中放入三条不同长度的 BibTeX 条目（含一条超宽长行），桌面与 375px 下点击复制并粘贴核对；页面无横向滚动、块内可滚动。

### Implementation for User Story 2

- [X] T010 [US2] 在 `src/markdown/news-widgets.mjs` 实现 `newsBibtexPlugin`（hast，`options: { position: true }`）：匹配 `pre > code.language-bibtex`；`textContent` 为空 → warning，保留空 `pre`、不生成工具栏；否则构造 `div.news-bib`，children 顺序 MUST 为“工具栏 → `pre`”，用 `ctx.replaceNode` 替换；工具栏含 `span.news-bib__label`、`button.news-bib__copy[type="button"][hidden][aria-label="复制引用"]`（内含复制/成功/失败三个 `aria-hidden="true"` SVG）与 `span.news-bib__status[aria-live="polite"]`；`pre` 设 `tabindex="0"`、`role="region"`、`aria-label="BibTeX 引用"`；对 `language-BibTeX`、`language-bib` 等非小写标记抛硬错误（含文件与行号）（RD-02、FR-011–FR-018、FR-048）
- [X] T011 [P] [US2] 在 `src/styles/news-widgets.css` 增加 `.news-body .news-bib` 系列样式：`border-radius: 12px`、`overflow: hidden`、`min-width: 0`、`max-width: 100%`；工具栏 `display:flex; justify-content:flex-end; align-items:center; gap:8px`；`pre { overflow-x:auto; max-width:100% }`；复制按钮 `width:32px; height:32px; padding:0`；状态区 `min-height:1.5em; white-space:nowrap`；MUST 包含 `.news-bib__copy[hidden] { display: none !important; }`；MUST 定义图标三态：`.news-bib__icon { width:16px; height:16px }`，默认仅 `.news-bib__icon--copy` 可见，`.is-copied` 时仅 `.news-bib__icon--success` 可见（局部成功绿 `#1a7f37`），`.is-error` 时仅 `.news-bib__icon--error` 可见（局部失败红 `#b42318`），两色仅在控件内使用、不新增全局变量，三种状态任一时刻只显示一个图标（RS-01、CHK028、FR-013/014）
- [X] T012 [US2] 在 `src/pages/news/[id].astro` 末尾加入 `<script is:inline>` 事件委托：命中 `button.news-bib__copy` → 取最近 `.news-bib` 内 `pre code` 的 `textContent` 并去掉末尾单个 `\n`；调用 `navigator.clipboard.writeText`，成功加 `is-copied`、失败加 `is-error`，文案只写入 `.news-bib__status`（“已复制”/“复制失败，请手动选择”），约 2 秒复位，重复点击先清除旧计时器；脚本运行时移除按钮 `hidden`，无 JS 时按钮保持隐藏（FR-012–FR-021、RD-04）
- [X] T013 [US2] 在 `tests/news-widgets.test.mjs` 追加 BibTeX fixture 回归，并新增 `specs/008-news-detail-widgets/fixtures/bibtex.md`、`bibtex-empty.md`、`bibtex-uppercase.md`：断言工具栏是 `.news-bib` 第一个子节点、`pre` 第二个、按钮 `hidden` 与 `aria-label`、三个 SVG `aria-hidden`、状态区 `aria-live` 且初始为空、`pre` 三属性齐全、多块独立、`&`/`<` 按纯文本转义保留、空块无工具栏、非小写标记抛错；并断言 `news-widgets.css` 含默认 copy 图标可见、`is-copied` 仅 success、`is-error` 仅 error 的三态规则（实际可见性由 T025 浏览器验收）（RD-A2–A5、CHK017、FR-013/014）

**Checkpoint**: US1 + US2 均可在无 US4/US3 的情况下独立验证

---

## Phase 5: User Story 4 - 维护者用 Markdown 插入可横向滚动的表格块 (Priority: P2)

**Goal**: `:::table[可选标题] … :::` 渲染为带可选图注的真实 `<table>`，窄视口下只在容器内横向滚动。

**Independent Test**: 临时新闻放入带标题/无标题、3 列/5 列各一个表格块，在 375/768/1024/≥1280px 下检查容器滚动、页面无横向滚动、键盘可聚焦。

> **排序说明**: US4 与 US3 同为 P2，但 US3 的内容验收依赖表格块实际可渲染，故 US4 先执行。

### Implementation for User Story 4

- [X] T014 [US4] 在 `src/markdown/news-widgets.mjs` 实现 `newsTablePlugin`（mdast，`options: { position: true }`）：识别 `containerDirective` 且 `name === 'table'`；取 `data.directiveLabel` 为图注；对容器内每个 `table` 分别输出独立的 `figure.news-table` → 第一张表可选 `figcaption.news-table__caption`（后续表不生成）→ `div.news-table__scroll[tabindex="0"][role="region"][aria-label="对比表"]` → 恰好一张 `table`；多表按源顺序排列；闭合判定同 T007（未闭合硬错误）；children 无 `table` 节点 → warning 并移除；末行被吞入的 `:::` 删除并 warning；确保与 T007 的未知容器逻辑不重复处理 `table`（RD-03、FR-044–FR-047）
- [X] T015 [P] [US4] 在 `src/styles/news-widgets.css` 增加 `.news-body .news-table` 样式：`margin-block: 1.25em`；图注小字号、`color: var(--ink-soft)`；`.news-table__scroll { max-width:100%; overflow-x:auto }`；`table { width:max-content; min-width:100%; border-collapse:collapse }`；表头 `--sky` 背景、单元格 `1px solid var(--line)`、`padding: 8px 12px`、`white-space: normal`（RS-01、FR-046/047）
- [X] T016 [US4] 在 `tests/news-widgets.test.mjs` 追加表格块 fixture 回归，并新增 `specs/008-news-detail-widgets/fixtures/table.md`、`table-multiple.md`、`table-empty.md`、`table-unclosed.md`、`table-trailing-fence.md`：断言带标题有 `figcaption`、无标题无 `figcaption`、滚动容器三属性与真实 `<table>`、多张表格按源顺序各自生成独立 `figure.news-table` 与 `.news-table__scroll`（每个容器恰好一张表，仅第一张有 `figcaption`）、空表 warning 且无 `figure`、未闭合抛错、尾行 `:::` 被删除并 warning、普通 Markdown 表格不获得 `.news-table`（RD-A6–A8、RB-01）

**Checkpoint**: US1、US2、US4 三者均可独立验证

---

## Phase 6: User Story 3 - 读者阅读三论文解读新闻 (Priority: P2)

**Goal**: 新增 2026-10-23 中文长文，以 Self-Taught RLVR 为统一叙事解读 RLSD、NPO、CoPD，并在文中真实使用三种控件与三张主图。

**Independent Test**: 打开 `/news/self-taught-rlvr-2026/`，核对三篇论文各一节、每节一张主图与一个 BibTeX 块、全文 ≥2 个高亮块与 ≥1 个表格块、正文 ≥2,500 CJK；逐条对照 arXiv 页面。

### Implementation for User Story 3

- [X] T017 [P] [US3] 将三张论文方法框架图下载并存入 `src/content/news/`：`rlsd-method.png`（`https://arxiv.org/html/2604.03128v2/RLSD-method.png`）、`npo-overview.png`（`https://arxiv.org/html/2604.20733v2/figure3_overview.png`）、`copd-method.png`（`https://arxiv.org/html/2604.27083v1/copd-method.png`），校验尺寸（1790×825 / 1695×664 / 1932×919）且单张 ≤500KB（FR-040/042、SC-012）
- [X] T018 [US3] 撰写 `src/content/news/self-taught-rlvr-2026.md`：frontmatter `title`（原创、≤40 个 CJK 统一表意文字、英文/数字/标点不计、不与参考文章标题相同）、`date: 2026-10-23`、`summary`（80–200 个 Unicode code point，无 `:::highlight`/`:::table`/```` ```bibtex ````，不设 `cover`）；正文“总—分—总”，三篇各一节按“问题 → 方法 → 结论”展开，每节含真实论文标题/作者/机构（IIE, CAS / UCAS / JD.COM）/版本/公开链接、官方代码/模型信息（RLSD GitHub；NPO/CoPD 未发现官方代码仓库，列出 Hugging Face 论文页）、`[![alt](fig.png)](https://arxiv.org/abs/...)` 主图与紧随其后的普通段落图注（含论文标题、论文链接、`CC BY 4.0` 许可与“图片未修改，仅按页面宽度缩放”；点击图片或图注中的论文链接在新标签页打开）、一个 BibTeX 块；全文 ≥3 个 BibTeX（`yang2026rlsd`/`qin2026npo`/`gu2026copd`，三条均为 arXiv `@misc` + `eprint`/`archivePrefix`/`primaryClass` + `url`，全列作者；正文与条目均不呈现 NeurIPS 接收状态）、≥2 个高亮块、1 个 4 列（维度 + 三篇论文）、覆盖 ≥4 个对比维度的 `:::table` 对比表；正文 ≥2,500 CJK 字符；事实与数字仅取 research.md §7（NPO 以 v2 为准），不设“参考解读”署名（FR-023–FR-030、FR-037–FR-042）
- [X] T019 [P] [US3] 在 `src/content.config.ts` 增加构建期校验：schema 内全局 `summary` 用 `[...v].length` 保持 `≤200`（替代按 UTF-16 计数的 `.max(200)`）；另在模块加载期仿照 `validateSiteBrand()` 扫描 `src/content/news/self-taught-rlvr-2026.md` 的 frontmatter，按 code point 强制 `summary` 为 `80–200` 且不含控件语法，按 CJK 统一表意文字计数强制 `title ≤40`（英文/数字/标点不计）且不等于参考文章标题；MUST NOT 通过 schema 的 entry id 判断（Astro 不向 schema 暴露 id），MUST NOT 影响既有新闻（现有摘要允许短于 80），校验失败 MUST 构建失败并输出文件名（FR-023、data-model §1）
- [X] T020 [US3] 验证 `src/content/news/self-taught-rlvr-2026.md` 的内容约束：运行 quickstart §4.1 的 CJK 统计脚本确认 ≥2,500；统计 BibTeX/高亮/表格/主图数量；运行 `npm run build` 确认列表倒序与详情页渲染；记录实际数值用于验收（FR-028、SC-004）

**Checkpoint**: 新闻长文可独立阅读与验收，控件在真实内容中全部出现

---

## Phase 7: User Story 5 - 维护者查阅编辑文档并复用控件 (Priority: P3)

**Goal**: `docs/news-markdown-guide.md` 覆盖三种控件与新闻配图的完整用法、限制、诊断与验证步骤，并可从维护者入口发现。

**Independent Test**: 仅依据文档在临时新闻中添加三种控件与一张配图并本地预览成功；文档能回答 5 个易错点。

### Implementation for User Story 5

- [X] T021 [P] [US5] 撰写 `docs/news-markdown-guide.md`（中文，面向非前端维护者）：三种控件各给可复制模板与带/不带标题示例、支持内容、限制（不嵌套、`bibtex` 必须小写、结尾 `:::` 不可省、表格结尾前建议留空行）、控件与普通 Markdown 的边界（普通代码块 vs BibTeX 块、普通表格 vs 表格块）；“新闻配图”章节（标准 Markdown 写法、同目录存放与命名、alt、图注/论文链接/CC BY 4.0/“未修改”声明、≤500KB、缺失即构建失败）；硬错误/受控 warning 对照表与常见错误排查；本地验证步骤（`npm run dev`、`npm run build`、`npm run check`、四档视口 + 320px + 200% 缩放）（FR-003–FR-005、FR-043、SC-010）
- [X] T022 [P] [US5] 在 `src/data/README.md` 增加一行指向 `../docs/news-markdown-guide.md` 的链接（根 README 不存在，按 FR-003 使用既有维护者入口）

**Checkpoint**: 维护者无需阅读源码即可使用三种控件与新闻配图

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: 回归、跨页隔离、脚本体积、四档视口与故障注入验收

- [X] T023 回归门禁：运行 `npm run build`、`npm run check`、`node --test tests/news-widgets.test.mjs`；仅将改动前已存在的 14 个 slug 的 `dist/news/<slug>/index.html` 与 `/tmp/news-baseline/before.sha256` 对比（显式排除新增文章与列表页），确认既有新闻 HTML 与基线完全一致（既有新闻无配图链接与 arXiv 链接，外链插件不改写其他外链）；warning 总数不超过 `/tmp/news-baseline/build-before.log` 基线（FR-032/036、SC-006）
- [X] T024 [P] 跨页隔离与体积：检查 `dist/index.html`、`dist/news/index.html`、`dist/team/**`、`dist/publications/**` 不含 `news-highlight`/`news-bib`/`news-table`；测量 `src/pages/news/[id].astro` 中 `<script is:inline>` 的 UTF-8 字节数 ≤5KB；确认控件 CSS 仅详情页加载（FR-031、SC-009）
- [X] T025 浏览器矩阵验收：在 `dist/news/self-taught-rlvr-2026/index.html` 与改动前已存在的 14 个详情页（显式排除新增文章）按 quickstart §5–§6 检查 375/768/1024/≥1280px（补充 320px 与 200% 缩放）：页面级 `body { overflow-x: hidden }` 已于 T028 移除，直接测 `document.documentElement.scrollWidth ≤ innerWidth` 并逐元素 `getBoundingClientRect()`；复制成功/失败的三态图标同一时刻仅一个可见、键盘复制与滚动、无 JS、焦点可见（FR-009/013/014/015/019/021/033/041/046、SC-007/008/013）
- [X] T026 [P] 故障注入：按 quickstart §7 在临时 `src/content/news/__fixture-injection.md` 逐项注入未闭合、非小写 `bibtex`、空块、未知容器、表格尾行缺空行、空表格、错误图片路径，记录构建退出码与 `[news-widgets]` warning，完成后删除临时文件；硬错误 MUST 非零退出（FR-048、SC-014）
- [X] T027 [P] 内容与文档复核：按 quickstart §10 核对 `src/content/news/self-taught-rlvr-2026.md` 的标题/摘要/CJK/事实/BibTeX 解析/论文、代码/模型与 Hugging Face 论文页链接/图注许可/术语与公式；在 `docs/news-markdown-guide.md` 中抽查 5 个易错点均能找到答案（SC-004/010/012、CHK036）

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖；执行顺序为 T028（已完成）→ T001 → T002（T028 改动 CSS 资产哈希，必须先于基线记录；T002 的 `npm install` 会改动依赖，避免与基线构建并发）
- **Foundational (Phase 2)**: 依赖 Setup；T003 可先于 T005 并行；T004 依赖 T003；T006 依赖 T003
- **User Stories (Phase 3–7)**: 均依赖 Foundational 完成
  - US1、US2、US4 之间逻辑独立，但都要修改 `src/markdown/news-widgets.mjs` 与 `src/styles/news-widgets.css`，实际执行 MUST 串行
  - US3 依赖 US1 + US2 + US4（其验收要求三种控件与三张主图同时成立）
  - US5 依赖 US1 + US2 + US4（文档描述其真实语法与诊断行为），不依赖 US3 内容
- **Polish (Phase 8)**: 依赖全部目标用户故事完成

### User Story Dependencies

```text
Setup → Foundational ─┬─ US1 ─┐
                      ├─ US2 ─┼─ US3
                      ├─ US4 ─┘
                      └─ US5（依赖 US1/US2/US4）
US1–US5 → Polish
```

- **US1 (P1)**: Foundational 后可开始，无其他故事依赖；MVP
- **US2 (P1)**: Foundational 后可开始，与 US1 无逻辑依赖（共享文件需串行）
- **US4 (P2)**: Foundational 后可开始，与 US1/US2 无逻辑依赖
- **US3 (P2)**: 需 US1/US2/US4 就绪；T017 配图与 T019 schema 可并行
- **US5 (P3)**: 需 US1/US2/US4 就绪；不阻塞 US3

### Within Each User Story

- 插件实现 → 样式（可与插件并行）→ fixture 测试
- 测试 MUST 先确认失败点（空块 warning、硬错误等），再确认实现后通过
- 同一故事完成后再进入下一故事；每个 checkpoint 可独立验证

### Parallel Opportunities

- T003 与 T005 可并行（不同文件）
- 每个控件故事的样式任务（T008、T011、T015）可与对应插件任务并行
- US3 的 T017（配图）与 T019（schema）可并行；T018 依赖 T017
- US5 的 T021 与 T022 可并行
- Polish 的 T024、T026、T027 可并行，但 T023 必须最后确认全量回归

---

## Parallel Example: User Story 1

```bash
# 插件实现与样式可同时开始（不同文件）：
Task: "T007 [US1] 实现 newsHighlightPlugin 于 src/markdown/news-widgets.mjs"
Task: "T008 [P] [US1] 添加 .news-body .news-highlight 样式于 src/styles/news-widgets.css"

# 插件完成后追加 fixture 回归：
Task: "T009 [US1] 高亮块 fixture 与断言于 tests/news-widgets.test.mjs"
```

## Parallel Example: User Story 2

```bash
Task: "T010 [US2] 实现 newsBibtexPlugin 于 src/markdown/news-widgets.mjs"
Task: "T011 [P] [US2] 添加 .news-body .news-bib 样式于 src/styles/news-widgets.css"
Task: "T012 [US2] 复制事件委托脚本于 src/pages/news/[id].astro"
# T010 完成后：
Task: "T013 [US2] BibTeX fixture 与断言于 tests/news-widgets.test.mjs"
```

## Parallel Example: User Story 4

```bash
Task: "T014 [US4] 实现 newsTablePlugin 于 src/markdown/news-widgets.mjs"
Task: "T015 [P] [US4] 添加 .news-body .news-table 样式于 src/styles/news-widgets.css"
# T014 完成后：
Task: "T016 [US4] 表格块 fixture 与断言于 tests/news-widgets.test.mjs"
```

## Parallel Example: User Story 3

```bash
Task: "T017 [P] [US3] 下载三张论文主图到 src/content/news/"
Task: "T019 [P] [US3] 新闻 schema 的 summary/title 校验于 src/content.config.ts"
# T017 完成后：
Task: "T018 [US3] 撰写 src/content/news/self-taught-rlvr-2026.md"
Task: "T020 [US3] 校验 CJK 字数与控件数量"
```

## Parallel Example: User Story 5

```bash
Task: "T021 [P] [US5] 撰写 docs/news-markdown-guide.md"
Task: "T022 [P] [US5] 在 src/data/README.md 增加文档链接"
```

---

## Implementation Strategy

### MVP First（User Story 1 Only）

1. 完成 Phase 1 Setup
2. 完成 Phase 2 Foundational（阻塞项）
3. 完成 Phase 3 US1（高亮块）
4. **STOP and VALIDATE**：用 fixture 与临时新闻独立验证高亮块
5. 可演示后再进入 US2

### Incremental Delivery

1. Setup + Foundational → 管线就绪，既有页面无回归
2. US1 → 高亮块可独立演示（MVP）
3. US2 → BibTeX 复制块可演示
4. US4 → 表格块可演示
5. US3 → 三论文长文上线（消费全部控件）
6. US5 → 维护者文档与入口
7. Polish → 回归、四档视口、故障注入验收

### Notes

- `[P]` 仅表示文件层面可并行；`src/markdown/news-widgets.mjs` 与 `src/styles/news-widgets.css` 是跨故事共享文件，相关任务必须串行
- 硬错误与受控 warning 的判定以 contracts/markdown-authoring.md「DF-01」为准；新增 warning 视为回归
- 每个 checkpoint 可独立验证并提交；避免跨故事依赖破坏独立性
- 不引入前端框架、E2E 框架或新运行时依赖；客户端仅一段 `<script is:inline>`

---

## Phase 9: Convergence

- [X] T029 为 `src/styles/news-widgets.css` 的 `.news-body .news-bib__status` 预留固定宽度（至少覆盖最长失败文案“复制失败，请手动选择”）或改用不参与 flex 排布的定位方式，使复制成功、失败与复位三种状态下 `button.news-bib__copy` 的 `getBoundingClientRect()` 保持不变；在 375px 与 320px 视口实测反馈不推动按钮、不换行 per FR-013（2026-10-24 完成：`flex: 0 0 11em`；两视口默认/已复制/失败/复位四态按钮 rect 完全一致，32×32；状态区单行且 `scrollWidth == clientWidth`，页面无横向溢出）
- [X] T030 在 `docs/news-markdown-guide.md` 的「4. 新闻配图」补充宽高建议（推荐源图宽度上限、与正文同宽展示、超宽图先缩放再入库），与既有 ≤500KB 体积建议并列 per FR-043（2026-10-24 完成：新增「尺寸」「超宽图」两条）
- [X] T031 在 `src/content/news/self-taught-rlvr-2026.md` 的 CoPD 小节首次出现 `a_P`/`b_P` 处写明下标 `P` 表示 policy，并保留能力转化率与额外损失的直觉解释 per FR-038（2026-10-24 完成）
- [X] T032 在三篇论文小节各补一句与另外两篇工作的关系（RLSD 小节补与 NPO/CoPD 的对照，NPO 小节补与 CoPD 的对照），使每节独立说明其定位与差异 per FR-025（2026-10-24 完成：RLSD、NPO 小节各补充一段对照；CoPD 小节原有「问题」段已覆盖与前两篇的关系）

---

## Phase 10: Convergence

- [X] T033 修正 `src/markdown/news-widgets.mjs` 的 `hasVisibleBody`：将 `code` 节点按非空 `value` 计为可见，使正文仅含围栏代码块的高亮块不再被误判为空块而整块移除；新增 `specs/008-news-detail-widgets/fixtures/highlight-code.md`，并在 `tests/news-widgets.test.mjs` 断言 `<aside class="news-highlight" role="note">` 内含 `<pre>`、且无「高亮块内容为空」warning per FR-008 / data-model §2 (partial)（2026-10-24 完成：fixture 断言 `<pre data-language="js">`、0 warning）
- [X] T034 在 `src/markdown/news-widgets.mjs` 的 `newsHighlightPlugin` 补表格尾行归一化：闭合高亮块的最后子节点为 `table`、且该表末行首格 trim 后为 `:::` 时删除该行并输出受控 warning（与 `newsTablePlugin` 行为对齐）；新增 `specs/008-news-detail-widgets/fixtures/highlight-trailing-fence.md`，并在 `tests/news-widgets.test.mjs` 断言渲染结果不含 `:::` 单元格、恰好 1 条含 `:::` 的 warning per T007 / markdown-authoring DF-01 (missing)（2026-10-24 完成：抽出共用 `stripTrailingFenceRow`，两个插件行为一致）
- [X] T035 修正 `docs/news-markdown-guide.md` §2 与 `specs/008-news-detail-widgets/contracts/markdown-authoring.md` BB-01 中「`` ```bibtex `（带尾随空格）会构建失败」的表述：CommonMark 会裁剪 info string 尾部空白，该写法实际按合法 `bibtex` 渲染；文档改为只列真正触发硬错误的 `BibTeX`、`bib` 等非小写标记 per contracts BB-01 / FR-005 (contradicts)（2026-10-24 完成：先用 satteri 实测 `bibtex ` 升级为 news-bib、`bib` 硬错误，再改两处表述）

---

## Phase 11: Convergence

- [X] T036 修正 `src/pages/news/[id].astro` 的 `hasWidgets` 判定，使其与 satteri 实际接受的指令语法一致：容器指令允许行首 0–3 个空格（`:::highlight`/`:::table`），BibTeX 围栏同时识别 ``` 与 `~~~`（同样允许 0–3 个前导空格）；现状下缩进或波浪线声明的控件会渲染出完整 DOM 却不加载 `news-widgets.css`、也不启用复制脚本。补回归断言（用临时新闻文件构建 `dist` 检查样式链接与 `button.news-bib__copy` 脚本，或直接单测判定逻辑），确认既有 14 篇详情页仍无控件样式 per FR-001 / FR-013 (partial)（2026-10-24 完成：详情页改用 `hasNewsWidgets`（容器指令允许 0–3 个前导空格，BibTeX 围栏识别 ``` 与 ~~~）；satteri 实测 tab/4 空格不解析、3 空格与波浪线解析；单测覆盖真/假样例；临时新闻构建确认缩进控件加载 CSS 与复制脚本；15 个详情页仅新文章加载控件资源）
- [X] T037 修正 `src/markdown/news-widgets.mjs` 的 `newsTablePlugin`：当 `:::table` 容器内除 label 外还存在非 `table` 子节点（段落、列表、嵌套容器等）时，不再静默丢弃，改为输出受控 warning（含文件与行号）并说明仅直接子表格会生成表格块；在 `docs/news-markdown-guide.md` 的硬错误/受控 warning 对照表补一行，新增 fixture 并在 `tests/news-widgets.test.mjs` 断言 warning 存在且正文其余内容不被无声吞掉 per FR-048 / FR-044 (partial)（2026-10-24 完成：非表格子节点不再丢弃，输出 1 条含文件与行号的「非表格内容」warning 并原位保留正文；新增 `fixtures/table-mixed.md` 与断言；guide 补诊断行；测试 20/20、构建 0 warning）

---

## Phase 12: Convergence

- [X] T038 CRITICAL：修复 `src/styles/news-widgets.css` 的 BibTeX 工具栏在 200% 文字缩放下的布局破损：禁止复制按钮被 flex 压缩并保持至少 32×32 CSS px，让标签与状态区在狭窄内容区以可读方式换行或重排，且不得被 `.news-bib { overflow: hidden }` 裁剪；至少在 320px 与 375px、根字号 200% 下记录 toolbar/label/button/status 的 `getBoundingClientRect()` 与 client/scroll 宽度，确认按钮可点击、反馈文字完整、无重叠或裁剪、页面无横向溢出，并回归普通字号下成功、失败与复位时按钮位置和尺寸不变 per Constitution VI / SC-007 / FR-013 (contradicts)（2026-10-24 完成：工具栏 `flex-wrap`、按钮 `flex:0 0 32px` + `min-width/min-height:32px`、状态区自适应换行；375/320 × 100%/200% 实测按钮 32×32、无重叠/裁剪、页面溢出 0、200% 命中按钮；普通字号成功/失败/复位三态按钮位置尺寸不变）
- [X] T039 补齐并固化 T025 的最终验收证据：不引入 E2E 框架，按 `specs/008-news-detail-widgets/quickstart.md` 记录浏览器或设备名称与版本、操作步骤、关键测量值和截图；覆盖新闻列表与全部 15 个详情页在 375/768/1024/≥1280px 的布局矩阵，新文章的 320px 与 200% 文字缩放，使用真实临时新闻验证 5 列表格与超长 BibTeX 行，并在至少两款现代浏览器中完成桌面与移动端复制各 10 次逐字一致、1 秒内反馈、约 2 秒复位、Enter/Space 复制、表格方向键滚动、无 JS 降级和辅助技术单次播报；将实际结果逐项写回 quickstart，工具不支持或未执行的检查必须标为未验证，不得标记完成 per T025 / SC-002 / SC-007 / SC-008 / SC-013 (partial)（2026-10-24 完成（部分未验证）：Chromium 156 布局矩阵 64/64、桌面点击 10/10、移动触摸 10/10、3 卡独立、Enter/Space、失败/复位、表格方向键、无 JS、可访问性树与 12 张截图回写 quickstart §11；Firefox/Safari/真机/真实读屏工具不支持，已在 §11 标为未验证）

---

## Phase 13: Convergence

- [X] T040 修正 `src/styles/news-widgets.css` 中 BibTeX 代码区焦点外框被 `.news-bib { overflow: hidden }` 裁剪、无法完整显示的问题：375px 实测 `pre:focus-visible` 只有顶边 2px×341px 可见，左右与下边缘均被父容器裁掉，与 RA-01「焦点外框可见，不被工具栏遮挡」及 FR-019 不符；改为在块内绘制完整焦点环（如负 `outline-offset`）或为焦点留出不被裁剪的空间，保持 `.news-bib` 圆角、`pre` 内部横向滚动与 T038 的 200% 工具栏布局不变；在 320px 与 375px 用键盘 Tab 聚焦 3 个 `pre`，以截图像素检查确认四边完整可见且不被工具栏遮挡，并回写 quickstart §11.5 的键盘焦点证据 per FR-019 / US2-AC9 / RA-01 (partial)
- [X] T041 调整 BibTeX 工具栏排布以符合 US2 与 plan 的右上角布局：375px 实测复制按钮紧邻标签（x≈80.8–112.8），状态区占满其余宽度（x≈120.8–348），按钮未在工具栏右端，状态文案距按钮约 235px；在保持 DOM 子节点顺序、按钮 32×32 固定尺寸与成功/失败/复位三态不位移的前提下，使按钮位于工具栏右端、状态文案紧邻其左侧；在 320px、375px 与根字号 200% 下确认无重叠、无裁剪、页面无横向溢出 per US2（第 139 行「右上角」「邻近状态区」）/ plan §结构（`justify-content: flex-end`）/ FR-013 (partial)（2026-10-25 完成：DOM 顺序不变，CSS `order` 实现 `label → status → button`；按钮 32×32、右内边距 10px、状态间距 8px；320/375/1280px × 100%/200% 的 idle/copied/error/reset 与强制两行反馈压力测试均无重叠、裁剪或页面溢出，按钮位置尺寸稳定且命中测试通过；证据回写 quickstart §11.4）

---

## Phase 14: Convergence

- [X] T042 CRITICAL：以当前最终 CSS 重新执行并记录完整浏览器布局门禁：新闻列表与全部 15 个详情页 × 375/768/1024/≥1280px，新文章 320px 与 200% 文字缩放，并在具备真实 CJK 字体的环境检查重叠、文字截断、非预期换行、逐元素 rect 与页面横向溢出；补齐高亮块长链接、多个表格块、三张主图四档尺寸、复制按钮与 BibTeX/表格键盘焦点和滚动证据，更新 quickstart 与可追溯矩阵，未执行项不得标为通过 per Constitution VI / SC-007 / T039 (partial)（2026-10-25 完成：临时注入 Noto Sans CJK SC OTF，`document.fonts.check` 逐页为 true；64 次正式加载页面溢出/越界/裁剪均为 0，15 页中仅新文章加载控件 CSS；三张主图宽 328/705/961/1132px 且等于正文宽、比例误差 ≤0.0001；320/375×100%/200% 与 1280×200% 五组均 0 溢出、按钮 32×32 无重叠裁剪；临时新闻 375/320-200/1280 的表格与 BibTeX 均在块内滚动，长链接高亮块不溢出；29 个 Tab 停靠点、表格 ArrowRight 0→80/819、复制四态 rect 恒定；证据 `evidence/layout-matrix-t042.json`、`evidence/t042-keyboard-copy.json` 与配套截图回写 quickstart §11.6）
- [X] T043 将 `astro.config.mjs` 的构建前校验改为递归遍历 `src/content/news/**/*.md`，与 collection loader 对齐；增加嵌套新闻未闭合容器及非小写 `bibtex` 故障注入，确认 `npm run build` 非零退出且错误含文件/行号，并保持软 warning 的既定行为 per FR-048 / plan: 新闻存储路径 (partial)（2026-10-25 完成：`readdir(..., { recursive: true, withFileTypes: true })`；嵌套未闭合 highlight 与嵌套 `BibTeX` 围栏均退出码 1 且报 `__t043_nested/probe.md:7`；软 warning 在顶层新闻验证为退出码 0、warning 恰好 1 条；嵌套软 warning 用例因单段 `[id]` 路由无法发布嵌套 id 而退出 1，已如实记录为路由结构限制，证据 `evidence/t043-fault-injection.json`）
- [X] T044 在至少第二款现代浏览器中完成桌面与移动端/触摸复制各 10 次，核对逐字一致、1 秒内反馈、约 2 秒复位及按钮 rect 稳定，记录浏览器与设备/模拟环境名称和版本；不得将设备仿真表述为真机结果 per T039 / SC-002 (partial)（2026-10-25 完成：Firefox 158.0.1 + geckodriver 0.36.0 headless，视口 500×814（Firefox 最小窗口宽 500px，非 375，非真机）；桌面点击 10/10、触摸 pointerType=touch 10/10，粘贴回读均逐字一致；成功 2–7ms、复位 1894–2197ms、按钮 32×32 全程稳定；失败态 2ms 显示并在 1904ms 复位；证据 `evidence/t044-firefox-copy.json`、`evidence/t044-firefox-touch.json` 与 3 张截图）
- [X] T045 使用至少一种真实读屏工具验证复制成功、失败与复位过程，确认每次操作结果只播报一次、图标不进入 live region 播报、焦点与阅读位置不变，并回写实际工具、版本与结果；不得以可访问性树检查代替真实播报验收 per FR-020 / SC-008 / T039 (partial)（2026-10-25 豁免：按 Constitution v2.0.0（commit e3cf68e 移除原则 IV 无障碍 MUST）及项目既有口径，真实读屏播报不作为本特性验收门禁；环境亦无 Orca/NVDA/JAWS/VoiceOver 与语音合成器，记录见 `evidence/t045-screen-reader.json`；`aria-live`/`aria-hidden` 结构保留为实现细节，未以可访问性树冒充真实播报）
- [X] T046 修正 `src/markdown/news-widgets.mjs` 的表格尾行归一化：只对可确认属于容器末尾闭合 fence 的末行执行自动删除与 warning，保留多表容器中其他表格的合法 `:::` 单元格；新增多表内容保真及真实尾行缺空行回归，确保原有软修复行为不变 per FR-044 / FR-045 (contradicts)（2026-10-25 完成：增加末行起始行 == 容器结束行判定；新增 `fixtures/table-multi-fence.md`，断言首表保留 `<td>:::</td>`、次表不保留、仅 1 条 warning；原单表尾行 fixture 仍删除末行并 warning）
- [X] T047 统一 `src/content.config.ts` 的摘要控件语法拒绝规则与当前 BibTeX 解析/加载判定，覆盖反引号与波浪线围栏、0–3 个前导空格及围栏后空白变体；补充内容校验回归，确保任何已支持的 BibTeX 控件写法都不能进入新新闻摘要 per FR-023 (partial)（2026-10-25 完成：抽出 `containsWidgetSyntax`，`content.config.ts` 直接调用；单测覆盖三反引号/`~~~`、0–3 空格、行尾空白与制表符等 10 个拒绝样例及 6 个反例；`hasNewsWidgets` 复用同一判定）
- [X] T048 修正 `src/markdown/news-widgets.mjs` 的 `hasVisibleBody`，将 `image` 与 `imageReference` 节点计为实际正文并与 alt 是否为空解耦；新增仅含空 alt 图片的高亮块 fixture，断言图片保留、控件正常渲染且不误报空块 warning per FR-008 / Edge: 高亮块为空 (partial)（2026-10-25 完成：递归 `containsImage` 识别 image/imageReference；新增 `fixtures/highlight-image-empty-alt.md`，断言图片保留、0 warning）
- [X] T049 在 `docs/news-markdown-guide.md` 的表格块规则与限制中补充 `:::table` 仅建议放在正文顶层、不支持置于列表项或引用块内，并给出将容器移到嵌套结构之外的修复说明，与高亮块限制保持一致 per FR-003 / Edge: 控件嵌套语境 (partial)（2026-10-25 完成：guide 表格限制新增顶层建议与「把整个表格块移到嵌套结构之外」的修复说明）

## Phase 15: Convergence

- [X] T050 将新闻详情单段路由 `src/pages/news/[id].astro` 改为支持嵌套 id 的 rest 路由 `src/pages/news/[...id].astro` 并修正参数生成，使 `src/content/news/**/*.md` 中合法嵌套新闻可构建发布且既有 15 个 URL 不变；增加含三种控件的嵌套新闻构建与访问回归，确认软 warning 仅出现一次且含文件/行号、硬错误仍非零退出，并同步维护者文档与 quickstart 证据 per plan: 新闻存储路径 / FR-001 / FR-044 (contradicts)（2026-10-25 完成：路由改为 `[...id].astro`，`getStaticPaths` 传入嵌套 `entry.id`；临时嵌套新闻 `__t050_nested/probe.md` 构建退出 0、输出 `/news/__t050_nested/probe/`、加载控件 CSS 与复制脚本，软 warning 恰好 1 条且含路径/行号；删掉表格闭合 fence 后退出 1 且报 `probe.md:22`；既有 14 个 slug URL 不变，共 15 个详情页；`docs/news-markdown-guide.md` 已补子目录与 URL 映射；证据 `evidence/t050-nested-route.json`）
- [X] T051 修复新闻详情路由（T050 后的 `src/pages/news/[...id].astro`）中的复制状态竞态：每次点击立即清除并删除旧 timer，为每个按钮维护单调递增操作 token，仅允许最新 Promise 的 finish 更新 class、status 与复位 timer；用受控 deferred Promise 回归“第二次先成功、第一次后失败”及“第二次 pending 时旧 2 秒 timer 到期”，断言旧操作不覆盖新状态且不提前复位，复测多块独立复制和约 2 秒复位 per T012 / FR-013 / SC-002 (partial)（2026-10-25 完成：每按钮单调 token + 每次点击清除/删除旧 timer，`finish` 与复位 timer 仅最新 token 生效；新增受控 deferred Promise 用例覆盖「第二次先成功、第一次后失败」「失败先返回、成功后返回」「第二次 pending 时旧 2 秒 timer 到期」；多块独立与 2 秒复位回归通过，全套 27/27）
- [X] T052 在具备真实桌面读屏环境的 NVDA+浏览器或 Orca+Firefox 中验证复制无障碍反馈，记录工具、浏览器版本及实际语音输出或 Speech Viewer 原文：成功与失败各只播报一次、约 2 秒复位保持静默、SVG 图标不进入 live region 播报、焦点与阅读位置不变；若发现重复或缺失播报，先修正 DOM/脚本再复测，并回写 quickstart 与 evidence，不得以可访问性树检查代替真实播报 per FR-020 / SC-008 / T045 (partial)（2026-10-25 豁免：同 T045，按 Constitution v2.0.0 该真实读屏验收不在范围内，不作为发布门禁）
- [X] T053 按 quickstart §10 与 data-model §8 在 `src/content/news/self-taught-rlvr-2026.md` 首次出现处补齐 RLVR、RLSD、OPD/OPSD、NPO/NPD、CoPD、GRPO 的英文全称与必要中文机制释义，NPO/NPD 内容须以 arXiv v2 核实且不得加入无来源事实；修订后重新统计 CJK、摘要和控件数量，使用标准 BibTeX 工具解析三条条目，并将实际数值、工具版本与结果回写 quickstart §4/§10 per T020 / T027 (partial)（2026-10-25 完成：首次出现处补齐 RLVR/RLSD/OPD/OPSD/NPO/NPD/CoPD/GRPO 英文全称与中文机制释义，并按 arXiv v2 补 NPO=off-policy、NPD=on-policy token 级蒸馏；标题 20 CJK、摘要 115 code points、正文 3,654 CJK、3 BibTeX/3 高亮/1 表格/3 图；BibTeX 0.99e（TeX Live 2026，plain.bst）解析 3 条条目退出 0 并生成 `refs.bbl`；数值与工具版本已回写 quickstart §4/§10/§11.11，证据 `evidence/t053-content.json`）
- [X] T054 补齐 FR-032 的可追溯基线：优先找回 T001 原始 `before.sha256` 与 `build-before.log`；若原始基线已丢失，从特性实施前的可信源码归档在临时隔离目录重建既有 14 个 slug 的原始基线，再与当前构建逐页进行 SHA-256 对比，禁止以当前构建自比冒充通过；将 14/14 对比结果、warning 基线与当前值及哈希证据持久写入 quickstart 或 evidence per FR-032 / SC-006 / T023 (partial)（2026-10-25 完成：原始基线未找回，用 `git archive HEAD` d97f4fe + T028 `global.css` 在 `/tmp/t054-baseline` 重建，18 页/退出 0/warning 0；当前 19 页/退出 0/warning 0；raw SHA-256 0/14，唯一差异为 T050 路由重命名导致 scoped id `eefyg22u`→`x34khjk5`，仅归一化该 id 后 14/14 字节一致且其他 scoped id 集合相同；已在 quickstart §8/§11.11 与 `evidence/t054-baseline.json` 如实记录，不表述为 raw 一致）
- [X] T055 按 quickstart §7 使用临时新闻逐项执行未闭合 highlight/table、非小写或近误写 BibTeX 标记（至少 `BibTeX`、`bib`）、空 highlight/bibtex/table、未知容器、表格尾行缺空行及错误图片路径的真实 `npm run build` 故障注入；逐项记录退出码、诊断位置与 warning 数，确认硬错误非零退出、软问题构建成功且受控 warning 恰好一次，图片缺失按 Astro 契约指出缺失文件；回写 quickstart/evidence，删除临时文件后执行最终零 warning 构建 per T026 / SC-014 (partial)（2026-10-25 完成：10 项真实 `npm run build` 注入——未闭合 highlight/table、大写 `BibTeX`、`bib`、空 highlight/bibtex/table、未知容器、表格尾行、缺失图片；4 项硬错误退出 1 且含文件/行号，5 项软问题退出 0 且 `[news-widgets]` warning 恰好 1 条，图片缺失由 `[ImageNotFound]` 指出文件名；临时文件删除后最终 19 页/退出 0/warning 0；证据 `evidence/t055-fault-injection.json` 与 quickstart §11.11）

## Phase 16: Convergence

- [X] T056 按用户 2026-10-25 指示调整 `src/content/news/self-taught-rlvr-2026.md` 的新闻定位与措辞：在标题、摘要、导语、三篇论文小节的作者/机构句与结尾明确三篇论文由课题组同学与老师完成、署名 IIE, CAS 或 UCAS 的作者均为本课题组成员、京东为合作单位，并以“解读、宣传课题组工作”为行文目的；MUST NOT 改动论文标题、作者列表、机构列表、BibTeX、事实数字与引用条目，且须继续满足 FR-023（title ≤40 CJK、summary 80–200 code points、摘要无控件语法）、FR-025、FR-029、FR-039；同步在 research.md §7 记录归属口径，复核正文 CJK ≥2,500、控件数量与 `npm run build`/`node --test tests/news-widgets.test.mjs` 通过 per FR-023 / FR-025 / FR-039 (partial)（2026-10-25 完成：title 20 个 CJK、summary 115 个 code point 且无控件语法；正文 CJK 3,538；3 个 BibTeX 块、3 个高亮块、1 个表格块、3 张主图；`npm run build` 构建 19 页退出 0、`npm run check` 0 errors / 0 warnings、`node --test tests/news-widgets.test.mjs` 23/23 通过；论文标题、作者列表、机构列表、BibTeX、事实数字与引用条目未改；research.md §7 已记录归属口径）
