# Research: 001-homepage-rebuild (Phase 0)

**Date**: 2026-10-10 | **Status**: 所有 NEEDS CLARIFICATION 已解决

技术栈选型（Astro vs Jekyll vs 纯 HTML+JS+JSON）已于 2026-10-10 经用户确认：**Astro**。本研究解决实现层面的关键决策。

## 1. Astro 版本线

- **Decision**: Astro ^7.x（当前稳定线），以 `npm create astro` 初始化时的最新 7.x 为准，lockfile 锁定。
- **Rationale**: 2026-06 发布 Astro 7.0（Rust 编译器、更快构建），7.1 于 2026-07 发布；v7 文档为当前默认文档线。Content Layer API（glob/file loader）自 Astro 5 起稳定，7.x 延续。
- **Alternatives considered**: Astro 6.x（LTS 心智更稳，但无理由停留在旧大版本）；Astro 4（已过时）。

## 2. 内容管理：Content Collections 双 loader 策略

- **Decision**:
  - **新闻** → `glob({ pattern: '**/*.md', base: './src/content/news' })`，每条新闻一个 Markdown 文件；frontmatter（title/date/summary）走 Zod schema，正文即详情页内容，配图用 Markdown 相对路径（Astro 自动优化，满足 FR-018）。
  - **论文/老师/学生/毕业生/Gallery** → `file('src/data/xxx.json')`，单 JSON 文件多 entry；Zod schema 构建期校验字段（字段缺失/类型错误 → 构建失败并明确报错，满足 spec 边缘用例"数据文件错误时构建阶段明确报错"）。
  - **site.json**（课题组元信息+招募）→ 直接 `import`，不入 collection（低频更新、单对象，避免 file loader 单对象 entry 语义别扭）。
- **Rationale**: v7 官方文档确认 glob() 支持 Markdown 目录、file() 支持 JSON/YAML/TOML；两者均与 Zod schema 配合提供构建期校验与 TypeScript 类型推导。维护者心智模型统一："改 JSON 加论文、建 .md 加新闻"。
- **Alternatives considered**: 全部用 Markdown（论文无正文，强制加 .md 文件徒增维护成本）；全部用 JSON（新闻详情含富文本+配图，JSON 里塞 HTML/MD 字符串不可维护）；Astro 2.x 旧版 `type: 'content'` collections API（已被 Content Layer API 取代）。

## 3. GitHub Pages 部署

- **Decision**: `.github/workflows/deploy.yml`，采用官方推荐 workflow：
  - 触发：`push` 到 `main` + `workflow_dispatch`
  - 权限：`contents: read` / `pages: write` / `id-token: write`
  - 步骤：`actions/checkout@v6` → `withastro/action@v6`（安装、构建、上传）→ `deploy-pages`
  - `astro.config.mjs` 配置 `site: 'https://<org>.github.io'` + `base: '/<repo>'`；提交 lockfile（action 据此检测包管理器）
  - 仓库 Settings → Pages → Source: GitHub Actions（一次性手动配置）
- **Rationale**: v7 官方部署文档（v7.docs.astro.build/en/guides/deploy/github/）确认此为推荐路径；`withastro/action` 封装了 Node 安装/构建/上传，workflow 约 20 行，符合 Constitution III"标准 GitHub Pages 构建流水线自动部署"。
- **Alternatives considered**: GitHub Pages 原生 Jekyll 流程（仅限 Jekyll 项目）；手动 `gh-pages` 分支推送（无 CI 校验，违背 Constitution III"构建失败不得合入"）；第三方部署平台（Vercel/Netlify，违背纯 GitHub Pages 约束）。

## 4. Lightbox（Gallery 点击放大）

- **Decision**: 原生 `<dialog>` 元素 + ~30 行 vanilla JS（事件委托：点击缩略图 → `showModal()` 填充大图；点击遮罩/Esc/关闭按钮 → `close()`），无任何第三方 lightbox 库。
- **Rationale**: `<dialog>` 原生支持焦点管理、Esc 关闭、`::backdrop` 遮罩，可访问性优于手写 fixed 覆盖层；交互范围固定（单图查看，无需缩放/滑动/相册轮播），30 行内可控。Constitution IV"不追求炫酷动效"、V 最小复杂度。
- **Alternatives considered**: PhotoSwipe/GLightbox（引入运行时依赖，违背 Constitution IV/V）；手写 fixed 定位覆盖层（需自行处理焦点陷阱与滚动锁定，代码更多）。

