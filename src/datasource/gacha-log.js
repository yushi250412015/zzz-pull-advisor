// 抽卡记录数据源：本地日志 URL 提取 + 拉取记录

/** 从游戏日志文本中提取抽卡记录 URL（纯函数，getGachaLog 接口地址） */
export function extractGachaUrl(logContent) {
  const match = String(logContent).match(/https?:\/\/[^\s"']*getGachaLog[^\s"']*/);
  return match ? match[0] : null;
}

/** 拉取全部抽卡记录（分页）。IO 适配器，需真实 URL 联调 */
export async function fetchGachaRecords(url, { size = 20 } = {}) {
  const records = [];
  let endId = 0;
  let page = 1;
  for (;;) {
    const u = new URL(url);
    u.searchParams.set('page', String(page));
    u.searchParams.set('size', String(size));
    u.searchParams.set('end_id', String(endId));
    const resp = await fetch(u.toString());
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
