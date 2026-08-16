import { describe, it, expect } from 'vitest';
import { recommendCharacter } from '../src/core/recommend.js';
import { systems } from '../src/models/systems.js';
import { characters } from '../src/data/characters.js';
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

  it('传入 characters 时叠加 meta 先验项（无体系角色也有正值）；缺省保持纯 θ', () => {
    const withMeta = recommendCharacter({ ...base, characterId: 'rinna', characters });
    const noMeta = recommendCharacter({ ...base, characterId: 'rinna' });
    expect(noMeta.combatDelta).toBe(0); // rinna 不在任何体系，纯 θ 口径为 0
    expect(withMeta.combatDelta).toBeGreaterThan(0); // meta 90 → 4.5
  });

  it('metaMap 后验优先于先验 meta', () => {
    const withPosterior = recommendCharacter({ ...base, characterId: 'rinna', characters, metaMap: { rinna: 80 } });
    expect(withPosterior.combatDelta).toBeCloseTo((80 / 100) * 5);
  });
});
