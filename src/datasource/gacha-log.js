// 抽卡记录数据源：本地日志 URL 提取 + 拉取记录
//
// 实测事实（2026-08-15，绝区零 3.1 PC 客户端）：
// 1. 日志（Player.log / Persistent\LogDir\NAP_*.log）中的 webview 行是「抽卡记录 H5 页面」地址：
//    https://webstatic.mihoyo.com/nap/event/e20230424gacha-v2/index.html?...&gacha_type=2001&authkey=...
// 2. authkey 必须用 URL 中的「原始百分号编码形态」拼进 API 请求；
//    若先解码成明文（含 '+')直接拼接，服务器把 '+' 当空格 → retcode=-1 "illegal base64 data"
// 3. 记录返回的 gacha_type 是 API 内部编码：1=常驻 2=独家 3=音擎 5=邦布
//    （请求参数用 1001/2001/3001/5001）
// 4. rank_type：4=S 级 3=A 级 2=B 级（与 Genshin/HSR 的 5/4/3 不同）

export const POOL_TYPES = {
  1001: { apiType: '1', label: '常驻角色' },
  2001: { apiType: '2', label: '独家角色' },
  3001: { apiType: '3', label: '音擎' },
  5001: { apiType: '5', label: '邦布' },
};

export const GACHA_API =
  'https://public-operation-nap.mihoyo.com/common/gacha_record/api/getGachaLog';

/** 从日志文本提取抽卡记录 H5 页面 URL（含 authkey 的完整地址） */
export function extractGachaPageUrl(logContent) {
  const m = String(logContent).match(/https?:\/\/[^\s"']+gacha[^\s"']*index\.html[^\s"']*/);
  return m ? m[0] : null;
}

/** 提取页面 URL 中的 gacha_type（1001/2001/3001/5001） */
export function extractGachaType(pageUrl) {
  const m = String(pageUrl).match(/gacha_type=(\d+)/);
  return m ? m[1] : null;
}

/** 提取 authkey（保留原始百分号编码形态，勿解码后直接拼接） */
export function extractAuthkey(pageUrl) {
  const m = String(pageUrl).match(/authkey=([^&]+)/);
  return m ? m[1] : null;
}

/** 由页面 URL 构造 getGachaLog API 请求地址（authkey 原样拼接，避免二次编码） */
export function buildApiUrl(pageUrl, { gachaType = null, page = 1, size = 20, endId = 0 } = {}) {
  const authkey = extractAuthkey(pageUrl);
  if (!authkey) throw new Error('页面 URL 中没有 authkey');
  const gt = gachaType || extractGachaType(pageUrl);
  return (
    `${GACHA_API}?authkey_ver=1&sign_type=2&auth_appid=webview_gacha&win_mode=fullscreen` +
    `&lang=zh-cn&game_biz=nap_cn&authkey=${authkey}&gacha_type=${gt}` +
    `&page=${page}&size=${size}&end_id=${endId}`
  );
}

/** 拉取某个池的全部记录（分页）。IO 适配器，需真实 authkey 联调 */
export async function fetchGachaRecords(pageUrl, { gachaType = null, size = 20 } = {}) {
  const records = [];
  let endId = 0;
  let page = 1;
  for (;;) {
    const u = buildApiUrl(pageUrl, { gachaType, page, size, endId });
    const resp = await fetch(u);
    const json = await resp.json();
    if (json.retcode !== 0) throw new Error(`抽卡记录获取失败: ${json.message}`);
    const list = (json.data && json.data.list) || [];
    records.push(...list);
    if (list.length < size) break;
    endId = list[list.length - 1].id;
    page += 1;
  }
  return records;
}
