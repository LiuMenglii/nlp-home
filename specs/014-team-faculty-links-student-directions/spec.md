# Feature Specification: Team 页教师链接标签与学生主页信息补全

**Feature Branch**: `014-team-faculty-links-student-directions`

**Created**: 2026-11-22

**Status**: Draft

**Input**: User description: "对 team 页面做修改：1) 将老师名片中的 Homepage 字样换一个（现在还没想好换成啥，请你提供建议。这个标签指向的是老师在 UCAS 的主页）。然后在付老师的名片内加一个 Homepage 标签（也就是现在这个标签），指向 https://fupeng.ac.cn/。2) 寻找剩余没有链接的同学的 Google scholar；为了让你通过人机验证，请打开自带的浏览器工具，我帮你通过验证。3) 阅读在读学生的个人主页，抓取每个人的研究方向。研究方向尽量不换行，每个人抓取1-2个。如果发现了很多个，选一个研究最多的。"

## 目标与范围

Team 页当前有三个彼此独立、但都落在同一页面的内容缺口：

1. **教师链接语义不清**：四张教师名片上的 `Homepage ↗` 实际指向老师在国科大（UCAS）的个人资料页（`people.ucas.ac.cn`），与「个人主页」的通常含义不符；付鹏老师的个人主页 `https://fupeng.ac.cn/` 目前没有入口。
2. **部分学生没有任何链接**：31 位在读学生中，4 位有个人主页、12 位仅有 GitHub、1 位仅有 Google Scholar、14 位三个链接字段全空。
3. **研究方向全部是占位符**：31 位在读学生的 `directions` 均为 `["TBD"]`，其中 4 位有可阅读的个人主页。

本特性按用户确认的三个方向实施：

1. **教师链接**：Team 页 Faculty 区域的教师详细名片与首页 Team 概览区的教师名片中，原指向 UCAS 资料页的标签文案由 `Homepage` 改为 **`UCAS Profile`**；教师数据支持一个与 UCAS 资料页并存的个人主页链接，付鹏老师的个人主页 `https://fupeng.ac.cn/` 以 **`Homepage`** 标签展示。其他教师仍只有 `UCAS Profile` 一个链接标签。
2. **学生 Scholar 补全**：对 14 位当前无任何链接的在读学生逐一检索 Google Scholar（检索结论见 `research.md` R4），仅在有强关联证据时写入 `scholar`；无法确认归属的保持三个字段为空。已确认可写入 2 位（顾树焕、温泽林），其余 12 位无可核实资料。
3. **学生研究方向**：优先阅读有个人主页的在读学生主页，每人提取 1–2 个最能概括其主要工作的短方向；有多个方向时选其主页明确表述且发表最集中的方向。Google Scholar 研究兴趣与 GitHub 简介作为补充公开来源。没有可靠公开依据的学生继续保留 `TBD`。

**范围之外**：

- Graduates 名单中的 `Homepage` 标签与 `url` 字段语义——本特性只改教师名片的标签文案，毕业生链接保持现状；
- 已拥有 `url` / `github` / `scholar` 链接的 17 位在读学生——不重新核实、不替换、不新增第二个链接（其中 6 位的 `directions` 按 FR-011 / FR-012 更新，链接字段保持不变）；
- 教师照片、职称、简介、研究方向数据；首页除教师名片链接区外的其余部分、发表页、新闻页、导航、页脚；
- 布局结构、双栏切分、行内三轨、断点、间距等 012 / 013 已冻结的规则；
- 新增筛选、排序、折叠、分页、动效或交互；
- 为没有公开资料的学生推测研究方向。

## Clarifications

### Session 2026-11-22

- Q: 老师名片里指向 UCAS 资料页的标签换成哪个文案？ → A: `UCAS Profile`（用户确认，作为推荐项）。
- Q: 研究方向要覆盖到什么范围？ → A: 主页优先，公开资料补充；没有可靠依据的学生保留 `TBD`（用户确认，作为推荐项）。

### Session 2026-11-23

