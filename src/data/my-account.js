// 我的真实账号状态（uid 25183553）
// 数据来源：绝区零抽卡记录 API（public-operation-nap.mihoyo.com），2026-08-15 解析，共 563 条记录
// 说明：保底 / 50/50 按池独立；resources 供推荐引擎使用的是「独家池」当前状态。

export const myAccount = {
  uid: '25183553',
  analyzedAt: '2026-08-15',
  // box：拥有的全部代理人（7 S + 13 A）
  box: [
    'remielle', 'chinatsu', 'nangong-yu', 'promya', 'velina', 'rina', 'nekomata',
    'anby', 'nicole', 'billy', 'corin', 'piper', 'lucy', 'seth', 'anton', 'ben',
    'soukaku', 'pulchra', 'manato', 'pan-yinhu',
  ],
  // 独家池（限定）当前状态：距上次 S（蕾米埃尔）0 抽，50/50 状态
  limited: {
    pulls: 454,
    pity: 0,
    fails: 0,
    sCount: 6,
    losses: 1, // 猫又（常驻，歪）
    lastS: { name: '蕾米埃尔', time: '2026-07-29 20:12:29' },
  },
  // 常驻池当前状态：距上次 S（丽娜）37 抽
  standard: {
    pulls: 109,
    pity: 37,
    sCount: 1,
    lastS: { name: '丽娜', time: '2026-06-15 17:44:29' },
  },
  // 欧非统计（全账号）
  luck: {
    totalPulls: 563,
    sCount: 7,
    avgPullsPerS: 80.4, // 低于理论期望 62.5 → 偏非
    limitedWinRate: 5 / 6, // 独家池 6 次 S 中 5 次 UP（唯一歪：猫又）
  },
};
