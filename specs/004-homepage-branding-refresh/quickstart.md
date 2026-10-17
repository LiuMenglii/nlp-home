# Quickstart: 主页品牌焕新验证指南

**Date**: 2026-10-16 | **Spec**: [spec.md](./spec.md) | **品牌契约**: [contracts/site-branding.md](./contracts/site-branding.md) | **视图实体与数据映射**: [data-model.md](./data-model.md)

改动 = 表现层（`.astro` 模板 + scoped CSS，含其余页 `<title>` 派生式一次性对齐）+ 站点数据字段化（仅 `site.json`）+ 静态资产（`public/logo.svg` 新增、`public/favicon.svg` 替换）+ 构建期站点品牌数据校验（FR-011，仅 `content.config.ts`）。零新依赖、零新 JS。验证 = 机器门禁（`check` + `build`，含 FR-011 负向用例）+ logo 并排比对 + 浏览器手动视口矩阵。视图/断点数值以 spec FR-009 为唯一规范源，本文引用不复述；**部署后（线上渲染）核对由 CI / 既有维护工作流承载，不属本特性验证任务**（SC-005 / CHK037）。

## 前置条件

- Node.js ≥ 22，仓库根目录已 `npm install`
- 浏览器 DevTools 响应式模式（或等价的视口宽度调节）
- 原站原 logo（https://iienlp.github.io `images/icon.drawio.svg` 或原站主页存档）用于并排比对（SC-001）

## 启动

```bash
npm run dev        # http://localhost:4321/nlp-home/  （主页）
                   # http://localhost:4321/nlp-home/news/  /team/  /publications/  及新闻详情页
```

构建产物验证（最终验收前执行一次）：

```bash
npm run check && npm run build && npm run preview
```

## 验证矩阵

对照 [site-branding.md](./contracts/site-branding.md) 逐项核对。验收档位：**375 / 768 / 1024 / ≥1280px**（FR-009 四档）+ 边界 **575 / 767 / 1279px**，另加 **320px**；页面共检：`/`、`/news/`（含一条详情页）、`/team/`、`/publications/`。

### 1. Logo 现代化与纯矢量化（US1 / FR-001 / FR-002 / SC-001）

1. 将 `public/logo.svg` 与原站 `icon.drawio.svg` 并排比对：**三色 V 形主体**（橙/绿/蓝依次排列、向右延展）与**白色语言/翻译符号、白色笔形符号**均完整保留，可一眼辨识为同一标识的现代化演绎；三色**色相不变、明度/饱和度偏移 ≤10%**（FR-001 / CHK021）。
2. 检查 `public/logo.svg` 内部：无 `host` / `content` / `xmlns:v` 等 draw.io 属性；无 `<image>` / `<foreignObject>` / `data:` 内嵌；白色辅助符号为原生 `<path>`，无位图。
3. 在**白色**（顶栏）与**浅色**（底栏 `--sky-soft`、名栏渐变头）背景上查看 logo：清晰可辨、对比度良好。

### 2. Favicon 同源简化（US1 AS4 / FR-008）

1. 检查 `public/favicon.svg` 为**纯矢量**、无字体依赖、**无 "G3" 旧标识**；形态与 `logo.svg` 同源（仅三色 V 形主体）。
2. 浏览器标签页（约 16px）查看：三色 V 形主体清晰可辨。
3. 确认 `<link rel="icon">` 经 `withBase(site.favicon)` 引用，线上路径正确。

### 3. 顶栏品牌区（US2 / FR-003 / SC-002）— 全站

1. 逐页（`/`、`/news/`、详情页、`/team/`、`/publications/`）核对顶栏均为**「左 logo 图形 + 右文字 CIGMA」**组合，且整体为返回主页的链接（点击回到 `/`）。
2. 逐页确认顶栏**不出现 "G3" 字样 / "G3 CIGMA"**；品牌区文字仅为 "CIGMA"。
3. 导航项（Home/News/Team/Publications）功能与当前页高亮不受影响。

### 4. 主页名栏分层（US3 / FR-005 / SC-003）

1. 打开主页，自上而下核对四层：① 机构归属链行「中国科学院信息工程研究所 · 第六研究室/智能认知安全研究室」→ ② 主名称「认知智能生成课题组 CIGMA」→ ③ 别名行「G3课题组 · Cognitive Intelligence with Generative and Multimodal Algorithms」→ ④ 研究方向标签（保持现状）。
2. 核对名栏**不出现研究所英文全称**（Institute of Information Engineering, CAS 由底栏保留），亦**不出现 "iie-CIGMA"**；站点级元素（名栏/导航/页脚/标签页标题/meta description）文本检索无该字样——News/Team/Publications 正文历史文案不在检索范围（FR-010/CHK043）。名栏主标题由 `${groupName} ${navBrand}` 组合派生，数据中**不存在 `groupNameZh` 等冗余字段**（可 `grep groupNameZh src/data/site.json` 确认为空）。
3. 375px 与 320px 档：③行英文全称**词间断行**、不词中截断、不使用连字符断词（允许孤字/孤行），不截断、不溢出容器。

