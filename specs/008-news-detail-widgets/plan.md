# Implementation Plan: 新闻详情页重点控件与三论文解读新闻

**Branch**: `008-news-detail-widgets` | **Date**: 2026-10-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/008-news-detail-widgets/spec.md`

## Summary

为新闻详情页增加三种由 Markdown 源文件直接声明的控件：高亮块（`:::highlight[可选标题]` … `:::`）、BibTeX 引用块（语言标记为小写 `bibtex` 的围栏代码块，带固定尺寸图标复制按钮与块内横向滚动）、表格块（`:::table[可选标题]` … `:::`，包裹一至多张标准 Markdown 表格，每张表独立成为带可选图注与容器内横向滚动的表格块）。实现方式是在 Astro 7 内置的 `@astrojs/markdown-satteri` 处理器上注册 mdast / hast 插件：mdast 插件把容器指令转换为语义化 `<aside class="news-highlight" role="note">` 与 `<figure class="news-table">`，hast 插件为 `pre > code.language-bibtex` 包裹工具栏并生成复制按钮，并为被链接包裹的新闻配图与 arXiv 论文链接补 `target="_blank" rel="noopener noreferrer"`。构建期同时执行控件语法诊断：未闭合容器与非小写 `bibtex` 标记为硬错误，未知容器、空块、表格尾行缺空行为受控 warning。客户端只增加一段约 1KB 的内联事件委托脚本，不引入任何前端框架或新依赖。

同一分支交付一篇 2026-10-23 的中文长文，以 Self-Taught RLVR 为统一叙事解读 RLSD、NPO、CoPD 三篇论文（总—分—总结构、每篇一节 + 方法框架主图 + BibTeX 块、全文 ≥2 个高亮块、≥1 个表格块对比表、正文 ≥2,500 CJK 字符），并新增维护者文档 `docs/news-markdown-guide.md`，覆盖三种控件与新闻配图的写法、限制、构建期诊断、排错与验证步骤。

## Technical Context

**Language/Version**: Astro 7.3.8（ESM，`.mjs` 插件 + `.astro`/`.md` 内容）；Node.js ≥ 22.12.0（Astro 7 的 `engines` 约束）

**Primary Dependencies**: `astro@7.3.8`；`@astrojs/markdown-satteri@0.4.3` 与 `satteri@0.10.5`（来自 Astro 的传递依赖，实现时在 `devDependencies` 中精确锁定，不带 `^`，避免 `npm update` 后插件 API 消失）；`shiki@4.4.3`（Astro 内置语法高亮）。客户端零依赖。

**Storage**: 文件即数据源——`src/content/news/**/*.md`（Content Collection，字段 `title`/`date`/`summary`/`cover?`）与同目录图片资源；无数据库。

**Testing**: `npm run build`（构建期失败即门禁）+ `npm run check`（类型/模板检查）+ Node 内置 `node:test` 轻量 Markdown fixture 回归（正常高亮、正常表格、正常 BibTeX、未闭合、空块、大写 `BibTeX`）+ 浏览器手动验证矩阵（375 / 768 / 1024 / ≥1280px，补充 320px 与 200% 缩放抽查）。不引入 E2E 框架。

**Target Platform**: 纯静态站点，GitHub Pages 子路径部署（`site: https://liumenglii.github.io`，`base: /nlp-home`），无服务端运行时。

**Project Type**: 单项目静态站点（Astro Content Collections + `.astro` 页面）。

**Performance Goals**: 新增客户端脚本未压缩 ≤ 5KB（目标约 1KB，以 `<script is:inline>` 的 UTF-8 字节数计）；新增样式仅详情页加载；每张主图 ≤ 500KB；正文首屏不被脚本阻塞；图片走 Astro 内置优化（`loading="lazy"`、`decoding="async"`、带 `width`/`height`）。

