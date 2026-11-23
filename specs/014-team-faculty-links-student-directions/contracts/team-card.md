# Contract: 教师名片链接区（team-card）

**Date**: 2026-11-22（Rev.2：2026-11-23 首页名片与 Team 页统一） | **Spec**: [spec.md](../spec.md) | **消费方**: `TeacherCard.astro` 实现、[quickstart.md](../quickstart.md) 验收 | **数据契约**: [teachers-data.md](./teachers-data.md)

本契约定义 Team 页教师详细名片与首页 Team 概览名片的链接区 DOM 顺序、标签文案、省略规则，以及九档视口下的换行/测量口径。

## 1. 作用域

| 名片类型 | 使用位置 | 调用方式 | 本契约 |
| --- | --- | --- | --- |
| 详细名片 | `/team/` Faculty 区 | `<TeacherCard teacher={teacher} detailed />` | 定义邮箱 + 两个链接 |
| 概览名片 | `/` 首页 Team 区 | `<TeacherCard teacher={teacher} />` | 同一链接契约，不渲染邮箱与 bio |

`TeacherCard` 的 `detailed` 默认值为 `false`；两个调用方 MUST NOT 修改，`detailed` 只控制邮箱与 bio，不控制链接标签或链接数量。

## 2. 两种名片共用的链接区契约

### 2.1 DOM 顺序

`.teacher-links` 内按以下顺序渲染，缺失项直接跳过：

```text
详细名片（Team）：
1. email       → <a href="mailto:{email}">{email}</a>        （既有行为，无箭头）
2. ucasProfile → <a href="{ucasProfile}" target="_blank" rel="noopener">UCAS Profile <span aria-hidden="true">↗</span></a>
3. homepage    → <a href="{homepage}" target="_blank" rel="noopener">Homepage <span aria-hidden="true">↗</span></a>

概览名片（首页）：
1. ucasProfile → 同上 "UCAS Profile ↗"
2. homepage    → 同上 "Homepage ↗"
```

- 标签文案 MUST 精确为 `UCAS Profile` 与 `Homepage`（大小写、空格一致），箭头为独立的 `aria-hidden` span。
- MUST NOT 依据字段是否存在调整相对顺序；MUST NOT 把两个链接合并为下拉、图标或「更多」。
- 邮箱只在 `detailed` 且非空时渲染，且仍在第一位；付鹏 Team 名片三项齐全时依次为「邮箱 → UCAS Profile → Homepage」，首页名片两项依次为「UCAS Profile → Homepage」。

### 2.2 省略规则

| 数据状态 | 渲染 |
| --- | --- |
| `ucasProfile` 非空、`homepage` 为 `null` | 仅 `UCAS Profile ↗` |
| `ucasProfile` 非空、`homepage` 非空 | `UCAS Profile ↗` + `Homepage ↗` |
| `ucasProfile` 为 `null`、`homepage` 非空 | 仅 `Homepage ↗` |
| 两者均为 `null` | 不渲染资料链接；详细名片链接区只保留邮箱（如有）或为空，概览名片链接区为空 |

- `null` / 缺省 MUST 视为未配置，MUST NOT 渲染空 `<a>`、空标签、`#` 占位或加载失败图标。
- 4 位教师当前均为 `ucasProfile` 非空；仅付鹏 `homepage` 非空。两处页面合计验收基准：8 个 `UCAS Profile ↗`、2 个 `Homepage ↗`（付鹏各一）。

### 2.3 安全与可访问性

- `ucasProfile` 与 `homepage` 两个网页外链 MUST 为 HTTPS（由数据契约保证），MUST 带 `target="_blank"` 与 `rel="noopener"`；`mailto:` 邮箱链接沿用既有行为，不受 HTTPS 与新标签页约束。
- 箭头 MUST 对辅助技术隐藏；链接可访问名称分别为「UCAS Profile」「Homepage」。
- 链接 MUST 保持正文链接色板（`--blue-deep`，hover `--blue`），不新增按钮化样式。