### 5. 底部栏命名更新（US4 / FR-004）

1. 任一页面滚动到底部：名称行显示「认知智能生成课题组 CIGMA」；**不出现 "G3 CIGMA"**。
2. 研究所行（中国科学院信息工程研究所 / Institute of Information Engineering, CAS）与联系方式行保持不变。

### 6. 站点级元信息（FR-007）

1. 浏览器标签页标题随新命名显示——**主页 MUST 为「认知智能生成课题组 - 中国科学院信息工程研究所」**（FR-007 / CHK005），其余页为「页名 · 认知智能生成课题组 CIGMA」；无 "iie-CIGMA" 残留。
2. 查看页面 `<meta name="description">` 默认值随新命名更新、无矛盾旧文案。

### 7. 视口矩阵与无破损回归（FR-009 / FR-010）— 全档位

在 **≥1280 / 1279 / 1024 / 768 / 767 / 575 / 375 / 320px** 逐档浏览 `/`、`/news/`、`/team/`、`/publications/`：

1. 顶栏品牌区与导航不重叠/不截断/不非预期换行；名栏长命名不溢出；**无横向滚动条**（整页完整显示于屏幕宽度内）。
2. 主页其余区块（Join Us / News / Team / Publications / Gallery）内容与布局与改版前一致（仅命名/品牌处变化）；News/Team/Publications 页面**正文内容与布局不变**（仅站点级元信息——顶栏/底栏/`<title>`——随之更新）。

### 8. 命名数据驱动（FR-006 / SC-004）

1. `git diff` 核对：数据/schema 文件中**仅** `site.json`（品牌字段）与 `content.config.ts`（站点品牌数据校验）有改动、文档仅 `src/data/README.md`（字段说明）有改动；其余数据文件（teachers/students/graduates/publications/gallery）与全部 schema 字段定义 diff 为空；News/Team/Publications 的源码 diff **仅限 `<title>` 行**。
2. 抽查：修改 `site.json` 某一命名（如 `alias`）→ 本地 `npm run dev` 全站对应位置立即生效、无模板改动（验证后还原）。

### 9. 构建期站点品牌数据校验（FR-011）

1. （资源）临时将 `public/logo.svg` 改名（如 `logo2.svg`）或把 `site.json` 的 `logo` 指向不存在文件，执行 `npm run build` → 构建**报错并中断**，报错信息能定位到 `site.json` 的 `logo` 字段与目标路径；验证后还原，构建恢复通过。
2. （命名字段）临时将 `site.json` 的 `navBrand` 或 `groupName` 置为空字符串，执行 `npm run build` → 构建**报错并中断**，报错定位到对应字段名；验证后还原，构建恢复通过。
3. （可选）对 `favicon` 重复同型资源负向用例。

### 10. 机器门禁（FR-011 / SC-005）

```bash
npm run check      # 类型 + schema 校验通过
npm run build      # 静态构建通过（含 FR-011 站点品牌数据校验；CI 同口径）
```

## 预期结果（全部通过即特性达成）

- **SC-001**：新 logo 与原站 logo 并排比对，三色 V 形主体 + 白色辅助符号 100% 可辨识为同一标识；文件无 draw.io 痕迹与内嵌位图，在白色/浅色背景与 favicon 尺寸下清晰可辨。
- **SC-002**：全站页面顶栏均为「左 logo + 右 CIGMA」、底栏均为「认知智能生成课题组 CIGMA」；全站无 "G3 CIGMA"（顶栏/底栏）与 "iie-CIGMA" 字样（名栏 "G3课题组" 别名除外），主页标题为「认知智能生成课题组 - 中国科学院信息工程研究所」，其余页标题为「{页名} · 认知智能生成课题组 CIGMA」。
- **SC-003**：主页名栏在四档视口下无需滚动即可完整看到四层命名信息，且无布局破损。
- **SC-004**：任一命名文案修改仅需编辑 `site.json` 即全站生效、零模板/样式改动。
- **SC-005**：`check` + `build` 100% 通过；主页既有区块内容与布局与改版前一致（仅命名/品牌相关处变化）。部署成功与线上渲染核对由 CI / 既有维护工作流承载（CHK037）。
- **FR-011**：缺失/错路径 logo 资源、或为空/缺失的品牌命名字段（`groupName`/`navBrand` 等）令构建报错，改正后构建恢复通过。
