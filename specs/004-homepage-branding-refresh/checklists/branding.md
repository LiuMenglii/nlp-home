# 品牌视觉与矢量资产 Checklist: 主页品牌焕新（Homepage Branding Refresh）

**Purpose**: 校验「品牌视觉与响应式布局」+「logo/favicon 矢量资产与构建期校验」两类需求自身的质量——完整性、清晰度、一致性、可测量性与场景覆盖（不是验证实现是否正确）。
**Created**: 2026-10-16
**Feature**: [spec.md](../spec.md)（关联 [plan.md](../plan.md)、[data-model.md](../data-model.md)、[contracts/site-branding.md](../contracts/site-branding.md)、[quickstart.md](../quickstart.md)）

**Note**: 本清单由 `/speckit-checklist` 命令依据本特性上下文生成；聚焦范围为品牌视觉与响应式布局 + 矢量资产与构建期校验（Standard 深度，评审者视角）。
**Review Ownership**: 本清单为评审者所有的「需求质量」复查工件。仅当评审者判定某条需求质量准则已满足时才可标记 `[x]`。
**Marker Semantics**: `[x]` 表示该需求质量准则已复查通过，**不**代表实现工作已完成。
**Scope Exclusions**: 本清单不覆盖运行/性能、论文数据准确性、News/Team/Publications 内容正确性等本特性范围外维度。

## 品牌信息层级与文案（Completeness / Clarity）

- [x] CHK001 名栏四层信息的层级关系是否已量化或给出可判定的视觉权重规定（哪层为主标题、哪层为次要文本）？ [Clarity, Spec §FR-005]
- [x] CHK002 "认知智能生成课题组CIGMA" 中中文名称与品牌字 "CIGMA" 之间是否留空格、是否同字号/同字重、是否允许被断行，是否已明确规定？ [Clarity, Gap, Data-Model §1]
- [x] CHK003 别名行的展示格式（"G3课题组" 与英文全称之间的分隔符、字号关系、是否强制同行）是否已明确，而非留给实现随意决定？ [Clarity, Spec §FR-005③, Contract §3]
- [x] CHK004 顶栏品牌区中 logo 图形尺寸与 "CIGMA" 文字字号的比例/基线关系是否给出量化约束（含最小可辨尺寸）？ [Clarity, Spec §FR-003, Data-Model §3]
- [x] CHK005 标签页标题与 meta 描述的目标措辞是否被定义，还是仅规定「随数据更新」而未给出可核对的成品文案？ [Gap, Spec §FR-007, Spec §Assumptions]
- [x] CHK006 "全站 MUST NOT 出现 iie-CIGMA" 的核查范围（页面可见文本、`<title>`/meta、alt/aria 属性、构建产物、资源文件名）是否被界定清楚？ [Clarity, Coverage, Spec §FR-005]

## 可测量性（Measurability / Ambiguity / Conflict）

- [x] CHK007 "现代化"（FR-001）是否给出任何可客观判定的标准，还是依赖主观判断？ [Measurability, Ambiguity, Spec §FR-001]
- [x] CHK008 "清晰可辨"（logo 叠于白色顶栏背景与浅色底栏/渐变头背景）是否量化为最小对比度比值或最小呈现尺寸？ [Measurability, Gap, Spec §FR-001 AS3]
- [x] CHK009 "优雅换行"是否给出可验证判据（英文全称必须词间断行、是否允许孤字/孤行、行数上限、是否允许连字符断词）？ [Measurability, Contract §3, Spec §FR-005③]
- [x] CHK010 "约 16px 下三色 V 形主体可辨"是否给出可判定的判据（最小元素分离度或缩略后可用性标准）？ [Measurability, Spec §US1 AS4]
- [x] CHK011 "布局无破损"的判定口径是否完整到可客观测量（是否已排除不可测的「主观美观」类争议，并覆盖整页横向滚动）？ [Measurability, Contract §7]
- [x] CHK012 SC-003「375px 下无需滚动即可完整看到四层信息」与 FR-009 要求覆盖至 320px 的更窄视口之间，是否存在冲突或未澄清的优先级？ [Conflict, Ambiguity, Spec §SC-003, Spec §FR-009]

