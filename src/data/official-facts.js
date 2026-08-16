// 官方公告情报快照（3.1，2026-08-16 抓取自官方公告 API：ann_id 1262）
// 更新方式：node scripts/update-banners.mjs 生成 facts 后人工审阅更新本文件（不自动改源码）
// 推断项（如骁骑礼赞归属）显式标注，待官方/权威源核实后升级为 verified

export const officialFacts = {
  fetchedAt: '2026-08-16',
  annId: 1262,
  title: '3.1版本「漫长的告别」更新公告',
  version: { number: '3.1', name: '漫长的告别' },
  window: { start: '2026/07/29', end: '2026/09/09' },
  agents: [
    { name: '蕾米埃尔', element: 'lumiflux', role: 'anomaly', channel: '复乐园', characterId: 'remielle' },
    { name: '希格莉德', element: 'ice', role: 'attack', channel: '直到天空沉落', characterId: 'sigrid' },
  ],
  engines: [
    { name: '空羽复归之诗', role: 'anomaly', channel: '空羽复归之诗', owner: '蕾米埃尔专武（BWIKI 毕业音擎，已验证）' },
    { name: '骁骑礼赞', role: 'attack', channel: '骁骑礼赞', owner: '推断为希格莉德专武（08-19 实装后核实）' },
  ],
  bangboos: [{ name: '艾瑞儿', channel: '卓越搭档', note: '以太 · 达识结社 · 蕾米埃尔阵营（BWIKI）' }],
  // 官方 3.1 公告正文提及的角色（2026-08-16 快照，findCharacterMentions 同口径）
  mentionedCharacters: ['蕾米埃尔', '希格莉德', '爱芮', '普罗米娅', '丽娜', '安比', '比利', '派派', '露西', '本', '真斗', '星见雅'],
};
