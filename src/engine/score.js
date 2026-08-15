// 评分纯函数：各维度因子，供 recommend 加权汇总。

/** 用户 box 中是否已有该属性的「输出角色」（attack / anomaly，占位启发式，待权重细化） */
export function hasElementCoverage(box, element, characters) {
  const DPS_ROLES = ['attack', 'anomaly'];
  return Object.entries(box.characters).some(
    ([id, entry]) =>
      entry.owned &&
      characters[id] &&
      characters[id].element === element &&
      DPS_ROLES.includes(characters[id].role),
  );
}

/** 统计用户拥有该角色核心队友的数量 */
export function countSynergy(box, character) {
  return (character.coreTeammates || []).filter(
    (id) => box.characters[id] && box.characters[id].owned,
  ).length;
}

/** 资源安全度：当前可投入抽数 / 保底所需抽数，取值 0-1 */
export function resourceSafetyScore(resources, threshold = 160) {
  const pulls = (resources.polychrome || 0) / 160 + (resources.encryptedTapes || 0);
  const safety = pulls / threshold;
  return Math.max(0, Math.min(1, safety));
}

/** 把综合分映射为结论（抽 / 观望 / 跳过） */
export function verdictFromScore(score, thresholds = { pull: 50, consider: 30 }) {
  if (score >= thresholds.pull) return 'pull';
  if (score >= thresholds.consider) return 'consider';
  return 'skip';
}
