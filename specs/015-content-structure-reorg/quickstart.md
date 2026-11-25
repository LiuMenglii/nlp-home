# Quickstart: 项目内容结构重构验证

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Data model**: [data-model.md](./data-model.md) | **Contracts**: [content-layout.md](./contracts/content-layout.md) · [validation.md](./contracts/validation.md) | **Date**: 2026-11-24

本指南用于验证「内容迁移到 `content/`、Gallery / 教师改为条目目录、展示不变、校验保留」是否端到端成立。实现细节见 plan 与 contracts；本文件只描述可执行的验证步骤与预期结果。

## 1. 前置条件

- Node 22（与 CI 一致），仓库依赖已安装：`npm ci`
- 在仓库根目录 `/home/photon/workspace/nlp-home` 执行
- 迁移前工作区干净（`git status --short` 无输出），便于比对与回滚

## 2. 迁移前基线

在开始改动前记录基线：

```bash
npm run check
npm run build
node --test tests/news-widgets.test.mjs

# 保存基线构建产物（不要提交）
rm -rf /tmp/nlp-dist-before
cp -a dist /tmp/nlp-dist-before

# 记录内容计数
node -e "const t=require('./src/data/teachers.json');const g=require('./src/data/gallery.json');const s=require('./src/data/students.json');const gr=require('./src/data/graduates.json');const p=require('./src/data/publications.json');console.log({teachers:t.length,gallery:g.length,students:s.length,graduates:gr.length,publications:p.length})"

# 记录新闻 URL 与图片清单
find dist/news -name index.html | sort
find public/gallery public/teachers src/content/news -type f | sort
```

**预期基线**：`check` / `build` / 测试全部通过；计数为 `teachers:4, gallery:12, students:31, graduates:13, publications:135`；新闻详情页 4 个；图片清单见 [data-model.md §12](./data-model.md)。

## 3. 迁移后结构与单一事实来源

```bash
# 新内容区必须存在
ls content/README.md content/site.json content/students.json \
   content/graduates.json content/publications.json
ls content/news content/teachers content/gallery

# 旧位置必须消失
test ! -e src/data && echo "OK: src/data removed"
test ! -e src/content/news && echo "OK: src/content/news removed"
test ! -e public/gallery && echo "OK: public/gallery removed"
test ! -e public/teachers && echo "OK: public/teachers removed"

# public 只保留品牌资源
find public -type f | sort
# 期望：public/favicon.svg、public/logo.svg

# 内容区无重复副本 / 无源码文件
find content -type f | sort
find content -type f \( -name '*.astro' -o -name '*.ts' -o -name '*.css' -o -name '*.js' -o -name '*.mjs' \) | wc -l
# 期望：0
```

**预期目录**：与 [plan.md 的 Source Code 树](./plan.md) 一致；12 个 Gallery 条目目录、4 个教师条目目录、4 篇新闻 + 3 张配图、4 个 JSON 数据集 + `README.md`。

## 4. 内容数量与顺序

```bash
# 条目数量
find content/gallery -mindepth 1 -maxdepth 1 -type d | wc -l   # 12
find content/teachers -mindepth 1 -maxdepth 1 -type d | wc -l  # 4
find content/news -name '*.md' | wc -l                          # 4

# 条目目录命名与 index.md
find content/gallery -mindepth 1 -maxdepth 1 -type d -printf '%f\n' | sort
find content/teachers -mindepth 1 -maxdepth 1 -type d -printf '%f\n' | sort
find content/gallery content/teachers -name index.md | wc -l    # 16

# 数据集内容计数
node -e "const t=require('./content/students.json'),g=require('./content/graduates.json'),p=require('./content/publications.json');console.log({students:t.length,graduates:g.length,publications:p.length})"
```

**预期**：

- Gallery 目录以 `01-` … `12-` 开头，顺序与迁移前 `gallery.json` 数组一致；
- 教师目录以 `01-` … `04-` 开头，顺序为林政 → 付鹏 → 吴大衍 → 谷井子；
- 学生 31、毕业生 13、论文 135。

**字段一致性**（在迁移前保存旧 JSON 的前提下）：

```bash
git show HEAD:src/data/teachers.json > /tmp/teachers-before.json
git show HEAD:src/data/gallery.json > /tmp/gallery-before.json
# 用一次性 Node 脚本读取新条目 frontmatter 并按序号比对字段值；
# 教师：name/title/advisorRole/directions/email/ucasProfile/homepage/bio 全部相等；
# Gallery：caption/date 全部相等，image 去掉 ./ 后与原 src 文件名相等。
```

无需把比对脚本提交仓库。

## 5. 自动校验

```bash
npm run check
npm run build
node --test tests/news-widgets.test.mjs
```

**预期**：三条命令均通过。`build` 输出包含 4 个新闻详情页，且无图片缺失、无 schema 错误。

另外执行旧路径审计：

```bash
grep -rn "src/data/\|src/content/news/\|public/gallery/\|public/teachers/" \
  src content docs astro.config.mjs package.json .github 2>/dev/null
# 期望：无输出
```

## 6. 构建产物一致性

