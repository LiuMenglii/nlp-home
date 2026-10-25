# Phase 0 Research: 新闻详情页重点控件与三论文解读新闻

**Feature**: `008-news-detail-widgets` | **Date**: 2026-10-23

本文件记录实现前已完成的验证结论。所有技术判断均在本仓库的 Astro 7.3.8 / `@astrojs/markdown-satteri` 0.4.3 / `satteri` 0.10.5 环境中实测，而非基于文档推断；论文事实以 2026-10-23 抓取的 arXiv 页面与作者主页为准。

## 1. Markdown 扩展机制

### Decision: 使用 Astro 内置 satteri processor + mdast/hast 插件

- **入口**：`@astrojs/markdown-satteri` 导出 `satteri` 工厂，配置写在 `astro.config.mjs` 的 `markdown.processor`。
- **必需选项**：`features: { directive: true }` 才识别 `:::name[label]` 容器指令；`options: { position: true }` 写在插件定义上才能在 mdast 插件中读 `node.position` 与 `ctx.source`。`satteri()` 工厂本身只接受 `mdastPlugins` / `hastPlugins` / `features`，不接收 `options` 或 `syntaxHighlight`。
- **能力**：`defineMdastPlugin` / `defineHastPlugin`；`ctx.replaceNode`、`ctx.removeNode`、`ctx.setProperty`、`ctx.wrapNode`、`ctx.parent`、`ctx.textContent`。
- **Rationale**：零新增运行时依赖（satteri 是 astro 7 的传递依赖），构建期完成全部转换，客户端零成本；满足 Constitution V。为避免 `npm update` 后 API 消失，实现时在 `devDependencies` 中精确锁定 `@astrojs/markdown-satteri@0.4.3` 与 `satteri@0.10.5`（不带 `^`）。
- **Alternatives rejected**：
  - 独立 Remark/Rehype 管线：需替换 Astro 7 默认处理器并新增依赖，风险与维护成本更高。
  - 自定义 `.astro` 组件：维护者必须写组件而非纯 Markdown，违反 FR-001/FR-002 与 Constitution II。
  - 客户端解析控件：增加运行时与 FOUC，且列表页隔离更难保证。

### Decision: 插件按语法而非文件路径启用

- 通过 `containerDirective` 名称与 `code.language-bibtex` 类名匹配，而非 `fileURL` 过滤。
- **Rationale**：只有新闻 Markdown 会写这些语法；按路径过滤会引入额外分支且无法覆盖临时测试文件。列表页只读 frontmatter，不渲染正文，天然满足 FR-031。构建后额外检查首页/Team/Publications 不含 `news-highlight`/`news-bib`/`news-table` 类名（FR-031）。
- **Risk**：其他页面若出现同语法也会被转换——当前不存在此类内容，编辑文档说明控件仅面向新闻。

### Decision: 构建期诊断分为硬错误与受控 warning

- 硬错误（`throw`，`npm run build` 失败，带文件/行号）：未闭合 `:::highlight`/`:::table`；` ```BibTeX `、` ```bib ` 等非小写 `bibtex` 语言标记；缺失图片由 Astro 自身报错。
- 受控 warning（`console.warn`，构建继续）：空高亮块、空 `bibtex` 块、空表格块、未知容器 `:::foo`、同名高亮嵌套、表格尾行 `:::` 缺失空行。
- **Rationale**：满足 FR-036 的“除已声明诊断外无新增 warning”与 FR-048 的“硬错误失败、软问题可定位”。quickstart 记录基线 warning 数量，新增 warning 视为回归。
- **Alternatives rejected**：全部静默降级会让维护者永远发现不了拼写错误；全部构建失败会让空块等非致命问题阻塞内容更新。

## 2. 高亮块（`:::highlight`）

### 已实测的解析行为

