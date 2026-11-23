# Contract: 教师数据（teachers-data）

**Date**: 2026-11-22 | **Spec**: [spec.md](../spec.md) | **消费方**: `src/data/teachers.json` 维护者、`src/content.config.ts` 校验实现、[quickstart.md](../quickstart.md) 验收 | **数据模型**: [data-model.md](../data-model.md)

本契约定义 `teachers.json` 的字段、UCAS 资料页与个人主页的区分、构建期校验错误与迁移规则。名片的渲染顺序、标签文案与换行行为见 [team-card.md](./team-card.md)。

## 1. 顶层结构

`teachers.json` MUST 为 JSON 数组；每个元素为一位教师。数组顺序即 `teacher-grid` 的展示顺序。

```json
[
  {
    "name": "付鹏",
    "title": "Associate Professor",
    "advisorRole": "master",
    "directions": ["Natural Language Processing", "Efficient LLM Applications"],
    "email": "fupeng@iie.ac.cn",
    "ucasProfile": "https://people.ucas.ac.cn/~fupeng",
    "homepage": "https://fupeng.ac.cn/",
    "photo": "/teachers/fu-peng.svg",
    "bio": "Associate Professor at IIE, CAS. ..."
  }
]
```

## 2. 字段契约

| 字段 | 类型 | 必填 | 契约 |
| --- | --- | --- | --- |
| `name` | `string` | 是 | 非空 |
| `title` | `string` | 是 | 英文职称，非空 |
| `advisorRole` | `"phd"` \| `"master"` | 是 | 博导 / 硕导 |
| `directions` | `string[]` | 是 | 至少 1 项英文研究方向 |
| `email` | `string` \| `null` | 否 | 合法邮箱；用于 `mailto:` |
| `ucasProfile` | `string` \| `null` | 否 | UCAS 个人资料页；MUST 为 `https://`；未配置写 `null` |
| `homepage` | `string` \| `null` | 否 | 教师个人主页；MUST 为 `https://`；未配置写 `null` |
| `photo` | `string` \| `null` | 否 | `/teachers/` 下已存在的文件名 |
| `bio` | `string` \| `null` | 否 | 非空时在 Team 详细名片展示 |

### 2.1 两个链接字段的语义

- `ucasProfile` MUST 只承载国科大（UCAS）个人资料页，典型域名为 `people.ucas.ac.cn`；两处名片标签均为 `UCAS Profile ↗`。
- `homepage` MUST 只承载教师本人维护的个人主页（如 `https://fupeng.ac.cn/`）；两处名片标签均为 `Homepage ↗`。
- 两个字段 MAY 同时存在；MAY 都为空。
- `homepage` MUST NOT 写入 UCAS 资料页 URL、搜索页、实验室首页或他人主页。
- 两者都是 HTTPS 外链；HTTP、裸域名、`mailto:` 不合法。

### 2.2 迁移规则（本特性一次性）

旧字段 `homepage` 曾表示 UCAS 资料页。本次迁移 MUST 原子完成：

1. 旧 `homepage` 的 UCAS URL 移到 `ucasProfile`；
2. 新 `homepage` 写个人主页，未配置写 `null`；
3. schema 与 `TeacherCard` 同一次变更内切换字段名。

> Zod object 会忽略未知键，但 `homepage` 是合法的新字段名：若只改 schema 不改数据，旧的 UCAS URL 会被当成「个人主页」渲染为 `Homepage ↗`，造成语义错误。因此 MUST NOT 分步提交「先改 schema、后改数据」；quickstart 用 grep 检查 `homepage` 中不得出现 `people.ucas.ac.cn`。

## 3. 构建期校验错误矩阵

| 场景 | 构建结果 | 错误信息 MUST 包含 |
| --- | --- | --- |
| JSON 不合法 | 失败 | `src/data/teachers.json`、解析错误 |
| 顶层不是数组 | 失败 | `src/data/teachers.json`、「顶层必须是数组」 |
| `name` / `title` 缺失或为空 | 失败 | entry id、字段 |
| `advisorRole` 非法 | 失败 | entry id、字段 |
| `directions` 缺失或空数组 | 失败 | entry id、字段 |
| `ucasProfile` 为 HTTP / 非 URL | 失败 | entry id、字段、https 要求 |
| `homepage` 为 HTTP / 非 URL | 失败 | entry id、字段、https 要求 |
| `homepage` 缺省或 `null` | **通过** | —（合法未配置状态） |
| `ucasProfile` 缺省或 `null` | **通过** | —（该教师不渲染 UCAS 链接） |
| `photo` 不是 `/teachers/` 路径或文件不存在 | 失败 | 教师姓名、`photo`、目标路径 |

现有 `jsonArrayParser` 的解析错误载体与 `jsonParseErrorField` 行为不变。

## 4. 当前数据快照

| 教师 | `ucasProfile` | `homepage` |
| --- | --- | --- |
| 林政 | `https://people.ucas.ac.cn/~linzheng` | `null` |
| 付鹏 | `https://people.ucas.ac.cn/~fupeng` | `https://fupeng.ac.cn/` |
| 吴大衍 | `https://people.ucas.ac.cn/~dayan` | `null` |
| 谷井子 | `https://people.ucas.ac.cn/~0082145` | `null` |

- 四条 `ucasProfile` MUST 保持上表原值（相对实施前 `homepage` 的 URL 零变化）。
- 除付鹏外，其余三条 `homepage` MUST 为 `null`。

## 5. 维护流程

1. 修改 `src/data/teachers.json`：UCAS 资料页改 `ucasProfile`，个人主页改 `homepage`。
2. 新增教师时，无个人主页写 `"homepage": null`，无 UCAS 资料页写 `"ucasProfile": null`；不要省略键造成歧义。
3. `npm run build`；HTTPS、照片存在性与必填字段错误按报错中的 entry id / 教师姓名 / 字段修正。
4. 提交并推送；GitHub Pages 按既有流水线部署。

## 6. 回归与范围

- `src/components/TeacherCard.astro` 是唯一消费方；`index.astro` / `team.astro` MUST 零改动。
- 首页概览名片的教师链接 MUST 与 Team 页一致：`UCAS Profile ↗` 指向 `ucasProfile`，付鹏额外显示 `Homepage ↗` 指向个人主页；首页其余部分 MUST 零改动。
- 学生数据、毕业生数据、论文、新闻、站点品牌与导航页脚 MUST 不受本契约影响。
- `specs/001`–`013` 中关于教师 `homepage` 的历史描述属于归档，MUST NOT 回溯改写。
