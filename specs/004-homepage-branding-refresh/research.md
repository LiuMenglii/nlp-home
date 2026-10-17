# Research: 主页品牌焕新（Homepage Branding Refresh）

**Date**: 2026-10-16 | **Status**: Complete（无遗留 NEEDS CLARIFICATION——spec 校验清单确认 0 个待澄清项；技术栈沿用 001–003 现状）

本特性为表现层改动（4 个 `.astro`/配置文件）+ 一次站点数据字段化（`site.json`）+ 两份静态资产（logo/favicon）+ 一条构建期资源校验（FR-011），无技术栈未知项。以下 R1–R9 记录每个设计决策及其取舍；上线视图与断点数值以 spec FR-009 为唯一规范源，本文件仅在需要时引用。

## R1: Logo 现代化与纯矢量化（FR-001 / FR-002 / US1）

**调研结论（原作，权威源 https://iienlp.github.io `images/icon.drawio.svg` 已逐字取得）**: 该文件为 draw.io 导出，结构为——

- `<svg>` 携带 draw.io 痕迹：`host="65bd71144e"`、`content="..mxfile..diagram.."`、`xmlns:v="https://vecta.io/nano"`，声明 `width/height=141px`、`viewBox="-0.5 -0.5 141 141"`；
- **三色 V 形主体**（向右延展的 chevron，填充无描边）：
  - 橙 `#f7941d`：`M 30 19 L 60 59 L 30 99 L 0 59 Z`（最左）；
  - 绿 `#28ae6c`：`M 30 19 L 70 19 L 100 59 L 70 99 L 30 99 L 60 59 Z`（中）；
  - 蓝 `#037ec2`：`M 70 19 L 110 19 L 140 59 L 110 99 L 70 99 L 100 59 Z`（右）；
  - 蓝箭头尖角点缀：`M 85 84 L 125 104 L 85 124 Z`（`rotate(75,105,104)`）；
- **两处白色语言/翻译符号**：以 `<image width="20"... xlink:href="data:image/svg+xml;base64,...">` 内嵌（位置 `(19.5,49.5)` 与 `(64.5,49.5)`）——**注意它们是矢量 SVG 的 data-URI，非位图**，解码后各含 2 条 `fill: rgb(255,255,255)` 路径；
- **白色笔形符号**：一条原生 `<path fill="#ffffff">`（右下，约 x 105–124）。

**Decision**:

1. **重绘为纯矢量**：新建 `public/logo.svg`——去除 draw.io 属性与 `<image>`/data-URI 内嵌，把两处白色语言符号**内联为原生 `<path>`**（从解码后的 data-URI 矢量取出其 `d`，`fill="#ffffff"`），白色笔形符号保留为原生 path；三色 chevron 以一致网格重绘（统一顶点节奏、清理非整数坐标/亚像素），保留整体意象。
2. **色值微调**：保留橙/绿/蓝三色**色相身份**，可做小幅明度/饱和度统一——**偏移 ≤10%、色相不变**（不引入渐变），与原图并排比对 MUST 判为同一标识（FR-001 / CHK021）；三色排列顺序与"向右延展"方向不变。
3. **不新增装饰**：无阴影、无描边滥用、无 3D（Constitution IV）；透明背景（白色符号叠于彩色 chevron 之上，故在白色顶栏与浅色底栏上均可辨，FR-001 AS3）。
4. `width/height` 由 SVG 自身 `viewBox` 管理，页面侧以 `img` 的 CSS 尺寸控制显示大小。

**Rationale**: 保留原设计要素（三色 V 形主体 + 白色语言/笔形符号）是 FR-001 的硬性要求，科学语义清晰（语言/翻译 + 书写 → NLP/生成）；把内嵌 data-URI 转为原生 path 是 FR-002「去除 draw.io 痕迹与内嵌位图」的直接落地，并保证 favicon 缩放与小尺寸下的可辨性（矢量无损缩放）。

**Alternatives considered**:

- 直接沿用原 draw.io 文件：含 draw.io 属性与内嵌 `<image>`/data-URI，违反 FR-002；且依赖外部站点资源，违反「仓库内相对路径引用」约束，否决。
- 重新设计全新意象：FR-001 明确 MUST NOT 改变整体意象，否决。

## R2: Favicon 同源简化（FR-008 / US1 AS4 / 边缘用例）

