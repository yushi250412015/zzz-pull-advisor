// 时序规划场景生成（纯函数）：由卡池数据自动生成「现在抽 X vs 攒给 Y」的 MCTS 场景
// 规则（3.1 数据下的默认）：未来目标 = 下半「非自选」新角色（如希格莉德）；
//   若下半没有非自选新角色，退回全部下半目标。当前目标 = 上半各角色（含复刻与自选）。

export function buildPlanningScenarios(banners, characters) {
  const now = banners.filter((b) => b.phase === 'current' && b.type === 'character');
  const secondHalf = banners.filter((b) => b.phase === 'second-half' && b.type === 'character');
  let future = secondHalf.filter((b) => !b.selectable);
  if (future.length === 0) future = secondHalf;

  const scenarios = [];
  for (const nb of now) {
    const nowTargets = nb.selectable ? nb.selectable : [nb.characterId];
    for (const t of nowTargets) {
      for (const fb of future) {
        const futureTargets = fb.selectable ? fb.selectable : [fb.characterId];
        for (const ft of futureTargets) {
          scenarios.push({
            id: `${t}-vs-${ft}`,
            nowTargetId: t,
            futureTargetId: ft,
            label: `现在抽「${characters[t].name}」 vs 攒给「${characters[ft].name}」`,
            bannerSequence: [{ characterId: t }, { characterId: ft }],
          });
        }
      }
    }
  }
  return scenarios;
}
