# Requirements Review Checklist: 新闻详情页重点控件与三论文解读新闻

**Purpose**: 在实现前对 spec / plan / contracts 做一次“需求单元测试”，把需要用户拍板的高影响问题，与可由实现者后续修复的次要问题分开。
**Created**: 2026-10-23
**Feature**: [spec.md](../spec.md)（008-news-detail-widgets）
**Depth**: Standard（实现前评审门禁，不是发布后的功能验收）
**Audience**: 需求决策人（用户）+ 后续实现者

**Note**: 本清单由 `/speckit-checklist` 基于当前 spec、plan、research、data-model、contracts 与仓库现状生成。Top 10 会改变范围、内容事实、验收方式或实现路径，建议在进入实现前逐条选择；其余条目已附修改方案，待决策后由我在后续轮次落到对应文档。
**Review Ownership**: 本清单是评审人所有的需求质量评审物。只有评审人确认“需求质量准则已满足”时才勾选 `[x]`。
**Marker Semantics**: `[x]` 表示该需求质量条目已按用户决策完成修订并通过评审，**不表示功能已实现**。2026-10-23 本轮已处理 CHK001–040，全部条目已勾选。

## 一、Top 10：需要你决策/评审的问题

> 每条给出证据、风险与 A/B/C 方案。若同意“建议”，回复 `CHK001=建议` 即可；若选其他方案，回复 `CHK001=B`。

### CHK001 正文深度与字数口径

- [x] CHK001 — 正文“不少于 2,500 个中文字符”的口径，是否足以支撑“三篇论文的详细解读”？ [Scope, Ambiguity, Spec §FR-028/§SC-004, Assumptions]
  - **你的决定**: C —— 维持 2,500 CJK 下限，删除 FR-025 的六段式要求，每篇按“问题—方法—结论”展开；计数仅统计 CJK，排除 BibTeX/代码块，包含图注与表格文字。已落地。
  - **现状与证据**: FR-028 与 SC-004 只设下限 2,500，Assumptions 写“2,500–4,000 为目标”；参考文章约 3,500 字、配十余张图。若按“中文字符”严格统计，扣掉开篇、对比与启示后，每篇论文约 600–700 字，很难容纳 FR-025 要求的“问题 → 旧方法不足 → 机制/理论 → 方法 → 实验 → 结论”六个层次；若按“总字符数”统计，2,500 字更短，问题更大。
  - **风险**: 文章可能“结构齐全但内容单薄”，与用户最初要求的“详细的 news”不符；同时“中文字符”没有说明是否排除 BibTeX、代码、表格、图注与英文术语，验收时无法客观计数。
  - **可选方案**:
    - A. 维持 2,500 下限、4,000 目标；明确“仅统计 CJK 统一表意文字，排除 BibTeX/代码块，包含图注与表格文字”。改动最小，但篇幅偏短。
    - B. 提高到 4,000–6,000 CJK（总字符约 6,000–9,000），每篇论文 1,200–1,500 CJK；更符合“详细解读”与参考文章的深度，写作与事实核对成本更高。
    - C. 维持 2,500，但删去 FR-025 的六段式要求，允许每篇只写“问题—方法—结论”。质量下降，不建议。
  - **建议**: B，同时把计数口径写进 FR-028/SC-004；若你希望控制篇幅，选 A 并接受每篇论文更短。
  - **影响**: FR-028、SC-004、Assumptions 第 288 行；新文章结构与事实核对工作量。

### CHK002 论文命名与事实基准错误

- [x] CHK002 — 三篇论文的“论文标题、方法名、机构与版本”是否已按 arXiv 原文校正？ [Content Accuracy, Conflict, Spec §目标与范围/§FR-024/§FR-029, Research §6]
  - **你的决定**: A —— 章节标题保留方法名，正文首段写真实论文标题，BibTeX 用真实标题；机构写 IIE, CAS / UCAS / JD.COM；NPO 以 arXiv v2 为准。已落地。
  - **现状与证据**: spec 第 20 行与 FR-024 把第二篇论文写成 “Near-Future Policy Optimization（NPO）”；arXiv:2604.20733v2 的实际论文标题是 **Learning from the Near Future: Temporal Self-Distillation for RLVR**，NPO 只是文中提出的机制。若按 spec 直写，章节标题与 BibTeX `title` 会把“机制名”当成“论文名”。此外，research 的事实表没有记录机构；但三篇论文的 arXiv HTML 均写明 **Institute of Information Engineering, CAS / School of Cyber Security, UCAS / JD.COM**，参考文章标题中的“京东&中科院信工所”可以核实，不必按 spec Assumptions 第 287 行“无法确认就不强调”处理。三篇论文页面均标注 **CC BY 4.0**，NPO 当前版本为 v2（2026-10-01 修订），参考文章（2026-05-19）很可能基于 v1，数字需按 v2 复核。
  - **风险**: 论文标题、机构或版本写错会直接违反 Constitution I（内容准确性），也是新闻类内容最难挽回的错误；读者复制 BibTeX 后会把错误标题带到自己的文献库里。
  - **可选方案**:
    - A. 章节标题保留方法名（如“NPO：Near-Future Policy Optimization”），正文第一段明确写“论文标题：Learning from the Near Future: Temporal Self-Distillation for RLVR”，BibTeX 用真实标题；同时写明三机构与 v2 版本。
    - B. 章节标题直接用论文标题，方法名放副标题或首句。
    - C. 维持 spec 现有写法，只修正 BibTeX `title`；机构继续省略。
  - **建议**: A。既保留读者熟悉的 NPO 简称，又不把机制名冒充论文名；机构按 arXiv 页面写全，版本统一标 v2。
  - **影响**: spec 第 20 行、FR-024/025/026/029、research §6 事实表、新文章标题与三节首段、三条 BibTeX。

