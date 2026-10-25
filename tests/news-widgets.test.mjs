import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import vm from 'node:vm';
import { createSatteriMarkdownProcessor } from '@astrojs/markdown-satteri';
import {
  newsHighlightPlugin,
  newsTablePlugin,
  newsBibtexPlugin,
  newsExternalLinksPlugin,
  hasNewsWidgets,
  containsWidgetSyntax,
} from '../src/markdown/news-widgets.mjs';

const FIXTURE_DIR = new URL('../specs/008-news-detail-widgets/fixtures/', import.meta.url);
const CSS_PATH = fileURLToPath(new URL('../src/styles/news-widgets.css', import.meta.url));

const renderer = await createSatteriMarkdownProcessor({
  features: { directive: true },
  mdastPlugins: [newsHighlightPlugin, newsTablePlugin],
  hastPlugins: [newsBibtexPlugin, newsExternalLinksPlugin],
  syntaxHighlight: { type: 'shiki', excludeLangs: ['bibtex'] },
});

function fixtureUrl(name) {
  return new URL(name, FIXTURE_DIR);
}

async function renderFixture(name) {
  const fileURL = pathToFileURL(fileURLToPath(fixtureUrl(name)));
  const source = readFileSync(fileURL, 'utf8');
  const warnings = [];
  const originalWarn = console.warn;
  console.warn = (...args) => warnings.push(args.map(String).join(' '));
  try {
    const result = await renderer.render(source, { fileURL });
    return { html: result.code, warnings };
  } finally {
    console.warn = originalWarn;
  }
}

async function renderExpectingError(name) {
  const fileURL = pathToFileURL(fileURLToPath(fixtureUrl(name)));
  const source = readFileSync(fileURL, 'utf8');
  const originalWarn = console.warn;
  console.warn = () => {};
  try {
    await assert.rejects(
      () => renderer.render(source, { fileURL }),
      (error) => {
        assert.match(error.message, /\[news-widgets\]/);
        assert.ok(
          error.message.includes(fileURLToPath(fileURL)),
          `错误信息应包含文件路径，实际为：${error.message}`,
        );
        assert.match(error.message, /:\d+ /, '错误信息应包含行号');
        return true;
      },
    );
  } finally {
    console.warn = originalWarn;
  }
}

function blocks(html, openingTag) {
  const parts = html.split(openingTag);
  parts.shift();
  return parts;
}

function readCss() {
  return readFileSync(CSS_PATH, 'utf8');
}

/* ------------------------------------------------------------------ *
 * T006：普通 Markdown 不受影响 + 外链补 target
 * ------------------------------------------------------------------ */

test('普通 Markdown 表格与代码块不升级为控件', async () => {
  const { html, warnings } = await renderFixture('plain.md');
  assert.equal(warnings.length, 0, `不应产生 warning：${warnings.join(' | ')}`);
  assert.match(html, /<table>/);
  assert.doesNotMatch(html, /news-table/);
  assert.match(html, /<pre/);
  assert.doesNotMatch(html, /news-bib/);
});