- Q: 顾树焕的 Google Scholar 档案单位显示 East China Normal University，与在读身份不一致，是否按本人写入该 Scholar 链接？ → A: 是本人，写入 `https://scholar.google.com/citations?user=Fqk9CMkAAAAJ`（用户确认）。
- Q: 首页 Team 概览区的教师名片要如何展示链接？ → A: 与 Team 页完全一致——`UCAS Profile ↗` 指代 UCAS 资料页，付鹏额外显示 `Homepage ↗` 指向 `https://fupeng.ac.cn/`（用户确认）。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 访客区分 UCAS 资料页与教师个人主页 (Priority: P1)

访客在 Team 页 Faculty 区域或首页 Team 概览区浏览教师名片时，看到指向国科大个人资料页的标签明确写着 `UCAS Profile ↗`，不会再误以为那是老师的个人主页。付鹏老师的名片上同时出现 `UCAS Profile ↗` 与 `Homepage ↗` 两个标签，分别打开 UCAS 资料页和个人主页；其他教师的名片上只有 `UCAS Profile ↗`。

**Why this priority**: 这是用户本次最直接、最容易独立验收的展示修改；只改标签文案与付鹏的一个链接即可交付价值。

**Independent Test**: 打开 Team 页 Faculty 区域与首页 Team 概览区，确认两处共 8 张教师名片都出现且只出现一个 `UCAS Profile ↗`，没有教师名片再把 UCAS 链接标成 `Homepage ↗`；付鹏在 Team 页与首页的名片同时出现 `Homepage ↗` 且指向 `https://fupeng.ac.cn/`；逐一点击核对落地页。

**Acceptance Scenarios**:

1. **Given** 林政、付鹏、吴大衍、谷井子四位教师都有 UCAS 资料页，**When** 访客查看 Team 页或首页的任意教师名片，**Then** 该链接标签显示为 `UCAS Profile ↗`，链接仍指向原来的 `people.ucas.ac.cn` 页面。
2. **Given** 付鹏老师同时拥有 UCAS 资料页与个人主页，**When** 访客查看付鹏在 Team 页与首页的名片，**Then** 两张名片的链接区内均出现 `UCAS Profile ↗` 与 `Homepage ↗`，分别指向两个不同页面。
3. **Given** 其他三位教师没有配置个人主页，**When** 访客查看他们在 Team 页与首页的名片，**Then** 只显示 `UCAS Profile ↗`，不出现空的 `Homepage` 标签或占位。

---

### User Story 2 - 访客通过 Google Scholar 了解无主页学生 (Priority: P1)

访客浏览 PhD Candidates 或 Master's Students 名单时，原本没有任何链接的学生中，有可核实 Google Scholar 档案的学生显示 `Scholar ↗` 标签，点击后打开本人档案；找不到可核实档案的学生继续不显示链接，不会把访客带到同名陌生人的页面。

**Why this priority**: 学生链接是访客了解研究工作的主要入口；错误链接比没有链接更损害可信度，因此补全必须与归属核实同时完成。

**Independent Test**: 核对 14 位原无链接学生：顾树焕、温泽林的 `scholar` 非空且打开后为本人（顾树焕有与 G3 成员合作的论文，温泽林档案单位为中科院信工所）；赵语林及其余 11 位（共 12 位）三个字段均为空；每位学生仍至多一个链接字段非空；构建通过。

**Acceptance Scenarios**:

1. **Given** 顾树焕的 Scholar 档案中有与 G3 成员合作的论文，**When** 访客查看其行，**Then** 显示 `Scholar ↗` 并指向 `https://scholar.google.com/citations?user=Fqk9CMkAAAAJ`。
2. **Given** 温泽林的 Scholar 档案单位为 Institute of Information Engineering, Chinese Academy of Sciences，**When** 访客查看其行，**Then** 显示 `Scholar ↗` 并指向 `https://scholar.google.com/citations?user=3gjCYDMAAAAJ`。
3. **Given** 赵语林在 Google Scholar 存在同名档案（University of the Chinese Academy of Sciences，研究方向为联邦学习与 AI 安全），但论文与合作者均与本人不符，**When** 完成补全，**Then** 该档案不写入，赵语林三个链接字段保持为空。
4. **Given** 除顾树焕、温泽林、赵语林外的其余 11 位学生找不到可核实的 Scholar 档案，**When** 访客查看他们的行，**Then** 不显示任何链接标签，姓名与方向标签正常显示。