| 输入情形 | 实际行为 | 处理策略 |
|---|---|---|
| 正常闭合，含段落/加粗/斜体/链接/列表/引用/代码/图片/标题 | 解析为 `containerDirective`，children 正常 | 转换为 `<aside class="news-highlight" role="note">` |
| 未写结尾 `:::` | 仍解析为容器并吞到文末 | 硬错误，构建失败并给文件/行号（FR-048） |
| 空块（只有命令与 `:::`） | children 为空 | 受控 warning，整体移除，不留空色块 |
| 只有 `---` | `thematicBreak` | 视为可见内容，保留（修复早期“误删整块”缺陷） |
| 表格后紧跟 `:::` 且无空行 | `:::` 被解析为表格最后一行 | 若末子节点为 `table` 且末行首格 trim 为 `:::`，删除该行并 warning；文档建议表格后空一行 |
| 同名高亮嵌套 | 产生多余 `<p>:::</p>` | 不支持嵌套同类高亮，warning 并降级；文档明确写出 |
| 未知容器指令 `:::foo` | 容器节点 | warning 并展开为 children，不吞内容 |
| 文本指令 `:abc[标签]` / 叶子指令 | 被解析为指令节点 | 按源码原样还原为文本，避免吞正文 |
| `1:2`、`10:30` 等冒号文本 | 不产生指令 | 无需特殊处理 |

### Decision: 标题通过 `directiveLabel` 子节点识别

- 可选标题 `:::highlight[标题]` 在 mdast 中是带 `data.directiveLabel` 的子节点；转换为 `<p class="news-highlight__title" role="heading" aria-level="3">`。
- 无标题时不存在该节点，因此不会渲染空标题行（FR-007）；标题可选（CHK008）。

### Decision: 标题与正文视觉强调不依赖颜色

- 容器背景 `--sky (#eaf5fc)` + `--line` 边框 + 左侧 4px `--blue` 强调竖线 + 12px 圆角；标题加粗、`--ink` 文字。正文 `--ink` 对 `#eaf5fc` 的对比度约 14:1，满足 4.5:1（FR-010）。
- 左侧竖线、边框与内边距提供非颜色结构线索；无标题块同样保留这些线索，不强制标题。

## 3. BibTeX 引用块（` ```bibtex `）

### Decision: Shiki `excludeLangs: ['bibtex']`

- 默认 Shiki 会高亮 bibtex 并输出深色主题 `pre`，与站点浅色风格冲突，且会注入大量 span。
- 配置 `syntaxHighlight: { type: 'shiki', excludeLangs: ['bibtex'] }` 后实测输出纯净的 `<pre><code class="language-bibtex">…</code></pre>`，文本逐字保留。
- 语言标记**大小写敏感**：`BibTeX` 不匹配 `bibtex`，会触发 Shiki 警告并按普通文本处理；本特性将其升级为硬错误，构建失败并提示必须写小写 `bibtex`（FR-048）。

### Decision: hast 插件用 `replaceNode` 构造包裹层（工具栏在前）

- 早期尝试 `ctx.wrapNode(node, wrapper)`：被包裹的 `pre` 总是成为 wrapper 的第一个子节点，工具栏只能排在后面，无法做“右上角”布局；`insertBefore` 也无法改变输出顺序。
- **已验证方案**：构造 `div.news-bib`，`children: [toolbar, node]` 后 `ctx.replaceNode(node, wrapper)`。实测输出顺序为工具栏在前、`pre` 在后，且 `pre` 只被访问一次（`VISITS 1`），无重复包裹或死循环。
- **Rationale**：结构由插件一次性生成，CSS 可自由布局；不依赖 DOM 后处理脚本。

### Decision: 空块保留空 `pre`，不生成按钮

- `ctx.textContent(code).trim() === ''` 时输出受控 warning，保留原始空 `pre`，不出现“复制空内容”的入口（FR 边界、CHK017）。

### Decision: 复制文本取自 `pre code.textContent`，去掉末尾单个换行

- Shiki/代码块会在末尾补一个 `\n`；复制时 `replace(/\n$/, '')`，保证粘贴内容与维护者书写一致（FR-012）。
- 不读取 `textContent` 之外的属性，避免把行号或按钮文案混入。

