// 体系成型度与协同增益（纯函数）

/**
 * 体系成型度 F(S) ∈ [0,1]。
 * 用可学习贡献向量 θ（system.contributions）加权求和，替代「硬编码灵魂角色 + 简单计数」。
 */
export function formation(box, system) {
  const total = Object.values(system.contributions).reduce((s, w) => s + w, 0);
  if (total <= 0) return 0;
  let owned = 0;
  for (const [id, w] of Object.entries(system.contributions)) {
    if (box.characters[id] && box.characters[id].owned) owned += w;
  }
  return owned / total;
}

/**
 * 体系协同增益 Δ_sys(F)，分段函数：
 *   F < F_min -> 0（未启动）
 *   F_min <= F < 1 -> k·(F - F_min)
 *   F >= 1 -> delta_max（完全成型）
 */
export function synergyGain(F, system) {
  const { F_min = 0.5, delta_max = 10, k = 1 } = system;
  if (F < F_min) return 0;
  if (F >= 1) return delta_max;
  return k * (F - F_min);
}
