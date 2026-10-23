# Research: Team 页学生分组纵向展开、教师移除与成员链接标签

**Date**: 2026-10-23 | **Status**: Complete（无遗留 NEEDS CLARIFICATION——标签列宽已在真实浏览器实测，互斥校验、堆叠断点、数据落地与移除范围均在本文件定稿；技术栈沿用 001–006 现状）

本特性为展示层改动（模板 + scoped CSS）+ 数据内容更正与补齐 + 一条构建期数据约束。以下 R1–R9 记录每个设计决策及其取舍。

## R1: 学生分组纵向排列（FR-001～FR-005）

**调研结论（现状）**: `StudentGroup.astro` 的 `.student-groups` 为 `display: grid; grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr)); gap: 32px`。容器 1132px 时轨道 `(1132−32)/2 = 550px`，两个分组并排（真机实测 550px + 32px + 550px）；`min(320px,100%)` 保证 320px 档不横向溢出，但 ≥352px 后即进入两列。

**Decision**: 将 `grid-template-columns` 改为 `minmax(0, 1fr)`，保留 `display: grid` 与 `gap: 32px`。单列下两个分组的宽度均等于容器内容宽，左右边缘与内容区一致；纵向间距 32px 满足 FR-005（≥32px）。

**Rationale**: 一条声明即完成方向切换，`.student-group` 内部 `ul` / `li` 的既有排版与 24px 内距完全不动（FR-004）；`gap: 32px` 复用既有值，不引入新间距；空分组仍渲染 `.student-group` 并独占一行（FR-001 场景 4）。

**Alternatives considered**:

- 改为 `display: flex; flex-direction: column`：效果等价，但需要改动两行声明，收益为零，否决。
- 保留 grid 并在 ≥768px 强制 `grid-column: 1 / -1`：多一层覆写，且非目标视口仍可能并排，否决。

## R2: 王伟平移除范围与残留清理（FR-006～FR-010）

**调研结论（现状）**: `teachers.json` 共 5 条，王伟平为第 2 条（`photo: /teachers/wang-weiping.svg`；注入 id `tea-002` 由数组下标派生，删除后会指向下一位教师，**不可作为稳定身份标识**，文档一律以姓名指代）。首页 `index.astro` 与 Team 页 `team.astro` 均通过 `getCollection('teachers')` 读取同一数据源，并按注入 id 排序；删除该条后其余 4 人的相对顺序保持不变（林政 → 付鹏 → 吴大衍 → 谷井子）。全仓检索 `王伟平|wang-weiping|wangweiping`，除 `teachers.json` 外仅出现在 `specs/001-*` 历史规划文档中，站点模板与新闻内容无引用。

**Decision**:

1. 删除 `teachers.json` 中王伟平整条对象（含姓名、职称、研究方向、邮箱、主页、简介、照片字段）；
2. 删除 `public/teachers/wang-weiping.svg`（不再被任何数据引用，构建产物中 `/teachers/wang-weiping.svg` 不可访问）；
3. `src/data/README.md` 的「教师团队（5 位）」更新为「教师团队（4 位）」，并补充三选一链接约定（FR-021）；
4. 其余 4 位教师字段与顺序零改动；`TeacherCard.astro` 与教师渲染逻辑零改动；
5. `team.astro` 与 `index.astro` 的 `.teacher-grid` 在 ≥1280px 由 `repeat(3, …)` 改为 `repeat(2, …)`，使 4 张卡片呈 2×2；768–1279px 既有两列与 <768px 单列不变。

**Rationale**: 数据源删除即同时满足 Team 页 FR-006 与首页 FR-007，避免两处展示不一致；不残留指向 `https://people.ucas.edu.cn/~0012246` 的链接（FR-010）；删除照片防止静态资源 URL 直接访问残留个人信息（FR-020）；2×2 消除 3+1 的第二行单卡留白（FR-009 / SC-011）。

**Alternatives considered**:

- 在模板层按姓名过滤：违反宪法 II（内容与展示分离），且首页需重复过滤，否决。
- 仅删数据、保留照片：页面无破损，但照片仍可通过 URL 直接访问，与移除个人信息的目标不符，否决。
- 接受 3+1：第二行单卡左对齐、右侧留白明显，用户明确选择 2×2，否决。
- 改为四列：卡片过窄，需重新设计卡片内部布局，超出本期范围，否决。

