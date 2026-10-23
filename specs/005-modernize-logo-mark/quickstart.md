# Quickstart: 课题组图标现代化（Logo Mark Modernization）

**Feature**: `005-modernize-logo-mark` | **Date**: 2026-10-17（同日修订：三候选工作流；2026-10-20 修订：评审工作流口径） | **Spec**: [spec.md](./spec.md) | **契约**: [logo-mark.md](./contracts/logo-mark.md) / [candidates-review.md](./contracts/candidates-review.md) / [site-integration.md](./contracts/site-integration.md)

本指南用于**验收已实现的本特性**（不是实现步骤）。§1 为阶段一（候选评审与选定，FR-009），§2 起为阶段二（全站落地）的验证。全部命令在仓库根目录执行；除 `npm ci` 外不需要联网。实现细节见 tasks 阶段产物，此处只列可复现的验证动作与预期结果。

## 0. 前置条件

```bash
node -v          # ≥ 22
npm ci           # 已有 node_modules 可跳过
npm run dev      # 可选：本地站点（默认 http://localhost:4321/nlp-home/）
```

- 浏览器：Chrome / Firefox / Safari / Edge 最新版之一（DevTools 可用）。
- 光栅化辅助（可选）：`sharp` 由 Astro 图像管线间接提供，**不属于本特性依赖**，不写入 `package.json`；命令只写入临时目录，不提交任何脚本或图片。

## 1. 候选对比页与选定评审（FR-009 / US1 AS6 / SC-006 时点）

1. 浏览器直接打开 `specs/005-modernize-logo-mark/candidates/comparison.html`（`file://` 或任意静态服务器均可，无需启动站点）。
2. 核对页面结构：**四行**（现有图标 / 候选 A「疾进」/ 候选 B「锋锐」/ 候选 C「极构」）× **四档渲染**（128px、64px、高 22px、高 16px）齐全；22px 档为白色顶栏模拟条；16px 档注明"favicon 按选定版派生，此列为等比模拟"；每行有杠杆与口径标注；页面零 JS、无外部请求（DevTools Network 面板为空）。
3. 对三版候选逐版核对身份不变量清单（SC-001 口径）：
   - [ ] 三枚向右箭头形色块：**3 枚**、顺序橙 → 绿 → 蓝、方向向右；
   - [ ] 白色辅助符号 **3 个**（允许 1–3），分别在橙色带（文 / 语言）、绿色带（脑 / 认知）与蓝色带（笔 / 书写），语义可读出、无堆叠；
   - [ ] 右下蓝色尖角仍在；
   - [ ] 画布 4:3（宽高比变化 0% ≤20%）；三色色相不变（候选 C 允许 L/S 偏移 ≤20%，以行标注的 Δ 与 SELECTION 记录核对）；无渐变；
   - [ ] 无新增无关图形/文字/装饰；整体扁平。
4. 三档尺寸逐版目视：64px 档文 / 脑 / 笔可辨；22px 档三色边界清晰、白色为均匀点缀；16px 档三色可辨、箭头轮廓可辨。（候选阶段对 SC-002 / SC-003 仅作目视定性判断，以对比页三档渲染为据；两者的量化验收仅针对选定版——见 §4 / §6。）
5. **维护者选定**：从三版中选定一版（选定依据：身份不变量为硬性门槛，其余取舍交由维护者裁量），确认 `candidates/SELECTION.md` 已记录（候选 id、选定人、日期、理由、选定版参数与色值快照）。
6. **SC-006 外部评审**（选定之后、合入之前，仅针对选定版）：评审者为未参与设计的实验室老师（≥1 人，由维护者邀请；维护者本人与候选制作方均属"参与设计"，不得担任）；评审者在无提示的并排对照下对"现状 vs 选定版"作出两项判定——"同一标识的现代化版本"与"更现代、未大改整体设计"（两项判定由同一评审者作出，均须通过）；结论记录于 `SELECTION.md`。维护者无法从三版中选定任何候选、或选定版未通过 SC-006 → **重新生成三版候选**并重新进入对比评审与选定流程（不逐版盲评）；外部评审者不可得、意见不一致、迭代轮数上限等评审流程异常不由本轮定义，由维护者届时裁量。

> §2 起的全部验证以"选定版已通过 SC-006、两份资产与 Navbar 属性已按阶段二落位"为前提。

## 2. 机器门禁（必须全绿）

```bash
npm run check     # 预期：Result (20 files) — 0 errors, 0 warnings, 0 hints
npm run build     # 预期：[build] Complete!，18 page(s) built
```

