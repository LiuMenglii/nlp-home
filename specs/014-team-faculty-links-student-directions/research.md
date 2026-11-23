# Research: Team 页教师链接标签与学生主页信息补全

**Date**: 2026-11-22 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

本特性无 `NEEDS CLARIFICATION`（spec 于 2026-11-22 确认标签文案、Scholar 范围与方向口径，2026-11-23 澄清首页教师名片与 Team 页一致）。Phase 0 研究聚焦六个问题：**如何拆分教师链接字段**、**两处名片如何共用同一标签契约**、**新增链接如何整项换行而不破卡片**、**Scholar 归属证据是否充分**、**方向标签的选择依据与长度是否满足 ≥1024px 单行**、**如何用最小门禁验证内容与布局**。

## R1 教师数据字段拆分与迁移

**Decision**:

1. `teachers.json` 把原 `homepage`（指向 `people.ucas.ac.cn`）更名为 `ucasProfile`，并新增可选字段 `homepage` 表示个人主页。四条记录改为：

| 教师 | `ucasProfile` | `homepage` |
| --- | --- | --- |
| 林政 | `https://people.ucas.ac.cn/~linzheng` | `null` |
| 付鹏 | `https://people.ucas.ac.cn/~fupeng` | `https://fupeng.ac.cn/` |
| 吴大衍 | `https://people.ucas.ac.cn/~dayan` | `null` |
| 谷井子 | `https://people.ucas.ac.cn/~0082145` | `null` |

2. `content.config.ts` 的 teachers schema 改为：

```text
ucasProfile: httpsUrl
homepage: httpsUrl
```

沿用既有 `httpsUrl = z.url().refine(v => v.startsWith('https://')).optional().nullable()`，两个字段都允许省略 / `null`，非 HTTPS 值构建失败。数据文件采用显式 `null` 表示未配置，与 `students.json` 的写法一致。

3. 不新增「`homepage` 不得为 `people.ucas.ac.cn`」的构建期启发式校验；迁移正确性由数据审查与 quickstart 的 grep 检查保证（评审口径：避免过度防御，Constitution V）。

**Rationale**:

- `ucasProfile` 与 `homepage` 的命名直接对应 spec 的表格与标签文案，维护者不会再把 UCAS 资料页写成 `homepage`。
- 两个字段都复用 `httpsUrl`，HTTPS 约束与「字段缺失 / `null` 不失败」由同一份 schema 保证，无需新增校验函数。
- 显式 `null` 让「未配置个人主页」在数据文件中可见，避免省略键造成的歧义；schema 同时兼容省略写法。

**Alternatives considered**:

| 方案 | 否决原因 |
| --- | --- |
| 保留 `homepage` 表示 UCAS 资料页，新增 `personalHomepage` | 与 spec 术语（UCAS Profile / Homepage）不一致，且 `homepage` 继续承担「不是个人主页」的语义，正是本次要消除的歧义 |
| 把教师链接改为 `links: [{ label, href }]` 通用数组 | 为 1 个可选链接引入通用结构，增加模板分支与维护成本，违反 YAGNI |
| `ucasProfile` 设为必填 | 规格只要求个人主页可选；未来教师可能没有 UCAS 资料页，必填会制造无谓的构建失败 |
| 增加 `homepage` 不得含 `people.ucas.ac.cn` 的校验 | 属于对一次性迁移的过度防御；数据审查与 grep 足以发现残留 |

## R2 两处名片的标签契约

**Decision**:

`TeacherCard.astro` 对 `detailed` 与 compact 两种名片使用同一套链接渲染，不再按 `detailed` 分支切换文案或链接集合：

| 名片 | 链接顺序 | 说明 |
| --- | --- | --- |
| 详细名片（Team 页） | 邮箱（如有）→ `ucasProfile` → `homepage` | 标签依次为邮箱、`UCAS Profile`、`Homepage`；`detailed` 只控制邮箱与 bio |
| 概览名片（首页 Team 区） | `ucasProfile` → `homepage` | 同一标签与顺序；不渲染邮箱与 bio |

- 8 张名片（Team 4 张 + 首页 4 张）语义一致：`UCAS Profile ↗` 指代 UCAS 资料页，`Homepage ↗` 只表示个人主页；付鹏两处均有两项，其他教师只有 `UCAS Profile ↗`。
- 不新增 prop、不复制组件、不改变调用方；`index.astro` 与 `team.astro` 均零改动。