### Decision: 固定尺寸图标按钮，反馈不改变布局

- 按钮默认 `hidden`，由内联脚本显示；无 JS 时按钮不出现，正文仍完整可选（FR-021）。
- 按钮固定 32×32，内含三个 SVG 图标（复制/成功对勾/失败叉号或警示），通过 `is-copied` / `is-error` 类切换显示与颜色；`aria-hidden="true"`，按钮 `aria-label` 固定为“复制引用”。
- 文字反馈只写入 `.news-bib__status`（`aria-live="polite"`），成功“已复制”、失败“复制失败，请手动选择”；状态区固定 `min-height` 与 `white-space: nowrap`，按钮尺寸不变，因此反馈不推动周围内容（FR-013/014、CHK009/030）。
- 剪贴板失败不回退 `document.execCommand('copy')`，保持脚本最小（CHK029）。
- `pre` 设 `overflow-x: auto` 与 `tabindex="0"`，支持键盘方向键横向滚动；`.news-bib` 设 `min-width: 0; max-width: 100%`，保证页面级不横向溢出（FR-015/019、CHK024）。

## 4. 表格块（`:::table`）

### Decision: 不把对比表渲染为图片

- **技术上可行**：可在构建期用 headless 浏览器截图，或手工导出 PNG 后用标准 Markdown 图片语法插入；点击图片再打开原图也能实现“按图片逻辑放大”。
- **不采用的原因**：
  1. 构建期截图需要新增 Playwright/Puppeteer 等重依赖，违反 Constitution III/V 与 FR-034；
  2. 图片表格失去文本选中、检索、复制与屏幕阅读器语义，违反可访问性与内容可维护性；
  3. 手机端图内文字过小，必须依赖额外灯箱/放大脚本，而本特性范围明确不引入放大脚本；
  4. 内容更新需同时改 Markdown 与重新导出图片，长期维护成本高。
- **替代方案**：真实 HTML `<table>` + 容器内横向滚动 + 可选图注；视觉与交互均可控，且表格内容可检索、可复制。该方案已写入 FR-044–FR-047。
- **Alternatives rejected**：B. 小屏改堆叠卡片需复制内容且破坏横向对比；C. 小屏删维度牺牲 FR-037 的完整性；D. 表格转图片见上。

### Decision: `:::table[可选标题]` 容器 + `<figure>` 语义

- 识别 `containerDirective` 且 `name === 'table'`；取可选 `directiveLabel` 为图注。
- 输出结构：
  ```html
  <figure class="news-table">
    <figcaption class="news-table__caption">可选标题</figcaption>
    <div class="news-table__scroll" tabindex="0" role="region" aria-label="对比表">
      <table>…</table>
    </div>
  </figure>
  ```
- 容器内每张 `table` 重复上述结构，各自生成独立 `<figure>` 与滚动容器；容器标题只作为第一张表的 `figcaption`，后续表不生成图注。需要每张表都有标题时，分别使用独立的 `:::table[标题]` 容器。
- 无标题时不生成 `figcaption`；空表（无 `table` 子节点）warning 并移除；未闭合硬错误。
- 表格尾行 `:::` 问题与高亮块相同：删除被吞入表格末行的 `:::` 并 warning；文档建议结尾前留空行。

### Decision: 表格样式与横向滚动

- `.news-table__scroll { max-width: 100%; overflow-x: auto; }`；`table { width: max-content; min-width: 100%; border-collapse: collapse; }`，保证 5 列在 375px 下只在容器内滚动。
- 表头 `--sky` 背景、`1px solid var(--line)` 边框、`padding: 8px 12px`、`white-space: normal`，与站点色板一致；不依赖浏览器默认表格样式。
- 滚动容器 `tabindex="0"`、`role="region"`、`aria-label="对比表"`，方向键可滚动，`:focus-visible` 沿用全局外框（FR-046）。

## 5. 图片管线与新闻配图

### Decision: 图片与 Markdown 同目录、相对路径引用

