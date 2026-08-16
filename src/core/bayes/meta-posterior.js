// 强度 meta 的 Kalman 后验估计（纯函数）：多源观测 → 带不确定度的后验
// 先验 = characters.js 的 meta 点估计（先验方差 100，即 ±10 量级不确定）
// 每条观测的测量噪声 R = measurementNoiseBase / weight²（weight 为源可信度，越高越可信）
// 观测源与可信度分级见 src/data/observations.js

import { kalmanStep } from './kalman.js';

export const POSTERIOR_DEFAULTS = {
  priorVariance: 100, // 先验方差（meta 点估计的不确定性）
  processNoiseQ: 4, // 版本漂移过程噪声（meta 随版本缓慢变化）
  measurementNoiseBase: 36, // 观测噪声基准（weight=1 时 R=36）
};

/** 单角色：先验 meta + 观测序列 → Kalman 后验 {mu, variance} */
export function estimateMeta(priorMeta, observations, params = POSTERIOR_DEFAULTS) {
  let state = { mu: priorMeta, variance: params.priorVariance };
  for (const obs of observations) {
    const w = Math.max(0.05, obs.weight ?? 0.5);
    const R = params.measurementNoiseBase / (w * w);
    state = kalmanStep(state, obs.value, params.processNoiseQ, R);
  }
  return state;
}

/** 全角色后验表（只估计有先验 meta 的角色；无先验不臆造） */
export function buildMetaPosteriors(characters, observations, params = POSTERIOR_DEFAULTS) {
  const byChar = {};
  for (const o of observations) {
    (byChar[o.characterId] ||= []).push(o);
  }
  const out = {};
  for (const c of Object.values(characters)) {
    if (c.meta == null) continue;
    out[c.id] = estimateMeta(c.meta, byChar[c.id] || [], params);
  }
  return out;
}
