// 抽卡参谋核心门面（依赖倒置 + 接口隔离）：
// UI 层只依赖这里的稳定契约，不直接依赖概率/效用/决策各模块；
// 数据（characters/banners/systems/observations/equipment）在装配时注入。
// 换数据源、换算法实现（如替换 MCTS 实现），契约不变 → UI 零改动（开闭原则）。
import { DEFAULT_CONFIG } from './gacha/config.js';
import { downsideRiskPulls } from './gacha/downside.js';
import { buildMetaPosteriors } from './bayes/meta-posterior.js';
import { confidenceInterval } from './bayes/kalman.js';
import { recommendCharacter } from './recommend.js';
import { recommendEquipment, EQUIPMENT_DEFAULTS } from './recommend-equipment.js';
import { buildPullStrategies } from './decision/pull-strategies.js';
import { buildPlanningScenarios } from './decision/planning.js';
import { mctsPlan } from './decision/mcts.js';
import { boxCombatValue } from './utility/utility.js';
import { verdictFromScore, scoreFromUtility } from './decision/decision.js';

export function createAdvisor({ characters, banners, systems, observations, equipment, config = DEFAULT_CONFIG }) {
  const { weapons, bangboos } = equipment || {};
  const posteriors = buildMetaPosteriors(characters, observations);
  const metaMap = {};
  for (const [id, p] of Object.entries(posteriors)) metaMap[id] = p.mu;

  return {
    // —— 数据访问（UI 只问门面要数据，不直连数据模块） ——
    banners: () => banners,
    equipmentFor: (banner) => (banner.type === 'weapon' ? weapons[banner.weaponId] : bangboos[banner.bangbooId]),

    // —— 概率 / 效用 / 决策契约（UI 各面板按需取用 → 接口隔离） ——
    metaMap: () => metaMap,
    characterCfg: (banner) => (banner && banner.firstGoldGuaranteed ? { ...config.character, rateUpChance: 1 } : config.character),
    baseCharacterCfg: () => config.character,
    scoreOf: (utility) => scoreFromUtility(utility),
    verdictFor: (utility, thresholds) => verdictFromScore(scoreFromUtility(utility), thresholds),
    recommendCharacter: (input) => recommendCharacter({ ...input, systems, characters, metaMap }),
    pullStrategies: (input) => buildPullStrategies({ ...input, systems }),
    downsideRisk: (cfg, pityState, alpha = 0.9) => downsideRiskPulls(cfg, pityState, alpha),
    recommendEquipment: (input) => recommendEquipment({ ...input, systems, characters }),
    equipmentDefaults: () => EQUIPMENT_DEFAULTS,
    scenarios: () => buildPlanningScenarios(banners, characters),

    // —— MCTS：valueFn 可注入（默认 θ+meta 口径），initialState 无需带 systems ——
    plan: (initialState, { iterations, valueFn } = {}) =>
      mctsPlan(
        { ...initialState, systems },
        {
          iterations,
          valueFn: valueFn || ((box, sys) => boxCombatValue(box, sys, characters, undefined, metaMap)),
        },
      ),

    // —— 可信度面板数据（计算归核心，渲染归 UI） ——
    confidenceRows: () =>
      Object.entries(posteriors)
        .map(([id, p]) => {
          const c = characters[id];
          if (!c || c.meta == null) return null;
          const ci = confidenceInterval(p);
          const delta = p.mu - c.meta;
          const arrow = Math.abs(delta) < 1 ? '≈' : delta > 0 ? '↑' : '↓';
          return {
            name: c.name,
            prior: c.meta,
            posterior: p.mu.toFixed(1),
            arrow,
            ciMin: ci.min.toFixed(0),
            ciMax: ci.max.toFixed(0),
          };
        })
        .filter(Boolean),
  };
}
