// 情报/权重/MCTS 场景面板渲染（只渲染；计算走 advisor 与 state）
import { $, ELEMENT_LABEL, ROLE_LABEL } from '../dom.js';
import { currentWeights } from '../state.js';

export function renderWeights({ state }) {
  const w = currentWeights(state);
  $('w-combat').value = w.alphaCombat;
  $('w-risk').value = Math.round(w.lambdaRisk * 100) / 100;
  $('w-cost').value = Math.round(w.alphaCost * 1000) / 1000;
  $('t-pull').value = state.thresholds.pull;
  $('t-consider').value = state.thresholds.consider;
  $('w-auto').checked = state.autoWeights;
  $('w-risk').disabled = state.autoWeights;
  $('w-cost').disabled = state.autoWeights;
}
export function renderOfficialFacts({ data: officialFacts, buildWikiUrl }) {
  const f = officialFacts;
  const agentRows = f.agents
    .map(
      (a) =>
        '<li>' + a.name + '（' + (ELEMENT_LABEL[a.element] || a.element) + '·' + (ROLE_LABEL[a.role] || a.role) + '）「' + a.channel +
        '」频段 · <a href="' + buildWikiUrl(a.name) + '" target="_blank" rel="noopener">wiki</a></li>',
    )
    .join('');
  const engineRows = f.engines
    .map((e) => '<li>' + e.name + '（' + (ROLE_LABEL[e.role] || e.role) + '）——' + e.owner + '</li>')
    .join('');
  const bangbooRows = f.bangboos
    .map((b) => '<li>' + b.name + '（' + b.note + '）「' + b.channel + '」频段</li>')
    .join('');
  $('official-facts').innerHTML =
    '<div class="score">' + f.version.number + '「' + f.version.name + '」 · ' + f.window.start + ' → ' + f.window.end +
    ' · 官方公告 API ann_id ' + f.annId + '（快照 ' + f.fetchedAt + '）</div>' +
    '<ul><li>全新代理人：<ul>' + agentRows + '</ul></li>' +
    '<li>全新音擎：<ul>' + engineRows + '</ul></li>' +
    '<li>全新邦布：<ul>' + bangbooRows + '</ul></li>' +
    '<li>公告正文提及角色：' + (f.mentionedCharacters || []).join('、') + '（核心技改动等）</li></ul>';
}
// —— 时序规划 MCTS：场景由卡池数据自动生成（现在抽 vs 攒给未来新角色） ——
export function renderMctsScenarios({ state, advisor }) {
  state.scenarios = advisor.scenarios();
  $('mcts-scenarios').innerHTML =
    state.scenarios
      .map(
        (s) => `
    <div class="mcts-scenario">
      <div class="mcts-scenario-head">
        <span>${s.label}</span>
        <button type="button" class="mcts-run" data-scenario="${s.id}">运行规划</button>
      </div>
      <div class="mcts-scenario-result" data-scenario-result="${s.id}"></div>
    </div>`,
      )
      .join('') || '<p class="hint">当前卡池数据没有可规划的「现在 vs 未来」场景。</p>';
}
export function renderMetaConfidence({ advisor }) {
  const rows = advisor
    .confidenceRows()
    .map(
      (row) =>
        '<div class="conf-row"><span class="conf-name">' + row.name + '</span>' +
        '<span>先验 ' + row.prior + ' → 后验 ' + row.posterior + ' ' + row.arrow +
        '（95% CI ' + row.ciMin + '–' + row.ciMax + '）</span></div>',
    )
    .join('');
  $('meta-confidence').innerHTML = rows;
}
