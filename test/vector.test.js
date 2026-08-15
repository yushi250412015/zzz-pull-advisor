import { describe, it, expect } from 'vitest';
import {
  DIMENSIONS,
  aggregateVector,
  skillCoefficient,
  effectiveUtility,
} from '../src/core/utility/vector.js';

describe('aggregateVector', () => {
  it('单位权重时为各维求和', () => {
    const vector = { peak: 100, floor: 80, rotation: 60, opCost: 20, versatility: 70, reuse: 50 };
    const weights = Object.fromEntries(DIMENSIONS.map((d) => [d, 1]));
    expect(aggregateVector(vector, weights)).toBeCloseTo(380);
  });

  it('选择性权重只取对应维度', () => {
    const vector = { peak: 100, floor: 80 };
    expect(aggregateVector(vector, { peak: 1 })).toBeCloseTo(100);
    expect(aggregateVector(vector, { floor: 0.5 })).toBeCloseTo(40);
  });
});

describe('skillCoefficient / effectiveUtility', () => {
  it('手法水平映射系数', () => {
    expect(skillCoefficient('low')).toBe(0.5);
    expect(skillCoefficient('mid')).toBe(0.75);
    expect(skillCoefficient('high')).toBe(1.0);
  });

  it('实际效用 = 聚合 × 系数', () => {
    const vector = { peak: 100 };
    expect(effectiveUtility(vector, { peak: 1 }, 'mid')).toBeCloseTo(75);
  });
});
