# Contract: Publications 数据与链接审计

**Feature**: 009-publication-link-ccf | **Date**: 2026-11-19 | **Data**: `src/data/publications.json`

本契约约束 `publications.json` 的字段取值、允许的变更范围与链接审计记录格式。CCF 判定表见 [ccf-rating.md](./ccf-rating.md)；条目渲染见 [publication-item-dom.md](./publication-item-dom.md)。

## 1. 字段契约

| 字段 | 规则 | 校验点 |
|------|------|--------|
| `title` | 非空字符串；本特性零改动 | schema `min(1)` |
| `venue` | 非空字符串；本特性零改动 | schema `min(1)` |
| `year` | 1980–2100 整数；本特性零改动 | schema |
| `date` | `YYYY-MM-DD` 合法日历日期；有 `url` 必有，无 `url` 必无；新增链接取正式发布日期，仅 arXiv 可用时取 arXiv v1 提交日 | schema 双向 refine |
| `ccf` | `'A'` \| `'B'` \| `'C'` 或缺省；缺省即省略字段，不得为 JSON `null`；值必须等于 [ccf-rating.md](./ccf-rating.md) 的判定 | schema enum（拒绝 `null`）+ 数据门禁 |
| `url` | HTTPS URL 或缺省；缺省即省略字段，不得为 JSON `null`；题名必须与条目一致 | publications schema 拒绝 `null` + 审计记录 |
| `featured` | boolean，缺省 false；本特性零改动 | schema |
| `authors` | string[] 或缺省；本特性零改动 | schema |

## 2. 允许的变更范围

本特性对 `publications.json` 的 diff MUST 仅包含：

1. `url` 的替换 / 新增 / 移除；
2. 与 `url` 增删同步的 `date` 新增 / 移除（`url` 替换时 `date` 不变）；
3. `ccf` 的新增 / 修正 / 移除。

MUST NOT 修改 `title`、`venue`、`year`、`authors`、`featured`；MUST NOT 新增、删除或重排条目的语义身份（数组顺序可因编辑工具变化，但 135 条内容必须一一对应）。

## 3. 链接有效性契约

| 条件 | 判定 |
|------|------|
| 题名/作者/venue/年份与条目指向同一篇论文 | 有效（题名大小写、标点、连字符差异可接受） |
| DOI 可解析，落到付费墙 / 登录 / 403 / 验证码 | 有效（不单独构成移除理由） |
| DOI resolver 返回 600 / 连接失败 / 超时，但 handle API 的目标与官方页/PDF 题名一致 | 有效（自动化访问限制，不构成移除理由） |
| 404、域名失效、跳转无关首页 / 检索页 / 作者主页 | 缺陷，必须替换或移除 |
| 跳转到另一篇论文、书籍、期刊首页 | 缺陷，必须替换或移除 |
| 非 HTTPS | 缺陷，必须改为 HTTPS 或移除 |
| 中文论文使用 CNKI / 万方 / 维普 / 百度学术检索页 | 缺陷；按 host 判定（`cnki.net`、`wanfangdata.com.cn`、`cqvip.com`、`xueshu.baidu.com`）；只接受期刊官方 DOI 或官网文章页；DOI 字符串中的 `cnki` 注册机构标识不判错 |
| 已有正式版本（DOI/论文集/期刊官网）仍指向 arXiv | 缺陷，必须替换为官方链接 |

**来源优先级**：DOI > 出版社/会议论文集正式页面 > 期刊官网文章页 > arXiv。

## 4. 链接审计记录（`evidence/link-audit.md`）

135 条条目每条一行，列固定为：

```text
| # | 条目（title · venue · year） | 当前 URL | 最终 URL | 来源类型 | 核验证据 | 决定 | 理由 |
```

- **来源类型**：`DOI` / `出版社` / `会议论文集` / `期刊官网` / `arXiv` / `无`。
- **核验证据**：元数据来源（Crossref / arXiv API / 落地页）+ 题名匹配结论；无法核实时写明查询、失败原因与课题组负责人确认结果。
- **决定**：`保留` / `替换` / `新增` / `移除` / `保持无链接`。
- **理由**：`无法核实（含负责人确认）`、`404`、`非同一篇`、`付费墙但题名一致` 等；无需说明时留空。

验收：表格数据行数 = 135；`替换` / `新增` / `移除` 的条目必须能在 `publications.json` 的 diff 中找到对应变更；`保持无链接` 的条目必须无 `url` 且无 `date`。

## 5. 数据不变量

- **D1**：条目总数 = 135。
- **D2**：`url` 存在 ⇔ `date` 存在；`url`/`ccf` 缺省时字段必须省略，不得为 JSON `null`。
- **D3**：所有 `url` 以 `https://` 开头。
- **D4**：`ccf` 仅取 `A` / `B` / `C` 或缺省；分布为 A=66、B=48、C=3、无等级=18。
- **D5**：`title` / `venue` / `year` / `featured` / `authors` 与变更前逐条一致。
- **D6**：每条 `url` 在 `evidence/link-audit.md` 中有题名匹配证据。
- **D7**：每条 `ccf` 在 `evidence/ccf-audit.md` 中有目录版本与依据；无等级条目也有判定记录。

## 6. 机器校验

`quickstart.md` 中的数据门禁脚本必须输出：

```text
entries=135
url=125+新增-移除   (审计完成后以实际为准)
A=66 B=48 C=3 none=18
url⇔date violations=0
non-https=0
null url/ccf=0
rating mismatches=0
```

任一计数不符或出现违规项即视为本契约未满足。