### CHK003 对比表在 375px 的呈现方式

- [x] CHK003 — 对比表（4 列：维度 + 三篇论文）在 375px 下如何呈现，才不会同时违反 FR-033 与 Constitution VI？ [Consistency, Conflict, Spec §FR-033/§FR-037, quickstart §5.4]
  - **你的决定**: 表格不渲染为图片；新增 `:::table[可选标题]` 表格控件，表格在容器内横向滚动，页面不横向溢出。
  - **“表格转图片 + 按图片逻辑放大”可行性结论**: 技术上可行（构建期用 headless 浏览器截图为 PNG，或手工导出后按普通 Markdown 图片插入，点击再打开原图即可放大），但本次不采用：① 需新增 Playwright/Puppeteer 等重依赖，违反 FR-034 与 Constitution III/V；② 表格失去文本选中、检索、复制与屏幕阅读器语义；③ 手机端图内文字过小，必须再引入灯箱/放大脚本，而本次明确不引入；④ 内容更新需同时改 Markdown 与重新导出图片。已落地为 FR-044–047。
  - **现状与证据**: FR-037 要求至少一张横向对比表，维度包括“教师信号来源、是否引入额外信息、核心代价与风险、适用阶段”，即至少 4 个对比维度；表格为 4 列（维度 + RLSD/NPO/CoPD），控件本身另需支持 5 列及以上的横向滚动（2026-10-23 复核修正：此前误将 4 个维度记为 5 列）；FR-033 要求“内容溢出容器”属于布局破损，且“不得以隐藏横向溢出的方式掩盖问题”。Constitution VI 允许“容器内横向滑动”，但前提是**需求中已声明**；当前 FR-033/FR-037 都没有声明表格容器可横向滚动，quickstart §5.4 却默认“若超宽，仅表格容器内横向滚动”。仓库现有 [global.css](../../src/styles/global.css) 也没有任何 `table` 样式，对比表会以浏览器默认样式出现，与站点设计语言不一致。
  - **风险**: 实现者要么让表格撑破页面（违反 FR-033/Constitution VI），要么用 `overflow-x: hidden` 裁掉（被明确禁止），要么临时加一个未声明的滚动容器（需求与实现不一致，验收无据）。
  - **可选方案**:
    - A. 明确声明表格外层可横向滚动：新增 `div.news-table` 包装、`overflow-x: auto`、`tabindex="0"`、`aria-label`、可见滚动提示；页面级 `scrollWidth` 不变；同时补表格视觉规范（表头、边框、字号、斑马纹是否使用）。
    - B. 小于 768px 时改为“按论文分组的堆叠卡片”，每个维度一行，不做横向滚动；需要额外的响应式样式与内容重复。
    - C. 小屏只保留 2–3 个维度，牺牲 FR-037 的完整性。
  - **建议**: A。保留内容完整性，成本最低，也符合 Constitution VI 对“已声明容器内滚动”的例外；若你更在意手机端不出现横向手势，选 B。
  - **影响**: FR-033/FR-037、Edge Cases、rendered-dom 契约、quickstart §5.4、`news-widgets.css`。

### CHK004 BibTeX 条目格式与“可解析”的验收

- [x] CHK004 — BibTeX 条目应采用 `@article` 还是 `@misc`，作者是否必须全列，`&`/`%` 如何处理，“标准 BibTeX 工具可解析”由谁验证？ [Clarity, Consistency, Measurability, Spec §FR-026, data-model §5, markdown-authoring §2]
  - **你的决定**: 两篇被 NeurIPS 接收的论文用 NeurIPS `@inproceedings`（`booktitle = {Advances in Neural Information Processing Systems}`、`volume = {39}`），另一篇 NPO 用 arXiv `@misc`；三条均全列作者、标题加花括号、含 HTTPS 链接，并用 `bibtex` + `plainnat` 实测解析。已落地。（2026-10-23 C1 后续决议：正式 proceedings 发布前，三条统一改为 arXiv `@misc`，写 `eprint`/`archivePrefix`/`primaryClass`/`url`，不写 `booktitle`/`volume`/`note`；同日最终决议：正文与 BibTeX 完全删去 NeurIPS 2026 接收状态/Spotlight 表述，不注明来源、不呈现该信息。）
  - **现状与证据**: data-model §5 要求 `type: @article`、作者顺序与论文页一致；contract 示例却写 `author = {Chenxu Yang and ... and others}`，与“全列作者”冲突。arXiv 预印本更常见的写法是 `@misc` + `eprint`/`archivePrefix`/`primaryClass`/`url`；若坚持 `@article` 而不写 `journal`，部分 BibTeX 样式会给出空期刊或警告。FR-026 要求“可被标准 BibTeX 工具解析”，但没有指定工具、版本、样式或期望输出；FR-018 又要求 `&`、`%` 按纯文本保留，而在 LaTeX/BibTeX 中未转义的 `&`/`%` 会破坏条目。
  - **风险**: 读者复制的条目“看起来像 BibTeX”，放进文献库却报错或丢字段；验收时无法判断是否达标；“作者用 and others 截断”还会与 data-model 的“作者顺序一致”自相矛盾。
  - **可选方案**:
    - A. `@misc` + `eprint`/`archivePrefix`/`primaryClass`/`url` + 全部作者（arXiv 原生写法，语义最准确）。
    - B. `@article` + `journal = {arXiv preprint arXiv:XXXX.XXXXX}` + `eprint`/`url` + 全部作者（对现有 data-model 改动最小）。
    - C. 维持 contract 示例（`@article` + `and others`），不推荐。
  - **建议**: B，并把“全列作者、标题加花括号保护大小写、`&`/`%` 按 LaTeX 规则转义或禁止出现在字段中、用 `bibtex`/`biber` + `plainnat` 或 `biblatex` 实测一次”写入契约与编辑文档；citation key 固定为 `yang2026rlsd`、`qin2026npo`、`gu2026copd`。
  - **影响**: FR-026、FR-018、data-model §5、markdown-authoring §2、三条 BibTeX、`docs/news-markdown-guide.md`。

