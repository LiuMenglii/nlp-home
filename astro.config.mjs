// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages 部署地址（T041：个人账号测试部署）：
// 线上地址 https://liumenglii.github.io/nlp-home/
// 官方账号审批通过后迁移时，改回 site: 'https://iienlp.github.io' 即可
export default defineConfig({
  site: 'https://liumenglii.github.io',
  base: '/nlp-home',
});
