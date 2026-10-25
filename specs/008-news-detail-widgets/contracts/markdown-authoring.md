# Contract: Markdown 编辑侧（Authoring）

**Feature**: `008-news-detail-widgets` | **Version**: 2026-10-23

本契约面向新闻维护者与实现者，定义“写什么 Markdown 会得到什么结果”。渲染后 DOM/交互契约见 [rendered-dom.md](./rendered-dom.md)。

## 通用约束

- **适用页面**：三种控件只在新闻详情页（`/news/<id>/`）生效；新闻列表、首页、Team、Publications 不渲染正文控件。当前只有 news collection 渲染 Markdown，因此语法级启用等价于详情页生效（FR-031）。
- **控件位置**：高亮块与表格块只建议放在正文顶层段落；MUST NOT 嵌套在列表项、引用块或其他容器中（不支持，文档需说明）。
- **普通内容不受影响**：未包在 `:::highlight` / `:::table` 中的 Markdown，以及语言标记不是 `bibtex` 的代码块，保持既有渲染（FR-004）。
- **不写 HTML 控件**：维护者 MUST NOT 手写 `<aside class="news-highlight">` 等 HTML 来绕过命令；控件结构由插件生成。
- **构建期诊断**：硬错误使 `npm run build` 失败；受控 warning 不失败，但会在终端输出文件/行号，quickstart 记录基线数量（FR-036/048）。

## HF-01 高亮块（Highlight）

**语法**

```markdown
:::highlight[可选标题]
这里是需要强调的内容，可以包含 **加粗**、*斜体*、`行内代码`、[链接](https://example.com)、列表与引用。
:::
```

- 标题可选：`:::highlight[]` 或 `:::highlight` 均视为无标题，不生成空标题行。
- 结尾 `:::` 不可省略；未闭合 → 硬错误，构建失败并给文件/行号。
- 空块（只有命令与 `:::`）→ 受控 warning，整块移除；`---` 分隔线视为可见内容，保留。
- 支持内容：段落、加粗、斜体、行内代码、链接、列表、引用、代码块、图片、表格（按普通 Markdown 渲染；表格不会自动获得表格块样式）。
- 不支持：在列表项或引用块内再写 `:::highlight`；同名嵌套会产生多余 `:::`，仅降级并 warning。
- 视觉：圆角、底色、边框、左侧 4px 强调竖线；标题可选，无标题仍有结构线索；正文与背景对比度 ≥ 4.5:1（FR-006/007/010）。

**新闻中的使用建议**：全文 2–3 个，放在关键洞察或对比结论之后，与相邻正文形成“提出—强调”关系，不用于装饰性短句。

## HF-02 新闻配图（News Figure）

**语法**

```markdown
[![RLSD 方法框架图](rlsd-method.png)](https://arxiv.org/abs/2604.03128)

图源：*Self-Distilled RLVR*（[arXiv:2604.03128](https://arxiv.org/abs/2604.03128)，[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)）；图片未修改，仅按页面宽度缩放。
```

- 图片 MUST 与新闻源文件同目录存放，用相对文件名引用；MUST NOT 外链或使用参考文章配图（FR-040）。
- 图片 MUST 为该论文展示方法/框架总览的示意图；文件缺失 → 构建失败，不上线破图（FR-042）。
- 替代文本 MUST 为中文一句话，说明图展示的方法/流程，不要求逐字翻译图内标签（CHK039）。
- 图注为紧随图片的普通段落，不生成 `<figure>`/`<figcaption>`；MUST 含论文标题、公开链接、`CC BY 4.0` 许可与“图片未修改，仅按页面宽度缩放”声明，并链接许可文本（FR-040、CHK007）。
- 点击图片，或点击图注中的论文链接，MUST 在新标签页打开论文公开页（默认 arXiv abs），不要求本地原图或灯箱（FR-041、CHK020）。
- 图片最大宽度等于正文内容宽度，按原始比例缩放，不放大超过固有尺寸；单张 ≤500KB（FR-041/042、CHK021）。
- 三张图文件名建议：`rlsd-method.png`、`npo-overview.png`、`copd-method.png`。

## BB-01 BibTeX 引用块（Bib Block）

**语法**

````markdown
```bibtex
@misc{yang2026rlsd,
  title         = {{Self-Distilled RLVR}},
  author        = {Chenxu Yang and Chuanyu Qin and Qingyi Si and Minghui Chen and Naibin Gu and Dingyu Yao and Zheng Lin and Weiping Wang and Jiaqi Wang and Nan Duan},
  year          = {2026},
  eprint        = {2604.03128},
  archivePrefix = {arXiv},
  primaryClass  = {cs.LG},
  url           = {https://arxiv.org/abs/2604.03128}
}
```
````

- 语言标记 MUST 为小写 `bibtex`；`BibTeX`、`bib` 等非小写标记 → 硬错误，构建失败并提示（FR-048）。info string 末尾空白由 CommonMark 裁剪，标注为 `bibtex `（带尾随空格）仍按合法 `bibtex` 渲染，不触发硬错误。
- 内容 MUST 逐字保留缩进、换行、空格与花括号；插件不格式化、不重排（FR-011）。
- 复制入口 MUST 为固定 32×32 图标按钮，一次复制该块全文（去掉末尾单个换行），不附加标题/按钮文案（FR-012/013）。
- 复制成功：绿色对勾图标 + 状态区“已复制”；失败：红色叉号/警示 + “复制失败，请手动选择”；约 2 秒复位；反馈不改变按钮尺寸、不推动布局（FR-013/014、CHK009）。
- 空块 → 受控 warning，保留空 `pre`，不生成按钮（CHK017）。
- 长行只在块内横向滚动；`pre` 可 Tab 聚焦并用方向键滚动；页面不横向溢出（FR-015/019、CHK024）。
- 禁用 JS：按钮隐藏，内容完整可选（FR-021）。
- 内容按纯文本渲染；`&`/`%` MUST 由维护者写成 `\&`/`\%`，渲染器逐字保留（FR-018）。