## R3: 三选一链接字段的数据契约与构建期校验（FR-014）

**调研结论（现状）**: students / graduates schema 已有 `url` 与 `github`（均为 `httpsUrl`：`z.url()` + 必须 `https://`，optional/nullable），但**无互斥约束**——当前数据恰好每人至多一个，约束一旦上线即可固化该现状。`teachers.json` 的 photo 校验与 publications 的 date 校验已证明对象级 `superRefine` 能在构建期中断并给出可定位错误。**实测确认（2026-10-23）**：临时注入非法 `level`（枚举错误）与不存在的 `photo`（自定义 `superRefine` 错误）后执行 `npm run check`，两者均触发 content sync 并以退出码 1 中断，说明 `astro check` 会执行集合数据校验，`check` 与 `build` 是同一口径的双门禁。

**Decision**: 在 `content.config.ts` 中新增本地工具 `singleLinkRefiner(dataFile: string)`，对 students / graduates 的对象 schema 增加 `superRefine`：

- 按 `url` → `github` → `scholar` 顺序收集全部非空字段；`length ≥ 2` 时 `ctx.addIssue`，消息格式为
  `src/data/students.json 成员「<姓名>」同时填写了 <字段列表> —— 每人至多填写一个链接字段（url / github / scholar 三选一）`，字段列表按固定顺序以「、」连接（如 `url、github、scholar`），**列出全部冲突字段**而非只列前两个；
- 同一条目三个字段皆空合法（不渲染标签）；
- 解析错误载体条目（`_jsonParseError`）在基础字段校验阶段已失败，refine 前以 `if (!entry.name) return;` 防御。

**Rationale**: 校验与数据同源，在 `npm run check` / `npm run build` / CI 三处自动生效（实测确认），配置错误在发布前暴露（FR-014 / SC-008）；消息包含文件、姓名与全部冲突字段，维护者无需查代码即可定位。使用局部函数而非新模块，符合 YAGNI。

**Alternatives considered**:

- 模板层按优先级只渲染一个：会静默忽略冲突字段，违反 FR-014 的「构建失败」要求，否决。
- 独立校验脚本/CI 步骤：重复 schema 已有拦截路径，增加流水线环节，否决（与 003 R11 同口径）。

## R4: 标签列宽与最长标签实测（FR-018 / FR-019）

**调研结论（真实浏览器实测，18px 正文字号；基准环境 Chrome 最新稳定版 + 站点默认系统字体栈）**:

| 标签文案 | 实测文本宽度 |
|----------|--------------|
| `Homepage ↗` | **106.11px** |
| `GitHub ↗` | 74.48px |
| `Scholar ↗` | 76.50px |

既有毕业生链接列为 `6.5em = 117px`，对最长的 Homepage 留出约 10.2% 余量，足以覆盖新增的 Scholar（76.50px，余量约 35%）。

**Decision**: 两种名单的标签列统一沿用既有 **`6.5em = 117px`**，不新增标签列宽；两类名单的姓名列统一 **5em**（毕业生五列首列由 4.5em 调整为 5em，去向列相应收窄 0.5em）；标签在标签列内居中对齐，文案完整显示、不换行、不截断。验收基准固定为 Chrome 最新稳定版 + 系统字体栈，并在 Windows/macOS 各复测一次；若复测仍出现换行，按实测宽度 +10% 上调列宽。

**Rationale**: 可见文案采用 `Scholar` 而非 `Google Scholar` 后，最长标签回到 Homepage，既有 6.5em 已满足 FR-018，无需加宽；A1 决策将毕业生姓名列由 4.5em 增至 5em，去向列仅收窄 9px（远小于 8.5em 方案的 36px），长去向在列内换行仍属既有允许行为；两类名单的标签均在 6.5em 列内居中，中心线对齐（FR-019）。

**Alternatives considered**:

- `Google Scholar` + `8.5em`：会窄化去向列 36px，维护者选择缩短文案，否决。
- `8em = 144px`：无必要，且同样窄化去向列，否决。
- `auto` / `max-content`：列宽随行内容变化，破坏列内居中对齐（FR-019），否决。