- 任一失败即视为未通过（FR-008 / SC-005）。
- CI 的 `npx astro check` 与构建步骤不变，无需改动流水线。

## 3. 资产技术检查（纯矢量 / 自包含 / 无旧引用 / 色值按选定版）

```bash
# 只应存在两份站点图标资产（教师头像另计）
ls -l public/logo.svg public/favicon.svg
# 禁止项自检：以下命令应无输出
grep -nE '<image|<foreignObject|<script|data:image|draw\.io|host=|xmlns:v|<metadata|<linearGradient|<radialGradient|<filter|@import|xlink:href|url\(http' public/logo.svg public/favicon.svg
# 色值核对（以 candidates/SELECTION.md 记录的选定版色值为准）
grep -oE '#[0-9a-fA-F]{6}' public/logo.svg | sort | uniq -c
grep -oE '#[0-9a-fA-F]{6}' public/favicon.svg | sort | uniq -c
# 旧引用/旧资产检查（应只有 site.json 的路径值，以及 README 的字段说明）
git grep -nE "logo\.svg|favicon\.svg" -- src public
find public -maxdepth 1 -name '*.svg'
# 评审产物未进入站点（应无输出）
git grep -nE "candidate-[abc]\.svg|comparison\.html" -- src public
```

预期：

- 色值（迭代 2）：选定 A → 仅 `#f7941d`、`#28ae6c`、`#037ec2`；选定 B → 仅 `#f8a138`、`#2cbf77`、`#038bd5`（统一 +10% L）；选定 C → 仅 `#eb8408`、`#23995f`、`#036fab`（统一 −12% L）；logo 另含 `#ffffff`。三者均色相不变、L/S 偏移 ≤20%，且须与 SELECTION.md 记录逐字一致。不得出现记录之外的任何颜色。
- 两份文件体积均 ≤ 2KB（参考：≈1.0KB / ≈0.5KB）。
- `viewBox` 分别为 `0 19 140 105` 与 `-10 -21 160 160`；无 `width`/`height` 或其为同比例值。
- 三版均含 `<defs>` 中**一个** `clipPath`（`id` 唯一）；三色色块位于裁切组内；尖角路径位于裁切组外。
- `public/logo.svg` 与 `candidates/candidate-{选定}.svg` 几何一致（仅允许无语义空白/注释差异）。

## 4. 尺寸矩阵光栅化（16 / 22 / 64 / 128 / 256px）

```bash
CHECK_DIR="$(mktemp -d)" && echo "$CHECK_DIR"
# 若实现已提交，把 HEAD 换成改动前的提交（如 HEAD^）
git show HEAD:public/logo.svg    > "$CHECK_DIR/logo-old.svg"
git show HEAD:public/favicon.svg > "$CHECK_DIR/fav-old.svg"
CHECK_DIR="$CHECK_DIR" node -e '
const sharp = require("sharp"), fs = require("fs"), d = process.env.CHECK_DIR;
(async () => {
  for (const h of [16, 22, 64, 128, 256])
    await sharp(fs.readFileSync("public/logo.svg"), { density: 3200 }).resize({ height: h }).png().toFile(`${d}/logo-new-${h}.png`);
  for (const h of [16, 22, 64])
    await sharp(fs.readFileSync(d + "/logo-old.svg"), { density: 3200 }).resize({ height: h }).png().toFile(`${d}/logo-old-${h}.png`);
  for (const [n, f] of [["new", "public/favicon.svg"], ["old", d + "/fav-old.svg"]])
    for (const h of [16, 32])
      await sharp(fs.readFileSync(f), { density: 3200 }).resize({ height: h }).png().toFile(`${d}/fav-${n}-${h}.png`);
  console.log("rendered to", d);
})()'
```

逐项核对（可用系统看图工具并排/放大，或把 PNG 贴进任意图片查看器）：

| 检查 | 预期 |
|------|------|
| 顶栏 22px（新旧并排） | 三色边界清晰；白色符号为三个均匀、有意的点缀；无糊块、脏边、锯齿、裁切；明显优于旧版（旧版白色区域糊成一片、钢笔近不可见） |
| 64px / 128px / 256px | 文 / 脑 / 笔的主形态可逐个辨认；轮廓处理（锐利 / 圆角）与尖角清晰；无变形 |
| favicon 16px | 橙/绿/蓝可相互区分；向右箭头轮廓可辨；与旧版同尺寸观感一致或更干净 |
| favicon 32px | 轮廓干净；三色边界锐利 |
| 高 DPR | 在 DevTools 设 DPR 2 / 3 后重复顶栏与 favicon 检查：边缘清晰、无模糊 |

