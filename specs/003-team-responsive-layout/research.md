# Research: Team 页多分辨率响应式布局

**Date**: 2026-10-15（refresh，同步 spec 2026-10-15 批量澄清 CHK008–CHK040 及其追问） | **Status**: Complete（无遗留 NEEDS CLARIFICATION——分档口径、三段式精确定义、24px 内距、数据合并策略、构建期照片校验均已在 spec 澄清中定稿；技术栈沿用 001/002 现状）

本特性为表现层改动（模板 + scoped CSS）+ 一项数据内容合并（FR-011）+ 一条构建期校验（FR-016），无技术栈未知项。以下 R1–R11 记录每个设计决策及其取舍；断点具体数值以 spec FR-001 为唯一规范源，本文件仅在需要时引用。

## R1: 分档实现方式——显式媒体查询 vs 流式自适应

**调研结论（现状）**: `src/pages/team.astro` 的 `.teacher-grid` 现用 `repeat(auto-fill, minmax(min(420px, 100%), 1fr))`。在容器 1180px（内容区 1132px）下，每轨道 (1132−32)/3 ≈ 366.7px < 420px → 只能容纳 **2 列**，与 FR-002「≥1280px 每行 3 张」不符；且结果随容器宽度连续变化、不受控。

**Decision**: 弃用 `auto-fill` 启发式，改为**显式媒体查询**按档固定列数（`repeat(3, minmax(0,1fr))` → `≤1279.98px` 2 列 → `≤767.98px` 1 列）。

**Rationale**: FR-002 的分档是**硬性取值**（3 / 2 / 1 / 1），显式断点与之一一对应、可确定性验收；`auto-fill` 的连续自适应会在档位边界产生与 spec 不符的列数（例如 1040–1279px 区间会出现 3 列）。媒体查询是零成本声明，符合 Constitution V。亚像素边界（`.98px` 后缀）属实现层习惯（与 002 既有 `767.98px` 一致），其行为交由 CSS 媒体查询固有机制处理，不作需求定义（CHK023）。

**Alternatives considered**:

- 微调 `auto-fill` 的 `minmax` 最小列宽（如 360px）凑出 3 列：列数仍随宽度连续变化，边界档（如 768px）宽度余量极小，脆弱且难验收，否决。
- 用 `@container` 查询：需容器上下文声明，收益与媒体查询等价，增加心智成本，否决。

## R2: 教师网格列数（team.astro + index.astro）

**调研结论（现状）**: 主页 `src/pages/index.astro` 的 `.teacher-grid` 用 `repeat(auto-fill, minmax(320px, 1fr))`。实测该式在视口 ≈1040px 起即出现 **3 列**，在 1040–1279px 区间与 FR-002「<1280px 每行 2 张」冲突；且与 Team 页（2 列）两页不一致。

**Decision**: Team 页与主页的 `.teacher-grid` 统一改为同一组显式断点（3 / 2 / 1）。主页改动依据 US3 验收场景 2（"卡片同样遵循 US1 的分栏与头部排布"，FR-012）；主页卡片**内容**（字段与数据）可与 Team 页不同，布局行为 MUST 与 Team 页一致——分栏数量、按档头部排布、标签收纳三者一致（CHK034——`TeacherCard` 为共享组件，头部行为随组件自动一致）。

**Rationale**: 两页网格规则一致，消除跨页分栏差异；同时修复主页在 1040–1279px 区间的 3 列越档行为。该改动仅替换一条 `grid-template-columns` 声明，风险极低。

**Alternatives considered**:

- 仅改 Team 页、主页维持 `auto-fill`：主页将被 US3 AS2 判为不遵循 US1 分栏，且两页观感不一致，否决。
- 把主页网格抽成公共组件/工具类：仅两处声明，抽象成本高于收益，违反 YAGNI，否决。

## R3: 教师卡片头部按档排布（TeacherCard.astro）

**调研结论（现状）**: `TeacherCard.astro` 的 `.teacher-head` 基础为 `display:flex; gap:20px; align-items:flex-start`（照片在左、`.teacher-identity` 在右），但存在 `@media (max-width: 640px) { .teacher-head { flex-direction: column } }`——在 576–640px 区间即触发纵向堆叠，与 FR-003「≥576px 保持横向排布」冲突。

