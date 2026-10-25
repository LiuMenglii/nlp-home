# Contract: 渲染后 DOM 与交互（Rendered DOM）

**Feature**: `008-news-detail-widgets` | **Version**: 2026-10-23

本契约定义插件输出、CSS 与客户端脚本共同保证的 DOM 结构、ARIA、键盘与视觉不变量。编辑侧语法见 [markdown-authoring.md](./markdown-authoring.md)。

## RD-01 高亮块 DOM

```html
<aside class="news-highlight" role="note">
  <p class="news-highlight__title" role="heading" aria-level="3">可选标题</p>
  <p>正文…</p>
</aside>
```

- `aside.news-highlight` 必须存在；`role="note"` 保留。
- 有标题时生成 `p.news-highlight__title[role="heading"][aria-level="3"]`；无标题时该节点 MUST NOT 存在（不生成空标题/空行）。
- 标题与正文之间的间距由 CSS 控制，不依赖空段落。
- 正文子节点保持普通 Markdown 输出（`p`、`ul`、`a`、`code` 等），不包裹额外交互元素。

## RD-02 BibTeX 引用块 DOM

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

- 子节点顺序 MUST 为“工具栏 → `pre`”；工具栏不可位于 `pre` 之后（FR-013、research §3）。
- `button[type="button"].news-bib__copy` MUST 有可读 `aria-label="复制引用"`；默认带 `hidden`，由脚本移除；无 JS 时保持隐藏。
- 三个 SVG 图标 MUST 为 `aria-hidden="true"`；默认只显示复制图标，`is-copied` 时显示成功图标，`is-error` 时显示失败图标。
- `span.news-bib__status[aria-live="polite"]` MUST 存在；成功写“已复制”，失败写“复制失败，请手动选择”；状态区是唯一播报源。
- `pre` MUST 有 `tabindex="0"`、`role="region"`、可读 `aria-label`；`pre` 内 `code.language-bibtex` 保留原文。
- 空 `bibtex` 块：保留 `pre`/`code`，不生成 `.news-bib__toolbar` 与按钮。
- CSS MUST 包含 `.news-bib__copy[hidden] { display: none !important; }`，防止作者样式覆盖 `hidden`（CHK028）。
- `.news-bib` MUST 设 `min-width: 0; max-width: 100%`；`pre` MUST 设 `overflow-x: auto; max-width: 100%`。

## RD-03 表格块 DOM

```html
<figure class="news-table">
  <figcaption class="news-table__caption">可选标题</figcaption>
  <div class="news-table__scroll" tabindex="0" role="region" aria-label="对比表">
    <table>
      <thead>…</thead>
      <tbody>…</tbody>
    </table>
  </div>
</figure>
```

- 容器内每张表 MUST 各有一个 `figure.news-table`；有标题时仅第一张表的 figure 生成 `figcaption.news-table__caption`，其余表 MUST NOT 生成 `figcaption`（FR-045）。单表容器即上述示例。
- 每个 `div.news-table__scroll` MUST 有 `tabindex="0"`、`role="region"`、`aria-label="对比表"`；内部 MUST 为恰好一张真实 `<table>`；多表时按源顺序重复整个 figure 结构。
- 表格内容 MUST 可选中、可检索；MUST NOT 转为图片或 canvas。
- CSS MUST 包含 `.news-table__scroll { max-width: 100%; overflow-x: auto; }` 与 `table { width: max-content; min-width: 100%; border-collapse: collapse; }`。
- 空表格块：不生成 `figure.news-table`，输出受控 warning。
- 普通 Markdown 表格（未包 `:::table`）：不生成 `figure.news-table` 与 `.news-table__scroll`。

## RD-04 渐进增强与降级

- 无 JS：`.news-bib__copy` 保持 `hidden`；`.news-bib` 内 `pre` 完整可见、可选；高亮块与表格块为纯 CSS 渲染，完整可用。
- 有 JS：脚本在 DOM 就绪后移除按钮的 `hidden`，绑定一次事件委托；重复执行不重复绑定。
- 剪贴板失败：按钮加 `is-error`，状态区写失败文案；不回退 `document.execCommand`（CHK029）。
- 复制成功/失败后约 2 秒复位；重复点击先清除旧计时器，避免旧定时器提前复位新状态。

## RA-01 键盘与焦点

- 复制按钮：Tab 可聚焦，Enter/Space 触发；`:focus-visible` 显示 2px `--blue` 外框。
- `pre[tabindex="0"]`：Tab 可聚焦，方向键横向滚动；焦点外框可见，不被工具栏遮挡。
- `.news-table__scroll[tabindex="0"]`：Tab 可聚焦，方向键横向滚动；焦点外框可见。
- 高亮块与表格块不设置 `tabindex`；其内部链接按原生 Tab 顺序。
- 图片链接：`<a>` 可键盘聚焦，焦点可见，Enter 在新标签页打开论文页。

## RA-02 复制反馈与播报

