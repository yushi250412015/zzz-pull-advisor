#!/usr/bin/env node
// 批量抓取视频简介+热评（结论提取用）。用法：node scripts/bili-batch.mjs BV1xxx BV2xxx ...
import { readFileSync } from 'node:fs';
import os from 'node:os';
import { join } from 'node:path';

const cookie = readFileSync(join(os.tmpdir(), 'zzz-bili-cookie.txt'), 'utf8').trim();
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0';
const H = (ref) => ({ 'User-Agent': UA, Cookie: cookie, Referer: ref || 'https://www.bilibili.com/' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

for (const bvid of process.argv.slice(2)) {
  const view = await (await fetch('https://api.bilibili.com/x/web-interface/view?bvid=' + bvid, { headers: H() })).json();
  if (view.code !== 0) { console.log('===== ' + bvid + ' view code=' + view.code); continue; }
  const d = view.data;
  console.log('');
  console.log('########## ' + bvid + ' | ' + d.title);
  console.log('作者:', d.owner.name, '| 播放', d.stat.view, '| 赞', d.stat.like, '| 发布', new Date(d.pubdate * 1000).toISOString().slice(0, 10));
  console.log('简介:', (d.desc || '(空)').slice(0, 600));
  const aid = d.aid;
  const rj = await (await fetch('https://api.bilibili.com/x/v2/reply?type=1&oid=' + aid + '&sort=2&ps=20', { headers: H('https://www.bilibili.com/video/' + bvid + '/') })).json();
  console.log('--- 热评 ---');
  for (const r of (rj.data && rj.data.replies) || []) {
    console.log('[' + r.member.uname + '] ' + (r.content.message || '').replace(/\n/g, ' ').slice(0, 200) + (r.is_up ? '  ←UP' : ''));
  }
  await sleep(600);
}
