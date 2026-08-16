# zzz-pull-advisor 接手开发文档（HANDOVER）

> **目的**：供新对话框无缝接手本项目的开发。本文档「事无巨细」地记录了从立项到 2026-08-15 深夜的完整开发过程、全部技术细节、踩坑事实与待办。
> **新对话框接手流程**：① 读本文件 → ② 读 `docs/CONVERSATION-ARCHIVE.md`（压缩版上下文）→ ③ 读 `../工程开发守则-PROMPT.md`（工作区根目录通用守则，注意路径为 `C:\Users\27603\Desktop\deepseek hareness\工程开发守则-PROMPT.md`）→ ④ 在项目目录跑 `npm test`、`npm run build` 确认基线 → ⑤ 从 §12 待办开始工作。
> **通用守则优先**：项目级约定不得违反工作区通用工程守则（谨慎、审慎、研究先行、真实数据驱动、可学习优先、测试与日志纪律等）。

---

## 1. 项目定位

- **名称**：ZZZ 抽卡参谋 / Pull Advisor（绝区零抽卡推荐决策系统）
- **一句话**：输入玩家 box + 资源 + 未来卡池，输出「抽 / 观望 / 跳过」+ 风险 + 理由。
- **性质**：非官方同人工具，只用角色名称与数值，不含游戏素材。
- **技术栈**：Vite + 原生 JS（ESM）+ Vitest；无运行时框架。
- **仓库**：<https://github.com/yushi250412015/zzz-pull-advisor>（main 分支，Pages 部署已启用）。
- **版本**：0.1.0（开发中）。

## 2. 需求规格（用户原始要求全记录，按提出顺序）

1. 五模块规格：
   - **P1 概率层**：可配置抽卡机制 → 精确概率与期望。
   - **P2 效用层**：box 成型度 + 协同增益 + 边际效用（含六维评价向量、操作系数 k_op）。
   - **P3 决策层**：总效用、帕累托前沿、资源与风险权衡。
   - **P4 贝叶斯时序层**：跨版本隐效用漂移估计（Kalman 等）。
   - **P5 不确定性/风险**：抽卡记录解析（box/保底/大保底）、欧非统计、数据源适配。
2. **拒绝硬编码「灵魂角色」**：灵魂角色数量不定，需要可学习的抽象算法（CNN 式学习权重思想 → 落地为可学习贡献向量 θ）。
3. **多利用已知先进的数学模型或算法**；**动手前检索网上所有可能的已有 skill 或项目**。
4. **权重约定**：强度:喜好 = **8:2**（α_combat=0.8，α_favor=0.2），**不考虑 XP**；λ_risk / α_cost 由「版本可获取资源 + 账号欧非程度」用算法推导；判定阈值 ∈ [0,1]。
5. **k_op（手法上下限）与队伍角色效果「无法量化」** → 用默认值/可学习参数，不硬拍数字。
6. **「mcts 加」**：MCTS 时序规划器，求解「现在抽 vs 攒给下版本」。
7. 发布到用户自己的 GitHub + Pages；**同步项目进度和项目日志**。
8. 录入 3.1「漫长的告别」真实卡池（蕾米埃尔/希格莉德/琉音/浮波柚叶/浅羽悠真 + 复刻爱芮 + 下半自选混池）。
9. **「不要乱套已有对角色的认知体系」**：角色体系必须核实，未知标待核实，不套用别游戏/旧版本认知。
10. 用户装好 ZZZ 后：从本地日志提取 authkey 抓取真实抽卡记录，解析真实 box/保底/欧非；回答「角色机制类游戏文本能否读取」。
11. 会话压缩存档：把对话压成可调用存档（`docs/CONVERSATION-ARCHIVE.md` + 桌面 zip）。
12. 提取通用工程守则（含「谨慎、审慎」基础原则）→ 工作区根目录 `工程开发守则-PROMPT.md`；本接手文档供新对话框接手。

