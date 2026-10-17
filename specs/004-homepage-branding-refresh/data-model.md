# Data Model: 主页品牌焕新（Homepage Branding Refresh）

**Date**: 2026-10-16 | **Constraint**: 数据改动**仅限 `src/data/site.json` 字段**（品牌命名 + logo/favicon 路径），其余数据文件（teachers/students/graduates/publications/gallery）与全部 collection schema 字段定义**零改动**；`content.config.ts` 仅新增「站点品牌数据校验」（FR-011，显式例外：静态资源路径合法性 + 命名字段存在且非空）。因此本文件「实体」分两部分：**① 数据层——SiteBrand（`site.json` 字段）与 LogoMark（静态资产契约，含原图要素提取/内联映射）；② 渲染层——视图实体**（顶栏品牌区、名栏、底栏、favicon/标题元信息）。

字段级历史约定以 [001 data-model.md](../001-homepage-rebuild/data-model.md)（§7 SiteInfo）为准，本文在 001 基础上给出 004 的字段变更。

## 数据层

### 1. SiteBrand（站点品牌命名数据）— `src/data/site.json`

单对象 JSON，直接 `import`（001 §7 约定）；全站展示位（顶栏、主页名栏、底栏、标签页标题/描述、favicon）均从本文件读取（FR-006）。

**字段定义（004 目标状态）**：

| 字段 | 类型 | 变更 | 取值 | 消费位 |
| ---- | ---- | ---- | ---- | ---- |
| `instituteZh` | string | **新增** | 「中国科学院信息工程研究所」 | 名栏机构从属链行首段（FR-005 ①）+ 主页标题（FR-007） |
| `lab` | string | **新增** | 「第六研究室/智能认知安全研究室」 | 名栏机构从属链行次段（FR-005 ①） |
| `groupName` | string | **取值调整**（"G3 CIGMA" → ） | 「认知智能生成课题组」（**课题组中文名称，不含品牌字**） | 名栏主标题（`{groupName} {navBrand}` 组合派生）+ 底栏名称（同组合）+ 其余页 `<title>`（同组合）+ 主页标题首段（FR-004/005/007） |
| `alias` | string | **新增** | 「G3课题组」 | 名栏别名（FR-005 ③） |
| `fullName` | string | **取值调整**（"iie-CIGMA" → ） | 「Cognitive Intelligence with Generative and Multimodal Algorithms」 | 名栏英文全称（FR-005 ③；键沿用，语义由「研究组标识」改为「英文全称」） |
| `navBrand` | string | **新增** | 「CIGMA」 | 顶栏品牌文字（FR-003） |
| `logo` | string | **新增** | 「/logo.svg」 | 顶栏 logo `img` 资源路径（FR-002/003） |
| `favicon` | string | **新增** | 「/favicon.svg」 | `<link rel="icon">` 资源路径（FR-008） |
| `institute` | string | 不变 | 「中国科学院信息工程研究所 / Institute of Information Engineering, CAS」 | 底栏研究所行 + `<meta description>` 默认值 |
| `directions` | string[] | 不变 | NLP / Multimodal Big Data Analysis / Efficient LLM Applications | 名栏方向标签（FR-005 ④） |
| `admissions` | object | 不变 | apply / skills / email | Join Us 区块（FR-010 范围外，零改动） |

**约束**：

- 命名文案**逐字**采用 spec/用户给定值（Constitution I，不凭推测改写）；`groupName` 为课题组**中文名称（不含品牌字）**，完整主名称「认知智能生成课题组 CIGMA」一律由 `${groupName}` + 一个空格 + `${navBrand}` 在各展示位组合派生，**不设 `groupNameZh` 等冗余简称/完整名称字段**（单一真源，消除漂移，CHK035）；不含 "iie-CIGMA" 字样（FR-005）。
- 任一命名文案后续修改只改本文件即可全站生效（SC-004）；模板/样式零改动。
- `logo` / `favicon` 取值经 `withBase()` 前缀化后输出（GitHub Pages 子路径部署）；`site.json` 内保存**不含 base 前缀**的站内绝对路径（与既有 `/teachers/...`、`/favicon.svg` 约定一致）。
- 静态资源字段（`logo`/`favicon`）缺失或路径非法、以及命名字段（`instituteZh`/`lab`/`groupName`/`alias`/`fullName`/`navBrand`）缺失或为空，均由 FR-011「站点品牌数据校验」在构建期**报错并中断**（§校验规则），不静默、不渲染裂图或空名称站点。

### 2. LogoMark（课题组标识图形）与简化 favicon — 静态资产契约

**现状资产**：`public/favicon.svg` = "G3" 蓝底圆角方块（`rect rx=12 fill=#1b78bf` + `<text>G3</text>`，硬编码 Inter 字体）。