---

### User Story 3 - 访客看到真实研究方向而非占位符 (Priority: P1)

访客浏览在读学生名单时，有公开资料的学生显示 1–2 个简短、具体的研究方向标签（如 `RAG`、`Agent Memory`、`LLM`），标签尽量保持单行；没有可靠公开资料的学生仍显示 `TBD`，不会被填上推测内容。

**Why this priority**: 这是 013 留下占位符后的内容兑现；方向标签只有在真实、可核实时才对访客有价值。

**Independent Test**: 核对 4 位有个人主页的学生行：杨晨旭、顾佴彬、李雨晴、佟政阳均显示 1–2 个非 `TBD` 标签；抽查刘曦雨（Scholar 兴趣）与李佳睿（GitHub 简介）的补充标签；其余学生仍为 `TBD`；标签文本与来源一致。

**Acceptance Scenarios**:

1. **Given** 杨晨旭的个人主页写明 `VLM & RL & Inference Efficiency`，**When** 访客查看其行，**Then** 显示 `Multimodal LLM` 与 `Reinforcement Learning` 两个标签。
2. **Given** 顾佴彬的个人主页写明 efficient post-training 与 efficient model architectures，**When** 访客查看其行，**Then** 显示 `Efficient LLM` 与 `Post-Training` 两个标签。
3. **Given** 李雨晴的个人主页写明 RAG、Agent Memory 与 Multimodal Analysis，**When** 访客查看其行，**Then** 显示 `RAG` 与 `Agent Memory` 两个标签（取其主要方向，不把三个都塞入）。
4. **Given** 佟政阳的个人主页只写明 large language model 及相关应用，**When** 访客查看其行，**Then** 显示一个 `LLM` 标签。
5. **Given** 某学生没有任何可核实的研究方向来源，**When** 访客查看其行，**Then** 仍显示 `TBD`，不出现推测标签。

---

### User Story 4 - 新增链接与标签在支持视口内稳定 (Priority: P2)

访客在桌面、平板与手机宽度下浏览 Team 页与首页时，付鹏名片上的两个链接标签、以及新增的方向标签都不会互相重叠、不会被裁剪或撑出页面；空间不足时按既有规则换行收纳。

**Why this priority**: 内容补全会增加行内元素数量与宽度，必须确认不破坏 003 / 012 / 013 已冻结的响应式布局。

**Independent Test**: 在 320 / 375 / 480 / 576 / 768 / 1024 / 1280 / 1440 / 1920px 视口检查 Team 页 Faculty、首页教师名片与两个学生分组：无元素重叠、无文字截断、无页面级横向滚动；付鹏在 Team 页与首页的两个标签完整可见；方向标签在 ≥1024px 不内部换行。

**Acceptance Scenarios**:

1. **Given** 付鹏的 Team 名片同时有邮箱、`UCAS Profile` 与 `Homepage` 三个链接项，**When** 视口为 320px，**Then** 链接区按需换行，三项均完整可见，不重叠、不溢出卡片；首页付鹏名片的两项链接同样完整可见。
2. **Given** 某学生有 2 个方向标签，**When** 视口为 1024px 及以上，**Then** 每个标签文本在自身内不换行，标签组在可用列宽内按需换行。
3. **Given** 视口为 768px（双栏最紧档），**When** 查看任一新方向标签，**Then** 标签中的文字完整可见，允许标签内部换行收纳，页面无横向滚动。

---

### Edge Cases

