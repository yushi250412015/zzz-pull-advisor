// 时序贝叶斯更新：Kalman 滤波（状态空间模型）
// 隐效用 U*(t) 随机游走漂移 + 带噪声观测 → 后验 (μ, σ²)

/** 多源观测加权融合（权重归一化），对应 Û(t) = Σ w·Û */
export function weightedObservation(pairs) {
  const total = pairs.reduce((s, p) => s + p.weight, 0);
  if (total === 0) return 0;
  return pairs.reduce((s, p) => s + p.value * p.weight, 0) / total;
}

/**
 * 单步 Kalman 预测 + 更新。
 * @param {{mu: number, variance: number}} prior 先验（均值、方差）
 * @param {number} observation 观测值
 * @param {number} processNoiseQ 过程噪声（版本漂移强度）
 * @param {number} measurementNoiseR 测量噪声（观测可信度，越小越可信）
 */
export function kalmanStep(prior, observation, processNoiseQ, measurementNoiseR) {
  const predVar = prior.variance + processNoiseQ;
  const K = predVar / (predVar + measurementNoiseR);
  const mu = prior.mu + K * (observation - prior.mu);
  const variance = (1 - K) * predVar;
  return { mu, variance };
}

/** 对观测序列逐次更新，返回最终后验 */
export function kalmanFilterSeries(prior, observations, processNoiseQ, measurementNoiseR) {
  let state = prior;
  for (const obs of observations) {
    state = kalmanStep(state, obs, processNoiseQ, measurementNoiseR);
  }
  return state;
}

/** 后验置信区间 [μ - z·σ, μ + z·σ] */
export function confidenceInterval(posterior, z = 1.96) {
  const sigma = Math.sqrt(posterior.variance);
  return { min: posterior.mu - z * sigma, max: posterior.mu + z * sigma };
}
