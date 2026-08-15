// 蒙特卡洛抽卡模拟（与精确 DP 互相印证）

import { rateAtPull } from './pity.js';

/**
 * 单次模拟：从初始状态抽 n 抽，返回是否拿到 UP 及消耗。
 * @param {{pity: number, fails: number}} state
 * @param {number} n 抽数
 * @param {object} cfg 卡池配置
 * @param {() => number} rng 随机数（默认 Math.random）
 */
export function simulatePulls(state, n, cfg, rng = Math.random) {
  let pity = state.pity;
  let fails = state.fails ?? 0;
  let sCount = 0;

  for (let i = 0; i < n; i += 1) {
    if (rng() < rateAtPull(pity + 1, cfg)) {
      sCount += 1;
      pity = 0;
      if (fails >= cfg.guaranteeAfterFails) {
        return { gotRateUp: true, pulls: i + 1, sCount };
      }
      if (rng() < cfg.rateUpChance) {
        return { gotRateUp: true, pulls: i + 1, sCount };
      }
      fails += 1;
    } else {
      pity += 1;
    }
  }
  return { gotRateUp: false, pulls: n, sCount };
}

/**
 * 完整模拟（不提前返回）：抽 n 抽后返回最终状态（用于跨卡池连续模拟）。
 */
export function simulatePullsFull(state, n, cfg, rng = Math.random) {
  let pity = state.pity;
  let fails = state.fails ?? 0;
  let sCount = 0;
  let gotRateUp = false;

  for (let i = 0; i < n; i += 1) {
    if (rng() < rateAtPull(pity + 1, cfg)) {
      sCount += 1;
      pity = 0;
      if (fails >= cfg.guaranteeAfterFails) {
        gotRateUp = true;
        fails = 0;
      } else if (rng() < cfg.rateUpChance) {
        gotRateUp = true;
        fails = 0;
      } else {
        fails += 1;
      }
    } else {
      pity += 1;
    }
  }
  return { gotRateUp, pulls: n, sCount, pity, fails };
}

/**
 * 多次采样估计 n 抽内拿到 UP 的概率。
 */
export function monteCarloEstimate(state, n, cfg, trials = 100000, rng = Math.random) {
  let success = 0;
  for (let i = 0; i < trials; i += 1) {
    if (simulatePulls(state, n, cfg, rng).gotRateUp) success += 1;
  }
  return success / trials;
}