test('被链接包裹的图片与 arXiv 论文链接补 target=_blank，其他外链不改写', async () => {
  const { html } = await renderFixture('plain.md');
  assert.match(
    html,
    /<a href="https:\/\/arxiv\.org\/abs\/2604\.03128" target="_blank" rel="noopener noreferrer"><img/,
  );
  assert.match(
    html,
    /<a href="https:\/\/arxiv\.org\/abs\/2604\.03128" target="_blank" rel="noopener noreferrer">arXiv 论文<\/a>/,
  );
  assert.match(html, /<a href="https:\/\/example\.com">Example<\/a>/);
  assert.doesNotMatch(html, /example\.com" target=/);
});

test('摘要控件语法判定覆盖围栏/波浪线、0–3 空格与尾随空白', () => {
  const rejected = [
    ':::highlight\n正文',
    '   :::table[标题]\n正文',
    '\n:::highlight',
    '```bibtex\n@misc{a}',
    '   ```bibtex',
    '\n~~~bibtex\n@misc{a}',
    '  ~~~ bibtex',
    '``` bibtex   ',
    '~~~~bibtex\t',
  ];
  for (const text of rejected) {
    assert.equal(containsWidgetSyntax(text), true, `应判定为控件语法：${JSON.stringify(text)}`);
  }
  const allowed = [
    '',
    '这是一段普通摘要，不含控件语法。',
    ':::foo\n正文',
    '    :::highlight\n正文',
    '```js\nconst a = 1;',
    '文字中的 :::highlight 不是行首指令',
  ];
  for (const text of allowed) {
    assert.equal(containsWidgetSyntax(text), false, `不应判定为控件语法：${JSON.stringify(text)}`);
  }
});

test('详情页控件检测与 satteri 接受的语法一致', () => {
  assert.equal(hasNewsWidgets(':::highlight\n正文\n:::'), true);
  assert.equal(hasNewsWidgets('正文\n   :::highlight[标题]\n正文\n:::'), true);
  assert.equal(hasNewsWidgets('正文\n\t:::table[标题]'), false);
  assert.equal(hasNewsWidgets('正文\n```bibtex\n@misc{a}'), true);
  assert.equal(hasNewsWidgets('正文\n  ```bibtex\n@misc{a}'), true);
  assert.equal(hasNewsWidgets('正文\n~~~bibtex\n@misc{a}'), true);
  assert.equal(hasNewsWidgets('正文\n ~~~ bibtex\n@misc{a}'), true);
  // 不是控件：普通指令名、普通代码块、4 空格缩进（缩进代码块）、空正文。
  assert.equal(hasNewsWidgets(':::foo\n正文\n:::'), false);
  assert.equal(hasNewsWidgets('```js\nconst a = 1;\n```'), false);
  assert.equal(hasNewsWidgets('正文\n    :::highlight\n正文\n:::'), false);
  assert.equal(hasNewsWidgets(''), false);
});

/* ------------------------------------------------------------------ *
 * T009：高亮块
 * ------------------------------------------------------------------ */

test('高亮块：带标题、无标题、多块独立与长 URL 完整', async () => {
  const { html, warnings } = await renderFixture('highlight.md');
  assert.equal(warnings.length, 0, `不应产生 warning：${warnings.join(' | ')}`);
  assert.equal(blocks(html, '<aside class="news-highlight" role="note">').length, 4);
  assert.match(
    html,
    /<p class="news-highlight__title" role="heading" aria-level="3">要点标题<\/p>/,
  );
  assert.match(html, /第二块无标题正文。/);
  assert.match(html, /第三块空标题正文。/);
  assert.equal((html.match(/news-highlight__title/g) ?? []).length, 2);
  assert.ok(html.includes('https://example.com/a/very/long/path/that/should/not/be/truncated'));
  assert.match(html, /<ul>/);
  assert.match(html, /<blockquote>/);
  assert.match(html, /<aside class="news-highlight" role="note"><p class="news-highlight__title"[^>]*>分隔线也算内容<\/p>\s*<hr>/);
});

test('空高亮块：warning 且整块移除', async () => {
  const { html, warnings } = await renderFixture('highlight-empty.md');
  assert.equal(warnings.length, 3);
  assert.ok(warnings.every((line) => line.includes('highlight-empty.md')));
  assert.ok(warnings.every((line) => line.includes('高亮块内容为空')));
  assert.doesNotMatch(html, /news-highlight/);
});

test('未闭合高亮块：硬错误含文件与行号', async () => {
  await renderExpectingError('highlight-unclosed.md');
});

test('同名嵌套：warning 并只保留外层控件', async () => {
  const { html, warnings } = await renderFixture('highlight-nested.md');
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /highlight-nested\.md:\d+/);
  assert.match(warnings[0], /嵌套/);
  assert.equal(blocks(html, '<aside class="news-highlight" role="note">').length, 1);
  assert.match(html, /外层正文/);
  assert.match(html, /内层正文/);
  assert.equal((html.match(/news-highlight__title/g) ?? []).length, 1);
});

test('未知容器展开、冒号文本不被当作指令', async () => {
  const { html, warnings } = await renderFixture('unknown-container.md');
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /unknown-container\.md:\d+/);
  assert.match(warnings[0], /未知容器指令/);
  assert.doesNotMatch(html, /:::foo/);
  assert.match(html, /未知容器的正文/);
  assert.match(html, /1:2/);
  assert.match(html, /3:45/);
});

test('高亮块仅含围栏代码块：不算空块，保留 pre', async () => {
  const { html, warnings } = await renderFixture('highlight-code.md');
  assert.equal(warnings.length, 0, `不应产生 warning：${warnings.join(' | ')}`);
  const blocksHtml = blocks(html, '<aside class="news-highlight" role="note">');
  assert.equal(blocksHtml.length, 1);
  assert.match(blocksHtml[0], /<pre[^>]*data-language="js"/);
});

