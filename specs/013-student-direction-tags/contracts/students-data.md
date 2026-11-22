# Contract: 在读学生数据（students-data）

**Date**: 2026-11-22 | **Spec**: [spec.md](../spec.md) | **消费方**: `src/data/students.json` 维护者、`src/content.config.ts` 校验实现、[quickstart.md](../quickstart.md) 验收 | **数据模型**: [data-model.md](../data-model.md)

本契约定义 `src/data/students.json` 的字段、`directions` 与成员链接规则、构建期校验错误，以及在读学生数据的维护流程。字段的渲染位置与行内布局见 [team-row.md](./team-row.md)。

## 1. 顶层结构

`students.json` MUST 为 JSON 数组；每个元素为一名在读学生。数组顺序即页面展示顺序，MUST NOT 依赖 `grade`、姓名或其他字段重新排序。

```json
[
  {
    "name": "张三",
    "level": "phd",
    "directions": ["TBD"],
    "url": null,
    "github": null,
    "scholar": null
  }
]
```

## 2. 字段契约

| 字段 | 类型 | 必填 | 契约 |
| --- | --- | --- | --- |
| `name` | `string` | 是 | 非空；姓名列 3.5em，当前名单最多 3 个汉字；4 字姓名在列内换行；页面以纯文本展示，不生成链接 |
| `level` | `"phd"` \| `"master"` | 是 | 决定进入 `PhD Candidates` 或 `Master's Students` 分组 |
| `directions` | `string[]` | 是 | 长度 ≥ 1；每项为非空、非纯空白字符串；顺序即页面标签顺序；当前全部为 `["TBD"]` |
| `url` | `string \| null` | 否 | 自建个人主页（含 GitHub Pages 学术主页）或机构个人资料页；HTTPS；与 `github` / `scholar` 至多一个非空 |
| `github` | `string \| null` | 否 | GitHub 个人主页；HTTPS；与 `url` / `scholar` 至多一个非空 |
| `scholar` | `string \| null` | 否 | Google Scholar 主页；HTTPS；与 `url` / `github` 至多一个非空 |

### 2.1 禁止字段

- `grade` MUST NOT 出现在任何学生记录中，MUST NOT 以 `year`、`enrollment`、`since` 等字段变相保留入学年份。
- 本期不新增 `grade` 残留的构建期校验；`grade` 的删除由数据清理与 `src/` 检索保证（评审决定：避免过度防御）。

### 2.2 `directions` 契约

- 类型 MUST 为数组；缺失、`null`、字符串、对象或其他类型均构建失败。
- 长度 MUST ≥ 1；空数组构建失败。
- 每项 MUST 为非空字符串；`""`、`"   "`、非字符串项构建失败。
- 标签文本 MUST 原样渲染：不 trim、不改写、不截断、不省略；长文本允许在标签内部换行。
- 前后空格（非纯空白）与重复项 MUST NOT 视为构建错误；由维护者避免，渲染不做 trim 或去重。
- 当前 31 条 MUST 全部为 `["TBD"]`；`TBD` 是规格授权的临时占位，不是真实研究方向。
- 维护者替换为真实方向时 MUST 与课题组权威信息一致，MUST NOT 凭推测填写（FR-012）。

### 2.3 成员链接契约

- 优先级 MUST 为：自建个人主页（含 GitHub Pages 学术主页）→ 机构个人资料页（如国科大 / 研究所个人页）→ GitHub → Google Scholar。不新增平台分类清单；按上述四档优先级与强关联证据逐条判断（评审决定）。
- 每人 MUST 至多一个字段非空；同时填写 ≥2 个字段时构建 MUST 失败，错误信息指出学生姓名与全部冲突字段。
- `url` 字段承载两类来源：自建个人主页与机构个人资料页；两者同时存在时自建主页优先，页面标签统一为 `Homepage`。
- GitHub Pages 个人站 MUST 记入 `url`，MUST NOT 记入 `github`。
- 所有非空链接 MUST 以 `https://` 开头；HTTP、裸域名、`mailto:`、搜索页均不合法。
- 写入前 MUST 至少取得一项强关联证据：
  - 页面或公开资料明确关联中科院信工所 / 国科大 / G3（CIGMA）/ 在读层次 / 导师；或
  - 有与课题组成员合作的论文（作者列表、单位或致谢可核实）。
