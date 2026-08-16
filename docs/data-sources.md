# 数据来源档案（data-sources）

> 本文件记录 zzz-pull-advisor 中角色 / 机制 / 数据源事实的来源链接，保证「不臆造、可回溯」。
> 置信度标记：✅ 官方 / 官方公告实测；🔶 社区资料（多源一致）；⚠️ 单源或冲突待核实。

## 1. 官方公告 API（announcement-static.mihoyo.com，公开可调，无需鉴权）

- getAnnList / getAnnContent：`https://announcement-static.mihoyo.com/common/nap_cn/announcement/api`
- 参数：`game=nap&game_biz=nap_cn&lang=zh-cn&bundle_id=nap_cn&platform=pc&region=prod_gf_cn&level=60&channel_id=1`（lang 可换 en 取英文公告）
- 实测（2026-08）：retcode=0；getAnnList 返回分组（type_label 在组级）+ 条目（ann_id/title 带 <p> 包裹/subtitle/content/has_content 等）；getAnnContent 返回全部内容列表（需自行按 ann_id 筛选，实测 data.total=20）
- 本地快照（gitignore，不进公开仓库）：`docs/data/ann-list-2026-08.json`、`docs/data/ann-content-1263-2026-08.json`
- ✅ **3.1 版本更新公告**（ann_id 1262，《3.1版本「漫长的告别」更新公告》）：官方写明「S级代理人[蕾米埃尔(流明·异常)]」「S级代理人[希格莉德(冰·强攻)]」——与 banners.js / characters.js 一致；正文含代理人核心技改动文本（`fetchAnnContent(1262)` + `findCharacterMentions` 可提取）
- ⚠️ 「命破」未出现在 3.1 公告（3.1 无命破角色）；官方英文公告仅窗口内可查，2.3 命破上线公告已出窗口

## 2. 角色事实核实（2026-08 检索，多源交叉）

| 角色 | 结论 | 置信度 | 来源 |
|---|---|---|---|
| 千夏（Sunna） | 限定 UP S · **物理** · **支援** · 2.6 实装（2026-02-06）· 妄想天使组合 | ✅ | BWIKI 信息框：<https://wiki.biligame.com/zzz/千夏>；17173 攻略「S级 物理属性支援 代理人」<https://news.17173.com/content/02072026/161023762.shtml>；Prydwen <https://www.prydwen.gg/zenless/characters/sunna> |
| 真斗（Komano Manato） | 常驻 A · **火** · **命破（Rupture）** · 2.3 实装（2025-10-15）· 犬希人 | ✅ | BWIKI：<https://wiki.biligame.com/zzz/真斗>（属性 火 / 特性 命破）；9game 技能页 <https://www.9game.cn/juequling/11447306.html>（技能均火属性伤害）；3dmgame <https://m.3dmgame.com/ol/gl/320560_6.html>（「命破长轴站场C」「贯穿力无视防御」）；EN：Fragster <https://www.fragster.com/zenless-zone-zero-zzz-all-three-new-agents-revealed-for-version-2-3/>（A-Rank Fire Rupture）；HHW 职业页 <https://zzz.honeyhunterworld.com/6-class/?lang=EN> |
| 潘引壶（Pan Yinhu） | 常驻 A · **物理** · **防护** · 2.0 实装（2025-06-06）· 熊猫希人；命破队辅助（贯穿力加成+回血） | ✅ | BWIKI：<https://wiki.biligame.com/zzz/潘引壶>（属性 物理 / 特性 防护）；Prydwen <https://www.prydwen.gg/zenless/characters/pan-yinhu> |
| 爱芮（Aria） | 限定 UP S · **以太** · **异常** · 2.6 实装（2026-03-04）· 妄想天使组合 | ✅ | BWIKI：<https://wiki.biligame.com/zzz/爱芮>（属性 以太 / 特性 异常） |
| 普罗米娅（Promeia） | 限定 UP S · **冰** · **异常** · 2.8 实装（2026-05-06）· 坎卜斯黑枝 | ✅ | BWIKI：<https://wiki.biligame.com/zzz/普罗米娅>；17173「冰属性爱芮」昵称来源 <https://news.17173.com/content/05032026/002059017.shtml> |
| 浮波柚叶（Ukinami Yuzuha） | 限定 UP S · **物理** · **支援** · 2.1 实装（2025-07-16）· 异常体系专辅 | ✅ | BWIKI：<https://wiki.biligame.com/zzz/浮波柚叶>；17173 攻略 <https://news.17173.com/content/07102025/222101660.shtml> |
| 琉音（Dialyn） | 限定 UP S · **物理** · **击破** · 2.4 | ✅ | 9game <https://www.9game.cn/juequling/11551513.html>（「物理属性击破辅助」「物理队效率型辅助天花板」）；BWIKI <https://wiki.biligame.com/zzz/琉音> |
| 浅羽悠真（Asaba Harumasa） | 限定 S · **电** · **强攻** · 1.4 | ✅ | 17173 <https://news.17173.com/content/11022024/025408706.shtml> |

