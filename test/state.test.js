// UI 状态测试（单一职责：状态集中管理；最小知识：访问器防深链）
import { describe, it, expect } from 'vitest';
import {
  createState, getPool, getAccountLuck, getBudgetPulls,
  currentWeights, setResource, setOwned, setAccount, resetWeights,
} from '../src/ui/state.js';

describe('UI 状态与访问器', () => {
  it('初始状态为示例占位（不含真实个人信息）', () => {
    const s = createState();
    expect(s.account.uid).toBeNull();
    expect(s.account.box).toEqual([]);
    expect(s.thresholds).toEqual({ pull: 0.6, consider: 0.4 });
  });

  it('getPool 对缺失池返回安全默认值（调用方无需判空）', () => {
    const s = createState();
    expect(getPool(s, 'limited').pulls).toBe(0);
    expect(getPool(s, 'limited').sList).toEqual([]);
  });

  it('currentWeights 恒 α_favor=0（纯强度）；未同步时按正常欧非推导', () => {
    const s = createState();
    const w = currentWeights(s);
    expect(w.alphaFavor).toBe(0);
    expect(w.alphaCombat).toBe(0.8);
    expect(w.lambdaRisk).toBe(30); // avgPity=0 → luckFactor=1
  });

  it('setAccount 联动 box 勾选与独家池保底（状态变更单一入口）', () => {
    const s = createState();
    setAccount(s, {
      uid: '123', analyzedAt: '2026-08-20', box: ['a', 'b'],
      limited: { pulls: 10, pity: 7, fails: 1, sCount: 1, sList: [], lastS: null },
      standard: { pulls: 0, pity: 0, sCount: 0, sList: [], lastS: null },
      weapon: { pulls: 0, pity: 0, sCount: 0, sList: [], lastS: null },
      bangboo: { pulls: 0, pity: 0, sCount: 0, sList: [], lastS: null },
      luck: { totalPulls: 10, agentPulls: 10, agentSCount: 1, avgPullsPerAgentS: 10, limitedWinRate: 1 },
    });
    expect(s.box.characters.a.owned).toBe(true);
    expect(s.box.characters.b.owned).toBe(true);
    expect(s.resources.pity).toBe(7);
    expect(s.resources.fails).toBe(1);
    expect(getAccountLuck(s).avgPullsPerAgentS).toBe(10);
  });

  it('资源与勾选操作走单一入口', () => {
    const s = createState();
    setResource(s, 'polychrome', 3200);
    expect(getBudgetPulls(s)).toBe(20);
    setOwned(s, 'x', true);
    expect(s.box.characters.x.owned).toBe(true);
  });

  it('resetWeights 恢复默认（阈值与自动模式）', () => {
    const s = createState();
    s.weights = { alphaCombat: 0.5, alphaFavor: 0, lambdaRisk: 10, alphaCost: 0.1 };
    s.autoWeights = false;
    s.thresholds = { pull: 0.9, consider: 0.8 };
    resetWeights(s);
    expect(s.autoWeights).toBe(true);
    expect(s.weights).toBeNull();
    expect(s.thresholds).toEqual({ pull: 0.6, consider: 0.4 });
  });
});
