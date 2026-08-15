// 多维队伍评价向量与操作系数（纯函数）

// 六维：峰值输出、稳定下限、循环容错、操作成本、环境泛用性、多队复用
// 约定：aggregate 为纯加权和，符号由权重 α 决定（操作成本维度建议取负权重）
export const DIMENSIONS = ['peak', 'floor', 'rotation', 'opCost', 'versatility', 'reuse'];

/** 多维向量按用户权重 α 聚合为单一效用 */
export function aggregateVector(vector, weights) {
  return DIMENSIONS.reduce((sum, d) => sum + (vector[d] || 0) * (weights[d] || 0), 0);
}

const SKILL_MAP = { low: 0.5, mid: 0.75, high: 1.0 };

/** 操作效率系数 k_op ∈ [0.3, 1.0]，由手法水平映射 */
export function skillCoefficient(level) {
  return SKILL_MAP[level] ?? SKILL_MAP.mid;
}

/** 实际可用效用 = 聚合效用 × k_op */
export function effectiveUtility(vector, weights, level) {
  return aggregateVector(vector, weights) * skillCoefficient(level);
}