- **付鹏名片同时有多个链接**：Team 页详细名片按「邮箱 → UCAS Profile → Homepage」排列；首页概览名片按「UCAS Profile → Homepage」排列（不显示邮箱）；空间不足时整项换行，不在单词内部断开。
- **其他教师未配置个人主页**：只渲染 `UCAS Profile`，不渲染空标签、空链接或占位符。
- **个人主页字段为空 / `null`**：视为未配置，不显示 `Homepage` 标签；构建不得因该字段为空而失败。
- **个人主页不是 HTTPS**：不写入、不展示（沿用站点外部链接 HTTPS 约束）。
- **UCAS 链接改名范围**：Team 页 Faculty 详细名片与首页 Team 概览名片的 UCAS 链接均改文案；Graduates 的 `Homepage` 标签保持不变。
- **Scholar 同名不同人**：仅凭姓名相同不写入；赵语林的 UCAS 同名档案为明确反例。
- **Scholar 档案无单位、无合作者线索**：视为不可核实，不写入。
- **学生已有 GitHub / 主页链接**：即使找到 Scholar，也不新增第二个链接——三选一校验保持不变。
- **方向标签过长**：优先选择更短、更概括的表述；不得以省略号截断。窄视口允许标签内部换行，但不得导致页面级横向滚动。
- **学生有多个方向**：只取 1–2 个最能代表其主要发表/主页定位的方向；不把主页所有关键词都变成标签。
- **学生没有任何公开方向来源**：保留 `TBD`，不凭课题组大致方向猜测。
- **`directions` 仍为空数组 / 缺失**：沿用 013 的构建失败规则，错误指出数据文件、学生姓名与字段。
- **历史归档文档**：`specs/001`–`013` 中出现的 `Homepage` / `TBD` 描述保持原样，不作为待清理内容。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Team 页 Faculty 区域的教师详细名片与首页 Team 概览区的教师名片中原指向 `people.ucas.ac.cn` 的链接标签 MUST 显示为 `UCAS Profile ↗`；站点内 MUST NOT 再以 `Homepage` 文案指代 UCAS 资料页。链接 URL MUST 保持原值。
- **FR-002**: 教师数据 MUST 能区分「UCAS 资料页」与「个人主页」两个链接；个人主页 MUST 为可选字段，未配置时合法。付鹏老师的个人主页 MUST 配置为 `https://fupeng.ac.cn/`。
- **FR-003**: Team 页 Faculty 区域的付鹏老师详细名片与首页 Team 概览区的付鹏老师名片 MUST 同时显示 `UCAS Profile ↗`（指向 `https://people.ucas.ac.cn/~fupeng`）与 `Homepage ↗`（指向 `https://fupeng.ac.cn/`）；其他教师未配置个人主页时 MUST 只显示 `UCAS Profile ↗`。
- **FR-004**: Team 页 Faculty 详细名片的链接区 MUST 按「邮箱（如有）→ UCAS Profile → Homepage」的视觉顺序渲染；首页 Team 概览名片的链接区 MUST 按「UCAS Profile → Homepage」的视觉顺序渲染（不渲染邮箱）。`ucasProfile` 与 `homepage` 两个网页外链 MUST 使用 HTTPS，并在新标签页中打开，且不向被打开页面泄漏来源页面控制权；`mailto:` 邮箱链接沿用既有行为，不受 HTTPS 与新标签页要求约束。
- **FR-005**: Team 页 Faculty 详细名片与首页 Team 概览名片的教师链接标签 MUST 完整可见；付鹏名片的两个链接标签在空间不足时 MUST 按整项换行收纳，MUST NOT 发生元素重叠、文字截断、单词内部断行或越出卡片边界。
- **FR-006**: 对当前 14 位三个链接字段全空的在读学生的 Google Scholar 检索 MUST 已完成，检索结论 MUST 记录在 `research.md` R4；实施时 MUST 按该结论写入，不重复检索。只有满足强关联证据（档案单位为中科院信工所 / 国科大，或论文合作者包含 G3 成员，或公开资料明确指向本人）才可写入 `scholar`。
- **FR-007**: 顾树焕 MUST 写入 `https://scholar.google.com/citations?user=Fqk9CMkAAAAJ`；温泽林 MUST 写入 `https://scholar.google.com/citations?user=3gjCYDMAAAAJ`；赵语林 MUST NOT 写入 `https://scholar.google.com/citations?user=77QrjwYAAAAJ`（同名不同人，研究方向为联邦学习与 AI 安全）。
- **FR-008**: 其余 11 位原无链接学生（周俊豪、汪嘉、王娅彤、彭诗忠、沈斌、朱祉同、张蓓泽、叶振雷、艾明旭、张蓬月、毛乐平）在本次检索后 MUST 保持 `url` / `github` / `scholar` 全空；MUST NOT 因「尽量补全」而写入同名或弱关联档案。
- **FR-009**: 学生链接「`url` / `github` / `scholar` 三选一、至多一个非空」的校验 MUST 保留；本次只允许向三字段原本全空的记录写入 `scholar`；已有链接的 17 位学生的 `url` / `github` / `scholar` 字段 MUST 保持零 diff；其中 6 位学生的 `directions` 按 FR-011 / FR-012 更新，不视为链接变更。
- **FR-010**: 对于有个人主页的在读学生，研究方向 MUST 从其个人主页的公开表述中提取 1–2 个；存在多个方向时 MUST 选择主页定位与其主要发表最集中的方向，MUST NOT 把主页所有关键词都填入。
- **FR-011**: 本次 MUST 写入以下经主页确认的方向：
  - 杨晨旭：`Multimodal LLM`、`Reinforcement Learning`；
  - 顾佴彬：`Efficient LLM`、`Post-Training`；
  - 李雨晴：`RAG`、`Agent Memory`；
  - 佟政阳：`LLM`。
