// UI 状态与最小访问器（单一职责：状态集中管理；最小知识原则：外部模块不深链 account 内部结构）
import { deriveWeights, VERSION_RESOURCES } from '../core/decision/decision.js';
import { myAccount } from '../data/my-account.js';

export const DEFAULT_THRESHOLDS = { pull: 0.6, consider: 0.4 };

export function createState() {
  return {
    resources: { encryptedTapes: 0, polychrome: 0, pity: 0, fails: 0 },
    box: { characters: {} },
    account: myAccount, // 示例占位（不含真实个人信息）；UID 同步后由 setAccount 刷新
    weights: null, // 手动权重；null 时按自动模式推导
    thresholds: { ...DEFAULT_THRESHOLDS },
    autoWeights: true,
    scenarios: [],
  };
}

// —— 最小知识原则：外部模块一律走访问器，不直接深链 state.account.* ——
export function getPool(state, key) {
  return state.account[key] || { pulls: 0, pity: 0, fails: 0, sCount: 0, sList: [] };
}

export function getAccountLuck(state) {
  return state.account.luck || { avgPullsPerAgentS: 0, limitedWinRate: 0, totalPulls: 0 };
}

export function getBudgetPulls(state) {
  return (state.resources.encryptedTapes || 0) + Math.floor((state.resources.polychrome || 0) / 160);
}

/** 当前生效权重：自动模式按「版本资源 + 账号欧非」推导，否则用手动值；喜好权重恒为 0（纯强度推荐） */
export function currentWeights(state) {
  const w = state.autoWeights
    ? deriveWeights({
        versionResources: VERSION_RESOURCES,
        avgPity: getAccountLuck(state).avgPullsPerAgentS, // 0=未同步按正常欧非；同步后按账号实际校准 λ_risk
      })
    : state.weights;
  return { ...w, alphaFavor: 0 };
}

export function setResource(state, key, value) {
  state.resources[key] = value;
}

export function setOwned(state, characterId, owned) {
  state.box.characters[characterId] = { owned, mindscape: 0 };
}

/** 同步成功后整体替换账号并联动 box / 独家池保底（状态变更归这里，渲染归 render 层） */
export function setAccount(state, account) {
  state.account = account;
  state.box.characters = {};
  for (const id of account.box) state.box.characters[id] = { owned: true, mindscape: 0 };
  state.resources.pity = getPool(state, 'limited').pity || 0;
  state.resources.fails = getPool(state, 'limited').fails >= 1 ? 1 : 0;
}

export function resetWeights(state) {
  state.weights = null;
  state.autoWeights = true;
  state.thresholds = { ...DEFAULT_THRESHOLDS };
}
