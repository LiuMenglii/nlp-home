# Data Model: Team 页教师链接标签与学生主页信息补全

**Date**: 2026-11-22 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

本特性只调整 `src/data/teachers.json` 与 `src/data/students.json` 的内容字段，不新增数据文件、不改变 collection loader、entry id 规则或页面结构。数据模型分为三个实体：教师（Teacher）、在读学生（Student）与研究方向标签（DirectionTag）。

## 1. Teacher（教师）

**来源**: `src/data/teachers.json`（4 条）
**消费方**: `TeacherCard.astro`（Team 详细名片 / 首页概览名片）

| 字段 | 类型 | 必填 | 契约 | 展示 |
| --- | --- | --- | --- | --- |
| `name` | `string` | 是 | 非空 | 名片标题 |
| `title` | `string` | 是 | 英文职称，非空 | 姓名下方 |
| `advisorRole` | `"phd" \| "master"` | 是 | 导师角色 | 当前页面不直接展示 |
| `directions` | `string[]` | 是 | 至少 1 项 | 姓名下方方向 chip |
| `email` | `string \| null` | 否 | 合法邮箱；`detailed` 时展示为 `mailto:` | 链接区第一项 |
| `ucasProfile` | `string \| null` | 否 | **本特性由 `homepage` 更名**；HTTPS；UCAS 个人资料页 | 两处名片：`UCAS Profile ↗` |
| `homepage` | `string \| null` | 否 | **本特性新增**；HTTPS；个人主页；缺省或 `null` 合法 | 两处名片：`Homepage ↗` |
| `photo` | `string \| null` | 否 | `/teachers/` 下存在的文件名 | 名片照片 |
| `bio` | `string \| null` | 否 | 非空时展示 | `detailed` 时姓名下方 |

### 1.1 当前数据快照

| 教师 | `ucasProfile` | `homepage` |
| --- | --- | --- |
| 林政 | `https://people.ucas.ac.cn/~linzheng` | `null` |
| 付鹏 | `https://people.ucas.ac.cn/~fupeng` | `https://fupeng.ac.cn/` |
| 吴大衍 | `https://people.ucas.ac.cn/~dayan` | `null` |
| 谷井子 | `https://people.ucas.ac.cn/~0082145` | `null` |

### 1.2 链接视图映射

```text
详细名片（Team）：
  顺序 1：email       → href="mailto:{email}"，无 ↗（既有行为）
  顺序 2：ucasProfile → 文案 "UCAS Profile ↗"
  顺序 3：homepage    → 文案 "Homepage ↗"

概览名片（首页）：
  顺序 1：ucasProfile → 文案 "UCAS Profile ↗"
  顺序 2：homepage    → 文案 "Homepage ↗"
  不渲染 email 与 bio
```

- 任一字段为 `null` / 缺省时跳过该链接，不渲染空标签或占位。
- 外链统一 `target="_blank"` + `rel="noopener"`；`UCAS Profile` / `Homepage` 的箭头为 `aria-hidden="true"`。
- 顺序固定，MUST NOT 依据字段是否存在重排。

## 2. Student（在读学生）

**来源**: `src/data/students.json`（31 条）
**消费方**: `StudentGroup.astro`

| 字段 | 类型 | 必填 | 契约 | 展示 |
| --- | --- | --- | --- | --- |
| `name` | `string` | 是 | 非空 | 姓名列（纯文本） |
| `level` | `"phd" \| "master"` | 是 | 决定分组 | PhD Candidates / Master's Students |
| `directions` | `string[]` | 是 | 长度 ≥ 1；每项非空、非纯空白；顺序即标签顺序 | 姓名与链接之间的方向标签组 |
| `url` | `string \| null` | 否 | HTTPS；与 `github` / `scholar` 至多一个非空 | `Homepage ↗` |
| `github` | `string \| null` | 否 | HTTPS；与 `url` / `scholar` 至多一个非空 | `GitHub ↗` |
| `scholar` | `string \| null` | 否 | HTTPS；与 `url` / `github` 至多一个非空 | `Scholar ↗` |

### 2.1 本特性数据变更（仅 8 条）