## 3. 实现总览（已实现 ✅ / 未实现 ⬜）

| 层 | 状态 | 说明 |
|---|---|---|
| P1 概率 | ✅ | 可配置机制、精确 DP、蒙特卡洛、期望抽数 |
| P2 效用 | ✅ | 成型度 F(S)、协同增益、边际效用、六维向量、k_op、TrueSkill 1v1 |
| P3 决策 | ✅ | 帕累托、总效用、权重推导、sigmoid 推荐分、0.6/0.4 结论 |
| P4 时序 | ✅ | Kalman 单步/序列/置信区间、多源观测融合 |
| P5 接线 | ✅ | 记录解析、欧非统计、推荐编排、数据源适配器（URL 提取 + 拉取）、MCTS |
| UI | ✅ | 资源输入 + box 勾选 + 喜好分 + 「载入我的真实账号」+ 结果卡片（含自选混池「首金必不歪」标签） |
| 真实账号数据 | ✅ | 4 池 1168 条已解析入库（`my-account.js` + 本地 `docs/data/` 原始 JSON） |
| 音擎/邦布池进 UI | ⬜ | 数据已有，UI 未接 |
| 「从记录实时导入」全流程 | ⬜ | 只有函数级适配器，无 UI 集成（本地日志 → authkey → 四池拉取 → 解析） |
| MCTS 接入 UI | ⬜ | `mctsPlan` 已实现并有测试，未接 UI |
| 公告/角色机制文本数据源 | ⬜ | 已实测官方公告 API 可用，未写成模块 |
| 角色 meta 与体系先验校准 | ⬜ | 大量 `meta: null`、`contributions` 为占位先验 |
| 六维向量真实数据 | ⬜ | `DIMENSIONS` 已定义，无角色数据填充 |

## 4. 模块级技术文档（按文件，全部为当前代码的准确描述）

### 4.1 `src/domain.js` — 领域常量
- `RARITIES = ['S','A']`。
- `ELEMENTS = ['fire','ice','electric','physical','ether','wind','lumiflux']`（7 种：前 5 为 1.0 首发；`wind` 风为 3.0 新增；`lumiflux` 流明为 3.1 新增）。
- `ROLES = ['attack','anomaly','stun','support','defense']`。
- `VERDICTS = ['pull','consider','skip']`。

### 4.2 `src/core/gacha/config.js` — 抽卡配置
- `DEFAULT_CONFIG.character`：baseRate 0.006 / softPityStart 74 / softPityIncrement 0.06 / hardPity 90 / rateUpChance 0.5 / guaranteeAfterFails 1。
- `DEFAULT_CONFIG.weapon`：baseRate 0.01 / softPityStart 66（待核实）/ softPityIncrement 0.06 / hardPity 80 / rateUpChance 0.75 / **guaranteeAfterFails Infinity（用户确认 ZZZ 音擎池无定轨）**。

### 4.3 `src/core/gacha/pity.js` — 精确概率（Markov DP）
- `rateAtPull(n, cfg)`：第 n 抽单抽出 S 概率（n≥hardPity 恒 1；软保底区间线性递增）。
- `probabilityOfRateUp(n, cfg, state={pity,fails})`：DP 状态 `(pity, fails)`，fails ≥ guaranteeAfterFails 时出 S 必 UP（吸收态）；cap 处理 Infinity 定轨。
- `expectedPullsToRateUp(cfg, state)`：Σ(1−P(n)) 累加至可忽略。

### 4.4 `src/core/gacha/simulate.js` — 蒙特卡洛
- `simulatePulls(state, n, cfg, rng)`：提前返回版（拿到 UP 即返回 `{gotRateUp, pulls, sCount}`）。
- `simulatePullsFull(state, n, cfg, rng)`：完整版，返回最终 `{gotRateUp, pulls, sCount, pity, fails}`（供跨池连续模拟）。
- `monteCarloEstimate(state, n, cfg, trials, rng)`：与 DP 互相印证。

