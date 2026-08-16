// 体系定义（占位数据）
// contributions 即「可学习贡献向量 θ」的初始先验：
//   不再硬编码单一灵魂角色；权重高的角色缺失时 F 自然大幅下降，且灵魂角色数量不定（可 0/1/N 个）
// F_min / delta_max / k 为协同增益分段函数参数

export const systems = {
  'ice-attack': {
    id: 'ice-attack',
    label: '冰系强攻',
    F_min: 0.5,
    delta_max: 12,
    k: 6,
    contributions: { ellen: 0.6, lycaon: 0.4 },
  },
  ether: {
    id: 'ether',
    label: '以太体系',
    F_min: 0.5,
    delta_max: 10,
    k: 5,
    contributions: { 'zhu-yuan': 0.7, nicole: 0.3 },
  },
  anomaly: {
    id: 'anomaly',
    label: '异常体系',
    F_min: 0.5,
    delta_max: 10,
    k: 5,
    // 苍角为星见雅最佳队友之一（社区配队「雅狼苍/雅柚苍」）
    contributions: { miyabi: 0.7, grace: 0.3, soukaku: 0.2 },
  },
  // —— 3.x 新体系（先验占位，待社区配队数据校准） ——
  'wind-anomaly': {
    id: 'wind-anomaly',
    label: '风异常（染色）',
    F_min: 0.5,
    delta_max: 10,
    k: 5,
    contributions: { velina: 0.85 },
  },
  'lumiflux-anomaly': {
    id: 'lumiflux-anomaly',
    label: '流明异常（流变）',
    F_min: 0.5,
    delta_max: 12,
    k: 6,
    // 维琳娜为蕾米埃尔专属售后（社区 T0 配队：蕾米埃尔主C+维琳娜风异常副C；来源 data-sources.md）
    contributions: { remielle: 0.85, velina: 0.25 },
  },
  'ice-anomaly': {
    id: 'ice-anomaly',
    label: '冰异常（异放）',
    F_min: 0.5,
    delta_max: 10,
    k: 5,
    // 爱芮已移出：其属性实为以太（BWIKI），入 'ether-anomaly'；「冰属性爱芮」是普罗米娅的社区昵称
    contributions: { promya: 0.7 },
  },
  'ether-anomaly': {
    id: 'ether-anomaly',
    label: '以太异常（异放）',
    F_min: 0.5,
    delta_max: 10,
    k: 5,
    contributions: { aria: 0.8 },
  },
  'physical-attack': {
    id: 'physical-attack',
    label: '物理强攻',
    F_min: 0.5,
    delta_max: 10,
    k: 5,
    contributions: { nekomata: 0.7, pulchra: 0.3 },
  },
  // 2.3 命破体系（社区通解模板：命破C+击破+卢西娅；卢西娅未录入角色库，用其下位替代潘引壶；
  // 来源 data-sources.md）
  rupture: {
    id: 'rupture',
    label: '命破（贯穿）',
    F_min: 0.5,
    delta_max: 10,
    k: 5,
    contributions: { manato: 0.7, 'pan-yinhu': 0.3 },
  },
};
