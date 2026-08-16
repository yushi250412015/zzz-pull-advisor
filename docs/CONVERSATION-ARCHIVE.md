# 会话压缩存档 · Context Archive

> **调用方式**：任何新会话/新窗口开始前，把本文件全文（或按目录抽读）作为背景注入，即可恢复
> 从本对话框最开始（含早期 checkpoint 的 Pic Shrink 前情）到 2026-08-15 深夜的全部关键上下文。
> **覆盖范围**：对话第 1 条 checkpoint 消息 → 本文件生成时。
> **压缩比**：数万字多轮对话 ≈ 压缩为本文件（核心事实 100% 保留，过程细节只留结论与踩坑）。

---

## 0. 一句话状态

- 两个项目：**Pic Shrink**（已完成、已发布）与 **zzz-pull-advisor**（进行中 v0.1，GitHub Pages 部署）。
- 用户真实绝区零账号（uid 25183553）已通过官方抽卡记录 API 全量解析（4 池 1168 条），box/保底/欧非均已入代码。
- 开发守则、权重约定、算法选型均已确认；待办见 §3.8。

---

## 1. 开发守则（最高优先级，所有后续开发不得违背）

1. **不臆造游戏认知**：角色/卡池/机制/数值一律以官方公告 + 社区资料核实为准；未知字段标 `null`/「待核实」，绝不套用其他游戏或其他版本的旧认知（本会话已踩坑：ZZZ rank_type 语义、7 属性、「流变」是机制不是属性）。
2. **真实数据驱动**：卡池用真实版本数据（当前 3.1「漫长的告别」）；账号状态接官方抽卡记录 API 解析，保底/50/50 **按池独立**计算。
3. **先进算法优先**：多利用成熟数学模型/算法——马尔可夫 DP（精确概率）、**MCTS**（现在抽 vs 攒给下版本）、Kalman（时序估计）、TrueSkill/Weng-Lin（可学习技能评分）、帕累托 + 多目标决策；**动手前先检索网上已有 skill/项目/资料**。
4. **不硬编码「灵魂角色」**：体系贡献向量 θ 可学习；灵魂角色数量不定（0/1/N）。
5. **权重约定**：强度:喜好 = **8:2**（α_combat=0.8 / α_favor=0.2），**不考虑 xp**；λ_risk / α_cost 由「版本可获取资源 + 账号欧非程度」算法推导（`deriveWeights`，VERSION_RESOURCES=140）；判定阈值 ∈ [0,1]（score ≥0.6 抽 / ≥0.4 观望）。
6. **不可量化项用默认值/可学习参数**：k_op（手法上下限）、队伍角色效果无法量化 → 默认值/学习参数（TrueSkill/Kalman），不硬拍数字。
7. **工程纪律**：纯函数模块化 + 配置化（抽卡概率全部可调）+ 单元测试（当前 65 项全过）；每次改动同步 CHANGELOG（项目日志）并推送 GitHub；诚实汇报数据读取问题的根因。

---

## 2. 项目 A：Pic Shrink（已完结）

- 定位：图片/PDF/GIF 压缩与格式转换工具（JPEG/PNG/WebP/AVIF、场景预设、裁剪、水印、PDF pdf-lib、GIF gifsicle-wasm、EXIF exifr、i18n、TrueSkill/Weng-Lin 技能评分、Kalman 滤波）。
- 已发布 GitHub：<https://github.com/yushi250412015/pic-shrink>；About 描述曾出现中文乱码 → 已改英文。
- 遗留（低优先级）：README 演示 gif 未加、部分 topics 未补。

---

## 3. 项目 B：zzz-pull-advisor（进行中）

### 3.1 目标与五层架构（P1–P5）

- P1 概率层：可配置抽卡机制 + Markov DP（`rateAtPull`/`probabilityOfRateUp`/`expectedPullsToRateUp`）+ 蒙特卡洛（`simulatePulls`/`simulatePullsFull`）。
- P2 效用层：成型度 `formation(box, system)`（可学习贡献向量 θ）、`synergyGain(F)`、`boxUtility`、`marginalUtility`、六维评价向量、`skillCoefficient(k_op)`、TrueSkill 1v1（erf/normCdf）。
- P3 决策层：`paretoFrontier`/`dominates`、`totalUtility`、`deriveWeights`、`scoreFromUtility`（sigmoid, scale 10）、`verdictFromScore`（0.6/0.4 阈值）。
- P4 贝叶斯时序：`kalmanStep`/`kalmanFilterSeries`/`confidenceInterval`、`weightedObservation`。
- P5 接线：`parseGachaHistory`/`computeLuckStats`、`recommendCharacter`、`extractGachaUrl` 系列、`fetchGachaRecords`、MCTS `mctsPlan`（树只存预算序列，rollout 每次重新模拟抽卡——修复过「展开时采样一次导致估计有偏」）、UI（`main.js` + `index.html`）。

