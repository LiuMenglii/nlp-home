# Phase 0 Research: 项目内容结构重构

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Date**: 2026-11-24

本阶段无未解决的 `NEEDS CLARIFICATION`。以下决策基于现有代码、Astro 7.3.8 已安装实现与用户已确认的三项澄清。

## 决策 1：唯一内容区放在仓库根目录 `content/`

**Decision**: 在仓库根新增 `content/`，承载站点品牌信息、教师、学生、毕业生、论文、Gallery、新闻正文与配图、维护指南。`src/` 只保留代码；`public/` 只保留 `logo.svg` / `favicon.svg`。

**Rationale**:
- 用户已确认「统一顶层 `content/`，`src/` 只保留代码」。
- 维护者打开仓库根即可看到唯一内容区，不需要理解 `src/` 结构。
- 与 Astro 内容层的 `glob` / `file` loader 兼容：`base` 可指向项目根下任意相对目录，不限于 `src/content`。

**Alternatives considered**:
- 保留在 `src/data/` 与 `src/content/news/`：不解决内容与源码混杂，否决。
- 放在 `public/`：会被原样复制到构建产物，Markdown / JSON 也会公开可访问，且与静态资源语义混淆，否决。
- 放入新增的 `src/content/` 子目录：仍在源码树内，不满足「源码零内容」目标，否决。

## 决策 2：Gallery / 教师采用「一条目一目录 + `index.md`」

**Decision**:
- `content/gallery/<NN-slug>/index.md` + 同目录图片；
- `content/teachers/<NN-slug>/index.md` + 同目录照片。

条目使用 Markdown frontmatter 承载字段，`index.md` 正文留空。`glob({ pattern: '*/index.md', base: './content/<type>' })` 加载；Astro 的 entry id 会去掉末尾 `/index`，因此条目 id 等于目录名。

**Rationale**:
- 图片与说明物理同目录，满足 FR-003 / FR-004 与 User Story 2。
- 每个条目一个目录，替换图片只影响该目录，不会与其他条目交叉。
- `index.md` 是 Astro 内容层原生支持的条目类型，`image()` 能以该文件为基准解析 `./photo.ext`。
- 目录名可读（如 `01-lin-zheng`），不依赖数组下标或文件系统返回顺序。

**Alternatives considered**:
- 单个 JSON 文件 + 图片目录：仍是跨目录对照，否决。
- 每个条目一个 `.json` 或 `.yaml` 文件 + 同目录图片：也可行，但 Markdown frontmatter 对非前端维护者更熟悉，且与新闻一致；否决 YAML/JSON 方案。
- 每个条目一个 Markdown 文件（非目录）+ 同名图片：图片与 Markdown 同目录但 12 张照片、4 位教师会与新闻/其他文件混在一起，条目边界不清晰，否决。

## 决策 3：序号目录前缀决定展示顺序

**Decision**: Gallery 目录 `01-…` 至 `12-…`，教师目录 `01-…` 至 `04-…`；页面继续按 `entry.id` 字典序排序。目录名必须匹配 `^\d{2}-[a-z0-9-]+$`。

**Rationale**:
- 迁移前顺序分别由 `gallery.json` / `teachers.json` 数组顺序决定；序号目录是显式、可读、可控制的顺序来源，满足 spec 边缘用例「不得依赖文件系统返回顺序」。
- 两位数字前缀保证字典序与数值序一致，避免 `10-` 排在 `2-` 前。
- 不需要新增 `order` 字段，也不需要额外校验唯一性；排序规则就是目录名。

**Alternatives considered**:
- frontmatter `order: number`：需要额外校验重复 / 缺失，且文件系统顺序仍可能干扰；否决。
- 按日期排序：Gallery 仅部分照片有日期，教师无日期；无法保持既有顺序，否决。
- 依赖 `getCollection` 返回顺序：Astro 不保证文件系统顺序，否决。

## 决策 4：用 Astro `image()` schema 承载条目图片

