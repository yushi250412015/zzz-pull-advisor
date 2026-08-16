// 音擎 / 邦布推荐（纯函数）
// 概率：音擎池用 DEFAULT_CONFIG.weapon（75/25、无定轨、硬保底 80；软保底 66 待核实）
// 价值模型（保守，参数全部可调，先验待实测校准——不臆造「具体数值」，只建模结构）：
//   - 专武价值 = 角色边际效用 × weaponValueRatio（默认 0.6）；未拥有对应角色时价值 0（UI 提示「先有角色再考虑专武」）
//   - 邦布价值 = 基础值 + 元素匹配（box 内有同元素代理人）+ 阵营同伴加成（拥有 companionId 角色）
// 邦布池官方概率数据暂不可得（官方概率页地区受限）→ risk 返回 null（按 0 计，UI 标注「概率待官方核实」）

import { probabilityOfRateUp } from './gacha/pity.js';
import { DEFAULT_CONFIG } from './gacha/config.js';
import { marginalUtility } from './utility/utility.js';
import { totalUtility, opportunityCost } from './decision/decision.js';

export const EQUIPMENT_DEFAULTS = {
  weaponValueRatio: 0.6, // 专武价值 ≈ 角色边际效用的 60%（可学习参数，先验）
  bangbooBaseValue: 6, // S 邦布基础价值（先验）
  bangbooElementBonus: 4, // 元素匹配加成（先验）
  bangbooCompanionBonus: 2, // 阵营同伴加成（先验）
};

/** 专武价值：拥有角色时 = 「角色对 box 的贡献」× 比例（把角色从 box 拿掉再算边际，避免已拥有时恒为 0）；未拥有为 0 */
export function weaponValue(box, systems, weapon, params = EQUIPMENT_DEFAULTS) {
  const ownerId = weapon.ownerId;
  if (!ownerId || !box.characters[ownerId]?.owned) return 0;
  const boxWithoutOwner = { characters: { ...box.characters } };
  delete boxWithoutOwner.characters[ownerId];
  return marginalUtility(boxWithoutOwner, ownerId, systems) * params.weaponValueRatio;
}

/** 邦布价值：基础值 + 元素匹配 + 阵营同伴（先验参数） */
export function bangbooValue(box, characters, bangboo, params = EQUIPMENT_DEFAULTS) {
  let v = params.bangbooBaseValue;
  const hasElement = Object.values(characters).some(
    (c) => c.element === bangboo.element && box.characters[c.id]?.owned,
  );
  if (hasElement) v += params.bangbooElementBonus;
  if (bangboo.companionId && box.characters[bangboo.companionId]?.owned) v += params.bangbooCompanionBonus;
  return v;
}

/**
 * 音擎/邦布推荐。
 * @param {object} input
 *   kind: 'weapon' | 'bangboo'
 *   equipment: weapons/bangboos 注册表条目
 *   owned: 是否已拥有该音擎/邦布（调用方从真实账号数据传入）
 *   poolState: {pity, fails}（音擎池用真实账号保底；邦布池概率暂缺）
 */
export function recommendEquipment({
  kind,
  equipment,
  characters,
  box,
  resources,
  systems,
  favor,
  weights,
  owned = false,
  poolState = { pity: 0, fails: 0 },
  params = EQUIPMENT_DEFAULTS,
}) {
  const pulls = (resources.encryptedTapes || 0) + Math.floor((resources.polychrome || 0) / 160);
  const cfg = kind === 'weapon' ? DEFAULT_CONFIG.weapon : null; // 邦布池官方概率暂不可得
  const risk = cfg
    ? 1 - probabilityOfRateUp(pulls, cfg, { pity: poolState.pity || 0, fails: poolState.fails || 0 })
    : null;
  const combatDelta =
    kind === 'weapon' ? weaponValue(box, systems, equipment, params) : bangbooValue(box, characters, equipment, params);
  const cost = opportunityCost(pulls);
  const utility = totalUtility({ combatDelta, favor, risk: risk ?? 0, opportunityCost: cost, weights });
  return { pulls, risk, combatDelta, cost, utility, owned };
}
