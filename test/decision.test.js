import { describe, it, expect } from 'vitest';
import {
  totalUtility,
  opportunityCost,
  deriveWeights,
  scoreFromUtility,
  verdictFromScore,
} from '../src/core/decision/decision.js';
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

describe('deriveWeights', () => {
  it('强度:喜好 = 8:2', () => {
    const w = deriveWeights({ versionResources: 140, avgPity: 62 });
    expect(w.alphaCombat).toBe(0.8);
    expect(w.alphaFavor).toBe(0.2);
  });

  it('越非（avgPity 高）λ_risk 越高', () => {
    const lucky = deriveWeights({ versionResources: 140, avgPity: 50 });
    const unlucky = deriveWeights({ versionResources: 140, avgPity: 80 });
    expect(unlucky.lambdaRisk).toBeGreaterThan(lucky.lambdaRisk);
  });

  it('资源越少 α_cost 越高', () => {
    const rich = deriveWeights({ versionResources: 200, avgPity: 62 });
    const poor = deriveWeights({ versionResources: 70, avgPity: 62 });
    expect(poor.alphaCost).toBeGreaterThan(rich.alphaCost);
  });
});

describe('totalUtility', () => {
  it('正项相加、风险与机会成本相减', () => {
    // 0.8*10 + 0.2*60 - 30*0.2 - (20/140)*40 = 8 + 12 - 6 - 5.714 = 8.286
    expect(totalUtility({ combatDelta: 10, favor: 60, risk: 0.2, opportunityCost: 40 })).toBeCloseTo(8.29);
  });

  it('风险越高总效用越低', () => {
    const base = { combatDelta: 10, favor: 60, opportunityCost: 0 };
    expect(totalUtility({ ...base, risk: 0.9 })).toBeLessThan(totalUtility({ ...base, risk: 0.1 }));
  });
});

describe('scoreFromUtility / verdictFromScore', () => {
  it('sigmoid 映射到 [0,1]', () => {
    expect(scoreFromUtility(0)).toBeCloseTo(0.5);
    expect(scoreFromUtility(10)).toBeGreaterThan(0.7);
    expect(scoreFromUtility(-10)).toBeLessThan(0.3);
  });

  it('阈值 [0,1] 内映射结论', () => {
    expect(verdictFromScore(0.8)).toBe('pull');
    expect(verdictFromScore(0.5)).toBe('consider');
    expect(verdictFromScore(0.3)).toBe('skip');
  });
});

describe('P1+P2+P3 集成', () => {
  it('概率风险 + 边际效用 + 机会成本 组合为总效用', () => {
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