- ⚠️ **命破的英文键**：官方简中「命破」，英文社区通用名 **Rupture**（Fragster、HHW、fandom wiki 一致）；官方英文公告在 API 窗口外，取 `role: 'rupture'` 并保留待官方英文公告最终确认的注释。
- **enName 口径**：`characters.js` 的 enName 为官方/社区多源口径（蕾米埃尔·丹=Remielle Dan：gamespress 官方新闻稿；希格莉德·德拉叙尔=Sigrid de L'Azur：官方角色页 zenless.hoyoverse.com；琉音=Dialyn：fandom wiki；千夏=Sunna：Prydwen；真斗=Komano Manato：BWIKI）。

## 3. meta 强度分校准（2026-08，Prydwen ZZZ tier list）

- **来源**：Prydwen ZZZ tier list <https://www.prydwen.gg/zenless/tier-list>（子代理 2026-08 抓取；T0/T0.5/T1/T2/T3 体系）
- **换算规则（本项目的保守映射，非站点原值）**：T0=90 / T0.5=82 / T1=72 / T2=62 / T3=50
- **已校准**（规则直取）：千夏 T0→90、爱芮 T0→90、琉音 T0→90、浮波柚叶 T0→90、南宫羽 T0→90、普罗米娅 T0.5→82、妮可 T0.5→82、浅羽悠真 T1→72、苍角 T1→72、真斗 T1→72、潘引壶 T1→72、莱卡恩 T1→72、11号 T1→72、猫又 T2→62、格莉丝 T2→62、波可娜 T2→62、安比 T3→50、赛斯 T3→50
- **例外 / 冲突（已在 characters.js note 注明）**：
  - 丽娜 T2→再下调 50：2.6 支援榜垫底（TOP8，「buff 覆盖率极低、手感差、坐等增强」），来源 <https://news.17173.com/content/02192026/094402613.shtml>
  - 露西 T2→再下调 52：同榜 TOP7「数值相对其他支援偏低」
  - 派派 60（取中）：Prydwen T1 vs 17173 A级盘点（2026-01）「数值太低不推荐」<https://news.17173.com/content/01262026/043348358.shtml>
- **Prydwen 未收录 → 用 9game 保守取值**：蕾米埃尔 90（「T0 配队」「未来很长一段时间异常体系最强阵容之一」<https://a.9game.cn/juequling/11957058.html>）、希格莉德 82（「冰系主C，0+1 成型，无刚需命座」<https://www.9game.cn/juequling/12001531.html>）、维琳娜保持 null（未评级）
- **仍未校准**：维琳娜、比利、可琳、安东、本保持 null；艾莲/朱鸢/星见雅 85/80/92 为旧占位先验（未在本轮校准）

## 4. 体系贡献校准（systems.js，2026-08）

- lumiflux-anomaly +维琳娜 0.25：社区 T0 配队「蕾米埃尔主C+维琳娜风异常副C」（9game 同上）
- 新增 rupture（命破）体系 {真斗 0.7, 潘引壶 0.3}：社区通解「命破C+击破+卢西娅（潘引壶为下位替代）」（3dmgame/17173）
- ice-anomaly 移出爱芮（以太），仅留普罗米娅 0.7；新增 ether-anomaly {爱芮 0.8}
- anomaly +苍角 0.2：社区配队「雅狼苍 / 雅柚苍」（17173 同上）

