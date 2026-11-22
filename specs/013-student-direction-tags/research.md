# Research: Team 页在读学生的研究方向标签（替换年级字段）

**Date**: 2026-11-22 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

本特性无 `NEEDS CLARIFICATION`（spec 已于 2026-11-22 澄清：多标签、`TBD` 占位、每人至多一个链接、链接优先级为自建主页 → 机构个人资料页 → GitHub → Scholar、需强关联证据、无证据留空）。Phase 0 研究聚焦五个问题：**如何彻底移除 `grade` 并让 `directions` 违约时给出可定位的构建错误**、**如何在不引入 JS 的前提下让标签组在姓名与链接之间换行收纳**、**删除年级排序后如何稳定保持数据文件顺序**、**如何核实并补全 31 名学生的成员链接**、**如何用可访问语义表达标签集合**。

## R1 数据字段替换与构建期校验

**Decision**:

1. `students.json` 每条记录以 `directions: string[]` 取代 `grade`；当前 31 条全部写 `["TBD"]`。`grade` 从数据文件、students schema、`StudentGroup.astro` 的排序/渲染/CSS 与 `src/data/README.md` 中删除。
2. students schema 改为：

```text
directions: z.array(z.string().min(1).refine(v => v.trim().length > 0)).min(1)
```

3. 在 `content.config.ts` 模块加载期新增 `validateStudentsData()`（与 `validateSiteBrand()` / `validateFeaturedNews()` 同一模式），直接读取 `src/data/students.json` 原始数组并逐条检查：
   - 顶层不是数组、JSON 不合法 → 抛出含文件路径的错误；
   - `directions` 缺失 / 不是数组 / 空数组 → 抛出含文件、学生姓名、`directions` 字段的错误；
   - `directions` 含非字符串、空字符串或仅空白项 → 抛出含文件、学生姓名、字段与项序号的错误。

   不新增 `grade` 残留检测（评审决定：避免过度防御）；`grade` 的删除由数据清理与 `src/` 检索保证。
4. schema 仍保留 `directions` 的数组/非空约束，用于 `astro check` 类型推导与渲染安全；模块级校验负责给出满足 FR-009 的「文件 + 姓名 + 字段」错误信息。

**Rationale**:

- 只靠 `z.array(...).min(1)` 时，`directions` 缺失/为空会在 schema 解析阶段失败，错误只带 entry id（`stu-001`）与字段路径，不能保证出现学生姓名，无法满足 FR-009 与 SC-004。
- 只靠模块级校验而放宽 schema，会丢失 `CollectionEntry<'students'>` 的 `string[]` 类型，模板需要额外断言；两者并用成本极低，且与仓库既有的 `validateSiteBrand` / `validateFeaturedNews` 模式一致。
- 不新增 `grade` 残留检测：`z.object` 会忽略未知键，额外读取原始 JSON 只为拦截已废弃字段属于过度防御；`grade` 的删除由数据清理与 `src/` 检索保证。
- 删除 `grade` 后，`StudentGroup.astro` 中按 `grade` 排序的分支与 `.grade` 样式一并删除，避免死代码与「字段已删但样式仍在」的残留。

**Alternatives considered**:

| 方案 | 否决原因 |
| --- | --- |
| 保留 `grade` 为可选字段，仅新增 `directions` | 违反 FR-001 / FR-011 的「彻底删除」，数据与文档仍会残留入学年份来源 |
| 只用 Zod schema 校验 `directions` | 错误信息无法稳定包含学生姓名，SC-004 的「文件、学生姓名与字段」不满足 |
| 只用模块级校验，schema 写成 `z.array(z.unknown())` | 丢失类型安全，模板无法直接 `.map((d) => ...)` 渲染字符串 |
| students 对象使用 `.strict()` | 可能拒绝 loader 注入字段，行为变化超出本特性范围 |
| 通过 `.passthrough()` + `superRefine` 检查 `grade` | 评审决定不新增 `grade` 残留检测；额外解析链路属于过度防御 |

