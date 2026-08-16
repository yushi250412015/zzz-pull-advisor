#!/usr/bin/env node
// 版本数据更新工具：拉最新官方公告 → 提取「全新代理人/音擎/邦布」→ 输出数据文件更新建议
// 用法：
//   node scripts/update-banners.mjs                 （自动找窗口内最新的版本更新公告）
//   node scripts/update-banners.mjs --ann-id 1262   （指定公告 id）
// 说明：不自动改源码（banners.js / characters.js / equipment.js 由人审阅后更新），
//       只输出提取结果、与现有数据的对比（已录入/新增），并把事实写入 docs/data/version-facts-<日期>.json。

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fetchAnnList, flattenAnnouncements, fetchAnnContent } from '../src/datasource/announcement.js';
import { extractReleaseFacts } from '../src/datasource/version-facts.js';
import { characters } from '../src/data/characters.js';
import { weapons, bangboos } from '../src/data/equipment.js';

const args = {};
for (let i = 2; i < process.argv.length; i += 1) {
  const a = process.argv[i];
  if (a.startsWith('--')) {
    const next = process.argv[i + 1];
    args[a.slice(2)] = next && !next.startsWith('--') ? next : true;
    if (args[a.slice(2)] !== true) i += 1;
  }
}

function isVersionAnnouncement(a) {
  return /版本.*更新/.test(a.title) && /\d+\.\d+/.test(a.title);
}

async function main() {
  const { groups } = await fetchAnnList();
  const flat = flattenAnnouncements({ groups });
  const candidates = flat.filter(isVersionAnnouncement);
  const annId = args['ann-id'] || (candidates[0] ? candidates[0].annId : null);
  if (!annId) {
    console.log('当前公告列表中没有版本更新公告（窗口内无新版本），无事可做。');
    return;
  }
  const ann = await fetchAnnContent(annId);
  console.log('公告:', annId, '|', ann.title);
  const facts = extractReleaseFacts(ann.contentText);
  if (!facts.complete) {
    console.log('警告：未提取到全新内容，公告结构可能变化，请人工核对原文。');
  }
  if (facts.version) console.log('版本:', facts.version.number, '「' + facts.version.name + '」');
  if (facts.window) console.log('时间窗:', facts.window.start, '→', facts.window.end);

  const knownNames = new Set(Object.values(characters).map((c) => c.name));
  const knownWeapons = new Set(Object.values(weapons).map((w) => w.name));
  const knownBangboos = new Set(Object.values(bangboos).map((b) => b.name));

  console.log('');
  console.log('== 全新代理人 ==');
  for (const a of facts.agents) {
    const status = knownNames.has(a.name) ? '已录入' : '【新增】需加入 characters.js';
    console.log('  ' + status + ' | ' + a.name + ' | ' + a.elementCn + '·' + a.roleCn + ' | 频道 ' + a.channel);
  }
  console.log('== 全新音擎 ==');
  for (const e of facts.engines) {
    const status = knownWeapons.has(e.name) ? '已录入' : '【新增】需加入 equipment.js（配对角色待人工核实）';
    console.log('  ' + status + ' | ' + e.name + ' | ' + e.roleCn + ' | 频道 ' + e.channel);
  }
  console.log('== 全新邦布 ==');
  for (const b of facts.bangboos) {
    const status = knownBangboos.has(b.name) ? '已录入' : '【新增】需加入 equipment.js';
    console.log('  ' + status + ' | ' + b.name + ' | 频道 ' + b.channel);
  }

  const out = join('docs', 'data', 'version-facts-' + new Date().toISOString().slice(0, 10) + '.json');
  writeFileSync(out, JSON.stringify({ fetchedAt: new Date().toISOString(), annId, title: ann.title, facts }, null, 2), 'utf8');
  console.log('');
  console.log('事实已写入 ' + out + '（gitignore）。请人工审阅后更新源码数据文件。');
}

main().catch((e) => {
  console.error('[error]', e.message);
  process.exit(1);
});
