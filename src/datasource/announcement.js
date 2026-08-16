// 公告数据源：绝区零官方公告 API（announcement-static.mihoyo.com）
//
// 实测事实（2026-08，绝区零 3.1，PC/国服/简中参数组合，无需鉴权、公开可调）：
// 1. getAnnList 返回 data.list[]：公告分组，每组 {type_id, type_label, list[]}
//    （type_label 在「组级」，条目级也重复携带同一值；实测 type_id=3「游戏公告」/ 4「活动公告」）
//    条目字段：ann_id / title（外层包裹 <p style="white-space: pre-wrap;">…</p>）/ subtitle（纯文本）
//    / banner（图链）/ content（列表页为空串）/ has_content / start_time / end_time / type_label / tag_label 等。
// 2. getAnnContent?ann_id=N 返回 data.list[]：**全部公告正文的列表（实测 data.total=20），
//    请求的 ann_id 混在其中、服务端不做过滤** —— 必须自行按 ann_id 筛选。
//    条目字段：ann_id / title / subtitle / banner / content（HTML 正文）/ lang / remind_text。
// 3. 两接口 retcode=0 即成功；失败抛错。该接口不涉及账号凭据（与抽卡记录 API 不同）。
// 真实返回快照（2026-08 抓取）存档于 docs/data/ann-*.json（gitignore，不进公开仓库）。

export const ANNOUNCEMENT_API =
  'https://announcement-static.mihoyo.com/common/nap_cn/announcement/api';

/** 默认请求参数（实测可用组合） */
export const DEFAULT_ANNOUNCEMENT_PARAMS = {
  game: 'nap',
  game_biz: 'nap_cn',
  lang: 'zh-cn',
  bundle_id: 'nap_cn',
  platform: 'pc',
  region: 'prod_gf_cn',
  level: '60',
  channel_id: '1',
};

/** 构造 getAnnList 请求地址（可用 params 覆盖默认参数，如 lang=zh-tw） */
export function buildAnnListUrl(params = {}) {
  const q = new URLSearchParams({ ...DEFAULT_ANNOUNCEMENT_PARAMS, ...params });
  return `${ANNOUNCEMENT_API}/getAnnList?${q.toString()}`;
}

/** 构造 getAnnContent 请求地址 */
export function buildAnnContentUrl(annId, params = {}) {
  const q = new URLSearchParams({ ...DEFAULT_ANNOUNCEMENT_PARAMS, ...params });
  return `${ANNOUNCEMENT_API}/getAnnContent?${q.toString()}&ann_id=${annId}`;
}

/** 去掉官方公告文本中的 HTML 标签（title 的 <p> 包裹、正文的 <br> 等）并解码常见实体 */
export function stripHtml(html) {
  return String(html ?? '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** 归一化一条公告（列表页/详情页通用） */
export function normalizeAnnouncement(raw = {}) {
  return {
    annId: raw.ann_id ?? null,
    title: stripHtml(raw.title) || stripHtml(raw.subtitle) || '',
    subtitle: raw.subtitle ?? '',
    banner: raw.banner ?? '',
    typeLabel: raw.type_label ?? null,
    tagLabel: raw.tag_label ?? null,
    hasContent: Boolean(raw.has_content),
    startTime: raw.start_time ?? null,
    endTime: raw.end_time ?? null,
    content: raw.content ?? '', // 列表页为空串；详情页为 HTML 正文
  };
}

/** 展平 fetchAnnList 的分组结果，得到全部公告条目 */
export function flattenAnnouncements(result) {
  return (result.groups ?? []).flatMap((g) => g.list);
}

/** 拉取公告列表。IO 适配器；fetcher 可注入以便单测。 */
export async function fetchAnnList(fetcher = fetch, params = {}) {
  const resp = await fetcher(buildAnnListUrl(params));
  const json = await resp.json();
  if (json.retcode !== 0) throw new Error(`公告列表获取失败: ${json.message}`);
  const data = json.data ?? {};
  return {
    groups: (data.list ?? []).map((g) => ({
      typeId: g.type_id,
      typeLabel: g.type_label,
      list: (g.list ?? []).map(normalizeAnnouncement),
    })),
    total: data.total ?? null,
  };
}

/** 拉取单条公告正文。实测接口返回全部内容列表（不过滤），此处按 ann_id 自行筛选；找不到返回 null */
export async function fetchAnnContent(annId, fetcher = fetch, params = {}) {
  const resp = await fetcher(buildAnnContentUrl(annId, params));
  const json = await resp.json();
  if (json.retcode !== 0) throw new Error(`公告内容获取失败: ${json.message}`);
  const list = (json.data?.list ?? []).map((raw) => ({
    ...normalizeAnnouncement(raw),
    contentText: stripHtml(raw.content),
  }));
  const found = list.find((it) => String(it.annId) === String(annId));
  return found ?? null;
}

/** 官方 wiki（BWIKI）角色页直链；已实测 200：https://wiki.biligame.com/zzz/<角色中文名> */
export function buildWikiUrl(characterName) {
  return `https://wiki.biligame.com/zzz/${encodeURIComponent(characterName)}`;
}

/** 按关键词（标题/副标题包含）过滤公告，用于提取「版本公告」「某角色」等条目 */
export function filterAnnouncements(announcements, keyword) {
  const k = String(keyword);
  return announcements.filter((a) => `${a.title} ${a.subtitle}`.includes(k));
}

/** 在公告正文文本（contentText）中检索出现的角色名，返回角色 id 列表（按 characters 顺序） */
export function findCharacterMentions(text, characters = []) {
  const t = String(text ?? '');
  return characters.filter((c) => t.includes(c.name)).map((c) => c.id);
}

/**
 * 把公告按标题/副标题中的角色名关键词映射到角色（官方公告标题通常直接带角色名）。
 * characters: [{id, name}]；返回 [{characterId, name, matches:[公告]}]，无匹配的角色不出现在结果中。
 * 注意：这是关键词包含匹配（启发式），不代表官方归属关系，仅用于情报归档与链接跳转。
 */
export function matchCharacterAnnouncements(announcements, characters = []) {
  return characters
    .map((c) => {
      const matches = announcements.filter((a) => `${a.title} ${a.subtitle}`.includes(c.name));
      return matches.length > 0 ? { characterId: c.id, name: c.name, matches } : null;
    })
    .filter(Boolean);
}
