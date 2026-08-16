// 我的真实账号状态（uid 25183553）
// 数据来源：绝区零抽卡记录 API（public-operation-nap.mihoyo.com），2026-08-15 解析，共 1168 条记录（4 个池）
// 注意：官方 API 仅保留最近约 6 个月（本账号最早可追溯 2026-02-10），更早记录不可获取
// 说明：保底 / 50/50 按池独立；resources 供推荐引擎使用的是「独家池」当前状态。

export const myAccount = {
  uid: '25183553',
  analyzedAt: '2026-08-15',
  // box：拥有的全部代理人（7 S + 13 A，来自常驻/独家角色池）
  box: [
    'remielle', 'chinatsu', 'nangong-yu', 'promya', 'velina', 'rina', 'nekomata',
    'anby', 'nicole', 'billy', 'corin', 'piper', 'lucy', 'seth', 'anton', 'ben',
    'soukaku', 'pulchra', 'manato', 'pan-yinhu',
  ],
  // 独家池（限定角色）当前状态：距上次 S（蕾米埃尔）0 抽，50/50 状态
  limited: {
    pulls: 454,
    pity: 0,
    fails: 0,
    sCount: 6,
    losses: 1, // 猫又（常驻，歪）
    lastS: { name: '蕾米埃尔', time: '2026-07-29 20:12:29' },
    // S 级历史（时间序，均为 2026 年；猫又为 50/50 歪出的常驻）
    sList: [
      { name: '千夏', date: '03-01' },
      { name: '南宫羽', date: '03-24' },
      { name: '普罗米娅', date: '05-06' },
      { name: '猫又', date: '06-17', lost: true },
      { name: '维琳娜', date: '07-04' },
      { name: '蕾米埃尔', date: '07-29' },
    ],
  },
  // 常驻角色池当前状态：距上次 S（丽娜）37 抽
  standard: {
    pulls: 109,
    pity: 37,
    sCount: 1,
    lastS: { name: '丽娜', time: '2026-06-15 17:44:29' },
    sList: [{ name: '丽娜', date: '06-15' }],
  },
  // 音擎池：3 把 S 音擎，距上次 S（啜泣摇篮）10 抽
  weapon: {
    pulls: 189,
    pity: 10,
    sCount: 3,
    sList: [
      { name: '霓虹妄想', date: '04-08' },
      { name: '琳琅鎏心', date: '07-04' },
      { name: '啜泣摇篮', date: '08-06' },
    ],
    lastS: { name: '啜泣摇篮', time: '2026-08-06 22:48:28' },
  },
  // 邦布池：8 只 S 邦布，最近一只艾瑞儿（08-10）
  bangboo: {
    pulls: 416,
    pity: 0,
    sCount: 8,
    sList: [
      { name: '阿饭', count: 3 },
      { name: '狮耶' },
      { name: '罗宾' },
      { name: '超极杰克', count: 2 },
      { name: '艾瑞儿', date: '08-10' },
    ],
    lastS: { name: '艾瑞儿', time: '2026-08-10 10:52:21' },
  },
  // 欧非统计（全账号）
  luck: {
    totalPulls: 1168,
    agentPulls: 563, // 常驻 109 + 独家 454
    agentSCount: 7,
    avgPullsPerAgentS: 80.4, // 低于理论期望 62.5 → 偏非
    limitedWinRate: 5 / 6, // 独家池 6 次 S 中 5 次 UP（唯一歪：猫又）
  },
};
