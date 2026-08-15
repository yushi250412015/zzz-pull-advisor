// 抽卡记录解析（纯函数）：从记录推导 box / 保底 / 大保底状态

/**
 * 从抽卡记录解析 box、保底计数、连续歪次数。
 * @param {Array<{name: string, rank_type: string, time?: string}>} records 抽卡记录（任意顺序）
 * @param {Set<string>} standardSet 常驻 S 级角色名集合（用于判断是否「歪」）
 * @returns {{box: Set<string>, pity: number, fails: number}}
 *   - pity：距上次 S 的非 S 抽数
 *   - fails：连续歪（非 UP）次数；fails >= guaranteeAfterFails 即处于大保底
 */
export function parseGachaHistory(records, standardSet) {
  const sorted = [...records].sort((a, b) =>
    String(a.time || '').localeCompare(String(b.time || '')),
  );
  const box = new Set();
  let pity = 0;
  let fails = 0;

  for (const rec of sorted) {
    box.add(rec.name);
    if (rec.rank_type === '5') {
      fails = standardSet.has(rec.name) ? fails + 1 : 0;
      pity = 0;
    } else {
      pity += 1;
    }
  }
  return { box, pity, fails };
}
