import { describe, it, expect } from 'vitest';
import { buildPullStrategies } from '../src/core/decision/pull-strategies.js';
import { dominates } from '../src/core/decision/pareto.js';
import { systems } from '../src/models/systems.js';
import { DEFAULT_CONFIG } from '../src/core/gacha/config.js';

const base = {
  box: { characters: {} },
  characterId: 'remielle',
  systems,
  bannerCfg: DEFAULT_CONFIG.character,
  favor: 50,
};

describe('buildPullStrategies', () => {
  it('预算为 0 时返回空数组', () => {
    expect(buildPullStrategies({ ...base, resources: { encryptedTapes: 0, polychrome: 0 } })).toEqual([]);
  });

  it('生成离散预算策略并返回非空帕累托前沿（按投入升序）', () => {
    const s = buildPullStrategies({ ...base, resources: { encryptedTapes: 40, polychrome: 8000 } }); // 90 抽
    expect(s.length).toBeGreaterThan(0);
    for (const st of s) {
      expect(st.objectives).toHaveLength(3);
      expect(st.pulls).toBeGreaterThan(0);
    }
    for (let i = 1; i < s.length; i += 1) {
      expect(s[i].pulls).toBeGreaterThan(s[i - 1].pulls);
    }
  });

  it('前沿内任意两个策略互不支配', () => {
    const s = buildPullStrategies({ ...base, resources: { encryptedTapes: 80, polychrome: 0 } }); // 80 抽
    for (let i = 0; i < s.length; i += 1) {
      for (let j = i + 1; j < s.length; j += 1) {
        expect(dominates(s[i].objectives, s[j].objectives)).toBe(false);
        expect(dominates(s[j].objectives, s[i].objectives)).toBe(false);
      }
    }
  });

  it('风险随投入增加单调下降（更多抽数 → 空手风险更低）', () => {
    const s = buildPullStrategies({ ...base, resources: { encryptedTapes: 80, polychrome: 0 } });
    for (let i = 1; i < s.length; i += 1) {
      expect(s[i].risk).toBeLessThanOrEqual(s[i - 1].risk + 1e-12);
    }
  });
});