- 现有约定（`team-building-2023.md` 等）已验证：`![alt](fig.png)` 会被 Astro 处理为 `/nlp-home/_astro/*.webp`，自动带 `width`/`height`/`loading="lazy"`/`decoding="async"`，并正确拼接 `base`。
- 缺失文件时构建报 `[ImageNotFound] Could not find requested image …`，满足 FR-042 的“构建失败而非破图”。

### Decision: 使用 `[![alt](fig.png)](https://arxiv.org/abs/...)` 实现点击打开论文页

- Markdown 链接包裹图片即可，不新增脚本；`newsExternalLinksPlugin` 只匹配“唯一子节点为 `img` 的 `a[href^="http"]`”（新闻配图）与 `arxiv.org` 论文链接（图注），为其补 `target="_blank" rel="noopener noreferrer"`，满足 FR-041 的“新标签页打开论文页”；其他正文外链不改写，既有新闻无这两类链接，HTML 保持不变。
- 链接目标固定为论文公开页（arXiv abs），不再二选一“本地原图或论文页”（CHK020）。
- 图注用紧随其后的普通段落书写，包含论文标题、arXiv 链接、`CC BY 4.0` 许可与“图片未修改，仅按页面宽度缩放”声明，并链接许可文本；不使用 `<figcaption>`，保持 Markdown 可维护性（CHK022、CHK007）。
- 图片最大宽度等于正文内容宽度，按原始比例缩放，不放大超过固有尺寸（CHK021）。

### 图片素材（已下载并核对尺寸/体积）

| 文件 | 来源 | 尺寸 | 体积 | 许可 |
|---|---|---|---|---|
| `rlsd-method.png` | `https://arxiv.org/html/2604.03128v2/RLSD-method.png`（RLSD Fig. 4） | 1790×825 | ≈171KB | CC BY 4.0 |
| `npo-overview.png` | `https://arxiv.org/html/2604.20733v2/figure3_overview.png`（NPO Fig. 3） | 1695×664 | ≈178KB | CC BY 4.0 |
| `copd-method.png` | `https://arxiv.org/html/2604.27083v1/copd-method.png`（CoPD Fig. 3） | 1932×919 | ≈225KB | CC BY 4.0 |

三张均 <500KB，均为方法/框架总览图，符合 FR-040。

## 6. 交互、无障碍与降级

- 事件委托绑定在 `.news-body` 上，`click` 命中 `button.news-bib__copy` 时向上找 `.news-bib`，因此任意数量块互不串扰（FR-017）。
- `aria-live="polite"` 状态区放在工具栏内，复制结果播报一次；按钮图标 `aria-hidden`，不重复播报（FR-020、CHK030）。
- 按钮为原生 `<button type="button">`，Tab 聚焦、Enter/Space 触发；`pre` 也 `tabindex="0"`，方向键横向滚动；全局 `:focus-visible` 已存在 2px 外框（FR-019、CHK024）。
- 剪贴板失败（权限拒绝、非安全上下文）写“复制失败，请手动选择”，文本仍可选中；不使用 `execCommand` 回退（FR-014、CHK029）。
- 脚本体积目标约 1KB，远低于 5KB 上限；以 `<script is:inline>` 的 UTF-8 字节数计（SC-009、CHK025）。
- 验收补充 320px 视口与 200% 文字缩放抽查；本次不专门适配 `forced-colors`，但控件保留边框与左侧强调线（CHK023）。

## 7. 内容事实基准（写作时引用）

> 以下信息已在论文公开页面与作者主页核对，作为新闻正文与 BibTeX 的唯一事实来源；正文不得写入无法在此表中溯源的数字。2026-10-23 决议：新闻正文与 BibTeX 完全删去 NeurIPS 2026 接收状态/Spotlight 表述，arXiv 页面 comments 中的会议信息不作为新闻事实；三条 BibTeX 统一按 arXiv `@misc` 书写（C1 决议），正式 proceedings / OpenReview 发布后再评估更新。

### RLSD — arXiv:2604.03128v2（按 arXiv 预印本呈现）