**Decision**:

- 移除 `≤640px` 的头部纵向堆叠覆写；改为**仅在 `<576px`**（`max-width: 575.98px`）生效的规则：
  - `.teacher-head { flex-direction: column; align-items: center }`——照片**水平居中**置于卡片内容区上方（CHK008 居中口径）；
  - `.teacher-identity` 改为 `display: grid; grid-template-columns: 1fr auto; align-items: baseline; width: 100%`——姓名（`h3`）落第 1 列（1fr，居左）、职称（`.teacher-title`）落第 2 列（auto，`text-align:right`，右对齐），二者同行；
  - `.teacher-directions` 以 `grid-column: 1 / -1` 落姓名/职称行的下一行、**占卡片内容整宽**（标签区域最大宽度 = 卡片内容区宽度，CHK009/CHK038）、左对齐。
- `≥576px`（含 576–640px）保持基础横向排布不变。

**Rationale**: 用 Grid 两列（`1fr auto`）表达「姓名居左、职称右对齐」比 Flex（需 `margin-left:auto` 等配合）更直接、不依赖内容宽度；`grid-column: 1 / -1` 让方向标签稳定落到姓名/职称行下方并占满内容整宽（FR-003）。移除 640px 覆写使窄档（576–<768）恢复横向排布，同时避免新增断点。

**Alternatives considered**:

- 保留 `≤640px` 堆叠、仅缩到 `575.98px`：576–640px 仍违反 FR-003，否决。
- 用 Flex + `flex-basis:100%` 让方向标签换行到下一行：与 Grid 方案效果等价，但同级子元素宽度分配语义较弱、对长职称更易抖动，否决。

## R4: 研究方向标签收纳（FR-004）

**调研结论（现状）**: `.teacher-directions` 为 `display:flex; flex-wrap:wrap; gap:6px`，每个 `li` 是一个标签。`flex-wrap` 已保证**整标签为单位换行**；但 flex item 默认 `min-width:auto`，当**单个标签自身宽度**超过可用行宽时不会收缩，会溢出容器（`body overflow-x:hidden` 会将其裁切）。

**Decision**: 对 `.teacher-directions li` 增加 `max-width: 100%` 与 `overflow-wrap: break-word`。整标签仍由 `flex-wrap` 优先换行；仅当单个标签宽度超过行宽时，由 `overflow-wrap` 在该标签内换行收纳。

**Rationale**: 两条声明分别对应 FR-004 的两级规则，改动最小；不引入 `white-space: nowrap`（002 已移除），不改变标签视觉（仍为 `--sky` 圆角小标签）。`max-width:100%` 将单个标签上限锁定为行宽，是「单标签内换行」能生效的必要前提。

**Alternatives considered**:

- `word-break: break-all`：会连英文单词中间也强行断开，长英文方向名观感差，`overflow-wrap: break-word` 更克制。
- 网格化方向标签（固定列）：牺牲标签自适应宽度，且换行收纳规则更难满足，否决。

## R5: Graduates 窄屏三段式（<768px，FR-006 / CHK010 / FR-008）

**调研结论（现状）**: `src/pages/team.astro` 在 `@media (max-width:767.98px)` 里把 `li` 与全部 `> span` 设为 `display:block`，即**五字段各占一行**（姓名 / 学位 / 年份 / 去向 / 链接），与 FR-006 要求的三段式不符；且既有窄屏链接行右对齐（`justify-content:flex-end`）被 2026-10-15 澄清明确**取代**（第三行改左对齐）。

**Decision**: 保持现有 markup（`li` 内五个直接子 `span`：`.grad-name` / `.grad-degree` / `.grad-year` / `.grad-dest` / `.grad-links`）**不变**，仅在 `<768px` 媒体查询内将 `li` 改为 **flex-wrap 三段式**：