- 仅姓名相同 MUST NOT 写入；无法核实归属时 MUST 留空（三个字段均为 `null`）。
- 无链接时三个字段统一写 `null`；schema 兼容省略，但数据文件不采用省略写法。
- 现有链接 MUST 重新核实；找到更高优先级且可核实来源时 MUST 替换并删除低优先级字段；失效或不属于本人且无替代来源时 MUST 移除。
- 不要求单独的证据文件（评审决定）；无链接学生 MUST 在完成报告中单独列出，供课题组人工补充（SC-007）。

## 3. 构建期校验错误矩阵

| 场景 | 构建结果 | 错误信息 MUST 包含 |
| --- | --- | --- |
| JSON 不合法 | 失败 | `src/data/students.json`、解析错误 |
| 顶层不是数组 | 失败 | `src/data/students.json`、"顶层必须是数组" |
| `directions` 缺失 | 失败 | 文件、学生姓名、`directions` |
| `directions` 不是数组 | 失败 | 文件、学生姓名、`directions` |
| `directions` 为空数组 | 失败 | 文件、学生姓名、`directions`、至少 1 项 |
| `directions` 含空字符串 | 失败 | 文件、学生姓名、`directions`、项序号 |
| `directions` 含纯空白字符串 | 失败 | 文件、学生姓名、`directions`、项序号 |
| `directions` 含非字符串 | 失败 | 文件、学生姓名、`directions`、项序号 |
| 链接字段 ≥2 个非空 | 失败 | 文件、学生姓名、全部冲突字段 |
| 链接非 HTTPS | 失败 | entry id、字段；错误信息含 https 要求 |
| `name` 缺失 / `level` 非法 | 失败 | entry id、字段；`directions` 由模块级校验补足文件与姓名 |

`directions` / 多链接冲突的错误信息 MUST 能让维护者直接定位到文件、学生与字段；其他既有 schema 错误至少包含 entry id 与字段。`grade` 残留不新增构建期校验（评审决定：避免过度防御）。

## 4. 排序、分组与切分

- 展示顺序：按数据文件条目顺序（entry id `stu-###` 升序）；MUST NOT 按 `grade`、姓名或标签文本排序。
- 分组：按 `level` 过滤为 PhD 与 Master's 两组；组内顺序沿用文件顺序。
- 切分：≥768px 时每组按 `ceil(n/2)` 切分左右两栏；`n=1` 使用单栏 `.is-single`；`n=0` 显示 "coming soon" 占位。
- 当前基准：31 条（PhD 20 / Master's 11）；≥768px 切分为 PhD 10+10、Master's 6+5。
- 维护者调整数据文件条目顺序时，页面顺序随之改变；双栏切分仍按 `ceil(n/2)`，不重新排序。

## 5. 维护流程

1. 在 `src/data/students.json` 增删学生或修改字段；研究方向只改 `directions`，成员链接只改 `url` / `github` / `scholar`。
2. 本地运行 `npm run build`；若 `directions` 或链接违约，按报错中的文件、姓名与字段修正。
3. 新学生默认写 `"directions": ["TBD"]`，待课题组提供真实方向后替换。
4. 成员链接按 §2.3 的优先级与 HTTPS 要求填写；无法核实时保持 `null`，不要填搜索页或同名页面。
5. 提交并推送；GitHub Pages 按既有流水线自动部署。

## 6. 回归与范围

- `graduates.json` 的 `year`（毕业年份）MUST 保留，Graduates 列表渲染不变。
- `teachers.json` 的 `directions`、`Faculty` 卡片、首页、发表页、新闻页、导航与页脚 MUST 不变。
- `specs/001`–`012` 中的 `grade` / Since 记录属于历史归档，MUST NOT 视为待清理字段。
- 本契约不新增字段、不新增数据文件、不改变 `students` collection 的 loader 与 entry id 规则。
