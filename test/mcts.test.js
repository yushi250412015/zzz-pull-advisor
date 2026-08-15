import { describe, it, expect } from 'vitest';
import { budgetOptions, ucb1, mctsPlan } from '../src/core/decision/mcts.js';
import { mulberry32 } from '../src/core/gacha/rng.js';
import { DEFAULT_CONFIG } from '../src/core/gacha/config.js';
import { systems } from '../src/models/systems.js';

describe('budgetOptions', () => {
  it('离散预算 0/25/50/75/100%', () => {
    expect(budgetOptions(90)).toEqual([0, 22, 45, 67, 90]);
  });
});

describe('ucb1', () => {
  it('未访问过返回 Infinity', () => {
    expect(ucb1(0, 0, 10)).toBe(Infinity);
  });
  it('访问过返回有限值', () => {
    expect(ucb1(0.5, 10, 20)).toBeGreaterThan(0);
  });
});

describe('mctsPlan', () => {
  const base = {
    bannerIndex: 0,
    pulls: 90,
    pity: 0,
    fails: 0,
    box: { characters: {} },
    systems,
    bannerCfg: DEFAULT_CONFIG.character,
  };

  it('单卡池时倾向投入全部（无可攒）', () => {
    const state = { ...base, banners: [{ id: 'b-ellen', characterId: 'ellen' }] };
    const r = mctsPlan(state, { iterations: 400, rng: mulberry32(1) });
    const best = r.reduce((a, b) => (a.avgValue > b.avgValue ? a : b));
    expect(best.action).toBe(90);
  });

  it('首个卡池无价值时倾向跳过，攒给有价值的下一个', () => {
    const state = {
      ...base,
      banners: [
        { id: 'b-rinna', characterId: 'rinna' }, // 不在任何体系 → 无价值
        { id: 'b-ellen', characterId: 'ellen' }, // 冰系强攻 → 有价值
      ],
    };
    const r = mctsPlan(state, { iterations: 400, rng: mulberry32(2) });
    const best = r.reduce((a, b) => (a.avgValue > b.avgValue ? a : b));
    expect(best.action).toBe(0);
  });
});
