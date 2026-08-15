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