**Decision**: Gallery schema 使用 `({ image }) => z.object({ image: image(), ... })`；教师使用 `photo: image().nullable().optional()`。图片路径限定为同目录相对路径 `./文件名`。组件直接使用 `ImageMetadata.src`，不再调用 `withBase`。

**Rationale**:
- `image()` 以条目文件为基准解析相对路径，构建期校验文件存在，缺失会中断构建（Astro `ImageNotFound`）。
- Astro 资源管线会把图片输出为带内容哈希的静态资源；本仓库已安装的 Astro 7.3.8 在构建期 `renderChunk` 中用 `resolvedConfig.base` 前缀重写资源 URL，因此 `ImageMetadata.src` 自带 `/nlp-home` base。
- 不复制图片到 `public/`，保持单一事实来源；删除旧 `public/gallery` / `public/teachers` 后旧 URL 自然 404，符合「图片访问路径允许变化」。
- 图片按原始文件输出（不经 `<Image>` 变换），内容、比例与像素不变，最容易满足「页面展示效果一致」。

**Alternatives considered**:
- 继续放 `public/` 并用 `withBase('/gallery/' + src)`：图片与说明仍分离，违反核心目标，否决。
- 自定义 Vite 插件在构建期把 `content/` 图片复制到 `public/`：引入额外构建逻辑与重复副本，违反最小复杂度与单一事实来源，否决。
- `import.meta.glob` 手动建立路径→URL 映射：需要手写解析、存在性校验与 base 处理，重复 `image()` 已有能力，否决。
- `<Image>` 组件输出响应式图：会改变 `src` / `srcset` 与图片处理方式，超出「纯结构重构」范围；仅在验证发现 dev base 问题时作为兜底，不作为首选。

## 决策 5：新闻保持一文件一条，只移动目录

**Decision**: 4 篇新闻及其 3 张配图整体 `git mv` 到 `content/news/`；`glob` base 改为 `./content/news`，pattern 仍为 `**/*.md`；正文相对图片引用保持原文件名。

**Rationale**:
- 新闻 `entry.id` 由相对路径派生（`getContentEntryIdAndSlug` 去掉扩展名并 slug 化），相对路径不变则 id 不变，`/news/<id>/` URL 不变。
- 子目录继续被 `**/*.md` 匹配，URL 派生规则不变。
- 配图与 Markdown 同目录，Astro 内容资源管线按 Markdown 文件位置解析相对图片，与现有行为一致。

**Alternatives considered**:
- 新闻改为每篇一个目录：会改变相对路径与潜在 URL，违反 URL 不变要求，否决。
- 把配图集中到 `content/news/assets/`：需要改正文引用，违反「正文与配图同目录、相对引用规则不变」，否决。

## 决策 6：学生 / 毕业生 / 论文保持 JSON 数组数据集

**Decision**: 三个文件原样迁移到 `content/`，继续使用 `file()` loader 与现有 `jsonArrayParser`，仅更新文件名参数与报错路径。

**Rationale**:
- 用户与 spec 明确不拆分无图片数据集；保持数组结构、字段、顺序与 `stu-001` / `gra-001` / `pub-001` id 生成规则，页面排序与 tiebreak 不变。
- `file()` loader 的 parser 仍可注入零填充 id，现有 schema 与 `singleLinkRefiner` 无需结构改动。

**Alternatives considered**:
- 拆成每条一个文件：无图片、条目多（135 条论文），维护成本与迁移风险高，违反 YAGNI，否决。
- 改为 YAML：无收益，且增加格式迁移风险，否决。

## 决策 7：站点品牌信息保持直接 import + 模块加载期校验

**Decision**: `content/site.json` 原样迁移；9 个组件 / 页面改为相对 import `content/site.json`；`validateSiteBrand()` 继续在 `src/content.config.ts` 模块加载期执行，`logo` / `favicon` 仍校验 `public/` 下文件存在。

