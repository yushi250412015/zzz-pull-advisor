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
import { extractGachaPageUrl, fetchGachaRecords } from '../src/datasource/gacha-log.js';
import { groupRecordsByType, summarizeAccount } from '../src/datasource/import-summary.js';
import { standardS } from '../src/data/characters.js';
import { myAccount } from '../src/data/my-account.js';

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

function compareWith(summary) {
  console.log('');
  console.log('== 与 my-account.js 手填值对比 ==');
  const checks = [
    ['独家·抽数', summary.pools.limited.pulls, myAccount.limited.pulls],
    ['独家·保底', summary.pools.limited.pity, myAccount.limited.pity],
    ['独家·大保底', summary.pools.limited.fails, myAccount.limited.fails],
    ['独家·S 数', summary.pools.limited.sCount, myAccount.limited.sCount],
    ['常驻·抽数', summary.pools.standard.pulls, myAccount.standard.pulls],
    ['常驻·保底', summary.pools.standard.pity, myAccount.standard.pity],
    ['音擎·抽数', summary.pools.weapon.pulls, myAccount.weapon.pulls],
    ['音擎·保底', summary.pools.weapon.pity, myAccount.weapon.pity],
    ['音擎·S 数', summary.pools.weapon.sCount, myAccount.weapon.sCount],
    ['邦布·抽数', summary.pools.bangboo.pulls, myAccount.bangboo.pulls],
    ['邦布·保底', summary.pools.bangboo.pity, myAccount.bangboo.pity],
    ['邦布·S 数', summary.pools.bangboo.sCount, myAccount.bangboo.sCount],
    ['box 数量', summary.box.length, myAccount.box.length],
  ];
  let ok = 0;
  for (const [label, got, want] of checks) {
    const match = got === want;
    if (match) ok += 1;
    console.log(`${match ? '  ✓' : '  ✗'} ${label}: 计算 ${got} vs 手填 ${want}`);
  }
  console.log(`一致 ${ok}/${checks.length}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
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
  compareWith(summary);
  console.log('');
  console.log('提示：authkey 约 1 天过期；官方 API 仅保留最近约 6 个月记录。');
}

main().catch((e) => {
  console.error('[error]', e.message);
  process.exit(1);
});