## 5. Wiki 链接约定

- BWIKI 角色页直链已实测 200：`https://wiki.biligame.com/zzz/<角色中文名>`（URL 编码后），由 `buildWikiUrl` 生成。
- 官方社区工具（公告正文 307 条）：米游社 / HoYoWiki（baike.mihoyo.com/zzz）/ 官方小程序。

## 6. 补充来源链接（子代理核实报告，2026-08）

- HHW 角色页：真斗 <https://zzz.honeyhunterworld.com/1441-char/>、潘引壶 <https://zzz.honeyhunterworld.com/1421-char/>、千夏 <https://zzz.honeyhunterworld.com/2071-char/>
- hostedgg 六大职业说明（命破=第 6 特性的佐证）：<https://hostedgg.com/blog/zenless-zone-zero-specialties-team-roles-guide>
- gematsu 官方英文 3.1「The Long Goodbye」上线公告：<https://www.gematsu.com/2026/07/zenless-zone-zero-version-3-1-update-the-long-goodbye-launches-july-29>
- gamespress 蕾米埃尔（流明/初代虚狩）：<https://www.gamespress.com/pl/Zenless-Zone-Zero-Celebrates-Its-2nd-Anniversary-All-New-Lumiflux-Attr>
- game8 参考页（本次未能抓取正文，仅存档链接）：tier list <https://game8.co/games/Zenless-Zone-Zero/archives/435685>、Sunna <https://game8.co/games/Zenless-Zone-Zero/archives/572600>、Manato <https://game8.co/games/Zenless-Zone-Zero/archives/545823>、Pan Yinhu <https://game8.co/games/Zenless-Zone-Zero/archives/517115>


## 7. 角色数据审计（2026-08，逐项核对，防信息污染）

**来源分级**：✅官方公告 = announcement-static.mihoyo.com 实测（ann_id 1262《3.1版本「漫长的告别」更新公告》）；🔶BWIKI 信息框 = wiki.biligame.com/zzz 实测抓取；🔶常识 = 多社区一致的基础事实（未逐页取证，如与官方冲突以官方为准）。
**已尝试但受限的官方源（如实记录）**：HoYoWiki（wiki.hoyolab.com）本网络 403「地区限制」；官网 roster 内容 API（sg-public-api-static.hoyoverse.com/content_v2_user）参数未公开且客户端渲染，未取到数据；官方抽卡概率 JSON（operation-webstatic.hoyoverse.com/gacha_info/nap/）本网络 403（地区限制）。抽卡概率页本身（gs.hoyoverse.com/static/nap-official-gacha-probability/）可访问但数据同源受限。

| 角色 | element | role | rarity | 实装版本（日期） | 来源 |
|---|---|---|---|---|---|
| 蕾米埃尔 | lumiflux | anomaly | S | 3.1 | ✅官方公告「蕾米埃尔(流明·异常)」 |
| 希格莉德 | ice | attack | S | 3.1 | ✅官方公告「希格莉德(冰·强攻)」 |
| 爱芮 | ether | anomaly | S | 2.6（2026-03-04） | 🔶BWIKI 信息框；官方公告 1262 提及（核心技改动） |
| 琉音 | physical | stun | S | 2.4 | 🔶9game「物理属性击破辅助」+ BWIKI |
| 浮波柚叶 | physical | support | S | 2.1（2025-07-16） | 🔶BWIKI 信息框 |
| 浅羽悠真 | electric | attack | S | 1.4 | 🔶17173「电属性强攻」 |
| 千夏 | physical | support | S | 2.6（2026-02-06） | 🔶BWIKI 信息框 + 17173「S级物理属性支援」 |
| 南宫羽 | ether | stun | S | 2.7（2026-03-24） | 🔶BWIKI 信息框 |
| 普罗米娅 | ice | anomaly | S | 2.8（2026-05-06） | 🔶BWIKI 信息框；官方公告 1262 提及 |
| 维琳娜 | wind | anomaly | S | 3.0（2026-06-17） | 🔶BWIKI 信息框 |
| 丽娜 | electric | support | 常驻S | 1.0 | 🔶常识；官方公告 1262 提及 |
| 猫又 | physical | attack | 常驻S | 1.0 | 🔶常识 |
| 莱卡恩 | ice | stun | 常驻S | 1.0 | 🔶常识 |
| 格莉丝 | electric | anomaly | 常驻S | 1.0 | 🔶常识 |
| 11号 | fire | attack | 常驻S | 1.0 | 🔶常识 |
| 真斗 | fire | rupture(命破) | A | 2.3（2025-10-15） | 🔶BWIKI 信息框 + HHW/Fragster（Rupture） |
| 潘引壶 | physical | defense | A | 2.0（2025-06-06） | 🔶BWIKI 信息框 |
| 波可娜 | physical | stun | A | 1.6（2025-03-12） | 🔶BWIKI 信息框 |
| 安比/妮可/比利/可琳/安东/本/苍角 | 电/以太/物/物/电/火/冰 | 击破/支援/强攻/强攻/强攻/防护/支援 | A | 1.0 | 🔶常识（官方公告 1262 提及安比/比利/本） |
| 露西/派派/赛斯 | 火/物/电 | 支援/异常/防护 | A | 1.1 | 🔶常识（官方公告 1262 提及露西/派派） |
| 艾莲/朱鸢/星见雅 | ice/ether/ice | attack/attack/anomaly | S | 1.0 | 🔶常识 |