### 3.2 抽卡配置（可调，与真实机制对齐）

- 角色池 `DEFAULT_CONFIG.character`：baseRate 0.006、softPityStart 74、increment 0.06、hardPity 90、rateUpChance 0.5、guaranteeAfterFails 1。
- 音擎池 `weapon`：baseRate 0.01、softPityStart 66（待核实）、hardPity 80、rateUpChance 0.75、**guaranteeAfterFails Infinity（用户确认 ZZZ 无定轨）**。
- 3.1 下半**自选混池「首金必不歪」** → 该 banner 用 `rateUpChance: 1` 覆盖。

### 3.3 目录结构

```
zzz-pull-advisor/
  index.html  src/main.js  src/style.css
  src/domain.js            # RARITIES / ELEMENTS(7) / ROLES(5) / VERDICTS
  src/core/gacha/{config,pity,simulate,parse}.js
  src/core/utility/{formation,utility,vector}.js
  src/core/rating/rating.js          # TrueSkill 1v1
  src/core/decision/{decision,pareto,mcts}.js
  src/core/bayes/kalman.js
  src/core/recommend.js
  src/datasource/gacha-log.js
  src/data/{characters,banners,my-account}.js
  src/models/systems.js
  test/  (11 文件 65 测试)
  .github/workflows/deploy-pages.yml
  docs/  ← 本存档 + data/（本地数据，gitignore）
```

### 3.4 关键决策历史（时间顺序）

1. 用户给出五模块数学规格（概率/效用/贝叶斯时序/决策优化/不确定性）。
2. 拒绝硬编码单一「灵魂角色」→ 可学习 θ、灵魂数量不定（0/1/N）。
3. 要求「多利用先进数学模型」「先检索网上已有 skill/项目」。
4. 权重定死：强度:喜好 8:2，**不考虑 xp**；λ_risk/α_cost 算法推导；k_op 与队伍效果用默认/可学习。
5. 「mcts 加」→ 实现 MCTS 时序规划器；发现首版有偏后重写（预算序列存树、rollout 重模拟）。
6. 发布到自己 GitHub + Pages；每次同步 CHANGELOG。
7. 录入 3.1 真实卡池；用户强调「不要乱套已有对角色的认知体系」→ 全面核实。
8. 用户装好 ZZZ → 从 Player.log 提取 authkey 抓真实抽卡记录（本轮会话）。
9. 踩坑修正（§3.5）：rank_type、属性数量与命名、四池、authkey 编码、6 个月窗口。

### 3.5 实测事实库（2026-08-15 现场核实，勿再踩）