## 响应式与场景边界覆盖（Coverage / Edge Case）

- [x] CHK013 验收断点集合（375/768/1024/≥1280px + 边界 575/767/1279px + 320px）是否覆盖了所有会实际改变布局行为的阈值（例如顶栏品牌区/导航开始换行的具体阈值是否已定义）？ [Coverage, Gap, Spec §FR-009, Contract §7]
- [x] CHK014 375px 下「品牌区内部（logo+文字）不折断」与「导航项换行」发生时两者的先后与相对位置是否已定义，还是仍存在多种同样合规的解读？ [Clarity, Coverage, Data-Model §3]
- [x] CHK015 是否定义了未来命名文案显著变长（例如研究室归属或英文全称加长）时的换行/降级行为要求？ [Coverage, Edge Case, Gap]
- [x] CHK016 是否定义了 logo 图片加载失败、透明背景叠加深色元素或图标区被压缩时的表现要求？ [Edge Case, Gap, Spec §FR-011]
- [x] CHK017 除 favicon 尺寸与顶栏展示尺寸两端外，是否需要对中间尺寸（如页脚、分享卡片、打印）的可辨性提出要求或明确排除？ [Coverage, Gap]
- [x] CHK018 是否明确界定比 320px 更窄视口（如 280px）为范围外，以避免验收边界歧义？ [Boundary, Assumption, Gap]

## 矢量资产与构建期校验（Completeness / Exception Flow）

- [x] CHK019 logo「纯矢量」的验收判据（禁止的 draw.io 属性、`<image>`/`<foreignObject>`/data-URI 内嵌、内嵌位图）是否完整且可机械检查？ [Completeness, Contract §2.1, Spec §FR-002]
- [x] CHK020 必须保留的原图白色辅助符号的数量、种类与相对位置（语言/翻译符号 ×2 + 笔形符号 ×1）是否已明确到可核对？ [Completeness, Data-Model §2]
- [x] CHK021 「色值可微调」的允许范围是否被界定（可微调的幅度与必须保留的色相/明度关系），以避免「保留设计要素」被实质性改变？ [Ambiguity, Data-Model §2, Spec §FR-001]
- [x] CHK022 favicon「同源简化」的边界是否明确（允许删除哪些要素、MUST NOT 演变为另一标识、是否允许字体依赖）？ [Clarity, Spec §FR-008, Spec §Assumptions]
- [x] CHK023 FR-011 构建期报错的要求是否可验证（必须定位到 `site.json` 的具体字段与目标路径、是否要求可执行的修复指引、是否明确中断构建）？ [Completeness, Contract §6, Spec §FR-011]
- [x] CHK024 静态资源引用路径的合法性规则是否完整（以 `/` 开头、无 `..`、大小写与扩展名处理、GitHub Pages 子路径前缀化时机）？ [Completeness, Contract §6, Data-Model §1]
- [x] CHK025 是否定义了 logo/favicon 被多处引用时的单一数据源一致性要求（避免路径在模板中硬编码回退）？ [Consistency, Gap, Spec §FR-008]

## 一致性、范围排他与依赖（Consistency / Dependency）

- [x] CHK026 "G3" 字样的允许出现位置（仅名栏 "G3课题组"，顶栏/底栏禁止）在 spec、契约与数据模型各处表述是否一致无冲突？ [Consistency, Spec §Edge Cases, Spec §SC-002, Spec §FR-003]
- [x] CHK027 命名以中文为主展示的口径与 001 特性「固定文案以英文为主」的既有惯例之间的差异，是否已被显式授权并记录为已知偏离？ [Conflict, Assumption, Spec §Assumptions]
- [x] CHK028 FR-010 的范围排他是否完整覆盖所有会受站点级元素影响的页面（含新闻详情页），且明确排除新增页面/路由？ [Coverage, Completeness, Spec §FR-010, Spec §SC-002]
- [x] CHK029 以原站 logo 作为唯一设计依据这一依赖是否被记录为假设，并说明其可用性与授权来源？ [Dependency, Assumption, Spec §FR-001]
- [x] CHK030 是否已在需求中建立可追溯的需求/验收标准 ID 体系（用于本清单条目与 spec/契约的相互追溯）？ [Traceability, Gap]