```bash
# 新闻 URL 必须与迁移前完全一致
find dist/news -name index.html | sort > /tmp/news-after.txt
find /tmp/nlp-dist-before/news -name index.html | sort | sed 's#/tmp/nlp-dist-before#dist#' > /tmp/news-before.txt
diff /tmp/news-before.txt /tmp/news-after.txt
# 期望：无差异（4 个 URL）

# 页面数量
find /tmp/nlp-dist-before -name index.html | wc -l
find dist -name index.html | wc -l
# 期望：两者相等

# 所有图片 src 可解析（带 base 的站内资源）
grep -rho 'src="[^"]*"' dist --include='*.html' | grep -v 'data:' | sed 's/^src="//;s/"$//' \
  | sort -u | while read -r p; do
      case "$p" in
        /nlp-home/*) test -e "dist/${p#/nlp-home/}" || echo "MISSING: $p" ;;
        http*) : ;;
        *) echo "UNEXPECTED: $p" ;;
      esac
    done
# 期望：无 MISSING / UNEXPECTED；Gallery、教师、新闻图片均为 /nlp-home/_astro/... 或内容资源 URL
```

**人工抽查**：

- 打开 `dist/index.html`、`dist/team/index.html`、`dist/publications/index.html`、`dist/news/index.html`、4 个新闻详情页，比对迁移前后的可见文本、链接与顺序；
- Gallery 灯箱的 `data-gallery-src` 指向的图片文件必须存在，图注与迁移前一致；
- 教师照片、姓名、职称、方向、邮箱、链接与迁移前一致。

## 7. 本地预览与布局

```bash
npm run dev
# 或 npm run build && npm run preview
```

逐页检查：

| 页面 | 检查项 |
|------|--------|
| 首页 `/` | 教师名片 4 位顺序、照片显示、研究方向、招生区邮箱与链接 |
| Team `/team/` | 4 位教师卡片、照片、简介、链接；顺序与迁移前一致 |
| Publications `/publications/` | 135 条论文、筛选 / 年份分组、CCF 标签、日期与链接 |
| News `/news/` | 4 条新闻倒序、摘要、日期、标题链接 |
| News 详情 ×4 | 正文、配图（3 篇）、高亮块 / BibTeX / 表格、返回链接 |
| Gallery（首页） | 12 张照片、caption、灯箱开合、左右切换、ESC 关闭、图注一致 |

**视口**：320 / 375 / 480 / 576 / 768 / 1024 / 1280 / 1440 / 1920px；在每个视口确认无元素重叠、文字截断、内容溢出或页面横向滚动。图片加载成功，控制台无 404 / 资源错误。

## 8. 内容编辑冒烟测试（临时分支）

在临时分支或临时副本中执行，完成后还原：

1. **新闻**：在 `content/news/` 新增一篇最小文章，`npm run build`；确认 `/news/<slug>/` 生成，列表出现，删除后恢复。
2. **教师**：复制一个教师条目目录并改序号 / 姓名 / 照片，`npm run build`；确认 Team 与首页出现新条目且顺序正确，删除后恢复。
3. **Gallery**：替换任一条目的图片文件（同文件名），`npm run build`；确认该图更新、其他 11 张与顺序不变，恢复原图。
4. **学生 / 毕业生 / 论文**：分别修改一个非关键字段，`npm run build`；确认对应页面更新，恢复。

## 9. 负向校验抽检（临时分支）

| 操作 | 期望 |
|------|------|
| 删除某 Gallery 条目的图片文件 | `npm run build` 失败；报错指向 `content/gallery/<id>/index.md` 的 `image`，提示文件不存在 |
| 复制出第 13 个 Gallery 条目（含 `index.md`） | 构建失败；报错指向 `content/gallery/`，提示上限 12 |
| 将某教师 `photo` 改为 `./missing.svg` | 构建失败；报错指向 `content/teachers/<id>/index.md` 的 `photo` |
| 将某教师 `photo` 改为 `/teachers/x.svg` 或 `../x.svg` | 构建失败；提示只能使用同目录相对路径 |
| 删除 `content/site.json` 的 `logo` 字段 | 构建失败；提示 `content/site.json` 字段 `logo` |
| 给 `content/news/` 加入未闭合高亮块 | 构建失败；报错指向具体新闻文件与行号 |
| 给某学生同时填 `url` 与 `github` | 构建失败；提示 `content/students.json` 中学生姓名与链接三选一 |
| 给某论文填 `date` 但不填 `url` | 构建失败；提示 `content/publications.json` 中论文标题与 date/url 配对 |

所有失败报错必须包含 `content/` 路径、条目 / 姓名 / 字段与修复方向；出现旧路径即验收不通过。

## 10. 完成标准

- [ ] `npm run check`、`npm run build`、`node --test tests/news-widgets.test.mjs` 通过；
- [ ] `src/` 无新闻 / 图片 / 成员 / 论文 / 品牌数据文件；旧四个目录不存在；
- [ ] `content/` 数量、顺序、字段值与迁移前一致；无重复副本；
- [ ] 4 个新闻 URL 不变；所有图片可加载；Gallery 12 张、教师 4 位；
- [ ] 九档视口无布局破损；展示与迁移前一致；
- [ ] 旧路径引用审计无输出（历史 `specs/` 除外）；
- [ ] 内容编辑与负向校验抽检符合预期。
