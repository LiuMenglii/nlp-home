# 需求评审 Checklist: Team 页学生分组纵向展开、教师移除与成员链接标签

**Purpose**: 审查本特性的需求质量（完整性、清晰性、一致性、可度量性、覆盖率），不验证实现是否符合需求。
**Created**: 2026-10-23
**Feature**: [spec.md](../spec.md) · [plan.md](../plan.md) · [research.md](../research.md) · [data-model.md](../data-model.md) · [contracts/team-layout-member-links.md](../contracts/team-layout-member-links.md)
**Review focus**: 内容准确性、移除边界、链接标签无障碍、固定列宽的可度量性、断点与验收矩阵一致性

**Note**: 本清单由 `/speckit-checklist` 生成，前 10 项是需要维护者决策/评审的高优先级问题；其余为低优先级问题，已附修改方案，留待后续轮次由 agent 处理。
**Review Ownership**: 本清单归评审者所有。`[x]` 表示评审者已确认该需求质量条目得到满足，不代表实现已完成。
**Marker Semantics**: 所有条目初始为 `[ ]`；`/speckit-implement` 只读取勾选状态，不修改标记。

## 一、Top 10 决策/评审项（需维护者拍板）

- [x] CHK001 - 规格是否化解了「刘曦雨年级未核实」与「上线继续展示 Since 2022」之间的内容准确性冲突？[Conflict, Spec §Assumptions, Constitution §I]
  - 现状：Assumptions 明确写「用户表示不确定其年级」，但 `students.json` 仍为 `grade: "2022"`；宪法 I 要求不确定信息 MUST 先向课题组确认、不得凭推测上线。
  - 选项：A 合并前向课题组确认，确认后保留 2022；B 本期删除其 `grade`，页面不显示 Since；C 维持现状并标注待核实（违背宪法 I，不建议）。
  - 建议：A；若无法在合并前确认，选 B。

- [x] CHK002 - 「删除王老师介绍」的边界是否已确认：只影响 Team 页还是同时影响首页人员区块？删除整条记录还是仅隐藏展示？[Ambiguity, Spec §FR-006/FR-007/§Assumptions]
  - 现状：原始输入只提 Team 界面；FR-007 通过共享数据把首页也纳入，Assumptions 选择删除整条记录。若他仍在课题组，整站移除会与内容准确性冲突。
  - 选项：A Team 与首页均整条移除（现状）；B 仅 Team 页移除；C 全站保留记录但隐藏其主页链接。
  - 建议：确认 A 是否为真实意图。若选 B，需模板过滤，会违反宪法 II（内容与展示分离），需用户书面确认例外。

- [x] CHK003 - 规格是否要求删除 `public/teachers/wang-weiping.svg`，并禁止该照片 URL 继续公开可访问？[Clarity, Spec §Assumptions, plan §Summary, contract §5]
  - 现状：spec 只写「不再被引用的静态资源可一并清理」（可选），plan/contract 写 MUST 删除，SC 没有「文件不存在」的验收项。即使页面不引用，GitHub Pages 仍可通过 `/teachers/wang-weiping.svg` 直接访问照片。
  - 选项：A 必须删除并纳入 SC-002；B 保留文件但不引用；C 保留文件并做重定向。
  - 建议：A（若目标包含去除其个人信息）；否则至少明确 B 的风险。

- [x] CHK004 - 是否定义了链接标签的无障碍名称，使读屏用户能区分「哪位成员的 Homepage」？[Gap, Spec §FR-012/§FR-013]
  - 现状：姓名改为纯文本后，每个链接的可访问名都是 `Homepage` / `GitHub` / `Google Scholar`，脱离上下文无法辨识成员。
  - 选项：A 增加 `aria-label="<姓名> Homepage"`（可见文案不变）；B 在链接内加入视觉隐藏的姓名文本；C 不处理。
  - 建议：A，并在 SC-006/SC-007 增加可访问名断言（如 `link.accessibleName` 含成员姓名）。