### 4.5 `src/core/gacha/parse.js` — 记录解析（⚠️ ZZZ 特有语义）
- **rank_type 语义：`'4'=S 级 / '3'=A 级 / '2'=B 级`**（与 Genshin/HSR 的 5/4/3 不同，已用真实记录核实）。
- `parseGachaHistory(records, standardSet, options={sRankType:'4'})` → `{box:Set, pity, fails}`：
  - 时间排序（`time` 字符串 localeCompare）；
  - `item_type==='音擎'` 的**不入 box**，但仍计 pity（音擎/角色池都有 B 级音擎填充物；A 级音擎也会出现在角色池）；
  - `fails`：命中 standardSet 的 S → +1，否则归零；**只对同一限定池的记录有意义（保底/50/50 按池独立），调用前按池过滤**；
  - `options.sRankType` 可配置以兼容通用数据（默认 '4'）。
- `computeLuckStats(records, standardSet, options)` → `{avgPity, winRate, sCount}`（同池过滤约定同上）。

### 4.6 `src/core/utility/formation.js` — 成型度与协同
- `formation(box, system)`：F = Σ(拥有角色权重)/Σ(全部权重)，θ = `system.contributions`（可学习先验，不硬编码灵魂角色）。
- `synergyGain(F, system)`：分段线性；F<F_min → 0；F≥1 → delta_max；中间 k·(F−F_min)。

### 4.7 `src/core/utility/utility.js`
- `boxUtility(box, systems)` = Σ synergyGain（MVP 体系级简化，队伍级枚举未接）。
- `marginalUtility(box, characterId, systems)` = 加入该角色前后 boxUtility 之差。

### 4.8 `src/core/utility/vector.js` — 六维向量与手法
- `DIMENSIONS = ['peak','floor','rotation','opCost','versatility','reuse']`（峰值/下限/循环容错/操作成本/泛用性/复用）；`aggregateVector` 纯加权和（opCost 建议负权重）；`skillCoefficient(level)`：low 0.5 / mid 0.75 / high 1.0（默认 mid）；`effectiveUtility = aggregate × k_op`。

### 4.9 `src/core/rating/rating.js` — TrueSkill 1v1
- `normPdf` / `erf`（Abramowitz-Stegun 7.1.26，误差 ~1.5e-7）/ `normCdf`。
- `trueSkill1v1(winner, loser, beta=25/6)` → 更新双方 `{mu, sigma}`（Weng-Lin 更新式）。

### 4.10 `src/core/decision/decision.js` — 决策
- 常数：EXPECTED_PITY=62、RISK_BASE=30、COST_BASE=20、VERSION_RESOURCES=140（3.1 零氪样本值）。
- `DEFAULT_DECISION_WEIGHTS = {alphaCombat:0.8, alphaFavor:0.2, lambdaRisk:30, alphaCost:20/140}`。
- `deriveWeights({versionResources, avgPity})`：λ_risk = 30×(avgPity/62)（越非越怕风险）；α_cost = 20/versionResources（资源越少每抽越贵）。
- `opportunityCost(pullsSpent, valuePerPull=1)`。
- `totalUtility({combatDelta, favor, risk, opportunityCost, weights})` = α_c·ΔU + α_f·favor − λ·R − α_cost·C。
- `scoreFromUtility(utility, scale=10)`：sigmoid 1/(1+e^(−u/scale)) → [0,1]。
- `verdictFromScore(score, {pull:0.6, consider:0.4})`。

### 4.11 `src/core/decision/pareto.js`
- `dominates(a, b)` / `paretoFrontier(strategies)`（objectives 越大越好；返回非支配集）。

