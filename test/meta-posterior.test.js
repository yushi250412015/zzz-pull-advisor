import { describe, it, expect } from 'vitest';
import { estimateMeta, buildMetaPosteriors } from '../src/core/bayes/meta-posterior.js';
import { confidenceInterval } from '../src/core/bayes/kalman.js';
import { observations } from '../src/data/observations.js';
import { characters } from '../src/data/characters.js';

describe('estimateMeta（Kalman 观测闭环）', () => {
  it('无观测时后验等于先验，且给出置信区间', () => {
    const p = estimateMeta(82, []);
    expect(p.mu).toBe(82);
    const ci = confidenceInterval(p);
    expect(ci.min).toBeLessThan(82);
    expect(ci.max).toBeGreaterThan(82);
  });

  it('高可信观测把后验拉向观测值，且方差下降', () => {
    const p = estimateMeta(82, [{ value: 88, weight: 0.9 }]);
    expect(p.mu).toBeGreaterThan(82);
    expect(p.variance).toBeLessThan(100);
  });

  it('冲突观测融合：先验 60，观测 72 与 48 → 后验在中间且方差显著下降', () => {
    const p = estimateMeta(60, [
      { value: 72, weight: 0.8 },
      { value: 48, weight: 0.6 },
    ]);
    expect(p.mu).toBeGreaterThan(48);
    expect(p.mu).toBeLessThan(72);
    expect(p.variance).toBeLessThan(100);
  });
});

describe('buildMetaPosteriors', () => {
  it('所有有先验的角色都产出后验；冲突观测（派派）后验落在两观测之间', () => {
    const posteriors = buildMetaPosteriors(characters, observations);
    expect(posteriors.sigrid).toBeDefined();
    expect(posteriors.piper.mu).toBeGreaterThan(48);
    expect(posteriors.piper.mu).toBeLessThan(72);
    expect(posteriors.velina).toBeDefined(); // meta 全量校准后维琳娜也有后验
    expect(posteriors.velina.mu).toBeGreaterThan(75);
    expect(posteriors.velina.mu).toBeLessThan(82); // 双源观测折中
  });
});