- **FR-012**: 公开资料补充 MUST 仅在有明确自述时写入：刘曦雨按 Scholar 研究兴趣写入 `LLM`、`Knowledge Editing`；李佳睿按 GitHub 简介写入 `RAG`、`Memory`。
- **FR-013**: 没有可核实公开来源的学生 MUST 继续使用 `["TBD"]`；MUST NOT 根据教师方向、论文标题或课题组整体方向推测个人方向。
- **FR-014**: 每个方向标签的文本 MUST 简短到在 ≥1024px 视口下不在标签内部换行；标签组在窄视口按 013 规则换行收纳，MUST NOT 造成页面级横向滚动、元素重叠或文字截断。
- **FR-015**: 教师个人主页字段 MUST 通过 HTTPS 校验；字段缺失或为空 MUST NOT 导致构建失败。`directions` 至少 1 项、非空字符串的既有构建期校验 MUST 保持不变。
- **FR-016**: 除 Team 页、首页 Team 概览区的教师名片链接区、教师数据、学生数据、数据校验配置与数据维护文档外，首页其余部分、发表页、新闻页及其余数据文件 MUST 相对实施前无改动；首页教师名片仅允许链接标签文案与链接项按 FR-001 / FR-003 / FR-004 / FR-005 变化；Graduates 的 `Homepage` 标签与 `url` 语义 MUST 不变。

### Key Entities *(include if feature involves data)*

- **教师（Teacher）**：姓名、英文职称、导师角色、研究方向、邮箱、UCAS 资料页链接（既有字段）、个人主页链接（新增可选字段）、照片、简介。当前四位教师的 UCAS 资料页与个人主页对应关系：

| 教师 | UCAS Profile | Homepage（个人主页） |
|------|--------------|----------------------|
| 林政 | `https://people.ucas.ac.cn/~linzheng` | 未配置 |
| 付鹏 | `https://people.ucas.ac.cn/~fupeng` | `https://fupeng.ac.cn/` |
| 吴大衍 | `https://people.ucas.ac.cn/~dayan` | 未配置 |
| 谷井子 | `https://people.ucas.ac.cn/~0082145` | 未配置 |

- **在读学生（Student）**：姓名、培养层次、研究方向标签列表、至多一个成员链接。本次新增的 Scholar 链接与确认结果：

| 学生 | 层次 | 检索结论 | 写入值 |
|------|------|----------|--------|
| 顾树焕 | Master | 有与 G3 成员（姚丁钰、杨晨旭、佀庆一、林政、王伟平）合作的论文 | `https://scholar.google.com/citations?user=Fqk9CMkAAAAJ` |
| 温泽林 | Master | Scholar 档案单位为中科院信工所 | `https://scholar.google.com/citations?user=3gjCYDMAAAAJ` |
| 赵语林 | PhD | 同名档案为 UCAS 联邦学习 / AI 安全方向，非本人 | 不写入 |
| 其余 11 位 | — | 未找到可核实档案 | 保持空 |

- **研究方向标签（Direction Tag）**：学生的一条研究方向文本，本次确认值：

