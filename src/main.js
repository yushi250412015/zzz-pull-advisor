import { characters } from './data/characters.js';
import { banners } from './data/banners.js';
import { systems } from './models/systems.js';
import { DEFAULT_CONFIG } from './core/gacha/config.js';
import { recommendCharacter } from './core/recommend.js';
import { verdictFromScore, scoreFromUtility } from './core/decision/decision.js';
import { mctsPlan } from './core/decision/mcts.js';
import { myAccount } from './data/my-account.js';

const $ = (id) => document.getElementById(id);
const VERDICT_LABEL = { pull: '抽', consider: '观望', skip: '跳过' };
const DEFAULT_FAVOR = 50;

const state = {
  resources: { encryptedTapes: 0, polychrome: 0, pity: 0, fails: 0 },
  box: { characters: {} },
  favors: {},
};

function renderResources() {
  const r = state.resources;
  $('resources-form').innerHTML = `
    <label>加密母带 <input type="number" data-res="encryptedTapes" min="0" value="${r.encryptedTapes || 0}" /></label>
    <label>菲林 <input type="number" data-res="polychrome" min="0" value="${r.polychrome || 0}" /></label>
    <label>保底计数（独家池） <input type="number" data-res="pity" min="0" max="90" value="${r.pity || 0}" /></label>
    <label><input type="checkbox" data-res="guaranteed" ${r.fails >= 1 ? 'checked' : ''} /> 大保底</label>`;
}

function renderBox() {
  $('box-form').innerHTML = Object.values(characters)
    .map(
      (c) => `
      <label class="chk">
        <input type="checkbox" data-char="${c.id}" />
        <span class="badge ${c.element || 'unknown'}">${c.element || '?'}</span> ${c.name}（${c.rarity}·${c.role || '?'}）
      </label>`,
    )
    .join('');
}

function renderResults() {
  const results = [];
  for (const banner of banners) {
    const targets = banner.selectable
      ? banner.selectable.map((id) => ({ id, label: `自选·${characters[id].name}` }))
      : [{ id: banner.characterId, label: '' }];
    // 下半自选混池「首金必不歪」：首金必为所选角色（rateUpChance = 1）
    const cfg = banner.firstGoldGuaranteed
      ? { ...DEFAULT_CONFIG.character, rateUpChance: 1 }
      : DEFAULT_CONFIG.character;
    for (const t of targets) {
      const favor = state.favors[t.id] ?? DEFAULT_FAVOR;
      const r = recommendCharacter({
        box: state.box,
        resources: state.resources,
        characterId: t.id,
        systems,
        bannerCfg: cfg,
        favor,
      });
      const verdict = verdictFromScore(scoreFromUtility(r.utility));
      results.push({
        banner,
        characterId: t.id,
        label: t.label,
        favor,
        verdict,
        score: scoreFromUtility(r.utility),
        guaranteedFirst: !!banner.firstGoldGuaranteed,
        ...r,
      });
    }
  }

  $('results-list').innerHTML = results
    .map(
      (r) => `
      <div class="card verdict-${r.verdict}">
        <div class="head">
          <span class="name">${r.label || characters[r.characterId].name}</span>
          ${r.guaranteedFirst ? '<span class="tag">首金必不歪</span>' : ''}
          <label class="favor">喜好 <input type="number" data-favor="${r.characterId}" min="0" max="100" value="${r.favor}" /></label>
          <span class="verdict">${VERDICT_LABEL[r.verdict]}</span>
        </div>
        <div class="score">推荐分 ${(r.score * 100).toFixed(0)} / 100（总效用 ${r.utility.toFixed(1)}）</div>
        <ul>
          <li>空手风险 ${(r.risk * 100).toFixed(1)}%</li>
          <li>边际效用 +${r.combatDelta.toFixed(2)}</li>
          <li>预算 ${r.pulls} 抽（机会成本 ${r.cost.toFixed(0)}）</li>
        </ul>
      </div>`,
    )
    .join('');
}

function loadMyAccount() {
  for (const id of myAccount.box) {
    state.box.characters[id] = { owned: true, mindscape: 0 };
    const el = document.querySelector(`[data-char="${id}"]`);
    if (el) el.checked = true;
  }
  state.resources = {
    encryptedTapes: 0,
    polychrome: 0,
    pity: myAccount.limited.pity,
    fails: myAccount.limited.fails,
  };
  renderResources();
  renderResults();
}

