// 音擎 / 邦布数据（3.1「漫长的告别」，2026-08 官方公告 + BWIKI 实测核实）
// pairing: verified = 已实测配对（BWIKI 毕业音擎）；inferred = 推断（标注原因，待实装后核实）
// 不臆造：官方概率数据（邦布池、音擎软保底 66）仍待官方来源，代码中显式标注

export const weapons = {
  'kongyu-fuguizhishi': {
    id: 'kongyu-fuguizhishi',
    name: '空羽复归之诗',
    rarity: 'S',
    role: 'anomaly',
    ownerId: 'remielle',
    pairing: 'verified',
    note: '蕾米埃尔毕业音擎（BWIKI 音擎推荐实测）；官方公告 3.1「空羽复归之诗」频段',
  },
  'xiaoqi-lizan': {
    id: 'xiaoqi-lizan',
    name: '骁骑礼赞',
    rarity: 'S',
    role: 'attack',
    ownerId: 'sigrid',
    pairing: 'inferred',
    note: '官方公告 3.1「骁骑礼赞」频段（强攻 S 音擎）；按定位推断为希格莉德专武，BWIKI 页面尚未建（08-19 实装后核实）',
  },
};

export const bangboos = {
  airuier: {
    id: 'airuier',
    name: '艾瑞儿',
    rarity: 'S',
    element: 'ether',
    version: '3.1',
    companionId: 'remielle',
    note: '官方公告 3.1 全新 S 邦布「卓越搭档」频段；BWIKI：伤害属性以太、阵营达识结社、阵营代理人蕾米埃尔',
  },
};
