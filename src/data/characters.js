// 角色数据（截至 3.1「漫长的告别」，按 2026-08 官方/社区资料核实）
// rarity: S/A
// enName: 英文名（官方/Prydwen/社区多源口径，来源见 docs/data-sources.md）
// element: fire/ice/electric/physical/ether/wind(3.0)/lumiflux(3.1 流明)；null = 待核实
// role: attack/anomaly/stun/support/defense/rupture(命破,2.3)；null = 待核实
// standard: true = 常驻 S 级（限定池 50/50 歪池）
// meta: 强度分 0-100。**2026-08 全量校准完成（31/31 非 null）**：
//   Prydwen tier 换算（T0=90 / T0.5=82 / T1=72 / T2=62 / T3=50）+ 观测源后验折中；
//   维琳娜=双源综合保守映射（80）；艾莲/朱鸢=历史先验校准值；星见雅=冲突观测折中（88）；
//   每条依据见各角色 note 与 docs/data-sources.md；引擎实际使用 Kalman 后验（可信度面板同口径）

export const characters = {
  // —— 3.1 卡池角色 ——
  remielle: { id: 'remielle', name: '蕾米埃尔', enName: 'Remielle Dan', rarity: 'S', element: 'lumiflux', role: 'anomaly', meta: 90, note: '3.1 新·流明异常，初代虚狩；流变机制（随下位上场代理人切换伤害属性）；T0 配队核心（9game；Prydwen 未收录）' },
  sigrid: { id: 'sigrid', name: '希格莉德', enName: "Sigrid de L'Azur", rarity: 'S', element: 'ice', role: 'attack', meta: 82, note: '3.1 下半新·冰强攻·站场主C；【骑士专注】+三段蓄力+【敛枪式】爆发；0+1 成型、M0 机制完整（游侠网/niubi.wiki/9game；Prydwen 未收录）；完整倍率表已补全（GachaBase 测试服 datamined：普攻 77~221%、敛枪式三段 358~815%、强化特殊技 1047.8%、终结技 2189.8%，详见 data-sources.md §13；实装 08-19 前须复核）' },
  aria: { id: 'aria', name: '爱芮', enName: 'Aria', rarity: 'S', element: 'ether', role: 'anomaly', meta: 90, note: '2.6 以太·异放主C（Prydwen T0），3.1 上半复刻；注意「冰属性爱芮」是 2.8 普罗米娅的社区昵称，爱芮本人为以太' },
  rinna: { id: 'rinna', name: '琉音', enName: 'Dialyn', rarity: 'S', element: 'physical', role: 'stun', meta: 90, note: '3.1 下半自选混池；物理击破辅助「赠送大招」、强攻/命破队辅助，排轴要求高（Prydwen T0；9game；卡特亚 BV1FvyMBqEmX）' },
  yuzuha: { id: 'yuzuha', name: '浮波柚叶', enName: 'Ukinami Yuzuha', rarity: 'S', element: 'physical', role: 'support', meta: 90, note: '3.1 下半自选混池；2.1 物理支援·异常体系专辅（Prydwen T0）' },
  harumasa: { id: 'harumasa', name: '浅羽悠真', enName: 'Asaba Harumasa', rarity: 'S', element: 'electric', role: 'attack', meta: 72, note: '3.1 下半自选混池；1.4 电强攻（Prydwen T1）' },

  // —— S 级常驻/复刻角色（box 由用户账号同步自动勾选，此处仅为全角色库） ——
  chinatsu: { id: 'chinatsu', name: '千夏', enName: 'Sunna', rarity: 'S', element: 'physical', role: 'support', meta: 90, note: '2.6 限定·物理支援，妄想天使组合（Prydwen T0；2.6 支援榜 TOP2）' },
  'nangong-yu': { id: 'nangong-yu', name: '南宫羽', enName: 'Nangong Yu', rarity: 'S', element: 'ether', role: 'stun', meta: 90, note: '2.7 以太击破（Prydwen T0）' },
  promya: { id: 'promya', name: '普罗米娅', enName: 'Promeia', rarity: 'S', element: 'ice', role: 'anomaly', meta: 82, note: '2.8 冰异常·异放体系核心，社区昵称「冰属性爱芮」（Prydwen T0.5）' },
  velina: { id: 'velina', name: '维琳娜', enName: 'Velina Airgid', rarity: 'S', element: 'wind', role: 'anomaly', meta: 80, note: '3.0 风异常·染色机制；蕾米埃尔官方搭档（T0 槽位），单独强度「一般」（毕加+卡特亚评论区）→ 80 为双源综合保守映射（2026-06），详见 data-sources.md §12.8' },
  rina: { id: 'rina', name: '丽娜', enName: 'Rina', rarity: 'S', element: 'electric', role: 'support', standard: true, meta: 50, note: 'Prydwen T2 再下调：2.6 支援榜垫底（TOP8），buff 覆盖率低、手感差，坐等增强' },
  nekomata: { id: 'nekomata', name: '猫又', enName: 'Nekomata', rarity: 'S', element: 'physical', role: 'attack', standard: true, meta: 62, note: 'Prydwen T2；3.1 加强后「最强物理强攻」（毕加评论区共识，2026-07）' },

  // —— 用户 box：A 级 ——
  anby: { id: 'anby', name: '安比', enName: 'Anby', rarity: 'A', element: 'electric', role: 'stun', meta: 50, note: 'Prydwen T3' },
  nicole: { id: 'nicole', name: '妮可', enName: 'Nicole', rarity: 'A', element: 'ether', role: 'support', meta: 82, note: 'Prydwen T0.5；A级必练榜首、「S辅助守门员」（2.6 支援榜 TOP5）' },
  billy: { id: 'billy', name: '比利', enName: 'Billy', rarity: 'A', element: 'physical', role: 'attack', meta: 50, note: '开服 A 级远程输出（卡特亚 A级测评）；meta 为开服口径先验' },
  corin: { id: 'corin', name: '可琳', enName: 'Corin', rarity: 'A', element: 'physical', role: 'attack', meta: 52, note: '开服 A 级电锯输出（卡特亚 A级测评）；meta 为开服口径先验' },
  piper: { id: 'piper', name: '派派', enName: 'Piper', rarity: 'A', element: 'physical', role: 'anomaly', meta: 60, note: '冲突取中：Prydwen T1 vs 17173（2026-01）「数值太低不推荐」' },
  lucy: { id: 'lucy', name: '露西', enName: 'Lucy', rarity: 'A', element: 'fire', role: 'support', meta: 52, note: 'Prydwen T2 再下调：2.6 支援榜 TOP7，数值偏低' },
  seth: { id: 'seth', name: '赛斯', enName: 'Seth', rarity: 'A', element: 'electric', role: 'defense', meta: 50, note: 'Prydwen T3；开服 A 级电防护（资料较少）' },
  anton: { id: 'anton', name: '安东', enName: 'Anton', rarity: 'A', element: 'electric', role: 'attack', meta: 53, note: '开服首个 UP A 级（卡特亚置顶）；meta 为开服口径先验' },
  ben: { id: 'ben', name: '本', enName: 'Ben', rarity: 'A', element: 'fire', role: 'defense', meta: 52, note: '开服 A 级火防护（与社长组合技招牌）；meta 为开服口径先验' },
  soukaku: { id: 'soukaku', name: '苍角', enName: 'Soukaku', rarity: 'A', element: 'ice', role: 'support', meta: 72, note: 'Prydwen T1；星见雅最佳队友之一（雅狼苍/雅柚苍）' },
  pulchra: { id: 'pulchra', name: '波可娜', enName: 'Pulchra Fellini', rarity: 'A', element: 'physical', role: 'stun', meta: 62, note: 'Prydwen T2' },
  manato: { id: 'manato', name: '真斗', enName: 'Komano Manato', rarity: 'A', element: 'fire', role: 'rupture', meta: 72, note: '2.3 常驻·火命破（狛野真斗/Komano Manato，长轴站场C，贯穿力无视防御；Prydwen T1）' },
  'pan-yinhu': { id: 'pan-yinhu', name: '潘引壶', enName: 'Pan Yinhu', rarity: 'A', element: 'physical', role: 'defense', meta: 72, note: '2.0 常驻·物理防护（熊猫希人）；命破辅助、卢西娅下位替代（Prydwen T1）' },

  // —— 其他常驻 S（50/50 歪池参考） ——
  lycaon: { id: 'lycaon', name: '莱卡恩', enName: 'Lycaon', rarity: 'S', element: 'ice', role: 'stun', standard: true, meta: 72, note: 'Prydwen T1；公测加减冰抗 25，常驻S自选优先级第一（毕加评论区共识）' },
  grace: { id: 'grace', name: '格莉丝', enName: 'Grace', rarity: 'S', element: 'electric', role: 'anomaly', standard: true, meta: 62, note: 'Prydwen T2；开服唯一五星异常、手雷流（卡特亚置顶）' },
  'soldier-11': { id: 'soldier-11', name: '11号', enName: 'Soldier 11', rarity: 'S', element: 'fire', role: 'attack', standard: true, meta: 72, note: 'Prydwen T1；公测加强明显但「目押」操作门槛高（卡特亚置顶/评论区）' },

  // —— 常用限定 S（占位，meta 待校准） ——
  ellen: { id: 'ellen', name: '艾莲', enName: 'Ellen Joe', rarity: 'S', element: 'ice', role: 'attack', meta: 85, note: '1.0 开服限定·冰强攻蓄力主C；开服「最强」、2.0 加强（卡特亚 BV1U57czCEKV）；85 = 历史先验校准值（无衰减信号，待现行观测微调）' },
  'zhu-yuan': { id: 'zhu-yuan', name: '朱鸢', enName: 'Zhu Yuan', rarity: 'S', element: 'ether', role: 'attack', meta: 80, note: '1.0 开服限定·以太强攻；失衡期爆发天花板、支援触发百搭（2024 评价）；80 = 历史先验校准值（待现行观测微调）' },
  miyabi: { id: 'miyabi', name: '星见雅', enName: 'Hoshimi Miyabi', rarity: 'S', element: 'ice', role: 'anomaly', meta: 88, note: '1.0 开服「超模」先验 92，2026 评论区衰落冲突（被仪玄碾压/期期压线）→ 校准为 88（观测折中，见 data-sources.md）' },
};

// 常驻 S 级代理人名集合（限定池 50/50 歪池；含以后新增常驻时在此维护）
export const standardS = new Set(
  Object.values(characters)
    .filter((c) => c.standard && c.rarity === 'S')
    .map((c) => c.name),
);