- `li { display: flex; flex-wrap: wrap; align-items: baseline; column-gap: <一个词空格宽度≈0.25em>; row-gap: 0 }`；
- `.grad-degree { margin-left: auto }`——学位被推向行右端；
- `.grad-year` 紧随学位其后（间隔即 column-gap）：flex item 默认 shrink-to-fit → **年份容器宽度与年份数字等宽、右对齐贴行右缘**（CHK010）；
- `.grad-dest { flex: 0 0 100% }`——去向独占第 2 行，左对齐（默认）；
- `.grad-links { flex: 0 0 100%; justify-content: flex-start }`——链接独占第 3 行，**左对齐**（覆盖既有 `flex-end`）；
- 既有 `.is-empty { display: none }` 规则保留（见 R6）。

第 1 行效果：`[姓名 ·(auto margin 吸收剩余宽度)· 学位 ←一个空格→ 年份|行右缘]`——学位文字右对齐（其盒宽即文字宽，右缘距年份一个空格），满足 CHK010「年份置于最右侧、学位在年份左侧且文字右对齐」。

**Rationale**: 纯 CSS 实现、**零 markup 改动**——同一份 markup 供 ≥768px 五列 Grid 与 <768px flex 三段式两档共用。flex 的 `margin-left:auto` 精确表达「姓名与右组之间弹性、学位与年份之间固定一个空格」的双间隙语义——Grid 的 column-gap 是全列统一的，无法表达「姓名|学位弹性 + 学位|年份一个空格」，故弃用前一版的三列 Grid 方案。年份盒宽 = 数字宽由 flex item 默认 shrink-to-fit 天然保证，无需声明。

**Alternatives considered**:

- 三列 Grid `1fr auto auto`（前一版方案）：column-gap 全列统一，「学位|年份一个空格」与「姓名|学位弹性」无法同式表达；若 column-gap 设一个空格则姓名与学位也仅隔一个空格，违反第 1 行「右侧组贴行右缘」的整体右对齐，否决。
- 新增 `.grad-meta` 包装 span 包住学位+年份、在 `≥768px` 用 `display:contents` 还原五列：需改 markup 且 `display:contents` 对既有 grid 语义有隐性耦合，风险高于纯 CSS 方案，否决。

## R6: 缺失字段处理（FR-008）

**Decision**: 沿用既有 `is-empty` 类——`.grad-year` 在 `year` 为空时带 `is-empty`，`.grad-links` 在 `url` 与 `github` 均为空时带 `is-empty`；`<768px` 媒体查询内继续使用 `.graduate-list li > .is-empty { display: none }`（两 span 仍为 `li` 直接子元素，选择器有效）。

- `year` 为空：`.grad-year` 不渲染 → `.grad-degree` 的 `margin-left:auto` 仍将其单独推向行右缘（右对齐），不渲染占位文本或分隔符（AS2）。
- 无任何链接：`.grad-links` 不渲染 → 第 3 行无内容、行高塌缩，无空行残留（AS3）。
- FR-011 新增的 9 条匿名条目 `year=null` 且无链接 → 窄屏下第一行右侧仅有学位、且无第三行，全部由该机制自然覆盖。

**Rationale**: 与既有 002 机制一致，仅把「逐行堆叠」替换为「flex 三段式」；缺失字段靠 flex 换行的行塌缩而非占位元素，天然满足「无多余分隔符/空行」。`destination` 为 schema 必填（`min(1)`），去向行恒存在。

## R7: 毕业生姓名与在读学生姓名的列对齐 + 24px 内距（FR-007 / CHK035）

**调研结论（现状）**: 在读学生条目 `StudentGroup.astro` 的 `li` 左右内边距为 `44px`（`padding: 8px 44px`）；毕业生条目 `team.astro` 的 `li` 左右内边距为 `44px`（`padding: 10px 44px`）。二者均为容器内容区左缘起算，姓名左边缘当前已同线。

**Decision**（2026-10-15 CHK035 裁定，修订前一版「保留 44px」方案）: 两个列表条目的左右内边距**统一收窄至 24px**（左右对称）——毕业生 `li` 改 `padding: 10px 24px`、在读学生 `li` 改 `padding: 8px 24px`，两处 MUST 一起修改。列对齐机制不变：同一容器内容左缘 + 相同固定 24px 内收 → 两姓名左边缘落在同一竖直线。验收测量：DevTools 读取两姓名 `getBoundingClientRect().left`，差值 ≤ 1px（SC-004）。

