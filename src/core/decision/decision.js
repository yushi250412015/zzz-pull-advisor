// 决策优化：总效用函数与机会成本（纯函数）

export const DEFAULT_DECISION_WEIGHTS = {
  alphaCombat: 0.7, // 实战强度权重（与 alphaFavor 之和为 1）
  alphaFavor: 0.3, // 主观喜好权重
  lambdaRisk: 50, // 风险厌恶系数
  alphaCost: 0.5, // 机会成本权重
};

/** 机会成本 = 消耗抽数 × 每抽价值 */
export function opportunityCost(pullsSpent, valuePerPull = 1) {
  return pullsSpent * valuePerPull;
}

/**
 * 总效用：U = α_combat·ΔU + α_favor·U_favor − λ_risk·R − α_cost·C
 * @param {{combatDelta: number, favor: number, risk: number, opportunityCost: number, weights?: object}} input
 */
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
