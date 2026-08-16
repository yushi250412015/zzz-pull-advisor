import { describe, it, expect } from 'vitest';
import { pullCostDistribution, downsideRiskPulls, expectedSpentPulls } from '../src/core/gacha/downside.js';
import { expectedPullsToRateUp } from '../src/core/gacha/pity.js';
import { DEFAULT_CONFIG } from '../src/core/gacha/config.js';

const cfg = DEFAULT_CONFIG.character;

describe('pullCostDistribution', () => {
  it('分布归一化且与 DP 总概率一致', () => {
    const dist = pullCostDistribution(cfg, { pity: 0, fails: 0 });
    const total = dist.reduce((s, p) => s + p, 0);
    expect(total).toBeGreaterThan(0.999);
    expect(total).toBeLessThanOrEqual(1.0001);
  });
});

describe('expectedSpentPulls（拿到即停的期望消耗）', () => {
  it('小额预算时低于预算上限；大预算时收敛到 expectedPullsToRateUp', () => {
    const small = expectedSpentPulls(60, cfg, { pity: 0, fails: 0 });
    expect(small).toBeGreaterThan(0);
    expect(small).toBeLessThan(60);
    const large = expectedSpentPulls(1000, cfg, { pity: 0, fails: 0 });
    expect(large).toBeCloseTo(expectedPullsToRateUp(cfg, { pity: 0, fails: 0 }), 0);
  });

  it('大保底状态下期望消耗显著下降', () => {
    const fresh = expectedSpentPulls(1000, cfg, { pity: 0, fails: 0 });
    const guaranteed = expectedSpentPulls(1000, cfg, { pity: 0, fails: 1 });
    expect(guaranteed).toBeLessThan(fresh);
  });
});

describe('downsideRiskPulls（CVaR 下行风险）', () => {
  it('期望抽数与 expectedPullsToRateUp 交叉印证（≈62.5）', () => {
    const r = downsideRiskPulls(cfg, { pity: 0, fails: 0 });
    expect(r.expectedPulls).toBeCloseTo(expectedPullsToRateUp(cfg, { pity: 0, fails: 0 }), 0);
  });

  it('CVaR90 ≥ 期望抽数 ≥ 0；VaR ≤ CVaR', () => {
    const r = downsideRiskPulls(cfg, { pity: 0, fails: 0 }, 0.9);
    expect(r.cvarPulls).toBeGreaterThanOrEqual(r.expectedPulls);
    expect(r.varPulls).toBeLessThanOrEqual(r.cvarPulls);
    expect(r.varPulls).toBeGreaterThan(0);
  });

  it('大保底状态下行风险显著下降', () => {
    const fresh = downsideRiskPulls(cfg, { pity: 0, fails: 0 });
    const guaranteed = downsideRiskPulls(cfg, { pity: 0, fails: 1 }); // fails>=1 → 大保底
    expect(guaranteed.cvarPulls).toBeLessThan(fresh.cvarPulls);
  });

  it('已垫保底（pity>0）比全新状态风险低', () => {
    const fresh = downsideRiskPulls(cfg, { pity: 0, fails: 0 });
    const padded = downsideRiskPulls(cfg, { pity: 70, fails: 0 });
    expect(padded.expectedPulls).toBeLessThan(fresh.expectedPulls);
  });
});
