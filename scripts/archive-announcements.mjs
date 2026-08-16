#!/usr/bin/env node
// 公告归档：getAnnList 全部条目 + getAnnContent 全量正文 → docs/data/ann-archive-<日期>.json（gitignore）
// 用法：node scripts/archive-announcements.mjs

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fetchAnnList, flattenAnnouncements, fetchAnnContent } from '../src/datasource/announcement.js';

async function main() {
  const { groups } = await fetchAnnList();
  const flat = flattenAnnouncements({ groups });
  const contents = [];
  for (const a of flat) {
    if (!a.hasContent) continue;
    const c = await fetchAnnContent(a.annId);
    if (c) contents.push({ annId: c.annId, title: c.title, subtitle: c.subtitle, contentText: c.contentText });
    console.log('[content] ' + a.annId + ' | ' + a.title.slice(0, 40));
  }
  const out = join('docs', 'data', 'ann-archive-' + new Date().toISOString().slice(0, 10) + '.json');
  writeFileSync(out, JSON.stringify({ archivedAt: new Date().toISOString(), groups, contents }, null, 2), 'utf8');
  console.log('');
  console.log('已归档 ' + contents.length + ' 篇正文 → ' + out + '（gitignore）');
}

main().catch((e) => {
  console.error('[error]', e.message);
  process.exit(1);
});
