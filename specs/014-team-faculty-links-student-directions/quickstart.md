# Quickstart: Team 页教师链接标签与学生主页信息补全

**Date**: 2026-11-22 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **数据契约**: [teachers-data.md](./contracts/teachers-data.md) · [team-card.md](./contracts/team-card.md)

本指南用于在实现完成后，以最小步骤验证教师链接语义、学生 Scholar / 方向补全与九档视口布局。所有命令在仓库根目录执行。

## 1. 前置条件

- Node.js ≥ 22，依赖已安装（`npm ci`）。
- 基线为实施前的 `main` / 特性分支提交；`git status` 干净，便于区分本特性改动。
- 浏览器可访问本地预览地址；Team 页路径为 `http://localhost:4321/nlp-home/team/`（以 `astro.config.mjs` 的 `base` 为准）。

## 2. 数据审计（静态检查）

```bash
# 1) UCAS 资料页只出现在 ucasProfile 键下（期望 4 条）
grep -n 'people.ucas.ac.cn' src/data/teachers.json

# 2) homepage 不得再承载 UCAS URL（期望无输出）
grep -n '"homepage": "https://people' src/data/teachers.json

# 3) 付鹏个人主页存在（期望 1 条）
grep -n 'fupeng.ac.cn' src/data/teachers.json

# 4) 仅两条新增 Scholar（期望各 1 条）
grep -n 'Fqk9CMkAAAAJ\|3gjCYDMAAAAJ' src/data/students.json

# 5) TBD 保留数量（期望 25）
grep -c '"TBD"' src/data/students.json
```

逐项人工核对：

- [ ] 4 位教师都有 `ucasProfile`；仅付鹏 `homepage` 非空，其余为 `null`。
- [ ] 顾树焕、温泽林的 `scholar` 分别等于 [spec.md](./spec.md) FR-007 的 URL；赵语林三字段仍为 `null`。
- [ ] 杨晨旭、顾佴彬、李雨晴、佟政阳、刘曦雨、李佳睿的 `directions` 与 [data-model.md](./data-model.md) §2.1 一致。
- [ ] 其余 25 位学生 `directions` 仍为 `["TBD"]`。
- [ ] `students.json` 中其余 23 条记录无任何字段变化（11 条已有链接 + 12 条三字段全空）；6 位方向变更学生的链接字段原值不变。

## 3. 构建门禁

```bash
npm run check
npm run build
```

期望：两条命令退出码均为 0，构建产物生成，无 schema / 类型错误。

## 4. 数据契约探针（临时修改后必须恢复）

| 探针 | 操作 | 期望 |
| --- | --- | --- |
| P1 教师主页必须 HTTPS | 把付鹏 `homepage` 临时改为 `http://fupeng.ac.cn/`，运行 `npm run build` | 构建失败，报错含 `homepage` 与 https 要求；恢复原值后重新构建通过 |
| P2 教师主页可空 | 把付鹏 `homepage` 临时改为 `null` 或删除该键，运行 `npm run build`，预览 Team 页与首页 | 构建通过；付鹏在两处名片都只显示 `UCAS Profile ↗`，无空 `Homepage` 标签；恢复原值 |
| P3 学生方向必填 | 临时删除杨晨旭的 `directions` 字段，运行 `npm run build` | 构建失败，报错含 `src/data/students.json`、`杨晨旭`、`directions`；恢复原值 |
| P4 UCAS 资料页必须 HTTPS | 把付鹏 `ucasProfile` 临时改为 `http://people.ucas.ac.cn/~fupeng`，运行 `npm run build` | 构建失败，报错含 `ucasProfile` 与 https 要求；恢复原值后重新构建通过 |

> 每次探针恢复后 MUST 再运行一次 `npm run build`，确保最终工作区为完整数据状态。

## 5. 本地预览与九档视口验收

```bash
npm run preview
```

在浏览器打开 `/team/` 与首页 `/`，按 320 / 375 / 480 / 576 / 768 / 1024 / 1280 / 1440 / 1920px 逐档检查。

### 5.1 Team 页 Faculty 区

- [ ] 4 张教师名片均出现且仅出现 1 个 `UCAS Profile ↗`，指向原 `people.ucas.ac.cn` URL。
- [ ] 付鹏名片依次为「邮箱 → `UCAS Profile ↗` → `Homepage ↗`」，后者指向 `https://fupeng.ac.cn/`。
- [ ] 林政、吴大衍、谷井子名片不出现 `Homepage` 标签。
- [ ] 链接文字无重叠、无截断、无卡片内溢出；`UCAS Profile` / `Homepage` 不在单词内部换行（整项换行允许）。
- [ ] 页面无横向滚动：控制台执行 `document.documentElement.scrollWidth === window.innerWidth` 为 `true`。

