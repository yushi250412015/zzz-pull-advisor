// 抽卡预算策略集（纯函数）：同一目标在不同预算投入下的策略 + 帕累托前沿
// 目标向量 objectives = [总效用↑, −空手风险↑（即风险↓）, −机会成本↑（即成本↓）]，越大越好

import { probabilityOfRateUp } from '../gacha/pity.js';
import { expectedSpentPulls } from '../gacha/downside.js';
import { marginalUtility } from '../utility/utility.js';
import { totalUtility, opportunityCost } from './decision.js';
import { paretoFrontier } from './pareto.js';

/**
 * 生成同一目标在离散预算（25/50/75/100% 可用抽数）下的策略集，并筛选帕累托前沿。
 * 返回按投入抽数升序的前沿策略；预算为 0 时返回空数组。
 */
export function buildPullStrategies({ box, resources, characterId, systems, bannerCfg, favor, weights }) {
  const maxPulls = (resources.encryptedTapes || 0) + Math.floor((resources.polychrome || 0) / 160);
  if (maxPulls <= 0) return [];
  const budgets = [...new Set([0.25, 0.5, 0.75, 1].map((f) => Math.floor(maxPulls * f)).filter((v) => v > 0))];
  const strategies = budgets.map((pulls) => {
    const risk = 1 - probabilityOfRateUp(pulls, bannerCfg, { pity: resources.pity || 0, fails: resources.fails || 0 });
    const combatDelta = marginalUtility(box, characterId, systems);
    const cost = opportunityCost(expectedSpentPulls(pulls, bannerCfg, { pity: resources.pity || 0, fails: resources.fails || 0 }));
    const utility = totalUtility({ combatDelta, favor, risk, opportunityCost: cost, weights });
    return { pulls, risk, combatDelta, cost, utility, objectives: [utility, -risk, -cost] };
  });
  return paretoFrontier(strategies).sort((a, b) => a.pulls - b.pulls);
}