**审计结论**：全部 39 位角色的 element/role/rarity/版本与既有数据**无冲突**；其中 3.1 两位角色为官方公告口径，千夏/真斗/潘引壶/爱芮/普罗米娅/维琳娜/浮波柚叶/南宫羽/波可娜 为 BWIKI 信息框实测口径，其余为多社区一致的常识值（官方 roster 数据本网络受限，已如实标注）。

## 8. 官方 3.1 情报（ann_id 1262 官方公告原文，2026-08 实测）

- **全新代理人**：S级代理人[蕾米埃尔(流明·异常)]「复乐园」频段；S级代理人[希格莉德(冰·强攻)]「直到天空沉落」频段
- **全新音擎**：S级音擎[空羽复归之诗(异常)]、S级音擎[骁骑礼赞(强攻)]
- **全新邦布**：S级邦布[艾瑞儿]「卓越搭档」频段
- **版本时间**：2026/07/29–2026/09/09（42 天）；停服补偿菲林 300 + 问题修复补偿菲林 300
- **快照**：`docs/data/ann-content-1262-2026-08.json`（gitignore）；接口 `fetchAnnContent(1262)` 可随时重取



## 9. 音擎 / 邦布情报（3.1，2026-08 核实，用于 A 方向推荐建模）

- **空羽复归之诗**（异常 S 音擎）= 蕾米埃尔毕业音擎：BWIKI 蕾米埃尔页「音擎推荐/毕业音擎」实测 <https://wiki.biligame.com/zzz/蕾米埃尔>；官方公告「空羽复归之诗」频段
- **骁骑礼赞**（强攻 S 音擎）：官方公告「骁骑礼赞」频段；按定位**推断**为希格莉德专武（BWIKI 页面尚未建——希格莉德 2026-08-19 才实装）→ `equipment.js` 标记 `pairing: 'inferred'`，待实装后核实
- **艾瑞儿**：官方公告「卓越搭档」频段 S 邦布；BWIKI：伤害属性**以太**、阵营达识结社、阵营代理人蕾米埃尔 <https://wiki.biligame.com/zzz/艾瑞儿>
- **希格莉德实装 2026-08-19**（BWIKI 信息框）= 3.1 下半
- 价值模型先验（`recommend-equipment.js` 的 `EQUIPMENT_DEFAULTS`，可调参数、待实测校准）：专武 ≈ 角色贡献 × 0.6；邦布 = 基础 6 + 元素匹配 4 + 阵营同伴 2；音擎池概率用 `DEFAULT_CONFIG.weapon`（75/25、无定轨、硬保底 80，软保底 66 待核实）；邦布池官方概率暂不可得（官方概率页地区受限）→ risk 记 null 并诚实标注

## 10. 版本数据工具链（scripts/，A 方向）