- [x] CHK005 - 「标签列按最长标签实测宽度预留 8.5em」的验证基准是否足以保证跨字体、跨系统不换行？[Measurability, Spec §FR-018/§FR-019, research R4, Constitution §VI]
  - 现状：139.25px 未注明测量环境；Inter 未随站点加载（仅系统字体回退），Windows/macOS 字体度量不同，10% 余量可能不足；宪法 VI 将非预期换行列为破损。
  - 选项：A 固定验收浏览器/字体栈，并在 Windows、macOS 复测；B 列宽提升到 9em/10em；C 固定轨道 + `min-width: max-content` 组合。
  - 建议：A + B（复测后定值，至少 9em），并把基准字体/浏览器写入 quickstart。

- [x] CHK006 - 固定 5em 姓名列对「超过 4 个汉字」的姓名行为是否已定义？[Conflict, Spec §FR-019/§Edge Cases]
  - 现状：5em=90px 仅覆盖 4 个汉字+余量，现有姓名均为 3 字。flex item 默认 `min-width: auto`，长姓名会撑宽轨道并推右标签，导致「标签左边缘跨行对齐」失效；而 Edge Cases 又要求长姓名「正常折行收纳」，两者冲突。
  - 选项：A 允许姓名在 5em 列内折行（`min-width: 0` + `overflow-wrap`），接受两行姓名；B 姓名列自适应，放弃标签严格对齐；C 限制姓名长度并在数据层校验。
  - 建议：A，并在 SC 增加 5 字姓名的验收用例。

- [x] CHK007 - 学生堆叠态断点的边界值与依据是否唯一且无矛盾？[Conflict, Spec §FR-019, plan §Constraints, quickstart §5.5]
  - 现状：plan/contract/data-model 用 `<480px`（`max-width: 479.98px`），quickstart §5.5 却写「479/480px 起堆叠」；480px 恰是 `global.css` 的容器 padding 断点，且媒体查询基于视口而非内容区，称「容器断点」不准确。
  - 选项：A 480px 单行、479px 及以下堆叠（与 479.98 写法一致）；B 480px 及以下堆叠（`max-width: 480px`）；C 改用容器查询按内容区判定。
  - 建议：A，修正 quickstart，并在 spec 明确判据是「视口宽度」还是「内容区宽度」。

- [x] CHK008 - 验收视口矩阵是否唯一？SC 的 5 档与 plan/quickstart 的 10 档不一致。[Consistency, Spec §SC-001/§SC-004/§SC-010, quickstart §3]
  - 现状：SC 只列 320/375/768/1280/1920；quickstart 列 1920/1280/1024/768/767/576/481/480/375/320。
  - 选项：A 以 10 档为准并回写 SC；B 以 5 档为准并删减 quickstart；C 分「核心 5 档 + 断点补充 5 档」。
  - 建议：A（10 档覆盖断点边界，是宪法 VI 的判定集合）。

- [x] CHK009 - `url` / `github` / `scholar` 三选一是长期数据约束，还是仅本期展示规则？[Assumption, Spec §FR-014, data-model §1.2]
  - 现状：互斥由构建期 schema 强制，成员同时拥有个人主页与 Google Scholar 时无法同时收录；README 需长期告知维护者。
  - 选项：A 永久互斥（现状）；B 允许并存，展示按优先级只渲染一个；C 允许并存并渲染多个标签。
  - 建议：确认 A；若未来需要并存，改为 B，但这与本特性「至多一个标签」的验收口径冲突，需同步修改 FR-012/FR-014。

- [x] CHK010 - 移除一位教师后，宽屏 3+1 的教师卡片重排是否可作为最终形态接受？[Assumption, Spec §Edge Cases, plan §Summary]
  - 现状：≥1280px 三列网格，4 张卡形成 3+1；spec 明确视为可接受，但第二行单卡左对齐、右侧留白。
  - 选项：A 接受 3+1（现状）；B 改为 2×2；C 改为四列（卡片更窄，需重新验布局）。
  - 建议：A（若用户无异议），否则 B。

