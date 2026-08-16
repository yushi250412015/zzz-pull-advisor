#!/usr/bin/env node
// 本地导入脚本：抽卡记录 H5 页面 URL（或本地日志）→ 四池全量记录 → 账号状态快照
//
// 用法：
//   node scripts/import-records.mjs --url "<抽卡 H5 页面 URL>"
//   node scripts/import-records.mjs --log "<日志文件路径>"   （自动从日志提取页面 URL）
//   node scripts/import-records.mjs                           （自动扫描默认日志目录）
//   node scripts/import-records.mjs --records "<快照 json>"   （离线重解析，不联网）
// 输出：docs/data/gacha-records-<日期>.json（gitignore，不进公开仓库）+ 控制台状态汇总与手填值对比
//
// 说明：
// - 浏览器直连米哈游接口会被 CORS 拦截，抓取必须走本地 Node；
// - authkey 约 1 天过期，过期后需在游戏内重新打开一次抽卡记录页；
// - 官方 API 仅保留最近约 6 个月记录（本账号最早可追溯 2026-02-10）。

import { existsSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import os from 'node:os';
import http from 'node:http';
import { extractGachaPageUrl, fetchGachaRecords } from '../src/datasource/gacha-log.js';
import { groupRecordsByType, summarizeAccount } from '../src/datasource/import-summary.js';
import { standardS } from '../src/data/characters.js';

const REQUEST_POOLS = [2001, 1001, 3001, 5001]; // 请求参数：独家/常驻/音擎/邦布
const POOL_LABELS = { limited: '独家', standard: '常驻', weapon: '音擎', bangboo: '邦布' };

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      args[key] = next && !next.startsWith('--') ? next : true;
      if (args[key] !== true) i += 1;
    }
  }
  return args;
}

function scanLogFiles() {
  const candidates = [];
  const base = join(os.homedir(), 'AppData', 'LocalLow', 'miHoYo', '绝区零');
  for (const f of ['Player.log', 'Player-prev.log', join('logs', 'MiHoYoSDK.log')]) {
    const p = join(base, f);
    if (existsSync(p)) candidates.push(p);
  }
  const napDir = join(base, 'ZenlessZoneZero_Data', 'Persistent', 'LogDir');
  if (existsSync(napDir)) {
    for (const f of readdirSync(napDir)) {
      if (/^NAP_.*\.log$/i.test(f)) candidates.push(join(napDir, f));
    }
  }
  return candidates;
}

function resolvePageUrl(args) {
  if (args.url) return args.url;
  const files = args.log ? [args.log] : scanLogFiles();
  if (files.length === 0) {
    throw new Error('未找到可扫描的日志文件。请带 --url 传入页面 URL，或 --log 指定日志路径。');
  }
  for (const f of files) {
    let content;
    try {
      content = readFileSync(f, 'utf8');
    } catch {
      continue;
    }
    const u = extractGachaPageUrl(content);
    if (u) {
      console.log(`[log] 从日志提取到抽卡 H5 页面 URL：${f}`);
      return u;
    }
  }
  throw new Error('在日志中未找到抽卡 H5 页面 URL（webstatic.mihoyo.com/...gacha-v2/index.html）。请先打开一次游戏内抽卡记录页，或直接 --url 传入。');
}

function maskUrl(u) {
  return u.replace(/authkey=[^&]+/, 'authkey=***');
}

async function fetchAll(pageUrl) {
  const all = [];
  for (const gt of REQUEST_POOLS) {
    console.log(`[fetch] gacha_type=${gt} ...`);
    const recs = await fetchGachaRecords(pageUrl, { gachaType: gt, size: 20 });
    console.log(`[fetch] gacha_type=${gt} -> ${recs.length} 条`);
    all.push(...recs);
  }
  return all;
}