## R5: 在读学生行的标签布局与窄屏堆叠（FR-004 / FR-013 / FR-018 / FR-019）

**调研结论（现状）**: 学生 `li` 为 `display:flex; flex-wrap:wrap; gap:4px 10px; align-items:baseline`，DOM 顺序为「姓名（有 `url` 时为链接）→ 可选 GitHub 标签 → 年级（`margin-left:auto` 推右）→ 备注」。姓名宽度随字数变化，标签起点不固定，不满足列内对齐。

**Decision**:

- 姓名渲染为纯文本 `span.student-name`（FR-013），固定轨道 `flex: 0 0 5em`（90px，按成员姓名最多 4 个汉字设计；现有成员均为 3 字）；
- 唯一标签渲染为 `a.member-link`（`target="_blank" rel="noopener"`，`↗` 带 `aria-hidden`），固定轨道 `flex: 0 0 6.5em`（与既有毕业生链接列同宽），`text-align: center` 使标签在列内居中（≥480px）；
- `grade` 的 `margin-left:auto` 保留，年级/备注仍靠右；`align-items: baseline` 与 24px 内距不变；
- 视口宽度 <480px（`max-width: 479.98px`，与 `global.css` 的 480px 媒体查询同值，判据为视口宽度）：姓名恢复自适应宽度，标签 `order: 9; flex: 0 0 100%` 独占一行、左对齐；行序为「姓名与年级同行 → 备注自然换行 → 标签恒为最后一行」；DOM 顺序不变，仅标签在视觉上后置（标签是行内唯一可聚焦元素，不影响键盘顺序）。

**Rationale**: 固定姓名列 + 固定标签列 + 列内居中使所有行的标签中心线落在同一竖直线（FR-019），且不改变姓名居左 / 年级靠右的既有语义（FR-004）。姓名以 4 个汉字为上限时 5em 足够；480px 以上内容区宽度（≥400px）可容纳 `90 + 10 + 117 + 10 + 年级(≈100) = 327px`，保持单行；479.98px 以下切换为堆叠，避免 320–375px 时年级或标签被挤压换行。

**Alternatives considered**:

- 姓名不做固定宽度、仅给标签固定宽度：标签中心随姓名宽度漂移，列内不对齐，否决。
- 全视口统一堆叠：576–767px 本可单行，平白增加行高，违反最小变更，否决。
- 用 grid 两行布局替代 `order`：需新增 meta wrapper 或处理年级/备注同行冲突，复杂度高于一条媒体查询，否决。

## R6: 毕业生行的标签扩展（FR-012 / FR-018 / FR-019）

**调研结论（现状）**: `team.astro` 毕业生 `li` 为 `grid-template-columns: 4.5em 4em 3em minmax(0,1fr) 6.5em`，`.grad-links` 内按 `url` / `github` 渲染两个标签，`is-empty` 仅检查这两个字段；`<768px` 为 flex 三段式，标签行左对齐。

**Decision**:

- `.grad-links` 新增 `scholar` 分支（`Scholar ↗`），与 `url` / `github` 同一 `.grad-links a` 样式（`--blue-deep`，hover `--blue`）；
- `is-empty` 条件改为 `!url && !github && !scholar`；
- 链接列宽保持 `6.5em` 不变（R4：最长标签仍是 Homepage 106.11px），标签在列内居中；
- 五列首列由 `4.5em` 调整为 `5em`（A1 决策：两类名单姓名列统一），去向列相应收窄 `0.5em`；38px 列距、24px 内距、`<768px` 三段式均不变。

**Rationale**: 互斥约束保证每个条目最多渲染一个 `<a>`，`.grad-links` 的 flex 居中规则无需改动；标签列宽不变、去向列仅收窄 9px，回归面可控。当前 14 条毕业生中 3 条有 Homepage、0 条有 Scholar（三选一约束下不会并存）。

**Alternatives considered**:

- 为 Scholar 单独加类名/配色：spec 要求「沿用既有标签的 ↗ 箭头与配色」，无需区分，否决。
- 标签文案用 `Google Scholar` 并把列宽增至 8.5em：会收窄去向列 36px，维护者选择缩短文案，否决。

