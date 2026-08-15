import { characters } from './data/characters.js';
import { banners } from './data/banners.js';
import { generateRecommendations } from './engine/recommend.js';

const $ = (id) => document.getElementById(id);

const state = {
  resources: { polychrome: 0, encryptedTapes: 0, pity: 0, guaranteed: false },
  box: { characters: {} },
};

const VERDICT_LABEL = { pull: '抽', consider: '观望', skip: '跳过' };

function renderResources() {
  $('resources-form').innerHTML = `
    <label>菲林 <input type="number" data-res="polychrome" min="0" value="0" /></label>
    <label>加密母带 <input type="number" data-res="encryptedTapes" min="0" value="0" /></label>
    <label>保底计数 <input type="number" data-res="pity" min="0" max="90" value="0" /></label>
    <label><input type="checkbox" data-res="guaranteed" /> 大保底</label>`;
}

function renderBox() {
  $('box-form').innerHTML = Object.values(characters)
    .map(
      (c) => `
      <label class="chk">
        <input type="checkbox" data-char="${c.id}" />
        <span class="badge ${c.element}">${c.element}</span>
        ${c.name}（${c.rarity} · ${c.role}）
      </label>`,
    )
    .join('');
}

function renderResults() {
  const results = generateRecommendations({
    box: state.box,
    resources: state.resources,
    banners,
    characters,
  });

  $('results-list').innerHTML = results
    .map(
      (r) => `
      <div class="card verdict-${r.verdict}">
        <div class="head">
          <span class="name">${r.character ? r.character.name : r.banner.characterId}</span>
          <span class="verdict">${VERDICT_LABEL[r.verdict] || r.verdict}</span>
        </div>
        <div class="score">综合分 ${r.score}</div>
        <ul>${r.reasons.map((x) => `<li>${x}</li>`).join('')}</ul>
      </div>`,
    )
    .join('');
}

function bindEvents() {
  document.addEventListener('input', (event) => {
    if (event.target.dataset.res) {
      const key = event.target.dataset.res;
      state.resources[key] =
        key === 'guaranteed' ? event.target.checked : Number(event.target.value);
      renderResults();
    } else if (event.target.dataset.char) {
      const id = event.target.dataset.char;
      state.box.characters[id] = { owned: event.target.checked, mindscape: 0 };
      renderResults();
    }
  });
}

renderResources();
renderBox();
renderResults();
bindEvents();
