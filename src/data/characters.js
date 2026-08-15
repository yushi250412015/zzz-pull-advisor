// 角色数据（截至 3.1「漫长的告别」，按 2026-08 官方/社区资料核实）
// rarity: S/A
// element: fire/ice/electric/physical/ether/wind(3.0)/lumiflux(3.1 流明)；null = 待核实
// role: attack/anomaly/stun/support/defense；null = 待核实
// standard: true = 常驻 S 级（限定池 50/50 歪池）
// meta: 强度分 0-100（占位先验，待社区数据校准；null = 未知，不参与比较）

export const characters = {
  // —— 3.1 卡池角色 ——
  remielle: { id: 'remielle', name: '蕾米埃尔', rarity: 'S', element: 'lumiflux', role: 'anomaly', meta: null, note: '3.1 新·流明异常，初代虚狩；流变机制（随下位上场代理人切换伤害属性）' },
  sigrid: { id: 'sigrid', name: '希格莉德', rarity: 'S', element: 'ice', role: 'attack', meta: null, note: '3.1 下半新·冰强攻' },
  aria: { id: 'aria', name: '爱芮', rarity: 'S', element: 'ice', role: 'anomaly', meta: null, note: '2.6 冰·异放主C，3.1 上半复刻' },
  rinna: { id: 'rinna', name: '琉音', rarity: 'S', element: 'physical', role: 'stun', meta: null, note: '3.1 下半自选混池' },
  yuzuha: { id: 'yuzuha', name: '浮波柚叶', rarity: 'S', element: 'physical', role: 'support', meta: null, note: '3.1 下半自选混池' },
  harumasa: { id: 'harumasa', name: '浅羽悠真', rarity: 'S', element: 'electric', role: 'attack', meta: null, note: '3.1 下半自选混池' },

  // —— 用户 box：S 级（2026-08-15 抽卡记录解析，uid 25183553） ——
  chinatsu: { id: 'chinatsu', name: '千夏', rarity: 'S', element: null, role: 'support', meta: null, note: '2.6 妄想天使·泛用辅助；元素待核实' },
  'nangong-yu': { id: 'nangong-yu', name: '南宫羽', rarity: 'S', element: 'ether', role: 'stun', meta: null, note: '2.7 以太击破' },
  promya: { id: 'promya', name: '普罗米娅', rarity: 'S', element: 'ice', role: 'anomaly', meta: null, note: '2.8 冰异常·异放体系核心' },
  velina: { id: 'velina', name: '维琳娜', rarity: 'S', element: 'wind', role: 'anomaly', meta: null, note: '3.0 风异常·染色机制' },
  rina: { id: 'rina', name: '丽娜', rarity: 'S', element: 'electric', role: 'support', standard: true, meta: 65 },
  nekomata: { id: 'nekomata', name: '猫又', rarity: 'S', element: 'physical', role: 'attack', standard: true, meta: 60 },

  // —— 用户 box：A 级 ——
  anby: { id: 'anby', name: '安比', rarity: 'A', element: 'electric', role: 'stun', meta: 55 },
  nicole: { id: 'nicole', name: '妮可', rarity: 'A', element: 'ether', role: 'support', meta: 60 },
  billy: { id: 'billy', name: '比利', rarity: 'A', element: 'physical', role: 'attack', meta: 50 },
  corin: { id: 'corin', name: '可琳', rarity: 'A', element: 'physical', role: 'attack', meta: 52 },
  piper: { id: 'piper', name: '派派', rarity: 'A', element: 'physical', role: 'anomaly', meta: 55 },
  lucy: { id: 'lucy', name: '露西', rarity: 'A', element: 'fire', role: 'support', meta: 58 },
  seth: { id: 'seth', name: '赛斯', rarity: 'A', element: 'electric', role: 'defense', meta: 54 },
  anton: { id: 'anton', name: '安东', rarity: 'A', element: 'electric', role: 'attack', meta: 53 },
  ben: { id: 'ben', name: '本', rarity: 'A', element: 'fire', role: 'defense', meta: 52 },
  soukaku: { id: 'soukaku', name: '苍角', rarity: 'A', element: 'ice', role: 'support', meta: 57 },
  pulchra: { id: 'pulchra', name: '波可娜', rarity: 'A', element: 'physical', role: 'stun', meta: 53 },
  manato: { id: 'manato', name: '真斗', rarity: 'A', element: null, role: null, meta: null, note: '2.3 狛野真斗；属性/定位待核实' },
  'pan-yinhu': { id: 'pan-yinhu', name: '潘引壶', rarity: 'A', element: null, role: null, meta: null, note: '2.0 新 A 级；属性/定位待核实' },

  // —— 其他常驻 S（50/50 歪池参考） ——
  lycaon: { id: 'lycaon', name: '莱卡恩', rarity: 'S', element: 'ice', role: 'stun', standard: true, meta: 70 },
  grace: { id: 'grace', name: '格莉丝', rarity: 'S', element: 'electric', role: 'anomaly', standard: true, meta: 65 },
  'soldier-11': { id: 'soldier-11', name: '11号', rarity: 'S', element: 'fire', role: 'attack', standard: true, meta: 66 },

  // —— 常用限定 S（占位，meta 待校准） ——
  ellen: { id: 'ellen', name: '艾莲', rarity: 'S', element: 'ice', role: 'attack', meta: 85 },
  'zhu-yuan': { id: 'zhu-yuan', name: '朱鸢', rarity: 'S', element: 'ether', role: 'attack', meta: 80 },
  miyabi: { id: 'miyabi', name: '星见雅', rarity: 'S', element: 'ice', role: 'anomaly', meta: 92 },
};

// 常驻 S 级代理人名集合（限定池 50/50 歪池；含以后新增常驻时在此维护）
export const standardS = new Set(
  Object.values(characters)
    .filter((c) => c.standard && c.rarity === 'S')
    .map((c) => c.name),
);