### 4.12 `src/core/decision/mcts.js` — 时序规划器
- **设计**：树节点只存**确定性预算序列**；抽卡随机性在 rollout 中每次重新模拟（⚠️ 首版在展开时采样一次导致估计有偏，已重写，勿回退）。
- `budgetOptions(pulls)`：0/25%/50%/75%/100% 离散候选。
- `ucb1(avgValue, visits, parentVisits, explorationWeight=1.4)`。
- `mctsPlan(initialState, {iterations=1000, explorationWeight=1.4, rng})` → 根节点每个首池预算动作的 `{action, visits, avgValue}`；`initialState` 需含 `{pulls, banners[{characterId}], bannerCfg, pity, fails, box, systems}`。
- 测试用 mulberry32 固定种子（single-banner seed 1 → 最优 action 90；skip-rinna seed 2 → 最优 action 0）。

### 4.13 `src/core/bayes/kalman.js`
- `weightedObservation(pairs[{value,weight}])` 归一化融合。
- `kalmanStep(prior{mu,variance}, observation, Q, R)`：预测方差 = var+Q；K = predVar/(predVar+R)。
- `kalmanFilterSeries` / `confidenceInterval(posterior, z=1.96)`。

### 4.14 `src/core/recommend.js` — 编排
- `recommendCharacter({box, resources{encryptedTapes,polychrome,pity,fails}, characterId, systems, bannerCfg, favor, weights})` → `{pulls, risk, combatDelta, cost, utility}`：pulls = 母带 + ⌊菲林/160⌋；risk = 1 − probabilityOfRateUp(pulls, bannerCfg, {pity, fails})。

### 4.15 `src/datasource/gacha-log.js` — 数据源（全部为实测事实）
- `POOL_TYPES`：请求参数 1001 常驻 / 2001 独家 / 3001 音擎 / 5001 邦布 ↔ **记录返回 gacha_type 是内部编码 1/2/3/5**。
- `GACHA_API = 'https://public-operation-nap.mihoyo.com/common/gacha_record/api/getGachaLog'`。
- 日志真实行格式（`Player.log` 或 `Persistent\LogDir\NAP_*.log`）：
  `... web: 4 url: https://webstatic.mihoyo.com/nap/event/e20230424gacha-v2/index.html?authkey_ver=1&sign_type=2&auth_appid=webview_gacha&win_mode=fullscreen&gacha_id=...&gacha_type=2001&authkey=<百分号编码长串>&...`
- `extractGachaPageUrl(logContent)` / `extractGachaType(pageUrl)` / `extractAuthkey(pageUrl)`（**保留原始百分号编码形态，勿解码后拼接**：解码后的 `+` 会被服务器当空格 → `retcode=-1 illegal base64 data`）。
- `buildApiUrl(pageUrl, {gachaType, page, size, endId})`：authkey 原样字符串拼接（勿经 searchParams 二次编码，否则 `%` → `%25` 也炸）。
- `fetchGachaRecords(pageUrl, {gachaType, size})`：分页拉全量（`end_id` 翻页；实测每页 size=20 可用）。

### 4.16 数据文件
- `src/data/characters.js`：39 位角色。字段 `{id, name, rarity, element, role, meta, standard?, coreTeammates?, note?}`；`meta` 为 0-100 占位强度分（`null`=未知）；`standard: true` 表示常驻 S（50/50 歪池）；导出 `standardS` = Set(常驻 S 角色名)。已知情报：千夏（妄想天使·泛用辅助，元素待核实）、南宫羽（以太/击破，2.7）、普罗米娅（冰/异常·异放体系，2.8）、维琳娜（风/异常·染色，3.0）、爱芮（冰/异常·异放主C，2.6）、蕾米埃尔（流明/异常，初代虚狩，**流变机制**=随下位队友切伤害属性，3.1）、波可娜=Pulchra（物理/击破 A）、真斗=狛野真斗 A（2.3，属性定位待核实）、潘引壶 A（2.0，待核实）；常驻 S：丽娜/猫又/莱卡恩/格莉丝/11号。