## R2 行内布局：标签组在姓名与链接之间换行收纳

**Decision**:

- **≥480px（横向态）**：`li` 使用三轨 Grid：

```text
grid-template-columns: 3.5em minmax(0, 1fr) 6.5em
column-gap: 10px
姓名 .student-name    → grid-column: 1（列内居左）
标签组 .direction-tags → grid-column: 2（display: flex; flex-wrap: wrap; min-width: 0）
链接 .member-link     → grid-column: 3（justify-self: end; text-align: right; white-space: nowrap）
```

- **<480px（竖排态）**：保留 `li` 的 flex 换行；姓名 `flex: 0 0 auto`；标签组 `flex: 1 1 0; min-width: 0`，与姓名共享可用行并在组内换行；链接 `order: 9; flex: 0 0 100%; text-align: right`，独占最后一行。
- **标签组**：`display: flex; flex-wrap: wrap; gap: 4px 6px; align-items: center; min-width: 0`。
- **单个标签**：`max-width: 100%; overflow-wrap: anywhere; white-space: normal;`，文字完整可见，不裁剪、不省略。
- **视觉**：沿用 `TeacherCard` 的 chip  tokens——`background: var(--sky)`、`border-radius: 4px`、`padding: 2px 8px`、`font-size: 0.9rem`（14.4px）、`color: var(--ink-soft)`、`line-height: 1.4`。`line-height: 1.4` 使单标签高度约 24.2px，小于正文行高 29.7px，单标签不会额外撑高行；多标签换行时行高自然增长。

**行内容区与中间列宽度**（`W` = `li` 边框盒扣除左右各 24px 内距；中间列 = `W − 63 − 117 − 20`）：

| 视口 | 栏数 | `W` | 标签组列宽 | 说明 |
| --- | --- | --- | --- | --- |
| 1920 / 1440 / 1280px | 2 | 502px | 302px | 容器 1180px 封顶，三档 `W` 相同 |
| 1024px | 2 | 424px | 224px | — |
| **768px（最紧）** | 2 | **296px** | **96px** | 单标签 `TBD` 约 45px，可放下；多标签按 96px 列宽换行（1–2 个/行） |
| 767px | 1 | 671px | 471px | — |
| 576px | 1 | 480px | 280px | — |
| 481px | 1 | 385px | 185px | — |
| 480px | 1 | 400px | 200px | 横向态最窄档 |
| 375px | 1（竖排） | 295px | 约 231px | 标签组与 3 汉字姓名共享首行；`W − 54 − 10` |
| 320px | 1（竖排） | 240px | 约 176px | 最窄档；`TBD` 仍可一行放下 3 个以上标签后再换行 |

- 姓名列贴行内容左缘（`name.left − contentLeft ≈ 0`），链接列贴行内容右缘（`contentRight − linkText.right ≈ 0`），标签组落在两者之间，标签组与姓名、链接之间各保留 10px 列距。
- 无链接时第 3 列仍保留 6.5em（117px），但不渲染任何元素或占位；这样同一分组内有链接行与无链接行的姓名、标签组位置一致。标签组不向空链接列扩张，避免行间标签换行宽度不一致。
- 固定列宽把风险集中在「文字宽于列宽」：标签列可通过组内换行与单标签内部换行吸收任意长度；姓名列的超长姓名沿用既有 `overflow-wrap: break-word` 在列内换行（与 012 口径一致，不纳入本期换行形态验收）。

**Rationale**:

- 三轨 Grid 直接保证「姓名 → 标签组 → 链接」的视觉顺序、姓名贴左、链接贴右，且标签组获得确定的可用宽度；`minmax(0, 1fr)` 允许中间列在窄视口收缩到 0，避免把行撑宽。
- `flex-wrap` 在标签组内部换行；`max-width: 100%` + `overflow-wrap: anywhere` 处理单个超长标签，保证其在自己的列宽内折行，不越界、不截断。
- <480px 的 `flex: 1 1 0` 让标签组只占姓名之外的剩余宽度；链接 `order: 9` + `flex: 0 0 100%` 保证它永远单独占最后一行并右对齐，符合 FR-008。
- 不新增断点：480px 与 768px 沿用 010–012 的既有媒体查询；不新增 JS 或容器查询。

