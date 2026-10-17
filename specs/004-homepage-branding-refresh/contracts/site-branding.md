# Contract: 站点品牌契约（site-branding）

**Date**: 2026-10-16 | **Spec**: [spec.md](../spec.md) | **消费方**: 品牌/布局实现与验收（[quickstart.md](../quickstart.md)）、主页与各页回归验证 | **视图实体与数据映射**: [data-model.md](../data-model.md)

本契约对象有四：① **顶栏品牌区、主页名栏、底栏、favicon/标题元信息**的呈现行为（"UI 契约"，全站共享，后续样式改动的回归基线）；② **静态资产契约**——`public/logo.svg`（完整标识）与 `public/favicon.svg`（同源简化）的形态与可辨性（FR-001/002/008）；③ **数据契约**——`site.json` 品牌命名字段（FR-006，目标状态见 [data-model.md §1](../data-model.md)）；④ **构建期校验契约**——`logo`/`favicon` 引用文件 MUST 存在且命名字段 MUST 存在非空（FR-011）。字段级历史约定维持 [001 data-model.md §7](../001-homepage-rebuild/data-model.md)。

视图与断点数值以 spec FR-009 为唯一规范源，本契约引用不复述。

## 1. 顶栏品牌区（FR-003 / US2）

- 呈现为**「左侧 logo 图形 + 右侧文字 CIGMA」**组合，整体作为指向主页的链接。
- 品牌区文字**仅为** "CIGMA"（来自 `site.navBrand`）；**MUST NOT** 出现 "G3" 字样或 "G3 CIGMA" 组合。
- logo 图形取自 `site.logo`（`/logo.svg`，经 `withBase` 前缀化）；logo 与 "CIGMA" 文字**等高对齐**——判据为两元素各自渲染后占据的矩形竖向高度相同（两元素各视为矩形、竖边长相等；CHK040 修订口径，不再以 cap-height 字形高度为口径），实现以 "CIGMA" 文字行盒高度为基准、窄屏等比缩放。
- logo 为装饰性图形（`alt=""`），品牌区可访问名由文字 "CIGMA" 提供；logo **MUST NOT** 被点击放大——品牌区不绑定任何点击放大/灯箱行为，点击品牌区唯一行为是导航至主页（既有 Gallery lightbox **MUST NOT** 扩展到 logo/品牌区）。
- 全站（主页 / News / Team / Publications 及新闻详情页）**一致呈现**（站点级共享组件）。
- 品牌区（logo + CIGMA）在**所有**验收档位（含 375px / 320px）MUST **始终同一行、内部不折断**；各档位下与导航项**不重叠、不截断、不非预期换行**。
- 导航项（Home/News/Team/Publications）标签、链接、当前页高亮逻辑**不变**。

## 2. 静态资产契约（FR-001 / FR-002 / FR-008）

### 2.1 `public/logo.svg`（完整课题组标识）

- **纯矢量**：MUST NOT 含 draw.io 导出属性（`host` / `content` / `xmlns:v`）、MUST NOT 含 `<image>` / `<foreignObject>` / data-URI 内嵌位图或内嵌 SVG。
- **保留原设计要素**：橙、绿、蓝三色**依次排列、向右延展**的 V 形（chevron）主体构图，及原图中的**白色语言/翻译符号**（内联为原生 `<path>`）与**白色笔形符号**；整体意象与原站 logo 可一眼辨识为同一标识（SC-001）。
- **仅细节现代化**：几何轮廓清理、视觉重量统一、色值**小幅微调**——三色**色相不变**、明度/饱和度偏移 **≤10%**，与原图并排 MUST 判为同一标识（CHK021）；MUST NOT 引入渐变滥用/3D/重阴影等装饰，MUST NOT 重新设计意象。
- **可辨性**：在白色（顶栏）与浅色（底栏、名栏渐变头区）背景上清晰可辨；透明背景。
- **引用方式**：作为仓库内静态资源，经相对路径（`withBase(site.logo)`）引用；MUST NOT 热链外部资源。

### 2.2 `public/favicon.svg`（同源简化）

- 承载**现代化新标识的同源简化**（仅三色 V 形主体，去除白色辅助符号）；纯矢量、无字体依赖。
- **MUST NOT** 保留与 logo 不一致的旧标识（现 "G3" 蓝底方块随本次替换）。
- 约 16px 标签页尺寸下，三色 V 形主体清晰可辨（US1 AS4）。
- 经 `<link rel="icon" type="image/svg+xml" href={withBase(site.favicon)}>` 引用。

## 3. 主页名栏分层（FR-005 / US3）

自上而下 MUST 依次呈现四层：

1. **机构归属链行**：中国科学院信息工程研究所 · 第六研究室/智能认知安全研究室（`{site.instituteZh} · {site.lab}`，以 "·" 显式表达研究所 ⊃ 研究室 ⊃ 课题组的三级从属，三级 MUST NOT 呈现为平级段落）；
2. **主名称（主标题）**：认知智能生成课题组 CIGMA（由 `{site.groupName}` + 一个空格 + `{site.navBrand}` 组合派生，中文名与品牌字间留一个空格；**不设完整名称/中文简称字段**）；
3. **别名与英文全称行**：G3课题组 · Cognitive Intelligence with Generative and Multimodal Algorithms（`site.alias` · `site.fullName`，空间足够时优先同行、不足时允许自然换行）；
4. **研究方向标签**：保持现状（`site.directions`）。