- **rank_type 语义（ZZZ 独有）**：`4 = S 级 / 3 = A 级 / 2 = B 级`（不是 Genshin/HSR 的 5/4/3）。`parseGachaHistory` 默认 `sRankType='4'`，可配置。
- **属性 7 种**：物理/火/冰/电/以太（1.0）+ **风 wind（3.0 新增，维琳娜）** + **流明 Lumiflux（3.1 新增，蕾米埃尔）**。官方名是**流明**；**「流变」是蕾米埃尔的机制名**（随下位上场代理人切换伤害属性），不是属性。
- **卡池 4 类**：请求参数 gacha_type = 1001 常驻 / 2001 独家 / 3001 音擎 / 5001 邦布；**记录返回的 gacha_type 是 API 内部编码 1/2/3/5**（解析时用 1/2/3/5 过滤！）。
- **authkey 提取**：日志（`Player.log` 或 `Persistent\LogDir\NAP_*.log`）里的 webview 行是抽卡 H5 页 URL（`webstatic.mihoyo.com/nap/event/e20230424gacha-v2/index.html?...&authkey=...`）；authkey 必须用**原始百分号编码形态**拼接 API（解码后 `+` 被当空格 → `retcode=-1 illegal base64 data`）。API 主机：`public-operation-nap.mihoyo.com/common/gacha_record/api/getGachaLog`，参数 authkey_ver=1&sign_type=2&auth_appid=webview_gacha&game_biz=nap_cn&lang=zh-cn。
- **6 个月窗口**：官方 API 只保留最近约 6 个月（本账号最早可追溯 2026-02-10）；2025 年记录不可恢复。账号 2025-10-10 安装（LocalLow 目录创建时间）。
- **音擎/邦布池里也有 B 级音擎（rank 2）当填充物**；A 级音擎（rank 3，如 兔能环）也会出现在角色池——解析 box 时排除 `item_type='音擎'`，但保底照计。
- **角色机制文本**：本地文件读不到（加密 pkg，`pkg_version` 1.78MB 只是清单；`webCaches` 只缓存公告/活动 H5；日志只有 URL）。但**官方公告 API 公开可调**：`announcement-static.mihoyo.com/common/nap_cn/announcement/api/getAnnList|getAnnContent`（实测 retcode 0），版本公告含官方代理人技能/机制文本；另有官方 wiki（baike.mihoyo.com/zzz、HoYoWiki）、米游社、BWIKI、17173/4399。
- **GitHub 网络**：github.com 间歇性 `Recv failure/Connection reset`，api.github.com 稳定；push 失败用后台循环重试（本会话 3 次成功）。
- **npm**：需要 `$env:npm_config_offline='false'`。
- **pwsh 沙箱**：每次调用无状态（无 cd/变量保持）；函数返回数组会被解包（用 ArrayList + `[void].Add()` 或返回 `,arr`）；curl 输出用 `-o 文件` 落盘再 `Get-Content -Encoding UTF8`（避免中文乱码）。

### 3.6 当前数据状态（截至 2026-08-15）

**3.1「漫长的告别」卡池（`banners.js`）**：
- 上半：**蕾米埃尔**（S，流明/异常，初代虚狩，流变机制）+ **爱芮**复刻（S，冰/异常，异放主C，2.6）。
- 下半：**希格莉德**（S，冰/强攻，新）+ **自选混池** 琉音（物理/击破）/浮波柚叶（物理/支援）/浅羽悠真（电/强攻），**首金必不歪**。

**角色库（`characters.js`，39 位，未知标 null）**：用户 box 7 S（蕾米埃尔、千夏、南宫羽、普罗米娅、维琳娜、丽娜、猫又）+ 13 A（安比/妮可/比利/可琳/派派/露西/赛斯/安东/本/苍角/波可娜/真斗/潘引壶）；常驻 S 歪池 `standardS` = 猫又/丽娜/莱卡恩/格莉丝/11号；另有卡池角色 aria/sigrid/rinna/yuzuha/harumasa 与占位 ellen/zhu-yuan/miyabi。
- 已知：南宫羽=以太/击破(2.7)、普罗米娅=冰/异常·异放(2.8)、维琳娜=风/异常·染色(3.0)、爱芮=冰/异放(2.6)、波可娜=Pulchra 物理/击破 A、真斗=狛野真斗 A(2.3)、潘引壶 A(2.0)。
- **待核实**：千夏（妄想天使·泛用辅助，元素未知）、真斗/潘引壶的属性定位；所有 meta 强度分待社区数据校准。
- > **勘误（2026-08 接手后核实）**：爱芮=**以太/异常**（非冰；「冰属性爱芮」是普罗米娅的社区昵称）；千夏=限定S·物理·支援；真斗=常驻A·火·命破（Rupture，2.3 新增第 6 定位）；潘引壶=常驻A·物理·防护。详见 `docs/data-sources.md`。
- > **勘误 2（记录排序）**：§3.6 表中独家池「距上次 S 0」实为 **3**（蕾米埃尔是 07-29 十连第 7 抽，其后同秒 3 抽）；邦布池「≈0」实为 **4**（艾瑞儿为 08-10 十连第 6 抽）。根因：API 同秒批量返回，排序需按 (time, id) 打破平局（已修正 parse.js / import-summary.js）。

**我的真实账号（`my-account.js`，uid 25183553，2026-08-15 解析，1168 条）**：

| 池 | 抽数 | S 级 | 距上次 S | S 级列表 |
|---|---|---|---|---|
| 独家 | 454 | 6 | **0**（50/50 状态） | 千夏→南宫羽→普罗米娅→猫又(歪)→维琳娜→蕾米埃尔 |
| 常驻 | 109 | 1 | 37 | 丽娜 |
| 音擎 | 189 | 3 | 10 | 霓虹妄想、琳琅鎏心、啜泣摇篮 |
| 邦布 | 416 | 8 | ≈0 | 阿饭×3、狮耶、罗宾、超极杰克×2、艾瑞儿 |

