import { characters } from './data/characters.js';
import { banners } from './data/banners.js';
import { systems } from './models/systems.js';
import { DEFAULT_CONFIG } from './core/gacha/config.js';
import { boxCombatValue } from './core/utility/utility.js';
import { downsideRiskPulls } from './core/gacha/downside.js';
import { buildMetaPosteriors } from './core/bayes/meta-posterior.js';
import { confidenceInterval } from './core/bayes/kalman.js';
import { observations } from './data/observations.js';
import { extractGachaPageUrl, extractGachaType } from './datasource/gacha-log.js';
import { recommendEquipment, EQUIPMENT_DEFAULTS } from './core/recommend-equipment.js';
import { buildPullStrategies } from './core/decision/pull-strategies.js';
import { buildPlanningScenarios } from './core/decision/planning.js';
import { weapons, bangboos } from './data/equipment.js';
import { officialFacts } from './data/official-facts.js';
import { buildWikiUrl } from './datasource/announcement.js';
import { recommendCharacter } from './core/recommend.js';
import { verdictFromScore, scoreFromUtility, deriveWeights, VERSION_RESOURCES } from './core/decision/decision.js';
import { mctsPlan } from './core/decision/mcts.js';
import { myAccount } from './data/my-account.js';

const $ = (id) => document.getElementById(id);
const VERDICT_LABEL = { pull: '抽', consider: '观望', skip: '跳过' };
const DEFAULT_FAVOR = 50;

const state = {
  resources: { encryptedTapes: 0, polychrome: 0, pity: 0, fails: 0 },
  box: { characters: {} },
  account: myAccount, // 四池 / box 数据源（初始 08-15 快照，UID 同步后刷新）
  weights: null, // 手动权重；null 时按自动模式推导
  thresholds: { pull: 0.6, consider: 0.4 },
  autoWeights: true,
};

/** 当前生效权重：自动模式按「版本资源 + 账号欧非」推导，否则用手动值；喜好权重恒为 0（纯强度推荐） */
function currentWeights() {
  const w = state.autoWeights
    ? deriveWeights({
        versionResources: VERSION_RESOURCES,
        avgPity: state.account.luck.avgPullsPerAgentS, // 0=未同步按正常欧非；同步后按账号实际校准 λ_risk
      })
    : state.weights;
  return { ...w, alphaFavor: 0 };
}

function renderWeights() {
  const w = currentWeights();
  $('w-combat').value = w.alphaCombat;
  $('w-risk').value = Math.round(w.lambdaRisk * 100) / 100;
  $('w-cost').value = Math.round(w.alphaCost * 1000) / 1000;
  $('t-pull').value = state.thresholds.pull;
  $('t-consider').value = state.thresholds.consider;
  $('w-auto').checked = state.autoWeights;
  $('w-risk').disabled = state.autoWeights;
  $('w-cost').disabled = state.autoWeights;
}

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

// 全角色 Kalman 后验表（可信度面板与推荐引擎共用同一口径；每轮渲染重建，代价可忽略）
function currentMetaMap() {
  const posteriors = buildMetaPosteriors(characters, observations);
  const map = {};
  for (const [id, p] of Object.entries(posteriors)) map[id] = p.mu;
  return map;
}

