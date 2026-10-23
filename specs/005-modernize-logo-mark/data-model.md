# Data Model: 课题组图标现代化（Logo Mark Modernization）

**Date**: 2026-10-17（同日修订：三候选工作流；2026-10-20 修订：评审工作流口径；同日**迭代 2**：首轮候选未选定，按 FR-009 迭代路径重新锁定参数；同日**迭代 3**：维护者指出三版丢失「大脑电路」符号，按「文 / 脑 / 笔 各占一带」重做，绿带统一 42、三符号 2.8/3.0 笔画） | **Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

本特性不新增站点数据文件或字段；"数据模型"描述的是**阶段一的三版候选与并排对比页、阶段二两份静态 SVG 资产的构成、约束与量测规则**，以及它们与既有站点数据/组件的引用关系。全部坐标均为 SVG viewBox 单位（1 单位 = 顶栏 22px 高度下的约 0.21px）。

## 1. 实体总览

| 实体 | 类型 | 载体 | 关系 |
|------|------|------|------|
| `CandidateLogoMark` | 资产（评审用，3 个实例 a/b/c） | `specs/…/candidates/candidate-{a,b,c}.svg` | 3 个实例；其一被选定后转为 `LogoMark` |
| `LogoComparisonPage` | 评审产物 | `specs/…/candidates/comparison.html` | 聚合呈现现状图标 + 3 个 `CandidateLogoMark` |
| `SelectionRecord` | 过程记录 | `specs/…/candidates/SELECTION.md` | 记录被选定的 `CandidateLogoMark` 与 SC-006 评审结论 |
| `LogoMark` | 资产（聚合根，最终版） | `public/logo.svg` | = 被选定的 `CandidateLogoMark` 原样落位；3 `AccentGlyph`；1—4 `BrandColor`；1—1 `FaviconMark` |
| `AccentGlyph` | 值对象 | `LogoMark` 内联组 | 属于 `LogoMark`（候选阶段即随 `CandidateLogoMark`） |
| `FaviconMark` | 资产（最终版） | `public/favicon.svg` | 由 `LogoMark`（选定候选）简化派生 |
| `BrandColor` | 值对象 | 候选与最终资产内联 | 被各 mark 共用 |
| `BrandAssetSet` | 聚合（最终版） | 两份资产 + 引用点 | 被 `SiteBrandReference` 引用 |
| `SiteBrandReference` | 既有数据引用（不变） | `site.json` + `Navbar`/`BaseLayout`/`content.config.ts` | 引用 `BrandAssetSet` 的路径 |

## 2. `CandidateLogoMark`（候选标识，3 个实例）

**载体**：`specs/005-modernize-logo-mark/candidates/candidate-a.svg` / `candidate-b.svg` / `candidate-c.svg`（评审用，MUST NOT 进入 `public/` 或 `src/`）

**共同属性（三版 MUST 一致）**：

| 属性 | 取值 | 约束/说明 |
|------|------|-----------|
| `format` | SVG 1.1 纯矢量自包含 | 与最终资产同一格式规则（[logo-mark.md](./contracts/logo-mark.md) §2） |
| `viewBox` | `0 19 140 105` | 三版均保持（4:3，宽高比变化 0% ≤ 20% 口径） |
| `identityInvariants` | 见 §6 | FR-001 全项，含放宽口径（三色色相锁定、L/S 偏移 ≤20%、无渐变） |
| `symbolCount` | 3（文 + 脑 + 笔，各占一带） | FR-001 允许 1–3；三版共用 §6 统一符号系统的形态定义 |
| `status` | `drafted` → `selected` / `rejected` / `iterated` | 由选定流程驱动（§9 生命周期） |

**差异属性（按实例）**：

