# Data Model: 新闻详情页重点控件与三论文解读新闻

**Feature**: `008-news-detail-widgets` | **Date**: 2026-10-23

本文件定义新闻内容、三种控件、论文引用与配图在构建期与渲染后的数据结构。它们不是数据库表，而是 Markdown AST → HTML DOM 的转换契约与校验规则。

## 1. News Entry（新闻条目）

对应 `src/content/news/<slug>.md` 的 frontmatter + 正文，由 `src/content.config.ts` 的 `news` collection 校验。

| 字段 | 类型 | 必填 | 约束 |
|------|------|------|------|
| `title` | string | 是 | 非空；本新闻 ≤ 40 个 CJK 统一表意文字（英文/数字/标点不计）；不得与参考文章标题相同（FR-023） |
| `date` | date | 是 | 本新闻为 `2026-10-23`；列表按此倒序 |
| `summary` | string | 是 | 本新闻 80–200 个 Unicode code point（中文/英文/标点各计 1，不含 Markdown 标记）；MUST NOT 含 `:::highlight`、`:::table`、```` ```bibtex ```` 等控件语法（FR-023、CHK011）。80–200 仅约束本新闻/新增条目，既有新闻允许更短 |
| `cover` | string | 否 | 本新闻不设置 |
| `body` | markdown | 是 | 中文正文；本新闻 ≥ 2,500 个 CJK 字符（FR-028） |

**派生值**：`slug = self-taught-rlvr-2026`；详情页路由 `/news/self-taught-rlvr-2026/`；列表卡片只消费 `title`、`date`、`summary`（FR-030）。

**校验实现建议**：schema 内对全局 `summary` 使用 `[...v].length` 保持 `≤200`；本新闻的 `80–200`、控件语法拒绝、`title ≤40 CJK` 与“不等于参考标题”不通过 schema 的 entry id 判断（Astro 不向 schema 暴露 id），而在 `content.config.ts` 模块加载期仿照 `validateSiteBrand()` 扫描 `src/content/news/self-taught-rlvr-2026.md` 的 frontmatter 完成；任一项失败即抛错中断构建。

## 2. Highlight Block（高亮块）

由 `:::highlight[可选标题] … :::` 声明，mdast `containerDirective(name='highlight')`。

| 字段 | 类型 | 必填 | 约束 |
|------|------|------|------|
| `title` | string | 否 | 来自 `data.directiveLabel`；为空/缺失时不生成标题节点（FR-007、CHK008） |
| `children` | mdast nodes | 是 | 至少一个可见子节点；空块 → 受控 warning 并移除 |
| `visible` | boolean | 是 | `thematicBreak` 计为可见；仅空白文本/空段落视为不可见 |
| `closed` | boolean | 是 | 源片段最后一行必须只有 `:::`；否则硬错误（FR-048） |

**渲染结果**：`<aside class="news-highlight" role="note">`；标题为 `<p class="news-highlight__title" role="heading" aria-level="3">`；正文为普通 Markdown 子节点。

**样式不变量**：`border-left: 4px solid var(--blue)`、`border: 1px solid var(--line)`、`background: var(--sky)`、`border-radius: 12px`、`padding: 18px 20px`、`overflow-wrap: anywhere`；正文与背景对比度 ≥ 4.5:1（FR-006/010）。

## 3. BibTeX Block（BibTeX 引用块）

由围栏代码块 ` ```bibtex … ``` ` 声明，hast `pre > code.language-bibtex`。

| 字段 | 类型 | 必填 | 约束 |
|------|------|------|------|
| `text` | string | 是 | `pre code.textContent` 逐字保留；空/仅空白 → 受控 warning，保留空 `pre`，不生成工具栏（FR-011、CHK017） |
| `language` | literal `bibtex` | 是 | 大小写敏感；`BibTeX`/`bib` → 硬错误（FR-048） |
| `blocks` | array | 是 | 同一新闻任意数量，逐个独立；每块一个复制入口（FR-017） |
| `copyState` | enum | 是 | `idle` \| `copied` \| `error`；由客户端脚本切换，初始 `idle` |
| `statusText` | string | 否 | `copied` → “已复制”；`error` → “复制失败，请手动选择”；由状态区 `aria-live="polite"` 播报 |

**渲染结果**：

```html
<div class="news-bib">
  <div class="news-bib__toolbar">
    <span class="news-bib__label">BibTeX</span>
    <button type="button" class="news-bib__copy" aria-label="复制引用" hidden>
      <svg class="news-bib__icon news-bib__icon--copy" aria-hidden="true">…</svg>
      <svg class="news-bib__icon news-bib__icon--success" aria-hidden="true">…</svg>
      <svg class="news-bib__icon news-bib__icon--error" aria-hidden="true">…</svg>
    </button>
    <span class="news-bib__status" aria-live="polite"></span>
  </div>
  <pre tabindex="0" role="region" aria-label="BibTeX 引用"><code class="language-bibtex">…</code></pre>
</div>
```

**状态机**：

```
idle ──click──> copied ──2s──> idle
  └────click──> error  ──2s──> idle