> `sharp` 不可用（例如以 `--omit=optional` 安装依赖）时，改用浏览器打开 `public/logo.svg` / `public/favicon.svg`，用 DevTools 设备像素比与缩放核对；不因工具缺失而新增依赖。

## 5. 身份并排比对（SC-001 / SC-006 结论复核）

1. 用第 4 步的 `logo-old.svg` 与 `public/logo.svg` 在 ≥128px 并排查看（或叠加对比）。
2. 逐条核对身份不变量清单：

- [ ] 三枚向右延展的箭头形色块：**3 枚**、顺序橙 → 绿 → 蓝、方向向右；
- [ ] 白色辅助符号：**3 个**（允许 1–3），分别在橙色带（文/语言）、绿色带（脑/认知）与蓝色带（笔/书写），语义可读出；
- [ ] 右下蓝色箭头尖角点缀仍在；
- [ ] 整体轮廓可辨认为同一标识；画布宽高比变化 ≤20%（本设计 0%）；三色色相不变、L/S 偏移 ≤20%（选定 C 时与 SELECTION.md 记录值核对）；
- [ ] 无新增无关图形、文字或装饰；整体扁平（无渐变/阴影/发光/3D/纹理/动效）；
- [ ] SC-006 已在合入前完成（§1.6 记录）：未参与设计的实验室老师在同一无提示并排对照下作出"同一标识的现代化版本"与"更现代、未大改整体设计"两项判定，且均通过。

## 6. SC-003 数值量测（以设计文件坐标，按选定版参数）

以 `public/logo.svg` 的 viewBox 坐标直接量测（1 单位 = 顶栏 22px 下的 0.21px）：

| 指标 | 门槛 | 预期值 |
|------|------|--------|
| 三个符号的笔画宽度 | 极差 ≤10% | 选定 A/B 均为 2.8、选定 C 均为 3.0 → 极差 **0%** |
| 符号中心 vs 所属色带横截面中点（y=59 处） | 偏差 ≤ 色带高度 80 的 5%（4 单位） | 锚点即中点（A：橙 27 / 绿 75 / 蓝 118；B：23 / 67 / 114；C：21 / 63 / 112）；墨迹 bbox 中心偏差 ≤0.25 单位（文 y0.18、脑 0.00、笔 0.00） |
| 符号墨迹到最近分色边界 | ≥ 6.4 单位（80×8%，亦 ≥32×20%） | A：文 11.73 / 脑 7.09 / 笔 7.38；B：9.52 / 7.84 / 11.70；C：8.21 / 8.10 / 13.88 |
| 符号是否越界 | 必须完整位于单一色带内 | 否（无越界、无跨越） |
| 画布填充 | 无异常留白/裁切 | 内容覆盖宽高均 ≥90%（A 98.6% × 96.7%、B 98.7% × 96.1%、C 99.0% × 96.1%） |

量测方法：把锚点平移到对应色带，按路径坐标 + 笔画半径（A/B 1.4、C 1.5）取墨迹外沿；分色边界为 chevron 折线族——折线水平 run 为 `w`（A/B/C = 27/23/21）、竖直 40，故上段法向为 `(40, −w)`、下段为 `(40, w)`，法向模长 `√(1600+w²)`；点到线距离 = `|40·(x−x_fold) − w·(y−59)| / √(1600+w²)`（橙/绿折线自 `(w,19)` 起，绿/蓝折线自 `(w+G,19)` 起，`G` = 绿带宽度 42/42/42）。也可用任意 SVG 编辑器/脚本量测包围盒与描边外沿，结果应与上表一致。

## 7. 站点级视觉与 favicon 检查

```bash
npm run build && npm run preview   # http://localhost:4321/nlp-home/
```

- 顶栏：品牌区仍是"左 logo + 右 CIGMA"，logo 与文字等高；DevTools 量得 `img` 渲染尺寸约 29.4×22.1（4:3，`1.2em` × `1.15rem` × 16px 根字号），未被拉伸；logo 不再出现旧版白色糊块。
- 标签页：新 favicon（强制刷新或新会话，排除缓存）；与 `public/favicon.svg` 一致；16px 下三色可辨。favicon 验收仅按 SC-002 的 16px 口径执行（SC-006 不覆盖 favicon，无需单独评审）。
- 深色标签栏：把系统/浏览器标签栏切为深色（或深色收藏夹），确认 favicon 三色仍可区分（不依赖白色细节）。
- 浏览器缓存旧 favicon 属正常缓存，用硬刷新/新会话复核，不作为缺陷。
- 全站 4 类页面（Home、News 列表与详情、Team、Publications）逐一确认顶栏与标签页一致。