function printSummary(summary) {
  console.log('');
  console.log('== 汇总结果 ==');
  for (const key of ['limited', 'standard', 'weapon', 'bangboo']) {
    const p = summary.pools[key];
    const names = p.sList.map((x) => x.name + (x.lost ? '(歪)' : '')).join('、');
    console.log(`${POOL_LABELS[key]}池：${p.pulls} 抽 / S×${p.sCount} / 距上次 S ${p.pity} 抽${key === 'limited' ? ` / fails=${p.fails}` : ''}`);
    if (names) console.log(`  S：${names}`);
  }
  console.log(`box：${summary.box.length} 位代理人`);
  console.log(`欧非：全账号 ${summary.luck.totalPulls} 抽；代理人池 ${summary.luck.agentPulls} 抽 ${summary.luck.agentSCount} S（平均 ${summary.luck.avgPullsPerAgentS.toFixed(1)} 抽/S）；独家胜率 ${summary.luck.limitedWinRate.toFixed(2)}`);
}

// 本机快照（docs/data 已被 gitignore，不进公开仓库）：只存本机，用于下次对比与敏感性脚本
function writeLocalSnapshot(records, summary) {
  const p = join('docs', 'data', 'my-account.json');
  writeFileSync(p, JSON.stringify({
    uid: records[0] ? String(records[0].uid) : null,
    analyzedAt: new Date().toISOString(),
    recordCount: records.length,
    summary,
  }, null, 2), 'utf8');
  return p;
}

function loadLocalSnapshot() {
  const p = join('docs', 'data', 'my-account.json');
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, 'utf8').replace(/^\uFEFF/, ''));
  } catch {
    return null;
  }
}

function compareWithLocal(summary) {
  console.log('');
  console.log('== 与本地快照对比（docs/data/my-account.json，gitignore 不进公开仓库） ==');
  const snap = loadLocalSnapshot();
  if (!snap || !snap.summary) {
    console.log('  无本地快照。本次结果已写入本机快照，下次运行可对比账号变化。');
    return;
  }
  const s = snap.summary;
  const checks = [
    ['独家·抽数', summary.pools.limited.pulls, s.pools.limited.pulls],
    ['独家·保底', summary.pools.limited.pity, s.pools.limited.pity],
    ['独家·大保底', summary.pools.limited.fails, s.pools.limited.fails],
    ['独家·S 数', summary.pools.limited.sCount, s.pools.limited.sCount],
    ['常驻·抽数', summary.pools.standard.pulls, s.pools.standard.pulls],
    ['常驻·保底', summary.pools.standard.pity, s.pools.standard.pity],
    ['音擎·抽数', summary.pools.weapon.pulls, s.pools.weapon.pulls],
    ['音擎·保底', summary.pools.weapon.pity, s.pools.weapon.pity],
    ['音擎·S 数', summary.pools.weapon.sCount, s.pools.weapon.sCount],
    ['邦布·抽数', summary.pools.bangboo.pulls, s.pools.bangboo.pulls],
    ['邦布·保底', summary.pools.bangboo.pity, s.pools.bangboo.pity],
    ['邦布·S 数', summary.pools.bangboo.sCount, s.pools.bangboo.sCount],
    ['box 数量', summary.box.length, s.box.length],
  ];
  let ok = 0;
  for (const [label, got, want] of checks) {
    const match = got === want;
    if (match) ok += 1;
    console.log(`${match ? '  ✓' : '  ✗'} ${label}: 本次 ${got} vs 上次 ${want}`);
  }
  console.log(`一致 ${ok}/${checks.length}`);
}

// 本地同步服务：UI 一键同步的桥梁（浏览器因 CORS 不能直连米哈游，由本服务代抓）
// 用法：node scripts/import-records.mjs --serve   → http://127.0.0.1:8787
//   GET /health        → { ok: true }
//   GET /sync?uid=xxx  → 扫描游戏日志提取 authkey → 四池拉取 → 汇总 JSON（uid 用于校验账号一致）
// 官方没有「输入 UID 直查」的接口：抽卡记录 API 必须带游戏内生成的 authkey（约 1 天过期）。
//
// 安全与隐私：
// - 只监听 127.0.0.1（不回环对外网/局域网开放）；
// - Origin 白名单：仅本工具页面（Vite dev / GitHub Pages）能读取响应，其他网站请求一律 403；
// - 限速：两次同步至少间隔 3 秒；
// - authkey 不出本机、不进任何响应；落盘快照一律脱敏（docs/data 已被 gitignore）。
const ALLOWED_ORIGINS = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://yushi250412015.github.io',
]);
const SYNC_MIN_INTERVAL_MS = 3000;
let lastSyncAt = 0;