| 属性 | `a`「疾进」（几何升级） | `b`「锋锐」（几何 + 提亮） | `c`「极构」（最大跨度） |
|------|--------------------|--------------------|--------------------|
| 分界折线角度 | 55.98°（`w=27`） | 60.09°（`w=23`） | 62.3°（`w=21`） |
| 三色路径（y=59 宽度） | **54 / 42 / 44** | **46 / 42 / 52** | **42 / 42 / 56** |
| 外轮廓 | 六顶点真切线 r=5 圆角（`clipPath`） | 六顶点真切线 r=6 圆角（`clipPath`） | **非对称**：左端 r=9、右端 r=3、其余 r=5（`clipPath`） |
| 右下尖角 | 三顶点 r=2.5（随新蓝带移位） | 三顶点 r=3（随新蓝带移位） | 三顶点 r=3（随新蓝带移位） |
| 色值 | 逐字三原值（ΔL 0%） | 三色统一 +10% L（`#f8a138` / `#2cbf77` / `#038bd5`） | 三色统一 −12% L（`#eb8408` / `#23995f` / `#036fab`） |
| 符号光学尺寸 / 笔画 | 文 17.2×18.3 / 脑 20.6×15.0 / 笔 18.7×18.4；2.8 | 同左；2.8 | 同左 +0.2（3.0 笔画） |
| 符号锚点 | 文 (27,59)、脑 (75,59.99)、笔 (118,59) | 文 (23,59)、脑 (67,59.99)、笔 (114,59) | 文 (21,59)、脑 (63,59.99)、笔 (112,59) |

完整参数规格见 [candidates-review.md](./contracts/candidates-review.md) §3–§6。

## 3. `LogoComparisonPage`（并排对比页）

**载体**：`specs/005-modernize-logo-mark/candidates/comparison.html`

| 属性 | 取值 | 约束/说明 |
|------|------|-----------|
| 自包含 | 是 | 4 图标内联 `<defs>` + `<use>`；零 JS、零外部请求、系统字体 |
| 内容矩阵 | 4 行（现状 / a / b / c）× 4 档（128px、64px、22px 高、16px 高） | 满足 FR-009 三档（≥64px / 约 22px / 16px）；现状图标为内联快照，不运行时引用 `public/` |
| 22px 档呈现 | 白色顶栏模拟条 | 贴近顶栏真实观感 |
| 16px 档含义 | 完整图标缩至 16px 的模拟渲染 | 非 favicon 资产（favicon 按选定版派生） |
| 行标注 | 代号、名称、杠杆摘要、口径使用（宽高比 Δ / 色偏 Δ / 符号数 / 圆角 / 节奏） | 供评审对照参数 |
| 评审口径 | 身份不变量核查由维护者评审时执行；SC-002 / SC-003 仅作目视定性判断 | 候选阶段不逐版量化验收 SC-002 / SC-003，两者的量化验收仅针对选定版（spec 2026-10-20） |
| 交付边界 | MUST NOT 进入 `public/` / `src/` / 构建产物 / 部署 | 评审用临时产物（FR-007 豁免仅以 FR-009 为据）；选定合入后可留档或清理（维护者裁量） |

## 4. `SelectionRecord`（选定与评审记录）

**载体**：`specs/005-modernize-logo-mark/candidates/SELECTION.md`（维护者选定后产生）

| 属性 | 取值 | 约束/说明 |
|------|------|-----------|
| `selectedCandidate` | `a` / `b` / `c` 之一 | 维护者从对比页三版中选定；身份不变量为硬性门槛，其余取舍交由维护者裁量（spec 2026-10-20） |
| `selectedBy` / `selectedAt` / `rationale` | 维护者 / 日期 / 理由摘要 | — |
| `selectedParams` | 选定版关键参数与色值快照 | 阶段二资产核对、quickstart 色值/SC-003 量测的事实源（尤其 c 的微调色值） |
| `sc006` | 评审人（未参与设计的实验室老师，≥1 名、由维护者邀请；维护者本人与候选制作方不得担任）在同一无提示并排对照下作出两项判定（"同一标识的现代化版本" + "更现代、未大改整体设计"，均须通过）+ 日期 | 时点：选定之后、合入之前；仅针对选定版；SC-006 不覆盖 favicon |
| `state` | `selected` → `review-passed` →（进入阶段二）；`review-failed` / 无法选定 → 迭代候选（重新生成三版） | 失败路径闭环见 [candidates-review.md](./contracts/candidates-review.md) §8 |

## 5. `LogoMark`（最终完整图标）

**载体**：`public/logo.svg`（替换现有同名文件）＝**被选定候选原样落位**

