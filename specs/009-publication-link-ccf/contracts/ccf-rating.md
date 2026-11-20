# Contract: CCF 等级判定表

**Feature**: 009-publication-link-ccf | **Date**: 2026-11-19 | **Spec**: [spec.md](../spec.md) | **Data model**: [data-model.md](../data-model.md)

本契约是 135 条论文 CCF 判定的唯一验收基准。判定输入为 `(venue, year, 论文类型)`；输出为 `A` / `B` / `C` / 无等级。

## 1. 判定顺序（优先级从高到低）

1. **类型资格**：非 Full/Regular paper 一律无等级。当前数据中的非资格集合：
   - `Findings of ACL`（7 条）
   - `Findings of EMNLP`（10 条）
   - `WWW` 2015 的那 1 条（实际发表于 Companion）
2. **年份版本**：按条目 `year` 选择目录版本，不按 `date` 月日、不按目录发布日期。
3. **venue 等级**：查下表；未列出的 venue 一律无等级，不得用相似会议或主会等级推断。

## 2. 目录版本

| `year` | 目录版本 |
|--------|----------|
| 2026 及以后 | CCF 2026（第七版，2026-03-31 发布） |
| 2022–2025 | CCF 2022 |
| 2019–2021 | CCF 2019 |
| 2015–2018 | CCF 2015 |
| 2014 及以前 | 当时版本；当前数据仅 CIKM / WSDM，按 B（见 §5） |
| 中文期刊（全部年份） | 《CCF 推荐中文科技期刊目录（2019）》 |

## 3. venue 归一化

| 原始值 | 归一化键 |
|--------|----------|
| `IEEE ICME` | `ICME` |
| `IEEE Transactions on Audio, Speech and Language Processing` | `TASLP` |
| `IEEE/ACM Transactions on Audio, Speech and Language Processing` | `TASLP` |
| `IEEE TRANSACTIONS ON INFORMATION FORENSICS AND SECURITY` | `TIFS` |
| 其他英文 venue | `trim` + 转大写 |
| 中文 venue | 去首尾空白，原样匹配 |

## 4. 判定表（当前数据全覆盖）

| 归一化 venue | 条件 | CCF | 当前条数 |
|--------------|------|-----|----------|
| `AAAI` | 全部年份 | A | 11 |
| `ACL` | 主会 Full/Regular | A | 15 |
| `CVPR` | 全部年份 | A | 4 |
| `NEURIPS` | 全部年份 | A | 5 |
| `SIGIR` | 全部年份 | A | 5 |
| `ICCV` | 全部年份 | A | 2 |
| `ICLR` | 全部年份 | A | 1 |
| `ACM MM` | 全部年份 | A | 11 |
| `TOIS` | 全部年份 | A | 1 |
| `TIFS` | 全部年份 | A | 1 |
| `WWW` | `year ≠ 2015`（主会） | A | 2 |
| `WWW` | `year = 2015`（Companion） | 无 | 1 |
| `IJCAI` | `year ≤ 2025` | A | 5 |
| `IJCAI` | `year ≥ 2026` | B | 4 |
| `EMNLP` | 主会 Full/Regular | B | 9 |
| `COLING` | 全部年份 | B | 5 |
| `NAACL` | 全部年份 | B | 1 |
| `ECAI` | 全部年份 | B | 1 |
| `ECCV` | 全部年份 | B | 1 |
| `ICME` | 含 `IEEE ICME` | B | 4 |
| `ICASSP` | 全部年份 | B | 6 |
| `ICMR` | 全部年份 | B | 3 |
| `CIKM` | 全部年份（含 2014 及以前） | B | 5 |
| `WSDM` | 全部年份（含 2014 及以前） | B | 1 |
| `DASFAA` | 全部年份 | B | 1 |
| `TASLP` | 全部年份 | B | 4 |
| `TCSVT` | 全部年份 | B | 1 |
| `TOMM` | 全部年份 | B | 1 |
| `CVMJ` | `2022–2025` | C | 2 |
| `CVMJ` | `2026 及以后` | B | 0 |
| `KNOWLEDGE-BASED SYSTEMS` | 全部年份 | C | 1 |
| `计算机学报` | 全部年份 | A | 1 |
| `计算机研究与发展` | 全部年份 | A | 2 |
| `信息安全学报` | 全部年份 | B | 1 |
| `Findings of ACL` | 任意年份 | 无 | 7 |
| `Findings of EMNLP` | 任意年份 | 无 | 10 |

## 5. 例外与证据说明

- **WWW 2015**：条目标题 `A Word Vector and Matrix Factorization Based Method for Opinion Lexicon Extraction` 发表于 WWW 2015 Companion；Companion 不属于 Full/Regular paper，不标 A。
- **Findings**：2026 版目录明确 Findings 不计入；Findings 不继承主会等级。现有 `Findings of ACL` 2021 的 `CCF-A` 属错误标注，必须移除。
- **2014 及以前**：当前只剩 CIKM（2011 / 2012×2 / 2014）与 WSDM（2012）。二者在可查的 2015 / 2019 / 2022 版目录中均为 B，且 spec 的预期分布锁定 B=48，故统一标 B；证据记录在 `evidence/ccf-audit.md` 的对应行。
- **中文期刊**：不随国际目录年份切换；徽标仍为 `CCF-A` / `CCF-B` / `CCF-C`，不加「中文」前缀。
- **未收录 venue**：无等级；不得按相似会议推断。

## 6. 预期分布（SC-004）

| 等级 | 条数 | 构成 |
|------|------|------|
| A | 66 | AAAI 11 + ACL 15 + CVPR 4 + NeurIPS 5 + SIGIR 5 + ICCV 2 + ICLR 1 + ACM MM 11 + TOIS 1 + TIFS 1 + WWW 2 + IJCAI≤2025 5 + 计算机学报 1 + 计算机研究与发展 2 |
| B | 48 | IJCAI2026 4 + EMNLP 9 + COLING 5 + NAACL 1 + ECAI 1 + ECCV 1 + ICME 4 + ICASSP 6 + ICMR 3 + CIKM 5 + WSDM 1 + DASFAA 1 + TASLP 4 + TCSVT 1 + TOMM 1 + 信息安全学报 1 |
| C | 3 | CVMJ 2 + KBS 1 |
| 无 | 18 | Findings of ACL 7 + Findings of EMNLP 10 + WWW 2015 1 |
| **合计** | **135** | |

与当前数据相比：新增 B 38、新增 C 3、撤销 A 1（共 42 条变更）；A 由 67 → 66。

## 7. 关键抽查

| 用例 | 期望 |
|------|------|
| IJCAI 2025 | CCF-A |
| IJCAI 2026 | CCF-B |
| Findings of ACL 2021 | 无等级（撤销现有 A） |
| 信息安全学报 | CCF-B |
| CVMJ 2024 / 2025 | CCF-C |
| Knowledge-Based Systems | CCF-C |
| WWW 2015 Companion | 无等级 |
