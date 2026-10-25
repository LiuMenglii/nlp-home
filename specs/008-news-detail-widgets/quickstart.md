# Quickstart: 新闻详情页重点控件与三论文解读新闻

**Feature**: `008-news-detail-widgets` | **Date**: 2026-10-23

本文件是构建、预览、验收与故障注入的执行清单。每项检查都应记录“命令、结果、截图或哈希”；未记录视为未验证。

## 1. 前置条件

- Node.js ≥ 22.12.0；已安装依赖（`npm ci` 或 `npm install`）。
- 依赖锁定：`@astrojs/markdown-satteri@0.4.3`、`satteri@0.10.5` 在 `devDependencies` 中精确版本，不带 `^`（CHK027）。
- 浏览器：Chrome、Firefox、Safari、Edge 最近两个大版本中的至少两款。

## 2. 基线记录（改动前，CHK038）

```bash
# 1. 记录既有新闻详情页 HTML 关键片段或整页 hash
mkdir -p /tmp/news-baseline
for f in dist/news/*/index.html; do
  [ -f "$f" ] && sha256sum "$f"
done > /tmp/news-baseline/before.sha256

# 2. 记录构建 warning 数量（基线）
npm run build 2>&1 | tee /tmp/news-baseline/build-before.log
grep -ci "warn" /tmp/news-baseline/build-before.log

# 3. 记录既有新闻列表页卡片截图（375px 与 1280px）
```

- 若 `dist/` 尚未生成，先执行一次 `npm run build` 再记录。
- 基线 warning 数量写入本文件或任务记录；实现后新增 warning 视为回归（FR-036/048）。

## 3. 启动与构建

```bash
npm run dev      # 本地预览，默认 http://localhost:4321/nlp-home/
npm run build    # 生产构建；硬错误应失败
npm run check    # 类型/模板检查
```

- 新闻详情页：`/nlp-home/news/self-taught-rlvr-2026/`
- 新闻列表页：`/nlp-home/news/`
- 若 404，先确认 `npm run build` 通过且 slug 与文件名一致。

## 4. 内容验收

### 4.1 结构

- [X] 文章为“总—分—总”：开篇统一叙事 → RLSD 节 → NPO 节 → CoPD 节 → 表格块对比 + 综合讨论 → 启示。
- [X] 三个论文小节均按“问题 → 方法 → 结论”展开，未使用六段式模板（CHK001）。
- [X] 每节首段写明真实论文标题、作者/机构（IIE, CAS / UCAS / JD.COM）、公开链接与版本；NPO 标题不得只写“NPO”（CHK002）。
- [X] 每节列出官方代码/模型信息：RLSD 的 GitHub 仓库；NPO/CoPD 未发现官方代码仓库，列出其 Hugging Face 论文页（FR-026）。
- [X] 全文 ≥3 个 BibTeX 块、≥2 个高亮块、≥1 个表格块、3 张主图。（实测 3 / 3 / 1 / 3）
- [X] 正文 ≥2,500 个 CJK 字符；仅统计 CJK 统一表意文字，排除 frontmatter、BibTeX/围栏代码块与行内代码，包含图注与表格文字（FR-028）。（实测 3,654）

**字数统计命令（参考）**：