> **勘误（2026-08 接手后核实，详见 `docs/data-sources.md`）**：爱芮为**以太/异常**（BWIKI：<https://wiki.biligame.com/zzz/爱芮>），本文「冰/异常·异放主C」有误；「冰属性爱芮」是 2.8 普罗米娅的社区昵称。千夏=限定S·物理·支援、真斗=常驻A·火·**命破**（Rupture，2.3 新增第 6 定位）、潘引壶=常驻A·物理·防护。
> **勘误 2（2026-08，记录排序）**：§6 表中独家池「距上次 S 0 抽」有误，实为 **3 抽**——蕾米埃尔是 07-29 十连的第 7 抽，其后同秒还有 3 抽；邦布池「≈0」实为 **4 抽**（艾瑞儿为 08-10 十连第 6 抽）。根因：抽卡记录 API 同秒批量返回（十连记录 time 完全相同），排序必须用 **(time, id)** 打破平局，已修正 `parse.js` 与 `src/datasource/import-summary.js`。
> **勘误 3（2026-08 再审视）**：本文多处「39 位角色」有误，实际为 **31 位**（18 S + 13 A）；当前计划与架构请以 `PLAN.md` v2 为准。
- `src/data/banners.js`：3.1 卡池——上半 `b-remielle` + `b-aria`（复刻）；下半 `b-sigrid` + `b-mixed`（`selectable:['rinna','yuzuha','harumasa']`，`firstGoldGuaranteed:true` → UI 用 `rateUpChance:1` 覆盖）。
- `src/data/my-account.js`：用户真实账号（见 §6）。
- `src/models/systems.js`：7 个体系先验（ice-attack / ether / anomaly / wind-anomaly / lumiflux-anomaly / ice-anomaly / physical-attack），各含 `{F_min, delta_max, k, contributions}`；贡献向量为**待校准先验**。

## 5. UI 现状（`index.html` + `src/main.js` + `src/style.css`）

- 结构：资源面板（加密母带/菲林/保底计数（独家池）/大保底勾选）→ box 面板（39 个角色 checkbox，`badge` 显示元素，null 显示 `?`）→ 推荐结果卡片列表。
- 数据流：`state = {resources, box.characters{id:{owned,mindscape}}, favors}`；`input` 事件实时重算（喜好分用 `change` 避免重建输入框）；`renderResults()` 展开 `banners`（含混池 3 选 1 目标与「首金必不歪」标签），每目标调 `recommendCharacter` + `verdictFromScore(scoreFromUtility(...))`。
- 「载入我的真实账号」按钮：套用 `my-account.box`（勾选 20 角色）+ 独家 pity/fails，重渲染。
- 已知局限：仅角色池进 UI；音擎/邦布池数据未接；权重未暴露为 UI 输入；KEEP 简洁风格（无框架）。

## 6. 用户真实账号数据（uid 25183553，2026-08-15 解析，1168 条）

| 池（gacha_type） | 抽数 | S 级数 | 距上次 S（保底） | S 级列表（时间序） |
|---|---|---|---|---|
| 独家 2 | 454 | 6 | **0**（当前 50/50 状态，fails=0） | 千夏(03-01) → 南宫羽(03-24) → 普罗米娅(05-06) → 猫又(06-17, **歪**) → 维琳娜(07-04) → 蕾米埃尔(07-29) |
| 常驻 1 | 109 | 1 | 37 | 丽娜(06-15) |
| 音擎 3 | 189 | 3 | 10 | 霓虹妄想(04-08)、琳琅鎏心(07-04)、啜泣摇篮(08-06) |
| 邦布 5 | 416 | 8 | ≈0 | 阿饭×3、狮耶、罗宾、超极杰克×2、艾瑞儿(08-10) |

