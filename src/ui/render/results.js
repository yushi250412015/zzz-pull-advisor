// 推荐结果面板渲染（角色 + 音擎/邦布；只渲染，计算全部走 advisor 契约）
import { $, VERDICT_LABEL, DEFAULT_FAVOR } from '../dom.js';
import { currentWeights, getPool } from '../state.js';

export function renderResults({ state, advisor, characters }) {
  const results = [];
  const metaMap = advisor.metaMap();
  for (const banner of advisor.banners()) {
    if (banner.type !== 'character') continue; // 音擎/邦布走 renderEquipmentResults
    const targets = banner.selectable
      ? banner.selectable.map((id) => ({ id, label: `自选·${characters[id].name}` }))
      : [{ id: banner.characterId, label: '' }];
    // 下半自选混池「首金必不歪」：首金必为所选角色（rateUpChance = 1）
    const cfg = advisor.characterCfg(banner);
    for (const t of targets) {
      const favor = DEFAULT_FAVOR; // 纯强度推荐：喜好恒为中性
      const r = advisor.recommendCharacter({
        box: state.box,
        resources: state.resources,
        characterId: t.id,
        bannerCfg: cfg,
        favor,
        weights: currentWeights(state),
      });
      const owned = !!state.box.characters[t.id]?.owned;
      const verdict = owned ? null : advisor.verdictFor(r.utility, state.thresholds);
      const frontier = owned ? [] : advisor.pullStrategies({
        box: state.box,
        resources: state.resources,
        characterId: t.id,
        bannerCfg: cfg,
        favor,
        weights: currentWeights(state),
      });
      const downside = advisor.downsideRisk(cfg, { pity: state.resources.pity || 0, fails: state.resources.fails || 0 });
      results.push({
        banner,
        characterId: t.id,
        label: t.label,
        favor,
        verdict,
        owned,
        score: advisor.scoreOf(r.utility),
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
// —— 音擎 / 邦布推荐结果 ——
export function renderEquipmentResults({ state, advisor, characters }) {
  const cards = [];
  for (const banner of advisor.banners()) {
    if (banner.type !== 'weapon' && banner.type !== 'bangboo') continue;
    const isWeapon = banner.type === 'weapon';
    const equipment = advisor.equipmentFor(banner);
    if (!equipment) continue;
    const ownedNames = isWeapon
      ? (getPool(state, 'weapon').sList || []).map((s) => s.name)
      : (getPool(state, 'bangboo').sList || []).map((s) => s.name);
    const owned = ownedNames.includes(equipment.name);
    const favor = DEFAULT_FAVOR; // 纯强度推荐：喜好恒为中性
    const r = advisor.recommendEquipment({
      kind: banner.type,
      equipment,
      box: state.box,
      resources: state.resources,
      favor,
      weights: currentWeights(state),
      owned,
      poolState: isWeapon ? { pity: getPool(state, 'weapon').pity, fails: 0 } : { pity: getPool(state, 'bangboo').pity, fails: 0 },
    });
    const score = advisor.scoreOf(r.utility);
    const verdict = owned ? null : advisor.verdictFor(r.utility, state.thresholds);
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
          <li>装备价值 +${r.combatDelta.toFixed(2)}${owned ? '' : `（${isWeapon ? `边际效用 × ${advisor.equipmentDefaults().weaponValueRatio}` : '基础+元素+同伴 先验'}）`}</li>
          <li>预算 ${r.pulls} 抽（机会成本 ${r.cost.toFixed(0)}）</li>
        </ul>
      </div>`);
  }
  $('equipment-results').innerHTML = cards.join('');
}