**Constraints**:
- 控件仅在新闻详情页生效，列表页与其他页面零变化（FR-031/032）。
- 四档视口下无布局破损，`document.documentElement.scrollWidth ≤ window.innerWidth`；BibTeX 与表格的横向滚动只发生在块内（FR-009/015/033/041/046）。全局 `body { overflow-x: hidden }` 在本特性内移除（T028，已完成全站溢出审计：18 页 × 6 档 = 108 次测量，0 溢出）；移除后验收直接测 `scrollWidth` 并逐元素检查 `getBoundingClientRect()`。
- 高亮块文字与背景对比度 ≥ 4.5:1（FR-010）；无标题块仍保留左侧强调竖线。
- BibTeX 内容逐字保留，按纯文本渲染，不得执行或解析为 HTML（FR-011/018）。
- 缺失图片必须在构建期失败，不得上线破图（FR-042）。
- 既有新闻渲染结果不变，构建与类型检查除已声明的控件诊断外无新增错误/警告（FR-032/036/048）。

**Scale/Scope**: 1 篇长文（正文 ≥2,500 CJK 字符，目标 2,500–4,000）、3 张论文主图、≥3 个 BibTeX 块（均为 arXiv `@misc`，含 `eprint`/`archivePrefix`/`primaryClass`）、≥2 个高亮块、1 个表格块对比表；1 份维护者编辑文档；1 个 Markdown 插件文件 + 详情页样式/脚本 + `src/content.config.ts` 加载期校验 + 1 个轻量 fixture 测试。

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原则 | 门禁问题 | 结论与依据 |
|------|----------|-----------|
| I. 内容准确性 | 三篇论文的标题、作者、机构、指标、链接是否可核实？ | **PASS（附条件）**。RLSD（arXiv:2604.03128v2）、CoPD（arXiv:2604.27083v1）与 NPO（arXiv:2604.20733v2）均取自 arXiv 公开页面；机构为 IIE, CAS / UCAS / JD.COM。2026-10-23 决议：新闻与 BibTeX 完全删去 NeurIPS 2026 接收状态/Spotlight 表述，三篇统一按 arXiv 预印本呈现；BibTeX 为可核验的 arXiv `@misc`，不写 `booktitle`/`volume`/`note`；正式 proceedings/OpenReview 发布后再评估更新（FR-026）。此处理符合 I 的“以正式版为准、不凭推测填写”，不把未发布会议版本当作正式条目，也不声称正式版 bibliographic 信息。NPO 数字统一以 v2 为准（FR-029）。 |
| II. 内容与展示分离 | 维护者是否仍只需改 Markdown？ | **PASS**。三种控件均由 Markdown 语法触发，维护者不改模板/样式；本次对 `astro.config.mjs`、详情页与样式文件的改动属于特性开发，一次完成，后续内容更新仅动 `.md`。 |
| III. 静态站点与 GitHub Pages | 是否引入服务端或破坏 Pages 构建？ | **PASS**。纯构建期插件 + 内联客户端脚本；无运行时、无外部服务；`base` 前缀由 `withBase` 与 Astro 资产管线处理。 |
| IV. 简洁学术化 | 是否引入框架/动效/装饰？ | **PASS**。复用 `--sky`/`--line`/`--blue` 色板与 12px 圆角体系；无动画，仅图标状态与状态区文字反馈；不新增 npm 运行时依赖。 |
| V. 最小复杂度（YAGNI） | 是否有更简单的等价方案？ | **PASS**。复用 Astro 自带 satteri 与 Shiki，插件集中在单个 `src/markdown/news-widgets.mjs`；复制逻辑为一段事件委托脚本；表格使用真实 HTML 表格，不引入截图或灯箱。 |
| VI. 无布局破损 | 四档视口是否可保证无破损？ | **PASS**。BibTeX 块与表格块容器内 `overflow-x: auto` 且父容器 `min-width: 0`，滚动为 spec 已声明交互；图标按钮固定 32×32 避免反馈抖动；高亮块 `overflow-wrap: anywhere`；页面级裁剪 `body { overflow-x: hidden }` 已移除（T028），消除与 VI 的冲突，验收不再依赖临时禁用。 |

