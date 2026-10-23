# Quickstart: Team 页布局、教师移除与成员链接标签验证指南

**Date**: 2026-10-23 | **Spec**: [spec.md](./spec.md) | **行为契约**: [contracts/team-layout-member-links.md](./contracts/team-layout-member-links.md) | **数据与显示模型**: [data-model.md](./data-model.md)

改动 = 表现层（`StudentGroup.astro` + `team.astro` 模板/scoped CSS）+ 数据内容（`teachers.json` / `students.json` / `README.md`）+ 数据约束（`content.config.ts` 的 `scholar` 字段与互斥 refine）+ 删除 1 个不再引用的教师照片。零新依赖、零新 JS。验证 = 机器门禁（`check` + `build`，含两条负向数据用例）+ 真实浏览器视口矩阵 + 坐标量测。

## 前置条件

- Node.js ≥ 22，仓库根目录已 `npm install`
- 浏览器 DevTools 响应式模式（或等价视口调节）
- 本地开发服务器：`npm run dev` → `http://localhost:4321/nlp-home/team/` 与 `http://localhost:4321/nlp-home/`

## 1. 机器门禁

```bash
npm run check      # 类型 + schema 校验通过
npm run build      # 静态构建通过（CI 同口径）
npm run preview    # 复核构建产物 http://localhost:4321/nlp-home/team/
```

- 预期：全部通过；构建产物中 `/team/` 与 `/` 正常渲染。
- 已实测（2026-10-23）：`astro check` 会执行 content sync 并校验集合 schema（含对象级 `superRefine`），字段类型错误与自定义校验失败均以退出码 1 中断——因此 `check` 与 `build` 是同一口径的双门禁。
- 若 `scholar` 字段类型或互斥 refine 写错，`check` / `build` MUST 报错并中断。

## 2. 王伟平移除（US2 / FR-006～FR-010、FR-020 / SC-002 / SC-003 / SC-011）

1. 打开 `/team/`，统计 Faculty 教师卡片数 = **4**；打开 `/` 的 Team 区块，卡片数同为 **4**。
2. 全站渲染页面与构建产物 HTML 检索「王伟平」与 `people.ucas.edu.cn/~0012246`：可见命中 **0** 处（可对 `dist/` 全部 HTML grep 复核，同样 0 处）。
3. 其余 4 位老师（林政、付鹏、吴大衍、谷井子）的姓名、职称、研究方向、简介、邮箱、主页链接与改动前逐项一致，顺序不变。
4. ≥1280px 下两页教师卡片均呈两行两列（2×2），每行 2 张、等宽；不再出现 3+1。
5. `ls public/teachers/` 不含 `wang-weiping.svg`；`dist/teachers/` 同样不含；访问 `http://localhost:4321/nlp-home/teachers/wang-weiping.svg` 应返回 404。全仓检索 `wang-weiping` 仅命中历史 spec 文档（非站点内容）。

## 3. 学生分组纵向排列（US1 / FR-001～FR-005 / SC-001）

在 `/team/` 按 **1920 / 1280 / 1024 / 768 / 767 / 576 / 481 / 480 / 375 / 320px** 十档逐档核对：

1. PhD Candidates 在上、Master's Students 在下，两分组**上下排列**，任一档都不得左右并排。
2. DevTools 执行坐标量测（每组取一次）：
   `document.querySelectorAll('.student-group')[i].getBoundingClientRect()` 的 `left` 与 `right` 应等于内容区左右边缘（与 `.section` 内容盒一致），差值 ≤1px；两组的 `top` 不同且无水平重叠。
3. 两组之间纵向间距 ≥32px（`computedStyle.gap` = 32px，量测上一组底边到下一组标题顶边）。
4. 在宽屏 ≥1280px 下确认仍为单列（不因空间充足恢复并排）。
5. Master's Students 当前为空：仍独占一行并显示既有 `coming soon` 文案，无半宽留白。

## 4. 链接标签矩阵（US3 / FR-012～FR-018 / SC-006 / SC-007）

打开 `/team/` 核对在读学生（PhD Candidates）与毕业生列表：