function startServer() {
  const server = http.createServer(async (req, res) => {
    const origin = req.headers.origin || null;
    const allowed = !origin || ALLOWED_ORIGINS.has(origin);
    const send = (code, obj) => {
      const headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      };
      if (allowed && origin) headers['Access-Control-Allow-Origin'] = origin;
      res.writeHead(code, headers);
      res.end(JSON.stringify(obj));
    };
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': allowed && origin ? origin : 'null',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Max-Age': '86400',
      });
      res.end();
      return;
    }
    if (!allowed) {
      send(403, { ok: false, message: '来源不被允许（Origin 白名单）' });
      return;
    }
    try {
      if (req.url === '/health') {
        send(200, { ok: true });
        return;
      }
      if (req.url && req.url.startsWith('/sync')) {
        const now = Date.now();
        if (now - lastSyncAt < SYNC_MIN_INTERVAL_MS) {
          send(429, { ok: false, message: '请求过于频繁，请稍后再试' });
          return;
        }
        lastSyncAt = now;
        const url = new URL(req.url, 'http://localhost');
        const expectUid = url.searchParams.get('uid') || null;
        const pageUrl = resolvePageUrl({});
        const records = await fetchAll(pageUrl);
        const summary = summarizeAccount(groupRecordsByType(records), standardS);
        const actualUid = records[0] ? String(records[0].uid) : null;
        const snapshotPath = join('docs', 'data', 'gacha-records-' + new Date().toISOString().slice(0, 10) + '.json');
        writeFileSync(snapshotPath, JSON.stringify({ generatedAt: new Date().toISOString(), sourceUrl: maskUrl(pageUrl), records }, null, 2), 'utf8');
        writeLocalSnapshot(records, summary);
        send(200, {
          ok: true,
          uid: actualUid,
          uidMatched: expectUid ? String(expectUid) === String(actualUid) : true,
          recordCount: records.length,
          generatedAt: new Date().toISOString(),
          summary,
          snapshot: snapshotPath,
        });
        return;
      }
      send(404, { ok: false, message: 'not found' });
    } catch (e) {
      send(500, { ok: false, message: e.message });
    }
  });
  server.listen(8787, '127.0.0.1', () => {
    console.log('[serve] 本地同步服务已启动：http://127.0.0.1:8787（只监听本机回环地址，不对局域网/外网开放）');
    console.log('[serve] /health 健康检查；/sync?uid=xxx 同步账号（Origin 白名单 + 3 秒限速；authkey 不出本机、落盘快照已脱敏）');
    console.log('[serve] 说明：官方无 UID 直查接口；同步依赖游戏日志中的 authkey（游戏内打开一次抽卡记录页后生效，约 1 天过期）');
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.serve) {
    startServer();
    return;
  }
  let records;
  let snapshotPath = null;
  if (args.records) {
    snapshotPath = args.records;
    const raw = readFileSync(args.records, 'utf8').replace(/^\uFEFF/, '');
    const parsed = JSON.parse(raw);
    records = Array.isArray(parsed) ? parsed : parsed.records;
    console.log(`[records] 离线重解析 ${records.length} 条（${snapshotPath}）`);
  } else {
    const pageUrl = resolvePageUrl(args);
    console.log(`[url] ${maskUrl(pageUrl)}`);
    records = await fetchAll(pageUrl);
    snapshotPath = args.out || join('docs', 'data', `gacha-records-${new Date().toISOString().slice(0, 10)}.json`);
    writeFileSync(snapshotPath, JSON.stringify({ generatedAt: new Date().toISOString(), sourceUrl: pageUrl, records }, null, 2), 'utf8');
    console.log(`[out] 快照已写入 ${snapshotPath}（docs/data 已被 gitignore，不进公开仓库）`);
  }
  const summary = summarizeAccount(groupRecordsByType(records), standardS);
  printSummary(summary);
  const localSnapPath = writeLocalSnapshot(records, summary);
  console.log('[local] 本机快照已更新：' + localSnapPath + '（仅存本机，gitignore 不进公开仓库）');
  compareWithLocal(summary);
  console.log('');
  console.log('提示：authkey 约 1 天过期；官方 API 仅保留最近约 6 个月记录。');
}

main().catch((e) => {
  console.error('[error]', e.message);
  process.exit(1);
});