| 属性 | 取值 | 约束/说明 |
|------|------|-----------|
| `viewBox` | `0 19 140 105` | 三版候选均保持；内在 140×105，宽高比 4:3（相对现状变化 0%，口径 ≤20%） |
| `sourceCandidate` | SELECTION.md 记录的候选 | 几何 / 圆角 / 尖角 / 色值 / 符号参数与该候选完全一致 |
| `contentBBox` | 画布覆盖率宽高均 ≥90% | 无裁切、无异常留白 |
| `background` | 透明 | 无底色矩形 |
| `silhouette` | 六边形（顶点 (0,59)(`w`,19)(140−`w`,19)(140,59)(140−`w`,99)(`w`,99)，`w` 随候选 27 / 23 / 21）；圆角随候选（a r=5 / b r=6 / c 非对称 r=9·5·3） | 身份不变量；三版均使用 `clipPath` |
| `colorZones` | 三条 chevron 路径；y=59 宽度随候选（a 54/42/44，b 46/42/52，c 42/42/56） | 顺序橙 → 绿 → 蓝、方向向右不变；相邻色块精确共边 |
| `spike` | 右下蓝色尖角（a r=2.5 / b r=3 / c r=3，随新蓝带几何移位） | MUST NOT 删除 |
| `accents` | 3 个 `AccentGlyph`（见 §6，文 / 脑 / 笔各占一带） | 数量在 FR-001 允许的 1–3 内 |
| `colors` | 见 §7 | a 逐字原值；b 为 +10% L、c 为 −12% L 的统一微调值 |
| `flatness` / `selfContained` / `fileSize` / `idScope` | 同 [logo-mark.md](./contracts/logo-mark.md) §2 | 纯平面矢量、单文件 ≤2KB 目标、id 唯一 |

## 6. `AccentGlyph`（白色辅助符号，值对象）

三个符号共用同一套语言：`fill="none"`、`stroke="#ffffff"`、`stroke-linecap="round"`、`stroke-linejoin="round"`；形态定义（原点在锚点）见 [candidates-review.md](./contracts/candidates-review.md) §5：文 4 笔、脑 2 笔（单线脑形 + 中央裂）、笔 1 笔闭合笔身；光学尺寸按符号密度分级（文 17.2×18.3、脑 20.6×15.0、笔 18.7×18.4），笔画宽度三符号完全一致。

| 属性 | 候选 a（2.8 笔画） | 候选 b（2.8 笔画） | 候选 c（3.0 笔画） |
|------|-------------------------------|-------------------------------|-------------------------------|
| 文锚点（橙带中点） | `(27,59)` | `(23,59)` | `(21,59)` |
| 脑锚点（绿带中点） | `(75,59.99)` | `(67,59.99)` | `(63,59.99)` |
| 笔锚点（蓝带中点） | `(118,59)` | `(114,59)` | `(112,59)` |
| 笔画宽度极差 | 0%（三符号均 2.8） | 0%（三符号均 2.8） | 0%（三符号均 3.0） |
| 墨迹外沿 | 文 ≤ ±8.6、脑 ≤ ±10.3、笔 ≤ ±9.4（含 1.4 端点半径） | 同左 | 文 ≤ ±8.7、脑 ≤ ±10.4、笔 ≤ ±9.5（含 1.5 端点半径） |
| 最小安全边距 | 文 11.73 / 脑 7.09 / 笔 7.38 单位（≥6.4 = 80×8%） | 文 9.52 / 脑 7.84 / 笔 11.70 单位 | 文 8.21 / 脑 8.10 / 笔 13.88 单位 |
| 中心偏差 | x 锚点 = 色带横截面中点；墨迹 bbox 中心偏差 ≤0.25 单位（实测文 y 0.18、脑 0.00、笔 0.00） | 同左 | 同左 |

**约束**：符号数量 MUST 为 1–3（三版候选均取 3，语义覆盖语言 + 认知 + 书写）；每个符号 MUST 完整落在单一色带内并保留安全边距；MUST NOT 堆叠或引入无语义装饰；坐标可作 ±0.5 单位光学微调，但不得改变锚点、数量与安全边距下限。

## 7. `BrandColor`（值对象）

