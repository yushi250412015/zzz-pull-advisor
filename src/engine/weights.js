// 核心权重与阈值。
// 这是「算法与核心权重要素」的配置入口：后续提供的算法/权重直接在这里调整。

export const DEFAULT_WEIGHTS = {
  /** 角色基础 meta 分权重（0-1），meta 来自数据层 */
  metaWeight: 0.5,
  /** 已拥有该角色时的扣分（越大越倾向跳过已拥有的角色） */
  ownershipPenalty: 100,
  /** 缺少该属性覆盖时的加分（越大越倾向补属性缺口） */
  elementCoverage: 25,
  /** 每拥有一名核心队友的加分 */
  synergy: 20,
  /** 资源不足以大保底时的扣分（按缺口比例） */
  resourceShortage: 30,
  /** 大保底所需抽数 */
  pitySafetyThreshold: 160,
  /** 结论映射阈值：score >= pull -> 抽；>= consider -> 观望；否则跳过 */
  verdictThresholds: { pull: 50, consider: 30 },
};
