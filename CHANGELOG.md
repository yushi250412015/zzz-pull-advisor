# Changelog

本文档同步记录项目进度（格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)）。

## [Unreleased]

### 新增

- **【批量消化观测源】14 条视频结论落库**：`scripts/bili-batch.mjs`（批量简介+热评）；毕加丶/卡特亚 14 条视频结论提取——维琳娜+蕾米埃尔为**官方推荐配队**（佐证体系校准）、琉音「赠送大招/排轴要求高」、南宫羽「三小只强度不低/爱芮双连携」、爱芮「法厄同平替专盘/0+0 够用」、普罗米娅「卡特亚自承配队测试不足」；新增 `bili-comments` 观测源（trust 0.45）+ 星见雅衰落冲突观测 70（两条独立评论交叉，后验 92→88.37）；mechanics 新增琉音/星见雅条目并增补 4 角色 facts；希格莉德 BWIKI 倍率表仍空 → 维持 null 不臆造
- **【登录会话解锁】B站全接口打通（用户授权 cookie）**：`scripts/bili-session.mjs` 支持 search（wbi 搜索）/space（作者列表）/comments（评论，ps≤20）/summary/subtitle；cookie 存 `%TEMP%\zzz-bili-cookie.txt`（不进仓库）；实测解锁搜索与空间列表（毕加丶绝区零系列全部可见）；AI 总结需 UP 权限、AI 字幕服务当前错配内容不可信（如实记录 data-sources.md §12.4）
- **【实测事实落库】希格莉德（评论区口径，逐条单源标注）**：专武与下位差距 20%+、弹刀触发最高倍率第三段枪势、测试服削过大招倍率、0命「低命战神」→ `mechanics.js` facts + `equipment.js` note；毕加丶视频库清单入档待逐条取结论
- **【自动查找打通】B站视频自动发现**：B站搜索/列表接口需登录，但 `archive/related` 免登录 → `scripts/find-bili-videos.mjs` 相关推荐图爬取（作者/关键词过滤 + `bili-title-match` 角色匹配 + 候选观测输出，null-meta 跳过）+ 纯函数匹配单测 3 项；首次爬取自动发现卡特亚 ZZZ 测评全系列（千夏/南宫羽/普罗米娅/维琳娜/星见雅/琉音/柚叶/艾莲/朱鸢/安比/波可娜/蕾米埃尔7影画等十余条），并按纪律落库 3 条标题级观测（千夏 92 / 星见雅 92 / 朱鸢 83）+ 此前蕾米埃尔 92；未录入角色测评（卢西娅/般岳/伊芙琳/奥菲丝）记录备查；data-sources.md §12.3
- 测试 127 项（+3 bili-title-match）
- **【多博主观测扩展】爱芮双源视频观测**：新注册观测源**梦轩dada**（mid 27500557，trust 0.7）；卡特亚《爱芮综合测评：屁股有劲！》（BV1opAmzXEoD，82.2 万播放）+ 梦轩dada《爱芮终极指南：以太异常主C的荣耀》（BV1URPNzREDf，42 万播放，标题确认「以太异常主C」与项目勘误一致）→ aria 两条观测；**标题级映射规则正式化**：min(共识+3, 92)，note 必注「我方映射非视频原值」；aria 后验 90 → μ=91.22（双源确认、CI 收窄）；单测 +1；data-sources.md §12.2
- 测试 124 项（+1）
- **【卡特亚观测落库】首个真实视频观测（BV1ZPgA6YEwa）**：卡特亚《希格莉德综合测评：超级力量！》（2026-08-14，32.8 万播放）标题级强正面结论 → `observations.js` 观测 `{sigrid, 85, weight 0.9, source 'katya'}`（85 为现有共识 82 的保守映射，已在 note 注明非视频原值）；sigrid Kalman 后验 82 → μ=83.66（CI 收窄）；新增 `scripts/fetch-bv.mjs`（B站视频信息一键抓取：view/player/tags 三接口无需登录，实测可用）与观测结构单测 2 项；通道细节入档 data-sources.md §12.1
- 测试 123 项（+2 observations）
- **【B·建模】Kalman 多源观测闭环（卡特亚=一等观测源）**：`src/data/observations.js`（逐条观测 {value/weight/source/date/note}，源可信度 Prydwen 0.8 / 权威博主 0.6 / **卡特亚 0.9**）+ `estimateMeta / buildMetaPosteriors` 纯函数（先验=现有 meta、R=36/weight² 融合、Q=4 版本漂移）+ UI「强度可信度」面板（先验 → 后验 μ ± 95% CI，冲突观测自动折中）+ 单测 4 项；卡特亚频道（mid 470042408）与 B站 view API 通道已建档，其视频文本当前网络受限（风控），数据待补入即插即用（data-sources.md §12）
- **【B·建模】CVaR 下行风险**：`pullCostDistribution / downsideRiskPulls` 纯函数（由精确 DP 分布求 VaR/CVaR 抽数，离散尾部期望，与 expectedPullsToRateUp 交叉印证）+ 单测 5 项（归一化/交叉印证/大保底降险/垫抽降险）；推荐卡新增「最差 10% 期望抽数（CVaR90）」
- **【③SOP 演练】**：`update-banners.mjs` + `archive-announcements.mjs` 复跑通过（3.1 全条目「已录入」）；触发条件=新版本公告出现在窗口内
- 测试 121 项（+9：meta-posterior 4 + downside 5）
- **【B·建模修正】meta 先验接入引擎（修复重大建模洞）**：此前 θ 体系增益只覆盖有体系数据的角色，琉音/希格莉德/千夏等 T0 角色边际效用恒 0；新增 `metaUtility / metaUtilityOfBox / boxCombatValue`（meta/100 × metaScale，可学习参数默认 5，与体系 delta_max 同量级；meta=null 贡献 0 不臆造）；`recommendCharacter` 增加可选 `characters` 参数（缺省保持纯 θ 行为，新旧行为各有测试）；`mctsPlan` 增加 `valueFn` 依赖注入（默认 boxUtility，种子断言不变）；UI 两处统一改用 θ+meta 口径；单测 +7（meta-utility 6 + recommend 1）
- **【A·数据完备化】希格莉德博主实测核实**：骁骑礼赞配对 `inferred → verified`（游侠网 + niubi.wiki 两篇独立攻略同款专属音擎：713 攻/48% 爆伤、冰伤被动「骨寒」；博主译名「骑士颂赞」）；机制入档（【骑士专注】/三段蓄力/【敛枪式】）；meta 维持 82；具体倍率两文未给出 → 不臆造，全量表以 BWIKI 页为准
- **【A·数据完备化】角色机制速查库**：`src/data/mechanics.js`（12 位角色：机制摘要/关键技能/推荐配队/来源逐条标注，无源不收录、无出处倍率标 null）+ 结构单测 + UI「角色机制速查」面板（wiki 倍率表链接）；`docs/data-sources.md` §11 入档
- 测试 112 项（+9：meta-utility 6 + recommend 1 + mechanics 2）
- **【B·决策深化】帕累托策略集进 UI**：`buildPullStrategies` 纯函数（离散预算 25/50/75/100% 下的策略，目标向量 [效用, −风险, −成本]，`paretoFrontier` 筛选）+ 单测 4 项（含前沿互不支配与风险单调性断言）；角色推荐卡片展示「帕累托最优预算」
- **【A·数据完备化】官方情报面板**：`src/data/official-facts.js` 静态快照（3.1 官方公告官方陈述，标注快照日期与来源 ann_id，推断项如骁骑礼赞归属显式标注）+ UI 面板（版本/时间窗/代理人/音擎/邦布 + BWIKI wiki 链接）；静态快照规避浏览器 CORS
- **【A·数据完备化】数据更新 SOP**：`docs/data-sources.md` §10 补充「新版本数据更新 SOP」（update-banners → 人工审阅 → 数据文件 → 测试/构建 → commit/push）；README 状态刷新（103 项测试与新功能清单）
- 测试 103 项（+4 pull-strategies）
- **【A·数据完备化】音擎 / 邦布推荐**：`src/data/equipment.js`（官方公告 + BWIKI 核实的 3.1 装备数据；骁骑礼赞配对为推断并标注，待 08-19 实装核实）；`src/core/recommend-equipment.js` 纯函数推荐引擎（专武价值 = 角色贡献 × 可学习比例 0.6；邦布 = 基础+元素+阵营同伴先验；音擎池 75/25 无定轨概率；邦布池官方概率暂缺 → risk=null 诚实标注）；UI 新增「音擎 / 邦布推荐」面板（已拥有状态来自真实账号）；单测 8 项
- **【A·数据完备化】版本数据更新工具链**：`extractReleaseFacts` 纯函数（从官方版本公告提取代理人/音擎/邦布官方陈述与时间窗，官方格式正则 + 贪婪踩坑修复）+ 单测 4 项（真实 3.1 文本夹具）；`scripts/update-banners.mjs`（对比「已录入/新增」+ 事实 JSON，不自动改源码）、`scripts/archive-announcements.mjs`（公告全量归档）；实测：3.1 全部条目「已录入」，时间窗 07/29→09/09 正确
- **【B·MCTS 泛化】时序场景自动生成**：`buildPlanningScenarios`（由 banners.js 自动生成「上半各目标 vs 下半非自选新角色」场景，3.1 → 2 场景）+ 单测；UI 改为多场景卡片（各自运行、共享迭代数），移除硬编码的「蕾米埃尔 vs 希格莉德」场景
- 测试 99 项（+12：equipment 8 + version-facts 4）
- **【低】权重面板**：α_c / α_f / λ_risk / α_cost 与「抽/观望」阈值全部可调，改动（失焦）即时反映推荐结果；自动模式按「3.1 零氪 140 抽 + 账号欧非 80.4 抽/S（偏非）」推导 λ_risk≈38.9、α_cost≈0.143（`deriveWeights` 首次接 UI），任何手动改动即切手动模式；含恢复默认按钮
- **数据可信度审计（防信息污染）**：以官方公告 API（ann_id 1262 实测）为主口径 + BWIKI 信息框逐项核对，39 位角色 element/role/rarity/版本与既有数据**无冲突**；来源分级（官方公告/BWIKI 实测/多社区常识）与受限官方源（HoYoWiki、官网内容 API、官方概率 JSON 的地区限制）如实记录于 `docs/data-sources.md` §7；官方 3.1 情报（两代理人/两音擎/邦布艾瑞儿、版本时间与补偿）归档 §8，快照 `docs/data/ann-content-1262-2026-08.json`
- **「从记录实时导入」全流程**：纯函数汇总模块 `src/datasource/import-summary.js`（逐池 pulls/pity/fails/S 历史/box/欧非，ZZZ 语义）+ 单测 7 项；本地脚本 `scripts/import-records.mjs`（`--url` / `--log` / 自动扫描日志目录 / `--records` 离线重解析 → 四池拉取 → 快照 JSON + 与手填 my-account 一致性对比）；**实测验收：1168 条真实记录重解析 13/13 与手填值一致**
- **实测校准：同秒批量排序**（`parse.js` + `import-summary.js`）：一次十连的记录 time 完全相同，排序必须按 **(time, id)** 打破平局；据此修正 my-account：独家池保底 0→**3**（蕾米埃尔是 07-29 十连第 7 抽）、邦布池 ≈0→**4**（艾瑞儿是 08-10 十连第 6 抽）；HANDOVER / ARCHIVE 勘误入档
- **UI 新增「从记录实时导入」面板**：上传 Player.log / NAP_*.log 提取抽卡 H5 页面 URL（含 authkey）+ 一键复制 + 本地脚本命令（诚实声明浏览器 CORS 限制，抓取必须走本地 Node）
- **`characters.js` 补 enName**：39 位角色英文名（官方 / Prydwen / 社区多源口径，如 Remielle Dan、Sigrid de L'Azur、Dialyn、Sunna、Komano Manato；来源见 `docs/data-sources.md`）
- 测试 87 项（+8：import-summary 7 + 同秒排序 1）
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
- 音擎 / 邦布池的「抽卡推荐」（当前仅展示四池状态）
- 「实时导入」已具备本地脚本全流程（含实测一致性验收）；浏览器端因 CORS 无法直连米哈游接口，网页内全自动需自建代理（暂不实施）
- 六维评价向量、Kalman 观测接入的真实数据流（低优先级；需先有可信的逐角色六维数据源，避免臆造）

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