- `update-banners.mjs`：拉官方公告 → `extractReleaseFacts` 提取「全新代理人/音擎/邦布」官方陈述 → 与 characters.js/equipment.js 对比输出「已录入/【新增】」+ 事实落盘 `docs/data/version-facts-<日期>.json`（gitignore）；**不自动改源码**，人工审阅后更新
- `archive-announcements.mjs`：公告列表+正文全量归档 `docs/data/ann-archive-<日期>.json`（gitignore）
- 实测运行（2026-08-16）：3.1 全部条目「已录入」，时间窗 2026/07/29 → 2026/09/09 提取正确



### 新版本数据更新 SOP（每 6 周一次，工具链已就绪）

1. `node scripts/update-banners.mjs` —— 拉最新版本公告、提取「全新代理人/音擎/邦布」与时间窗，对比输出「已录入/【新增】」，事实落盘 `docs/data/version-facts-<日期>.json`
2. 人工审阅事实后更新源码（**不自动改源码**）：
   - 新代理人 → `characters.js`（name/enName/element/role/rarity；meta 无权威源先标 null）→ `banners.js`（版本/phase/频段）
   - 新音擎 → `equipment.js`（配对角色：查 BWIKI「毕业音擎」；无源标 `pairing: 'inferred'`）→ `banners.js`（weapon 条目）
   - 新邦布 → `equipment.js`（元素/阵营：BWIKI 邦布页）→ `banners.js`（bangboo 条目）
   - 资源基准：`decision.js` 的 `VERSION_RESOURCES` 与 `main.js` 的 `VERSION_RESOURCES`（版本零氪抽数变化时同步）
   - `official-facts.js` 快照刷新（含 fetchedAt 与来源 ann_id）
3. `npm test` 全绿 + `npm run build` 通过（语义变更同步单测）
4. 更新 `CHANGELOG.md` 与本文档来源链接；commit + push（github.com 抖动用后台循环重试）



## 11. 希格莉德博主实测与机制库（2026-08 补充）

- **骁骑礼赞配对升级 inferred → verified**：游侠网培养大全 <https://m.ali213.net/news/gl2608/1798199.html>（2026-08-08）与 niubi.wiki 全方位指南 <https://niubi.wiki/2026/06/26/132766/> 两篇独立攻略均给出同一把专属音擎（基础攻 713 / 暴伤 48%、冰伤被动「骨寒」：冰伤+14%、无视冰抗 20%），与官方公告 3.1 唯一新强攻音擎「骁骑礼赞」对应（博主文中译名「骑士颂赞」）。⚠️ 具体倍率数值两文未给出，全量倍率表仍以 BWIKI 希格莉德页为准（该页统计表当前有「表达式错误」，待 wiki 修复）
- **机制**（两文一致）：S级冰强攻·站场主C；【骑士专注】状态 + 三段蓄力普攻；【敛枪式】蓄力爆发、命中失衡敌人追加攻击并提易伤；强化特殊技双形态；M0 机制完整、M1/M2 最佳止步点；配队 希格莉德+诺姆(冰击破)+丽娜
- **meta 维持 82**（0+1 成型、一线梯队、无「数据膨胀」级评价）；B站实况标题佐证强度正面（「三大顶分配队实战」等，视频无法取文本，未计入数值）
- **机制库 `src/data/mechanics.js`**：12 位角色机制摘要 + 关键技能 + 推荐配队 + 来源逐条标注；`multipliers: null` 表示无带出处的具体倍率（不臆造，UI 引导到 BWIKI 全量倍率表）。⚠️ **2026-08 重构：机制速查功能按用户要求移除，mechanics.js 已删除**（核心定位是抽卡决策；机制类信息游戏内即可查看，非本项目差异化）



## 12. 卡特亚观测源通道（2026-08 建立，数据待补入）

- **用户指定的一等可信观测源**：卡特亚（B站「卡特亚仿身泪滴」，mid **470042408**）。观测权重 `trust: 0.9`（`src/data/observations.js` 的 `observationSources.katya`）
- **通道实测**：B站单视频 view API 可用（`api.bilibili.com/x/web-interface/view?bvid=...`，返回标题/作者/简介）；视频列表与搜索 API 被风控（-352/-799 无 cookie）、RSSHub 公共实例不可用、搜索引擎不索引其 ZZZ 视频 → **其希格莉德视频文本当前无法程序化读取**，具体倍率/结论待补入（不臆造）
- **补入方式**：拿到 BV 号或视频简介/结论文本后，按 `observations.js` 格式添加 `{ characterId, value, weight: 0.9, source: 'katya', date, note: '视频/BV号' }`，UI 可信度面板即时融合；希格莉德具体倍率待补（机制速查已移除；如恢复需重建独立数据模块，结构与出处校验单测一并重建）
- 卡尔曼融合参数（`meta-posterior.js`）：先验方差 100、过程噪声 Q=4（版本漂移）、测量噪声 R=36/weight²



