import { describe, it, expect } from 'vitest';
import { observations, observationSources } from '../src/data/observations.js';
import { characters } from '../src/data/characters.js';

describe('observations 结构完整性', () => {
  it('每条观测指向真实角色、数值在 0-100、权重 0-1、来源已注册', () => {
    for (const o of observations) {
      expect(characters[o.characterId], o.characterId + ' ' + o.source).toBeDefined();
      expect(o.value).toBeGreaterThanOrEqual(0);
      expect(o.value).toBeLessThanOrEqual(100);
      expect(o.weight).toBeGreaterThan(0);
      expect(o.weight).toBeLessThanOrEqual(1);
      expect(observationSources[o.source], o.source).toBeDefined();
      expect(o.note.length, o.characterId).toBeGreaterThan(0);
    }
  });

  it('包含卡特亚对希格莉德的观测（BV1ZPgA6YEwa）', () => {
    const katya = observations.filter((o) => o.source === 'katya');
    expect(katya.length).toBeGreaterThan(0);
    expect(katya[0]).toMatchObject({ characterId: 'sigrid', weight: 0.9 });
    expect(katya[0].note).toContain('BV1ZPgA6YEwa');
  });

  it('爱芮有卡特亚与梦轩dada双源视频观测（BV1opAmzXEoD / BV1URPNzREDf）', () => {
    const ariaObs = observations.filter((o) => o.characterId === 'aria');
    expect(ariaObs.some((o) => o.source === 'katya' && o.note.includes('BV1opAmzXEoD'))).toBe(true);
    expect(ariaObs.some((o) => o.source === 'mengxuan' && o.note.includes('BV1URPNzREDf'))).toBe(true);
    const mengxuan = ariaObs.find((o) => o.source === 'mengxuan');
    expect(observationSources.mengxuan.trust).toBe(0.7);
  });
});