**三条条目的格式与字段**

| 论文 | 类型 | 固定字段 |
|------|------|----------|
| RLSD | `@misc` | `eprint = {2604.03128}`、`archivePrefix = {arXiv}`、`primaryClass = {cs.LG}`、`url` |
| CoPD | `@misc` | `eprint = {2604.27083}`、`archivePrefix = {arXiv}`、`primaryClass = {cs.LG}`、`url` |
| NPO | `@misc` | `eprint = {2604.20733}`、`archivePrefix = {arXiv}`、`primaryClass = {cs.LG}`、`url` |

- citation key 固定：`yang2026rlsd`、`qin2026npo`、`gu2026copd`（CHK033）。
- 三条均全列作者、标题用花括号保护大小写、含年份、`eprint` 与 HTTPS 链接（FR-026）。
- 正式 proceedings/OpenReview 发布前，三条统一为 arXiv `@misc`，不得写 `booktitle`/`volume`/`note`；正文 MUST NOT 提及 NeurIPS 2026 接收状态或 Spotlight（2026-10-23 决议）；正式版发布后再以正式版条目替换（CHK004）。
- 每条复制后 MUST 能用标准 BibTeX 工具解析；建议每条单独成块，便于复制。

## TB-01 表格块（Table Block）

**语法**

```markdown
:::table[表 1：三篇论文的定位对比]
| 维度 | RLSD | NPO | CoPD |
| --- | --- | --- | --- |
| 教师信号来源 | 看见答案的自己 | 短暂未来后的自己 | 走另一条路的自己 |
| 是否引入额外信息 | 参考解答 | 未来 checkpoint | 其他能力分支 |
| 核心代价与风险 | 信息泄漏 | 教师距离取舍 | 分支间漂移 |
| 适用阶段 | 训练期间 | 训练期间/之后 | 训练期间 |
:::
```

- 标题可选：`:::table[]` 或 `:::table` 均视为无标题，不生成空 `figcaption`（FR-045）。
- 容器内 MUST 为一至多张标准 Markdown 表格；无表格 → 受控 warning，不生成空表格控件。
- 结尾 `:::` 前 SHOULD 留一个空行；若表格末行被解析为 `:::`，插件删除该行并输出受控 warning（边界行为，不使构建失败）。
- 未闭合 → 硬错误，构建失败。
- 容器内每张表分别渲染为真实 `<figure class="news-table">` + 可选 `<figcaption>` + 可聚焦滚动容器 + 一张 `<table>`，按源顺序排列；标题仅作为第一张表的图注，后续表不生成 `<figcaption>`；需要每张表都有标题时分别使用独立容器；表格内容可选中、可检索（FR-045）。
- 窄视口下表格只在容器内横向滚动；页面不横向溢出；键盘可 Tab 聚焦并用方向键滚动（FR-046）。
- 表格 MUST NOT 转为图片；不引入灯箱或放大脚本（FR-047、CHK003）。
- 普通 Markdown 表格未包在 `:::table` 中时保持既有渲染，不自动升级为控件（FR-004）。

## DF-01 构建期诊断

| 输入 | 级别 | 构建结果 | 页面/终端表现 |
|------|------|----------|----------------|
| 未闭合 `:::highlight` 或 `:::table` | 硬错误 | 失败 | 终端给文件与行号，不生成页面 |
| ` ```BibTeX `、` ```bib ` 等非小写 `bibtex` | 硬错误 | 失败 | 终端提示必须写小写 `bibtex` |
| 空高亮块 | 受控 warning | 继续 | 移除空块，不留空白 |
| 空 `bibtex` 块 | 受控 warning | 继续 | 保留空代码块外观，无按钮 |
| 空表格块 | 受控 warning | 继续 | 不生成表格控件 |
| 未知容器 `:::foo` | 受控 warning | 继续 | 展开为普通内容 |
| 同名高亮嵌套 | 受控 warning | 继续 | 降级并保留正文，可能残留 `:::` 文本 |
| 表格后未留空行写 `:::` | 受控 warning | 继续 | 自动删除被吞入表格末行的 `:::` |
| 图片文件缺失 | 硬错误（Astro） | 失败 | 终端指出缺失文件，不上线破图 |

- 除上述诊断外，构建 MUST NOT 新增 warning（FR-036）。
- quickstart 记录基线 warning 数量；新增 warning 视为回归。

## 验收对应

| 契约 | 对应测试 |
|------|----------|
| HF-01 | 带/不带标题、长 URL、多个块、列表/引用内不支持 |
| BB-01 | 复制逐字一致、成功/失败图标、2 秒复位、长行滚动、无 JS、键盘、空块 |
| TB-01 | 带/不带标题、5 列 375px 容器滚动、键盘、空表、尾行 `:::`、普通表格不升级 |
| HF-02 | 三张主图、图注许可、点击论文页、缺失文件构建失败、≤500KB、alt |
| DF-01 | 注入未闭合/大写标记（构建失败）、空块/未知容器（warning + 基线） |
