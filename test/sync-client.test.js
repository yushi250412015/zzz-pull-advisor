// 账号同步客户端测试（依赖倒置：fetch 注入；映射纯函数）
import { describe, it, expect } from 'vitest';
import { mapAccountSummary, fetchAccountSync } from '../src/datasource/sync-client.js';

describe('账号同步客户端', () => {
  it('mapAccountSummary 把服务端汇总映射为本地 account（sList 归一化 + lastS）', () => {
    const summary = {
      pools: {
        limited: { pulls: 454, pity: 3, fails: 0, sCount: 6, sList: [{ name: '千夏', time: '2026-03-01' }] },
        standard: { pulls: 109, pity: 37, sCount: 1, sList: [] },
        weapon: { pulls: 189, pity: 10, sCount: 3, sList: [{ name: '霓虹妄想', count: 2, lost: true }] },
        bangboo: { pulls: 416, pity: 4, sCount: 8, sList: [] },
      },
      box: ['a', 'b'],
      luck: { totalPulls: 1168, agentPulls: 563, agentSCount: 7, avgPullsPerAgentS: 80.4, limitedWinRate: 0.83 },
    };
    const acc = mapAccountSummary(summary, '25183553', '2026-08-15');
    expect(acc.uid).toBe('25183553');
    expect(acc.limited.pity).toBe(3);
    expect(acc.limited.sList[0].date).toBe('2026-03-01');
    expect(acc.weapon.sList[0].count).toBe(2);
    expect(acc.limited.lastS.name).toBe('千夏');
    expect(acc.luck.avgPullsPerAgentS).toBe(80.4);
  });

  it('mapAccountSummary 对缺失字段安全兜底（不臆造）', () => {
    const acc = mapAccountSummary(null, null);
    expect(acc.uid).toBeNull();
    expect(acc.box).toEqual([]);
    expect(acc.weapon.pulls).toBe(0);
  });

  it('fetchAccountSync 成功路径（注入假 fetch）', async () => {
    const fakeFetch = async () => ({
      ok: true,
      json: async () => ({ ok: true, uid: 'u', uidMatched: true, recordCount: 5, generatedAt: 't', summary: { pools: {} } }),
    });
    const result = await fetchAccountSync('u', { fetchImpl: fakeFetch });
    expect(result.ok).toBe(true);
    expect(result.data.recordCount).toBe(5);
  });

  it('fetchAccountSync 失败分型：uid 不匹配 / 服务错误 / 网络不可达', async () => {
    const mismatch = await fetchAccountSync('u', {
      fetchImpl: async () => ({ ok: true, json: async () => ({ ok: true, uid: 'x', uidMatched: false }) }),
    });
    expect(mismatch.kind).toBe('uid-mismatch');
    expect(mismatch.actualUid).toBe('x');

    const serverErr = await fetchAccountSync('u', {
      fetchImpl: async () => ({ ok: false, json: async () => ({ message: '失败' }) }),
    });
    expect(serverErr.kind).toBe('server');

    const unreachable = await fetchAccountSync('u', {
      fetchImpl: async () => { throw new Error('net down'); },
    });
    expect(unreachable.kind).toBe('unreachable');
  });
});
