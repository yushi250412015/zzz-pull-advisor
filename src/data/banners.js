// 3.1 版本「漫长的告别」卡池（真实数据）
// phase: current = 上半（进行中）/ second-half = 下半
// selectable + firstGoldGuaranteed：下半自选混池（琉音/浮波柚叶/浅羽悠真），首金必不歪

export const banners = [
  { id: 'b-remielle', version: '3.1', characterId: 'remielle', type: 'character', phase: 'current', note: '上半新角色·流明异常' },
  { id: 'b-aria', version: '3.1', characterId: 'aria', type: 'character', phase: 'current', note: '上半复刻·以太异放主C' },
  { id: 'b-sigrid', version: '3.1', characterId: 'sigrid', type: 'character', phase: 'second-half', note: '下半新角色·冰强攻' },
  {
    id: 'b-mixed',
    version: '3.1',
    type: 'character',
    phase: 'second-half',
    selectable: ['rinna', 'yuzuha', 'harumasa'],
    firstGoldGuaranteed: true,
    note: '下半自选混池·首金必不歪',
  },
  // —— 音擎 / 邦布（type 区分；配对与情报见 equipment.js 注释） ——
  {
    id: 'w-kongyu',
    version: '3.1',
    type: 'weapon',
    weaponId: 'kongyu-fuguizhishi',
    phase: 'current',
    note: '上半·蕾米埃尔专武（空羽复归之诗，已验证）',
  },
  {
    id: 'w-xiaoqi',
    version: '3.1',
    type: 'weapon',
    weaponId: 'xiaoqi-lizan',
    phase: 'second-half',
    note: '下半·推断为希格莉德专武（骁骑礼赞，待 08-19 实装核实）',
  },
  {
    id: 'b-airuier',
    version: '3.1',
    type: 'bangboo',
    bangbooId: 'airuier',
    phase: 'current',
    note: '3.1 新 S 邦布·以太·蕾米埃尔阵营',
  },
];
