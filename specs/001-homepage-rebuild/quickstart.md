# Quickstart: 001-homepage-rebuild 验证指南

**Date**: 2026-10-10 | **目的**: 实现完成后，按本指南验证 feature 端到端可用（对应 spec Success Criteria SC-001 ~ SC-006）

## 前置条件

- Node.js ≥ 22 LTS、npm
- 仓库已含完整 Astro 项目（实现阶段产出）与内容数据（内容准备阶段产出）

## 启动

```bash
npm install        # 安装依赖（唯一运行依赖 astro + devDeps @astrojs check/typescript）
npm run dev        # 本地开发预览 http://localhost:4321
```

## 构建期校验（数据正确性门槛）

```bash
npx astro check    # TypeScript + Zod schema 校验 → 0 error
npm run build      # 构建成功 = 全部数据文件通过 schema 校验
npm run preview    # 预览构建产物（模拟线上）
```

**预期**: `astro build` 成功；若人为破坏任一数据文件字段（如删除 `publications.json` 某条的 `venue`），构建必须失败并指明文件与字段——这是 spec 边缘用例"数据文件错误时构建阶段明确报错"的直接验证。

## 手动验证清单（对照 spec）

### 主页六区块（User Story 1 / SC-002 / SC-006）

- [x] 从上到下依次为：介绍（组名/中科院信工所/研究方向）、招募 Join Us（英文申请说明 + Coding/Math/Logic/English 四项带图标能力要点 + 邮箱）、新闻概览（日期+标题，前 5 条）、Team（5 位老师为主）、代表性 publications（featured 条目）、Gallery（8–12 张缩略图网格）
- [x] 招募邮箱 mailto 可用（不带 subject 参数，FR-003）；不出现邮件主题格式要求
- [x] 正文段落/卡片描述字号 ≥18px（FR-019；导航、日期、徽标等次级文本不计入）
- [x] 点击新闻概览条目 → 进入对应新闻详情页
- [x] 点击老师 → 可达本站 Team 页（/team/）或外部主页（新标签）
- [x] 点击任一 Gallery 照片 → lightbox 放大（Esc/点击遮罩可关闭）
- [x] DevTools Network 面板：页面加载无框架 JS（仅 lightbox 小脚本）
- [x] 四档视口下布局自适应、无横向溢出、导航可用：375px（手机竖屏）/ 768px（平板竖屏）/ 1024px（平板横屏）/ ≥1280px（桌面横屏）

### 导航互通（SC-001）

- [x] 从主页、新闻页、Team 页、发表页各出发一次，1 次点击可达其余三页

### 发表页（User Story 2 / SC-003）

- [x] 列表覆盖两位老师主页论文去重合集（条目数与内容准备清单一致）
- [x] 按年份降序分组，年份锚点导航可用
- [x] 有 CCF 评级的条目 100% 显示徽标（A/B/C）；无评级条目无徽标但标题/venue 完整
- [x] 随机抽检 ≥20 条外链全部可达（arXiv 优先，回退 DOI/出版方）
- [x] 无 url 条目为纯文本（不可点击，无死链接图标）

### 新闻（User Story 3）

- [x] 列表按时间倒序
- [x] 任一条目点入详情：标题、日期、正文与列表一致
- [x] 简讯类新闻详情直接展示简讯，无空白页
- [x] 含图新闻的图片正常显示

### Team 页（User Story 4 / SC-005，URL 为 /team/）

- [x] 5 位老师信息与权威来源（UCAS 主页/PPT 口径）逐字段核对一致
- [x] 在读学生按 PhD Candidates / Master's Students 分组，小节标题为英文（Faculty/Graduates）
- [x] 毕业生去向展示；外部主页新标签打开

### 内容维护（User Story 5 / SC-004，10 分钟流程）

- [x] 在 `src/data/publications.json` 追加一条测试论文 → `npm run build` → 发表页出现该条目，`git status` 确认模板/样式/构建文件零改动
- [x] 新建一条测试新闻 .md → 新闻列表与主页概览同步出现
- [x] `gallery.json` 清空 → 构建后主页 Gallery 区块隐藏（不留空白区块）
- [x] 验证后删除测试数据

## 部署验证（GitHub Pages）

1. `.github/workflows/deploy.yml` 就位；`astro.config.mjs` 配置 `site` + `base`
2. GitHub 仓库 Settings → Pages → Source 设为 **GitHub Actions**
3. push 到 `main` → Actions 页确认 workflow 绿色
4. 访问 `https://<org>.github.io/<repo>/`，重复上述"导航互通"与"主页六区块"抽查

### CI 门禁验证（FR-013）

- 故意在 `src/data/publications.json` 删掉某条的 `venue` 字段并推送 → Actions 显示构建**失败**，部署步骤未执行，线上仍为上一正常版本；恢复字段后推送 → 部署成功
- 该机制替代"上传前手动跑脚本"：失败无法绕过，维护者无需额外操作

## 参考契约

- URL 路由与空态行为：[contracts/routes.md](./contracts/routes.md)
- 数据文件字段与维护流程：[contracts/data-files.md](./contracts/data-files.md)
- 实体与 schema 细节：[data-model.md](./data-model.md)
