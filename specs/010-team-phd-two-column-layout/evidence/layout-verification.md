# Layout Verification: Team 页 PhD Candidates 双栏布局

**Feature**: [spec.md](../spec.md) | **Plan**: [plan.md](../plan.md) | **Quickstart**: [quickstart.md](../quickstart.md)
**Date**: 2026-11-21

## Measurement Setup

- 真实浏览器：Chromium 131（Playwright 1.49.1，headless，`deviceScaleFactor: 1`）
- 视口：整数宽度 1920 / 1440 / 1280 / 1024 / 768 / 767 / 576 / 481 / 480 / 375 / 320px，高度 900px
- 地址：`http://localhost:4321/nlp-home/team/`（开发服务器配置了 `base: '/nlp-home'`，故带 base 前缀）
- 量测口径：`getBoundingClientRect()` 逐元素取值；栏宽取 `.phd-columns > ul`；越界取 `main *`；视口溢出取 `documentElement.scrollWidth - innerWidth`
- 说明：容器未安装 CJK 字体，截图中的汉字显示为缺字方框；文本内容以 DOM `textContent` 核对，几何以元素外接矩形量测，互不替代

## Baseline

| 项目 | 结果 |
| --- | --- |
| Commit | `7fca3a06ccf3564c67fa441bc8e8da11a3f2d96a` |
| `npm run check` | 退出码 0；22 files，0 errors / 0 warnings / 0 hints |
| `npm run build` | 退出码 0；19 pages built，Complete |
| PhD 记录数 | 9 |
| 有 `grade` | 6（2020 ×1 / 2021 ×2 / 2022 ×3） |
| 有唯一链接 | 8（url 4 / github 3 / scholar 1） |
| 无链接 | 季慧山 |
| 无年级 | 李江楠、刘曦雨、刘正宵 |
| 有 `note` | 0 |
| 排序结果 | 杨晨旭(2022) → 顾佴彬(2022) → 李雨晴(2022) → 季慧山(2021) → 郑明钰(2021) → 张瀚文(2020) → 李江楠(—) → 刘曦雨(—) → 刘正宵(—) |
| 改动前组件快照 | `git show HEAD:src/components/StudentGroup.astro > /tmp/student-group-base.astro`（177 行） |
| 数据快照 | 计数输出保存于 `/tmp/phd-baseline.txt` |

## 十一档视口矩阵

> 差值单位 px（容差 ≤1）；"视觉栏数"取 `getComputedStyle(.phd-columns).gridTemplateColumns` 的轨道数；越界计数为 `main *` 中越出视口的元素数。

| 视口 | 视觉栏数 | 两栏宽度差 | 顶线差 | Since 左缘差 | 链接右缘差 | 跨区块姓名左缘差 | 越界计数 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1920px | 2 | 0 | 0 | 0（栏内） | 0（栏内） | 0 | 0 |
| 1440px | 2 | 0 | 0 | 0（栏内） | 0（栏内） | 0 | 0 |
| 1280px | 2 | 0 | 0 | 0（栏内） | 0（栏内） | 0 | 0 |
| 1024px | 2 | 0 | 0 | 0（栏内） | 0（栏内） | 0 | 0 |
| 768px | 2 | 0 | 0 | 0（栏内） | 0（栏内） | 0 | 0 |
| 767px | 1 | — | — | 0 | 0 | 0 | 0 |
| 576px | 1 | — | — | 0 | 0 | 0 | 0 |
| 481px | 1 | — | — | 0 | 0 | 0 | 0 |
| 480px | 1 | — | — | 0 | 0 | 0 | 0 |
| 375px | 1 | — | — | —（竖排：右缘差 0） | —（竖排：左缘差 0） | 0 | 0 |
| 320px | 1 | — | — | —（竖排：右缘差 0） | —（竖排：左缘差 0） | 0 | 0 |

> 全部档位 `documentElement.scrollWidth - innerWidth = 0`；`.phd-columns` 及其后代元素 `scrollWidth/scrollHeight` 均未超出 `clientWidth/clientHeight`（无截断）。

## US1 — 两栏结构（1920 / 1440 / 1280 / 1024 / 768px）

| 视口 | 两栏宽度 | 宽度差 | 顶线差 | 栏距 | 左/右外缘差 | 每栏条数 | 总行数 | 最长记录宽（内容区一半 +1） |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1920px | 550 / 550 | 0 | 0 | 32 | 0 / 0 | 5 / 4 | 9 | 550（≤566） |
| 1440px | 550 / 550 | 0 | 0 | 32 | 0 / 0 | 5 / 4 | 9 | 550（≤566） |
| 1280px | 550 / 550 | 0 | 0 | 32 | 0 / 0 | 5 / 4 | 9 | 550（≤566） |
| 1024px | 472 / 472 | 0 | 0 | 32 | 0 / 0 | 5 / 4 | 9 | 472（≤488） |
| 768px | 344 / 344 | 0 | 0 | 32 | 0 / 0 | 5 / 4 | 9 | 344（≤360） |

- `h3` "PhD Candidates" 在全部档位均只出现 1 次，横跨内容区并位于两栏上方。
- 行序与 [data-model.md](../data-model.md) §1 一致：左栏杨晨旭、顾佴彬、李雨晴、季慧山、郑明钰；右栏张瀚文、李江楠、刘曦雨、刘正宵；9 个姓名各出现一次。
- `n=1` / `n=0` 分支按代码路径核验（数据只读，未构造实例）：`n=1` 渲染单个 `<ul>` 且包装层带 `.is-single`，≥768px 时轨道回落为 `minmax(0,1fr)`，不产生空栏；`n=0` 保留 `p.empty`「PhD candidates coming soon.」且不渲染 `.phd-columns`。