**调研结论（现状）**: `public/favicon.svg` 现为 **"G3" 蓝底圆角方块**（`rect` + `<text>`，硬编码 `Inter` 字体），与课题组命名体系不符；`BaseLayout.astro` 以硬编码 `/favicon.svg` 引用。

**Decision**: 以**同源简化**方式替换 `public/favicon.svg`——仅保留**三色 V 形主体**（三色 chevron，去除白色辅助符号），采用贴合内容的方形 `viewBox` 并留少量内边距，透明背景，去掉字体依赖与旧 "G3" 标识。可辨性目标：约 16px 标签页尺寸下三色 V 形主体清晰可辨（US1 AS4）。

**Rationale**: 原图白色辅助符号在小尺寸下会糊成一团（spec 边缘用例已明确允许 favicon 仅保留 V 形主体的简化版）；去掉字体依赖使 favicon 渲染与浏览器字体无关，更稳定。同源（同配色/同几何）保证 favicon 与 logo 一致，满足 FR-008「MUST NOT 保留与 logo 不一致的旧标识」。

**Alternatives considered**:

- 复用完整 `logo.svg` 作 favicon：白色辅助符号在 16px 下不可辨、且透明底小尺寸可读性差，否决。
- 保留旧 "G3" 方块：违反 FR-008，否决。

## R3: 顶部栏品牌区「logo + CIGMA」（FR-003 / US2 / 边缘用例）

**调研结论（现状）**: `Navbar.astro` 品牌区为 `<a class="brand">{目录硬编码 "G3 CIGMA"}</a>`；`.header-inner` 已为 `flex-wrap: wrap; justify-content: space-between`，窄屏导航项自动换行。

**Decision**: 品牌区改为组合结构——`<a class="brand" href={withBase('/')}><img src={withBase(site.logo)} alt="" width=32 height=32 /><span class="brand-text">{site.navBrand}</span></a>`：

- `img` 的 `alt=""`（装饰性），品牌区可访问名由可见文本 "CIGMA" 提供；`width/height` 显式声明防 CLS；
- `.brand` 为 `display:inline-flex; align-items:center; gap`，logo 与文字**等高对齐**（判据为两元素渲染后占据的矩形竖向高度相同——以 "CIGMA" 文字行盒高度为基准令 logo 渲染高度与之相等，FR-003 / CHK004 / CHK040 修订口径）；
- logo MUST NOT 被点击放大——`.brand` 不绑定任何点击放大/灯箱钩子，其唯一行为是 `href={withBase('/')}` 导航至主页；既有 Gallery lightbox MUST NOT 扩展到 logo/品牌区（FR-003 / CHK031）；
- **窄屏（375px 及 320px）**：品牌区（logo + 文字）MUST **始终同一行、内部不折断**（logo 可按下限收敛如 28px、`flex: 0 0 auto`，文字 `white-space: nowrap`）；导航项经既有 `flex-wrap` 在空间不足时换行，与品牌区不重叠/不截断（FR-003 AS4 / CHK014）；不新增断点。

**Rationale**: 组合式品牌区（图形 + 文字）是本次焕新的最直接落点，共用站点级组件即全站一致（FR-003）；以可见文本承载可访问名符合无障碍实践；不新增 JS/断点，符合 Constitution IV/V。

**Alternatives considered**:

- logo 作为 CSS 背景图（`background-image`）：无法声明 `alt`、不利于 a11y 与构建期引用校验，否决。
- 用内联 SVG 直接嵌进 Navbar：无法复用同一 logo 资产、与「仓库内静态资源」约定偏离，否决。

## R4: 主页名栏分层布局（FR-005 / US3）

**调研结论（现状）**: `Hero.astro` 现为「`p.hero-kicker`(=site.fullName, "iie-CIGMA") → `h1`(=site.groupName, "G3 CIGMA") → `p.hero-institute` → `ul.hero-directions`」，居中排布。

**Decision**: 改为**四层命名体系**（保持居中与既有段落节奏；层级关系 CHK001）：