**Rationale**: 收窄内距释放列表有效宽度（去向列、姓名列均受益），24px 为 spec 裁定值；对称收窄维持「姓名距表格左缘＝标签/字段距表格右缘」的既有对称口径。`StudentGroup.astro` 由此从「零改动基准」变为改动文件（仅一处 padding 声明），其余两端分布（姓名居左、Since/备注推右）机制不受影响。

**验收要点**: 在 <768px 档（576 / 375px）坐标测量比对；同时目测 ≥768px 档两列表的内距一致收窄、无回归。

**Alternatives considered**:

- 仅收窄毕业生列表：违反 FR-007「同一固定值」的列对齐前提（两处内距不同则姓名左缘不同线），否决。
- 用 CSS 变量共享 24px 值：两文件各自 scoped CSS，抽变量需新建公共层，违反 YAGNI，否决。

## R8: 布局验收与回归方式

**Decision**: 沿用 001/002 口径——`npm run check` + `npm run build` 作为机器门禁；布局验收用浏览器 DevTools 响应式模式按 quickstart.md 视口矩阵手动核对，并 `npm run preview` 复核构建产物；不引入 e2e / 视觉回归框架。验收档位按 FR-001：**≥1280 / 1024 / 768 / 576 / 375px 五个基础档 + 1279 / 767 / 575px 三个边界切换验证点**（CHK021，紧下方核对档位切换），并向更窄覆盖至 320px；320px 以下不作要求（CHK022）。

**Rationale**: 纯 CSS 排版改动，判定含目测对齐项与坐标测量项（SC-004 用 `getBoundingClientRect()`），自动化收益低于工具引入与维护成本（Constitution V）。回归面明确且小：共享组件 `TeacherCard.astro` 波及主页 Team 概览区块（FR-012），主页网格声明一并核对。

**Alternatives considered**:

- Playwright 视觉回归：对 5 人课题组静态主页属过度工程，否决。

## R9: 宪法合规（数据改动范围 / 零新依赖）

**Decision**: 本特性的数据改动**仅限** `graduates.json` 内容（FR-011，以《2026年招生介绍-G3.pptx》为权威源合并，属 Constitution I 要求的「与权威来源一致」）；其余数据文件与全部 schema 字段定义零改动（FR-015）；`content.config.ts` 仅新增 teachers `photo` 的存在性校验（FR-016，spec 授权的显式例外，字段定义不变）；其余改动为 `.astro` 模板 + scoped CSS；零新依赖、零新 JS。

**Rationale**: 与 Constitution I（内容准确性：数据与权威源一致，不凭推测填写）一致；与 II（内容与展示分离：毕业生名单这类常规内容更新只落数据文件，本特性之后维护者续补真名/年份/链接也只改 `graduates.json`）一致；与 IV（简洁学术化、零运行时依赖）、V（最小复杂度）一致；构建/部署流程零改动，`check` + `build` 照常通过（FR-014），FR-016 的校验反而使破图数据在构建期被拦截，强化 III（不合入导致构建失败的变更）。

**Alternatives considered**:

- 为对齐在模板层引入运行时计算或新字段：无必要，且违反 FR-015，否决。
- 把照片校验做成独立 CI 步骤/预构建脚本：重复实现 schema 校验已有的拦截路径，新增流水线环节，违反 V，否决（见 R11）。

## R10: 毕业生数据合并（FR-011 / CHK036/CHK037）

**调研结论（权威源）**: 《2026年招生介绍-G3.pptx》第 7 页「G3 组学生就业情况」表共 **14 行**（年级 / 姓名 / 类型 / 本科学校 / 毕业去向），已逐字提取核对（见 [data-model.md](./data-model.md) 的目标状态表）。既有 `graduates.json` 5 条中 5 条与该表重叠（佀/杨/谭/温/刘），表中另有 9 条未收录。

**Decision**:

