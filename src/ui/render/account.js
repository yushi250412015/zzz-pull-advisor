// 账号面板渲染（单一职责：只渲染；状态读 state 访问器，不直接深链 account 结构）
import { $ } from '../dom.js';
import { getPool, getAccountLuck } from '../state.js';

export function renderResources({ state }) {
  const r = state.resources;
  $('resources-form').innerHTML = `
    <label>加密母带 <input type="number" data-res="encryptedTapes" min="0" value="${r.encryptedTapes || 0}" /></label>
    <label>菲林 <input type="number" data-res="polychrome" min="0" value="${r.polychrome || 0}" /></label>
    <label>保底计数（独家池） <input type="number" data-res="pity" min="0" max="90" value="${r.pity || 0}" /></label>
    <label><input type="checkbox" data-res="guaranteed" ${r.fails >= 1 ? 'checked' : ''} /> 大保底</label>`;
}
export function renderBox({ characters }) {
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
// —— 我的真实账号 · 四池状态（初始 2026-08-15 快照；UID 同步后自动刷新） ——
export function renderPools({ state }) {
  const pools = [
    { label: '独家角色池', key: 'limited' },
    { label: '常驻角色池', key: 'standard' },
    { label: '音擎池', key: 'weapon' },
    { label: '邦布池', key: 'bangboo' },
  ];
  $('pools-list').innerHTML = pools
    .map(({ label, key }) => {
      const p = getPool(state, key);
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
      ? '<p class="hint">欧非（全账号）：代理人池平均 ' + getAccountLuck(state).avgPullsPerAgentS +
        ' 抽/S（理论期望 62.5，越低越欧）· 独家池胜率 ' + Math.round(getAccountLuck(state).limitedWinRate * 100) + '% · 全账号 ' + getAccountLuck(state).totalPulls + ' 抽 · UID ' + state.account.uid + ' · 解析 ' + (state.account.analyzedAt || '—') + '</p>'
      : '<p class="hint">尚未同步：以上为示例占位数据（不含真实个人信息）。运行 <code>node scripts/import-records.mjs --serve</code>，再到「账号同步」面板输入 UID，即可一键获取你的真实 box / 保底 / 欧非。</p>')
}
export function renderSyncPanel() {
  $('sync-status').innerHTML =
    '尚未同步。输入游戏内 UID 后点击「同步账号」；若提示失败，请先运行 <code>node scripts/import-records.mjs --serve</code>。';
}