| 名称 | 候选 a 取值 | 候选 b 取值（+10% L） | 候选 c 取值（−12% L） | 约束 |
|------|------------|----------------------|----------------------|------|
| `orange` | `#f7941d` | `#f8a138` | `#eb8408` | 色相不变；L 偏移 0% / +10.2% / −12.0%；S 偏移 ≤0.3%；硬上限 ≤20% |
| `green` | `#28ae6c` | `#2cbf77` | `#23995f` | 同上（+9.8% / −12.1%） |
| `blue` | `#037ec2` | `#038bd5` | `#036fab` | 同上（+9.8% / −11.7%） |
| `white` | `#ffffff` | `#ffffff` | `#ffffff` | 纯白，无透明度 |

不新增任何表外颜色；不使用渐变、透明度或混合模式。

## 8. `FaviconMark`（最终标签页简化图标）

**载体**：`public/favicon.svg`（替换现有同名文件）＝**由选定候选派生**

| 属性 | 取值 | 约束/说明 |
|------|------|-----------|
| `viewBox` | `-10 -21 160 160` | 不变；内在 160×160，方形 |
| `background` | 透明 | 深/浅标签栏均可辨；不依赖白色细节 |
| `colorZones` | 与选定候选**完全相同**的三条三色路径 | 同源、同色值（a 原值 / b +10% L / c −12% L）、同几何 |
| `silhouette` | 与选定候选**相同的轮廓处理**（a r=5 / b r=6 / c 非对称 r=9·5·3） | 同源语汇 |
| `spike` / `accents` | 无 / 无 | 沿用 004 简化策略 |
| `text/fonts/bitmaps` | 无 | 纯矢量、无字体依赖 |
| `16px 可辨性` | 橙/绿/蓝三色可相互区分；向右箭头轮廓可辨 | SC-002 / US2 AS2 |
| `derivation` | 选定版通过 SC-006 后派生；与 `LogoMark` 同一次变更落位 | FR-004 / FR-009；候选阶段不产出；验收仅按 SC-002 的 16px 口径执行（SC-006 不覆盖 favicon，无需单独评审） |

## 9. `BrandAssetSet` 与 `SiteBrandReference`

**`BrandAssetSet`（最终品牌资产对）**：

| 属性 | 取值/规则 |
|------|-----------|
| 成员 | `LogoMark` + `FaviconMark`，两份文件位于 `public/` |
| 同源性 | 同三色路径、同色值、同轮廓处理；favicon 为选定候选的简化派生 |
| 原子替换 | 两者 MUST 在同一次变更中更新；不得出现任一旧版残留 |
| 引用 | 经 `site.json` 的 `logo` / `favicon` 字段引用（路径不变） |
| 构建期校验 | `content.config.ts` 的 `validateSiteBrand()` 校验路径合法性与文件存在性；缺失即构建中断 |
| 旧资产/旧引用 | 仓库内 MUST NOT 残留旧图标文件或旧引用；旧版仅可经 `git show HEAD:...` 取用做比对 |

**`SiteBrandReference`（既有引用，全部零改动）**：

| 引用点 | 现状取值/行为 | 本特性 |
|--------|--------------|--------|
| `src/data/site.json` `logo` | `"/logo.svg"` | 不变 |
| `src/data/site.json` `favicon` | `"/favicon.svg"` | 不变 |
| `site.json` 其他字段 | 命名字段等 | 不变 |
| `Navbar.astro` | `<img class="brand-logo" src={withBase(site.logo)} alt="" width={32} height={32} />`；CSS `height:1.2em; width:auto` | **仅** `width={40} height={30}`（4:3 回退比例，三版候选均 4:3）；其余不变 |
| `BaseLayout.astro` | `<link rel="icon" type="image/svg+xml" href={withBase(site.favicon)} />` | 不变 |
| `content.config.ts` | `validateSiteBrand()` 存在性/路径校验 | 不变（负向用例复核） |
| `global.css` / 页面 / 数据 | — | 不变 |

## 10. 关系图

```text
CandidateLogoMark ×3 (candidates/candidate-{a,b,c}.svg) ──呈现于──► LogoComparisonPage (candidates/comparison.html)
        │ 选定（维护者）+ SC-006 外部评审
        ▼
SelectionRecord (candidates/SELECTION.md) ──参数事实源──► 阶段二
        │ 被选定候选原样落位 / 简化派生
        ▼
SiteBrandReference (site.json: logo/favicon, Navbar, BaseLayout, content.config.ts)
        │ references (paths unchanged)
        ▼
BrandAssetSet ──1:1──► LogoMark (public/logo.svg)
        │                     ├── 3 AccentGlyph (lang, brain, pen)
        │                     ├── 3 colorZones + 1 spike
        │                     └── 4 BrandColor
        └──1:1──► FaviconMark (public/favicon.svg)   ← 选定候选的简化派生
```

