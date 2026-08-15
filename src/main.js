import { characters } from './data/characters.js';
import { banners } from './data/banners.js';
import { systems } from './models/systems.js';
import { DEFAULT_CONFIG } from './core/gacha/config.js';
import { recommendCharacter } from './core/recommend.js';
import { verdictFromScore, scoreFromUtility } from './core/decision/decision.js';
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
}

renderResources();
renderBox();
renderResults();
bindEvents();
