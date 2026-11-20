# Contract: PublicationItem 渲染与槽位

**Feature**: 009-publication-link-ccf | **Date**: 2026-11-19 | **Component**: `src/components/PublicationItem.astro`

本契约约束 Publications 条目在**构建产物 DOM** 中的结构与槽位宽度。验收表面是渲染后的 HTML，而不是源码意图（SC-006）。

## 1. 必需结构

有 CCF 或有链接的条目：

```html
<article class="pub-item" data-date="YYYY-MM-DD | ">
  <div class="pub-main">
    <span class="pub-title">
      <!-- 有 url：<a href="https://...">题名</a>；无 url：纯文本题名 -->
    </span>
    <span class="pub-venue">venue · year</span>
  </div>
  <div class="pub-side">
    <span class="pub-slot pub-slot-ccf">
      <!-- 有 ccf：<CCFBadge rating="A|B|C">；无 ccf：空（无子元素、无文本） -->
    </span>
    <span class="pub-slot pub-slot-link">
      <!-- 有 url：<a class="pub-link" href="https://..." target="_blank" rel="noopener">Link <span aria-hidden="true">↗</span></a> -->
      <!-- 无 url：空（无子元素、无文本） -->
    </span>
  </div>
</article>
```

CCF 与链接都缺失的条目：**不渲染 `.pub-side`**（不保留空槽、不产生空白第三行）。

## 2. DOM 真实性不变量

- **R1**：`ccf` 缺省 ⇒ 条目内不存在 `CCF-A` / `CCF-B` / `CCF-C` 文本、`ccf-badge` 类或任何隐藏等级节点。
- **R2**：`url` 缺省 ⇒ 条目内不存在 `<a>` 链接、不存在裸文本 `Link ↗`、不存在隐藏链接节点。
- **R3**：`url` 存在 ⇒ 恰好 1 个 `.pub-link` 锚点；标题本身也渲染为指向同一 URL 的链接，因此条目内共有 2 个同 URL 锚点（标题锚点 + `.pub-link`）；无 `url` 时按 R2 为 0 个锚点。
- **R4**：`ccf` 存在 ⇒ 恰好 1 个徽标，文本与 `ccf` 值一致。
- **R5**：空槽内不得包含任何文本节点、伪元素生成文本或 `aria-label`；`visibility: hidden` / `display: none` 的假标签方案不再使用。

## 3. 槽位宽度契约

| 槽 | 满槽内容 | 空槽预留方式 | 目标宽度 |
|----|----------|--------------|----------|
| `.pub-slot-ccf` | `CCFBadge`（`min-inline-size: 59.66px`） | 空 span + `min-inline-size` | **59.66px**，满/空宽度差 ≤1px |
| `.pub-slot-link` | `Link ↗`（`1rem`） | 空 span + `min-inline-size` | **45px**（T020 实测自然宽度 44.52px，向上取整；44.52px 略低于预期区间 45–47px，属本机字体渲染差异，预期区间仅作异常检测、不作硬性门槛），满/空宽度差 ≤1px |

要求：

- 两个槽在 `.pub-side` 内始终按 `CCF 左、LINK 右` 顺序排列，`column-gap: 10px` 不变。
- `.pub-slot-link` 使用 `justify-content: flex-end`，保证槽宽略大于文本宽度时链接右缘仍与列线对齐；45–47px 仅用于异常检测，不作为验收硬门槛。
- 空槽高度不影响行高：若基线验收出现偏移，只允许为两个槽设置相同的 `min-block-size`（实测满槽高度），仍不得引入任何文本或假标签。
- `CCFBadge.astro` 的 `min-inline-size: 59.66px` 与配色、字号保持现状（006 成果）。

## 4. 响应式契约（沿用 006，零改动）

| 视口 | 行为 |
|------|------|
| ≥768px | 单行两栏：文本区可换行，标签簇固定右侧，标签与首行文字基线偏差 ≤1px |
| 576–<768px | 标题独占首行；期刊名（左）+ 标签簇（右）第二行 |
| <576px | 三行：标题 / 期刊名 / 右对齐标签簇；无标签条目不产生第三行 |

本次不允许新增断点、改变列宽、改变标签顺序或字号。

## 5. 可访问性

- 空槽无内容，天然不进入无障碍树，无需 `aria-hidden`。
- 链接锚点保留 `target="_blank"` 与 `rel="noopener"`；箭头 `↗` 继续 `aria-hidden="true"`。
- 徽标 `title` 文案保持 `China Computer Federation (CCF) Rank {X}`。

## 6. 验收断言

构建后对 `dist/publications/index.html`（剔除 `<style>`）：

```text
articles = 135
CCF 徽标 = 117（A=66, B=48, C=3）
每个条目徽标数 ≤1
锚点（.pub-link）= 有 url 的条目数
有 url 条目的锚点总数 = 2，且两个 href 均等于该条目 url
裸文本 "Link ↗"（不在锚点内）= 0
无 url 条目中的 <a> = 0
无 ccf 条目中的 ccf-badge = 0
```

任一断言失败即视为本契约未满足（SC-006）。