**Phase 1 复审**：设计未引入额外依赖、未改变列表页渲染路径，门禁结论保持 PASS；唯一需要落实的是 VI 的实测记录，已写入 quickstart 验证清单。

## Project Structure

### Documentation (this feature)

```text
specs/008-news-detail-widgets/
├── plan.md              # 本文件
├── spec.md              # 需求规格
├── research.md          # Phase 0：已验证的技术决策与失败模式
├── data-model.md        # Phase 1：控件/图片/引用的数据模型
├── quickstart.md        # Phase 1：构建、预览与四档视口验证步骤
├── contracts/
│   ├── markdown-authoring.md   # 编辑侧契约：语法、约束、错误行为
│   └── rendered-dom.md         # 渲染/交互契约：DOM、class、ARIA、复制语义
├── fixtures/            # node:test 使用的 Markdown 样例与期望片段
└── tasks.md             # Phase 2（由 /speckit-tasks 生成，本命令不创建）
```

### Source Code (repository root)

```text
astro.config.mjs                      # 注册 satteri processor：directive + 插件 + excludeLangs:['bibtex']
src/
├── content.config.ts                 # news schema 全局 summary ≤200；加载期扫描新增条目校验（T019）
├── markdown/
│   └── news-widgets.mjs              # newsHighlightPlugin / newsTablePlugin / newsBibtexPlugin / newsExternalLinksPlugin / diagnostics
├── data/
│   └── README.md                     # 增加一行指向 docs/news-markdown-guide.md
├── styles/
│   ├── news-widgets.css              # 控件样式，仅由详情页 import
│   └── global.css                    # 仅移除页面级 overflow-x 裁剪（T028，已完成）
├── pages/news/
│   ├── index.astro                   # 不变（列表只渲染 title/date/summary）
│   └── [...id].astro                 # rest 路由（支持嵌套 id）；引入控件 CSS + 内联复制脚本
├── content/news/
│   ├── self-taught-rlvr-2026.md      # 新增长文（2026-10-23）
│   ├── rlsd-method.png               # RLSD 方法框架图（≈171KB）
│   ├── npo-overview.png              # NPO 框架图（≈178KB）
│   └── copd-method.png               # CoPD 框架图（≈225KB）
tests/
└── news-widgets.test.mjs             # node:test fixture 回归（零新增依赖）
docs/
└── news-markdown-guide.md            # 维护者编辑文档（不进 Content Collection）
```

**Structure Decision**: 保持既有单项目结构。新增代码与配置改动共五处：构建期插件文件、详情页专用样式、详情页内联脚本、`src/content.config.ts` 加载期校验、轻量 fixture 测试；内容与图片沿用 `src/content/news/` 同目录约定，不新增组件或布局。

## Implementation Approach

### 1. 构建期：Markdown 处理链（`astro.config.mjs` + `src/markdown/news-widgets.mjs`）

```js
markdown: {
  processor: satteri({
    features: { directive: true },
    mdastPlugins: [newsHighlightPlugin, newsTablePlugin],
    hastPlugins: [newsBibtexPlugin, newsExternalLinksPlugin],
  }),
  syntaxHighlight: { type: 'shiki', excludeLangs: ['bibtex'] },
}
```

> `satteri()` 0.4.3 仅接受 `mdastPlugins` / `hastPlugins` / `features`；`options: { position: true }` 写在需要位置的插件定义内部，`syntaxHighlight` 是 `markdown` 的兄弟选项，二者都不能放进 `satteri({...})`。

- `newsHighlightPlugin`（mdast，`options.position: true`）：
  - 识别 `containerDirective` 且 `name === 'highlight'`；取 `data.directiveLabel` 子节点为标题，其余为正文。
  - **闭合判定**：按 `ctx.source` 原始片段判断最后一行是否只有 `:::`；未闭合 → 抛硬错误，包含文件与行号（FR-048）。
  - **空内容判定**：无可见子节点（`thematicBreak` 计为可见）→ 受控 warning 并整体移除。
  - **表格尾行归一化**：闭合且最后一个子节点是 `table` 时，若末行首格文本 trim 后为 `:::`，删除该行并输出受控 warning。
  - 输出：`data.hName = 'aside'`，`hProperties = { className: ['news-highlight'], role: 'note' }`；标题节点转为 `<p class="news-highlight__title" role="heading" aria-level="3">`。
  - 未知 `containerDirective` → 受控 warning 并展开 children；`textDirective` / `leafDirective` → 按源码原样还原为文本，避免吞正文。