- **重叠 5 条**：仅更新 `destination` 为 PPTX 毕业去向列取值（佀庆一 →「华为天才少年 → 京东大模型」、刘源鑫 →「北京大学 → 小米mimo」，其余三条值相同）；`year` 与 `url` 保留 JSON 现值不动。
- **新增 9 条**：按 PPTX 行序追加——`name` 用 PPTX 原文（如「许同学」，真名待正式上线前补齐）、`degree` 类型映射（硕士→`master`、博士→`phd`）、`destination` 录入毕业去向列、`year` 置 `null`、`url`/`github` 键省略（沿用既有条目省键惯例，schema 为 optional/nullable）。
- **箭头规范化**：原文「->」规范化为「 → 」——箭头前后各补一个空格（如「北京大学->小米mimo」→「北京大学 → 小米mimo」），与 spec FR-011 正文示例的形制一致。
- **同名条目**：表中存在两条「刘同学」（2017 级博士 / 2019 级硕士，后者即刘源鑫的匿名行）与两条「王同学」（2021 / 2022 级硕士）——各自独立成条，不做去重合并；毕业生与在读学生条目内容重复的也不处理（CHK037）。
- **展示排序**：沿用 team.astro 既有排序（年份降序 → 无年份最后 → 同组 PhD 在 Master 前 → 数组序 tiebreak）——有年份 3 条居前（杨泽娴 2025 / 佀庆一 2024 / 刘源鑫 2021），9 条 `year=null` 的新条目按学位分组排后，无需新增排序逻辑。

**Rationale**: 逐条映射自权威源，满足 Constitution I（不凭推测填写——未获得的真名/年份/链接以 `null`/省键显式留空，待课题组提供后补齐）；`year=null` 与省键沿用既有数据形态（谭宇彤/温哲即此形态），模板的 `is-empty` 机制（R6）天然兼容。箭头形制依据 FR-011 正文示例「北京大学 → 小米mimo」（箭头前后各一个空格）定为「 → 」，即把原文「->」规范化为带空格的箭头。

**Alternatives considered**:

- 同名条目合并或加注区分：spec 未要求，且无从获得区分信息，否决。
- 新增条目插入既有条目之间按毕业年份排序：新条目 `year=null`，插入位置无依据；按 PPTX 行序追加保持与权威源可逐行核对的对应关系（SC-008）。

## R11: 构建期照片存在性校验（FR-016）

**调研结论（现状）**: `content.config.ts` 的 gallery collection 已实现同型校验——`src` 字段 `superRefine` + `existsSync(GALLERY_ASSET_DIR + val)`，缺失即 schema 校验失败、构建报错并定位文件与字段。教师照片现行约定：`photo` 取 `/teachers/<文件名>`（如 `/teachers/lin-zheng.svg`），文件存放于 `public/teachers/`，经 `withBase()` 前缀化后输出；当前 5 位教师照片文件均存在。

**Decision**: 复用 gallery 模式，在 teachers schema 的 `photo` 字段上新增 `superRefine`：

- `photo` 为空（null/undefined/空串）→ 不校验（缺照片是合法状态，spec 边缘用例：无照片卡片头部正常排布）；
- `photo` 非空 → MUST 匹配 `/teachers/<文件名>` 形态（剩余部分不含 `/` 与 `..`，防路径穿越），且 `existsSync(public/teachers/<文件名>)`；任一不满足 → schema issue，报错信息定位数据文件、教师姓名与缺失路径，构建中断（SC-009 负向用例可复现）。

**Rationale**: 与 gallery 校验完全同型，维护者心智模型一致；校验随 `astro build`（及 CI）执行，破图数据无法合入发布分支（Constitution III）；字段定义（`string optional nullable`）不变，仅为 FR-015「仅模板与样式」限制的显式例外（FR-016 spec 已授权）。限定 `/teachers/` 前缀使校验与数据约定一致并天然防穿越，宽于现状（任意 public 路径）无必要。

**Alternatives considered**:

- 运行时兜底（`<img>` onerror 隐藏）：需新增 JS，违反 FR-013 零新 JS，且破图已上线后才兜底，不如构建期拦截，否决。
- 校验任意 `public/` 相对路径的通用存在性检查：路径穿越防护更复杂，且现有数据约定全部在 `/teachers/` 下，YAGNI，否决。
