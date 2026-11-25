// @ts-check
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { defineConfig } from 'astro/config';
import { createSatteriMarkdownProcessor, satteri } from '@astrojs/markdown-satteri';
import {
  newsHighlightPlugin,
  newsTablePlugin,
  newsBibtexPlugin,
  newsExternalLinksPlugin,
} from './src/markdown/news-widgets.mjs';

const NEWS_DIR = new URL('./content/news/', import.meta.url);

/**
 * 内容层（glob loader）渲染硬错误时只记录日志、不会中断构建，
 * 会导致出错文章被静默跳过。这里在构建开始前用同一套插件预渲染全部新闻，
 * 任何硬错误直接抛出，保证构建失败；受控 warning 交给正常渲染输出一次。
 */
function newsWidgetsValidation() {
  return {
    name: 'news-widgets-validation',
    hooks: {
      async 'astro:build:start'() {
        const renderer = await createSatteriMarkdownProcessor({
          features: { directive: true },
          mdastPlugins: [newsHighlightPlugin, newsTablePlugin],
          hastPlugins: [newsBibtexPlugin, newsExternalLinksPlugin],
          syntaxHighlight: { type: 'shiki', excludeLangs: ['bibtex'] },
        });
        // 与 news collection 的 glob('**/*.md') 对齐：递归遍历嵌套目录。
        const entries = await readdir(NEWS_DIR, { recursive: true, withFileTypes: true });
        const files = entries
          .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
          .map((entry) => join(entry.parentPath, entry.name))
          .sort();
        const originalWarn = console.warn;
        console.warn = () => {};
        try {
          for (const file of files) {
            const fileURL = pathToFileURL(file);
            const source = await readFile(fileURL, 'utf8');
            await renderer.render(source, { fileURL });
          }
        } finally {
          console.warn = originalWarn;
        }
      },
    },
  };
}

// GitHub Pages 部署地址（T041：个人账号测试部署）：
// 线上地址 https://liumenglii.github.io/nlp-home/
// 官方账号审批通过后迁移时，改回 site: 'https://iienlp.github.io' 即可
export default defineConfig({
  site: 'https://liumenglii.github.io',
  base: '/nlp-home',
  integrations: [newsWidgetsValidation()],
  markdown: {
    processor: satteri({
      features: { directive: true },
      mdastPlugins: [newsHighlightPlugin, newsTablePlugin],
      hastPlugins: [newsBibtexPlugin, newsExternalLinksPlugin],
    }),
    syntaxHighlight: { type: 'shiki', excludeLangs: ['bibtex'] },
  },
});
