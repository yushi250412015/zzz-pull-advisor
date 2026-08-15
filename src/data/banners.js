// 3.1 版本「漫长的告别」卡池（真实数据）
// phase: current = 上半（进行中）/ second-half = 下半
// selectable + firstGoldGuaranteed：下半自选混池（琉音/浮波柚叶/浅羽悠真），首金必不歪

export const banners = [
  { id: 'b-remielle', version: '3.1', characterId: 'remielle', type: 'character', phase: 'current', note: '上半新角色·流明异常' },
  { id: 'b-aria', version: '3.1', characterId: 'aria', type: 'character', phase: 'current', note: '上半复刻·冰异放主C' },
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
];