```

- `copied`：按钮加 `is-copied`，显示绿色对勾；状态区“已复制”。
- `error`：按钮加 `is-error`，显示红色叉号/警示；状态区“复制失败，请手动选择”。
- 按钮固定 32×32，图标切换不改变尺寸；状态区固定 `min-height`，反馈不推动布局（FR-013/014、CHK009）。
- 无 JS：按钮保持 `hidden`，`pre` 内容完整可选（FR-021）。
- 剪贴板文本：`text.replace(/\n$/, '')`，不附加标题/按钮文案（FR-012）。

## 4. Table Block（表格块）

由 `:::table[可选标题] … :::` 声明，mdast `containerDirective(name='table')`。

| 字段 | 类型 | 必填 | 约束 |
|------|------|------|------|
| `caption` | string | 否 | 来自 `data.directiveLabel`；仅第一张表生成 `<figcaption>`，后续表不生成；缺失时不生成图注（FR-045、CHK003） |
| `table` | mdast table[] | 是 | 容器内一至多张标准 Markdown 表格；每张表独立生成 `<figure>`/滚动容器，按源顺序排列；无表格 → 受控 warning 并移除 |
| `closed` | boolean | 是 | 建议结尾 `:::` 前空一行；缺失时删除被吞入末行的 `:::` 并 warning（不失败）；未闭合 → 硬错误 |
| `columns` | array | 是 | 表头列名；本新闻对比表为 4 列（维度 + RLSD/NPO/CoPD），行覆盖“教师信号来源、是否引入额外信息、核心代价与风险、适用阶段”等 ≥4 个维度；控件本身须支持 5 列及以上的横向滚动（T016） |
| `scrollable` | boolean | 是 | 每张表独立判断；表格宽度超出内容区时为 true，滚动只发生在该表容器内（FR-046） |
| `focusable` | boolean | 是 | 每个滚动容器均有 `tabindex="0"`、`role="region"`、`aria-label="对比表"` |

**渲染结果**：

```html
<figure class="news-table">
  <figcaption class="news-table__caption">可选标题</figcaption>
  <div class="news-table__scroll" tabindex="0" role="region" aria-label="对比表">
    <table>…</table>
  </div>
</figure>
```

**样式不变量**：`.news-table__scroll { max-width: 100%; overflow-x: auto; }`；`table { width: max-content; min-width: 100%; border-collapse: collapse; }`；表头 `--sky` 背景、`1px solid var(--line)` 边框、`padding: 8px 12px`；无标题时无空 `figcaption`（FR-045/047）。

## 5. Paper Reference（论文引用）

三篇论文的公开身份信息与 BibTeX 条目。

| 字段 | 类型 | 约束 |
|------|------|------|
| `methodName` | string | `RLSD` \| `NPO` \| `CoPD`；章节标题可使用方法名 |
| `paperTitle` | string | 真实论文标题；RLSD *Self-Distilled RLVR*；NPO *Learning from the Near Future: Temporal Self-Distillation for RLVR*；CoPD *Co-Evolving Policy Distillation* |
| `authors` | string[] | 全列作者；顺序与论文页面一致 |
| `institutions` | string[] | `Institute of Information Engineering, CAS` / `School of Cyber Security, UCAS` / `JD.COM`（CHK002） |
| `year` | number | 2026 |
| `venueType` | enum | `preprint`（三条均为 arXiv 预印本条目） |
| `venue` | string? | `arXiv` |
| `volume` | number? | 不写入（正式 proceedings 发布前无 volume） |
| `note` | string? | 不写入（正文亦不呈现会议接收状态） |
| `citationKey` | string | `yang2026rlsd` / `qin2026npo` / `gu2026copd`（CHK033） |
| `url` | string | HTTPS 公开链接：`https://arxiv.org/abs/2604.03128` / `2604.20733` / `2604.27083` |
| `eprint` | string | `2604.03128` / `2604.20733` / `2604.27083` |
| `archivePrefix` | literal `arXiv` | 三条均有 |
| `primaryClass` | literal `cs.LG` | 三条均有 |
| `codeUrl` | string? | RLSD：`https://github.com/iie-ycx/RLSD`；NPO/CoPD 未发现官方代码仓库（CHK031） |
| `version` | string | RLSD v2；NPO v2（数字以此为准，CHK035）；CoPD v1 |
| `bibType` | enum | 三条均为 `@misc`（C1 决议，CHK004） |

**BibTeX 条目约束**：标题用花括号保护大小写；全列作者；含年份、`eprint`、`archivePrefix`、`primaryClass` 与 HTTPS `url`；不写 `booktitle`/`volume`/`note`；可被 BibTeX 工具解析；`&`/`%` 按 LaTeX 规则转义（FR-026、CHK033）。正式 proceedings/OpenReview 发布后再以正式版条目替换。

## 6. News Figure（新闻配图）

每篇论文小节一张方法框架主图，使用标准 Markdown 图片语法。

