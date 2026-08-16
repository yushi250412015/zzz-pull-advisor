// UI 控制器：事件接线与用户动作编排（单一职责：状态归 state、渲染归 render、编排归 controller）
import { $ } from './dom.js';
import { getBudgetPulls, setResource, setOwned, setAccount, resetWeights, currentWeights } from './state.js';
import { fetchAccountSync, mapAccountSummary } from '../datasource/sync-client.js';
import { extractGachaPageUrl, extractGachaType } from '../datasource/gacha-log.js';

// —— 账号同步备用通道：上传日志 → 提取抽卡 H5 页面 URL（一键同步走上方 --serve 本地服务） ——
export function bindImportPanel() {
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
export function runScenario({ state, advisor, characters }, id) {
  const scenario = state.scenarios.find((s) => s.id === id);
  if (!scenario) return;
  const target = document.querySelector(`[data-scenario-result="${id}"]`);
  const iterations = Math.min(5000, Math.max(200, Math.round(Number($('mcts-iterations').value) || 1000)));
  const pulls = getBudgetPulls(state);
  if (pulls <= 0) {
    target.innerHTML = '<p class="hint">当前预算为 0 抽，无可规划。请先在上方填写加密母带 / 菲林。</p>';
    return;
  }
  const initialState = {
    bannerIndex: 0,
    pulls,
    banners: scenario.bannerSequence,
    bannerCfg: advisor.baseCharacterCfg(),
    pity: state.resources.pity || 0,
    fails: state.resources.fails || 0,
    box: state.box,
  };
  // 评估口径：θ 体系成型收益 + meta 后验项（与推荐卡同一 metaMap 口径；由 advisor 注入）
  const result = advisor.plan(initialState, { iterations });
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

/** 同步编排：抓取 → 映射 → 状态落地（失败分型返回、不抛异常；渲染交回调） */
export async function syncAccountFlow({ state }, uid) {
  const result = await fetchAccountSync(uid);
  if (result.ok) setAccount(state, mapAccountSummary(result.data.summary, result.data.uid));
  return result;
}

export function bindEvents({ state, advisor, characters, onRecompute, onWeightsChanged, onSyncSuccess }) {
  document.addEventListener('input', (event) => {
    if (event.target.dataset.res) {
      const key = event.target.dataset.res;
      setResource(state, key, key === 'guaranteed' ? (event.target.checked ? 1 : 0) : Number(event.target.value));
      onRecompute();
    } else if (event.target.dataset.char) {
      setOwned(state, event.target.dataset.char, event.target.checked);
      onRecompute();
    }
  });

  $('sync-btn').addEventListener('click', handleSync);
  $('sync-uid').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') handleSync();
  });
  bindImportPanel();

  async function handleSync() {
    const uid = ($('sync-uid').value || '').trim();
    const status = $('sync-status');
    if (!uid) {
      status.innerHTML = '<span class="verdict verdict-skip">请先输入游戏内 UID（用于校验同步的是不是你的账号）。</span>';
      return;
    }
    status.innerHTML = '正在连接本地服务并抓取四池记录……（首次约需数秒）';
    const result = await syncAccountFlow({ state }, uid);
    if (result.ok) {
      const d = result.data;
      status.innerHTML = '<span class="verdict verdict-pull">同步成功</span> UID ' + d.uid + ' · 四池共 ' + d.recordCount +
        ' 条记录 · ' + new Date(d.generatedAt).toLocaleString() + '。box / 保底 / 欧非已刷新，全部推荐已按最新状态重算。';
      onSyncSuccess();
    } else if (result.kind === 'uid-mismatch') {
      status.innerHTML = '<span class="verdict verdict-skip">UID 不一致</span>：日志账号 ' + result.actualUid + ' ≠ 输入 ' + uid + '。请确认当前登录的账号。';
    } else {
      status.innerHTML = '<span class="verdict verdict-skip">同步失败：' + result.message + '</span> 请确认已运行 <code>node scripts/import-records.mjs --serve</code>，且游戏内最近打开过抽卡记录页（authkey 约 1 天过期）。';
    }
  }

  // MCTS 场景运行按钮（场景由卡池数据动态生成，用事件委托）
  document.addEventListener('click', (event) => {
    if (event.target.classList && event.target.classList.contains('mcts-run')) {
      runScenario({ state, advisor, characters }, event.target.dataset.scenario);
    }
  });

  // 权重面板：改动（失焦）即时生效；任何手动改动切换为手动模式
  document.addEventListener('change', (event) => {
    const id = event.target.id;
    if (['w-combat', 'w-risk', 'w-cost'].includes(id)) {
      if (state.autoWeights) {
        state.autoWeights = false;
        state.weights = { ...currentWeights(state) };
      }
      if (id === 'w-combat') state.weights.alphaCombat = Number(event.target.value) || 0;
      if (id === 'w-risk') state.weights.lambdaRisk = Number(event.target.value) || 0;
      if (id === 'w-cost') state.weights.alphaCost = Number(event.target.value) || 0;
      onWeightsChanged();
      onRecompute();
    } else if (id === 't-pull' || id === 't-consider') {
      state.thresholds[id === 't-pull' ? 'pull' : 'consider'] = Number(event.target.value) || 0;
      onRecompute();
    } else if (id === 'w-auto') {
      state.autoWeights = event.target.checked;
      if (!state.autoWeights && !state.weights) state.weights = { ...currentWeights(state) };
      onWeightsChanged();
      onRecompute();
    }
  });

  $('reset-weights').addEventListener('click', () => {
    resetWeights(state);
    onWeightsChanged();
    onRecompute();
  });
}
