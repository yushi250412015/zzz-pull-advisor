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

## 3. meta 强度分校准（2026-08，Prydwen ZZZ tier list）

- **来源**：Prydwen ZZZ tier list <https://www.prydwen.gg/zenless/tier-list>（子代理 2026-08 抓取；T0/T0.5/T1/T2/T3 体系）
- **换算规则（本项目的保守映射，非站点原值）**：T0=90 / T0.5=82 / T1=72 / T2=62 / T3=50
- **已校准**（规则直取）：千夏 T0→90、爱芮 T0→90、琉音 T0→90、浮波柚叶 T0→90、南宫羽 T0→90、普罗米娅 T0.5→82、妮可 T0.5→82、浅羽悠真 T1→72、苍角 T1→72、真斗 T1→72、潘引壶 T1→72、莱卡恩 T1→72、11号 T1→72、猫又 T2→62、格莉丝 T2→62、波可娜 T2→62、安比 T3→50、赛斯 T3→50
- **例外 / 冲突（已在 characters.js note 注明）**：
  - 丽娜 T2→再下调 50：2.6 支援榜垫底（TOP8，「buff 覆盖率极低、手感差、坐等增强」），来源 <https://news.17173.com/content/02192026/094402613.shtml>
  - 露西 T2→再下调 52：同榜 TOP7「数值相对其他支援偏低」
  - 派派 60（取中）：Prydwen T1 vs 17173 A级盘点（2026-01）「数值太低不推荐」<https://news.17173.com/content/01262026/043348358.shtml>
- **Prydwen 未收录 → 用 9game 保守取值**：蕾米埃尔 90（「T0 配队」「未来很长一段时间异常体系最强阵容之一」<https://a.9game.cn/juequling/11957058.html>）、希格莉德 82（「冰系主C，0+1 成型，无刚需命座」<https://www.9game.cn/juequling/12001531.html>）、维琳娜保持 null（未评级）
- **仍未校准**：南宫羽/普罗米娅以外无来源的角色 meta 保持 null 或原占位先验（艾莲/朱鸢/星见雅 85/80/92 为旧占位先验，未在本轮校准）

## 4. 体系贡献校准（systems.js，2026-08）

- lumiflux-anomaly +维琳娜 0.25：社区 T0 配队「蕾米埃尔主C+维琳娜风异常副C」（9game 同上）
- 新增 rupture（命破）体系 {真斗 0.7, 潘引壶 0.3}：社区通解「命破C+击破+卢西娅（潘引壶为下位替代）」（3dmgame/17173）
- ice-anomaly 移出爱芮（以太），仅留普罗米娅 0.7；新增 ether-anomaly {爱芮 0.8}
- anomaly +苍角 0.2：社区配队「雅狼苍 / 雅柚苍」（17173 同上）

## 5. Wiki 链接约定

- BWIKI 角色页直链已实测 200：`https://wiki.biligame.com/zzz/<角色中文名>`（URL 编码后），由 `buildWikiUrl` 生成。
- 官方社区工具（公告正文 307 条）：米游社 / HoYoWiki（baike.mihoyo.com/zzz）/ 官方小程序。
