import { describe, it, expect } from 'vitest';
import { trueSkill1v1, normCdf } from '../src/core/rating/rating.js';

describe('normCdf', () => {
  it('标准正态 CDF 关键点', () => {
    expect(normCdf(0)).toBeCloseTo(0.5, 3);
    expect(normCdf(1.96)).toBeCloseTo(0.975, 2);
    expect(normCdf(-1.96)).toBeCloseTo(0.025, 2);
  });
});

describe('trueSkill1v1', () => {
  it('预期内的胜利：μ 小幅上升、σ 收敛', () => {
    const r = trueSkill1v1({ mu: 25, sigma: 8.33 }, { mu: 15, sigma: 8.33 });
    expect(r.winner.mu).toBeGreaterThan(25);
    expect(r.winner.mu).toBeLessThan(28); // 强打弱，提升小
    expect(r.winner.sigma).toBeLessThan(8.33); // 不确定性下降
  });

  it('爆冷（弱胜强）：μ 大幅上升', () => {
    const r = trueSkill1v1({ mu: 15, sigma: 8.33 }, { mu: 25, sigma: 8.33 });
    expect(r.winner.mu).toBeGreaterThan(18); // 15 -> ~22，提升大
  });

  it('爆冷提升幅度大于预期胜利', () => {
    const upset = trueSkill1v1({ mu: 15, sigma: 8.33 }, { mu: 25, sigma: 8.33 });
    const expected = trueSkill1v1({ mu: 25, sigma: 8.33 }, { mu: 15, sigma: 8.33 });
    expect(upset.winner.mu - 15).toBeGreaterThan(expected.winner.mu - 25);
  });

  it('σ 始终非负', () => {
    const r = trueSkill1v1({ mu: 10, sigma: 5 }, { mu: 30, sigma: 1 });
    expect(r.winner.sigma).toBeGreaterThanOrEqual(0);
    expect(r.loser.sigma).toBeGreaterThanOrEqual(0);
  });
});
