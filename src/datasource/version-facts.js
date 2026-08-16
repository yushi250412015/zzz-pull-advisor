// 从官方版本公告文本提取「全新代理人 / 音擎 / 邦布」官方陈述（纯函数）
// 官方格式（ann_id 1262 实测）：
//   一、全新代理人：S级代理人[蕾米埃尔(流明·异常)]可通过「复乐园」频段调频获得。
//   二、全新音擎：S级音擎[空羽复归之诗(异常)]可通过「空羽复归之诗」频段调频获得。
//   三、全新邦布：S级邦布[艾瑞儿]可通过「卓越搭档」频段调频获得。
// 提取不出时返回空数组（不臆造；complete=false 表示公告结构可能变化，需人工核对）

const ELEMENT_CN = { 物理: 'physical', 火: 'fire', 冰: 'ice', 电: 'electric', 以太: 'ether', 风: 'wind', 流明: 'lumiflux' };
const ROLE_CN = { 强攻: 'attack', 异常: 'anomaly', 击破: 'stun', 支援: 'support', 防护: 'defense', 命破: 'rupture' };

export function extractReleaseFacts(text) {
  const t = String(text ?? '');
  const agents = [];
  const engines = [];
  const bangboos = [];

  // 元素/角色组同时排除全角与半角括号并取非贪婪，防止跨条目贪婪吞并（实测踩坑）
  const agentRe = /S级代理人\[([^\]]+)\(([^·()（）]+?)·([^()（）]+?)\)\]可通过「([^」]+?)」频段调频获得/g;
  const engineRe = /S级音擎\[([^\]]+)\(([^()（）]+?)\)\]可通过「([^」]+?)」频段调频获得/g;
  const bangbooRe = /S级邦布\[([^\]]+)\]可通过「([^」]+?)」频段调频获得/g;

  for (const m of t.matchAll(agentRe)) {
    agents.push({
      name: m[1].trim(),
      elementCn: m[2].trim(),
      element: ELEMENT_CN[m[2].trim()] ?? null,
      roleCn: m[3].trim(),
      role: ROLE_CN[m[3].trim()] ?? null,
      channel: m[4].trim(),
      raw: m[0],
    });
  }
  for (const m of t.matchAll(engineRe)) {
    engines.push({
      name: m[1].trim(),
      roleCn: m[2].trim(),
      role: ROLE_CN[m[2].trim()] ?? null,
      channel: m[3].trim(),
      raw: m[0],
    });
  }
  for (const m of t.matchAll(bangbooRe)) {
    bangboos.push({ name: m[1].trim(), channel: m[2].trim(), raw: m[0] });
  }

  const titleMatch = t.match(/(\d+\.\d+)版本[「“]?([^」”\n]{0,20})[」”]?更新公告/);
  // 启发式（3.1 实测）：起始 = 公告中首个日期（更新开始时间）；结束 = 「版本结束时间为」后的日期
  const startMatch = t.match(/(\d{4}\/\d{2}\/\d{2})/);
  const endMatch = t.match(/版本结束时间为(\d{4}\/\d{2}\/\d{2})/);
  return {
    agents,
    engines,
    bangboos,
    version: titleMatch ? { number: titleMatch[1], name: titleMatch[2] || null } : null,
    window: startMatch && endMatch ? { start: startMatch[1], end: endMatch[1] } : null,
    complete: agents.length > 0,
  };
}
