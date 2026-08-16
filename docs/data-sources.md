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
- **机制库 `src/data/mechanics.js`**：12 位角色机制摘要 + 关键技能 + 推荐配队 + 来源逐条标注；`multipliers: null` 表示无带出处的具体倍率（不臆造，UI 引导到 BWIKI 全量倍率表）