1. `<p class="hero-affil">{site.instituteZh} · {site.lab}</p>` — 机构归属链行「中国科学院信息工程研究所 · 第六研究室/智能认知安全研究室」，以 "·" 显式表达研究所 ⊃ 研究室 ⊃ 课题组的三级从属（次要信息，`--ink-soft`）；
2. `<h1 id="hero-title">{site.groupName} {site.navBrand}</h1>` — 完整主名称「认知智能生成课题组 CIGMA」（由 `${groupName}` + 一个空格 + `${navBrand}` 组合派生，不设完整名称/中文简称字段）；
3. `<p class="hero-alias">{site.alias} · {site.fullName}</p>` — 「G3课题组 · Cognitive Intelligence with Generative and Multimodal Algorithms」（字号介于 h1 与正文之间，可多行；空间足够时优先同行、不足时自然换行）；
4. `ul.hero-directions`（不变）— 研究方向标签。

**删除** `.hero-kicker`（iie-CIGMA）与 `.hero-institute`——研究所**英文全称不在名栏重复**，由底部栏保留（FR-005 / CHK001）（机构中文名已并入第 1 行从属链）。

长命名在 375px/320px 下**优雅换行**：以自然空格断行为主（英文全称**词间断行**），`overflow-wrap: break-word` 兜底；**MUST NOT** 使用 `word-break: break-all`、**MUST NOT** 使用连字符断词（保持单词完整）；允许孤字/孤行、不设行数上限，以不溢出容器为准则（FR-005 AS3 / CHK009）；容器不溢出（既有 `body overflow-x:hidden` 防线保留，仍不得依赖它防溢出）。

**Rationale**: 四层顺序与 FR-005 完全一致；从属链行以 "·" 表述三级归属，避免研究所/研究室/课题组被读成平级段落；`.hero-alias` 用中圆点 `·` 分隔别名与英文全称，单行/多行皆清晰；字号层级（affil < alias < h1）体现信息层级，无需改 h1 视觉基调（Constitution IV）。

**Alternatives considered**:

- 别名与英文全称拆两行：信息层级更碎、视觉留白偏大，且 spec FR-005 表述为同一层「别名与英文全称行」，一并展示更贴合，否决。
- 机构从属链拆为「研究所行 + 研究室行」两行：与 FR-005「MUST NOT 呈现为平级段落」相悖且多占一行，否决。

## R5: 底部栏与站点级元信息（FR-004 / FR-007）

**调研结论（现状）**: `BaseLayout.astro` 页脚名称行为 `{site.groupName}`（现 "G3 CIGMA"）；`<title>` 由各页传入（如 `index.astro` 用 `${site.groupName} · ${site.institute}`，其余页用 `${...} · ${site.groupName}`）；`description` 默认 `${site.groupName}, ${site.institute}`；favicon 硬编码 `/favicon.svg`。

**Decision**:

- **底部栏**：行结构不变，仅将 `.footer-name` 由裸 `{site.groupName}` 改为 `${site.groupName} ${site.navBrand}` 组合派生 →「认知智能生成课题组 CIGMA」（一处组合改动即满足 FR-004；因 `groupName` 已不含品牌字）；研究所行与联系方式行不变。
- **标签页标题 / 描述**：**主页** `<title>` 由 `index.astro` 传入改为 `${site.groupName} - ${site.instituteZh}`（=「认知智能生成课题组 - 中国科学院信息工程研究所」，逐字依 FR-007 / CHK005）；**其余页**标题为 `${页名} · ${site.groupName} ${site.navBrand}` 派生式（如「News · 认知智能生成课题组 CIGMA」），各页标题模板据此作**一次性**实现改动（若原为其它写法），此后随数据自动派生（CHK036）；`description` 默认值 `${site.groupName}, ${site.institute}` 随数据更新，`iie-CIGMA` 随之消失（FR-007）。
- **favicon 引用**：由硬编码 `'/favicon.svg'` 改为 `withBase(site.favicon)`，纳入数据驱动与构建期校验（R7）。

**Rationale**: 底栏与其余页标题随 `${groupName} ${navBrand}` 组合变化自然满足 FR-004/FR-007，主页标题由 `groupName`/`instituteZh` 派生、同样数据驱动，改面最小（Constitution V）；favicon 路径数据化后与 logo 同受 FR-011 校验保护。

**Alternatives considered**:

- 为标题/描述新增整句文案字段（如 `homeTitle`）：主页标题须随命名改名联动（FR-007/SC-004），整句字面量会脱离数据源，否决——改用 `groupName`/`instituteZh` 两字段派生。
- 新增中文简称字段 `groupNameZh` 供主页标题使用：与 `${groupName} ${navBrand}` 组合派生重复，且需人工同步、易漂移（UND1），否决——`groupName` 即中文名称，完整主名称由组合派生（CHK035）。