- 标题 *Self-Distilled RLVR*；提交 2026-04-03，修订 2026-04-08；发表状态按 arXiv 预印本呈现（不采用会议接收信息）。
- 作者：Chenxu Yang, Chuanyu Qin, Qingyi Si, Minghui Chen, Naibin Gu, Dingyu Yao, Zheng Lin, Weiping Wang, Jiaqi Wang, Nan Duan。
- 机构：Institute of Information Engineering, CAS / School of Cyber Security, UCAS / JD.COM。
- 官方代码：`https://github.com/iie-ycx/RLSD`（README 中提供 arXiv `@misc`；本新闻沿用 arXiv `@misc`，待正式 proceedings 发布后更新）。
- 核心量：evidence ratio `P_T(y_t) / P_S(y_t)`，可解释为特权信息对模型信念的修正倍数（近似 Bayesian belief update）；权重 `w_t = exp(sign(A)·Δ_t) = (P_T/P_S)^{sign(A)}`，方向由 verifier 决定、教师只调幅度；stop-gradient；ratio clip 约 3%–6%。
- 实验：Qwen3-VL-8B-Instruct，5 个多模态推理基准；Avg：Base 51.49 / GRPO 53.86 / OPSD 52.49 / SDPO 52.74 / GRPO+OPSD 52.91 / RLSD 56.18；MathVista +1.9、MathVision +3.91（相对 GRPO）。

### NPO — arXiv:2604.20733v2，预印本

- 标题 *Learning from the Near Future: Temporal Self-Distillation for RLVR*；提交 2026-04-22，修订 2026-10-01；仍为预印本（CHK002/CHK035）。
- 作者：Chuanyu Qin, Chenxu Yang, Qingyi Si, Naibin Gu, Dingyu Yao, Zheng Lin, Peng Fu, Nan Duan, Jiaqi Wang。
- 机构：Institute of Information Engineering, CAS / School of Cyber Security, UCAS / JD.COM。
- 官方代码/模型：未发现官方代码仓库；Hugging Face 论文页为 `https://huggingface.co/papers/2604.20733`（CHK031）。
- 核心量：`S = Q / V`（Q 为未来教师提供的额外可验证能力，V 为基于 KL 的 source–learner 不匹配代价），`Ŝ(Δ)=Q̂(Δ)/V̂(Δ)`，`Δ* = argmax Ŝ`。
- 实验（全部以 v2 为准）：8 个图文基准 Avg GRPO 60.25 → NPO（early+late）62.84 → AutoNPO 63.15；文本 6 基准 48.7 → 52.5；视频 6 基准 58.30 → 59.44；near-future 教师后续 RL 得 63.23，far-future 61.92；near-future 来源 verified success 53.1% → 65.3%；gain-per-cost 2.81（near）/ 0.89（external）/ 0.11（longer-distance）。

### CoPD — arXiv:2604.27083v1（按 arXiv 预印本呈现）

- 标题 *Co-Evolving Policy Distillation*；提交 2026-04-29；发表状态按 arXiv 预印本呈现（不采用会议接收信息）。
- 作者：Naibin Gu, Chenxu Yang, Qingyi Si, Chuanyu Qin, Dingyu Yao, Peng Fu, Zheng Lin, Weiping Wang, Nan Duan, Jiaqi Wang。
- 机构：Institute of Information Engineering, CAS / School of Cyber Security, UCAS / JD.COM。
- 官方代码/模型：未发现官方代码仓库；Hugging Face 论文页为 `https://huggingface.co/papers/2604.27083`（CHK031）。
- 核心量：`U_P ≈ a_P · X(D1,D2) + b_P`（`a_P ∈ [0,1]` 能力转化率，`b_P ≤ 0` 额外损失）；mixed RLVR `U_mix ≈ X − Φ(D1,D2)`；static OPD `a_static = η(O_low)` 很小、`b_static = 0`；CoPD 经分支 RLVR + 双向 mutual OPD 使 `η(O_mod) ≫ η(O_low)`。
- 实验：Qwen3-VL；4B 汇总 Avg CoPD 57.71 / w/o I-OPD 57.04 / w/o T-OPD 57.02 / Text-Branch Only 57.24；MathVista 76.80（Mixed RLVR 75.55、MOPD 74.75）；MathVision 57.57（56.00、56.99）。