**Rationale**:

- 2026-11-23 spec 澄清明确要求首页 Team 概览区的教师名片与 Team 页完全一致（FR-001 / FR-003 / SC-001）；若 compact 分支继续保留旧的 `Homepage → UCAS` 语义，同一站点会出现两种标签含义，正是本特性要消除的歧义。
- 统一渲染路径比维护两套分支更简单：两个字段按固定顺序条件渲染即可，`detailed` 只保留既有职责（邮箱、bio）。
- 首页同档名片的可用宽度不小于 Team 页（概览名片无邮箱项），统一后不引入新的宽度压力。

**Alternatives considered**:

| 方案 | 否决原因 |
| --- | --- |
| compact 分支继续只渲染 `ucasProfile`、文案沿用 `Homepage` | 与 2026-11-23 澄清、FR-001、SC-001 直接冲突；同站两种标签语义 |
| 复制一个 `TeacherCardCompact.astro` | 重复照片、方向、头部布局与响应式规则，维护成本高，违反 YAGNI |
| 给 `TeacherCard` 新增 `linkLabels` / `showPersonalHomepage` 等 props | 调用方只有两处且契约相同，新增 API 没有收益 |
| 首页不渲染任何链接 | 与 FR-001 / SC-001 对 8 张名片的覆盖率要求冲突 |

## R3 教师链接顺序与整项换行

**Decision**:

- DOM 顺序固定为「邮箱（`detailed` 且非空时）→ `ucasProfile` → `homepage`」；首页概览名片无邮箱，直接以 `ucasProfile` 起始。全部外链使用 `target="_blank"` 与 `rel="noopener"`。
- `.teacher-links` 沿用 `display: flex; flex-wrap: wrap; gap: 6px 18px; align-self: flex-start`；新增 `.teacher-links a { white-space: nowrap; }`，使两种名片的链接标签都作为整体换行，不在 `UCAS` / `Profile` 之间或箭头前断行。
- 不新增媒体查询或列布局；名片头部在 <576px 的既有规则不变。

**几何估算**（正文 18px；链接字号 1rem；卡片内距 24px；容器内距 ≥481px 为 24px、≤480px 为 16px）：

| 视口 | 名片列数 | 卡片内容宽 | 说明 |
| --- | --- | --- | --- |
| 1920 / 1440 / 1280px | 2 | 510px | 容器 1180px 封顶 |
| 1024px | 2 | 432px | 邮箱 + UCAS + Homepage 约 404px，可同一行 |
| 768px | 2 | 304px | 邮箱 + UCAS 约 286px，Homepage 换行 |
| 576px | 1 | 480px | 三项约 404px，可同一行 |
| 480px | 1 | 384px | 三项可同一行（余量约 20px） |
| 375px | 1 | 295px | 邮箱 + UCAS 约 286px（贴边），Homepage 换至下一行 |
| 320px | 1 | 240px | 邮箱独占一行或与 UCAS 换行；`UCAS Profile` 与 `Homepage` 可在 240px 内并排（约 236px），否则各占一行 |

- 单项最大宽度约 120px（`UCAS Profile ↗`），远小于最窄内容宽 240px，`nowrap` 不会造成单项溢出。
- 空间不足时整项换行；行间距沿用 `row-gap: 6px`，链接区与卡片边缘不重叠。
- 首页概览名片无邮箱项，只需容纳 `UCAS Profile ↗` + `Homepage ↗`（约 216px + 18px 间距 ≈ 234px）：768px 内容宽 304px、375px 约 295px、320px 约 240px 均可单行；320px 余量约 6px，若字体回退导致不足则由 `flex-wrap` 整项换行，以九档测量为准。两页教师网格在 ≥768px 均为 2 列、<768px 为 1 列（007 FR-009），同档卡片内容宽一致。
- 实际宽度受字体回退影响，最终以九档浏览器测量为准；估算只用于确认不存在「单项宽于容器」的结构性风险。

**Rationale**:

- 既有 `.teacher-links` 已经是可换行的 flex 容器，新增一个链接不需要新布局；唯一的破绽是 flex item 默认可在内部文字换行，`white-space: nowrap` 用一行声明即可满足 FR-005 的「整项换行、不在单词内部断开」。
- 不给链接设置固定宽度或 `flex-basis`，避免为不同语言/字号预设几何，符合 003–013 的收纳策略。

