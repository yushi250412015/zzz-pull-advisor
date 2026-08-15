import { describe, it, expect } from 'vitest';
import {
  hasElementCoverage,
  countSynergy,
  resourceSafetyScore,
  verdictFromScore,
} from '../src/engine/score.js';
import { generateRecommendations } from '../src/engine/recommend.js';
import { characters } from '../src/data/characters.js';
import { banners } from '../src/data/banners.js';

const emptyBox = { characters: {} };
const fullResources = { polychrome: 25600, encryptedTapes: 0 }; // 160 抽
const emptyResources = { polychrome: 0, encryptedTapes: 0 };

describe('verdictFromScore', () => {
  it('按阈值映射结论', () => {
    expect(verdictFromScore(60)).toBe('pull');
    expect(verdictFromScore(40)).toBe('consider');
    expect(verdictFromScore(10)).toBe('skip');
  });
});

describe('hasElementCoverage', () => {
  it('拥有该属性角色时返回 true', () => {
    const box = { characters: { ellen: { owned: true } } };
    expect(hasElementCoverage(box, 'ice', characters)).toBe(true);
  });

  it('缺少该属性角色时返回 false', () => {
    expect(hasElementCoverage(emptyBox, 'ether', characters)).toBe(false);
  });
});

describe('countSynergy', () => {
  it('统计拥有的核心队友数量', () => {
    const box = { characters: { lycaon: { owned: true }, nicole: { owned: true } } };
    expect(countSynergy(box, characters.ellen)).toBe(1);
    expect(countSynergy(box, characters['zhu-yuan'])).toBe(1);
    expect(countSynergy(emptyBox, characters.ellen)).toBe(0);
  });
});

describe('resourceSafetyScore', () => {
  it('菲林与母带换算为抽数，并封顶为 1', () => {
    expect(resourceSafetyScore(fullResources, 160)).toBe(1);
    expect(resourceSafetyScore({ polychrome: 160 * 80, encryptedTapes: 0 }, 160)).toBe(0.5);
    expect(resourceSafetyScore(emptyResources, 160)).toBe(0);
  });
});

describe('generateRecommendations', () => {
  it('已拥有的角色 → 跳过', () => {
    const box = { characters: { miyabi: { owned: true } } };
    const result = generateRecommendations({
      box,
      resources: fullResources,
      banners: [banners[0]],
      characters,
    });
    expect(result[0].verdict).toBe('skip');
    expect(result[0].reasons).toContain('已拥有该角色');
  });

  it('缺属性覆盖 + 有核心队友 + 资源充足 → 抽', () => {
    const box = { characters: { lycaon: { owned: true } } }; // 有冰系莱卡恩，但无冰系输出
    const result = generateRecommendations({
      box,
      resources: fullResources,
      banners: [banners[1]], // ellen（冰 attack，核心队友 lycaon）
      characters,
    });
    expect(result[0].verdict).toBe('pull');
    expect(result[0].reasons).toContain('缺少 ice 属性覆盖');
    expect(result[0].reasons).toContain('拥有 1 名核心队友');
  });

  it('资源不足时降级结论', () => {
    const box = { characters: {} };
    const result = generateRecommendations({
      box,
      resources: emptyResources,
      banners: [banners[0]], // miyabi meta 92
      characters,
    });
    expect(result[0].verdict).toBe('consider');
    expect(result[0].reasons).toContain('资源不足以大保底');
  });
});