## 3. 概览名片

- `detailed = false` 时，`.teacher-links` MUST 渲染与详细名片相同的 `ucasProfile`（`UCAS Profile ↗`）与可选 `homepage`（`Homepage ↗`），仅省去邮箱。
- MUST NOT 再以 `Homepage` 文案指代 UCAS 资料页。
- 首页输出中，教师名片链接区是本特性唯一允许变化的区域：4 张名片各 1 个 `UCAS Profile ↗`，付鹏额外 1 个 `Homepage ↗`；首页其余区块 MUST 零 diff。`index.astro` 文件本身零 diff。

## 4. 布局与换行契约

### 4.1 CSS 契约

```text
.teacher-links {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 18px;
  align-self: flex-start;
}
.teacher-links a {
  white-space: nowrap;   /* 本特性新增：两种名片均整项换行，不在标签内部断行 */
}
```

- 该规则 MUST 同时覆盖详细名片与概览名片，不按 `detailed` 分支区分。
- MUST NOT 为链接区新增固定列宽、Grid 布局、媒体查询或 `overflow-x` 声明。
- MUST NOT 使用页面级 `overflow-x: hidden` / `clip` 掩盖溢出（Constitution VI）。
- 链接区宽度由内容与卡片可用宽度共同决定；空间不足时整项换到下一行，行距 6px。

### 4.2 可用宽度与预期换行

详细名片（含邮箱）：

| 视口 | 名片列数 | 卡片内容宽 | 预期 |
| --- | --- | --- | --- |
| 1920 / 1440 / 1280px | 2 | 510px | 邮箱 + 两链接同一行 |
| 1024px | 2 | 432px | 三项约 404px，同一行 |
| 768px | 2 | 304px | 邮箱 + UCAS 同一行，Homepage 换行 |
| 576px | 1 | 480px | 三项同一行 |
| 480px | 1 | 384px | 三项同一行（余量小） |
| 375px | 1 | 295px | 邮箱 + UCAS 贴边或换行，Homepage 另起 |
| 320px | 1 | 240px | 邮箱独占或与 UCAS 换行；两链接可在同一行或各占一行 |

概览名片（无邮箱）：

| 视口 | 卡片内容宽 | 预期 |
| --- | --- | --- |
| ≥768px | ≥304px | `UCAS Profile ↗` + `Homepage ↗`（约 234px）单行 |
| 375px | 约 295px | 单行 |
| 320px | 约 240px | 单行（余量约 6px）；字体回退导致不足时整项换行 |

- 上述为文字宽度估算；验收以真实浏览器为准。任一视口允许整项换行到多行，不要求固定行数。
- 单项最宽约 120px（`UCAS Profile ↗`），小于最窄内容宽 240px，`nowrap` 不会造成单项溢出。

### 4.3 破损判定

在 320 / 375 / 480 / 576 / 768 / 1024 / 1280 / 1440 / 1920px 九档视口，以逐元素 `getBoundingClientRect()` 越界检查为权威判据，以下任一情形即 FAIL：

1. 链接文字与其他元素视觉重叠；
2. 链接文字被裁剪、省略或显示不全（`scrollWidth > clientWidth`）；
3. 链接元素越出卡片内容边界（以逐元素 `getBoundingClientRect()` 超出卡片 padding box 为权威判据）；
4. `UCAS Profile` / `Homepage` 在单词内部断行（整项换行允许）；
5. 页面出现横向滚动：`document.documentElement.scrollWidth > window.innerWidth`。

## 5. 回归范围

- `src/pages/team.astro`、`src/pages/index.astro`、`src/components/StudentGroup.astro` MUST 零 diff。
- 首页仅教师名片链接区按本契约变化；首页新闻、Team 概览标题、发表、Gallery 等其余区块 MUST 与实施前一致。
- 教师照片、职称、方向 chip、bio 与 <576px 头部布局 MUST 不变。
- 学生分组、毕业生列表、发表页、新闻页、导航与页脚 MUST 不受影响。