**Alternatives considered**:

| 方案 | 否决原因 |
| --- | --- |
| 链接区改为 Grid 两列固定轨道 | 320px 下两个 120px 标签加间距已接近容器宽度，固定轨道会压缩邮箱或造成溢出；且两页共用该组件 |
| 给每个链接 `flex: 0 0 100%` 强制各占一行 | 桌面端浪费空间，且改变现有 480–1279px 的单行呈现 |
| 用 `overflow-wrap: anywhere` 代替 `nowrap` | 允许单词内部断开，与 FR-005 相反 |

## R4 Scholar 归属证据

**Decision**: 只写入以下 2 条，其余 12 位保持三字段全空：

| 学生 | 写入值 | 强关联证据 |
| --- | --- | --- |
| 顾树焕 | `https://scholar.google.com/citations?user=Fqk9CMkAAAAJ` | 档案论文的合作者包含姚丁钰、杨晨旭、佀庆一、林政、王伟平，且主题与 G3 多模态方向一致；档案单位显示 East China Normal University，已获用户确认是本人，按本人写入 |
| 温泽林 | `https://scholar.google.com/citations?user=3gjCYDMAAAAJ` | 档案单位为 Institute of Information Engineering, Chinese Academy of Sciences，`iie.ac.cn` 邮箱已验证，姓名一致 |

明确不写入：

- **赵语林**：同名档案单位为 University of the Chinese Academy of Sciences，方向为联邦学习与 AI 安全，论文与合作者均与本人不符；MUST NOT 写入 `https://scholar.google.com/citations?user=77QrjwYAAAAJ`。
- **其余 11 位**（周俊豪、汪嘉、王娅彤、彭诗忠、沈斌、朱祉同、张蓓泽、叶振雷、艾明旭、张蓬月、毛乐平）：无可核实档案，保持 `url` / `github` / `scholar` 全空。

本节即 14 位学生的检索证据；实施时只按上述结论写入，不重复检索。

**Rationale**: 错误链接比没有链接更损害可信度（US2 / Constitution I）。仅姓名相同、单位不同或方向明显不符均不构成归属证据；宁可留空，由课题组后续补充。

**Alternatives considered**:

| 方案 | 否决原因 |
| --- | --- |
| 把赵语林的同名档案当作本人写入 | 方向、单位、合作者均不符，属于误写 |
| 为「尽量补全」写入弱关联或同名档案 | 违反 FR-008 与内容准确性原则 |
| 为无法确认者填搜索页 URL | 不是本人档案，且不属于 HTTPS 外链白名单语义 |

## R5 研究方向来源与标签选择

**Decision**: 只替换 6 位有本人自述来源的学生，每人 1–2 个标签；其余 25 位保留 `["TBD"]`：

| 学生 | 来源 | 写入 `directions` | 选择依据 |
| --- | --- | --- | --- |
| 杨晨旭 | 个人主页 `https://iie-ycx.github.io/` | `Multimodal LLM`、`Reinforcement Learning` | 主页写明 `VLM & RL & Inference Efficiency`；取两个主要方向，不把推理效率单列 |
| 顾佴彬 | 个人主页 `https://gccnlp.github.io/` | `Efficient LLM`、`Post-Training` | 主页写明 efficient post-training 与 efficient model architectures，归并为两个概括标签 |
| 李雨晴 | 个人主页 `https://qdcassie-li.github.io/` | `RAG`、`Agent Memory` | 主页三个方向（RAG、Agent Memory、Multimodal Analysis）中取前两个主要方向 |
| 佟政阳 | 个人主页 `https://tzy2003.github.io/` | `LLM` | 主页只写明 large language model 及相关应用，取一个概括标签 |
| 刘曦雨 | Google Scholar 研究兴趣 | `LLM`、`Knowledge Editing` | 档案研究兴趣明确列出两项，作为已有 Scholar 链接学生的补充来源 |
| 李佳睿 | GitHub 简介 | `RAG`、`Memory` | 简介自述两项，作为已有 GitHub 链接学生的补充来源 |

**标签长度**（013 已测算的三轨几何，0.9rem ≈ 16.2px，标签左右内距共 16px）：