**目标资产**（FR-001/002/008）：

| 文件 | 角色 | 内容 | 约束 |
| ---- | ---- | ---- | ---- |
| `public/logo.svg` | 完整课题组标识（顶栏用） | 三色 chevron 主体 + 白色语言/翻译符号 ×2 + 白色笔形符号 ×1 | 纯矢量；无 draw.io 属性（`host`/`content`/`xmlns:v`）；无 `<image>`/`foreignObject`/data-URI 内嵌；透明背景；白色符号内联为原生 `<path>`；内容通过 `viewBox` 缩放；三色色相不变、明度/饱和度偏移 ≤10% |
| `public/favicon.svg` | 同源简化 favicon | **仅**三色 chevron 主体（去白色辅助符号） | 纯矢量；去字体依赖与旧 "G3" 标识；约 16px 下三色 V 形主体可辨（US1 AS4） |

**原图要素提取与内联映射**（权威源 https://iienlp.github.io `images/icon.drawio.svg`，已逐字取得；see [research.md R1](./research.md)）：

| 要素 | 原图表示 | 目标表示 |
| ---- | ---- | ---- |
| 橙 chevron（最左） | `<path fill="#f7941d" d="M 30 19 L 60 59 L 30 99 L 0 59 Z">` | 同形重绘，保留色相 #f7941d（色相不变，明度/饱和度偏移 ≤10%） |
| 绿 chevron（中） | `<path fill="#28ae6c" d="M 30 19 L 70 19 L 100 59 L 70 99 L 30 99 L 60 59 Z">` | 同形重绘，保留色相 #28ae6c（色相不变，明度/饱和度偏移 ≤10%） |
| 蓝 chevron（右） | `<path fill="#037ec2" d="M 70 19 L 110 19 L 140 59 L 110 99 L 70 99 L 100 59 Z">` | 同形重绘，保留色相 #037ec2（色相不变，明度/饱和度偏移 ≤10%） |
| 蓝箭头尖角点缀 | `<path fill="#037ec2" d="M 85 84 L 125 104 L 85 124 Z" transform="rotate(75,105,104)">` | 保留（几何清理） |
| 白色语言/翻译符号 ×2 | `<image>` data-URI SVG（20×18 @ (19.5,49.5)；20×17.5 @ (64.5,49.5)） | **内联为原生 `<path fill="#ffffff">`**（取解码后各 2 条路径的 `d`，按原位置放置） |
| 白色笔形符号 ×1 | 原生 `<path fill="#ffffff" d="M 114.66 54.84 … Z M 116.79 58.98 … Z">`（右下 x≈105–124） | 保留为原生 path（几何清理） |

**可辨性目标**（FR-001 AS3 / AS4 / SC-001）：

- 白色辅助符号叠于彩色 chevron 之上 → 在**白色**（顶栏）与**浅色**（底栏 `--sky-soft`、名栏渐变头）背景上均可辨；
- 缩至 favicon 尺寸（约 16px）：`favicon.svg` 以三色 V 形主体呈现，清晰可辨。

## 视图实体

### 3. 顶栏品牌区（Navbar）— `src/components/Navbar.astro`

| 视图分区 | 数据来源 | 角色（本特性，FR-003） |
| ---- | ---- | ---- |
| `<a class="brand">` | — | 品牌区容器，整体为指向主页的链接（`href={withBase('/')}`） |
| `<img class="brand-logo">` | `site.logo`（经 `withBase`） | 左侧 logo 图形；`alt=""`（装饰性），显式 `width/height` 防 CLS |
| `<span class="brand-text">` | `site.navBrand` | 右侧文字「CIGMA」；提供品牌区可访问名 |

**装饰性图形与交互**：logo 为装饰性图形（`alt=""`），品牌区可访问名由文字 "CIGMA" 提供（FR-003 / CHK031）；logo MUST NOT 被点击放大——品牌区不绑定任何点击放大/灯箱行为，点击品牌区的唯一行为是导航至主页，既有 Gallery lightbox MUST NOT 扩展到 logo/品牌区（FR-003 / CHK031）。

分档行为（FR-003 AS4）：

| 视口 | 行为 |
| ---- | ---- |
| ≥ 768px | logo + CIGMA 与导航项同行、两端分布（既有 `space-between`）；logo 与文字**等高对齐** |
| 375px（及更窄至 320px） | 品牌区（logo+CIGMA）MUST **始终同一行、内部不折断**；导航项经既有 `flex-wrap` 在空间不足时换行，与品牌区不重叠/不截断 |

**不变量**：导航项（Home/News/Team/Publications）标签、href、`aria-current` 逻辑不变；顶栏为 sticky white 背景不变。