- 欧非：全账号 1168 抽 18 S；角色池 563 抽 7 S（80.4 抽/S vs 期望 62.5 → 偏非）；独家 6 次 S 只歪 1 次（猫又），胜率 5/6；当前独家 fails=0。
- UI「载入我的真实账号」按钮套用上述 box + 独家 pity/fails。

**体系先验（`systems.js`，待校准）**：ice-attack、ether、anomaly（旧）；wind-anomaly(velina)、lumiflux-anomaly(remielle)、ice-anomaly(promya/aria)、physical-attack(nekomata/pulchra)（新）。

### 3.7 测试与部署

- **65 项测试全过**（vitest：gacha 10、gacha-parse 5、gacha-log 6、utility 9、vector 4、rating 5、decision 9、pareto 2、mcts 5、kalman 7、recommend 3）；`npm run build` 正常。
- 已知测试坑：Kalman 噪声断言用区间不用 toBeCloseTo；中文排序断言用 arrayContaining（Unicode 排序与拼音直觉不同）；MCTS 用 mulberry32 固定种子。
- GitHub：yushi250412015/zzz-pull-advisor，main 分支；最近提交 `a845024`（rank_type/7属性/混池）、`0de0479`（四池全量+authkey 编码）；Pages workflow `deploy-pages.yml` 已启用。

### 3.8 待办清单（下一步候选）

1. 【高】公告数据源模块 `datasource/announcement.js`：拉官方版本公告 → 角色机制文本自动归档、给角色条挂官方链接。
2. 【高】查千夏/真斗/潘引壶的属性定位；用社区数据校准全部 meta 与体系贡献先验。
3. 【中】把音擎/邦布池接进 UI（当前 UI 只有角色池）；「从抽卡记录实时导入」完整流程（读本地日志 → authkey → 四池拉取 → 解析）。
4. 【中】MCTS「现在抽 vs 攒希格莉德」接 UI（核心已实现 `mctsPlan`）。
5. 【低】六维评价向量、k_op 学习回路、Kalman 观察接入的真实数据流。

---

## 4. 环境与工具备忘

- 项目路径：`C:\Users\27603\Desktop\deepseek hareness\zzz-pull-advisor\`（会话工作目录：`C:\Users\27603\Desktop\deepseek hareness\`）。
- 游戏安装：`C:\Program Files\miHoYo Launcher\games\ZenlessZoneZero Game\`（注册表 HKCU\Software\miHoYo\HYP\1_1\nap_cn → GameInstallPath）。
- 游戏日志：`%USERPROFILE%\AppData\LocalLow\miHoYo\绝区零\{Player.log, Player-prev.log, logs\MiHoYoSDK.log}`；会话日志 `…\ZenlessZoneZero_Data\Persistent\LogDir\NAP_*.log`（含最新抽卡页 URL）。
- webCaches：`…\ZenlessZoneZero_Data\webCaches\<版本>\`（公告/活动 H5 缓存，无角色机制文本）。
- TEMP 数据：`%TEMP%\zzz-full-records.json`（1168 条原始记录，本存档已复制到 `docs/data/`）、`%TEMP%\zzz-authkey.txt`（原始编码 authkey，约 1 天过期）。
- GitHub 凭据：Git Credential Manager 已存（`"protocol=https`nhost=github.com`n`n" | git credential fill` 可取 token，账号 yushi250412015）。
- 会话为 DSH Web GUI（http://127.0.0.1:3080）；本文件生成时的运行环境见系统提示。

---

## 5. 本存档文件清单

- `docs/CONVERSATION-ARCHIVE.md` —— 本文件（压缩版上下文，随 Git 入库）。
- `docs/HANDOVER.md` —— **接手开发总纲（事无巨细版）**：模块级 API、数据模型、踩坑时间线、待办与验收标准；接手新对话框先读它。
- `..\工程开发守则-PROMPT.md`（工作区根目录）—— 通用工程守则 prompt（谨慎/审慎等），适用于本文件夹下所有项目对话框。
- `docs/data/gacha-records-2026-08-15.json` —— 用户真实抽卡记录（1168 条，**已加入 .gitignore，不进公开仓库**）。
- 桌面 zip：`zzz-会话存档-2026-08-15.zip`（上述文件的便携打包件）。