## R6: 品牌数据字段化（FR-006 / SC-004）

**调研结论（现状）**: `src/data/site.json` 为单对象、直接 `import`（001 §7 约定，非 collection），现有字段 `groupName`/`fullName`/`institute`/`directions`/`admissions`。

**Decision**: 调整/新增字段（**唯一数据源**）：

| 字段 | 类型 | 变更 | 取值 | 用途 |
| ---- | ---- | ---- | ---- | ---- |
| `instituteZh` | string | **新增** | 「中国科学院信息工程研究所」 | 名栏机构从属链行首段（FR-005 ①）+ 主页标题 |
| `lab` | string | **新增** | 「第六研究室/智能认知安全研究室」 | 名栏机构从属链行次段（FR-005 ①） |
| `groupName` | string | **取值调整**（"G3 CIGMA" → ） | 「认知智能生成课题组」（**中文名称，不含品牌字**） | 名栏主标题（`{groupName} {navBrand}` 组合派生）+ 页脚名称（同组合）+ 其余页标题（同组合）+ 主页标题首段（FR-004/005/007） |
| `alias` | string | **新增** | 「G3课题组」 | 名栏别名（FR-005 ③） |
| `fullName` | string | **取值调整**（"iie-CIGMA" → ） | 「Cognitive Intelligence with Generative and Multimodal Algorithms」 | 名栏英文全称（FR-005 ③；键沿用，语义由「研究组标识」改为「英文全称」） |
| `navBrand` | string | **新增** | 「CIGMA」 | 顶栏品牌文字（FR-003） |
| `logo` | string | **新增** | 「/logo.svg」 | 顶栏 logo 资源路径（FR-002/003） |
| `favicon` | string | **新增** | 「/favicon.svg」 | favicon 资源路径（FR-008） |
| `institute` / `directions` / `admissions` | — | 不变 | 原取值 | 底部栏研究所行 / 方向标签 / Join Us |

**Rationale**: 全部展示位读同一份字段，任一命名后续调整只改 `site.json`（SC-004）；沿用既有 `fullName` 键承载英文全称使 Hero 改动最小（YAGNI），并在 README/data-model 记录语义变更；`groupName` 即课题组中文名称（不含品牌字），完整主名称由 `${groupName} ${navBrand}` 组合派生（**单一真源，不设 `groupNameZh` 等冗余字段**，消除漂移，CHK035）；`instituteZh` 为机构中文名的显式字段，供名栏从属链与主页标题使用（避免在模板中做字符串切分魔法）。

**Alternatives considered**:

- 新增 `fullNameEn` 而保留 `fullName`：徒增一键且需同步迁移，语义重叠，否决。
- 用 `site.institute.split(' / ')` / `groupName` 去尾切分派生机构中文名与中文简称：模板内字符串魔法、脆弱不可读，否决（`instituteZh` 改用显式字段；`groupName` 本身即中文名称，无需再切分）。
- 新增 `groupNameZh` 中文简称字段：与 `${groupName} ${navBrand}` 组合派生重复、且需人工同步易漂移（UND1），否决（CHK035）。
- 把 logo/favicon 路径硬编码在组件：无法数据驱动、难以被 FR-011 校验定位，否决。

## R7: FR-011 构建期站点品牌数据校验（资源路径 + 命名字段）

**调研结论（现状）**: 仓库既有构建期资产校验惯例集中于 `content.config.ts`——gallery `src`、teachers `photo` 均以 `superRefine` + `fs.existsSync` 使文件缺失即构建报错并定位文件与字段（003 R11）。`site.json` 非 collection，001 §7 曾说明「不需构建期强制」；本特性 FR-011 明确要求 logo/favicon 资源缺失或路径错误、以及品牌命名字段缺失/为空时构建报错，故需为其补一条校验。

**Decision**: 在 `content.config.ts` 新增 **站点品牌数据校验**（沿用 gallery/teachers 的 `existsSync` 构建期模式，覆盖两类）：