- box：7 S（千夏/南宫羽/普罗米娅/维琳娜/丽娜/猫又/蕾米埃尔）+ 13 A（安比/妮可/比利/可琳/派派/露西/赛斯/安东/本/苍角/波可娜/真斗/潘引壶）。
- 欧非：角色池 563 抽 7 S（80.4 抽/S，期望 62.5 → **偏非**）；独家 6 S 只歪 1 次（胜率 5/6）。
- **数据边界**：官方 API 仅保留最近约 6 个月（最早 2026-02-10）；2025 年记录不可恢复；账号 2025-10-10 安装。
- 原始记录：`docs/data/gacha-records-2026-08-15.json`（已 gitignore，不进公开仓库）；抓取用 authkey 在 `%TEMP%\zzz-authkey.txt`（约 1 天过期）。

## 7. 测试体系

- `npm test`（vitest run）：**65 项全过**。分布：gacha 10 / gacha-parse 5 / gacha-log 6 / utility 9 / vector 4 / rating 5 / decision 9 / pareto 2 / mcts 5 / kalman 7 / recommend 3。
- 断言坑（勿回退）：Kalman 噪声用例用区间断言（`toBeGreaterThan(50)` + `toBeLessThan(55)`）不用 `toBeCloseTo`；中文排序断言用 `arrayContaining`（Unicode 码点序 ≠ 拼音直觉，妮(59AE) < 安(5B89)）；MCTS 用 mulberry32 固定种子（seed 1/2 对应两用例）。

## 8. 构建与部署

- `npm run dev` / `build` / `preview`；`npm` 需 `$env:npm_config_offline='false'`。
- CI：`.github/workflows/deploy-pages.yml`（push main 触发：npm ci → test → build → upload-pages-artifact → deploy；node 22，ubuntu）。
- 仓库：yushi250412015/zzz-pull-advisor；最近提交 `a845024`（rank_type/7 属性/混池）、`0de0479`（四池+authkey 编码）、`fa61818`（会话存档）。
- **github.com 网络间歇性失败**（Recv failure/Connection reset）：push 用后台循环重试（实测第 10 次成功）。

## 9. 开发历史时间线（含全部踩坑与修正理由）

1. 用户给五模块规格 → 搭 Vite+Vitest 骨架，纯函数分层实现 P1–P5。
2. 灵魂角色硬编码被否 → 改可学习贡献向量 θ。
3. MCTS 加入 → 首版在展开时采样一次抽卡结果（有偏）→ **重写**：树只存预算序列，rollout 每次从 initialState 重模拟。
4. 发布 GitHub + Pages；删除死代码 `src/engine/`（v0.1 占位）。
5. 录入 3.1 卡池（用户提供）；修正中文排序/Kalman 断言测试坑。
6. 用户装好 ZZZ → 从 `Player.log` 提取 authkey → 调通抽卡记录 API（解决 PowerShell 中文乱码：curl `-o` 落盘 + UTF8 读取）。
7. **踩坑：rank_type**。首次按 Genshin 惯例搜 rank_type=5 → 0 条，误判用户无 S；实际 ZZZ 是 **4=S**（蕾米埃尔=4 且她是 S）。修正 `parse.js` + 测试 + 全量重解析。
8. **踩坑：属性体系**。用户说「流变是第 6 属性」→ 检索核实：官方名 **流明 Lumiflux**，「流变」是蕾米埃尔的**机制**；且 **3.0 已加「风」**（维琳娜）→ 共 7 属性。修正 `domain.js` + 角色库。
9. **踩坑：只抓 2/4 池**。首次只抓 1001+2001（563 条），漏音擎 189 / 邦布 416 → 全量 1168 条；`gacha_type` 记录值为 1/2/3/5（请求参数才是 1001/2001/3001/5001）。
10. **踩坑：authkey 编码**。解码后拼接 → `retcode=-1 illegal base64 data`；必须用日志里**原始百分号编码形态**。另：Player.log 会轮转，NAP 会话日志（`Persistent\LogDir`）里也有 URL。
11. 实测确认：官方 API 只留 6 个月；本地游戏文件为加密 pkg（`pkg_version` 1.78MB 清单）；`webCaches` 仅公告/活动 H5 缓存；**官方公告 API（announcement-static.mihoyo.com … getAnnList/getAnnContent）公开可调（retcode 0）**，版本公告含角色机制文本。
12. 会话存档：`docs/CONVERSATION-ARCHIVE.md` + 桌面 zip + 推送 `fa61818`。
13. 通用守则与接手文档：工作区根 `工程开发守则-PROMPT.md` + 本文件。

