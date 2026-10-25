/**
 * 新闻详情页重点控件：Markdown 构建期插件
 *
 * 控件语法（编辑侧契约见 specs/008-news-detail-widgets/contracts/markdown-authoring.md）：
 * - `:::highlight[可选标题] … :::` → `<aside class="news-highlight" role="note">`
 * - `:::table[可选标题] … :::`     → `<figure class="news-table">`（每张表独立 figure）
 * - ` ```bibtex ` 围栏块             → `<div class="news-bib">` + 工具栏 + `pre`
 *
 * 诊断约定：硬错误 `throw`（构建失败），受控 warning 走 `console.warn`，
 * 两者都带 `[news-widgets] <file>:<line>` 前缀。
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const PREFIX = '[news-widgets]';
const fileSourceCache = new Map();

const CONTAINER_WIDGET = /(?:^|\n) {0,3}:::(?:highlight|table)\b/;
const BIBTEX_FENCE = /(?:^|\n) {0,3}(?:`{3,}|~{3,})[ \t]*bibtex\b/;

/**
 * 文本（如新闻摘要）是否包含控件语法。
 * 与 satteri 实际接受的语法保持一致：容器指令允许行首 0–3 个空格，
 * BibTeX 围栏同时支持 ``` 与 ~~~（同样允许 0–3 个前导空格与行尾空白）。
 */
export function containsWidgetSyntax(text) {
  if (typeof text !== 'string' || text === '') return false;
  return CONTAINER_WIDGET.test(text) || BIBTEX_FENCE.test(text);
}

/** 详情页是否需要控件 CSS 与复制脚本（判定口径与 containsWidgetSyntax 相同）。 */
export function hasNewsWidgets(body) {
  return containsWidgetSyntax(body);
}

/** 文档路径：优先 fileURLToPath，测试等无 fileURL 时给出占位。 */
function fileLabel(ctx) {
  if (!ctx.fileURL) return '<unknown>';
  try {
    return fileURLToPath(ctx.fileURL);
  } catch {
    return decodeURIComponent(ctx.fileURL.pathname || '<unknown>');
  }
}

/**
 * Astro 传给 Markdown 处理器的是去掉 frontmatter 后的正文，
 * 指令节点行号因此与源文件差一段。用正文在源文件中的位置反推偏移。
 */
function frontmatterLineOffset(ctx) {
  const file = fileLabel(ctx);
  if (file === '<unknown>') return 0;

  let raw = fileSourceCache.get(file);
  if (raw === undefined) {
    try {
      raw = readFileSync(file, 'utf8');
    } catch {
      raw = null;
    }
    fileSourceCache.set(file, raw);
  }
  if (!raw) return 0;

  const index = raw.indexOf(ctx.source);
  return index > 0 ? (raw.slice(0, index).match(/\n/g) ?? []).length : 0;
}

/** `<file>:<line>`；没有 position 时退化为文件名。 */
function location(ctx, node) {
  const line = node?.position?.start?.line;
  const file = fileLabel(ctx);
  if (!line) return file;
  return `${file}:${line + frontmatterLineOffset(ctx)}`;
}

/** 硬错误：中断构建，信息含文件与行号。 */
function fail(ctx, node, message) {
  throw new Error(`${PREFIX} ${location(ctx, node)} ${message}`);
}

/** 受控 warning：构建继续，信息含文件与行号。 */
function warn(ctx, node, message) {
  console.warn(`${PREFIX} ${location(ctx, node)} ${message}`);
}

/** 源码行数组（兼容 CRLF）。 */
function sourceLines(ctx) {
  return ctx.source.split(/\r?\n/);
}

/**
 * 容器闭合判定：指令节点结束行必须只有 `:::`。
 * 未闭合的容器会被解析器吞到文末，结束行通常是最后一行业务内容。
 */
function isClosedContainer(ctx, node) {
  const endLine = node.position?.end?.line;
  if (!endLine) return true;
  const lines = sourceLines(ctx);
  const last = lines[endLine - 1];
  return typeof last === 'string' && last.trim() === ':::';
}

