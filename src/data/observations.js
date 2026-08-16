// 强度观测序列（Kalman 观测源，2026-08 起步）
// 选源原则（用户指定）：优先「数据实测型、结论不绝对」的博主（如卡特亚、毕加丶），
//   避免营销号/纯节奏号；问句式标题（如「真实强度如何？」）是严谨性的信号，属优质源。
// 观测源分级（trust = 0-1 可信度权重，用于测量噪声 R = base/weight²）：
//   katya（卡特亚 B站视频/图文，主频道 mid 43222001，切片频道 470042408）
//   bijia（毕加丶，数据实测型，mid 25978510）
//   mengxuan（梦轩dada，mid 27500557）
//   prydwen（社区 tier 榜，2026-08 抓取）
//   blogger（权威博主文章：游侠网/17173/9game/niubi 等，来源见 docs/data-sources.md）
// 每条观测：{ characterId, value(0-100), weight(0-1), source, date, note }
// 数值换算规则见 data-sources.md §3（T0=90 / T0.5=82 / T1=72 / T2=62 / T3=50）
// 标题级强正面结论映射规则（视频文本不可读时的保守做法，见 data-sources.md §12）：
//   value = min(该角色现有共识 meta + 3, 92)，并在 note 注明「我方映射，非视频原值」

export const observationSources = {
  // 卡特亚主频道 mid 43222001（另有切片频道「卡特亚仿身泪滴」mid 470042408）
  katya: { label: '卡特亚（B站视频/图文，mid 43222001）', trust: 0.9 },
  // 毕加丶（数据实测型，如「实测21支队伍！真实强度如何？」，mid 25978510）
  bijia: { label: '毕加丶（B站实测向测评，mid 25978510）', trust: 0.85 },
  // 梦轩dada（B站 ZZZ 攻略/测评，mid 27500557）
  mengxuan: { label: '梦轩dada（B站视频，mid 27500557）', trust: 0.7 },
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
  // —— 卡特亚观测（2026-08-14 视频，BV1ZPgA6YEwa）——
  // 说明：该视频简介/字幕为空、评论需登录、AI 总结需登录 → 视频内具体数值（倍率/影画幅度/专武对比）
  //       当前不可程序化读取；本条目为「标题级强正面结论」的保守映射（现有共识 82 + 3 = 85，非视频原值）。
  //       获得视频内具体结论后，请替换/追加为真实数值观测（data-sources.md §12.1）。
  { characterId: 'sigrid', value: 85, weight: 0.9, source: 'katya', date: '2026-08-14', note: 'BV1ZPgA6YEwa《希格莉德综合测评：超级力量！》标题强正面结论；数值 85 为我方保守映射（非视频原值），待补视频内具体结论' },
  // —— 蕾米埃尔观测（2026-07-24 视频，自动发现）——
  { characterId: 'remielle', value: 92, weight: 0.9, source: 'katya', date: '2026-07-24', note: 'BV1fGga6SE9F《蕾米埃尔丹综合测评：圣光级虚狩！…数值正是为王的理由！》标题强正面（191.9 万播放）；92=min(共识90+3,92) 我方保守映射（非视频原值）' },
  // —— 自动发现批次（2026-08 图爬取；仅标题含明确强度结论词才落库）——
  { characterId: 'chinatsu', value: 92, weight: 0.9, source: 'katya', date: '2026-02-02', note: 'BV1yPFPzKESn《妄想天使千夏综合测评：有力气的偶像！高速以太帷幕！》标题强正面；92=min(共识90+3,92) 我方保守映射（非视频原值）' },
  { characterId: 'miyabi', value: 92, weight: 0.9, source: 'katya', date: '2024-12-15', note: 'BV1r5q9YXECT《星见雅综合测评：超强大范围输出》标题强正面；92=min(先验92+3,92) 我方保守映射（非视频原值）' },
  { characterId: 'zhu-yuan', value: 83, weight: 0.9, source: 'katya', date: '2024-07-23', note: 'BV1tS42197rb《朱鸢综合测评：…爆发天花板以太大C》标题强正面；83=min(先验80+3,92) 我方保守映射（非视频原值）' },
  // —— 爱芮观测（2026-02/03 视频，两源交叉）——
  { characterId: 'aria', value: 92, weight: 0.9, source: 'katya', date: '2026-02-27', note: 'BV1opAmzXEoD《爱芮综合测评：屁股有劲！》标题强正面；92=min(共识90+3,92) 我方保守映射（非视频原值）' },
  { characterId: 'aria', value: 92, weight: 0.7, source: 'mengxuan', date: '2026-03-04', note: 'BV1URPNzREDf《爱芮终极指南：以太异常主C的荣耀》标题强正面，并确认「以太异常主C」定位（与项目数据一致）；92 为我方保守映射（非视频原值）' },
];
