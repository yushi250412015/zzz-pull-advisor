// 帕累托优化（纯函数）

/** a 是否支配 b：所有目标不劣于 b，且至少一个目标严格更优 */
export function dominates(a, b) {
  let strictlyBetter = false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] < b[i]) return false;
    if (a[i] > b[i]) strictlyBetter = true;
  }
  return strictlyBetter;
}

/**
 * 筛选帕累托前沿。strategies 每项需含 objectives（数值数组，越大越好）。
 * 返回不被任何其他策略支配的策略集合。
 */
export function paretoFrontier(strategies) {
  const frontier = [];
  for (const s of strategies) {
    if (frontier.some((f) => dominates(f.objectives, s.objectives))) continue;
    for (let i = frontier.length - 1; i >= 0; i -= 1) {
      if (dominates(s.objectives, frontier[i].objectives)) frontier.splice(i, 1);
    }
    frontier.push(s);
  }
  return frontier;
}
