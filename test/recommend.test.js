import { describe, it, expect } from 'vitest';
import { recommendCharacter } from '../src/core/recommend.js';
import { systems } from '../src/models/systems.js';
import { DEFAULT_CONFIG } from '../src/core/gacha/config.js';

const base = {
  box: { characters: {} },
  resources: { encryptedTapes: 90, polychrome: 0, pity: 0, fails: 0 },
  characterId: 'ellen',
  systems,
  bannerCfg: DEFAULT_CONFIG.character,
  favor: 80,
};

describe('recommendCharacter', () => {
  it('输出有限效用与各组件', () => {
    const r = recommendCharacter(base);
    expect(Number.isFinite(r.utility)).toBe(true);
    expect(r.risk).toBeGreaterThan(0);
    expect(r.risk).toBeLessThan(1);
    expect(r.combatDelta).toBeGreaterThan(0); // ellen 有边际效用
  });

  it('喜好越高总效用越高', () => {
    const low = recommendCharacter({ ...base, favor: 20 }).utility;
    const high = recommendCharacter({ ...base, favor: 90 }).utility;
    expect(high).toBeGreaterThan(low);
  });

  it('抽数越少风险越高', () => {
    const few = recommendCharacter({ ...base, resources: { ...base.resources, encryptedTapes: 10 } });
    const many = recommendCharacter({ ...base, resources: { ...base.resources, encryptedTapes: 90 } });
    expect(few.risk).toBeGreaterThan(many.risk);
  });
});