- 研究所**英文全称**（Institute of Information Engineering, CAS）MUST NOT 在名栏重复展示（由底栏保留）。
- 名栏 MUST NOT 再显示 "iie-CIGMA"。
- 长命名在窄屏（375px 及覆盖至 320px）MUST **优雅换行**——英文全称在**词间**断行、MUST NOT 词中截断、MUST NOT 使用连字符断词；允许孤字/孤行、不设行数上限；不溢出容器、不截断。
- 允许在不改变信息层级与内容的前提下微调视觉细节（字号、间距、分隔样式）。

## 4. 底栏与站点级元信息（FR-004 / FR-007）

- **底栏名称行** MUST 显示「认知智能生成课题组 CIGMA」（由 `${site.groupName} ${site.navBrand}` 组合派生）；研究所行与联系方式行 MUST 保持不变。
- **标签页标题与站点描述** MUST 随新命名由数据驱动更新；MUST NOT 残留 "iie-CIGMA" 或与新命名矛盾的旧文案。**主页标题** MUST 为「认知智能生成课题组 - 中国科学院信息工程研究所」（`{site.groupName} - {site.instituteZh}`）；**其余页**标题 MUST 为 `${页名} · ${site.groupName} ${site.navBrand}` 派生式（如「News · 认知智能生成课题组 CIGMA」）——各页标题模板可作**一次性**对齐改动，此后标题随数据自动派生。
- 顶栏与底栏 MUST NOT 再出现 "G3 CIGMA"。

## 5. 数据契约（FR-006）

- 品牌命名与文案（机构中文名 `instituteZh`、研究室归属 `lab`、课题组中文名称 `groupName`（不含品牌字）、别名 `alias`、英文全称 `fullName`、导航品牌文字 `navBrand`；完整主名称与底栏名称均由 `${groupName} ${navBrand}` 组合派生）与资源路径（`logo` / `favicon`）MUST 以 `src/data/site.json` 字段维护，与模板解耦；MUST NOT 引入 `groupNameZh` 等冗余简称/完整名称字段（目标状态见 [data-model.md §1](../data-model.md)）。
- 后续任一命名调整 MUST 仅需修改 `site.json`、MUST NOT 需要改动模板或样式代码（SC-004）。
- `logo` / `favicon` 保存**不含 base 前缀**的站内绝对路径（与既有 `/favicon.svg` 约定一致），展示时经 `withBase()` 前缀化。

## 6. 构建期校验（FR-011）

- `site.json` 的 `logo` / `favicon` MUST 为以 `/` 开头、无 `..` 的路径，且其指向文件 MUST 存在于 `public/`；命名字段 `instituteZh` / `lab` / `groupName` / `alias` / `fullName` / `navBrand` MUST 存在且为非空字符串（`groupName` / `navBrand` 任一为空即失败，因完整主名称由其组合派生）；缺失或形态非法 → 构建**报错并中断**，报错信息定位到 `site.json` 字段（与目标路径）（复用 gallery/teachers `existsSync` 构建期校验模式）。
- 该校验随 `astro build` 与 CI 执行；负向用例（临时改名/删除资产、改路径，或将命名字段置空 → 构建失败 → 还原 → 构建恢复）为验收必测项。

## 7. 视口行为矩阵（MUST，FR-009）

| 视口（验收档） | 顶栏品牌区 | 主页名栏 | 底栏 | 布局破损 |
| ---- | ---- | ---- | ---- | ---- |
| ≥1280px | logo + CIGMA 与导航同行、两端分布 | 四层居中展示 | 名称行 = 认知智能生成课题组 CIGMA | 0 |
| 1279px（边界） | 同上 | 同上 | 同上 | 0 |
| 1024px | 同上 | 同上 | 同上 | 0 |
| 768px | 同上 | 同上 | 同上 | 0 |
| 767px（边界） | 品牌区同一行；导航经换行合理排布 | 同上 | 同上 | 0 |
| 575px（边界） | 品牌区同一行；导航经换行合理排布 | 同上 | 同上 | 0 |
| 375px | 品牌区（logo+CIGMA）同一行/内部不折断；与导航不重叠/不截断 | ③行英文全称词间断行 | 同上 | 0 |
| 320px（更窄覆盖） | 同上 | 同上 | 同上 | 0 |

- 破损判定口径：元素重叠、文字截断、内容溢出容器、非预期换行、页面横向滚动（整页完整显示于屏幕宽度内）。

## 8. 不变量（本特性 MUST NOT 改变）

- **数据不变量**：除 `site.json` 品牌字段（FR-006）外，`institute` / `directions` / `admissions` 取值与其余数据文件（teachers / students / graduates / publications / gallery）零改动；全部 collection schema 字段定义零改动；`content.config.ts` 仅新增站点品牌数据校验（FR-011 显式例外）。
- **页面范围（FR-010）**：主页除 Hero（名栏）外其余区块（Join Us / News / Team / Publications / Gallery）内容与布局不变；News/Team/Publications 页面**正文内容与布局**不变（此处的「内容」不含站点级元信息——顶栏/底栏/标签页标题/描述属本特性范围，可随命名更新）；MUST NOT 新增页面或路由。
- **视觉基调**：色板、卡片风格、正文字号 ≥18px、hero 背景渐变不变；零新增 JS 与运行时依赖；既有 `body { overflow-x: hidden }` 防线保留（不得依赖它防溢出）。
- **交互不变量**：顶栏导航项与当前页高亮、品牌区返回主页链接行为不变；Gallery lightbox 等既有交互不受影响。