```bash
python3 - <<'PY'
import re, pathlib
text = pathlib.Path('src/content/news/self-taught-rlvr-2026.md').read_text(encoding='utf-8')
# 去掉 frontmatter、fenced code、行内代码
text = re.sub(r'^---[\s\S]*?---', '', text, count=1)
text = re.sub(r'```[\s\S]*?```', '', text)
text = re.sub(r'`[^`]*`', '', text)
cjk = re.findall(r'[\u4e00-\u9fff]', text)
print(len(cjk))
PY
```

- [X] 输出 ≥2500（实测 3,654）。

### 4.2 BibTeX（CHK004/CHK033/CHK035）

- [X] 三条条目均为 arXiv `@misc`（RLSD/NPO/CoPD），不写 `booktitle`/`volume`/`note`。
- [X] 三条均有 `eprint`/`archivePrefix = {arXiv}`/`primaryClass = {cs.LG}`/`url`；正文与条目均不呈现 NeurIPS 接收状态（2026-10-23 决议）。
- [X] citation key 为 `yang2026rlsd`、`qin2026npo`、`gu2026copd`；标题用花括号保护大小写；作者全列。
- [X] NPO 数字均来自 v2，不混用 v1 或参考文章数字。

**解析验证（任选其一，需实测一次）**：

```bash
# 方式 A：BibTeX + plainnat
cat > /tmp/refs.bib <<'BIB'
（粘贴三条条目）
BIB
cat > /tmp/refs.tex <<'TEX'
\documentclass{article}
\begin{document}
\nocite{*}
\bibliographystyle{plainnat}
\bibliography{refs}
\end{document}
TEX
cd /tmp && pdflatex refs.tex >/dev/null 2>&1 && bibtex refs && pdflatex refs.tex >/dev/null 2>&1
# 期望：bibtex 无 error，生成 refs.bbl

# 方式 B：biber/biblatex（若已安装）
# 方式 C：在线 BibTeX 解析器（记录工具名与结果）
```

- [X] 解析无 error（2026-10-25：BibTeX 0.99e / TeX Live 2026，`plain.bst`，3 条条目，退出码 0，生成 `refs.bbl`；见 `evidence/t053-content.json`）。

### 4.3 表格块（CHK003）

- [ ] 对比表为 `:::table[...]` 包裹的标准 Markdown 表格，不是图片。
- [ ] 4 列（维度 + RLSD/NPO/CoPD），行覆盖教师信号来源、是否引入额外信息、核心代价与风险、适用阶段等 ≥4 个维度。
- [ ] 375px 下表格只在 `.news-table__scroll` 内横向滚动；页面无横向滚动。
- [ ] Tab 可聚焦表格容器，方向键可滚动，焦点外框可见。
- [ ] 无标题表格块不出现空图注（可用临时新闻验证）。

### 4.4 配图与许可（CHK007/CHK020/CHK021/CHK039）

- [ ] 三张主图均为方法/框架总览图，来自论文官方页面，文件在 `src/content/news/`。
- [ ] 每张图有中文 alt，说明方法/流程，不是“图 1”或逐字翻译。
- [ ] 图注含论文标题、arXiv 链接、`CC BY 4.0` 许可链接与“图片未修改，仅按页面宽度缩放”。
- [ ] 点击图片，或点击图注中的论文链接，在新标签页打开论文页（不是本地原图）。
- [ ] 图片不放大超过固有尺寸；单张 ≤500KB；构建后无破图。
- [ ] 图注为普通段落，不是 `<figcaption>`（CHK022）。

### 4.5 原创与参考文章（CHK036）

- [ ] 正文无“参考解读”署名或链接。
- [ ] 与参考文章无逐字照搬的整段文字；连续重合 ≤30 字（非门禁，发布后抽查）。

## 5. 控件与交互验收

### 5.1 高亮块

- [ ] 带标题块：标题为 `role="heading" aria-level="3"`，样式正确。
- [ ] 无标题块：无空标题行，仍有左侧 4px 强调竖线与边框（CHK008）。
- [ ] 正文含加粗、斜体、行内代码、链接、列表时正常排版。
- [ ] 375px 下长 URL 折行，不撑破容器，页面无横向滚动。
- [ ] 多个高亮块独立、间距合理；块有 `margin-block` 形成上下外边距。
- [ ] 对比度检查：正文与 `--sky` 背景 ≥4.5:1（可用 DevTools 取色计算）。

### 5.2 BibTeX 块

- [ ] 等宽字体、缩进/换行/花括号原样保留。
- [ ] 复制按钮为 32×32 图标按钮，默认隐藏，JS 运行后显示（CHK009）。
- [ ] 点击复制：内容逐字一致（含换行/缩进，去掉末尾单个换行）；图标变绿色对勾；状态区“已复制”。
- [ ] 约 2 秒后图标与状态区复位；重复点击不串状态。
- [ ] 复制失败路径：DevTools 覆盖 `navigator.clipboard.writeText` 为 reject，点击后图标变红色失败态，状态区“复制失败，请手动选择”，文本仍可选中（CHK009/CHK029）。
- [ ] 长行只在块内横向滚动；按钮在各滚动位置可见；页面无横向滚动。
- [ ] 无 JS（DevTools 禁用脚本）：按钮不出现，内容完整可选，版面不塌陷（CHK021/CHK028）。
- [ ] 键盘：Tab 到按钮，Enter/Space 触发；Tab 到 `pre`，方向键横向滚动；焦点外框可见（CHK024）。
- [X] 无障碍树结构：按钮可访问名、状态区 `aria-live="polite"`、图标 `aria-hidden="true"` 均已检查；真实读屏播报按 Constitution v2.0.0 豁免，不作为门禁（CHK030）。

### 5.3 表格块

- [ ] 每个 `figure.news-table` 内含一个 `div.news-table__scroll[tabindex="0"][role="region"]` 与恰好一张真实 `<table>`；有标题时仅第一张表有 `figcaption`。
- [ ] 5 列 375px：容器内滚动，单元格不截断，页面 `scrollWidth ≤ innerWidth`。
- [ ] 键盘 Tab 聚焦容器，方向键滚动，焦点外框可见。
- [ ] 多个表格块独立；同一 `:::table` 内多张表格按源顺序各自生成独立 `figure.news-table` 与 `.news-table__scroll`，仅第一张有图注；普通 Markdown 表格不获得控件样式。
- [ ] 空表格块触发 warning，不生成空控件（故障注入见 §7）。

## 6. 视口与布局矩阵

对新闻列表页、新文章详情页与全部既有新闻详情页（`dist/news/*/index.html`）检查：

| 视口 | 检查项 |
|------|--------|
| 375px | 无横向滚动、无重叠、文字不截断；BibTeX/表格仅在块内滚动；图片不溢出 |
| 768px | 同上；表格与正文间距合理 |
| 1024px | 同上；高亮块宽度与正文一致 |
| ≥1280px | 同上；图片不放大超过固有尺寸 |
| 320px（补充） | 新文章与三种控件无重叠/截断；页面无横向滚动（CHK023） |
| 200% 文字缩放（补充） | 高亮块、工具栏、表格不重叠；复制按钮仍可点击 |

**横向溢出判定（CHK010）**：

```js
// DevTools Console：全局 body { overflow-x: hidden } 已移除（T028），无需再临时禁用
const docOverflow = document.documentElement.scrollWidth - window.innerWidth;
const offenders = [...document.querySelectorAll('.news-body *')]
  .filter(el => el.getBoundingClientRect().right > window.innerWidth + 1)
  .map(el => `${el.tagName}.${el.className}`);
console.log({ docOverflow, offenders });
```

- [ ] 期望 `docOverflow <= 0`，`offenders` 为空（或仅 `.news-table__scroll`/`pre` 的内部内容，且其父容器未溢出）。
- [ ] 页面级不得再有任何 `overflow-x: hidden`/`clip` 裁剪；若发现回退，按 Constitution VI 缺陷处理（CHK010）。
- [ ] 全局 `body { overflow-x: hidden }` 已在 T028 移除；BibTeX 的 `pre` 与表格滚动容器使用 `overflow-x: auto`，长行/宽表只在块内滚动（CHK010）。
- [ ] 若后续改动引入页面级溢出，应修复元素本身，不得重新加回页面级裁剪。

## 7. 故障注入（CHK005/CHK016/CHK017）

在临时新闻文件中逐项注入，记录构建结果；完成后删除临时文件。

| 注入 | 期望构建结果 | 期望页面/终端 |
|------|--------------|----------------|
| 删掉高亮块结尾 `:::` | 失败 | 终端给文件/行号，不生成页面 |
| 删掉表格块结尾 `:::` | 失败 | 同上 |
| 把 `bibtex` 改成 `BibTeX` | 失败 | 提示必须写小写 `bibtex` |
| 空高亮块 | 继续 | warning；空块被移除 |
| 空 `bibtex` 块 | 继续 | warning；空 `pre` 保留，无按钮 |
| 未知容器 `:::foo` | 继续 | warning；内容展开 |
| 表格后不空行直接 `:::` | 继续 | warning；`:::` 被删除，表格正常 |
| 空表格块 | 继续 | warning；不生成表格控件 |
| 图片路径写错 | 失败 | Astro 报 `ImageNotFound` |
| 在列表项内写 `:::highlight` | 不支持 | 文档已说明；若产生异常，记录并避免使用 |

- [ ] 每次注入后运行 `npm run build`；硬错误必须非零退出。
- [ ] 软问题必须输出 `[news-widgets]` 前缀 warning，且 warning 总数不超过基线 + 注入数。

## 8. 回归与性能

- [X] 全部既有新闻详情页改动前后 hash 一致（外链插件只作用于配图与 arXiv 论文链接，既有新闻无这两类链接）（FR-032、CHK018）。（T054：基线重建后 raw SHA-256 为 0/14——T050 把 `[id].astro` 改为 `[...id].astro`，Astro 路由组件 scoped id 由 `eefyg22u` 变为 `x34khjk5`；仅归一化该 id 后 14/14 字节一致，其他组件 scoped id 未变。不得表述为 raw 字节一致，详见 `evidence/t054-baseline.json` 与 §11.11）
- [ ] 新闻列表页卡片在 375px 下标题/日期/摘要不截断、不溢出、不变形（CHK040）。
- [ ] 首页、Team、Publications 不含 `.news-highlight`/`.news-bib`/`.news-table` 类名（FR-031）。
- [X] 页面新增内联脚本 UTF-8 字节数 ≤5KB；记录实际值（SC-009、CHK025）。（实测 1,957 bytes）
- [X] `npm run check` 通过；构建无新增 warning。（0 errors / 0 warnings / 0 hints；19 页，`[news-widgets]` warning 0）
- [X] `node --test tests/news-widgets.test.mjs` 通过（若已实现 fixture）。（27/27）

## 9. 文档与可发现性（CHK032）

- [ ] `docs/news-markdown-guide.md` 存在，覆盖三种控件 + 新闻配图 + 诊断 + 验证步骤。
- [ ] 根 README 或 `src/data/README.md` 有指向该文档的链接。
- [ ] 抽查 5 个易错点（漏 `:::`、大写 `BibTeX`、空块、表格尾行、嵌套）均能在文档中找到答案。
- [ ] 请一位未参与开发的维护者仅按文档添加三种控件，记录歧义并回补文档。

## 10. 内容审查附录（CHK037）

在发布前逐项打勾：

- [X] **标题**：原创、≤40 个 CJK 统一表意文字（英文/数字/标点不计）、不与参考文章标题相同。（实测 20）
- [X] **摘要**：80–200 字，按 code point 计，无控件语法，能独立说明“三篇论文 + Self-Taught RLVR”。（实测 115 code points）
- [X] **导语**：交代 RLVR/后训练背景、三篇工作的共同问题与“老师从哪里来”。
- [X] **RLSD 节**：真实标题、机构、版本；问题—方法—结论；evidence ratio 直觉；关键数字与论文一致。
- [X] **NPO 节**：真实标题；NPO/NPD 机制；`S=Q/V` 直觉；数字以 v2 为准；三篇统一按 arXiv 预印本，不写会议接收状态。（2026-10-25 按 arXiv v2 摘要复核 NPO=off-policy 行为迁移、NPD=on-policy token 级蒸馏，正文已补该区分）
- [X] **CoPD 节**：真实标题；并行分支 + 双向 OPD；`a_P/b_P` 直觉；实验数字与论文一致。
- [X] **对比表**：4 列（维度 + 三篇论文），维度能回答“教师信号来源/额外信息/代价与风险/适用阶段”。
- [X] **高亮块**：≥2 个，每个有独立结论，不是标题复述。（实测 3 个）
- [X] **BibTeX**：三条可解析；类型、字段、key、作者、链接正确。（BibTeX 0.99e 解析退出码 0）
- [X] **配图**：三张方法框架图；alt 中文一句话；图注含许可与链接；点击打开论文页。
- [X] **术语**：RLVR/RLSD/OPD/OPSD/NPO/NPD/CoPD/GRPO 首次出现给全称。（2026-10-25 已在正文首次出现处补齐英文全称与中文机制释义）
- [X] **公式符号**：`a_P`/`b_P` 用下划线 P，首次说明 P=policy。
- [X] **原创性**：无逐字照搬；无“参考解读”署名/链接。
- [X] **事实**：所有数字可溯源；无法核实者未写。

## 11. 实施验收证据（T036–T055，2026-10-24 至 2026-10-25）

环境：Chromium Headless Shell 156.0.8078.4（CDP 驱动），本地静态服务 `http://127.0.0.1:8123/nlp-home/`（T042 为 `http://127.0.0.1:4321/nlp-home/`）；宽度 375/768/1024/1280px，补充 320px 与根字号 200%；移动端为 375px + `mobile` 设备模拟 + 触摸事件。截图见 `specs/008-news-detail-widgets/evidence/`，矩阵原始数据见 `evidence/layout-matrix.json` 与 `evidence/layout-matrix-t042.json`。

**未验证（工具不支持，不得视为通过）**：Safari/WebKit；真实 iOS/Android 设备；Windows 高对比度模式。真实读屏播报（T045/T052）不属于本项目验收要求：Constitution v2.0.0 已移除无障碍 MUST，见 §11.9。Firefox 的复制、触摸与布局已按 T044 验证；中文真实字形已按 T042 用注入的 Noto Sans CJK SC 验证。

### 11.1 门禁

| 检查 | 命令 | 结果 |
| --- | --- | --- |
| 单元/fixture 测试 | `node --test tests/news-widgets.test.mjs` | 27/27 通过（2026-10-25，含 T046–T048、T051 新增用例） |
| 类型与模板检查 | `npm run check` | 0 errors / 0 warnings / 0 hints |
| 构建 | `npm run build` | 19 页，退出码 0，`[news-widgets]` warning 0 条（临时故障注入文件已删除） |

### 11.2 T036 控件加载判定

- satteri 实测：`   :::highlight`（3 空格）与 `~~~bibtex`、`  ~~~ bibtex` 均渲染控件；`\t:::` 与 4 空格缩进不解析，按普通代码块处理。
- `hasNewsWidgets` 单测覆盖上述真/假样例；临时新闻（3 空格 `:::highlight` + 2 空格 `:::table` + `~~~bibtex`）构建后页面含 `news-widgets.*.css`、`aside.news-highlight`、表格块与复制脚本。
- 15 个详情页中仅 `self-taught-rlvr-2026` 加载控件 CSS；其余页面无控件标记，`cssLeaks = 0`。

### 11.3 T037 表格块混入非表格内容

- `fixtures/table-mixed.md` 渲染为 1 个 `figure.news-table`，表格外段落与列表按普通 Markdown 保留；输出恰好 1 条含文件名与行号的 `[news-widgets]` warning（「非表格内容」）。
- `docs/news-markdown-guide.md` 的受控 warning 对照表已补该行；构建 warning 总数 0。

### 11.4 T038/T041 BibTeX 工具栏与 200% 文字缩放

T041 最终排布（2026-10-25，以下数据取代 T038 的旧坐标）：DOM 子节点保持 `label → button → status`，CSS 视觉顺序为 `label → status → button`。按钮固定 32×32、右内边距 10px，状态区紧邻按钮左侧且间距 8px；200% 下 label 独占第一行，状态区与按钮同在第二行。

| 视口 | 根字号 | 按钮文档 x | 状态区宽 | 工具栏高（失败态） |
| --- | --- | ---: | ---: | ---: |
| 320px | 100% | 246px | 140.80px | 45px |
| 375px | 100% | 301px | 140.80px | 45px |
| 320px | 200% | 246px | 211px | 108.36px |
| 375px | 200% | 301px | 266px | 108.36px |

- 320/375/1280px × 100%/200% 六组实测：三个 BibTeX 块均无重叠、无裁剪、页面横向溢出 0；按钮中心命中按钮或其图标，DOM 顺序未变。
- 首块 idle、「已复制」、「复制失败，请手动选择」、约 2 秒复位四态的按钮文档坐标与尺寸稳定（容差 0.02px，覆盖 Chromium 1/64px 取整），反馈文本与复位空文本均通过 DOM 精确断言。
- 另给失败状态增加 `0.5em` 字距，强制状态文案在两行显示：普通字号工具栏高 51.41px、200% 为 146.77px，按钮 `x/y` 变化均为 0；`align-self: flex-start` 避免真实全宽中文字体下反馈换行引起按钮位移。
- 截图已按最终 CSS 刷新：`article-375-bib-default.png`、`article-375-bib-success.png`、`article-375-bib-failure.png`、`article-320-200-bib.png`、`article-375-200-bib.png`、`article-1280-bib.png`。
- 环境限制（已由 T042 解决）：T038/T041 执行时容器无 CJK 字体（`fc-list :lang=zh` 为空），当时截图中文显示为缺字框；T042 已用注入的 Noto Sans CJK SC 重截关键截图并复测几何。仍保留旧环境的截图仅 `article-375-nojs.png`（结构证据有效，字形不作为 T042 依据）。

为消除 200% 下页面级横向溢出，`news-widgets.css` 对 `.news-body` 与页脚邮箱链接加 `overflow-wrap: anywhere`；仅在无自然断点时折行，普通字号排版不变。

### 11.5 T039 布局矩阵与交互

**布局矩阵**：15 个详情页 + 新闻列表 × 375/768/1024/1280px = 64 次加载，`document.documentElement.scrollWidth ≤ clientWidth` 全部成立，非裁剪溢出元素 0 个，失败 0 次（`evidence/layout-matrix.json`）。T042 已用最终 CSS 与真实 CJK 字体复跑，见 §11.6。

**真实临时新闻**（验证后删除）：5 列表格与超长 BibTeX 行——

- 375px：表格可视宽 248px、内容宽 588px；BibTeX 可视宽 326px、内容宽 1526px，均在容器内横向滚动，页面溢出 0。
- 320px + 200%：表格 193/1051px，BibTeX 271/3022px；页面溢出 0，控件完整。

**复制**：

- 桌面 1280px：连续 10 次点击，10/10 剪贴板逐字等于该卡片代码（去掉末尾换行），首次反馈 87ms，「已复制」，约 2 秒后状态清空、图标复位。
- 移动 375px（触摸模拟）：10 次触摸点击 10/10 逐字一致。
- 本文含 3 个 BibTeX 卡片：逐个点击均只复制自身内容，状态区只在被点卡片出现，其余两卡保持空；按钮无重复 `id`。
- 键盘：按钮聚焦后 Enter 与 Space 均触发复制（每次先用 `sentinel` 覆盖剪贴板再校验）。
- 失败：`navigator.clipboard.writeText` 拒绝时显示「复制失败，请手动选择」+ 红色错误图标；约 2 秒后复位为空状态与复制图标。

**表格键盘滚动**（375px）：容器 `tabindex="0"`、`role="region"`、`aria-label="对比表"`；聚焦后连按 2 次 ArrowRight，`scrollLeft` 0 → 80px（最大 819px），焦点保持在容器上。截图：`article-375-table-focus.png`、`article-375-table-scrolled.png`。

**BibTeX 内容区键盘焦点（T040，2026-10-25）**：在 320px 与 375px 下按真实 Tab 顺序分别聚焦 3 个 `pre`，6 次均为 `:focus-visible=true`；计算样式为 `2px solid rgb(27, 120, 191)`、`outline-offset: -4px`。逐张截图像素检测确认每幅图的上/下各有两条横向焦点线、左/右各有两条纵向焦点线，四边完整；例如 375px 首块顶边两条横线各覆盖 322px、左右竖线覆盖 243–244px。三个工具栏均满足 `toolbar.bottom == pre.top`，焦点环不被工具栏遮挡，`pre` 保持块内横向滚动。截图：`article-320-bib-pre-1-focus.png` 至 `article-320-bib-pre-3-focus.png`、`article-375-bib-pre-1-focus.png` 至 `article-375-bib-pre-3-focus.png`（共 6 张）。

**无 JS**：禁用脚本执行后重新加载，复制按钮 `hidden=true` 且计算样式 `display:none`；BibTeX 全文（398 字符）、表格与高亮块完整可见，页面溢出 0。截图：`article-375-nojs.png`。

**可访问性树**：3 个按钮名「复制引用」、3 个区域名「BibTeX 引用」、1 个区域名「对比表」，均可聚焦；3 个状态区均为 `aria-live="polite"`。真实读屏播报按 Constitution v2.0.0 豁免，不表述为通过（见 §11.9）。

**截图清单**：`article-375-top.png`、`article-375-highlight.png`、`article-375-bib-default.png`、`article-375-bib-success.png`、`article-375-bib-failure.png`、`article-1280-bib.png`、`news-list-375.png`、`article-375-nojs.png`、`article-375-table-focus.png`、`article-375-table-scrolled.png`、`article-375-200-bib.png`、`article-320-200-bib.png`。

### 11.6 T042 最终 CSS 布局门禁（2026-10-25）

环境：Chromium Headless 156.0.8078.4（CDP 驱动），预览服务 `http://127.0.0.1:4321/nlp-home/`。容器本身无系统 CJK 字体；验收时把 Noto Sans CJK SC Regular OTF（16,437,364 bytes）临时放到 `dist/_test-cjk.otf`，通过 `@font-face` 注入为 `GateCJK` 并覆盖页面字体。每个测量页面 `document.fonts.check('16px "GateCJK"')` 均为 `true`，截图可确认真实中文字形。临时字体与临时新闻均在验收后删除，不进入交付。

**64 次正式加载**（15 个详情页 + 新闻列表 × 375/768/1024/1280px）：

- 页面横向溢出 0、越界元素 0、被父容器裁剪元素 0；新闻列表 15 张卡片。
- 15 个详情页中只有 `self-taught-rlvr-2026` 加载控件 CSS，其余 14 页无控件资源泄漏。
- 三张主图显示宽度分别为 328/705/961/1132px，均等于正文内容宽；宽高比误差 ≤0.0001。

**文章 320/375px × 100%/200% 与 1280px × 200%**：5 组均溢出 0、越界 0、裁剪 0；3 个 BibTeX 按钮均 32×32，label/button/status 无重叠，工具栏与状态区无 `scrollWidth > clientWidth`。200% 下 sticky header 会占据明显高度，截图已把工具栏滚到 header 下方再截取。

**真实临时新闻**（`__layout-gate.md`，验收后删除）：高亮块内超长 URL、两张表格、超长 BibTeX 行。

| 视口 | 表格 1 client/scroll | 表格 2 client/scroll | BibTeX client/scroll | 页面溢出 |
| --- | --- | --- | --- | ---: |
| 375px × 100% | 248 / 534px | 248 / 248px | 326 / 1003px | 0 |
| 320px × 200% | 193 / 942px | 193 / 221px | 271 / 1960px | 0 |
| 1280px × 100% | 1052 / 1052px | 1052 / 1052px | 1130 / 1130px | 0 |

高亮块长链接在三种视口下均 `scrollWidth == clientWidth`，只在文本内换行，不撑破块或页面。

**键盘与复制**（375px）：29 个 Tab 停靠点（28 个控件 + 末尾 `body`）中，3 个复制按钮、3 个 `pre`、1 个表格容器均获得 `:focus-visible` 与 `2px solid rgb(27, 120, 191)` 外框，`pre` 使用 `-4px` offset；表格聚焦后连按 2 次 ArrowRight，`scrollLeft` 0 → 80px（最大 819px），焦点保持在容器上。复制按钮 idle/「已复制」/「复制失败，请手动选择」/复位四态 rect 均为 `x=301, y=434.3, 32×32`，状态文本与 class 精确匹配；四态分别只显示 copy/success/error 图标，三个 SVG 均为 `aria-hidden="true"`。

**证据文件**：`evidence/layout-matrix-t042.json`、`evidence/t042-keyboard-copy.json`。截图：`article-375-top.png`、`article-375-highlight.png`、`article-375-table.png`、`article-375-table-focus.png`、`article-375-table-scrolled.png`、`article-375-bib-default.png`、`article-375-bib-success.png`、`article-375-bib-failure.png`、`article-1280-bib.png`、`article-320-200-bib.png`、`article-375-200-bib.png`、`news-list-375.png`、`news-list-1280.png`、`article-320-bib-pre-1..3-focus.png`、`article-375-bib-pre-1..3-focus.png`、`layout-gate-375-highlight.png`、`layout-gate-375-tables.png`、`layout-gate-320-200-highlight.png`、`layout-gate-320-200-tables.png`、`layout-gate-1280-highlight.png`、`layout-gate-1280-tables.png`。

### 11.7 T043 构建前校验递归与故障注入（2026-10-25）

`astro.config.mjs` 的 `news-widgets-validation` 改为 `readdir(NEWS_DIR, { recursive: true, withFileTypes: true })`，与 collection loader 的 `**/*.md` 对齐；嵌套目录中的硬错误同样在构建前被拦截。临时文件验收后删除，详见 `evidence/t043-fault-injection.json`。

| 注入（嵌套 `__t043_nested/probe.md`） | 退出码 | 输出 |
| --- | ---: | --- |
| 未闭合 `:::highlight` | 1 | `[news-widgets] .../__t043_nested/probe.md:7 highlight 容器未闭合：缺少结尾 :::。` |
| 三反引号 + 大写 `BibTeX` | 1 | `[news-widgets] .../__t043_nested/probe.md:7 代码块语言标记 "BibTeX" 无效：必须使用小写 bibtex` |
| 嵌套 `:::foo`（软 warning） | 1 | 控件层只输出一条受控 warning；构建随后因 `[id].astro` 为单段动态路由、无法发布 `__t043_nested/probe` 而报 `Missing parameter: id`。这是路由结构限制，不计为软 warning 回归 |
| 顶层 `__t043-soft.md` + `:::foo` | 0 | `[news-widgets] .../__t043-soft.md:7 未知容器指令 :::foo 已展开为普通内容。` 恰好 1 条 |

结论：嵌套路径的硬错误已证明会被递归预检捕获，错误含文件与行号；软 warning 在可发布的顶层新闻中保持「构建成功、warning 一次」的既定行为。当时嵌套新闻目录受单段 `[id]` 路由限制、无法发布；T050 已改为 `[...id]` rest 路由并完成嵌套回归，见 §11.11。

### 11.8 T044 Firefox 第二款浏览器复制验收（2026-10-25）

环境：Firefox 158.0.1（Mozilla 官方 linux64 tarball）、geckodriver 0.36.0、headless；CJK 字体按 T042 方式注入。Firefox headless 强制最小窗口宽 500px，375px 无法设置，因此视口为 500×814 CSS px；**这不是真机结果**。

- **桌面鼠标点击 10/10**：每次 `navigator.clipboard.readText()` 回读与 `pre code` 文本逐字一致；成功反馈 2–5ms；复位 1894–2168ms；按钮 rect 全程稳定且为 32×32。
- **触摸 10/10**：W3C `pointerType=touch` 动作点击按钮，10 次回读均逐字一致；成功反馈 2–7ms；复位 1998–2197ms；页面溢出 0。该触摸为 Firefox 桌面 headless 的仿真触摸视口，不是真实手机/平板。
- **失败路径**：覆盖 `navigator.clipboard.writeText` 为 reject 后 2ms 出现「复制失败，请手动选择」，1904ms 复位；按钮位置尺寸不变。
- **证据**：`evidence/t044-firefox-copy.json`、`evidence/t044-firefox-touch.json`；截图 `firefox-500-desktop-copied.png`、`firefox-500-desktop-failure.png`、`firefox-500-touch-copied.png`。

### 11.9 T045/T052 真实读屏验收（按 Constitution 豁免）

环境检查：`orca` 未安装；`speech-dispatcher`、`spd-say`、`espeak-ng`/`espeak` 均不存在；Python `pyatspi`、`speechd` 模块缺失；AT-SPI core 虽已安装，但没有读屏器或语音合成器消费它。`sudo -n true` 失败，无法安装系统包；也没有可供读屏器使用的 X/Wayland 显示会话。

按 Constitution v2.0.0（commit e3cf68e 移除原则 IV 的无障碍 MUST）及项目既有口径，本特性不设无障碍合规目标，T045/T052 的真实读屏播报验收**豁免**，不作为发布门禁。`aria-live="polite"`、`aria-hidden="true"` 与可访问名作为实现细节保留；此前的可访问性树检查只能证明结构，不表述为真实播报通过。记录见 `evidence/t045-screen-reader.json`；若日后课题组重新纳入无障碍目标，再恢复该验收。

### 11.10 T046–T049 回归与文档（2026-10-25）

- **T046**：`stripTrailingFenceRow` 增加「末行起始行 == 容器结束行」判定，只删除可确认属于容器闭合 fence 的 `:::` 行。新增 `fixtures/table-multi-fence.md`（多表容器中保留合法 `:::` 单元格、仅删末尾 fence 行）与真实尾行回归；`node --test` 断言 2 个表格块、首表保留 `<td>:::</td>`、第二表不保留、恰好 1 条含 `:::` 的 warning。
- **T047**：抽出 `containsWidgetSyntax` 并让 `src/content.config.ts` 的摘要校验直接调用它；单测覆盖三反引号与 `~~~` 围栏、0–3 个前导空格、围栏后空白/制表符，以及非控件反例，共 10 个拒绝样例与 6 个允许样例。任何已支持的 BibTeX/容器写法进入摘要都会被拒绝。
- **T048**：`hasVisibleBody` 通过递归 `containsImage` 把 `image`/`imageReference` 计为可见，与 alt 是否为空解耦；新增 `fixtures/highlight-image-empty-alt.md`，断言空 alt 图片保留、控件正常渲染、0 条「内容为空」warning。
- **T049**：`docs/news-markdown-guide.md` 的表格块规则补充「仅建议放在正文顶层，不支持置于列表项或引用块内」，并给出把整个表格块移到嵌套结构之外的修复说明，与高亮块限制一致。
- **门禁**：`node --test tests/news-widgets.test.mjs` 23/23 通过；`npm run check` 0 errors/0 warnings/0 hints；最终 `npm run build` 19 页、退出码 0、`[news-widgets]` warning 0 条（临时新闻与临时字体已删除）。

### 11.11 T050–T055 收敛验收（2026-10-25）

**T050 嵌套新闻路由**：详情页路由改为 `src/pages/news/[...id].astro`，`getStaticPaths` 直接传入 collection 的嵌套 `entry.id`。

- 临时嵌套新闻 `src/content/news/__t050_nested/probe.md`（含高亮、BibTeX、未知容器、表格）构建退出码 0，输出 `dist/news/__t050_nested/probe/index.html`，页面加载控件 CSS 且含复制脚本；`[news-widgets]` 软 warning 恰好 1 条并含相对路径与行号。
- 同一文件删掉表格结尾 `:::` 后构建退出码 1，报错含 `probe.md:22 table 容器未闭合`。
- 最终构建 15 个详情页 URL 全部存在，既有 14 个 slug 的 URL 未变；新增文章为 `/news/self-taught-rlvr-2026/`。内联复制脚本 1,957 UTF-8 bytes（≤5KB）。
- 维护者文档已补充子目录与 URL 映射规则：`src/content/news/lab-notes/probe.md` → `/news/lab-notes/probe/`，配图要求同目录。
- 证据：`evidence/t050-nested-route.json`。

**T051 复制状态竞态**：每次点击先清除并删除旧 timer，再递增按钮级操作 token；`finish` 与复位 timer 只在 token 仍为最新时生效。新增 3 个受控 deferred Promise 回归：

1. 第二次先成功、第一次后失败：旧失败不覆盖「已复制」。
2. 失败先返回、成功后返回：旧失败被丢弃，新成功最终生效。
3. 第二次 pending 时旧 2 秒 timer 到期：不复位，新操作自己的 2 秒计时结束时才清空。

多块独立复制回归继续通过；全套 `node --test` 27/27。证据并入测试文件与 §11.1。

**T053 术语与内容复核**：正文首次出现处已补齐 RLVR、RLSD、OPD、OPSD、NPO、NPD、CoPD、GRPO 的英文全称与必要中文机制释义；按 arXiv v2 摘要补充 NPO（off-policy 行为迁移）与 NPD（on-policy token 级蒸馏）的机制区分。

| 指标 | 实测 |
| --- | --- |
| 标题 CJK（≤40） | 20 |
| 摘要 code points（80–200） | 115 |
| 正文 CJK（≥2,500） | 3,654 |
| BibTeX / 高亮 / 表格 / 主图 | 3 / 3 / 1 / 3 |
| BibTeX 解析 | BibTeX 0.99e（TeX Live 2026，kpathsea 6.4.2，`plain.bst`），3 条条目，退出码 0，生成 `refs.bbl` |

证据：`evidence/t053-content.json`。

**T054 FR-032 基线**：原始 T001 `before.sha256` / `build-before.log` 未找回。基线从 `git archive HEAD`（d97f4fe，2026-10-23 15:08）重建，并叠加 T028 的 `src/styles/global.css`（移除 `body overflow-x: hidden`），在隔离目录 `/tmp/t054-baseline` 构建：18 页、退出码 0、warning 0。当前构建 19 页、退出码 0、`[news-widgets]` warning 0。

逐页 SHA-256 结果必须如实区分两层：

- **raw 字节对比：0/14**。唯一差异是 T050 路由文件名变化导致 Astro 路由组件 scoped id 从 `eefyg22u` 变为 `x34khjk5`（HTML 属性与 `<style>` 选择器同步变化）。
- **仅归一化该 scoped id 后：14/14 字节一致**；其他组件的 `data-astro-cid-*` 集合完全相同。

因此不能表述为「raw hash 14/14 一致」；这是 T050 路由改造与 FR-032 字节级要求之间的结构性冲突，已在 §8 与证据中标注。证据：`evidence/t054-baseline.json`（含逐页 raw/normalized 哈希与差异原因）。

**T055 构建故障注入**：逐项写入临时新闻并运行真实 `npm run build`，每项完成后删除文件；结果见 `evidence/t055-fault-injection.json`。

| 注入 | 退出码 | 诊断 |
| --- | ---: | --- |
| 未闭合 `:::highlight` | 1 | `probe.md:7 highlight 容器未闭合` |
| 未闭合 `:::table` | 1 | `probe.md:7 table 容器未闭合` |
| 大写 `BibTeX` 围栏 | 1 | `probe.md:7 语言标记 "BibTeX" 无效` |
| `bib` 围栏 | 1 | `probe.md:7 语言标记 "bib" 无效` |
| 空 `:::highlight` | 0 | 1 条「高亮块内容为空，已整块移除」 |
| 空 `bibtex` | 0 | 1 条「BibTeX 引用块内容为空」 |
| 未知容器 `:::foo` | 0 | 1 条「未知容器指令已展开」 |
| 表格尾行缺空行 | 0 | 1 条「结尾 `:::` 被解析进表格末行，已删除」 |
| 空 `:::table` | 0 | 1 条「表格块内没有 Markdown 表格」 |
| 缺失图片 `__t055_missing.png` | 1 | `[ImageNotFound] Could not find requested image` |

硬错误均非零退出并含文件/行号；软问题均构建成功且 `[news-widgets]` warning 恰好 1 条；图片缺失按 Astro 契约指出缺失文件名。临时文件删除后最终构建 19 页、退出码 0、warning 0。

**已豁免**：T045/T052 真实读屏播报——按 Constitution v2.0.0 不在验收范围，不作为发布门禁；`aria-live`/`aria-hidden` 结构保留，见 §11.9。