- 成功：`button.is-copied` + 成功图标（绿色），`status.textContent = '已复制'`。
- 失败：`button.is-error` + 失败图标（红色），`status.textContent = '复制失败，请手动选择'`。
- 状态区 `aria-live="polite"` 只播报一次；按钮 `aria-label` 固定为“复制引用”，不随状态变化，避免重复播报（FR-020、CHK030）。
- 按钮固定 32×32，图标绝对定位/叠加切换，不改变按钮尺寸；状态区固定 `min-height`，反馈不推动工具栏或正文（FR-013、CHK009）。

## RS-01 视觉不变量

| 元素 | 必须满足 |
|------|----------|
| `.news-highlight` | `border-left: 4px solid var(--blue)`；`border: 1px solid var(--line)`；`background: var(--sky)`；`border-radius: 12px`；`padding: 18px 20px`；`margin-block: 1.25em`；`overflow-wrap: anywhere`；正文对比度 ≥ 4.5:1 |
| `.news-highlight__title` | `font-weight: 600`；`color: var(--ink)`；无标题时不渲染 |
| `.news-bib` | `border-radius: 12px`；`overflow: hidden`；`min-width: 0`；`max-width: 100%` |
| `.news-bib__toolbar` | `display: flex`；`justify-content: flex-end`；`align-items: center`；`gap: 8px` |
| `.news-bib__copy` | `width: 32px`；`height: 32px`；`padding: 0`；图标切换不改变尺寸 |
| `.news-bib__status` | `min-height: 1.5em`；`white-space: nowrap`；`font-size` 小于正文 |
| `.news-table` | `margin-block: 1.25em`；不超过正文内容宽度 |
| `.news-table__caption` | 小字号；`color: var(--ink-soft)`；位于表格上方 |
| `.news-table__scroll` | `max-width: 100%`；`overflow-x: auto`；焦点外框可见 |
| `.news-table table` | `width: max-content`；`min-width: 100%`；`border-collapse: collapse`；表头 `--sky` 背景；单元格 `1px solid var(--line)`；`padding: 8px 12px` |
| 新闻配图 | 最大宽度不超过正文内容宽度；按比例缩放；不放大超过固有尺寸；`loading="lazy"`、`decoding="async"` |

- 所有选择器 MUST 限定在 `.news-body` 范围内，避免影响列表页与其他页面（FR-031/032）。
- 高亮块内的 `code`/`pre`/`blockquote`/`table` 只添加最小可读样式，MUST NOT 重定义全局 `.news-body` 既有元素样式（CHK014）。

## RB-01 边界与失败行为

| 条件 | DOM 结果 |
|------|----------|
| 未闭合 `:::highlight` / `:::table` | 不生成页面（构建失败） |
| 非小写 `bibtex` 标记 | 不生成页面（构建失败） |
| 空高亮块 | 不生成 `aside.news-highlight`；warning |
| 空 `bibtex` 块 | 生成 `pre > code.language-bibtex`，不生成 `.news-bib__toolbar` |
| 空表格块 | 不生成 `figure.news-table`；warning |
| 未知容器 `:::foo` | 不生成控件 DOM，展开为普通内容；warning |
| 同名高亮嵌套 | 生成外层控件并保留正文，可能出现 `:::` 文本；warning |
| 表格后 `:::` 无空行 | 删除被吞入表格末行的 `:::` 后再生成表格块；warning（不失败） |
| 图片缺失 | 构建失败，不生成页面 |
| 无 JS | 复制按钮 `hidden`，正文完整 |
| 剪贴板失败 | `button.is-error` + 失败图标 + 状态区失败文案；文本可选 |

## 验收断言（DOM 级）

| 编号 | 断言 |
|------|------|
| RD-A1 | 带标题高亮块存在 `p.news-highlight__title[role="heading"][aria-level="3"]`；无标题块不存在该节点 |
| RD-A2 | 每个 `.news-bib` 的 `.news-bib__toolbar` 是第一个子元素，`pre` 是第二个 |
| RD-A3 | `.news-bib__copy` 有 `hidden`、`aria-label="复制引用"`，三个图标均有 `aria-hidden="true"` |
| RD-A4 | `.news-bib__status` 有 `aria-live="polite"` 且为空初始值 |
| RD-A5 | `pre` 有 `tabindex="0"`、`role="region"`、可读 `aria-label` |
| RD-A6 | 每个 `table` 对应一个 `figure.news-table`，每个 figure 含 `div.news-table__scroll[tabindex="0"][role="region"]` 与恰好一张真实 `<table>`；多表按源顺序排列 |
| RD-A7 | 无标题表格块不存在 `figcaption.news-table__caption`；多表容器仅第一张表有图注 |
| RD-A8 | 普通 Markdown 表格不存在 `.news-table` 类 |
| RD-A9 | 普通代码块不存在 `.news-bib` 类 |
| RD-A10 | 列表页及其他页面不存在 `.news-highlight`/`.news-bib`/`.news-table` |