### 12.1 首次真实观测落库（卡特亚 BV1ZPgA6YEwa，2026-08-14）

- **视频**：《【绝区零】希格莉德综合测评：超级力量！武器对比+技能解读+驱动盘选择+影画提升！》，913s，播放 32.8 万 / 赞 3.2 万（卡特亚主频道 mid 43222001；标签：希格莉德测评/创作体验服）
- **可读取信息**：标题强正面结论「超级力量！」；简介/字幕为空、评论与 AI 总结需登录 → 视频内具体数值（倍率/影画幅度/专武对比）暂不可程序化读取
- **落库方式（诚实标注）**：`observations.js` 添加 `{ sigrid, value: 85, weight: 0.9, source: 'katya', date: '2026-08-14', note: ... }`；85 = 现有共识 82 的保守 +3 映射（**我方映射，非视频原值**，已写入 note）。效果：sigrid 后验 82 → μ=83.66（95% CI 73.9–93.4，较先验收窄）
- **工具**：`scripts/fetch-bv.mjs --bvid <BV>`（标题/作者/日期/数据/标签/字幕一键抓取，view+player+tags 三接口无需登录，实测可用）——后续卡特亚视频的观测管线入口
- **待补**：视频内结论（武器对比数字、影画提升幅度、技能倍率）——用户提供或获得评论/字幕权限后替换为真实数值观测



### 12.2 多博主观测扩展（2026-02/03 爱芮双源视频）

- **新观测源注册**：梦轩dada（B站 ZZZ 攻略/测评，mid 27500557，42 万播放级），trust 0.7（`observationSources.mengxuan`）——观测源不止卡特亚，可持续扩展
- **BV1opAmzXEoD**（卡特亚，2026-02-27，82.2 万播放/4.8 万赞）：《爱芮综合测评：屁股有劲！武器对比+技能解读+驱动盘选择+影画提升！》→ aria 观测 {92, katya 0.9}
- **BV1URPNzREDf**（梦轩dada，2026-03-04，42 万播放）：《爱芮终极指南！以太异常主C的荣耀…》→ aria 观测 {92, mengxuan 0.7}；标题同时**确认「以太异常主C」定位，与项目数据（2026-08 勘误）一致**
- **标题级映射规则（正式化）**：视频文本不可读时，标题强正面结论 → `value = min(角色现有共识 meta + 3, 92)`，note 必注「我方保守映射，非视频原值」（已写入 observations.js 头注释）
- 效果：aria 后验 90 → μ=91.22（95% CI 82.7–99.7，双源确认、较先验收窄）



### 12.3 自动查找已打通（2026-08）：相关推荐图爬取

- **结论**：B站「搜索/空间列表」接口需登录（wbi 风控 -352/-799、nav -101 不给签名密钥），但 **archive/related（相关推荐）接口免登录可用** → 从已知视频 BFS 爬「相关视频」图，按作者 mid/标题关键词过滤，即可**自动发现博主视频**
- **工具**：`scripts/find-bili-videos.mjs --seed <BV> --mid <作者id> --keyword <词> --depth 3 --max 400`（自动角色匹配 `src/datasource/bili-title-match.js`、输出候选观测清单；null-meta 角色跳过不臆造）
- **首次爬取成果（卡特亚 mid 43222001，关键词 绝区零）**：自动发现其 ZZZ 测评系列——千夏（BV1yPFPzKESn「有力气的偶像！高速以太帷幕」67 万播放）、南宫羽（BV1VfAEziEQ2）、普罗米娅（BV1mXRVBdE2c）、维琳娜+佩洛伊斯（BV1sGEy6mEKe「强力聚怪+风属性」）、星见雅（BV1r5q9YXECT「超强大范围输出」）、琉音（BV1FvyMBqEmX）、浮波柚叶（BV1tfu6zqE6G）、艾莲×2、朱鸢（BV1tS42197rb「爆发天花板以太大C」）、零号安比+波可娜（BV1Uv9CYjEaX）、蕾米埃尔 7 影画（BV1pC3s6gEEy）等
- **落库纪律**：仅「标题含明确强度结论词」的才按 `min(共识+3, 92)` 落库——本轮落库 chinatsu 92 / miyabi 92 / zhu-yuan 83（+此前 remielle 92）；描述性标题（如「综合攻略」「赠送大招的击破」）与 meta=null 角色跳过，留待视频文本或人工审阅
- **未录入角色库的测评**（记录备查）：卢西娅（BV1pg4EzkEv9，83.8 万播放）、般岳、伊芙琳、奥菲丝、兔兔照——如需，可扩展 characters.js 后补观测



