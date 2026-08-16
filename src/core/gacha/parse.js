// 抽卡记录解析（纯函数）：从记录推导 box / 保底 / 大保底状态
//
// ZZZ 抽卡记录 rank_type 语义（与 Genshin/HSR 不同，经真实账号记录核实）：
//   '4' = S 级（决定保底 / 大保底）
//   '3' = A 级（代理人或音擎）
//   '2' = B 级（音擎，如「月相」系列）

/**
 * 从抽卡记录解析 box、保底计数、连续歪次数。
 * 注意：保底与 50/50 按池独立，调用前请先按 gacha_type 过滤到同一卡池
 * （常驻池不存在 50/50，「歪」计数只在限定池有意义）。
 *
 * @param {Array<{name: string, rank_type: string, item_type?: string, time?: string}>} records 抽卡记录（任意顺序）
 * @param {Set<string>} standardSet 常驻 S 级角色名集合（用于判断限定池是否「歪」）
 * @param {{sRankType?: string}} [options] sRankType：S 级对应的 rank_type，默认 '4'（ZZZ）
 * @returns {{box: Set<string>, pity: number, fails: number}}
 *   - box：拥有的代理人名集合（音擎不入 box）
 *   - pity：距上次 S 的非 S 抽数
 *   - fails：连续歪（非 UP）次数；fails >= guaranteeAfterFails 即处于大保底
 */
export function parseGachaHistory(records, standardSet, options = {}) {
  const sRankType = options.sRankType ?? '4';
  const sorted = [...records].sort((a, b) => {
    const t = String(a.time || '').localeCompare(String(b.time || ''));
    if (t !== 0) return t;
    // 实测：一次十连的记录 time 完全相同，id 后缀才是批内真实先后顺序
    return String(a.id || '').localeCompare(String(b.id || ''));
  });
  const box = new Set();
  let pity = 0;
  let fails = 0;

  for (const rec of sorted) {
    if (rec.item_type !== '音擎') box.add(rec.name);
    if (rec.rank_type === sRankType) {
      fails = standardSet.has(rec.name) ? fails + 1 : 0;
      pity = 0;
    } else {
      pity += 1;
    }
  }
  return { box, pity, fails };
}

/**
 * 账号欧非统计：历史平均每 S 消耗抽数、UP 胜率。
 * avgPity 越高于期望（62）越非，越低越欧。
 * 同样建议只传同一卡池的记录。
 */
export function computeLuckStats(records, standardSet, options = {}) {
  const sRankType = options.sRankType ?? '4';
  const sorted = [...records].sort((a, b) => {
    const t = String(a.time || '').localeCompare(String(b.time || ''));
    if (t !== 0) return t;
    // 实测：一次十连的记录 time 完全相同，id 后缀才是批内真实先后顺序
    return String(a.id || '').localeCompare(String(b.id || ''));
  });
  let sCount = 0;
  let wins = 0;
  for (const rec of sorted) {
    if (rec.rank_type === sRankType) {
      sCount += 1;
      if (!standardSet.has(rec.name)) wins += 1;
    }
  }
  return {
    avgPity: sCount > 0 ? sorted.length / sCount : 0,
    winRate: sCount > 0 ? wins / sCount : 0,
    sCount,
  };
}
