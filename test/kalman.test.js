import { describe, it, expect } from 'vitest';
import {
  weightedObservation,
  kalmanStep,
  kalmanFilterSeries,
  confidenceInterval,
} from '../src/core/bayes/kalman.js';

describe('weightedObservation', () => {
  it('多源加权融合', () => {
    const z = weightedObservation([
      { value: 80, weight: 0.5 },
      { value: 100, weight: 0.3 },
      { value: 90, weight: 0.2 },
    ]);
    expect(z).toBeCloseTo(88);
  });
});

describe('kalmanStep', () => {
  it('测量噪声大 → 更信先验', () => {
    const r = kalmanStep({ mu: 50, variance: 100 }, 60, 0, 1000);
    expect(r.mu).toBeGreaterThan(50); // 略向观测移动
    expect(r.mu).toBeLessThan(55); // 但远没到中点，说明更信先验
  });

  it('测量噪声小 → 更信观测', () => {
    const r = kalmanStep({ mu: 50, variance: 100 }, 60, 0, 1);
    expect(r.mu).toBeCloseTo(60, 0);
  });

  it('方差每次更新后下降', () => {
    const r = kalmanStep({ mu: 50, variance: 100 }, 60, 0, 100);
    expect(r.variance).toBeLessThan(100);
  });

  it('精确值（Q=0, R=100, 先验方差 100）', () => {
    const r = kalmanStep({ mu: 50, variance: 100 }, 60, 0, 100);
    expect(r.mu).toBeCloseTo(55); // K=0.5
    expect(r.variance).toBeCloseTo(50);
  });
});

describe('kalmanFilterSeries', () => {
  it('观测越多方差越小（收敛）', () => {
    const r = kalmanFilterSeries({ mu: 50, variance: 100 }, [52, 53, 54, 53, 55], 0, 10);
    expect(r.variance).toBeLessThan(5);
  });
});

describe('confidenceInterval', () => {
  it('关于 μ 对称', () => {
    const ci = confidenceInterval({ mu: 50, variance: 25 });
    expect(ci.min).toBeCloseTo(50 - 1.96 * 5);
    expect(ci.max).toBeCloseTo(50 + 1.96 * 5);
  });
});