/** 可选标题：带 data.directiveLabel 的段落子节点。 */
function labelOf(node) {
  return node.children.find(
    (child) => child.type === 'paragraph' && child.data?.directiveLabel === true,
  );
}

/** 是否包含图片节点（含引用式图片）；图片可见性与 alt 是否为空无关。 */
function containsImage(node) {
  if (!node || typeof node !== 'object') return false;
  if (node.type === 'image' || node.type === 'imageReference') return true;
  return Array.isArray(node.children) && node.children.some(containsImage);
}

/** 去掉标题后是否还有可见内容（thematicBreak/图片视为可见，围栏代码块按 value 计）。 */
function hasVisibleBody(ctx, node, label) {
  return node.children.some((child) => {
    if (child === label) return false;
    if (child.type === 'thematicBreak' || containsImage(child)) return true;
    if (child.type === 'code') return typeof child.value === 'string' && child.value.trim() !== '';
    return ctx.textContent(child, { includeImageAlt: true }).trim() !== '';
  });
}

/**
 * 表格结尾未留空行时，闭合 `:::` 会被解析为表格末行：删除该行并提示。
 * 只处理可确认属于容器闭合 fence 的行：该行起始行必须就是容器结束行，
 * 以免删除多表容器中其他表格的合法 `:::` 单元格。返回是否删除。
 */
function stripTrailingFenceRow(ctx, node, table) {
  const rows = table.children;
  const lastRow = rows[rows.length - 1];
  if (
    !lastRow ||
    lastRow.type !== 'tableRow' ||
    lastRow.children.length !== 1 ||
    lastRow.position?.start?.line !== node.position?.end?.line ||
    ctx.textContent(lastRow).trim() !== ':::'
  ) {
    return false;
  }
  ctx.removeChildAt(table, rows.length - 1);
  warn(ctx, node, '表格结尾的 `:::` 被解析进表格末行，已删除；建议在结尾 `:::` 前留一个空行。');
  return true;
}

/** 同名容器嵌套：沿父链找同 name 的容器指令。 */
function hasSameNameAncestor(ctx, node) {
  let parent = ctx.parent(node);
  while (parent) {
    if (parent.type === 'containerDirective' && parent.name === node.name) return true;
    parent = ctx.parent(parent);
  }
  return false;
}

/** 指令节点在源码中的原始文本，用于把误识别的指令还原为正文。 */
function rawSourceOf(ctx, node) {
  const start = node.position?.start?.offset;
  const end = node.position?.end?.offset;
  if (typeof start === 'number' && typeof end === 'number') {
    return ctx.source.slice(start, end);
  }
  return `:${node.name ?? ''}`;
}

/* ------------------------------------------------------------------ *
 * mdast：高亮块 + 控件语法诊断
 * ------------------------------------------------------------------ */

