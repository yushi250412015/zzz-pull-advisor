import { DEFAULT_WEIGHTS } from './weights.js';
import { hasElementCoverage, countSynergy, resourceSafetyScore, verdictFromScore } from './score.js';

/**
 * 生成抽卡推荐。
 * @param {object} input
 * @param {{characters: Record<string, {owned: boolean, mindscape?: number}>}} input.box
 * @param {{polychrome: number, encryptedTapes: number, pity?: number, guaranteed?: boolean}} input.resources
 * @param {Array<{id: string, version: string, characterId: string, type: string}>} input.banners
 * @param {Record<string, object>} input.characters
 * @param {object} [input.weights]
 * @returns {Array<{banner, character, verdict, score, reasons}>}
 */
export function generateRecommendations({ box, resources, banners, characters, weights = DEFAULT_WEIGHTS }) {
  return banners.map((banner) => {
    const character = characters[banner.characterId];
    if (!character) {
      return { banner, character: null, verdict: 'skip', score: 0, reasons: ['未知角色，数据缺失'] };
    }

    const reasons = [];
    let score = character.meta * weights.metaWeight;

    if (box.characters[banner.characterId] && box.characters[banner.characterId].owned) {
      score -= weights.ownershipPenalty;
      reasons.push('已拥有该角色');
    } else {
      if (!hasElementCoverage(box, character.element, characters)) {
        score += weights.elementCoverage;
        reasons.push(`缺少 ${character.element} 属性覆盖`);
      }
      const synergy = countSynergy(box, character);
      if (synergy > 0) {
        score += weights.synergy * synergy;
        reasons.push(`拥有 ${synergy} 名核心队友`);
      }
    }

    const safety = resourceSafetyScore(resources, weights.pitySafetyThreshold);
    if (safety < 1) {
      score -= weights.resourceShortage * (1 - safety);
      reasons.push('资源不足以大保底');
    }

    const verdict = verdictFromScore(score, weights.verdictThresholds);
    return { banner, character, verdict, score: Math.round(score * 100) / 100, reasons };
  });
}
