// 强度观测序列（Kalman 观测源，2026-08 起步）
// 观测源分级（trust = 0-1 可信度权重，用于测量噪声 R = base/weight²）：
//   katya（卡特亚 B站视频/图文，mid 470042408）——用户指定的一等可信观测源；
//        当前网络受限（B站列表/搜索 API 风控 -352/-799、RSSHub 不可用），其视频文本待补入；
//        通道已就绪：单视频 view API 实测可用（api.bilibili.com/x/web-interface/view?bvid=...）
//   prydwen（社区 tier 榜，2026-08 抓取）
//   blogger（权威博主文章：游侠网/17173/9game/niubi 等，来源见 docs/data-sources.md）
// 每条观测：{ characterId, value(0-100), weight(0-1), source, date, note }
// 数值换算规则见 data-sources.md §3（T0=90 / T0.5=82 / T1=72 / T2=62 / T3=50）

export const observationSources = {
  katya: { label: '卡特亚（B站视频/图文）', trust: 0.9 },
  prydwen: { label: 'Prydwen tier list', trust: 0.8 },
  blogger: { label: '权威博主文章（游侠网/17173/9game 等）', trust: 0.6 },
};

export const observations = [
  // 3.1 角色
  { characterId: 'remielle', value: 90, weight: 0.6, source: 'blogger', date: '2026-08', note: '9game「T0 配队」「异常体系最强阵容之一」（Prydwen 未收录）' },
  { characterId: 'sigrid', value: 82, weight: 0.6, source: 'blogger', date: '2026-08', note: '游侠网/9game/niubi：0+1 成型、一线梯队、M0 机制完整（Prydwen 未收录）' },
  { characterId: 'aria', value: 90, weight: 0.8, source: 'prydwen', date: '2026-08', note: 'T0' },
  { characterId: 'rinna', value: 90, weight: 0.8, source: 'prydwen', date: '2026-08', note: 'T0；9game「物理队效率型辅助天花板」' },
  { characterId: 'yuzuha', value: 90, weight: 0.8, source: 'prydwen', date: '2026-08', note: 'T0；17173 支援榜 TOP4' },
  { characterId: 'harumasa', value: 72, weight: 0.8, source: 'prydwen', date: '2026-08', note: 'T1' },
  // 用户 box S
  { characterId: 'chinatsu', value: 90, weight: 0.8, source: 'prydwen', date: '2026-08', note: 'T0；17173 支援榜 TOP2' },
  { characterId: 'nangong-yu', value: 90, weight: 0.8, source: 'prydwen', date: '2026-08', note: 'T0' },
  { characterId: 'promya', value: 82, weight: 0.8, source: 'prydwen', date: '2026-08', note: 'T0.5' },
  { characterId: 'rina', value: 62, weight: 0.8, source: 'prydwen', date: '2026-08', note: 'T2' },
  { characterId: 'rina', value: 48, weight: 0.6, source: 'blogger', date: '2026-08', note: '17173 支援榜垫底 TOP8（冲突观测，与 Prydwen T2 融合）' },
  { characterId: 'nekomata', value: 62, weight: 0.8, source: 'prydwen', date: '2026-08', note: 'T2' },
  // A 级代表
  { characterId: 'nicole', value: 82, weight: 0.8, source: 'prydwen', date: '2026-08', note: 'T0.5；17173「A级真神」「S辅助守门员」' },
  { characterId: 'soukaku', value: 72, weight: 0.8, source: 'prydwen', date: '2026-08', note: 'T1；雅最佳队友之一' },
  { characterId: 'manato', value: 72, weight: 0.8, source: 'prydwen', date: '2026-08', note: 'T1；17173 推荐命破 C 位' },
  { characterId: 'pan-yinhu', value: 72, weight: 0.8, source: 'prydwen', date: '2026-08', note: 'T1；卢西娅下位替代' },
  { characterId: 'piper', value: 72, weight: 0.8, source: 'prydwen', date: '2026-08', note: 'T1' },
  { characterId: 'piper', value: 48, weight: 0.6, source: 'blogger', date: '2026-08', note: '17173 A级盘点「数值太低不推荐」（冲突观测）' },
  { characterId: 'lucy', value: 62, weight: 0.8, source: 'prydwen', date: '2026-08', note: 'T2' },
  { characterId: 'lucy', value: 48, weight: 0.6, source: 'blogger', date: '2026-08', note: '17173 支援榜 TOP7「数值偏低」（冲突观测）' },
  { characterId: 'pulchra', value: 62, weight: 0.8, source: 'prydwen', date: '2026-08', note: 'T2' },
  { characterId: 'anby', value: 50, weight: 0.8, source: 'prydwen', date: '2026-08', note: 'T3' },
  { characterId: 'seth', value: 50, weight: 0.8, source: 'prydwen', date: '2026-08', note: 'T3' },
  // 常驻 S 其余
  { characterId: 'lycaon', value: 72, weight: 0.8, source: 'prydwen', date: '2026-08', note: 'T1' },
  { characterId: 'grace', value: 62, weight: 0.8, source: 'prydwen', date: '2026-08', note: 'T2' },
  { characterId: 'soldier-11', value: 72, weight: 0.8, source: 'prydwen', date: '2026-08', note: 'T1' },
  // —— 卡特亚观测示例（占位注释；待其视频文本补入后替换为真实条目）——
  // { characterId: 'sigrid', value: 84, weight: 0.9, source: 'katya', date: '2026-08-1x', note: '视频实测评价（待补入具体出处/BV 号）' },
];