function renderResults() {
  const results = [];
  const metaMap = currentMetaMap();
  for (const banner of banners) {
    if (banner.type !== 'character') continue; // 音擎/邦布走 renderEquipmentResults
    const targets = banner.selectable
      ? banner.selectable.map((id) => ({ id, label: `自选·${characters[id].name}` }))
      : [{ id: banner.characterId, label: '' }];
    // 下半自选混池「首金必不歪」：首金必为所选角色（rateUpChance = 1）
    const cfg = banner.firstGoldGuaranteed
      ? { ...DEFAULT_CONFIG.character, rateUpChance: 1 }
      : DEFAULT_CONFIG.character;
    for (const t of targets) {
      const favor = DEFAULT_FAVOR; // 纯强度推荐：喜好恒为中性
      const r = recommendCharacter({
        box: state.box,
        resources: state.resources,
        characterId: t.id,
        systems,
        bannerCfg: cfg,
        favor,
        weights: currentWeights(),
        characters,
        metaMap,
      });
      const owned = !!state.box.characters[t.id]?.owned;
      const verdict = owned ? null : verdictFromScore(scoreFromUtility(r.utility), state.thresholds);
      const frontier = owned ? [] : buildPullStrategies({
        box: state.box,
        resources: state.resources,
        characterId: t.id,
        systems,
        bannerCfg: cfg,
        favor,
        weights: currentWeights(),
      });
      const downside = downsideRiskPulls(cfg, { pity: state.resources.pity || 0, fails: state.resources.fails || 0 }, 0.9);
      results.push({
        banner,
        characterId: t.id,
        label: t.label,
        favor,
        verdict,
        owned,
        score: scoreFromUtility(r.utility),
        guaranteedFirst: !!banner.firstGoldGuaranteed,
        paretoPulls: frontier.map((s) => s.pulls),
        cvarPulls: downside.cvarPulls,
        ...r,
      });
    }
  }

  $('results-list').innerHTML = results
    .map(
      (r) => `
      <div class="card ${r.owned ? '' : `verdict-${r.verdict}`}">
        <div class="head">
          <span class="name">${r.label || characters[r.characterId].name}</span>
          ${r.guaranteedFirst ? '<span class="tag">首金必不歪</span>' : ''}
          ${r.owned ? '<span class="verdict">已拥有</span>' : `<span class="verdict">${VERDICT_LABEL[r.verdict]}</span>`}
        </div>
        <div class="score">推荐分 ${(r.score * 100).toFixed(0)} / 100（总效用 ${r.utility.toFixed(1)}）</div>
        ${r.owned
          ? '<div class="hint">已拥有该角色（影画收益暂未建模，按需自行权衡）</div>'
          : `<ul>
          <li>空手风险 ${(r.risk * 100).toFixed(1)}%</li>
          <li>边际效用 +${r.combatDelta.toFixed(2)}</li>
          <li>预算 ${r.pulls} 抽（机会成本 ${r.cost.toFixed(0)}）</li>
          <li>最差 10% 期望抽数（CVaR90）：${r.cvarPulls.toFixed(0)} 抽</li>
          ${r.paretoPulls.length > 1 ? '<li>帕累托最优预算：' + r.paretoPulls.map((p) => p + ' 抽').join(' / ') + '</li>' : ''}
        </ul>`}
      </div>`,
    )
    .join('');
}

