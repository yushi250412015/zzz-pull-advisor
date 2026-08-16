// 账号同步客户端（依赖倒置：fetch 实现可注入，便于测试与替换）
// 契约：fetchAccountSync(uid) → { ok, kind, data?, message? }
//   ok=true 时 data 为服务端 payload { uid, uidMatched, recordCount, generatedAt, summary, snapshot }
export const SYNC_ENDPOINT = 'http://localhost:8787';

/** 服务端汇总 JSON → 本地 account 结构（纯函数；数据映射的单一职责归这里） */
export function mapAccountSummary(summary, uid, analyzedAt = new Date().toISOString().slice(0, 10)) {
  const pools = (summary && summary.pools) || {};
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
  const luck = (summary && summary.luck) || {};
  return {
    uid: uid || null,
    analyzedAt,
    box: (summary && summary.box) || [],
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
}

/** 分型结果：ok=true 成功；kind: 'unreachable' | 'server' | 'uid-mismatch' */
export async function fetchAccountSync(uid, { endpoint = SYNC_ENDPOINT, fetchImpl = fetch } = {}) {
  let res;
  try {
    res = await fetchImpl(endpoint + '/sync?uid=' + encodeURIComponent(uid));
  } catch (e) {
    return { ok: false, kind: 'unreachable', message: e.message };
  }
  const data = await res.json().catch(() => null);
  if (!res.ok || !data || !data.ok) return { ok: false, kind: 'server', message: (data && data.message) || '服务返回异常' };
  if (!data.uidMatched) return { ok: false, kind: 'uid-mismatch', expectedUid: uid, actualUid: data.uid };
  return { ok: true, data };
}
