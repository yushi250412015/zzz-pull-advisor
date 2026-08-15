import { characters } from './data/characters.js';
import { banners } from './data/banners.js';
import { systems } from './models/systems.js';
import { DEFAULT_CONFIG } from './core/gacha/config.js';
import { recommendCharacter } from './core/recommend.js';
import { verdictFromUtility } from './core/decision/decision.js';

const $ = (id) => document.getElementById(id);
const VERDICT_LABEL = { pull: '抽', consider: '观望', skip: '跳过' };
const DEFAULT_FAVOR = 50;

const state = {
  resources: { encryptedTapes: 0, polychrome: 0, pity: 0, fails: 0 },
  box: { characters: {} },
  favors: {},
};

function renderResources() {
  $('resources-form').innerHTML = `
    <label>加密母带 <input type="number" data-res="encryptedTapes" min="0" value="0" /></label>
    <label>菲林 <input type="number" data-res="polychrome" min="0" value="0" /></label>
    <label>保底计数 <input type="number" data-res="pity" min="0" max="90" value="0" /></label>
    <label><input type="checkbox" data-res="guaranteed" /> 大保底</label>`;
}

function renderBox() {
  $('box-form').innerHTML = Object.values(characters)
    .map(
      (c) => `
      <label class="chk">
        <input type="checkbox" data-char="${c.id}" />
        <span class="badge ${c.element}">${c.element}</span> ${c.name}（${c.rarity}·${c.role}）
      </label>`,
    )
    .join('');
}

function renderResults() {
  const results = banners.map((banner) => {
    const favor = state.favors[banner.characterId] ?? DEFAULT_FAVOR;
    const r = recommendCharacter({
      box: state.box,
      resources: state.resources,
      characterId: banner.characterId,
      systems,
      bannerCfg: DEFAULT_CONFIG.character,
      favor,
    });
    const verdict = verdictFromUtility(r.utility);
    return { banner, favor, verdict, ...r };
  });

  $('results-list').innerHTML = results
    .map(
      (r) => `
      <div class="card verdict-${r.verdict}">
        <div class="head">
          <span class="name">${characters[r.banner.characterId].name}</span>
          <label class="favor">喜好 <input type="number" data-favor="${r.banner.characterId}" min="0" max="100" value="${r.favor}" /></label>
          <span class="verdict">${VERDICT_LABEL[r.verdict]}</span>
        </div>
        <div class="score">总效用 ${r.utility.toFixed(1)}</div>
        <ul>
          <li>空手风险 ${(r.risk * 100).toFixed(1)}%</li>
          <li>边际效用 +${r.combatDelta.toFixed(2)}</li>
          <li>预算 ${r.pulls} 抽（机会成本 ${r.cost.toFixed(0)}）</li>
        </ul>
      </div>`,
    )
    .join('');
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
}

renderResources();
renderBox();
renderResults();
bindEvents();