## 二、低优先级问题（附修改方案，后续轮次由 agent 处理）

- [x] CHK011 - 三方冲突（`url` + `github` + `scholar`）时，错误信息是否要求列出「全部」冲突字段？[Conflict, Spec §FR-014, contract §4, research R3]
  - 现状：FR/contract 要求全部字段，research R3 的消息模板只示例「url 与 github」。
  - 修改方案：FR-014 明确按 `url` → `github` → `scholar` 顺序动态列出全部非空字段；research R3 改为数组 `join('、')`；quickstart §6 增加三字段负向用例。

- [x] CHK012 - `npm run check` 是否真的执行内容集合数据校验？contract §4 与 plan 把它与 build 并列为门禁。[Assumption, plan §Testing, contract §4]
  - 现状：schema 校验通常在 `astro sync` / build 阶段触发，`astro check` 是否同步校验需实测。
  - 修改方案：用一次临时双字段数据实测 `npm run check` 是否失败；若不失败，把门禁口径改为仅 `npm run build`，并同步修改 SC-008 与 contract §4。

- [x] CHK013 - 数据维护指南的更新是否被规格要求覆盖？[Gap, Constitution §II, plan §Project Structure]
  - 现状：plan 要求更新 `src/data/README.md`（教师 5→4、`scholar` 字段与互斥约定），但 FR/SC 无对应条目，实施时可被遗漏。
  - 修改方案：新增 FR-020「数据维护指南 MUST 说明三选一与教师人数 4」；若不想扩大 FR，则加入任务验收的 Definition of Done 并在 tasks.md 显式列出。

- [x] CHK014 - 「全站无王伟平残留」的检查范围是否包含历史 spec 文档与静态资源 URL？[Ambiguity, Spec US2-5/§FR-010, quickstart §2]
  - 现状：US2 场景 5 说「全站任一页面」，FR-010 限定 Team 页与首页；历史 `specs/001-*` 等文档含其姓名，全仓 grep 必然命中。
  - 修改方案：统一为「渲染页面（`/` 与 `/team/`）的可见内容 + 构建产物 HTML」；明确历史 specs 文档不属于站点内容；SC-002 按此表述。

- [x] CHK015 - 李雨晴在同年级（2022）中的展示顺序是否属于需求？[Gap, Spec §FR-016, research R9]
  - 现状：data-model 依赖稳定排序得出「杨晨旭 → 刘曦雨 → 顾佴彬 → 李雨晴」，但 spec/SC 只要求「出现在 PhD Candidates」。
  - 修改方案：要么在 SC-009 写明组内顺序，要么明确「同年级顺序不作保证」，避免维护者依赖偶然顺序。

- [x] CHK016 - 毕业生 Google Scholar 渲染是否有正向验收用例？[Coverage, Spec §US3/§SC-007]
  - 现状：本期毕业生无 `scholar` 数据，该代码路径无正向验证；负向用例只证明构建会失败。
  - 修改方案：quickstart 增加临时 fixture：给佀庆一临时加 `scholar`（同时移除 `url`），验证标签后还原；或明确该路径延后到首位毕业生配置时验证。

- [x] CHK017 - 本期为 `graduates` 增加 `scholar` 字段但无任何数据，是否必要？[Assumption, data-model §1.3, Constitution §V]
  - 现状：字段与互斥校验先行，数据为零。
  - 修改方案：若确认「三选一对两类名单同时生效」，保留并在 README 说明；否则推迟到首位毕业生配置 `scholar` 时再加，减少本期 schema 面。

- [x] CHK018 - Google Scholar 链接保留 `&hl=zh-CN` 会强制中文界面，是否与全站英文 UI 一致？[Ambiguity, Spec §FR-017]
  - 现状：URL 逐字固定为 `...&hl=zh-CN`，SC 要求逐字一致。
  - 修改方案：向用户确认；若保留中文参数，保持不变；若改为跟随访问者语言，需同步修改 spec/contract/data-model/quickstart 中的四处 URL。

