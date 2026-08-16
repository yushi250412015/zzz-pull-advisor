// box 效用与边际效用（纯函数）
import { formation, synergyGain } from './formation.js';

/** box 总效用 = 各体系协同增益之和（MVP 简化：体系级，队伍级枚举后续接入） */
export function boxUtility(box, systems) {
  return Object.values(systems).reduce((sum, system) => {
    return sum + synergyGain(formation(box, system), system);
  }, 0);
}

/** 边际效用：把某角色加入 box 前后的效用差 */
export function marginalUtility(box, characterId, systems) {
  const before = boxUtility(box, systems);
  const after = boxUtility(
    {
      ...box,
      characters: { ...box.characters, [characterId]: { owned: true, mindscape: 0 } },
    },
    systems,
  );
  return after - before;
}

// —— meta 先验接入（2026-08 建模修正）：社区强度分（0-100，已校准）作为与 θ 体系增益「并列」的独立效用项 ——
// 动机：θ 只覆盖有体系数据的角色；琉音/希格莉德/千夏等 T0 角色不在任何体系 → 边际效用恒 0，推荐失真。
// metaScale 为可学习参数（默认 5，量级与体系 delta_max 10-12 可比）；meta=null（未知）贡献 0，不臆造。
export const META_UTILITY_DEFAULTS = { metaScale: 5 };

/** 单角色 meta 先验项：meta/100 × metaScale；meta 为 null 时 0 */
export function metaUtility(character, params = META_UTILITY_DEFAULTS) {
  const meta = character && character.meta;
  if (meta == null) return 0;
  return (meta / 100) * params.metaScale;
}

/** box 内全部角色的 meta 先验项之和 */
export function metaUtilityOfBox(box, characters, params = META_UTILITY_DEFAULTS) {
  let sum = 0;
  for (const c of Object.values(characters)) {
    if (box.characters[c.id] && box.characters[c.id].owned) sum += metaUtility(c, params);
  }
  return sum;
}

/** box 综合战力值 = θ 体系成型收益 + meta 先验项（MCTS 等优化目标的推荐口径） */
export function boxCombatValue(box, systems, characters, params = META_UTILITY_DEFAULTS) {
  return boxUtility(box, systems) + metaUtilityOfBox(box, characters, params);
}