### 4. 主页名栏（Hero）— `src/components/Hero.astro`

| 视图分区 | 数据来源 | 层级（FR-005） |
| ---- | ---- | ---- |
| `.hero-affil` | `site.instituteZh` + `site.lab` | ① 机构归属链行「中国科学院信息工程研究所 · 第六研究室/智能认知安全研究室」（以 "·" 表达三级从属；次要，`--ink-soft`） |
| `h1#hero-title` | `site.groupName` + `site.navBrand` | ② 完整主名称（`{groupName} {navBrand}` 组合派生 =「认知智能生成课题组 CIGMA」） |
| `.hero-alias` | `site.alias` + `site.fullName` | ③ 别名 · 英文全称（「G3课题组 · Cognitive Intelligence … Algorithms」，空间足够同行、不足换行） |
| `ul.hero-directions` | `site.directions` | ④ 研究方向标签（不变） |

移除 `.hero-kicker`（原 `site.fullName` = "iie-CIGMA"）与 `.hero-institute`（研究所**英文全称**不在名栏重复，由底部栏保留，FR-005 / CHK001）。

分档行为（FR-005 AS3 / FR-009 边缘用例）：

| 视口 | 行为 |
| ---- | ---- |
| ≥ 1280 / 1024 / 768px | 四层居中展示，长命名不溢出容器 |
| 375px（及 320px） | ③行英文全称**词间断行**、不词中截断、不使用连字符断词；允许孤字/孤行、不设行数上限；不溢出、不截断 |

**不变量**：hero 背景渐变、居中排布、方向标签样式不变；其余主页区块（Join Us/News/Team/Publications/Gallery）与本次改动无关（FR-010）。

### 5. 底栏（Footer）— `src/components/BaseLayout.astro`

| 视图分区 | 数据来源 | 变更 |
| ---- | ---- | ---- |
| `.footer-name` | `site.groupName` + `site.navBrand` | 由裸 `{site.groupName}` 改为 `${site.groupName} ${site.navBrand}` 组合派生 →「认知智能生成课题组 CIGMA」（FR-004）；行结构不变 |
| `.footer-institute` | `site.institute` | 不变 |
| `.footer-contact` | `site.admissions.email` | 不变 |

### 6. 站点级元信息（BaseLayout `<head>`）— `src/components/BaseLayout.astro`

| 元素 | 数据来源 | 变更 |
| ---- | ---- | ---- |
| `<link rel="icon">` | `site.favicon`（经 `withBase`） | 由硬编码 `'/favicon.svg'` 改为数据驱动（FR-008） |
| `<title>` | 各页传入；**主页** `${site.groupName} - ${site.instituteZh}`（=「认知智能生成课题组 - 中国科学院信息工程研究所」），其余 `${页名} · ${site.groupName} ${site.navBrand}`（=「{页名} · 认知智能生成课题组 CIGMA」） | 取值随数据更新，`iie-CIGMA` 消失（FR-007）；主页标题由 `index.astro` 传入，其余页标题模板一次性对齐派生式（若原为其它写法） |
| `<meta description>` 默认 | `${site.groupName}, ${site.institute}` | 取值随数据更新（FR-007） |

## 校验规则

- **站点品牌数据校验（FR-011，新增于 `content.config.ts`）**：(a) `site.json` 的 `logo` / `favicon` MUST 为以 `/` 开头、无 `..` 的路径，且其指向文件存在于 `public/`；(b) 命名字段 `instituteZh`/`lab`/`groupName`/`alias`/`fullName`/`navBrand` MUST 存在且为非空字符串（`groupName`/`navBrand` 任一为空即失败，因完整主名称由其组合派生）；任一违反 → 构建期抛错定位到 `site.json` 字段（与目标路径）并中断（see [research.md R7](./research.md)）。
- **collection schema 零改动**：teachers/students/graduates/publications/gallery/news 字段定义与校验逻辑不变；数据文件损坏仍由既有 `jsonArrayParser` + Zod 在构建期拦截。
- **命名一致性核对**（人工/quickstart）：全站不出现 "iie-CIGMA"；顶栏与底栏不出现 "G3 CIGMA"（"G3课题组" 仅按命名体系保留于名栏，FR-005）。

## 派生展示值（模板层，不变/新增）

- 新增一处派生式：**完整主名称** = `${groupName}` + 一个空格 + `${navBrand}`，用于名栏 `h1`、底栏 `.footer-name`、其余页 `<title>`（不引入中间字段，单一真源）。
- 既有派生式保留：`<title>` 组合、`description` 默认组合、`withBase()` 前缀化、`normalizePath()` 当前页判断。