**Rationale**:
- 当前 `site.json` 不是 collection（001 §7 约定），直接 import 让所有展示位同步取值，避免把 9 个组件改为异步 `getEntry`。
- 品牌字段必填与路径校验是现有 FR，迁移后必须保留；模块加载期校验在 `astro check` / `astro build` 载入配置时即执行。
- 品牌装饰资源不是带说明的日常内容，继续留在 `public/` 符合 spec 范围之外约定。

**Alternatives considered**:
- 将 `site.json` 转为 content collection：需要所有使用点改异步、组件 props 调整，超出「只改内容来源」范围，否决。
- 把 logo / favicon 也迁入 `content/`：需改品牌路径语义与静态资源引用，spec 明确不做，否决。

## 决策 8：校验分层：schema + 模块加载期审计

**Decision**:
- 字段级规则继续由各 collection 的 Zod schema 承担；
- 需要在报错中定位文件 / 条目 / 姓名的规则，继续在 `src/content.config.ts` 模块加载期读取原始文件（沿用现有 `validateSiteBrand`、`validateStudentsData`、`validateFeaturedNews` 模式）；
- 新增 Gallery / 教师条目资产审计：目录命名、`index.md` 完整性、图片同目录路径、文件存在、Gallery 12 条上限、Gallery 第 13 条；
- 新闻控件硬错误继续由 `astro.config.mjs` 的 `newsWidgetsValidation` 构建前预渲染拦截。

**Rationale**:
- Astro schema 错误能定位 entry id 与字段，但难以给出中文条目路径与「图片应放入该条目目录」的修复提示；模块加载期审计可提供符合 FR-010 的可操作报错。
- 现有代码已有相同模式，迁移只需把 `public/gallery` / `public/teachers` 的扫描改为 `content/.../<entry>/index.md`，不是新架构。
- `image()` 仍作为第二道门禁，防止审计遗漏或路径解析异常。

**Alternatives considered**:
- 只依赖 `image()`：报错语言与定位不足以覆盖 SC-004，否决。
- 把所有校验写成自定义 loader：改动面大、风险高，否决。

## 决策 9：代码改动保持最小

**Decision**: 只改内容来源路径、图片来源表达式、校验与文档；组件模板结构、CSS、路由、Markdown 控件、`base` / `site`、依赖与部署流水线不动。

**Rationale**:
- FR-014 明确要求展示层不变；内容重构不应以设计变化为代价。
- `TeacherCard` / `Gallery` 只把 `withBase(photo)` / `withBase('/gallery/' + src)` 改为 `ImageMetadata.src`，HTML 结构与 class 不变。
- 9 处 `site.json` import 仅改相对路径。

**Alternatives considered**:
- 借机重构组件或数据加载：超出范围，增加回归风险，否决。

## 决策 10：文档与验证

**Decision**:
- `src/data/README.md` 迁移并改写为 `content/README.md`，作为唯一维护指南；`docs/news-markdown-guide.md` 更新为 `content/news/`。
- 现有 `tests/news-widgets.test.mjs` 不改（fixtures 属历史 `specs/008`）。
- 迁移前后用构建产物、字段比对、数量计数、新闻 URL 列表与图片 `src` 检查验证；九档视口人工检查。

**Rationale**:
- 维护指南必须与单一内容区一致，旧路径操作指引出现次数必须为 0（历史 specs 除外）。
- 现有测试只覆盖 Markdown 控件，不应因目录迁移而改写。
- 页面一致性必须以真实构建产物核对，不能只靠代码阅读。

**Alternatives considered**:
- 保留 `src/data/README.md` 并新增 `content/README.md`：会形成两份指南，违反「唯一维护指南」，否决。
- 新增自动化端到端测试：本特性不引入新测试依赖；用现有命令 + 构建产物检查即可覆盖，后续可在 tasks 中决定是否补充轻量脚本。

## 未决问题

无。三项用户澄清（内容区位置、条目粒度、图片路径可变化）已落实到上述决策。
