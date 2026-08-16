import { describe, it, expect } from 'vitest';
import { metaUtility, metaUtilityOfBox, boxCombatValue, boxUtility } from '../src/core/utility/utility.js';
import { systems } from '../src/models/systems.js';
import { characters } from '../src/data/characters.js';
import { mctsPlan } from '../src/core/decision/mcts.js';
import { mulberry32 } from '../src/core/gacha/rng.js';
import { DEFAULT_CONFIG } from '../src/core/gacha/config.js';

describe('metaUtility（meta 先验接入，2026-08 建模修正）', () => {
  it('meta 为 null 时贡献 0（未知不臆造）', () => {
    expect(metaUtility(characters.velina)).toBe(0); // velina.meta = null
    expect(metaUtility(undefined)).toBe(0);
  });

  it('meta 90 → 90/100 × metaScale(5) = 4.5', () => {
    expect(metaUtility(characters.remielle)).toBeCloseTo(4.5);
  });

  it('metaScale 为可调参数', () => {
    expect(metaUtility(characters.remielle, { metaScale: 10 })).toBeCloseTo(9);
  });

  it('metaUtilityOfBox 汇总拥有的角色', () => {
    const box = { characters: { remielle: { owned: true }, sigrid: { owned: true }, velina: { owned: true } } };
    expect(metaUtilityOfBox(box, characters)).toBeCloseTo(4.5 + 4.1 + 0);
  });

  it('boxCombatValue = θ 体系收益 + meta 项；空 box 为 0', () => {
    const box = { characters: { remielle: { owned: true } } };
    expect(boxCombatValue(box, systems, characters)).toBeCloseTo(boxUtility(box, systems) + 4.5);
    expect(boxCombatValue({ characters: {} }, systems, characters)).toBe(0);
  });
});

describe('mctsPlan valueFn 注入', () => {
  const initialState = {
    bannerIndex: 0,
    pulls: 90,
    pity: 0,
    fails: 0,
    box: { characters: {} },
    systems,
    bannerCfg: DEFAULT_CONFIG.character,
    banners: [{ id: 'b-sigrid', characterId: 'sigrid' }, { id: 'b-aria', characterId: 'aria' }],
  };

  it('固定种子下，默认口径与 meta 口径的平均收益不同（口径可注入）', () => {
    const plain = mctsPlan(initialState, { iterations: 300, rng: mulberry32(7) });
    const withMeta = mctsPlan(initialState, {
      iterations: 300,
      rng: mulberry32(7),
      valueFn: (box, sys) => boxCombatValue(box, sys, characters),
    });
    expect(withMeta.map((x) => x.avgValue)).not.toEqual(plain.map((x) => x.avgValue));
  });
});