## US2 — 行内三槽与对齐（1440 / 768px）

| 视口 | 栏 | Since 左缘差 | 链接右缘差 | 链接右缘与 `ul` 右缘 −24px | 行内单行（`li` 高 / 链接顶差） |
| --- | --- | --- | --- | --- | --- |
| 1440px | 左（5 条） | 0 | 0 | 0 | 47.69px / 0 |
| 1440px | 右（4 条） | 0 | 0 | 0 | 47.69px / 0 |
| 768px | 左（5 条） | 0 | 0 | 0 | 47.69px / 0 |
| 768px | 右（4 条） | 0 | 0 | 0 | 47.69px / 0 |

- 计数：`.phd-columns` 内 9 行、6 个 `.grade`、8 个 `.member-link`；`.student-name a` 数量 0（姓名纯文本）。
- 缺失字段：季慧山行仅 `span.student-name` + `span.grade`，无 `.member-link` 节点；李江楠 / 刘曦雨 / 刘正宵行仅姓名 + 链接，无 `.grade` 节点；逐行 `textContent` 无 "N/A"、破折号、`&nbsp;` 等占位。
- 跨区块姓名：左栏 `.student-name` 左缘与 `.grad-name` 左缘差 0（1440 / 768 / 767 / 480 / 375 / 320 全部档位均为 0）。
- 768px 三槽实测（[quickstart §8](../quickstart.md)）：姓名槽 72px（4em）、Since 槽 90px（5em，文本 "Since 2022" 实际 76px）、链接 "Homepage ↗" 占用 108.16px、行内可用宽 296px；三槽实际占用合计 72 + 76 + 108.16 + 16 = 272.16 ≤ 296，第三列可用 118px ≥ 108.16px（余量 9.84px）。**无需收紧 5em，也无需将列间隙由 8px 改为 4px。**

## US3 — 单栏与竖排退化（767 / 576 / 481 / 480 / 375 / 320px）

| 视口 | 视觉栏数 | 行数 | 行内可用宽 | 行内形态 | Since 左缘差 | 链接右缘与 `ul` 右缘 −24px | `li` 高（单行） |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 767px | 1 | 9 | 671px | 横向三槽 | 0 | 0 | 47.69px |
| 576px | 1 | 9 | 480px | 横向三槽 | 0 | 0 | 47.69px |
| 481px | 1 | 9 | 385px | 横向三槽 | 0 | 0 | 47.69px |
| 480px | 1 | 9 | 400px | 横向三槽 | 0 | 0 | 47.69px |

- 四档均无行内折行（链接与姓名顶差 0，行高 47.69px 恒定），两段列表首行分隔线不重复（第二个 `ul` 首行 `border-top-width: 0px`），9 行自上而下无空栏、无半宽列。

| 视口 | Since 右缘跨行差 | Since 右缘与 `ul` 右缘 −24px | 链接左缘与同行姓名左缘差 | 链接位于姓名下一行 | 季慧山行链接节点 |
| --- | --- | --- | --- | --- | --- |
| 375px | 0 | 0 | 0 | 是 | 无 |
| 320px | 0 | 0 | 0 | 是 | 无 |

- 375 / 320px 为竖排两行：第 1 行姓名居左、Since 右对齐；第 2 行链接独占整行、左缘与姓名左缘同线；季慧山行不渲染锚点；无年级三行不渲染 `.grade`。

## Regression

| 对象 | 结果 |
| --- | --- |
| Master's Students | 11 档均为占位文案 "Master's students coming soon."，分组内无 `.phd-columns`、无 `li`（`li` 数 0），样式未受影响 |
| Graduates | 14 条内容不变；≥768px 为五列桌面形态（去向与链接不与姓名同排），<768px 为三段式（去向在姓名下一行、链接在去向下一行）；`.grad-name` 距列表左缘 24px，PhD 姓名与 `.grad-name` 左缘差 0 |
| 其他区块 | Faculty 教师名片、页头页脚与其余页面未改动；11 档越界计数均为 0 |

## Breakage

- 11 档视口：`documentElement.scrollWidth - window.innerWidth = 0`；`main *` 越界元素数 0；`.phd-columns` 内无元素 `scrollWidth/scrollHeight` 溢出；姓名 / Since / 链接三槽无水平重叠；无表头、无栏间竖线、无空栏。
- 1440 / 768 / 375px 截图目视复核：两栏 5 + 4、单栏横排、竖排两行结构均符合契约；截图仅存于 `/tmp/pw/`，未入库。

## Scope

```
$ git diff --stat
 src/components/StudentGroup.astro | 168 +++++++++++++++++++++++++++++++++----
 1 file changed, 151 insertions(+), 17 deletions(-)

$ git status --short
 M src/components/StudentGroup.astro
?? specs/010-team-phd-two-column-layout/
```

- `git diff --name-only -- src/data/students.json src/pages/team.astro src/styles/global.css src/content.config.ts src/components/TeacherCard.astro` 输出为空（0 个文件）。
- 零新增依赖、零新增组件、零新增运行时 JS；未使用页面级 `overflow-x: hidden` / `clip`。

## Gates

| 时点 | 命令 | 结果 |
| --- | --- | --- |
| 基线（实现前） | `npm run check && npm run build` | check 退出 0（0/0/0，22 files）；build 退出 0（19 pages，Complete） |
| 最终（2026-11-21 18:10） | `npm run check && npm run build` | check 退出 0（0/0/0，22 files）；build 退出 0（19 pages built in 1.35s，Complete） |