- `newsTablePlugin`（mdast）：
  - 识别 `containerDirective` 且 `name === 'table'`；取可选 `directiveLabel` 为图注。
  - **闭合判定**：同高亮块；未闭合 → 抛硬错误。
  - **空表判定**：children 中没有 `table` 节点 → 受控 warning 并移除。
  - **表格尾行归一化**：同高亮块；删除被吞入表格末行的 `:::` 并输出受控 warning。
  - 输出：容器内每张 `table` 分别生成一个 `<figure class="news-table">`；有标题时仅第一张表的 figure 生成 `<figcaption class="news-table__caption">`，后续表不生成图注；每个 figure 内含各自的 `<div class="news-table__scroll" tabindex="0" role="region" aria-label="对比表">` 与恰好一张真实 `<table>`，按源顺序排列。
- `newsBibtexPlugin`（hast）：匹配 `pre` 内 `code.language-bibtex`；`textContent` 为空 → 受控 warning，保留空 `pre`，不生成工具栏；否则设置 `tabindex="0"`、`role="region"`、`aria-label="BibTeX 引用"`，并用 `ctx.replaceNode(node, wrapper)` 构造 `div.news-bib`，其 children 顺序为 **工具栏在前、`pre` 在后**。
  - 工具栏包含 `span.news-bib__label`、固定 32×32 的 `button.news-bib__copy[hidden]`（内含复制/成功/失败三个 SVG 图标，默认只显示复制图标）、`span.news-bib__status[aria-live="polite"]`。
  - 语言标记大小写敏感：`BibTeX`、`bib` 等近误写 → 抛硬错误，提示必须写小写 `bibtex`（FR-048）。
- `newsExternalLinksPlugin`（hast）：只匹配两类链接——`a[href^="http"]` 且唯一子节点为 `img`（新闻配图写法），或 `href` 主机为 `arxiv.org` 的论文链接（图注中的论文链接）；补 `target="_blank"` 与 `rel="noopener noreferrer"`；其他正文外链不改写，既有新闻无这两类链接，HTML 基线不变（FR-032/041）。
- **诊断输出**：硬错误 `throw new Error("[news-widgets] <file>:<line> ...")`；软问题 `console.warn("[news-widgets] <file>:<line> ...")`。quickstart 记录基线 warning 数量，新增 warning 视为回归。

### 2. 详情页：样式与交互（`[...id].astro` + `src/styles/news-widgets.css`）

- `[...id].astro` 使用 rest 参数接收 collection 的嵌套 `entry.id`；frontmatter `import '../styles/news-widgets.css'`（仅使用控件的详情页加载），页面末尾加一段 `<script is:inline>` 事件委托：
  - 找到 `button.news-bib__copy` 最近的 `.news-bib`，读取 `pre code` 的 `textContent`，去掉末尾单个 `\n`；
  - `navigator.clipboard.writeText`；成功时按钮加 `is-copied` 类（绿色对勾图标），失败时加 `is-error` 类（红色叉号/警示图标），文字只写入 `.news-bib__status`；
  - 状态区 `aria-live="polite"` 播报一次；按钮图标 `aria-hidden="true"`，按钮 `aria-label` 固定为“复制引用”，避免重复播报；
  - 2 秒后复位；重复点击先清除并删除旧计时器，并递增按钮级操作 token，只有最新 Promise 的 finish 与复位 timer 可以更新状态；
  - 脚本运行时移除按钮的 `hidden`；无 JS 时按钮保持隐藏（FR-021），并写 `.news-bib__copy[hidden] { display: none !important; }` 防止作者样式覆盖。