test('高亮块仅含空 alt 图片：不算空块，图片保留且无 warning', async () => {
  const { html, warnings } = await renderFixture('highlight-image-empty-alt.md');
  assert.equal(warnings.length, 0, `不应产生 warning：${warnings.join(' | ')}`);
  const blocksHtml = blocks(html, '<aside class="news-highlight" role="note">');
  assert.equal(blocksHtml.length, 1);
  assert.match(blocksHtml[0], /<img[^>]*__ASTRO_IMAGE_="[^"]*&quot;alt&quot;:&quot;&quot;/);
  assert.match(blocksHtml[0], /&quot;src&quot;:&quot;rlsd-method\.png&quot;/);
});

test('高亮块内表格尾行吞入 :::：删除该行并 warning', async () => {
  const { html, warnings } = await renderFixture('highlight-trailing-fence.md');
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /highlight-trailing-fence\.md:\d+/);
  assert.match(warnings[0], /:::/);
  assert.doesNotMatch(html, /:::/);
  assert.match(html, /<td>1<\/td>\s*<td>2<\/td>/);
});

/* ------------------------------------------------------------------ *
 * T013：BibTeX 块
 * ------------------------------------------------------------------ */

test('BibTeX 块：结构、顺序、无 JS 默认隐藏与转义', async () => {
  const { html, warnings } = await renderFixture('bibtex.md');
  assert.equal(warnings.length, 0, `不应产生 warning：${warnings.join(' | ')}`);

  const bibBlocks = blocks(html, '<div class="news-bib">');
  assert.equal(bibBlocks.length, 3);

  for (const chunk of bibBlocks) {
    const toolbarAt = chunk.indexOf('<div class="news-bib__toolbar">');
    const preAt = chunk.indexOf('<pre');
    assert.ok(toolbarAt >= 0 && preAt > toolbarAt, '工具栏必须是第一个子节点，pre 在其后');

    assert.match(chunk, /<button type="button" class="news-bib__copy" aria-label="复制引用" hidden>/);
    assert.equal((chunk.match(/class="news-bib__icon news-bib__icon--copy"/g) ?? []).length, 1);
    assert.equal((chunk.match(/class="news-bib__icon news-bib__icon--success"/g) ?? []).length, 1);
    assert.equal((chunk.match(/class="news-bib__icon news-bib__icon--error"/g) ?? []).length, 1);
    assert.equal((chunk.match(/<svg[^>]*aria-hidden="true"/g) ?? []).length, 3);
    assert.match(chunk, /<span class="news-bib__status" aria-live="polite"><\/span>/);
    assert.match(
      chunk,
      /<pre tabindex="0" role="region" aria-label="BibTeX 引用"><code class="language-bibtex">/,
    );
  }

  assert.match(html, /@misc\{yang2026rlsd,/);
  assert.match(html, /@misc\{qin2026npo,/);
  assert.match(html, /@misc\{gu2026copd,/);
  assert.match(html, /A &amp; B &lt;C&gt; D/);
  assert.match(html, /eprint\s+= \{2604\.03128\}/);
});

test('空 BibTeX 块：warning、保留空代码块、无工具栏', async () => {
  const { html, warnings } = await renderFixture('bibtex-empty.md');
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /bibtex-empty\.md:\d+/);
  assert.match(warnings[0], /BibTeX 引用块内容为空/);
  assert.match(html, /<code class="language-bibtex"><\/code>/);
  assert.doesNotMatch(html, /news-bib__toolbar/);
  assert.doesNotMatch(html, /news-bib__copy/);
});

test('非小写 bibtex 标记：硬错误含文件与行号', async () => {
  await renderExpectingError('bibtex-uppercase.md');
});

test('控件 CSS 含复制按钮三态与 hidden 强制规则', () => {
  const css = readCss();
  assert.match(css, /\.news-bib__copy\[hidden\]\s*\{\s*display:\s*none !important;/);
  assert.match(css, /\.news-bib__icon\s*\{[^}]*display:\s*none;/);
  assert.match(css, /\.news-bib__icon--copy\s*\{\s*display:\s*block;/);
  assert.match(css, /\.news-bib__copy\.is-copied \.news-bib__icon--success\s*\{\s*display:\s*block;/);
  assert.match(css, /\.news-bib__copy\.is-error \.news-bib__icon--error\s*\{\s*display:\s*block;/);
  assert.match(css, /\.news-bib__copy\.is-copied \.news-bib__icon--copy/);
  assert.match(css, /\.news-bib__copy\.is-error \.news-bib__icon--copy/);
});

/* ------------------------------------------------------------------ *
 * T016：表格块
 * ------------------------------------------------------------------ */

test('表格块：带标题与无标题', async () => {
  const { html, warnings } = await renderFixture('table.md');
  assert.equal(warnings.length, 0, `不应产生 warning：${warnings.join(' | ')}`);

  const figures = blocks(html, '<figure class="news-table">');
  assert.equal(figures.length, 2);
  assert.match(
    figures[0],
    /<figcaption class="news-table__caption">表 1：三篇论文的定位对比<\/figcaption>/,
  );
  assert.doesNotMatch(figures[1], /figcaption/);
  for (const chunk of figures) {
    assert.match(
      chunk,
      /<div class="news-table__scroll" tabindex="0" role="region" aria-label="对比表">/,
    );
    assert.equal((chunk.match(/<table>/g) ?? []).length, 1);
  }
  assert.match(figures[0], /教师信号来源/);
});

test('多表容器：按源顺序各自生成独立 figure，仅第一张有图注', async () => {
  const { html } = await renderFixture('table-multiple.md');
  const figures = blocks(html, '<figure class="news-table">');
  assert.equal(figures.length, 2);
  assert.equal((html.match(/news-table__caption/g) ?? []).length, 1);
  assert.ok(figures[0].indexOf('<td>1</td>') >= 0);
  assert.ok(figures[1].indexOf('<td>3</td>') >= 0);
  assert.doesNotMatch(figures[1], /figcaption/);
});

test('表格块内混入非表格内容：warning 且正文不被吞掉', async () => {
  const { html, warnings } = await renderFixture('table-mixed.md');
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /table-mixed\.md:\d+/);
  assert.match(warnings[0], /非表格内容/);
  assert.equal(blocks(html, '<figure class="news-table">').length, 1);
  assert.match(html, /news-table__caption[^>]*>混入非表格内容/);
  assert.match(html, /这里有一段说明文字，应该保留在页面上。/);
  assert.match(html, /<li>列表项也应保留<\/li>/);
});

test('空表格块：warning 且不生成 figure', async () => {
  const { html, warnings } = await renderFixture('table-empty.md');
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /table-empty\.md:\d+/);
  assert.match(warnings[0], /表格块内没有 Markdown 表格/);
  assert.doesNotMatch(html, /news-table/);
  assert.match(html, /这里只有普通段落/);
});

test('未闭合表格块：硬错误含文件与行号', async () => {
  await renderExpectingError('table-unclosed.md');
});

test('多表容器：只删除容器末尾表格的闭合 fence 行，保留其他表格的合法 ::: 单元格', async () => {
  const { html, warnings } = await renderFixture('table-multi-fence.md');
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /table-multi-fence\.md:\d+/);
  assert.match(warnings[0], /:::/);
  const figures = blocks(html, '<figure class="news-table">');
  assert.equal(figures.length, 2);
  assert.match(figures[0], /<td>:::<\/td>/);
  assert.doesNotMatch(figures[1], /<td>:::<\/td>/);
  assert.match(figures[0], /<td>一<\/td>/);
  assert.match(figures[1], /<td>二<\/td>/);
});

test('表格尾行吞入 :::：删除该行并 warning', async () => {
  const { html, warnings } = await renderFixture('table-trailing-fence.md');
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /table-trailing-fence\.md:\d+/);
  assert.match(warnings[0], /:::/);
  assert.doesNotMatch(html, /<td>:::<\/td>/);
  assert.doesNotMatch(html, /:::/);
  assert.match(html, /<td>1<\/td>\s*<td>2<\/td>/);
});

/* ------------------------------------------------------------------ *
 * T051：复制状态竞态（旧 timer 清理 + 单调递增操作 token）
 * ------------------------------------------------------------------ */

const NEWS_ROUTE_PATH = fileURLToPath(
  new URL('../src/pages/news/[...id].astro', import.meta.url),
);
const COPY_SCRIPT = /<script is:inline>([\s\S]*?)<\/script>/.exec(
  readFileSync(NEWS_ROUTE_PATH, 'utf8'),
)?.[1];

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function createCopyHarness(buttonCount) {
  assert.ok(COPY_SCRIPT, '详情页应包含 <script is:inline> 复制脚本');

  let now = 0;
  let nextTimerId = 1;
  const scheduled = new Map();
  const clipboard = [];
  const buttons = [];
  const statuses = [];

  const body = {
    listener: null,
    contains: () => true,
    querySelectorAll: () => buttons,
    addEventListener(type, listener) {
      if (type === 'click') this.listener = listener;
    },
  };

  for (let i = 0; i < buttonCount; i += 1) {
    const status = { textContent: '' };
    const block = {
      querySelector(selector) {
        if (selector === 'pre code') return { textContent: `@misc{key${i}}\n` };
        if (selector === '.news-bib__status') return status;
        return null;
      },
    };
    const classes = new Set();
    const button = {
      hidden: true,
      classes,
      classList: {
        add: (...names) => names.forEach((name) => classes.add(name)),
        remove: (...names) => names.forEach((name) => classes.delete(name)),
      },
      closest(selector) {
        if (selector === '.news-bib') return block;
        if (selector === 'button.news-bib__copy') return button;
        return null;
      },
    };
    buttons.push(button);
    statuses.push(status);
  }

  const context = vm.createContext({
    document: {
      querySelector: (selector) => (selector === '.news-body' ? body : null),
    },
    navigator: {
      clipboard: {
        writeText(text) {
          const operation = deferred();
          clipboard.push({ text, ...operation });
          return operation.promise;
        },
      },
    },
    setTimeout(callback, delay) {
      const id = nextTimerId;
      nextTimerId += 1;
      scheduled.set(id, { callback, at: now + delay });
      return id;
    },
    clearTimeout(id) {
      scheduled.delete(id);
    },
  });

  vm.runInContext(COPY_SCRIPT, context, { filename: 'news-detail-copy-script.js' });

  return {
    button: (index) => buttons[index],
    status: (index) => statuses[index].textContent,
    click(index) {
      body.listener({ target: buttons[index] });
    },
    resolve(index) {
      clipboard[index].resolve();
    },
    reject(index) {
      clipboard[index].reject(new Error('clipboard denied'));
    },
    async flush() {
      await new Promise((resolve) => setImmediate(resolve));
      await new Promise((resolve) => setImmediate(resolve));
    },
    advance(ms) {
      now += ms;
      for (const [id, timer] of [...scheduled]) {
        if (timer.at <= now) {
          scheduled.delete(id);
          timer.callback();
        }
      }
    },
  };
}

test('复制竞态：第二次先成功、第一次后失败，旧操作不覆盖新状态', async () => {
  const harness = createCopyHarness(1);
  harness.click(0);
  harness.click(0);
  harness.resolve(1);
  await harness.flush();
  assert.equal(harness.status(0), '已复制');
  assert.deepEqual([...harness.button(0).classes], ['is-copied']);

  harness.reject(0);
  await harness.flush();
  assert.equal(harness.status(0), '已复制');
  assert.deepEqual([...harness.button(0).classes], ['is-copied']);
});

test('复制竞态：失败先返回、成功后返回，最终状态为成功', async () => {
  const harness = createCopyHarness(1);
  harness.click(0);
  harness.click(0);
  harness.reject(0);
  await harness.flush();
  assert.equal(harness.status(0), '');
  assert.deepEqual([...harness.button(0).classes], []);

  harness.resolve(1);
  await harness.flush();
  assert.equal(harness.status(0), '已复制');
  assert.deepEqual([...harness.button(0).classes], ['is-copied']);
});

test('复制竞态：第二次 pending 时旧 2 秒 timer 到期不得提前复位', async () => {
  const harness = createCopyHarness(1);
  harness.click(0);
  harness.resolve(0);
  await harness.flush();
  assert.equal(harness.status(0), '已复制');

  harness.click(0);
  harness.advance(2000);
  await harness.flush();
  assert.equal(harness.status(0), '已复制');
  assert.deepEqual([...harness.button(0).classes], ['is-copied']);

  harness.resolve(1);
  await harness.flush();
  assert.equal(harness.status(0), '已复制');

  harness.advance(1999);
  await harness.flush();
  assert.equal(harness.status(0), '已复制');
  harness.advance(1);
  await harness.flush();
  assert.equal(harness.status(0), '');
  assert.deepEqual([...harness.button(0).classes], []);
});

test('复制竞态：多块状态相互独立', async () => {
  const harness = createCopyHarness(3);
  assert.equal(harness.button(0).hidden, false);
  harness.click(0);
  harness.click(1);
  harness.click(2);
  harness.resolve(0);
  harness.reject(1);
  harness.resolve(2);
  await harness.flush();
  assert.equal(harness.status(0), '已复制');
  assert.equal(harness.status(1), '复制失败，请手动选择');
  assert.equal(harness.status(2), '已复制');
  assert.deepEqual([...harness.button(1).classes], ['is-error']);

  harness.advance(2000);
  await harness.flush();
  assert.deepEqual(
    [harness.status(0), harness.status(1), harness.status(2)],
    ['', '', ''],
  );
});
