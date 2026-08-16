#!/usr/bin/env node
// B站视频自动发现（相关推荐图爬取，免登录）：
//   从种子视频出发 BFS 爬「相关视频」接口，按作者 mid / 标题关键词过滤，
//   并对每条命中视频做角色匹配（bili-title-match），输出候选观测清单。
// 用法：
//   node scripts/find-bili-videos.mjs --seed BV1ZPgA6YEwa --mid 43222001 --keyword 绝区零 --depth 3 --max 400
//   （--mid/--keyword 可只给一个；不给 --keyword 则只按 mid 过滤）
// 说明：B站搜索/空间列表接口需登录（wbi 风控），但 archive/related 接口免登录可用（2026-08 实测）。

import { matchCharactersInTitle } from '../src/datasource/bili-title-match.js';
import { characters } from '../src/data/characters.js';

const argv = process.argv.slice(2);
const arg = (k) => {
  const i = argv.indexOf(k);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : null;
};
const seeds = argv.filter((a) => a.startsWith('BV'));
const mid = arg('--mid');
const keyword = arg('--keyword');
const depth = Number(arg('--depth') || 3);
const maxVideos = Number(arg('--max') || 400);
if (seeds.length === 0) {
  console.log('用法：node scripts/find-bili-videos.mjs --seed <BV> [--mid <作者id>] [--keyword <词>] [--depth 3] [--max 400]');
  process.exit(1);
}

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const seen = new Set();
const found = [];
const queue = [...seeds];

async function related(bvid) {
  const resp = await fetch('https://api.bilibili.com/x/web-interface/archive/related?bvid=' + bvid, {
    headers: { 'User-Agent': UA, Referer: 'https://www.bilibili.com/video/' + bvid + '/' },
  });
  const j = await resp.json();
  return j.code === 0 ? j.data || [] : [];
}

for (let level = 0; level < depth && queue.length > 0 && found.length < maxVideos; level += 1) {
  const batch = queue.splice(0, queue.length);
  for (const bvid of batch) {
    if (seen.has(bvid)) continue;
    seen.add(bvid);
    let list = [];
    try {
      list = await related(bvid);
    } catch (e) {
      console.log('[err]', bvid, e.message);
    }
    await sleep(400);
    for (const v of list) {
      if (seen.has(v.bvid) || queue.includes(v.bvid)) continue;
      const ownerOk = !mid || String(v.owner.mid) === String(mid);
      const kwOk = !keyword || v.title.includes(keyword);
      if (ownerOk && kwOk) {
        found.push({ bvid: v.bvid, title: v.title, owner: v.owner.name, mid: v.owner.mid, play: v.stat && v.stat.view, date: v.pubdate });
      }
      if (ownerOk || (!mid && !keyword)) queue.push(v.bvid);
    }
    if (found.length >= maxVideos) break;
  }
  console.log('[level ' + (level + 1) + '] 已发现 ' + found.length + ' 条命中（爬过 ' + seen.size + ' 个视频）');
}

console.log('');
console.log('== 命中视频 ==');
for (const v of found) {
  const ids = matchCharactersInTitle(v.title, characters);
  const names = ids.map((id) => characters[id].name).join('/');
  console.log(v.bvid + ' | ' + v.owner + ' | ' + (names || '—') + ' | ' + v.title.slice(0, 64) + ' | 播放 ' + (v.play ?? '-'));
}
console.log('');
console.log('== 候选观测（标题级映射规则见 observations.js 头注释，需人工审阅后落库） ==');
for (const v of found) {
  const ids = matchCharactersInTitle(v.title, characters);
  for (const id of ids) {
    const c = characters[id];
    const date = v.date ? new Date(v.date * 1000).toISOString().slice(0, 10) : '待查';
    if (c.meta == null) {
      console.log('  // 跳过（' + c.name + ' meta=null，无共识基数，不臆造）：' + v.bvid + '《' + v.title.slice(0, 40) + '…》');
      continue;
    }
    const value = Math.min(c.meta + 3, 92);
    console.log('  { characterId: ' + JSON.stringify(id) + ', value: ' + value + ', weight: 0.9, source: ' + JSON.stringify(v.owner === '卡特亚' ? 'katya' : 'bili-blogger') + ', date: ' + JSON.stringify(date) + ', note: ' + JSON.stringify(v.bvid + '《' + v.title.slice(0, 40) + '…》待人工审阅标题结论') + ' },');
  }
}
