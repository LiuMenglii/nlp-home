# 内容核对清单（上线前交课题组负责人确认）

> 依据 FR-010 上线门禁与 Constitution I（内容准确性）：以下条目含不确定信息或无法与正式发表版本交叉核实，须课题组确认后方可上线。核对完成后本文件不展示在站点页面上。

## 1. 论文书目（src/data/publications.json，共 135 条）

- 125 条已通过 arXiv / DOI（Crossref）交叉解析并补齐外链，抽检 24/24 可达（其中 3 条 ACM DOI 对脚本返回 403 反爬，经 Crossref 注册库验证有效，浏览器可正常打开）。
- 以下 **10 条未能解析到可靠外链**（页面按 FR-011 以纯文本展示，书目事实以 UCAS 主页为准）：

| # | 年份 | 标题 | Venue |
|---|------|------|-------|
| 1 | 2026 | IRIS: Iterative Refinement of Internal States for Safer Language Models | Findings of EMNLP |
| 2 | 2025 | AutoPrompt: Automated Red-Teaming of Text-to-Image Models via LLM-Diven Adversarial Prompts | ICCV |
| 3 | 2024 | Pruning Large Language Models to Intra-module Low-rank Structure with Transitional Activations | Findings of ACL |
| 4 | 2022 | CLIO: Role-interactive Multi-event Head Attention Network for Document-level Event Extraction | COLING |
| 5 | 2022 | Slot Dependency Modeling for Zero-Shot Cross-Domain Dialogue State Tracking | COLING |
| 6 | 2022 | TAKE: Topic-shift Aware Knowledge sElection for Dialogue Generation | COLING |
| 7 | 2022 | Target Really Matters: Target-aware Contrastive Learning and Consistency Regularization for Few-shot Stance Detection | COLING |
| 8 | 2021 | Enhanching Zero-shot and Few-shot Stance Detection with Commonsense Knowledge Graph | Findings of ACL |
| 9 | 2021 | Addressing Extraction and Generation Separately: Key phrase Prediction with Pre-trained Language Models | IEEE TASLP |
| 10 | 2021 | Learning Class-Transductive Intent Representations for Zero-shot IntentDetection | IJCAI |

- **年份冲突 1 条**："Explainable Hyperbolic Temporal Point Process for User-Item Interaction Sequence Generation" 在林政 UCAS 主页标注 2023、吴大衍主页标注 2022，当前采用 **2023**（林政页口径），请确认。
- 2026 条目（20 篇）来自 UCAS 主页预印/录用标注，正式发表信息若有更新请同步。

## 2. 毕业生去向（src/data/graduates.json）

**去向依据 PPT 第 7 页匿名化就业表交叉推断**（姓名+入学年级+学位匹配），请确认：

| 姓名 | 届别/学位 | 当前采用去向 | 推断依据 |
|------|-----------|--------------|----------|
| 佀庆一 | 2024 届博士 | 京东（大模型） | 2019 级佀同学·博士·华为天才少年→京东大模型 |
| 杨泽娴 | 2025 届博士 | 福州大学 | 2020 级杨同学·博士·福州大学 |
| 谭宇彤 | 硕士 | 米哈游 | 2020 级谭同学·硕士·米哈游 |
| 温哲 | 硕士 | 工商银行 | 2020 级温同学·硕士·工商银行 |

**因去向/学位信息不全暂未收录**（PPT 第 8 页获奖实名，确认后补充）：

- 李世鲲（2024 届博士，院长特别奖）— 去向待补充
- 陈晓华（2024 届博士，华为天才少年）— 去向待补充
- 冯宇辰（2026 届硕士）— 去向待补充

**原站 Graduates 页以下条目因学位/去向不全暂未收录**：刘睿、梁宇航、Duo Feng、JinSheng Shen、Shifeng Yue、Yanfu Xu、Xing Wu、Yue Geng、Fengcheng Yuan、Ran Li（其中 Peng Fu 即付鹏老师，已列入教师栏）。

## 3. 在读学生名单（src/data/students.json）

- 名单取自原站 Team 页（最后更新约 2024 年 5 月），**佀庆一**已按 PPT 口径移入毕业生。
- 博士生 8 人在读状态请确认：张瀚文（2020 级）、李江楠（年级未知）、刘正宵（年级未知）等。
- 原站硕士生（王彤 2021 级、申博文/王岚睿/陈思元 2022 级）均已按学制毕业；PPT 载明当前在读硕士 15 人，**名单待课题组提供后补充**。

## 4. 教师信息（src/data/teachers.json）— 已逐字段核对通过

5 位老师已与官方来源逐字段核对（T032）：

| 老师 | 核对来源 | 结论 |
|------|----------|------|
| 林政 | UCAS 主页（~linzheng：研究员/博导/linzheng@iie.ac.cn，NLP·多模态分析） | 一致 |
| 王伟平 | UCAS 主页（~0012246：研究员/博导）+《计算机研究与发展》作者简介（大数据、人工智能、数据安全） | 一致 |
| 付鹏 | 个人主页 fupeng.ac.cn（Associate Professor）+ UCAS 课程页（副研究员/NLP） | 一致 |
| 吴大衍 | UCAS 主页（~dayan：副研究员/硕导/wudayan@iie.ac.cn） | 一致 |
| 谷井子 | UCAS 主页（~gujingzi：2020-10 起高级工程师） | 一致 |

- 王伟平、付鹏、谷井子的个人主页链接为核对时补充，均验证可达（200）。
- 待课题组：王伟平邮箱 wangweiping@iie.ac.cn（PPT 口径）请确认可收信；英文职称译法请审阅。

## 5. 其他

- 招生文案（site.json `admissions.targets`）："面向保研/统考的硕士、博士研究生，同时欢迎优秀本科生来组实习" — 依据原站 "graduate studies or an internship" 与邮件主题格式，请确认表述。
- Gallery 12 张照片取自原站（压缩至 ≤500KB、长边 ≤2000px），舍弃了 3 张聚餐/生日题材照片；新闻日期中月份精度不足者按当月 1 日填写。
