import { describe, it, expect } from 'vitest';
import { mechanics } from '../src/data/mechanics.js';
import { characters } from '../src/data/characters.js';

describe('mechanics 结构完整性', () => {
  it('每条机制都指向 characters.js 中真实存在的角色', () => {
    for (const [key, m] of Object.entries(mechanics)) {
      expect(characters[m.characterId], key).toBeDefined();
      expect(m.characterId, key).toBe(characters[m.characterId].id);
    }
  });

  it('摘要/关键技能/来源非空，倍率无源时保持 null（不臆造）', () => {
    for (const [key, m] of Object.entries(mechanics)) {
      expect(m.summary.length, key).toBeGreaterThan(10);
      expect(m.keySkills.length, key).toBeGreaterThan(0);
      expect(m.sources.length, key).toBeGreaterThan(0);
      // multipliers 允许 null（无来源不臆造）；非空时必须带数值与来源
      if (m.multipliers != null) {
        for (const [skill, v] of Object.entries(m.multipliers)) {
          expect(typeof v.value, key + '/' + skill).toBe('number');
          expect(v.source, key + '/' + skill).toBeTruthy();
        }
      }
    }
  });
});