- [x] CHK019 - SC-007「全站 Google Scholar 标签数 = 1」是否会被未来数据变更误读为永久不变量？[Ambiguity, Spec §SC-007]
  - 修改方案：改为「本期验收时全站 Google Scholar 标签数为 1（仅刘曦雨）」，或改为「除刘曦雨外无其他成员显示 Scholar」。

- [x] CHK020 - `<480px` 堆叠态下存在 `note` 时，年级/备注/标签的行序未定义。[Gap, Spec §FR-019, research R5]
  - 现状：标签 `order: 9`，但 note 与 grade 的换行关系未写明。
  - 修改方案：明确「姓名与年级同行，备注随后自然换行，标签恒为最后一行」；quickstart 增加带 `note` 的 320/375px 用例。

- [x] CHK021 - 是否需把浏览器 200% 缩放与最小字号纳入验收？[Gap, Constitution §VI]
  - 现状：视口矩阵只看宽度，未覆盖文字放大；固定 5em/8.5em 在 em 下等比放大，但断点按视口不变，可能挤压单行内容。
  - 修改方案：quickstart 增加 1280px @200% 缩放与「浏览器最小字号 20px」抽查；若不纳入，在 Assumptions 明确排除。

- [x] CHK022 - 文档用 `tea-002` 指代王伟平，但 entry id 按数组下标注入，删除后该 id 会指向付鹏。[Clarity, research R2]
  - 修改方案：文档改用姓名指代，或注明 entry id 为位置派生、不可作为稳定身份标识。

- [x] CHK023 - 新增李雨晴、补链接、配置 Scholar 是否记录了知情同意依据？[Assumption, Constitution 内容与数据约束]
  - 现状：宪法规定「课题组提供收录名单即视为知情同意」，spec 未写明本次信息由课题组提供。
  - 修改方案：Assumptions 增加「上述成员信息由课题组维护者提供，按既定渠道视为知情同意」。

- [x] CHK024 - 链接列由 6.5em 增至 8.5em 使去向列收窄 36px，是否需在 768–1024px 复验长去向换行？[Coverage, research R4/R6]
  - 现状：quickstart 只检查标签列，未针对去向列收窄后的换行次数与溢出做回归。
  - 修改方案：quickstart 增加 768/1024px 长去向（如「华为天才少年 → 京东大模型」）不溢出、不截断检查；在 spec 明确「去向列内换行属既有允许行为」。

## 三、评审结论（2026-10-23）

