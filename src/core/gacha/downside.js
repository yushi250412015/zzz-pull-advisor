// 下行风险（CVaR）：由精确 DP 得到「第 n 抽恰好拿到 UP」的分布，计算 VaR / CVaR 抽数（纯函数）
// 用途：把「空手风险 = 1 − P(拿UP)」升级为「最差 α 分位情况下的期望消耗抽数」，
//       与期望抽数（expectedPullsToRateUp）互相印证。

import { probabilityOfRateUp } from './pity.js';

/** 第 n 抽恰好拿到 UP 的概率分布（dist[i] 对应第 i+1 抽） */
export function pullCostDistribution(cfg, state = { pity: 0, fails: 0 }, maxN = 500) {
  const dist = [];
  let prev = 0;
  for (let n = 1; n <= maxN; n += 1) {
    const p = probabilityOfRateUp(n, cfg, state);
    dist.push(Math.max(0, p - prev));
    prev = p;
    if (p >= 1 - 1e-12) break;
  }
  return dist;
}

/**
 * 期望消耗抽数（拿到 UP 即停止继续投入）：E[min(n, 抽到 UP 所需抽数)]。
 * 与「机会成本按全部预算计费」相比更贴近真实决策：抽到即停，尾款不退。
 * n 很大时应收敛到 expectedPullsToRateUp。
 */
export function expectedSpentPulls(n, cfg, state = { pity: 0, fails: 0 }, maxN = 500) {
  const dist = pullCostDistribution(cfg, state, maxN);
  const m = Math.min(n, dist.length);
  let sum = 0;
  for (let i = 0; i < m; i += 1) sum += (i + 1) * dist[i];
  const prob = dist.slice(0, m).reduce((s, p) => s + p, 0);
  // 未在第 m 抽前拿到 UP 的概率质量，按预算上限 m 计费
  return sum + m * Math.max(0, 1 - prob);
}

/**
 * 下行风险指标（离散近似，文档化定义）：
 *   varPulls：累计概率 ≥ α 的最小抽数（VaR_α）
 *   cvarPulls：E[n | n > varPulls]（尾部期望，CVaR_α）
 *   expectedPulls：无条件期望抽数（与 expectedPullsToRateUp 交叉印证）
 */
export function downsideRiskPulls(cfg, state = { pity: 0, fails: 0 }, alpha = 0.9, maxN = 500) {
  const dist = pullCostDistribution(cfg, state, maxN);
  const total = dist.reduce((s, p) => s + p, 0);
  let cum = 0;
  let varPulls = dist.length;
  for (let i = 0; i < dist.length; i += 1) {
    cum += dist[i];
    if (cum >= alpha) {
      varPulls = i + 1;
      break;
    }
  }
  let tailSum = 0;
  let tailProb = 0;
  for (let i = varPulls; i < dist.length; i += 1) {
    tailSum += (i + 1) * dist[i];
    tailProb += dist[i];
  }
  const cvarPulls = tailProb > 0 ? tailSum / tailProb : varPulls;
  const expectedPulls = dist.reduce((s, p, i) => s + (i + 1) * p, 0);
  return { varPulls, cvarPulls, expectedPulls, tailProb, totalProb: total };
}
