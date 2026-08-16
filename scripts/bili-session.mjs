#!/usr/bin/env node
// B站登录会话工具（需用户 cookie，cookie 只存 %TEMP%\zzz-bili-cookie.txt，绝不进仓库）
// 子命令：
//   node scripts/bili-session.mjs search <关键词>            —— 站内搜索视频（wbi 签名）
//   node scripts/bili-session.mjs space <mid> [关键词]        —— 作者视频列表（wbi 签名）
//   node scripts/bili-session.mjs comments <BV>               —— 视频评论（热门前 30）
//   node scripts/bili-session.mjs summary <BV>                —— B站 AI 视频总结（up 主开启时）
//   node scripts/bili-session.mjs subtitle <BV>               —— AI 字幕全文（up 主开启时）
// 用法示例：node scripts/bili-session.mjs summary BV1ZPgA6YEwa

import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import os from 'node:os';
import { join } from 'node:path';

const [cmd, arg1] = process.argv.slice(2);
const cookieFile = join(os.tmpdir(), 'zzz-bili-cookie.txt');
let cookie = '';
try {
  cookie = readFileSync(cookieFile, 'utf8').trim();
} catch {
  console.log('[error] 未找到 ' + cookieFile + '，请先把浏览器 cookie 头写入该文件（gitignore 外，本地临时）。');
  process.exit(1);
}
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0';
const H = (extra = {}) => ({ 'User-Agent': UA, Cookie: cookie, ...extra });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const mixinKeyEncTab = [46,47,18,2,53,8,23,32,15,50,10,31,58,3,45,35,27,43,5,49,33,9,42,19,29,28,14,39,12,38,41,13,37,48,7,16,24,55,40,61,26,17,0,1,60,51,30,4,22,25,54,21,56,59,6,63,57,62,11,36,20,34,44,52];

let wbiCache = null;
async function wbiKeys() {
  if (wbiCache) return wbiCache;
  const j = await (await fetch('https://api.bilibili.com/x/web-interface/nav', { headers: H() })).json();
  if (j.code !== 0) throw new Error('nav 接口 code=' + j.code + '（cookie 可能失效）');
  const img = (j.data.wbi_img.img_url || '').split('/').pop().split('.')[0];
  const sub = (j.data.wbi_img.sub_url || '').split('/').pop().split('.')[0];
  wbiCache = { img, sub };
  return wbiCache;
}
async function wbiUrl(path, params) {
  const { img, sub } = await wbiKeys();
  const mixinKey = mixinKeyEncTab.map((n) => (img + sub)[n]).join('').slice(0, 32);
  const all = { ...params, wts: String(Math.round(Date.now() / 1000)) };
  const query = Object.keys(all).sort().map((k) => {
    const v = String(all[k]).replace(/[!'()*]/g, '');
    return encodeURIComponent(k) + '=' + encodeURIComponent(v);
  }).join('&');
  const wrid = createHash('md5').update(query + mixinKey).digest('hex');
  return 'https://api.bilibili.com' + path + '?' + query + '&w_rid=' + wrid;
}

async function main() {
  if (cmd === 'search') {
    const u = await wbiUrl('/x/web-interface/wbi/search/type', { search_type: 'video', keyword: arg1, page: 1, page_size: 30 });
    const j = await (await fetch(u, { headers: H({ Referer: 'https://search.bilibili.com/' }) })).json();
    console.log('code:', j.code, j.message || '');
    for (const r of (j.data && j.data.result) || []) {
      console.log(r.bvid, '|', r.author, '|', r.title.replace(/<[^>]+>/g, '').slice(0, 60), '| 播放', r.play);
    }
  } else if (cmd === 'space') {
    const u = await wbiUrl('/x/space/wbi/arc/search', { mid: arg1, pn: 1, ps: 50 });
    const j = await (await fetch(u, { headers: H({ Referer: 'https://space.bilibili.com/' + arg1 + '/video' }) })).json();
    console.log('code:', j.code, j.message || '');
    const vlist = (j.data && j.data.list && j.data.list.vlist) || [];
    for (const v of vlist) {
      if (!process.argv[4] || v.title.includes(process.argv[4])) {
        console.log(v.bvid, '|', v.title.slice(0, 64), '|', new Date(v.created * 1000).toISOString().slice(0, 10), '| 播放', v.play);
      }
    }
  } else if (cmd === 'comments') {
    const view = await (await fetch('https://api.bilibili.com/x/web-interface/view?bvid=' + arg1, { headers: H() })).json();
    const aid = view.data && view.data.aid;
    const u = 'https://api.bilibili.com/x/v2/reply?type=1&oid=' + aid + '&sort=2&ps=20';
    const j = await (await fetch(u, { headers: H({ Referer: 'https://www.bilibili.com/video/' + arg1 + '/' }) })).json();
    console.log('code:', j.code, j.message || '');
    for (const r of (j.data && j.data.replies) || []) {
      console.log('[' + r.member.uname + '] ' + (r.content.message || '').replace(/\n/g, ' ').slice(0, 180) + (r.is_up ? '  ←UP' : ''));
    }
  } else if (cmd === 'summary') {
    const view = await (await fetch('https://api.bilibili.com/x/web-interface/view?bvid=' + arg1, { headers: H() })).json();
    const cid = view.data && view.data.pages && view.data.pages[0] && view.data.pages[0].cid;
    const u = 'https://api.bilibili.com/x/web-interface/view/conclusion/get?bvid=' + arg1 + '&cid=' + cid + '&up_mid=' + view.data.owner.mid;
    const j = await (await fetch(u, { headers: H({ Referer: 'https://www.bilibili.com/video/' + arg1 + '/' }) })).json();
    console.log('code:', j.code, j.message || '');
    const c = j.data && j.data.model_result;
    if (c) console.log('AI 总结:', JSON.stringify(c.summary || c, null, 1).slice(0, 2000));
  } else if (cmd === 'subtitle') {
    const view = await (await fetch('https://api.bilibili.com/x/web-interface/view?bvid=' + arg1, { headers: H() })).json();
    const cid = view.data && view.data.pages && view.data.pages[0] && view.data.pages[0].cid;
    const p = await (await fetch('https://api.bilibili.com/x/player/v2?bvid=' + arg1 + '&cid=' + cid, { headers: H() })).json();
    const subs = p.data && p.data.subtitle && p.data.subtitle.subtitles;
    if (!subs || !subs.length) {
      console.log('无 AI 字幕');
      return;
    }
    const body = await (await fetch('https:' + subs[0].subtitle_url, { headers: H({ Referer: 'https://www.bilibili.com/' }) })).json();
    const text = (body.body || []).map((s) => s.content).join('\n');
    console.log(text.slice(0, 8000));
  } else {
    console.log('未知子命令：' + cmd);
  }
}

main().catch((e) => {
  console.log('[error]', e.message);
  process.exit(1);
});
