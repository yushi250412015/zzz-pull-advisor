// 决策优化：总效用、权重推导（资源+欧非）、[0,1] 推荐分与结论

// —— 基准常数（可调）——
const EXPECTED_PITY = 62; // 理论期望保底（0.6% 基础 + 软保底）
const RISK_BASE = 30; // 正常欧非下的风险厌恶系数
const COST_BASE = 20; // 机会成本基准：花光整个版本资源约 −20 效用
const VERSION_RESOURCES = 140; // 3.1 版本零氪可获取抽数（样本值，随版本更新）

/** 默认决策权重 = 3.1 版本 + 正常欧非的推导结果 */
export const DEFAULT_DECISION_WEIGHTS = {
  alphaCombat: 0.8, // 强度党：强度 8
  alphaFavor: 0.2, // 喜好 2（几乎不考虑 XP）
  lambdaRisk: RISK_BASE,
  alphaCost: COST_BASE / VERSION_RESOURCES,
};

/**
 * 由「版本可获取资源 + 账号欧非程度」推导 λ_risk 与 α_cost。
 * @param {{versionResources: number, avgPity: number}} input
 *   versionResources：本版本零氪可获取总抽数
 *   avgPity：账号历史平均每 S 消耗抽数（>62 偏非，<62 偏欧）
 */
export function deriveWeights({ versionResources, avgPity }) {
  const luckFactor = avgPity > 0 ? avgPity / EXPECTED_PITY : 1;
  return {
    alphaCombat: 0.8,
    alphaFavor: 0.2,
    lambdaRisk: RISK_BASE * luckFactor, // 越非越怕风险
    alphaCost: versionResources > 0 ? COST_BASE / versionResources : 0, // 资源越少每抽越贵
  };
}

/** 机会成本 = 消耗抽数 × 每抽价值 */
export function opportunityCost(pullsSpent, valuePerPull = 1) {
  return pullsSpent * valuePerPull;
}

/** 总效用：U = α_combat·ΔU + α_favor·U_favor − λ_risk·R − α_cost·C */
export function totalUtility({
  combatDelta,
  favor,
  risk,
  opportunityCost: cost,
  weights = DEFAULT_DECISION_WEIGHTS,
}) {
  return (
    weights.alphaCombat * combatDelta +
    weights.alphaFavor * favor -
    weights.lambdaRisk * risk -
    weights.alphaCost * cost
  );
}

/** 总效用 → [0,1] 推荐分（sigmoid 归一化） */
export function scoreFromUtility(utility, scale = 10) {
  return 1 / (1 + Math.exp(-utility / scale));
}

/** 推荐分 → 结论，阈值 ∈ [0,1] */
export function verdictFromScore(score, thresholds = { pull: 0.6, consider: 0.4 }) {
  if (score >= thresholds.pull) return 'pull';
  if (score >= thresholds.consider) return 'consider';
  return 'skip';
}