export const newsHighlightPlugin = {
  name: 'news-highlight',
  options: { position: true },
  /**
   * BibTeX 语言标记必须在 mdast 阶段校验：Shiki 会把 `BibTeX`/`bib` 等
   * 未知语言重写为 plaintext，hast 阶段已看不到原始标记。
   */
  code(node, ctx) {
    const lang = typeof node.lang === 'string' ? node.lang : '';
    if (!lang) return;
    const normalized = lang.trim().toLowerCase();
    if (normalized === 'bibtex' && lang === 'bibtex') return;
    if (normalized === 'bibtex' || normalized === 'bib') {
      fail(
        ctx,
        node,
        `代码块语言标记 "${lang}" 无效：BibTeX 引用块必须使用小写 \`bibtex\`（如 \`\`\`bibtex）。`,
      );
    }
  },
  containerDirective(node, ctx) {
    if (node.name === 'table') return;
    if (node.name !== 'highlight') {
      warn(ctx, node, `未知容器指令 :::${node.name} 已展开为普通内容。`);
      ctx.replaceNode(node, node.children);
      return;
    }

    if (hasSameNameAncestor(ctx, node)) {
      warn(ctx, node, '不支持嵌套同名 highlight 容器，内层已降级为普通内容。');
      ctx.replaceNode(node, node.children);
      return;
    }

    if (!isClosedContainer(ctx, node)) {
      fail(ctx, node, 'highlight 容器未闭合：缺少结尾 `:::`。');
    }

    const lastChild = node.children[node.children.length - 1];
    if (lastChild?.type === 'table') stripTrailingFenceRow(ctx, node, lastChild);

    const label = labelOf(node);
    if (!hasVisibleBody(ctx, node, label)) {
      warn(ctx, node, '高亮块内容为空，已整块移除。');
      ctx.removeNode(node);
      return;
    }

    if (label) {
      const titleText = ctx.textContent(label).trim();
      if (titleText) {
        ctx.setProperty(label, 'data', {
          hProperties: {
            className: ['news-highlight__title'],
            role: 'heading',
            'aria-level': '3',
          },
        });
      } else {
        ctx.removeNode(label);
      }
    }

    ctx.setProperty(node, 'data', {
      hName: 'aside',
      hProperties: { className: ['news-highlight'], role: 'note' },
    });
  },
  /** `1:2`、`:abc[标签]` 等被误识别为指令时，按源码还原为文本，避免吞正文。 */
  textDirective(node, ctx) {
    ctx.replaceNode(node, { type: 'text', value: rawSourceOf(ctx, node) });
  },
  leafDirective(node, ctx) {
    ctx.replaceNode(node, { type: 'text', value: rawSourceOf(ctx, node) });
  },
};

/* ------------------------------------------------------------------ *
 * mdast：表格块
 * ------------------------------------------------------------------ */

export const newsTablePlugin = {
  name: 'news-table',
  options: { position: true },
  containerDirective(node, ctx) {
    if (node.name !== 'table') return;

    if (!isClosedContainer(ctx, node)) {
      fail(ctx, node, 'table 容器未闭合：缺少结尾 `:::`。');
    }

    const label = labelOf(node);
    const tables = node.children.filter((child) => child.type === 'table');

    if (tables.length > 0) {
      const others = node.children.filter(
        (child) => child !== label && child.type !== 'table',
      );
      if (others.length > 0) {
        warn(
          ctx,
          node,
          '表格块内除直接子表格外还有非表格内容：仅直接子表格会生成表格块，其余内容按普通 Markdown 保留。',
        );
      }
    }

    if (tables.length === 0) {
      warn(ctx, node, '表格块内没有 Markdown 表格，已移除容器并保留正文。');
      ctx.replaceNode(node, node.children.filter((child) => child !== labelOf(node)));
      return;
    }

    const caption = label ? ctx.textContent(label).trim() : '';

    let tableIndex = 0;
    const output = [];
    for (const child of node.children) {
      if (child === label) continue;
      if (child.type !== 'table') {
        // 非表格内容不静默丢弃：连同位置一起保留，并已在上面给出 warning。
        output.push(child);
        continue;
      }

      // 表格结尾未留空行时，`:::` 会被解析为表格最后一行：删除并提示。
      stripTrailingFenceRow(ctx, node, child);

      const scroll = {
        type: 'div',
        data: {
          hName: 'div',
          hProperties: {
            className: ['news-table__scroll'],
            tabindex: '0',
            role: 'region',
            'aria-label': '对比表',
          },
        },
        children: [child],
      };

      const figureChildren = [];
      if (tableIndex === 0 && caption) {
        figureChildren.push({
          type: 'paragraph',
          data: {
            hName: 'figcaption',
            hProperties: { className: ['news-table__caption'] },
          },
          children: [{ type: 'text', value: caption }],
        });
      }
      figureChildren.push(scroll);

      output.push({
        type: 'figure',
        data: { hName: 'figure', hProperties: { className: ['news-table'] } },
        children: figureChildren,
      });
      tableIndex += 1;
    }

    ctx.replaceNode(node, output);
  },
};