// —— 我的真实账号 · 四池状态（初始 2026-08-15 快照；UID 同步后自动刷新） ——
function renderPools() {
  const pools = [
    { label: '独家角色池', key: 'limited' },
    { label: '常驻角色池', key: 'standard' },
    { label: '音擎池', key: 'weapon' },
    { label: '邦布池', key: 'bangboo' },
  ];
  $('pools-list').innerHTML = pools
    .map(({ label, key }) => {
      const p = state.account[key];
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
    .join('') +
    (state.account.uid
      ? '<p class="hint">欧非（全账号）：代理人池平均 ' + state.account.luck.avgPullsPerAgentS +
        ' 抽/S（理论期望 62.5，越低越欧）· 独家池胜率 ' + Math.round(state.account.luck.limitedWinRate * 100) + '% · 全账号 ' + state.account.luck.totalPulls + ' 抽 · UID ' + state.account.uid + ' · 解析 ' + (state.account.analyzedAt || '—') + '</p>'
      : '<p class="hint">尚未同步：以上为示例占位数据（不含真实个人信息）。运行 <code>node scripts/import-records.mjs --serve</code>，再到「账号同步」面板输入 UID，即可一键获取你的真实 box / 保底 / 欧非。</p>')
}

// —— 官方情报（3.1 公告快照，静态数据避免浏览器 CORS） ——
const ELEMENT_LABEL = { fire: '火', ice: '冰', electric: '电', physical: '物理', ether: '以太', wind: '风', lumiflux: '流明' };
const ROLE_LABEL = { attack: '强攻', anomaly: '异常', stun: '击破', support: '支援', defense: '防护', rupture: '命破' };

function renderOfficialFacts() {
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

// —— 强度可信度（Kalman 多源后验；观测源与权重见 observations.js） ——
function renderMetaConfidence() {
  const posteriors = buildMetaPosteriors(characters, observations);
  const rows = Object.entries(posteriors)
    .map(([id, p]) => {
      const c = characters[id];
      if (!c || c.meta == null) return '';
      const ci = confidenceInterval(p);
      const delta = p.mu - c.meta;
      const arrow = Math.abs(delta) < 1 ? '≈' : delta > 0 ? '↑' : '↓';
      return (
        '<div class="conf-row"><span class="conf-name">' + c.name + '</span>' +
        '<span>先验 ' + c.meta + ' → 后验 ' + p.mu.toFixed(1) + ' ' + arrow +
        '（95% CI ' + ci.min.toFixed(0) + '–' + ci.max.toFixed(0) + '）</span></div>'
      );
    })
    .join('');
  $('meta-confidence').innerHTML = rows;
}

// —— 账号同步备用通道：上传日志 → 提取抽卡 H5 页面 URL（一键同步走上方 --serve 本地服务） ——
function bindImportPanel() {
  const fileInput = $('import-log-file');
  const urlBox = $('import-url');
  const status = $('import-status');
  fileInput.addEventListener('change', async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const text = await file.text();
    const url = extractGachaPageUrl(text);
    urlBox.value = url || '';
    if (url) {
      const gt = extractGachaType(url);
      status.textContent = `已提取页面 URL（gacha_type=${gt || '未知'}，authkey 已含在其中）。复制后执行 node scripts/import-records.mjs --url，或在上方用 UID 一键同步（需先启动本地服务）。`;
    } else {
      status.textContent = '未在该文件中找到抽卡 H5 页面 URL。请先在游戏内打开一次抽卡记录页（生成含 authkey 的 URL），再上传 Player.log / NAP_*.log。';
    }
  });
  $('copy-import-url').addEventListener('click', () => {
    const v = urlBox.value;
    if (!v) return;
    try {
      navigator.clipboard.writeText(v);
      status.textContent = '已复制页面 URL。';
    } catch {
      urlBox.select();
      status.textContent = '自动复制失败，已选中文本，请手动 Ctrl+C。';
    }
  });
}

// —— 账号同步：输入 UID → 本地服务抓取四池记录 → 刷新 box / 保底 / 欧非 ——
// 官方没有「输入 UID 直查」接口：抽卡记录 API 必须带游戏日志中的 authkey（约 1 天过期）。
// 启动本地服务：node scripts/import-records.mjs --serve（http://localhost:8787）
const SYNC_ENDPOINT = 'http://localhost:8787';

function renderSyncPanel() {
  $('sync-status').innerHTML =
    '尚未同步。输入游戏内 UID 后点击「同步账号」；若提示失败，请先运行 <code>node scripts/import-records.mjs --serve</code>。';
}

function applyAccountSummary(summary, uid) {
  const pools = summary.pools || {};
  const mapPool = (key) => {
    const p = pools[key] || { pulls: 0, pity: 0, fails: 0, sCount: 0, sList: [] };
    const sList = (p.sList || []).map((s) => ({ name: s.name, date: s.time || s.date || null, lost: !!s.lost, count: s.count || 1 }));
    return {
      pulls: p.pulls || 0,
      pity: p.pity || 0,
      fails: p.fails || 0,
      sCount: p.sCount || 0,
      sList,
      lastS: sList.length ? { name: sList[sList.length - 1].name } : null,
    };
  };
  const luck = summary.luck || {};
  state.account = {
    uid: uid || state.account.uid,
    analyzedAt: new Date().toISOString().slice(0, 10),
    box: summary.box || [],
    limited: mapPool('limited'),
    standard: mapPool('standard'),
    weapon: mapPool('weapon'),
    bangboo: mapPool('bangboo'),
    luck: {
      totalPulls: luck.totalPulls || 0,
      agentPulls: luck.agentPulls || 0,
      agentSCount: luck.agentSCount || 0,
      avgPullsPerAgentS: luck.avgPullsPerAgentS || 0,
      limitedWinRate: luck.limitedWinRate || 0,
    },
  };
  // 同步 box → 勾选；独家池保底 → 资源表单；再整体重算
  state.box.characters = {};
  for (const id of state.account.box) state.box.characters[id] = { owned: true, mindscape: 0 };
  for (const el of document.querySelectorAll('[data-char]')) {
    el.checked = !!state.box.characters[el.dataset.char];
  }
  state.resources.pity = state.account.limited.pity || 0;
  state.resources.fails = state.account.limited.fails >= 1 ? 1 : 0;
  renderResources();
  renderPools();
  renderResults();
  renderEquipmentResults();
  renderWeights();
}

async function syncAccount() {
  const uid = ($('sync-uid').value || '').trim();
  const status = $('sync-status');
  if (!uid) {
    status.innerHTML = '<span class="verdict verdict-skip">请先输入游戏内 UID（用于校验同步的是不是你的账号）。</span>';
    return;
  }
  status.innerHTML = '正在连接本地服务并抓取四池记录……（首次约需数秒）';
  try {
    const res = await fetch(SYNC_ENDPOINT + '/sync?uid=' + encodeURIComponent(uid));
    const data = await res.json().catch(() => null);
    if (!res.ok || !data || !data.ok) throw new Error((data && data.message) || '服务返回异常');
    if (!data.uidMatched) {
      status.innerHTML = '<span class="verdict verdict-skip">UID 不一致</span>：日志账号 ' + data.uid + ' ≠ 输入 ' + uid + '。请确认当前登录的账号。';
      return;
    }
    applyAccountSummary(data.summary, data.uid);
    status.innerHTML = '<span class="verdict verdict-pull">同步成功</span> UID ' + data.uid + ' · 四池共 ' + data.recordCount +
      ' 条记录 · ' + new Date(data.generatedAt).toLocaleString() + '。box / 保底 / 欧非已刷新，全部推荐已按最新状态重算。';
  } catch (e) {
    status.innerHTML = '<span class="verdict verdict-skip">同步失败：' + e.message + '</span> 请确认已运行 <code>node scripts/import-records.mjs --serve</code>，且游戏内最近打开过抽卡记录页（authkey 约 1 天过期）。';
  }
}

// —— 音擎 / 邦布推荐结果 ——
function renderEquipmentResults() {
  const cards = [];
  for (const banner of banners) {
    if (banner.type !== 'weapon' && banner.type !== 'bangboo') continue;
    const isWeapon = banner.type === 'weapon';
    const equipment = isWeapon ? weapons[banner.weaponId] : bangboos[banner.bangbooId];
    if (!equipment) continue;
    const ownedNames = isWeapon
      ? (state.account.weapon.sList || []).map((s) => s.name)
      : (state.account.bangboo.sList || []).map((s) => s.name);
    const owned = ownedNames.includes(equipment.name);
    const favor = DEFAULT_FAVOR; // 纯强度推荐：喜好恒为中性
    const r = recommendEquipment({
      kind: banner.type,
      equipment,
      characters,
      box: state.box,
      resources: state.resources,
      systems,
      favor,
      weights: currentWeights(),
      owned,
      poolState: isWeapon ? { pity: state.account.weapon.pity, fails: 0 } : { pity: state.account.bangboo.pity, fails: 0 },
    });
    const score = scoreFromUtility(r.utility);
    const verdict = owned ? null : verdictFromScore(score, state.thresholds);
    const ownerLabel = isWeapon
      ? `对应角色：${characters[equipment.ownerId]?.name || '?'}${equipment.pairing === 'inferred' ? '（配对推断，待实装核实）' : ''}`
      : `阵营同伴：${characters[equipment.companionId]?.name || '?'} · 元素 ${equipment.element || '?'}`;
    const riskText = r.risk === null ? '—（官方概率待核实）' : `${(r.risk * 100).toFixed(1)}%`;
    cards.push(`
      <div class="card ${owned ? '' : `verdict-${verdict}`}">
        <div class="head">
          <span class="name">${equipment.name}<span class="eq-tag">${isWeapon ? '音擎' : '邦布'}</span></span>
          ${owned ? '<span class="verdict">已拥有</span>' : `<span class="verdict">${VERDICT_LABEL[verdict]}</span>`}
        </div>
        <div class="score">${ownerLabel}${owned ? '' : ` · 推荐分 ${(score * 100).toFixed(0)} / 100（总效用 ${r.utility.toFixed(1)}）`}</div>
        <ul>
          <li>空手风险 ${riskText}${isWeapon ? '（音擎池 75/25 · 无定轨）' : ''}</li>
          <li>装备价值 +${r.combatDelta.toFixed(2)}${owned ? '' : `（${isWeapon ? `边际效用 × ${EQUIPMENT_DEFAULTS.weaponValueRatio}` : '基础+元素+同伴 先验'}）`}</li>
          <li>预算 ${r.pulls} 抽（机会成本 ${r.cost.toFixed(0)}）</li>
        </ul>
      </div>`);
  }
  $('equipment-results').innerHTML = cards.join('');
}

// —— 时序规划 MCTS：场景由卡池数据自动生成（现在抽 vs 攒给未来新角色） ——
function renderMctsScenarios() {
  state.scenarios = buildPlanningScenarios(banners, characters);
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

function runScenario(id) {
  const scenario = state.scenarios.find((s) => s.id === id);
  if (!scenario) return;
  const target = document.querySelector(`[data-scenario-result="${id}"]`);
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
    banners: scenario.bannerSequence,
    bannerCfg: DEFAULT_CONFIG.character,
    pity: state.resources.pity || 0,
    fails: state.resources.fails || 0,
    box: state.box,
    systems,
  };
  // 评估口径：θ 体系成型收益 + meta 后验项（与推荐卡同一 metaMap 口径）
  const metaMap = currentMetaMap();
  const result = mctsPlan(initialState, {
    iterations,
    valueFn: (box, sys) => boxCombatValue(box, sys, characters, undefined, metaMap),
  });
  const best = result.reduce((a, b) => (a.avgValue > b.avgValue ? a : b));
  const futureName = characters[scenario.futureTargetId].name;
  const describe = (r) =>
    r.action === 0
      ? `现在不抽，全部攒给「${futureName}」`
      : `现在抽 ${r.action} 抽（${Math.round((r.action / pulls) * 100)}%），余下攒给「${futureName}」`;
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
      ? `结论：在 ${iterations} 次模拟中，「全部攒给「${futureName}」」（平均成型收益 ${best.avgValue.toFixed(2)}）优于现在抽。`
      : `结论：MCTS 建议现在投入 ${best.action} 抽（平均成型收益 ${best.avgValue.toFixed(2)}），余下攒给「${futureName}」。`;
  target.innerHTML = `
    <div class="mcts-summary">${conclusion}</div>
    ${rows}
    <p class="hint">MCTS 只优化「box 成型收益」（当前体系先验）；空手风险未计入。结果随随机模拟波动，资源变动后需重新运行。预算单位：加密母带 + 菲林 ÷ 160。</p>`;
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

  $('sync-btn').addEventListener('click', syncAccount);
  $('sync-uid').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') syncAccount();
  });
  bindImportPanel();

  // MCTS 场景运行按钮（场景由卡池数据动态生成，用事件委托）
  document.addEventListener('click', (event) => {
    if (event.target.classList && event.target.classList.contains('mcts-run')) {
      runScenario(event.target.dataset.scenario);
    }
  });

  // 权重面板：改动（失焦）即时生效；任何手动改动切换为手动模式
  document.addEventListener('change', (event) => {
    const id = event.target.id;
    if (['w-combat', 'w-risk', 'w-cost'].includes(id)) {
      if (state.autoWeights) {
        state.autoWeights = false;
        state.weights = { ...currentWeights() };
      }
      if (id === 'w-combat') state.weights.alphaCombat = Number(event.target.value) || 0;
      if (id === 'w-risk') state.weights.lambdaRisk = Number(event.target.value) || 0;
      if (id === 'w-cost') state.weights.alphaCost = Number(event.target.value) || 0;
      renderWeights();
      renderResults();
    } else if (id === 't-pull' || id === 't-consider') {
      state.thresholds[id === 't-pull' ? 'pull' : 'consider'] = Number(event.target.value) || 0;
      renderResults();
    } else if (id === 'w-auto') {
      state.autoWeights = event.target.checked;
      if (!state.autoWeights && !state.weights) state.weights = { ...currentWeights() };
      renderWeights();
      renderResults();
    }
  });

  $('reset-weights').addEventListener('click', () => {
    state.weights = null;
    state.autoWeights = true;
    state.thresholds = { pull: 0.6, consider: 0.4 };
    renderWeights();
    renderResults();
  });
}

renderResources();
renderBox();
renderPools();
renderResults();
renderEquipmentResults();
renderOfficialFacts();
renderSyncPanel();
renderMetaConfidence();
renderWeights();
renderMctsScenarios();
bindEvents();