| 条目 | 决策 / 处理 | 落点 |
|------|-------------|------|
| CHK001 | 维护者选 **B**：删除刘曦雨 `grade`，不显示 Since，待核实后另开变更 | FR-022、SC-012、Assumptions |
| CHK002 | 维护者选 **A**：Team 页与首页均整条移除（确认现状） | FR-006 / FR-007、Clarifications |
| CHK003 | 维护者选 **A**：必须删除 `wang-weiping.svg`，并纳入验收（构建产物 URL 不可访问） | FR-020、SC-002、US2-7、contract §5 |
| CHK004 | 维护者选 **C**：不提供无障碍名称，明确排除 `aria-label` / 视觉隐藏姓名 | Assumptions「无障碍范围」、contract §2 |
| CHK005 | 维护者选 **A**：固定验收基准为 Chrome 最新稳定版 + 系统字体栈，Windows/macOS 复测，仍换行则按实测 +10% | Assumptions「标签文案与列宽基准」、quickstart §5 |
| CHK006 | 约定姓名最多 4 个汉字，超长姓名作为后续例外单独处理；Edge Cases 中「姓名折行」表述已移除 | FR-019、Assumptions「姓名长度」 |
| CHK007 | 维护者选 **A**：视口 480px 单行、≤479.98px 堆叠；判据为视口宽度；quickstart §5.6 已修正 | FR-019、Assumptions「断点判据」、quickstart §5 |
| CHK008 | 维护者选 **A**：统一为十档矩阵，SC-001 / SC-004 / SC-010 已回写 | SC-001、SC-004、SC-010、quickstart §3 |
| CHK009 | 维护者选 **A**：三选一为长期数据约束，写入数据维护指南 | FR-014、FR-021、Assumptions |
| CHK010 | 维护者选 **B**：≥1280px 改为 2×2，不再接受 3+1 | FR-009、SC-011、US2-6、plan / research / data-model / contract / quickstart |
| CHK011 | 错误信息按 `url` → `github` → `scholar` 顺序列出全部冲突字段；quickstart 增三字段用例 | FR-014、contract §4、research R3、quickstart §6.3 |
| CHK012 | 已实测：`astro check` 触发 content sync 并执行 schema（含 `superRefine`），非法枚举与缺失照片均以退出码 1 中断 → `check` 与 `build` 双门禁成立 | plan §Testing、contract §4、quickstart §1 |
| CHK013 | 新增 FR-021，要求 `src/data/README.md` 说明三选一与教师人数 4 | FR-021 |
| CHK014 | 范围收紧为 `/` 与 `/team/` 渲染页面及构建产物 HTML；历史 `specs/` 不算站点内容 | FR-010、SC-002、Assumptions「验收范围」 |
| CHK015 | 同年级顺序不作保证，按数据文件顺序稳定展示 | Assumptions「同年级顺序」、research R9 |
| CHK016 | quickstart 增毕业生 `scholar` 正向 fixture（佀庆一临时改字段后还原） | quickstart §4.7 |
| CHK017 | 保留 graduates `scholar` 字段；维护者确认刘曦雨 Scholar 主页已有内容，两类名单共用三选一 | Assumptions「Google Scholar 数据范围」、FR-017 |
| CHK018 | 维护者要求逐字使用，保留 `&hl=zh-CN` | FR-017、Assumptions |
| CHK019 | 改为「本期验收口径」，明确不作为永久不变量 | SC-007、contract §2 |
| CHK020 | 明确堆叠态行序：姓名与年级同行 → 备注自然换行 → 标签最后一行 | FR-019、Edge Cases、quickstart §5.5 |
| CHK021 | 不纳入验收，Assumptions 明确排除 200% 缩放与最小字号 | Assumptions「支持视口」、quickstart §5.8 |
| CHK022 | 文档改用姓名指代，并注明注入 id 由数组下标派生、删除后会漂移 | research R2 |
| CHK023 | Assumptions 增「成员信息由课题组维护者提供，视为知情同意」 | Assumptions「知情同意」 |
| CHK024 | 维护者裁定：可见文案缩短为 `Scholar`，标签列保持既有 6.5em，去向列不收窄；长去向在列内换行仍属既有允许行为 | FR-018、FR-019、Assumptions「标签文案与列宽基准」、research R4/R6、quickstart §5 |
| 补充-1 | 刘曦雨删除 `grade` 后落到名单末尾的无年级分组，维护者确认接受 | Assumptions「刘曦雨年级」、Clarifications |

## Notes

- 24 / 24 项已评审确认（2026-10-23）：CHK001–CHK010 由维护者拍板，CHK011–CHK024 由 agent 按既有方案落入 spec / plan / research / data-model / contract / quickstart。
- 决策明细见「三、评审结论」；`tasks.md` 尚未生成，建议下一步 `/speckit-tasks`。
- 已核对事实：`王伟平` / `wang-weiping` 在 `src/` 中仅出现在 `teachers.json`；`publications.json` 与新闻无其引用；`Inter` 未随站点加载；`global.css` 中存在 `body { overflow-x: hidden }` 与 `@media (max-width: 480px)`（容器 padding），需按宪法 VI 的元素级检查口径验收。
- 勾选 `[x]` 仅表示需求质量条目经评审确认，不代表实现完成；`/speckit-implement` 不得修改勾选标记。