/* ------------------------------------------------------------------ *
 * hast：BibTeX 引用块
 * ------------------------------------------------------------------ */

function svgIcon(className, pathData) {
  return {
    type: 'element',
    tagName: 'svg',
    properties: {
      className: ['news-bib__icon', className],
      'aria-hidden': 'true',
      viewBox: '0 0 24 24',
      width: '16',
      height: '16',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    },
    children: [{ type: 'element', tagName: 'path', properties: { d: pathData }, children: [] }],
  };
}

export const newsBibtexPlugin = {
  name: 'news-bibtex',
  options: { position: true },
  element: {
    filter: ['pre'],
    visit(node, ctx) {
      const code = node.children?.find(
        (child) => child.type === 'element' && child.tagName === 'code',
      );
      if (!code) return;

      const classNames = Array.isArray(code.properties?.className)
        ? code.properties.className.filter((name) => typeof name === 'string')
        : [];
      const languageClass = classNames.find((name) => name.startsWith('language-'));
      if (!languageClass) return;

      if (languageClass !== 'language-bibtex') {
        if (languageClass.toLowerCase().startsWith('language-bib')) {
          fail(
            ctx,
            node,
            `代码块语言标记 "${languageClass.slice('language-'.length)}" 无效：BibTeX 引用块必须使用小写 \`bibtex\`。`,
          );
        }
        return;
      }

      if (ctx.textContent(code).trim() === '') {
        warn(ctx, node, 'BibTeX 引用块内容为空，已保留空代码块且不生成复制按钮。');
        return;
      }

      ctx.setProperty(node, 'tabindex', '0');
      ctx.setProperty(node, 'role', 'region');
      ctx.setProperty(node, 'aria-label', 'BibTeX 引用');

      const toolbar = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['news-bib__toolbar'] },
        children: [
          {
            type: 'element',
            tagName: 'span',
            properties: { className: ['news-bib__label'] },
            children: [{ type: 'text', value: 'BibTeX' }],
          },
          {
            type: 'element',
            tagName: 'button',
            properties: {
              type: 'button',
              className: ['news-bib__copy'],
              'aria-label': '复制引用',
              hidden: true,
            },
            children: [
              svgIcon('news-bib__icon--copy', 'M8 8h8v8H8zM6 16V6h10'),
              svgIcon('news-bib__icon--success', 'M20 6L9 17l-5-5'),
              svgIcon('news-bib__icon--error', 'M18 6L6 18M6 6l12 12'),
            ],
          },
          {
            type: 'element',
            tagName: 'span',
            properties: { className: ['news-bib__status'], 'aria-live': 'polite' },
            children: [],
          },
        ],
      };

      ctx.replaceNode(node, {
        type: 'element',
        tagName: 'div',
        properties: { className: ['news-bib'] },
        children: [toolbar, node],
      });
    },
  },
};

/* ------------------------------------------------------------------ *
 * hast：新闻配图与 arXiv 论文链接补 target
 * ------------------------------------------------------------------ */

function isArxivHost(href) {
  try {
    const url = new URL(href);
    return url.hostname === 'arxiv.org' || url.hostname.endsWith('.arxiv.org');
  } catch {
    return false;
  }
}

export const newsExternalLinksPlugin = {
  name: 'news-external-links',
  options: { position: true },
  element: {
    filter: ['a'],
    visit(node, ctx) {
      const href = node.properties?.href;
      if (typeof href !== 'string' || !href.startsWith('http')) return;

      const onlyImage =
        node.children?.length === 1 &&
        node.children[0].type === 'element' &&
        node.children[0].tagName === 'img';

      if (!onlyImage && !isArxivHost(href)) return;

      ctx.setProperty(node, 'target', '_blank');
      ctx.setProperty(node, 'rel', 'noopener noreferrer');
    },
  },
};