### 5.2 首页 Team 概览区

- [ ] 4 张教师名片均出现且仅出现 1 个 `UCAS Profile ↗`，指向原 `people.ucas.ac.cn` URL。
- [ ] 付鹏名片依次为「`UCAS Profile ↗` → `Homepage ↗`」，后指向 `https://fupeng.ac.cn/`；不出现邮箱。
- [ ] 林政、吴大衍、谷井子名片不出现 `Homepage` 标签。
- [ ] 链接文字无重叠、无截断、无卡片内溢出；`UCAS Profile` / `Homepage` 不在单词内部换行（整项换行允许）。
- [ ] 页面无横向滚动：`document.documentElement.scrollWidth === window.innerWidth`。
- [ ] 首页新闻、发表、Gallery、Team 标题等其余区块与实施前一致。

### 5.3 在读学生区

- [ ] 6 位学生显示新方向标签，文本与来源一致；其余 25 位仍为 `TBD`。
- [ ] 顾树焕、温泽林显示 `Scholar ↗` 并指向 FR-007 的 URL；赵语林及另外 11 位无任何链接标签。
- [ ] ≥1024px：每个方向标签内部单行（标签元素 `scrollHeight` 等于单行高度）。
- [ ] 768px：允许标签内部换行，但无页面横向滚动、无元素重叠。
- [ ] 320 / 375px：姓名、标签组、链接依次排列，链接右对齐，无覆盖。

### 5.4 九档矩阵记录

| 视口 | Team Faculty 无重叠/截断/溢出 | 首页名片无重叠/截断/溢出 | 学生标签换行符合预期 | 无页面横向滚动 |
| --- | --- | --- | --- | --- |
| 320px | [ ] | [ ] | [ ] | [ ] |
| 375px | [ ] | [ ] | [ ] | [ ] |
| 480px | [ ] | [ ] | [ ] | [ ] |
| 576px | [ ] | [ ] | [ ] | [ ] |
| 768px | [ ] | [ ] | [ ] | [ ] |
| 1024px | [ ] | [ ] | [ ] | [ ] |
| 1280px | [ ] | [ ] | [ ] | [ ] |
| 1440px | [ ] | [ ] | [ ] | [ ] |
| 1920px | [ ] | [ ] | [ ] | [ ] |

破损判定口径见 [team-card.md](./contracts/team-card.md) §4.3：以逐元素 `getBoundingClientRect()` 越界检查为权威判据；任一元素视觉重叠、文字裁剪、越出卡片、标签词内断行或页面横向滚动均为 FAIL。

## 6. 链接落地页核对

- [ ] Team 页与首页共 8 个 `UCAS Profile ↗` 分别打开 `https://people.ucas.ac.cn/~linzheng`、`~fupeng`、`~dayan`、`~0082145`。
- [ ] 付鹏在两处页面的 `Homepage ↗` 均打开 `https://fupeng.ac.cn/`。
- [ ] 顾树焕、温泽林 `Scholar ↗` 打开对应本人档案。
- [ ] 所有网页外链在新标签页打开，源页面未被替换、未被写入 opener。

## 7. 回归检查

```bash
# 改动范围只应有 5 个文件
git diff --stat

# 以下文件必须零 diff（无输出即通过）
git diff --exit-code -- src/components/StudentGroup.astro src/pages/team.astro \
  src/pages/index.astro src/pages/publications.astro src/data/graduates.json \
  src/data/publications.json src/data/site.json package.json package-lock.json \
  astro.config.mjs tests/news-widgets.test.mjs
```

- [ ] `git diff src/data/students.json` 只包含 2 条 `scholar` 与 6 条 `directions` 变更，其余 23 条记录零 diff（11 条已有链接 + 12 条三字段全空）；6 位方向变更学生的链接字段原值不变。
- [ ] 首页仅教师名片链接区变化（4 个 `UCAS Profile ↗`、付鹏 1 个 `Homepage ↗`）；首页新闻、发表、Gallery 等其余区块与实施前一致。
- [ ] Graduates 列表的 `Homepage ↗` 文案与语义不变。
- [ ] 发表页、新闻页、导航、页脚无变化。

## 8. 完成判定

全部满足即通过：

1. `npm run check` 与 `npm run build` 通过，P1 / P3 / P4 的失败探针符合预期，P2 的可空探针符合预期且已恢复。
2. 九档视口无布局破损，`scrollWidth === innerWidth`。
3. 链接落地页全部正确，首页仅教师名片链接区变化，其余页面零 diff。
4. 数据审计的 5 项静态检查全部符合期望值。
