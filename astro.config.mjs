// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages 部署地址。仓库名为占位值，部署时确认（tasks T041）：
// 最终线上地址应为 https://<org>.github.io/<repo>/
export default defineConfig({
  site: 'https://iienlp.github.io',
  base: '/nlp-home',
});