| 成员 | 预期标签 | 预期 `href` |
|------|----------|-------------|
| 李江楠 | GitHub↗ | `https://github.com/LeqsNaN` |
| 张瀚文 | GitHub↗ | `https://github.com/Heaven-zhw` |
| 季慧山 | 无 | — |
| 郑明钰 | GitHub↗ | `https://github.com/SpursGoZmy` |
| 杨晨旭 | Homepage↗ | `https://iie-ycx.github.io/` |
| 刘曦雨 | Scholar↗ | `https://scholar.google.com/citations?user=94lNc6oAAAAJ&hl=zh-CN` |
| 顾佴彬 | Homepage↗ | `https://gccnlp.github.io/` |
| 李雨晴 | Homepage↗ | `https://qdcassie-li.github.io/` |
| 刘正宵 | GitHub↗ | `https://github.com/jluliuzx` |
| 佀庆一 / 杨泽娴 / 刘源鑫 | Homepage↗ | 各自既有 `url` |
| 其余毕业生 | 无 | — |

1. 每位成员最多 **1** 个标签，标签数量与上表逐项一致；本期验收时全站 Scholar 标签数 = **1**（仅刘曦雨，不作为永久不变量）。
2. 所有标签 `target="_blank"`、`rel="noopener"`，点击在新标签页打开对应地址；刘曦雨的 href 与上表逐字一致（含 `&hl=zh-CN`，不随浏览器语言改写）。
3. 在读学生姓名元素为 `span`（非 `a`、无 `href`）；杨晨旭不再有重复的姓名链接入口。
4. 李雨晴出现在 PhD Candidates，显示 `Since 2022`，与顾佴彬文案一致。
5. 季慧山与无链接毕业生不渲染标签、无空占位。
6. 刘曦雨条目**不显示 Since 文案**（`grade` 本期删除，FR-022），条目不出现空占位或 `Since` 字样。
7. 毕业生 Scholar 渲染正向验证（本期毕业生无 `scholar` 数据）：临时将佀庆一的 `url` 改为 `scholar`（值不变），`npm run build` 通过且其标签为 `Scholar↗`；验证后恢复 `url` 字段与构建结果。

## 5. 标签列宽与列内居中（FR-018 / FR-019 / SC-010）

1. **基准环境**：Chrome 最新稳定版 + 站点默认系统字体栈（18px，Inter 未随站点加载）；Windows 与 macOS 各复测一次。
2. **在读学生（≥480px）**：逐行读取 `.member-link` 的 `getBoundingClientRect()`，计算 `left + width/2` 的中心线，极差 ≤1px（姓名固定列 5em，按姓名最多 4 个汉字设计；现有成员均 3 字）；标签文本单行、无换行/截断。
3. **毕业生（≥768px）**：逐行读取 `.grad-links a` 的 `getBoundingClientRect()`，计算 `left + width/2` 的中心线，极差 ≤1px（首列姓名 5em、标签列 6.5em，居中对齐）。
4. 量测三种标签盒子宽度：`Homepage ↗` ≈106px（106.11px）、`GitHub ↗` ≈74px（74.48px）、`Scholar ↗` ≈77px（76.50px），最大值小于列宽 6.5em(117px)；在 1920 / 1280 / 1024 / 768 / 767 / 576 / 481 / 480 / 375 / 320px 各档均不换行、不溢出。若 Windows/macOS 复测仍换行，按实测宽度 +10% 调整列宽后重测。
5. `<480px`（375 / 320px）：学生标签独占一行、左边缘与姓名左边缘同线（24px 内距起算）；行序为「姓名与年级同行 → 备注自然换行 → 标签最后一行」；毕业生标签行按既有三段式左对齐。
6. 480px 与 481px 两个边界各看一次：**480px 与 481px 均为单行**，**479px 及以下堆叠**（判据为视口宽度，媒体查询 `max-width: 479.98px`），切换处无规则叠加或丢失。
7. 320px 下给某学生填长 `note`：备注在姓名行之后自然换行，标签仍为最后一行、不溢出；验证后还原。
8. 浏览器 200% 缩放与浏览器最小字号检查**不在本期验收范围**（spec Assumptions）。