- 以 `fileURLToPath(new URL('./data/site.json', import.meta.url))` 定位数据文件、`new URL('../public/', import.meta.url)` 定位资源根（路径锚定到文件、不受 cwd 影响，与既有 `GALLERY_ASSET_DIR` 同型）；
- **(a) 静态资源**——读取并解析 `site.json`，校验 `logo` / `favicon`：MUST 为以 `/` 开头、无 `..` 的路径，且其指向的文件**存在于 `public/`**；任一不满足 → 抛出**定位到 `site.json` 字段与目标路径**的明确构建错误，`astro build` 中断；
- **(b) 命名字段**——`instituteZh` / `lab` / `groupName` / `alias` / `fullName` / `navBrand` MUST 存在且为非空字符串（`groupName` / `navBrand` 任一为空即失败，因完整主名称由 `${groupName} ${navBrand}` 组合派生）；缺失或为空 → 抛**定位到字段名**的构建错误并中断（消除「字段缺失静默渲染空标题」风险，CHK034；`fullName` 后经 CHK041 补入校验集）；
- 该逻辑与 teachers `photo`/gallery `src` 校验同型，是「常规内容更新只改数据文件」约束的**显式例外**（spec FR-011 已授权）；不新增构建脚本、不新增 CI 步骤。

**Rationale**: 复用仓库既有校验模式，维护者心智一致；校验随 `astro build`（及 CI）执行，缺失资源与空命名字段在构建期被拦截、不合入发布分支（Constitution III）；与 FR-002「仓库内相对路径引用、不热链」、FR-006「命名数据驱动」相互印证，并消除 `${groupName} ${navBrand}` 组合派生因字段为空产生空名称的可能。

**Alternatives considered**:

- 放在组件（BaseLayout）frontmatter 抛错：随每页渲染执行、错误定位分散，偏离「构建期校验集中于 schema 层」的既有惯例，否决。
- 新增独立预构建脚本/CI 步骤：重复实现既有拦截路径、增加流水线环节，违反 V，否决。
- 运行时 `<img onerror>` 兜底：需新增 JS（违反零新 JS），且破图已上线后才兜底，否决。

## R8: 验收与回归方式

**Decision**: 沿用 001–003 口径——`npm run check` + `npm run build` 为机器门禁；品牌与布局验收用浏览器 DevTools 响应式模式按 quickstart.md 视口矩阵手动核对（375 / 768 / 1024 / ≥1280px 四档 + 边界 575 / 767 / 1279px，覆盖至 320px）；新 logo 与原 logo 并排比对（SC-001，可下载原站文件离线对照）；`git diff` 核对改动范围收敛（FR-010：主页仅 Hero 一处；News/Team/Publications 的 diff 仅限 `<title>` 行）；FR-011 以负向用例验证——(a) 临时改名/删除 `public/logo.svg` 或改 `site.json` 路径、(b) 将 `navBrand`/`groupName` 置空 → 构建报错 → 还原 → 构建恢复。**部署后（线上渲染）核对由 CI / 既有维护工作流承载，不设本特性任务**（CHK037）。不引入 e2e/视觉回归框架（Constitution V）。

**Rationale**: 本特性以视觉与命名一致性判定为主，自动化收益低于工具引入与维护成本；回归面明确且小（站点级元素 + 主页 Hero 一处）。

**Alternatives considered**:

- Playwright 视觉快照：对 5 人课题组静态站点属过度工程，否决。

## R9: 宪法合规（数据改动范围 / 零新依赖 / 命名语言）

**Decision**: 数据改动**仅限** `site.json`（品牌命名字段 + 资源路径；`groupName` 取值调整、不设 `groupNameZh` 冗余字段）；新增/替换 2 份矢量资产；`content.config.ts` 仅新增站点品牌数据校验（FR-011 显式例外：资源路径合法性 + 命名字段非空，不新增字段语义约束以外内容）；其余数据文件与全部 collection schema 字段定义零改动；零新依赖、零新 JS。

**Rationale**: 与 Constitution I（命名逐字采用 spec 给定值、logo 以原站为唯一设计依据）一致；与 II（命名/文案数据驱动、后续改动只落 `site.json`，SC-004）一致；与 III（静态资产仓库内相对路径、构建期拦截缺失资源）一致；与 IV/V（简洁学术化 logo、零依赖、最小改动）一致。

**Alternatives considered**:

- 引入 SVG 优化工具链/字体子集等构建步骤：本特性收益为零、徒增依赖与流水线，否决。