| 视口 | 标签组列宽 | 最长新标签 `Reinforcement Learning`（约 190px） |
| --- | --- | --- |
| 1280px 及以上 | 302px | 单行 |
| **1024px** | **224px** | **单行（余量约 34px）** |
| 768px | 96px | 标签内部换行（规格允许的收纳行为） |
| 576px | 280px | 单行 |
| 480px | 200px | 单行或内部换行 |
| 375px | 约 231px | 单行 |
| 320px | 约 176px | 标签内部换行 |

- 不新增 `white-space: nowrap` 到方向标签：013 明确规定窄视口允许标签内部换行，且 ≥1024px 的几何余量足够；强制 `nowrap` 会在 768px 造成页面横向溢出。
- `TBD` 保留者不因教师方向、论文标题或课题组整体方向被猜测填充。

**Rationale**: 方向必须可核实且能代表本人主要工作；1–2 个标签既避免把主页关键词全部塞入，也保证在 1024px 三轨布局中单行显示。

**Alternatives considered**:

| 方案 | 否决原因 |
| --- | --- |
| 把主页所有关键词都写入 | 违反 FR-010，标签过密且长度不可控 |
| 用论文标题推断方向 | 非本人自述，违反 FR-013 |
| 为 25 位无来源学生填课题组方向 | 属于推测，违反内容准确性原则 |
| 给所有标签加 `nowrap` | 768px 列宽仅 96px，必然页面横向溢出 |

## R6 验收方法

**Decision**:

1. **机器门禁**：`npm run check` + `npm run build`；记录退出码与输出摘要。
2. **数据契约探针**（临时修改后恢复）：
   - 付鹏 `homepage` 改为 `http://fupeng.ac.cn/` → 构建失败且报错含 HTTPS 要求；
   - 付鹏 `homepage` 改为 `null` 或删除该键 → 构建通过，Team 与首页两处名片都只剩 `UCAS Profile`；
   - 付鹏 `ucasProfile` 改为 `http://people.ucas.ac.cn/~fupeng` → 构建失败且报错含 HTTPS 要求；
   - 删除某学生的 `directions` → 013 既有校验失败且报错含文件、姓名、字段。
3. **真实浏览器**：以 `npm run preview` 打开 Team 页与首页，按 320 / 375 / 480 / 576 / 768 / 1024 / 1280 / 1440 / 1920px 九档检查：
   - Team 页 Faculty：4 张名片均有且仅有一个 `UCAS Profile ↗`；付鹏另有 `Homepage ↗`；无重叠、截断、卡片溢出；`document.documentElement.scrollWidth === window.innerWidth`；逐项 `getBoundingClientRect()` 不越出卡片与视口。
   - 首页 Team 概览：4 张名片均有且仅有一个 `UCAS Profile ↗`；付鹏另有 `Homepage ↗`；不出现邮箱；破损判定同上。
   - 学生：6 位新方向标签出现；≥1024px 每个标签内部单行（`scrollHeight` 与单行高度一致）；窄视口允许标签内部换行但无页面横向滚动；其余 25 位仍为 `TBD`。
4. **链接与回归**：点击两处页面共 8 个 UCAS 链接、付鹏的个人主页、2 个 Scholar 链接核对落地页；`git diff --stat` 只出现 5 个预期文件；`StudentGroup.astro`、`team.astro`、`index.astro`、Graduates、发表页与新闻页零 diff；已有链接的 17 位学生的链接字段零 diff（6 位 `directions` 按 FR-011/FR-012 更新）；首页仅教师名片链接区与实施前不同（标签改为 `UCAS Profile`、付鹏新增 `Homepage`），首页其余区块零 diff。

**Rationale**: 项目无视觉回归框架，宪法 VI 要求以真实浏览器为判据；构建探针能以最小成本证明字段可空与 HTTPS 校验仍生效；零 diff 检查覆盖 FR-016 的「其余页面不动」。

**Alternatives considered**:

| 方案 | 否决原因 |
| --- | --- |
| 引入 Playwright 截图对比 | 新增依赖与维护成本，违反 Constitution V；本特性只需九档人工/浏览器测量 |
| 只靠静态代码审查 | 宪法 VI 明确禁止仅凭代码推断布局 |
| 为字段迁移新增自动化测试文件 | 一次性数据迁移，构建探针已覆盖关键契约 |

## 结论

所有 `NEEDS CLARIFICATION` 已消除；技术方案不引入新依赖、新组件或新断点。Phase 1 只需定义教师字段契约、两处名片的 DOM 契约、数据模型快照与验收指南。