**Alternatives considered**:

| 方案 | 否决原因 |
| --- | --- |
| 保留原三列固定宽（`3.5em 5em 6.5em`），把标签塞进 5em 中间列 | 中间列仅 90px，多标签几乎每行一个，窄视口局促；标签长度变化时没有伸缩空间 |
| `flex` + `justify-content: space-between`，标签组 `flex: 1` | 无链接时剩余空间分配改变，标签组右缘与有链接行不一致；三轨 Grid 更直接 |
| 标签组在所有视口独占一整行 | 桌面端每条记录从 1 行变 2–3 行，破坏既有紧凑密度；规格只要求标签在姓名与链接之间 |
| 标签组 `overflow-x: auto` | 引入行内横向滚动，违反「标签组换行收纳」与页面无横向滚动的目标 |
| 绝对定位标签组 | 需要按视口/内容计算偏移，脆弱且需要 JS 或硬编码，违反 YAGNI |
| 标签使用 `text-overflow: ellipsis` / `line-clamp` | 规格明确禁止截断与省略，标签文本必须完整可见 |

## R3 分组与排序：删除年级排序，保持数据文件顺序

**Decision**: `StudentGroup.astro` 的 `byLevel` 改为：

```text
students
  .filter((s) => s.data.level === level)
  .sort((a, b) => a.id.localeCompare(b.id))
```

`file` loader 的 `jsonArrayParser` 按数组下标注入零填充 id（`stu-001`…`stu-031`），因此按 id 字典序排序等价于数据文件条目顺序。`ceil(n/2)` 切分继续作用在排序后的数组上；`is-single`、空分组占位、两栏断点全部不变。

**Rationale**:

- 直接依赖 `getCollection()` 的返回顺序虽然当前可行，但顺序属于 loader 实现细节；显式按 `stu-###` 排序使「文件顺序 = 展示顺序」成为可验证的不变量。
- 删除 `grade` 后不再存在「无年级排最后」的分支，代码与注释都能收敛。
- 当前数据文件本身按 level 分组且组内年份升序，删除年级排序后可见顺序与现状一致；未来维护者调整文件顺序时，页面按新顺序展示，符合 FR-004。

**Alternatives considered**:

| 方案 | 否决原因 |
| --- | --- |
| 继续按 `grade` 排序 | 字段被删除，逻辑无法保留；违反 FR-004 |
| 按姓名排序 | 规格未要求，且会改变既有名单顺序 |
| 依赖 `getCollection()` 默认顺序，不显式排序 | 顺序依赖 loader 实现；无法用 id 稳定验证 |
| 在数据文件里手工维护排序字段 | 引入冗余字段，违反最小复杂度与「删除年级字段」的目标 |

## R4 成员链接补全与强关联证据

**Decision**:

1. **范围**：全部 31 名在读学生，包括当前已有链接的 16 人与无链接的 15 人；现有链接全部重新核实，不只补空缺。
2. **优先级**：自建个人主页（含 GitHub Pages 学术主页）→ 机构个人资料页（如国科大 / 研究所个人页）→ GitHub → Google Scholar。每个学生只保留一个非空字段：
   - 自建主页 / 机构个人资料页 → `url`（页面标签 Homepage）；
   - GitHub 个人主页 → `github`（页面标签 GitHub）；
   - Google Scholar → `scholar`（页面标签 Scholar）。
3. **强关联证据**：写入前至少满足一项：
   - 页面或公开资料明确关联中科院信工所 / 国科大 / G3（CIGMA）/ 在读层次 / 导师；
   - 有与课题组成员合作的论文（作者列表、单位或致谢可核实）。
   仅姓名相同、同名机构模糊、无法确认身份的页面不写入。