## 可访问性与非功能需求（Non-Functional / Gap）

- [x] CHK031 装饰性 logo 的 `alt` 策略与品牌区链接的可访问名是否在需求层面被明确规定（而非留给实现决定）？ [Non-Functional, Gap, Data-Model §3]
- [x] CHK032 品牌区链接的键盘焦点可见性（focus 态可辨、不依赖 hover）是否有要求？ [Non-Functional, Gap]
- [x] CHK033 是否存在公认需满足的无障碍最低要求（对比度、缩放 200% 下不破损、SVG 语义/`role`）被显式排除或纳入？ [Non-Functional, Coverage, Gap]

## Notes

- 仅当复查确认「需求质量准则」已满足时才标记 `[x]`；仍有歧义、冲突或待澄清的条目保持未勾选。
- `/speckit-implement` 将本清单的勾选状态作为门禁读取，且 MUST NOT 修改标记。
- `checklists/requirements.md` 为 `/speckit-specify` 与 `/speckit-clarify` 维护的内置规范质量清单，其生命周期与本清单相互独立。
- 本清单为 `[domain]` 单文件形态（品牌视觉 + 矢量资产合并），后续如需独立主题，可按 `ui.md` / `brand-assets.md` 分拆为新的清单文件并在各自文件内续编 CHK 编号。
- 条目编号 CHK001–CHK033 在本文件内全局递增；后续追加条目应自 CHK034 起续编。
- **2026-10-16 澄清轮次编号占用说明**：同日 `/speckit-clarify` 在 spec §Clarifications 新增 **CHK034–CHK040** 七条澄清（FR-011 覆盖命名字段 / 取消 `groupNameZh` 冗余字段 / 其余页标题保留品牌字 / 部署验证归 CI / FR-010「页面内容」不含站点级元信息 / favicon 简化为强制 / logo 与文字按 cap-height 等高）。其中 CHK034–CHK039 为 CHK023/CHK024、CHK002、CHK005、CHK028、CHK022 等条目的细化补充，CHK040 为 CHK004（比例/基线量化约束）的客观口径细化；本文件既有条目判定维持不变（33/33 通过），**本清单后续追加条目的下一个可用编号为 CHK041**。
- **2026-10-16 第二轮复查记录**：CHK019 / CHK020 / CHK022 / CHK024 / CHK025 / CHK026 / CHK028 / CHK030 由既有 [contracts/site-branding.md](../contracts/site-branding.md) §2.1/§2.2/§5/§6/§8 与 [data-model.md](../data-model.md) §1/§2 内容判定为已满足（无需新增需求）；CHK013–CHK018 / CHK023 / CHK027 / CHK031–CHK033 经澄清写入 spec（见 spec §Clarifications Session 2026-10-16 第 2 批与 Assumptions 范围外条目）。**CHK021（色值微调幅度）与 CHK029（原 logo 授权来源）已于同日问答定案并写入 spec**（色相不变 + 明度/饱和度偏移 ≤10%；原 logo 认定为课题组自有资产）。至此本清单 33/33 全部复查通过。
- **2026-10-16 analyze 修复轮记录**：`/speckit-analyze` 修复经 `/speckit-clarify` 落盘，新增澄清 **CHK041–CHK043**（FR-011 命名字段校验集补入 `fullName` / FR-001 保留要素清单补入蓝色箭头尖角点缀 / 命名一致性审计范围限于站点级元素、正文历史文案排除），并**修订 CHK040 口径**为「logo 图形与 "CIGMA" 文字各自渲染后占据的矩形竖向高度相同」（废弃 cap-height 字形高度口径，见 spec FR-003）。本清单既有条目判定不变（33/33 通过）；后续追加条目的下一个可用编号为 **CHK044**。