// —— 我的真实账号 · 四池状态（2026-08-15 解析，参考信息） ——
function renderPools() {
  const pools = [
    { label: '独家角色池', key: 'limited' },
    { label: '常驻角色池', key: 'standard' },
    { label: '音擎池', key: 'weapon' },
    { label: '邦布池', key: 'bangboo' },
  ];
  $('pools-list').innerHTML = pools
    .map(({ label, key }) => {
      const p = myAccount[key];
      const sList = (p.sList || [])
        .map((s) => `${s.name}${s.count ? `×${s.count}` : ''}${s.date ? `（${s.date}）` : ''}${s.lost ? '（歪）' : ''}`)
        .join('、');
      return `
      <div class="card pool-card">
        <div class="head">
          <span class="name">${label}</span>
          <span class="pool-stat">S × ${p.sCount}</span>
        </div>
        <ul>
          <li>累计 ${p.pulls} 抽 · 距上次 S ${p.pity} 抽${p.lastS ? `（上次：${p.lastS.name}）` : ''}</li>
          <li>S 级历史：${sList || '—'}</li>
        </ul>
      </div>`;
    })
    .join('');
}

// —— 时序规划 MCTS：现在抽（上半蕾米埃尔）vs 攒给下半希格莉德 ——
function runMcts() {
  const target = $('mcts-result');
  const iterations = Math.min(5000, Math.max(200, Math.round(Number($('mcts-iterations').value) || 1000)));
  const pulls =
    (state.resources.encryptedTapes || 0) + Math.floor((state.resources.polychrome || 0) / 160);
  if (pulls <= 0) {
    target.innerHTML = '<p class="hint">当前预算为 0 抽，无可规划。请先在上方填写加密母带 / 菲林。</p>';
    return;
  }
  const initialState = {
    bannerIndex: 0,
    pulls,
    banners: [
      { id: 'b-remielle', characterId: 'remielle' }, // 现在抽：上半新角色
      { id: 'b-sigrid', characterId: 'sigrid' }, // 攒：下半新角色
    ],
    bannerCfg: DEFAULT_CONFIG.character,
    pity: state.resources.pity || 0,
    fails: state.resources.fails || 0,
    box: state.box,
    systems,
  };
  const result = mctsPlan(initialState, { iterations });
  const best = result.reduce((a, b) => (a.avgValue > b.avgValue ? a : b));
  const describe = (r) =>
    r.action === 0
      ? '现在不抽，全部攒给希格莉德'
      : `现在抽 ${r.action} 抽（${Math.round((r.action / pulls) * 100)}%），余下攒给希格莉德`;
  const rows = result
    .map(
      (r) => `
      <div class="mcts-row ${r.action === best.action ? 'best' : ''}">
        <span>${describe(r)}${r.action === best.action ? '<span class="mcts-tag">MCTS 最优</span>' : ''}</span>
        <span>平均成型收益 ${r.avgValue.toFixed(2)} · 访问 ${r.visits} 次</span>
      </div>`,
    )
    .join('');
  const conclusion =
    best.action === 0
      ? `结论：在 ${iterations} 次模拟中，「全部攒给希格莉德」（平均成型收益 ${best.avgValue.toFixed(2)}）优于现在抽。`
      : `结论：MCTS 建议现在投入 ${best.action} 抽给上半池（平均成型收益 ${best.avgValue.toFixed(2)}），余下攒给希格莉德。`;
  target.innerHTML = `
    <div class="mcts-summary">${conclusion}</div>
    ${rows}
    <p class="hint">说明：MCTS 只优化「box 成型收益」（当前体系先验）；喜好分与空手风险未计入。结果随随机模拟波动，可调迭代数重跑；资源变动后需重新运行。预算单位：加密母带 + 菲林 ÷ 160。</p>`;
}

function bindEvents() {
  document.addEventListener('input', (event) => {
    if (event.target.dataset.res) {
      const key = event.target.dataset.res;
      if (key === 'guaranteed') {
        state.resources.fails = event.target.checked ? 1 : 0;
      } else {
        state.resources[key] = Number(event.target.value);
      }
      renderResults();
    } else if (event.target.dataset.char) {
      const id = event.target.dataset.char;
      state.box.characters[id] = { owned: event.target.checked, mindscape: 0 };
      renderResults();
    }
  });

  // 喜好分用 change（失焦才重算），避免输入过程中重建输入框
  document.addEventListener('change', (event) => {
    if (event.target.dataset.favor) {
      state.favors[event.target.dataset.favor] = Number(event.target.value);
      renderResults();
    }
  });

  $('load-my-account').addEventListener('click', loadMyAccount);
  $('run-mcts').addEventListener('click', runMcts);
}

renderResources();
renderBox();
renderPools();
renderResults();
runMcts();
bindEvents();
