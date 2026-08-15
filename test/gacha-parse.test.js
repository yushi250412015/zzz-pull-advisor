import { describe, it, expect } from 'vitest';
import { parseGachaHistory } from '../src/core/gacha/parse.js';

const standard = new Set(['莱卡恩', '格莉丝', '11号']);

describe('parseGachaHistory', () => {
  it('解析 box / 保底 / 歪计数（乱序输入按时间排序）', () => {
    const records = [
      { name: '安比', rank_type: '4', time: 't4' },
      { name: '妮可', rank_type: '4', time: 't1' },
      { name: '莱卡恩', rank_type: '5', time: 't2' }, // 标准 → 歪
      { name: '安比', rank_type: '4', time: 't3' },
    ];
    const r = parseGachaHistory(records, standard);
    expect(r.pity).toBe(2); // 莱卡恩后两个非 S
    expect(r.fails).toBe(1); // 莱卡恩是常驻 → 歪了
    expect(r.box.size).toBe(3);
    expect([...r.box]).toEqual(expect.arrayContaining(['安比', '妮可', '莱卡恩']));
  });

  it('抽到 UP 后 fails 归零', () => {
    const records = [
      { name: '莱卡恩', rank_type: '5', time: 't1' }, // 歪
      { name: '星见雅', rank_type: '5', time: 't2' }, // UP（不在 standard）
    ];
    const r = parseGachaHistory(records, standard);
    expect(r.fails).toBe(0);
    expect(r.pity).toBe(0);
  });
});