| 学生 | 层次 | 字段 | 变更前 | 变更后 |
| --- | --- | --- | --- | --- |
| 顾树焕 | master | `scholar` | `null` | `https://scholar.google.com/citations?user=Fqk9CMkAAAAJ` |
| 温泽林 | master | `scholar` | `null` | `https://scholar.google.com/citations?user=3gjCYDMAAAAJ` |
| 杨晨旭 | phd | `directions` | `["TBD"]` | `["Multimodal LLM", "Reinforcement Learning"]` |
| 顾佴彬 | phd | `directions` | `["TBD"]` | `["Efficient LLM", "Post-Training"]` |
| 李雨晴 | phd | `directions` | `["TBD"]` | `["RAG", "Agent Memory"]` |
| 佟政阳 | phd | `directions` | `["TBD"]` | `["LLM"]` |
| 刘曦雨 | phd | `directions` | `["TBD"]` | `["LLM", "Knowledge Editing"]` |
| 李佳睿 | master | `directions` | `["TBD"]` | `["RAG", "Memory"]` |

- 其余 23 条学生记录 MUST 零 diff（其中 11 条已有链接、12 条三字段全空）。已有链接的 17 位学生中，11 条整条记录零 diff，6 条仅 `directions` 按 FR-011/FR-012 变更、`url` / `github` / `scholar` 字段零 diff。
- 赵语林、周俊豪、汪嘉、王娅彤、彭诗忠、沈斌、朱祉同、张蓓泽、叶振雷、艾明旭、张蓬月、毛乐平 12 条 MUST 保持 `url` / `github` / `scholar` 全 `null`。
- 未列出的 25 位学生 MUST 保持 `["TBD"]`。

## 3. DirectionTag（研究方向标签）

**来源**: `Student.directions` 的每一项（字符串）。
**消费方**: `StudentGroup.astro` 的 `.direction-tag`。

| 属性 | 契约 |
| --- | --- |
| 文本 | 原样渲染，不 trim、不改写、不截断、不省略 |
| 数量 | 每位学生 1–2 项（`TBD` 占位为 1 项） |
| 长度 | 以 ≥1024px 三轨布局中单行显示为目标；当前最长 `Reinforcement Learning` 约 190px，列宽 224px |
| 视觉 | 沿用 013：`--sky` 背景、`border-radius: 4px`、`padding: 2px 8px`、`font-size: 0.9rem`、`color: var(--ink-soft)` |
| 换行 | 组内按需换行；单个标签在窄视口允许内部换行；MUST NOT 造成页面横向溢出 |

## 4. 校验规则

| 规则 | 层级 | 失败行为 | 来源 |
| --- | --- | --- | --- |
| `ucasProfile` / `homepage` 非 HTTPS | teachers schema `httpsUrl` | 构建失败，报错含字段与 https 要求 | FR-002 / FR-004 / FR-015 |
| `ucasProfile` / `homepage` 缺省或 `null` | teachers schema | 合法，不渲染对应链接 | FR-003 / FR-015 |
| 教师 `photo` 指向 `public/teachers/` 外或不存在 | teachers object schema | 构建失败，报错含教师姓名与路径 | 003 既有规则，不变 |
| `directions` 缺失 / 非数组 / 空数组 / 含空项 | `validateStudentsData()` + students schema | 构建失败，报错含文件、姓名、字段与项序号 | 013 既有规则，不变 |
| 学生链接 ≥2 个非空 | `singleLinkRefiner('src/data/students.json')` | 构建失败，报错含姓名与全部冲突字段 | FR-009 |
| 学生链接非 HTTPS | students schema `httpsUrl` | 构建失败，报错含字段与 https 要求 | 013 既有规则，不变 |

## 5. 不变量

1. 教师 4 条；每条 `ucasProfile` 非空；仅付鹏 `homepage` 非空。
2. Team 页 Faculty 与首页 Team 概览共 8 张名片，每张恰好渲染 1 个 `UCAS Profile ↗`；付鹏在两处的名片各额外渲染 1 个 `Homepage ↗`；其他教师不渲染 `Homepage`。
3. 首页除教师名片链接区（`UCAS Profile` 文案与付鹏的个人主页链接）外，其余区块输出与实施前一致。
4. 在读学生 31 条；每位学生 `url` / `github` / `scholar` 至多一个非空。
5. 完成本特性后，有链接的学生 19 位（原 17 位 + 顾树焕 + 温泽林），无链接学生 12 位。
6. `directions` 非 `["TBD"]` 的学生 6 位；其余 25 位保持 `["TBD"]`。
7. 除第 2.1 节列出的 8 条字段外，`students.json` 所有字节不变；除教师链接字段更名/新增外，`teachers.json` 其余字段不变。

## 6. 状态与生命周期

本特性不引入运行时状态；数据生命周期沿用既有静态流程：

```text
编辑 JSON → npm run check / npm run build 校验 → 提交推送 → GitHub Pages 构建部署
```

- 校验失败时线上保持上一正常版本（Constitution III）。
- 无数据库、无缓存、无服务端状态；构建产物即为最终展示数据。