| 字段 | 类型 | 约束 |
|------|------|------|
| `src` | string | 与新闻源文件同目录的相对路径：`rlsd-method.png` / `npo-overview.png` / `copd-method.png`；构建期存在性校验，缺失则构建失败（FR-042） |
| `alt` | string | 中文一句话，说明图片展示的方法/流程，不要求逐字翻译图内标签（CHK039） |
| `caption` | string | 紧随图片的普通段落，非 `<figcaption>`；含论文标题、公开链接、`CC BY 4.0` 许可与“图片未修改，仅按页面宽度缩放”声明（FR-040、CHK007） |
| `license` | literal `CC BY 4.0` | 与论文 arXiv 页面一致；链接 `https://creativecommons.org/licenses/by/4.0/` |
| `modified` | literal `未修改` | 仅缩放，不裁剪、不改色、不叠加文字 |
| `link` | string | 论文公开页 `https://arxiv.org/abs/...`；点击图片或图注中的论文链接在新标签页打开（CHK020） |
| `maxWidth` | rule | 不超过正文内容宽度；不放大超过图片固有尺寸（CHK021） |
| `maxBytes` | number | ≤ 500KB；三张实测 ≈171/178/225KB |
| `figureSemantics` | boolean | `false`：不生成 `<figure>`/`<figcaption>`；替代文本承担内容描述（CHK022） |

## 7. Diagram / Formula（正文图示与公式）

- 公式以行内代码或纯文本书写（如 `P_T/P_S`、`S=Q/V`、`a_P/b_P`），不依赖 MathJax/KaTeX；`P` 首次出现时标注“policy”（FR-038、CHK034）。
- 除三张论文主图外，其余机制示意允许用文字、列表或表格替代，不新增图片。

## 8. Abbreviation（缩写）

| 缩写 | 含义 | 首次出现处理 |
|------|------|----------------|
| RLVR | Reinforcement Learning with Verifiable Rewards | 中文全称 + 英文 + 缩写 |
| RLSD | RLVR with Self-Distillation | 同上 |
| OPD / OPSD | On-Policy Distillation / On-Policy Self-Distillation | 同上 |
| NPO / NPD | Near-Future Policy Optimization / Near-Future Policy Distillation | 同上 |
| CoPD | Co-Evolving Policy Distillation | 同上 |
| GRPO | Group Relative Policy Optimization | 同上 |

## Relationships

```
News Entry 1 ── * Highlight Block
News Entry 1 ── * BibTeX Block （每块 1 个复制入口）
News Entry 1 ── * Table Block
News Entry 1 ── 3 Paper Reference （每篇 1 个 BibTeX 块 + 1 张 News Figure）
Paper Reference 1 ── 1 News Figure
Table Block 1 ── 1..* mdast table （每张生成独立真实 HTML <table>）
```

## 渲染映射（Markdown → DOM）

| 源语法 | mdast/hast 节点 | 输出 DOM | 关键 class / ARIA |
|--------|-----------------|----------|-------------------|
| `:::highlight[T]` … `:::` | containerDirective `highlight` | `<aside>` | `news-highlight`、`role="note"`；标题 `news-highlight__title`、`role="heading"`、`aria-level="3"` |
| ` ```bibtex ` … ` ``` ` | `pre > code.language-bibtex` | `<div class="news-bib">` + 工具栏 + `pre` | `news-bib__copy`（`aria-label="复制引用"`、`hidden`）、`news-bib__status`（`aria-live="polite"`）、`pre[tabindex="0"]` |
| `:::table[T]` + Markdown 表格 | containerDirective `table` | `<figure class="news-table">` | `news-table__caption`（可选）、`news-table__scroll`（`tabindex="0"`、`role="region"`、`aria-label="对比表"`） |
| `![alt](fig.png)` | image | `<img>` | Astro 优化属性、`loading="lazy"`、`decoding="async"` |
| `[![alt](fig.png)](https://arxiv.org/abs/...)` | link + image | `<a target="_blank" rel="noopener noreferrer"><img></a>` | 论文链接、键盘可聚焦 |
| 普通 Markdown 表格（未包 `:::table`） | table | 既有渲染 | 不添加 `news-table` 类 |
| 普通代码块（非 `bibtex`） | `pre > code` | 既有 Shiki 渲染 | 不添加 `news-bib` 类 |

## 校验映射

| 规则 | 数据字段 / 检查点 | 失败处理 |
|------|------------------|----------|
| FR-023 摘要 80–200 code point、无控件语法 | `summary` | 构建失败（schema/refine） |
| FR-023 标题 ≤40 中文字符、不与参考标题相同 | `title` | 构建失败或内容审查拦截 |
| FR-026 三条 BibTeX 类型/字段/作者/链接 | `Paper Reference` | 复制后用 BibTeX 工具解析；人工核对字段 |
| FR-028 ≥2,500 CJK | `body` | 构建前脚本统计；不达标则修订正文 |
| FR-040 三张主图/图注/许可/链接 | `News Figure` | 构建期检查文件存在；人工核对图注 |
| FR-042 单张 ≤500KB | 文件体积 | 构建前检查或压缩 |
| FR-044–047 表格块 | `Table Block` | 未闭合硬错误；空表 warning；5 列 375px 容器滚动实测 |
| FR-048 语法诊断 | 控件节点 | 硬错误构建失败；软问题 warning 并记录基线 |