## 5. Gallery 图片处理

- **Decision**: v1 照片放 `public/gallery/`，`gallery.json` 引用文件名，模板拼接路径直出 `<img>`；约定单张 JPEG ≤500KB、长边 ≤2000px（写入数据文件契约）。
- **Rationale**: 维护流程最简（丢图片进目录 + 改 JSON），路径透明、构建快；8–12 张规模下性能可控。构建时图片优化（src/assets + image() helper）对 file loader JSON 的支持存在不确定性且增加维护心智，列为可选后续增强，不在 v1 承诺。
- **Alternatives considered**: `src/assets/gallery/` + image() helper（构建时自动生成 webp 缩略图，但 file loader 下 schema 内图片路径解析行为需额外验证，且维护者需理解 src/assets 目录约定）；图片外链（违背 Constitution"图片存仓库内"）。

## 6. 新闻详情配图

- **Decision**: 新闻 .md 正文内直接用 Markdown 图片语法 `![alt](./xxx.png)`，图片与 .md 同目录（`src/content/news/` 下按条目分目录或同名图片文件），Astro 构建时自动优化。
- **Rationale**: glob loader + Markdown 的标准能力（官方 blog 模板同款模式），零额外配置；同时天然校验路径——图片缺失构建报错（满足 spec 边缘用例"配图缺失时构建阶段明确报错"）。
- **Alternatives considered**: 配图也放 public/（无优化、无构建期校验）；frontmatter cover 字段（列表页无封面需求，YAGNI）。

## 7. 发表页可浏览性（百余篇）

- **Decision**: 按年份降序分组渲染 + 页内年份锚点导航（sticky 侧栏或顶部跳转条，纯 HTML 锚点 `#year-2024`，零 JS）。
- **Rationale**: spec 边缘用例"列表规模较大时按年份分组或提供年份导航"；锚点方案零 JS、零依赖，纯静态即可用。
- **Alternatives considered**: 搜索/过滤（需引入 JS 或第三方库，YAGNI，后续特性可扩展）；单列表不分页（130+ 条浏览性差）；真分页（over-engineering）。

## 8. 视觉与样式

- **Decision**: 单一 `src/styles/global.css`（CSS 变量 + 公共布局）+ Astro 组件 scoped `<style>`；色板沿用 nlp-home-simple：`--ink #102b4e` / `--ink-soft #47627d` / `--blue #1b78bf` / `--blue-deep #07548f` / `--sky #eaf5fc` / `--sky-soft #f5faff` / `--line #cfe1ee`；Inter 字体（系统字体栈回退）；1180px 内容容器、sticky 顶部导航、卡片式区块。
- **Rationale**: spec Assumptions 明确"视觉风格参考 nlp-home-simple"；参考站已验证该色板/布局的可读性与学术气质；CSS 变量集中管理便于微调。
- **Alternatives considered**: Tailwind（引入依赖与类名心智，违背 Constitution V）；CSS 框架 Bootstrap（视觉风格不可控）。

## 9. 验证策略

- **Decision**: 三层——① `astro check`（TypeScript + Zod schema 类型检查）；② `astro build`（构建期数据校验，任何数据文件字段错误在此失败）；③ quickstart.md 手动验证清单（六区块/导航/CCF 徽标/lightbox/移动端 375px/外链抽检 ≥20 条）。不引入 e2e 自动化框架。
- **Rationale**: 静态站点、页面数固定，手动清单 + 构建期校验已覆盖全部 Success Criteria；e2e 框架（Playwright）对 4 页面站点属过度投资（Constitution V）。
- **Alternatives considered**: Playwright e2e（维护成本 > 收益）；仅手动验证（无法满足"构建阶段明确报错"的自动化保证）。

## 结论

无未解决项。所有决策与 Constitution 一致，进入 Phase 1 设计。
