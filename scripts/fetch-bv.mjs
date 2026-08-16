#!/usr/bin/env node
// B站视频信息抓取（观测管线工具）：标题/作者/发布时间/数据/标签/字幕（如有）
// 用法：node scripts/fetch-bv.mjs --bvid BV1ZPgA6YEwa
// 实测边界（2026-08）：view / player(v2) / tags 三个接口无需登录可用；
//   评论(x/v2/reply)、AI 总结(conclusion)需登录；字幕仅当 up 主开启时存在。

const bvid = process.argv[process.argv.indexOf('--bvid') + 1];
if (!bvid) {
  console.log('用法：node scripts/fetch-bv.mjs --bvid <BV号>');
  process.exit(1);
}
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0',
  Referer: 'https://www.bilibili.com/video/' + bvid + '/',
};

const view = await (await fetch('https://api.bilibili.com/x/web-interface/view?bvid=' + bvid, { headers })).json();
if (view.code !== 0) {
  console.log('[error] view api code=' + view.code + ' ' + view.message);
  process.exit(1);
}
const d = view.data;
console.log('标题:', d.title);
console.log('作者:', d.owner.name, '| mid:', d.owner.mid);
console.log('发布:', new Date(d.pubdate * 1000).toISOString().slice(0, 10), '| 时长:', d.duration, 's');
console.log('数据: 播放', d.stat.view, '/ 赞', d.stat.like, '/ 币', d.stat.coin, '/ 收藏', d.stat.favorite);
console.log('简介:', (d.desc || '(空)').slice(0, 300));

const tags = await (await fetch('https://api.bilibili.com/x/tag/archive/tags?bvid=' + bvid, { headers })).json();
console.log('标签:', (tags.data || []).map((t) => t.tag_name).join('、') || '(无)');

const cid = d.pages && d.pages[0] && d.pages[0].cid;
if (cid) {
  const player = await (await fetch('https://api.bilibili.com/x/player/v2?bvid=' + bvid + '&cid=' + cid, { headers })).json();
  const subs = player.data && player.data.subtitle && player.data.subtitle.subtitles;
  console.log('字幕:', subs && subs.length ? subs.map((s) => s.lan).join('、') + '（可另写脚本抓取 subtitle_url）' : '(无 AI 字幕)');
}