4. **替换与留空**：找到更高优先级且可核实来源时，替换现有链接并删除低优先级字段；现有链接失效或不属于本人且无替代来源时移除，三个字段保持 `null`。无链接学生行不渲染链接标签。
5. **无链接学生**：不新增单独证据文件（评审决定）；无可靠来源时三个字段保持 `null`，无链接学生名单在完成报告中列出，供课题组人工补充。
6. **代码**：`linkOf` 的 `url → github → scholar` 取第一个非空字段逻辑不变；`url` 字段同时承载自建主页与机构个人资料页，页面标签统一为 Homepage。不新增字段、不改渲染。

**Rationale**:

- 现有链接中既有 GitHub Pages 个人站（放在 `url`）也有 GitHub 个人主页（放在 `github`），与优先级一致；但仍需逐条核实归属，避免历史链接指向同名陌生人。
- 规格明确「宁可留空，不凭同名猜测」；链接判断只在数据文件中落地，不新增证据文件，避免维护负担。
- 保持三字段结构不变，`singleLinkRefiner` 的三选一校验继续生效，不需要新的 schema 分支。

**Alternatives considered**:

| 方案 | 否决原因 |
| --- | --- |
| 只补 15 条空缺，不核实已有 16 条 | 违反 FR-018，历史链接可能失效或不属于本人 |
| 用姓名 + 学校关键词批量匹配后直接写入 | 同名/同名机构误判风险高，违反 FR-016 |
| 找不到主页时统一填 GitHub 搜索页或 Scholar 搜索页 | 不是本人页面，会把访客带到搜索结果，违反内容准确性 |
| 新增 `institution` 或 `homepageType` 字段 | 规格未要求，页面标签也不区分；增加维护复杂度 |
| 把 GitHub Pages 个人站记入 `github` | 违反「自建个人主页优先」的分类，且会与 GitHub 个人主页混淆 |

## R5 方向标签的可访问语义

**Decision**: 每行使用：

```html
<span class="direction-tags" role="list" aria-label="Research directions">
  <span class="direction-tag" role="listitem">TBD</span>
  ...
</span>
```

标签顺序严格等于 `directions` 数组顺序；不添加序号、筛选或折叠。

**Rationale**:

- `role="list"` + `role="listitem"` 让辅助技术把同一学生的多个方向识别为一个集合，满足 FR-014；`aria-label` 与 `TeacherCard` 的 `ul[aria-label="Research directions"]` 保持一致。
- 使用 `span` 而不是嵌套 `ul/li`：`StudentGroup.astro` 的 scoped 样式对 `li` 有通用规则（`padding: 8px 24px`、`border-bottom`、`display: flex` 等），嵌套 `li` 会继承这些规则，需要大量覆盖或改写父级选择器；`span` + ARIA 角色避免样式泄漏，改动面最小。
- 标签不是交互控件，不需要 `tabindex` 或按钮语义；不添加 hover 效果，保持纯展示。

**Alternatives considered**:

| 方案 | 否决原因 |
| --- | --- |
| 嵌套 `<ul class="direction-tags"><li>...` | 通用 `li` 样式会命中标签项，需重构多条选择器/加重置，回归风险高 |
| 纯 `<span>` 无 ARIA 角色 | 辅助技术无法识别「同一学生的方向集合」，不满足 FR-014 |
| `<div>` 标签 | 块级元素，行内布局需要额外 `display` 覆盖；`span` 更贴合文本流 |
| 用 `<dl>` / `<dt>` / `<dd>` | 语义过重，方向标签不是术语定义；样式也更复杂 |

## R6 验收方法

**Decision**:

1. **机器门禁**：`npm run check` + `npm run build`。
2. **数据契约**：备份 `students.json` 后，分别构造 `directions` 缺失、非数组、空数组、含空字符串、含纯空白字符串的临时数据；每次构建 MUST 失败，错误信息 MUST 含文件、学生姓名与字段；每次恢复原文件。
3. **链接审计**：逐条打开 31 名学生的最终链接，核对页面身份与强关联证据；用脚本确认每人至多一个非空字段、所有 URL 为 HTTPS；记录无链接名单。
4. **布局**：当前智能体浏览器按 320 / 375 / 480 / 576 / 768 / 1024 / 1280 / 1440 / 1920px 九档视口测量：
   - 每条记录至少有 1 个标签；标签文本与数据逐项一致；两个在读分组内无 "Since" 或四位年份；
   - 姓名贴左、链接文字贴右、标签组位于两者之间且不重叠；
   - 标签组可换行；超长标签在标签内部换行，`scrollWidth ≤ clientWidth + 1`；
   - 页面横向溢出的失败判据为 `document.documentElement.scrollWidth > window.innerWidth`；逐元素 `getBoundingClientRect()` 检查越界；
   - <480px 链接独占最后一行且文字右对齐；≥768px 两栏切分仍为 `ceil(n/2)`（PhD 10+10、Master's 6+5）。
5. **回归**：`git diff --stat` 只包含 4 个源文件与 `specs/013-student-direction-tags/`；Faculty、Graduates、首页、发表页、新闻页对应的源文件与数据文件零 diff 即视为未受影响，不做截图对比；Team 在读分组为预期变更区。
6. **验收记录**：不新增证据文件；数据校验、九档测量、构建输出、回归核对结果在完成报告与 PR 描述中汇总。

**Rationale**: 与 010–012 的验收口径一致；数据校验用真实构建验证，布局用真实浏览器渲染验证；不引入新测试框架（Constitution V），也不以静态代码阅读替代浏览器验收（Constitution VI）。

**Alternatives considered**:

| 方案 | 否决原因 |
| --- | --- |
| 新增 Vitest / Playwright / 视觉回归 | 需新增依赖与 CI 步骤，超出本特性范围，违反 Constitution V |
| 只跑 `astro check`，不跑 `build` | 无法验证 data loader 与 schema 的构建期行为 |
| 只用静态代码审查判断布局 | 违反 Constitution VI 的「MUST 基于真实浏览器渲染」 |
| 只测 1440px 与 375px | 无法覆盖 768px 两栏最紧档与 480px 断点；规格要求九档 |

## R7 宪法合规

**Decision**: 六条核心原则全部 PASS，详见 [plan.md 的 Constitution Check](./plan.md#constitution-check)。关键点：

- I / II：`TBD` 是明确授权的占位；链接经证据核实；方向数据只在 JSON 中维护，组件自动渲染。
- III：构建与部署方式不变，`check` + `build` 作为合并门禁。
- IV / V：标签复用教师卡片 chip 视觉，无动效/无新交互；零新增依赖、零新增 JS、零新增组件，删除 `grade` 逻辑后净复杂度下降。
- VI：九档真实浏览器验收；标签组换行 + 单标签内部换行 + `min-width: 0`；不掩盖溢出。

## R8 数据快照（2026-11-22，只读基准）

- 在读学生共 **31** 条：PhD **20** 条（年级 2020–2026）、Master's **11** 条（2024–2026）；全部有 `grade`，本特性将其替换为 `directions: ["TBD"]`。
- 现有成员链接 **16** 条，15 条无链接：
  - `url`（Homepage）4 条：杨晨旭、顾佴彬、李雨晴、佟政阳（均为 `*.github.io` 个人站，按自建主页归类）。
  - `github` 11 条：张瀚文、牟凌宇、秦川于、朱哲良、姚丁钰、刘润泽、冀焕翔、陈翔楠、邱明阳、刘梦犁、李佳睿。
  - `scholar` 1 条：刘曦雨。
- 无链接 15 人：周俊豪、赵语林、汪嘉、朱祉同、张蓓泽、叶振雷、王娅彤、彭诗忠、艾明旭、冯宇辰、沈斌、张蓬月、顾树焕、温泽林、毛乐平。
- 以上为当前工作区数据快照，仅作验收基准；实现期 MUST 以链接核实结果更新，最终以 `students.json` 为准。数据文件在实现前不应被本计划改动。