### 12.4 B站登录会话解锁（2026-08，用户授权）

- **获取方式**：用户粘贴 `document.cookie` + httpOnly 的 `SESSDATA`（DevTools → Application → Cookies）；保存于 `%TEMP%\zzz-bili-cookie.txt`（**绝不进 git 仓库**，SESSDATA 约一月过期，用户可随时删除）。`scripts/bili-session.mjs` 自动读取该文件
- **已解锁接口（实测）**：站内搜索（wbi 签名）、作者视频列表、评论（x/v2/reply，ps≤20）、nav 登录态（用户「想不到女子名字」，大会员）
- **仍受限（如实记录）**：AI 视频总结（conclusion/get）需 UP 主权限 → -403；**AI 字幕服务当前返回错配内容**（BV1kRgw6zEWM 等返回无关视频字幕，ai_status=2）→ 暂不可信，不采用
- **技术边界备忘**：本机 cookie 为 v20 app-bound 加密，直接读库需 elevation 服务（命名管道，本执行环境受限）；免登录可用接口为 view/player/tags/archive-related（此前已利用）
- **已落地事实（本轮）**：希格莉德专武与下位差距 20%+、弹刀触发最高倍率第三段枪势、测试服削过大招倍率、0命「低命战神」——全部入 `equipment.js` note 与 `characters.js` note（单源标注；机制速查功能已移除，相关事实保留在装备/角色数据中）
- **毕加丶视频库已拉取**（`space 25978510`）：蕾米埃尔最佳配装 BV19X3r6ME7A、猫又/丽娜/简潜能觉醒系列、爱芮最佳配装 BV1f9PKz5EHC、南宫羽最佳配装 BV1MhQqBEE4Q、年度T0榜单 BV1GUZ1B8E8L 等——待逐条取结论后补观测



### 12.5 批量消化观测源（2026-08，登录态批量抓取 14 条视频）

- **工具**：`scripts/bili-batch.mjs`（批量简介+热评；评论结论优先取 UP 主置顶，次取多条交叉的普通评论，单条标注）
- **毕加丶 4 条**（蕾米埃尔/爱芮/南宫羽配装 + 年度T0榜）：爱芮「薇薇安四法厄同平替专盘、0+0 够用」；南宫羽「00 四冲击 +6000 分实测」「入爱芮队负提升个例」；年度榜评论区出现星见雅衰落论（第 1 条）
- **卡特亚 10 条**：维琳娜「**与蕾米埃尔的官方推荐配队**（引述官方动态）」；琉音「赠送大招的击破/强攻命破辅助/排轴要求高」；南宫羽「三小只强度不低但击破队排轴影响大/爱芮双连携满 8 棒」；星见雅「机能确实强（2024 置顶）」与「期期压线过（2026 评论）」冲突（第 2 条）；普罗米娅「卡特亚自承配队测试不足」；各角色驱动盘配置全部入 mechanics
- **落库**：observations 新增 `bili-comments` 源（trust 0.45，多条交叉才采用）+ 星见雅 70 冲突观测（后验 92 → **88.37**）；mechanics 新增琉音/星见雅条目、aria/promya/velina/nangong-yu 增补 facts；systems 注释补官方配队佐证
- **希格莉德倍率**：BWIKI 页复查仍为「表达式错误」+ 空倍率表 → `multipliers` 保持 null（不臆造），待页面修复或视频内数值



