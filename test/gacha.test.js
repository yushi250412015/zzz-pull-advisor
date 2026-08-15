import { describe, it, expect } from 'vitest';
import { rateAtPull, probabilityOfRateUp, expectedPullsToRateUp } from '../src/core/gacha/pity.js';
import { simulatePulls, monteCarloEstimate } from '../src/core/gacha/simulate.js';
import { mulberry32 } from '../src/core/gacha/rng.js';
import { DEFAULT_CONFIG } from '../src/core/gacha/config.js';

const char = DEFAULT_CONFIG.character;

describe('rateAtPull', () => {
  it('软保底前为基础概率', () => {
    expect(rateAtPull(1, char)).toBeCloseTo(0.006);
    expect(rateAtPull(73, char)).toBeCloseTo(0.006);
  });
  it('软保底起递增', () => {
    expect(rateAtPull(74, char)).toBeCloseTo(0.066);
    expect(rateAtPull(89, char)).toBeCloseTo(0.966);
  });
  it('硬保底必出', () => {
    expect(rateAtPull(90, char)).toBe(1);
  });
});

describe('probabilityOfRateUp', () => {
  it('1 抽概率 = 基础率 × UP 率', () => {
    expect(probabilityOfRateUp(1, char)).toBeCloseTo(0.003);
  });

  it('90 抽内约 55%~70% 拿到 UP（含歪后大保底）', () => {
    const p = probabilityOfRateUp(90, char);
    expect(p).toBeGreaterThan(0.55);
    expect(p).toBeLessThan(0.7);
  });

  it('随抽数单调不减', () => {
    expect(probabilityOfRateUp(180, char)).toBeGreaterThan(probabilityOfRateUp(90, char));
  });

  it('已处于大保底时，90 抽内几乎必出', () => {
    const p = probabilityOfRateUp(90, char, { pity: 0, fails: 1 });
    expect(p).toBeGreaterThan(0.9);
  });

  it('蒙特卡洛与精确值一致（容差内）', () => {
    const exact = probabilityOfRateUp(90, char);
    const mc = monteCarloEstimate({ pity: 0, fails: 0 }, 90, char, 50000, mulberry32(42));
    expect(mc).toBeGreaterThan(exact - 0.02);
    expect(mc).toBeLessThan(exact + 0.02);
  });
});

describe('expectedPullsToRateUp', () => {
  it('期望抽数在合理区间（约 90~100）', () => {
    const e = expectedPullsToRateUp(char);
    expect(e).toBeGreaterThan(80);
    expect(e).toBeLessThan(110);
  });
});

describe('simulatePulls', () => {
  it('大保底状态下，首抽内必出 UP（用固定 rng）', () => {
    const r = simulatePulls({ pity: 0, fails: 1 }, 90, char, () => 0);
    expect(r.gotRateUp).toBe(true);
    expect(r.pulls).toBe(1);
  });
});
