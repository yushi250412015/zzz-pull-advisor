// 推荐编排：把 P1 概率 + P2 效用 + P3 决策 串成一条「抽某个角色」的推荐结果

import { probabilityOfRateUp } from './gacha/pity.js';
import { marginalUtility } from './utility/utility.js';
import { totalUtility, opportunityCost } from './decision/decision.js';

/**
 * @param {object} input
 * @param {object} input.box 用户 box
 * @param {{encryptedTapes: number, polychrome: number, pity: number, fails: number}} input.resources
 * @param {string} input.characterId 目标角色
 * @param {object} input.systems 体系数据
 * @param {object} input.bannerCfg 卡池配置
 * @param {number} input.favor 主观喜好分
 * @param {object} [input.weights] 决策权重
 */
export function recommendCharacter({ box, resources, characterId, systems, bannerCfg, favor, weights }) {
  const pulls = (resources.encryptedTapes || 0) + Math.floor((resources.polychrome || 0) / 160);
  const risk = 1 - probabilityOfRateUp(pulls, bannerCfg, { pity: resources.pity || 0, fails: resources.fails || 0 });
  const combatDelta = marginalUtility(box, characterId, systems);
  const cost = opportunityCost(pulls);
  const utility = totalUtility({ combatDelta, favor, risk, opportunityCost: cost, weights });
  return { pulls, risk, combatDelta, cost, utility };
}