## 10. 环境与凭据备忘

- 项目路径：`C:\Users\27603\Desktop\deepseek hareness\zzz-pull-advisor\`。
- 游戏安装：`C:\Program Files\miHoYo Launcher\games\ZenlessZoneZero Game\`（注册表 HKCU\Software\miHoYo\HYP\1_1\nap_cn → GameInstallPath）。
- 游戏日志：`%USERPROFILE%\AppData\LocalLow\miHoYo\绝区零\{Player.log, Player-prev.log, logs\MiHoYoSDK.log}`；会话日志 `…\ZenlessZoneZero_Data\Persistent\LogDir\NAP_*.log`（最新抽卡页 URL 来源）；webCaches `…\ZenlessZoneZero_Data\webCaches\<版本>\`。
- GitHub 凭据：Git Credential Manager（`"protocol=https`nhost=github.com`n`n" | git credential fill`），账号 yushi250412015。
- pwsh 无状态、UTF-8 读取、ArrayList 防数组解包、`run_in_background` 后台任务等，见通用守则 §九。

## 11. 待办清单（按优先级；每项附验收标准）

1. **【高】公告数据源模块** `src/datasource/announcement.js`：封装 getAnnList/getAnnContent（参数参考 `game=nap&game_biz=nap_cn&lang=zh-cn&bundle_id=nap_cn&platform=pc&region=prod_gf_cn&level=60&channel_id=1`）→ 提取 3.1 版本公告与角色情报；验收：有单测（mock fetch）+ 能把公告标题/内容映射到角色 note 或 wiki 链接。
2. **【高】角色资料补全**：查证 千夏（元素）、真斗、潘引壶（元素/定位）；用社区数据（BWIKI/17173/4399/Prydwen/Honey Hunter）校准全部 `meta` 与 `systems.contributions`；验收：`characters.js` 中 3.1 相关角色无 `null` 关键字段，校准来源写入注释或独立 `docs/data-sources.md`。
3. **【中】四池进 UI**：音擎/邦布池卡片（用 `my-account.weapon/bangboo` + 对应保底）；验收：UI 显示四池状态，邦布/音擎 S 列表可见。
4. **【中】「实时导入」全流程**：读本地日志文件（Node 端能力或浏览器上传日志文件）→ `extractGachaPageUrl` → 用户粘贴或程序直读 → 四池 `fetchGachaRecords`（注意 CORS：浏览器直连 mihoyo 会失败，需说明/代理；本地 Node 脚本可行）→ `parseGachaHistory` 逐池解析 → 生成 my-account 快照；验收：一键生成与手填一致的状态。
5. **【中】MCTS 接 UI**：加「现在抽 vs 攒给希格莉德」卡片，跑 `mctsPlan`（迭代数可调，如 200~2000）；验收：UI 显示各预算动作的平均效用与访问次数，结论可解释。
6. **【低】权重面板**：暴露 α_c/α_f/λ_risk/α_cost 与阈值输入；验收：改动即时反映推荐结果。
7. **【低】六维向量与 Kalman 数据流**：为角色填 `DIMENSIONS` 向量；把版本公告/社区评价作为 Kalman 观测接入。

## 12. 文档导航

- 本文件：接手总纲（技术细节权威）。
- `docs/CONVERSATION-ARCHIVE.md`：压缩版会话上下文（开发守则 7 条、决策时间线、事实库速查）。
- `../工程开发守则-PROMPT.md`（工作区根目录）：通用工程守则 prompt。
- `PLAN.md` / `CHANGELOG.md` / `README.md`：计划、项目日志、简介。
- `docs/data/gacha-records-2026-08-15.json`：真实抽卡记录快照（本地）。
