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
    contributions: { miyabi: 0.7, grace: 0.3 },
  },
};