### BibTeX 格式基准

- RLSD：`@misc{yang2026rlsd, title={{Self-Distilled RLVR}}, author={Chenxu Yang and Chuanyu Qin and Qingyi Si and Minghui Chen and Naibin Gu and Dingyu Yao and Zheng Lin and Weiping Wang and Jiaqi Wang and Nan Duan}, year={2026}, eprint={2604.03128}, archivePrefix={arXiv}, primaryClass={cs.LG}, url={https://arxiv.org/abs/2604.03128}}`
- CoPD：`@misc{gu2026copd, title={{Co-Evolving Policy Distillation}}, author={Naibin Gu and Chenxu Yang and Qingyi Si and Chuanyu Qin and Dingyu Yao and Peng Fu and Zheng Lin and Weiping Wang and Nan Duan and Jiaqi Wang}, year={2026}, eprint={2604.27083}, archivePrefix={arXiv}, primaryClass={cs.LG}, url={https://arxiv.org/abs/2604.27083}}`
- NPO：`@misc{qin2026npo, title={{Learning from the Near Future: Temporal Self-Distillation for RLVR}}, author={Chuanyu Qin and Chenxu Yang and Qingyi Si and Naibin Gu and Dingyu Yao and Zheng Lin and Peng Fu and Nan Duan and Jiaqi Wang}, year={2026}, eprint={2604.20733}, archivePrefix={arXiv}, primaryClass={cs.LG}, url={https://arxiv.org/abs/2604.20733}}`
- 三条均全列作者、标题用花括号保护大小写、citation key 固定；统一 `@misc`，不写 `booktitle`/`volume`/`note`；`&`/`%` 若出现在字段中按 LaTeX 规则转义。

### 写作边界

- 参考解读《让大模型学会「自己教自己」！…》（量子位，2026-05-19）只用于结构与比喻启发，不逐字复用；按用户决定，正文不设“参考解读”署名或链接（CHK036）。
- 机构归属已从论文页确认，可写 IIE, CAS / UCAS / JD.COM。
- 作者归属与稿件定位（用户 2026-10-25 确认）：三篇论文中凡署名单位为 IIE, CAS 或 UCAS 的作者均为本课题组同学或老师，JD.COM 为合作单位；新闻标题、摘要、导语、各节作者/机构句与结尾按“课题组工作解读与宣传”定位行文，但 MUST NOT 改动论文标题、作者列表、机构列表、BibTeX、事实数字与引用条目。

## 8. 待实现阶段复核的项

| 项 | 复核方式 |
|---|---|
| Shiki 4 下 `excludeLangs` 行为与 `<pre>` 属性 | 构建后检查生成的 HTML |
| 高亮块在 375px 下的长 URL 折行 | 浏览器实测 `scrollWidth` |
| 复制按钮图标切换是否完全消除抖动 | 浏览器实测按钮与相邻元素位置 |
| 表格块 5 列在 375px 下的容器滚动 | 浏览器实测 `.news-table__scroll` 与页面 `scrollWidth` |
| 表格块空表/未闭合/尾行 `:::` 诊断 | fixture 测试与故障注入 |
| 既有新闻渲染无变化 | 构建前记录 `dist/news/*/index.html` 基线，改动后 diff 关键片段 |
| 全局 `body { overflow-x: hidden }` 的验收影响 | **已解决（T028）**：该规则已移除；移除前对全站 18 页 × 320/375/768/1024/1280/1440px 强制 `overflow-x: visible` 做逐元素 `getBoundingClientRect()` + `scrollWidth` 审计，108 次测量 0 溢出；验收直接测 `scrollWidth`，不再依赖临时禁用（CHK010） |
