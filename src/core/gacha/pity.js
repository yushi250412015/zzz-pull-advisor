// 抽卡概率精确计算（马尔可夫 DP，不做闭式解析解）

/**
 * 单抽 S 级概率。n 为 1 起始的抽数（第 n 抽）。
 */
export function rateAtPull(n, cfg) {
  if (n >= cfg.hardPity) return 1;
  if (n >= cfg.softPityStart) {
    return Math.min(1, cfg.baseRate + (n - cfg.softPityStart + 1) * cfg.softPityIncrement);
  }
  return cfg.baseRate;
}

/**
 * n 抽内拿到 UP 的精确概率。
 * @param {number} n 抽数
 * @param {object} cfg 卡池配置
 * @param {{pity: number, fails: number}} state 初始状态
 *   - pity：距上次 S 的抽数（0 起始）
 *   - fails：连续歪的次数；当 fails >= cfg.guaranteeAfterFails 时下个 S 必 UP
 */
export function probabilityOfRateUp(n, cfg, state = { pity: 0, fails: 0 }) {
  const cap = Number.isFinite(cfg.guaranteeAfterFails) ? cfg.guaranteeAfterFails : 32;
  const key = (p, f) => `${p},${f}`;

  let dp = new Map();
  dp.set(key(Math.min(state.pity, cfg.hardPity - 1), Math.min(state.fails || 0, cap)), 1);
  let success = 0;

  for (let k = 0; k < n; k += 1) {
    const next = new Map();
    for (const [kstr, prob] of dp) {
      if (prob === 0) continue;
      const [p, f] = kstr.split(',').map(Number);
      const rate = rateAtPull(p + 1, cfg);
      const sProb = prob * rate;
      const missProb = prob - sProb;

      if (sProb > 0) {
        if (f >= cfg.guaranteeAfterFails) {
          // 大保底，必出 UP（吸收态）
          success += sProb;
        } else {
          success += sProb * cfg.rateUpChance;
          const nf = Math.min(f + 1, cap);
          next.set(key(0, nf), (next.get(key(0, nf)) || 0) + sProb * (1 - cfg.rateUpChance));
        }
      }
      if (missProb > 0) {
        next.set(key(p + 1, f), (next.get(key(p + 1, f)) || 0) + missProb);
      }
    }
    dp = next;
  }
  return success;
}

/**
 * 拿到 UP 的期望消耗抽数（精确累加，直到未获取概率可忽略）。
 */
export function expectedPullsToRateUp(cfg, state = { pity: 0, fails: 0 }) {
  let total = 0;
  for (let n = 0; n < 1000; n += 1) {
    const notGot = 1 - probabilityOfRateUp(n, cfg, state);
    total += notGot;
    if (notGot < 1e-12) break;
  }
  return total;
}