### CHK005 “无构建警告”与“错误可察觉”的冲突

- [x] CHK005 — FR-036 要求“无构建警告、无静默降级”，但未闭合高亮块、`BibTeX` 大小写拼错、空块等错误路径又要求维护者能察觉，二者如何兼容？ [Consistency, Conflict, Spec §FR-036/§Edge Cases, markdown-authoring §不支持行为]
  - **你的决定**: A+B —— 硬错误（未闭合 `:::highlight`/`:::table`、非小写 `bibtex`）构建失败并给文件/行号；软问题（未知容器、空块、表格尾行缺空行、同名嵌套）输出受控 warning，FR-036 改为“除已声明控件诊断外，无新增警告”。已落地。
  - **现状与证据**: FR-036 写 “MUST NOT 引入构建警告或静默降级”；Edge Cases 写未闭合高亮块应“让维护者能察觉异常”；contract 写 ` ```BibTeX ` 会触发 Shiki 警告、未闭合高亮块会退化为普通文本、空块会被静默移除。当前没有定义任何构建期诊断机制，quickstart §6 的故障注入也只描述“期望现象”，没有说构建是否应失败。
  - **风险**: 实现者只能二选一：违反 FR-036 发警告，或静默降级让维护者永远发现不了拼写错误；两种结果都会让“编辑文档能防错”的承诺落空。
  - **可选方案**:
    - A. 增加构建期校验器：对可识别的控件错误（未闭合 `:::highlight`、` ```BibTeX `、空 `bibtex` 块、表格后缺空行）直接构建失败并给出文件/行号；把 FR-036 改为“除已声明的控件诊断外，无新增警告”。
    - B. 允许受控警告：维护一份 warning allowlist，FR-036 改为“无 **非预期** 警告”，quickstart 记录基线警告数；错误仍可构建通过。
    - C. 保持静默降级，删除 Edge Cases 中“让维护者察觉异常”的表述。
  - **建议**: A + B 的组合：硬错误（未闭合、语言标记拼错）构建失败；软问题（未知容器指令、空块）给受控警告，并在 quickstart 记录基线。这样既不违反“无静默降级”，也让维护者能定位。
  - **影响**: FR-036、Edge Cases、FR-004/005、quickstart §3/§6、编辑文档“常见错误”章节；实现上需要新增一个 Markdown 源文件校验步骤。

### CHK006 SC-001/SC-005/SC-011 的可执行性

- [x] CHK006 — 三条成功标准都依赖人工判断或未定义工具，是否要在实现前补上可执行的评审协议？ [Measurability, Gap, Spec §SC-001/§SC-005/§SC-011]
  - **你的决定**: C —— 三条降级为非门禁质量目标，发布后抽查，不作为合并前通过条件。已落地。
  - **现状与证据**: SC-001 要求“一位未参与开发、无前端经验的维护者 5 分钟内完成”；SC-005 要求“至少 2 位读者能准确说出三篇论文的老师信号来源与核心差异”；SC-011 要求“与参考文章的连续重合文本不超过 30 字”。三者都没有说明样本如何选、任务脚本是什么、如何判定“准确”、由谁记录、用什么工具计算重合文本；SC-011 的“必要引语除外”也没有定义。
  - **风险**: 这些条款无法在合并前给出客观的通过/不通过结论，容易被“看起来差不多”放行；或者反过来，因为无法验证而被永久搁置，成为形式化条目。
  - **可选方案**:
    - A. 人工协议化：为 SC-001 写一份 5 分钟任务脚本（新建临时新闻→粘贴两个示例→`npm run dev` 预览），记录完成/卡点；为 SC-005 写 3 个必答问题（每篇教师信号来源、三者差异、各自代价），2 位读者独立作答；结果记入 `checklists/` 或 quickstart §7。
    - B. 客观代理：SC-001 用“编辑文档覆盖 5 个易错点 + 示例可复制”的清单替代；SC-005 改为“文章对比表包含 3 个必答维度”；SC-011 写一个小脚本，对参考文章与新闻做 30 字滚动 n-gram 重合检测，输出命中片段供人工判断。
    - C. 降级为“非门禁的质量目标”，只在发布后抽查。
  - **建议**: A + B：保留 SC-001/SC-005 的人工评审属性但给出明确脚本；SC-011 用脚本 + 人工复核，避免主观争议。
  - **影响**: SC-001/005/011、quickstart §7、可能的 `scripts/check-overlap.mjs`；评审记录位置需要明确。

### CHK007 图片许可与署名要求缺失