- 样式要点：
  - `.news-highlight`：`background: var(--sky)`、`border: 1px solid var(--line)`、`border-left: 4px solid var(--blue)`、`border-radius: 12px`、`padding: 18px 20px`、`margin-block: 1.25em`、`overflow-wrap: anywhere`；标题使用 `--ink` 加粗。
  - `.news-table`：`margin-block: 1.25em`；`.news-table__caption` 小字号、`--ink-soft`；`.news-table__scroll { max-width: 100%; overflow-x: auto; }`；`table { width: max-content; min-width: 100%; border-collapse: collapse; }`；表头 `--sky` 背景、单元格 `1px solid var(--line)`、`padding: 8px 12px`、`white-space: normal`。
  - `.news-bib`：`position: relative`、`border-radius: 12px`、`overflow: hidden`；工具栏 `display:flex; justify-content:flex-end; align-items:center; gap:8px`；`pre` 设 `overflow-x: auto; max-width: 100%`；复制按钮固定 `width:32px; height:32px; padding:0`，图标状态切换不改变尺寸；状态区 `min-height: 1.5em; white-space: nowrap`。
  - 所有新样式选择器限定在 `.news-body` 内，避免影响列表页与其他页面；高亮块内的 `code`/`pre`/`blockquote`/`table` 只添加最小可读样式，不修改全局 `.news-body` 既有元素样式（FR-032）。
- 表格滚动容器 `tabindex="0"`，方向键由浏览器原生滚动支持；`:focus-visible` 沿用全局 2px `--blue` 外框。

### 3. 内容：三论文解读长文

- 文件 `src/content/news/self-taught-rlvr-2026.md`，frontmatter：`title`（原创标题，≤40 个 CJK 统一表意文字，英文/数字/标点不计）、`date: 2026-10-23`、`summary`（80–200 字，按 code point 计，无控件语法）、无 `cover`。
- 结构：开篇统一叙事 → RLSD 节 → NPO 节 → CoPD 节 → 表格块横向对比 + 综合讨论 → 启示。每节含方法框架图（`[![alt](fig.png)](https://arxiv.org/abs/...)`）、关键量直觉解释（evidence ratio / `S=Q/V` / `a_P,b_P`）、可复制的 `bibtex` 块。
- 每节首段写明真实论文标题、作者/机构（IIE, CAS / UCAS / JD.COM）与版本；NPO 节标题可用“NPO：Learning from the Near Future”，但正文必须写全真实标题。每节同时给出论文公开链接；RLSD 列出官方 GitHub 仓库，NPO/CoPD 未发现官方代码仓库、列出其 Hugging Face 论文页（FR-026）。
- 三条 BibTeX：均为 arXiv `@misc`（eprint 2604.03128v2 / 2604.20733v2 / 2604.27083v1，`archivePrefix = {arXiv}`、`primaryClass = {cs.LG}`），全列作者；正文与条目均不呈现 NeurIPS 接收状态（2026-10-23 决议），正式 proceedings 发布后再评估更新。
- 事实与数字仅取自已核对的论文页面（见 research.md 的事实附录），NPO 数字以 v2 为准；无法核实者不写。
- 正文不设“参考解读”署名或链接（CHK036）。

### 4. 维护者文档

`docs/news-markdown-guide.md`：三种控件的模板与示例、内容支持范围、限制（不嵌套、语言标记必须小写 `bibtex`、结尾 `:::` 不可省、表格结尾前建议留空行）、控件与普通 Markdown 的边界（普通代码块 vs BibTeX 块、普通表格 vs 表格块）、构建期硬错误/受控 warning 对照表、新闻配图章节（同目录存放、命名、图注、CC BY 4.0 许可、修改声明、替代文本、体积建议、构建失败排查）、本地验证步骤（`npm run dev` 看 `/news/<id>/`、`npm run build`、`npm run check`、四档视口 + 320px + 200% zoom）。在 `src/data/README.md` 增加一行指向该文档（仓库根目录无 README）。

## Complexity Tracking

> 无 Constitution Check 违规项，本节不适用。

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