## 8. 视口回归（FR-006 / FR-008 / SC-004）

DevTools 响应式模式依次检查 **375 / 768 / 1024 / ≥1280px**，并覆盖 **320px** 最窄下限与边界 **575 / 767 / 1279px**：

- [ ] 品牌区始终同一行、logo 与文字不折断，不与导航重叠/截断；
- [ ] 导航项换行正常，无挤压或截断；
- [ ] 页面无横向滚动（`document.documentElement.scrollWidth <= innerWidth`）；
- [ ] 点击品牌区回到主页；logo 不被点击放大、无灯箱；
- [ ] 其余版式（字体、字号、间距、配色）与改版前一致。

## 9. 构建期校验负向用例（FR-008 / SC-005）

```bash
mv public/logo.svg public/logo.svg.bak
npm run build   # 预期：失败，错误信息指向 src/data/site.json 的 "logo" 与目标路径
mv public/logo.svg.bak public/logo.svg
npm run build   # 预期：恢复正常
```

可选第二例：把 `site.json` 的 `logo` 临时改为 `/logo-missing.svg` → 构建报错 → 还原 → 构建恢复。**MUST 全部还原**，不得把临时改动提交。

## 10. 无障碍与行为

- 顶栏 logo 的 `alt` 为空（装饰性），品牌区可访问名来自可见文字 "CIGMA"（用 DevTools Accessibility 面板核对）；
- 品牌区无新增可聚焦元素、无 JS 事件、无放大/灯箱；
- favicon 替换不改变文档语义或读屏顺序。

## 11. 改动范围核对

```bash
git status --short
git diff --stat
git diff -- src/components/Navbar.astro   # 预期：仅 width/height 32×32 → 40×30
git diff -- public/logo.svg public/favicon.svg
```

- 预期站点代码改动仅：`public/logo.svg`、`public/favicon.svg`、`src/components/Navbar.astro`；另有 `specs/005-modernize-logo-mark/` 下的特性文档与 `candidates/` 评审产物（候选 SVG、对比页、SELECTION.md）。
- 不得出现：`site.json`、`BaseLayout.astro`、`content.config.ts`、`global.css`、页面/数据文件改动；不得残留旧图标文件或旧引用；`candidates/` 产物不得进入 `public/` 或 `src/`。

## 12. 清理

删除第 4 步的临时目录与任何本地 PNG/脚本：

```bash
rm -rf "$CHECK_DIR"
```

`.tmp*/` 或临时渲染目录不得提交。

## 13. Definition of Done（映射 Success Criteria）

- [ ] **FR-009**：三版候选均过身份不变量与放宽口径；对比页 4 行 × ≥64px / 22px / 16px 三档渲染齐全、自包含零 JS；候选阶段 SC-002 / SC-003 仅目视定性判断；维护者选定已记录（SELECTION.md）；SC-006 仅针对选定版、时点在合入前（§1）；失败路径 = 重新生成三版候选并重跑流程。
- [ ] **SC-001**：身份不变量清单 100% 通过（§5），新旧并排判为同一标识；三色色相不变、L/S 偏移 ≤20%、宽高比变化 ≤20%（本设计 0%）、无新增装饰。
- [ ] **SC-002**：22px 三色边界清晰、白色点缀均匀；16px favicon 三色可辨、箭头轮廓可辨；64px 以上三个符号可逐个辨认（§4）。
- [ ] **SC-003**：笔画极差 0%、中心偏差 ≤0.25 单位、最小安全边距 ≥6.4 单位（§6，按选定版参数）。
- [ ] **SC-004**：4 类页面顶栏与标签页均呈现新图标；无旧资产/旧引用；无导航换行、重叠、截断、挤压或横向滚动（§7、§8、§11）。
- [ ] **SC-005**：`npm run check` + `npm run build` 100% 通过；320–≥1280px 各档无破损；无新增依赖；构建期负向用例仍报错中断（§2、§8、§9）。
- [ ] **SC-006**：未参与设计的实验室老师（≥1 人，由维护者邀请；维护者本人与候选制作方不得担任）在同一无提示并排对照下作出"同一标识的现代化版本"与"更现代、未大改整体设计"两项判定（同一评审者、均须通过）；记录于 SELECTION.md（§1.6）；SC-006 不覆盖 favicon。

## 14. 范围外

- 部署后线上渲染核对：由 CI / 既有维护工作流承载，不属本特性验收；
- 深色模式、打印、灰度/单色、<16px、分享卡片/头像/PWA 图标、动效版本：不在本轮范围（spec Assumptions）；
- 对比页的部署、站点化或长期维护：不在范围（评审用临时产物）。
