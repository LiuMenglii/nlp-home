# Contract: Site Integration（站点集成契约）

**Feature**: `005-modernize-logo-mark` | **Date**: 2026-10-17（同日修订：三候选工作流） | **Spec**: [../spec.md](../spec.md) | **Plan**: [../plan.md](../plan.md)

本契约固定图标资产与既有站点数据/组件/构建链之间的接口。集成发生在**阶段二**（选定版通过 SC-006 评审之后，见 [candidates-review.md](./candidates-review.md)）；除 `public/` 两份 SVG 与 `Navbar.astro` 的一处宽高比属性外，任何接口变化均视为越界。

## 1. 数据接口（`src/data/site.json`，零改动）

| 字段 | 当前取值 | 本特性 |
|------|---------|--------|
| `logo` | `"/logo.svg"` | MUST 保持不变 |
| `favicon` | `"/favicon.svg"` | MUST 保持不变 |
| `instituteZh` / `lab` / `groupName` / `alias` / `fullName` / `navBrand` | 既有取值 | MUST 保持不变 |
| `institute` / `directions` / `admissions` | 既有取值 | MUST 保持不变 |

- MUST NOT 新增/删除/改名任何字段；MUST NOT 新增图标变体字段或尺寸字段。
- 图标文件的替换靠"同名覆盖"完成，不依赖数据改动；后续维护仍只需替换 `public/` 文件。

## 2. 顶栏品牌区（`src/components/Navbar.astro`）

**允许的唯一改动**：

```astro
<!-- 现状 -->
<img class="brand-logo" src={withBase(site.logo)} alt="" width={32} height={32} />
<!-- 目标（仅宽高比回退属性） -->
<img class="brand-logo" src={withBase(site.logo)} alt="" width={40} height={30} />
```

- `width/height` MUST 为 4:3（与资源内在 140:105 一致——**三版候选均保持 4:3 画布**，故回退比例固定 40×30，不随选定版分支）；目的为修正 CSS 加载前/加载失败时的回退比例，满足 FR-006"按原始宽高比展示"。
- 以下 MUST 保持不变：
  - 品牌区结构：`<a class="brand" href={withBase('/')}>` 内"左 logo + 右文字 `{site.navBrand}`"；
  - `alt=""`（装饰性图形）；可访问名仍由可见文字 "CIGMA" 提供；
  - CSS：`.brand-logo { height: 1.2em; width: auto; display: block; }`、`.brand { display:inline-flex; align-items:center; gap:10px; flex:0 0 auto; white-space:nowrap; }`、等高规则（logo 渲染高度 = "CIGMA" 文字行盒高度）；
  - 唯一点击行为：导航至主页；MUST NOT 绑定点击放大/灯箱/任何 JS 事件；既有 Gallery lightbox MUST NOT 扩展到 logo/品牌区；
  - 导航项结构与 `aria-current` 逻辑。
- MUST NOT 引入新 CSS 类、断点、媒体查询或 `aspect-ratio` 等替代机制（现有 `width:auto` 已足够）。

## 3. 标签页图标（`src/components/BaseLayout.astro`，零改动）

```astro
<link rel="icon" type="image/svg+xml" href={withBase(site.favicon)} />
```

- 引用方式、`type`、`rel`、`withBase` 全部保持不变。
- favicon 资产由选定候选派生（[logo-mark.md](./logo-mark.md) §6），与 `public/logo.svg` 在**同一次变更**中落位（FR-004）；派生时点在选定版通过 SC-006 评审之后（FR-009），候选阶段不产出。
- favicon 的 16px 可辨性由资产本身保证（见 [logo-mark.md](./logo-mark.md) §9）。

## 4. 构建期资源校验（`src/content.config.ts`，零改动）

`validateSiteBrand()` 继续执行以下校验（行为 MUST 不被削弱）：

1. `logo` / `favicon` 为非空字符串、以 `/` 开头、不含 `..`；
2. 指向的文件存在于 `public/`（`existsSync`）；
3. 命名字段齐全且非空。

**负向用例（验收时必须复核）**：临时改名/删除 `public/logo.svg`（或改错 `site.json` 的 `logo` 值）→ `npm run build` MUST 报错并中断、错误信息指向字段与目标路径 → 还原 → 构建恢复。

## 5. 构建与 CI（零改动）

| 项 | 契约 |
|----|------|
| `package.json` | 依赖与 scripts MUST 不变（`astro` / `@astrojs/check` / `typescript`） |
| 构建命令 | `npm run check`（`astro check`）与 `npm run build`（`astro build`）MUST 100% 通过 |
| CI | `.github/workflows/deploy.yml` MUST 不变；`npx astro check` + 构建照常执行 |
| 构建产物 | 18 个页面；logo/favicon 随 `public/` 原样复制；无新产物 |
| 环境 | Node ≥ 22；无新增环境变量或密钥 |

## 6. 版式与行为不变量

- 顶栏品牌区仍"左 logo + 右 CIGMA"，logo 与文字等高、点击回主页、不被放大；
- 图标按原始宽高比展示，MUST NOT 拉伸/压缩/裁切；
- 图标替换带来的天然宽度变化 MUST ≤20%（spec 口径；本特性三版候选均保持内在比例与内在宽度，实际变化 0%）；
- MUST NOT 引起导航换行、重叠、截断、挤压或页面横向滚动；
- 字体、字号、间距、配色与页面其余布局 MUST 保持不变；全站 Home / News（列表与详情）/ Team / Publications 一致呈现。

**视口验收矩阵（沿用 001–004 口径）**：

| 档位 | 宽度 | 检查点 |
|------|------|--------|
| 移动 | 375px、320px（最窄下限） | 品牌区同一行、logo 与文字不折断；导航项换行不重叠/截断；无横向滚动 |
| 平板 | 768px | 品牌区与导航排布正常 |
| 桌面 | 1024px、≥1280px | 品牌区与导航同一行；无多余空白/挤压 |
| 边界 | 575 / 767 / 1279px | 断点两侧无破损 |

## 7. 无障碍

- logo 为装饰性图形（`alt=""`），可访问名由文字 "CIGMA" 提供（沿用现状，不新增要求）；
- 品牌区唯一行为是导航回主页；MUST NOT 新增可聚焦元素、键盘陷阱或 `role` 变更；
- favicon 替换不影响读屏或文档语义。

## 8. 范围边界（MUST NOT）

- 修改 `site.json`、`BaseLayout.astro`、`content.config.ts`、`global.css`、任何页面/组件正文或布局；
- 新增依赖、脚本、CI 步骤、测试框架、设计工具链或图标字体；
- 新增站点页面、路由或图标使用场景（分享卡片、头像、PWA/触屏图标、动效版本、多配色变体）；
- `specs/…/candidates/` 评审产物（候选 SVG / 对比页 / 选定记录）进入 `public/`、`src/` 或构建产物；
- 改动字体、字号、间距、颜色变量或命名文案；
- 保留旧图标文件或旧引用。

## 9. 验收命令（摘要）

```bash
npm run check      # 0 error / 0 warning / 0 hint
npm run build      # 18 pages built
git diff --stat    # 站点代码仅 public/logo.svg、public/favicon.svg、src/components/Navbar.astro（specs/ 特性文档与评审产物另计）
git grep -nE 'logo\.svg|favicon\.svg'  # 仅 site.json 与既有组件引用；candidates/ 产物不被站点引用
```

完整验证步骤（尺寸矩阵、新旧比对、视口回归、负向用例）见 [../quickstart.md](../quickstart.md)。