## 6. 数据互斥负向用例（FR-014 / SC-008）

1. 临时在 `src/data/students.json` 给任一位仅有一个链接的成员补第二个字段（如给顾佴彬加 `github`），依次执行 `npm run check` 与 `npm run build`：
   - 预期**两者均失败并中断**，错误信息包含 `src/data/students.json`、该成员姓名、`url` 与 `github` 两个冲突字段。
   - 验证后**还原**，`check` 与 `build` 恢复通过。
2. 对 `src/data/graduates.json` 重复一次（如给佀庆一加 `github`），预期失败信息包含 `src/data/graduates.json`、姓名与冲突字段；还原后通过。
3. 三字段全填用例（如某成员同时填 `url` + `github` + `scholar`）：错误信息 MUST 按 `url` → `github` → `scholar` 顺序列出全部三个冲突字段，不得只报前两个而静默忽略第三个。
4. 删除某成员的全部链接字段：构建通过、该成员不渲染标签（不强制三选一必填）。

## 7. 跨档无破损与首页回归（Constitution VI / SC-004 / SC-010 / SC-011）

1. 在 1920 / 1280 / 1024 / 768 / 767 / 576 / 481 / 480 / 375 / 320px 浏览 `/team/` 全部区块与 `/` 教师区块：
   - 无元素重叠、文字截断、内容溢出容器、非预期换行；
   - 页面无横向滚动：逐元素检查 `getBoundingClientRect().right ≤ document.documentElement.clientWidth`（至少覆盖 `.student-group`、`.student-name`、`.member-link`、`.graduate-list li`、`.grad-links`、`.grad-dest`、`.teacher-card`）；`document.documentElement.scrollWidth === clientWidth` 仅作辅助信号（`body overflow-x:hidden` 可能夹断该值）。
2. 教师卡片 2×2：≥1280px 下两页各 4 张卡片呈两行两列、同宽（宽度差 ≤1px），无 3+1；卡片内部文字不因变宽而发生异常拉伸或重叠。
3. 毕业生去向列：毕业生姓名列 5em、标签列保持 6.5em，去向列较此前收窄 0.5em（9px）；若长去向在 768 / 1024px 下于列内换行，属既有允许行为，不记为「非预期换行」。
4. 超长条目边缘用例（可选）：本地临时将某学生 `note` 改为长文本，确认在整行内换行收纳、不溢出；验证后还原。
5. 首页 Team 区块仅剩 4 张卡片、无王伟平内容，其余区块无回归。
6. **交付与线上复核（Constitution 维护工作流）**：按 T023 通过 Pull Request 合入；部署完成后打开线上 `/team/` 与 `/`，复核成员、教师、标签矩阵及桌面/移动视口无布局破损（T024）。

## 预期结果（全部通过即特性达成）

- **SC-001**：十档视口下两分组均上下排列、左右边缘偏差 ≤1px、无水平重叠。
- **SC-002**：两页「王伟平」与个人主页地址可见命中 0；`wang-weiping.svg` 不存在且 URL 不可访问。
- **SC-003**：两页教师卡片各 4 张，其余 4 位信息逐项一致。
- **SC-004 / SC-010**：各档布局破损 0、横向滚动 0；标签无换行/截断/重叠；单行态标签在 6.5em 列内居中（中心线极差 ≤1px）。
- **SC-005**：`check` + `build` 通过。
- **SC-006 / SC-007**：标签矩阵与上表 100% 一致；每位成员标签数 ∈ {0,1}；Scholar 标签 1 个（刘曦雨）。
- **SC-008**：三个负向用例均使 `check` 与 `build` 失败并指出文件、姓名、全部冲突字段；还原后通过。
- **SC-009**：李雨晴在 PhD Candidates，显示 `Since 2022`，与顾佴彬一致。
- **SC-011**：≥1280px 下两页教师卡片均为 2×2，每行 2 张、宽度差 ≤1px。
- **SC-012**：刘曦雨不显示 Since，其余成员年级文案不受影响。