### 12.6 潜能觉醒共识 + 敏感性分析 + UI 冒烟（2026-08 v2.1）

- **潜能觉醒系列消化（毕加丶，2026-07-24）**：猫又「3.1 加强后仍是最强物理强攻（出道即巅峰）」→ 观测 75；丽娜「加强后成强攻队万能插件（与狼互解额外能力）」→ 观测 62（手感抱怨仍存在）；蕾米埃尔「利好异放角色、旧紊乱C 难吃满」→ mechanics facts；卢西娅「命破队首选」（10选2 评论区）佐证 rupture 体系
- **希格莉德倍率**：B站搜索无文本倍率表（数值只在视频内）→ `multipliers` 维持 null；搜索标题共识「数值怪/伟大数值」佐证 meta 82-85
- **音擎/邦布敏感性分析**（`scripts/sensitivity-equipment.mjs`，账号 box + 60 抽样本）：蕾米专武结论在 weaponValueRatio 0.45→0.6 间翻转 skip→consider（默认 0.6 下为 consider，属临界稳健）；希格莉德专武全参数 skip（未拥有角色 → 价值 0 的诚实行为）；艾瑞儿邦布全参数 pull（价值 9-15 恒正）
- **UI jsdom 冒烟测试**（+8 项，`test/ui-smoke.test.js`）：index.html + main.js 副作用导入，断言 8 个面板真实渲染（推荐卡/音擎邦布/四池欧非/官方情报/账号同步/可信度/权重初始化/MCTS 场景）
- **SOP 演练**：update-banners 确认 3.2 未进窗口（符合预期）



### 12.7 老角色信息更新（2026-08，既有视频源消化）

- **定位方式**：分页拉取卡特亚（mid 43222001，约 70 条绝区零视频）与毕加丶（mid 25978510，约 40 条）完整清单，匹配老角色视频后批量消化
- **关键来源**：毕加《自选S终极盘点》BV1iijSzfEic（2025-05，常驻S优先级共识「狼＞丽娜＞11号/格莉丝＞猫又」）、《妮可强度登顶》BV1meAYezE27（2025-02）、露西攻略 BV1k7PoeaEwx、苍角攻略 BV1gbtnzwE7L；卡特亚《全S级强度分析》BV1Rz421q7cE（2024-07 开服档案：11号公测加强、莱卡恩减冰抗25、格莉丝手雷流）、《全A级强度测评》BV11T421e733（2024-07：安比送专武、苍角适配艾莲）、艾莲加强展示 BV1U57czCEKV（2025-05）
- **落库**：observations +2（妮可 85·bijia 标题级结论；莱卡恩 74·评论区共识）；mechanics 新增 **14 个老角色条目**（艾莲/朱鸢/莱卡恩/格莉丝/11号/丽娜/猫又/安比/比利/可琳/派派/露西/赛斯/安东/本）；characters.js 老角色 note 补来源；开服期（2024）数据与现行（2025-2026）数据按日期区分标注
- **诚实边界**：艾莲 85 / 朱鸢 80 仍为旧占位先验（开服视频仅历史档案价值）；11号「目押难」与「公测加强」并存已如实标注



### 12.8 meta 全量校准完成（2026-08，31/31 非 null）

- **维琳娜（最后一个 null）**：双源合成——卡特亚侧（BV1sGEy6mEKe：官方推荐配队引述 + 「至少抽 00 交保护费」共识）82 vs 毕加侧（BV1u8LQ6BEdp：置顶「和想象中有点差别」+ 评论区「真一般吧」）75 → 先验 80（我方综合保守映射），两条观测落库，后验自动折中 ≈78.9
- **星见雅旧占位先验 92 → 88**：2026 评论区衰落冲突（被仪玄碾压/期期压过线）折中
- **艾莲 85 / 朱鸢 80**：历史先验校准值，note 注明「无衰减信号/待现行观测微调」
- **不变量单测**：`test/characters-data.test.js`——31/31 meta 非 null 且值域合法、全员 note 含依据
- 至此数据完备度：meta 31/31、enName 31/31、机制速查 31/31、观测 39 条、Kalman 后验全员接入引擎