## 11. 状态/生命周期

| 状态 | 进入条件 | 允许的下一步 |
|------|---------|-------------|
| 现状（旧资产） | 当前 `HEAD` 版本 | → CandidatesDrafted |
| CandidatesDrafted | 3 版候选 + 对比页产出；各候选过身份不变量清单与参数界限；对比页 4×4 档渲染正常 | → Selected（维护者选定） |
| Selected | 维护者从三版中选定一版并记录 SELECTION.md（身份不变量硬门槛，其余裁量） | → Reviewed（SC-006 评审） |
| Reviewed（SC-006 通过） | 未参与设计的实验室老师（≥1 名，维护者邀请）在同一无提示并排对照下作出"同一标识的现代化版本"与"更现代、未大改整体设计"两项判定（均须通过），记录 SELECTION.md | → Integrated |
| Integrated | favicon 派生；两份资产 + Navbar 属性同次替换；无旧引用残留；门禁 / 尺寸矩阵 / 视口回归 / 负向用例全过 | → 合并/推送；部署由 CI 承接（范围外） |
| （失败路径）无法选定 / SC-006 未通过 | 维护者无法从三版中选定任何候选；或实验室老师任一项判定未通过 | → 迭代候选：重新生成三版候选（仍须满足身份不变量与放宽口径）→ 重新进入对比评审与选定流程 → 仅对新选定版重跑 SC-006 |

**不变量**：任一时点两份最终资产 MUST 同源一致；不出现"logo 已换、favicon 仍旧"或反向的中间态；Integrated 之后仓库内不得存在旧图标文件或旧引用；`candidates/` 评审产物在任何时点都 MUST NOT 进入 `public/` / `src/`。

## 12. 校验规则 → 需求映射

| 规则 | 对应需求 | 判定方式 |
|------|---------|---------|
| 三版候选均过身份不变量清单（三色/方向/3 个白符号/尖角/轮廓/放宽口径） | FR-001、FR-009 | 候选文件逐项核对 + 对比页并排；C 的逐色 HSL 量测 ≤20% |
| 对比页：现状 + 三候选 × ≥64px / 22px / 16px 三档、自包含零 JS、不进站点 | FR-009、US1 AS6 | 浏览器打开核对 + 目录/构建产物检查 |
| 选定 → SC-006 → 通过后方可全站替换；favicon 选定后派生、与 logo 同次落位 | FR-009、SC-006、FR-004 | SELECTION.md 记录 + git 变更时序；选定依据 = 身份不变量硬门槛 + 维护者裁量；SC-006 = 实验室老师同一评审者两项判定均通过；favicon 验收仅按 SC-002 16px 口径（SC-006 不覆盖） |
| 统一符号系统：选定版笔画极差 0%、锚点偏差 ≤5%、安全边距 ≥6.4 | FR-002、SC-003 | SVG 坐标几何量测（按选定版参数） |
| 22px 干净、16px 三色可辨、64px 以上符号可辨、高 DPR 清晰 | FR-003、SC-002 | 光栅化尺寸矩阵目视 |
| favicon 同源简化、透明底、同次更新、无旧引用 | FR-004 | 资产比对 + `git grep` |
| 纯矢量自包含、画布贴合内容、仓库内引用、零依赖 | FR-005 | 文件检查 + `package.json` diff |
| 顶栏品牌区结构/行为/版式不变、按原始比例展示（回退 40×30） | FR-006 | 组件 diff + 视口矩阵 |
| 变更仅限资产与必要尺寸适配；评审产物不进站点 | FR-007 | `git diff --stat` + 目录检查 |
| 既有门禁 100% 通过、构建期资源校验仍生效、四档视口无破损 | FR-008、SC-004、SC-005 | `npm run check` / `build` + 负向用例 + 视口矩阵 |
| 盲评判为"同一标识的现代化版本"（仅选定版） | SC-006 | 未参与设计的实验室老师无提示并排判定：同一评审者作出两项判定（"同一标识的现代化版本" + "更现代、未大改整体设计"）且均通过（记录 SELECTION.md） |