## R7: 验收与回归方式（Constitution VI）

**Decision**: 沿用 001–006 口径——`npm run check` + `npm run build` 为机器门禁；布局验收在真实浏览器按 [quickstart.md](./quickstart.md) 的十档视口（1920 / 1280 / 1024 / 768 / 767 / 576 / 481 / 480 / 375 / 320px）核对 `/team/` 与 `/`，并用 `getBoundingClientRect()` 量测：

1. 两个 `.student-group` 的左/右边缘与内容区差值 ≤1px，纵向位置不重叠（不并排）；
2. 学生标签在 6.5em 列内居中（≥480px）、毕业生标签在 6.5em 列内居中（≥768px），中心线跨行极差 ≤1px；堆叠态左对齐；
3. 任一元素 `right ≤ documentElement.clientWidth`，页面无横向滚动；
4. 负向构建用例：同一成员两个链接字段 → 构建失败并含文件/姓名/字段；还原后通过。

**Rationale**: 判定含坐标量测项，Playwright 等框架的引入与维护成本高于收益（Constitution V）；回归面明确：教师卡片共享组件波及首页，已单独核对 4 张卡片与无王伟平残留。

**Alternatives considered**: 视觉回归框架、axe 自动化等，对 4 人静态站点属过度工程，否决。

## R8: 宪法合规与数据改动边界

**Decision**: 数据改动仅限：`teachers.json` 删除 1 条、`students.json` 新增 1 条并补 3 个链接字段与删除刘曦雨 `grade`、`content.config.ts` 新增 `scholar` 字段与互斥 refine；其余数据文件与 schema 字段零改动。展示层仅改三个既有文件（含两处 `.teacher-grid` 列数），删除 1 个静态资源。零新依赖、零新 JS、构建/部署流程不变。交付按 Constitution 维护工作流：模板/样式变更经 PR 合入，部署后复核线上渲染（T023/T024）。

**Rationale**: 与 I（内容准确性：地址均有用户确认来源；无法核实的刘曦雨年级已删除而非推测展示）、II（内容与展示分离：内容变更全部在数据文件）、III（构建门禁）、IV（简洁学术化、零依赖）、V（最小复杂度）一致；互斥校验强化 III「不合入构建失败的变更」。

## R9: 数据落地细节与展示顺序

**Decision**:

- **顾佴彬**：`url` 由 `null` 改为 `https://gccnlp.github.io/`（Homepage 标签）。
- **李雨晴**：新增对象 `{ name, level: "phd", grade: "2022", url: "https://qdcassie-li.github.io/", note: null }`，插入位置为顾佴彬之后、刘正宵之前；`StudentGroup` 的同级排序为稳定排序，`grade` 相同（2022）时保持数据文件顺序，因此显示顺序为杨晨旭 → 顾佴彬 → 李雨晴（同年级顺序仅作稳定展示，不构成永久验收约束）。
- **刘曦雨**：新增 `scholar: "https://scholar.google.com/citations?user=94lNc6oAAAAJ&hl=zh-CN"`；删除其无法核实的 `grade: "2022"`（FR-022），页面不显示 Since，条目归入名单末尾的无年级分组（数据顺序为李江楠 → 刘曦雨 → 刘正宵）；待课题组核实后另开变更补回年级。
- **杨晨旭**：`url` 保持 `https://iie-ycx.github.io/` 不变，展示形态由姓名链接变为 Homepage 标签。
- **毕业生**：本期不新增 `scholar` 数据，`graduates.json` 零改动；三选一约束对既有 3 条 Homepage 与 11 条无链接记录全部成立。`scholar` 渲染路径用临时 fixture（佀庆一临时改为 scholar）验证后还原。

**Rationale**: 所有取值逐字来自 spec 的扩展输入与 Assumptions；同年级排序依赖 V8 稳定排序与既有 `localeCompare` 比较器，无需新增排序逻辑；`note: null` 沿用既有数据形态。

**Alternatives considered**: 把李雨晴插到数组末尾——会排在年级为 `null` 的刘正宵之后，与「Since 2022」同组展示不符，否决。
