import { describe, it, expect } from 'vitest';
import { dominates, paretoFrontier } from '../src/core/decision/pareto.js';

describe('dominates', () => {
  it('全维度不劣且至少一维更优才算支配', () => {
    expect(dominates([2, 3], [1, 1])).toBe(true);
    expect(dominates([1, 1], [2, 3])).toBe(false);
    expect(dominates([1, 3], [2, 2])).toBe(false); // 各有优劣，互不支配
    expect(dominates([1, 1], [1, 1])).toBe(false); // 相等不支配
  });
});

describe('paretoFrontier', () => {
  it('筛选非支配解', () => {
    const strategies = [
      { id: 'a', objectives: [1, 1] }, // 被 [2,2] 支配
      { id: 'b', objectives: [2, 2] },
      { id: 'c', objectives: [3, 1] }, // 与 [2,2] 不可比
      { id: 'd', objectives: [1, 3] }, // 与 [2,2] 不可比
    ];
    const frontier = paretoFrontier(strategies);
    expect(frontier.length).toBe(3);
    const ids = frontier.map((x) => x.id).sort();
    expect(ids).toEqual(['b', 'c', 'd']);
  });
});
