// 抽卡记录 → 账号状态汇总（纯函数，与 IO 无关）
//
// ZZZ 语义（与 core/gacha/parse.js 一致，经真实账号记录核实）：
// 1. rank_type：'4'=S / '3'=A / '2'=B（与 Genshin/HSR 的 5/4/3 不同）
// 2. 记录内 gacha_type 是 API 内部编码：1=常驻 2=独家 3=音擎 5=邦布
//    （请求参数才是 1001/2001/3001/5001）
// 3. 保底 / 50-50 按池独立；「歪」只对限定池有意义（fails 仅在限定池消费）
// 4. box 只收「代理人」记录（音擎、邦布均不入 box）
// 5. 排序：time 相同（实测一次十连的记录时间戳完全相同）时用 id 后缀打破平局

/** 记录内 gacha_type（1/2/3/5）→ 池名 */
export const INTERNAL_POOL_TYPES = {
  1: 'standard',
  2: 'limited',
  3: 'weapon',
  5: 'bangboo',
};

/** 按记录内 gacha_type（1/2/3/5）分组 */
export function groupRecordsByType(records) {
  const out = { 1: [], 2: [], 3: [], 5: [] };
  for (const rec of records) {
    const key = String(rec.gacha_type);
    if (out[key]) out[key].push(rec);
  }
  return out;
}

/**
 * 逐池汇总（输入任意顺序，内部按 time 排序）。
 * 返回 {pulls, pity, fails, sCount, losses, sList, lastS}：
 *  - pity：距最近一次 S 的非 S 抽数（其后无 S 则持续累计）
 *  - fails：连续歪次数（命中 standardSet 的 S 计歪；非限定池该值无意义）
 *  - sList：S 级历史（时间序）[{name, time, lost}]
 */
export function summarizePool(records, standardSet, options = {}) {
  const sRankType = options.sRankType ?? '4';
  const sorted = [...records].sort((a, b) => {
    const t = String(a.time || '').localeCompare(String(b.time || ''));
    if (t !== 0) return t;
    // 实测：一次十连的记录 time 完全相同，id 后缀才是批内真实先后顺序
    return String(a.id || '').localeCompare(String(b.id || ''));
  });
  const sList = [];
  let fails = 0;
  let losses = 0;
  let pity = 0;
  for (const rec of sorted) {
    if (rec.rank_type === sRankType) {
      const lost = standardSet.has(rec.name);
      fails = lost ? fails + 1 : 0;
      if (lost) losses += 1;
      sList.push({ name: rec.name, time: rec.time ?? null, lost });
      pity = 0;
    } else {
      pity += 1;
    }
  }
  return {
    pulls: sorted.length,
    pity,
    fails,
    sCount: sList.length,
    losses,
    sList,
    lastS: sList.length > 0 ? { name: sList[sList.length - 1].name, time: sList[sList.length - 1].time } : null,
  };
}

/**
 * 全账号汇总：box（仅代理人，来自常驻+独家池）+ 四池状态 + 欧非统计。
 * recordsByType：groupRecordsByType 的返回值（键为内部编码 1/2/3/5）。
 */
export function summarizeAccount(recordsByType, standardSet, options = {}) {
  const limited = summarizePool(recordsByType[2] ?? [], standardSet, options);
  const standard = summarizePool(recordsByType[1] ?? [], standardSet, options);
  const weapon = summarizePool(recordsByType[3] ?? [], standardSet, options);
  const bangboo = summarizePool(recordsByType[5] ?? [], standardSet, options);

  // 常驻池无 50/50，「歪」标记与 fails/losses 均无意义 → 清掉，避免展示误导
  standard.sList.forEach((x) => {
    x.lost = false;
  });
  standard.fails = 0;
  standard.losses = 0;

  const box = new Set();
  for (const pool of [recordsByType[1] ?? [], recordsByType[2] ?? []]) {
    for (const rec of pool) {
      if (rec.item_type === '代理人') box.add(rec.name);
    }
  }

  const agentPulls = standard.pulls + limited.pulls;
  const agentSCount = standard.sCount + limited.sCount;
  const limitedWins = limited.sCount - limited.losses;
  return {
    box: [...box].sort(),
    pools: { limited, standard, weapon, bangboo },
    luck: {
      totalPulls: agentPulls + weapon.pulls + bangboo.pulls,
      agentPulls,
      agentSCount,
      avgPullsPerAgentS: agentSCount > 0 ? agentPulls / agentSCount : 0,
      limitedWinRate: limited.sCount > 0 ? limitedWins / limited.sCount : 0,
    },
  };
}