| 学生 | 来源 | 标签 |
|------|------|------|
| 杨晨旭 | 个人主页 `https://iie-ycx.github.io/` | `Multimodal LLM`、`Reinforcement Learning` |
| 顾佴彬 | 个人主页 `https://gccnlp.github.io/` | `Efficient LLM`、`Post-Training` |
| 李雨晴 | 个人主页 `https://qdcassie-li.github.io/` | `RAG`、`Agent Memory` |
| 佟政阳 | 个人主页 `https://tzy2003.github.io/` | `LLM` |
| 刘曦雨 | Google Scholar 研究兴趣 | `LLM`、`Knowledge Editing` |
| 李佳睿 | GitHub 简介 | `RAG`、`Memory` |
| 其余 25 位 | 暂无可核实公开来源 | 保持 `TBD` |

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Faculty 区域与首页 Team 概览区共 8 张教师名片中，`UCAS Profile ↗` 标签出现率为 100%，以 `Homepage` 指代 UCAS 链接的数量为 0；付鹏在 Team 页与首页的两张名片均同时显示两个链接标签，两个链接均指向正确页面。
- **SC-002**: 14 位原无链接学生 100% 完成检索；写入 Scholar 的 2 位均可在其档案中找到强关联证据；误写同名档案的数量为 0；赵语林及其余 11 位（共 12 位）保持三字段全空。
- **SC-003**: 4 位有个人主页的学生 100% 显示 1–2 个非 `TBD` 方向标签；6 位获得方向标签的学生标签与公开来源一致率为 100%；其余学生 100% 保留 `TBD`。
- **SC-004**: 在 1024 / 1280 / 1440 / 1920px 视口下，每个方向标签内部换行数量为 0；在 320 / 375 / 480 / 576 / 768px 视口下，方向标签造成元素重叠、文字截断与页面横向滚动的数量为 0。
- **SC-005**: 在 320 / 375 / 480 / 576 / 768 / 1024 / 1280 / 1440 / 1920px 九个视口下，付鹏在 Team 页与首页的两张名片，其链接区元素重叠、文字截断、内容溢出卡片与页面横向滚动均为 0。
- **SC-006**: 站点类型检查与构建校验通过；已有链接的 17 位学生的链接字段、Graduates、发表页、新闻页相对实施前无改动；首页除教师名片链接区外相对实施前无改动（6 位学生的 `directions` 按 FR-011/FR-012 更新）；由数据违约用例触发的构建失败仍能指出文件、学生姓名与字段。

## Assumptions

- **标签语言**：`UCAS Profile` 为全站英文界面下最清晰的表述，与 `Homepage`、`GitHub`、`Scholar` 的标签风格一致。
- **Homepage 语义**：`Homepage` 全站只表示个人主页；Team 页与首页的教师名片均不再用它指代 UCAS 资料页。
- **教师链接数量**：每位教师最多两个链接（UCAS Profile + 可选 Homepage）；不新增第三个社交链接字段。
- **Scholar 检索范围**：只检索当前 14 位无任何链接的学生；已有链接的学生不重新核实，避免与 013 已完成的链接优先级冲突。
- **强关联证据**：接受「档案单位为中科院信工所 / 国科大」或「论文合作者包含 G3 成员」；仅姓名相同、单位不同或方向明显不符的不写入。
- **顾树焕档案**：档案单位显示 East China Normal University，但其论文合作者包含姚丁钰、杨晨旭、佀庆一、林政、王伟平，且论文主题与 G3 多模态方向一致；已获用户确认是本人，按本人写入。
- **温泽林档案**：档案单位为 Institute of Information Engineering, Chinese Academy of Sciences，且档案标注在 `iie.ac.cn` 的邮箱已验证，姓名一致，按本人处理。
- **方向提取原则**：只采用个人主页自述、Google Scholar 研究兴趣、GitHub 简介等「本人自述」来源；论文标题与课题组方向只用于判断哪个自述方向更集中，不单独作为填写依据。
- **标签长度**：以 1024px 视口单行显示为设计目标；768px 及以下允许标签内部换行，属于已声明的收纳行为，不按布局破损处理。
- **保留 TBD**：没有公开来源的学生继续显示 `TBD`，这是准确的「待补充」状态，不是缺陷。
- **历史文档**：`specs/001`–`013` 中的 `Homepage` / `TBD` 描述属于历史归档，不回溯改写。
