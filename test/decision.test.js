import { describe, it, expect } from 'vitest';
import { totalUtility, opportunityCost } from '../src/core/decision/decision.js';
import { probabilityOfRateUp } from '../src/core/gacha/pity.js';
import { DEFAULT_CONFIG } from '../src/core/gacha/config.js';
import { marginalUtility } from '../src/core/utility/utility.js';
import { systems } from '../src/models/systems.js';

describe('opportunityCost', () => {
  it('消耗抽数 × 每抽价值', () => {
    expect(opportunityCost(100, 1)).toBe(100);
    expect(opportunityCost(50, 2)).toBe(100);
  });
});

describe('totalUtility', () => {
  it('正项相加、风险与机会成本相减', () => {
    // 0.7*10 + 0.3*60 - 50*0.2 - 0.5*40 = 7 + 18 - 10 - 20 = -5
    expect(totalUtility({ combatDelta: 10, favor: 60, risk: 0.2, opportunityCost: 40 })).toBeCloseTo(-5);
  });

  it('风险越高总效用越低', () => {
    const base = { combatDelta: 10, favor: 60, opportunityCost: 0 };
    expect(totalUtility({ ...base, risk: 0.9 })).toBeLessThan(totalUtility({ ...base, risk: 0.1 }));
  });
});

describe('P1+P2+P3 集成', () => {
  it('概率风险 + 边际效用 + 机会成本 组合为总效用，且风险/成本压低结果', () => {
    const box = { characters: {} };
    const n = 90;
    const risk = 1 - probabilityOfRateUp(n, DEFAULT_CONFIG.character);
    const combatDelta = marginalUtility(box, 'ellen', systems);
    const u = totalUtility({ combatDelta, favor: 80, risk, opportunityCost: opportunityCost(n) });
    const uNoRiskCost = totalUtility({ combatDelta, favor: 80, risk: 0, opportunityCost: 0 });
    expect(Number.isFinite(u)).toBe(true);
    expect(u).toBeLessThan(uNoRiskCost);
  });
});