- [x] CHK007 — 三篇论文的配图均为 CC BY 4.0，图注是否必须包含许可与“未修改/仅缩放”声明？ [Completeness, Compliance, Spec §FR-040/§FR-043]
  - **你的决定**: A —— 图注统一写“图源：论文标题（arXiv:ID，CC BY 4.0）；图片未修改，仅按页面宽度缩放”，并链接许可文本。已落地。
  - **现状与证据**: 2026-10-23 核对 arXiv 页面，三篇论文均标注 **CC BY 4.0**；FR-040 只要求图注“标注论文标题与公开链接”，没有要求许可名称、许可链接、作者署名或修改说明。将图片文件存入仓库并随站点发布属于再分发，CC BY 4.0 允许再分发，但要求署名、给出许可链接，并说明是否修改。
  - **风险**: 图注只写“arXiv:xxxx”不足以满足 CC BY 的 attribution 要求；若后续有人裁剪/改色，也没有“已修改”声明的位置。
  - **可选方案**:
    - A. 统一图注模板：`图源：论文标题（arXiv:ID，CC BY 4.0）；图片未修改，仅按页面宽度缩放。` 并链接许可文本；写入 FR-040/FR-043 与编辑文档。
    - B. 不使用论文原图，改为自制示意图（无第三方许可问题，但工作量更大）。
    - C. 只放论文链接、不放图片（违反 FR-040 的本地存放要求，不推荐）。
  - **建议**: A。改动小，且与“本地存放、不热链”的现有要求一致；同时在 research/data-model 中记录许可来源。
  - **影响**: FR-040/FR-043、data-model §4、编辑文档“新闻配图”章节、三条图注。

### CHK008 无标题高亮块与“不得仅靠颜色”的冲突

- [x] CHK008 — FR-007 允许高亮块无标题，FR-010 又要求“不得仅靠颜色传达重点”，无标题块靠什么满足后者？ [Consistency, Accessibility, Spec §FR-006/§FR-007/§FR-010, User Story 1 scenario 2]
  - **你的决定**: 修改 FR —— 没标题也行；所有高亮块用左侧 3–4px 强调竖线、边框与内边距提供结构线索，标题保持可选。已落地为 FR-006/FR-010。
  - **现状与证据**: FR-006 用“浅色背景 + 边框 + 圆角”定义高亮块；FR-007 允许无标题；FR-010 要求“不得仅靠颜色传达‘重点’含义（标题或排版本身也应体现强调）”。无标题块只有背景色与边框色，没有任何文字、图标或排版层面的强调，直接与 FR-010 冲突；`role="note"` 只帮助辅助技术，不能帮助色觉障碍的明眼读者。
  - **风险**: 要么无标题块违反强制 FR，要么实现者临时加一个未定义的“重点”标签，导致视觉与文档不一致。
  - **可选方案**:
    - A. 为所有高亮块增加非颜色线索：左侧 3–4px 强调竖线 + 小号“重点”标签/图标（有标题时显示标题，无标题时显示“重点”）；保留可选标题。
    - B. 要求所有高亮块必须有标题，删除“无标题”场景与 User Story 1 scenario 2；最简单，但牺牲编辑灵活性。
    - C. 把“浅色背景与页面底色的亮度差”解释为非颜色线索；严格来说不成立，不建议。
  - **建议**: A。用形状/文字线索满足 FR-010，同时保留无标题用法；在 rendered-dom 契约中固定该线索的 DOM 与 ARIA。
  - **影响**: FR-006/007/010、User Story 1 scenario 1–2、rendered-dom §1、`news-widgets.css`、编辑文档。

### CHK009 复制失败反馈的布局稳定性

- [x] CHK009 — FR-013 要求反馈期间“不引起周围布局位移”，但失败文案明显长于初始文案，`min-width: 88px` 能保证吗？ [Clarity, Consistency, Spec §FR-013/§Edge Cases, plan §2]
  - **你的决定**: D —— 固定尺寸图标按钮（≥32×32），成功/失败用带颜色的图标表示，文字只写入固定状态区；图标与状态切换不改变按钮尺寸。已落地为 FR-013/FR-014。
  - **现状与证据**: 初始按钮文案“复制引用”（4 字），失败文案“复制失败，请手动选择”（9 字）；plan 用 `min-width: 88px` 防止按钮收缩，但 `min-width` 只设下限，不阻止按钮因文案变长而变宽。工具栏是 `display:flex; justify-content:flex-end`，按钮变宽会推动左侧标签或状态区；状态区又重复一遍长文案，可能换行或撑高工具栏。
  - **风险**: 失败路径直接违反 FR-013 与 Edge Cases 的“反馈不得推动周围内容”，而这正是复制控件最需要稳健的路径。
  - **可选方案**:
    - A. 按最长文案预留固定宽度（如 `width: 9.5em; white-space: nowrap`），按钮宽度不变；状态区单独一行或固定最小高度。
    - B. 按钮文案始终为“复制引用”，反馈只写入固定尺寸的状态区；按钮用图标/颜色表示成功或失败（但颜色不能是唯一线索，需配文字）。
    - C. 缩短失败文案为“复制失败”，详细原因放状态区；按钮宽度按“复制失败”预留。
    - D. 图标按钮 + 固定方形，反馈全部在状态区。
  - **建议**: A + C：按钮按最长文案预留宽度，失败文案简化为“复制失败”，状态区给“复制失败，请手动选择”的完整说明；同时避免按钮与状态区重复播报。
  - **影响**: FR-013/014、data-model 复制状态机、rendered-dom RC/RL、quickstart §5.2。

### CHK010 全局 `overflow-x: hidden` 会掩盖布局验收

