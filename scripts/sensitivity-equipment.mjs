#!/usr/bin/env node
// 音擎/邦布价值参数敏感性分析：扫 weaponValueRatio / bangboo 先验，观察结论翻转点
// 用法：node scripts/sensitivity-equipment.mjs
// 数据源：本机快照 docs/data/my-account.json（gitignore 不进仓库；先运行 node scripts/import-records.mjs 生成）
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { recommendEquipment, EQUIPMENT_DEFAULTS } from '../src/core/recommend-equipment.js';
import { verdictFromScore, scoreFromUtility } from '../src/core/decision/decision.js';
import { characters } from '../src/data/characters.js';
import { weapons, bangboos } from '../src/data/equipment.js';
import { systems } from '../src/models/systems.js';

const snapPath = join('docs', 'data', 'my-account.json');
if (!existsSync(snapPath)) {
  console.error('[error] 未找到本机账号快照 ' + snapPath + '（gitignore 不进仓库）。请先运行：node scripts/import-records.mjs');
  process.exit(1);
}
const raw = readFileSync(snapPath, 'utf8');
const snap = JSON.parse(raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw);
const summary = snap.summary;
if (!summary) {
  console.error('[error] 本机快照缺少 summary 字段，请重新运行 node scripts/import-records.mjs 生成。');
  process.exit(1);
}
const box = { characters: {} };
for (const id of summary.box) box.characters[id] = { owned: true, mindscape: 0 };
const resources = { encryptedTapes: 30, polychrome: 4800 }; // 60 抽样本
const verdict = (r) => verdictFromScore(scoreFromUtility(r.utility));

console.log('== 音擎推荐对 weaponValueRatio 的敏感性（当前账号 box，60 抽） ==');
console.log('ratio | 空羽复归之诗(蕾米) | 骁骑礼赞(希格莉德)');
for (const ratio of [0.3, 0.45, 0.6, 0.75, 0.9]) {
  const params = { ...EQUIPMENT_DEFAULTS, weaponValueRatio: ratio };
  const line = [];
  for (const wid of ['kongyu-fuguizhishi', 'xiaoqi-lizan']) {
    const r = recommendEquipment({
      kind: 'weapon', equipment: weapons[wid], characters, box, resources, systems, favor: 50,
      poolState: { pity: summary.pools.weapon.pity, fails: 0 }, params,
    });
    line.push(verdict(r) + '（效用 ' + r.utility.toFixed(1) + '）');
  }
  console.log(ratio + ' | ' + line.join(' | '));
}

console.log('');
console.log('== 邦布推荐对先验参数的敏感性 ==');
for (const base of [3, 6, 9]) {
  const params = { ...EQUIPMENT_DEFAULTS, bangbooBaseValue: base, bangbooElementBonus: 4, bangbooCompanionBonus: 2 };
  const r = recommendEquipment({
    kind: 'bangboo', equipment: bangboos.airuier, characters, box, resources, systems, favor: 50, params,
  });
  console.log('base=' + base + ' → 价值 ' + r.combatDelta.toFixed(1) + '，结论 ' + verdict(r) + '（效用 ' + r.utility.toFixed(1) + '）');
}
