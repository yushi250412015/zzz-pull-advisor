# Changelog

本文档同步记录项目进度（格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)）。

## [Unreleased]

### 新增

- **公告数据源模块**（`src/datasource/announcement.js`）：官方公告 API 实测封装（getAnnList/getAnnContent；实测 title 带 `<p>` 包裹、type_label 在组级、getAnnContent 返回全量列表需按 ann_id 自行筛选）；`stripHtml` / 归一化 / 关键词过滤 / 角色名匹配 / 正文提及检索（`findCharacterMentions`）+ BWIKI wiki 直链（实测 200）；真实返回快照存 `docs/data/ann-*.json`（gitignore）；单测 14 项（mock fetch + 真实结构样本）
- **角色资料核实与体系修正（千夏/真斗/潘引壶 + 勘误，多源交叉验证）**：千夏 = 限定S · 物理 · 支援（2.6）；真斗 = 常驻A · **火 · 命破**（2.3，狛野真斗 / Komano Manato）；潘引壶 = 常驻A · 物理 · 防护（2.0）；`ROLES` 新增第 6 定位 `rupture`（官方简中「命破」，英文社区通用名 Rupture，待官方英文公告最终确认）；**勘误：爱芮 = 以太/异常（原误记「冰」；「冰属性爱芮」实为 2.8 普罗米娅的社区昵称）**，banners / 体系同步修正；来源与置信度记录于 `docs/data-sources.md`
- **meta 强度分校准（Prydwen tier list，2026-08）**：换算规则 T0=90 / T0.5=82 / T1=72 / T2=62 / T3=50（例外与冲突在角色 note 注明），20 位角色已校准；`systems.contributions` 同步校准：lumiflux-anomaly + 维琳娜、新增 `rupture`（命破）体系、新增 `ether-anomaly`（爱芮）、ice-anomaly 移出爱芮、anomaly + 苍角（雅狼苍/雅柚苍）；换算规则与全部来源见 `docs/data-sources.md`
- **MCTS 时序规划接 UI**：新增「现在抽 vs 攒希格莉德」卡片（`mctsPlan` 接当前资源/box，迭代数 200~5000 可调；展示各预算动作的平均成型收益、访问次数与最优结论；声明只优化成型收益、随机波动可重跑）
- **四池状态进 UI**：新增「我的真实账号 · 四池状态」面板（独家/常驻/音擎/邦布的累计抽数、距上次 S、S 级历史列表）；`my-account.js` 的 `sList` 升级为结构化历史（名称/日期/歪/数量）
- 测试 79 项（+14 公告数据源）
- **全量四池账号解析**（uid 25183553，2026-08-15）：常驻 109 / 独家 454 / **音擎 189 / 邦布 416**，共 1168 条；`my-account.js` 含四池保底与 S 级列表
- **数据源实测校准**（`gacha-log.js` 重写）：真实日志格式为抽卡 H5 页面 URL（webstatic.mihoyo.com/...gacha-v2/index.html）；authkey 须用**原始百分号编码形态**拼接（解码后 `+` 会被当作空格 → retcode=-1 illegal base64）；记录内 `gacha_type` 为 API 内部编码 1/2/3/5（请求参数 1001/2001/3001/5001）；新增 `extractGachaPageUrl`/`extractAuthkey`/`buildApiUrl`
- 测试 65 项（+4 数据源格式测试）
- **真实账号解析**（2026-08-15，uid 25183553）：`src/data/my-account.js`，UI 支持「载入我的真实账号」一键套用 box / 保底 / 大保底
- **ZZZ rank_type 语义修正**（经真实记录核实）：`4 = S 级 / 3 = A 级 / 2 = B 级`（与 Genshin/HSR 不同）；`parseGachaHistory` 支持 `sRankType` 配置，音擎不再入 box
- **属性体系修正**：7 属性 = 物理/火/冰/电/以太 + 风（3.0，维琳娜）+ 流明 Lumiflux（3.1，蕾米埃尔）；「流变」为蕾米埃尔机制名而非属性名
- 3.1 卡池补全：上半蕾米埃尔 + 爱芮复刻；下半希格莉德 + 自选混池（琉音/浮波柚叶/浅羽悠真，**首金必不歪** → rateUpChance=1）
- 角色库扩充至 39 位：用户 box（7 S + 13 A）+ 卡池角色 + 常驻 S 歪池集合（`standardS`）；未核实字段标 `null` 不臆造
- 新体系先验：风异常（染色）、流明异常（流变）、冰异常（异放）、物理强攻
- 单元测试 61 项（+4：rank_type 语义 / 音擎排除 / sRankType 兼容）

### 待办

- 剩余角色 `meta` 待校准（维琳娜、比利、可琳、安东、本 等；艾莲/朱鸢/星见雅仍为旧占位先验 85/80/92）
- 音擎 / 邦布池的「抽卡推荐」（当前仅展示四池状态）；「从抽卡记录实时导入」全流程 UI
- 六维评价向量、Kalman 观测接入的真实数据流（低优先级）

## [0.1.0] - 2026-08-15

### 新增

- P1 概率层：可配置抽卡机制（软/硬保底、50/50、定轨开关）、精确 DP、蒙特卡洛
- P2 效用层：成型度 F(S)（可学习贡献向量，不硬编码灵魂角色）、协同增益 Δ_sys、边际效用 ΔU、六维评价向量、操作系数、TrueSkill/Weng-Lin 技能评分
- P3 决策层：帕累托前沿、总效用（风险/机会成本）
- P4 贝叶斯时序：Kalman 滤波 + 多源观测融合 + 置信区间
- P5 接线：抽卡记录解析（box/保底/大保底）、推荐编排、UI、数据源适配器（本地日志 URL 提取 + 拉取）
- 57 项单元测试

### 技术选型

- 概率：Markov DP（精确）
- 效用/学习：TrueSkill 贝叶斯技能评分（可学习权重 + 不确定性 + 少样本友好）
- 时序：Kalman 滤波（隐效用漂移 + 噪声观测）
- 决策：帕累托 + 多目标