- [x] CHK010 — 现有 `body { overflow-x: hidden }` 是否会让 `scrollWidth ≤ innerWidth` 的验收失真，本次是否要处理？ [Measurability, Conflict, Constitution VI, Spec §FR-033, global.css]
  - **你的决定（2026-10-23 修订）**: 执行方案 A —— 先对全站 18 页 × 320/375/768/1024/1280/1440px 强制 `overflow-x: visible` 做逐元素 `getBoundingClientRect()` + `scrollWidth` 审计（108 次测量 0 溢出），再移除全局 `body { overflow-x: hidden }`（T028，spec-review 后由 analyze 阶段落实）；块内滚动仍为 `pre` 与 `.news-table__scroll` 的 `overflow-x: auto`；验收直接测 `scrollWidth` 并逐元素检查 `getBoundingClientRect()`，不再临时禁用。已落地。
  - **现状与证据**: [global.css](../../src/styles/global.css#L34-L42) 的 `body` 设置了 `overflow-x: hidden`；Constitution VI 明确 “MUST NOT 用 `overflow-x: hidden` 掩盖页面横向溢出”；FR-033 也写“不得以隐藏横向溢出的方式掩盖问题”。quickstart §5 用 `document.documentElement.scrollWidth ≤ window.innerWidth` 作为布局判据，但 body 裁剪后，某些溢出可能不再扩大 `documentElement.scrollWidth`，检查会假通过。
  - **风险**: 新控件或对比表在 375px 下真实溢出，但验收因为全局裁剪而通过；这会让 Constitution VI 的“无布局破损”门禁失去意义，也可能掩盖既有页面的问题。
  - **可选方案**:
    - A. 本次移除全局 `overflow-x: hidden`，对全站四档视口做一次真实溢出审计，修掉暴露出的问题；范围扩大到既有页面。
    - B. 本次保留该规则，但在验收时于 DevTools 临时禁用 `overflow-x` 后再测 `scrollWidth`，并要求逐元素检查 `getBoundingClientRect()` 是否超出视口；把“全站移除该规则”列为后续任务。
    - C. 改用 `overflow-x: clip`；仍然是裁剪，不满足 Constitution，不建议。
  - **建议**: B。先保证本次验收真实有效，不把 008 扩大成全站布局返工；如果你愿意接受范围扩大，选 A 会一次性解决治理问题。
  - **影响**: FR-033、SC-007、quickstart §5、Constitution VI、global.css；若选 A，还会触及所有既有页面。

### Top 10 决策表

| ID | 议题 | 建议 | 你的选择 | 落地结果 |
|---|---|---|---|---|
| CHK001 | 正文深度与字数口径 | B（4,000–6,000 CJK） | **C**（维持 2,500，删六段式） | 已改 FR-025/FR-028/SC-004：每篇按“问题—方法—结论”，计数口径写入 |
| CHK002 | NPO 论文名、机构、版本 | A（方法名作标题 + 真实论文名 + 三机构 + v2） | **A** | 已改 FR-024/025/026/029、research §7 |
| CHK003 | 对比表在 375px | A（声明容器内横向滚动 + 补表格样式） | **不转图片；新增 `:::table` 表格控件** | 已新增 FR-044–047、User Story 4、表格契约与样式；新闻对比表为 4 列（维度 + 三篇），控件另行测试 5 列 |
| CHK004 | BibTeX 格式与可解析验收 | B（`@article` + journal + 全作者 + 实测） | **2026-10-23 调整：三条统一 arXiv `@misc`** | 已改 FR-026、SC-004、data-model §5、契约、research §7、tasks T018 与 quickstart §4.2 |
| CHK005 | 无警告 vs 错误可察觉 | A+B（硬错误失败、软问题受控警告） | **A+B** | 已改 FR-036/048、Edge Cases、控件边界行为表 |
| CHK006 | SC-001/005/011 可执行性 | A+B（人工脚本 + 重合检测脚本） | **C**（非门禁，发布后抽查） | 已标注 SC-001/005/011 非门禁 |
| CHK007 | CC BY 4.0 图注署名 | A（图注含许可与未修改声明） | **A** | 已改 FR-040/043、data-model §6、契约模板 |
| CHK008 | 无标题高亮块的非颜色线索 | A（左强调线 + “重点”标签） | **修改 FR，没标题也行** | 已改 FR-006/010：左侧 4px 强调线 + 边框，不强制标题/标签 |
| CHK009 | 复制失败反馈布局 | A+C（固定宽度 + 短失败文案 + 状态区） | **D**（图标按钮 + 带颜色图标） | 已改 FR-013/014、data-model 状态机、rendered-dom RD-02 |
| CHK010 | 全局 overflow-x 掩盖验收 | A（移规则 + 全站审计） | **A（修订）**：全站 108 次实测 0 溢出后移除 body 规则 | 已改 FR-033、Clarifications、Assumptions、plan、research §8、quickstart §6、tasks T028；验收直接测 scrollWidth + 逐元素 rect |

## 二、次要问题与修改方案（后续轮次由我处理）

> 以下条目不阻塞你本轮决策；你确认 Top 10 后，我会按每条“修改方案”更新 spec / plan / contracts / 编辑文档，并在下一轮汇报差异。

### A. 需求口径与完整性

- [x] CHK011 — 摘要“不超过 200 字”的计数口径未定义，且“摘要不得含控件语法”只写在 data-model，没有进 spec。 [Ambiguity, Gap, Spec §FR-023, data-model §1]
  - 修改方案：在 FR-023 明确“按 Unicode code point 计，中文、英文、标点各计 1；不含 Markdown 标记”；在 spec 加一句“summary 不得包含 `:::highlight` 或 ` ```bibtex ` 等控件语法”；在 `content.config.ts` 的 `summary` 校验旁加注释，说明 `zod.max(200)` 按 UTF-16 计与文档口径的差异，必要时改为自定义 refine。
- [x] CHK012 — 新闻标题、slug、摘要长度与命名约束未定义。 [Gap, Spec §FR-023, data-model §1]
  - 修改方案：固定 slug 为 `self-taught-rlvr-2026`；标题不超过 40 个中文字符且不得与参考文章标题相同；摘要建议 80–200 字；把这些写入 FR-023 与编辑文档，避免上线前临时改名导致链接失效。
- [x] CHK013 — “高亮块用于核心洞察而非装饰”是主观判断，缺少可评审的内容准则。 [Ambiguity, Spec §FR-027/§SC-004]
  - 修改方案：改为可判断的准则：每个高亮块至少包含一个可独立成立的结论、定义或风险提示，并与相邻正文形成“提出—强调”关系；在 quickstart 增加一条内容评审项，或新增 `checklists/content.md` 记录逐块判断。
- [x] CHK014 — FR-008/HA-02 声称高亮块内“行内代码、引用、表格”按“站点既有样式”排版，但仓库没有这些元素的正文样式。 [Gap, Consistency, Spec §FR-008, markdown-authoring §1, global.css]
  - 修改方案：二选一：在 `news-widgets.css` 为 `.news-body` 补齐 `code`、`pre`、`blockquote`、`table` 的最小排版规范；或把 FR-008 的支持范围收窄为“段落、加粗、斜体、链接、列表”，并在编辑文档声明其余元素按浏览器默认样式。建议前者，至少补表格与行内代码。
- [x] CHK015 — “控件位于列表项或引用中不得溢出”没有经过解析器验证，satteri 对嵌套容器指令的支持未知。 [Coverage, Assumption, Spec §Edge Cases, research §2]
  - 修改方案：增加一个临时 Markdown fixture，实测 `- :::highlight` 与 `> :::highlight`；若支持，补一条验收场景；若不支持，从 Edge Cases 删除该承诺，并在编辑文档写明“控件只建议放在顶层段落，列表/引用内请改用普通文本”。
- [x] CHK016 — 同名高亮嵌套、空标题 `:::highlight[]`、表格尾行 `:::` 等边界没有统一写入 spec。 [Gap, Consistency, Spec §Edge Cases, markdown-authoring §不支持行为]
  - 修改方案：在 spec 新增“控件边界行为”小节，逐条固定：同名嵌套不支持（降级并保留正文）、空标题按无标题处理、表格后必须空一行、未知容器展开；contract 与编辑文档同步，避免三处措辞不一致。
- [x] CHK017 — 空 BibTeX 块的行为在 spec（隐藏入口或空状态）与 contract（保留空代码块、不生成按钮）之间不一致。 [Consistency, Spec §Edge Cases, markdown-authoring §2]
  - 修改方案：统一为“保留空 `pre` 外观，不生成工具栏/按钮”，并在 spec 的 Edge Case 与验收场景中写死；编辑文档说明“空块看起来像空代码块，不会出现复制按钮”。

### B. 一致性与验收

- [x] CHK018 — plan 的 `newsExternalLinksPlugin` 会给所有 Markdown 外链补 `target="_blank"`，与 FR-032/SC-006“既有新闻渲染结果一致”存在潜在冲突。 [Consistency, Spec §FR-032/§SC-006, plan §1]
  - 修改方案：现状检查显示既有新闻没有外链，短期无实际影响；仍建议把插件限制在新闻详情页的 `.news-body` 或仅对本次新文章启用，并在 quickstart 增加“改动前后 `dist/news/*/index.html` 关键片段 diff”步骤，避免未来新闻加入外链时出现非预期变化。
- [x] CHK019 — FR-031 要求“控件仅在新闻详情页生效”，但实现按语法全局识别，没有按 collection/路径限制。 [Consistency, Spec §FR-031, research §1]
  - 修改方案：在 spec/plan 明确“当前只有 news collection 会渲染 Markdown，因此语法级启用等价于详情页生效”；增加一条构建后检查“首页/Team/Publications 不含 `news-highlight`/`news-bib`”；若未来新增 Markdown 页面，再按路径收窄。
- [x] CHK020 — “点击图片或图注打开本地原图或论文页”是二选一，且 Astro 只产出优化后的 `_astro/*.webp`，不一定有“本地原图”URL。 [Ambiguity, Spec §FR-041, data-model §4]
  - 修改方案：明确默认链接目标为论文公开页（arXiv abs）；如确实需要“查看原图”，再在 `public/` 或 `src/content/news/` 保留原图并生成固定 URL，同时在图注加“查看原图”链接；不要让同一张图同时承担两个未定义的目标。
- [x] CHK021 — FR-041 的“与正文同宽”与现有 `.news-body img { max-width: 100% }` 的“最大不放大”语义不同。 [Ambiguity, Spec §FR-041, data-model §4]
  - 修改方案：改为“图片最大宽度等于正文内容宽度，按原始宽高比缩放，不放大超过图片固有尺寸”；编辑文档给出宽高与体积建议，避免小图被拉伸模糊。
- [x] CHK022 — 图注只是普通段落，没有 `<figure>/<figcaption>` 关联；高亮块标题是 `<p>`，不是可导航的标题。 [Accessibility, Gap, Spec §FR-040, rendered-dom §1]
  - **你的决定**: 新闻配图保持标准 Markdown 图片 + 普通段落图注，不提供 `<figure>`/`<figcaption>` 语义，替代文本承担内容描述；高亮块标题改为 `role="heading"` + `aria-level="3"`，表格块自身使用 `<figure>`/`<figcaption>`。已落地。
  - 修改方案：优先用 Markdown 内嵌 HTML 的 `<figure>`/`<figcaption>` 包裹图片与图注（或写一个轻量插件），让图注与图片有程序化关联；高亮块标题改为 `role="heading"` + `aria-level="3"` 或 `<h3>`，并在 rendered-dom 契约中固定。若坚持纯 Markdown，至少在文档中声明“图注是普通段落，不提供 figure 语义”。
- [x] CHK023 — 验收矩阵从 375px 起，未覆盖 320px、200% 文字缩放与 forced-colors 高对比模式。 [Coverage, Accessibility, Spec §Assumptions/§SC-007]
  - 修改方案：在 quickstart 增加 320px 与 200% zoom 两项检查（已落入 §6）；本次不专门适配 forced-colors，但控件保留边框与左侧强调线，已在 spec Assumptions 明确。
- [x] CHK024 — `pre` 被设为 `tabindex="0"` 以支持键盘横向滚动，但 spec 只要求复制按钮可聚焦，没有定义 `pre` 的焦点与键盘滚动验收。 [Gap, Spec §FR-019, data-model §3]
  - 修改方案：在 FR-019 增加“BibTeX 内容区可用 Tab 聚焦，方向键可横向滚动，焦点态可见”；或在 rendered-dom 中删除 `tabindex`，只保留按钮焦点。二者选一，避免多一个未声明的 Tab 停靠点。
- [x] CHK025 — SC-009 “未压缩体积不超过 5KB”没有说明是内联脚本文节、UTF-8 字节还是构建后文件大小。 [Ambiguity, Spec §SC-009]
  - 修改方案：在 SC-009 明确“以 `[id].astro` 中 `<script is:inline>` 的 UTF-8 字节数计，不含 HTML 外壳”；quickstart §7 记录实际字节数，避免用压缩后大小误判。
- [x] CHK026 — 研究阶段的 `.tmp-probe-*.mjs` 已删除，插件没有自动化回归 fixture。 [Gap, Assumption, plan §Testing]
  - 修改方案：增加一个轻量 `node:test` fixture（三份 Markdown：正常高亮、未闭合、`bibtex`/普通代码块），断言生成的 HTML 关键片段；不需要引入 E2E 框架，符合 Assumptions。若不想加测试，至少在 `specs/008-news-detail-widgets/fixtures/` 保留样例与期望输出，供下次升级 Astro/satteri 时手测。
- [x] CHK027 — 直接 import `@astrojs/markdown-satteri` 与 `satteri`，但 `package.json` 只声明 `astro`，两者是传递依赖。 [Dependency, Gap, plan §Technical Context]
  - 修改方案：在 `devDependencies` 精确锁定 `@astrojs/markdown-satteri@0.4.3` 与 `satteri@0.10.5`（不带 `^`），并加注释说明来自 Astro 的传递依赖；或把 `astro` 固定为 `7.3.8` 并依赖 lockfile。建议前者，避免 `npm update` 后插件 API 消失。
- [x] CHK028 — 复制按钮初始 `hidden` 可能被作者 CSS 的 `display` 覆盖，导致无 JS 时按钮仍显示。 [Gap, Spec §FR-021, rendered-dom RD-06/RN-01]
  - 修改方案：在 `news-widgets.css` 写 `.news-bib__copy[hidden] { display: none !important; }`，或只对 `:not([hidden])` 应用布局样式；在无 JS 验收中确认按钮不可见且不占位。
- [x] CHK029 — 剪贴板 API 失败时是否要回退到 `document.execCommand('copy')` 未决策。 [Assumption, Spec §FR-014]
  - 修改方案：默认按 spec 的失败反馈处理，不引入旧 API；若希望覆盖更老的 Safari/Firefox，在编辑文档写明“先用 Clipboard API，失败后尝试 `execCommand`，两者都失败再提示手动选择”，并补一条验收。建议保持现状，减少脚本复杂度。
- [x] CHK030 — 按钮文案与 `aria-live` 状态区同时播报“已复制/复制失败”，可能被辅助技术重复朗读。 [Consistency, Accessibility, Spec §FR-020, rendered-dom RA-03]
  - 修改方案：只让状态区承担播报，按钮文案变化不进入 live region；或给按钮加 `aria-describedby` 指向状态区并避免状态区重复完整文案。在 rendered-dom 中固定“单次播报”的验收描述。

### C. 内容事实、文档与回归

- [x] CHK031 — FR-026 条件性要求“论文页提供官方代码或模型链接时一并列出”，但 research 没有记录检查结果。 [Gap, Spec §FR-026, Research §6]
  - 修改方案：已在 research 事实表记录——RLSD 有官方代码仓库 `https://github.com/iie-ycx/RLSD`；NPO 与 CoPD 未发现官方代码仓库，仅 Hugging Face 论文页（`huggingface.co/papers/2604.20733`、`/2604.27083`）；发布前再查一次论文页，若出现则补链接。
- [x] CHK032 — 编辑文档放在 `docs/news-markdown-guide.md`，但仓库当前没有 `docs/`，也没有从任何入口链接到它。 [Gap, Spec §FR-003]
  - 修改方案：创建 `docs/` 并新增指南；在 `src/data/README.md` 或根 README 增加一行“新闻控件与配图写法见 docs/news-markdown-guide.md”；在 spec FR-003 补“文档需可从维护者入口发现”。
- [x] CHK033 — BibTeX 的 citation key、标题大小写保护与版本标注未定义。 [Clarity, Spec §FR-026, data-model §5]
  - 修改方案：固定 key 为 `yang2026rlsd`、`qin2026npo`、`gu2026copd`；标题用 `{...}` 保护大小写（如 `{Self-Distilled RLVR}`）；BibTeX 的 `eprint` 取标准 arXiv ID（不带 `v2`），版本说明放正文首段与图注，避免读者引用到 v1；写入契约与指南。
- [x] CHK034 — 新闻正文写 `aₚ/bₚ`，论文使用 `a_P/b_P`，符号写法不统一。 [Consistency, Spec §FR-038, Research §6]
  - 修改方案：正文统一用 `a_P`、`b_P`（或全部用 `aₚ`、`bₚ`），并在术语表/首次出现处给出“P 表示 policy”的解释；同步 research 与 FR-038。
- [x] CHK035 — NPO 引用 v2，但参考文章日期为 2026-05-19，可能基于 v1，数字与结论存在版本差。 [Assumption, Content Accuracy, Spec §FR-029]
  - 修改方案：在 research 事实表标注“所有 NPO 数字以 v2 为准”；正文首段与图注标 `arXiv:2604.20733v2`，BibTeX 的 `eprint` 用标准 ID；不再引用参考文章的 v1 数字，避免混用。
- [x] CHK036 — 参考文章的署名格式未定义（作者、标题、日期、URL、访问日期）。 [Gap, Spec §FR-039]
  - 用户决策：**不写参考解读**（参考文章即本站所写）。已在 FR-039 明确：正文不设“参考解读”署名或链接；参考文章仅作写作参考，不逐字照搬。
  - 修改方案：删除“参考解读”块与模板；在 research §7“写作边界”记录该决定。
- [x] CHK037 — 缺少一份合并前的内容评审清单，事实、结构、控件数量、图片许可容易漏检。 [Gap, Spec §SC-004]
  - 修改方案：已写入 quickstart §10“内容审查附录”，逐项列：总—分—总结构、每节“问题—方法—结论”、3 个 BibTeX、≥2 高亮、1 对比表、3 图+图注+许可、事实来源、原创性（无参考解读署名）、字数统计结果；合并前逐项勾选并记录证据。
- [x] CHK038 — 既有新闻的“改动前后渲染一致”没有基线记录方法。 [Gap, Spec §SC-006]
  - 修改方案：在实现前先 `npm run build` 并保存 `dist/news/*/index.html` 的关键片段（或整页 hash）作为基线；改动后 diff。当前既有新闻无外链，风险低，但这一步能兜住外部链接插件与 Markdown 处理链的副作用。
- [x] CHK039 — 主图替代文本的语言与内容标准未定义（中文/英文、是否复述图内所有标签）。 [Clarity, Spec §FR-040]
  - 修改方案：要求 alt 用中文一句话说明“该图展示什么方法/流程”，不要求逐字翻译图内标签；在图注中补充论文标题与链接；写入 FR-040 与编辑文档的配图章节。
- [x] CHK040 — 新闻列表卡片是否会受新增长文长度或摘要换行影响，没有回归检查项。 [Coverage, Spec §FR-030/§SC-007]
  - 修改方案：在 quickstart 增加“列表页 375px 下新卡片标题/日期/摘要不截断、不溢出”的检查；当前 `NewsCard` 的 120px 日期列在 375px 会变为单列，需确认长标题与 200 字摘要不会造成卡片高度异常。

## Notes

- 本文件不替代 [requirements.md](./requirements.md)：后者是 `/speckit-specify` / `/speckit-clarify` 维护的 spec 质量检查，本文件是本次评审的决策与整改清单。
- 2026-10-23 本轮已按用户决策修订 spec / plan / research / data-model / contracts / quickstart，并将已解决条目勾选为 `[x]`；`[x]` 不代表功能实现完成。
- CHK010 经 2026-10-23 复审改为方案 A：先用无头浏览器对全站 18 页 × 320–1440px 强制 `overflow-x: visible` 审计（108 次测量 0 溢出），再移除全局 `body { overflow-x: hidden }`（T028 已完成）；块内滚动仍为 `pre` / `.news-table__scroll` 的 `overflow-x: auto`；验收直接测 `scrollWidth` 并逐元素检查 `getBoundingClientRect()`（见 FR-033、quickstart §6）。
- 事实核验记录（2026-10-23）：抓取 arXiv:2604.03128v2、2604.20733v2、2604.27083v1；三篇均标注 **CC BY 4.0**；机构为 **IIE, CAS / UCAS / JD.COM**；三张图的 URL 可下载，尺寸与体积与 [research.md](../research.md) §5 一致（1790×825 / 1695×664 / 1932×919；约 171KB / 178KB / 225KB）。该记录只用于本清单的证据，不替代实现阶段的论文原文核对。
- 仓库现状（2026-10-23）：008 尚未实现；`src/markdown/`、`src/styles/news-widgets.css`、`docs/news-markdown-guide.md`、三张主图与新文章均不存在；`specs/008-news-detail-widgets/` 目前只有 spec / plan / research / data-model / quickstart / contracts / checklists。既有新闻没有外链，也没有 `:::` 容器或 `:name[...]` 指令，因此语法全局启用的短期风险较低。
